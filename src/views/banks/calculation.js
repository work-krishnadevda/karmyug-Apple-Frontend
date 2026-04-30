import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { cilPlus, cilX } from '@coreui/icons'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CRow,
} from '@coreui/react'
import handleSubmitHelper from 'src/helpers/submitHelper'
import BasicProvider from 'src/constants/BasicProvider'
import { useEffectFormData } from 'src/helpers/formHelpers'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import ImagePreview from 'src/components/custom/ImagePreview'
import { ImageHelper } from 'src/helpers/imageHelper'
import axios from 'axios'
import Draggable from 'react-draggable'
import PdfPreview from 'src/components/PdfPreview'
import AsyncSelect from 'react-select/async'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import CIcon from '@coreui/icons-react'

import { data } from './data'

const commonJson = data[0].fields


const calculation = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const id = params.id
  const isEditMode = !!id

  const [calculationJson, setCalculationJson] = useState([])

  const [allSumJson, setAllSumJson] = useState([])

  const [dmKeys, setDmKeys] = useState([])

  const [dmFieldLength, setDmFieldLength] = useState(0)

  const [currentField, setCurrentField] = useState({
    all_sum_keys: [],
    calc: 'all sum',
    resulted_key: ''
  });

  useEffect(() => {
    fetchData()
  }, [id])


  // const fetchData = async () => {
  //   try {
  //     let response = await new BasicProvider(`banks/show/${id}`, dispatch).getRequest()
  //     console.log('response', response)
  //     if (response) {
  //       let options = response.data.dm_keys.map((item) => ({
  //         label: item.key,
  //         value: item.key,
  //       }))
  //       setDmKeys(options)
  //       setCalculationJson(response.data.calculation_Json)
  //     }
  //   } catch (error) { }
  // }


  const fetchData = async () => {
    try {
      let response = await new BasicProvider(`banks/show/${id}`, dispatch).getRequest()
      if (response) {
        let options = response.data.dm_keys.map((item) => ({
          label: item.key,
          value: item.key,
        }))
        setDmFieldLength(options.length)
        let calculationJson = response.data.calculation_Json
        calculationJson.forEach((calcItem) => {
          if (
            options.some(
              (option) => option.label === calcItem.key_1 || option.label === calcItem.key_2,
            )
          ) {
            options.push({
              label: calcItem.resulted_key,
              value: calcItem.resulted_key,
            })
          }
        })

        setDmKeys(options)
        setCalculationJson(calculationJson)
        setAllSumJson(response.data.allsum_Json)
      }
    } catch (error) {
      console.error('Error fetching data', error)
    }
  }
  
  const handleAddField = () => {
    setCalculationJson([...calculationJson, { key_1: '', key_2: '', calc: '', resulted_key: '' }])
  }


  // const handleAddField = () => {
  //   const lastField = calculationJson[calculationJson.length - 1]
  //   if (
  //     lastField &&
  //     lastField.resulted_key &&
  //     !dmKeys.some((key) => key.value === lastField.resulted_key)
  //   ) {
  //     setDmKeys([...dmKeys, { label: lastField.resulted_key, value: lastField.resulted_key }])
  //   }
  //   setCalculationJson([...calculationJson, { key_1: '', key_2: '', calc: '', resulted_key: '' }])
  // }


  const handleRemoveField = (index) => {
    const updatedFields = calculationJson.filter((_, i) => i !== index)
    setCalculationJson(updatedFields)
    const fieldToRemove = calculationJson[index]
    if (fieldToRemove && fieldToRemove.resulted_key) {
      setDmKeys(dmKeys.filter((key) => key.value !== fieldToRemove.resulted_key))
    }
  }

  // const handleRemoveField = (index) => {
  //   const fieldToRemove = calculationJson[index]
  //   if (fieldToRemove && fieldToRemove.resulted_key) {
  //     setDmKeys(dmKeys.filter((key) => key.value !== fieldToRemove.resulted_key))
  //   }
  //   const updatedFields = calculationJson.filter((_, i) => i !== index)
  //   setCalculationJson(updatedFields)
  // }

  // const handleFieldChange = (index, field, value) => {
  //   const updatedFields = calculationJson.map((item, i) =>
  //     i === index ? { ...item, [field]: value } : item,
  //   )

  //   setCalculationJson(updatedFields)

  //   if (field === 'resulted_key' && value && !dmKeys.find(key => key.value === value)) {
  //     const newOption = { label: value, value: value }
  //     setDmKeys((prevDmKeys) => [...prevDmKeys[index], newOption])
  //   }

  //   if (field === 'resulted_key' && value) {
  //     if (dmKeys[index] + dmFieldLength) {
  //       setDmKeys((prevDmKeys) => {
  //         const updatedDmKeys = [...prevDmKeys]
  //         updatedDmKeys[index + dmFieldLength] = {
  //           ...updatedDmKeys[index + dmFieldLength],
  //           label: value,
  //           value: value,
  //         }
  //         return updatedDmKeys
  //       })
  //     } else {
  //       const newOption = { label: value, value: value }
  //       setDmKeys((prevDmKeys) => {
  //         const updatedDmKeys = [...prevDmKeys]
  //         updatedDmKeys[index] = newOption
  //         return updatedDmKeys
  //       })
  //     }
  //   }
  // }

  const handleFieldChange = (index, field, value) => {
    const updatedFields = calculationJson.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    setCalculationJson(updatedFields);

    if (field === 'resulted_key' && value && !dmKeys.find(key => key.value === value)) {
      const newOption = { label: value, value: value };
      setDmKeys((prevDmKeys) => {
        const updatedDmKeys = [...prevDmKeys];
        if (updatedDmKeys[index] && Array.isArray(updatedDmKeys[index])) {
          updatedDmKeys[index] = [...updatedDmKeys[index], newOption];
        } else {
          updatedDmKeys[index] = [newOption];
        }
        return updatedDmKeys;
      });
    }

    if (field === 'resulted_key' && value) {
      setDmKeys((prevDmKeys) => {
        const updatedDmKeys = [...prevDmKeys];
        if (index + dmFieldLength < updatedDmKeys.length) {
          updatedDmKeys[index + dmFieldLength] = {
            ...updatedDmKeys[index + dmFieldLength],
            label: value,
            value: value,
          };
        } else {
          updatedDmKeys[index] = { label: value, value: value };
        }
        return updatedDmKeys;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    // let all = currentField.all_sum_keys.map(item => item.label)
    // let custom = {
    //   all_sum_keys: all,
    //   calc: 'all sum',
    //   resulted_key: currentField.resulted_key
    // }
    // calculationJson.push(custom)


    // const mergedCalculationJson = [...calculationJson, ...allSumJson];

    let data = {
      calculation_Json:calculationJson,
      allsum_Json:allSumJson
    }

    try {
      var response
      if (isEditMode) {
        response = await new BasicProvider(`banks/update/${id}`, dispatch).patchRequest(
          data,
        )
      }
      setAlertTimeout(dispatch)
    } catch (error) {
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  const loadOptionsForKey_1 = async (inputValue, callback) => {
    const filteredOptions = dmKeys.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    callback(filteredOptions);

  }


  const loadOptionsForKey_2 = async (inputValue, callback) => {
    const filteredOptions = dmKeys.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    callback(filteredOptions);

  }

  const getCombinedOptions = () => {
    const calculationOptions = calculationJson.map(item => ({
      label: item.resulted_key,
      value: item.resulted_key,
    }));
    return [...dmKeys, ...calculationOptions];
  };

  const loadOptionsForSumOfAllFields = async (inputValue, callback) => {
    const filteredOptions = getCombinedOptions().filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    callback(filteredOptions);
  };

  const handleAddFieldAll = () => {
    setAllSumJson([...allSumJson, { all_sum_keys: [], calc: 'all sum', resulted_key: '' }]);
  };

  const handleRemoveFieldAll = (index) => {
    const updatedFields = allSumJson.filter((_, i) => i !== index);
    setAllSumJson(updatedFields);
  };

  const handleFieldChangeAll = (index, field, value) => {
    const updatedFields = [...allSumJson];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value,
    };
    setAllSumJson(updatedFields);

    if (field === 'resulted_key') {
      const newOption = { label: value, value: value };
      setDmKeys((prevDmKeys) => {
        const updatedDmKeys = [...prevDmKeys];
        updatedDmKeys[index] = newOption;
        return updatedDmKeys;
      });
    }
  };


  return (
    <>
      <SingleSubHeader moduleName="Bank Detail" />
      <CContainer>
        <CForm onSubmit={handleSubmit}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>Calculation</div>
              <div>
                <CButton
                  className="btn btn-secondary me-2 submit_btn"
                  name="buttonClicked"
                  onClick={handleAddField}
                >
                  <CIcon icon={cilPlus} /> Add Field
                </CButton>
              </div>
            </CCardHeader>


            <CCardBody>

              {calculationJson.map((field, index) => (
                <CRow className="mt-4" key={index}>
                  <CCol md={3}>
                    <div>
                      <CFormLabel>Select Field (1)</CFormLabel>
                      <AsyncSelect
                        loadOptions={(inputValue, callback) =>
                          loadOptionsForKey_1(inputValue, callback)
                        }
                        placeholder="Select Fields"
                        defaultOptions={dmKeys}
                        isMulti={false}
                        isClearable={false}
                        backspaceRemovesValue={false}
                        hideSelectedOptions={false}
                        isSearchable={true}
                        value={{ label: field.key_1, value: field.key_1 }}
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={(selectedOption) =>
                          handleFieldChange(index, 'key_1', selectedOption.value)
                        }
                      />
                    </div>
                  </CCol>


                  <CCol md={2}>
                    <div>
                      <CFormLabel>Calc.</CFormLabel>
                      <CFormSelect
                        value={field.calc}
                        onChange={(e) => handleFieldChange(index, 'calc', e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="+">➕</option>
                        <option value="-">➖</option>
                        <option value="*">✖️</option>
                        <option value="/">➗</option>
                        <option value="%">°/•</option>
                      </CFormSelect>
                    </div>
                  </CCol>

                  <CCol md={3}>
                    {
                      field.calc === '%' ? (
                        <div className="mb-3">
                          <CFormLabel>
                            Percentage<span className="text-danger">*</span>
                          </CFormLabel>
                          <CInputGroup className="has-validation">
                            <input
                              type="number"
                              name="percentage_key"
                              value={field.percentage_key ?? ''}
                              className="form-control"
                              placeholder="percentage"
                              onChange={(e) =>
                                handleFieldChange(index, 'percentage_key', Number(e.target.value))
                              }
                            />
                          </CInputGroup>
                        </div>
                      ) : (
                        <div>
                          <CFormLabel>Select Field (2)</CFormLabel>
                          <AsyncSelect
                            loadOptions={(inputValue, callback) =>
                              loadOptionsForKey_2(inputValue, callback)
                            }
                            placeholder="Select Fields"
                            defaultOptions={dmKeys}
                            isMulti={false}
                            isClearable={false}
                            backspaceRemovesValue={false}
                            hideSelectedOptions={false}
                            isSearchable={true}
                            value={{ label: field.key_2, value: field.key_2 }}
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            onChange={(selectedOption) =>
                              handleFieldChange(index, 'key_2', selectedOption.value)
                            }
                          />
                        </div>
                      )
                    }
                  </CCol>

                  <CCol md={3}>
                    <div>
                      <CFormLabel>Field Name</CFormLabel>
                      <CFormInput
                        placeholder="Enter Field Name.."
                        value={field.resulted_key}
                        onChange={(e) => handleFieldChange(index, 'resulted_key', e.target.value)}
                      />
                    </div>
                  </CCol>

                  <CCol md={1}>
                    <div className="text-end mt-4">
                      <CIcon
                        className="delet_faq"
                        icon={cilX}
                        onClick={() => handleRemoveField(index)}
                      />
                    </div>
                  </CCol>

                </CRow>

              ))}

{/* 
              <CRow>
                <CCol md={8}>
                  <div>
                    <CFormLabel>Sum of all fields</CFormLabel>
                    <AsyncSelect
                      loadOptions={loadOptionsForSumOfAllFields}
                      name="all_sum_keys"
                      placeholder="Select Fields"
                      defaultOptions={getCombinedOptions()}
                      isMulti={true}
                      isClearable={false}
                      backspaceRemovesValue={false}
                      hideSelectedOptions={false}
                      isSearchable={true}
                      value={currentField.all_sum_keys}
                      getOptionLabel={(option) => option.label}
                      getOptionValue={(option) => option.value}
                      onChange={(selectedOptions) =>
                        setCurrentField({
                          ...currentField,
                          all_sum_keys: selectedOptions || []
                        })
                      }
                    />
                  </div>
                </CCol>
                <CCol md={4}>
                  <div>
                    <CFormLabel>Field Name</CFormLabel>
                    <CFormInput
                      placeholder="Enter Field Name.."
                      value={currentField.resulted_key}
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          resulted_key: e.target.value
                        })
                      }
                    />

                  </div>
                </CCol>
              </CRow> */}

            </CCardBody>

            <CFooter>
              <CRow>
                <CCol md={12}>
                  <CCardBody className="text-center">
                    <CButton
                      className="btn btn-primary me-2  submit_btn"
                      type="submit"
                      name="buttonClicked"
                      value="submit"
                    >
                      Submit
                    </CButton>
                    <CButton
                      onClick={() => navigate('/bank/all')}
                      color="danger"
                      className="text-light"
                    >
                      Cancel
                    </CButton>
                  </CCardBody>
                </CCol>
              </CRow>

            </CFooter>
          </CCard>
          {/* <CCard className="mt-3">
          </CCard> */}
        </CForm>
        <CForm onSubmit={handleSubmit}>
          <CCard className='mt-4'>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>Sum Calculation</div>
              <div>
                <CButton
                  className="btn btn-secondary me-2 submit_btn"
                  name="buttonClicked"
                  onClick={handleAddFieldAll}
                >
                  <CIcon icon={cilPlus} /> Add Field

                </CButton>
              </div>
            </CCardHeader>

            <CCardBody>

              {allSumJson.map((currentField, index) => (
                <CRow key={index}>
                  <CCol md={7}>
                    <div>
                      <CFormLabel>Sum of all fields</CFormLabel>
                      <AsyncSelect
                        loadOptions={loadOptionsForSumOfAllFields}
                        name="all_sum_keys"
                        placeholder="Select Fields"
                        defaultOptions={getCombinedOptions()}
                        isMulti={true}
                        isClearable={false}
                        backspaceRemovesValue={false}
                        hideSelectedOptions={false}
                        isSearchable={true}
                        value={currentField.all_sum_keys}
                        getOptionLabel={(option) => option.label}
                        getOptionValue={(option) => option.value}
                        onChange={(selectedOptions) =>
                          handleFieldChangeAll(index, 'all_sum_keys', selectedOptions || [])
                        }
                      />
                    </div>
                  </CCol>

                  <CCol md={4}>
                    <div>
                      <CFormLabel>Field Name</CFormLabel>
                      <CFormInput
                        placeholder="Enter Field Name.."
                        value={currentField.resulted_key}
                        onChange={(e) =>
                          handleFieldChangeAll(index, 'resulted_key', e.target.value)
                        }
                      />
                    </div>
                  </CCol>

                  <CCol md={1}>
                    <div className="text-end mt-4">
                      <CIcon
                        className="delet_faq"
                        icon={cilX}
                        onClick={() => handleRemoveFieldAll(index)}
                      />
                    </div>
                  </CCol>


                </CRow>

              ))}

            </CCardBody>
            <CFooter>
              <CRow>
                <CCol md={12}>
                  <CCardBody className="text-center">
                    <CButton
                      className="btn btn-primary me-2  submit_btn"
                      type="submit"
                      name="buttonClicked"
                      value="submit"
                    >
                      Submit
                    </CButton>
                    <CButton
                      onClick={() => navigate('/bank/all')}
                      color="danger"
                      className="text-light"
                    >

                      Cancel

                    </CButton>
                  </CCardBody>
                </CCol>
              </CRow>

            </CFooter>

          </CCard>
        </CForm>
      </CContainer>
    </>
  )

}


export default calculation
