import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CCardImage,
  CFormInput,
  CCardHeader,
  CModalHeader,
  CModalTitle,
} from '@coreui/react'

import { cilPaperPlane } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import BasicProvider from 'src/constants/BasicProvider'

const GenrateWithAiHelper = (props) => {
  const { moduleName, visible, setVisible , selectedField} = props


  const [show, setShow] = useState(false)
  const navigate = useNavigate()
  const [report, setReport] = useState({
    message: '',
    to_customer_id: '',
  })

  useEffect(() => {
    setShow(false)
  }, [])

  const handleClose = () => {
    setShow(false)
    props.closeShortDecsMOdel()
  }

  const handleSubmit = async () => {
    setShow(true)
    return
    try {
      const response = await new BasicProvider(`public/report/create`).postRequest(report)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <CModal
        alignment="center"
        scrollable
        visible={props.visible}
        onClose={handleClose}
        aria-labelledby="VerticallyCenteredScrollableExample"
        className="model_show"
        size="lg"
      >
        <CModalHeader>
          <CModalTitle id="ToggleBetweenModalsExample1">Generate with AI.</CModalTitle>
        </CModalHeader>
        <CModalBody className="bg-theme b-0 ">
          <div className="report_user_Select mx-2 my-3">
            <CFormLabel className="white">Enter prompt here</CFormLabel>
            <div className="d-flex align-items-center gap-3">
              <CFormInput
                id="floatingInput"
                onChange={(event) => {
                  setReport({ ...report, message: event.target.value })
                }}
                placeholder="Type..."
              />
              <CButton className="btn-default btn-lg" onClick={handleSubmit}>
                <CIcon icon={cilPaperPlane} size="lg" />
              </CButton>
            </div>
          </div>

          {show && (
            <CCard className="mt-4">
              <CCardHeader className="d-flex justify-content-between align-items-center">
                Response
              </CCardHeader>
              <CCardBody>
                In this regard, the Institute of Chartered Accountants of India (ICAI) has been
                taking various initiatives from time to time to streamline and sustain the efforts
                in providing effective articleship. Currently, the total period of articleship is
                three years after clearing Group 1 of CA Intermediate Course.
              </CCardBody>
            </CCard>
          )}
        </CModalBody>
        {show && (
          <CModalFooter>
            <CButton color="primary" className="">
              Insert
            </CButton>
          </CModalFooter>
        )}
      </CModal>
    </>
  )
}

export default GenrateWithAiHelper
