import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useIdleTimer } from 'react-idle-timer'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'

export const useUserAttendanceActions = (idleTimeout = 1000 * 60 * 60 * 9) => {
  // default: 8 hours 30 minutes inactivity → auto punch out

  const HEARTBEAT_INTERVAL_MS = 60 * 1000 // 1 m
  const dispatch = useDispatch()
  const [punchStatus, setPunchStatus] = useState(null)
  const [isPunchingIn, setIsPunchingIn] = useState(false)
  // ✅ Protection against duplicate API calls
  const isPunchingInRef = useRef(false)
  useEffect(() => {
    if (punchStatus === null) return
    dispatch({ type: 'set', punchInStatus: { ...punchStatus } })
  }, [punchStatus])

  // ✅ Punch status check
  const checkPunchStatus = useCallback(async () => {
    try {
      const response = await new BasicProvider(`attendances/today`, dispatch).getRequest()
      const todayData = response?.data
      if (!todayData) {
        setPunchStatus({ isPunchedIn: false })
      } else {
        const sessions = todayData.sessions || []
        const lastSession = sessions[sessions.length - 1]
        if (lastSession && lastSession.punch_out) {
          setPunchStatus({ isPunchedIn: false })
        } else if (lastSession && !lastSession.punch_out) {
          setPunchStatus({ isPunchedIn: true, punchInTime: lastSession.punch_in })
        } else {
          setPunchStatus({ isPunchedIn: false, punchOutTime: lastSession?.punch_out })
        }
      }
    } catch (error) {
      console.error('Error checking punch status:', error)
      setPunchStatus({ isPunchedIn: false })
    }
  }, [dispatch])

  // ✅ Punch In
  const handlePunchIn = useCallback(
    async (data = {}) => {
      // ✅ Prevent duplicate API calls
      if (isPunchingInRef.current) {
        console.log('Punch-In: API call already in progress, ignoring duplicate request')
        return
      }

      const { image, location } = data || {}
      if (!image || !location) {
        toast.error('Image or location missing')
        return
      }

      // ✅ Set flag to prevent duplicate calls and show loading immediately
      isPunchingInRef.current = true
      setIsPunchingIn(true)

      try {
        const formData = new FormData()

        // Convert base64 to Blob
        const blob = await fetch(image).then((res) => res.blob())

        formData.append('punch_in_image', blob, 'punch_in.jpg')
        formData.append('latitude', location.latitude)
        formData.append('longitude', location.longitude)
        formData.append('location', location.address)

        const response = await new BasicProvider(`attendances/punch-in`, dispatch).postRequest(
          formData,
        )

        const punchData = response?.data?.data
        const latestPunchInTime = punchData?.sessions?.slice(-1)[0]?.punch_in

        setPunchStatus({
          isPunchedIn: true,
          punchInTime: latestPunchInTime,
        })

        // Notify Redux that a fresh punch-in just happened. Offer UI loads and shows with no delay.
        dispatch({
          type: 'triggerOfferPopupAfterPunchIn',
          timestamp: Date.now(),
        })

        localStorage.setItem('lastActivity', Date.now().toString())
        toast.success('Punch In Successful!')
      } catch (error) {
        console.error('Error punching in:', error)
        toast.error(error?.message || 'Failed to punch in. Please try again.')
        throw error // Re-throw so parent can handle it
      } finally {
        // ✅ Reset flag after API call completes
        isPunchingInRef.current = false
        setIsPunchingIn(false)
      }
    },
    [dispatch],
  )

  // ✅ Punch Out
  const handlePunchOut = useCallback(
    async (data = {}) => {
      try {
        const { image, location, todayDraftDone, remark } = data || {}
        const formData = new FormData()

        if (image) {
          const blob = await fetch(image).then((res) => res.blob())
          formData.append('punch_out_image', blob, 'punch_in.jpg')
        }
        if (location) {
          formData.append('latitude', location.latitude)
          formData.append('longitude', location.longitude)
          formData.append('location', location.address)
        }
        if (todayDraftDone !== null && todayDraftDone !== undefined) {
          formData.append('today_draft_done', todayDraftDone)
        }
        if (remark) {
          formData.append('today_done_remark', remark)
        }
        const response = await new BasicProvider(`attendances/punch-out`, dispatch).postRequest(
          formData,
        )
        const punchData = response?.data?.data
        const lastSession = punchData?.sessions?.slice(-1)[0]
        setPunchStatus({ isPunchedIn: false, punchOutTime: lastSession?.punch_out })
        console.log('Punch-out successful - user will be logged out')
      } catch (error) {
        console.error('Error punching out:', error)

        // Handle specific backend validation errors
        if (error.message && error.message.includes('not a valid enum value')) {
          console.log('Backend validation error detected - this is a backend issue')
          console.log(
            'The backend is trying to set status to "Present" but schema expects "present"',
          )
          console.log('Setting user to offline anyway for better UX')

          // Even if API fails, set status to offline for better UX
          setPunchStatus({ isPunchedIn: false })
          console.log('Status set to offline despite API error')

          // Don't throw error - let the user continue
          return
        }

        // For other errors, still set status to offline
        setPunchStatus({ isPunchedIn: false })
        throw error // Re-throw for other errors
      }
    },
    [dispatch],
  )

  // ✅ Idle timer → auto punch out
  useIdleTimer({
    timeout: idleTimeout,
    onIdle: () => {
      if (punchStatus?.isPunchedIn) {
        console.log('User idle too long → auto punch out triggered')
        handlePunchOut({}) // Pass empty object to avoid destructuring error
      }
    },
    debounce: 500, // smoother idle detection
    crossTab: true, // sync across multiple tabs
  })

  // Run once on mount
  useEffect(() => {
    checkPunchStatus()
  }, [checkPunchStatus])

  const handleHeartbeat = async () => {
    // if (!punchStatus?.isPunchedIn) return
    try {
      const response = await new BasicProvider(`attendances/heartbeat`, dispatch).postRequest({})
      // console.log('Heartbeat sent ✅', response)
    } catch (error) {
      console.error('Heartbeat error ❌', error)
    }
  }
  useEffect(() => {
    // if (!punchStatus?.isPunchedIn) return
    const interval = setInterval(() => {
      handleHeartbeat()
    }, HEARTBEAT_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [punchStatus?.isPunchedIn])

  return {
    punchStatus,
    handlePunchIn,
    handlePunchOut,
    isPunchingIn,
  }
}
