import React, { useEffect, useRef, useState } from 'react'

import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch } from 'react-redux'
import moment from 'moment';


const ConcurnResolutio = (props) => {

    const { visible, close, caseId } = props

    const [message, setMessage] = useState(null)
    const dispatch = useDispatch()

    useEffect(() => {
        ; (async () => {
            try {
                if (caseId) {
                    let response = await new BasicProvider(`cases/show-popup-data/${caseId}`, dispatch).getRequest()
                    if (response) {

                        setMessage(response?.data?.concern_resolution)
                    }
                }
            } catch (error) {
                console.log('error', error)
            }
        })()
    }, [caseId, visible])



    return (
        <>
            <CModal alignment="center" visible={visible} className="delete_item_box">
                <CModalHeader>
                    <div>
                        <CModalTitle id="StaticBackdropExampleLabel">Concern Resolution Response</CModalTitle>
                        {
                            message?.last_updated?.name && (
                                <>
                                    <div>
                                        <small>Last updated by : <strong>{`${message?.last_updated?.name}(${message?.last_updated?.role[0]?.display_name})`}</strong></small>

                                    </div>
                                    <div>
                                        <small>At: <strong>{message?.at ? moment(message?.at).format('MMMM Do YYYY, h:mm:ss A') : '-'}</strong></small>
                                    </div>

                                </>
                            )
                        }
                    </div>
                </CModalHeader>

                <CModalBody>
                    <p>{message && message.message}</p>
                </CModalBody>
                <CModalFooter>
                    <CButton className="model_btn text-white" color="danger" onClick={close}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )

}

export default ConcurnResolutio
