import { CButton, CModal, CModalBody, CModalFooter } from '@coreui/react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { customSuccessMSG } from './alertHelper'

const { default: HelperFunction } = require('./HelperFunctions')

export const CopyConformModal = ({
  moduleName,
  visible,
  setVisible,
  handleClose,
  currentPage,
  rowPerPage,
  userId,
}) => {
  const dispatch = useDispatch()
  let location = useLocation()
  const query = new URLSearchParams(location.search)
  if (moduleName) {
    var parts = moduleName.split('/')
    var module = parts.pop()
  }

  const capitalizeFirstLetter = (word) => {
    return word?.charAt(0).toUpperCase() + word?.slice(1)
  }

  const handleCopy = async () => {
    const success = await HelperFunction.postData(`${moduleName}/copy-case/${userId[0]}`, userId)
    dispatch({ type: 'set', toggleCleared: false })
    dispatch({ type: 'set', selectedrows: [] })
    setVisible(false)

    if (success) {
      const response = await HelperFunction.getData(moduleName, currentPage, rowPerPage)
      dispatch({ type: 'set', data: { [`${module}`]: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
    }
  }

  return (
    <CModal alignment="center" visible={visible} onClose={handleClose} className="delete_item_box">
      <CModalBody className="text-center mt-4">
        <div className="logo_x m-auto mb-3 border-info text-info">!</div>
        <span>
          Are you sure you want to copy this {capitalizeFirstLetter(module?.slice(0, -1))}?
        </span>
      </CModalBody>
      <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
        <CButton className="delete_btn model_btn" color="danger" onClick={handleCopy}>
          Yes
        </CButton>
        <CButton className="close_btn model_btn" color="secondary" onClick={handleClose}>
          No, cancel
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
