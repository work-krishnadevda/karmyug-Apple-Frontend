import React from 'react'
import { CCol, CRow } from '@coreui/react'
import { cilUser } from '@coreui/icons'
import FormSection from '../FormSection'
import FormField from '../FormField'
import { BLOOD_GROUP_OPTIONS, MARITAL_STATUS_OPTIONS } from '../../../constants/hrmsConstants'

const AdditionalSection = ({
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
      name: 'emergencyContactName',
      label: 'Emergency Contact Name',
      type: 'text',
      placeholder: 'Enter Emergency Contact Name',
      required: true,
      validation: { required: true, minLength: 2 }
    },
    {
      name: 'emergencyContactNumber',
      label: 'Emergency Contact Number',
      type: 'text',
      placeholder: 'Enter Emergency Contact Number',
      required: true,
      validation: { required: true, phone: true }
    },
    {
      name: 'bloodGroup',
      label: 'Blood Group',
      type: 'select',
      options: BLOOD_GROUP_OPTIONS,
      validation: { required: true }
    },
    {
      name: 'maritalStatus',
      label: 'Marital Status',
      type: 'select',
      options: MARITAL_STATUS_OPTIONS,
      validation: { required: true }
    }
  ]

  return (
    <FormSection
      title="Additional Information"
      icon={cilUser}
      isEditing={isEditing}
      onEditToggle={onEditToggle}
      onSave={onSave}
      onCancel={onCancel}
      canEdit={canEdit}
      editAttempts={editAttempts}
      sectionKey="additional"
    >
      <CRow>
        {fields.slice(0, 2).map((field) => (
          <CCol md={6} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`additional.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>
      
      <CRow className="mt-3">
        {fields.slice(2).map((field) => (
          <CCol md={6} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`additional.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>
      
      <CRow className="mt-3">
        <CCol md={12}>
          <FormField
            name="notes"
            label="Notes"
            type="textarea"
            placeholder="Enter any additional notes"
            rows={3}
            value={data?.notes || ''}
            onChange={onFieldChange}
            disabled={!isEditing}
            error={errors['additional.notes']}
          />
        </CCol>
      </CRow>
    </FormSection>
  )
}

export default AdditionalSection
