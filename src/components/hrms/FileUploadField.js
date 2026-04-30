import React from 'react'
import { CFormInput, CFormLabel, CButton } from '@coreui/react'
import { cilFile, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import PropTypes from 'prop-types'

const FileUploadField = ({
  label,
  name,
  file,
  onChange,
  disabled = false,
  accept,
  icon,
  iconColor = 'text-primary',
  className = ''
}) => {
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      onChange(name, selectedFile)
    }
  }

  const handleDownload = () => {
    if (file) {
      window.open(URL.createObjectURL(file))
    }
  }

  return (
    <div className={`mb-3 ${className}`}>
      <CFormLabel className="fw-semibold">
        {icon && <CIcon icon={icon} className={`me-2 ${iconColor}`} />}
        {label}
      </CFormLabel>
      
      {disabled ? (
        <div className="mt-2">
          {file ? (
            <div className="d-flex align-items-center">
              <CIcon icon={cilFile} className="text-success me-2" />
              <span className="text-success">{file.name}</span>
              <CButton
                color="link"
                size="sm"
                className="ms-auto"
                onClick={handleDownload}
              >
                <CIcon icon={cilCloudDownload} />
              </CButton>
            </div>
          ) : (
            <span className="text-muted">No file uploaded</span>
          )}
        </div>
      ) : (
        <CFormInput
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="mt-1"
        />
      )}
    </div>
  )
}

FileUploadField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  file: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  accept: PropTypes.string,
  icon: PropTypes.any,
  iconColor: PropTypes.string,
  className: PropTypes.string
}

export default FileUploadField
