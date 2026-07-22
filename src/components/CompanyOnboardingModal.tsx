import React, { useState } from "react";
import { X, Building2, Plus, FileText, CheckCircle2, Sparkles, MapPin, Upload } from "lucide-react";
import { CompanyPortfolio } from "../propertyTypes";

interface CompanyOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyCreated: (company: CompanyPortfolio, importedCount: number) => void;
}

export function CompanyOnboardingModal({ isOpen, onClose, onCompanyCreated }: CompanyOnboardingModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [legalEntities, setLegalEntities] = useState("Pulte Homes Texas LLC, Pulte Development LP");
  const [counties, setCounties] = useState("Brazos, Travis, Williamson");
  const [addressBatch, setAddressBatch] = useState(
    "1204 COPPERFIELD PKWY\n809 VILLAGE LN\n1402 SEYMOUR DR\n5226 DEER CREEK TRAIL\n4133 STONEGATE"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedEntities = legalEntities.split(",").map(s => s.trim()).filter(Boolean);
      const parsedCounties = counties.split(",").map(s => s.trim()).filter(Boolean);
      const parsedAddresses = addressBatch.split("\n").map(s => s.trim()).filter(Boolean);

      const res = await fetch("/api/companies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          legalEntities: parsedEntities.length > 0 ? parsedEntities : [companyName],
          counties: parsedCounties.length > 0 ? parsedCounties : ["Brazos"],
          initialAddresses: parsedAddresses
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.company) {
          onCompanyCreated(data.company, data.importedCount || 0);
          onClose();
        }
      }
    } catch (err) {
      console.error("Error creating company portfolio", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold tracking-widest uppercase">
            <Building2 className="h-4 w-4" /> Multi-Tenant Developer Onboarding
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">Onboard New Company / Portfolio</h2>
          <p className="text-xs text-slate-400 mt-1">
            Test minimal required inputs: Enter entity names or batch paste property addresses to initialize continuous CAD property tax harvesting.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Step 1: Minimal Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Minimal Required Company Credentials
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                Company / Developer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Pulte Homes, LGI Homes, Perry Homes, Century Communities"
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  CAD Legal Entity Names (Comma-separated)
                </label>
                <input
                  type="text"
                  value={legalEntities}
                  onChange={(e) => setLegalEntities(e.target.value)}
                  placeholder="e.g. Entity LP, Entity LLC"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  Primary CAD Counties (Comma-separated)
                </label>
                <input
                  type="text"
                  value={counties}
                  onChange={(e) => setCounties(e.target.value)}
                  placeholder="e.g. Brazos, Travis, Williamson"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-indigo-600 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Batch Address Input */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Property Addresses / CAD IDs to Track
              </span>
              <span className="text-[10px] font-bold text-slate-400">One street address per line</span>
            </div>

            <textarea
              rows={4}
              value={addressBatch}
              onChange={(e) => setAddressBatch(e.target.value)}
              placeholder="Paste list of addresses or CAD Geo IDs..."
              className="w-full p-3 border rounded-xl text-xs font-mono font-medium focus:outline-indigo-600 bg-slate-50 leading-relaxed"
            />
            
            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-900">
              <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <p>
                <b>Automated CAD Sync:</b> Upon submitting, the system will instantly generate initial property tax records, link 2025 prior valuations, set 2026 protest timelines, and schedule daily automated CAD checks with email notification alerts.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !companyName.trim()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Onboarding Company..." : "Initialize Portfolio"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
