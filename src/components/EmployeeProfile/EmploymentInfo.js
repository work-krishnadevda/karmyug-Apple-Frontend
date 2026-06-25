import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CFormTextarea,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { cilPencil, cilSave, cilX, cilBriefcase } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import AsyncSelect from 'react-select/async'
import { formatAdminRoleLabel } from 'src/constants/hrmsConstants'

// Function to convert number to words
const convertNumberToWords = (num) => {
  if (!num || isNaN(num) || num === '') return ''

  let number = parseInt(num)
  if (number === 0) return 'Zero'

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ]
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ]
  const thousands = ['', 'Thousand', 'Lakh', 'Crore']

  const convertHundreds = (n) => {
    let result = ''
    if (n > 99) {
      result += ones[Math.floor(n / 100)] + ' Hundred '
      n %= 100
    }
    if (n > 19) {
      result += tens[Math.floor(n / 10)] + ' '
      n %= 10
    } else if (n > 9) {
      result += teens[n - 10] + ' '
      return result
    }
    if (n > 0) {
      result += ones[n] + ' '
    }
    return result
  }

  if (number < 1000) {
    return convertHundreds(number).trim()
  }

  let result = ''
  let thousandIndex = 0

  while (number > 0) {
    const chunk = number % 1000
    if (chunk !== 0) {
      result = convertHundreds(chunk) + thousands[thousandIndex] + ' ' + result
    }
    number = Math.floor(number / 1000)
    thousandIndex++
  }

  return result.trim() + ' Rupees Only'
}

const EmploymentInfo = ({
  formData,
  editMode,
  canEditSection,
  handleEditToggle,
  handleSave,
  handleCancel,
  handleInputChange,
  getFieldError,
  managers = [],
  // loadManagerOptions,
  companies = [],
  loadCompanyOptions,
  locations = [],
  groups = [],
  isLoadingData = false,
  templates,
  loadGroupOptions,
  defaultGroupOptions = [],
}) => {
  // place inside component scope (above JSX)
  const loadManagerOptions = (inputValue, callback) => {
    const q = (inputValue || '').toString().trim().toLowerCase()
    const filtered = managers.filter((m) => {
      const label = (m.label || m.name || '').toString().toLowerCase()
      const role = formatAdminRoleLabel(m.role).toLowerCase()
      const value = (m.value || '').toString().toLowerCase()
      return !q || label.includes(q) || role.includes(q) || value.includes(q)
    })
    // support both callback signature and promise-returning signature
    if (typeof callback === 'function') {
      callback(filtered)
      return
    }
    return Promise.resolve(filtered)
  }

  const resolvedRaLocationValue = (() => {
    const r = formData?.employment?.raLocation
    if (!r) return ''
    if (locations.find((l) => l.value === r)) return r
    const found = locations.find((l) => l.label === r || l.name === r)
    return found ? found.value : ''
  })()

  // Check if user has SDM role
  const checkIfSDM = () => {
    const roles = formData?.profile?.role || []
    if (Array.isArray(roles)) {
      return roles.some(
        (role) =>
          role?.name === process.env.REACT_APP_SDM ||
          role?.slug === process.env.REACT_APP_SDM ||
          (typeof role === 'string' && role === process.env.REACT_APP_SDM),
      )
    }
    return false
  }

  const isSDM = checkIfSDM()
  const reportingManagerId =
    typeof formData?.employment?.reportingManager === 'object'
      ? formData?.employment?.reportingManager?._id ||
        formData?.employment?.reportingManager?.id ||
        formData?.employment?.reportingManager?.value ||
        ''
      : formData?.employment?.reportingManager || ''
  const reportingManagerName = formData?.employment?.reportingManagerName || ''

  console.log(
    'Resolved RA Location Value:',
    formData?.employment?.raLocation,
    resolvedRaLocationValue,
  )
  return (
    <CRow className="mb-4">
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CIcon icon={cilBriefcase} className="me-2" />
              <h5 className="mb-0">Employment Information</h5>
            </div>
            {canEditSection('employment') && (
              <CButton
                color="primary"
                variant="outline"
                size="sm"
                onClick={() => handleEditToggle('employment')}
              >
                <CIcon icon={cilPencil} className="me-1" />
                {editMode.employment ? 'Cancel' : 'Edit'}
              </CButton>
            )}
            {!canEditSection('employment') && (
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                disabled
                title="Only HR and Admin can edit this section"
              >
                <CIcon icon={cilPencil} className="me-1" />
                Edit (Restricted)
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            <CRow>
              {/* <CCol md={6}>
                <CFormLabel>Department</CFormLabel>
                <AppFormSelect
                  value={formData?.employment?.department || ''}
                  onChange={(e) => handleInputChange('employment', 'department', e.target.value)}
                  disabled={!editMode.employment}
                >
                  <option value="">Select Department</option>
                  <option value="technical">Technical</option>
                  <option value="management">Management</option>
                </AppFormSelect>
                {getFieldError && getFieldError('employment', 'department') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('employment', 'department')}
                  </div>
                )}
              </CCol> */}
              <CCol md={6}>
                <CFormLabel>Reporting Manager</CFormLabel>

                <AsyncSelect
                  name="reportingManager"
                  loadOptions={loadManagerOptions}
                  defaultOptions={managers}
                  cacheOptions={false} // ensure fresh filtering each keystroke
                  isSearchable
                  placeholder="Select Reporting Manager..."
                  noOptionsMessage={() => 'No managers found'}
                  value={
                    reportingManagerId
                      ? managers.find(
                          (option) =>
                            option.value === reportingManagerId || option.label === reportingManagerId,
                        ) || {
                          value: reportingManagerId,
                          label: reportingManagerName || reportingManagerId,
                        }
                      : null
                  }
                  getOptionLabel={(option) => {
                    const r = formatAdminRoleLabel(option.role)
                    return r ? `${option.label || option.name} (${r})` : (option.label || option.name || '')
                  }}
                  getOptionValue={(option) => option.value}
                  onChange={(selectedOption) => {
                    handleInputChange('employment', 'reportingManager', selectedOption?.value || '')
                    handleInputChange(
                      'employment',
                      'reportingManagerName',
                      selectedOption?.label || selectedOption?.name || '',
                    )
                  }}
                  isDisabled={!editMode.employment || isLoadingData}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '38px',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      '&:hover': { borderColor: '#86b7fe' },
                    }),
                    menu: (provided) => ({ ...provided, zIndex: 9999 }),
                  }}
                />
              </CCol>
              {/* <CCol md={6}>
                <CFormLabel>Leave Authority One</CFormLabel>
                <AsyncSelect
                  name="leaveAuthorityOne"
                  loadOptions={loadManagerOptions}
                  defaultOptions={managers}
                  isSearchable
                  placeholder="Select Leave Athority..."
                  value={
                    formData?.employment?.leaveAuthorityOne
                      ? managers.find(
                          (option) =>
                            option.value === formData.employment.leaveAuthorityOne ||
                            option.label === formData.employment.leaveAuthorityOne_Name,
                        ) || {
                          value: formData.employment.leaveAuthorityOne,
                          label: formData.employment.leaveAuthorityOne_Name,
                        }
                      : null
                  }
                  getOptionLabel={(option) => {
                    const r = formatAdminRoleLabel(option.role)
                    return r ? `${option.label || option.name} (${r})` : (option.label || option.name || '')
                  }}
                  getOptionValue={(option) => option.value}
                  onChange={(selectedOption) => {
                    handleInputChange(
                      'employment',
                      'leaveAuthorityOne',
                      selectedOption?.value || '',
                    )
                  }}
                  isDisabled={!editMode.employment || isLoadingData}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '38px',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      '&:hover': {
                        borderColor: '#86b7fe',
                      },
                    }),
                  }}
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>leave Authority Two</CFormLabel>
                <AsyncSelect
                  name="leaveauthorityTwo"
                  loadOptions={loadManagerOptions}
                  defaultOptions={managers}
                  isSearchable
                  placeholder="Select leave authority Two..."
                  value={
                    formData?.employment?.leaveAuthorityTwo
                      ? managers.find(
                          (option) =>
                            option.value === formData.employment.leaveAuthorityTwo ||
                            option.label === formData.employment.leaveAuthorityTwo_Name,
                        ) || {
                          value: formData.employment.leaveAuthorityTwo,
                          label: formData.employment.leaveAuthorityTwo_Name,
                        }
                      : null
                  }
                  getOptionLabel={(option) => {
                    const r = formatAdminRoleLabel(option.role)
                    return r ? `${option.label || option.name} (${r})` : (option.label || option.name || '')
                  }}
                  getOptionValue={(option) => option.value}
                  onChange={(selectedOption) => {
                    handleInputChange(
                      'employment',
                      'leaveAuthorityTwo',
                      selectedOption?.value || '',
                    )
                  }}
                  isDisabled={!editMode.employment || isLoadingData}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '38px',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      '&:hover': {
                        borderColor: '#86b7fe',
                      },
                    }),
                  }}
                />
              </CCol> */}
              <CCol md={6}>
                <CFormLabel>Leave Authority One</CFormLabel>
                <AsyncSelect
                  name="leaveAuthorityOne"
                  loadOptions={loadManagerOptions}
                  defaultOptions={managers}
                  isSearchable
                  placeholder="Select Leave Athority..."
                  value={
                    formData?.employment?.leaveAuthorityOne
                      ? managers.find(
                          (option) =>
                            option.value === formData.employment.leaveAuthorityOne ||
                            option.label === formData.employment.leaveAuthorityOne_Name,
                        ) || {
                          value: formData.employment.leaveAuthorityOne,
                          label: formData.employment.leaveAuthorityOne_Name,
                        }
                      : null
                  }
                  getOptionLabel={(option) => {
                    const r = formatAdminRoleLabel(option.role)
                    return r ? `${option.label || option.name} (${r})` : (option.label || option.name || '')
                  }}
                  getOptionValue={(option) => option.value}
                  onChange={(selectedOption) => {
                    // set both id and name
                    handleInputChange(
                      'employment',
                      'leaveAuthorityOne',
                      selectedOption?.value || '',
                    )
                    handleInputChange(
                      'employment',
                      'leaveAuthorityOne_Name',
                      selectedOption?.label || selectedOption?.name || '',
                    )
                  }}
                  isDisabled={!editMode.employment || isLoadingData}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '38px',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      '&:hover': {
                        borderColor: '#86b7fe',
                      },
                    }),
                  }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Leave Authority Two</CFormLabel>
                <AsyncSelect
                  name="leaveAuthorityTwo" // fixed casing
                  loadOptions={loadManagerOptions}
                  defaultOptions={managers}
                  isSearchable
                  placeholder="Select Leave Authority Two..."
                  value={
                    formData?.employment?.leaveAuthorityTwo
                      ? managers.find(
                          (option) =>
                            option.value === formData.employment.leaveAuthorityTwo ||
                            option.label === formData.employment.leaveAuthorityTwo_Name,
                        ) || {
                          value: formData.employment.leaveAuthorityTwo,
                          label: formData.employment.leaveAuthorityTwo_Name,
                        }
                      : null
                  }
                  getOptionLabel={(option) => {
                    const r = formatAdminRoleLabel(option.role)
                    return r ? `${option.label || option.name} (${r})` : (option.label || option.name || '')
                  }}
                  getOptionValue={(option) => option.value}
                  onChange={(selectedOption) => {
                    // set both id and name
                    handleInputChange(
                      'employment',
                      'leaveAuthorityTwo',
                      selectedOption?.value || '',
                    )
                    handleInputChange(
                      'employment',
                      'leaveAuthorityTwo_Name',
                      selectedOption?.label || selectedOption?.name || '',
                    )
                  }}
                  isDisabled={!editMode.employment || isLoadingData}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '38px',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      '&:hover': {
                        borderColor: '#86b7fe',
                      },
                    }),
                  }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Core Employee</CFormLabel>
                <div className="mt-2">
                  <CFormCheck
                    type="checkbox"
                    id="coreEmployee"
                    label="Is Core Employee"
                    checked={formData?.employment?.core || false}
                    onChange={(e) => handleInputChange('employment', 'core', e.target.checked)}
                    disabled={!editMode.employment}
                  />
                </div>
              </CCol>
              {/* <CCol md={6}>
                <CFormLabel>Designation</CFormLabel>
                <CFormInput
                  value={formData?.employment?.designation || ''}
                  onChange={(e) => handleInputChange('employment', 'designation', e.target.value)}
                  disabled={!editMode.employment}
                  placeholder="Enter Designation"
                />
                {getFieldError && getFieldError('employment', 'designation') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('employment', 'designation')}
                  </div>
                )}
              </CCol> */}
            </CRow>

            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Onboarding Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={formData?.employment?.onboardingDate || ''}
                  onChange={(e) =>
                    handleInputChange('employment', 'onboardingDate', e.target.value)
                  }
                  disabled={!editMode.employment}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Joining Date</CFormLabel>
                <CFormInput
                  type="date"
                  value={formData?.employment?.joiningDate || ''}
                  onChange={(e) => handleInputChange('employment', 'joiningDate', e.target.value)}
                  disabled={!editMode.employment}
                />
              </CCol>
            </CRow>

            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Employee Type</CFormLabel>
                <AppFormSelect
                  value={formData?.employment?.employeeType || ''}
                  onChange={(e) => handleInputChange('employment', 'employeeType', e.target.value)}
                  disabled={!editMode.employment}
                >
                  <option value="">Select Employee Type</option>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                  <option value="intern">Intern</option>
                  <option value="consultant">Consultant</option>
                </AppFormSelect>
              </CCol>
              {/* <CCol md={6}>
                <CFormLabel>Status</CFormLabel>
                <AppFormSelect
                  value={formData?.employment?.status || ''}
                  onChange={(e) => handleInputChange('employment', 'status', e.target.value)}
                  disabled={!editMode.employment}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                  <option value="on-leave">On Leave</option>
                </AppFormSelect>
              </CCol> */}
        
            </CRow>

            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Company Name</CFormLabel>
                <AsyncSelect
                  name="companyName"
                  loadOptions={loadCompanyOptions}
                  defaultOptions={companies}
                  isSearchable
                  placeholder="Select Company..."
                  value={
                    formData?.employment?.companyName
                      ? companies.find((option) => option.value === formData.employment.companyName)
                      : null
                  }
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  onChange={(selectedOption) => {
                    handleInputChange('employment', 'companyName', selectedOption?.value || '')
                  }}
                  isDisabled={!editMode.employment || isLoadingData}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: '38px',
                      border: '1px solid #ced4da',
                      borderRadius: '0.375rem',
                      '&:hover': {
                        borderColor: '#86b7fe',
                      },
                    }),
                  }}
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>Work Location</CFormLabel>
                <CFormInput
                  value={formData?.employment?.location || ''}
                  onChange={(e) => handleInputChange('employment', 'location', e.target.value)}
                  disabled={!editMode.employment}
                  placeholder="Enter Work Location"
                />
              </CCol>
            </CRow>

            {/* RA Location, RA Branch, and Group Information */}
            <CRow className="mt-3">
              {/* <CCol md={4}>
                <CFormLabel>RA Branch</CFormLabel>
                <AppFormSelect
                  value={formData?.employment?.raBranch || ''}
                  onChange={(e) => handleInputChange('employment', 'raBranch', e.target.value)}
                  disabled={!editMode.employment || isLoadingData}
                >
                  <option value="">Select RA Branch</option>
                  {locations.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </AppFormSelect>
                <small className="text-muted">
                  {formData?.employment?.raBranch
                    ? locations.find((loc) => loc.value === formData.employment.raBranch)?.label ||
                      'N/A'
                    : 'N/A - Only for Branch Manager role'}
                </small>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Group</CFormLabel>
                <AppFormSelect
                  value={formData?.employment?.group || ''}
                  onChange={(e) => handleInputChange('employment', 'group', e.target.value)}
                  disabled={!editMode.employment || isLoadingData}
                >
                  <option value="">Select Group</option>
                  {groups.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </AppFormSelect>
                <small className="text-muted">
                  {formData?.employment?.group
                    ? groups.find((group) => group.value === formData.employment.group)?.label ||
                      'N/A'
                    : 'N/A - Only for Field Engineer role'}
                </small>
              </CCol> */}

              {/* here i want to add the field for the ra location to get the location */}
              {/* <CCol md={4}>
                <CFormLabel>RA Location</CFormLabel>
                <CFormInput
                  value={formData?.employment?.raLocation || ''}
                  onChange={(e) => handleInputChange('employment', 'raLocation', e.target.value)}
                  disabled={!editMode.employment}
                  placeholder="Enter RA Location"
                />
              </CCol> */}
              {/* <CCol md={6}>
                <CFormLabel>RA Location</CFormLabel>
                <AppFormSelect
                  value={resolvedRaLocationValue}
                  onChange={(e) => handleInputChange('employment', 'raLocation', e.target.value)}
                  disabled={!editMode.employment}
                >
                  <option value="">Select RA Location</option>
                  {locations.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </AppFormSelect>
              </CCol> */}
              <CCol md={6}>
                <CFormLabel>RA Location</CFormLabel>
                <AppFormSelect
                  value={
                    formData?.employment?.raLocation?.value ||
                    (typeof formData?.employment?.raLocation === 'string'
                      ? formData.employment.raLocation
                      : '') ||
                    ''
                  }
                  onChange={(e) => {
                    const selectedValue = e.target.value

                    const selectedLocation = locations.find(
                      (loc) => String(loc.value) === String(selectedValue),
                    )

                    if (selectedLocation) {
                      handleInputChange('employment', 'raLocation', {
                        value: selectedLocation.value,
                        label: selectedLocation.label || selectedLocation.name,
                      })
                    } else {
                      handleInputChange('employment', 'raLocation', null)
                    }
                  }}
                  disabled={!editMode.employment}
                >
                  <option value="">Select RA Location</option>
                  {locations.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </AppFormSelect>
              </CCol>

              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel className="fw-semibold">Holiday Template *</CFormLabel>
                  <AsyncSelect
                    name="template"
                    isMulti
                    isSearchable
                    placeholder="Select holiday templates..."
                    loadOptions={async (inputValue, callback) => {
                      try {
                        const filtered = templates.filter((t) =>
                          t.name.toLowerCase().includes(inputValue.toLowerCase()),
                        )
                        callback(filtered.map((t) => ({ value: t._id, label: t.name })))
                      } catch (err) {
                        console.error(err)
                        callback([])
                      }
                    }}
                    defaultOptions={templates.map((t) => ({ value: t._id, label: t.name }))}
                    value={
                      Array.isArray(formData?.employment?.template)
                        ? formData.employment.template
                            .map((id) => templates.find((t) => t._id === id))
                            .filter(Boolean)
                            .map((t) => ({ value: t._id, label: t.name }))
                        : []
                    }
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    onChange={(selectedOptions) => {
                      const selectedIds = Array.isArray(selectedOptions)
                        ? selectedOptions.map((o) => o.value)
                        : []
                      handleInputChange('employment', 'template', selectedIds)
                    }}
                    disabled={!editMode.employment}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        minHeight: '38px',
                        border: '1px solid #ced4da',
                        borderRadius: '0.375rem',
                        '&:hover': { borderColor: '#86b7fe' },
                      }),
                      multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#e3f2fd',
                        borderRadius: '4px',
                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: '#1976d2',
                        fontSize: '0.875rem',
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        color: '#1976d2',
                        '&:hover': { backgroundColor: '#bbdefb', color: '#0d47a1' },
                      }),
                    }}
                  />
                  <small className="text-muted">
                    You can select multiple holiday templates for this employee
                  </small>
                </div>
              </CCol>
            </CRow>
            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Aadhar Number</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData?.employment?.aadharNo || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    value = value.slice(0, 12)
                    value = value.replace(/(\d{4})(?=\d)/g, '$1 ')

                    handleInputChange('employment', 'aadharNo', value)
                  }}
                  placeholder="1234 5678 9012"
                  maxLength={14}
                  disabled={!editMode.employment}
                />
                {getFieldError && getFieldError('employment', 'aadharNo') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('employment', 'aadharNo')}
                  </div>
                )}
              </CCol>
            </CRow>
            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Work Type</CFormLabel>
                <AppFormSelect
                  value={formData?.employment?.workType || ''}
                  onChange={(e) => handleInputChange('employment', 'workType', e.target.value)}
                  disabled={!editMode.employment}
                >
                  <option value="">Select Work Type</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </AppFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Shift</CFormLabel>
                <AppFormSelect
                  value={formData?.employment?.shift || ''}
                  onChange={(e) => handleInputChange('employment', 'shift', e.target.value)}
                  disabled={!editMode.employment}
                >
                  <option value="">Select Shift</option>
                  <option value="day">Day Shift</option>
                  <option value="night">Night Shift</option>
                  <option value="rotating">Rotating Shift</option>
                </AppFormSelect>
              </CCol>
            </CRow>

            {/* Salary Information */}
            <CRow className="mt-4">
              <CCol xs={12}>
                <h6 className="text-muted mb-3">Salary Information</h6>
              </CCol>
              <CCol md={6}>
                <CFormLabel>CTC (Monthly)</CFormLabel>
                <CFormInput
                  type="number"
                  value={formData?.employment?.ctcPerMonth || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    handleInputChange('employment', 'ctcPerMonth', value)
                    // Auto-fill CTC in words
                    const words = convertNumberToWords(value)
                    handleInputChange('employment', 'ctcPerMonthInWords', words)
                  }}
                  disabled={!editMode.employment}
                  placeholder="Enter CTC"
                />
                {getFieldError && getFieldError('employment', 'ctcPerMonth') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('employment', 'ctcPerMonth')}
                  </div>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>CTC in Words</CFormLabel>
                <CFormInput
                  value={formData?.employment?.ctcPerMonthInWords || ''}
                  onChange={(e) =>
                    handleInputChange('employment', 'ctcPerMonthInWords', e.target.value)
                  }
                  disabled={!editMode.employment}
                  placeholder="Enter CTC in words"
                />
              </CCol>
            </CRow>

            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>HRA (Monthly)</CFormLabel>
                <CFormInput
                  type="number"
                  value={formData?.employment?.hraPerMonth || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    handleInputChange('employment', 'hraPerMonth', value)
                    // Auto-fill HRA in words
                    const words = convertNumberToWords(value)
                    handleInputChange('employment', 'hraInWords', words)
                  }}
                  disabled={!editMode.employment}
                  placeholder="Enter HRA"
                />
                {getFieldError && getFieldError('employment', 'hraPerMonth') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('employment', 'hraPerMonth')}
                  </div>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>HRA in Words</CFormLabel>
                <CFormInput
                  value={formData?.employment?.hraInWords || ''}
                  onChange={(e) => handleInputChange('employment', 'hraInWords', e.target.value)}
                  disabled={!editMode.employment}
                  placeholder="Enter HRA in words"
                />
              </CCol>
            </CRow>

            {/* SDM Role Fields: MA Branch and Group */}
            {isSDM && (
              <CRow className="mt-3">
                <CCol md={6}>
                  <CFormLabel>MA Branch</CFormLabel>
                  <AppFormSelect
                    value={
                      Array.isArray(formData?.profile?.raBranch)
                        ? formData.profile.raBranch[0] || ''
                        : formData?.profile?.raBranch || ''
                    }
                    onChange={(e) => {
                      const value = e.target.value
                      handleInputChange('profile', 'raBranch', value ? [value] : [])
                    }}
                    disabled={!editMode.employment}
                  >
                    <option value="">Select MA Branch</option>
                    {locations.map((location) => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </AppFormSelect>
                  <small className="text-muted">Required for SDM role</small>
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Group</CFormLabel>
                  <AsyncSelect
                    isMulti
                    loadOptions={loadGroupOptions}
                    defaultOptions={defaultGroupOptions}
                    value={
                      Array.isArray(formData?.profile?.group)
                        ? formData.profile.group
                            .map((id) =>
                              [...defaultGroupOptions, ...groups].find(
                                (g) => g.value === id || g._id === id,
                              ),
                            )
                            .filter(Boolean)
                        : []
                    }
                    onChange={(selectedOptions) => {
                      const selectedIds = Array.isArray(selectedOptions)
                        ? selectedOptions.map((o) => o.value)
                        : []
                      handleInputChange('profile', 'group', selectedIds)
                    }}
                    isDisabled={!editMode.employment}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        minHeight: '38px',
                        border: '1px solid #ced4da',
                        borderRadius: '0.375rem',
                        '&:hover': { borderColor: '#86b7fe' },
                      }),
                      multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#e3f2fd',
                        borderRadius: '4px',
                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: '#1976d2',
                        fontSize: '0.875rem',
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        color: '#1976d2',
                        '&:hover': { backgroundColor: '#bbdefb', color: '#0d47a1' },
                      }),
                    }}
                  />
                  <small className="text-muted">
                    You can select multiple groups for SDM role
                  </small>
                </CCol>
              </CRow>
            )}

            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel className="fw-semibold">Assets</CFormLabel>
                <CFormTextarea
                  type="text"
                  value={formData?.employment?.remark}
                  placeholder="Please Enter Assets for this Employee"
                  className="bg-light"
                  disabled={!editMode.employment}
                  onChange={(e) => handleInputChange('employment', 'remark', e.target.value)}
                />
              </CCol>
            </CRow>
            {editMode.employment && (
              <CRow className="mt-3">
                <CCol xs={12} className="d-flex justify-content-end">
                  <CButton
                    color="success"
                    className="me-2"
                    onClick={() => handleSave('employment')}
                  >
                    <CIcon icon={cilSave} className="me-1" />
                    Save
                  </CButton>
                  <CButton color="secondary" onClick={() => handleCancel('employment')}>
                    <CIcon icon={cilX} className="me-1" />
                    Cancel
                  </CButton>
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EmploymentInfo
