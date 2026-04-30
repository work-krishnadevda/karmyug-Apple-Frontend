import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import SubHeader from 'src/components/custom/SubHeader'

import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CContainer,
  CFormLabel,
  CInputGroup,
  CRow,
  CFormSelect,
  CSpinner,
} from '@coreui/react'
import handleSubmitHelper from 'src/helpers/submitHelper'
import BasicProvider from 'src/constants/BasicProvider'
import { useEffectFormData } from 'src/helpers/formHelpers'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import ImagePreview from 'src/components/custom/ImagePreview'
import { ImageHelper } from 'src/helpers/imageHelper'
import Draggable from 'react-draggable'
import PdfPreview from 'src/components/PdfPreview'
import AsyncSelect from 'react-select/async'
import { components } from 'react-select'
import { fetchCompanies } from 'src/helpers/companyHelper'

import { data } from './data'
import { COO_Fields } from './CooJson'
import { FE_Fields } from './FeJson'

var subHeaderItems = [
  {
    name: 'All Banks',
    link: '/bank/all',
    icon: cilSpreadsheet,
  },
  {
    name: 'Create Bank',
    link: '/bank/create',
    icon: cilPencil,
  },
  {
    name: 'Trash Banks',
    link: '/bank/trash',
    icon: cilTrash,
  },
]

const validationRules = {
  name: {
    required: true,
  },
}

const Create = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const id = params.id
  const isEditMode = !!id

  let commonJson = data[0].fields

  let counter = useRef(0)

  const [numPages, setNumPages] = useState(0)

  const [pageNumber, setPageNumber] = useState(1)

  const [fieldsPerPage, setFieldsPerPage] = useState({})

  const [boxes, setBoxes] = useState([])

  // const [selectedRole, setSelectedRole] = useState('')

  const [defaultOptions, setDefaultOptions] = useState([])

  const [defaultOptionsFinanceName, setDefaultOptionsFinanceName] = useState([])
  const [companyOptions, setCompanyOptions] = useState([])

  const [additionalFields, setAdditionalFields] = useState([])

  const [selectedFields, setSelectedFields] = useState([])

  const [calculationJson, setCalculationJson] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const [initialValues, setInitialValues] = useState({
    name: '',
    module: 'banks',
    featured_image: '',
    featured_pdf: '',
    featured_doc: '',
    finance_type: '',
    images_page_no: '',
    fields: [],
    selected_fields: [],
    selectedRole: "",
    empannelled_with: '',
    stamp_file: '',
    agreement_file: '',
    fee_estimate_file: '',
    agreement_start_date: '',
    agreement_end_date: '',
    empannelled_done_by: '',
    rc_name: '',
  })

  useEffect(() => {
    setInitialValues({
      name: '',
      module: 'banks',
      featured_image: '',
      finance_type: '',
      images_page_no: '',
      fields: [],
      selected_fields: [],
      selectedRole: "",
      empannelled_with: '',
      stamp_file: '',
      agreement_file: '',
      fee_estimate_file: '',
      agreement_start_date: '',
      agreement_end_date: '',
      empannelled_done_by: '',
      rc_name: '',
    })

    setSelectedFields([])
    setBoxes([])
  }, [navigate])

  useEffect(() => {
    setInitialValues((prev) => ({ ...prev, fields: boxes, selected_fields: selectedFields }))
  }, [boxes, selectedFields])

  useEffect(() => {
    defaultOptionsSetup()
  }, [initialValues?.selectedRole])

  const defaultOptionsSetup = async () => {
    try {
      if (initialValues?.selectedRole === 'coo') {
        const options = COO_Fields.map((item) => ({
          label: item.key,
          value: item.key,
          type: item.type,
          role: item.role,
        }))

        setDefaultOptions(options)
      } else if (initialValues?.selectedRole === 'fe') {
        const options = FE_Fields.map((item) => ({
          label: item.key,
          value: item.key,
          type: item.type,
          role: item.role,
        }))

        setDefaultOptions(options)
      } else if (initialValues?.selectedRole === 'dm') {
        const options = additionalFields
          .filter((item) => item.role === 'DM')
          .map((item) => ({
            label: item.key,
            value: item.key,
            type: item.type,
            role: item.role,
          }))

        const staticKey = {
          label: 'dm_remarks',
          value: 'dm_remarks',
          type: 'static',
          role: 'DM',
        }

        // Append the static key to the options array
        options.push(staticKey)

        setDefaultOptions(options)
      } else if (initialValues?.selectedRole === 'additional fields') {
        const options = additionalFields?.map((item) => ({
          label: item.key,
          value: item.key,
          type: item.type,
          role: item.role,
        }))

        setDefaultOptions(options)
      } else if (initialValues?.selectedRole === 'calculation fields') {
        const options = calculationJson?.map((item) => ({
          label: item.resulted_key,
          value: item.resulted_key,
        }))

        setDefaultOptions(options)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDrag = (e, data, index) => {
    // console.log('data',data);
    setBoxes((prevBoxes) => {
      const newBoxes = [...prevBoxes]
      newBoxes[index] = {
        ...newBoxes[index],
        left: data.x,
        top: data.y,
        page: pageNumber,
        role: initialValues?.selectedRole,
      }
      return newBoxes
    })
  }

  const handleStop = (e, data, index) => {
    setBoxes((prevBoxes) => {
      const newBoxes = [...prevBoxes]
      newBoxes[index] = {
        ...newBoxes[index],
        left: data.x,
        top: data.y,
        page: pageNumber,
        role: initialValues?.selectedRole == 'calculation fields' ? 'dm' : initialValues?.selectedRole,
      }
      return newBoxes
    })
  }
  // const handleAsyncSelectChange = (selectedOptions) => {
  //   const options = selectedOptions.map((item, index) => {
  //     const occurrence = selectedOptions
  //       .slice(0, index)
  //       .filter((f) => f.label === item.label).length
  //     const newValue = `${item.label}_${occurrence + 1}`
  //     return {
  //       label: item.label,
  //       value: newValue,
  //     }
  //   })
  //   setSelectedFields(options)
  // }
  const handleAsyncSelectChange = (selectedOptions) => {
    const uniqueOptions = new Map();

    selectedOptions.forEach((item) => {
      if (!uniqueOptions.has(item.label)) {
        uniqueOptions.set(item.label, {
          label: item.label,
          value: item.value,
        });
      }
    });
    const options = Array.from(uniqueOptions.values());
    setSelectedFields(options);
  };

  const customOptions = selectedFields.map((field, index) => {
    const { label, value } = field
    const occurrence = selectedFields.slice(0, index).filter((f) => f.label === label).length
    return {
      value: value,
      label: label,
    }
  })

  useEffect(() => {
    const newFieldsPerPage = boxes.filter((box) => box.page === pageNumber)
    setFieldsPerPage(newFieldsPerPage)
  }, [pageNumber, boxes])

  useEffect(() => {
    setBoxes((prevBoxes) => {
      const selectedFieldCounts = selectedFields.reduce((counts, field) => {
        counts[field.label] = (counts[field.label] || 0) + 1
        return counts
      }, {})

      const boxMap = prevBoxes.reduce((map, box) => {
        if (!map[box.title]) {
          map[box.title] = []
        }
        map[box.title].push(box)
        return map
      }, {})

      const newBoxes = []
      const processedTitles = {}

      selectedFields.forEach((field, index) => {
        const fieldBoxes = boxMap[field.label] || []
        const occurrence = processedTitles[field.label] || 0

        processedTitles[field.label] = occurrence + 1

        if (fieldBoxes.length === 0 || occurrence >= fieldBoxes.length) {
          newBoxes.push({
            // uniqueKey: `${field.label}-${occurrence}-${index}-${pageNumber}`,
            top: 0,
            left: 0,
            title: field.label,
            page: pageNumber,
            count: selectedFieldCounts[field.label],
            role: field.role || '',
          })
        } else {
          const boxToUpdate = fieldBoxes[occurrence]
          newBoxes.push({
            ...boxToUpdate,
            count: selectedFieldCounts[field.label],
            role: field.role || boxToUpdate.role,
          })
        }

        if (occurrence + 1 >= fieldBoxes.length) {
          delete boxMap[field.label]
        }
      })

      Object.values(boxMap)
        .flat()
        .forEach((box) => {
          if (
            !selectedFields.find((field) => field.label === box.title) &&
            !selectedFields.length === 0
          ) {
            newBoxes.push(box)
          }
        })

      return newBoxes
    })
  }, [selectedFields, pageNumber])

  useEffect(() => {
    fetchData()
  }, [navigate, id])

  useEffect(() => {
    fetchSingleData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await useEffectFormData(`banks/show/${id}`, initialValues, isEditMode)
      if (isEditMode) {
        // Format dates for date inputs (YYYY-MM-DD format)
        const formattedData = {
          ...data,
          agreement_start_date: data.agreement_start_date
            ? new Date(data.agreement_start_date).toISOString().split('T')[0]
            : '',
          agreement_end_date: data.agreement_end_date
            ? new Date(data.agreement_end_date).toISOString().split('T')[0]
            : '',
        }
        setInitialValues({ ...formattedData })
        setBoxes(data.fields)
        setSelectedFields(data.selected_fields)
        setAdditionalFields(data.additional_keys)
      }
    } catch (error) {
      dispatch({ type: 'set', catcherror: error.data })
    }
  }

  const fetchSingleData = async () => {
    try {
      const response = await new BasicProvider(`banks/show/${id}`).getRequest()
      if (isEditMode) {
        setAdditionalFields(response.data.additional_keys)

        setCalculationJson([...response.data.calculation_Json, ...response.data.allsum_Json])
      }
    } catch (error) {
      dispatch({ type: 'set', catcherror: error.data })
    }
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setInitialValues({ ...initialValues, [name]: value })
  }
  console.log("-=-===initialValues-==-==-=", initialValues);

  const normalizeFileReference = (fileValue) => {
    if (!fileValue) return fileValue
    if (fileValue instanceof File) return fileValue

    if (typeof fileValue === 'object') {
      return fileValue?._id || fileValue?.id || ''
    }

    if (typeof fileValue === 'string') {
      const trimmedValue = fileValue.trim()
      if (!trimmedValue) return ''

      // Existing records can come as JSON-stringified object, convert them to id.
      if (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) {
        try {
          const parsedValue = JSON.parse(trimmedValue)
          return parsedValue?._id || parsedValue?.id || ''
        } catch (error) {
          return fileValue
        }
      }

      return fileValue
    }

    return fileValue
  }

  const getUploadedFileName = (fileValue) => {
    if (!fileValue) return ''
    if (fileValue instanceof File) return fileValue.name

    if (typeof fileValue === 'object') {
      return (
        fileValue?.original_name ||
        fileValue?.name ||
        (typeof fileValue?.filepath === 'string' ? fileValue.filepath.split('/').pop() : '') ||
        ''
      )
    }

    if (typeof fileValue === 'string') {
      const trimmedValue = fileValue.trim()
      if (!trimmedValue) return ''

      if (trimmedValue.startsWith('{') && trimmedValue.endsWith('}')) {
        try {
          const parsedValue = JSON.parse(trimmedValue)
          return getUploadedFileName(parsedValue)
        } catch (error) {
          return ''
        }
      }
    }

    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()



    try {
      // if (initialValues.featured_image && initialValues.featured_image.lastModified) {
      //   initialValues.selected_fields = []
      //   initialValues.fields = []
      // }
      setIsLoading(true)

      const sanitizedValues = {
        ...initialValues,
        stamp_file: normalizeFileReference(initialValues.stamp_file),
        agreement_file: normalizeFileReference(initialValues.agreement_file),
        fee_estimate_file: normalizeFileReference(initialValues.fee_estimate_file),
      }

      const data = await handleSubmitHelper(sanitizedValues, validationRules, dispatch)
      if (data === false) return

      let response
      if (isEditMode) {
        response = await new BasicProvider(`banks/update/${id}`, dispatch).patchRequest(data)
        await fetchData()
      } else {
        response = await new BasicProvider(`banks/create`, dispatch).postRequest(data)
        navigate(`/bank/${response.data._id}/edit`)
      }
      setAlertTimeout(dispatch)
    } catch (error) {
      console.log(error)
      dispatch({ type: 'set', validations: [error.data] })
    } finally {
      setIsLoading(false)
    }
  }

  const fileOnchangeHandler = async (e) => {
    const file = ImageHelper(e, 'previewImage')
    const name = e.target.name // Get the name of the input

    console.log('sfsdfsdf', name)

    // setInitialValues({ ...initialValues, featured_image: file[0] })

    setInitialValues({ ...initialValues, [name]: file[0] })
    const formData = new FormData()
    // formData.append('featured_image', file[0])
    formData.append(name, file[0])
  }

  const loadOptions = (inputValue, callback) => {
    const availableOptions = defaultOptions.filter(
      (option) =>
        !Object.values(boxes).find((box) => box.title === option.label && box.page === pageNumber),
    )

    setTimeout(() => {
      const filteredOptions = availableOptions.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()),
      )
      callback(filteredOptions)
    }, 1000)
  }

  const loadOptionsFinanceName = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `cms/categories/search-perent/finance_type?search=${inputValue}&count=20`,
      ).getRequest()
      const options = response.data.data.map((finance) => ({
        label: finance.name,
        value: finance._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchDefaultOptionsFinanceName()
    fetchCompanyOptions()
  }, [])

  const fetchDefaultOptionsFinanceName = async () => {
    try {
      const response = await new BasicProvider(
        'cms/categories/get-first-parent/finance_type',
      ).getRequest()
      const options = response.data.data.map((finance) => ({
        label: finance.name,
        value: finance._id,
      }))

      setDefaultOptionsFinanceName(options)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchCompanyOptions = async () => {
    try {
      const companies = await fetchCompanies()
      setCompanyOptions(companies)
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const handleRemoveKey = (index) => {
    // Update the boxes state by removing the box at the given index
    const updatedBoxes = boxes.filter((_, i) => i !== index)
    setBoxes(updatedBoxes)

    // Update the selected   state by removing the corresponding selectedField
    const box = boxes[index]
    const updatedSelectedFields = selectedFields.filter(
      (field) => !(field.label === box.title && field.value.endsWith(`_${box.count}`)),
    )
    setSelectedFields(updatedSelectedFields)
  }

  return (
    <>
      <SubHeader subHeaderItems={subHeaderItems} isSearch={false} />
      <CContainer fluid>
        <>
          <CRow className="form-input-block">
            <CCol>
              <CCard>
                <CCardHeader>Bank details</CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol md={6}>
                      <CFormLabel>
                        Finance Name<span className="text-danger">*</span>
                      </CFormLabel>
                      <CInputGroup className="has-validation">
                        <input
                          type="text"
                          name="name"
                          value={initialValues.name ?? ''}
                          className="form-control"
                          placeholder="Enter finance name "
                          onChange={handleOnChange}
                        />
                      </CInputGroup>
                    </CCol>

                    <CCol md={6}>
                      <div className="">
                        <CFormLabel>Finance Type</CFormLabel>
                        <AsyncSelect
                          name="finance_type"
                          loadOptions={(inputValue, callback) =>
                            loadOptionsFinanceName(inputValue, callback)
                          }
                          defaultOptions={defaultOptionsFinanceName}
                          value={
                            defaultOptionsFinanceName.find(
                              (option) =>
                                option.value ===
                                (initialValues?.finance_type?._id || initialValues.finance_type),
                            ) || null
                          }
                          getOptionLabel={(option) => option.label}
                          getOptionValue={(option) => option.value}
                          onChange={(selected) =>
                            setInitialValues({ ...initialValues, finance_type: selected.value })
                          }
                        />
                      </div>
                    </CCol>

                    {/* <CCol md={4}>
                      <div className="py-2">
                        <CFormLabel>Set Over T.A.T (in hours)</CFormLabel>

                        <CFormInput
                          type="number"
                          name="overtat_hour"
                          value={initialValues.community_dominated_details}
                          placeholder="Enter here.. "
                          onChange={(e) => {
                            let value = e.target.value
                            const validValue = value.replace(/[^0-9]/g, '');
                            setInitialValues({ ...initialValues, overtat_hour: validValue })
                          }
                          }
                          autoComplete="off"
                        />
                      </div>
                    </CCol> */}
                  </CRow>

                  <CRow>
                    {true && (
                      <CCol md={4}>
                        <div>
                          <CFormLabel>Upload blank PDF</CFormLabel>
                          <CFormInput
                            id="image"
                            name="featured_image"
                            type="file"
                            // accept="image/*, video/*, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            accept="application/pdf"
                            ref={fileInputRef}
                            onChange={fileOnchangeHandler}
                          />
                        </div>
                      </CCol>
                    )}

                    <CCol md={4}>
                      <CFormLabel>Images Page Number</CFormLabel>
                      <CInputGroup className="has-validation">
                        <input
                          type="number"
                          name="images_page_no"
                          value={initialValues.images_page_no ?? ''}
                          className="form-control"
                          placeholder="Enter Images Page "
                          onChange={handleOnChange}
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol md={4}>
                      <div>
                        <CFormLabel>Select Role</CFormLabel>
                        <CFormSelect
                          aria-label=""
                          options={[
                            'Select Role for Fields',
                            { label: 'COO', value: 'coo' },
                            { label: 'FE', value: 'fe' },
                            { label: 'DM', value: 'dm' },
                            // { label: 'Additional Fields', value: 'additional fields' },
                            { label: 'Calculation Fields', value: 'calculation fields' },
                          ]}
                          value={initialValues?.selectedRole}
                          onChange={(e) => setInitialValues((prev) => ({ ...prev, selectedRole: e.target.value }))}
                        />
                      </div>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <div>
                        <CFormLabel>Empanelled with RA/GA/LLP/SST</CFormLabel>
                        <CFormSelect
                          name="empannelled_with"
                          value={initialValues?.empannelled_with || ''}
                          onChange={handleOnChange}
                        >
                          {companyOptions.map((company) => (
                            <option key={company.value} value={company.value}>
                              {company.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </div>
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>RC Name</CFormLabel>
                      <CInputGroup className="has-validation">
                        <input
                          type="text"
                          name="rc_name"
                          value={initialValues.rc_name ?? ''}
                          className="form-control"
                          placeholder="Enter RC Name"
                          onChange={handleOnChange}
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <CFormLabel>Agreement Start Date</CFormLabel>
                      <CInputGroup className="has-validation">
                        <input
                          type="date"
                          name="agreement_start_date"
                          value={initialValues.agreement_start_date ?? ''}
                          className="form-control"
                          onChange={handleOnChange}
                        />
                      </CInputGroup>
                    </CCol>

                    <CCol md={6}>
                      <CFormLabel>Agreement End Date</CFormLabel>
                      <CInputGroup className="has-validation">
                        <input
                          type="date"
                          name="agreement_end_date"
                          value={initialValues.agreement_end_date ?? ''}
                          className="form-control"
                          onChange={handleOnChange}
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <CFormLabel>Empanelled Done By</CFormLabel>
                      <CInputGroup className="has-validation">
                        <input
                          type="text"
                          name="empannelled_done_by"
                          value={initialValues.empannelled_done_by ?? ''}
                          className="form-control"
                          placeholder="Enter Employee Name"
                          onChange={handleOnChange}
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={4}>
                      <div>
                        <CFormLabel>Upload Stamp File</CFormLabel>
                        <CFormInput
                          id="stamp_file"
                          name="stamp_file"
                          type="file"
                          accept="application/pdf,image/*"
                          ref={fileInputRef}
                          onChange={fileOnchangeHandler}
                        />
                        {getUploadedFileName(initialValues?.stamp_file) && (
                          <small className="text-muted d-block mt-1">
                            Uploaded: {getUploadedFileName(initialValues.stamp_file)}
                          </small>
                        )}
                      </div>
                    </CCol>

                    <CCol md={4}>
                      <div>
                        <CFormLabel>Upload Agreement File</CFormLabel>
                        <CFormInput
                          id="agreement_file"
                          name="agreement_file"
                          type="file"
                          accept="application/pdf"
                          ref={fileInputRef}
                          onChange={fileOnchangeHandler}
                        />
                        {getUploadedFileName(initialValues?.agreement_file) && (
                          <small className="text-muted d-block mt-1">
                            Uploaded: {getUploadedFileName(initialValues.agreement_file)}
                          </small>
                        )}
                      </div>
                    </CCol>

                    <CCol md={4}>
                      <div>
                        <CFormLabel>Upload Fee Estimate File</CFormLabel>
                        <CFormInput
                          id="fee_estimate_file"
                          name="fee_estimate_file"
                          type="file"
                          accept="application/pdf"
                          ref={fileInputRef}
                          onChange={fileOnchangeHandler}
                        />
                        {getUploadedFileName(initialValues?.fee_estimate_file) && (
                          <small className="text-muted d-block mt-1">
                            Uploaded: {getUploadedFileName(initialValues.fee_estimate_file)}
                          </small>
                        )}
                      </div>
                    </CCol>
                  </CRow>

                  <CRow>
                    {true && (
                      <CCol md={4}>
                        <div>
                          <CFormLabel>Upload PDF</CFormLabel>
                          <CFormInput
                            id="image"
                            name="featured_pdf"
                            type="file"
                            accept="application/pdf"
                            ref={fileInputRef}
                            onChange={fileOnchangeHandler}
                          />
                        </div>
                      </CCol>
                    )}
                    <CCol md={4}>
                      <div>
                        <CFormLabel>Upload XL/Word</CFormLabel>
                        <CFormInput
                          id="image"
                          type="file"
                          name="featured_doc"
                          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          ref={fileInputRef}
                          onChange={fileOnchangeHandler}
                        />
                      </div>
                    </CCol>

                    <CCol md={4}>
                      <div>
                        <CFormLabel>Upload Word File</CFormLabel>
                        <CFormInput
                          id="image"
                          type="file"
                          name="featured_word"
                          // accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          ref={fileInputRef}
                          onChange={fileOnchangeHandler}
                        />
                      </div>
                    </CCol>
                  </CRow>

                  {(isEditMode ? isEditMode : !isEditMode && initialValues?.selectedRole) && (
                    <CRow className="mb-4 select_field_drpdwn">
                      <CFormLabel>Select Fields</CFormLabel>
                      <AsyncSelect
                        placeholder="Select Fields"
                        loadOptions={loadOptions}
                        defaultOptions={defaultOptions}
                        isMulti={true}
                        isClearable={false}
                        backspaceRemovesValue={false}
                        hideSelectedOptions={false}
                        isSearchable
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={handleAsyncSelectChange}
                        // value={selectedFields}
                        value={customOptions}
                        allowCreateWhileLoading
                        formatCreateLabel={(inputValue) => `Select ${inputValue}`}
                        createOptionPosition="first"
                      />
                    </CRow>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>

          {initialValues.featured_image.filepath && (
            <CRow className="mt-4">
              <CCol md={12}>
                <CCard>
                  <CCardHeader>
                    <div className="d-flex justify-content-between">
                      <div className="d-flex align-items-center">Report Builder</div>
                      <p className="m-0">
                        {numPages > 0 && (
                          <div className="text-center ">
                            <button
                              className="btn btn-secondary me-2"
                              onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                            >
                              Prev
                            </button>
                            <span>
                              {pageNumber} / {numPages}
                            </span>

                            <button
                              className="btn btn-secondary ms-2"
                              onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </p>
                    </div>
                  </CCardHeader>

                  <CCardBody>
                    <CRow>
                      <CCol md={3} style={{ overflow: 'hidden', clear: 'both' }}></CCol>
                      <CCol md={12}>
                        <div
                          style={{
                            width: '100%',
                            height: 800,
                            border: '1px solid black',
                            position: 'relative',
                            overflow: 'auto',
                            zIndex: '999',
                          }}
                        >
                          {Object.keys(boxes)
                            .filter((key) => boxes[key].page === pageNumber)
                            .map((key, i) => {
                              const { left, top, title, count } = boxes[key]

                              return (
                                <Draggable
                                  key={key}
                                  defaultPosition={{ x: 0, y: 0 }}
                                  position={{ x: left, y: top }}
                                  onDrag={(e, data) => handleDrag(e, data, key)}
                                  onStop={(e, data) => handleStop(e, data, key)}
                                  bounds={{ left: 0, right: 595, top: 0, bottom: 841 }}
                                >
                                  <span
                                    style={{
                                      // border: '1px dashed #fff',
                                      // padding: 5,
                                      lineHeight: 1,
                                      margin: 0,
                                      padding: 0,
                                      backgroundColor: '#0a1857',
                                      fontSize: '0.695rem',
                                      color: '#fff',
                                      width: 'max-content',
                                      zIndex: '999',
                                      maxWidth: '15%',
                                      position: 'absolute',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {title}
                                    <span
                                      onClick={() => handleRemoveKey(i)}
                                      className="star-csss px-1 ms-2"
                                    >
                                      X
                                    </span>
                                  </span>
                                </Draggable>
                              )
                            })}

                          {initialValues.featured_image.filepath && (
                            <PdfPreview
                              numPages={numPages}
                              pageNumber={pageNumber}
                              setNumPages={setNumPages}
                              pdfURL={initialValues.featured_image.filepath}
                            />
                          )}
                        </div>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          )}

          <CRow className="mt-4">
            <CCol md={12}>
              <CCard>
                <CCardBody className="text-center">
                  {!isEditMode && (
                    <CButton
                      className="btn btn-primary me-2  submit_btn"
                      type="submit"
                      name="buttonClicked"
                      value="submit"
                      disabled={isLoading}
                      onClick={handleSubmit}
                    >
                      {isLoading ? <CSpinner /> : 'Submit'}
                    </CButton>
                  )}

                  {isEditMode && (
                    <CButton
                      className="btn btn-secondary me-2                      "
                      type="submit"
                      name="buttonClicked"
                      value="update"
                      disabled={isLoading}
                      onClick={handleSubmit}
                    >
                      {isLoading ? <CSpinner /> : 'Update'}
                    </CButton>
                  )}

                  <CButton
                    color="danger"
                    className="text-light"
                    onClick={() => {
                      setInitialValues({})
                      navigate('/bank/all')
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </CButton>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      </CContainer>
    </>
  )
}

export default Create
