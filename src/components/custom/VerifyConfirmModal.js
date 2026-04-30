import React from 'react'
import { CModal, CModalBody, CModalFooter, CButton } from '@coreui/react'

const VerifyConfirmModal = ({ visible, onClose, onConfirm, title = 'Are you sure you want to verify this item?' }) => (
  <CModal
    alignment="center"
    visible={visible}
    onClose={onClose}
    className="delete_item_box"
  >
    <CModalBody className="text-center mt-4">
      <div className="logo_x m-auto mb-3">?</div>
      <span>{title}</span>
    </CModalBody>
    <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
      <CButton className="delete_btn model_btn" color="success" onClick={onConfirm}>
        Yes
      </CButton>
      <CButton
        className="close_btn model_btn"
        color="secondary"
        onClick={onClose}
      >
        No, cancel
      </CButton>
    </CModalFooter>
  </CModal>
)

export default VerifyConfirmModal
