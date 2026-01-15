# Requirements Document

## Introduction
{{INTRODUCTION}}

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/{{SPEC_SUMMARY_FILE}}.md`
- **確認日**: {{DATE}}
- **主要な仕様ポイント**:
  - {{SPEC_POINT_1}}
  - {{SPEC_POINT_2}}

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: `.kiro/specs/仕様検討/{{DISCUSSION_FILE}}.md`（任意）
- **経緯メモ**: {{BACKGROUND_NOTES}}

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- {{ENTITY_NAME}}: `.kiro/specs/entities/{{FILE_NAME}}.md` セクション {{SECTION}}

### エンティティ整合性確認
- [ ] 対象エンティティのカラム・型・制約を確認した
- [ ] エンティティ補足のビジネスルールを要件に反映した
- [ ] スコープ外の関連エンティティを Out of Scope に明記した

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| 仕様概要との整合性 | 要件が仕様概要の内容と矛盾しない: ✅ / ❌ |
| エンティティとの整合性 | 要件がエンティティ定義と矛盾しない: ✅ / ❌ |
| 仕様検討の背景理解 | 必要に応じて経緯を確認した: ✅ / N/A |

---

## Requirements

### Requirement 1: {{REQUIREMENT_AREA_1}}
<!-- Requirement headings MUST include a leading numeric ID only (for example: "Requirement 1: ...", "1. Overview", "2 Feature: ..."). Alphabetic IDs like "Requirement A" are not allowed. -->
**Objective:** As a {{ROLE}}, I want {{CAPABILITY}}, so that {{BENEFIT}}

#### Acceptance Criteria
1. When [event], the [system] shall [response/action]
2. If [trigger], then the [system] shall [response/action]
3. While [precondition], the [system] shall [response/action]
4. Where [feature is included], the [system] shall [response/action]
5. The [system] shall [response/action]

### Requirement 2: {{REQUIREMENT_AREA_2}}
**Objective:** As a {{ROLE}}, I want {{CAPABILITY}}, so that {{BENEFIT}}

#### Acceptance Criteria
1. When [event], the [system] shall [response/action]
2. When [event] and [condition], the [system] shall [response/action]

<!-- Additional requirements follow the same pattern -->
