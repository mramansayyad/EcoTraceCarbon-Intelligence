'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ActivityForm from '../../../components/log/ActivityForm';
import { Card, CardBody } from '../../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';

export default function LogActivityPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to main dashboard after successful logging
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Back Link */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-all font-semibold cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Dashboard</span>
      </button>

      <div>
        <h1 className="text-2xl font-extrabold text-white font-display tracking-tight">
          Log Carbon Activity
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Record daily habits across Transport, Food, Energy, and Shopping to build your Carbon Intelligence profile.
        </p>
      </div>

      <Card variant="base">
        <CardBody className="p-6">
          <ActivityForm onSuccess={handleSuccess} />
        </CardBody>
      </Card>
    </div>
  );
}
