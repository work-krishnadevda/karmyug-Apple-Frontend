import React from 'react'
import { CButton, CCol, CRow } from '@coreui/react'
import { cilSave, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import PropTypes from 'prop-types'

const ActionButtons = ({
  isEditing,
  onSave,
  onCancel,
  saveText = 'Save',
  cancelText = 'Cancel',
  className = ''
}) => {
  if (!isEditing) return null

  return (
    <CRow className={`mt-3 ${className}`}>
      <CCol xs={12} className="d-flex justify-content-end">
        <CButton
          color="success"
          className="me-2"
          onClick={onSave}
        >
          <CIcon icon={cilSave} className="me-1" />
          {saveText}
        </CButton>
        <CButton
          color="secondary"
          onClick={onCancel}
        >
          <CIcon icon={cilX} className="me-1" />
          {cancelText}
        </CButton>
      </CCol>
    </CRow>
  )
}

ActionButtons.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  saveText: PropTypes.string,
  cancelText: PropTypes.string,
  className: PropTypes.string
}

export default ActionButtons
