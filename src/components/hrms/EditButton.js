import React from 'react'
import { CButton } from '@coreui/react'
import { cilPencil } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import PropTypes from 'prop-types'

const EditButton = ({
  canEdit,
  isEditing,
  onEditToggle,
  editAttempts = {},
  sectionKey,
  className = ''
}) => {
  const hasUserEdited = editAttempts[sectionKey] || false
  const isRestricted = !canEdit && hasUserEdited

  const getButtonProps = () => {
    if (!canEdit) {
      return {
        color: 'secondary',
        variant: 'outline',
        size: 'sm',
        disabled: true,
        title: isRestricted 
          ? `You have already edited ${sectionKey} once` 
          : 'Only HR and Admin can edit this section'
      }
    }

    return {
      color: 'primary',
      variant: 'outline',
      size: 'sm'
    }
  }

  const getButtonText = () => {
    if (!canEdit) {
      return 'Edit (Restricted)'
    }
    return isEditing ? 'Cancel' : 'Edit'
  }

  return (
    <CButton
      {...getButtonProps()}
      className={className}
      onClick={canEdit ? onEditToggle : undefined}
    >
      <CIcon icon={cilPencil} className="me-1" />
      {getButtonText()}
    </CButton>
  )
}

EditButton.propTypes = {
  canEdit: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onEditToggle: PropTypes.func,
  editAttempts: PropTypes.object,
  sectionKey: PropTypes.string,
  className: PropTypes.string
}

export default EditButton
