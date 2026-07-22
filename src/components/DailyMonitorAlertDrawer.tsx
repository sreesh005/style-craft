import React, { useState } from "react";
import { 
  X, Bell, Mail, Clock, RefreshCw, Send, CheckCircle2, AlertTriangle, 
  Eye, Sparkles, ExternalLink, Calendar, ChevronRight
} from "lucide-react";
import { EmailNotification } from "../propertyTypes";

interface DailyMonitorAlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: EmailNotification[];
  onTriggerDailyUpdate: () => Promise<void>;
  onMarkRead: () => void;
  isTriggering: boolean;
}

export function DailyMonitorAlertDrawer({
  isOpen,
  onClose,
  notifications,
  onTriggerDailyUpdate,
  onMarkRead,
  isTriggering
}: DailyMonitorAlertDrawerProps) {
  const [selectedNotif, setSelectedNotif] = useState<EmailNotification | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg h-full border-l border-slate-200 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Continuous CAD Monitor</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Daily 24/7
                </span>
              </div>
              <h2 className="text-base font-black tracking-tight text-white">Email Notice Alerts & Audit Trail</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Daily Monitor Status Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>Daily Scan Schedule:</span>
              <span className="text-indigo-600 font-mono">06:00 AM CST</span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sweep Active
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            The CAD Audit backend continuously tracks your properties daily. When CAD notice updates, tax rate shifts, or hearing dates occur, an email update is automatically sent to your inbox.
          </p>

          <button
            onClick={onTriggerDailyUpdate}
            disabled={isTriggering}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-sm flex items-center justify-center gap-2"
          >
            {isTriggering ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Sweeping CADs & Dispatching Email Alert...</>
            ) : (
              <><Send className="h-4 w-4" /> Simulate Daily CAD Update & Trigger Email Alert</>
            )}
          </button>
        </div>

        {/* Email Notification Log List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dispatched Email Audit Logs</span>
            <button
              onClick={onMarkRead}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
            >
              Mark all as read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              No email alerts triggered yet. Click above to test daily CAD update alerts!
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => setSelectedNotif(notif)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                  !notif.read ? "bg-indigo-50/50 border-indigo-200 shadow-2xs" : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Mail className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="line-clamp-1">{notif.subject}</span>
                  </div>
                  {!notif.read && (
                    <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {notif.detailsSummary}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(notif.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-indigo-600 font-bold flex items-center gap-0.5">
                    View Email <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Email Preview Modal */}
        {selectedNotif && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Mail className="h-4 w-4" /> Dispatched Email Preview
                </div>
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-1">
                <div><b>To:</b> {selectedNotif.recipientEmail}</div>
                <div><b>Subject:</b> {selectedNotif.subject}</div>
                <div><b>Date:</b> {new Date(selectedNotif.timestamp).toLocaleString()}</div>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedNotif.bodyHtml }}
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
