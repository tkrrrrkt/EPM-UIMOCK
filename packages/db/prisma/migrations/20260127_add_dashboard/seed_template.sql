-- Seed: Dashboard Template "経営サマリー"
-- Feature: 経営ダッシュボード (reporting/dashboard)
-- Reference: .kiro/specs/reporting/dashboard/design.md
--
-- このスクリプトはテナント作成時に実行される初期テンプレートを投入します。
-- 実行前に app.tenant_id を設定してください。
--
-- 使用方法:
--   SET app.tenant_id = 'your-tenant-id';
--   \i seed_template.sql
--

-- 経営サマリーテンプレート（システムテンプレート）
INSERT INTO dashboards (
    id,
    tenant_id,
    name,
    description,
    owner_type,
    owner_id,
    global_filter_config,
    is_active,
    sort_order,
    created_by
) VALUES (
    gen_random_uuid(),
    current_setting('app.tenant_id', true)::uuid,
    '経営サマリー',
    '主要経営指標のサマリーダッシュボード',
    'SYSTEM',
    NULL,
    '{
        "displayGranularity": "MONTHLY"
    }'::jsonb,
    true,
    0,
    'system'
)
RETURNING id;

-- 以下のウィジェットは上記INSERTで返されるdashboard_idを使用
-- 実際の運用では、アプリケーション層でシードを実行するか、
-- PL/pgSQL関数で一括投入する

-- 例: ウィジェット投入（dashboard_id を取得後に実行）
/*
WITH dashboard AS (
    SELECT id FROM dashboards
    WHERE tenant_id::text = current_setting('app.tenant_id', true)
      AND name = '経営サマリー'
      AND owner_type = 'SYSTEM'
    LIMIT 1
)
INSERT INTO dashboard_widgets (dashboard_id, widget_type, title, layout, data_config, filter_config, display_config, sort_order)
SELECT
    d.id,
    'KPI_CARD',
    '売上高',
    '{"row": 0, "col": 0, "sizeX": 1, "sizeY": 1}'::jsonb,
    '{"sources": [{"type": "FACT", "refId": "sales", "label": "売上高"}]}'::jsonb,
    '{"useGlobal": true}'::jsonb,
    '{"showSparkline": true, "showCompare": true}'::jsonb,
    1
FROM dashboard d
UNION ALL
SELECT
    d.id,
    'KPI_CARD',
    '営業利益',
    '{"row": 0, "col": 1, "sizeX": 1, "sizeY": 1}'::jsonb,
    '{"sources": [{"type": "FACT", "refId": "operating_income", "label": "営業利益"}]}'::jsonb,
    '{"useGlobal": true}'::jsonb,
    '{"showSparkline": true, "showCompare": true}'::jsonb,
    2
FROM dashboard d
UNION ALL
SELECT
    d.id,
    'KPI_CARD',
    '営業利益率',
    '{"row": 0, "col": 2, "sizeX": 1, "sizeY": 1}'::jsonb,
    '{"sources": [{"type": "METRIC", "refId": "operating_margin", "label": "営業利益率"}]}'::jsonb,
    '{"useGlobal": true}'::jsonb,
    '{"showSparkline": true, "showCompare": true}'::jsonb,
    3
FROM dashboard d
UNION ALL
SELECT
    d.id,
    'KPI_CARD',
    'ROE',
    '{"row": 0, "col": 3, "sizeX": 1, "sizeY": 1}'::jsonb,
    '{"sources": [{"type": "METRIC", "refId": "roe", "label": "ROE"}]}'::jsonb,
    '{"useGlobal": true}'::jsonb,
    '{"showSparkline": true, "showCompare": true}'::jsonb,
    4
FROM dashboard d
UNION ALL
SELECT
    d.id,
    'LINE_CHART',
    '売上推移',
    '{"row": 1, "col": 0, "sizeX": 2, "sizeY": 2}'::jsonb,
    '{"sources": [{"type": "FACT", "refId": "sales", "label": "売上高"}]}'::jsonb,
    '{"useGlobal": true}'::jsonb,
    '{"showLegend": true, "showTooltip": true}'::jsonb,
    5
FROM dashboard d
UNION ALL
SELECT
    d.id,
    'BAR_CHART',
    '部門別売上',
    '{"row": 1, "col": 2, "sizeX": 2, "sizeY": 2}'::jsonb,
    '{"sources": [{"type": "FACT", "refId": "sales", "label": "売上高"}]}'::jsonb,
    '{"useGlobal": true}'::jsonb,
    '{"orientation": "horizontal", "showLegend": true, "showDataLabels": true}'::jsonb,
    6
FROM dashboard d
UNION ALL
SELECT
    d.id,
    'TABLE',
    '主要指標',
    '{"row": 3, "col": 0, "sizeX": 4, "sizeY": 2}'::jsonb,
    '{"sources": [
        {"type": "FACT", "refId": "sales", "label": "売上高"},
        {"type": "FACT", "refId": "operating_income", "label": "営業利益"},
        {"type": "METRIC", "refId": "operating_margin", "label": "営業利益率"},
        {"type": "METRIC", "refId": "roe", "label": "ROE"}
    ]}'::jsonb,
    '{"useGlobal": true}'::jsonb,
    '{"showCompareColumns": true}'::jsonb,
    7
FROM dashboard d;
*/
