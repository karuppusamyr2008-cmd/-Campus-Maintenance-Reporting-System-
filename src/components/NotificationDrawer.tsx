import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, Clock, Flame, ShieldAlert, X } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveTab } = useApp();

  if (!isOpen) return null;

  const handleItemClick = (complaintId?: string, notifId?: string) => {
    if (notifId) markNotificationRead(notifId);
    if (complaintId) {
      setActiveTab('track', complaintId);
      onClose();
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      {/* Mobile-friendly slide out drawer: full width on < sm, max-w-md on sm and up */}
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header with 44px touch targets */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">Activity Notifications</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Live operational alerts & status changes</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllNotificationsRead}
                className="min-h-[44px] text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Notification List:
            Each notification shows:
            * Icon
            * Message
            * Time
            * Read/unread state */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Alerts will appear here when complaints are filed, assigned, or resolved.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.complaintId, item.id)}
                  className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer select-none ${
                    !item.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'emergency' ? (
                        <div className="p-2 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                          <Flame className="w-4 h-4" />
                        </div>
                      ) : item.type === 'assignment' ? (
                        <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title & Time */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4
                          className={`text-xs sm:text-sm ${
                            !item.read
                              ? 'font-bold text-slate-900 dark:text-white'
                              : 'font-medium text-slate-700 dark:text-slate-300'
                          } truncate`}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </div>

                      {/* Message */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between">
                        {item.complaintId ? (
                          <span className="inline-flex items-center text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                            View #{item.complaintId} →
                          </span>
                        ) : <span />}

                        {/* Read / Unread State Badge */}
                        {!item.read ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            Unread
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Read</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          Live notification sync active
        </div>
      </div>
    </div>
  );
};
