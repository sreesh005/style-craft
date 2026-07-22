import React, { useState, useEffect } from "react";
import { 
  X, Bell, Mail, Clock, RefreshCw, Send, CheckCircle2, AlertTriangle, 
  Settings, Save, Check, ShieldCheck, Calendar, ChevronRight, Sliders
} from "lucide-react";
import { EmailNotification, MonitoringSettings } from "../propertyTypes";

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
  const [activeTab, setActiveTab] = useState<"alerts" | "settings">("alerts");
  const [selectedNotif, setSelectedNotif] = useState<EmailNotification | null>(null);
  
  // Settings Form State
  const [recipientEmail, setRecipientEmail] = useState("sreeshkanala@gmail.com");
  const [recipientName, setRecipientName] = useState("Sreesh Kanala");
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [checkFrequencyHours, setCheckFrequencyHours] = useState(24);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load existing settings
  useEffect(() => {
    if (!isOpen) return;
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/monitoring/settings");
        if (res.ok) {
          const data: MonitoringSettings = await res.json();
          if (data.recipientEmail) setRecipientEmail(data.recipientEmail);
          if (data.recipientName) setRecipientName(data.recipientName);
          if (typeof data.autoCheckEnabled === "boolean") setAutoCheckEnabled(data.autoCheckEnabled);
          if (data.checkFrequencyHours) setCheckFrequencyHours(data.checkFrequencyHours);
          if (data.smtpHost) setSmtpHost(data.smtpHost);
          if (data.smtpPort) setSmtpPort(data.smtpPort);
          if (data.smtpUser) setSmtpUser(data.smtpUser);
          if (data.smtpPass) setSmtpPass(data.smtpPass);
          return;
        }
      } catch (e) {
        console.error("Error loading settings from server", e);
      }
      // Local fallback
      const cached = localStorage.getItem("cad_email_settings");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.recipientEmail) setRecipientEmail(parsed.recipientEmail);
          if (parsed.recipientName) setRecipientName(parsed.recipientName);
          if (typeof parsed.autoCheckEnabled === "boolean") setAutoCheckEnabled(parsed.autoCheckEnabled);
        } catch (e) {}
      }
    };
    fetchSettings();
  }, [isOpen]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSaveSuccess(false);

    const payload = {
      recipientEmail,
      recipientName,
      autoCheckEnabled,
      checkFrequencyHours: Number(checkFrequencyHours),
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpUser,
      smtpPass
    };

    try {
      localStorage.setItem("cad_email_settings", JSON.stringify(payload));
      await fetch("/api/monitoring/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md md:max-w-lg h-full border-l border-slate-200 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-sm">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Continuous CAD Monitor</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Daily 24/7
                </span>
              </div>
              <h2 className="text-base font-black tracking-tight text-white">Daily Monitor & Email Dispatcher</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "alerts" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Dispatched Emails ({notifications.filter(n => !n.read).length} Unread)
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
              activeTab === "settings" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Email & Schedule Config
          </button>
        </div>

        {/* TAB 1: DISPATCHED EMAIL ALERTS */}
        {activeTab === "alerts" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Daily Monitor Status Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Next Daily Check:</span>
                  <span className="text-indigo-600 font-mono">06:00 AM CST</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Continuous Auto Sweep
                </span>
              </div>

              <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-2.5 text-[11px] text-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">Configured Alert Email:</span>
                  <span className="font-mono text-indigo-600 font-bold">{recipientEmail}</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  When CAD valuation notices or tax bill updates occur during the daily scan, an email update is sent automatically to this address.
                </p>
              </div>

              <button
                onClick={onTriggerDailyUpdate}
                disabled={isTriggering}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-sm flex items-center justify-center gap-2"
              >
                {isTriggering ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Sweeping CADs & Dispatching Email Alert...</>
                ) : (
                  <><Send className="h-4 w-4" /> Run Daily CAD Check & Send Email Alert Now</>
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
          </div>
        )}

        {/* TAB 2: EMAIL & SCHEDULE CONFIGURATION */}
        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                Automated Daily Check & Email Preferences
              </h3>
              <p className="text-xs text-slate-500">
                Configure who receives CAD update alerts and customize your background check schedule.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              
              {/* Auto Check Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl">
                <div>
                  <div className="font-bold text-slate-900">Daily Background CAD Sweep</div>
                  <div className="text-[11px] text-slate-500">Automatically run daily check every 24 hours</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoCheckEnabled} 
                    onChange={(e) => setAutoCheckEnabled(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Recipient Email Address */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Alert Recipient Email Address</span>
                  <span className="text-[10px] text-indigo-600 font-normal">Where alerts are sent</span>
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Recipient Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Sreesh Kanala"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Check Frequency */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Daily Scan Frequency</label>
                <select
                  value={checkFrequencyHours}
                  onChange={(e) => setCheckFrequencyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value={24}>Every 24 Hours (Daily at 06:00 AM CST)</option>
                  <option value={12}>Every 12 Hours (Twice Daily)</option>
                  <option value={1}>Every 1 Hour (High Frequency Audit)</option>
                </select>
              </div>

              {/* Optional Custom SMTP Configuration */}
              <div className="pt-2 border-t border-slate-200">
                <details className="group">
                  <summary className="font-bold text-slate-700 cursor-pointer flex items-center justify-between py-1 text-xs">
                    <span>Direct SMTP Server Credentials (Optional)</span>
                    <span className="text-[10px] text-slate-400 group-open:rotate-180 transition">▼</span>
                  </summary>
                  <div className="pt-3 space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                    <p className="text-[10px] text-slate-500">
                      Provide SMTP credentials if you want the CAD monitor to dispatch emails directly through your custom Mail Server / SendGrid / AWS SES account.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600">SMTP Host</label>
                        <input
                          type="text"
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                          placeholder="smtp.gmail.com"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600">Port</label>
                        <input
                          type="number"
                          value={smtpPort}
                          onChange={(e) => setSmtpPort(Number(e.target.value))}
                          placeholder="587"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600">SMTP User / Email</label>
                        <input
                          type="text"
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                          placeholder="user@domain.com"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600">SMTP Password</label>
                        <input
                          type="password"
                          value={smtpPass}
                          onChange={(e) => setSmtpPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition"
                >
                  {isSavingSettings ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Saving Preferences...</>
                  ) : saveSuccess ? (
                    <><Check className="h-4 w-4 text-emerald-400" /> Preferences Saved Successfully!</>
                  ) : (
                    <><Save className="h-4 w-4" /> Save Email & Monitor Preferences</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

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

