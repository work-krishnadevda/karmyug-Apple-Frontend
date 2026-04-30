import { CButton, CModal, CModalBody, CModalFooter } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import successImg from '../../../assets/images/success-img.jpg'
import submitImg from '../../../assets/images/submit.png'
import { auto } from '@popperjs/core'

const ConfirmSubmit = ({
  visible,
  close,
  caseId,
  handleAcceptCase,
  setInputVisible,
  handlesubmit,
  handleNextStep,
  isAllRequired,
  isPopupVisible,
  setIsPopupVisible,
  setIsNext

}) => {
  const [isOpen, setIsOpen] = useState(false)

  // console.log('isPopupVisible', isPopupVisible);
  // console.log('visible', visible);

  useEffect(() => {
    setIsOpen(visible)
  }, [visible])
  const handleClickYes = async () => {
    try {
      await handleAcceptCase(caseId)
      setInputVisible(true)

      setIsOpen(false)
      if (close) {
        close()
      } else {
      }
    } catch (error) {
      console.error('Error accepting case:', error)
    }
  }

  const handleClickNo = () => {
    setIsOpen(false)
    setIsPopupVisible(true)
    close()
  }

  const handleAdditionalPopupYes = async () => {
    try {
      if (handlesubmit) {
        handlesubmit()
        if (isAllRequired()) {
          setIsNext(true)
          // handleNextStep()

        }
      }

      setIsPopupVisible(false)
    } catch (error) {
      console.error('Error handling submit:', error)
    }
  }

  const handleAdditionalPopupNo = () => {
    setIsPopupVisible(false)

    if (close) {
      close()
    }
  }

  const handleAdditionalPopupClose = () => {
    setIsPopupVisible(false)
  }


  return (
    <>
      <CModal alignment="center" visible={visible} className="delete_item_box">
        <CModalBody className="text-center mt-4">
          <span>Did you visit this property earlier !! </span>
        </CModalBody>
        <div className="row justify-content-center">
          <div className="col-3 text-center">
            <img
              width={80}
              height={80}
              src={submitImg}
              className="fit-image"
              alt="Success Image"
            />
          </div>
        </div>
        <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
          <CButton onClick={handleClickYes} className="close_btn model_btn w-20" color="danger">
            Yes
          </CButton>

          <CButton
            className="btn-danger model_btn w-20 text-white"
            color="secondary"
            onClick={handleClickNo}
          >
            No
          </CButton>
          <br />
        </CModalFooter>
      </CModal>
      <CModal alignment="center" visible={isPopupVisible} className="additional_popup_box">
        <CModalBody className="text-center mt-4">
          <span>Are You Sure You Want To Submit?</span>
        </CModalBody>
        <div className="row justify-content-center">
          <div className="col-3 text-center">
            <img
              width={100}
              height={100}
              src={successImg}
              className="fit-image"
              alt="Success Image"
            />
          </div>
        </div>

        <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
          <CButton
            onClick={handleAdditionalPopupYes}
            className="close_btn model_btn w-20"
            color="success"
          >
            Yes
          </CButton>
          <CButton
            onClick={handleAdditionalPopupNo}
            className="btn-danger model_btn w-20 text-white"
            color="secondary"
          >
            No
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ConfirmSubmit
