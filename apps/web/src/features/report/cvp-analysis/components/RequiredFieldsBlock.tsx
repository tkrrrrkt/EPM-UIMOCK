'use client';

import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui';

export function RequiredFieldsBlock() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <Alert className="max-w-lg">
        <Info className="h-4 w-4" />
        <AlertTitle>必須項目を選択してください</AlertTitle>
        <AlertDescription>
          年度、データソース、期間、表示粒度、部門を選択してデータを表示します。
        </AlertDescription>
      </Alert>
    </div>
  );
}
