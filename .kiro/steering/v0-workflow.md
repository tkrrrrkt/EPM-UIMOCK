# v0 Workflow Steering（UI生成運用憲法）

## 0. 目的
- v0でUIを高速生成しつつ、SSoT（requirements/design/contracts）と境界規律を破らない。
- UIは最初モックデータで成立させ、後からBFFへ安全に差し替える。

## 1. Non-Negotiable（絶対ルール）
1) UIは Domain API を直接呼ばない（必ずBFF経由）
2) UIは `packages/contracts/src/api` を参照しない（参照禁止）
3) UIのネットワークI/Fは **contracts/bff DTO** に準拠する（bffが正）
4) v0は「画面・状態・バリデーション・UI操作」まで。業務ルール/集計ロジックは持たない
5) モックデータは “差し替え前提” のため、必ず `mockAdapters` として分離する

## 2. v0生成の入力セット（SSoT）
v0に渡す入力は以下のみ（他は渡さない）。
- `.kiro/steering/tech.md`
- `.kiro/steering/structure.md`
- `.kiro/specs/<feature>/requirements.md`
- `.kiro/specs/<feature>/design.md`（Architecture ResponsibilitiesのBFF仕様が埋まっていること）
- `packages/contracts/src/bff`（DTO / errors / enums）
- `apps/web/src/shared/ui`（Design System SSoT）
- `apps/web/src/shared/shell`（App Shell SSoT）
- `apps/web/src/shared/navigation`（Menu/Route/Permission SSoT）
※ design.mdのBFF仕様が未記入なら生成禁止（tasksのGateと同じ）

## 3. モック→BFF切替の2段階方式
### 3.1 Phase UI-MOCK（先に動くUIを作る）
- UI側に `BffClient` インターフェースを置く
- 実装は `MockBffClient` を使い、画面が動く状態を作る
- モックは contracts/bff DTO 形状で返す（DTO形状の予行演習）

### 3.2 Phase UI-BFF（BFF接続に差し替える）
- `MockBffClient` を `HttpBffClient` に差し替える
- エンドポイント/DTO/エラーは design.md の BFF仕様に完全準拠
- UIの状態管理・コンポーネント構造は維持し、データ取得部分だけ差し替える

## 4. v0への出力要求（必須）
v0の生成物には必ず含める：
- 画面一覧（routes）と各画面の目的
- 使用する contracts/bff DTO 名一覧（Request/Response）
- `BffClient` interface / `MockBffClient` / `HttpBffClient` の雛形
- 代表的なモックデータ（DTO準拠）
- エラー表示方針（contracts/bff/errors準拠の想定UI）

## 5. 禁止事項（よくある事故）
- UIでビジネスルールを確定しない（designへ差し戻す）
- UIで api DTO を使わない（bff DTOのみ）
- “とりあえず fetch直書き” をしない（必ず HttpBffClient 経由）
