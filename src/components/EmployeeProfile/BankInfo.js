import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormInput,
  CFormLabel,
  CAlert,
} from '@coreui/react'
import { cilPencil, cilSave, cilX, cilCreditCard } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const BankInfo = ({
  formData,
  editMode,
  canEditSection,
  canEditBank,
  handleEditToggle,
  handleSave,
  handleCancel,
  handleInputChange,
  editAttempts,
  getFieldError,
  companies = [],
}) => {
  // Ensure bank data exists, if not, use empty object to prevent errors
  const bankData = formData?.bank || {}

  return (
    <CRow className="mb-4">
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CIcon icon={cilCreditCard} className="me-2" />
              <h5 className="mb-0">Bank Information</h5>
            </div>
            {canEditBank(editAttempts) && (
              <CButton
                color="primary"
                variant="outline"
                size="sm"
                onClick={() => handleEditToggle('bank')}
              >
                <CIcon icon={cilPencil} className="me-1" />
                {editMode.bank ? 'Cancel' : 'Edit'}
              </CButton>
            )}
            {!canEditBank(editAttempts) && (
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                disabled
                title={
                  editAttempts?.bank
                    ? 'Bank details already edited'
                    : 'Only HR and Admin can edit this section'
                }
              >
                <CIcon icon={cilPencil} className="me-1" />
                {editAttempts?.bank ? 'Already Edited' : 'Edit (Restricted)'}
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            {editAttempts?.bank && (
              <CAlert color="warning" className="mb-3">
                <strong>Note:</strong> Bank details have already been edited and cannot be modified
                again.
              </CAlert>
            )}

            <CRow>
              <CCol md={6}>
                <CFormLabel>Bank Name</CFormLabel>
                <CFormInput
                  value={bankData?.bankName || ''}
                  onChange={(e) => handleInputChange('bank', 'bankName', e.target.value)}
                  disabled={!editMode.bank || editAttempts?.bank}
                  placeholder="Enter Bank Name"
                />
                {getFieldError && getFieldError('bank', 'bankName') && (
                  <div className="text-danger small mt-1">{getFieldError('bank', 'bankName')}</div>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Account Number</CFormLabel>
                <CFormInput
                  type="text"
                  value={bankData?.accountNumber || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length > 20) {
                      value = value.slice(0, 20)
                    }
                    handleInputChange('bank', 'accountNumber', value)
                  }}
                  disabled={!editMode.bank || editAttempts?.bank}
                  placeholder="Enter Account Number"
                  maxLength={20}
                />
                {getFieldError && getFieldError('bank', 'accountNumber') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('bank', 'accountNumber')}
                  </div>
                )}
                {bankData?.accountNumber && (
                  <small className="text-muted">Account Number: {bankData.accountNumber}</small>
                )}
              </CCol>
            </CRow>

            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>IFSC Code</CFormLabel>
                <CFormInput
                  type="text"
                  value={bankData?.ifscCode || ''}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase()
                    value = value.replace(/[^A-Z0-9]/g, '')
                    if (value.length > 11) {
                      value = value.slice(0, 11)
                    }
                    handleInputChange('bank', 'ifscCode', value)
                  }}
                  disabled={!editMode.bank || editAttempts?.bank}
                  placeholder="Enter IFSC Code"
                  maxLength={11}
                />
                {getFieldError && getFieldError('bank', 'ifscCode') && (
                  <div className="text-danger small mt-1">{getFieldError('bank', 'ifscCode')}</div>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Branch Name</CFormLabel>
                <CFormInput
                  value={bankData?.branchName || ''}
                  onChange={(e) => handleInputChange('bank', 'branchName', e.target.value)}
                  disabled={!editMode.bank || editAttempts?.bank}
                  placeholder="Enter Branch Name"
                />
                {getFieldError && getFieldError('bank', 'branchName') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('bank', 'branchName')}
                  </div>
                )}
              </CCol>
            </CRow>

            {/* Bank Details Summary */}
            {bankData?.bankName && bankData?.accountNumber && (
              <CRow className="mt-3">
                <CCol xs={12}>
                  <div className="alert alert-info">
                    <h6 className="mb-2" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      Bank Details Summary:
                    </h6>
                    <p className="mb-1">
                      <strong>Account Holder Name:</strong> {formData?.profile?.name || 'N/A'}
                    </p>
                    <p className="mb-1">
                      <strong>Contact Number:</strong> {formData?.personal?.phone || 'N/A'}
                    </p>
                    <p className="mb-1">
                      <strong>Company Name:</strong>{' '}
                      {formData?.employment?.companyName
                        ? (Array.isArray(companies) &&
                            companies.find((c) => c.value === formData.employment.companyName)?.label) ||
                          formData.employment.companyName
                        : 'N/A'}
                    </p>
                    <p className="mb-0">
                      <strong>MA Location:</strong> {bankData.raLocation || 'N/A'}
                    </p>
                    <p className="mb-1">
                      <strong>Bank:</strong> {bankData.bankName || 'N/A'}
                    </p>
                    <p className="mb-1">
                      <strong>Branch:</strong> {bankData.branchName || 'N/A'}
                    </p>
                    <p className="mb-1">
                      <strong>Account Number:</strong> {bankData.accountNumber || 'N/A'}
                    </p>
                    <p className="mb-1">
                      <strong>IFSC Code:</strong> {bankData.ifscCode || 'N/A'}
                    </p>
                  </div>
                </CCol>
              </CRow>
            )}

            {editMode.bank && !editAttempts?.bank && (
              <CRow className="mt-3">
                <CCol xs={12} className="d-flex justify-content-end">
                  <CButton color="success" className="me-2" onClick={() => handleSave('bank')}>
                    <CIcon icon={cilSave} className="me-1" />
                    Save
                  </CButton>
                  <CButton color="secondary" onClick={() => handleCancel('bank')}>
                    <CIcon icon={cilX} className="me-1" />
                    Cancel
                  </CButton>
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default BankInfo
