import { useEffect, useRef } from 'react'
import Cookies from 'js-cookie'
import BasicProvider from 'src/constants/BasicProvider'

/**
 * Custom hook to periodically check if the logged-in user's account is still active
 * Only checks the CURRENT logged-in user's status, not other users
 * If admin marks this user as inactive, it will automatically force logout
 * 
 * @param {number} interval - Check interval in milliseconds (default: 60 seconds)
 * @param {boolean} enabled - Enable/disable the check (default: true)
 */
const useUserStatusCheck = (interval = 60000, enabled = true) => {
  const intervalRef = useRef(null)
  const isCheckingRef = useRef(false)

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
      // If no user ID, skip checking
      return
    }

    /**
     * Check ONLY the logged-in user's status from backend
     * This is different from checking other users' status in API responses
     * VERY DEFENSIVE: Only logout if we're 100% sure user is inactive
     */
    const checkLoggedInUserStatus = async () => {
      // Prevent multiple simultaneous checks
      if (isCheckingRef.current) {
        return
      }

      // Double check token still exists before making request
      const currentToken = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)
      if (!currentToken) {
        // User already logged out, stop checking
        return
      }

      try {
        isCheckingRef.current = true

        // Fetch ONLY the logged-in user's data from backend
        // This endpoint returns the current user's profile
        // Format: response.data (as seen in AppHeader.js)
        const response = await new BasicProvider(`admins/show/${loggedInUserId}`).getRequest()

        // Verify we got a valid response
        if (!response) {
          // No response, don't logout - might be network issue
          return
        }

        // Get user data from response - format is response.data (not nested)
        const userData = response?.data

        // Verify we actually have user data
        if (!userData || (typeof userData !== 'object')) {
          // Invalid data format, don't logout
          return
        }

        // Verify this is the correct user (extra safety check)
        const responseUserId = userData?._id || userData?.id || userData?.user?._id || userData?.user?.id
        if (responseUserId && responseUserId.toString() !== loggedInUserId.toString()) {
          // This is not the logged-in user's data, don't logout
          console.warn('User status check: Response user ID does not match logged-in user ID', {
            loggedInUserId,
            responseUserId
          })
          return
        }

        // Check if THIS logged-in user is inactive
        // Only check if status explicitly exists and is inactive
        // Check common status field locations
        const userStatus = userData?.status || userData?.user_status || userData?.user?.status

        // CRITICAL: Only logout if status is EXPLICITLY 'inactive'
        // Don't logout on null, undefined, empty string, or any other value
        if (
          userStatus &&
          typeof userStatus === 'string' &&
          userStatus.toLowerCase().trim() === 'inactive'
        ) {
          console.log('AUTO LOGOUT → Logged-in user account marked as inactive by admin', {
            userId: loggedInUserId,
            status: userStatus
          })

          // Remove auth cookie
          Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, {
            path: '',
            domain: process.env.REACT_APP_URL,
          })

          // Remove user ID cookie
          Cookies.remove('primery_user_id', {
            path: '',
            domain: process.env.REACT_APP_URL,
          })

          // Redirect to login
          window.location.href = '/login'
          return
        }

        // If status is 'active' or anything else, user is fine - do nothing
      } catch (error) {
        // VERY IMPORTANT: Only logout on explicit 401 with inactive message
        // Don't logout on network errors, 404, 500, or other errors
        
        // Check if error explicitly says user is inactive
        const errorMessage = error?.response?.data?.message || error?.message || ''
        const hasExplicitInactiveMessage = 
          typeof errorMessage === 'string' && 
          errorMessage.toLowerCase().includes('inactive') &&
          (errorMessage.toLowerCase().includes('account') || errorMessage.toLowerCase().includes('user'))

        // Only logout if we get 401 AND explicit inactive message
        if (
          (error?.response?.status === 401 || error?.statusCode === 401) &&
          hasExplicitInactiveMessage
        ) {
          console.log('AUTO LOGOUT → 401 with explicit inactive message for logged-in user', {
            userId: loggedInUserId,
            error: errorMessage
          })

          Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, {
            path: '',
            domain: process.env.REACT_APP_URL,
          })

          Cookies.remove('primery_user_id', {
            path: '',
            domain: process.env.REACT_APP_URL,
          })

          window.location.href = '/login'
          return
        }

        // For ALL other errors (network, 404, 500, etc.), DO NOT logout
        // Just silently continue - user might have network issues or API might be down
        // This prevents false logouts
        if (process.env.REACT_APP_DEBUG) {
          console.warn('User status check error (ignored, not logging out):', {
            error: error?.message,
            status: error?.response?.status,
            userId: loggedInUserId
          })
        }
      } finally {
        isCheckingRef.current = false
      }
    }

    // Initial check after a short delay (2 seconds)
    const initialTimeout = setTimeout(() => {
      checkLoggedInUserStatus()
    }, 2000)

    // Set up periodic checking
    intervalRef.current = setInterval(() => {
      checkLoggedInUserStatus()
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

export default useUserStatusCheck

