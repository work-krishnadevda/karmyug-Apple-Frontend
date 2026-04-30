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
  CFormSelect,
  CFormTextarea,
} from '@coreui/react'
import { cilPencil, cilSave, cilX, cilEnvelopeClosed, cilInfo } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import moment from 'moment'

const PersonalInfo = ({
  formData,
  editMode,
  canEditSection,
  handleEditToggle,
  handleSave,
  handleCancel,
  handleInputChange,
  getFieldError,
}) => {
  return (
    <CRow className="mb-4">
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CIcon icon={cilEnvelopeClosed} className="me-2" />
              <h5 className="mb-0">Personal Information</h5>
            </div>
            {canEditSection('personal') && (
              <CButton
                color="primary"
                variant="outline"
                size="sm"
                onClick={() => handleEditToggle('personal')}
              >
                <CIcon icon={cilPencil} className="me-1" />
                {editMode.personal ? 'Cancel' : 'Edit'}
              </CButton>
            )}
            {!canEditSection('personal') && (
              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                disabled
                title="Only HR and Admin can edit this section"
              >
                <CIcon icon={cilPencil} className="me-1" />
                Edit (Restricted)
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            <CRow>
              {/* <CCol md={6}>
                <CFormLabel>Email</CFormLabel>
                <CFormInput
                  type="email"
                  value={formData?.personal?.email || ''}
                  onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
                  disabled={!editMode.personal}
                  placeholder="Enter Email"
                />
                {getFieldError && getFieldError('personal', 'email') && (
                  <div className="text-danger small mt-1">{getFieldError('personal', 'email')}</div>
                )}
              </CCol> */}
              {/* <CCol md={6}>
                <CFormLabel>Gender</CFormLabel>
                <CFormSelect
                  value={formData?.personal?.gender || ''}
                  onChange={(e) => handleInputChange('personal', 'gender', e.target.value)}
                  disabled={!editMode.personal}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </CFormSelect>
              </CCol> */}
              <CCol md={6}>
                <CFormLabel>Staff Type</CFormLabel>
                <CFormSelect
                  value={formData?.employment?.employeeType || ''}
                  onChange={(e) => handleInputChange('employment', 'employeeType', e.target.value)}
                  disabled={!editMode.personal}
                >
                  <option value="">Select Staff Type</option>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="temporary">Temporary</option>
                  <option value="intern">Intern</option>
                  <option value="consultant">Consultant</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Department</CFormLabel>
                <CFormSelect
                  value={formData?.profile?.department || ''}
                  onChange={(e) => handleInputChange('profile', 'department', e.target.value)}
                  disabled={!editMode.personal}
                >
                  <option value="">Select Department</option>
                  <option value="technical">Technical</option>
                  <option value="management">Management</option>
                </CFormSelect>
                {getFieldError && getFieldError('profile', 'department') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('profile', 'department')}
                  </div>
                )}
              </CCol>
            </CRow>

            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Date of Birth</CFormLabel>
                <CFormInput
                  type="date"
                  value={
                    formData?.general?.dateOfBirth
                      ? moment(formData.general.dateOfBirth).format('YYYY-MM-DD')
                      : ''
                  }
                  onChange={(e) => handleInputChange('general', 'dateOfBirth', e.target.value)}
                  disabled={!editMode.personal}
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>Marital Status</CFormLabel>
                <CFormSelect
                  value={formData?.personal?.maritalStatus || ''}
                  onChange={(e) => handleInputChange('personal', 'maritalStatus', e.target.value)}
                  disabled={!editMode.personal}
                >
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Blood Group</CFormLabel>
                <CFormInput
                  value={formData?.personal?.bloodGroup || ''}
                  onChange={(e) => handleInputChange('personal', 'bloodGroup', e.target.value)}
                  disabled={!editMode.personal}
                  placeholder="Enter Blood Group"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Physically Challenged</CFormLabel>
                <CFormSelect
                  value={formData?.personal?.physicallyChallenged || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'physicallyChallenged', e.target.value)
                  }
                  disabled={!editMode.personal}
                >
                  <option value="">Select Option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </CFormSelect>

                {/* Conditional input for physically challenged reason */}
                {formData?.personal?.physicallyChallenged === 'yes' && (
                  <div className="mt-3">
                    <CFormLabel className="fw-semibold text-primary">
                      <CIcon icon={cilInfo} className="me-1" />
                      Please specify the nature of disability *
                    </CFormLabel>
                    <CFormTextarea
                      value={formData?.personal?.physicallyChallengedReason || ''}
                      onChange={(e) =>
                        handleInputChange('personal', 'physicallyChallengedReason', e.target.value)
                      }
                      placeholder="Please describe the nature of disability or specific challenges..."
                      rows={3}
                      disabled={!editMode.personal}
                      required
                    />
                    <small className="text-muted">
                      This information will help us provide appropriate accommodations and support.
                    </small>
                  </div>
                )}
              </CCol>
            </CRow>

            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Father's Name</CFormLabel>
                <CFormInput
                  value={formData?.personal?.fatherName || ''}
                  onChange={(e) => handleInputChange('personal', 'fatherName', e.target.value)}
                  disabled={!editMode.personal}
                  placeholder="Enter Father's Name"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Mother's Name</CFormLabel>
                <CFormInput
                  value={formData?.personal?.motherName || ''}
                  onChange={(e) => handleInputChange('personal', 'motherName', e.target.value)}
                  disabled={!editMode.personal}
                  placeholder="Enter Mother's Name"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <CFormLabel>Spouse&apos;s Name</CFormLabel>
                <CFormInput
                  value={formData?.personal?.spouseName || ''}
                  onChange={(e) => handleInputChange('personal', 'spouseName', e.target.value)}
                  disabled={!editMode.personal}
                  placeholder="Enter Spouse's Name"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Anniversary</CFormLabel>
                <CFormInput
                  type="date"
                  value={
                    formData?.personal?.anniversary
                      ? moment(formData.personal.anniversary).format('YYYY-MM-DD')
                      : ''
                  }
                  onChange={(e) => handleInputChange('personal', 'anniversary', e.target.value)}
                  disabled={!editMode.personal}
                />
              </CCol>
            </CRow>
            {((formData?.personal?.maritalStatus === 'married' ||
              formData?.personal?.maritalStatus === 'Married') &&
              (editMode.personal || (formData?.personal?.children != null && formData.personal.children !== ''))) && (
              <CRow className="mt-3">
                <CCol md={6}>
                  <CFormLabel>Children&apos;s</CFormLabel>
                  <CFormInput
                    value={formData?.personal?.children || ''}
                    onChange={(e) => handleInputChange('personal', 'children', e.target.value)}
                    disabled={!editMode.personal}
                    placeholder="e.g. 2"
                  />
                </CCol>
              </CRow>
            )}

            {/* <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Physically Challenged</CFormLabel>
                <CFormSelect
                  value={formData?.personal?.physicallyChallenged || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'physicallyChallenged', e.target.value)
                  }
                  disabled={!editMode.personal}
                >
                  <option value="">Select Option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </CFormSelect>
              </CCol>
            </CRow> */}

            <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Current Address</CFormLabel>
                <CFormTextarea
                  value={formData?.personal?.currentAddress || ''}
                  onChange={(e) => handleInputChange('personal', 'currentAddress', e.target.value)}
                  disabled={!editMode.personal}
                  placeholder="Enter Current Address"
                  rows={2}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Permanent Address</CFormLabel>
                <CFormTextarea
                  value={formData?.personal?.permanentAddress || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'permanentAddress', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Permanent Address"
                  rows={2}
                />
              </CCol>
            </CRow>

            {/* Additional Address Details - Current Address */}
            <CRow className="mt-3">
              <CCol xs={12}>
                <h6 className="text-muted mb-3">Current Address Details</h6>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Block</CFormLabel>
                <CFormInput
                  value={formData?.personal?.currentAddressBlock || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'currentAddressBlock', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Block"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Village</CFormLabel>
                <CFormInput
                  value={formData?.personal?.currentAddressVillage || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'currentAddressVillage', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Village"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>District</CFormLabel>
                <CFormInput
                  value={formData?.personal?.currentAddressDistrict || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'currentAddressDistrict', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter District"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>State</CFormLabel>
                <CFormInput
                  value={formData?.personal?.currentAddressState || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'currentAddressState', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter State"
                />
              </CCol>
            </CRow>

            <CRow className="mt-3">
              <CCol md={3}>
                <CFormLabel>Country</CFormLabel>
                <CFormInput
                  value={formData?.personal?.currentAddressCountry || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'currentAddressCountry', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Country"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Pincode</CFormLabel>
                <CFormInput
                  value={formData?.personal?.currentAddressPincode || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length > 7) {
                      value = value.slice(0, 7)
                    }
                    handleInputChange('personal', 'currentAddressPincode', value)
                  }}
                  disabled={!editMode.personal}
                  placeholder="Enter Pincode"
                  maxLength={7}
                />
                {getFieldError && getFieldError('personal', 'currentAddressPincode') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('personal', 'currentAddressPincode')}
                  </div>
                )}
              </CCol>
            </CRow>

            {/* Additional Address Details - Permanent Address */}
            <CRow className="mt-3">
              <CCol xs={12}>
                <h6 className="text-muted mb-3">Permanent Address Details</h6>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Block</CFormLabel>
                <CFormInput
                  value={formData?.personal?.permanentAddressBlock || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'permanentAddressBlock', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Block"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Village</CFormLabel>
                <CFormInput
                  value={formData?.personal?.permanentAddressVillage || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'permanentAddressVillage', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Village"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>District</CFormLabel>
                <CFormInput
                  value={formData?.personal?.permanentAddressDistrict || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'permanentAddressDistrict', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter District"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>State</CFormLabel>
                <CFormInput
                  value={formData?.personal?.permanentAddressState || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'permanentAddressState', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter State"
                />
              </CCol>
            </CRow>

            <CRow className="mt-3">
              <CCol md={3}>
                <CFormLabel>Country</CFormLabel>
                <CFormInput
                  value={formData?.personal?.permanentAddressCountry || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'permanentAddressCountry', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Country"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Pincode</CFormLabel>
                <CFormInput
                  value={formData?.personal?.permanentAddressPincode || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'permanentAddressPincode', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Pincode"
                />
                {getFieldError && getFieldError('personal', 'permanentAddressPincode') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('personal', 'permanentAddressPincode')}
                  </div>
                )}
              </CCol>
            </CRow>

            {/* Additional Personal Information */}
            <CRow className="mt-3">
              <CCol xs={12}>
                <h6 className="text-muted mb-3">Additional Information</h6>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Qualification</CFormLabel>
                <CFormInput
                  value={formData?.personal?.qualification || ''}
                  onChange={(e) => handleInputChange('personal', 'qualification', e.target.value)}
                  disabled={!editMode.personal}
                  placeholder="Enter Qualification"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Last Occupation</CFormLabel>
                <CFormInput
                  value={formData?.personal?.lastOccupation || ''}
                  onChange={(e) => handleInputChange('personal', 'lastOccupation', e.target.value)}
                  disabled={!editMode.personal}
                  placeholder="Enter Last Occupation"
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol md={6}>
                <CFormLabel>Reference Of Joining</CFormLabel>
                <CFormInput
                  value={formData?.personal?.referenceOfJoining || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'referenceOfJoining', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Reference of Joining"
                />
              </CCol>
            </CRow>

            {/* <CRow className="mt-3">
              <CCol md={6}>
                <CFormLabel>Aadhar Number</CFormLabel>
                <CFormInput
                  type="text"
                  value={formData?.personal?.aadharNo || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    value = value.slice(0, 12)
                    value = value.replace(/(\d{4})(?=\d)/g, '$1 ')

                    handleInputChange('personal', 'aadharNo', value)
                  }}
                  placeholder="1234 5678 9012"
                  maxLength={14}
                  disabled={!editMode.personal}
                />
                {getFieldError && getFieldError('personal', 'aadharNo') && (
                  <div className="text-danger small mt-1">
                    {getFieldError('personal', 'aadharNo')}
                  </div>
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>PAN Number</CFormLabel>
                <CFormInput
                  type="text"
                  // Prefer camelCase panNo, fallback to snake_case pan_no from backend and uppercase it for display
                  value={
                    (formData?.personal?.panNo && String(formData.personal.panNo).toUpperCase()) ||
                    (formData?.personal?.pan_no &&
                      String(formData.personal.pan_no).toUpperCase()) ||
                    ''
                  }
                  onChange={(e) => {
                    let value = (e.target.value || '').toUpperCase()
                    value = value.replace(/[^A-Z0-9]/g, '')
                    value = value.slice(0, 10)
                    // Update camelCase key if consuming form handler expects panNo
                    handleInputChange('personal', 'panNo', value)
                  }}
                  disabled={!editMode.personal}
                  placeholder="Enter PAN number"
                  maxLength={10}
                />
                {getFieldError && getFieldError('personal', 'panNo') && (
                  <div className="text-danger small mt-1">{getFieldError('personal', 'panNo')}</div>
                )}
              </CCol>
            </CRow> */}

            {/* Emergency Contacts */}
            <CRow className="mt-3">
              <CCol xs={12}>
                <h6 className="text-muted mb-3">Emergency Contacts</h6>
              </CCol>

              {/* Emergency Contact 1 */}
              <CCol md={4}>
                <CFormLabel>Emergency Contact 1 - Name</CFormLabel>
                <CFormInput
                  value={formData?.personal?.emergencyContact1Name || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'emergencyContact1Name', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Name"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Emergency Contact 1 - Relation</CFormLabel>
                <CFormSelect
                  value={formData?.personal?.emergencyContact1Relation || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'emergencyContact1Relation', e.target.value)
                  }
                  disabled={!editMode.personal}
                >
                  <option value="">Select Relation</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Emergency Contact 1 - Phone</CFormLabel>
                <CFormInput
                  value={formData?.personal?.emergencyContact1Phone || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length > 10) {
                      value = value.slice(0, 10)
                    }
                    handleInputChange('personal', 'emergencyContact1Phone', value)
                  }}
                  disabled={!editMode.personal}
                  placeholder="Enter Phone"
                  maxLength={10}
                />
                <small className="text-muted">Enter 10 digit phone number</small>
              </CCol>
            </CRow>

            {/* Emergency Contact 2 */}
            <CRow className="mt-3">
              <CCol md={4}>
                <CFormLabel>Emergency Contact 2 - Name</CFormLabel>
                <CFormInput
                  value={formData?.personal?.emergencyContact2Name || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'emergencyContact2Name', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Name"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Emergency Contact 2 - Relation</CFormLabel>
                <CFormSelect
                  value={formData?.personal?.emergencyContact2Relation || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'emergencyContact2Relation', e.target.value)
                  }
                  disabled={!editMode.personal}
                >
                  <option value="">Select Relation</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Emergency Contact 2 - Phone</CFormLabel>
                <CFormInput
                  value={formData?.personal?.emergencyContact2Phone || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length > 10) {
                      value = value.slice(0, 10)
                    }
                    handleInputChange('personal', 'emergencyContact2Phone', value)
                  }}
                  disabled={!editMode.personal}
                  placeholder="Enter Phone"
                  maxLength={10}
                />
                <small className="text-muted">Enter 10 digit phone number</small>
              </CCol>
            </CRow>

            {/* Emergency Contact 3 */}
            <CRow className="mt-3">
              <CCol md={4}>
                <CFormLabel>Emergency Contact 3 - Name</CFormLabel>
                <CFormInput
                  value={formData?.personal?.emergencyContact3Name || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'emergencyContact3Name', e.target.value)
                  }
                  disabled={!editMode.personal}
                  placeholder="Enter Name"
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Emergency Contact 3 - Relation</CFormLabel>
                <CFormSelect
                  value={formData?.personal?.emergencyContact3Relation || ''}
                  onChange={(e) =>
                    handleInputChange('personal', 'emergencyContact3Relation', e.target.value)
                  }
                  disabled={!editMode.personal}
                >
                  <option value="">Select Relation</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="spouse">Spouse</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel>Emergency Contact 3 - Phone</CFormLabel>
                <CFormInput
                  value={formData?.personal?.emergencyContact3Phone || ''}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length > 10) {
                      value = value.slice(0, 10)
                    }
                    handleInputChange('personal', 'emergencyContact3Phone', value)
                  }}
                  disabled={!editMode.personal}
                  placeholder="Enter Phone"
                  maxLength={10}
                />
                <small className="text-muted">Enter 10 digit phone number</small>
              </CCol>
            </CRow>

            {editMode.personal && (
              <CRow className="mt-3">
                <CCol xs={12} className="d-flex justify-content-end">
                  <CButton color="success" className="me-2" onClick={() => handleSave('personal')}>
                    <CIcon icon={cilSave} className="me-1" />
                    Save
                  </CButton>
                  <CButton color="secondary" onClick={() => handleCancel('personal')}>
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

export default PersonalInfo
