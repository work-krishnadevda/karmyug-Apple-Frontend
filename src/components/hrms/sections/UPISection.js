import React from 'react'
import { CCol, CRow } from '@coreui/react'
import { cilWallet } from '@coreui/icons'
import FormSection from '../FormSection'
import FormField from '../FormField'
import { UPI_APP_OPTIONS } from '../../../constants/hrmsConstants'

const UPISection = ({
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
      name: 'upiId',
      label: 'UPI ID',
      type: 'text',
      placeholder: 'Enter UPI ID',
      required: true,
      validation: { required: true, pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ }
    },
    {
      name: 'upiApp',
      label: 'UPI App',
      type: 'select',
      options: UPI_APP_OPTIONS,
      required: true,
      validation: { required: true }
    }
  ]

  return (
    <FormSection
      title="UPI Details"
      icon={cilWallet}
      isEditing={isEditing}
      onEditToggle={onEditToggle}
      onSave={onSave}
      onCancel={onCancel}
      canEdit={canEdit}
      editAttempts={editAttempts}
      sectionKey="upi"
    >
      <CRow>
        {fields.map((field) => (
          <CCol md={6} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`upi.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>
    </FormSection>
  )
}

export default UPISection
