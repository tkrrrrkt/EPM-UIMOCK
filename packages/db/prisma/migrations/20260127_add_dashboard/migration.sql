-- Migration: Add Dashboard Tables with RLS
-- Feature: 経営ダッシュボード (reporting/dashboard)
-- Reference: .kiro/specs/reporting/dashboard/design.md

-- =============================================================================
-- Create Tables
-- =============================================================================

-- dashboards テーブル
CREATE TABLE dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    owner_type VARCHAR(20) NOT NULL, -- SYSTEM | USER
    owner_id UUID,
    global_filter_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ(6) DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ(6) DEFAULT now() NOT NULL,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    deleted_at TIMESTAMPTZ(6), -- 論理削除日時（NULL = 未削除）
    deleted_by VARCHAR(100)    -- 削除実行者
);

-- dashboard_widgets テーブル
CREATE TABLE dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    widget_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    layout JSONB NOT NULL,
    data_config JSONB NOT NULL,
    filter_config JSONB NOT NULL,
    display_config JSONB NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ(6) DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ(6) DEFAULT now() NOT NULL
);

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX idx_dashboards_tenant_id ON dashboards(tenant_id);
CREATE INDEX idx_dashboards_tenant_owner_type ON dashboards(tenant_id, owner_type);
CREATE INDEX idx_dashboards_tenant_deleted_at ON dashboards(tenant_id, deleted_at);
CREATE UNIQUE INDEX dashboards_tenant_id_uk ON dashboards(tenant_id, id);

CREATE INDEX idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);

-- =============================================================================
-- RLS Policies for dashboards
-- =============================================================================

-- Enable RLS
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards FORCE ROW LEVEL SECURITY;

-- Policy: SELECT
CREATE POLICY dashboards_tenant_isolation_select ON dashboards
    FOR SELECT
    USING (tenant_id::text = current_setting('app.tenant_id', true));

-- Policy: INSERT
CREATE POLICY dashboards_tenant_isolation_insert ON dashboards
    FOR INSERT
    WITH CHECK (tenant_id::text = current_setting('app.tenant_id', true));

-- Policy: UPDATE
CREATE POLICY dashboards_tenant_isolation_update ON dashboards
    FOR UPDATE
    USING (tenant_id::text = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id::text = current_setting('app.tenant_id', true));

-- Policy: DELETE
CREATE POLICY dashboards_tenant_isolation_delete ON dashboards
    FOR DELETE
    USING (tenant_id::text = current_setting('app.tenant_id', true));

-- =============================================================================
-- RLS Policies for dashboard_widgets
-- =============================================================================

-- Enable RLS (via dashboard foreign key)
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets FORCE ROW LEVEL SECURITY;

-- Policy: SELECT (join to dashboards for tenant check)
CREATE POLICY dashboard_widgets_tenant_isolation_select ON dashboard_widgets
    FOR SELECT
    USING (
        dashboard_id IN (
            SELECT id FROM dashboards
            WHERE tenant_id::text = current_setting('app.tenant_id', true)
        )
    );

-- Policy: INSERT
CREATE POLICY dashboard_widgets_tenant_isolation_insert ON dashboard_widgets
    FOR INSERT
    WITH CHECK (
        dashboard_id IN (
            SELECT id FROM dashboards
            WHERE tenant_id::text = current_setting('app.tenant_id', true)
        )
    );

-- Policy: UPDATE
CREATE POLICY dashboard_widgets_tenant_isolation_update ON dashboard_widgets
    FOR UPDATE
    USING (
        dashboard_id IN (
            SELECT id FROM dashboards
            WHERE tenant_id::text = current_setting('app.tenant_id', true)
        )
    )
    WITH CHECK (
        dashboard_id IN (
            SELECT id FROM dashboards
            WHERE tenant_id::text = current_setting('app.tenant_id', true)
        )
    );

-- Policy: DELETE
CREATE POLICY dashboard_widgets_tenant_isolation_delete ON dashboard_widgets
    FOR DELETE
    USING (
        dashboard_id IN (
            SELECT id FROM dashboards
            WHERE tenant_id::text = current_setting('app.tenant_id', true)
        )
    );

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE dashboards IS 'Dashboard definitions with RLS tenant isolation. Set app.tenant_id before queries.';
COMMENT ON TABLE dashboard_widgets IS 'Dashboard widgets with RLS via dashboard relation. Set app.tenant_id before queries.';
COMMENT ON COLUMN dashboards.owner_type IS 'SYSTEM = system template (cannot delete), USER = user-created dashboard';
COMMENT ON COLUMN dashboards.deleted_at IS 'Logical deletion timestamp (NULL = not deleted)';
COMMENT ON COLUMN dashboards.deleted_by IS 'User who performed the deletion';
