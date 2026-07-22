import React, { useState } from "react";
import { X, Building2, Plus, FileText, CheckCircle2, Sparkles, MapPin, Upload, Layers, ListFilter } from "lucide-react";
import { CompanyPortfolio } from "../propertyTypes";

interface CompanyOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyCreated: (company: CompanyPortfolio, importedCount: number) => void;
}

export function CompanyOnboardingModal({ isOpen, onClose, onCompanyCreated }: CompanyOnboardingModalProps) {
  const [activeTab, setActiveTab] = useState<"batch" | "company" | "file">("batch");

  // Batch Ingestion state
  const [targetEntityName, setTargetEntityName] = useState("Lennar Texas LP");
  const [targetCounty, setTargetCounty] = useState("Brazos");
  const [situsCity, setSitusCity] = useState("College Station");
  const [situsZip, setSitusZip] = useState("77845");
  const [addressBatchText, setAddressBatchText] = useState(
    "1204 COPPERFIELD PKWY\n809 VILLAGE LN\n1402 SEYMOUR DR\n5226 DEER CREEK TRAIL\n4133 STONEGATE"
  );

  // Full Company state
  const [companyName, setCompanyName] = useState("");
  const [legalEntities, setLegalEntities] = useState("Pulte Homes Texas LLC, Pulte Development LP");
  const [counties, setCounties] = useState("Brazos, Travis, Williamson");

  // File Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Load sample addresses helper
  const handleLoadSampleAddresses = () => {
    setAddressBatchText(
      "4102 PINE TRACE DR\n1805 CRESTVIEW AVE\n920 COTTONWOOD CT\n3310 TIMBER RIDGE WAY\n504 SEYMOUR DR\nCAD Parcel #482910\nCAD Parcel #720491"
    );
  };

  // Handle CSV/TXT File upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        // Split by newlines and filter empty lines
        const lines = text
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0 && !line.toLowerCase().startsWith("address") && !line.toLowerCase().startsWith("property_id"));
        
        if (lines.length > 0) {
          setAddressBatchText(lines.join("\n"));
          setActiveTab("batch");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawLines = addressBatchText.split("\n").map(s => s.trim()).filter(Boolean);
    if (rawLines.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/properties/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityName: targetEntityName,
          county: targetCounty,
          city: situsCity,
          zip: situsZip,
          addressList: rawLines
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const comp: CompanyPortfolio = data.company || {
            id: targetEntityName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
            name: targetEntityName,
            legalEntities: [targetEntityName],
            counties: [targetCounty],
            totalProperties: data.count || 0,
            createdDate: new Date().toISOString().split("T")[0]
          };
          onCompanyCreated(comp, data.count || 0);
          onClose();
        }
      }
    } catch (err) {
      console.error("Error importing custom property batch", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedEntities = legalEntities.split(",").map(s => s.trim()).filter(Boolean);
      const parsedCounties = counties.split(",").map(s => s.trim()).filter(Boolean);
      const parsedAddresses = addressBatchText.split("\n").map(s => s.trim()).filter(Boolean);

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

  const lineCount = addressBatchText.split("\n").map(s => s.trim()).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5 text-indigo-400 text-xs font-black tracking-widest uppercase">
            <Building2 className="h-4 w-4" /> Portfolio Ingestion & CAD Tax Harvest Engine
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">Ingest Custom Addresses & Entity Portfolios</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter addresses, CAD Property IDs, or company names to harvest appraisal notices and tax projections instantly.
          </p>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-5 border-b border-slate-800 pb-1">
            <button
              onClick={() => setActiveTab("batch")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition ${
                activeTab === "batch"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>1. Batch Paste Addresses / IDs</span>
            </button>

            <button
              onClick={() => setActiveTab("file")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition ${
                activeTab === "file"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>2. Upload CSV / TXT</span>
            </button>

            <button
              onClick={() => setActiveTab("company")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-2 transition ${
                activeTab === "company"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>3. Full Developer Onboarding</span>
            </button>
          </div>
        </div>

        {/* Tab Content: Batch Address List */}
        {activeTab === "batch" && (
          <form onSubmit={handleBatchSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            
            {/* Target Owner & CAD Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  Builder / Company / Owner Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={targetEntityName}
                  onChange={(e) => setTargetEntityName(e.target.value)}
                  placeholder="e.g. Lennar Homes, Perry Homes, D.R. Horton, My Custom Builder"
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  Target County CAD
                </label>
                <select
                  value={targetCounty}
                  onChange={(e) => setTargetCounty(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-slate-800 bg-slate-50 focus:outline-indigo-600"
                >
                  <option value="Brazos">Brazos County CAD</option>
                  <option value="Travis">Travis County CAD (Austin)</option>
                  <option value="Williamson">Williamson County CAD (Round Rock/Georgetown)</option>
                  <option value="Harris">Harris County CAD (Houston)</option>
                  <option value="Bexar">Bexar County CAD (San Antonio)</option>
                  <option value="Dallas">Dallas County CAD</option>

                  <option value="Montgomery">Montgomery County CAD (Conroe/Woodlands)</option>
                  <option value="Fort Bend">Fort Bend County CAD (Sugar Land)</option>
                  <option value="Burleson">Burleson County CAD</option>
                  <option value="Grimes">Grimes County CAD</option>
                  <option value="Walker">Walker County CAD</option>
                  <option value="Bell">Bell County CAD (Temple/Killeen)</option>
                </select>
              </div>
            </div>

            {/* City & Zip Optional */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Default City</label>
                <input
                  type="text"
                  value={situsCity}
                  onChange={(e) => setSitusCity(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs font-semibold text-slate-700 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Default Zip Code</label>
                <input
                  type="text"
                  value={situsZip}
                  onChange={(e) => setSitusZip(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded-xl text-xs font-semibold text-slate-700 bg-slate-50"
                />
              </div>
            </div>

            {/* Address Batch Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-black uppercase text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                  List of Property Addresses, CAD Geo IDs, or Parcel Numbers
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {lineCount} {lineCount === 1 ? "entry" : "entries"} detected
                  </span>
                  <button
                    type="button"
                    onClick={handleLoadSampleAddresses}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300"
                  >
                    ⚡ Load Sample List
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={addressBatchText}
                onChange={(e) => setAddressBatchText(e.target.value)}
                placeholder="Paste addresses or parcel IDs (one per line):&#10;1204 COPPERFIELD PKWY&#10;809 VILLAGE LN&#10;CAD Parcel #482910&#10;Perry Homes Texas LLC"
                className="w-full p-3 border rounded-xl text-xs font-mono font-medium focus:outline-indigo-600 bg-slate-50 leading-relaxed"
              />
            </div>

            {/* Info Badge */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-[11px] text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <b>Instant CAD Tax Ingestion:</b> Upon submitting, the system will immediately generate appraisal records, calculate 2026 projected tax bills, set 30-day ARB protest windows, and include them in CSV export files.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || lineCount === 0}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isSubmitting ? "Ingesting Addresses..." : `Gather CAD Data (${lineCount} Properties)`}
              </button>
            </div>

          </form>
        )}

        {/* Tab Content: CSV / Text File Upload */}
        {activeTab === "file" && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/50 rounded-2xl p-8 text-center transition flex flex-col items-center justify-center space-y-3 cursor-pointer relative">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Drop your CSV or TXT file here</h4>
                <p className="text-xs text-slate-500 mt-1">Accepts files with property addresses, CAD Geo IDs, or parcel lists</p>
              </div>
              {uploadedFileName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Loaded file: {uploadedFileName}
                </span>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Expected CSV Format</h5>
              <p>Your file can be a simple plain text list of street addresses (one per line) or a standard CSV file. Headers like <code>address</code> or <code>property_id</code> are automatically parsed.</p>
            </div>
          </div>
        )}

        {/* Tab Content: Full Company Portfolio Onboarding */}
        {activeTab === "company" && (
          <form onSubmit={handleCompanySubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                  Company / Builder / Developer Name <span className="text-rose-500">*</span>
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

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !companyName.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {isSubmitting ? "Onboarding Portfolio..." : "Initialize Full Portfolio"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

