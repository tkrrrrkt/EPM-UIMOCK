'use client';

import { FileQuestion } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui';

interface NoDataBlockProps {
  message?: string;
}

export function NoDataBlock({
  message = 'データが見つかりません',
}: NoDataBlockProps) {
  return (
    <div className="flex h-[40vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground">{message}</h2>
          <p className="text-sm text-muted-foreground">
            フィルター条件を変更してください
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
