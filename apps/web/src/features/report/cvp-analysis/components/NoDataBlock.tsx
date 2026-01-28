'use client';

import { Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui';

export function NoDataBlock() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <Alert className="max-w-lg">
        <Search className="h-4 w-4" />
        <AlertTitle>データが見つかりません</AlertTitle>
        <AlertDescription>
          条件を変更してください。
        </AlertDescription>
      </Alert>
    </div>
  );
}
