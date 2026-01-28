'use client'

import { Card, CardContent, Progress } from '@/shared/ui'
import { Target, TrendingUp, AlertTriangle, Bell } from 'lucide-react'

interface KpiSummaryCardsProps {
  totalKpis: number
  overallAchievementRate: number
  delayedActionPlans: number
  attentionRequired: number
}

export function KpiSummaryCards({
  totalKpis,
  overallAchievementRate,
  delayedActionPlans,
  attentionRequired,
}: KpiSummaryCardsProps) {
  const cards = [
    {
      title: '全KPI',
      value: `${totalKpis}件`,
      icon: Target,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      title: '全体達成率',
      value: `${overallAchievementRate}%`,
      icon: TrendingUp,
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      showProgress: true,
      progressValue: overallAchievementRate,
    },
    {
      title: '遅延AP',
      value: `${delayedActionPlans}件`,
      icon: AlertTriangle,
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning',
      isWarning: delayedActionPlans > 0,
    },
    {
      title: '要対応',
      value: `${attentionRequired}件`,
      icon: Bell,
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      isAlert: attentionRequired > 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.title}
            className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-lg p-2.5 ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              {card.showProgress && (
                <div className="mt-4 space-y-1.5">
                  <Progress value={card.progressValue} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    目標: 100%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
