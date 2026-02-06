'use client'

import { GridComponent, ColumnsDirective, ColumnDirective, Inject, Page, Sort, Filter, PageSettingsModel } from '@syncfusion/ej2-react-grids'
import '@syncfusion/ej2-react-grids/styles/material.css'
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
  isTotal: true,
}

export function TablePreview({ config }: TablePreviewProps) {
  const pageSettings: PageSettingsModel = { pageSize: 10 }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getColumnTemplate = (col: string) => {
    return (props: any) => {
      const value = props[col]
      if (col === 'varianceRate') {
        return <span>{formatPercent(value)}</span>
      }
      if (col === 'variance') {
        const isNegative = value < 0
        return (
          <span style={{ color: config.highlightVariance ? (isNegative ? '#dc2626' : '#059669') : 'inherit' }}>
            {formatCurrency(value)}
          </span>
        )
      }
      return <span>{formatCurrency(value)}</span>
    }
  }

  const columns = config.columns || ['budget', 'actual', 'variance', 'varianceRate']
  const data = config.showTotal ? [...mockTableData, mockTotalData] : mockTableData

  const columnConfig = [
    { field: 'subject', headerText: '科目', width: 150, textAlign: 'Left' as const },
    ...columns.map((col) => ({
      field: col,
      headerText:
        col === 'budget'
          ? '予算'
          : col === 'actual'
            ? '実績'
            : col === 'variance'
              ? '差異'
              : '差異率',
      width: 120,
      textAlign: 'Right' as const,
      template: getColumnTemplate(col),
    })),
  ]

  return (
    <div style={{ height: '400px', overflow: 'auto' }}>
      <GridComponent
        id="synctable-preview"
        dataSource={data}
        allowPaging={true}
        allowSorting={true}
        allowFiltering={true}
        pageSettings={pageSettings}
        actionFailure={() => {}}
      >
        <ColumnsDirective>
          {columnConfig.map((col, idx) => (
            <ColumnDirective
              key={idx}
              field={col.field}
              headerText={col.headerText}
              width={col.width}
              textAlign={col.textAlign}
              template={'template' in col ? col.template : undefined}
            />
          ))}
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter]} />
      </GridComponent>
    </div>
  )
}
