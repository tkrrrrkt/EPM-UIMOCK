// HttpBffClient Implementation for Meeting Form Settings

import type {
  BffClient,
  FormSectionDto,
  FormSectionListDto,
  CreateFormSectionDto,
  UpdateFormSectionDto,
  ReorderSectionsDto,
  FormFieldDto,
  FormFieldListDto,
  CreateFormFieldDto,
  UpdateFormFieldDto,
  ReorderFieldsDto,
} from './bff-client'

export class HttpBffClient implements BffClient {
  private baseUrl = '/api/bff/meetings/form-sections'
  private fieldsBaseUrl = '/api/bff/meetings/form-fields'

  // ============================================
  // セクション
  // ============================================

  async getFormSections(meetingTypeId: string): Promise<FormSectionListDto> {
    const res = await fetch(`${this.baseUrl}/${meetingTypeId}`)
    if (!res.ok) throw new Error(`Failed: ${res.status}`)
    return res.json()
  }

  async createFormSection(data: CreateFormSectionDto): Promise<FormSectionDto> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
    return res.json()
  }

  async updateFormSection(id: string, data: UpdateFormSectionDto): Promise<FormSectionDto> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
    return res.json()
  }

  async deleteFormSection(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
  }

  async reorderSections(data: ReorderSectionsDto): Promise<FormSectionListDto> {
    const res = await fetch(`${this.baseUrl}/${data.meetingTypeId}/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: data.orderedIds }),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
    return res.json()
  }

  // ============================================
  // 項目
  // ============================================

  async getFormFields(sectionId: string): Promise<FormFieldListDto> {
    const res = await fetch(`${this.fieldsBaseUrl}/${sectionId}`)
    if (!res.ok) throw new Error(`Failed: ${res.status}`)
    return res.json()
  }

  async createFormField(data: CreateFormFieldDto): Promise<FormFieldDto> {
    const res = await fetch(this.fieldsBaseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
    return res.json()
  }

  async updateFormField(id: string, data: UpdateFormFieldDto): Promise<FormFieldDto> {
    const res = await fetch(`${this.fieldsBaseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
    return res.json()
  }

  async deleteFormField(id: string): Promise<void> {
    const res = await fetch(`${this.fieldsBaseUrl}/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
  }

  async reorderFields(data: ReorderFieldsDto): Promise<FormFieldListDto> {
    const res = await fetch(`${this.fieldsBaseUrl}/${data.sectionId}/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: data.orderedIds }),
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.code || `Failed: ${res.status}`)
    }
    return res.json()
  }

  // ============================================
  // 会議種別情報
  // ============================================

  async getMeetingTypeName(meetingTypeId: string): Promise<string> {
    const res = await fetch(`/api/bff/meetings/types/${meetingTypeId}`)
    if (!res.ok) throw new Error(`Failed: ${res.status}`)
    const data = await res.json()
    return data.typeName ?? '会議'
  }
}
