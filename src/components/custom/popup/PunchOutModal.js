import React, { useState, useEffect } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CImage,
  CSpinner,
  CFormInput,
  CFormTextarea,
  CFormLabel,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import { useCamera } from 'src/hooks/useCamera'
import { useLocation } from 'src/hooks/useLocation'

const PunchOutModal = ({ visible, onYes, onNo, userData, punchInTime, todayDoneSettings }) => {
  const [todayDraftDone, setTodayDraftDone] = useState('')
  const [remark, setRemark] = useState('')

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = dayNames[new Date().getDay()]

  const isTodayDoneEnabled = todayDoneSettings?.enabled && todayDoneSettings?.days?.[today]?.enabled

  // Debug logging
  useEffect(() => {
    if (visible) {
      console.log('=== Today Done Debug ===')
      console.log('Today is:', today)
      console.log('todayDoneSettings:', todayDoneSettings)
      console.log('todayDoneSettings?.enabled:', todayDoneSettings?.enabled)
      console.log('todayDoneSettings?.days:', todayDoneSettings?.days)
      console.log(`todayDoneSettings?.days?.[${today}]:`, todayDoneSettings?.days?.[today])
      console.log('isTodayDoneEnabled:', isTodayDoneEnabled)
      console.log('========================')
    }
  }, [visible, todayDoneSettings, today, isTodayDoneEnabled])

  useEffect(() => {
    if (!visible) {
      setTodayDraftDone('')
      setRemark('')
    }
  }, [visible])

  const formatTime = (timeString) => {
    if (!timeString) return '--'
    return new Date(timeString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const calculateDuration = () => {
    if (!punchInTime) return '--'
    const now = new Date()
    const punchIn = new Date(punchInTime)
    const diffMs = now - punchIn
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }
  const { webcamRef, image, capture, WebcamComponent, setImage } = useCamera()
  const { location, error } = useLocation(process.env.REACT_APP_GOOGLE_API_KEY)

  const canPunchOut = image && (!isTodayDoneEnabled || (todayDraftDone !== '' && todayDraftDone >= 0))
  return (
    <CModal alignment="center" visible={visible} backdrop="static" className="punch-out-modal">
      <CModalHeader style={{ 
        background: 'linear-gradient(135deg, #dc3545, #c82333)', 
        color: 'white',
        border: 'none'
      }}>
        <CModalTitle style={{ color: 'white', fontWeight: 'bold' }}>Punch Out Confirmation</CModalTitle>
      </CModalHeader>
      <CModalBody className="text-center" style={{ padding: '1rem' }}>
        <div className="mb-3">
          <h5 className="mb-1">{userData?.name || 'Employee Name'}</h5>
          <p className="text-muted small mb-0">
            {userData?.role?.[0]?.display_name || userData?.role?.[0]?.name || 'Role'}
          </p>
        </div>

        <div className="alert alert-danger mb-3 py-2">
          <h6 className="mb-1 small">Work Summary</h6>
          <div className="row text-start">
            <div className="col-6">
              <strong className="small">Punch In:</strong> <span className="small">{formatTime(punchInTime)}</span>
            </div>
            <div className="col-6">
              <strong className="small">Duration:</strong> <span className="small">{calculateDuration()}</span>
            </div>
          </div>
        </div>

        {/* Camera Frame */}
        <div className="mb-3">
          <h6 className="mb-1 small">
            Live Camera Capture 
            {!image && <span className="text-danger"> *</span>}
          </h6>
          {image ? (
            <img
              src={image}
              alt="Captured"
              width={200}
              height={140}
              style={{ borderRadius: '6px' }}
            />
          ) : (
            <WebcamComponent />
          )}
          <div className="mt-1">
            {!image ? (
              <CButton size="sm" color="danger" onClick={capture} style={{ color: 'white' }}>
                Capture
              </CButton>
            ) : (
              <CButton size="sm" color="warning" onClick={() => window.location.reload()}>
                Retake
              </CButton>
            )}
          </div>
          {!image && (
            <div className="mt-1">
              <small className="text-danger">
                <i className="fas fa-exclamation-triangle me-1"></i>
                Image capture is required to punch out
              </small>
            </div>
          )}
        </div>

        {/* Location Info */}
        <div className="mb-2">
          <h6 className="mb-1 small">Current Location</h6>
          {error && <p className="text-danger small mb-0">{error}</p>}
          {!location && !error && <CSpinner size="sm" />}
          {location && <p className="text-success small mb-0">{location.address}</p>}
        </div>

        {/* Today Done Fields - Only show if today is enabled */}
        {isTodayDoneEnabled && (
          <div className="mb-3 p-3 border rounded bg-white">
            <h6 className="mb-3 text-success">
              <i className="fas fa-check-circle me-2"></i>
              Today Done Report
            </h6>
            <div className="mb-3">
              <CFormLabel className="small fw-semibold">
                Today Draft Done <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="number"
                min="0"
                placeholder="Enter number of drafts done today"
                value={todayDraftDone}
                onChange={(e) => setTodayDraftDone(e.target.value)}
                className="form-control-sm"
              />
            </div>
            <div className="mb-2">
              <CFormLabel className="small fw-semibold">Remark</CFormLabel>
              <CFormTextarea
                rows={2}
                placeholder="Add any remarks (optional)"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                className="form-control-sm"
              />
            </div>
          </div>
        )}
        
        <div className="alert alert-warning py-2">
          <h6 className="mb-0 small">Ready to end your workday?</h6>
        </div>
      </CModalBody>

      <CModalFooter className="justify-content-center">
        <CButton
          color="danger"
          className="me-3 px-4"
          disabled={!canPunchOut}
          onClick={() => {
            onYes({ 
              image, 
              location,
              todayDraftDone: isTodayDoneEnabled ? parseInt(todayDraftDone) : null,
              remark: isTodayDoneEnabled ? remark : null
            })
            setTimeout(() => {
              setImage(null)
              setTodayDraftDone('')
              setRemark('')
            }, 2000)
          }}
          style={{ 
            color: 'white',
            opacity: !canPunchOut ? 0.6 : 1,
            cursor: !canPunchOut ? 'not-allowed' : 'pointer'
          }}
        >
          {!image ? 'Please Capture Image First' : 
           (isTodayDoneEnabled && todayDraftDone === '') ? 'Enter Draft Done Count' : 
           'Yes, Punch Out'}
        </CButton>
        <CButton color="secondary" className="px-4" onClick={onNo}>
          No, Continue Working
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default PunchOutModal
