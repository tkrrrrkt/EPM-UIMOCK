'use client';

/**
 * MultidimAnalysisPage Component
 *
 * Main page for multidimensional analysis
 * Layout: 3-column (Field Palette | Main Content | Drill Panel)
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md (Task 17.1)
 */

import { useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { Share2 } from 'lucide-react';
import { Button, useToast } from '@/shared/ui';
import { usePivotStore, type DropZone } from '../store/pivot-store';
import { bffClient } from '../api/client';
import { FieldPalette } from './field-palette';
import { PivotDropZones } from './pivot-drop-zones';
import { GlobalFilterBar } from './global-filter-bar';
import { PivotResultGrid } from './pivot-result-grid';
import { DrillPanel } from './drill-panel';
import { PresetSelector } from './preset-selector';

export function MultidimAnalysisPage() {
  const { setAvailableFields, addFieldToZone, getLayoutForUrl, loadLayoutFromUrl } =
    usePivotStore();
  const { toast } = useToast();

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load available fields on mount
  useEffect(() => {
    const loadFields = async () => {
      try {
        const result = await bffClient.getFields();
        setAvailableFields(result.fields);
      } catch (err) {
        console.error('Failed to load fields:', err);
      }
    };
    loadFields();
  }, [setAvailableFields]);

  // Load layout from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const layoutParam = params.get('layout');
    if (layoutParam) {
      loadLayoutFromUrl(layoutParam);
    }
  }, [loadLayoutFromUrl]);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) return;

      const fieldId = active.id as string;
      const zone = over.id as DropZone;

      if (['rows', 'cols', 'values', 'filters'].includes(zone)) {
        addFieldToZone(fieldId, zone);
      }
    },
    [addFieldToZone]
  );

  // Copy URL to clipboard
  const handleCopyUrl = useCallback(() => {
    const encoded = getLayoutForUrl();
    const url = new URL(window.location.href);
    url.searchParams.set('layout', encoded);

    navigator.clipboard.writeText(url.toString()).then(() => {
      toast({
        title: 'URLをコピーしました',
        description: '共有URLがクリップボードにコピーされました',
      });
    });
  }, [getLayoutForUrl, toast]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h1 className="text-2xl font-bold">多次元分析</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ドラッグ＆ドロップでレイアウトを設定し、データを分析
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PresetSelector />
            <Button variant="outline" size="sm" onClick={handleCopyUrl}>
              <Share2 className="h-4 w-4 mr-2" />
              URLを共有
            </Button>
          </div>
        </div>

        {/* Main Content - 3 Column Grid Layout */}
        <div className="flex-1 min-h-0 grid grid-cols-[240px_1fr_280px]">
          {/* Left Panel: Field Palette */}
          <div className="h-full overflow-y-auto border-r bg-muted/30">
            <FieldPalette />
          </div>

          {/* Center Panel: Main Content */}
          <div className="h-full flex flex-col p-4 space-y-4 overflow-auto">
            {/* Global Filters */}
            <GlobalFilterBar />

            {/* Drop Zones */}
            <PivotDropZones />

            {/* Pivot Grid */}
            <div className="flex-1 min-h-[400px] border rounded-lg overflow-hidden">
              <PivotResultGrid />
            </div>
          </div>

          {/* Right Panel: Drill Panel */}
          <div className="h-full overflow-y-auto border-l bg-muted/30">
            <DrillPanel />
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {/* Overlay content handled by dnd-kit */}
      </DragOverlay>
    </DndContext>
  );
}
