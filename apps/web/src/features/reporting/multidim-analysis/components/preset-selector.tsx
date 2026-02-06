'use client';

/**
 * PresetSelector Component
 *
 * Allows selecting predefined layout presets
 * Features:
 * - Preset list display
 * - Apply preset to current layout
 * - Reset layout button
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md (Task 16.6)
 */

import { useEffect, useState } from 'react';
import { RotateCcw, LayoutTemplate, Check } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui';
import type { BffLayoutPresetDto } from '@epm/contracts/bff/multidim-analysis';
import { usePivotStore } from '../store/pivot-store';
import { bffClient } from '../api/client';

export function PresetSelector() {
  const { applyPreset, resetLayout } = usePivotStore();
  const [presets, setPresets] = useState<BffLayoutPresetDto[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const result = await bffClient.getPresets();
        setPresets(result.presets);
      } catch (err) {
        console.error('Failed to fetch presets:', err);
      }
    };
    fetchPresets();
  }, []);

  const handleSelectPreset = (preset: BffLayoutPresetDto) => {
    applyPreset(preset.layout);
    setSelectedPresetId(preset.id);
  };

  const handleReset = () => {
    resetLayout();
    setSelectedPresetId(null);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <LayoutTemplate className="h-4 w-4 mr-2" />
            プリセット
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[250px]">
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="flex items-start gap-2"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{preset.nameJa}</span>
                  {selectedPresetId === preset.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {preset.description}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          {presets.length > 0 && <DropdownMenuSeparator />}
          <DropdownMenuItem onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            リセット
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
