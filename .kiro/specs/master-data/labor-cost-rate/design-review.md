# Design Review: master-data/labor-cost-rate

## Review Summary

労務費予算単価マスタの設計は、既存のemployee-masterパターンを適切に踏襲し、CCSDD開発プロセスとSteering準拠を満たしている。4層アーキテクチャ、Contracts-first原則、RLS必須、Decimal型使用など、技術憲法に完全に準拠している。有効期間フィルタリング（asOfDate）と無効化単価の基準日フィルタ除外ロジックが要件2.8に基づいて明確に設計されており、実装準備が整っている。

---

## Critical Issues

### 🔴 Critical Issue 1: company_id取得方法の詳細不足

**Concern**: Service SpecificationのBusiness Rulesセクションに、company_idの取得方法とエラーハンドリングが明記されていない。employee-masterパターンでは「セッションコンテキストから取得」「COMPANY_NOT_SELECTEDエラー」が明記されているが、本設計ではOpen Questionsに簡潔に記載されているのみ。

**Impact**: 実装時にcompany_id取得方法が曖昧になり、既存パターンとの一貫性が損なわれる可能性がある。エラーハンドリングが不明確なため、実装者が判断に迷う。

**Suggestion**: Business Rulesセクションに以下を追加：
- セッションコンテキストから company_id を取得（リクエストパラメータからは取得しない）
- セッションコンテキストに company_id が設定されていない場合、エラーを返す（COMPANY_NOT_SELECTED）
- company_id の存在チェック（companies テーブル参照）

**Traceability**: 要件3.5（登録成功時の会社コンテキスト）、要件5.5（更新成功時の会社コンテキスト）

**Evidence**: design.md 151-159行目（Business Rulesセクション）、646-647行目（Open Questions / Risks）

---

## Design Strengths

1. **既存パターンとの整合性**: employee-masterのCRUDパターンを適切に踏襲し、Light Discoveryにより既存アーキテクチャとの一貫性を確保している。Error Policy: Pass-through、Paging/Sorting正規化（BFF責務）など、標準パターンに準拠している。

2. **要件トレーサビリティ**: Requirements Traceabilityテーブルで全要件（1.1-8.4）がコンポーネント・インターフェース・フローに明確にマッピングされており、実装時の迷いが少ない。

3. **エンティティ整合性**: エンティティ定義（01_各種マスタ.md Section 4.8）との整合性チェックリストが完備され、カラム網羅性・型の一致・制約の反映が確認済みである。

---

## Final Assessment

**Decision**: **GO**（条件付き）

**Rationale**: 設計は全体的に高品質であり、CCSDD開発プロセスとSteering準拠を満たしている。Critical Issue 1（company_id取得方法の詳細化）は軽微な改善であり、実装前にBusiness Rulesセクションに追記することで解決可能。この改善を実施すれば、実装フェーズに進む準備が整っている。

**Next Steps**:
1. Business Rulesセクションにcompany_id取得方法とエラーハンドリングを追加（Critical Issue 1の対応）
2. 修正後、spec.jsonの`approvals.design.approved`を`true`に更新
3. `/kiro:spec-tasks master-data/labor-cost-rate` を実行して実装タスクを生成

---

## Interactive Discussion

**Designer's Perspective**: Open Questionsセクションに「認証コンテキストから取得」と記載されているが、employee-masterパターンとの一貫性を確保するため、Business Rulesセクションに詳細を明記することを推奨します。これにより、実装者が既存パターンを参照せずとも、本設計書のみで実装可能になります。

**Alternatives Considered**: company_id取得方法をRepository層で処理することも検討できますが、既存パターン（employee-master）ではService層でセッションコンテキストから取得しているため、一貫性を優先してService層責務とします。

**Clarifications Needed**: セッションコンテキストの実装詳細（JWTトークン/セッションストレージ）は認証基盤の設計に依存するため、本設計では「セッションコンテキストから取得」という責務のみを明記し、実装詳細は別途定義する方針で問題ありません。

---

**Review Date**: 2026-01-05  
**Reviewer**: CCSDD Design Review Process  
**Language**: ja

