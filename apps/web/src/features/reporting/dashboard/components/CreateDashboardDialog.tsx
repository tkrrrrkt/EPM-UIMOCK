/**
 * Create Dashboard Dialog Component
 *
 * Purpose:
 * - Provide UI for creating new dashboards
 * - Support blank dashboard or template-based creation
 * - Navigate to edit mode after successful creation
 *
 * Reference:
 * - .kiro/specs/reporting/dashboard/requirements.md (Requirement 15)
 * - .kiro/specs/reporting/dashboard/tasks.md (Task 14.1)
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  RadioGroup,
  RadioGroupItem,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui';
import { Loader2, FileText, Plus } from 'lucide-react';
import { bffClient } from '../api/client';
import type {
  BffCreateDashboardDto,
  BffDashboardTemplateDto,
} from '@epm/contracts/bff/dashboard';

interface CreateDashboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Create Dashboard Dialog
 * Handles both blank and template-based dashboard creation
 */
export function CreateDashboardDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateDashboardDialogProps) {
  const router = useRouter();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creationType, setCreationType] = useState<'blank' | 'template'>('blank');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Templates state
  const [templates, setTemplates] = useState<BffDashboardTemplateDto[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<Error | null>(null);

  // Submission state
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load templates when template option is selected
  useEffect(() => {
    if (creationType === 'template' && templates.length === 0 && !loadingTemplates) {
      loadTemplates();
    }
  }, [creationType, templates.length, loadingTemplates]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setCreationType('blank');
      setSelectedTemplateId('');
      setError(null);
    }
  }, [open]);

  // Load available templates
  const loadTemplates = async () => {
    setLoadingTemplates(true);
    setTemplatesError(null);
    try {
      const response = await bffClient.getTemplates();
      setTemplates(response.templates);
    } catch (err) {
      setTemplatesError(err instanceof Error ? err : new Error('Failed to load templates'));
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Validate form
  const isValid = () => {
    if (!name.trim()) return false;
    if (creationType === 'template' && !selectedTemplateId) return false;
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid()) return;

    setCreating(true);
    setError(null);

    try {
      const createData: BffCreateDashboardDto = {
        name: name.trim(),
        description: description.trim() || undefined,
        templateId: creationType === 'template' ? selectedTemplateId : undefined,
      };

      const result = await bffClient.createDashboard(createData);

      // Navigate to detail view or edit mode
      router.push(`/reporting/dashboards/${result.id}`);

      // Notify parent and close dialog
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create dashboard'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-900">
            新規ダッシュボード作成
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-600">
            経営指標を可視化する新しいダッシュボードを作成します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="dashboard-name" className="text-sm font-medium text-neutral-700">
                ダッシュボード名 <span className="text-error-600">*</span>
              </Label>
              <Input
                id="dashboard-name"
                placeholder="例: 経営サマリー"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={200}
                required
                className="w-full"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="dashboard-description" className="text-sm font-medium text-neutral-700">
                説明
              </Label>
              <Textarea
                id="dashboard-description"
                placeholder="ダッシュボードの目的や内容を入力してください"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none"
              />
            </div>

            {/* Creation Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-neutral-700">作成方法</Label>
              <RadioGroup value={creationType} onValueChange={(value) => setCreationType(value as 'blank' | 'template')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blank" id="type-blank" />
                  <Label htmlFor="type-blank" className="cursor-pointer font-normal text-neutral-700">
                    空白から作成
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="template" id="type-template" />
                  <Label htmlFor="type-template" className="cursor-pointer font-normal text-neutral-700">
                    テンプレートから作成
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Template Selection */}
            {creationType === 'template' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-neutral-700">
                  テンプレート選択 <span className="text-error-600">*</span>
                </Label>

                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  </div>
                ) : templatesError ? (
                  <div className="rounded-md bg-error-50 p-4">
                    <p className="text-sm text-error-700">
                      テンプレートの読み込みに失敗しました: {templatesError.message}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadTemplates}
                      className="mt-2"
                    >
                      再試行
                    </Button>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="rounded-md bg-neutral-50 p-4">
                    <p className="text-sm text-neutral-600">
                      利用可能なテンプレートがありません
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:border-primary-300 hover:shadow-sm ${
                          selectedTemplateId === template.id
                            ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                            : 'border-neutral-200'
                        }`}
                        onClick={() => setSelectedTemplateId(template.id)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start space-x-3">
                            <FileText className={`h-5 w-5 ${
                              selectedTemplateId === template.id
                                ? 'text-primary-600'
                                : 'text-neutral-400'
                            }`} />
                            <div className="flex-1">
                              <CardTitle className="text-sm font-semibold text-neutral-900">
                                {template.name}
                              </CardTitle>
                              {template.description && (
                                <CardDescription className="mt-1 text-xs text-neutral-600">
                                  {template.description}
                                </CardDescription>
                              )}
                              <p className="mt-2 text-xs text-neutral-500">
                                {template.widgetCount}個のウィジェット
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-error-50 p-4">
                <p className="text-sm text-error-700">
                  ダッシュボードの作成に失敗しました: {error.message}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!isValid() || creating}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  作成中...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  作成
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
