import React, { useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";

interface CSVExportButtonProps {
  selectedEntity?: string;
  selectedCounty?: string;
  className?: string;
}

export function CSVExportButton({ selectedEntity, selectedCounty, className = "" }: CSVExportButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExport = async () => {
    setIsDownloading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEntity) params.append("entity", selectedEntity);
      if (selectedCounty) params.append("county", selectedCounty);

      const url = `/api/properties/export-csv?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to export CSV");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `cad_property_tax_harvest_${selectedEntity || "all"}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("CSV Export Error:", err);
      alert("Unable to generate CSV export. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isDownloading}
      className={`px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${className}`}
      title="Download full CAD portfolio valuation and tax records as CSV"
    >
      {isDownloading ? (
        <><Loader2 className="h-4 w-4 animate-spin" /> Exporting...</>
      ) : (
        <><Download className="h-4 w-4" /> Export CSV</>
      )}
    </button>
  );
}
