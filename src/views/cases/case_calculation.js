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
    CForm,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CRow,
} from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import CIcon from '@coreui/icons-react'
import AsyncSelect from 'react-select/async'

const Calculation = () => {
    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const id = params.id
    const isEditMode = !!id

    const [calculationJson, setCalculationJson] = useState([])
    const [dmKeys, setDmKeys] = useState([])
    const [dmObject, setDmObject] = useState({})
    const [customResults, setCustomResults] = useState({})

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        try {
            let response = await new BasicProvider(`cases/show/${id}`, dispatch).getRequest()
            const dmObject = response.data.additional_fields.find((item) => item.role === 'DM')
            const dmArray = Object.keys(dmObject).filter(key => key !== 'role').map(key => ({ label: key, value: key }))
            setDmKeys(dmArray)
            setDmObject(dmObject) // Store the original object
        } catch (error) {
            console.error('Error fetching data', error)
        }
    }

    const handleFieldChange = (index, field, value) => {
        const newCalculationJson = [...calculationJson]
        newCalculationJson[index][field] = value
        if (field === 'key_1' || field === 'key_2' || field === 'calc') {
            const { key_1, key_2, calc } = newCalculationJson[index]
            if (key_1 && key_2 && calc) {
                const val1 = parseFloat(dmObject[key_1] || customResults[key_1] || 0)
                const val2 = parseFloat(dmObject[key_2] || customResults[key_2] || 0)
                let result = 0
                switch (calc) {
                    case '+':
                        result = val1 + val2
                        break
                    case '-':
                        result = val1 - val2
                        break
                    case '*':
                        result = val1 * val2
                        break
                    case '/':
                        result = val2 !== 0 ? val1 / val2 : 'Infinity'
                        break
                    case '%':
                        result = val1 % val2
                        break
                    default:
                        result = 0
                }
                newCalculationJson[index].calculated_result = result
            }
        }
        setCalculationJson(newCalculationJson)
    }

    const handleAddField = () => {
        const newCalculationJson = [...calculationJson, { key_1: '', key_2: '', calc: '', resulted_key: '' }];
        setCalculationJson(newCalculationJson);
    
        // Ensure we update customResults and dmKeys only if resulted_key is not already added
        const newCustomResults = { ...customResults };
        const newDmKeys = [...dmKeys];
    
        newCalculationJson.forEach((field) => {
            if (field.resulted_key && !newCustomResults.hasOwnProperty(field.resulted_key)) {
                newCustomResults[field.resulted_key] = field.calculated_result || 0;
                newDmKeys.push({ label: field.resulted_key, value: field.resulted_key });
            }
        });
    
        setCustomResults(newCustomResults);
        setDmKeys(newDmKeys);
    };
    
    
    // const handleAddField = () => {
    //     setCalculationJson([...calculationJson, { key_1: '', key_2: '', calc: '', resulted_key: '' }])
    //     const newCustomResults = { ...customResults }
    //     calculationJson.forEach((field) => {
    //         if (field.resulted_key && field.calculated_result !== undefined) {
    //             newCustomResults[field.resulted_key] = field.calculated_result
    //         }
    //     })
    //     setCustomResults(newCustomResults)

    //     // Update dmKeys with custom results
    //     const newDmKeys = [
    //         ...dmKeys,
    //         ...Object.keys(newCustomResults).map(key => ({ label: key, value: key }))
    //     ]
    //     setDmKeys(newDmKeys)
    // }

    const handleRemoveField = (index) => {
        const newCalculationJson = [...calculationJson]
        newCalculationJson.splice(index, 1)
        setCalculationJson(newCalculationJson)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const newCustomResults = { ...customResults }
        calculationJson.forEach((field) => {
            if (field.resulted_key && field.calculated_result !== undefined) {
                newCustomResults[field.resulted_key] = field.calculated_result
            }
        })
        setCustomResults(newCustomResults)

        // Update dmKeys with custom results
        const newDmKeys = [
            ...dmKeys,
            ...Object.keys(newCustomResults).map(key => ({ label: key, value: key }))
        ]
        setDmKeys(newDmKeys)

    }














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
                                                placeholder="Select Fields"
                                                defaultOptions={dmKeys}
                                                isMulti={false}
                                                isClearable={false}
                                                backspaceRemovesValue={false}
                                                hideSelectedOptions={false}
                                                isSearchable={false}
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
                                        <div>
                                            <CFormLabel>Select Field (2)</CFormLabel>
                                            <AsyncSelect
                                                placeholder="Select Fields"
                                                defaultOptions={dmKeys}
                                                isMulti={false}
                                                isClearable={false}
                                                backspaceRemovesValue={false}
                                                hideSelectedOptions={false}
                                                isSearchable={false}
                                                value={{ label: field.key_2, value: field.key_2 }}
                                                getOptionLabel={(option) => option.label}
                                                getOptionValue={(option) => option.value}
                                                onChange={(selectedOption) =>
                                                    handleFieldChange(index, 'key_2', selectedOption.value)
                                                }
                                            />
                                        </div>
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
                        </CCardBody>
                    </CCard>

                    <CCard className="mt-3">
                        {JSON.stringify(calculationJson)}
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
                    </CCard>
                </CForm>
            </CContainer>
        </>
    )
}

export default Calculation
