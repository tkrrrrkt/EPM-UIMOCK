'use client';

import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui';

interface ConfigErrorBlockProps {
  missingConfigItems: string[];
}

export function ConfigErrorBlock({
  missingConfigItems,
}: ConfigErrorBlockProps) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">
            ROIC設定が未完了です
          </h2>
          {missingConfigItems.length > 0 && (
            <div className="w-full">
              <p className="mb-2 text-sm text-muted-foreground">
                以下の設定が不足しています：
              </p>
              <ul className="space-y-1 text-left text-sm text-muted-foreground">
                {missingConfigItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            管理者に設定を依頼してください
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
