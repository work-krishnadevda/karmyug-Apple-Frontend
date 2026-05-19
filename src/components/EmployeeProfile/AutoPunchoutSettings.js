import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormCheck,
  CFormLabel,
  CAlert,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { cilPencil, cilSave, cilX, cilClock } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AutoPunchoutSettings = ({
  formData,
  editMode,
  canEditSection,
  handleEditToggle,
  handleSave,
  handleCancel,
  handleInputChange,
  editAttempts,
  getFieldError,
}) => {
  const workingDays = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ]

  const timeoutOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours' },
    { value: 540, label: '9 hours' },
    { value: 600, label: '10 hours' },
    { value: 660, label: '11 hours' },
    { value: 720, label: '12 hours' },
  ]

  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
  ]

  const handleWorkingDayChange = (dayKey, checked) => {
    const currentDays = formData?.autoPunchout?.workingDays || []
    const newDays = checked ? [...currentDays, dayKey] : currentDays.filter((d) => d !== dayKey)

    handleInputChange('autoPunchout', {
      ...formData?.autoPunchout,
      workingDays: newDays,
    })
  }

  return (
    <CRow className="mb-4">
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CIcon icon={cilClock} className="me-2" />
              <h5 className="mb-0">Automatic Punchout Settings</h5>
            </div>
            {canEditSection('autoPunchout') && (
              <CButton
                color="primary"
                variant="outline"
                size="sm"
                onClick={() => handleEditToggle('autoPunchout')}
              >
                <CIcon icon={cilPencil} className="me-1" />
                {editMode.autoPunchout ? 'Cancel' : 'Edit'}
              </CButton>
            )}
            {!canEditSection('autoPunchout') && (
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
            {editAttempts?.autoPunchout && (
              <CAlert color="warning" className="mb-3">
                <strong>Note:</strong> Auto punchout settings have already been edited and cannot be
                modified again.
              </CAlert>
            )}

            <div className="border rounded p-3 bg-light">
              <div className="mb-3">
                <CFormCheck
                  type="checkbox"
                  id="auto_punchout_enabled"
                  label="Enable Automatic Punchout (Inactivity-based)"
                  checked={formData?.autoPunchout?.enabled || false}
                  onChange={(e) =>
                    handleInputChange('autoPunchout', {
                      ...formData?.autoPunchout,
                      enabled: e.target.checked,
                    })
                  }
                  disabled={!editMode.autoPunchout || editAttempts?.autoPunchout}
                />
                <small className="text-muted d-block mt-1">
                  Automatically punch out this employee after specified inactivity period
                </small>
              </div>

              {formData?.autoPunchout?.enabled && (
                <>
                  <CRow>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel className="fw-semibold">Inactivity Timeout</CFormLabel>
                        <AppFormSelect
                          value={formData?.autoPunchout?.inactivityTimeoutMinutes || 30}
                          onChange={(e) =>
                            handleInputChange('autoPunchout', {
                              ...formData?.autoPunchout,
                              inactivityTimeoutMinutes: parseInt(e.target.value),
                            })
                          }
                          disabled={!editMode.autoPunchout || editAttempts?.autoPunchout}
                        >
                          {timeoutOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </AppFormSelect>
                        <small className="text-muted d-block mt-1">
                          Time of inactivity before automatic punchout
                        </small>
                      </div>
                    </CCol>
                    <CCol md={6}>
                      <div className="mb-3">
                        <CFormLabel className="fw-semibold">Timezone</CFormLabel>
                        <AppFormSelect
                          value={formData?.autoPunchout?.timezone || 'Asia/Kolkata'}
                          onChange={(e) =>
                            handleInputChange('autoPunchout', {
                              ...formData?.autoPunchout,
                              timezone: e.target.value,
                            })
                          }
                          disabled={!editMode.autoPunchout || editAttempts?.autoPunchout}
                        >
                          {timezoneOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </AppFormSelect>
                        <small className="text-muted d-block mt-1">
                          Timezone for inactivity tracking
                        </small>
                      </div>
                    </CCol>
                  </CRow>

                  <div className="mb-3">
                    <CFormLabel className="fw-semibold">Working Days</CFormLabel>
                    <div className="row">
                      {workingDays.map((day) => (
                        <div key={day.key} className="col-3 mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`day_${day.key}`}
                              checked={(formData?.autoPunchout?.workingDays || []).includes(
                                day.key,
                              )}
                              onChange={(e) => handleWorkingDayChange(day.key, e.target.checked)}
                              disabled={!editMode.autoPunchout || editAttempts?.autoPunchout}
                            />
                            <label className="form-check-label" htmlFor={`day_${day.key}`}>
                              {day.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                    <small className="text-muted d-block mt-1">
                      Select days when automatic punchout should be active
                    </small>
                  </div>

                  <div className="mb-3">
                    <CFormCheck
                      type="checkbox"
                      id="notify_before_punchout"
                      label="Notify before automatic punchout"
                      checked={formData?.autoPunchout?.notifyBeforePunchout || false}
                      onChange={(e) =>
                        handleInputChange('autoPunchout', {
                          ...formData?.autoPunchout,
                          notifyBeforePunchout: e.target.checked,
                        })
                      }
                      disabled={!editMode.autoPunchout || editAttempts?.autoPunchout}
                    />
                    <small className="text-muted d-block mt-1">
                      Send notification to employee before automatic punchout occurs
                    </small>
                  </div>

                  <div className="alert alert-info">
                    <h6 className="mb-2">
                      <CIcon icon={cilClock} className="me-2" />
                      How it works:
                    </h6>
                    <ul className="mb-0 small">
                      <li>System tracks user activity (mouse movement, clicks, keyboard input)</li>
                      <li>
                        If no activity for{' '}
                        <strong>
                          {formData?.autoPunchout?.inactivityTimeoutMinutes || 30} minutes
                        </strong>
                        , automatic punchout occurs
                      </li>
                      <li>Only active on selected working days</li>
                      <li>
                        User will be notified before punchout:{' '}
                        {formData?.autoPunchout?.notifyBeforePunchout ? 'Yes' : 'No'}
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {editMode.autoPunchout && !editAttempts?.autoPunchout && (
              <CRow className="mt-3">
                <CCol xs={12} className="d-flex justify-content-end">
                  <CButton
                    color="success"
                    className="me-2"
                    onClick={() => handleSave('autoPunchout')}
                  >
                    <CIcon icon={cilSave} className="me-1" />
                    Save
                  </CButton>
                  <CButton color="secondary" onClick={() => handleCancel('autoPunchout')}>
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

export default AutoPunchoutSettings
