import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,

} from '@coreui/react'

import { useNavigate } from 'react-router-dom'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch } from 'react-redux'

import moment from 'moment';

const UnHold = (props) => {
  const { visible, close, handelUnholdCase, caseId } = props
  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [prevMessage, setPrevMessage] = useState('')

  useEffect(() => {
    setShow(false)
  }, [])

  const handleClose = () => {
    setShow(false)
    props.close()
  }

  useEffect(() => {
    ; (async () => {
      try {
        if (caseId) {
          let response = await new BasicProvider(`cases/show-popup-data/${caseId}`, dispatch).getRequest()
          let data = response?.data;
          setPrevMessage(data?.hold_message)
        }
      } catch (error) {
        console.log('error', error)
      }
    })()
  }, [caseId])

  return (
    <>
      <CModal alignment="center" visible={visible} className="delete_item_box">
        <CModalBody className="text-center mt-4">
          {prevMessage?.by && (
            <>
              Previously hold details are below.
              <div>
                <small>By: <strong>{prevMessage.by.name ? prevMessage.by.name : 'N/A'}</strong></small>
              </div>
              <div>
                <small>At: <strong>{prevMessage.at ? moment(prevMessage.at).format('MMMM Do YYYY, h:mm:ss a') : '-'}</strong></small>
              </div>
            </>
          )}

          {/* <div className="logo_x m-auto mb-3">x</div> */}

          <span className='mt-4'>
            <strong>Are you sure you want to Unhold the case ?</strong>
          </span>
        </CModalBody>

        <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
          <CButton
            onClick={async () => {
              await handelUnholdCase()
              handleClose()
            }}
            className="delete_btn model_btn"
            color="danger"
          >
            Yes
          </CButton>
          <CButton className="close_btn model_btn" color="secondary" onClick={handleClose}>
            No, cancel
          </CButton>
        </CModalFooter>

      </CModal>
    </>
  )

}


export default UnHold
