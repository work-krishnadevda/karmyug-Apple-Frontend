import { useEffect, useRef } from 'react'
import Cookies from 'js-cookie'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'

/**
 * Custom hook to check if user's pending leave has been approved
 * If leave is approved and user is punched in, automatically force punch out
 * 
 * Scenario: User applied for leave (pending) → User punched in → Leave gets approved → Auto punch out
 * 
 * @param {number} interval - Check interval in milliseconds (default: 30 seconds)
 * @param {boolean} enabled - Enable/disable the check (default: true)
 */
const useLeaveApprovalCheck = (interval = 30000, enabled = true) => {
  const intervalRef = useRef(null)
  const isCheckingRef = useRef(false)
  const lastCheckedLeaveIdsRef = useRef(new Set()) // Track which leaves we've already processed
  const isPunchedInRef = useRef(false) // Track current punch status

  useEffect(() => {
    // If disabled, don't run
    if (!enabled) {
      return
    }

    // Only run if user is logged in
    const token = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)
    if (!token) {
      return
    }

    // Get logged-in user ID from cookie
    const loggedInUserId = Cookies.get('primery_user_id')
    if (!loggedInUserId) {
      return
    }

    /**
     * Check if user has any approved leave for today
     * If user is punched in and leave is approved, force punch out
     */
    const checkLeaveApproval = async () => {
      // Prevent multiple simultaneous checks
      if (isCheckingRef.current) {
        return
      }

      // Check current punch status from API (more reliable than Redux store)
      let isCurrentlyPunchedIn = false
      try {
        const attendanceResponse = await new BasicProvider(`attendances/today`).getRequest()
        const todayData = attendanceResponse?.data
        if (todayData) {
          const sessions = todayData.sessions || []
          const lastSession = sessions[sessions.length - 1]
          // User is punched in if last session exists and doesn't have punch_out
          isCurrentlyPunchedIn = lastSession && !lastSession.punch_out
        }
      } catch (error) {
        // If API fails, skip this check (don't logout on error)
        if (process.env.REACT_APP_DEBUG) {
          console.warn('Could not check punch status:', error)
        }
        return
      }

      // Update ref for next check
      isPunchedInRef.current = isCurrentlyPunchedIn

      // Only proceed if user is currently punched in
      if (!isCurrentlyPunchedIn) {
        return
      }

      // Double check token still exists
      const currentToken = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)
      if (!currentToken) {
        return
      }

      try {
        isCheckingRef.current = true

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0]

        // Fetch user's leaves - check for approved leaves that include today
        const queryParams = [
          `user=${loggedInUserId}`,
          `fromDate=${today}`,
          `toDate=${today}`,
          `status=Approved`,
          `page=1`,
          `count=100`
        ]
        const queryString = queryParams.join('&')

        const response = await new BasicProvider(`leaves?${queryString}`).getRequest()
        const leaves = response?.data || []

        // Check if user has any approved leave for today
        const approvedLeaveToday = leaves.find((leave) => {
          if (leave.status !== 'Approved' && leave.status !== 'approved') {
            return false
          }

          const startDate = new Date(leave.start_date).toISOString().split('T')[0]
          const endDate = new Date(leave.end_date).toISOString().split('T')[0]

          // Check if today falls within the leave date range
          return today >= startDate && today <= endDate
        })

        // If user has approved leave for today and is punched in, force punch out
        if (approvedLeaveToday) {
          const leaveId = approvedLeaveToday._id || approvedLeaveToday.id

          // Check if we've already processed this leave (avoid multiple punch outs)
          if (lastCheckedLeaveIdsRef.current.has(leaveId)) {
            // Already processed this leave, skip
            return
          }

          console.log('AUTO PUNCH OUT → User has approved leave for today', {
            leaveId,
            startDate: approvedLeaveToday.start_date,
            endDate: approvedLeaveToday.end_date,
            leaveType: approvedLeaveToday.leaveType
          })

          // Mark this leave as processed
          lastCheckedLeaveIdsRef.current.add(leaveId)

          // Force punch out - call punch out API without image/location (backend will handle)
          try {
            const formData = new FormData()
            // Add a flag to indicate this is an automatic punch out due to leave approval
            formData.append('auto_punch_out', 'true')
            formData.append('reason', 'Leave approved - automatic punch out')

            const punchOutResponse = await new BasicProvider(`attendances/punch-out`).postRequest(
              formData
            )

            console.log('AUTO PUNCH OUT → Successfully punched out due to leave approval', {
              response: punchOutResponse
            })

            // Show notification to user
            toast.warning(
              `Your leave has been approved. You have been automatically punched out.`,
              {
                autoClose: 5000
              }
            )

            // Update punch status in Redux store
            // Note: The useAttendance hook will also check status and update accordingly
            // But we can trigger a page reload or update state here if needed
            setTimeout(() => {
              window.location.reload()
            }, 2000) // Reload after 2 seconds to update UI
          } catch (punchOutError) {
            console.error('AUTO PUNCH OUT → Error during force punch out:', punchOutError)

            // Even if punch out fails, show notification
            toast.error(
              'Your leave has been approved. Please manually punch out.',
              {
                autoClose: 5000
              }
            )
          }
        }
      } catch (error) {
        // For errors, just log (don't show error to user)
        // This prevents false notifications when there are temporary network issues
        if (process.env.REACT_APP_DEBUG) {
          console.warn('Leave approval check error (non-critical):', error)
        }
      } finally {
        isCheckingRef.current = false
      }
    }

    // Initial check after a short delay (5 seconds)
    const initialTimeout = setTimeout(() => {
      checkLeaveApproval()
    }, 5000)

    // Set up periodic checking
    intervalRef.current = setInterval(() => {
      checkLeaveApproval()
    }, interval)

    // Cleanup
    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [interval, enabled])
}

export default useLeaveApprovalCheck

