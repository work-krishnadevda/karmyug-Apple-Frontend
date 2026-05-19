import React, { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CContainer,
  CAlert,
  CSpinner,
  CButton,
  CRow,
  CCol
} from '@coreui/react'
import {
  cilPlus,
  cilUser
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'

// Custom hooks
import useEmployeeData from '../../hooks/useEmployeeData'
import usePermissions from '../../hooks/usePermissions'
import useFormValidation from '../../hooks/useFormValidation'

// Components
import ProfileSection from '../../components/hrms/sections/ProfileSection'
import GeneralSection from '../../components/hrms/sections/GeneralSection'
import PersonalSection from '../../components/hrms/sections/PersonalSection'
import EmploymentSection from '../../components/hrms/sections/EmploymentSection'
import BankSection from '../../components/hrms/sections/BankSection'
import UPISection from '../../components/hrms/sections/UPISection'
import AdditionalSection from '../../components/hrms/sections/AdditionalSection'
import AttachmentsSection from '../../components/hrms/sections/AttachmentsSection'

// Constants
import { FORM_SECTIONS, EDIT_PERMISSIONS } from '../../constants/hrmsConstants'

const HRMSProfileImproved = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Custom hooks
  const {
    employeeData,
    formData,
    loading,
    error,
    saving,
    updateEmployeeData,
    updateFormData,
    resetFormData,
    uploadDocument
  } = useEmployeeData(id)

  const {
    canEditSection,
    hasUserEditedSection,
    getSectionEditStatus
  } = usePermissions()

  const {
    errors,
    validateForm,
    clearAllErrors,
    getFieldError
  } = useFormValidation()

  // Local state
  const [editMode, setEditMode] = useState({})
  const [editAttempts, setEditAttempts] = useState({
    bank: false,
    attachments: false
  })

  // Validation rules
  const validationRules = {
    profile: {
      employeeId: { required: true, minLength: 3 },
      name: { required: true, minLength: 2 },
      designation: { required: true, minLength: 2 },
      staffType: { required: true },
      contactNumber: { required: true, phone: true },
      department: { required: true }
    },
    general: {
      firstName: { required: true, minLength: 2 },
      lastName: { required: true, minLength: 2 },
      dateOfBirth: { required: true },
      gender: { required: true }
    },
    personal: {
      email: { required: true, email: true },
      gender: { required: true },
      dob: { required: true },
      maritalStatus: { required: true },
      emergencyContact: { phone: true },
      fatherName: { minLength: 2 },
      motherName: { minLength: 2 },
      spouseName: { minLength: 2 },
      physicallyChallenged: { required: true }
    },
    employment: {
      department: { required: true },
      designation: { required: true, minLength: 2 },
      joiningDate: { required: true },
      employeeType: { required: true },
      basicSalary: { required: true, min: 0 },
      status: { required: true }
    },
    bank: {
      bankName: { required: true, minLength: 2 },
      accountNumber: { required: true, minLength: 8 },
      ifscCode: { required: true, pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/ },
      branchName: { required: true, minLength: 2 }
    },
    upi: {
      upiId: { required: true, pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
      upiApp: { required: true }
    },
    additional: {
      emergencyContactName: { required: true, minLength: 2 },
      emergencyContactNumber: { required: true, phone: true },
      bloodGroup: { required: true },
      maritalStatus: { required: true }
    }
  }

  // Initialize edit mode for each section
  React.useEffect(() => {
    const initialEditMode = {}
    Object.values(FORM_SECTIONS).forEach((section) => {
      initialEditMode[section] = false
    })
    setEditMode(initialEditMode)
  }, [])

  // Event handlers
  const handleFieldChange = useCallback((section, field, value) => {
    updateFormData(section, field, value)
  }, [updateFormData])

  const handleEditToggle = useCallback((section) => {
    const sectionStatus = getSectionEditStatus(section, editAttempts)
    
    if (!sectionStatus.canEdit) {
      if (sectionStatus.isRestricted) {
        alert(`You have already edited ${section} once. Only HR and Admin can edit further.`)
        return
      } else if (!EDIT_PERMISSIONS.LIMITED_SECTIONS.includes(section)) {
        alert('You can only edit Bank Details and Document Attachments.')
        return
      }
    }
    
    setEditMode(prev => ({ ...prev, [section]: !prev[section] }))
  }, [getSectionEditStatus, editAttempts])

  const handleSave = useCallback(async (section) => {
    try {
      // Validate the section data
      const sectionData = { [section]: formData[section] }
      const sectionRules = { [section]: validationRules[section] }
      
      if (!validateForm(sectionData, sectionRules)) {
        return
      }

      // Save the data
      const result = await updateEmployeeData(section, formData)
      
      if (result.success) {
        // Track edit attempts for non-HR/Admin users
        if (EDIT_PERMISSIONS.LIMITED_SECTIONS.includes(section)) {
          setEditAttempts(prev => ({
            ...prev,
            [section]: true
          }))
        }

        setEditMode(prev => ({ ...prev, [section]: false }))
        clearAllErrors()
      }
    } catch (error) {
      console.error('Error saving section:', error)
    }
  }, [formData, validateForm, updateEmployeeData, clearAllErrors])

  const handleCancel = useCallback((section) => {
    resetFormData()
    setEditMode(prev => ({ ...prev, [section]: false }))
    clearAllErrors()
  }, [resetFormData, clearAllErrors])

  const handleFileUpload = useCallback(async (field, file) => {
    try {
      const result = await uploadDocument(field, file)
      if (result.success) {
        // Update form data with file info
        updateFormData('attachments', field, file)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }, [uploadDocument, updateFormData])

  // Loading state
  if (loading) {
    return (
      <CContainer fluid className="py-4">
        <AppContentSkeleton ariaLabel="Loading improved HRMS profile" variant="detail" rows={8} />
      </CContainer>
    )
  }

  // Error state
  if (error) {
    return (
      <CContainer fluid>
        <CAlert color="danger">{error}</CAlert>
      </CContainer>
    )
  }

  return (
    <>
      {/* Header */}
      <CCard className="hr-header mb-4 mt-3" style={{borderRadius: '0px',width: '100%',border:'none'}}>
        <div className="d-flex justify-content-between align-items-center px-4 py-2">
          <div style={{borderLeft: '4px solid text-dark', paddingLeft: '10px'}}>
            <h2 className="mb-1 fw-bold text-dark">Profile Information</h2>
            <p className="mb-0 text-muted">View and manage all employees</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <CButton 
              color="primary" 
              className="px-3 py-2 rounded-pill d-flex align-items-center"
              onClick={() => navigate('/hrms/attendance')}
            >
              <CIcon icon={cilPlus} className="me-1" />
              Attendance
            </CButton>
            <CButton 
              color="primary" 
              className="px-3 py-2 rounded-pill"
              onClick={() => navigate('/hrms/leave/employee')}
            >
              Leave
            </CButton>
          </div>
        </div>
      </CCard>

      <CContainer fluid>
        {/* Edit Permissions Alert */}
        <CRow className="mb-4">
          <CCol xs={12}>
            <CAlert color="info">
              <div className="d-flex align-items-start">
                <CIcon icon={cilUser} className="me-3 mt-1" />
                <div className="flex-grow-1">
                  <div className="mb-2">
                    <strong>Edit Permissions:</strong> You can edit <strong>Bank Details</strong> and <strong>Document Attachments</strong> once each.
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <span className={`badge me-2 ${editAttempts.bank ? "bg-warning" : "bg-success"}`}>
                          {editAttempts.bank ? "✓" : "○"}
                        </span>
                        <span className={editAttempts.bank ? "text-warning" : "text-success"}>
                          <strong>Bank Details:</strong> {editAttempts.bank ? "Already edited" : "Available for editing"}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <span className={`badge me-2 ${editAttempts.attachments ? "bg-warning" : "bg-success"}`}>
                          {editAttempts.attachments ? "✓" : "○"}
                        </span>
                        <span className={editAttempts.attachments ? "text-warning" : "text-success"}>
                          <strong>Document Attachments:</strong> {editAttempts.attachments ? "Already edited" : "Available for editing"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CAlert>
          </CCol>
        </CRow>

        {/* Form Sections */}
        <ProfileSection
          data={formData.profile}
          isEditing={editMode.profile}
          onFieldChange={handleFieldChange}
          onEditToggle={() => handleEditToggle('profile')}
          onSave={() => handleSave('profile')}
          onCancel={() => handleCancel('profile')}
          canEdit={canEditSection('profile', editAttempts)}
          editAttempts={editAttempts}
          errors={errors}
        />

        <GeneralSection
          data={formData.general}
          isEditing={editMode.general}
          onFieldChange={handleFieldChange}
          onEditToggle={() => handleEditToggle('general')}
          onSave={() => handleSave('general')}
          onCancel={() => handleCancel('general')}
          canEdit={canEditSection('general', editAttempts)}
          editAttempts={editAttempts}
          errors={errors}
        />

        <PersonalSection
          data={formData.personal}
          isEditing={editMode.personal}
          onFieldChange={handleFieldChange}
          onEditToggle={() => handleEditToggle('personal')}
          onSave={() => handleSave('personal')}
          onCancel={() => handleCancel('personal')}
          canEdit={canEditSection('personal', editAttempts)}
          editAttempts={editAttempts}
          errors={errors}
        />

        <EmploymentSection
          data={formData.employment}
          isEditing={editMode.employment}
          onFieldChange={handleFieldChange}
          onEditToggle={() => handleEditToggle('employment')}
          onSave={() => handleSave('employment')}
          onCancel={() => handleCancel('employment')}
          canEdit={canEditSection('employment', editAttempts)}
          editAttempts={editAttempts}
          errors={errors}
        />

        <BankSection
          data={formData.bank}
          isEditing={editMode.bank}
          onFieldChange={handleFieldChange}
          onEditToggle={() => handleEditToggle('bank')}
          onSave={() => handleSave('bank')}
          onCancel={() => handleCancel('bank')}
          canEdit={canEditSection('bank', editAttempts)}
          editAttempts={editAttempts}
          errors={errors}
        />

        <UPISection
          data={formData.upi}
          isEditing={editMode.upi}
          onFieldChange={handleFieldChange}
          onEditToggle={() => handleEditToggle('upi')}
          onSave={() => handleSave('upi')}
          onCancel={() => handleCancel('upi')}
          canEdit={canEditSection('upi', editAttempts)}
          editAttempts={editAttempts}
          errors={errors}
        />

        <AdditionalSection
          data={formData.additional}
          isEditing={editMode.additional}
          onFieldChange={handleFieldChange}
          onEditToggle={() => handleEditToggle('additional')}
          onSave={() => handleSave('additional')}
          onCancel={() => handleCancel('additional')}
          canEdit={canEditSection('additional', editAttempts)}
          editAttempts={editAttempts}
          errors={errors}
        />

        <AttachmentsSection
          data={formData.attachments}
          isEditing={editMode.attachments}
          onFieldChange={handleFileUpload}
          onEditToggle={() => handleEditToggle('attachments')}
          onSave={() => handleSave('attachments')}
          onCancel={() => handleCancel('attachments')}
          canEdit={canEditSection('attachments', editAttempts)}
          editAttempts={editAttempts}
          errors={errors}
        />
      </CContainer>
    </>
  )
}

export default HRMSProfileImproved
