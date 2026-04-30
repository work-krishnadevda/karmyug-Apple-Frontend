import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import BasicProvider from 'src/constants/BasicProvider'

/**
 * Custom hook to manage announcement unread count
 * Automatically fetches and updates the count of unread announcements
 * 
 * @returns {Object} Object containing:
 *   - unreadCount: Number of unread announcements
 *   - loading: Boolean indicating if data is loading
 *   - error: Error message if any
 *   - refetch: Function to manually refresh the count
 */
export const useAnnouncementCount = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const staffId = Cookies.get('primery_user_id')
      
      if (!staffId) {
        setUnreadCount(0)
        return
      }

      // Fetch total announcements for this user
      const response = await new BasicProvider(`announcements/staff/${staffId}`).getRequest()
      const allAnnouncements = response.data || []
      
      // Count unread ones
      const unread = allAnnouncements.filter((a) => !a.is_read).length
      setUnreadCount(unread)
      console.log(unread)
    } catch (err) {
      console.error('Error fetching unread announcement count:', err)
      setError(err.message)
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUnreadCount()
    
    // Optional: Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return { unreadCount, loading, error, refetch: fetchUnreadCount }
}

/**
 * Custom hook to manage announcement data with read status
 * 
 * @param {string} staffId - The staff member ID (optional, uses cookie if not provided)
 * @returns {Object} Object containing:
 *   - announcements: Array of announcements with read status
 *   - unreadCount: Number of unread announcements
 *   - loading: Boolean indicating if data is loading
 *   - error: Error message if any
 *   - refetch: Function to manually refresh announcements
 *   - markAsRead: Function to mark announcement as read
 */
export const useAnnouncements = (staffId) => {
  const [announcements, setAnnouncements] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const currentStaffId = staffId || Cookies.get('primery_user_id')

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!currentStaffId) {
        setAnnouncements([])
        setUnreadCount(0)
        return
      }

      const response = await new BasicProvider(`announcements/staff/${currentStaffId}`).getRequest()
      const data = response.data || []
      
      setAnnouncements(data)
      
      // Calculate unread count
      const unread = data.filter((a) => !a.is_read).length
      setUnreadCount(unread)
    } catch (err) {
      console.error('Error fetching announcements:', err)
      setError(err.message)
      setAnnouncements([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }, [currentStaffId])

  const markAsRead = useCallback(
    async (announcementId) => {
      try {
        // Optimistic update
        setAnnouncements((prev) =>
          prev.map((a) =>
            a._id === announcementId ? { ...a, is_read: true } : a
          )
        )
        
        setUnreadCount((prev) => Math.max(prev - 1, 0))

        // Call API
        await new BasicProvider(`announcements/${announcementId}/mark-read`).putRequest({
          staff_id: currentStaffId,
          viewed_at: new Date().toISOString()
        })
      } catch (err) {
        console.error('Error marking announcement as read:', err)
        // Refetch to sync with server
        await fetchAnnouncements()
      }
    },
    [currentStaffId, fetchAnnouncements]
  )

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  return {
    announcements,
    unreadCount,
    loading,
    error,
    refetch: fetchAnnouncements,
    markAsRead
  }
}
