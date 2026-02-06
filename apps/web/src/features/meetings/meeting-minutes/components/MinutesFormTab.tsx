'use client'

import { useState, useEffect } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Button } from '@/shared/ui/components/button'
import { Skeleton } from '@/shared/ui/components/skeleton'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import type { BffClient, MinutesFormDto, MeetingMinutesDto } from '../api'
import { mockBffClient } from '../api'

/**
 * MinutesFormTab Component
 *
 * Displays and manages the meeting minutes form (議事録タブ).
 * Form structure is loaded from Form Settings (MEETING_MINUTES sections).
 */

interface MinutesFormTabProps {
  eventId: string
  client?: BffClient
}

export function MinutesFormTab({
  eventId,
  client = mockBffClient,
}: MinutesFormTabProps) {
  const [formDef, setFormDef] = useState<MinutesFormDto | null>(null)
  const [existingData, setExistingData] = useState<MeetingMinutesDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load form definition and existing data
  useEffect(() => {
    const loadForm = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load form definition
        const form = await client.getMinutesForm(eventId)
        setFormDef(form)

        // Load existing data if available
        const existing = await client.getMinutesData(eventId)
        setExistingData(existing)
      } catch (err: any) {
        setError(err.message || 'フォーム読み込みエラーが発生しました')
        console.error('Error loading minutes form:', err)
      } finally {
        setLoading(false)
      }
    }

    loadForm()
  }, [eventId, client])

  // Build Yup validation schema from form definition
  const buildValidationSchema = () => {
    const shape: any = {}

    if (formDef) {
      formDef.sections.forEach(section => {
        section.fields.forEach(field => {
          let validator: any = Yup.mixed()

          switch (field.fieldType) {
            case 'TEXT':
              validator = Yup.string()
              if (field.maxLength) {
                validator = validator.max(field.maxLength)
              }
              break
            case 'TEXTAREA':
              validator = Yup.string()
              if (field.maxLength) {
                validator = validator.max(field.maxLength)
              }
              break
            case 'DATE':
              validator = Yup.date().nullable()
              break
            case 'NUMBER':
              validator = Yup.number().nullable()
              break
            case 'SELECT':
              validator = Yup.string()
              break
            default:
              validator = Yup.mixed()
          }

          if (field.isRequired) {
            validator = validator.required('必須項目です')
          }

          shape[field.id] = validator
        })
      })
    }

    return Yup.object().shape(shape)
  }

  // Initialize form values from existing data or defaults
  const getInitialValues = () => {
    const values: any = {}

    if (formDef) {
      formDef.sections.forEach(section => {
        section.fields.forEach(field => {
          if (existingData) {
            const existing = existingData.fieldValues.find(
              fv => fv.formFieldId === field.id,
            )
            values[field.id] = existing?.value || ''
          } else {
            values[field.id] = ''
          }
        })
      })
    }

    return values
  }

  // Formik form management
  const formik = useFormik({
    initialValues: getInitialValues(),
    validationSchema: buildValidationSchema(),
    onSubmit: async values => {
      try {
        setSubmitting(true)
        setSaved(false)

        // Convert form values to DTO format
        const fieldValues = Object.entries(values).map(([fieldId, value]) => ({
          formFieldId: fieldId,
          value: (value || null) as string | number | boolean | Date | File[] | null,
        }))

        await client.saveMinutes(eventId, { fieldValues })

        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } catch (err: any) {
        setError(err.message || '保存に失敗しました')
        console.error('Error saving minutes:', err)
      } finally {
        setSubmitting(false)
      }
    },
    enableReinitialize: true,
  })

  // Render field based on type
  const renderField = (field: any) => {
    const value = formik.values[field.id]
    const touched = formik.touched[field.id]
    const error = formik.errors[field.id]

    const hasError = touched && error

    switch (field.fieldType) {
      case 'TEXT':
        return (
          <input
            type="text"
            name={field.id}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            maxLength={field.maxLength}
            className={`w-full px-3 py-2 border rounded-md bg-white text-sm ${
              hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2`}
          />
        )

      case 'TEXTAREA':
        return (
          <textarea
            name={field.id}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            maxLength={field.maxLength}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md bg-white text-sm font-sans ${
              hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2 resize-none`}
          />
        )

      case 'DATE':
        return (
          <input
            type="date"
            name={field.id}
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={e => {
              formik.setFieldValue(
                field.id,
                e.target.value ? new Date(e.target.value) : null,
              )
            }}
            onBlur={formik.handleBlur}
            className={`w-full px-3 py-2 border rounded-md bg-white text-sm ${
              hasError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            } focus:outline-none focus:ring-2`}
          />
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!formDef || formDef.sections.length === 0) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-yellow-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              この会議の議事録フォームが設定されていません
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={formik.handleSubmit} className="p-6 space-y-8">
      {/* Success message */}
      {saved && (
        <div className="rounded-md bg-green-50 p-4 flex gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-green-800">
            議事録を保存しました
          </p>
        </div>
      )}

      {/* Form sections */}
      {formDef.sections.map(section => (
        <div key={section.id} className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold">{section.sectionName}</h3>
            {section.description && (
              <p className="text-sm text-gray-600 mt-1">{section.description}</p>
            )}
          </div>

          {/* Form fields */}
          <div className="space-y-6">
            {section.fields.map(field => (
              <div key={field.id} className="space-y-2">
                <label className="block text-sm font-medium">
                  {field.fieldName}
                  {field.isRequired && (
                    <span className="ml-1 text-red-600">*</span>
                  )}
                </label>
                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
                {renderField(field)}
                {field.maxLength && (
                  <p className="text-xs text-gray-500">
                    最大 {field.maxLength} 文字
                  </p>
                )}
                {formik.touched[field.id] && formik.errors[field.id] && (
                  <p className="text-xs text-red-600">
                    {formik.errors[field.id] as string}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Form actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={submitting || !formik.isValid}
          className="flex items-center gap-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          保存
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => formik.resetForm()}
          disabled={submitting}
        >
          リセット
        </Button>
      </div>
    </form>
  )
}
