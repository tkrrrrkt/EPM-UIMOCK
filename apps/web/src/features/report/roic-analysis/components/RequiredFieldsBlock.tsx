'use client';

import { Info } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui';

interface RequiredFieldsBlockProps {
  message?: string;
}

export function RequiredFieldsBlock({
  message = 'データソースを選択してください',
}: RequiredFieldsBlockProps) {
  return (
    <div className="flex h-[40vh] items-center justify-center">
      <Card className="w-full max-w-md border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <Info className="h-12 w-12 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">{message}</h2>
          <p className="text-sm text-muted-foreground">
            左上のフィルターからPrimaryを選択してください
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
