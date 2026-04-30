import React, { useEffect, useRef, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import AsyncSelect from 'react-select/async'

import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
} from '@coreui/react'

import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import handleSubmitHelper from 'src/helpers/submitHelper'
import { data } from 'src/views/banks/data'
import { customSuccessMSG, setAlertTimeout } from 'src/helpers/alertHelper'
import Hold from '../../popup/hold'

let json = data[0].fields

const validationRules = {}

import axios from 'axios'

import { io } from 'socket.io-client'
import { holdStatuses } from 'src/constants/variables'
import OthersAttechments from '../../popup/otherAttechments'

const URL = process.env.REACT_APP_NODE_URL

const DmForm = ({
  initialValues,
  setInitialValues,
  // handleSubmit,
  showCaseData,
  additionalFields,
  setAdditionalFields,
  additionalJson,
  setAdditionalJson,
  beforSubmitError,
  setBeforSubmitError,
  fetchData,
  fetchSHowCaseData,
  editorLoaded,
  setEditorLoaded,
  setVisibleMapModel,
}) => {
  let loggedinUserRole = useSelector((state) => state?.userRole)
  let loggedinUser = useSelector((state) => state.userData)

  var params = useParams()
  var dispatch = useDispatch()
  const navigate = useNavigate()
  const id = params.id
  const isEditMode = !!id

  const [selectedRole, setSelectedRole] = useState(null)

  const [defaultOptionRC, setDefaultOptionRC] = useState([])

  const [isSubmittedBank, setIsSubmittedBank] = useState(false)

  // const [editorLoaded, setEditorLoaded] = useState(false)

  const [dmJson, setDmJson] = useState({})

  const [calcJson, setCalcJson] = useState({})

  const [caseId, setCaseId] = useState('')

  const [visibleHoldModel, setVisibleHoldModel] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})

  const [isMapModelShown, setIsMapModelShown] = useState(false)

  const [showOthersAttechments, setShowOthersAttechments] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    if (!loggedinUser?._id) return
    if (socketRef.current) return
    const socket = io(URL, {
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('identify', loggedinUser._id)
    })

    socket.on('upload-progress', (data) => {
      setUploadProgress((prev) => ({
        ...prev,
        file: data.file,
        status: data.status,
      }))
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [loggedinUser?._id])

  const editorRef = useRef()
  const { CKEditor, ClassicEditor } = editorRef.current || {}
  const treeRef = useRef(null)

  useEffect(() => {
    editorRef.current = {
      CKEditor: require('@ckeditor/ckeditor5-react').CKEditor, // v3+
      ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
    }
    // setEditorLoaded(true)
  }, [])

  useEffect(() => {
    fetchDefaultOptionForRC()
  }, [])

  const fetchDefaultOptionForRC = async () => {
    let slugs = [process.env.REACT_APP_RC, process.env.REACT_APP_LCTO, process.env.REACT_APP_CTO]

    const queryString = slugs.join(',')
    const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&page=1&count=500`

    try {
      const response = await new BasicProvider(url).getRequest()

      const options = [
        { label: 'Submit to Bank', value: 'submit to bank', role: 'Bank' },
        ...response?.data.map((item) => ({
          label: item.name,
          value: item._id,
          role: item.role.name,
        })),
      ]

      setDefaultOptionRC(options)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsForRC = async (inputValue, callback) => {
    let slugs = [process.env.REACT_APP_RC, process.env.REACT_APP_LCTO, process.env.REACT_APP_CTO]

    const queryString = slugs.join(',')

    try {
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&search=${inputValue}`,
      ).getRequest()
      const options = response.data.map((item) => ({
        label: item.name,
        value: item._id,
        role: item.role.name,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  const renderAdditonalFields = (field) => {
    const fieldName = field.key
    const role = field?.role

    const additionalJsonArray = Array.isArray(additionalJson) ? additionalJson : []
    const objectIndex = additionalJsonArray.findIndex((obj) => obj.role === role)
    const fieldValue = objectIndex >= 0 ? additionalJsonArray[objectIndex][fieldName] : ''

    const updateFieldValue = (key, value) => {
      setAdditionalJson((prevFormData) => {
        const prevFormDataArray = Array.isArray(prevFormData) ? prevFormData : []

        const newFormData = [...prevFormDataArray]

        if (objectIndex >= 0) {
          newFormData[objectIndex] = {
            ...newFormData[objectIndex],
            [key]: value,
          }
        } else {
          newFormData.push({
            role: role,
            [key]: value,
          })
        }
        return newFormData
      })
    }

    switch (field.type) {
      case 'text':
        return (
          <CFormInput
            type="text"
            name={fieldName}
            autoComplete="off"
            value={fieldValue}
            onChange={(e) => updateFieldValue(fieldName, e.target.value)}
          />
        )
      case 'select':
        return (
          <CFormSelect
            name={fieldName}
            value={fieldValue}
            onChange={(e) => updateFieldValue(fieldName, e.target.value)}
          >
            <option value="">Select Option</option>
            {field?.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </CFormSelect>
        )
      default:
        return null
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setBeforSubmitError('')
    }, 3000)

    return () => clearTimeout(timer)
  }, [beforSubmitError])

  const updatedFinance = (initialValues?.finance_name?.fields || []).map((item) => {
    let updatedItem = { ...item }
    const matchedData = Object.entries(initialValues).find(([key, value]) => item.title === key)

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      const options = { day: 'numeric', month: 'short', year: 'numeric' }
      return date.toLocaleDateString('en-GB', options)
    }
    if (
      matchedData &&
      matchedData[1] !== undefined &&
      matchedData[1] !== null &&
      matchedData[1] !== ''
    ) {
      if (
        ['date_initiation_bank', 'date_initiation_RA', 'mortaged_month_year'].includes(
          matchedData[0],
        )
      ) {
        updatedItem.value = formatDate(matchedData[1])
      } else {
        updatedItem.value = matchedData[1]
      }
    } else if (initialValues.additional_fields && Array.isArray(initialValues.additional_fields)) {
      const additionalField = initialValues.additional_fields.find((field) => {
        return field?.role?.toLowerCase() === item?.role?.toLowerCase()
      })
      if (
        additionalField &&
        additionalField[item.title] !== undefined &&
        additionalField[item.title] !== null &&
        additionalField[item.title] !== ''
      ) {
        if (
          ['date_initiation_bank', 'date_initiation_RA', 'mortaged_month_year'].includes(item.title)
        ) {
          updatedItem.value = formatDate(additionalField[item.title])
        } else {
          updatedItem.value = additionalField[item.title]
        }
      } else {
        updatedItem.value = ''
      }
    } else {
      updatedItem.value = ''
    }

    return updatedItem
  })

  const generateReport = async () => {
    if (showCaseData && showCaseData?.finance_name) {
      let fullUrl = `${process.env.REACT_APP_NODE_URL}/${showCaseData?.finance_name?.featured_image?.filepath}`
      let json = {
        pdf_url: fullUrl,
        data: updatedFinance,
        images: initialValues.fe_images_data,
        images_2: initialValues.dm_images_data,
        page: showCaseData?.finance_name?.images_page_no,
        addon_data: showCaseData.case_addons,
      }

      try {
        let response = await new BasicProvider('cases/genrate/report').postRequest(json)
        if (response && response.data) {
          let url = response.data.file_url

          if (url) window.open(url, '_blank')
        }
      } catch (error) {
        console.error('Error generating report:', error)
      }
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)

      initialValues.dm_fields = dmJson
      initialValues.additional_fields = additionalJson
      initialValues.calculation_Json = calcJson ?? {}

      let formValues = { ...initialValues }

      delete formValues.status

      const data = await handleSubmitHelper(formValues, validationRules, dispatch)
      if (data === false) return

      var response
      if (isEditMode) {
        response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)
        fetchData()
        setIsLoading(false)
      }
      customSuccessMSG(dispatch, 'Saved Successfully')
    } catch (error) {
      console.log(error)
      setIsLoading(false)

      dispatch({ type: 'set', validations: [error.data] })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignRC = async () => {
    try {
      setIsLoading(true)

      initialValues.dm_fields = dmJson
      initialValues.additional_fields = additionalJson

      const statusObj = {
        rc: 'pending for rc',
        lcto: 'pending for lcto',
        cto: 'pending for cto',
      }

      const slugsObj = {
        rc: process.env.REACT_APP_RC,
        lcto: process.env.REACT_APP_LCTO,
        cto: process.env.REACT_APP_CTO,
      }

      if (selectedRole) {
        if (isSubmittedBank && selectedRole.value === 'submit to bank') {
          initialValues.status = 'submitted to bank'
        } else {
          const matchingSlug = Object.entries(slugsObj).find(
            ([key, value]) => value === selectedRole.role,
          )

          if (matchingSlug) {
            let matched = matchingSlug[0]
            initialValues.status = statusObj[matched]
          }
        }
      }

      if (!showCaseData.map_data && initialValues.status == 'submitted to bank') {
        setVisibleMapModel(true)
        setIsMapModelShown(true)
        return
      }

      if (
        showCaseData.map_data &&
        Object.keys(showCaseData.map_data).length > 0 &&
        !isMapModelShown &&
        initialValues.status == 'submitted to bank'
      ) {
        setVisibleMapModel(true)
        setIsMapModelShown(true)
        return
      }

      if (!initialValues?.submit_type) {
        dispatch({ type: 'set', validations: ['Please Select Submit Type'] })
        setIsLoading(false)
        return
      }

      if (!selectedRole) {
        dispatch({ type: 'set', validations: ['Please Select Submit to '] })
        setIsLoading(false)
        return
      }

      if (!initialValues?.final_address && initialValues.status == 'submitted to bank') {
        dispatch({ type: 'set', validations: ['Please Fill Final Address'] })
        setIsLoading(false)
        return
      }

      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)

      if (data === false) return

      var response
      if (isEditMode) {
        response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)
        if (response) {
          customSuccessMSG(dispatch, 'Submitted Successfully')
          setIsLoading(false)
          navigate('/case/all')
        }
      }
    } catch (error) {
      setIsLoading(false)
      console.log(error)
      dispatch({ type: 'set', validations: [error.data] })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setBeforSubmitError('')
  }, [])

  useEffect(() => {
    if (additionalJson && showCaseData?.finance_name?.calculation_Json) {
      try {
        const calcJson = performCalculations(
          additionalJson,
          showCaseData?.finance_name?.calculation_Json,
          showCaseData?.finance_name?.allsum_Json,
        )

        setCalcJson(calcJson)
      } catch (error) {
        console.error('Error performing calculations:', error)
      }
    }
  }, [additionalJson, showCaseData])

  const performCalculations = (additionalJson, calculationJson, allsumJson) => {
    // Find the DM object

    const dmObject = additionalJson?.find((field) => field.role === 'DM')
    if (!dmObject) {
      throw new Error('DM object not found in additional_fields')
    }

    const { role, ...dmValues } = dmObject
    // console.log('dmValues', dmValues)

    const calcResults = calculationJson.map((calc) => {
      const value1 = dmValues[calc.key_1]
      const value2 = calc.calc !== '%' ? dmValues[calc.key_2] : undefined
      const percentageValue = calc.calc === '%' ? dmValues[calc.percentage_key] : undefined

      if (value1 === undefined || (calc.calc !== '%' && value2 === undefined)) {
        console.error(`Keys ${calc.key_1} or ${calc.key_2} not found in DM object`)
        throw new Error(`Keys ${calc.key_1} or ${calc.key_2} not found in DM object`)
      }

      if (calc.calc === '%' && percentageValue === undefined) {
        throw new Error(`Percentage value for key ${calc.percentage_key} not found`)
      }

      let result
      switch (calc.calc) {
        case '+':
          result = Number(value1) + Number(value2)
          break
        case '-':
          result = Number(value1) - Number(value2)
          break
        case '*':
          result = Number(value1) * Number(value2)
          break
        case '/':
          result = Number(value1) / Number(value2)
          break
        case '%':
          result = Number(value1) * (Number(percentageValue) / 100)
          break
        default:
          throw new Error(`Unsupported calculation operator: ${calc.calc}`)
      }

      dmValues[calc.resulted_key] = result

      return {
        [calc.resulted_key]: result,
      }
    })

    // Process allsumJson
    allsumJson.forEach((sumItem) => {
      if (sumItem.calc === 'all sum') {
        const totalSum = sumItem.all_sum_keys.reduce((acc, keyObj) => {
          const value = dmValues[keyObj.value]
          if (value === undefined) {
            console.error(`Key ${keyObj.value} not found in DM object`)
            throw new Error(`Key ${keyObj.value} not found in DM object`)
          }
          return acc + Number(value)
        }, 0)
        dmValues[sumItem.resulted_key] = totalSum
        calcResults.push({ [sumItem.resulted_key]: totalSum })
      }
    })

    const calcJson = Object.assign({}, ...calcResults)

    return calcJson
  }

  const performCalculationsForSum = (additionalJson, allsumJson, calculation_Json) => {
    const dmObject = additionalJson.find((field) => field.role === 'DM')

    if (!dmObject) {
      throw new Error('DM object not found in additional_fields')
    }

    const { role, ...dmValues } = dmObject

    const calcResults = allsumJson.map((calc) => {
      let sum = 0
      calc.all_sum_keys.forEach((key) => {
        // First, try to find the key in dmValues (from additionalJson)
        let value = Number(dmValues[key.value])

        // If not found or not a number, try to find it in calculation_Json
        if (isNaN(value)) {
          value = Number(calculation_Json[key.value])
        }

        if (isNaN(value)) {
          throw new Error(
            `Key ${key.value} not found or not a number in DM object or calculation_Json`,
          )
        }

        sum += value
      })

      dmValues[calc.resulted_key] = sum

      return {
        [calc.resulted_key]: sum,
      }
    })

    const calcJson = Object.assign({}, ...calcResults)

    return calcJson
  }

  const slugsObj = {
    rc: process.env.REACT_APP_RC,
    lcto: process.env.REACT_APP_LCTO,
    cto: process.env.REACT_APP_CTO,
  }

  const handleSelectChange = (selected) => {
    const { value, role } = selected
    setSelectedRole(selected)

    if (value === 'submit to bank') {
      setIsSubmittedBank(true)
      return
    } else {
      setIsSubmittedBank(false)
    }

    const matchedKey = Object.keys(slugsObj).find((key) => slugsObj[key] === role)

    if (matchedKey) {
      setInitialValues((prevValues) => ({
        ...prevValues,
        [matchedKey]: value,
      }))
    }
  }

  useEffect(() => {
    if (showCaseData?.send_back_logs?.[0]?.by) {
      if (showCaseData?.rc) {
        setSelectedRole({
          label: showCaseData?.rc?.name,
          role: showCaseData?.rc?.role?.[0]?.name,
          value: showCaseData?.rc?._id,
        })
      }
      if (showCaseData?.lcto) {
        setSelectedRole({
          label: showCaseData?.lcto?.name,
          role: showCaseData?.lcto?.role?.[0]?.name,
          value: showCaseData?.lcto?._id,
        })
      }
      if (showCaseData?.cto) {
        setSelectedRole({
          label: showCaseData?.cto?.name,
          role: showCaseData?.cto?.role?.[0]?.name,
          value: showCaseData?.cto?._id,
        })
      }
    }
  }, [showCaseData])

  const getSelectedValue = (role) => {
    const matchedKey = Object.keys(slugsObj).find((key) => slugsObj[key] === role)
    return matchedKey ? initialValues[matchedKey] : null
  }

  useEffect(() => {
    if (showCaseData.status === 'submitted to bank') {
      setIsSubmittedBank(true)
    }
  }, [showCaseData])

  const attachmentFields = ['dm_attechment', 'rc_attechment', 'lcto_attechment', 'cto_attechment']
  const availableAttachments = attachmentFields
    .filter((key) => showCaseData[key])
    .map((key) => showCaseData[key])

  return (
    <>
      {isLoading && (
        <div className="spinner_outerbox">
          {uploadProgress.status ? (
            <div
              className="text-center mt-2 bg-light "
              style={{ width: '300px', padding: '10px', borderRadius: '6px' }}
            >
              <>
                <p
                  className={`${
                    uploadProgress.status.startsWith('Compressing')
                      ? 'text-warning'
                      : uploadProgress.status.startsWith('Uploading')
                      ? 'text-success'
                      : 'text-muted'
                  }`}
                  style={{ fontSize: '18px' }}
                >
                  {uploadProgress.status}
                </p>
                <p style={{ fontSize: '14px' }}>{uploadProgress.file}</p>
              </>
            </div>
          ) : (
            <div className="text-center">
              <CSpinner size="lg" style={{ width: '2rem', height: '2rem' }} />
            </div>
          )}
        </div>
      )}

      <CRow className="form-input-block">
        <CCol>
          <CCard>
            <CCardHeader>DM Case Details</CCardHeader>
            <CCardBody>
              <CFormCheck
                type="checkbox"
                label={'DM Remark'}
                className="credit ps-0 checkbox-margin"
                checked={editorLoaded}
                onChange={() => {
                  setEditorLoaded(!editorLoaded)
                  setInitialValues((previewValue) => ({
                    ...previewValue,
                    dm_remarks: '',
                  }))
                }}
              />

              <div>
                {editorLoaded && (
                  <>
                    <CFormLabel>Remarks</CFormLabel>
                    <CKEditor
                      name="dm_remarks"
                      editor={ClassicEditor}
                      config={{
                        ckfinder: {
                          uploadUrl: '',
                        },
                      }}
                      data={initialValues.dm_remarks ?? ''}
                      onChange={(e, editor) => {
                        const data = editor.getData() || ''
                        setInitialValues((previewValue) => ({
                          ...previewValue,
                          dm_remarks: data ?? '',
                        }))
                      }}
                    />
                  </>
                )}
              </div>

              {additionalFields &&
                additionalFields?.filter((item) => item.role === 'DM').length > 0 && (
                  <>
                    <CRow className="mt-4">
                      {additionalFields &&
                        additionalFields
                          .filter((item) => item.role === 'DM')
                          .sort((a, b) => a.field_index - b.field_index)
                          .map((field) => (
                            <CCol md={field.col_size} key={field.field_index}>
                              <div className="mb-3">
                                <CFormLabel>{field.key}</CFormLabel>
                                {renderAdditonalFields(field)}
                              </div>
                            </CCol>
                          ))}
                    </CRow>
                  </>
                )}

              {showCaseData && showCaseData.status === 'submitted to bank' && (
                <CRow className="mt-4">
                  <div className="">
                    <CFormCheck
                      type="checkbox"
                      label={'Case Revies ?'}
                      className="credit ps-0"
                      checked={initialValues.case_revise === '1'}
                      onChange={() => {
                        setInitialValues({
                          ...initialValues,
                          case_revise: initialValues.case_revise === '1' ? '0' : '1',
                        })
                      }}
                    />
                  </div>
                </CRow>
              )}

              <CRow className="mt-2">
                <CCol md={4}>
                  <CButton onClick={() => setShowOthersAttechments(!showOthersAttechments)}>
                    Previous Attachment
                  </CButton>
                </CCol>
              </CRow>

              {showCaseData.status === 'submitted to bank' && initialValues.case_revise == '1' && (
                <>
                  <CRow className="mt-2">
                    <CCol md={4}>
                      <CFormLabel>
                        DM Attechment <span className="text-danger ">*</span>
                      </CFormLabel>
                      <CFormInput
                        id="image"
                        type="file"
                        accept=".xlsx, .xls, .docx, .doc, .pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp"
                        onChange={(event) => {
                          const selectedFile = event.target.files[0]
                          setInitialValues((prevValues) => ({
                            ...prevValues,
                            dm_attechment: selectedFile,
                          }))
                        }}
                      />

                      {'' && <p style={{ color: 'red' }}>{''}</p>}
                    </CCol>

                    {initialValues.dm_attechment && (
                      <>
                        <CCol md={4}>
                          <div className="">
                            <CFormLabel>
                              Submit Type <span className="text-danger ">*</span>
                            </CFormLabel>

                            <CFormSelect
                              custom
                              name="submit_type"
                              className="mb-sm-0 mb-2"
                              value={initialValues?.submit_type ?? ''}
                              onChange={(event) => {
                                const { name, value } = event.target
                                setInitialValues((prevValues) => ({
                                  ...prevValues,
                                  [name]: value,
                                }))
                              }}
                            >
                              <option value="">Select Submit Type</option>
                              <option value="online">Online</option>
                              <option value="offline">Offline</option>
                            </CFormSelect>
                          </div>
                        </CCol>

                        <CCol md={4}>
                          <div className="">
                            <CFormLabel>
                              Submit To<span className="text-danger">*</span>
                            </CFormLabel>

                            <AsyncSelect
                              className="mb-lg-0 mb-2"
                              loadOptions={(inputValue, callback) =>
                                loadOptionsForRC(inputValue, callback)
                              }
                              isDisabled={
                                [
                                  'pending for rc',
                                  'pending for lcto',
                                  'pending for cto',
                                  'submitted to bank',
                                ].includes(showCaseData?.status) ||
                                showCaseData?.send_back_logs?.[0]?.by
                              }
                              defaultOptions={defaultOptionRC}
                              value={
                                isSubmittedBank
                                  ? { label: 'Submit to Bank', value: 'submit to bank', role: 'Bank' }
                                  : defaultOptionRC.find(
                                      (option) =>
                                        option.value === getSelectedValue(option.role) ||
                                        option.value === getSelectedValue(option.role)?._id,
                                    ) || null
                              }
                              getOptionLabel={(option) => (
                                <div>
                                  <div>{option.label}</div>
                                  <div style={{ color: 'green', fontSize: '0.8em', marginTop: '2px' }}>
                                    {option.role}
                                  </div>
                                </div>
                              )}
                              getOptionValue={(option) => option.value}
                              onChange={(selected) => {
                                setInitialValues({
                                  ...initialValues,
                                  rc: '',
                                  lcto: '',
                                  cto: '',
                                })
                                setSelectedRole(null)
                                handleSelectChange(selected)
                              }}
                              styles={{
                                option: (provided, state) => ({
                                  ...provided,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  backgroundColor: state.isFocused ? '#e6f7ff' : '#fff',
                                  color: '#000',
                                  cursor: 'pointer',
                                  padding: '10px',
                                }),
                                singleValue: (provided) => ({
                                  ...provided,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  cursor: 'pointer',
                                }),
                                control: (provided) => ({
                                  ...provided,
                                  cursor: 'pointer',
                                }),
                              }}
                              components={{
                                Option: ({ data, innerRef, innerProps }) => (
                                  <div ref={innerRef} {...innerProps} style={{ padding: '10px', cursor: 'pointer' }}>
                                    <div>{data.label}</div>
                                    <div style={{ color: 'green', fontSize: '0.8em', marginTop: '2px' }}>
                                      {data.role}
                                    </div>
                                  </div>
                                ),
                              }}
                            />
                          </div>
                        </CCol>
                      </>
                    )}
                  </CRow>

                  {(selectedRole && selectedRole?.value == 'submit to bank') ||
                    (initialValues.case_revise == '1' && (
                      <CRow>
                        <CCol md={8}>
                          <CFormLabel>Final Address</CFormLabel>

                          <CFormTextarea
                            className="mb-lg-0 mb-2"
                            placeholder="Enter final address here.."
                            name="final_address"
                            value={initialValues?.final_address ?? ''}
                            onChange={(e) =>
                              setInitialValues((prev) => ({
                                ...prev,
                                final_address: e.target.value,
                              }))
                            }
                          ></CFormTextarea>
                        </CCol>
                      </CRow>
                    ))}
                </>
              )}

              {showCaseData.status !== 'submitted to bank' &&
                !holdStatuses.includes(showCaseData?.status) && (
                  <>
                    <CRow className="mt-2">
                      <CCol md={4}>
                        <CFormLabel>
                          DM Attechment <span className="text-danger ">*</span>
                        </CFormLabel>
                        <CFormInput
                          id="image"
                          type="file"
                          // accept=".xlsx, .xls, .docx, .doc"
                          accept=".xlsx, .xls, .docx, .doc, .pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp"
                          onChange={(event) => {
                            const selectedFile = event.target.files[0]
                            setInitialValues((prevValues) => ({
                              ...prevValues,
                              dm_attechment: selectedFile,
                            }))
                          }}
                        />

                        {'' && <p style={{ color: 'red' }}>{''}</p>}
                      </CCol>

                      {initialValues.dm_attechment && (
                        <>
                          <CCol md={4}>
                            <div className="">
                              <CFormLabel>
                                Submit Type <span className="text-danger ">*</span>
                              </CFormLabel>

                              <CFormSelect
                                custom
                                name="submit_type"
                                className="mb-sm-0 mb-2"
                                value={initialValues?.submit_type ?? ''}
                                onChange={(event) => {
                                  const { name, value } = event.target
                                  setInitialValues((prevValues) => ({
                                    ...prevValues,
                                    [name]: value,
                                  }))
                                }}
                              >
                                <option value="">Select Submit Type</option>
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                              </CFormSelect>
                            </div>
                          </CCol>

                          <CCol md={4}>
                            <div className="">
                              <CFormLabel>
                                Submit To<span className="text-danger">*</span>
                              </CFormLabel>

                              <AsyncSelect
                                className="mb-lg-0 mb-2"
                                loadOptions={(inputValue, callback) =>
                                  loadOptionsForRC(inputValue, callback)
                                }
                                isDisabled={
                                  [
                                    'pending for rc',
                                    'pending for lcto',
                                    'pending for cto',
                                    'submitted to bank',
                                  ].includes(showCaseData?.status) ||
                                  showCaseData?.send_back_logs?.[0]?.by
                                }
                                defaultOptions={defaultOptionRC}
                                value={
                                  isSubmittedBank
                                    ? { label: 'Submit to Bank', value: 'submit to bank', role: 'Bank' }
                                    : defaultOptionRC.find(
                                        (option) =>
                                          option.value === getSelectedValue(option.role) ||
                                          option.value === getSelectedValue(option.role)?._id,
                                      ) || null
                                }
                                getOptionLabel={(option) => (
                                  <div>
                                    <div>{option.label}</div>
                                    <div style={{ color: 'green', fontSize: '0.8em', marginTop: '2px' }}>
                                      {option.role}
                                    </div>
                                  </div>
                                )}
                                getOptionValue={(option) => option.value}
                                onChange={(selected) => {
                                  setInitialValues({
                                    ...initialValues,
                                    rc: '',
                                    lcto: '',
                                    cto: '',
                                  })
                                  setSelectedRole(null)
                                  handleSelectChange(selected)
                                }}
                                styles={{
                                  option: (provided, state) => ({
                                    ...provided,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    backgroundColor: state.isFocused ? '#e6f7ff' : '#fff',
                                    color: '#000',
                                    cursor: 'pointer',
                                    padding: '10px',
                                  }),
                                  singleValue: (provided) => ({
                                    ...provided,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                  }),
                                }}
                                components={{
                                  Option: ({ data, innerRef, innerProps }) => (
                                    <div ref={innerRef} {...innerProps} style={{ padding: '10px' }}>
                                      <div>{data.label}</div>
                                      <div style={{ color: 'green', fontSize: '0.8em', marginTop: '2px' }}>
                                        {data.role}
                                      </div>
                                    </div>
                                  ),
                                }}
                              />
                            </div>
                          </CCol>
                        </>
                      )}
                    </CRow>
                    {selectedRole && selectedRole?.value == 'submit to bank' && (
                      <CRow>
                        <CCol md={8}>
                          <CFormLabel>Final Address</CFormLabel>

                          <CFormTextarea
                            className="mb-lg-0 mb-2"
                            placeholder="Enter final address here.."
                            name="final_address"
                            value={initialValues?.final_address ?? ''}
                            onChange={(e) =>
                              setInitialValues((prev) => ({
                                ...prev,
                                final_address: e.target.value,
                              }))
                            }
                          ></CFormTextarea>
                        </CCol>
                      </CRow>
                    )}
                  </>
                )}

              <CRow className="mt-4">
                <CCol md={12}>
                  <CCardBody className="text-center">
                    {initialValues.dm_attechment && showCaseData.status !== 'submitted to bank' && (
                      <CButton
                        type="submit"
                        name="buttonClicked"
                        value="submit"
                        onClick={async (e) => {
                          await handleAssignRC()
                        }}
                        className="submit_btn mb-2  report_generate_btn"
                        disabled={[
                          'pending for rc',
                          'pending for lcto',
                          'pending for cto',
                          'submittd to bank',
                        ].includes(showCaseData?.status)}
                      >
                        Submit
                      </CButton>
                    )}

                    <CButton
                      onClick={() => {
                        setCaseId(showCaseData._id)
                        setVisibleHoldModel(!visibleHoldModel)
                      }}
                      color="danger"
                      className="text-light mx-2 mb-2 "
                    >
                      Hold
                    </CButton>

                    {isEditMode && (
                      <CButton
                        className="submit_btn report_generate_btn me-2 mb-2 "
                        onClick={handleSave}
                      >
                        Save
                      </CButton>
                    )}

                    <CButton
                      color="danger"
                      className="text-light mb-2 "
                      onClick={() => {
                        if (loggedinUserRole.name === process.env.REACT_APP_DM) {
                          setDmJson({})
                          navigate('/case/all')
                        } else {
                          navigate(
                            `/case/${id}/update/dm-details-show/by/${loggedinUserRole.name}`,
                            {
                              state: { toggleDMForm: false },
                            },
                          )
                        }
                      }}
                    >
                      Cancel
                    </CButton>
                  </CCardBody>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <OthersAttechments
        visible={showOthersAttechments}
        close={() => setShowOthersAttechments(false)}
        files={availableAttachments.length > 0 ? availableAttachments : []}
      />

      <Hold
        visible={visibleHoldModel}
        close={() => setVisibleHoldModel(!visibleHoldModel)}
        caseId={caseId}
        fetchCaseData={fetchData}
        type="hold"
        status="hold by dm"
        call="dm call"
        isRedirectToAll={true}
      />
    </>
  )
}

export default DmForm
