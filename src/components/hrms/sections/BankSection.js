import React from 'react'
import { CCol, CRow } from '@coreui/react'
import { cilCreditCard } from '@coreui/icons'
import FormSection from '../FormSection'
import FormField from '../FormField'

const BankSection = ({
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
      name: 'bankName',
      label: 'Bank Name',
      type: 'text',
      placeholder: 'Enter Bank Name',
      required: true,
      validation: { required: true, minLength: 2 }
    },
    {
      name: 'accountNumber',
      label: 'Account Number',
      type: 'text',
      placeholder: 'Enter Account Number',
      required: true,
      validation: { required: true, minLength: 8 }
    },
    {
      name: 'ifscCode',
      label: 'IFSC Code',
      type: 'text',
      placeholder: 'Enter IFSC Code',
      required: true,
      validation: { required: true, pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/ }
    },
    {
      name: 'branchName',
      label: 'Branch Name',
      type: 'text',
      placeholder: 'Enter Branch Name',
      required: true,
      validation: { required: true, minLength: 2 }
    }
  ]

  return (
    <FormSection
      title="Bank Details"
      icon={cilCreditCard}
      isEditing={isEditing}
      onEditToggle={onEditToggle}
      onSave={onSave}
      onCancel={onCancel}
      canEdit={canEdit}
      editAttempts={editAttempts}
      sectionKey="bank"
    >
      <CRow>
        {fields.slice(0, 2).map((field) => (
          <CCol md={6} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`bank.${field.name}`]}
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
              error={errors[`bank.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>
    </FormSection>
  )
}

export default BankSection
