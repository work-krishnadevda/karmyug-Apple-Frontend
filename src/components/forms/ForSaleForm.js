import React, { useState } from 'react'
import {
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CInputGroup,
} from '@coreui/react'
import { CModal, CModalHeader, CModalBody, CModalFooter } from '@coreui/react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { buildPropertyCreateFormData } from 'src/utils/propertyFormData'
import ForcePinAttachmentField from 'src/components/property/ForcePinAttachmentField'

const ForSaleForm = ({ onSubmit, initialData, isSubmitting: parentSubmitting = false }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState([])
  const [localSubmitting, setLocalSubmitting] = useState(false)
  const isSubmitting = localSubmitting || parentSubmitting
  const [formData, setFormData] = useState(
    initialData || {
      sellerName: '',
      contactNumber1: '',
      contactNumber2: '',
      propertyType: '',
      ageOfProperty: '',
      structure: '',
      otherStructure: '',
      propertyNo: '',
      colony: '',
      landmark: '',
      city: '',
      district: '',
      superBuiltupArea: '',
      carpetArea: '',
      ratePerSqft: '',
      totalRate: '',
      isOnRentalIncome: 'no',
      rentalIncomeAmount: '',
      remark: '',
      type: 'for sale',
      latitude: '',
      longitude: '',
      landArea: '',
    },
  )

  const [isCustom, setIsCustom] = useState(false)
  const [structure, setStructure] = useState('')

  const predefinedOptions = [
    'Plot',
    'Ground',
    'Under Construction',
    ...Array.from({ length: 10 }, (_, i) => `G+${i + 1}`),
    'Other',
  ]

  const handleDropdownChange = (e) => {
    const value = e.target.value
    if (value === 'Other') {
      setIsCustom(true)
      setFormData((prev) => ({
        ...prev,
        structure: '',
        otherStructure: '',
      }))
    } else {
      setIsCustom(false)
      setFormData((prev) => ({
        ...prev,
        structure: value,
        otherStructure: '',
      }))
    }
  }

  const handleCustomInputChange = (e) => {
    setStructure(e.target.value)
  }

  const handleOtherInputChange = (e) => {
    const value = e.target.value
    setFormData((prev) => ({
      ...prev,
      structure: value, // structure set ho raha yahan
      otherStructure: value,
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // const handleSubmit = (e) => {
  //   e.preventDefault()
  //   let submitData = {}
  //   Object.keys(formData).forEach((key) => {
  //     // Only send fields that are not empty, null, or undefined
  //     if (
  //       formData[key] !== '' &&
  //       formData[key] !== null &&
  //       formData[key] !== undefined &&
  //       !(key === 'rentalIncomeAmount' && formData.isOnRentalIncome !== 'yes')
  //     ) {
  //       submitData[key] = formData[key]
  //     }
  //   })
  //   // Convert number fields
  //   if (submitData.ageOfProperty) submitData.ageOfProperty = Number(submitData.ageOfProperty)
  //   if (submitData.superBuiltupArea) submitData.superBuiltupArea = Number(submitData.superBuiltupArea)
  //   if (submitData.carpetArea) submitData.carpetArea = Number(submitData.carpetArea)
  //   if (submitData.latitude) submitData.latitude = Number(submitData.latitude)
  //   if (submitData.longitude) submitData.longitude = Number(submitData.longitude)
  //   if (submitData.ratePerSqft) submitData.ratePerSqft = Number(submitData.ratePerSqft)
  //   if (submitData.totalRate) submitData.totalRate = Number(submitData.totalRate)
  //   if (submitData.isOnRentalIncome) submitData.isOnRentalIncome = submitData.isOnRentalIncome === 'yes'
  //   onSubmit(submitData)
  // }

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
    // e.preventDefault()
    let submitData = {}
    Object.keys(formData).forEach((key) => {
      // Only send fields that are not empty, null, or undefined
      if (
        formData[key] !== '' &&
        formData[key] !== null &&
        formData[key] !== undefined &&
        !(key === 'rentalIncomeAmount' && formData.isOnRentalIncome !== 'yes')
      ) {
        submitData[key] = formData[key]
      }
    })
    // Convert number fields
    if (submitData.ageOfProperty) submitData.ageOfProperty = submitData.ageOfProperty
    if (submitData.superBuiltupArea)
      submitData.superBuiltupArea = Number(submitData.superBuiltupArea)
    if (submitData.carpetArea) submitData.carpetArea = Number(submitData.carpetArea)
    if (submitData.latitude) submitData.latitude = Number(submitData.latitude)
    if (submitData.longitude) submitData.longitude = Number(submitData.longitude)
    if (submitData.ratePerSqft) submitData.ratePerSqft = Number(submitData.ratePerSqft)
    if (submitData.totalRate) submitData.totalRate = Number(submitData.totalRate)
    if (submitData.isOnRentalIncome)
      submitData.isOnRentalIncome = submitData.isOnRentalIncome === 'yes'
    const payload =
      attachmentFiles.length > 0
        ? buildPropertyCreateFormData(submitData, attachmentFiles)
        : submitData
    try {
      setLocalSubmitting(true)
      const result = await onSubmit(payload) // ✅ Wait for result from parent
      if (result && result.status === 'success') {
        toast.success('For Sale PIN is successfully submitted')
        setAttachmentFiles([])
        setShowConfirmModal(false)
      }
      // else {
      //   toast.error(result?.message || 'Submission failed.')
      // }
    } catch (error) {
      toast.error('Error during submission.')
      console.error('Submission error:', error)
    } finally {
      setLocalSubmitting(false)
    }
  }

  return (
    <>
      <CForm className="g-3 needs-validation mb-3" onSubmit={handleSubmit}>
        <CRow className="form-input-block">
          <CCol>
            <CCard>
              <CCardHeader>For Sale Property Details</CCardHeader>
              <CCardBody>
                {/* Row 1 */}
                <CRow>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>
                        Seller Name<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="sellerName"
                          value={formData.sellerName}
                          placeholder="Enter seller name"
                          onChange={(e) => {
                            const upperValue = e.target.value.toUpperCase()
                            setFormData((prev) => ({ ...prev, sellerName: upperValue }))
                          }}
                          required
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>
                        Contact No. 1<span className="text-danger">*</span>
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
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Contact No. 2</CFormLabel>
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
                          // required
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>
                        Property Type<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup>
                        <CFormSelect
                          name="propertyType"
                          value={formData.propertyType}
                          onChange={handleChange}
                          required
                          size="sm"
                        >
                          <option value="">Select property type</option>
                          <option value="residential">Residential</option>
                          <option value="commercial">Commercial</option>
                          <option value="industrial">Industrial</option>
                          <option value="land">Land</option>
                          <option value="other">Other</option>
                        </CFormSelect>
                      </CInputGroup>
                    </div>
                  </CCol>
                </CRow>
                {/* Row 2 */}
                <CRow>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Age of Property</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="ageOfProperty"
                          value={formData.ageOfProperty}
                          placeholder="Enter age of property"
                          onChange={handleChange}
                          min={0}
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Structure</CFormLabel>
                      <CInputGroup className="mb-2">
                        {!isCustom ? (
                          <CFormSelect
                            size="sm"
                            value={
                              formData.structure === '' && isCustom ? 'Other' : formData.structure
                            }
                            onChange={handleDropdownChange}
                          >
                            <option value="">Select structure</option>

                            {Array.from({ length: 10 }, (_, i) => (
                              <option key={`G+${i + 1}`} value={`G+${i + 1}`}>{`G+${
                                i + 1
                              }`}</option>
                            ))}
                            <option value="Plot">Plot</option>
                            <option value="Ground">Ground</option>
                            <option value="Under Construction">Under Construction</option>
                            <option value="Other">Other</option>
                          </CFormSelect>
                        ) : (
                          <CFormInput
                            size="sm"
                            placeholder="Type your structure..."
                            value={formData.otherStructure}
                            onChange={handleOtherInputChange}
                            onBlur={() => {
                              if (!formData.otherStructure) {
                                setIsCustom(false) // revert to dropdown if empty
                              }
                            }}
                          />
                        )}
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Address</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="propertyNo"
                          value={formData.propertyNo}
                          placeholder="Enter Address"
                          onChange={handleChange}
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Colony</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="colony"
                          value={formData.colony}
                          placeholder="Enter colony"
                          onChange={handleChange}
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                </CRow>
                {/* Row 3 */}
                <CRow>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Landmark</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="landmark"
                          value={formData.landmark}
                          placeholder="Enter landmark"
                          onChange={handleChange}
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
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
                  <CCol md={3}>
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
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Super Built-up Area</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="superBuiltupArea"
                          value={formData.superBuiltupArea}
                          placeholder="Enter super built-up area"
                          onChange={handleChange}
                          min={0}
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                </CRow>
                <CRow>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Carpet Area</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="carpetArea"
                          value={formData.carpetArea}
                          placeholder="Enter carpet area"
                          onChange={handleChange}
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Rate per Sqft</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="ratePerSqft"
                          value={formData.ratePerSqft}
                          placeholder="Enter rate per sqft"
                          onChange={handleChange}
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Unit Rate</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="totalRate"
                          value={formData.totalRate}
                          placeholder="Enter unit rate"
                          onChange={handleChange}
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Rental Income</CFormLabel>
                      <CInputGroup>
                        <CFormSelect
                          name="isOnRentalIncome"
                          value={formData.isOnRentalIncome}
                          onChange={handleChange}
                          size="sm"
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </CFormSelect>
                      </CInputGroup>
                    </div>
                  </CCol>
                  {formData.isOnRentalIncome === 'yes' && (
                    <CCol md={3}>
                      <div className="mb-3">
                        <CFormLabel>
                          Rental Income Amount <span className="text-danger">*</span>
                        </CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            required
                            type="text"
                            name="rentalIncomeAmount"
                            value={formData.rentalIncomeAmount}
                            placeholder="Enter rental income amount"
                            onChange={handleChange}
                            size="sm"
                            autoComplete="off"
                          />
                        </CInputGroup>
                      </div>
                    </CCol>
                  )}
                </CRow>
                {/* Row 5 */}
                <CRow>
                  <CCol md={3}>
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
                  <CCol md={3}>
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
                  <CCol md={3}>
                    <div className="mb-3">
                      <CFormLabel>Land Area</CFormLabel>
                      <CInputGroup>
                        <CFormInput
                          type="text"
                          name="landArea"
                          value={formData.landArea}
                          placeholder="e.g. 20*50"
                          onChange={handleChange}
                          step="any"
                          inputMode="decimal"
                          size="sm"
                          autoComplete="off"
                        />
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol md={3}>
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
                <CRow>
                  <CCol md={12}>
                    <div className="mb-3">
                      <CFormLabel>Remark</CFormLabel>
                      <CInputGroup>
                        <CFormTextarea
                          name="remark"
                          value={formData.remark}
                          placeholder="Enter remark"
                          onChange={handleChange}
                          rows={2}
                          style={{ resize: 'none', minHeight: '30px', maxHeight: '40px' }}
                          autoComplete="off"
                        />
                      </CInputGroup>
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

      {/* Confirmation Modal */}

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

export default ForSaleForm
