import React from 'react'
import { CCol, CRow } from '@coreui/react'
import { cilBriefcase } from '@coreui/icons'
import FormSection from '../FormSection'
import FormField from '../FormField'
import { DEPARTMENT_OPTIONS, EMPLOYEE_TYPE_OPTIONS, EMPLOYEE_STATUS_OPTIONS } from '../../../constants/hrmsConstants'

const EmploymentSection = ({
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
      name: 'department',
      label: 'Department',
      type: 'select',
      options: DEPARTMENT_OPTIONS,
      required: true,
      validation: { required: true }
    },
    {
      name: 'designation',
      label: 'Designation',
      type: 'text',
      placeholder: 'Enter Designation',
      required: true,
      validation: { required: true, minLength: 2 }
    },
    {
      name: 'joiningDate',
      label: 'Joining Date',
      type: 'date',
      required: true,
      validation: { required: true }
    },
    {
      name: 'employeeType',
      label: 'Employee Type',
      type: 'select',
      options: EMPLOYEE_TYPE_OPTIONS,
      required: true,
      validation: { required: true }
    },
    {
      name: 'basicSalary',
      label: 'Basic Salary',
      type: 'number-with-currency',
      placeholder: 'Enter Basic Salary',
      required: true,
      validation: { required: true, min: 0 }
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: EMPLOYEE_STATUS_OPTIONS,
      required: true,
      validation: { required: true }
    }
  ]

  return (
    <FormSection
      title="Employment Information"
      icon={cilBriefcase}
      isEditing={isEditing}
      onEditToggle={onEditToggle}
      onSave={onSave}
      onCancel={onCancel}
      canEdit={canEdit}
      editAttempts={editAttempts}
      sectionKey="employment"
    >
      <CRow>
        {fields.slice(0, 2).map((field) => (
          <CCol md={6} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`employment.${field.name}`]}
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
              error={errors[`employment.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>
      
      <CRow className="mt-3">
        {fields.slice(4).map((field) => (
          <CCol md={6} key={field.name}>
            <FormField
              {...field}
              value={data?.[field.name] || ''}
              onChange={onFieldChange}
              disabled={!isEditing}
              error={errors[`employment.${field.name}`]}
            />
          </CCol>
        ))}
      </CRow>
    </FormSection>
  )
}

export default EmploymentSection
