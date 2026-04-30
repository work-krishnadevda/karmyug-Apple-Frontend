import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CFormLabel,
} from '@coreui/react'

import BasicProvider from 'src/constants/BasicProvider'

import { useDispatch, useSelector } from 'react-redux'
import { customSuccessMSG } from 'src/helpers/alertHelper'

const EditFeOldVisit = (props) => {

  const { visible, close, caseId, fetchShowCaseData } = props

  const dispatch = useDispatch()

  const [message, setMessage] = useState('')

  useLayoutEffect(() => {
    ; (async () => {

      try {
        if (caseId) {
          const data = await new BasicProvider(`cases/show-popup-data/${caseId}`, dispatch).getRequest()

          setMessage(data.data.visit_region_fe ?? '')

        }
      } catch (error) {
        dispatch({ type: 'set', validations: [error.data] })
      }
    })()
  }, [visible, caseId])

  const handleAddNote = async () => {
    try {
      if (!caseId && !null) {
        dispatch({ type: 'set', validations: ['Something went wrong!'] })
        return
      }

      if (!message && !null) {
        dispatch({ type: 'set', validations: ['Enter valid note!'] })
        return
      }

      let data = {
        visit_region_fe: message,
      }
      let response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest(data)
      if (response) {
        customSuccessMSG(dispatch, 'Updated Successfully!')
        close()
        setMessage('')
        fetchShowCaseData(caseId)
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <>
      <CModal alignment="center" visible={visible} className="delete_item_box">
        <CModalBody>

          <div>
            <CFormLabel>Enter Details</CFormLabel>
            <CFormTextarea
              className="mt-2"
              placeholder="Enter here.."
              id="floatingTextarea2"
              style={{ height: '100px' }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></CFormTextarea>

          </div>
        </CModalBody>

        <CModalFooter>
          <CButton onClick={handleAddNote} color="danger" className="text-white close_btn model_btn">
            Submit
          </CButton>
          <CButton
            className="text-white"
            color="danger"
            onClick={() => {
              close()
              setMessage('')
            }}
          >
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )

}


export default EditFeOldVisit
