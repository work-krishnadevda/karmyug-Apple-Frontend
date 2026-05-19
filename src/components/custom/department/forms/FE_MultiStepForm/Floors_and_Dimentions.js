import {
  CButton,
  CCol,
  CFormLabel,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CContainer,
  CFormTextarea,
  CForm,
} from '@coreui/react'


import AppFormSelect from 'src/components/form/AppFormSelect'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import { useEffectFormData } from 'src/helpers/formHelpers'
import handleSubmitHelper from 'src/helpers/submitHelper'
import AsyncSelect from 'react-select/async'

const validationRules = {
  // person_meet_at_site_name: {
  //   required: true,
  // },
}

const FLoorsAndDiamentions = ({
  currentStep,
  setCurrentStep,
  initialValues,
  setInitialValues,
  totalSteps,
  handlePreviousStep,
  handleNextStep,
}) => {
  let loggedinUserRole = useSelector((state) => state?.userRole)

  var params = useParams()
  const id = params.id
  const navigate = useNavigate()
  var dispatch = useDispatch()
  const isEditMode = !!id

  const [interiors, setInteriors] = useState([])
  const [exteriors, setExteriors] = useState([])
  const [construction, setConstruction] = useState([])
  const [noOfFloors, setNoOfFloors] = useState([])
  const [situatedOnWing, setSituatedOnWing] = useState([])

  const [isCancle, setIsCancle] = useState(false)
  const [isPrevNextButton, setIsPrevNextButton] = useState(true)

  useEffect(() => {
    if (loggedinUserRole?.name == process.env.REACT_APP_SDM) setIsCancle(true)
    if (loggedinUserRole?.name == process.env.REACT_APP_DM) setIsCancle(true)

    if (loggedinUserRole?.name == process.env.REACT_APP_DM) setIsPrevNextButton(false)
  }, [loggedinUserRole])

  const transformData = (sourceArray, labelKey) =>
    sourceArray.map((elem) => ({
      value: elem._id,
      label: elem.item ? elem.item.name : elem.variant || elem[labelKey],
    }))

  const interiorsData = interiors ? transformData(interiors, 'name') : []
  const exteriorsData = exteriors ? transformData(exteriors, 'name') : []
  const constructionData = construction ? transformData(construction, 'name') : []

  const noOfFloorsData = noOfFloors ? transformData(noOfFloors, 'name') : []

  const situatedOnWingData = situatedOnWing ? transformData(situatedOnWing, 'name') : []

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const interiors = await new BasicProvider(
      'cms/categories/get-first-parent/interiors',
      dispatch,
    ).getRequest()
    setInteriors(interiors.data.data)

    const exteriors = await new BasicProvider(
      'cms/categories/get-first-parent/exteriors',
      dispatch,
    ).getRequest()
    setExteriors(exteriors.data.data)

    const construction = await new BasicProvider(
      'cms/categories/get-first-parent/construction_at_site',
      dispatch,
    ).getRequest()
    setConstruction(construction.data.data)

    const noOfFloors = await new BasicProvider(
      'cms/categories/get-first-parent/no_of_floors_in_wing?page=1&count=50',
      dispatch,
    ).getRequest()
    let data = noOfFloors.data.data.reverse()
    setNoOfFloors(data)

    const situatedOnWingg = await new BasicProvider(
      'cms/categories/get-first-parent/flate_situated_in_wing?page=1&count=50',
      dispatch,
    ).getRequest()
    // let data = noOfFloors.data.data.reverse()
    setSituatedOnWing(situatedOnWingg.data.data.reverse())
  }

  const loadOptions = async (name, inputValue, callback) => {
    try {
      const selectData = await new BasicProvider(
        `${name}?search=${inputValue}&page=1&count=10`,
      ).getRequest()
      const options = selectData.data.data.map((item) => ({
        value: item._id,
        label: item.name,
      }))
      callback(options);
    } catch (error) {
      console.error('Error loading options:', error);
    }

  }


  const selectedOption = situatedOnWingData.find(option =>
    initialValues?.located_on_floor.includes(option.value)
  );


  const handleReset = async () => {
    initialValues.no_of_wing_or_building = 0
    initialValues.located_on_floor = []
    initialValues.no_of_floor = 0
    initialValues.lift = 0
    initialValues.no_of_lift = 0
    initialValues.floor_wise_details = []
    initialValues.is_basement_or_other = ''
    initialValues.com_basement_other = {
      built_up: '',
      violation: '',
      unit_rate: '',
    }
    initialValues.is_basement = ''
    initialValues.no_of_basement = 0
    initialValues.basement_wise_details = []
    initialValues.is_stilt = ''
    initialValues.is_mezzanine = ''
    initialValues.stilt = ''
    initialValues.mezzanine = ''
    initialValues.construction_stage = ''
    initialValues.construction_at_site = []
    initialValues.floors_and_dimentions_remarks = ''
    initialValues.dimension = {
      length: '',
      width: '',
    }
    initialValues.buit_up = {
      length: '',
      width: '',
    }
    initialValues.land_area = ''
    initialValues.bua = ''
    initialValues.shape_type = ''
    initialValues.land_rate = ''
    initialValues.bua_rate = ''
    initialValues.exteriors = []

    // Multistory/building

    initialValues.no_of_wing_or_building = 0
    initialValues.flat_situated_on_wing = 0
    initialValues.no_of_floors = 0
    initialValues.located_on_floor = []
    initialValues.other_flats_on_visited_floor = 0
    initialValues.builup_with_dimention = {
      length: null,
      width: null,
      dimension: 0,
    }

    initialValues.super_builup_with_dimention = {
      length: null,
      width: null,
      dimension: 0,
    }

    initialValues.loding_in_percentage = ''
    initialValues.flat_per_sqrt_rate_bua = ''
    initialValues.flat_per_sqrt_rate_sbua = ''
    initialValues.flat_multistory_building_unit_rate = ''
    initialValues.details_of_flat = ''
    initialValues.interior = []
    initialValues.number_of_wings_available = ''
    initialValues.carpet_rate = ''
    initialValues.name_of_wing = ''
    initialValues.multistory_no_of_floors = []
    initialValues.is_under_renovation = '0'
    initialValues.is_property_under_construction = '0'
    initialValues.multistory_land_rate = ''
    initialValues.lift = ''
    initialValues.no_of_lifts = 0

  }

  const [isRegularShape, setIsRegularShape] = useState(true)

  const handleOnChange = async (e, floorIndex, fieldName) => {
    const { name, value, type, checked } = e.target

    if (name === 'sub_location_type') {
      await handleReset()
    }

    if (name === 'location_type') {
      setInitialValues((prevState) => ({
        ...prevState,
        sub_location_type: '',
        location_type: '',
      }))
      await handleReset()
    }

    const updatedDetails = [...initialValues.floor_wise_details]
    updatedDetails[floorIndex] = {
      ...updatedDetails[floorIndex],
      [fieldName]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }

    if (name.includes('builtup') && initialValues.shape_type === 'regular shape') {
      const length = parseFloat(updatedDetails[floorIndex]?.builtuplength || 0)
      const width = parseFloat(updatedDetails[floorIndex]?.builtupwidth || 0)
      if (!isNaN(length) && !isNaN(width) && initialValues.shape_type === 'regular shape') {
        updatedDetails[floorIndex].bua = length * width
      }
    }

    setInitialValues((prevState) => ({
      ...prevState,
      floor_wise_details: updatedDetails,
    }))

    if (type === 'checkbox') {
      const checkboxValue = checked ? '1' : '0'
      setInitialValues((prevState) => ({
        ...prevState,
        [name]: checkboxValue,
      }))
      setInitialValues((prevState) => ({
        ...prevState,
        basement_wise_details: [],
      }))
    } else if (name === 'no_of_floors') {
      setInitialValues((prevState) => ({
        ...prevState,
        [name]: Number(value),
        floor_wise_details: Array.from({ length: Number(value) }, (_, index) => ({
          floor_name: index === 0 ? 'Ground' : `G+${index}`,
          noofrooms: '',
          builtupwidth: '',
          builup_length: '',
          bua: '',
          interiors: [],
        })),
      }))
    } else if (name.includes('floor_')) {
      fieldName = fieldName || name.split('_')[2]
      setInitialValues((prevState) => {
        const updatedFloorDetails = prevState.floor_wise_details.map((floor, index) =>
          index === floorIndex ? { ...floor, [fieldName]: value } : floor,
        )

        if (fieldName === 'builtuplength' || fieldName === 'builtupwidth') {
          const length = parseFloat(updatedFloorDetails[floorIndex]?.builtuplength || 0)
          const width = parseFloat(updatedFloorDetails[floorIndex]?.builtupwidth || 0)
          if (!isNaN(length) && !isNaN(width) && initialValues.shape_type === 'regular shape') {
            updatedFloorDetails[floorIndex] = {
              ...updatedFloorDetails[floorIndex],
              bua: length * width,
            }
          }
        }

        return {
          ...prevState,
          floor_wise_details: updatedFloorDetails,
        }
      })
    } else {
      setInitialValues((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  }

  function getSuffix(num) {
    const lastDigit = num % 10
    const suffixes = ['th', 'st', 'nd', 'rd']
    return suffixes[lastDigit] || 'th'
  }

  const renderFloorFields = () => {
    let floorFields = []

    for (let i = 0; i <= initialValues.no_of_floors; i++) {
      floorFields.push(
        <div key={i} className="w-100 my-3">
          <>
            {i === 0 ? (
              <div className="fw-500">Ground Floor</div>
            ) : (
              <div className="fw-500">{`${i}${getSuffix(i)} Floor`}</div>
            )}
          </>

          <CRow>
            <CCol md={6}>
              <CRow>
                <CCol md={8} className="">
                  <CRow>
                    <CFormLabel>Built-Up Dimension</CFormLabel>
                    <CCol md={6} className="">
                      <CFormInput
                        type="number"
                        placeholder="Enter Length"
                        className="mb-2"
                        value={initialValues?.floor_wise_details[i]?.builtuplength}
                        name={`floor_${i}_builtuplength`}
                        onChange={(e) => handleOnChange(e, i, 'builtuplength')}
                        autoComplete="off"
                      />
                    </CCol>

                    <CCol md={6} className="">
                      <CFormInput
                        type="number"
                        placeholder="Enter Width"
                        className="mb-3"
                        value={initialValues?.floor_wise_details[i]?.builtupwidth}
                        name={`floor_${i}_builtupwidth`}
                        onChange={(e) => handleOnChange(e, i, 'builtupwidth')}
                        autoComplete="off"
                      />
                    </CCol>
                  </CRow>
                </CCol>

                <CCol md={4} className="">
                  <CFormLabel>Land Area (in sqft)</CFormLabel>
                  <CFormInput
                    type="number"
                    placeholder="BUA"
                    name="bua"
                    value={initialValues?.floor_wise_details[i]?.bua}
                    readOnly={initialValues.shape_type === 'regular shape'}
                    onChange={(e) => handleOnChange(e, i, 'bua')}
                    autoComplete="off"
                    className="mb-3"
                  />
                </CCol>
              </CRow>
            </CCol>

            <CCol md={6}>
              <CFormLabel>
                Details Of Floor <span className="text-danger">*</span>
              </CFormLabel>
              <CFormInput
                type="text"
                name={`floor_${i}_noofrooms`}
                value={initialValues?.floor_wise_details[i]?.noofrooms}
                onChange={(e) => handleOnChange(e, i)}
                placeholder={`Details Of Floor`}
                autoComplete="off"
                className="mb-3"
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol md={12} className="">
              <CFormLabel>Interiors</CFormLabel>

              {/* <AsyncSelect
                name="interiors"
                isMulti
                loadOptions={(inputValue, callback) =>
                  loadOptions('cms/categories/search-perent/interiors', inputValue, callback)
                }
                defaultOptions={interiorsData}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                value={
                  Array.isArray(initialValues.floor_wise_details[i].interiors)
                    ? initialValues.floor_wise_details[i].interiors.map((item) =>
                      interiorsData.find((option) => option.value == item._id || item),
                    )
                    : []
                }
                onChange={(selectedOptions) => handleInteriorsChange(selectedOptions, i)}
              /> */}
              {/* <AsyncSelect
                name="interiors"
                isMulti
                loadOptions={(inputValue, callback) =>
                  loadOptions('cms/categories/search-perent/interiors', inputValue, callback)
                }
                defaultOptions={interiorsData}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                value={
                  Array.isArray(initialValues.floor_wise_details[i]?.interiors)
                    ? initialValues.floor_wise_details[i]?.interiors.map(
                        (item) =>
                          interiorsData.find((option) => option.value === item._id) || {
                            value: item._id,
                            label: item.name,
                          },
                      )
                    : []
                }
                onChange={(selectedOptions) => handleInteriorsChange(selectedOptions, i)}
              /> */}
              <AsyncSelect
                name="interiors"
                isMulti
                loadOptions={(inputValue, callback) =>
                  loadOptions('cms/categories/search-perent/interiors', inputValue, callback)
                }
                defaultOptions={interiorsData}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                value={
                  Array.isArray(initialValues.floor_wise_details[i]?.interiors)
                    ? initialValues.floor_wise_details[i]?.interiors?.map((item) =>
                      interiorsData.find(
                        (option) => option.value === item._id || option.value === item,
                      ),
                    )
                    : []
                }
                onChange={(selectedOptions) => handleInteriorsChange(selectedOptions, i)}
              />
            </CCol>
          </CRow>
        </div>,
      )
    }

    return floorFields
  }

  const handleOnChangeBase = (e, basementIndex, fieldName) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      const checkboxValue = checked ? 1 : 0
      setInitialValues((prevState) => ({
        ...prevState,
        [name]: checkboxValue,
      }))
    } else if (name === 'no_of_basement') {
      const numberOfBasements = Number(value)
      const basementDetails = Array.from({ length: numberOfBasements }, (_, index) => ({
        basement_name: `${index + 1} Basement`,
        basementdetails: '',
        builtupwidth: '',
        builtuplength: '',
        bua: '',
      }))

      setInitialValues((prevState) => ({
        ...prevState,
        [name]: numberOfBasements,
        basement_wise_details: basementDetails,
      }))
    } else if (name.includes('basement_')) {
      fieldName = fieldName || name.split('_')[1]

      // console.log('===========================in 2nd===========')

      setInitialValues((prevState) => {
        // const updatedBasementDetails = prevState.basement_wise_details.map((basement, index) =>
        //   index === basementIndex ? { ...basement, [fieldName]: value } : basement,
        // )

        const updatedBasementDetails = prevState.basement_wise_details.map((basement, index) =>
          index === basementIndex ? { ...basement, [fieldName]: value } : basement,
        )

        // console.log('updatedBasementDetails', updatedBasementDetails)

        if (name.includes('dimension')) {
          const length = parseFloat(updatedBasementDetails[basementIndex]?.dimensionlength || 0)
          const width = parseFloat(updatedBasementDetails[basementIndex]?.dimensionwidth || 0)
          const total = length * width
          updatedBasementDetails[basementIndex] = {
            ...updatedBasementDetails[basementIndex],
            totaldimention: total,
          }
        }
        if (name.includes('builtup')) {
          const length = parseFloat(updatedBasementDetails[basementIndex]?.builtuplength || 0)
          const width = parseFloat(updatedBasementDetails[basementIndex]?.builtupwidth || 0)
          const bua = length * width
          updatedBasementDetails[basementIndex] = {
            ...updatedBasementDetails[basementIndex],
            bua: bua,
          }
        }

        return {
          ...prevState,
          basement_wise_details: updatedBasementDetails,
        }
      })
    } else {
      setInitialValues({ ...initialValues, [name]: value })
    }
  }

  const renderBasementWiseDetails = () => {
    let basementFields = []

    for (let i = 0; i < initialValues.no_of_basement; i++) {
      basementFields.push(
        <CRow key={i} className="w-100 my-3">
          <>
            <div className="fw-500">{`${i + 1} Basement`}</div>
          </>
          <CRow className="align-items-center">
            <CCol md={6}>
              <CRow>
                <CCol md={8} className="px-2">
                  <CFormLabel>Built-Up Dimension </CFormLabel>
                  <CRow>
                    <CCol md={6} className="px-2">
                      <CFormInput
                        type="number"
                        placeholder="Enter Length"
                        value={initialValues?.basement_wise_details[i]?.builtuplength}
                        name={`basement_${i}_builtuplength`}
                        onChange={(e) => handleOnChangeBase(e, i, 'builtuplength')}
                        autoComplete="off"
                      />
                    </CCol>
                    <CCol md={6} className="px-2">
                      <CFormInput
                        type="number"
                        placeholder="Enter Width"
                        value={initialValues?.basement_wise_details[i]?.builtupwidth}
                        name={`basement_${i}_builtupwidth`}
                        onChange={(e) => handleOnChangeBase(e, i, 'builtupwidth')}
                        autoComplete="off"
                      />
                    </CCol>
                  </CRow>
                </CCol>
                <CCol md={4} className="px-2">
                  <CFormLabel>Land Area (IN Sqft)</CFormLabel>
                  <CFormInput
                    type="number"
                    placeholder="BUA"
                    name="bua"
                    value={initialValues?.basement_wise_details[i]?.bua}
                    readOnly={initialValues.shape_type === 'regular shape'}
                    onChange={(e) => handleOnChangeBase(e, i, 'bua')}
                    autoComplete="off"
                  />
                </CCol>
              </CRow>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>
                  Details Of Basement <span className="text-danger">*</span>
                </CFormLabel>

                <CFormInput
                  type="text"
                  name={`basement_${i}_basementdetails`}
                  value={initialValues?.basement_wise_details[i]?.basementdetails ?? ''}
                  onChange={(e) => handleOnChangeBase(e, i, 'basementdetails')}
                  placeholder={`Details Of Basement`}
                  autoComplete="off"
                />
              </div>
            </CCol>
          </CRow>
        </CRow>,
      )
    }

    return basementFields
  }

  // const handleInteriorsChange = (selectedOptions, floorIndex) => {
  //   // Extracting the selected interior values
  //   const interiors = selectedOptions.map((option) => option.value)

  //   setInitialValues((prevState) => {
  //     const updatedFloorDetails = [...prevState.floor_wise_details]

  //     // Updating the interiors for the specified floor
  //     updatedFloorDetails[floorIndex] = {
  //       ...updatedFloorDetails[floorIndex],
  //       interiors: interiors,
  //     }

  //     return {
  //       ...prevState,
  //       floor_wise_details: updatedFloorDetails,
  //     }
  //   })
  // }

  // const handleInteriorsChange = (selectedOptions, floorIndex) => {

  //   const interiors = selectedOptions.map((option) => option.value);

  //   setInitialValues((prevState) => {
  //     const updatedFloorDetails = [...prevState.floor_wise_details];

  //     updatedFloorDetails[floorIndex] = {
  //       ...updatedFloorDetails[floorIndex],
  //       interiors: interiors,
  //     };

  //     return {
  //       ...prevState,
  //       floor_wise_details: updatedFloorDetails,
  //     };
  //   });
  // };

  // const handleInteriorsChange = (selectedOptions, floorIndex) => {
  //   // Map selected options to extract _id
  //   const interiors = selectedOptions.map((option) => ({
  //     _id: option.value,
  //     name: option.label,
  //   }))

  //   setInitialValues((prevState) => {
  //     const updatedFloorDetails = prevState.floor_wise_details.map((detail, index) =>
  //       index === floorIndex ? { ...detail, interiors } : detail,
  //     )

  //     return {
  //       ...prevState,
  //       floor_wise_details: updatedFloorDetails,
  //     }
  //   })
  // }

  const handleInteriorsChange = (selectedOptions, floorIndex) => {
    const interiors = selectedOptions.map((option) => option.value)

    // setSelectedInteriors(interiors);

    setInitialValues((prevState) => {
      const updatedFloorDetails = [...prevState.floor_wise_details]
      updatedFloorDetails[floorIndex] = {
        ...updatedFloorDetails[floorIndex],
        interiors: interiors,
      }
      return {
        ...prevState,
        floor_wise_details: updatedFloorDetails,
      }
    })
  }

  useEffect(() => {
    if (
      initialValues.dimension?.length &&
      initialValues?.dimension.width &&
      initialValues.shape_type == 'regular shape'
    ) {
      const area = initialValues?.dimension?.length * initialValues?.dimension?.width

      setInitialValues((prevValues) => ({
        ...prevValues,
        land_area: area,
      }))
    }
  }, [initialValues.dimension])

  const handleSubmit = async (e) => {
    // e.preventDefault()
    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)
      setAlertTimeout(dispatch)
    } catch (error) {
      console.log(error)
      // dispatch({ type: 'set', catcherror: error.data })
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  const propertyOptions = {
    residential: ['Land and Building', 'Flat/Multistory Building'],
    commercial: ['Land and Building', 'Flat/Multistory Building'],
    industrial: ['Land and Building'],
    'vacant plot/land': ['Vacant Plot Visit'],
  }

  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  var availableSubOptions
  useEffect(() => {
    availableSubOptions = propertyOptions[initialValues.type_of_property] || []
  }, [initialValues.location_type])

  return (
    <CForm className="g-3 needs-validation">
      <CRow className="w-100 m-0">
        <CCol md={6}>
          <div className="py-2">
            <CFormLabel>Property Type (Perent)</CFormLabel>
            <AppFormSelect
              custom
              name="location_type"
              value={initialValues.location_type}
              placeholder="Select"
              onChange={handleOnChange}
            >
              <option value="">Select Type of property (Perent)</option>
              {Object.keys(propertyOptions).map((option) => (
                <option className="text-capitalize" key={option} value={option.toLowerCase()}>
                  {capitalizeFirstLetter(option)}
                </option>
              ))}
            </AppFormSelect>
          </div>
        </CCol>

        {initialValues.location_type && (
          <CCol md={6}>
            <div className="py-2">
              <CFormLabel>Sub Type Property :</CFormLabel>
              <AppFormSelect
                custom
                name="sub_location_type"
                value={initialValues.sub_location_type}
                placeholder="Select"
                onChange={handleOnChange}
              >
                <option>Select Type of Property</option>
                {propertyOptions[initialValues.location_type].map((option) => (
                  <option key={option} value={option.toLowerCase()}>
                    {option}
                  </option>
                ))}
              </AppFormSelect>
            </div>
          </CCol>
        )}

        {initialValues.sub_location_type === 'vacant plot visit' && (
          <>
            <CCol md={6}>
              <div className="py-2">
                <CRow>
                  <CCol md={8}>
                    <CFormLabel>Plot Dimensions Construction Done At Site </CFormLabel>

                    <CRow className="w-100 m-0">
                      <CCol md={6} className="px-2 pe-0 ps-0">
                        <CFormInput
                          type="number"
                          id="length"
                          placeholder="Enter Length"
                          className="mb-sm-0 mb-2"
                          value={initialValues?.dimension?.length}
                          onChange={(e) =>
                            setInitialValues({
                              ...initialValues,
                              dimension: {
                                ...initialValues.dimension,
                                length: e.target.value,
                              },
                            })
                          }
                          autoComplete="off"
                        />
                      </CCol>

                      <CCol md={6} className="ps-0 ps-md-2 pe-0">
                        <CFormInput
                          type="number"
                          id="width"
                          placeholder="Enter Width"
                          className="mb-3"
                          value={initialValues?.dimension?.width}
                          onChange={(e) =>
                            setInitialValues({
                              ...initialValues,
                              dimension: {
                                ...initialValues.dimension,
                                width: e.target.value,
                              },
                            })
                          }
                          autoComplete="off"
                        />
                      </CCol>
                    </CRow>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Land area </CFormLabel>
                    <CFormInput
                      type="number"
                      id="landArea"
                      name="land_area"
                      placeholder="Land Area"
                      value={initialValues.land_area || ''}
                      readOnly={initialValues.shape_type === 'regular shape'}
                      onChange={(e) => {
                        setInitialValues((prev) => ({
                          ...prev,
                          land_area: e.target.value,
                        }))
                      }}
                      autoComplete="off"
                    />
                  </CCol>
                </CRow>
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Construction Stage %</CFormLabel>
                <CFormInput
                  type="text"
                  name="construction_stage"
                  value={initialValues.construction_stage}
                  onChange={handleOnChange}
                  placeholder="Construction Stage.."
                  autoComplete="off"
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Construction At Site</CFormLabel>

                <AsyncSelect
                  name="construction_at_site"
                  isMulti // Enable multi-select
                  loadOptions={(inputValue, callback) =>
                    loadOptions(
                      'cms/categories/search-perent/construction_at_site',
                      inputValue,
                      callback,
                    )
                  }
                  
                  defaultOptions={constructionData}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  value={
                    Array.isArray(initialValues.construction_at_site)
                      ? initialValues.construction_at_site.map((item) =>
                        constructionData.find((option) => option.value === item),
                      )
                      : []
                  }
                  onChange={(selectedOptions) => {
                    const selectedProductIds = selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : []
                    setInitialValues((prevValues) => ({
                      ...prevValues,
                      construction_at_site: selectedProductIds,
                    }))
                  }}
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Remark</CFormLabel>
                <CFormTextarea
                  type="text"
                  name="floors_and_dimentions_remarks"
                  value={initialValues?.floors_and_dimentions_remarks ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Remarks Here"
                  rows={4}
                  autoComplete="off"
                />
              </div>
            </CCol>
          </>
        )}

        {initialValues.sub_location_type === 'flat/multistory building' && (
          <>
            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Name of wing</CFormLabel>
                <CFormInput
                  type="text"
                  name="name_of_wing"
                  placeholder="Enter Name"
                  className="mb-sm-0 mb-2"
                  onChange={handleOnChange}
                  value={initialValues.name_of_wing ?? ''}
                  autoComplete="off"
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>
                  No. of wing/Building<span className="text-danger ">*</span>
                </CFormLabel>

                <AppFormSelect
                  custom
                  name="no_of_wing_or_building"
                  value={initialValues.no_of_wing_or_building}
                  onChange={handleOnChange}
                >
                  {[...Array(11).keys()].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </AppFormSelect>
              </div>
            </CCol>

            {/* <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Unit/ Flat Situated on wing</CFormLabel>
                <AppFormSelect
                  custom
                  name="flat_situated_on_wing"
                  value={initialValues?.flat_situated_on_wing}
                  onChange={handleOnChange}
                >
                  {[...Array(Number(19) + 1).keys()].map(
                    (num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ),
                  )}
                </AppFormSelect>
              </div>
            </CCol> */}

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Unit/ Flat Situated on wing</CFormLabel>
                <AppFormSelect
                  custom
                  name="flat_situated_on_wing"
                  value={initialValues.flat_situated_on_wing}
                  onChange={handleOnChange}
                >
                  {[...Array(Number(initialValues.no_of_wing_or_building) + 1).keys()].map(
                    (num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ),
                  )}
                </AppFormSelect>
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>No. of Floors in Wing</CFormLabel>
                <AsyncSelect
                  name="multistory_no_of_floors"
                  isMulti
                  loadOptions={(inputValue, callback) =>
                    loadOptions(
                      'cms/categories/search-perent/no_of_floors_in_wing',
                      inputValue,
                      callback,
                    )
                  }
                  defaultOptions={noOfFloorsData}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}
                  value={
                    Array.isArray(initialValues?.multistory_no_of_floors)
                      ? initialValues.multistory_no_of_floors?.map((item) =>
                        noOfFloorsData?.find((option) => option.value === item),
                      )
                      : []
                  }
                  onChange={(selectedOptions) => {
                    const selected = selectedOptions
                      ? selectedOptions?.map((option) => option.value)
                      : []
                    setInitialValues((prevValues) => ({
                      ...prevValues,
                      multistory_no_of_floors: selected,
                    }))
                  }}
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Unit/ Flat Situated on Floor</CFormLabel>
                <AsyncSelect
                  name="located_on_floor"
                  isMulti={false}
                  loadOptions={(inputValue, callback) =>

                    loadOptions(
                      'cms/categories/search-perent/flate_situated_in_wing',
                      inputValue,
                      callback
                    )
                  }
                  defaultOptions={situatedOnWingData}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}

                  value={
                    Array.isArray(initialValues?.located_on_floor)
                      ? initialValues.located_on_floor?.map((item) =>
                        situatedOnWingData?.find((option) => option.value === item),
                      )
                      : []
                  }

                  onChange={(selectedOption) => {
                    const selectedValue = selectedOption ? selectedOption.value : null;
                    setInitialValues(prevValues => ({
                      ...prevValues,
                      located_on_floor: selectedValue ? [selectedValue] : [],
                    }));
                  }}
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>No. of Unit/ Flat are available on visited floor</CFormLabel>
                <AppFormSelect
                  custom
                  name="other_flats_on_visited_floor"
                  value={initialValues.other_flats_on_visited_floor}
                  onChange={handleOnChange}
                >
                  {[...Array(Number(20) + 1).keys()].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </AppFormSelect>
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CRow>
                  <CCol md={8}>
                    <CFormLabel>Built-Up Dimension</CFormLabel>
                    <CRow className="w-100 m-0">
                      <CCol md={6} className="pe-0 ps-0 ">
                        <CFormInput
                          type="number"
                          name="length"
                          placeholder="Enter Length"
                          className="mb-sm-0 mb-2"
                          value={initialValues?.builup_with_dimention?.length}
                          onChange={(e) => {
                            const length = parseInt(e.target.value)
                            const width = parseInt(initialValues.builup_with_dimention?.width)
                            setInitialValues({
                              ...initialValues,
                              builup_with_dimention: {
                                ...initialValues.builup_with_dimention,
                                length,
                              },
                            })
                          }}
                          autoComplete="off"
                        />
                      </CCol>

                      <CCol md={6} className="ps-0  pe-0 ps-md-2">
                        <CFormInput
                          type="number"
                          name="width"
                          placeholder="Enter Width"
                          className="mb-3"
                          value={initialValues?.builup_with_dimention?.width}
                          onChange={(e) => {
                            const width = parseInt(e.target.value)
                            const length = parseInt(initialValues.builup_with_dimention?.length)
                            setInitialValues({
                              ...initialValues,
                              builup_with_dimention: {
                                ...initialValues.builup_with_dimention,
                                width,
                              },
                            })
                          }}
                          autoComplete="off"
                        />
                      </CCol>
                    </CRow>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Built-up Area (IN Sqft)</CFormLabel>
                    <CFormInput
                      type="number"
                      id="dimension"
                      placeholder="Land Area"
                      value={initialValues.builup_with_dimention?.dimension || ''}
                      onChange={(e) => {
                        const dimension = parseInt(e.target.value)
                        setInitialValues({
                          ...initialValues,
                          builup_with_dimention: {
                            ...initialValues.builup_with_dimention,
                            dimension,
                          },
                        })
                      }}
                      autoComplete="off"
                    />
                  </CCol>
                </CRow>
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Super build up area(In Sqft)</CFormLabel>
                <CFormInput
                  type="text"
                  name="multistory_land_rate"
                  value={initialValues.multistory_land_rate}
                  onChange={handleOnChange}
                  placeholder="Enter here"
                  autoComplete="off"
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Carpet Area (in sqft)</CFormLabel>

                <CFormInput
                  type="text"
                  value={initialValues.carpet_rate}
                  name="carpet_rate"
                  onChange={handleOnChange}
                  placeholder="Carpet area"
                  autoComplete="off"
                />
              </div>
            </CCol>

            {/* <CCol md={6}>
              <div className="py-2">
                <CRow>
                  <CCol md={8}>
                    <CFormLabel>Super Built-Up Dimension</CFormLabel>
                    <CRow className="w-100 m-0">
                      <CCol md={6} className="pe-0 ps-0">
                        <CFormInput
                          type="number"
                          id="length"
                          placeholder="Enter Length"
                          className="mb-sm-0 mb-2"
                          value={initialValues?.super_builup_with_dimention?.length}
                          onChange={(e) =>
                            setInitialValues({
                              ...initialValues,
                              super_builup_with_dimention: {
                                ...initialValues.super_builup_with_dimention,
                                length: parseInt(e.target.value),
                                dimension:
                                  parseInt(e.target.value) *
                                  parseInt(initialValues.super_builup_with_dimention?.width),
                              },
                            })
                          }
                          autoComplete="off"
                        />
                      </CCol>
                      <CCol md={6} className="ps-0 pe-0 ps-md-2">
                        <CFormInput
                          type="number"
                          id="width"
                          placeholder="Enter Width"
                          className="mb-3"
                          value={initialValues?.super_builup_with_dimention?.width}
                          onChange={(e) =>
                            setInitialValues({
                              ...initialValues,
                              super_builup_with_dimention: {
                                ...initialValues.super_builup_with_dimention,
                                width: parseInt(e.target.value),
                                dimension:
                                  (parseInt(e.target.value) || 0) *
                                  parseInt(initialValues.super_builup_with_dimention?.length),
                              },
                            })
                          }
                          autoComplete="off"
                        />
                      </CCol>
                    </CRow>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Land Area (IN Sqft)</CFormLabel>
                    <CFormInput
                      type="number"
                      id="landArea"
                      placeholder="Land Area"
                      value={initialValues.super_builup_with_dimention?.dimension ?? 0}
                      readOnly
                      autoComplete="off"
                    />
                  </CCol>
                </CRow>
              </div>
            </CCol> */}

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>
                  Lift<span className="text-danger ">*</span>
                </CFormLabel>

                <AppFormSelect
                  custom
                  name="lift"
                  value={initialValues.lift}
                  onChange={handleOnChange}
                >
                  <option>Select Lift</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </AppFormSelect>
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Details Of Flat</CFormLabel>
                <CFormInput
                  type="text"
                  name="details_of_flat"
                  value={initialValues.details_of_flat}
                  onChange={handleOnChange}
                  placeholder="Details of flate"
                  autoComplete="off"
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Interior</CFormLabel>
                <AsyncSelect
                  name="interior"
                  isMulti
                  loadOptions={(inputValue, callback) =>
                    loadOptions('cms/categories/search-perent/interior', inputValue, callback)
                  }
                  defaultOptions={interiorsData}
                  getOptionLabel={(option) => option.label}
                  getOptionValue={(option) => option.value}

                  value={
                    Array.isArray(initialValues.interior)
                      ? initialValues.interior.map((item) =>
                        interiorsData.find((option) => option.value === item),
                      )
                      : []
                  }

                  onChange={(selectedOptions) => {
                    const selectedProductIds = selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : []
                    setInitialValues((prevValues) => ({
                      ...prevValues,
                      interior: selectedProductIds,
                    }))
                  }}
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="d-flex mt-lg-3">
                <div className="form-check mt-4 d-flex gapy-2 p-0">
                  <input
                    style={{ height: '20px', width: '20px' }}
                    className="form-check-input"
                    type="checkbox"
                    name="is_under_renovation"
                    checked={initialValues.is_under_renovation === '1'}
                    onChange={handleOnChange}
                  />
                  <label className="form-check-label">Under Renovation</label>
                </div>
              </div>
            </CCol>

            {initialValues.is_property_under_construction === '1' && (
              <CCol md={6}>
                <div className="py-2">
                  <CFormLabel>Under Construction At Site</CFormLabel>
                  <AsyncSelect
                    name="construction_at_side"
                    isMulti // Enable multi-select
                    loadOptions={(inputValue, callback) =>
                      loadOptions(
                        'cms/categories/search-perent/construction_at_site',
                        inputValue,
                        callback,
                      )
                    }
                    defaultOptions={constructionData}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    value={
                      Array.isArray(initialValues.under_construction_at_site)
                        ? initialValues.under_construction_at_site.map((item) =>
                          constructionData.find((option) => option.value === item || item._id),
                        )
                        : []
                    }
                    onChange={(selectedOptions) => {
                      const selectedProductIds = selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : []
                      setInitialValues((prevValues) => ({
                        ...prevValues,
                        under_construction_at_site: selectedProductIds,
                      }))
                    }}
                  />
                </div>
              </CCol>
            )}

            {initialValues.lift === 'yes' && (
              <CCol md={6}>
                <div className="py-2">
                  <CFormLabel>
                    No. of Lifts<span className="text-danger ">*</span>
                  </CFormLabel>

                  <AppFormSelect
                    custom
                    type="number"
                    name="no_of_lifts"
                    value={initialValues.no_of_lifts}
                    onChange={handleOnChange}
                  >
                    {[...Array(11).keys()].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </AppFormSelect>
                </div>
              </CCol>
            )}

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Loading % </CFormLabel>
                <CFormInput
                  type="text"
                  name="loding_in_percentage"
                  value={initialValues?.loding_in_percentage ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Loading % "
                  autoComplete="off"
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>BUA Rate (Per Sqft) </CFormLabel>
                <CFormInput
                  type="text"
                  name="flat_per_sqrt_rate_bua"
                  value={initialValues?.flat_per_sqrt_rate_bua ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Flat per sqft rate on BUA (Built-up Area)"
                  autoComplete="off"
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>SBUA Rate (Per Sqft) </CFormLabel>
                <CFormInput
                  type="text"
                  name="flat_per_sqrt_rate_sbua"
                  value={initialValues?.flat_per_sqrt_rate_sbua ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Flat per sqft rate on SBUA (Super Built-up Area)"
                  autoComplete="off"
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Unit Rate</CFormLabel>
                <CFormInput
                  type="text"
                  name="flat_multistory_building_unit_rate"
                  value={initialValues?.flat_multistory_building_unit_rate ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Unit Rate"
                  autoComplete="off"
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Remark</CFormLabel>
                <CFormTextarea
                  type="text"
                  name="floors_and_dimentions_remarks"
                  value={initialValues?.floors_and_dimentions_remarks ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Remarks Here"
                  rows={4}
                  autoComplete="off"
                />
              </div>
            </CCol>
          </>
        )}

        {initialValues.sub_location_type === 'land and building' && (
          <>
            <CCol md={6}>
              <CFormLabel>Number of Wings Available</CFormLabel>
              <CFormInput
                type="number"
                name="number_of_wings_available"
                className="mb-sm-0 mb-2"
                placeholder="Number of wings availble"
                value={initialValues.number_of_wings_available ?? ''}
                onChange={handleOnChange}
                autoComplete="off"
              />
            </CCol>

            <CCol md={6}>
              <div className="">
                <CFormLabel>
                  Shape Type<span className="text-danger ">*</span>
                </CFormLabel>

                <AppFormSelect
                  custom
                  name="shape_type"
                  className="mb-sm-0 mb-2"
                  value={initialValues.shape_type}
                  onChange={(e) => {
                    handleOnChange(e)
                  }}
                >
                  <option>Select Shape Type</option>
                  <option value="regular shape">Regular Shape</option>
                  <option value="irregular shape">Irregular Shape</option>
                </AppFormSelect>
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CRow>
                  <CCol md={8}>
                    <CFormLabel>Property Dimensions</CFormLabel>

                    <CRow className="w-100 m-0">
                      <CCol md={6} className="px-2 pe-0 ps-0 ">
                        <CFormInput
                          type="number"
                          id="length"
                          placeholder="Enter Length"
                          className="mb-sm-0 mb-2"
                          value={initialValues?.dimension?.length}
                          onChange={(e) =>
                            setInitialValues({
                              ...initialValues,
                              dimension: {
                                ...initialValues.dimension,
                                length: e.target.value,
                              },
                            })
                          }
                          autoComplete="off"
                        />
                      </CCol>

                      <CCol md={6} className="ps-0 ps-md-2 pe-0">
                        <CFormInput
                          type="number"
                          id="width"
                          className="mb-sm-0 mb-2"
                          placeholder="Enter Width"
                          value={initialValues?.dimension?.width}
                          onChange={(e) =>
                            setInitialValues({
                              ...initialValues,
                              dimension: {
                                ...initialValues.dimension,
                                width: e.target.value,
                              },
                            })
                          }
                          autoComplete="off"
                        />
                      </CCol>
                    </CRow>
                  </CCol>

                  <CCol md={4}>
                    <CFormLabel>Land area (in sqft)</CFormLabel>
                    <CFormInput
                      type="number"
                      id="landArea"
                      name="land_area"
                      placeholder="Land Area"
                      value={initialValues.land_area || ''}
                      readOnly={initialValues.shape_type === 'regular shape'}
                      onChange={(e) => {
                        setInitialValues((prev) => ({
                          ...prev,
                          land_area: e.target.value,
                        }))
                      }}
                      autoComplete="off"
                    />
                  </CCol>
                </CRow>
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>
                  No. Of Floors<span className="text-danger ">*</span>
                </CFormLabel>

                <AppFormSelect
                  custom
                  type="number"
                  name="no_of_floors"
                  value={initialValues.no_of_floors}
                  onChange={handleOnChange}
                >
                  {[...Array(21).keys()].map((num) => (
                    <option key={num} value={num}>
                      {num === 0 ? 'Ground' : `G+${num}`}
                    </option>
                  ))}
                </AppFormSelect>
              </div>
            </CCol>

          

            {renderFloorFields()}

            <CCol md={8}>
              <div className="d-lg-flex d-block mt-lg-3 mb-3">
                <div className="form-check mt-4 d-flex gapy-2 p-0">
                  <input
                    style={{ height: '20px', width: '20px' }}
                    className="form-check-input"
                    type="checkbox"
                    name="is_basement"
                    checked={initialValues.is_basement === '1'}
                    onChange={(e) => {
                      const isChecked = e.target.checked ? '1' : '0'
                      setInitialValues((prevValues) => ({
                        ...prevValues,
                        is_basement: isChecked,
                      }))
                    }}
                  />
                  <label className="form-check-label">Basement</label>
                </div>

                <div className="ps-0 ps-lg-4 form-check mt-4 d-flex gapy-2">
                  <input
                    style={{ height: '20px', width: '20px' }}
                    className="form-check-input"
                    type="checkbox"
                    name="is_stilt"
                    checked={initialValues.is_stilt === '1'}
                    onChange={(e) => {
                      const isChecked = e.target.checked ? '1' : '0'
                      setInitialValues((prevValues) => ({
                        ...prevValues,
                        is_stilt: isChecked,
                      }))
                    }}
                  />
                  <label className="form-check-label">Stilt</label>
                </div>

                <div className="ps-0 ps-lg-4 form-check mt-4 d-flex gapy-2">
                  <input
                    style={{ height: '20px', width: '20px' }}
                    className="form-check-input"
                    type="checkbox"
                    name="is_mezzanine"
                    checked={initialValues.is_mezzanine === '1'}
                    onChange={(e) => {
                      const isChecked = e.target.checked ? '1' : '0'
                      setInitialValues((prevValues) => ({
                        ...prevValues,
                        is_mezzanine: isChecked,
                      }))
                    }}
                  />
                  <label className="form-check-label">Mezzanine</label>
                </div>

                <div className="ps-0 ps-lg-4 form-check mt-4 d-flex gapy-2">
                  <input
                    style={{ height: '20px', width: '20px' }}
                    className="form-check-input"
                    type="checkbox"
                    name="is_property_under_construction"
                    checked={initialValues.is_property_under_construction === '1'}
                    onChange={(e) => {
                      const isChecked = e.target.checked ? '1' : '0'
                      setInitialValues((prevValues) => ({
                        ...prevValues,
                        is_property_under_construction: isChecked,
                      }))
                    }}
                  />
                  <label className="form-check-label">Property Under Construction</label>
                </div>
              </div>
            </CCol>

            {initialValues.is_basement === '1' && (
              <CCol md={4}>
                <div className="py-2">
                  <CFormLabel>
                    No. of Basement<span className="text-danger ">*</span>
                  </CFormLabel>

                  <AppFormSelect
                    custom
                    type="number"
                    name="no_of_basement"
                    value={initialValues.no_of_basement}
                    onChange={handleOnChange}
                  >
                    {[...Array(6).keys()].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </AppFormSelect>
                </div>
              </CCol>
            )}

            {renderBasementWiseDetails()}

            {initialValues.is_stilt === '1' && (
              <CCol md={6}>
                <div className="py-2">
                  <CFormLabel>Stilt</CFormLabel>
                  <CFormInput
                    type="text"
                    name="stilt"
                    value={initialValues?.stilt ?? ''}
                    onChange={handleOnChange}
                    placeholder="Enter Stilt"
                    rows={4}
                    autoComplete="off"
                  />
                </div>
              </CCol>
            )}

            {initialValues.is_mezzanine === '1' && (
              <CCol md={6}>
                <div className="py-2">
                  <CFormLabel>Mezzanine</CFormLabel>
                  <CFormInput
                    type="text"
                    name="mezzanine"
                    value={initialValues?.mezzanine ?? ''}
                    onChange={handleOnChange}
                    placeholder="Enter mezzanine"
                    rows={4}
                    autoComplete="off"
                  />
                </div>
              </CCol>
            )}

            {initialValues.is_property_under_construction === '1' && (
              <CCol md={6}>
                <div className="py-2">
                  <CFormLabel>Under Construction At Site</CFormLabel>
                  <AsyncSelect
                    name="construction_at_side"
                    isMulti // Enable multi-select
                    loadOptions={(inputValue, callback) =>
                      loadOptions(
                        'cms/categories/search-perent/construction_at_site',
                        inputValue,
                        callback,
                      )
                    }
                    defaultOptions={constructionData}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    value={
                      Array.isArray(initialValues.under_construction_at_site)
                        ? initialValues.under_construction_at_site.map((item) =>
                          constructionData.find((option) => option.value === item || item._id),
                        )
                        : []
                    }
                    onChange={(selectedOptions) => {
                      const selectedProductIds = selectedOptions
                        ? selectedOptions.map((option) => option.value)
                        : []
                      setInitialValues((prevValues) => ({
                        ...prevValues,
                        under_construction_at_site: selectedProductIds,
                      }))
                    }}
                  />
                </div>
              </CCol>
            )}

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>BUA rate ( As per FE observation)</CFormLabel>

                <CFormInput
                  type="text"
                  value={initialValues.bua_rate}
                  name="bua_rate"
                  onChange={handleOnChange}
                  placeholder="Bua Rate"
                  autoComplete="off"
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Land Rate ( As per FE observation)</CFormLabel>
                <CFormInput
                  type="text"
                  value={initialValues.land_rate}
                  name="land_rate"
                  onChange={handleOnChange}
                  placeholder="Land Rate"
                  autoComplete="off"
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Carpet Area (in sqft)</CFormLabel>

                <CFormInput
                  type="text"
                  value={initialValues.carpet_rate}
                  name="carpet_rate"
                  onChange={handleOnChange}
                  placeholder="Carpet area"
                  autoComplete="off"
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Exteriors</CFormLabel>
                <AsyncSelect
                  loadOptions={(inputValue, callback) =>
                    loadOptions('cms/categories/search-perent/exteriors', inputValue, callback)
                  }
                  defaultOptions={exteriorsData}
                  placeholder="Select"
                  name="exteriors"
                  value={
                    Array.isArray(initialValues.exteriors)
                      ? initialValues.exteriors.map((item) =>
                        exteriorsData.find((option) => option.value === item || item._id),
                      )
                      : []
                  }
                  onChange={(selectedOptions) => {
                    const selectedProductIds = selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : []
                    setInitialValues((prevValues) => ({
                      ...prevValues,
                      exteriors: selectedProductIds,
                    }))
                  }}
                  isClearable
                  isMulti
                />
              </div>
            </CCol>

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>
                  Lift<span className="text-danger ">*</span>
                </CFormLabel>

                <AppFormSelect
                  custom
                  name="lift"
                  value={initialValues.lift}
                  onChange={handleOnChange}
                >
                  <option>Select Lift</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </AppFormSelect>
              </div>
            </CCol>

            {initialValues.lift === 'yes' && (
              <CCol md={6}>
                <div className="py-2">
                  <CFormLabel>
                    No. of Lifts<span className="text-danger ">*</span>
                  </CFormLabel>

                  <AppFormSelect
                    custom
                    type="number"
                    name="no_of_lifts"
                    value={initialValues.no_of_lifts}
                    onChange={handleOnChange}
                  >
                    {[...Array(11).keys()].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </AppFormSelect>
                </div>
              </CCol>
            )}

            <CCol md={6}>
              <div className="py-2">
                <CFormLabel>Remark</CFormLabel>
                <CFormTextarea
                  type="text"
                  name="floors_and_dimentions_remarks"
                  value={initialValues?.floors_and_dimentions_remarks ?? ''}
                  onChange={handleOnChange}
                  placeholder="Enter Remarks Here"
                  rows={4}
                  autoComplete="off"
                />
              </div>
            </CCol>
          </>
        )}

        <div className="text-center mt-4">
          {isPrevNextButton && loggedinUserRole.name === process.env.REACT_APP_FE && (
            <>
              {currentStep > 1 && currentStep !== totalSteps && (
                <CButton
                  className="btn btn-success letter-limit me-2 mt-2 mFt-2 next w-20 w-sm-auto px-5 submit_btn"
                  type="button"
                  onClick={handlePreviousStep}
                >
                  Prev
                </CButton>
              )}
              {currentStep < totalSteps - 1 && (
                <CButton
                  className="btn-success text-white btn me-2 mx-3 w-lg-17 w-sm-auto"
                  onClick={handleNextStep}
                >
                  Next
                </CButton>
              )}
            </>
          )}

          <CButton
            className="text-white btn-warning me-2  w-sm-auto w-lg-17 previous mx-3  my-4 "
            type="button"
            onClick={async () => {
              await handleSubmit()
              if (loggedinUserRole.name !== process.env.REACT_APP_FE) {
                navigate(`/case/${id}/update/show-details/by/${loggedinUserRole.name}`, {
                  state: { firstStepVisible: false, formStep: 1 },
                })
              }
            }}
          >
            Save
          </CButton>
          {loggedinUserRole.name !== process.env.REACT_APP_FE && (
            <CButton
              className="text-white btn-danger letter-limit me-2 w-sm-auto w-lg-17 previous mx-3  my-4 "
              type="button"
              onClick={() =>
                navigate(`/case/${id}/update/show-details/by/${loggedinUserRole.name}`, {
                  state: { firstStepVisible: false, formStep: 1 },
                })
              }
            >
              Cancel
            </CButton>
          )}
        </div>
      </CRow>
    </CForm>
  )
}

export default FLoorsAndDiamentions
