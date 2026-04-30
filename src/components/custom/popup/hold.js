import React, { useEffect, useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormTextarea,
  CFormSelect,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

const Hold = (props) => {
  const {
    visible,
    close,
    caseId,
    fetchCaseData,
    type,
    status,
    call,
    isRedirectToAll,
    isEdit,
    onUpdate,
  } = props
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [message, setMessage] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [prevMessage, setPrevMessage] = useState(null)
  const loggedinUserRole = useSelector((state) => state?.userRole)

  const [error, setError] = useState(null)

  useEffect(() => {
    if (caseId) {
      fetchData()
      fetchCaseDetails()
    }

    return () => {
      setTemplateId('')
      setError('')
    }
  }, [visible, caseId, loggedinUserRole, type, isEdit])

  const fetchData = async () => {
    try {
      if (loggedinUserRole._id) {
        const response = await new BasicProvider(
          `templates?type=${type}&role=${loggedinUserRole._id}&count=100`,
          dispatch,
        ).getRequest()

        const optionsData = response.data.data.map((item) => ({
          value: item._id,
          label: item.subject,
          message: item.message,
        }))
        setOptions([{ value: '', label: 'Select an option' }, ...optionsData])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchCaseDetails = async () => {
    try {
      const response = await new BasicProvider(
        `cases/show-popup-data/${caseId}`,
        dispatch,
      ).getRequest()
      const data = response?.data

      if (data?.hold_message) {
        setPrevMessage(data.hold_message)

        const prevTemplateId = data.hold_message.template._id
        setTemplateId(prevTemplateId)
        // setMessage(prevTemplateId.message);

        const selectedOption = options.find((option) => option.value == prevTemplateId)

        if (selectedOption) {
          // setSelectedOption(selectedOption)
          // setMessage(selectedOption.message);
        }

        if (isEdit === true) {
          setSelectedOption(selectedOption)
          setMessage(data.hold_message.message)
        }
      }
    } catch (error) {
      console.log('Error fetching case details:', error)
    }
  }

  const handleConcern = async () => {
    try {
      if (!templateId) {
        setError('Please select a valid template.')
        return
      }

      let response
      if (isEdit) {
        response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest({
          message: message,
          templte_id: templateId,
        })
      } else {
        response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest({
          status: status,
          message: message,
          templte_id: templateId,
          type: call,
        })
      }

      if (response) {
        setMessage('')
        setError('')
        if (isRedirectToAll) {
          navigate('/case/all')
        }
        onUpdate && (await onUpdate())
        close()
      }
    } catch (error) {
      console.error('Error handling concern:', error)
    }
  }

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value
    const selectedOption = options.find((option) => option.value === selectedValue)
    setSelectedOption(selectedOption || null)
    setTemplateId(selectedValue)
    setMessage(selectedOption ? selectedOption.message : '')
    setError('')
  }

  return (
    <>
      <CModal
        alignment="center"
        visible={visible}
        className="delete_item_box"
        onHide={() => {
          setSelectedOption(null)
          setError('')
          setMessage('')
          close()
        }}
      >
        <CModalHeader>
          <div>
            <CModalTitle id="StaticBackdropExampleLabel">Case Hold</CModalTitle>
            {prevMessage?.by && (
              <>
                Previously hold details are below.
                <div>
                  <small>
                    By: <strong>{prevMessage.by.name || 'N/A'}</strong>
                  </small>
                </div>
                <div>
                  <small>
                    At:{' '}
                    <strong>
                      {prevMessage.at
                        ? moment(prevMessage.at).format('MMMM Do YYYY, h:mm:ss a')
                        : '-'}
                    </strong>
                  </small>
                </div>
              </>
            )}
          </div>
        </CModalHeader>

        <CModalBody>
          <CFormSelect
            aria-label="Default select example"
            options={options}
            onChange={handleSelectChange}
            value={selectedOption ? selectedOption.value : null}
            placeholder="Select an option"
          />
          {error && <div className="text-danger mt-1">{error}</div>}
          <CFormTextarea
            className="mt-2"
            placeholder="Leave a comment here"
            id="floatingTextarea2"
            style={{ height: '100px' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </CModalBody>

        <CModalFooter>
          <CButton
            className="close_btn model_btn text-white"
            onClick={async () => {
              await handleConcern()
              if (selectedOption) {
                fetchCaseDetails()
                fetchData()
                fetchCaseData && fetchCaseData()
                onUpdate && onUpdate()
                close()
              }
            }}
          >
            Submit
          </CButton>

          <CButton
            color="danger"
            className="text-white"
            onClick={() => {
              setSelectedOption(null)
              setMessage('')
              close()
            }}
          >
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Hold
