import React from 'react'
import { useEffect, useState, useMemo, useRef } from 'react'
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
import { cilPencil, cilSave, cilX, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import AsyncSelect from 'react-select/async'
import ConfirmationSlider from 'src/components/custom/ConfirmationSlider'

const ProfileSection = ({
  formData,
  editMode,
  canEditSection,
  handleEditToggle,
  handleSave,
  handleCancel,
  handleInputChange,
  defaultRoleOptions,
  loadRoleOptions,
  isLoadingData,
  locations = [],
  mutualAdmins,
  groups,
  loadGroupOptions,
  defaultGroupOptions = [],
  getFieldError,
}) => {
  let FE = 'Field Engineer (FE)'
  let role = formData?.profile?.role
  let RA = 'RA Branch BM'
  // Initialize with empty arrays - will be populated by useEffect
  const [roleState, setRoleState] = useState([])
  const [groupState, setGroupState] = useState([])
  const [raBranchState, setRaBranchState] = useState([])
  const [lockedMutualRoleIds, setLockedMutualRoleIds] = useState([])
  // Ref to track if user is actively selecting roles (prevents useEffect from overwriting)
  const isUserSelectingRef = useRef(false)
  // Ref to store current roles synchronously (for immediate value prop updates)
  const roleStateRef = useRef([])
const hasUserEditedRolesRef = useRef(false)

  // State for inactive confirmation modal
  const [showInactiveConfirm, setShowInactiveConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)

  useEffect(() => {
    const mutualIds = mutualAdmins?.flatMap((a) => a.role?.map((r) => r._id) || []) || []

    setLockedMutualRoleIds(Array.from(new Set(mutualIds)))
  }, [mutualAdmins])

  const profileRoleIds = Array.isArray(formData?.profile?.role)
    ? formData.profile.role
    : formData?.profile?.role
    ? [formData.profile.role]
    : []

  const mergedRoleIds = Array.from(new Set([...profileRoleIds, ...lockedMutualRoleIds]))

  const mergedRoleOptions = mergedRoleIds
    .map((id) => defaultRoleOptions.find((o) => o.value === id))
    .filter(Boolean)
 

  const roleLabels = mergedRoleIds
    .map((id) => defaultRoleOptions.find((o) => o.value === id)?.label)
    .filter(Boolean)

  // Check role slugs/names for SDM
  const roleSlugs = mergedRoleIds
    .map((id) => {
      const role = defaultRoleOptions.find((o) => o.value === id)
      return role?.slug || role?.name || ''
    })
    .filter(Boolean)

  const hasFE = roleLabels.includes('Field Engineer (FE)')
  const hasRABM = roleLabels.includes('RA Branch BM')
  const hasSDM = roleSlugs.includes(process.env.REACT_APP_SDM) || 
                 roleLabels.some(label => label && label.toLowerCase().includes('sdm'))
 
  useEffect(() => {
    roleStateRef.current = roleState
  }, [roleState])

  // useEffect(() => {
  //   // Skip if user is actively selecting roles (prevents overwriting user's selection)
  //   if (isUserSelectingRef.current) {
  //     return
  //   }
  //   if (
  //     roleStateRef.current.length === 0 &&
  //     isUserSelectingRef.current === false &&
  //     !formData?.profile?.role
  //   ) {
  //     return
  //   }

  //   const profileRoles = Array.isArray(formData?.profile?.role) ? formData.profile.role : []

  //   const mutualRoles = Array.isArray(mutualAdmins)
  //     ? mutualAdmins.flatMap((a) => a.role?.map((r) => r._id) || [])
  //     : []

  //   const newMergedRoles = Array.from(new Set([...profileRoles, ...mutualRoles]))

  //   // Only update if different (prevents unnecessary re-renders)
  //   // Compare arrays properly
  //   const currentIds = roleState.sort().join(',')
  //   const newIds = newMergedRoles.sort().join(',')

  //   if (currentIds !== newIds) {
  //     console.log('useEffect updating roleState:', {
  //       currentRoleState: roleState,
  //       newMergedRoles,
  //       profileRoles,
  //       mutualRoles,
  //     })
  //     setRoleState(newMergedRoles)
  //     roleStateRef.current = newMergedRoles // Update ref immediately
  //   }

  //   setGroupState(
  //     Array.from(
  //       new Set([
  //         ...(formData?.profile?.group || []),
  //         ...mutualAdmins.flatMap((a) => a.group || []),
  //       ]),
  //     ),
  //   )

  //   setRaBranchState(
  //     Array.from(
  //       new Set([
  //         ...(Array.isArray(formData?.profile?.raBranch)
  //           ? formData.profile.raBranch
  //           : formData?.profile?.raBranch
  //           ? [formData.profile.raBranch]
  //           : []),
  //         ...mutualAdmins.flatMap((a) => a.ra_branch || []),
  //       ]),
  //     ),
  //   )
  // }, [formData, mutualAdmins])

  // Helper function to get ALL roles (profile + mutual) for preservation
  // This ensures roles are always preserved when any field is edited
  
  
  // Track whether roles were edited by user
 

useEffect(() => {
  // ❌ Agar user ne roles edit kar diye → auto sync band
  if (hasUserEditedRolesRef.current) return

  const profileRoles = Array.isArray(formData?.profile?.role)
    ? formData.profile.role
    : []

  const mutualRoles = Array.isArray(mutualAdmins)
    ? mutualAdmins.flatMap((a) => a.role?.map((r) => r._id) || [])
    : []

  const mergedRoles = Array.from(new Set([...profileRoles, ...mutualRoles]))

  setRoleState(mergedRoles)
  roleStateRef.current = mergedRoles

  // group & raBranch can still sync
  setGroupState(
    Array.from(
      new Set([
        ...(formData?.profile?.group || []),
        ...mutualAdmins.flatMap((a) => a.group || []),
      ]),
    ),
  )

  setRaBranchState(
    Array.from(
      new Set([
        ...(Array.isArray(formData?.profile?.raBranch)
          ? formData.profile.raBranch
          : formData?.profile?.raBranch
          ? [formData.profile.raBranch]
          : []),
        ...mutualAdmins.flatMap((a) => a.ra_branch || []),
      ]),
    ),
  )
}, [formData, mutualAdmins])

  
  
  const getAllRolesToPreserve = () => {
    //  Use roleState first (current UI state with merged roles)
    // if (roleState && roleState.length > 0) {
    //   return roleState
    // }
    if (Array.isArray(roleState)) {
      return roleState
    }

    // Fallback: Get ALL displayed roles from mergedRoleOptions (includes profile + mutual)
    const allDisplayedRoleIds = mergedRoleOptions.map((opt) => opt.value)

    // Get current formData roles for additional fallback
    const formDataRoles = Array.isArray(formData?.profile?.role)
      ? formData.profile.role
      : formData?.profile?.role
      ? [formData.profile.role]
      : []

    // Merge displayed roles with formData roles to ensure we have ALL roles
    const merged = Array.from(
      new Set([
        ...allDisplayedRoleIds, // What's displayed (profile + mutual)
        ...formDataRoles, // What's in formData (fallback)
      ]),
    )

    return merged.length > 0 ? merged : []
  }

  // Helper function to update any profile field while preserving ALL roles
  const handleProfileFieldChange = (field, value) => {
    const allRolesToPreserve = getAllRolesToPreserve()
    handleInputChange('profile', {
      [field]: value,
      role: allRolesToPreserve, // Preserve ALL roles (profile + mutual)
    })
  }

  const handleRaBranchChange = (e) => {
    const value = e.target.value
    const raBranchValue = value ? [value] : []
    setRaBranchState(raBranchValue)
    // Use helper to preserve ALL roles
    handleProfileFieldChange('raBranch', raBranchValue)
  }

  const handleGroupChange = (selected) => {
    const ids = Array.isArray(selected) ? selected.map((o) => o.value) : []
    setGroupState(ids)
    // Use helper to preserve ALL roles
    handleProfileFieldChange('group', ids)
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <CIcon icon={cilUser} className="me-2" />
                <h5 className="mb-0">Profile Information</h5>
              </div>

              {canEditSection('profile') && (
                <CButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditToggle('profile')}
                >
                  <CIcon icon={cilPencil} className="me-1" />
                  {editMode.profile ? 'Cancel' : 'Edit'}
                </CButton>
              )}
              {!canEditSection('profile') && (
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
                <CCol md={6}>
                  <CFormLabel>Employee ID</CFormLabel>
                  <CFormInput
                    value={
                      (formData?.profile?.employeeId &&
                        String(formData.profile.employeeId).toUpperCase()) ||
                      (formData?.profile?.employee_id &&
                        String(formData.profile.employee_id).toUpperCase()) ||
                      (formData?.profile?._id && String(formData.profile._id).toUpperCase()) ||
                      (formData?.profile?.id && String(formData.profile.id).toUpperCase()) ||
                      ''
                    }
                    onChange={(e) =>
                      // Normalize to uppercase and update camelCase key (preserve existing handler contract)
                      handleInputChange(
                        'profile',
                        'employeeId',
                        String(e.target.value || '').toUpperCase(),
                      )
                    }
                    disabled={true}
                    placeholder="Enter Employee ID"
                  />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Name</CFormLabel>
                  <CFormInput
                    value={formData?.profile?.name || ''}
                    onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                    disabled={!editMode.profile}
                    placeholder="Enter Name"
                  />
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol md={6}>
                  <CFormLabel>Role</CFormLabel>

                  <AsyncSelect
                    isMulti
                    loadOptions={loadRoleOptions}
                    defaultOptions={defaultRoleOptions}
                    isDisabled={!editMode.profile}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select roles..."
                    /*  Use roleState - always create new array reference */
                    // value={(() => {
                    //   // const rolesToUse = roleState.length > 0 ? roleState : mergedRoleOptions.map(o => o.value)
                    //   const rolesToUse = roleState
                    //   const valueOptions = rolesToUse
                    //     .map((id) => defaultRoleOptions.find((o) => o.value === id))
                    //     .filter(Boolean)
                    //   return valueOptions.length > 0 ? [...valueOptions] : []
                    // })()}

                    value={roleState
                      .map((id) => defaultRoleOptions.find((o) => o.value === id))
                      .filter(Boolean)}
                    onChange={(selected) => {
                      // Mark that user is actively selecting (prevents useEffect from overwriting)
                      hasUserEditedRolesRef.current = true
                      isUserSelectingRef.current = true

                      // Normalize selected to array
                      let selectedArray = []
                      if (selected === null || selected === undefined) {
                        selectedArray = []
                      } else if (Array.isArray(selected)) {
                        selectedArray = selected
                      } else if (selected && typeof selected === 'object') {
                        selectedArray = [selected]
                      }

                      // Extract role IDs - these are the roles user CURRENTLY has selected (after removal)
                      const selectedIds = selectedArray
                        .map((o) => {
                          if (o && typeof o === 'object') {
                            return o.value || o.id || o._id
                          }
                          return o
                        })
                        .filter((id) => id !== null && id !== undefined && id !== '')

                      // UI is the source of truth - if user removes a role (including mutual), it stays removed
                      const finalRoles = selectedIds

                      roleStateRef.current = finalRoles

                      setRoleState(finalRoles)

                      handleInputChange('profile', 'role', finalRoles)

                      // Reset the ref after formData updates (prevents useEffect from overwriting)
                      setTimeout(() => {
                        isUserSelectingRef.current = false
                      }, 2000)
                    }}
                  />
                </CCol>

                <CCol md={6}>
                  <CFormLabel>Status</CFormLabel>
                  <CFormSelect
                    value={formData?.employment?.status || ''}
                    onChange={(e) => {
                      const newStatus = e.target.value

                      // If trying to set as inactive, show confirmation modal
                      if (newStatus === 'inactive') {
                        setPendingStatus('inactive')
                        setShowInactiveConfirm(true)
                        // Reset select to current value until confirmed
                        e.target.value = formData?.employment?.status || ''
                        return
                      }

                      // For active status, update directly
                      if (newStatus === 'active') {
                        const allRolesToPreserve = getAllRolesToPreserve()
                        handleInputChange('employment', 'status', newStatus)
                        handleInputChange('profile', 'role', allRolesToPreserve)
                      }
                    }}
                    disabled={!editMode.profile}
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </CFormSelect>
                  {formData?.employment?.status === 'inactive' &&
                    formData?.employment?.inactiveAt && (
                      <div className="small text-muted mt-1">
                        Inactive on:{' '}
                        {new Date(formData.employment.inactiveAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                </CCol>
              </CRow>
              <CRow className="mt-3">
                <CCol md={6}>
                  <CFormLabel>Contact Number</CFormLabel>
                  <CFormInput
                    value={formData?.personal?.phone || ''}
                    onChange={(e) => {
                      // Update personal phone and preserve ALL roles in profile
                      const allRolesToPreserve = getAllRolesToPreserve()
                      handleInputChange('personal', 'phone', e.target.value)
                      handleInputChange('profile', 'role', allRolesToPreserve)
                    }}
                    disabled={!editMode.profile}
                    maxLength={10}
                    placeholder="Enter Contact Number"
                  />
                  {getFieldError && getFieldError('personal', 'phone') && (
                    <div className="text-danger small mt-1">
                      {getFieldError('personal', 'phone')}
                    </div>
                  )}
                  <small className="text-muted">Enter 10 digit mobile number</small>
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Gender</CFormLabel>
                  <CFormSelect
                    value={formData?.personal?.gender || ''}
                    onChange={(e) => {
                      // Update personal gender and preserve ALL roles in profile
                      const allRolesToPreserve = getAllRolesToPreserve()
                      handleInputChange('personal', 'gender', e.target.value)
                      handleInputChange('profile', 'role', allRolesToPreserve)
                    }}
                    disabled={!editMode.profile}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <CFormLabel>Email</CFormLabel>
                  <CFormInput
                    type="email"
                    value={formData?.personal?.email || ''}
                    onChange={(e) => {
                      // Update personal email and preserve ALL roles in profile
                      const allRolesToPreserve = getAllRolesToPreserve()
                      handleInputChange('personal', 'email', e.target.value)
                      handleInputChange('profile', 'role', allRolesToPreserve)
                    }}
                    disabled={!editMode.profile}
                    placeholder="Enter Email"
                  />
                  {getFieldError && getFieldError('personal', 'email') && (
                    <div className="text-danger small mt-1">
                      {getFieldError('personal', 'email')}
                    </div>
                  )}
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Password</CFormLabel>
                  <CFormInput
                    type="text"
                    value={formData?.profile?.password || ''}
                    onChange={(e) => handleProfileFieldChange('password', e.target.value)}
                    disabled={!editMode.profile}
                    placeholder="Password"
                  />
                  <small className="text-muted">Password is read-only</small>
                </CCol>
              </CRow>
              <CRow>
                <CCol md={6}>
                  <CFormLabel>Alternate Number</CFormLabel>
                  <CFormInput
                    value={formData?.personal?.mobileAlternate || ''}
                    onChange={(e) => {
                      // Update personal mobileAlternate and preserve ALL roles in profile
                      const allRolesToPreserve = getAllRolesToPreserve()
                      handleInputChange('personal', 'mobileAlternate', e.target.value)
                      handleInputChange('profile', 'role', allRolesToPreserve)
                    }}
                    disabled={!editMode.profile}
                    maxLength={10}
                    placeholder="Enter Alternate Contact Number"
                  />
                  {getFieldError && getFieldError('personal', 'mobileAlternate') && (
                    <div className="text-danger small mt-1">
                      {getFieldError('personal', 'mobileAlternate')}
                    </div>
                  )}
                  <small className="text-muted">Enter 10 digit mobile number</small>
                </CCol>
              </CRow>

              {/* RA Location, RA Branch, and Group Information */}
              <CRow className="mt-3">
                {(hasRABM || hasSDM) && (
                  <CCol md={6}>
                    <CFormLabel>RA Branch</CFormLabel>
                    <CFormSelect
                      disabled={!editMode.profile}
                      value={
                        Array.isArray(formData?.profile?.raBranch)
                          ? formData.profile.raBranch[0] || ''
                          : formData?.profile?.raBranch || ''
                      }
                      onChange={handleRaBranchChange}
                    >
                      <option value="">Select RA Branch</option>
                      {locations.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </CFormSelect>
                    {hasSDM && (
                      <small className="text-muted">Required for SDM role</small>
                    )}
                  </CCol>
                )}

                {(hasFE || hasSDM) && (
                  <CCol md={6}>
                    <CFormLabel>Group</CFormLabel>

                    <AsyncSelect
                      isMulti
                      loadOptions={loadGroupOptions}
                      defaultOptions={defaultGroupOptions}
                      value={
                        Array.isArray(formData?.profile?.group)
                          ? formData.profile.group
                              .map((id) =>
                                [...defaultGroupOptions, ...groups].find((g) => g.value === id || g._id === id),
                              )
                              .filter(Boolean)
                          : []
                      }
                      isDisabled={!editMode.profile}
                      onChange={handleGroupChange}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '38px',
                          border: '1px solid #ced4da',
                          borderRadius: '0.375rem',
                          '&:hover': { borderColor: '#86b7fe' },
                        }),
                        multiValue: (provided) => ({
                          ...provided,
                          backgroundColor: '#e3f2fd',
                          borderRadius: '4px',
                        }),
                        multiValueLabel: (provided) => ({
                          ...provided,
                          color: '#1976d2',
                          fontSize: '0.875rem',
                        }),
                        multiValueRemove: (provided) => ({
                          ...provided,
                          color: '#1976d2',
                          '&:hover': { backgroundColor: '#bbdefb', color: '#0d47a1' },
                        }),
                      }}
                    />

                    <small className="text-muted">
                      {hasSDM 
                        ? 'You can select multiple groups for SDM role'
                        : 'You can select multiple groups for Field Engineer role'}
                    </small>
                  </CCol>
                )}
              </CRow>
              <CRow className="mt-3"></CRow>
              {/* <CRow className="mt-3">
                <CCol md={6}>
                  <CFormLabel>Profile Picture</CFormLabel>
                  <CFormInput type="file" accept="image/*" disabled={!editMode.profile} />
                </CCol>
              </CRow> */}
              {editMode.profile && (
                <CRow className="mt-3">
                  <CCol xs={12} className="d-flex justify-content-end">
                    <CButton
                      color="success"
                      className="me-2"
                      onClick={() => {
                        const allRoles = roleState.length > 0 ? roleState : getAllRolesToPreserve()

                        // Update formData with merged roles before save
                        if (allRoles.length > 0) {
                          handleInputChange('profile', {
                            ...formData.profile,
                            role: allRoles,
                          })
                        }

                        // Call handleSave after a brief delay to ensure state update
                        setTimeout(() => {
                          handleSave('profile')
                        }, 100)
                      }}
                    >
                      <CIcon icon={cilSave} className="me-1" />
                      Save
                    </CButton>
                    <CButton color="secondary" onClick={() => handleCancel('profile')}>
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

      {/* Inactive Status Confirmation Modal */}
      <ConfirmationSlider
        visible={showInactiveConfirm}
        onClose={() => {
          setShowInactiveConfirm(false)
          setPendingStatus(null)
        }}
        onConfirm={() => {
          // Update employment status to inactive, set inactive date, and preserve ALL roles in profile
          const allRolesToPreserve = getAllRolesToPreserve()
          handleInputChange('employment', 'status', 'inactive')
          handleInputChange('employment', 'inactiveAt', new Date().toISOString())
          handleInputChange('profile', 'role', allRolesToPreserve)
          setShowInactiveConfirm(false)
          setPendingStatus(null)
        }}
        title="Set Employee as Inactive"
        message={
          <>
            <p className="mb-2">Are you sure you want to set this employee as inactive?</p>
            <p className="mb-0 small">Please confirm that the following are clear:</p>
            <ul className="mb-0 mt-2 small">
              <li>Add-On & Penalties Effects</li>
              <li>Attendance & Weeks Status </li>
              <li>Salary, Advance & Adjustments</li>
              <li>Assets & Other Pendings</li>
            </ul>
          </>
        }
        confirmText="Are you sure want to inactive this employee?"
      />
    </>
  )
}

export default ProfileSection
