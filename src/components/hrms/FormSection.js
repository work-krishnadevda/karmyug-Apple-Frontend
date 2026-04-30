import React from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { cilPencil, cilSave, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import PropTypes from 'prop-types'
import EditButton from './EditButton'
import ActionButtons from './ActionButtons'

const FormSection = ({
  title,
  icon: Icon,
  children,
  canEdit = true,
  isEditing = false,
  onEditToggle,
  onSave,
  onCancel,
  editAttempts = {},
  sectionKey,
  className = '',
  ...props
}) => {
  return (
    <CRow className={`mb-4 ${className}`}>
      <CCol xs={12}>
        <CCard {...props}>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {Icon && <CIcon icon={Icon} className="me-2" />}
              <h5 className="mb-0">{title}</h5>
            </div>
            <EditButton
              canEdit={canEdit}
              isEditing={isEditing}
              onEditToggle={onEditToggle}
              editAttempts={editAttempts}
              sectionKey={sectionKey}
            />
          </CCardHeader>
          <CCardBody>
            {children}
            <ActionButtons
              isEditing={isEditing}
              onSave={onSave}
              onCancel={onCancel}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.any,
  children: PropTypes.node.isRequired,
  canEdit: PropTypes.bool,
  isEditing: PropTypes.bool,
  onEditToggle: PropTypes.func,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  editAttempts: PropTypes.object,
  sectionKey: PropTypes.string,
  className: PropTypes.string
}

export default FormSection
