import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormCheck,
  CButton,
  CCol,
  CRow,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { toast } from 'react-toastify'
import BasicProvider from 'src/constants/BasicProvider'
import AdminPayRoll from './AdminPayRoll'
const AdminAttendanceSettings = () => {
  const [settings, setSettings] = useState({
    absentMax: 30,
    halfdayMin: 31,
    halfdayMax: 359,
    presentMin: 360,
    presentMax: 540,
    emergencyLeaveEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await new BasicProvider('attendances/admin/settings').getRequest()
      if (res.status === 'success') {
        setSettings({
          absentMax: res.data?.absentMax ?? 30,
          halfdayMin: res.data?.halfdayMin ?? 31,
          halfdayMax: res.data?.halfdayMax ?? 359,
          presentMin: res.data?.presentMin ?? 360,
          presentMax: res.data?.presentMax ?? 540,
          emergencyLeaveEnabled: res.data?.emergencyLeaveEnabled !== false,
        })
      }
      else toast.error('Failed to fetch settings')
    } catch (err) {
      toast.error('Failed to fetch settings')
    }
    setLoading(false)
  }

  const handleUpdateSettings = async () => {
    try {
      const res = await new BasicProvider('attendances/admin/settings').patchRequest(settings)
      if (res.status === 'success') toast.success('Settings updated successfully')
      else toast.error('Failed to update settings')
    } catch (err) {
      toast.error('Failed to update settings')
    }
    setShowConfirmModal(false)
  }

  return (
    <>
      <CCard className="m-3">
        <CCardHeader>
          <h5>Attendance Settings</h5>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <CSpinner />
          ) : (
            <CForm className="row g-3">
              <CCol md={4}>
                <CFormLabel>Absent Max (minutes)</CFormLabel>
                <CFormInput
                  type="number"
                  value={settings.absentMax}
                  onChange={(e) => setSettings({ ...settings, absentMax: Number(e.target.value) })}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Halfday Min (minutes)</CFormLabel>
                <CFormInput
                  type="number"
                  value={settings.halfdayMin}
                  onChange={(e) => setSettings({ ...settings, halfdayMin: Number(e.target.value) })}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Halfday Max (minutes)</CFormLabel>
                <CFormInput
                  type="number"
                  value={settings.halfdayMax}
                  onChange={(e) => setSettings({ ...settings, halfdayMax: Number(e.target.value) })}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Present Min (minutes)</CFormLabel>
                <CFormInput
                  type="number"
                  value={settings.presentMin}
                  onChange={(e) => setSettings({ ...settings, presentMin: Number(e.target.value) })}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Present Max (minutes)</CFormLabel>
                <CFormInput
                  type="number"
                  value={settings.presentMax}
                  onChange={(e) => setSettings({ ...settings, presentMax: Number(e.target.value) })}
                />
              </CCol>
              <CCol md={12}>
                <CFormCheck
                  id="emergencyLeaveEnabled"
                  label="Enable Emergency Leave option when staff applies for same-day (today) leave"
                  checked={settings.emergencyLeaveEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, emergencyLeaveEnabled: e.target.checked })
                  }
                />
              </CCol>
              <CCol md={12}>
                <CButton color="primary" onClick={() => setShowConfirmModal(true)}>
                  Update Settings
                </CButton>
              </CCol>
            </CForm>
          )}
        </CCardBody>

        {/* Confirmation Modal */}
        <CModal visible={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
          <CModalHeader>
            <CModalTitle>Confirm Update</CModalTitle>
          </CModalHeader>
          <CModalBody>Are you sure you want to update the attendance settings?</CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleUpdateSettings}>
              Yes, Update
            </CButton>
          </CModalFooter>
        </CModal>
      </CCard>
      <AdminPayRoll />
    </>
  )
}

export default AdminAttendanceSettings
