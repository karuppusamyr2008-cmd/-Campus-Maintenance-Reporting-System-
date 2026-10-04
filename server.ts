import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK per gemini-api skill instructions
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface GroundingLink {
  title: string;
  uri: string;
  sourceType?: string;
}

// System instructions per role
const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  facilities_advisor:
    'You are CivicFix AI, the intelligent Campus Facilities & Maintenance Advisor. You help students, faculty, and residents report issues accurately, assess safety hazards, understand repair timelines, and provide guidance on student living comfort and university emergency protocols.',
  maintenance_copilot:
    'You are CivicFix Tech Copilot, an expert campus maintenance engineer assistant. You provide step-by-step diagnostic guidance for HVAC, plumbing risers, electrical ballasts, keycard locks, and structural repairs. You emphasize safety, lock-out/tag-out (LOTO) protocols, and building code compliance.',
  campus_navigator:
    'You are the CivicFix Campus Navigator & Surroundings Guide. You answer queries about campus buildings, facilities depot, nearby hardware stores, emergency services, parts suppliers, and campus navigation using Google Maps data.',
};

// API: Multi-turn Chat with Gemini + optional Google Maps Grounding
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      botRole = 'facilities_advisor',
      modelType = 'general',
      enableMaps = false,
      userLocation,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY environment variable is not configured.',
      });
    }

    // Model selection per specification:
    // "Use gemini-3.1-pro-preview for particularly complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
    // "Use gemini-3.5-flash (with googleMaps tool)"
    let chosenModel = 'gemini-3.5-flash';
    if (enableMaps) {
      chosenModel = 'gemini-3.5-flash';
    } else if (modelType === 'fast') {
      chosenModel = 'gemini-3.1-flash-lite';
    } else if (modelType === 'complex') {
      chosenModel = 'gemini-3.1-pro-preview';
    } else {
      chosenModel = 'gemini-3.5-flash';
    }

    const systemInstruction =
      SYSTEM_INSTRUCTIONS[botRole] || SYSTEM_INSTRUCTIONS.facilities_advisor;

    // Convert message history to format expected by SDK
    // The contents can be formatted as an array of turns
    const contents = messages.map((m: ChatMessage) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    // Configure tools if Google Maps is enabled
    const config: any = {
      systemInstruction,
    };

    if (enableMaps) {
      config.tools = [{ googleMaps: {} }];
      if (userLocation && typeof userLocation.latitude === 'number') {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          },
        };
      }
    }

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents,
      config,
    });

    const candidate = response.candidates?.[0];
    const responseText = candidate?.content?.parts?.map((p) => p.text || '').join('') || '';

    // Extract Google Maps grounding chunks
    const groundingLinks: GroundingLink[] = [];
    const chunks = candidate?.groundingMetadata?.groundingChunks;
    if (Array.isArray(chunks)) {
      for (const chunk of chunks) {
        if (chunk.maps?.uri) {
          groundingLinks.push({
            title: chunk.maps.title || 'Google Maps Location',
            uri: chunk.maps.uri,
            sourceType: 'maps',
          });
        }
        if (chunk.web?.uri) {
          groundingLinks.push({
            title: chunk.web.title || 'Web Reference',
            uri: chunk.web.uri,
            sourceType: 'web',
          });
        }
      }
    }

    res.json({
      text: responseText,
      model: chosenModel,
      groundingLinks,
    });
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({
      error: error.message || 'Internal server error while processing AI request',
    });
  }
});

// API: Nearby Campus Vendor & Facilities Grounding Search
app.post('/api/maps-search', async (req: Request, res: Response) => {
  try {
    const { query, userLocation } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY environment variable is not configured.',
      });
    }

    // Use gemini-3.5-flash with googleMaps tool as strictly required
    const config: any = {
      systemInstruction:
        'You are a campus facilities dispatch navigator. Provide concise, helpful recommendations for nearby hardware stores, plumbing parts depots, emergency clinics, or campus service locations using Google Maps. List opening hours and distance context when available.',
      tools: [{ googleMaps: {} }],
    };

    if (userLocation && typeof userLocation.latitude === 'number') {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: query,
      config,
    });

    const candidate = response.candidates?.[0];
    const responseText = candidate?.content?.parts?.map((p) => p.text || '').join('') || '';

    const groundingLinks: GroundingLink[] = [];
    const chunks = candidate?.groundingMetadata?.groundingChunks;
    if (Array.isArray(chunks)) {
      for (const chunk of chunks) {
        if (chunk.maps?.uri) {
          groundingLinks.push({
            title: chunk.maps.title || 'Google Maps Location',
            uri: chunk.maps.uri,
            sourceType: 'maps',
          });
        }
      }
    }

    res.json({
      text: responseText,
      model: 'gemini-3.5-flash',
      groundingLinks,
    });
  } catch (error: any) {
    console.error('Error during maps search:', error);
    res.status(500).json({
      error: error.message || 'Error executing Google Maps grounding search',
    });
  }
});

// Dev server with Vite middleware or Production static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`CivicFix server running on port ${PORT}`);
  });
}

startServer();
