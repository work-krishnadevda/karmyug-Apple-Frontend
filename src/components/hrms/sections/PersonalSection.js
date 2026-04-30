import React from 'react'
import { CCol, CRow } from '@coreui/react'
import { cilEnvelopeClosed } from '@coreui/icons'
import FormSection from '../FormSection'
import FormField from '../FormField'
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, PHYSICALLY_CHALLENGED_OPTIONS } from '../../../constants/hrmsConstants'

const PersonalSection = ({
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
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Enter Email',
      required: true,
      validation: { required: true, email: true }
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      options: GENDER_OPTIONS,
      required: true,
      validation: { required: true }
    },
    {
      name: 'dob',
      label: 'Date of Birth',
      type: 'date',
      required: true,
      validation: { required: true }
    },
    {
      name: 'maritalStatus',
      label: 'Marital Status',
      type: 'select',
      options: MARITAL_STATUS_OPTIONS,
      validation: { required: true }
    },
    {
      name: 'bloodGroup',
      label: 'Blood Group',
      type: 'text',
      placeholder: 'Enter Blood Group',
      validation: { minLength: 2 }
    },
    {
      name: 'emergencyContact',
      label: 'Emergency Contact',
      type: 'text',
      placeholder: 'Enter Emergency Contact Number',
      validation: { phone: true }
    },
    {
      name: 'fatherName',
      label: "Father's Name",
      type: 'text',
      placeholder: "Enter Father's Name",
      validation: { minLength: 2 }
    },
    {
      name: 'motherName',
      label: "Mother's Name",
      type: 'text',
      placeholder: "Enter Mother's Name",
      validation: { minLength: 2 }
    },
    {
      name: 'spouseName',
      label: "Spouse's Name",
      type: 'text',
      placeholder: "Enter Spouse's Name",
      validation: { minLength: 2 }
    },
    {
      name: 'physicallyChallenged',
      label: 'Physically Challenged',
      type: 'select',
      options: PHYSICALLY_CHALLENGED_OPTIONS,
      validation: { required: true }
    }
  ]

  return (
    <FormSection
      title="Personal Information"
      icon={cilEnvelopeClosed}
      isEditing={isEditing}
      onEditToggle={onEditToggle}
      onSave={onSave}
      onCancel={onCancel}
      canEdit={canEdit}
      editAttempts={editAttempts}
      sectionKey="personal"
    >
      <CRow>
        {fields.slice(0, 2).map((field) => (
          <CCol md={6} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`personal.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>

      <CRow className="mt-3">
        {fields.slice(2, 4).map((field) => (
          <CCol md={6} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`personal.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>

      <CRow className="mt-3">
        {fields.slice(4, 6).map((field) => (
          <CCol md={6} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`personal.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>

      <CRow className="mt-3">
        {fields.slice(6, 9).map((field) => (
          <CCol md={4} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`personal.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>

      <CRow className="mt-3">
        <CCol md={6}>
          <FormField
            {...fields[9]}
            value={data?.[fields[9].name] || ''}
            onChange={onFieldChange}
            disabled={!isEditing}
            error={errors[`personal.${fields[9].name}`]}
          />
        </CCol>
      </CRow>

      <CRow className="mt-3">
        <CCol md={6}>
          <FormField
            name="currentAddress"
            label="Current Address"
            type="textarea"
            placeholder="Enter Current Address"
            rows={2}
            value={data?.currentAddress || ''}
            onChange={onFieldChange}
            disabled={!isEditing}
            error={errors['personal.currentAddress']}
          />
        </CCol>
        <CCol md={6}>
          <FormField
            name="permanentAddress"
            label="Permanent Address"
            type="textarea"
            placeholder="Enter Permanent Address"
            rows={2}
            value={data?.permanentAddress || ''}
            onChange={onFieldChange}
            disabled={!isEditing}
            error={errors['personal.permanentAddress']}
          />
        </CCol>
      </CRow>
    </FormSection>
  )
}

export default PersonalSection
