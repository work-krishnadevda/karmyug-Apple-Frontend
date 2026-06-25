import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTable,
  CTableHead,
  CTableDataCell,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
} from '@coreui/react'

import { faCopy, faRefresh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BasicProvider from 'src/constants/BasicProvider'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import { customSuccessMSG } from 'src/helpers/alertHelper'
import { useDispatch } from 'react-redux'
import moment from 'moment'
export const MessageShow = (props) => {
  let {
    caseId,
    visibleConfirmAcc,
    setVisibleConfirmAcc,
    isFromFE,
    handleAcceptCase,
    isFrom,
    handleSelfAssign,
    isShowSelfAssignBtn,
  } = props

  let caseValue = props.caseValue
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const location = useLocation()
  const query = new URLSearchParams(location.search)

  const [id, setId] = useState('')
  useEffect(() => {
    setId(caseId)
  }, [caseId])

  const handleClose = () => {
    props.close()
  }

  const copymessage = `Bank Case no.- ${caseValue && caseValue?.los_number ? caseValue?.los_number : '-'
    }
  🏦Finance Name- ${caseValue && caseValue?.finance_name?.name ? caseValue?.finance_name?.name : '-'
    }
  Date of Login -  ${moment(caseValue?.date_initiation_bank).format('DD MMM YYYY hh:mm:ss A')
      ? moment(caseValue?.date_initiation_bank).format('DD MMM YYYY hh:mm:ss A')
      : '-'}
    Case types- ${caseValue && caseValue?.case_type ? caseValue?.case_type : '-'}/ ${caseValue && caseValue?.product_name ? caseValue?.product_name : '-'}
  Case of Branch- ${caseValue && caseValue?.case_of_branch ? caseValue?.case_of_branch : '-'}
    
  📍CIN no.- ${caseValue && caseValue?.cin_number ? caseValue?.cin_number : '-'}
  👤Applicant Name- ${caseValue && caseValue?.applicant_name ? caseValue?.applicant_name : '-'}
  📞Contact No 1  - ${caseValue && caseValue?.contact_number_1 ? caseValue?.contact_number_1 : '-'}
  📞Contact No 2  - ${caseValue && caseValue?.contact_number_2 ? caseValue?.contact_number_2 : '-'}
  📞Contact No 3  - ${caseValue && caseValue?.contact_number_3 ? caseValue?.contact_number_3 : '-'}
  Visit Address- ${caseValue && caseValue?.address ? caseValue?.address : '-'}
  🍎RA Branch- ${caseValue && caseValue?.ra_branch?.name ? caseValue?.ra_branch?.name : '-'}
 
Lat & Long  - ${caseValue && caseValue?.latitude ? caseValue?.latitude : '-'}${caseValue && caseValue?.longitude ? caseValue?.longitude : '-'}
Initiate To - ${caseValue?.engineers?.length > 0
      ? caseValue.engineers.map((engineer) => engineer?.name).join(', ')
      : caseValue?.group?.name ?? '-'}`
  const copyToClipboard = () => {
    const textArea = document.createElement('textarea')
    textArea.value = copymessage
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      customSuccessMSG(dispatch, 'Message copied successfully!')
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err)
    }
    document.body.removeChild(textArea)
  }

  return (
    <>
      <CModal
        alignment="center"
        scrollable
        visible={props.visible}
        onClose={handleClose}
        aria-labelledby="VerticallyCenteredScrollableExample"
        className="model_show message_modal"
      >
        <CModalHeader>
          <CModalTitle
            id="ToggleBetweenModalsExample1"
            className="d-flex justify-content-between"
            style={{ width: '95%' }}
          >
            <div>Message</div>
            <CustomTooltip content="copy message">
              <CButton onClick={() => copyToClipboard()} color="primary" className="submit_btn">
                {' '}
                <FontAwesomeIcon icon={faCopy} />
              </CButton>
            </CustomTooltip>
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="bg-theme b-0 ">
          <div className="message_table">
            <CTable className="">
              <CTableHead></CTableHead>
              <CTableBody>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Bank Case no :
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.los_number ? caseValue.los_number : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    CIN No. :
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.cin_number ? caseValue?.cin_number : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Finance Name :
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.finance_name?.name
                      ? caseValue?.finance_name?.name
                      : '-'}
                  </CTableDataCell>
                </CTableRow>

                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Date of Login :
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {moment(caseValue?.date_initiation_bank).format('DD MMM YYYY hh:mm:ss A')
                      ? moment(caseValue?.date_initiation_bank).format('DD MMM YYYY hh:mm:ss A')
                      : '-'}
                  </CTableDataCell>

                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Case type:
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.case_type ? caseValue?.case_type : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Product Name:
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.product_name ? caseValue?.product_name : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Case of Branch :
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.case_of_branch ? caseValue?.case_of_branch : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Applicant Name :
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.applicant_name ? caseValue?.applicant_name : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Contact No (1):
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.contact_number_1 ? caseValue?.contact_number_1 : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Contact No (2):
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.contact_number_2 ? caseValue?.contact_number_2 : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Contact No (3):
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.contact_number_3 ? caseValue?.contact_number_3 : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Visit Address :
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.address ? caseValue?.address : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    MA Branch :
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.ra_branch?.name ? caseValue?.ra_branch?.name : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Lat & Long :
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.latitude ? caseValue?.latitude : '-'},
                    {caseValue && caseValue?.longitude ? caseValue?.longitude : '-'}
                  </CTableDataCell>
                </CTableRow>
                <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Initiate To :
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue?.engineers?.length > 0
                      ? caseValue.engineers.map((engineer) => engineer?.name).join(', ')
                      : caseValue?.group?.name ?? '-'}
                  </CTableDataCell>
                </CTableRow>
                   <CTableRow>
                  <CTableHeaderCell scope="row" className="font-small-size">
                    Remark:
                  </CTableHeaderCell>
                  <CTableDataCell className="font-small-size-data">
                    {caseValue && caseValue?.remark ? caseValue?.remark : '-'}
                  </CTableDataCell>
                </CTableRow>
              </CTableBody>
            </CTable>
          </div>
        </CModalBody>

        <CModalFooter>
          {isFrom == process.env.REACT_APP_DM && isShowSelfAssignBtn && (
            <CButton
              onClick={async () => {
                id && (await handleSelfAssign())
                handleClose()
              }}
              className="submit_btn"
              color="primary"
            >
              <FontAwesomeIcon icon={faRefresh} className="me-1" />
              Self-Assign
            </CButton>
          )}
          {!isFromFE && (
            <CButton
              className="w-25 submit_btn"
              color="primary"
              onClick={() => {
                props.setshowMessage(false)
                navigate('/case/all')
              }}
            >
              Ok
            </CButton>
          )}

          {isFromFE && (
            <CButton
              onClick={async () => {
                // id && await handleAcceptCase(id)
                handleClose()
                setVisibleConfirmAcc(true)
              }}
              className="submit_btn"
              color="primary"
            >
              Accept
            </CButton>
          )}
          <CButton
            className="text-white-50"
            color="danger"
            onClick={() => {
              props.close()
            }}
          >
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
