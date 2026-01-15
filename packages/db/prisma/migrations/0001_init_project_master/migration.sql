-- CreateTable: Project Master
-- FR-LIST-08: プロジェクトマスタのDBモデル定義

CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "project_code" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "project_short_name" TEXT,
    "project_kana_name" TEXT,
    "department_code" TEXT,
    "responsible_employee_code" TEXT,
    "responsible_employee_name" TEXT,
    "planned_period_from" TIMESTAMP(3) NOT NULL,
    "planned_period_to" TIMESTAMP(3) NOT NULL,
    "actual_period_from" TIMESTAMP(3),
    "actual_period_to" TIMESTAMP(3),
    "budget_amount" DECIMAL(19,2) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_project_code" ON "project"("tenant_id", "project_code");

-- CreateIndex
CREATE INDEX "idx_tenant_is_active" ON "project"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_tenant_project_code" ON "project"("tenant_id", "project_code");

-- CreateIndex
CREATE INDEX "idx_tenant_planned_period_from" ON "project"("tenant_id", "planned_period_from");
