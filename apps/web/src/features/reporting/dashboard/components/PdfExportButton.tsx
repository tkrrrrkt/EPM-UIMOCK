/**
 * PDF Export Button Component
 *
 * Purpose:
 * - Export dashboard to PDF using html2canvas + jsPDF
 * - Include timestamp in the exported PDF
 * - Show progress indicator during export
 *
 * Reference:
 * - .kiro/specs/reporting/dashboard/requirements.md (Requirement 18)
 * - .kiro/specs/reporting/dashboard/tasks.md (Task 14.3)
 */
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/shared/ui';
import { FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PdfExportButtonProps {
  dashboardName: string;
  targetElementId: string; // ID of the dashboard container to capture
  className?: string;
}

/**
 * PDF Export Button
 * Captures dashboard and exports as PDF with timestamp
 */
export function PdfExportButton({
  dashboardName,
  targetElementId,
  className,
}: PdfExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle PDF export
   * Captures the dashboard using html2canvas and generates PDF with jsPDF
   */
  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);

    try {
      // Get target element
      const element = document.getElementById(targetElementId);
      if (!element) {
        throw new Error('Dashboard element not found');
      }

      // Capture dashboard using html2canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true, // Allow cross-origin images
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // Add dashboard image
      pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);

      // Add timestamp footer
      const timestamp = new Date().toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `出力日時: ${timestamp}`,
        105,
        pdf.internal.pageSize.height - 10,
        { align: 'center' }
      );

      // Generate filename
      const filename = `${dashboardName}_${new Date().toISOString().slice(0, 10)}.pdf`;

      // Save PDF
      pdf.save(filename);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError(err instanceof Error ? err.message : 'PDFエクスポートに失敗しました');
    } finally {
      setExporting(false);
    }
  }, [dashboardName, targetElementId]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exporting}
        className={className}
      >
        {exporting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            エクスポート中...
          </>
        ) : (
          <>
            <FileDown className="mr-2 h-4 w-4" />
            PDF出力
          </>
        )}
      </Button>

      {/* Error Message */}
      {error && (
        <div className="absolute top-full mt-2 w-64 rounded-md bg-error-50 p-3 shadow-lg">
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}
    </div>
  );
}
