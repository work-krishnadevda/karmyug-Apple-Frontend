import React, { useEffect, useRef, useState } from 'react'

import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch } from 'react-redux'

const ViewQuickLinks = (props) => {
    const { visible, close } = props
    const dispatch = useDispatch()

    const effectRef = useRef(false)

    let [links, setLinks] = useState([])

    useEffect(() => {
        ; (async () => {

            if (effectRef.current === false) {
                effectRef.current = true
                try {
                    let response = await new BasicProvider(`settings/quick-links`, dispatch).getRequest()
                    if (response) {
                        setLinks(response?.data?.value)
                    }
                } catch (error) {
                    console.log('error', error)
                }
            }

        })()
    }, [])

    return (
        <>
            <CModal alignment="center" visible={visible} className="delete_item_box">
                <CModalHeader>
                    <CModalTitle id="StaticBackdropExampleLabel">Quick Links</CModalTitle>
                </CModalHeader>

                <CModalBody>
                    <CTable className="">
                        {links?.length > 0 ? (
                            links?.map((link, index) => (
                                <CTableRow key={index}>
                                    <CTableHeaderCell scope="row" className="font-small-size">
                                        <a href={link.link} target="_blank" rel="noopener noreferrer">
                                            {link?.name}
                                        </a>
                                    </CTableHeaderCell>
                                    {/* <CTableDataCell className="font-small-size-data">
                                        <a href={link.link} target="_blank" rel="noopener noreferrer">
                                            {link.link}
                                        </a>
                                    </CTableDataCell> */}
                                </CTableRow>
                            ))
                        ) : (

                            'Links Not Available Right Now!!'
                        )}
                    </CTable>
                </CModalBody>
                <CModalFooter className="">

                    <CButton className="text-white-50" color="danger" onClick={close}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default ViewQuickLinks
