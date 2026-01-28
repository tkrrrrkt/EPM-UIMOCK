/**
 * Text Widget
 *
 * Purpose:
 * - Display markdown text content
 * - Support rich formatting
 * - Used for notes, explanations, headers
 *
 * Reference: .kiro/specs/reporting/dashboard/requirements.md (Requirement 12)
 */
'use client';

import type { BffWidgetDto, BffWidgetDataResponseDto, TextDisplayConfig } from '@epm/contracts/bff/dashboard';

interface TextWidgetProps {
  widget: BffWidgetDto;
  data: BffWidgetDataResponseDto;
}

/**
 * Text Widget Component
 * Displays markdown text content
 */
export function TextWidget({ widget, data }: TextWidgetProps) {
  const displayConfig = widget.displayConfig as TextDisplayConfig;

  return (
    <div className="h-full overflow-auto p-4 bg-white rounded border border-neutral-200">
      {/* Markdown content placeholder */}
      <div className="prose prose-sm max-w-none">
        <div className="text-neutral-700 whitespace-pre-wrap">
          {displayConfig.content || 'テキストが設定されていません'}
        </div>
      </div>

      <div className="mt-4 text-xs text-neutral-300">
        （Markdown レンダリングは後で実装）
      </div>
    </div>
  );
}
