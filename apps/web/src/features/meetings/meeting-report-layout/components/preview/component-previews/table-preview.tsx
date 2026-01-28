'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import { cn } from '@/lib/utils'
import type { TableConfig } from '@epm/contracts/bff/meetings'

interface TablePreviewProps {
  config: TableConfig
}

// Mock table data for preview
const mockTableData = [
  { subject: '売上高', budget: 120000000, actual: 125000000, variance: 5000000, varianceRate: 4.2 },
  { subject: '売上原価', budget: 77000000, actual: 80000000, variance: 3000000, varianceRate: 3.9 },
  { subject: '売上総利益', budget: 43000000, actual: 45000000, variance: 2000000, varianceRate: 4.7 },
  { subject: '販管費', budget: 25000000, actual: 30000000, variance: 5000000, varianceRate: 20.0 },
  { subject: '営業利益', budget: 18000000, actual: 15000000, variance: -3000000, varianceRate: -16.7 },
]

const mockTotalData = {
  subject: '合計',
  budget: 283000000,
  actual: 295000000,
  variance: 12000000,
  varianceRate: 4.2,
}

export function TablePreview({ config }: TablePreviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP').format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getColumnHeader = (col: string) => {
    switch (col) {
      case 'budget':
        return '予算'
      case 'actual':
        return '実績'
      case 'variance':
        return '差異'
      case 'varianceRate':
        return '差異率'
      default:
        return col
    }
  }

  const columns = config.columns || ['budget', 'actual', 'variance', 'varianceRate']
  const data = config.showTotal ? [...mockTableData, mockTotalData] : mockTableData

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">科目</TableHead>
            {columns.map((col) => (
              <TableHead key={col} className="text-right">
                {getColumnHeader(col)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const isTotal = row.subject === '合計'
            return (
              <TableRow key={index} className={cn(isTotal && 'font-medium bg-muted/50')}>
                <TableCell className={cn(isTotal && 'font-bold')}>{row.subject}</TableCell>
                {columns.map((col) => {
                  const value = row[col as keyof typeof row]
                  const isVariance = col === 'variance' || col === 'varianceRate'
                  const isNegative = typeof value === 'number' && value < 0

                  return (
                    <TableCell
                      key={col}
                      className={cn(
                        'text-right font-mono',
                        config.highlightVariance && isVariance && isNegative && 'text-red-600',
                        config.highlightVariance && isVariance && !isNegative && typeof value === 'number' && value > 0 && 'text-emerald-600'
                      )}
                    >
                      {col === 'varianceRate'
                        ? formatPercent(value as number)
                        : formatCurrency(value as number)}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
