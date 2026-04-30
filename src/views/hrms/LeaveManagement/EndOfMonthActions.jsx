import React, { useState } from 'react'
import { CCard, CCardHeader, CCardBody, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'

const EndOfMonthActions = () => {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [actionType, setActionType] = useState('')

  const handleAction = (type) => {
    setActionType(type)
    setShowModal(true)
  }

  const confirmAction = async () => {
    setLoading(true)
    try {
      let endpoint = ''
      switch (actionType) {
        case 'carryForward':
          endpoint = 'leaves/actions/carry-forward-cl'
          break
        case 'resetUL':
          endpoint = 'leaves/actions/reset-ul'
          break
        case 'applyPenalty':
          endpoint = 'leaves/actions/apply-penalty'
          break
        case 'generateReport':
          endpoint = 'leaves/actions/generate-report'
          break
        default:
          break
      }

      const response = await new BasicProvider(endpoint).postRequest()
      if (response.status === 'success') {
        toast.success(`${actionType} action completed successfully`)
      } else {
        toast.error(response.message || 'Action failed')
      }
    } catch (err) {
      toast.error(err?.message || 'Error while performing action')
    }
    setLoading(false)
    setShowModal(false)
  }

  return (
    <CCard className="m-3">
      <CCardHeader>End-of-Month Leave Actions</CCardHeader>
      <CCardBody className="d-flex gap-2 flex-wrap">
        <CButton color="primary" onClick={() => handleAction('carryForward')}>Carry Forward CL</CButton>
        <CButton color="warning" onClick={() => handleAction('resetUL')}>Reset UL</CButton>
        <CButton color="danger" onClick={() => handleAction('applyPenalty')}>Apply Penalty</CButton>
        <CButton color="success" onClick={() => handleAction('generateReport')}>Generate Report</CButton>
      </CCardBody>

      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm {actionType}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to perform <strong>{actionType}</strong> action for this month?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={confirmAction} disabled={loading}>
            {loading ? 'Processing...' : 'Confirm'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default EndOfMonthActions
