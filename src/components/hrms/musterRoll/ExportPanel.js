import React, { useState } from 'react'
import { CCard, CCardBody, CCardHeader, CButton, CFormLabel, CCol, CRow, CAlert, CSpinner } from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { cilCloudDownload, cilFile, cilCheck } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import PropTypes from 'prop-types'
import { EXPORT_FORMATS, EXPORT_FORMAT_LABELS } from '../../../constants/musterRollConstants'

const ExportPanel = ({
  onExport,
  loading = false,
  disabled = false,
  className = ''
}) => {
  const [selectedFormat, setSelectedFormat] = useState(EXPORT_FORMATS.PDF)
  const [exportStatus, setExportStatus] = useState(null) // 'success', 'error', null

  const handleExport = async () => {
    try {
      setExportStatus(null)
      await onExport(selectedFormat)
      setExportStatus('success')
      
      // Clear success message after 3 seconds
      setTimeout(() => setExportStatus(null), 3000)
    } catch (error) {
      setExportStatus('error')
      console.error('Export failed:', error)
    }
  }

  const getExportIcon = (format) => {
    switch (format) {
      case EXPORT_FORMATS.PDF:
        return cilFile
      case EXPORT_FORMATS.EXCEL:
        return cilFile
      case EXPORT_FORMATS.CSV:
        return cilFile
      default:
        return cilFile
    }
  }

  const getExportDescription = (format) => {
    switch (format) {
      case EXPORT_FORMATS.PDF:
        return 'Download as PDF document with formatting'
      case EXPORT_FORMATS.EXCEL:
        return 'Download as Excel spreadsheet for editing'
      case EXPORT_FORMATS.CSV:
        return 'Download as CSV file for data import'
      default:
        return ''
    }
  }

  return (
    <CCard className={`export-panel ${className}`}>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <CIcon icon={cilCloudDownload} className="me-2" />
          <h6 className="mb-0">Export Report</h6>
        </div>
      </CCardHeader>
      
      <CCardBody>
        <CRow className="g-3">
          <CCol md={6}>
            <CFormLabel>Export Format</CFormLabel>
            <AppFormSelect
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              disabled={disabled || loading}
            >
              {Object.entries(EXPORT_FORMAT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </AppFormSelect>
            <div className="form-text">
              {getExportDescription(selectedFormat)}
            </div>
          </CCol>
          
          <CCol md={6} className="d-flex align-items-end">
            <CButton
              color="primary"
              onClick={handleExport}
              disabled={disabled || loading}
              className="w-100"
            >
              {loading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <CIcon icon={getExportIcon(selectedFormat)} className="me-2" />
                  Export {EXPORT_FORMAT_LABELS[selectedFormat]}
                </>
              )}
            </CButton>
          </CCol>
        </CRow>
        
        {exportStatus && (
          <CRow className="mt-3">
            <CCol>
              {exportStatus === 'success' && (
                <CAlert color="success" className="d-flex align-items-center">
                  <CIcon icon={cilCheck} className="me-2" />
                  Report exported successfully!
                </CAlert>
              )}
              {exportStatus === 'error' && (
                <CAlert color="danger">
                  Export failed. Please try again.
                </CAlert>
              )}
            </CCol>
          </CRow>
        )}
        
        <CRow className="mt-3">
          <CCol>
            <div className="text-muted small">
              <strong>Note:</strong> Large reports may take a few moments to generate. 
              Please ensure you have a stable internet connection.
            </div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

ExportPanel.propTypes = {
  onExport: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
}

export default ExportPanel
