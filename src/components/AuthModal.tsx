import React, { useState } from "react";
import { X, LogIn, Mail, ShieldCheck, Building, CheckCircle2, Sparkles } from "lucide-react";
import { UserProfile } from "../propertyTypes";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
}

export function AuthModal({ isOpen, onClose, currentUser, onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<"google" | "email">("google");

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const gEmail = email || "sreeshkanala@gmail.com";
      const gName = name || "Sreesh Kanala";
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gEmail,
          name: gName,
          companyName: companyName || "Stylecraft Builders Inc",
          provider: "google"
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          onLoginSuccess(data.user);
          onClose();
        }
      }
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || email.split("@")[0],
          companyName: companyName || "Custom Builder LLC",
          provider: "email"
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          onLoginSuccess(data.user);
          onClose();
        }
      }
    } catch (err) {
      console.error("Login failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold tracking-widest uppercase">
            <ShieldCheck className="h-4 w-4" /> Secure Developer Authentication
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">Sign In to CAD Audit Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access multi-company property tax portfolios, continuous daily CAD tracking, and automated email notice alerts.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Method selector tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setAuthMethod("google")}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMethod === "google" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google Workspace
            </button>
            <button
              onClick={() => setAuthMethod("email")}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                authMethod === "email" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Mail className="h-4 w-4" />
              Corporate Email
            </button>
          </div>

          {authMethod === "google" ? (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/80 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-950">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Instant Google Single Sign-On
                </div>
                <p>
                  Connect your corporate account to automatically sync property tax filings, receive email appraisal alerts, and authorize CAD filings.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sreeshkanala@gmail.com or name@builder.com"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Company / Developer Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stylecraft Builders Inc or Pulte Homes"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? "Authenticating..." : "Continue with Google SSO"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tax.admin@company.com"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sreesh Kanala"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Company Legal Entity</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stylecraft Builders Inc"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? "Logging In..." : "Sign In with Email"}
              </button>
            </form>
          )}

          {/* Stylecraft Demo Pre-loaded note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Demo Account Ready
            </span>
            <span>Stylecraft Builders Inc (600 Properties)</span>
          </div>

        </div>
      </div>
    </div>
  );
}
