import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormTextarea,
  } from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { useNavigate } from 'react-router-dom'
import BasicProvider from 'src/constants/BasicProvider'

import { useDispatch } from 'react-redux'

const Concern = (props) => {
  const { visible, close, caseId, prefilledData } = props
  const dispatch = useDispatch()
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  const [message, setMessage] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [showError, setShowError] = useState('');

  useEffect(() => {
    fetchData()
    if (prefilledData) {
      const selectedOption = {
        value: prefilledData?.template?._id,
        label: prefilledData?.template?.subject,
        message: prefilledData?.message,
      };
      setSelectedOption(selectedOption);
      setMessage(prefilledData?.message || '');
      setTemplateId(prefilledData?.template?._id || '');
    }
  }, [visible, caseId])


  const fetchData = async () => {
    try {
      const response = await new BasicProvider('templates?type=simple').getRequest()
      const options = response?.data.data

      const optionsData = options?.map((item) => ({
        value: item._id,
        label: item.subject,
        message: item.message,
      }))
      setOptions([{ value: '', label: 'Select an option', disabled: true }, ...optionsData])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value
    const selectedOption = options.find((option) => option.value === selectedValue)

    setSelectedOption(selectedOption)

    setShowError('')
    if (selectedOption) {
      setTemplateId(selectedOption.value)
      setMessage(selectedOption.message)
    } else {
      setMessage('')
    }
  }

  const handleConcern = async () => {
    if (!templateId) {
      setShowError('Please select an option.')
      return
    }
    try {
      let response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest({
        status: 'concern by fe',
        message: message,
        templte_id: templateId,
        type: 'fe call',
      })

      if (response) {
        setMessage('')
        close()
      }
    } catch (error) {
      console.log('error', error)
    }
  }



  return (
    <>
      <CModal
        alignment="center"
        visible={visible}
        backdrop="static"
        // onClose={() => setVisibleConcernModel(false)}
        className="delete_item_box"
      >
        <CModalHeader>
          <CModalTitle id="StaticBackdropExampleLabel">Reason For Concern</CModalTitle>
        </CModalHeader>

        <CModalBody>
          <AppFormSelect
            aria-label="Default select example"
            options={options}
            onChange={handleSelectChange}
            value={selectedOption ? selectedOption.value : ''}
            placeholder="select your"
          />
          {showError && <div style={{ color: 'red', marginTop: '5px' }}>{showError}</div>}

          <CFormTextarea
            className="mt-2"
            placeholder="Leave a comment here"
            id="floatingTextarea2"
            style={{ height: '100px' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></CFormTextarea>
        </CModalBody>

        <CModalFooter>
          <CButton onClick={handleConcern} className="btn btn-primary me-2  submit_btn text-white">
            Submit
          </CButton>
          <CButton className="text-white" color="danger" onClick={(e) => {
            setShowError('');
            return close()
          }}>

            cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Concern
