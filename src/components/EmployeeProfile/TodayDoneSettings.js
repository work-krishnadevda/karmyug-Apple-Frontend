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
import { cilPencil, cilSave, cilX, cilCheckCircle } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const TodayDoneSettings = ({
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
  const weekDays = [
    { key: 'sunday', label: 'Sun' },
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
  ]

  const handleDayToggle = (dayKey) => {
    const currentDays = formData?.todayDone?.days || {}
    const currentEnabled = currentDays[dayKey]?.enabled || false
    handleInputChange('todayDone', {
      ...formData?.todayDone,
      days: {
        ...currentDays,
        [dayKey]: {
          ...currentDays[dayKey],
          enabled: !currentEnabled,
        },
      },
    })
  }

  return (
    <CRow className="mb-4">
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center bg-success text-white">
            <div className="d-flex align-items-center">
              <CIcon icon={cilCheckCircle} className="me-2" />
              <h5 className="mb-0">Today Done Settings</h5>
            </div>
            {canEditSection('todayDone') && (
              <CButton
                color="light"
                variant="outline"
                size="sm"
                onClick={() => handleEditToggle('todayDone')}
              >
                <CIcon icon={cilPencil} className="me-1" />
                {editMode.todayDone ? 'Cancel' : 'Edit'}
              </CButton>
            )}
            {!canEditSection('todayDone') && (
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
            {editAttempts?.todayDone && (
              <CAlert color="warning" className="mb-3">
                <strong>Note:</strong> Today Done settings have already been edited and cannot be
                modified again.
              </CAlert>
            )}

            <div className="border rounded p-3 bg-light">
              <div className="mb-3">
                <CFormCheck
                  type="checkbox"
                  id="today_done_enabled"
                  label="Enable Today Done (Auto mark day as done at specified time)"
                  checked={formData?.todayDone?.enabled || false}
                  onChange={(e) =>
                    handleInputChange('todayDone', {
                      ...formData?.todayDone,
                      enabled: e.target.checked,
                    })
                  }
                  disabled={!editMode.todayDone || editAttempts?.todayDone}
                />
                <small className="text-muted d-block mt-1">
                  Automatically mark the day as &quot;done&quot; at the specified time for each day
                </small>
              </div>

              {formData?.todayDone?.enabled && (
                <>
                  <div className="mb-3">
                    <CFormLabel className="fw-semibold mb-3">Select Days</CFormLabel>
                    <div className="row g-2">
                      {weekDays.map((day) => {
                        const dayConfig = formData?.todayDone?.days?.[day.key] || {
                          enabled: false,
                        }
                        const isDisabled = !editMode.todayDone || editAttempts?.todayDone
                        return (
                          <div key={day.key} className="col-auto">
                            <div
                              className={`btn ${dayConfig.enabled ? 'btn-success' : 'btn-outline-secondary'} ${isDisabled ? 'disabled' : ''}`}
                              style={{ minWidth: '60px', cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                              onClick={() => {
                                if (!isDisabled) {
                                  handleDayToggle(day.key)
                                }
                              }}
                            >
                              {day.label}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <small className="text-muted d-block mt-2">
                      Click on days to enable/disable Today Done
                    </small>
                  </div>

                  <div className="alert alert-success">
                    <h6 className="mb-2">
                      <CIcon icon={cilCheckCircle} className="me-2" />
                      How it works:
                    </h6>
                    <ul className="mb-0 small">
                      <li>Enable the days you want to auto-mark as &quot;Today Done&quot;</li>
                      <li>On enabled days, the system will track daily work completion</li>
                      <li>This helps track daily work completion automatically</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {editMode.todayDone && !editAttempts?.todayDone && (
              <CRow className="mt-3">
                <CCol xs={12} className="d-flex justify-content-end">
                  <CButton
                    color="success"
                    className="me-2"
                    onClick={() => handleSave('todayDone')}
                  >
                    <CIcon icon={cilSave} className="me-1" />
                    Save
                  </CButton>
                  <CButton color="secondary" onClick={() => handleCancel('todayDone')}>
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

export default TodayDoneSettings
