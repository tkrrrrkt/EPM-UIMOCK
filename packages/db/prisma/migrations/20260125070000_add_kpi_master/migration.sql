-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "company_code" VARCHAR(50) NOT NULL,
    "company_name" VARCHAR(200) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employee_code" VARCHAR(50) NOT NULL,
    "employee_name" VARCHAR(200) NOT NULL,
    "control_department_stable_ids" VARCHAR(50)[] NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "subject_code" VARCHAR(50) NOT NULL,
    "subject_name" VARCHAR(200) NOT NULL,
    "kpi_managed" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "metric_code" VARCHAR(50) NOT NULL,
    "metric_name" VARCHAR(200) NOT NULL,
    "kpi_managed" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_master_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "event_code" VARCHAR(50) NOT NULL,
    "event_name" VARCHAR(200) NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "kpi_master_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_master_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "kpi_event_id" UUID NOT NULL,
    "parent_kpi_item_id" UUID,
    "kpi_code" VARCHAR(50) NOT NULL,
    "kpi_name" VARCHAR(200) NOT NULL,
    "kpi_type" VARCHAR(20) NOT NULL,
    "hierarchy_level" INTEGER NOT NULL,
    "ref_subject_id" UUID,
    "ref_kpi_definition_id" UUID,
    "ref_metric_id" UUID,
    "department_stable_id" VARCHAR(50),
    "owner_employee_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "kpi_master_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_definitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "kpi_code" VARCHAR(50) NOT NULL,
    "kpi_name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "unit" VARCHAR(30),
    "aggregation_method" VARCHAR(20) NOT NULL,
    "direction" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "kpi_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_fact_amounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "kpi_event_id" UUID NOT NULL,
    "kpi_definition_id" UUID NOT NULL,
    "period_code" VARCHAR(32) NOT NULL,
    "period_start_date" DATE,
    "period_end_date" DATE,
    "target_value" DECIMAL,
    "actual_value" DECIMAL,
    "department_stable_id" VARCHAR(50),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "kpi_fact_amounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_target_values" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "kpi_master_item_id" UUID NOT NULL,
    "period_code" VARCHAR(32) NOT NULL,
    "target_value" DECIMAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "kpi_target_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "plan_code" VARCHAR(50) NOT NULL,
    "plan_name" VARCHAR(200) NOT NULL,
    "subject_id" UUID,
    "kpi_master_item_id" UUID,
    "owner_department_stable_id" VARCHAR(50),
    "owner_employee_id" UUID,
    "due_date" DATE,
    "status" VARCHAR(20) NOT NULL,
    "progress_rate" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "action_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_tenant_id_uk" ON "companies"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tenant_id_company_code_key" ON "companies"("tenant_id", "company_code");

-- CreateIndex
CREATE INDEX "companies_tenant_id_idx" ON "companies"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_id_key" ON "employees"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_employee_code_key" ON "employees"("tenant_id", "employee_code");

-- CreateIndex
CREATE INDEX "employees_tenant_id_idx" ON "employees"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_tenant_id_id_key" ON "subjects"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_tenant_id_subject_code_key" ON "subjects"("tenant_id", "subject_code");

-- CreateIndex
CREATE INDEX "subjects_tenant_id_idx" ON "subjects"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_tenant_id_id_key" ON "metrics"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_tenant_id_metric_code_key" ON "metrics"("tenant_id", "metric_code");

-- CreateIndex
CREATE INDEX "metrics_tenant_id_idx" ON "metrics"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_master_events_tenant_id_uk" ON "kpi_master_events"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_master_events_tenant_code_uk" ON "kpi_master_events"("tenant_id", "company_id", "event_code");

-- CreateIndex
CREATE INDEX "kpi_master_events_tenant_id_company_id_idx" ON "kpi_master_events"("tenant_id", "company_id");

-- CreateIndex
CREATE INDEX "kpi_master_events_tenant_id_fiscal_year_idx" ON "kpi_master_events"("tenant_id", "fiscal_year");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_master_items_tenant_id_uk" ON "kpi_master_items"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_master_items_event_code_uk" ON "kpi_master_items"("tenant_id", "kpi_event_id", "kpi_code");

-- CreateIndex
CREATE INDEX "kpi_master_items_tenant_id_kpi_event_id_idx" ON "kpi_master_items"("tenant_id", "kpi_event_id");

-- CreateIndex
CREATE INDEX "kpi_master_items_tenant_id_parent_kpi_item_id_idx" ON "kpi_master_items"("tenant_id", "parent_kpi_item_id");

-- CreateIndex
CREATE INDEX "kpi_master_items_tenant_id_department_stable_id_idx" ON "kpi_master_items"("tenant_id", "department_stable_id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_definitions_tenant_id_uk" ON "kpi_definitions"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_definitions_company_code_uk" ON "kpi_definitions"("tenant_id", "company_id", "kpi_code");

-- CreateIndex
CREATE INDEX "kpi_definitions_tenant_id_company_id_idx" ON "kpi_definitions"("tenant_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_fact_amounts_uk" ON "kpi_fact_amounts"("tenant_id", "kpi_event_id", "kpi_definition_id", "period_code", "department_stable_id");

-- CreateIndex
CREATE INDEX "kpi_fact_amounts_tenant_id_kpi_event_id_kpi_definition_i_idx" ON "kpi_fact_amounts"("tenant_id", "kpi_event_id", "kpi_definition_id");

-- CreateIndex
CREATE INDEX "kpi_fact_amounts_tenant_id_department_stable_id_idx" ON "kpi_fact_amounts"("tenant_id", "department_stable_id");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_target_values_uk" ON "kpi_target_values"("tenant_id", "kpi_master_item_id", "period_code");

-- CreateIndex
CREATE INDEX "kpi_target_values_tenant_id_kpi_master_item_id_idx" ON "kpi_target_values"("tenant_id", "kpi_master_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "action_plans_tenant_id_plan_code_key" ON "action_plans"("tenant_id", "plan_code");

-- CreateIndex
CREATE INDEX "action_plans_tenant_id_kpi_master_item_id_idx" ON "action_plans"("tenant_id", "kpi_master_item_id");

-- AddForeignKey
ALTER TABLE "kpi_master_events" ADD CONSTRAINT "kpi_master_events_tenant_id_company_id_fkey" FOREIGN KEY ("tenant_id", "company_id") REFERENCES "companies"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_master_items" ADD CONSTRAINT "kpi_master_items_tenant_id_kpi_event_id_fkey" FOREIGN KEY ("tenant_id", "kpi_event_id") REFERENCES "kpi_master_events"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_master_items" ADD CONSTRAINT "kpi_master_items_tenant_id_parent_kpi_item_id_fkey" FOREIGN KEY ("tenant_id", "parent_kpi_item_id") REFERENCES "kpi_master_items"("tenant_id", "id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kpi_master_items" ADD CONSTRAINT "kpi_master_items_tenant_id_ref_subject_id_fkey" FOREIGN KEY ("tenant_id", "ref_subject_id") REFERENCES "subjects"("tenant_id", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_master_items" ADD CONSTRAINT "kpi_master_items_tenant_id_ref_kpi_definition_id_fkey" FOREIGN KEY ("tenant_id", "ref_kpi_definition_id") REFERENCES "kpi_definitions"("tenant_id", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_master_items" ADD CONSTRAINT "kpi_master_items_tenant_id_ref_metric_id_fkey" FOREIGN KEY ("tenant_id", "ref_metric_id") REFERENCES "metrics"("tenant_id", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_master_items" ADD CONSTRAINT "kpi_master_items_tenant_id_owner_employee_id_fkey" FOREIGN KEY ("tenant_id", "owner_employee_id") REFERENCES "employees"("tenant_id", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_tenant_id_company_id_fkey" FOREIGN KEY ("tenant_id", "company_id") REFERENCES "companies"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_fact_amounts" ADD CONSTRAINT "kpi_fact_amounts_tenant_id_company_id_fkey" FOREIGN KEY ("tenant_id", "company_id") REFERENCES "companies"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_fact_amounts" ADD CONSTRAINT "kpi_fact_amounts_tenant_id_kpi_event_id_fkey" FOREIGN KEY ("tenant_id", "kpi_event_id") REFERENCES "kpi_master_events"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_fact_amounts" ADD CONSTRAINT "kpi_fact_amounts_tenant_id_kpi_definition_id_fkey" FOREIGN KEY ("tenant_id", "kpi_definition_id") REFERENCES "kpi_definitions"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_target_values" ADD CONSTRAINT "kpi_target_values_tenant_id_kpi_master_item_id_fkey" FOREIGN KEY ("tenant_id", "kpi_master_item_id") REFERENCES "kpi_master_items"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_tenant_id_kpi_master_item_id_fkey" FOREIGN KEY ("tenant_id", "kpi_master_item_id") REFERENCES "kpi_master_items"("tenant_id", "id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- CHECK Constraints (Prisma 5.x limitation: must be added via raw SQL)
-- ============================================================================

-- kpi_master_events.status CHECK
ALTER TABLE "kpi_master_events" ADD CONSTRAINT "kpi_master_events_status_check"
CHECK (status IN ('DRAFT', 'CONFIRMED'));

-- kpi_master_items.kpi_type CHECK
ALTER TABLE "kpi_master_items" ADD CONSTRAINT "kpi_master_items_kpi_type_check"
CHECK (kpi_type IN ('FINANCIAL', 'NON_FINANCIAL', 'METRIC'));

-- kpi_master_items.hierarchy_level CHECK
ALTER TABLE "kpi_master_items" ADD CONSTRAINT "kpi_master_items_hierarchy_level_check"
CHECK (hierarchy_level IN (1, 2));

-- kpi_master_items.kpi_type別参照ID排他制約
ALTER TABLE "kpi_master_items" ADD CONSTRAINT "kpi_master_items_ref_exclusivity_check"
CHECK (
  (kpi_type = 'FINANCIAL' AND ref_subject_id IS NOT NULL AND ref_kpi_definition_id IS NULL AND ref_metric_id IS NULL) OR
  (kpi_type = 'NON_FINANCIAL' AND ref_subject_id IS NULL AND ref_kpi_definition_id IS NOT NULL AND ref_metric_id IS NULL) OR
  (kpi_type = 'METRIC' AND ref_subject_id IS NULL AND ref_kpi_definition_id IS NULL AND ref_metric_id IS NOT NULL)
);

-- kpi_definitions.aggregation_method CHECK
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_aggregation_method_check"
CHECK (aggregation_method IN ('SUM', 'EOP', 'AVG', 'MAX', 'MIN'));

-- kpi_definitions.direction CHECK
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_direction_check"
CHECK (direction IS NULL OR direction IN ('higher_is_better', 'lower_is_better'));

-- kpi_fact_amounts.period_start_date <= period_end_date CHECK
ALTER TABLE "kpi_fact_amounts" ADD CONSTRAINT "kpi_fact_amounts_period_date_check"
CHECK (period_start_date IS NULL OR period_end_date IS NULL OR period_start_date <= period_end_date);

-- action_plans.subject_id and kpi_master_item_id exclusivity CHECK
ALTER TABLE "action_plans" ADD CONSTRAINT "action_plans_ref_exclusivity_check"
CHECK (subject_id IS NOT NULL OR kpi_master_item_id IS NOT NULL);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all KPI master tables
ALTER TABLE "kpi_master_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kpi_master_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kpi_definitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kpi_fact_amounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "kpi_target_values" ENABLE ROW LEVEL SECURITY;

-- kpi_master_events RLS Policy
CREATE POLICY tenant_isolation ON "kpi_master_events"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- kpi_master_items RLS Policy
CREATE POLICY tenant_isolation ON "kpi_master_items"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- kpi_definitions RLS Policy
CREATE POLICY tenant_isolation ON "kpi_definitions"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- kpi_fact_amounts RLS Policy
CREATE POLICY tenant_isolation ON "kpi_fact_amounts"
  USING (tenant_id::text = current_setting('app.tenant_id', true));

-- kpi_target_values RLS Policy
CREATE POLICY tenant_isolation ON "kpi_target_values"
  USING (tenant_id::text = current_setting('app.tenant_id', true));
