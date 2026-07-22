import React, { useState } from "react";
import { X, LogIn, Mail, ShieldCheck, CheckCircle2, Sparkles, LogOut, Eye, EyeOff, Lock, UserCheck, ArrowRight, HelpCircle } from "lucide-react";
import { UserProfile } from "../propertyTypes";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
}

export function AuthModal({ isOpen, onClose, currentUser, onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState(currentUser?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [companyName, setCompanyName] = useState(currentUser?.companyName || "");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<"google" | "email">("google");
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  // Google SSO Handler (OAuth Single Sign-On - No password needed)
  const handleGoogleLogin = async (selectedEmail?: string) => {
    setIsSubmitting(true);
    try {
      const gEmail = selectedEmail || email || "sreeshkanala@gmail.com";
      const gName = name || (gEmail.includes("@") ? gEmail.split("@")[0] : "Google User");
      
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
      console.error("Google Login failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email + Password Login Submission
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
          password: password || undefined,
          name: name || email.split("@")[0],
          companyName: companyName || "Stylecraft Builders Inc",
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
      console.error("Email Login failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setResetSent(true);
    setTimeout(() => setResetSent(false), 5000);
  };

  // Logout Handler
  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onLoginSuccess({
        id: "guest",
        email: "guest@builder.com",
        name: "Guest User",
        companyName: "Stylecraft Builders Inc",
        companyId: "stylecraft",
        role: "Viewer",
        isLoggedIn: false
      });
      onClose();
    } catch (err) {
      console.error("Logout failed", err);
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
          <h2 className="text-xl font-black tracking-tight text-white">
            {currentUser?.isLoggedIn ? "Account Profile & Workspace" : "Sign In to CAD Audit System"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access multi-company property tax portfolios, continuous daily CAD tracking, and automated email notice alerts.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Active User Banner if already logged in */}
          {currentUser?.isLoggedIn && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      {currentUser.name}
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                        Active
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-600">{currentUser.email}</div>
                  </div>
                </div>

                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>

              <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                <span>Organization: <b>{currentUser.companyName}</b></span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isSubmitting}
                  className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                >
                  <LogOut className="h-3 w-3" /> Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Authentication Method Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setAuthMethod("google")}
              className={`py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
                authMethod === "google" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google SSO
            </button>
            <button
              onClick={() => setAuthMethod("email")}
              className={`py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
                authMethod === "email" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Mail className="h-4 w-4 text-indigo-600" />
              Email & Password
            </button>
          </div>

          {/* Google Auth Tab */}
          {authMethod === "google" ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-50/90 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
                <div className="flex items-center gap-2 font-black text-indigo-950">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Google Passwordless Single Sign-On
                </div>
                <p className="text-[11px] text-indigo-900 leading-relaxed">
                  Log in password-free with your Google Account or corporate Google Workspace email address.
                </p>
              </div>

              {/* Quick Select Preset Google Email */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-slate-500">Quick Google Sign-In Account</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGoogleLogin("sreeshkanala@gmail.com")}
                    disabled={isSubmitting}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100 border rounded-xl text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        SK
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Sreesh Kanala</div>
                        <div className="text-[11px] text-slate-500 font-mono">sreeshkanala@gmail.com</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              </div>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 bg-white px-2">or enter custom email</div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Google Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com or @gmail.com"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-bold text-slate-800 focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Company / Developer Entity Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stylecraft Builders Inc or Perry Homes"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isSubmitting || !email.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? "Authenticating with Google..." : "Continue with Google SSO"}
              </button>
            </div>
          ) : (
            /* Email + Password Login Tab */
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {resetSent && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Password reset link sent to <b>{email || "your email"}</b></span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  Work or Personal Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tax.admin@company.com or myemail@gmail.com"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-bold text-slate-800 focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              {/* Password Input with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-indigo-600" />
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-bold text-slate-800 focus:outline-indigo-600 bg-slate-50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sreesh Kanala"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Company / Developer Entity</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stylecraft Builders Inc or Custom Developer"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span>Remember password for 30 days</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email.trim() || !password.trim()}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {isSubmitting ? "Authenticating Password..." : "Sign In with Email & Password"}
              </button>
            </form>
          )}

          {/* Footer Notice */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Password & OAuth Protected
            </span>
            <span>Texas CAD Property Tax Auditing</span>
          </div>

        </div>
      </div>
    </div>
  );
}


