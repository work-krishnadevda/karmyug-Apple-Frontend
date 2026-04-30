

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
  CImage,
  CSpinner,
} from '@coreui/react'
import { useCamera } from 'src/hooks/useCamera'
import { useLocation } from 'src/hooks/useLocation'
import { useEffect, useState, useRef, useCallback } from 'react'
import { toast } from 'react-toastify'
import BasicProvider from 'src/constants/BasicProvider'
const PunchInModal = ({ visible, onYes, onNo, userData, isPunchingIn = false }) => {
  const { webcamRef, image, capture, WebcamComponent, setImage } = useCamera()
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
    }
  }, [visible])

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
      <CModalHeader
        closeButton={false}
        style={{
          background: 'linear-gradient(135deg, #1e7e34, #28a745)',
          color: 'white',
          border: 'none',
        }}
      >
        <CModalTitle style={{ color: 'white', fontWeight: 'bold' }}>
          Punch In Confirmation
        </CModalTitle>
      </CModalHeader>

      <CModalBody className="text-center" style={{ padding: '1rem' }}>
        {/* Profile Info */}
        <div className="mb-3">
          <h5 className="mb-1">{userData?.name || 'Employee Name'}</h5>
          <p className="text-muted small mb-0">
            {userData?.role?.[0]?.display_name || userData?.role?.[0]?.name || 'Role'}
          </p>
        </div>

     
        {/* Camera Frame */}
        <div className="mb-3">
          <h6 className="mb-1 small">Live Camera Capture</h6>
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
              <CButton size="sm" color="success" onClick={capture}>
                Capture
              </CButton>
            ) : (
              <CButton size="sm" color="warning" onClick={() => window.location.reload()}>
                Retake
              </CButton>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="mb-2">
          <h6 className="mb-1 small">Current Location</h6>
          {error && <p className="text-danger small mb-0">{error}</p>}
          {!location && !error && <CSpinner size="sm" />}
          {location && <p className="text-success small mb-0">{location.address}</p>}
        </div>

        {/* Confirmation */}
        <div className="alert alert-success py-2">
          <h6 className="mb-0 small">Ready to start your workday?</h6>
        </div>
      </CModalBody>
   {/* Leave Alert */}
   {onLeaveToday && (
          <div className="alert alert-danger py-2 mb-3" style={{ backgroundColor: '#f8d7da', borderColor: '#f5c6cb', color: '#721c24' }}>
            <h6 className="mb-0 small" style={{ color: '#721c24', fontWeight: 'bold' }}>
              Today you are on Leave, please contact HR and admin for punch in
            </h6>
          </div>
        )}

      <CModalFooter className="justify-content-center">
        {/* <CButton
          color="success"
          className="me-3 px-4"
          disabled={onLeaveToday || !image || !location}
          onClick={() => {
            onYes({ image, location })
            setTimeout(() => setImage(null), 2000)
          }}
        >
          {onLeaveToday ? 'On Leave Today' : 'Yes, Punch In'}
        </CButton> */}

        <CButton
          color="success"
          className="me-3 px-4"
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

        <CButton color="secondary" className="px-4" onClick={onNo}>
          No, Later
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default PunchInModal
