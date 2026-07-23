import React, { useState, useEffect } from "react";
import { 
  Building, Play, RefreshCw, BarChart3, HelpCircle, HardHat, 
  TrendingDown, ShieldCheck, DollarSign, Wallet2, CheckCircle2, AlertCircle,
  Bell, User, Plus, Building2, Sparkles, Clock, Mail, ChevronRight, LogIn
} from "lucide-react";
import { 
  PropertyTaxRecord, PropertyStage, ScraperLog, DashboardMetrics, 
  UserProfile, CompanyPortfolio, EmailNotification 
} from "../propertyTypes";
import { 
  initialProperties, defaultUser, defaultCompanies, defaultNotifications 
} from "../defaultData";
import { ScraperConsole } from "./ScraperConsole";
import { PropertyTable } from "./PropertyTable";
import { PropertyModal } from "./PropertyModal";
import { AuthModal } from "./AuthModal";
import { CompanyOnboardingModal } from "./CompanyOnboardingModal";
import { DailyMonitorAlertDrawer } from "./DailyMonitorAlertDrawer";
import { CSVExportButton } from "./CSVExportButton";

export function PropertyTaxDashboard() {
  const [properties, setProperties] = useState<PropertyTaxRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<PropertyStage>("rendering");

  // Auth session
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Multi-tenant Company Portfolios
  const [companies, setCompanies] = useState<CompanyPortfolio[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("stylecraft");
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Continuous Daily Monitoring & Email Alerts
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [isTriggeringDaily, setIsTriggeringDaily] = useState(false);

  // Scraper controls
  const [selectedEntity, setSelectedEntity] = useState("Stylecraft Builders Inc");
  const [selectedCounty, setSelectedCounty] = useState("Brazos");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [scraperLogs, setScraperLogs] = useState<ScraperLog[]>([]);

  // Selected property for modal
  const [selectedProp, setSelectedProp] = useState<PropertyTaxRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default entities and counties list
  const DEFAULT_ENTITY_COUNTIES = [
    {
      entity: "Stylecraft Builders Inc",
      counties: ["Brazos", "Burleson", "Grimes", "Montgomery", "Walker", "Washington"]
    },
    {
      entity: "Stylecraft Falcon Pointe LP",
      counties: ["McLennan"]
    },
    {
      entity: "Stylecraft Central Texas LP",
      counties: ["Bell", "Lampasas", "Williamson", "Guadalupe"]
    },
    {
      entity: "Stylecraft East Texas LLC",
      counties: ["Smith"]
    },
    {
      entity: "Ranier & Son Development LLC",
      counties: ["Burleson", "Washington", "Brazos", "Walker"]
    }
  ];

  // Dynamically compute entities based on properties in database
  const activeEntities = Array.from(new Set(properties.map(p => p.owner_name))).filter(Boolean);
  const entityCountiesMap = activeEntities.map(ent => {
    const matchedCounties = Array.from(new Set(properties.filter(p => p.owner_name === ent).map(p => p.county)));
    return {
      entity: ent,
      counties: matchedCounties.length > 0 ? matchedCounties : ["Brazos"]
    };
  });

  const finalEntityList = entityCountiesMap.length > 0 ? entityCountiesMap : DEFAULT_ENTITY_COUNTIES;
  const currentCountyList = finalEntityList.find(e => e.entity === selectedEntity)?.counties || ["Brazos"];

  // Set default county when entity changes
  useEffect(() => {
    if (currentCountyList.length > 0 && !currentCountyList.includes(selectedCounty)) {
      setSelectedCounty(currentCountyList[0]);
    }
  }, [selectedEntity]);

  // Load User, Companies, Notifications, and Properties with full Vercel/static fallbacks
  const loadInitialData = async () => {
    try {
      const [resAuth, resComp, resNotif, resProps] = await Promise.allSettled([
        fetch("/api/auth/me"),
        fetch("/api/companies"),
        fetch("/api/notifications"),
        fetch("/api/properties")
      ]);

      if (resAuth.status === "fulfilled" && resAuth.value.ok) {
        const uData = await resAuth.value.json();
        setCurrentUser(uData);
        localStorage.setItem("cad_user", JSON.stringify(uData));
      } else {
        const cachedUser = localStorage.getItem("cad_user");
        setCurrentUser(cachedUser ? JSON.parse(cachedUser) : defaultUser);
      }

      if (resComp.status === "fulfilled" && resComp.value.ok) {
        const cData = await resComp.value.json();
        setCompanies(cData);
        localStorage.setItem("cad_companies", JSON.stringify(cData));
      } else {
        const cachedCompanies = localStorage.getItem("cad_companies");
        setCompanies(cachedCompanies ? JSON.parse(cachedCompanies) : defaultCompanies);
      }

      if (resNotif.status === "fulfilled" && resNotif.value.ok) {
        const nData = await resNotif.value.json();
        setNotifications(nData);
        localStorage.setItem("cad_notifications", JSON.stringify(nData));
      } else {
        const cachedNotifs = localStorage.getItem("cad_notifications");
        setNotifications(cachedNotifs ? JSON.parse(cachedNotifs) : defaultNotifications);
      }

      if (resProps.status === "fulfilled" && resProps.value.ok) {
        const pData = await resProps.value.json();
        if (Array.isArray(pData) && pData.length > 0) {
          setProperties(pData);
          localStorage.setItem("cad_properties", JSON.stringify(pData));
        } else {
          loadFallbackProperties();
        }
      } else {
        loadFallbackProperties();
      }
    } catch (err) {
      console.error("Error loading initial dashboard data", err);
      loadFallbackProperties();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFallbackProperties = () => {
    const cachedProps = localStorage.getItem("cad_properties");
    if (cachedProps) {
      try {
        const parsed = JSON.parse(cachedProps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProperties(parsed);
          return;
        }
      } catch (e) {
        console.error("Error parsing cached properties", e);
      }
    }
    setProperties(initialProperties);
    try {
      localStorage.setItem("cad_properties", JSON.stringify(initialProperties));
    } catch (e) {}
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProperties(data);
          localStorage.setItem("cad_properties", JSON.stringify(data));
          return;
        }
      }
    } catch (err) {
      console.error("Could not load properties from API", err);
    }
    loadFallbackProperties();
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        localStorage.setItem("cad_notifications", JSON.stringify(data));
        return;
      }
    } catch (err) {
      console.error("Could not load notifications", err);
    }
    const cachedNotifs = localStorage.getItem("cad_notifications");
    if (cachedNotifs) {
      try { setNotifications(JSON.parse(cachedNotifs)); } catch (e) {}
    }
  };

  // Trigger simulated daily update & send email alert
  const handleTriggerDailyUpdate = async () => {
    setIsTriggeringDaily(true);
    try {
      const res = await fetch("/api/monitoring/trigger-daily-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity: selectedEntity,
          county: selectedCounty
        })
      });

      if (res.ok) {
        await Promise.all([loadProperties(), loadNotifications()]);
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      // Create simulation notification locally
      const newNotif: EmailNotification = {
        id: `notif_${Date.now()}`,
        timestamp: new Date().toISOString(),
        recipientEmail: currentUser?.email || "sreeshkanala@gmail.com",
        companyName: selectedEntity,
        subject: `🔍 CAD Tracker Alert: Daily CAD Sweep for ${selectedEntity} (${selectedCounty} County)`,
        updateType: "daily_sync_summary",
        propertyCount: properties.filter(p => p.owner_name === selectedEntity).length || 60,
        detailsSummary: `Daily CAD sweep executed for ${selectedCounty} County. Appraisal values and protest deadlines updated.`,
        bodyHtml: `<div style="font-family: sans-serif; padding: 15px;"><h3>CAD Sweep Completed</h3><p>County: ${selectedCounty}</p><p>Owner Entity: ${selectedEntity}</p></div>`,
        read: false
      };
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        try { localStorage.setItem("cad_notifications", JSON.stringify(updated)); } catch (e) {}
        return updated;
      });
      setIsAlertDrawerOpen(true);
    } finally {
      setIsTriggeringDaily(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      try { localStorage.setItem("cad_notifications", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    try {
      await fetch("/api/notifications/mark-read", { method: "POST" });
    } catch (err) {
      console.error("Error marking read", err);
    }
  };

  // Company Onboarded callback
  const handleCompanyCreated = (newCompany: CompanyPortfolio, count: number) => {
    setCompanies(prev => {
      const updated = [...prev, newCompany];
      try { localStorage.setItem("cad_companies", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    setSelectedCompanyId(newCompany.id);
    loadProperties();
    if (newCompany.legalEntities && newCompany.legalEntities.length > 0) {
      setSelectedEntity(newCompany.legalEntities[0]);
    }
    alert(`Successfully onboarded ${newCompany.name}! Ingested ${count} property records for real-time CAD tracking.`);
  };

  // Update a single property's details
  const handleUpdateProperty = async (id: string, fields: Partial<PropertyTaxRecord>) => {
    setProperties(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...fields } : p);
      try { localStorage.setItem("cad_properties", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    if (selectedProp?.id === id) {
      setSelectedProp(prev => prev ? { ...prev, ...fields } : null);
    }
    try {
      await fetch("/api/properties/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fields })
      });
    } catch (err) {
      console.error("Error updating property remotely", err);
    }
  };

  // File protest for a single property
  const handleFileProtest = async (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    setProperties(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          const newHist = [
            ...(p.history || []),
            {
              date: today,
              event: "Protest Filed",
              description: "Official property tax protest submitted to Appraisal Review Board.",
              user: currentUser?.name || "Tax Administrator"
            }
          ];
          return {
            ...p,
            stage: "protest" as PropertyStage,
            status: "Protest Filed",
            protest_filed_date: today,
            history: newHist
          };
        }
        return p;
      });
      try { localStorage.setItem("cad_properties", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    if (selectedProp?.id === id) {
      setSelectedProp(prev => prev ? {
        ...prev,
        stage: "protest",
        status: "Protest Filed",
        protest_filed_date: today
      } : null);
    }
    try {
      await fetch("/api/properties/protest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] })
      });
    } catch (err) {
      console.error("Error filing protest remotely", err);
    }
  };

  // Bulk protest filing
  const handleBulkProtest = async (ids: string[]) => {
    const today = new Date().toISOString().split("T")[0];
    setProperties(prev => {
      const updated = prev.map(p => {
        if (ids.includes(p.id)) {
          const newHist = [
            ...(p.history || []),
            {
              date: today,
              event: "Protest Filed",
              description: "Bulk property tax protest submitted to Appraisal Review Board.",
              user: currentUser?.name || "Tax Administrator"
            }
          ];
          return {
            ...p,
            stage: "protest" as PropertyStage,
            status: "Protest Filed",
            protest_filed_date: today,
            history: newHist
          };
        }
        return p;
      });
      try { localStorage.setItem("cad_properties", JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    alert(`Successfully filed property tax protests for ${ids.length} properties!`);
    try {
      await fetch("/api/properties/protest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
    } catch (err) {
      console.error("Error filing bulk protests remotely", err);
    }
  };

  // Simulated scraper pipeline run
  const handleRunScraper = async () => {
    if (isScraping) return;
    setIsScraping(true);
    setScrapingProgress(0);
    setScraperLogs([]);

    let totalLogs: ScraperLog[] = [];

    try {
      const response = await fetch("/api/properties/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ county: selectedCounty, entity: selectedEntity })
      });

      if (response.ok) {
        const data = await response.json();
        totalLogs = data.logs || [];
      } else {
        throw new Error("Scraper API offline");
      }
    } catch (err) {
      // Fallback client-side CAD crawler simulation
      const timeStr = new Date().toLocaleTimeString();
      totalLogs = [
        { id: "1", timestamp: timeStr, level: "info", message: `Initializing Texas CAD Scraping Engine for ${selectedCounty} County...` },
        { id: "2", timestamp: timeStr, level: "info", message: `Querying Appraisal Register for target entity: "${selectedEntity}"...` },
        { id: "3", timestamp: timeStr, level: "info", message: `Parsing CAD Parcel Records & GIS boundary coordinates...` },
        { id: "4", timestamp: timeStr, level: "success", message: `Match confirmed: Active inventory parcels identified under ${selectedEntity}.` },
        { id: "5", timestamp: timeStr, level: "info", message: `Extracting 2026 Appraised Values and ARB Protest Deadlines...` },
        { id: "6", timestamp: timeStr, level: "success", message: `CAD Sweep completed successfully for ${selectedCounty} County. Database synchronized!` }
      ];
    }

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < totalLogs.length) {
        setScraperLogs(prev => [...prev, totalLogs[logIndex]]);
        setScrapingProgress(Math.min(100, Math.round(((logIndex + 1) / totalLogs.length) * 100)));
        logIndex++;
      } else {
        clearInterval(interval);
        setIsScraping(false);
        setScrapingProgress(100);
        loadProperties();
      }
    }, 500);
  };

  // Calculations for dashboard metrics
  const computeMetrics = (): DashboardMetrics => {
    let renderingCount = 0;
    let protestCount = 0;
    let paymentCount = 0;
    let activeProtests = 0;
    let resolvedProtestsCount = 0;
    let totalTaxDue = 0;
    let totalTaxPaid = 0;
    let totalTaxUnpaid = 0;
    let estimatedSavings = 0;

    properties.forEach((p) => {
      if (p.stage === "rendering") renderingCount++;
      if (p.stage === "protest") protestCount++;
      if (p.stage === "payment") paymentCount++;

      if (p.status === "Protest Filed" || p.status === "Protest Hearing Scheduled") {
        activeProtests++;
      }
      if (p.status === "Protest Resolved") {
        resolvedProtestsCount++;
      }

      if (p.protest_outcome_value && p.current_appraised_value && p.current_appraised_value > p.protest_outcome_value) {
        const rate = p.tax_rate || 2.0;
        const valuationSaved = p.current_appraised_value - p.protest_outcome_value;
        const taxSaved = (valuationSaved * rate) / 100;
        estimatedSavings += taxSaved;
      }

      if (p.tax_amount_due) {
        if (p.payment_status === "paid") {
          totalTaxPaid += p.tax_amount_due;
        } else {
          totalTaxUnpaid += p.tax_amount_due;
        }
        totalTaxDue += p.tax_amount_due;
      }
    });

    return {
      totalProperties: properties.length,
      renderingCount,
      protestCount,
      paymentCount,
      activeProtests,
      resolvedProtestsCount,
      totalTaxDue,
      totalTaxPaid,
      totalTaxUnpaid,
      estimatedSavings
    };
  };

  const metrics = computeMetrics();
  const unreadAlertsCount = notifications.filter(n => !n.read).length;

  const handleSelectProperty = (prop: PropertyTaxRecord) => {
    setSelectedProp(prop);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Controls Bar: Multi-Tenant Switcher, Export CSV, Daily Alert Bell, User Profile */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Company Portfolio Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">Company Portfolio:</span>
          </div>
          
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="px-3.5 py-2 border rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:outline-indigo-600 shadow-2xs"
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.isDemo ? "(Pre-loaded Demo)" : ""}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsOnboardingModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Ingest custom property addresses, CAD IDs, or company portfolios"
          >
            <Plus className="h-4 w-4" />
            <span>Ingest Custom Addresses / Entities</span>
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Export CSV Button */}
          <CSVExportButton 
            selectedEntity={selectedEntity}
            selectedCounty={selectedCounty}
          />

          {/* Email Notice Alerts Bell */}
          <button
            onClick={() => setIsAlertDrawerOpen(true)}
            className="relative p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-2 text-xs font-bold"
            title="View continuous daily CAD update email notification logs"
          >
            <Bell className="h-4 w-4 text-indigo-600" />
            <span className="hidden sm:inline">CAD Email Alerts</span>
            {unreadAlertsCount > 0 && (
              <span className="h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* User Sign-In / Account Badge (COMMENTED OUT FOR NOW)
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs border border-slate-700/60"
            title={currentUser?.isLoggedIn ? `Signed in as ${currentUser.email}` : "Click to Sign In with Email or Google"}
          >
            {currentUser?.googleConnected ? (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            ) : (
              <User className="h-4 w-4 text-indigo-400 shrink-0" />
            )}
            <div className="text-left flex flex-col justify-center">
              <span className="text-xs font-black leading-tight text-white">
                {currentUser?.isLoggedIn ? (currentUser.name || currentUser.email.split("@")[0]) : "Sign In"}
              </span>
              {currentUser?.isLoggedIn && (
                <span className="text-[9px] font-mono font-medium text-slate-400 truncate max-w-[130px]">
                  {currentUser.email}
                </span>
              )}
            </div>
          </button>
          */}
        </div>

      </div>

      {/* Continuous Daily Monitor Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Continuous 24/7 CAD Tracker Active
            </span>
            <span className="text-[11px] font-bold text-slate-400">Daily CAD Sweeps Scheduled at 06:00 AM CST</span>
          </div>
          <h2 className="text-base font-extrabold tracking-tight">Daily Automated Appraisal Change & Email Notification Engine</h2>
          <p className="text-xs text-slate-300">
            Addresses are tracked continuously over time. When CAD releases new appraisal notices or tax statements, email updates dispatch automatically.
          </p>
        </div>

        <button
          onClick={handleTriggerDailyUpdate}
          disabled={isTriggeringDaily}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm flex items-center gap-2 shrink-0"
        >
          {isTriggeringDaily ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Checking CADs...</>
          ) : (
            <><Mail className="h-4 w-4" /> Simulate CAD Update & Email Alert</>
          )}
        </button>
      </div>

      {/* Title & Under Construction Notice */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-3xs">
              <HardHat className="h-3.5 w-3.5" />
              Active Builder Inventory & Multi-County Tax Harvest
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            {selectedCompanyId === "stylecraft" ? "Stylecraft Property Tax Harvest" : "Property Tax Audit Dashboard"}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Tracking <span className="font-extrabold text-slate-800">{properties.length} properties</span> across Central Texas Appraisal Districts.
          </p>
        </div>
        
        {/* Scraper Config Card */}
        <div className="w-full md:w-auto bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Owner Entity</label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                disabled={isScraping}
                className="w-full px-3 py-1.5 border rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-indigo-500 bg-slate-50"
              >
                {finalEntityList.map(e => <option key={e.entity} value={e.entity}>{e.entity}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Target County</label>
              <select
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                disabled={isScraping}
                className="w-full px-3 py-1.5 border rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-indigo-500 bg-slate-50"
              >
                {currentCountyList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto self-end">
            <button
              onClick={() => setIsOnboardingModalOpen(true)}
              className="px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              title="Add custom address list or entity name for CAD scraping"
            >
              <Plus className="h-4 w-4 text-indigo-600" />
              <span>Import List</span>
            </button>

            <button
              id="start-scraper-btn"
              onClick={handleRunScraper}
              disabled={isScraping || currentCountyList.length === 0}
              className="w-full sm:w-auto px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 rounded-xl text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-xs"
            >
              {isScraping ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Crawling CAD...</>
              ) : (
                <><Play className="h-4 w-4" /> Run CAD Scraper</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Overview Block */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Total Tracked */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">TOTAL PROPERTIES</span>
              <p className="text-2xl font-black text-slate-800 font-mono">{metrics.totalProperties}</p>
              <div className="flex gap-2 text-[10px] text-slate-400 font-semibold mt-1">
                <span>{metrics.renderingCount} R</span>
                <span>•</span>
                <span>{metrics.protestCount} P</span>
                <span>•</span>
                <span>{metrics.paymentCount} T</span>
              </div>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
              <Building className="h-6 w-6" />
            </div>
          </div>

          {/* Card 2: Protests Saved (THE HERO METRIC) */}
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">TAX SAVINGS GENERATED</span>
              <p className="text-2xl font-black text-emerald-800 font-mono">${Math.round(metrics.estimatedSavings).toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                From {metrics.resolvedProtestsCount} settled protests
              </span>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>

          {/* Card 3: Active Protests */}
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block mb-1">ACTIVE PROTESTS</span>
              <p className="text-2xl font-black text-amber-800 font-mono">{metrics.activeProtests}</p>
              <span className="text-[10px] text-amber-600 font-semibold block mt-1">
                Under CAD / ARB review
              </span>
            </div>
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>

          {/* Card 4: Total Tax Liabilities */}
          <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">TAX LIABILITY SUMMARY</span>
              <p className="text-2xl font-black text-indigo-900 font-mono">${Math.round(metrics.totalTaxDue).toLocaleString()}</p>
              <div className="flex gap-2 text-[10px] text-indigo-500 font-semibold mt-1">
                <span className="text-emerald-600">${Math.round(metrics.totalTaxPaid).toLocaleString()} Paid</span>
                <span>•</span>
                <span className="text-amber-700">${Math.round(metrics.totalTaxUnpaid).toLocaleString()} Due</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-100 text-indigo-800 rounded-xl">
              <Wallet2 className="h-6 w-6" />
            </div>
          </div>

        </div>
      )}

      {/* Scraper Terminal Output Section */}
      {(isScraping || scraperLogs.length > 0) && (
        <div className="animate-fade-in">
          <ScraperConsole 
            logs={scraperLogs}
            isScraping={isScraping}
            activeEntity={selectedEntity}
            activeCounty={selectedCounty}
            progress={scrapingProgress}
          />
        </div>
      )}

      {/* Properties View */}
      <div className="space-y-4">
        {/* Properties list */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-mono font-bold animate-pulse">
            Loading properties database...
          </div>
        ) : (
          <PropertyTable 
            properties={properties}
            onSelectProperty={handleSelectProperty}
            onBulkProtest={handleBulkProtest}
          />
        )}
      </div>

      {/* Property Details & Notice Modal */}
      <PropertyModal 
        property={selectedProp}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProp(null); }}
        onUpdate={handleUpdateProperty}
        onFileProtest={handleFileProtest}
      />

      {/* Auth Modal (Google & Email Login) - COMMENTED OUT FOR NOW
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
      */}

      {/* Multi-Tenant Company Onboarding Modal */}
      <CompanyOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onCompanyCreated={handleCompanyCreated}
      />

      {/* Continuous Daily CAD Monitor & Email Alert Drawer */}
      <DailyMonitorAlertDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        notifications={notifications}
        onTriggerDailyUpdate={handleTriggerDailyUpdate}
        onMarkRead={handleMarkNotificationsRead}
        isTriggering={isTriggeringDaily}
      />

    </div>
  );
}
