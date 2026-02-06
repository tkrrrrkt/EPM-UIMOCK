# 財務分析基盤 - 分析レポート INDEX

**作成日**: 2026-01-29  
**対象システム**: EPM-SDD Trial (epm-sdd-trial)  
**分析対象**: PostgreSQL edinet データベース  
**テスト企業**: 5社（川田テク、ロジテム、ほくやく・竹山、トーアミ、ＴＢＫ）  
**データ規模**: 7,677 facts across 1,104 contexts

---

## 📋 レポートナビゲーション

### 1. **FINANCIAL_ANALYSIS_REPORT.md** (詳細分析版)
長さ: 20KB | 詳細度: ⭐⭐⭐⭐⭐

**内容**:
- **PART 1**: 財務分析基盤の現状（BS/PL/CF の充実度）
- **PART 2**: 8つのブロッカーの根本原因分析（詳細な根拠付き）
- **PART 3**: 技術的問題 vs データ問題の分類
- **PART 4**: 推奨実装順序（Phase別ガイドライン）
- **PART 5**: SQL チェックリスト（実行用クエリ集）

**対象読者**: 技術者、プロダクトマネージャー

**読み時間**: 30～40分

**推奨アクション**:
```
1. PART 1 で現状把握 (5分)
2. PART 2 で各ブロッカー理解 (20分)
3. PART 3 で優先度判断 (5分)
4. PART 4 で実装計画策定 (10分)
```

---

### 2. **BLOCKER_SUMMARY.md** (視覚的要約版)
長さ: 10KB | 詳細度: ⭐⭐⭐

**内容**:
- **Section 1**: ブロッカー分類マトリックス
- **Section 2**: データ充実度スコアカード
- **Section 3**: 各ブロッカーの影響スコープ（図解）
- **Section 4**: 対処の優先順位フロー
- **Section 5**: 財務分析開始条件チェックリスト
- **Section 6**: リスク評価マトリックス

**対象読者**: マネージャー、QA、ステークホルダー

**読み時間**: 10～15分

**推奨アクション**:
```
1. Section 2 で全体像確認 (2分)
2. Section 3 で重要度判定 (5分)
3. Section 4 で実装スケジュール作成 (5分)
```

---

## 🎯 ブロッカー一覧（クイックリファレンス）

| # | ブロッカー | 分類 | 難度 | 推奨優先度 | リンク |
|---|---------|------|------|----------|--------|
| 1 | `is_consolidated` が全て NULL | データ | 高 | 🔴 HIGH | [詳細](#blocker-1) |
| 2 | Revenue データの企業別差異 | データ | 高 | 🔴 HIGH | [詳細](#blocker-2) |
| 3 | Concept が 1,000+ 項目 | 技術 | 低 | 🟡 MED | [詳細](#blocker-3) |
| 4 | Decimal 精度が混在 | 技術 | 低 | 🟡 MED | [詳細](#blocker-4) |
| 5 | Unit が NULL (20%) | 技術 | 低 | 🟢 LOW | [詳細](#blocker-5) |
| 6 | Context が 1,104個 | 技術 | 中 | 🟡 MED | [詳細](#blocker-6) |
| 7 | is_nil フラグ (628件) | 技術 | 低 | 🟢 LOW | [詳細](#blocker-7) |
| 8 | Document が 1社1件のみ | データ | 高 | 🔴 HIGH | [詳細](#blocker-8) |

---

## 📊 ビューアガイド

### ユースケース別おすすめ読み方

#### 📌 **ケース A: エグゼクティブサマリーが必要**
```
読む順序:
1. BLOCKER_SUMMARY.md - Section 1 (分類マトリックス)
2. BLOCKER_SUMMARY.md - Section 6 (リスク評価)
3. FINANCIAL_ANALYSIS_REPORT.md - PART 3 (分類マトリックス)

時間: 10分
出力: ブロッカーの全体像・リスク順位表
```

#### 📌 **ケース B: 実装スケジュール作成が必要**
```
読む順序:
1. BLOCKER_SUMMARY.md - Section 4 (優先順位フロー)
2. FINANCIAL_ANALYSIS_REPORT.md - PART 4 (推奨実装順序)
3. FINANCIAL_ANALYSIS_REPORT.md - PART 3 (難度・期間)

時間: 15分
出力: 4～6週間の実装タイムライン
```

#### 📌 **ケース C: 各ブロッカーの詳細理解が必要**
```
読む順序:
1. BLOCKER_SUMMARY.md - Section 3 (影響スコープ図解)
2. FINANCIAL_ANALYSIS_REPORT.md - PART 2 (詳細分析)

時間: 30分
出力: 各ブロッカーの root cause・技術的対処
```

#### 📌 **ケース D: 現在何が分析できるか確認したい**
```
読む順序:
1. BLOCKER_SUMMARY.md - Section 5 (分析開始条件)
2. FINANCIAL_ANALYSIS_REPORT.md - PART 1 (データ充実度)

時間: 10分
出力: 実行可能な分析リスト
```

#### 📌 **ケース E: SQL で状況を確認したい**
```
読む順序:
1. FINANCIAL_ANALYSIS_REPORT.md - PART 5 (SQL チェックリスト)

時間: 5分 (実行は別途 5～10分)
出力: 現状データの可視化
```

---

## 🔍 キーファインディング（結論）

### 🟢 すぐに実行できる分析
- ✅ **BS 分析** (資産・負債・純資産の構成分析) → データ充実度 HIGH
- ✅ **PL 分析** (4社の粗利率、営業利益率) → データ充実度 HIGH
- ✅ **CF 分析** (概ね実行可能) → データ充実度 MEDIUM

### 🟡 制限付きで実行可能
- ⚠️ **企業間比較分析** → #1(連結/単体)修正が必要
- ⚠️ **日本ロジテムの分析** → #2(Revenue修正)が必要

### 🔴 実行不可（修正後に実行可能）
- ❌ **時系列分析** (YoY, CAGR) → #8(複数年度取込み)必須
- ❌ **トレンド検出** → #8(複数年度)必須
- ❌ **連結/単体分離** → #1修正必須
- ❌ **グループ分析** → #1修正必須

---

## 📈 実装ロードマップ

```
Week 1-2: データ層修正
  ├─ ブロッカー #8: 複数年度再取込み (2-4w)
  └─ ブロッカー #1: is_consolidated 補正 (1-2w)

Week 2-3: 中位層修正
  ├─ ブロッカー #2: Revenue パターン対応 (1-2w)
  └─ ブロッカー #4: normalized_value 実装 (3-5d)

Week 3-4: テクニカル修正
  ├─ ブロッカー #6: Context filtering (5-7d)
  └─ ブロッカー #3, #5, #7: 細粒度修正 (3-5d)

Week 5-6: 分析機能実装
  ├─ 時系列分析（YoY, CAGR）
  ├─ 比較分析（業種別、企業間）
  └─ 指標計算（ROA, ROE, DER）

👉 推定総期間: 4～6週間
```

---

## 💾 ファイル構成

```
epm-sdd-trial/
├── FINANCIAL_ANALYSIS_REPORT.md   ← 詳細分析版（20KB）
├── BLOCKER_SUMMARY.md            ← 視覚版（10KB）
├── FINANCIAL_ANALYSIS_INDEX.md   ← このファイル
└── .kiro/
    └── specs/
        └── financial-analysis/   ← 関連仕様書
```

---

## 🔗 関連ドキュメント

| ドキュメント | 位置 | 用途 |
|-----------|------|------|
| CLAUDE.md | `/epm-sdd-trial/` | CCSDD workflow ガイドライン |
| structure.md | `.kiro/steering/` | システム構造・層定義 |
| tech.md | `.kiro/steering/` | 技術スタック定義 |
| development-process.md | `.kiro/steering/` | 開発プロセス規定 |

---

## ❓ FAQ

**Q1: どのレポートから読むべき？**  
→ 時間がない場合: `BLOCKER_SUMMARY.md` のみ  
→ 詳しく知りたい場合: `FINANCIAL_ANALYSIS_REPORT.md` → `BLOCKER_SUMMARY.md`

**Q2: 3つのデータ問題（#1, #2, #8）はどこから？**  
→ EDINET xBRL フォーマット の実装不完全が主因  
→ 詳細は `FINANCIAL_ANALYSIS_REPORT.md` - PART 2

**Q3: 4～6週間の見積もりの根拠は？**  
→ `FINANCIAL_ANALYSIS_REPORT.md` - PART 3 の分類マトリックス参照  
→ 各ブロッカーの「期間」列で確認可能

**Q4: すぐに実行できる分析は？**  
→ `BLOCKER_SUMMARY.md` - Section 5 の「分析開始条件チェックリスト」参照

**Q5: SQL で現状を確認したい**  
→ `FINANCIAL_ANALYSIS_REPORT.md` - PART 5 の SQL クエリ集を実行

---

## 📞 サポート

**このレポートについて質問がある場合**:

1. **技術的質問**: `FINANCIAL_ANALYSIS_REPORT.md` - PART 2 の該当ブロッカーを確認
2. **スケジュール質問**: `FINANCIAL_ANALYSIS_REPORT.md` - PART 4 を参照
3. **データ品質質問**: SQL クエリ (`FINANCIAL_ANALYSIS_REPORT.md` - PART 5) を実行

---

**最終更新**: 2026-01-29  
**作成者**: Claude Code Analysis System  
**版号**: v1.0
