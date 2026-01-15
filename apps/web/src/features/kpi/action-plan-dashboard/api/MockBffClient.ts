import type {
  BffClient,
  BffDashboardData,
  BffKpiDetail,
  BffDashboardQuery,
} from "@epm/contracts/bff/action-plan-dashboard"

export class MockBffClient implements BffClient {
  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getDashboardData(query: BffDashboardQuery): Promise<BffDashboardData> {
    await this.delay()

    const mockData: BffDashboardData = {
      summary: {
        totalKpiCount: 5,
        totalPlanCount: 12,
        delayedPlanCount: 2,
        completedPlanCount: 3,
        overallProgressRate: 65,
      },
      kpiGroups: [
        {
          kpiId: "kpi-001",
          kpiCode: "KPI-SALES-001",
          kpiName: "売上高",
          organizationName: "営業本部",
          budgetAmount: 100000000,
          actualAmount: 85000000,
          achievementRate: 85,
          plans: [
            {
              id: "plan-001",
              planCode: "AP-2026-001",
              planName: "新規顧客開拓施策",
              departmentName: "営業1部",
              responsibleEmployeeName: "山田 太郎",
              startDate: "2026-01-01",
              dueDate: "2026-06-30",
              wbsProgressRate: 70,
              taskCompletionRate: 65,
              status: "normal",
              isOverdue: false,
            },
            {
              id: "plan-002",
              planCode: "AP-2026-002",
              planName: "既存顧客深耕施策",
              departmentName: "営業2部",
              responsibleEmployeeName: "佐藤 花子",
              startDate: "2026-02-01",
              dueDate: "2026-03-31",
              wbsProgressRate: 40,
              taskCompletionRate: 35,
              status: "delayed",
              isOverdue: true,
            },
          ],
        },
        {
          kpiId: "kpi-002",
          kpiCode: "KPI-COST-001",
          kpiName: "コスト削減率",
          organizationName: "管理本部",
          budgetAmount: 50000000,
          actualAmount: 45000000,
          achievementRate: 90,
          plans: [
            {
              id: "plan-003",
              planCode: "AP-2026-003",
              planName: "省エネ設備導入",
              departmentName: "総務部",
              responsibleEmployeeName: "鈴木 一郎",
              startDate: "2026-01-15",
              dueDate: "2026-09-30",
              wbsProgressRate: 100,
              taskCompletionRate: 100,
              status: "completed",
              isOverdue: false,
            },
          ],
        },
        {
          kpiId: "kpi-003",
          kpiCode: "KPI-HR-001",
          kpiName: "従業員満足度",
          organizationName: "人事本部",
          budgetAmount: null,
          actualAmount: null,
          achievementRate: null,
          plans: [],
        },
        {
          kpiId: "kpi-004",
          kpiCode: "KPI-QUALITY-001",
          kpiName: "品質改善率",
          organizationName: "製造本部",
          budgetAmount: 30000000,
          actualAmount: 28000000,
          achievementRate: 93,
          plans: [
            {
              id: "plan-004",
              planCode: "AP-2026-004",
              planName: "品質管理システム刷新",
              departmentName: "品質管理部",
              responsibleEmployeeName: "田中 次郎",
              startDate: "2026-01-01",
              dueDate: "2026-12-31",
              wbsProgressRate: 55,
              taskCompletionRate: 50,
              status: "normal",
              isOverdue: false,
            },
            {
              id: "plan-005",
              planCode: "AP-2026-005",
              planName: "不良品削減プロジェクト",
              departmentName: "製造1部",
              responsibleEmployeeName: "伊藤 三郎",
              startDate: "2026-02-01",
              dueDate: "2026-08-31",
              wbsProgressRate: 75,
              taskCompletionRate: 80,
              status: "normal",
              isOverdue: false,
            },
          ],
        },
        {
          kpiId: "kpi-005",
          kpiCode: "KPI-CS-001",
          kpiName: "顧客満足度",
          organizationName: "CS本部",
          budgetAmount: 20000000,
          actualAmount: 18000000,
          achievementRate: 90,
          plans: [
            {
              id: "plan-006",
              planCode: "AP-2026-006",
              planName: "カスタマーサポート強化",
              departmentName: "CS部",
              responsibleEmployeeName: "渡辺 四郎",
              startDate: "2026-03-01",
              dueDate: "2026-05-31",
              wbsProgressRate: 30,
              taskCompletionRate: 25,
              status: "delayed",
              isOverdue: false,
            },
          ],
        },
      ],
      lastUpdatedAt: new Date().toISOString(),
    }

    // Apply filters
    const filteredData = { ...mockData }

    if (query.progressStatus) {
      filteredData.kpiGroups = filteredData.kpiGroups.map((group) => ({
        ...group,
        plans: group.plans.filter((plan) => plan.status === query.progressStatus),
      }))
    }

    return filteredData
  }

  async getKpiDetail(subjectId: string): Promise<BffKpiDetail> {
    await this.delay()

    const mockDetails: Record<string, BffKpiDetail> = {
      "kpi-001": {
        kpiId: "kpi-001",
        kpiCode: "KPI-SALES-001",
        kpiName: "売上高",
        monthlyData: [
          {
            yearMonth: "2026-01",
            budgetAmount: 8000000,
            actualAmount: 7500000,
            variance: -500000,
            achievementRate: 93.75,
          },
          {
            yearMonth: "2026-02",
            budgetAmount: 8500000,
            actualAmount: 8200000,
            variance: -300000,
            achievementRate: 96.47,
          },
          {
            yearMonth: "2026-03",
            budgetAmount: 9000000,
            actualAmount: 8800000,
            variance: -200000,
            achievementRate: 97.78,
          },
          {
            yearMonth: "2026-04",
            budgetAmount: 8500000,
            actualAmount: 7000000,
            variance: -1500000,
            achievementRate: 82.35,
          },
          {
            yearMonth: "2026-05",
            budgetAmount: 9000000,
            actualAmount: 8500000,
            variance: -500000,
            achievementRate: 94.44,
          },
          {
            yearMonth: "2026-06",
            budgetAmount: 9500000,
            actualAmount: 9200000,
            variance: -300000,
            achievementRate: 96.84,
          },
        ],
        totalBudget: 52500000,
        totalActual: 49200000,
        totalAchievementRate: 93.71,
      },
      "kpi-002": {
        kpiId: "kpi-002",
        kpiCode: "KPI-COST-001",
        kpiName: "コスト削減率",
        monthlyData: [
          {
            yearMonth: "2026-01",
            budgetAmount: 4000000,
            actualAmount: 3800000,
            variance: -200000,
            achievementRate: 95.0,
          },
          {
            yearMonth: "2026-02",
            budgetAmount: 4000000,
            actualAmount: 3700000,
            variance: -300000,
            achievementRate: 92.5,
          },
          {
            yearMonth: "2026-03",
            budgetAmount: 4500000,
            actualAmount: 4200000,
            variance: -300000,
            achievementRate: 93.33,
          },
        ],
        totalBudget: 12500000,
        totalActual: 11700000,
        totalAchievementRate: 93.6,
      },
    }

    const detail = mockDetails[subjectId]
    if (!detail) {
      throw new Error("SUBJECT_NOT_FOUND")
    }

    return detail
  }
}
