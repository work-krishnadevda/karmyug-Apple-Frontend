import {
    cibFacebookF,
    cibLinkedin,
    cibLinkedinIn,
    cibTwitter,
    cibYoutube,
    cilPlus,
    cilUserPlus,
    cilX,
    cibInstagram,
    cilXCircle,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CContainer,
    CForm,
    CFormLabel,
    CRow,
    CFormSelect,
    CInputGroup,
    CFormTextarea,
    CTable,
    CTableRow,
    CTableBody,
    CTableHeaderCell,
    CCardFooter,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { number } from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import handleSubmitHelper from 'src/helpers/submitHelper'
import AsyncSelect from 'react-select/async'

let validationRules = {

}

export default function AllSetting() {
    const [dataLoadedTat, setDataLoadedTat] = useState(false)

    const [dataLoadedLinks, setDataLoadedLinks] = useState(false)
    const [dataLoadedFinance, setDataLoadedFinance] = useState(false)

    const [financeData, setFinanceData] = useState([{
        finance_id: '',
        overtat_time: ''
    }])

    const [financenameData, setFinancenameData] = useState()

    const dispatch = useDispatch()
    const [settingsValues, setSettingsValues] = useState({
        self_assign: false,
        fe_online_visit: false,
    })

    const [quickLinks, setQuickLinks] = useState([
        { name: '', link: '' }
    ])


    async function fetchFinancename() {
        try {
            var response = await new BasicProvider(`banks?count=1000`).getRequest()
            var data = response?.data.data
            setFinancenameData(data)
        } catch (error) {
            console.log(error)
        }
    }

    function getOptionListt(data, defaultOption = { value: '', label: 'All' }) {
        const options = data
            ? data.map((cast) => ({
                value: cast?._id,
                label: cast?.name,
            }))
            : []
        return [defaultOption, ...options]
    }

    const financeOptionss = getOptionListt(financenameData);

    const selectedFinanceIds = financeData.map((finance) => finance.finance_id);

    const getOptionList = (data, defaultOption = { value: '', label: 'Select' }, selectedFinanceIds = []) => {
        const options = data
            ? data
                .filter((item) => !selectedFinanceIds.includes(item?._id))
                .map((item) => ({
                    value: item?._id,
                    label: item?.name,
                }))
            : [];
        return [defaultOption, ...options];
    };

    const financeOptions = getOptionList(financenameData, { value: '', label: 'All' }, selectedFinanceIds);

    const loadOptions = async (name, inputValue, callback) => {
        try {
            const selectData = await new BasicProvider(
                `${name}?search=${inputValue}&page=1&count=1000`,
            ).getRequest();

            const options = selectData.data.data
                .filter((item) => !selectedFinanceIds.includes(item._id))
                .map((item) => ({
                    value: item._id,
                    label: item.name,
                }));

            callback(options);
        } catch (error) {
            console.log(error);
        }
    };

    const handleAddLink = () => {
        setQuickLinks([...quickLinks, { name: '', link: '' }])
    }
    const handleAddFinance = () => {
        setFinanceData([...financeData, {
            finance_id: '',
            overtat_time: ''
        }])
    }

    const handleRemoveFinance = (index) => {
        const newfinance = [...financeData]
        newfinance.splice(index, 1)
        setFinanceData(newfinance)
    }

    const handleRemoveLink = (index) => {
        const newQuickLinks = [...quickLinks]
        newQuickLinks.splice(index, 1)
        setQuickLinks(newQuickLinks)
    }

    const handleQuickLinkChange = (index, event) => {
        const { name, value } = event.target
        const newQuickLinks = [...quickLinks]
        newQuickLinks[index][name] = value
        setQuickLinks(newQuickLinks)
    }

    const handleFinanceChange = (index, name, value) => {
        const newFinanceData = [...financeData]
        newFinanceData[index][name] = value
        setFinanceData(newFinanceData)
        setDataLoadedFinance(false)
    }

    const handleSettingsChange = (event) => {
        const { name, value, type, checked } = event.target;

        console.log(type)
        // setSettingsValues({ value: value.replace(/\D/g, '') })
        if (type === "checkbox") {
            setSettingsValues((prevValues) => ({
                ...prevValues,
                [name]: checked, // Sets the checkbox value to true/false based on the checked state
            }));
        }

    }

    console.log('settihg value', settingsValues);


    const handleSubmitSettings = async (e) => {
        e.preventDefault()
        // const data = await handleSubmitHelper(settingsValues, validationRules, dispatch)

        // if (data === false) return

        console.log('sfsdfsd tie ', settingsValues);
        try {
            const res = await new BasicProvider(`settings/access-setting/create`, dispatch).postRequest({ value: settingsValues })
            if (res.status === 'success') {
            } else {
                console.error(res.status)
            }
            fetchTAT()
            setAlertTimeout(dispatch)
        } catch (error) {
            console.log(error)
        }
    }


    const handleSubmitQuickLinks = async (event) => {
        event.preventDefault()

        try {
            const res = await new BasicProvider(`settings/quick-links/create`).postRequest({
                value: quickLinks,
            })

            if (res.status === 'success') {
                console.error(res.status)
            } else {
                console.error(res.status)
            }
            setAlertTimeout(dispatch)
            fetchQuickLinks()
        } catch (error) {
            console.log(error)
        }
    }

    const handleSubmitFinance = async (event) => {
        event.preventDefault()

        try {
            const res = await new BasicProvider(`settings/finance-wise-overtat/create`).postRequest({
                value: financeData,
            })

            if (res.status === 'success') {
                console.error(res.status)
            } else {
                console.error(res.status)
            }
            setAlertTimeout(dispatch)
            fetchfinanceData()

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchTAT()
        fetchQuickLinks()
        fetchFinancename()
        fetchfinanceData()
    }, [])

    const fetchTAT = async () => {
        try {
            const res = await new BasicProvider(`settings/access-setting`).getRequest()
            setSettingsValues(res.data.value[0])
            if (res.data.value[0]) {
                setDataLoadedTat(true)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchfinanceData = async () => {
        try {
            const res = await new BasicProvider(`settings/finance-wise-overtat`).getRequest()
            setFinanceData(res.data.value ?? [])
            if (res.data.value.length > 0) {
                setDataLoadedFinance(true)
            }


        } catch (error) {
            console.log("ererererer")
            console.log(error)
        }


    }


    const fetchQuickLinks = async () => {
        try {
            const res = await new BasicProvider(`settings/quick-links`).getRequest()
            setQuickLinks(res.data.value ?? [])
            if (res.data.value.length > 0) {
                setDataLoadedLinks(true)
            }


        } catch (error) {

        }


    }

    return (
        <CContainer className=" mt-4">
            <CRow className="add_orders">
                <CCol md={8} className="mt-1">
                    <CForm onSubmit={handleSubmitQuickLinks}>
                        <CCard>
                            <CCardHeader>
                                <div className="d-flex justify-content-between align-items-center">
                                    Quick Links
                                    <p className="m-0">
                                        <div>
                                            <CButton
                                                className="btn btn-primary me-2  submit_btn"
                                                onClick={handleAddLink}
                                            >
                                                <CIcon icon={cilPlus}></CIcon>
                                                Add Link
                                            </CButton>
                                        </div>
                                    </p>
                                </div>
                            </CCardHeader>
                            <CCardBody>
                                {quickLinks.map((link, index) => (
                                    <CRow key={index} className='d-flex align-items-center'>
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel>
                                                    Name<span className="text-danger">*</span>
                                                </CFormLabel>
                                                <CInputGroup className="has-validation">
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        className="form-control"
                                                        placeholder="Name"
                                                        value={link.name}
                                                        onChange={(e) => handleQuickLinkChange(index, e)}
                                                    />
                                                </CInputGroup>
                                            </div>
                                        </CCol>
                                        <CCol md={5}>
                                            <div className="mb-3">
                                                <CFormLabel>
                                                    Background Link<span className="text-danger">*</span>
                                                </CFormLabel>
                                                <CInputGroup className="has-validation">
                                                    <input
                                                        type="text"
                                                        name="link"
                                                        className="form-control"
                                                        placeholder="Link"
                                                        value={link.link}
                                                        onChange={(e) => handleQuickLinkChange(index, e)}
                                                    />
                                                </CInputGroup>
                                            </div>
                                        </CCol>
                                        <CCol md={1}>
                                            <div
                                                className="delet-question"
                                                onClick={() => handleRemoveLink(index)}
                                            >
                                                <CIcon size='lg' icon={cilXCircle}></CIcon>
                                            </div>
                                        </CCol>
                                    </CRow>
                                ))}
                            </CCardBody>
                            <CCardFooter>

                                {!dataLoadedLinks && (
                                    <CButton
                                        className="btn btn-primary mt-2 submit_btn"
                                        type="submit"
                                    >
                                        Submit
                                    </CButton>
                                )}

                                {dataLoadedLinks && (
                                    <CButton
                                        className="btn btn-primary mt-2 submit_btn"
                                        type="submit"
                                    >
                                        Update
                                    </CButton>
                                )}

                            </CCardFooter>
                        </CCard>
                    </CForm>
                </CCol>


                <CCol md={4} className="mt-1">
                    <CForm onSubmit={handleSubmitSettings}>
                        <CCard>
                            <CCardHeader>Access Setting</CCardHeader>
                            <CCardBody>
                                {/* <div className="mb-3">
                                    <CFormLabel>
                                        Over TAT (In hour)<span className="text-danger">*</span>
                                    </CFormLabel>
                                    <CInputGroup className="has-validation">
                                        {settingsValues.value}
                                        <input
                                            type="text"
                                            name="overtat_time"
                                            className="form-control"
                                            placeholder="Over TAT (In hour)"
                                            value={settingsValues.value}
                                            onChange={handleSettingsChange}
                                        />
                                    </CInputGroup>
                                </div> */}
                                <div className="mb-0 ">
                                    <CFormLabel className='d-flex w-0' >
                                        <input
                                            style={{ width: '10%', }}
                                            type="checkbox"
                                            className='mt-1'
                                            name="fe_online_visit"
                                            checked={settingsValues.fe_online_visit}
                                            // onChange={(e) => {

                                            // }}
                                            onChange={handleSettingsChange}
                                        />{" "}
                                        FE Online Visit
                                    </CFormLabel>
                                </div>

                                <div className="mb-0" >
                                    <CFormLabel className='d-flex w-0' >
                                        <input
                                            style={{ width: '10%', }}
                                            type="checkbox"
                                            name="self_assign"
                                            checked={settingsValues.self_assign}
                                            // onChange={(e) => {

                                            // }}
                                            onChange={handleSettingsChange}
                                        />{" "}
                                        Self Assign
                                    </CFormLabel>
                                </div>
                            </CCardBody>

                            <CCardFooter>

                                {!dataLoadedTat && (
                                    <CButton
                                        className="btn btn-primary mt-2 submit_btn"
                                        type="submit"
                                    >
                                        Submit
                                    </CButton>
                                )}
                                {dataLoadedTat && (
                                    <CButton
                                        className="btn btn-primary mt-2 submit_btn"
                                        type="submit"
                                    >
                                        Update
                                    </CButton>
                                )}

                            </CCardFooter>
                        </CCard>
                    </CForm>
                </CCol>
            </CRow>
            <CRow className="mt-1" >
                <CCol md={8} className="mt-1">
                    <CForm onSubmit={handleSubmitFinance}>
                        <CCard>
                            <CCardHeader>
                                <div className="d-flex justify-content-between align-items-center">
                                    Finance Wise Over TAT
                                    <p className="m-0">
                                        <div>
                                            <CButton
                                                className="btn btn-primary me-2  submit_btn"
                                                onClick={handleAddFinance}
                                            >
                                                <CIcon icon={cilPlus}></CIcon>
                                                Add Finance
                                            </CButton>
                                        </div>
                                    </p>
                                </div>
                            </CCardHeader>
                            <CCardBody>
                                {financeData.map((item, index) => (
                                    <CRow key={index} className='d-flex align-items-center'>

                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel>Finance Name</CFormLabel>
                                                <AsyncSelect
                                                    name="finance_id"
                                                    loadOptions={(inputValue, callback) =>
                                                        loadOptions('banks/search', inputValue, callback)
                                                    }

                                                    defaultOptions={financeOptions}
                                                    getOptionLabel={(option) => option.label}
                                                    getOptionValue={(option) => option.value}
                                                    value={
                                                        item.finance_id
                                                            ? financeOptionss.find((option) => option.value === item.finance_id)
                                                            : ''
                                                    }
                                                    onChange={(selectOption) => handleFinanceChange(index, 'finance_id', selectOption?.value)}
                                                />
                                            </div>
                                        </CCol>
                                        <CCol md={5}>
                                            <div className="mb-3">
                                                <CFormLabel>
                                                    Over Tat (in hour ) <span className="text-danger">*</span>
                                                </CFormLabel>
                                                <CInputGroup className="has-validation">
                                                    <input
                                                        type="number"
                                                        name="overtat_time"
                                                        className="form-control"
                                                        placeholder="OverTaT in hour"
                                                        value={item?.overtat_time}
                                                        onChange={(e) => handleFinanceChange(index, 'overtat_time', e?.target?.value)}
                                                    />
                                                </CInputGroup>

                                            </div>
                                        </CCol>
                                        <CCol md={1}>
                                            <div
                                                className="delet-question"
                                                onClick={() => handleRemoveFinance(index)}
                                            >
                                                <CIcon size='lg' icon={cilXCircle}></CIcon>
                                            </div>
                                        </CCol>
                                    </CRow>
                                ))}
                            </CCardBody>

                            <CCardFooter>

                                {!financeData && (
                                    <CButton
                                        className="btn btn-primary mt-2 submit_btn"
                                        type="submit"
                                    >
                                        Submit
                                    </CButton>
                                )}

                                {financeData && (
                                    <CButton
                                        className="btn btn-primary mt-2 submit_btn"
                                        type="submit"
                                    >
                                        Update
                                    </CButton>
                                )}

                            </CCardFooter>
                        </CCard>
                    </CForm>
                </CCol>
            </CRow>
        </CContainer>
    )
}
