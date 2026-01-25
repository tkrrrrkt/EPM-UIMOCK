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
import { Textarea } from '@/shared/ui/textarea';
import { Calendar } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { CalendarIcon, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface AddActionPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpiMasterItemId: string;
  kpiItemName: string;
  onActionPlanCreated: () => void;
}

export function AddActionPlanDialog({
  open,
  onOpenChange,
  kpiMasterItemId,
  kpiItemName,
  onActionPlanCreated,
}: AddActionPlanDialogProps) {
  const [planCode, setPlanCode] = useState('');
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!planCode || !planName) {
      alert('必須項目を入力してください');
      return;
    }

    setLoading(true);
    try {
      // Mock: Create action plan with kpiMasterItemId
      // In real implementation, this would call BFF endpoint:
      // POST /api/bff/action-plan-core/plans
      // with kpiMasterItemId in the request body

      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('Creating action plan:', {
        planCode,
        planName,
        description,
        deadline,
        kpiMasterItemId,
      });

      // Reset form
      setPlanCode('');
      setPlanName('');
      setDescription('');
      setDeadline(undefined);

      alert(
        'アクションプランを作成しました。\n\nWBSまたはかんばんボードから詳細を編集できます。',
      );

      onActionPlanCreated();
    } catch (error) {
      console.error('Failed to create action plan:', error);
      alert('アクションプランの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>アクションプラン追加</DialogTitle>
          <DialogDescription>
            KPI「{kpiItemName}」に紐づくアクションプランを作成します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="planCode">
                プランコード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="planCode"
                value={planCode}
                onChange={(e) => setPlanCode(e.target.value)}
                placeholder="例: AP-2026-001"
                className="font-mono"
                maxLength={20}
                required
              />
              <p className="text-xs text-muted-foreground">
                アクションプランを識別するコードを入力してください
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planName">
                プラン名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="例: 新規顧客開拓施策"
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">
                アクションプランの名称を入力してください
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="アクションプランの目的や概要を入力してください"
                rows={4}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label>期限</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? (
                      format(deadline, 'PPP', { locale: ja })
                    ) : (
                      <span className="text-muted-foreground">期限を選択</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                アクションプランの完了予定日を設定してください
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                作成後、WBSまたはかんばんボードから、タスクやマイルストーンを追加できます。
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
