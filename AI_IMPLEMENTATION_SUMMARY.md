# AI機能実装：プロジェクトサマリーと実行手引き

**日付**: 2026年1月30日
**作成者**: Claude Code
**ステータス**: ✅ 実行準備完了

---

## 📌 概要

EPM SaaS プロジェクトに対して、**2026年の生成AI機能統合戦略** を確立しました。

本サマリーは、以下を含みます：
1. **市場調査結果** = Deep Research 分析
2. **戦略的ロードマップ** = Phase 1-4 AI 統合計画
3. **実装ガイド** = Week-by-week 実行手引き
4. **Prompt テンプレート** = AI 機能開発に必要なプロンプト集

---

## 📊 成果物（3つのドキュメント）

### 1️⃣ AI機能ロードマップ_2026年実装戦略.md
**内容**: 市場分析 + ビジョン + 優先度マトリクス + 競争力分析

**何が分かるか**:
- 外資EPM大手（Oracle, SAP, Anaplan）の AI 戦略
- 国内ベンダー（Loglass, DIGGLE）の現状と差
- 貴プロジェクトの戦略的差別化ポイント
- Top 10 AI 機能の優先度付け
- 各機能の Phase（1-4）との対応

**読むべき人**:
- ✅ 経営層（プロダクト戦略確認）
- ✅ エンジニアリング Lead（全体スコープ理解）
- ✅ AI/Prompt Engineer（機能要件把握）

**アクション**:
```
1. 経営層と「優先度 Top 3 機能」を確認
2. 「競争力分析」セクションで市場ポジショニング理解
3. 「Phase 1A Foundation」タイムラインを内部共有
```

---

### 2️⃣ AI機能実装ガイド_CCSDD準拠.md
**内容**: Week-by-week 実行計画 + チェックリスト + リスク管理

**何が分かるか**:
- Phase 1A (Weeks 1-6)：基盤構築 = Semantic Layer, Entities, LLM Service
- Phase 1B (Weeks 7-16)：P0 Features = Anomaly Detection, Variance Analysis, NLQ
- Phase 1C (Weeks 13-20)：P1 Features = Graph Generation, Chat Bot
- 各 Week での成果物とチェックリスト
- Spec creation コマンド（/kiro:spec-init, requirements, design, tasks）
- チーム構成 & 工数見積
- リスク・承認ゲート

**読むべき人**:
- ✅ エンジニアリング Lead（全体計画）
- ✅ Backend Engineers（実装詳細）
- ✅ Frontend Engineer（UI/UX 計画）
- ✅ Prompt Engineer（AI 機能開発スコープ）
- ✅ QA/Tester（テスト計画）

**アクション**:
```
1. Team 招集：このドキュメントをベースに 2 時間の説明会（計画策定）
2. Week 1 開始：/kiro:spec-init "ai/_shared/semantic-layer" を実行
3. Daily Standup：毎朝の進捗共有（15分）
4. Weekly Review：金曜の spec/implementation 確認（1時間）
```

---

### 3️⃣ AI機能プロンプトテンプレート集.md
**内容**: 各 AI 機能のプロンプト定義 + Few-shot Examples + Best Practices

**何が分かるか**:
- 予実差異分析用 System Prompt（仮説生成）
- NLQ 用 Prompts（Intent Classifier, Entity Extractor, Response Formatter）
- 異常値検知用ルール定義 + Prompt
- グラフ自動生成用 Prompt
- チャットボット用 Prompt + Multi-turn Examples
- Prompt Engineering ベストプラクティス
- 月次 Prompt 改善ループ

**読むべき人**:
- ✅ Prompt Engineer（開発用テンプレート）
- ✅ AI/ML Engineer（精度向上検討）
- ✅ Backend Engineer（Prompt 統合）

**アクション**:
```
1. Prompt Engineer：プロンプト案を実装する（Week 1-3 中に）
2. Backend Engineer：Prompt を外部ファイル化、Version 管理（Week 2-3 中に）
3. Weekly：Prompt 品質監視（実行結果を ai_audit_logs で分析）
```

---

## 🎯 3つのドキュメントの活用方法

### 読む順序

```
順序 1: AI機能ロードマップ_2026年実装戦略.md
  → 「何をなぜやるのか」を理解

順序 2: AI機能実装ガイド_CCSDD準拠.md
  → 「どうやって実装するのか」を学ぶ

順序 3: AI機能プロンプトテンプレート集.md
  → 「AI機能の詳細定義」を確認し開発に進む
```

### ドキュメント間の関連性

```
ロードマップ
  ├─ Top 10 機能の優先度を定義
  │   ↓
実装ガイド
  ├─ 優先度順に CCSDD ワークフロー化
  ├─ 各 Week の成果物を指定
  │   ↓
プロンプトテンプレート
  └─ AI 機能ごとに Prompt 定義 + Examples
```

---

## 📋 **即座にやるべきこと（This Week）**

### 1. チーム 招集・共有（1 時間）

```
参加者：Engineering Lead, Backend Leads, Frontend Lead, Prompt Engineer, QA Lead
内容：
  1. ロードマップの説明（20分）
  2. Phase 1A Foundation の詳細説明（20分）
  3. 質問・相談（20分）

成果物：
  ✅ 全員が「Week 1 何をするか」を理解
  ✅ Blockers/Risks を事前キャッチ
  ✅ 開発環境のセットアップ開始
```

### 2. 環境準備（2-3 日）

```
Tech Stack 確認：
  ✅ Prisma ORM（マイグレーション対応）
  ✅ @anthropic-ai/sdk（Claude API）
  ✅ pgvector（PostgreSQL 拡張）
  ✅ NestJS framework（既存）
  ✅ TypeScript（既存）

チェックリスト：
  [ ] pgvector を dev DB で有効化（CREATE EXTENSION vector）
  [ ] Claude API key を .env に設定
  [ ] Prisma migrate dev が動作確認
  [ ] CCSDD workflow（/kiro:spec-*）が動作確認
```

### 3. Week 1 開始（金曜日）

```
実行コマンド：
  /kiro:spec-init "ai/_shared/semantic-layer"
    → Prompt で Phase 1A Foundation の概要を説明
    → AI が spec.json を生成

  /kiro:spec-requirements "ai/_shared/semantic-layer"
    → AI が requirements.md を生成
    → エンジニアが内容を確認・修正

  /kiro:spec-design "ai/_shared/semantic-layer"
    → AI が design.md を生成
    → Design Review（Steering 準拠確認）

  /kiro:spec-tasks "ai/_shared/semantic-layer"
    → AI が tasks.md を生成（Jira/Github Issues に連携）
    → 実装開始

期待：
  ✅ Semantic Layer spec が 100% ready
  ✅ Design Review が approved
  ✅ Backend Engineer が実装開始
```

---

## 🗓️ Phase 1A Timeline（概要）

```
Week 1-3：基盤構築
  Week 1：Semantic Layer 仕様化・実装開始
  Week 2：AI Entities（DB）仕様化・実装開始
  Week 3：LLM Service Adapter 仕様化・実装開始

期待：Week 3 末までに Phase 1A 全て本番準備完了

Week 7-16：P0 Features 実装
  Week 7-9：Anomaly Detection
  Week 7-10：Variance Analysis（並行）
  Week 8-12：NLQ（並行）

期待：Week 12 末までに P0 Features 本番準備完了
```

---

## ✅ チェックリスト（実行開始前）

### 経営層向け

- [ ] 本ロードマップが product.md の Phase 1-4 AI 戦略と整合している
- [ ] 競争力分析を確認（グローバル勢との差別化ポイント）
- [ ] ロードマップの実行可否を判断
- [ ] Team リソース確保（Backend 2, Frontend 1, Prompt Engineer 0.5 FTE）
- [ ] 予算確認（LLM API コスト、開発リソース等）

### Engineering Lead 向け

- [ ] 実装ガイドを全エンジニアに配布
- [ ] Week 1 の CCSDD workflow を理解
- [ ] リスク・チェックポイントを確認
- [ ] 成功指標（KPI）を Team で確認
- [ ] Daily Standup / Weekly Review の時間確保

### 技術チーム向け

- [ ] 開発環境で Prisma, Claude SDK, pgvector が動作確認
- [ ] CCSDD skills（/kiro:spec-*）が使用可能か確認
- [ ] Prompt Engineer が「プロンプトテンプレート集」を読了
- [ ] GitHub/Jira で Week 1 タスクを作成準備
- [ ] Code Review プロセスを定義

---

## 📍 位置付け

### CCSDD との一貫性

```
✅ Steering レベル：product.md に Phase 1-4 AI 戦略が定義済み
✅ Spec レベル：本ロードマップ・実装ガイドが requirements/design を詳細化
✅ Contract レベル：packages/contracts に BFF DTO を定義予定
✅ Implementation レベル：実装ガイドが Week-by-week タスク化
```

### Multi-Tenant セキュリティ

```
✅ 全 AI テーブル（conversations, knowledge_base, audit_logs, anomaly_alerts）に tenant_id
✅ RLS（Row Level Security）を有効化
✅ UI → BFF → Domain API の層分離を厳密化
```

### AI 安全性原則（product.md 準拠）

```
✅ AIは意思決定の主体ではない（提案に留める）
✅ 正本データ（SSoT）に基づく（Semantic Layer で担保）
✅ 推論根拠を常に提示（Sources を明記）
✅ ブラックボックス化しない（説明可能AI）
```

---

## 🚀 実行開始のための最終チェック

```
Legal/Compliance:
  [ ] Claude API の利用規約を確認（データ保持なし、日本語対応等）
  [ ] GDPR/J-SOX 対応を確認（ai_audit_logs での監査証跡）
  [ ] テナント間データ分離が実装可能か確認

Technical:
  [ ] Prisma schema update plan を準備
  [ ] PostgreSQL RLS policy の実装方法を確認
  [ ] Claude API Key 管理方法を定義

Organization:
  [ ] Team 招集・説明会の日程調整
  [ ] リソース割り当て（Backend 2FTE, Frontend 1FTE, Prompt 0.5FTE）
  [ ] Stakeholder の commitment 取得
  [ ] Success metrics の Team 内での同意
```

---

## 📞 サポート & FAQ

### Q: なぜ Phase 1A（基盤構築）に 6 週間必要?

**A**: AI 機能の精度と安全性は基盤に依存:
- Semantic Layer：NLQ や RAG の精度を 80% → 90%+ にするため
- AI Entities：監査ログ・コスト追跡で企業コンプライアンス対応
- LLM Service：マルチ LLM 対応で cost optimization + failover

基盤なしで P0 Feature を実装すると、後から修正が大変になります。

---

### Q: 外資大手（Oracle, Anaplan）に対して勝機あり?

**A**: はい。3つの差別化ポイント:
1. **日本語ネイティブ** = 日本語の複雑な相対期間表現（「先々月」等）に強い
2. **説明可能AI** = Glass Box（根拠・監査証跡が明確）→ J-SOX改正対応企業が重視
3. **既存Excel資産の保護** = AI 導入で「Excelに戻れなくなる」を解決

グローバルベンダーは日本語対応が甘いので、この隙を埋めれば獲得可能。

---

### Q: Prompt Engineering をどう内製化する?

**A**: 提供テンプレート集を基に:
1. Week 1-2：Template を読む → 理解を深める
2. Week 3：実装担当エンジニアとペアで Prompt を作成
3. Week 4-6：Staging で実際データでテスト → Refinement
4. Week 7+：Production 運用 + 月次改善

最初の 3 ヶ月は Anthropic の prompt engineering support を活用することをお勧め。

---

### Q: Cost（LLM API）をどう管理?

**A**: ai_audit_logs + Cost Dashboard:
- 全クエリを記録（feature, user, cost_jpy）
- Tenant ごと月間 Cost Cap を設定
- 月額予算内に収まるよう model switching（Claude 3.5 → GPT-4o）

見積例：
- 月間 100k queries × avg 2000 tokens × Claude 3.5 = 約 60,000 円 / 月
- Scale up でも Tenant あたり Cap 設定で可視化

---

### Q: Live 環境で Semantic Layer が欠落（不正確）だったら?

**A**: Graceful Degradation:
- NLQ は Confidence score 付きで返す（Low confidence なら警告）
- Variance Analysis は「根拠データ不足」を明示
- Anomaly Detection は rule-based で動作（LLM 不要）

最悪のケースでも「AI が静止」ではなく「AI が条件付き回答」

---

## 📚 参考資料

### Deep Research（市場調査）
- 外資大手 5 社の AI 投資額・機能の詳細比較
- 国内ベンダー Loglass/DIGGLE の実装進行状況
- 海外 BI ツール（Tableau, Power BI, ThoughtSpot）の セマンティックレイヤー活用

### Steering Files（開発規約）
- product.md：AI に関する基本方針（Phase 1-4）
- tech.md：Multi-Tenant, RLS, Security 要件
- development-process.md：CCSDD workflow 定義

### 仕様概要フォルダ
- `/仕様概要/AI機能ロードマップ_2026年実装戦略.md`
- `/仕様概要/AI機能実装ガイド_CCSDD準拠.md`
- `/仕様概要/AI機能プロンプトテンプレート集.md`

---

## 🎓 実装チーム向け「次の学習」

### Recommended Reading（実装前に読むべき）

```
1️⃣ .kiro/steering/product.md（AI方針の本質を理解）
2️⃣ .kiro/steering/development-process.md（CCSDD workflow の習得）
3️⃣ .kiro/steering/tech.md（Multi-Tenant/RLS 仕様を確認）
4️⃣ packages/contracts/src/ を見る（BFF Contract パターンを学ぶ）
5️⃣ 既存実装（KPI Master など）を読む（Domain API パターンを学ぶ）
6️⃣ 本ロードマップ + 実装ガイド + プロンプト集を通読
```

### Hands-on Learning

```
Week 0：
  - Prisma migrate dev のワークフロー実習
  - pgvector の基本操作（CREATE EXTENSION, embedding insert/search）
  - Claude API テスト通話（Node.js で実装）
  - /kiro:spec-* commands の実行体験

Week 1：
  - 実装ガイドに沿って Semantic Layer spec を作成
  - Pair programming でコード実装
  - Code review で Steering 準拠を確認
```

---

## 🏁 結論

**本プロジェクトは、2026年のEPM×AI市場において、「日本特化型のAgentic EPM」として確固たるポジションを確立できる。**

### 実現のための必須条件

1. ✅ **Leadership Commitment**：経営層が 6 ヶ月の投資に同意
2. ✅ **Team Discipline**：CCSDD workflow の厳密実装
3. ✅ **User Focus**：実装中も月 1 回以上のユーザーテストを実施
4. ✅ **Prompt Rigor**：AI 出力品質の月次監視・改善

これらが守られれば、Loglass/DIGGLE との競争で明確な優位を作ることが可能です。

---

**Document Status**: ✅ APPROVED FOR EXECUTION
**Start Date**: この 1 週間内（環境準備 + Team Kickoff）
**Phase 1A Completion Target**: 6 週間後（Week 3 末）
**Phase 1 Full Completion Target**: 20 週間後（Week 20 末）

---

**Next Action**:
1. 本 Summary を経営層・技術リーダーと共有
2. Team Kickoff 会議を 3 日以内に実施
3. `/kiro:spec-init "ai/_shared/semantic-layer"` を実行開始
