import { CButton, CModal, CModalBody, CModalFooter } from '@coreui/react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import HelperFunction from './HelperFunctions'
import { customSuccessMSG } from './alertHelper'
import CIcon from '@coreui/icons-react'
import { cilSend } from '@coreui/icons'

export const SendBackConformModal = ({
  moduleName,
  visible,
  setVisible,
  handleClose,
  currentPage,
  rowPerPage,
  userId,
  type = null,
}) => {
  const dispatch = useDispatch()
  let location = useLocation()
  const navigate = useNavigate()
  // const router = useRoutes()
  const query = new URLSearchParams(location.search)
  if (moduleName) {
    var parts = moduleName.split('/')
    var module = parts.pop()
  }

  const capitalizeFirstLetter = (word) => {
    return word?.charAt(0).toUpperCase() + word?.slice(1)
  }

  const handleSendback = async () => {
    const success = await HelperFunction.patchData(`cases/send-back/dm`, userId)
    dispatch({ type: 'set', toggleCleared: false })
    dispatch({ type: 'set', selectedrows: [] })
    setVisible(false)

    if (success) {
      customSuccessMSG(dispatch, 'Send Back Successfuly')
      if (type == 'single') {
        navigate(`/${module?.slice(0, -1)}/all`)
      } else {
        const response = await HelperFunction.getData(
          `${moduleName}/pending`,
          currentPage,
          rowPerPage,
        )
        dispatch({ type: 'set', data: { [`${module}`]: response.data.data } })
        dispatch({ type: 'set', totalCount: response.data.total })
      }
    }
  }

  return (
    <CModal alignment="center" visible={visible} onClose={handleClose} className="delete_item_box">
      <CModalBody className="text-center mt-4">
        <div className="logo_x m-auto mb-3 border-info text-info">
          <CIcon className="pointer_cursor" icon={cilSend} />
        </div>
        <span>
          Are you sure you want to send back this {capitalizeFirstLetter(module?.slice(0, -1))} to
          DM ?
        </span>
      </CModalBody>
      <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
        <CButton className="delete_btn model_btn" color="danger" onClick={handleSendback}>
          Yes
        </CButton>
        <CButton className="close_btn model_btn" color="secondary" onClick={handleClose}>
          No, cancel
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
