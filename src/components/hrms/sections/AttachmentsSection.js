import React from 'react'
import { CCol, CRow } from '@coreui/react'
import { cilFile } from '@coreui/icons'
import FormSection from '../FormSection'
import FileUploadField from '../FileUploadField'
import { DOCUMENT_TYPES, DOCUMENT_CONFIG } from '../../../constants/hrmsConstants'

const AttachmentsSection = ({
  data,
  isEditing,
  onFieldChange,
  onEditToggle,
  onSave,
  onCancel,
  canEdit,
  editAttempts,
  errors = {}
}) => {
  const documentTypes = Object.values(DOCUMENT_TYPES)

  return (
    <FormSection
      title="Documents & Attachments"
      icon={cilFile}
      isEditing={isEditing}
      onEditToggle={onEditToggle}
      onSave={onSave}
      onCancel={onCancel}
      canEdit={canEdit}
      editAttempts={editAttempts}
      sectionKey="attachments"
      saveText="Save Attachments"
    >
      <CRow>
        {documentTypes.slice(0, 2).map((docType) => {
          const config = DOCUMENT_CONFIG[docType]
          return (
            <CCol md={6} key={docType}>
              <FileUploadField
                name={docType}
                label={config.label}
                file={data?.[docType]}
                onChange={onFieldChange}
                disabled={!isEditing}
                accept={config.accept}
                icon={config.icon}
                iconColor={config.iconColor}
              />
            </CCol>
          )
        })}
      </CRow>

      <CRow>
        {documentTypes.slice(2, 4).map((docType) => {
          const config = DOCUMENT_CONFIG[docType]
          return (
            <CCol md={6} key={docType}>
              <FileUploadField
                name={docType}
                label={config.label}
                file={data?.[docType]}
                onChange={onFieldChange}
                disabled={!isEditing}
                accept={config.accept}
                icon={config.icon}
                iconColor={config.iconColor}
              />
            </CCol>
          )
        })}
      </CRow>

      <CRow>
        {documentTypes.slice(4).map((docType) => {
          const config = DOCUMENT_CONFIG[docType]
          return (
            <CCol md={6} key={docType}>
              <FileUploadField
                name={docType}
                label={config.label}
                file={data?.[docType]}
                onChange={onFieldChange}
                disabled={!isEditing}
                accept={config.accept}
                icon={config.icon}
                iconColor={config.iconColor}
              />
            </CCol>
          )
        })}
      </CRow>
    </FormSection>
  )
}

export default AttachmentsSection
