import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCanPunchIn, selectPunchInDisabledReason, checkPunchInAvailability } from 'src/store'
import { fetchProfileData, selectProfileData } from 'src/store'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CSpinner,
} from '@coreui/react'
import { useCamera } from 'src/hooks/useCamera'
import { useLocation } from 'src/hooks/useLocation'
import { useEffect, useState, useRef, useCallback } from 'react'
import { toast } from 'react-toastify'
import BasicProvider from 'src/constants/BasicProvider'
const PunchInModal = ({ visible, onYes, onNo, userData, isPunchingIn = false }) => {
  const { webcamRef, image, capture, WebcamComponent, setImage, cameraError, requestCameraAccess } = useCamera()
  const { location, error } = useLocation(process.env.REACT_APP_GOOGLE_API_KEY)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [onLeaveToday, setOnLeaveToday] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState([])
  const [lastPage, setLastPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const perPage = 10
  const dispatch = useDispatch()
  const profileData = useSelector(selectProfileData)
const userData2 = useSelector((state) => state.userData)
  const checkIfOnLeave = (leaves) => {
    const today = new Date().toISOString().split('T')[0]
    const isOnLeave = leaves.some((l) => {
      const start = new Date(l.start_date).toISOString().split('T')[0]
      const end = new Date(l.end_date).toISOString().split('T')[0]
      return l.status === 'Approved' && today >= start && today <= end
    })
    setOnLeaveToday(isOnLeave)
  }

  useEffect(() => {
  if (userData2?._id && !profileData?._id) {
    dispatch(fetchProfileData(userData2._id))
  }
}, [userData2, profileData, dispatch])

  useEffect(() => {
  dispatch(checkPunchInAvailability())
}, [dispatch])

const canPunchIn = useSelector(selectCanPunchIn)
const punchInDisabledReason = useSelector(selectPunchInDisabledReason)

  const fetchLeaveData = async (page = 1) => {
    try {
      setLoading(true)
      const queryParams = []
      if (statusFilter) queryParams.push(`status=${statusFilter}`)
      if (typeFilter) queryParams.push(`leaveType=${typeFilter}`)
      if (fromDate) queryParams.push(`fromDate=${fromDate}`)
      if (toDate) queryParams.push(`toDate=${toDate}`)
      queryParams.push(`page=${page}`, `count=${perPage}`)
      if (userData) queryParams.push(`user=${userData?._id}`)

      const queryString = queryParams.join('&')

      const response = await new BasicProvider(`leaves?${queryString}`, dispatch).getRequest()
      setLeaveRequests(response.data)
      setCurrentPage(response.current_page)
      setLastPage(response.last_page)
      setTotalRecords(response.total)

      //  Check leave status for today
      checkIfOnLeave(response.data)
    } catch (error) {
      toast.error('Data Not Found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userData?._id) {
      fetchLeaveData(currentPage)
    }
  }, [userData, currentPage, statusFilter, typeFilter, fromDate, toDate]) // Added currentPage

  // ✅ Debounce/Throttle for Punch-In button (500ms minimum)
  const debounceTimerRef = useRef(null)
  const lastClickTimeRef = useRef(0)
  const DEBOUNCE_DELAY = 500 // 500ms minimum as per requirement

  // ✅ Debounced Punch-In handler
  const handlePunchInClick = useCallback(() => {
    const now = Date.now()
    const timeSinceLastClick = now - lastClickTimeRef.current

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // If clicked within 500ms, ignore the click
    if (timeSinceLastClick < DEBOUNCE_DELAY) {
      console.log('Punch-In: Click ignored (within debounce window)')
      return
    }

    // Validation checks
    if (onLeaveToday) {
      toast.error('You are on leave, punch in is not allowed. Please contact the HR/Admin.')
      return
    }

    if (!canPunchIn) {
      toast.error(punchInDisabledReason || 'Punch-in not allowed today.')
      return
    }

    if (!image) {
      toast.error('Please capture your photo before Punch In.')
      return
    }

    if (!location) {
      toast.error('Location is required for Punch In.')
      return
    }

    // ✅ Disable button immediately on click
    setIsButtonLoading(true)

    // Update last click time
    lastClickTimeRef.current = now

    // Execute the punch-in action
    debounceTimerRef.current = setTimeout(() => {
      onYes({ image, location })
      setTimeout(() => setImage(null), 2000)
    }, DEBOUNCE_DELAY)
  }, [onYes, image, location, onLeaveToday, canPunchIn, punchInDisabledReason])

  // Reset button loading state when API call completes or modal closes
  useEffect(() => {
    if (!isPunchingIn) {
      setIsButtonLoading(false)
    }
  }, [isPunchingIn])

  // Reset button loading when modal closes
  useEffect(() => {
    if (!visible) {
      setIsButtonLoading(false)
      return
    }

    requestCameraAccess()
  }, [visible, requestCameraAccess])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      setIsButtonLoading(false)
    }
  }, [])

  return (
    <CModal alignment="center" visible={visible} backdrop="static" className="punch-in-modal">
      <CModalHeader closeButton={false} className="punch-in-modal__header">
        <CModalTitle className="punch-in-modal__title">Punch In Confirmation</CModalTitle>
      </CModalHeader>

      <CModalBody className="punch-in-modal__body text-center">
        <div className="punch-in-modal__profile">
          <h5 className="mb-1">{userData?.name || 'Employee Name'}</h5>
          <p className="mb-0">
            {userData?.role?.[0]?.display_name || userData?.role?.[0]?.name || 'Role'}
          </p>
        </div>

        <div className="punch-in-modal__panel">
          <h6 className="mb-3 punch-in-modal__section-title">Live Camera Capture</h6>

          <div className="punch-in-modal__camera-frame">
            {image ? (
              <img src={image} alt="Captured" className="punch-in-modal__captured-image" />
            ) : cameraError ? (
              <div className="punch-in-modal__camera-error">
                <p className="mb-0">{cameraError}</p>
              </div>
            ) : (
              <div className="punch-in-modal__webcam-wrap">
                <WebcamComponent />
              </div>
            )}
          </div>

          <div className="punch-in-modal__camera-actions">
            {!image ? (
              <CButton size="sm" className="punch-in-modal__mini-btn punch-in-modal__mini-btn--primary" onClick={capture}>
                Capture
              </CButton>
            ) : (
              <CButton
                size="sm"
                className="punch-in-modal__mini-btn punch-in-modal__mini-btn--secondary"
                onClick={() => window.location.reload()}
              >
                Retake
              </CButton>
            )}
          </div>
        </div>

        <div className="punch-in-modal__panel punch-in-modal__panel--soft">
          <h6 className="mb-3 punch-in-modal__section-title">Current Location</h6>

          <div className="punch-in-modal__location-box">
            {error && <p className="punch-in-modal__location-error mb-0">{error}</p>}
            {!location && !error && (
              <div className="punch-in-modal__location-loading">
                <CSpinner size="sm" />
                <span>Fetching your current location...</span>
              </div>
            )}
            {location && <p className="punch-in-modal__location-success mb-0">{location.address}</p>}
          </div>
        </div>

        <div className="punch-in-modal__status-note">
          <h6 className="mb-0">Ready to start your workday?</h6>
        </div>
      </CModalBody>

      {onLeaveToday && (
        <div className="punch-in-modal__leave-alert">
          <h6 className="mb-0">
              Today you are on Leave, please contact HR and admin for punch in
          </h6>
        </div>
      )}

      <CModalFooter className="punch-in-modal__footer">
        <CButton
          className="punch-in-modal__action-btn punch-in-modal__action-btn--primary"
          disabled={
            isPunchingIn ||
            isButtonLoading ||
            !canPunchIn ||
            onLeaveToday ||
            !image ||
            !location
          }
          onClick={handlePunchInClick}
        >
          {(isPunchingIn || isButtonLoading) ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Please wait...
            </>
          ) : (
            'Yes, Punch In'
          )}
        </CButton>

        <CButton className="punch-in-modal__action-btn punch-in-modal__action-btn--ghost" onClick={onNo}>
          No, Later
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default PunchInModal
