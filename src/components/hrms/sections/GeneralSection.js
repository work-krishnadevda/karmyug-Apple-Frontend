import React from 'react'
import { CCol, CRow } from '@coreui/react'
import { cilUser } from '@coreui/icons'
import FormSection from '../FormSection'
import FormField from '../FormField'
import { GENDER_OPTIONS } from '../../../constants/hrmsConstants'

const GeneralSection = ({
  data,
  isEditing,
  onFieldChange,
  onEditToggle,
  onSave,
  onCancel,
  canEdit,
  editAttempts,
  errors = {}
}) => {
  const fields = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter First Name',
      required: true,
      validation: { required: true, minLength: 2 }
    },
    {
      name: 'middleName',
      label: 'Middle Name',
      type: 'text',
      placeholder: 'Enter Middle Name',
      validation: { minLength: 1 }
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      placeholder: 'Enter Last Name',
      required: true,
      validation: { required: true, minLength: 2 }
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date',
      required: true,
      validation: { required: true }
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      options: GENDER_OPTIONS,
      required: true,
      validation: { required: true }
    }
  ]

  return (
    <FormSection
      title="General Information"
      icon={cilUser}
      isEditing={isEditing}
      onEditToggle={onEditToggle}
      onSave={onSave}
      onCancel={onCancel}
      canEdit={canEdit}
      editAttempts={editAttempts}
      sectionKey="general"
    >
      <CRow>
        {fields.slice(0, 3).map((field) => (
          <CCol md={4} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`general.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>
      
      <CRow className="mt-3">
        {fields.slice(3).map((field) => (
          <CCol md={6} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`general.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>
    </FormSection>
  )
}

export default GeneralSection
