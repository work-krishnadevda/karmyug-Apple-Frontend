import { useSelector } from 'react-redux'
import { checkRole } from 'src/constants/common'

export const usePermissions = () => {
  const admin = useSelector((state) => state.userData)

  // Role checking - Only HR/Admin should access this component
  const isHR = checkRole(process.env.REACT_APP_HR, admin)
  const isADMIN = checkRole(process.env.REACT_APP_ADMIN, admin)
  const isAC = checkRole(process.env.REACT_APP_AC, admin)
  const canEdit = isHR || isADMIN || isAC

  // Check if current user has permission to view employee profiles
  const hasViewPermission = canEdit

  // Helper function to check if user can edit a specific section
  const canEditSection = (section) => {
    // Validate section parameter
    if (!section || typeof section !== 'string') {
      console.error('Invalid section for canEditSection:', section)
      return false
    }

    // Only HR and Admin can edit employee profiles
    return canEdit
  }

  // Check if user can edit bank details (limited to once)
  // AC (Accountant) can only view, not edit bank details
  const canEditBank = (editAttempts) => {
    return (isHR || isADMIN) && !editAttempts?.bank
  }

  // Check if user can edit attachments (staff can edit multiple times)
  const canEditAttachments = (editAttempts) => {
    return canEdit // Remove restriction - allow multiple edits
  }

  return {
    isHR,
    isADMIN,
    isAC,
    canEdit,
    hasViewPermission,
    canEditSection,
    canEditBank,
    canEditAttachments,
  }
}
