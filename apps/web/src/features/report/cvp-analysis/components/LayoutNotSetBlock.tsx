'use client';

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui';

export function LayoutNotSetBlock() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>CVPレイアウトが未設定です</AlertTitle>
        <AlertDescription>
          会社マスタでCVPレイアウトを設定してください。
        </AlertDescription>
      </Alert>
    </div>
  );
}
