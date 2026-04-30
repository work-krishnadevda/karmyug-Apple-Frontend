import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import SubHeader from 'src/components/custom/SubHeader';
import { CButton, CCard, CCardBody, CCardHeader, CCol, CContainer, CForm, CFormInput, CFormLabel, CInputGroup, CRow } from '@coreui/react'
import handleSubmitHelper from 'src/helpers/submitHelper';
import ImagePreview from 'src/components/custom/ImagePreview'
import BasicProvider from 'src/constants/BasicProvider';
import { useEffectFormData } from 'src/helpers/formHelpers';
import { setAlertTimeout } from 'src/helpers/alertHelper';
import { ImageHelper } from 'src/helpers/imageHelper'

var subHeaderItems = [
    {
        name: 'All RA Baranch',
        link: '/rabranch/all',
        icon: cilSpreadsheet,
    },
    {
        name: 'Create RA Branch',
        link: '/rabranch/create',
        icon: cilPencil,
    },
    {
        name: 'Trash RA Branch',
        link: '/rabranch/trash',
        icon: cilTrash,
    },
]
const create = () => {
    var params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const id = params.id
    const isEditMode = !!id


    const [initialValues, setInitialValues] = useState({
        name: '',
        mobile: '',
        alternative: '',
        landline: '',
        email: '',
        address: '',
        featured_image: '',
    });

    
    const validationRules = {
        name: {
            required: true,
        },
        mobile: {
            required: true,
        },

        // landline: {
        //     required: true,
        // },
        // email: {
        //     required: true,
        // },
        // address: {
        //     required: true,
        // },
    }

    useEffect(() => {
        setInitialValues({
            name: '',
            mobile: '',
            alternative: '',
            landline: '',
            email: '',
            address: '',
            featured_image: ''
        })

        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const data = await useEffectFormData(`ra_branch/show/${id}`, initialValues, isEditMode)
            if (isEditMode) {
                setInitialValues({ ...data })
            }
        } catch (error) {
            dispatch({ type: 'set', catcherror: error.data })
        }
    }

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setInitialValues({ ...initialValues, [name]: value })
    }

    const handleContactNumberChange = (value, mobile) => {
        const sanitizedValue = value.replace(/[^\d-]/g, '');

        setInitialValues({ ...initialValues, [mobile]: sanitizedValue })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
            if (data === false) return

            var response
            if (isEditMode) {
                response = await new BasicProvider(`ra_branch/update/${id}`, dispatch).patchRequest(data)
            } else {
                response = await new BasicProvider(`ra_branch/create`, dispatch).postRequest(data)
                navigate(`/rabranch/${response.data._id}/edit`)
            }
            setAlertTimeout(dispatch)
        } catch (error) {
            console.log(error)
            dispatch({ type: 'set', validations: [error.data] })
        }
    }

    return (
        <>
            <SubHeader subHeaderItems={subHeaderItems} />
            <CContainer fluid>
                <CForm className="g-3 needs-validation mb-3" onSubmit={handleSubmit}>
                    <CRow className="form-input-block">
                        <CCol md={8}>
                            <CCard>
                                <CCardHeader>RA Branch Details</CCardHeader>
                                <CCardBody>
                                    <CRow>
                                        <CCol md={6}>
                                            <CFormLabel>
                                                Name<span className="text-danger">*</span>
                                            </CFormLabel>
                                            <CInputGroup className="has-validation">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={initialValues.name ?? ''}
                                                    className="form-control"
                                                    placeholder="Enter  name "
                                                    onChange={handleOnChange}
                                                />
                                            </CInputGroup>
                                        </CCol>
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel>Email address<span className="text-danger ">*</span></CFormLabel>
                                                <CFormInput
                                                    type="email"
                                                    id="exampleDropdownFormEmail1"
                                                    name="email"
                                                    value={initialValues.email}
                                                    onChange={handleOnChange}
                                                    placeholder="email@example.com"
                                                />
                                            </div>
                                        </CCol>
                                        {/* </CRow>
                                    <CRow> */}
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel>
                                                    Contact Number<span className="text-danger">*</span>
                                                </CFormLabel>
                                                <input
                                                    type="number"
                                                    name="mobile"
                                                    value={initialValues.mobile ?? ''}
                                                    className="form-control"
                                                    placeholder="Enter contact here"

                                                    onChange={(e) => {
                                                        const input = e.target.value
                                                        const regex = /^[0-9\b]+$/
                                                        if (input === '' || regex.test(input)) {
                                                            handleContactNumberChange(input.slice(0, 10), 'mobile')
                                                        }
                                                    }}
                                                    maxLength={10}
                                                />
                                            </div>
                                        </CCol>
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel>
                                                    Alternative Number
                                                </CFormLabel>
                                                <input
                                                    type="number"
                                                    name="alternative"
                                                    value={initialValues.alternative ?? ''}
                                                    className="form-control"
                                                    placeholder="Enter Alternative Number here"

                                                    onChange={(e) => {
                                                        const input = e.target.value
                                                        const regex = /^[0-9\b]+$/
                                                        if (input === '' || regex.test(input)) {
                                                            handleContactNumberChange(input.slice(0, 10), 'alternative')
                                                        }
                                                    }}
                                                    maxLength={10}
                                                />
                                            </div>
                                        </CCol>
                                        {/* </CRow>
                                    <CRow> */}
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel>
                                                    Landline Number<span className="text-danger">*</span>
                                                </CFormLabel>
                                                <input
                                                    type="tel"
                                                    name="landline"
                                                    value={initialValues.landline ?? ''}
                                                    className="form-control"
                                                    placeholder="Enter Landline here"
                                                    onChange={(e) => {
                                                        const input = e.target.value;
                                                        const regex = /^[-0-9\b]{0,12}$/; // Allow up to 12 characters
                                                        if (input === '' || regex.test(input)) {
                                                            handleContactNumberChange(input, 'landline'); // Pass the entire input
                                                        }
                                                    }}
                                                    maxLength={12}
                                                />
                                            </div>
                                        </CCol>
                                        <CCol md={6}>
                                            <div className="mb-3">
                                                <CFormLabel>
                                                    Address<span className="text-danger">*</span>
                                                </CFormLabel>
                                                <textarea
                                                    type="text"
                                                    name="address"
                                                    value={initialValues.address ?? ''}
                                                    className="form-control"
                                                    placeholder="Enter address here"
                                                    onChange={handleOnChange}
                                                />
                                            </div>
                                        </CCol>
                                    </CRow>
                                </CCardBody>
                            </CCard>
                        </CCol>
                        <CCol md={4}>
                            <CCard>
                                <CCardHeader>Report Header</CCardHeader>
                                <CCardBody>
                                    <div className="mb-3">
                                        <CFormLabel>Upload Image(1920px * 180px)</CFormLabel>
                                        <CFormInput
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={(e) => {
                                                const file = ImageHelper(e, 'previewImage')
                                                setInitialValues({ ...initialValues, featured_image: file[0] })
                                            }}
                                        />

                                        <ImagePreview
                                            // file={initialValues?.featured_image?.filepath}
                                            file={
                                                initialValues.featured_image?.filepath
                                                    ? initialValues.featured_image.filepath
                                                    : initialValues.featured_image
                                            }
                                            isEdit={isEditMode}
                                            onDelete={() => {
                                                fileInputRef.current.value = ''
                                                setInitialValues({ ...initialValues, featured_image: null })
                                            }}
                                        />
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>

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
                                            onClick={() =>
                                                setInitialValues({ ...initialValues })
                                            }
                                        >
                                            Submit
                                        </CButton>
                                    )}

                                    {isEditMode && (
                                        <CButton
                                            className="btn btn-secondary me-2 "
                                            type="submit"
                                            name="buttonClicked"
                                            value="update"
                                        >
                                            Update
                                        </CButton>
                                    )}

                                    <CButton
                                        color="danger"
                                        className="text-light"
                                        onClick={() => {
                                            setInitialValues({})
                                            navigate('/rabranch/all')
                                        }}
                                    >
                                        Cancel
                                    </CButton>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </CForm>
            </CContainer>
        </>
    )
}

export default create
