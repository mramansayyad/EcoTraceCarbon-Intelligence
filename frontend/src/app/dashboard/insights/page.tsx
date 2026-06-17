'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AIChatPanel from '../../../components/chat/AIChatPanel';
import { ArrowLeft, BrainCircuit } from 'lucide-react';

export default function AIInsightsPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Back Link */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-all font-semibold cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Dashboard</span>
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display tracking-tight flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-accent-green" />
            AI Carbon Intelligence
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Get personalized sustainability feedback, footprint calculators, and weekly carbon budgeting tips.
          </p>
        </div>
      </div>

      <AIChatPanel />
    </div>
  );
}
