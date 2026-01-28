# AI機能 v0実装ガイド

## 作成日
2026-01-28

## 概要
AI機能5つのUI実装を、v0（またはClaude Code）を使ってモックデータで先行開発するためのガイド。

---

## 準備完了状況

✅ **完了したドキュメント**:
1. 共通設計
   - [ui-design-common.md](.kiro/specs/ai/_共通/ui-design-common.md)
   - [bff-contracts.md](.kiro/specs/ai/_共通/bff-contracts.md)

2. 各機能のv0プロンプト
   - [nlq/v0-prompt.md](.kiro/specs/ai/nlq/v0-prompt.md) - 自然言語Q&A
   - [variance-analysis/v0-prompt.md](.kiro/specs/ai/variance-analysis/v0-prompt.md) - 差異分析レポート
   - [graph-generation/v0-prompt.md](.kiro/specs/ai/graph-generation/v0-prompt.md) - グラフ自動生成
   - [anomaly-detection/v0-prompt.md](.kiro/specs/ai/anomaly-detection/v0-prompt.md) - 異常値検知アラート
   - [chat-bot/v0-prompt.md](.kiro/specs/ai/chat-bot/v0-prompt.md) - 経営参謀Bot

---

## 実装順序（推奨）

### Phase 1: 基盤（共通コンポーネント）

まず共通コンポーネントを実装すると、後続機能の実装が効率化されます。

**実装先**: `apps/web/_v0_drop/ai/_shared/`

**コンポーネント**:
1. ChatWindow
2. ChatMessage
3. QueryInput
4. MetricDisplay
5. TrendIndicator
6. AnswerCard

**所要時間**: 約2-3時間

### Phase 2: 個別機能（優先度順）

#### 1. 自然言語Q&A（P0）- 最優先
**理由**:
- 最もシンプル
- 他機能の基盤
- 早く形になる

**実装先**: `apps/web/_v0_drop/ai/nlq/`

**v0プロンプト**: [.kiro/specs/ai/nlq/v0-prompt.md](file:///Users/ktkrr/root/10_dev/epm-sdd-trial/.kiro/specs/ai/nlq/v0-prompt.md)

**所要時間**: 約2-3時間

---

#### 2. 差異分析レポート（P0）
**理由**:
- 視覚的インパクト大
- デモに最適
- 全画面レイアウトの練習

**実装先**: `apps/web/_v0_drop/ai/variance-analysis/`

**v0プロンプト**: [.kiro/specs/ai/variance-analysis/v0-prompt.md](file:///Users/ktkrr/root/10_dev/epm-sdd-trial/.kiro/specs/ai/variance-analysis/v0-prompt.md)

**所要時間**: 約3-4時間

---

#### 3. グラフ自動生成（P1）
**理由**:
- 自然言語Q&Aの拡張
- Recharts統合の練習

**実装先**: `apps/web/_v0_drop/ai/graph-generation/`

**v0プロンプト**: [.kiro/specs/ai/graph-generation/v0-prompt.md](file:///Users/ktkrr/root/10_dev/epm-sdd-trial/.kiro/specs/ai/graph-generation/v0-prompt.md)

**所要時間**: 約2-3時間

---

#### 4. 異常値検知アラート（P1）
**理由**:
- モーダルUIの練習
- テーブル表示

**実装先**: `apps/web/_v0_drop/ai/anomaly-detection/`

**v0プロンプト**: [.kiro/specs/ai/anomaly-detection/v0-prompt.md](file:///Users/ktkrr/root/10_dev/epm-sdd-trial/.kiro/specs/ai/anomaly-detection/v0-prompt.md)

**所要時間**: 約2-3時間

---

#### 5. 経営参謀Bot（P1）
**理由**:
- 自然言語Q&Aの発展版
- 複雑な対話管理

**実装先**: `apps/web/_v0_drop/ai/chat-bot/`

**v0プロンプト**: [.kiro/specs/ai/chat-bot/v0-prompt.md](file:///Users/ktkrr/root/10_dev/epm-sdd-trial/.kiro/specs/ai/chat-bot/v0-prompt.md)

**所要時間**: 約2-3時間

---

## 実装方法

### オプション1: v0.dev で生成（推奨）

1. v0プロンプトをコピー
2. https://v0.dev にアクセス
3. プロンプトを貼り付けて生成
4. 生成されたコードを `apps/web/_v0_drop/ai/<feature>/` に配置
5. 必要に応じて調整

**メリット**: 速い、視覚的
**デメリット**: v0の品質に依存

### オプション2: Claude Code で直接実装

1. v0プロンプトを参照
2. Claude Code に「このプロンプトに基づいてコンポーネントを実装してください」と依頼
3. `apps/web/_v0_drop/ai/<feature>/` に生成

**メリット**: より詳細な制御、TypeScript品質高い
**デメリット**: v0より時間かかる場合がある

### オプション3: ハイブリッド

1. v0で初期生成
2. Claude Code でリファクタリング・改善

**メリット**: 両者の良いとこ取り
**デメリット**: 工数がやや増える

---

## 実装後のチェックリスト

各機能実装後、以下を確認:

### 必須チェック
- [ ] shadcn/uiコンポーネントを使用しているか
- [ ] セマンティックトークンのみ使用（任意の値なし）
- [ ] TypeScript型定義が完全か
- [ ] 数値フォーマットが正しいか（3桁カンマ、▲記号）
- [ ] モックデータが動作するか

### 推奨チェック
- [ ] レスポンシブ対応（モバイルでも動作するか）
- [ ] アクセシビリティ（aria-label、キーボード操作）
- [ ] ローディング状態の表示
- [ ] エラー状態の表示

### デモ準備
- [ ] デモページ（page.tsx）が動作するか
- [ ] スクリーンショットを撮影
- [ ] 主要なユースケースをテスト

---

## トラブルシューティング

### Q: v0生成のコードがビルドエラー

**A**: 以下を確認
1. shadcn/uiコンポーネントがインストールされているか
   ```bash
   npx shadcn-ui@latest add button card input
   ```
2. TypeScript型定義が正しいか
3. importパスが正しいか

### Q: モックデータが表示されない

**A**:
1. MockBffClient.ts が正しく実装されているか
2. 遅延シミュレーション（setTimeout）が動作しているか
3. React State が正しく更新されているか

### Q: デザインが崩れる

**A**:
1. Tailwind CSSが正しく設定されているか
2. セマンティックトークンが定義されているか（`--primary`等）
3. 共通設計ドキュメントを参照

---

## 次のステップ（実装完了後）

### 1. デモ・レビュー
- 各機能のスクリーンショット
- 主要フローの動画撮影
- ユーザーレビュー

### 2. フィードバック収集
- UI/UXの改善点
- 必要なデータ項目の追加・変更
- エンティティ設計へのフィードバック

### 3. BFF契約の調整
- モックデータから実際に必要な契約を精緻化
- 不要なフィールドを削除
- 追加が必要なフィールドを特定

### 4. UI-BFF Phase への移行準備
- HttpBffClient の実装準備
- エラーハンドリングの設計
- 認証・権限制御の設計

---

## ディレクトリ構造（最終形）

```
apps/web/_v0_drop/ai/
├── _shared/                         # 共通コンポーネント
│   ├── components/
│   │   ├── ChatWindow.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── QueryInput.tsx
│   │   ├── AnswerCard.tsx
│   │   ├── MetricDisplay.tsx
│   │   └── TrendIndicator.tsx
│   ├── hooks/
│   │   ├── useChatSession.ts
│   │   └── useMetricFormat.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── types/
│       └── common.ts
│
├── nlq/                             # 自然言語Q&A
│   └── src/
│       ├── components/
│       ├── api/MockBffClient.ts
│       └── page.tsx
│
├── variance-analysis/               # 差異分析
│   └── src/
│       ├── components/
│       ├── api/MockBffClient.ts
│       └── page.tsx
│
├── graph-generation/                # グラフ生成
│   └── src/
│       ├── components/
│       ├── api/MockBffClient.ts
│       └── page.tsx
│
├── anomaly-detection/               # 異常値検知
│   └── src/
│       ├── components/
│       ├── api/MockBffClient.ts
│       └── page.tsx
│
└── chat-bot/                        # 経営参謀Bot
    └── src/
        ├── components/
        ├── api/MockBffClient.ts
        └── page.tsx
```

---

## 推定工数サマリ

| フェーズ | 内容 | 工数 |
|---------|------|-----|
| Phase 1 | 共通コンポーネント | 2-3時間 |
| Phase 2.1 | 自然言語Q&A | 2-3時間 |
| Phase 2.2 | 差異分析レポート | 3-4時間 |
| Phase 2.3 | グラフ自動生成 | 2-3時間 |
| Phase 2.4 | 異常値検知アラート | 2-3時間 |
| Phase 2.5 | 経営参謀Bot | 2-3時間 |
| **合計** | | **13-19時間** |

**現実的な見積もり**:
- 集中作業で 2-3日
- 通常ペースで 1週間

---

## 成功の定義

以下が達成できたら成功:

✅ **デモ可能**: 5機能すべてがモックデータで動作
✅ **視覚的**: スクリーンショット・動画で見せられる
✅ **フィードバック収集可能**: ユーザーが触って意見を言える
✅ **エンティティ設計への知見**: 「このデータ項目が必要」という気づき

---

## サポート

質問・相談があれば、以下を参照:

1. **仕様**: [.kiro/specs/仕様概要/AIシミュレーション機能.md](file:///Users/ktkrr/root/10_dev/epm-sdd-trial/.kiro/specs/仕様概要/AIシミュレーション機能.md)
2. **共通設計**: [.kiro/specs/ai/_共通/ui-design-common.md](file:///Users/ktkrr/root/10_dev/epm-sdd-trial/.kiro/specs/ai/_共通/ui-design-common.md)
3. **BFF契約**: [.kiro/specs/ai/_共通/bff-contracts.md](file:///Users/ktkrr/root/10_dev/epm-sdd-trial/.kiro/specs/ai/_共通/bff-contracts.md)
4. **v0ワークフロー**: [.kiro/steering/v0-workflow.md](file:///Users/ktkrr/root/10_dev/epm-sdd-trial/.kiro/steering/v0-workflow.md)

---

**準備完了。実装を開始できます!**
