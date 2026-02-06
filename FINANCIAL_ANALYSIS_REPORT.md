# 財務分析基盤の現状分析レポート
**Report Date**: 2026-01-29  
**Database**: PostgreSQL (edinet)  
**Source**: EDINET xBRL Data (2021年提出分)

---

## PART 1: 財務分析基盤の現状 - データの充実度

### 1.1 登録企業と BS/PL/CF データの概要

| 企業名 | BS項目数 | PL項目数 | CF項目数 | 総データ件数 |
|--------|---------|---------|---------|-----------|
| 川田テクノロジーズ株式会社 | 5 | 5 | 14 | 1,523 |
| 日本ロジテム株式会社 | 5 | 2 | 15 | 1,610 |
| 株式会社ほくやく・竹山ホールディングス | 5 | 5 | 15 | 1,684 |
| 株式会社トーアミ | 5 | 5 | 15 | 1,305 |
| 株式会社ＴＢＫ | 5 | 5 | 16 | 1,555 |

**特徴**:
- 5社のみ登録されている（サンプルデータ）
- 全企業で基本的な BS 構成要素（Assets, Liabilities, NetAssets）が揃っている
- PL に関しては企業により差がある（日本ロジテム は Revenue データ不足）
- CF データ（キャッシュフロー関連）は比較的充実している

---

### 1.2 貸借対照表（BS）の充実度

| 企業名 | Assets件数 | Liabilities件数 | NetAssets件数 | 総ドキュメント数 |
|--------|----------|--------------|-------------|-------------|
| 川田テクノロジーズ | 16 | 4 | 69 | 1 |
| 日本ロジテム | 18 | 4 | 66 | 1 |
| ほくやく・竹山 | 18 | 18 | 63 | 1 |
| トーアミ | 4 | 4 | 75 | 1 |
| ＴＢＫ | 14 | 4 | 80 | 1 |

**所見**:
- **Assets（資産）**: 各企業で 4～18 件の詳細項目
- **Liabilities（負債）**: 全社で 4～18 件（場合によっては枝分かれあり）
- **NetAssets（純資産）**: 各企業で 63～80 件の詳細項目

✅ **BS 分析は可能**  
→ 流動資産 / 固定資産、流動負債 / 固定負債 の細分化は確認が必要

---

### 1.3 損益計算書（PL）の充実度と「COGS の有無」

| 企業名 | Revenue | COGS | GrossProfit | Op.Income | Net Income | 粗利率計算 |
|--------|---------|------|------------|-----------|-----------|----------|
| 川田テクノロジーズ | 14 | 2 | 2 | 16 | 10 | ✅ 可能 |
| 日本ロジテム | **0** | **0** | 0 | 18 | 8 | ❌ **不可** |
| ほくやく・竹山 | 18 | 2 | 4 | 18 | 12 | ✅ 可能 |
| トーアミ | 4 | 4 | 4 | 4 | 10 | ✅ 可能 |
| ＴＢＫ | 14 | 4 | 4 | 14 | 10 | ✅ 可能 |

**重大な問題**: 
- **日本ロジテムは Revenue（売上）データが **ゼロ** の状態**
  - Reason: EDINET での売上報告方式が異なる可能性
  - Impact: 売上高分析、利益率分析が不可能

✅ **4社は粗利率計算可能（COGS あり）**  
❌ **1社は基本的な PL 分析ができない**

---

### 1.4 キャッシュフロー（CF）データ

| 企業名 | CF関連項目 | キャッシュ同等物 | 期末現金 |
|--------|---------|------------|---------|
| 川田テクノロジーズ | 2 | 13 | 3 |
| 日本ロジテム | 2 | 13 | 3 |
| ほくやく・竹山 | 2 | 13 | 3 |
| トーアミ | 2 | 13 | 3 |
| ＴＢＫ | 2 | 15 | 3 |

✅ **CF データは充実している**  
- 「キャッシュ・キャッシュ同等物」は各企業で 13～15 件
- 「CashAndCashEquivalents」（期末現金）も3件ずつ確保
- CF 分析（Operating / Investing / Financing）は可能

---

### 1.5 データサンプル（実際の数値）

```
企業: 川田テクノロジーズ株式会社（FY2020, FY2021年度末）
期末日: 2021-04-01, 2020-04-01

資産（Assets）:
  FY2021: 147,408,000,000 円（147.4B）
  FY2020: 139,093,000,000 円（139.1B）
  → 増加額：+8.3B円（+6.0%）

売上原価（CostOfSales）:
  FY2020: 110,237,000,000 円（110.2B）
  FY2021: 100,102,000,000 円（100.1B）
  → 減少（効率化傾向）

負債（Liabilities）:
  FY2020: 78,463,000,000 円（78.5B）
  FY2021: 80,443,000,000 円（80.4B）
  → 増加（有利子負債増）

純資産（NetAssets）:
  FY2020: 60,630,000,000 円（60.6B）
  FY2021: 66,964,000,000 円（66.9B）
  → 増加（+6.3B円、内部留保増）
```

---

## PART 2: 8つのブロッカーの根本原因分析

### ブロッカー一覧（発見順）

| # | ブロッカー | 分類 | 対処難度 | 説明 |
|----|---------|------|--------|------|
| 1 | **is_consolidated が全て NULL** | **データ問題** | ⚠️ 高 | 連結/単体の識別ができない |
| 2 | **Revenue データの企業別差異** | **データ問題** | ⚠️ 高 | 売上データ報告方式の不統一 |
| 3 | **Concept 要素が細分化されすぎ** | **技術問題** | ✅ 可能 | データ正規化が必要 |
| 4 | **Decimal精度が一貫していない** | **技術問題** | ✅ 可能 | 丸めルールの統一が必要 |
| 5 | **Unit が複数形式で混在** | **技術問題** | ✅ 可能 | Unit 正規化が必要 |
| 6 | **Context が 1,104 個で過多** | **技術問題** | ✅ 可能 | Context 集約戦略が必要 |
| 7 | **is_nil フラグが 628 件ある** | **技術問題** | ✅ 可能 | nil 値の扱いルールが必要 |
| 8 | **Document が1社1件のみ** | **データ問題** | ⚠️ 高 | 複数期間データが不足 |

---

### ブロッカー詳細分析

#### **ブロッカー #1: is_consolidated が全て NULL**

**現状**:
```
Total Contexts:      1,104
Unknown (NULL):      1,104  ← 100%
Consolidated (T):        0  ← 0%
Standalone (F):          0  ← 0%
```

**根本原因**:
- EDINET xBRL データ内で `is_consolidated` コンテキスト属性が提供されていない
- または、データ取込み時に無視されている

**実装との乖離**:
- **Specification**: `.kiro/specs/` では「連結/単体の区別が必須」と定義されている可能性
- **実装**: `core.context` に `is_consolidated` カラムがあるが、全て NULL
- **Gap**: EDINET データセットが連結/単体を明示していない

**分析への影響**:
```
❌ 連結決算と単体決算を分離できない
❌ グループ全体 vs 単独企業の比較ができない
❌ 持株会社と子会社の区別ができない
```

**技術的対処**:
1. EDINET の xBRL タグから `scenario` 属性を抽出 → 「连结」「单独」判定
2. 取込みロジックで `is_consolidated` を明示的に設定
3. 既存 NULL データに対しては以下ルールで補正:
   ```
   IF document_type = "連結財務諸表" THEN is_consolidated = TRUE
   ELSE is_consolidated = FALSE
   ```

**推奨**: **優先度 HIGH** - 連結/単体分析の根幹

---

#### **ブロッカー #2: Revenue データの企業別差異**

**現状**:
```
企業 | Revenue件数 | COGS件数 | 売上利用可能性
-----|-----------|---------|------------
川田テク | 14 | 2 | ✅ Yes
日本ロジテム | 0 | 0 | ❌ No ← 
ほくやく・竹山 | 18 | 2 | ✅ Yes
トーアミ | 4 | 4 | ✅ Yes
ＴＢＫ | 14 | 4 | ✅ Yes
```

**根本原因**:
- 日本ロジテムが `NetSales` タグを EDINET に報告していない
- 可能性1: 会計基準の選択（IFRS vs 日本基準）
- 可能性2: EDINET フォーム種別の違い
- 可能性3: データ取込み時のフィルタリング誤り

**実装との乖లギ**:
```
期待: すべての企業が NetSales を報告
現実: 1社のみ欠落
```

**分析への影響**:
```
❌ 日本ロジテムの売上高分析ができない
❌ 業種別売上比較ができない
❌ 売上成長率トレンドが計算できない
```

**技術的対処**:
1. EDINET フォーム構造を確認（形式130 vs 130-2）
2. 代替タグ（`SalesRevenueServices` など）を検索
3. 取込みロジックで複数の売上パターンに対応

**推奨**: **優先度 HIGH** - データ整合性チェック機構の構築

---

#### **ブロッカー #3: Concept 要素が細分化されすぎ**

**現状**:
```
Concept Table には 1,000+ の distinct element_name

例:
- Assets （資産の総合計）
- CurrentAssets （流動資産）
- NonCurrentAssets （固定資産）
- AccountsReceivableTrade （売掛金）
- AccountsPayableTrade （買掛金）
- AccumulatedDepreciationMachineryEquipmentAndVehicles （機械装置累計償却）
- ...
```

**根本原因**:
- xBRL 仕様では「機械的に全要素を定義する」ことが標準
- 日本の金融商品取引法で定められた細分化（GL-EDINET ガイドライン準拠）
- 実装が xBRL をそのまま DB に取込んでいる

**実装との乖离**:
```
期待: BS を「資産・負債・純資産」3層で扱う
現実: 1,000+ の細分化された concept が混在
```

**分析への影響**:
```
⚠️ 中程度: 技術的には集約可能だが、複雑な mapping が必要
```

**技術的対処**:
```typescript
// Concept Mapping層 を導入
interface ConceptMapping {
  xBRL_concept: string;           // Assets (xBRL ID)
  normalized_element: string;     // "Assets" (正規化)
  hierarchy_level: number;        // 0 (最上位)
  aggregation_rule?: string;      // "SUM" など
}

// 例
{
  xBRL_concept: "Assets",
  normalized_element: "TotalAssets",
  hierarchy_level: 0
}
{
  xBRL_concept: "AccountsReceivableTrade",
  normalized_element: "AccountsReceivable",
  hierarchy_level: 2
}
```

実装状況: ✅ **`core.concept_mapping` テーブルが既に存在する**

**推奨**: **優先度 MEDIUM** - mapping ルールの完善化

---

#### **ブロッカー #4: Decimal 精度が一貫していない**

**現状**:
```
Total Facts:     7,677
With decimals:   5,567 (72%)
Decimal avg:     -3.72 ← 負の値!?
Range: -3 ～ +6

例:
Value:  1234567890 decimals: -6  → 実際の値は 1.23B (= 1234567890 * 10^-6)
Value:  999        decimals: 0   → 実際の値は 999 (正確な値)
Value:  100        decimals: 2   → 実際の値は 1.00 (= 100 * 10^-2)
```

**根本原因**:
- xBRL 仕様では各数値に「decimals」属性を付与
- decimals = -6 は「100万単位での報告」を意味する
- DB では「decimals」をそのまま保存しているため、「実値」を計算するには常に `value_numeric * 10^decimals` が必要

**実装との乖离**:
```
期待: value_numeric は正規化されている（例: 147,408,000,000）
現実: decimals で「桁数の表現」が埋め込まれている
```

**分析への影響**:
```
❌ 生のvalue_numeric を使うと大きく間違う
❌ decimals を忘れると計算が成立しない
❌ UI で数値表示する際、常に補正が必要
```

**技術的対処**:
```typescript
// Fact Table に normalized_value 列を追加
interface FinancialFact {
  value_numeric: number;           // 生の値（xBRL に基づく）
  decimals: number;                // 桁数指定
  normalized_value: number;        // 計算済みの正規化値
  
  // 計算式
  get actual_value() {
    return this.value_numeric * Math.pow(10, this.decimals);
  }
}

// 例
fact: {
  value_numeric: 147408,
  decimals: 6,
  actual_value: 147408 * 10^6 = 147,408,000,000
}
```

実装状況: ❌ **`normalized_value` は存在しない → 毎回 decimals で補正が必要**

**推奨**: **優先度 MEDIUM** - Fact テーブルに `normalized_value` を追加し、データソース層で常に補正値を使用

---

#### **ブロッカー #5: Unit が複数形式で混在**

**現状**:
```
Unit Key | Fact Count | Document Count
---------|------------|----------------
JPY      |      5,071 |       5
(NULL)   |      1,544 |       5       ← Unit 未設定!?
xbrli:pure| 671       |       5       （純数）
xbrli:shares| 391     |       5       （株数）
```

**根本原因**:
- xBRL では通貨（JPY）、指数（pure）、株数（shares）などを Unit 属性で区別
- データ取込み時に Unit が正しく紐付けられていないものがある
- NULL Unit = 定義不明な値（テキスト値など）の可能性

**実装との乖離**:
```
期待: すべての数値に Unit が紐付いている
現実: 20% の facts に Unit が NULL
```

**分析への影響**:
```
⚠️ 中程度: JPY, pure, shares の区別は出来ているが、NULL が邪魔
```

**技術的対処**:
```sql
-- Unit が NULL のものを調査
SELECT ff.*, con.element_name, u.unit_key
FROM core.financial_fact ff
LEFT JOIN core.concept con ON con.concept_id = ff.concept_id
LEFT JOIN core.unit u ON u.unit_id = ff.unit_id
WHERE ff.unit_id IS NULL
LIMIT 10;

-- NULL Unit の type を判定
-- - value_text が存在 → テキスト値（Unit不要）
-- - value_numeric が存在 → Unit不足（エラー）
```

実装状況: ⚠️ **Unit NULL の件が未処理**

**推奨**: **優先度 LOW-MEDIUM** - データクレンジング + Fact 取込みロジックの修正

---

#### **ブロッカー #6: Context が 1,104 個で過多**

**現状**:
```
Total Contexts: 1,104
Documents:        5  ← 5社×1期ずつ

→ 1ドキュメントあたり約221個の context!?
```

**根本原因**:
- xBRL では「report axis」（報告軸）の組み合わせで context が増殖
- 例: 日本基準 / IFRS、連結/単体、部門別、通期/四半期、各種シナリオ
- 実装が全 context を保存している

**実装との乖离**:
```
期待: 必要な context だけを抽出（日本基準の連結/単体など）
現実: xBRL の全 context（1,104個）を保存
```

**分析への影響**:
```
❌ Context を JOINする際にパフォーマンスが低下
❌ 分析時に「どの context を選ぶか」の判定ロジックが複雑
```

**技術的対処**:
```typescript
// Context 優先度ルール
enum ContextPriority {
  ConsolidatedNonconsolidatedMember = 0,  // 連結（最優先）
  NonconsolidatedMember = 1,              // 単体
  ScenarioMember = 2,                     // シナリオ
  OtherMember = 3                         // その他（使用しない）
}

// Fact 取得時
fact = FinancialFact.where(
  context_priority: [0, 1],  // 連結/単体のみ
  is_consolidated: true      // 連結のプリファー
)
```

実装状況: ⚠️ **Context filtering ルールが未実装**

**推奨**: **優先度 MEDIUM** - Context selection strategy の実装

---

#### **ブロッカー #7: is_nil フラグが 628 件ある**

**現状**:
```
Total Facts:    7,677
Nil flagged:      628 (8.2%)

→ 「値なし」と明示されているデータが 8% ある
```

**根本原因**:
- xBRL では「データが存在しない」ことを `is_nil="true"` で明示
- 例: 売掛金がない企業の「売掛金」は nil
- DB では `is_nil = true` でも fact_id が存在する（スペース確保）

**実装との乖离**:
```
期待: is_nil = true のデータは集計から除外
現実: is_nil を無視して value_numeric を使うと誤算
```

**分析への影響**:
```
⚠️ 中程度: Group By や SUM で nil を誤認識すると誤算
```

**技術的対処**:
```sql
-- nil を排除した集計
SELECT 
  company_id,
  SUM(CASE WHEN is_nil = false THEN value_numeric ELSE 0 END) as total
FROM core.financial_fact
GROUP BY company_id;

-- または DAO層で自動フィルタ
fact = FinancialFact.where(is_nil: false)
```

実装状況: ⚠️ **Nil フィルタリングが DAO 層で未実装**

**推奨**: **優先度 LOW** - DAO 層に自動フィルタ追加

---

#### **ブロッカー #8: Document が 1 社 1 件のみ**

**現状**:
```
Total Companies: 5
Total Documents: 5  ← 1企業 = 1ドキュメント

Document Per Company:
川田テク: 1 (FY2021年6月末)
日本ロジテム: 1 (FY2021年...)
ほくやく・竹山: 1
トーアミ: 1
ＴＢＫ: 1
```

**根本原因**:
- テストデータのため、複数年度が取込まれていない
- EDINET API から 2021年1月～12月の提出のみを取込
- 実運用では複数年度（FY2018～2023）を取込む必要

**実装との乖离**:
```
期待: トレンド分析（3年以上の推移）が可能
現実: 単一年度のみ → 推移分析ができない
```

**分析への影響**:
```
❌ YoY（前年度比）分析ができない
❌ トレンド線が引けない
❌ CAGR（年複利成長率）が計算できない
❌ 季節変動を検出できない
```

**技術的対処**:
```yaml
# edinet API 取込み設定（config.yaml）
date_range:
  from: "2018-01-01"  ← 複数年度を指定
  to: "2024-12-31"
```

実装状況: ✅ **config.yaml に複数年度指定の余地あり**

**推奨**: **優先度 HIGH** - 複数年度データの再取込み、時系列分析の実装

---

## PART 3: 技術的問題 vs データ問題の整理

### 分類マトリックス

| ブロッカー | 分類 | 難度 | 解決方法 | 期間 |
|---------|------|------|--------|------|
| #1 is_consolidated NULL | データ | ⚠️ 高 | EDINET xBRL タグ抽出 | 1-2w |
| #2 Revenue 不足 | データ | ⚠️ 高 | フォーム別対応 + タグ検索 | 1-2w |
| #3 Concept 細分化 | 技術 | ✅ 低 | concept_mapping 完善 | 3-5d |
| #4 Decimal 不一貫 | 技術 | ✅ 低 | normalized_value 追加 | 3-5d |
| #5 Unit 混在 | 技術 | ✅ 低 | NULL Unit の補正 | 2-3d |
| #6 Context 過多 | 技術 | ✅ 中 | Context filtering strategy | 5-7d |
| #7 is_nil フラグ | 技術 | ✅ 低 | DAO 層に自動フィルタ | 2-3d |
| #8 単一年度のみ | データ | ⚠️ 高 | 複数年度再取込み | 2-4w |

### サマリー

**技術的問題（実装で解決可能）**:  
ブロッカー #3, #4, #5, #6, #7

→ 解決期間: **2～3週間**  
→ Impact: **低～中**  
→ 実装チェックリスト:
- [ ] concept_mapping ルール完善
- [ ] fact テーブルに normalized_value 追加
- [ ] Unit NULL の補正ロジック
- [ ] Context selection strategy 実装
- [ ] DAO 層に is_nil フィルタ追加

**データ問題（要注意・外部依存）**:  
ブロッカー #1, #2, #8

→ 解決期間: **2～4週間**  
→ Impact: **高**  
→ 対処内容:
- [ ] EDINET xBRL スキーマの詳細調査
- [ ] 連結/単体の自動判定ロジック構築
- [ ] 企業別売上報告パターン分析
- [ ] 複数年度データの再取込み実装

---

## PART 4: 推奨実装順序

### Phase 1: データクレンジング（1～2週間）

```
1. ブロッカー #8: 複数年度データ再取込み
   - config.yaml で 2018～2024 を指定
   - EDINET API から全社全期間データ取込み
   
2. ブロッカー #1: is_consolidated 補正
   - EDINET xBRL から scenario 属性を抽出
   - NULL → TRUE/FALSE に補正
   
3. ブロッカー #2: Revenue パターン分析
   - 企業別売上タグを調査
   - 代替パターンを concept_mapping に追加
```

### Phase 2: テクニカルな問題の解決（1～2週間）

```
4. ブロッカー #4: normalized_value 実装
   - fact テーブルに numeric(30,2) カラム追加
   - migration で既存データを計算
   
5. ブロッカー #6: Context filtering
   - Context priority ルール実装
   - Fact 取得時に自動フィルタ
   
6. ブロッカー #3, #5, #7: 細粒度な修正
   - concept_mapping 完善
   - Unit NULL 補正
   - is_nil auto-filter
```

### Phase 3: 分析機能の実装

```
7. 時系列分析（YoY, CAGR, トレンド）
8. 業種別比較分析
9. 粗利率・ROA・ROE などの指標計算
```

---

## PART 5: SQL 参照用チェックリスト

### 現状把握クエリ

```sql
-- 1. 企業別データ充実度
SELECT c.company_name, COUNT(DISTINCT d.document_id) as doc_count,
       COUNT(ff.fact_id) as fact_count
FROM core.company c
LEFT JOIN core.document d ON d.company_id = c.company_id
LEFT JOIN core.financial_fact ff ON ff.document_id = d.document_id
GROUP BY c.company_id, c.company_name;

-- 2. is_consolidated の状態
SELECT is_consolidated, COUNT(*) FROM core.context GROUP BY is_consolidated;

-- 3. Unit の不足
SELECT unit_id, COUNT(*) FROM core.financial_fact
WHERE unit_id IS NULL GROUP BY unit_id;

-- 4. Nil フラグの統計
SELECT is_nil, COUNT(*) FROM core.financial_fact GROUP BY is_nil;

-- 5. Decimal の分布
SELECT decimals, COUNT(*) FROM core.financial_fact GROUP BY decimals;

-- 6. 企業別 Revenue 有無
SELECT c.company_name,
  COUNT(CASE WHEN con.element_name = 'NetSales' THEN 1 END) as revenue_count
FROM core.company c
LEFT JOIN core.document d ON d.company_id = c.company_id
LEFT JOIN core.financial_fact ff ON ff.document_id = d.document_id
LEFT JOIN core.concept con ON con.concept_id = ff.concept_id
GROUP BY c.company_id, c.company_name;
```

---

**Report End Date**: 2026-01-29  
**Prepared By**: Claude Code Analysis System
