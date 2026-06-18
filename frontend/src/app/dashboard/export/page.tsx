'use client';

import React, { useState } from 'react';
import api from '../../../lib/api';
import { useUIStore } from '../../../store/uiStore';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Download, FileSpreadsheet, FileText, ArrowLeft, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ExportPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const [isCsvLoading, setIsCsvLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleExport = async (type: 'csv' | 'pdf') => {
    const setLoading = type === 'csv' ? setIsCsvLoading : setIsPdfLoading;
    setLoading(true);
    try {
      // 1. Try to fetch as JSON first in case it returns a GCS URL
      const checkRes = await api.get(`/export/${type}`);
      if (checkRes.data && checkRes.data.url) {
        window.open(checkRes.data.url, '_blank');
        addToast(`${type.toUpperCase()} report generated successfully!`, 'success');
      } else {
        // Fallback to streaming download
        await downloadStream(type);
      }
    } catch {
      // 2. If JSON fetch fails/streams binary directly, try streaming download
      try {
        await downloadStream(type);
      } catch (fallbackErr) {
        console.error('Export failed:', fallbackErr);
        addToast(`Failed to generate ${type.toUpperCase()} report.`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadStream = async (type: 'csv' | 'pdf') => {
    const response = await api.get(`/export/${type}?stream=true`, { responseType: 'blob' });
    const mimeType = type === 'csv' ? 'text/csv' : 'application/pdf';
    const blob = new Blob([response.data], { type: mimeType });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `ecotrace_export_${Date.now()}.${type}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    addToast(`${type.toUpperCase()} report downloaded successfully.`, 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-all font-semibold cursor-pointer mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </button>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <Download className="h-6 w-6 text-accent-green" />
            Export Data & Reports
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Download your carbon footprints, custom category breakdowns, and goal target progress files.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export */}
        <Card variant="base" className="flex flex-col justify-between p-6">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Granular Log History (CSV)</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Download a complete spreadsheet file containing every logged activity since account creation. Includes raw input values, categories, details, timestamps, and actual calculated carbon footprints in kg CO2e.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xxs text-zinc-500 bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-lg">
              <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>Perfect for Excel, Google Sheets, or custom database ingestion.</span>
            </div>
          </div>
          <Button
            onClick={() => handleExport('csv')}
            variant="secondary"
            className="w-full justify-center mt-6 py-2.5 gap-2"
            isLoading={isCsvLoading}
          >
            <Download className="h-4 w-4" />
            <span>Download CSV Log</span>
          </Button>
        </Card>

        {/* PDF Export */}
        <Card variant="base" className="flex flex-col justify-between p-6">
          <div className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Carbon Intelligence Report (PDF)</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Generate a clean, print-ready executive summary. Includes carbon footprints aggregated across the past 30 days, category distributions, reduction goal metrics, community percentile comparisons, and personalized AI sustainability advice.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xxs text-zinc-500 bg-zinc-950/40 border border-zinc-850 p-2.5 rounded-lg">
              <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span>Great for sharing weekly progress or archiving footprint milestones.</span>
            </div>
          </div>
          <Button
            onClick={() => handleExport('pdf')}
            variant="primary"
            className="w-full justify-center mt-6 py-2.5 gap-2"
            isLoading={isPdfLoading}
          >
            <Download className="h-4 w-4" />
            <span>Generate PDF Digest</span>
          </Button>
        </Card>
      </div>
    </div>
  );
}
