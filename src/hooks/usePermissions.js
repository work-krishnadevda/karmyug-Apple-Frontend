import { useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { checkRole } from '../constants/common'
import { EDIT_PERMISSIONS, FORM_SECTIONS } from '../constants/hrmsConstants'

const usePermissions = () => {
  const admin = useSelector((state) => state.userData)

  const permissions = useMemo(() => {
    const isHR = checkRole(process.env.REACT_APP_HR, admin)
    const isADMIN = checkRole(process.env.REACT_APP_ADMIN, admin)
    const canEdit = isHR || isADMIN

    return {
      isHR,
      isADMIN,
      canEdit,
      canEditAllSections: canEdit,
      canEditLimitedSections: true, // All users can edit limited sections
      userRole: isADMIN ? 'admin' : isHR ? 'hr' : 'employee'
    }
  }, [admin])

  const canEditSection = useCallback((section, editAttempts = {}) => {
    if (permissions.canEditAllSections) {
      return true
    }

    if (permissions.canEditLimitedSections && EDIT_PERMISSIONS.LIMITED_SECTIONS.includes(section)) {
      return !editAttempts[section]
    }

    return false
  }, [permissions])

  const hasUserEditedSection = useCallback((section, editAttempts = {}) => {
    return editAttempts[section] || false
  }, [])

  const getSectionEditStatus = useCallback((section, editAttempts = {}) => {
    const canEdit = canEditSection(section, editAttempts)
    const hasEdited = hasUserEditedSection(section, editAttempts)
    
    return {
      canEdit,
      hasEdited,
      isRestricted: !canEdit && hasEdited,
      status: canEdit ? 'editable' : hasEdited ? 'restricted' : 'readonly'
    }
  }, [canEditSection, hasUserEditedSection])

  return {
    ...permissions,
    canEditSection,
    hasUserEditedSection,
    getSectionEditStatus
  }
}

export default usePermissions
