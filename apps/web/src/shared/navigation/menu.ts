/**
 * Menu SSoT (Information Architecture)
 *
 * This file defines:
 * - What screens exist in the SaaS
 * - How they are grouped
 * - Which features are reachable by users
 *
 * Features MUST NOT define their own entry points.
 */

import {
  LayoutDashboard,
  Calculator,
  BarChart3,
  Database,
  Settings,
  Users,
  Palette,
  FolderKanban,
  BookOpen,
  Layers,
  Building2,
  Network,
  LineChart,
  Link2,
  Split,
  Target,
  KanbanSquare,
  GanttChart,
  ListChecks,
  FileText,
  TrendingUp,
  ClipboardList,
  CalendarRange,
  CheckCircle2,
  ShieldCheck,
  CalendarCheck,
  Gauge,
  PieChart,
  GitCompareArrows,
  Activity,
  UserCog,
  Shield,
  ClipboardCheck,
  Briefcase,
  ArrowRightLeft,
  FileUp,
  Presentation,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Bot,
  type LucideIcon,
} from "lucide-react"

export type MenuItem = {
  id: string
  label: string
  labelJa?: string
  path?: string
  icon?: LucideIcon
  children?: MenuItem[]
}

export const menu: MenuItem[] = [
  // ダッシュボード
  {
    id: "dashboard",
    label: "Dashboard",
    labelJa: "ダッシュボード",
    path: "/dashboard",
    icon: LayoutDashboard,
  },

  // マスタデータ
  {
    id: "master-data",
    label: "Master Data",
    labelJa: "マスタデータ",
    icon: Database,
    children: [
      {
        id: "company-master",
        label: "Companies",
        labelJa: "法人マスタ",
        path: "/master-data/company-master",
        icon: Building2,
      },
      {
        id: "organization-master",
        label: "Organization",
        labelJa: "組織・部門マスタ",
        path: "/master-data/organization-master",
        icon: Network,
      },
      {
        id: "project-master",
        label: "Projects",
        labelJa: "プロジェクトマスタ",
        path: "/master-data/project-master",
        icon: FolderKanban,
      },
      {
        id: "subject-master",
        label: "Subjects",
        labelJa: "科目マスタ",
        path: "/master-data/subject-master",
        icon: BookOpen,
      },
      {
        id: "dimension-master",
        label: "Dimensions",
        labelJa: "ディメンションマスタ",
        path: "/master-data/dimension-master",
        icon: Layers,
      },
      {
        id: "employee-master",
        label: "Employees",
        labelJa: "社員マスタ",
        path: "/master-data/employee-master",
        icon: Users,
      },
      {
        id: "metrics-master",
        label: "Metrics",
        labelJa: "指標マスタ",
        path: "/master-data/metrics-master",
        icon: LineChart,
      },
      {
        id: "kpi-definition-master",
        label: "KPI Definitions",
        labelJa: "KPI定義マスタ",
        path: "/master-data/kpi-definitions",
        icon: Target,
      },
      {
        id: "labor-cost-rate",
        label: "Labor Cost Rate",
        labelJa: "労務費予算単価マスタ",
        path: "/master-data/labor-cost-rate",
        icon: Calculator,
      },
      {
        id: "report-layout",
        label: "Report Layout",
        labelJa: "レイアウトマスタ",
        path: "/master-data/report-layout",
        icon: Layers,
      },
      {
        id: "group-subject-master",
        label: "Group Subjects",
        labelJa: "連結勘定科目マスタ",
        path: "/master-data/group-subject-master",
        icon: BookOpen,
      },
      {
        id: "group-subject-mapping",
        label: "Group Subject Mapping",
        labelJa: "連結科目マッピング",
        path: "/master-data/group-subject-mapping",
        icon: Link2,
      },
      {
        id: "group-report-layout",
        label: "Group Report Layout",
        labelJa: "連結レイアウトマスタ",
        path: "/master-data/group-report-layout",
        icon: Layers,
      },
      {
        id: "allocation-master",
        label: "Allocation",
        labelJa: "配賦マスタ",
        path: "/master-data/allocation-master",
        icon: Split,
      },
      {
        id: "confidence-master",
        label: "Confidence Levels",
        labelJa: "確度マスタ",
        path: "/master-data/confidence-master",
        icon: Gauge,
      },
    ],
  },

  // 予算管理
  {
    id: "budget",
    label: "Budget Management",
    labelJa: "予算管理",
    icon: Calculator,
    children: [
      {
        id: "mtp",
        label: "Mid-Term Plan",
        labelJa: "中期経営計画",
        path: "/planning/mtp",
        icon: TrendingUp,
      },
      {
        id: "mtp-sync",
        label: "Mid-Term Plan (SyV)",
        labelJa: "中期経営計画 (SyV)",
        path: "/planning/mtp-sync",
        icon: TrendingUp,
      },
      {
        id: "guideline",
        label: "Budget Guideline",
        labelJa: "予算ガイドライン",
        path: "/planning/guideline",
        icon: ClipboardList,
      },
      {
        id: "guideline-sync",
        label: "Budget Guideline (SyV)",
        labelJa: "予算ガイドライン (SyV)",
        path: "/planning/guideline-sync",
        icon: ClipboardList,
      },
      {
        id: "headcount-planning",
        label: "Headcount Planning",
        labelJa: "人員計画登録",
        path: "/planning/headcount-planning",
        icon: UserCog,
      },
      {
        id: "budget-entry",
        label: "Budget Entry",
        labelJa: "予算入力",
        path: "/transactions/budget-entry",
        icon: FileText,
      },
      {
        id: "budget-entry-sync",
        label: "Budget Entry (SyV)",
        labelJa: "予算入力 (SyV)",
        path: "/transactions/budget-entry-sync",
        icon: FileText,
      },
      {
        id: "forecast-entry",
        label: "Forecast Entry",
        labelJa: "見込入力",
        path: "/transactions/forecast-entry",
        icon: CalendarRange,
      },
      {
        id: "forecast-entry-sync",
        label: "Forecast Entry (SyV)",
        labelJa: "見込入力 (SyV)",
        path: "/transactions/forecast-entry-sync",
        icon: CalendarRange,
      },
      {
        id: "actual-entry",
        label: "Actual Entry",
        labelJa: "実績入力",
        path: "/transactions/actual-entry",
        icon: CheckCircle2,
      },
      {
        id: "actual-entry-sync",
        label: "Actual Entry (SyV)",
        labelJa: "実績入力 (SyV)",
        path: "/transactions/actual-entry-sync",
        icon: CheckCircle2,
      },
      {
        id: "approval-workflow",
        label: "Approval Workflow",
        labelJa: "承認ワークフロー",
        path: "/workflow/approval",
        icon: ClipboardCheck,
      },
    ],
  },

  // KPI管理
  {
    id: "kpi",
    label: "KPI Management",
    labelJa: "KPI管理",
    icon: Target,
    children: [
      {
        id: "kpi-list",
        label: "KPI Status",
        labelJa: "KPI状況照会",
        path: "/kpi/list",
        icon: TrendingUp,
      },
      {
        id: "kpi-master",
        label: "KPI Settings",
        labelJa: "KPI管理設定",
        path: "/kpi/master",
        icon: Settings,
      },
    ],
  },

  // 経営会議
  {
    id: "meetings",
    label: "Management Meetings",
    labelJa: "経営会議",
    icon: Presentation,
    children: [
      {
        id: "meeting-events",
        label: "Meeting Events",
        labelJa: "会議イベント一覧",
        path: "/meetings/management-meeting-report",
        icon: CalendarCheck,
      },
      {
        id: "meeting-type-master",
        label: "Meeting Types",
        labelJa: "会議種別マスタ",
        path: "/meetings/meeting-type-master",
        icon: Settings,
      },
    ],
  },

  // レポート
  {
    id: "reports",
    label: "Reports",
    labelJa: "レポート",
    icon: BarChart3,
    children: [
      {
        id: "dashboards",
        label: "Dashboards",
        labelJa: "経営ダッシュボード",
        path: "/reporting/dashboards",
        icon: Presentation,
      },
      {
        id: "budget-actual-report",
        label: "Budget vs Actual",
        labelJa: "予算実績比較レポート",
        path: "/report/budget-actual-report",
        icon: BarChart3,
      },
      {
        id: "budget-actual-report-ag",
        label: "Budget vs Actual (AG Grid)",
        labelJa: "予算実績比較レポート（AG Grid）",
        path: "/report/budget-actual-report-ag",
        icon: BarChart3,
      },
      {
        id: "confidence-report",
        label: "Confidence Report",
        labelJa: "確度別売上見込レポート",
        path: "/report/confidence-report",
        icon: PieChart,
      },
      {
        id: "budget-trend-report",
        label: "Budget Trend",
        labelJa: "予算消化推移レポート",
        path: "/report/budget-trend-report",
        icon: TrendingUp,
      },
      {
        id: "variance-report",
        label: "Variance Analysis",
        labelJa: "差異分析レポート",
        path: "/report/variance-report",
        icon: GitCompareArrows,
      },
      {
        id: "scenario-report",
        label: "Scenario Analysis",
        labelJa: "シナリオ分析レポート",
        path: "/report/scenario-report",
        icon: Activity,
      },
      {
        id: "project-profitability",
        label: "Project Profitability",
        labelJa: "PJ採算照会",
        path: "/report/project-profitability",
        icon: Briefcase,
      },
      {
        id: "cvp-analysis",
        label: "CVP Analysis",
        labelJa: "CVP損益分岐分析",
        path: "/report/cvp-analysis",
        icon: TrendingUp,
      },
      {
        id: "roic-analysis",
        label: "ROIC Analysis",
        labelJa: "ROIC分析",
        path: "/report/roic-analysis",
        icon: TrendingUp,
      },
      {
        id: "indicator-report",
        label: "Indicator Report",
        labelJa: "財務指標分析レポート",
        path: "/reporting/indicator-report",
        icon: LineChart,
      },
      {
        id: "multidim-analysis",
        label: "Multidimensional Analysis",
        labelJa: "BI多次元分析",
        path: "/reporting/multidim-analysis",
        icon: Layers,
      },
    ],
  },

  // データ連携
  {
    id: "data-integration",
    label: "Data Integration",
    labelJa: "データ連携",
    icon: ArrowRightLeft,
    children: [
      {
        id: "data-import",
        label: "Data Import",
        labelJa: "データ取込",
        path: "/data-integration/import",
        icon: FileUp,
      },
    ],
  },

  // 管理
  {
    id: "admin",
    label: "Administration",
    labelJa: "管理",
    icon: ShieldCheck,
    children: [
      {
        id: "permission-settings",
        label: "Permission Settings",
        labelJa: "権限設定",
        path: "/admin/permission-settings",
        icon: Shield,
      },
      {
        id: "period-close-status",
        label: "Period Close Status",
        labelJa: "月次締処理状況",
        path: "/admin/period-close-status",
        icon: CalendarCheck,
      },
    ],
  },

  // 設定
  {
    id: "settings",
    label: "Settings",
    labelJa: "設定",
    icon: Settings,
    children: [
      {
        id: "user-management",
        label: "Users & Roles",
        labelJa: "ユーザー・ロール",
        path: "/settings/users",
        icon: Users,
      },
    ],
  },

  // デザインシステム
  {
    id: "design-system",
    label: "Design System",
    labelJa: "デザインシステム",
    path: "/design-system",
    icon: Palette,
  },

  // AI機能デモ（開発環境のみ）
  ...(process.env.NODE_ENV === "development"
    ? [
        {
          id: "ai-demo",
          label: "AI Features Demo",
          labelJa: "🧪 AI機能デモ (v0)",
          icon: Sparkles,
          children: [
            {
              id: "nlq-demo",
              label: "Natural Language Q&A",
              labelJa: "自然言語Q&A",
              path: "/_v0_drop/ai/nlq",
              icon: MessageSquare,
            },
            {
              id: "variance-analysis-demo",
              label: "Variance Analysis",
              labelJa: "差異分析レポート",
              path: "/_v0_drop/ai/variance-analysis",
              icon: GitCompareArrows,
            },
            {
              id: "graph-generation-demo",
              label: "Graph Generation",
              labelJa: "グラフ自動生成",
              path: "/_v0_drop/ai/graph-generation",
              icon: LineChart,
            },
            {
              id: "anomaly-detection-demo",
              label: "Anomaly Detection",
              labelJa: "異常値検知アラート",
              path: "/_v0_drop/ai/anomaly-detection",
              icon: AlertTriangle,
            },
            {
              id: "chat-bot-demo",
              label: "Executive Bot",
              labelJa: "経営参謀Bot",
              path: "/_v0_drop/ai/chat-bot",
              icon: Bot,
            },
          ],
        },
      ]
    : []),
]
