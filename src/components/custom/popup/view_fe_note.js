import React, { useEffect, useRef, useState } from 'react'

import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch } from 'react-redux'

const View_FE_Note = (props) => {
  const { visible, close, caseId } = props
  const [message, setMessage] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    ; (async () => {
      try {
        if (caseId) {
          let response = await new BasicProvider(`cases/show-popup-data/${caseId}`, dispatch).getRequest()
          if (response) {
            setMessage(response.data.fe_note)
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
          <CModalTitle id="StaticBackdropExampleLabel">Note by FE</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <div dangerouslySetInnerHTML={{ __html: message }} />
        </CModalBody>

        <CModalFooter>
          <CButton
            className="text-white delete_btn"
            color="danger"
            onClick={() => {
              close()
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default View_FE_Note
