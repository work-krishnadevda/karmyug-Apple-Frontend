import React, { useEffect, useRef, useState } from 'react'
import {

    CButton,
    CModal,
    CModalBody,
    CModalFooter,

} from '@coreui/react'

import { cilPaperPlane } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNavigate } from 'react-router-dom'
import BasicProvider from 'src/constants/BasicProvider'



const ConfirmAccept = (props) => {

    const { visible, close, caseId, handleAcceptCase } = props

    const [show, setShow] = useState(false)
    const [id, setId] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        setShow(false)
        setId(caseId)
    }, [caseId])

    const handleClose = () => {
        setShow(false)
        props.close()
    }


    return (
        <>
            <CModal alignment="center" visible={visible} className="delete_item_box">
                <CModalBody className="text-center mt-4">
                    <div className="m-auto">
                        <img src="/tied-up.png" className='w-20' />
                    </div>
                    <span>Are you sure you want to accept the case ? </span>
                </CModalBody>

                <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
                    <CButton
                        onClick={async () => {
                            id && await handleAcceptCase(id)
                            handleClose()
                        }}
                        className="close_btn model_btn w-20"
                        color="danger"
                    >
                        Yes
                    </CButton>
                    <CButton className="btn-danger model_btn w-20 text-white" color="secondary" onClick={handleClose}>
                        No
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}


export default ConfirmAccept
