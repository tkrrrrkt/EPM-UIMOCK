'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { HttpBffClient } from '../../api/http-bff-client';

const bffClient = new HttpBffClient();

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated: () => void;
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onEventCreated,
}: CreateEventDialogProps) {
  const [fiscalYear, setFiscalYear] = useState<number>(2026);
  const [eventCode, setEventCode] = useState('');
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventCode || !eventName) {
      alert('すべての項目を入力してください');
      return;
    }

    setLoading(true);
    try {
      await bffClient.createEvent({
        companyId: 'company-001', // TODO: Get from context
        eventCode,
        eventName,
        fiscalYear,
      });

      // Reset form
      setEventCode('');
      setEventName('');
      setFiscalYear(2026);

      onEventCreated();
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('イベントの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新規KPI管理イベント作成</DialogTitle>
          <DialogDescription>
            年度単位でKPI管理の枠組みを作成します。イベントは下書き状態で作成されます。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fiscalYear">
                年度 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={fiscalYear.toString()}
                onValueChange={(value) => setFiscalYear(Number(value))}
              >
                <SelectTrigger id="fiscalYear">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026, 2027, 2028].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}年度
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                KPI管理の対象年度を選択してください
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventCode">
                イベントコード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="eventCode"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                placeholder="例: KPI2026"
                className="font-mono"
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">
                同一会社内で一意となるコードを入力してください
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventName">
                イベント名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="例: 2026年度KPI管理"
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">
                イベントの表示名を入力してください
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary">
              {loading ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
