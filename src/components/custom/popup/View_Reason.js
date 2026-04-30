import React, { useEffect, useRef, useState } from 'react'

import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch } from 'react-redux'
import moment from 'moment'

const View_Reason = (props) => {
  const { visible, close, caseId } = props
  const [message, setMessage] = useState({})

  const dispatch = useDispatch()

  useEffect(() => {
    ;(async () => {
      try {
        if (caseId) {
          let response = await new BasicProvider(`cases/show/${caseId}`, dispatch).getRequest()
          let data = response.data
          if (data) {
            setMessage({
              message: data?.concern_message?.message,
              template: data?.concern_message?.template,
              user: data?.accepted_by,
              at: data?.concern_message?.at,
            })
          }
        }
      } catch (error) {
        console.log('error', error)
      }
    })()
  }, [caseId])

  return (
    <>
      <CModal alignment="center" visible={visible} className="delete_item_box">
        <CModalHeader>
          <div>
            <CModalTitle id="StaticBackdropExampleLabel">Concern Reason</CModalTitle>
            {message?.user?.name && (
              <>
                <div>
                  <small>
                    By : <strong>{message.user.name ? message.user.name : '-'}</strong>
                  </small>
                </div>
                <div>
                  <small>
                    At:{' '}
                    <strong>
                      {message.at ? moment(message.at).format('MMMM Do YYYY, h:mm:ss a') : '-'}
                    </strong>
                  </small>
                </div>
              </>
            )}
          </div>
        </CModalHeader>

        <CModalBody>
          <h6>{message && message?.template?.subject}</h6>
          <p>{message && message?.message}</p>
        </CModalBody>

        <CModalFooter>
          <CButton className="text-white-50" color="danger" onClick={close}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default View_Reason
