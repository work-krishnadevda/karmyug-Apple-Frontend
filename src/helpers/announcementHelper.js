import BasicProvider from 'src/constants/BasicProvider'
import Cookies from 'js-cookie'

/**
 * Mark an announcement as read/viewed
 * @param {string} announcementId - The ID of the announcement
 * @returns {Promise<boolean>} - True if successful, False otherwise
 */
export const markAnnouncementAsRead = async (announcementId) => {
  try {
    if (!announcementId) {
      console.warn('No announcement ID provided')
      return false
    }

    const staffId = Cookies.get('primery_user_id')
    
    // Call API to mark announcement as read on backend
    const response = await new BasicProvider(`announcements/${announcementId}/mark-read`).putRequest({
      staff_id: staffId,
      viewed_at: new Date().toISOString()
    })

    return response?.status === 200 || response?.data?.success || true
  } catch (error) {
    console.error('Error marking announcement as read:', error)
    return false // Return false but don't throw - UI should still update
  }
}

/**
 * Get count of unread announcements
 * @returns {Promise<number>} - Count of unread announcements
 */
export const getUnreadAnnouncementCount = async () => {
  try {
    const staffId = Cookies.get('primery_user_id')
    
    if (!staffId) {
      return 0
    }

    const response = await new BasicProvider(`announcements/unread-count/${staffId}`).getRequest() 
    return response?.data?.total_unread || 0
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }
}

/**
 * Get all unread announcements for a staff member
 * @returns {Promise<Array>} - Array of unread announcements
 */

export const getUnreadAnnouncements = async () => {
  try {
    const staffId = Cookies.get("primery_user_id");
    const userRole = Cookies.get("user_role");

    const response = await new BasicProvider("announcements/all").getRequest();
    const announcements = response?.data || [];

    const now = new Date();
    const readData = JSON.parse(localStorage.getItem("announcement_read")) || {};

    const visible = announcements.filter((ann) => {
      if (!ann?.is_published) return false;
      if (ann?.schedule_at && new Date(ann.schedule_at) > now) return false;

      // staff empty → show to everyone
      if (Array.isArray(ann.staff) && ann.staff.length === 0) return true;

      // staff includes user
      if (ann.staff?.includes(staffId)) return true;

      // role match
      if (ann.target_roles?.includes(userRole)) return true;

      return false;
    });

    return visible.filter((ann) => !readData[ann._id]);

  } catch (error) {
    console.error("Error fetching unread announcements:", error);
    return [];
  }
};


/**
 * Mark multiple announcements as read
 * @param {Array<string>} announcementIds - Array of announcement IDs
 * @returns {Promise<boolean>} - True if successful
 */
export const markMultipleAnnouncementsAsRead = async (announcementIds) => {
  try {
    if (!Array.isArray(announcementIds) || announcementIds.length === 0) {
      console.warn('No announcement IDs provided')
      return false
    }

    const staffId = Cookies.get('primery_user_id')
    
    const response = await new BasicProvider('announcements/mark-read-bulk').putRequest({
      staff_id: staffId,
      announcement_ids: announcementIds,
      viewed_at: new Date().toISOString()
    })

    return response?.status === 200 || response?.data?.success || true
  } catch (error) {
    console.error('Error marking multiple announcements as read:', error)
    return false
  }
}

/**
 * Get announcement read status for current user
 * @param {string} announcementId - The ID of the announcement
 * @returns {Promise<boolean>} - True if read, False if unread
 */
export const getAnnouncementReadStatus = async (announcementId) => {
  try {
    const staffId = Cookies.get('primery_user_id')
    
    const response = await new BasicProvider(
      `announcements/${announcementId}/read-status/${staffId}`
    ).getRequest()
    
    return response?.data?.is_read || false
  } catch (error) {
    console.error('Error fetching announcement read status:', error)
    return false
  }
}
