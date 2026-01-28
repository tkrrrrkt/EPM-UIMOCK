'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui';
import type { BffRoicWarning } from '../types';
import { getWarningMessage } from '../lib/error-messages';

interface WarningBannerProps {
  warnings: BffRoicWarning[];
  bsSubstitutedWithActual: boolean;
}

export function WarningBanner({
  warnings,
  bsSubstitutedWithActual,
}: WarningBannerProps) {
  const allWarnings = [...warnings];

  if (bsSubstitutedWithActual) {
    allWarnings.push({
      code: 'BS_SUBSTITUTED_WITH_ACTUAL',
      message:
        'BS予算/見込データがないため、実績で代替表示しています',
    });
  }

  if (allWarnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {allWarnings.map((warning, index) => (
        <Alert
          key={`${warning.code}-${index}`}
          className="border-warning bg-warning/10"
        >
          <AlertTriangle className="h-4 w-4 text-warning-foreground" />
          <AlertDescription className="text-warning-foreground">
            {warning.message || getWarningMessage(warning.code)}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
