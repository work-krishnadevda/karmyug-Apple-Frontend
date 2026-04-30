import React, { useState } from 'react'
import { CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CInputGroup,
} from '@coreui/react'
import { buildPropertyCreateFormData } from 'src/utils/propertyFormData'
import ForcePinAttachmentField from 'src/components/property/ForcePinAttachmentField'

const BrokerForm = ({ onSubmit, initialData, isSubmitting: parentSubmitting = false }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState([])
  const [localSubmitting, setLocalSubmitting] = useState(false)
  const isSubmitting = localSubmitting || parentSubmitting

  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      contactNumber1: '',
      contactNumber2: '',
      address: '',
      city: '',
      areaOfWork: '',
      district: '',
      yearsOfWorking: '',
      latitude: '',
      longitude: '',
      remark: '',
      type: 'broker',
    },
  )

  React.useEffect(() => {
    if (initialData) {
      setFormData((prevState) => ({
        ...prevState,
        ...initialData,
        yearsOfWorking: initialData.yearsOfWorking || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
      }))
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(formData.contactNumber1)) {
      alert('Contact no.1 numbers must be exactly 10 digits.')
      return
    } else {
      setShowConfirmModal(true)
    }
  }

  const confirmAndSubmit = async () => {
    const submitData = {
      ...formData,
      yearsOfWorking: Number(formData.yearsOfWorking),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    }

    const payload =
      attachmentFiles.length > 0
        ? buildPropertyCreateFormData(submitData, attachmentFiles)
        : submitData

    try {
      setLocalSubmitting(true)
      const result = await onSubmit(payload) // ✅ Wait for result from parent

      console.log('Submit Result:', result) // 🪵 Check what it returns

      if (result && result.status === 'success') {
        toast.success('Broker PIN is successfully submitted')
        setAttachmentFiles([])
        setShowConfirmModal(false)
      }
      // else {
      //   console.log()
      //   toast.error(result?.message || 'Submission failed.')

      // }
    } catch (error) {
      toast.error('Error during submission.')
      console.error('Submission error:', error)
    } finally {
      setLocalSubmitting(false)
    }
    // onSubmit(submitData)
    // setShowConfirmModal(false)

    // toast.success('Broker PIN is successfully submitted')

    // optionally reset form after submission
    // setFormData({...initialData or blank})
  }

  return (
    <>
      <CForm className="g-3 needs-validation mb-3" onSubmit={handleSubmit}>
        <CRow className="form-input-block">
          <CCol>
            <CCard>
              <CCardHeader>Broker Details</CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>
                        Broker Name<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="name"
                          value={formData.name}
                          placeholder="Enter name"
                          onChange={(e) => {
                            const upperValue = e.target.value.toUpperCase()
                            setFormData((prev) => ({ ...prev, name: upperValue }))
                          }}
                          required
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>
                        Contact No.1<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="contactNumber1"
                          value={formData.contactNumber1}
                          placeholder="Enter contact no. 1"
                          onChange={(e) => {
                            const value = e.target.value
                            if (/^\d{0,10}$/.test(value)) {
                              setFormData((prev) => ({ ...prev, contactNumber1: value }))
                            }
                          }}
                          required
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>Contact No.2</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="contactNumber2"
                          value={formData.contactNumber2}
                          placeholder="Enter contact no. 2"
                          onChange={(e) => {
                            const value = e.target.value
                            if (/^\d{0,10}$/.test(value)) {
                              setFormData((prev) => ({ ...prev, contactNumber2: value }))
                            }
                          }}
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>
                        Broker Office Address<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="address"
                          value={formData.address}
                          placeholder="Enter address"
                          onChange={handleChange}
                          required
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>
                        City<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="city"
                          value={formData.city}
                          placeholder="Enter city"
                          onChange={handleChange}
                          required
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>
                        Area of Work<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="areaOfWork"
                          value={formData.areaOfWork}
                          placeholder="Enter area of work"
                          onChange={handleChange}
                          required
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>
                        District<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="district"
                          value={formData.district}
                          placeholder="Enter district"
                          onChange={handleChange}
                          required
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>
                        Years of Working<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="number"
                          name="yearsOfWorking"
                          value={formData.yearsOfWorking}
                          placeholder="Enter years"
                          onChange={handleChange}
                          required
                          min={0}
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>Remark</CFormLabel>
                      <CInputGroup>
                        <CFormTextarea
                          name="remark"
                          value={formData.remark}
                          placeholder="Enter remark"
                          onChange={handleChange}
                          rows={1}
                          style={{ resize: 'none', minHeight: '30px', maxHeight: '40px' }}
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>
                        Latitude<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="number"
                          name="latitude"
                          value={formData.latitude}
                          placeholder="e.g. 28.7041"
                          onChange={handleChange}
                          required
                          step="any"
                          inputMode="decimal"
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <CFormLabel>
                        Longitude<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="number"
                          name="longitude"
                          value={formData.longitude}
                          placeholder="e.g. 77.1025"
                          onChange={handleChange}
                          required
                          step="any"
                          inputMode="decimal"
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <div className="mb-3">
                      <ForcePinAttachmentField
                        wrapInCol={false}
                        compact
                        files={attachmentFiles}
                        onFilesChange={setAttachmentFiles}
                      />
                    </div>
                  </CCol>
                </CRow>
                <div className="text-end mt-3">
                  <CButton color="primary" type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Uploading...' : 'Submit'}
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CForm>

      <CModal
        alignment="center"
        visible={showConfirmModal}
        onClose={() => {
          if (!isSubmitting) setShowConfirmModal(false)
        }}
        className="delete_item_box"
        backdrop="static"
        keyboard={false}
      >
        <CModalBody className="text-center mt-4">
          <div className="logo_x m-auto mb-3">?</div>
          <span>Are you sure you want to submit?</span>
        </CModalBody>
        <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
          <CButton
            className="delete_btn model_btn"
            color="success"
            disabled={isSubmitting}
            onClick={confirmAndSubmit}
          >
            {isSubmitting ? 'Uploading...' : 'Yes'}
          </CButton>
          <CButton
            className="close_btn model_btn"
            color="secondary"
            disabled={isSubmitting}
            onClick={() => setShowConfirmModal(false)}
          >
            No, cancel
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Toastify */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default BrokerForm
