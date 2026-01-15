-- RLS Policy for Project Master
-- FR-LIST-08: Row Level Security でテナント分離を強制
--
-- 使用方法:
-- 1. 接続時に SET app.tenant_id = 'tenant-xxx' を実行
-- 2. RLSが自動的にtenant_id条件を適用

-- Enable RLS on project table
ALTER TABLE project ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner as well (important for superuser access)
ALTER TABLE project FORCE ROW LEVEL SECURITY;

-- Policy: SELECT - 自テナントのデータのみ参照可能
CREATE POLICY project_tenant_isolation_select ON project
    FOR SELECT
    USING (tenant_id = current_setting('app.tenant_id', true));

-- Policy: INSERT - 自テナントのデータのみ挿入可能
CREATE POLICY project_tenant_isolation_insert ON project
    FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

-- Policy: UPDATE - 自テナントのデータのみ更新可能
CREATE POLICY project_tenant_isolation_update ON project
    FOR UPDATE
    USING (tenant_id = current_setting('app.tenant_id', true))
    WITH CHECK (tenant_id = current_setting('app.tenant_id', true));

-- Policy: DELETE - 自テナントのデータのみ削除可能
CREATE POLICY project_tenant_isolation_delete ON project
    FOR DELETE
    USING (tenant_id = current_setting('app.tenant_id', true));

-- Comment for documentation
COMMENT ON TABLE project IS 'Project Master with RLS tenant isolation. Set app.tenant_id before queries.';
