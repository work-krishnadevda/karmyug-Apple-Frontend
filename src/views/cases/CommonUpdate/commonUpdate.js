import { useEffect, useState, useRef } from 'react'
import {
  cilChevronCircleDownAlt,
  cilChevronCircleUpAlt,
  cilCloudDownload,
  cilLocationPin,
  cilPencil,
  cilShieldAlt,
  cilSpreadsheet,
  cilTrash,
  cilUser,
} from '@coreui/icons'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CSpinner,
  CTabContent,
  CTabPane,
} from '@coreui/react'

import { useDispatch, useSelector } from 'react-redux'
import MainDetailsCase from 'src/components/custom/department/roles/sdm/MainDetailsCase'
import PersonalInfoSDM from 'src/components/custom/department/roles/sdm/PersonalInfoSDM'
import Boundries4 from 'src/components/custom/department/roles/sdm/Boundries4'
import FloorDimensionDetails from 'src/components/custom/department/roles/sdm/FloorDimensionDetails'
import DevelScopeDetails from 'src/components/custom/department/roles/sdm/DevelScopeDetails'
import DistanceDetails from 'src/components/custom/department/roles/sdm/DistanceDetails'
import RateDimesionDetails from 'src/components/custom/department/roles/sdm/RateDimesionDetails'
import { FeSHowFiles } from 'src/components/custom/department/roles/sdm/feShowFIles'
import SDMUploadFiles from 'src/components/custom/department/roles/sdm/SDMUploadFiles'
import { json, Link, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import CommonMultistepForm from 'src/components/custom/department/forms/CommonMultistep/CommonMultistepForm'
import BasicProvider from 'src/constants/BasicProvider'
import { checkRole, FEFormatePDfCreate } from 'src/constants/common'
import { customSuccessMSG, setAlertTimeout } from 'src/helpers/alertHelper'

import CooForm from 'src/components/custom/department/forms/CooForm'
import { useEffectFormData } from 'src/helpers/formHelpers'
import handleSubmitHelper from 'src/helpers/submitHelper'
import CommonCaseDetailsSDM from 'src/components/custom/department/showDetails/commonCaseDetailsSDM'
import DmForm from 'src/components/custom/department/forms/DmForm'
import ShowSdmFiles from 'src/components/custom/department/roles/dm/showSdmFiles'
import ShowDmDetails from 'src/components/custom/department/roles/rc/ShowDmDetails'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faCheck,
  faFileImage,
  faFilePdf,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import CIcon from '@coreui/icons-react'
import AdditionalFields from 'src/components/custom/department/roles/sdm/additionalFields'
import AdditionalFieldsFormSDM from 'src/components/custom/department/roles/sdm/additionalFieldsFormSDM'
import Files from 'src/components/custom/department/roles/dm/Files'
import AsyncSelect from 'react-select/async'
import FE_Note_Comp from 'src/components/custom/department/roles/fe/fe_note'
import FeShowFiles from 'src/components/custom/department/roles/fe/feShowFiles'
import RAShowFiles from 'src/components/custom/department/roles/ra/ra_files'
import SubHeader from 'src/components/custom/SubHeader'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import OthersAttechments from 'src/components/custom/popup/otherAttechments'
import Hold from 'src/components/custom/popup/hold'
import { faPaperclip } from '@fortawesome/free-solid-svg-icons'
import EditFeOldVisit from 'src/components/custom/popup/edit_old_visit_reason'
import ProgressAttachmentsModal from 'src/components/custom/popup/ProgressAttachmentsModal'

import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer'
let RA = process.env.REACT_APP_RA
let FE = process.env.REACT_APP_FE
let COO = process.env.REACT_APP_COO
let SDM = process.env.REACT_APP_SDM
let BM = process.env.REACT_APP_RA
let DM = process.env.REACT_APP_DM
let RC = process.env.REACT_APP_RC
let LCTO = process.env.REACT_APP_LCTO
let CTO = process.env.REACT_APP_CTO
let SFO = process.env.REACT_APP_SFO
let ADMIN = process.env.REACT_APP_ADMIN

const progressButtonRoles = [ADMIN, RA, SFO, COO, DM, RC, LCTO, CTO]

const validationRules = {}

import { io } from 'socket.io-client'
import { holdStatuses } from 'src/constants/variables'
import jsPDF from 'jspdf'
import { SendBackConformModal } from 'src/helpers/sendBackConform'
import { toast } from 'react-toastify'

const URL = process.env.REACT_APP_NODE_URL

var subHeaderItems = [
  {
    name: 'All Cases',
    link: '/case/all',
    icon: cilSpreadsheet,
  },
  {
    name: 'Create Case',
    link: '/case/create',
    icon: cilPencil,
  },
  {
    name: 'Trash Cases',
    link: '/case/trash',
    icon: cilTrash,
  },
]

const commonUpdate = () => {
  var dispatch = useDispatch()
  var { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const isEditMode = !!id

  let loggedinUserRole = useSelector((state) => state?.userRole)
  const showProgressButton = progressButtonRoles.includes(loggedinUserRole?.name)

  const fileInputRef = useRef(null)

  const [showCaseData, setShowCaseData] = useState({})

  const [formStep, setFormStep] = useState()
  const [activeTab, setActiveTab] = useState(1)

  const [editorLoaded, setEditorLoaded] = useState(false)

  const [additionalFields, setAdditionalFields] = useState([])

  const [additionalJson, setAdditionalJson] = useState({})

  const [beforSubmitError, setBeforSubmitError] = useState('')

  const [defaultOptionsAdmins, setDefaultOptionsAdmins] = useState([])

  const [selectedRole, setSelectedRole] = useState(null)

  const [isSubmittedBank, setIsSubmittedBank] = useState(false)

  const [showOthersAttechments, setShowOthersAttechments] = useState(false)

  const [visibleHoldModel, setVisibleHoldModel] = useState(false)
  const [sendBackConform, setSendBackConform] = useState(false)

  const [holdStatus, setHoldStatus] = useState('')
  const [holdCall, setHoldCall] = useState('')

  const [visibleMapModel, setVisibleMapModel] = useState(false)

  const [visibleFeVisitReason, setVisibleFeVisitReason] = useState(false)

  const [showVisibleFeVisitReason, setshowVisibleFeVisitReason] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)

  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const socketRef = useRef(null)

  let loggedinUser = useSelector((state) => state.userData)

  const [toggleForms, setToggleForms] = useState({
    cooForm: false,
    toggleFePersonalInfo: false,
    toogleFeBoundries: false,
    toogleFeFloorAndDim: false,
    toggleFeDevAndScope: false,
    toggleFedistanceFrom: false,
    toggleFeRateAndLatlong: false,
    toggleDMForm: false,
    toggleAdditionalFieldsForm: false,
    toggleFeNote: false,
  })

  useEffect(() => {
    if (state) {
      const toggleFormsUpdates = {
        cooForm: state.isCOOVisible,
        toggleFePersonalInfo: state.firstStepVisible,
        toogleFeBoundries: state.secondStepVisible,
        toogleFeFloorAndDim: state.thirdStepVisible,
        toggleFeDevAndScope: state.fourthStepVisible,
        toggleFedistanceFrom: state.fifthStepVisible,
        toggleFeRateAndLatlong: state.sixthStepVisible,
        toggleDMForm: state.toggleDMForm,
        toggleAdditionalFieldsForm: state.additionalFieldsFormVisible,
        toggleFeNote: state.toggleFeNote,
      }

      setToggleForms((prev) => ({ ...prev, ...toggleFormsUpdates }))
      setFormStep(state?.formStep)
    }
  }, [state])

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

  const [initialValues, setInitialValues] = useState({
    //-----------------------COO----------------------------//

    cin_number: '',
    serial_number: '',
    date_initiation_bank: new Date(),
    date_initiation_RA: new Date(),
    finance_name_perent: '',
    finance_name: '',
    applicant_name: '',
    los_number: '',
    contact_number_1: '',
    contact_number_2: '',
    contact_number_3: '',
    case_type: '',
    product_name: '',
    product_type: '',
    address: '',
    location: '',
    case_of_branch: '',
    ra_branch: '',
    latitude: '',
    longitude: '',
    remark: '',
    group: '',
    to_engineer: '0',
    engineers: [],
    status: '',
    remark:'',

    //------------------------------FE----------------------//

    // STEP 1 Personal-Info
    person_meet_at_site_name: '',
    person_meet_at_site_relation: '',
    person_meet_at_site_mobile: '',

    type_of_property: '',

    current_use_property: '',
    address_verification: '',
    house_plot_no: '',
    ward_no: '',
    village_colony: '',
    city: '',
    teh: '',
    dist: '',
    pin: '',
    landmark: '',
    occupant: '',
    self_occupied: '',
    vacant_month: '',
    tenure: '',
    tenant_details: [],
    same_address: '',
    full_common_address: '',
    house_builing_name: '',
    wing_block_name: '',
    street_name: '',
    state: '',

    // tenant_name: '',
    // exp_rent: '',
    // tenant_relation: '',
    // tenant_date: '',

    // STEP 2 4_Boundries

    location_class: '',
    proximity: '',
    east: '',
    west: '',
    north: '',
    south: '',
    not_match_reason: '',

    // STEP 3 Floors and Dimentions

    location_type: '',
    sub_location_type: '',

    no_of_wing_or_building: 0,
    located_on_floor: [],
    no_of_floors: 0,
    lift: '',
    no_of_lifts: 0,
    floor_wise_details: [],
    is_basement: '',
    no_of_basement: 0,
    basement_wise_details: [],
    is_stilt: '',
    is_mezzanine: '',
    is_property_under_construction: '',
    stilt: '',
    mezzanine: '',
    is_under_renovation: '',
    construction_stage: '',
    construction_at_site: [],
    under_construction_at_site: [],
    floors_and_dimentions_remarks: '',

    dimension: {
      length: '',
      width: '',
    },

    // buit_up: {
    //   length: '',
    //   width: '',
    // },

    land_area: '',
    bua: '',
    shape_type: '',
    land_rate: '',
    bua_rate: '',
    exteriors: [],

    // Multistory/building

    no_of_wing_or_building: 0,

    flat_situated_on_wing: 0,
    multistory_no_of_floors: 0,
    located_on_floor: [],
    other_flats_on_visited_floor: 0,

    builup_with_dimention: {
      length: null,
      width: null,
      dimension: 0,
    },

    super_builup_with_dimention: {
      length: null,
      width: null,
      dimension: 0,
    },

    multistory_land_rate: '',

    loding_in_percentage: '',
    flat_per_sqrt_rate_bua: '',
    flat_per_sqrt_rate_sbua: '',
    flat_multistory_building_unit_rate: '',
    details_of_flat: '',
    interior: [],

    number_of_wings_available: '',
    name_of_wing: '',
    carpet_rate: '',

    // STEP 4 Development and scope

    positive_point: [],
    negative_point: [],
    additional_amenities_like: [],
    // interiors: [],

    road_type: '',
    community_dominated: '',
    community_dominated_details: '',

    age_of_property: '',
    life_of_property: '',
    development_of_area: '',
    habitation: '',
    property_mortaged: '',
    mortaged_month_year: '',
    mortaged_bank_name: '',

    // STEP 5 Distance from

    wall_to_wall_road_width: '',
    road_center_to_wall_width: '',
    highway_name_and_no_dist: '',
    bus_stand_km: '',
    city_centre_km: '',
    railway_station_km: '',
    hospital_km: '',
    any_govt_office: '',
    other: '',

    // STEP 6 rate and Lat long

    market_rate: '',
    rental_rate: '',
    verified_thru_name: '',
    verified_thru_contact: '',
    rate_and_lat_long_remarks: '',
    latitude_by_fe: '',
    longitude_by_fe: '',

    required_photos_check: {
      selfie: false,
      e_bill: false,
      map: false,
      applicant_selfie: false,
      property_selfie: false,
    },

    // FOr assigning to other department

    dm: '',
    rc: '',
    lcto: '',
    cto: '',

    // For DM Fields
    dm_fields: '',
    dm_remarks: '',

    // for adding addtional fileds
    additional_fields: [],
    fe_images_data: [],
    calculation_Json: '',
    dm_images_data: '',
    concern_resolution: '',
    final_address: '',
    isBulkUpload: false,

    submit_type: '',

    dm_attechment: '',
    rc_attechment: '',
    lcto_attechment: '',
    cto_attechment: '',

    case_revise: '0',
  })

  const [showMessage, setshowMessage] = useState(false)
  const [caseId, setCaseId] = useState(null)

  const [mapModelCount, setMapModelCount] = useState(false)
  const [isMapModelShown, setIsMapModelShown] = useState(false)

  function DMvalidateAtLeastOneFilled(obj) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== '') {
        return true
      }
    }
    return false
  }

  const handleSubmit = async (e) => {
    e && e.preventDefault()

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)

      if (data === false) return

      if (loggedinUserRole.name === process.env.REACT_APP_DM) {
      }

      var response
      if (isEditMode) {
        response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)
      } else {
        response = await new BasicProvider(`cases/create`, dispatch).postRequest(data)
        navigate(`/case/${response.data._id}/edit`)
      }
      if (response) {
        setCaseId(response?.data?._id)
        setshowMessage(true)
      }

      setAlertTimeout(dispatch)
    } catch (error) {
      console.log(error)
      // dispatch({ type: 'set', catcherror: error.data })
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  useEffect(() => {
    setInitialValues({
      //-----------------------COO----------------------------//
      cin_number: '',
      serial_number: '',
      date_initiation_bank: new Date(),
      date_initiation_RA: new Date(),
      finance_name_perent: '',
      finance_name: '',
      applicant_name: '',
      los_number: '',
      contact_number_1: '',
      contact_number_2: '',
      contact_number_3: '',
      case_type: '',
      product_name: '',
      product_type: '',
      address: '',
      location: '',
      case_of_branch: '',
      ra_branch: '',
      latitude: '',
      longitude: '',
      remark: '',
      group: '',
      to_engineer: '0',
      engineers: [],
      status: '',
      remark:'',

      //------------------------------FE----------------------//

      // STEP 1 Personal-Info
      person_meet_at_site_name: '',
      person_meet_at_site_relation: '',
      person_meet_at_site_mobile: '',

      type_of_property: '',

      current_use_property: '',
      address_verification: '',
      house_plot_no: '',
      ward_no: '',
      village_colony: '',
      city: '',
      teh: '',
      dist: '',
      pin: '',
      landmark: '',
      occupant: '',
      self_occupied: '',
      vacant_month: '',
      tenant_name: '',
      tenure: '',
      exp_rent: '',
      tenant_relation: '',
      tenant_date: '',
      tenant_details: [],

      // STEP 2 4_Boundries

      location_class: '',
      proximity: '',
      east: '',
      west: '',
      north: '',
      south: '',
      not_match_reason: '',

      // STEP 3 Floors and Dimentions

      location_type: '',
      sub_location_type: '',
      no_of_wing_or_building: 0,
      located_on_floor: 0,
      no_of_floors: 0,
      lift: '',
      no_of_lifts: 0,
      floor_wise_details: [],
      is_basement_or_other: '',
      com_basement_other: {
        built_up: '',
        violation: '',
        unit_rate: '',
      },
      is_basement: '',
      no_of_basement: 0,
      basement_wise_details: [],
      is_stilt: '',
      is_mezzanine: '',
      stilt: '',
      mezzanine: '',
      construction_stage: '',
      construction_at_site: [],
      floors_and_dimentions_remarks: '',
      dimension: {
        length: '',
        width: '',
      },
      buit_up: {
        length: '',
        width: '',
      },
      land_area: null,
      bua: null,
      shape_type: '',
      land_rate: '',
      bua_rate: '',
      exteriors: [],

      // Multistory/building

      no_of_wing_or_building: 0,
      flat_situated_on_wing: 0,
      multistory_no_of_floors: 0,
      located_on_floor: 0,
      other_flats_on_visited_floor: 0,

      builup_with_dimention: {
        length: null,
        width: null,
        dimension: 0,
      },

      super_builup_with_dimention: {
        length: null,
        width: null,
        dimension: 0,
      },

      loding_in_percentage: '',
      flat_per_sqrt_rate_bua: '',
      flat_per_sqrt_rate_sbua: '',
      flat_multistory_building_unit_rate: '',
      details_of_flat: '',
      interior: [],

      // STEP 4 Development and scope

      positive_point: [],
      negative_point: [],
      additional_amenities_like: [],
      // interiors: [],

      road_type: '',
      community_dominated: '',
      community_dominated_details: '',

      age_of_property: '',
      life_of_property: '',
      development_of_area: '',
      habitation: '',
      property_mortaged: '',
      mortaged_month_year: '',
      mortaged_bank_name: '',

      // STEP 5 Distance from

      wall_to_wall_road_width: '',
      highway_name_and_no_dist: '',
      bus_stand_km: '',
      city_centre_km: '',
      railway_station_km: '',
      hospital_km: '',
      any_govt_office: '',
      other: '',

      // STEP 6 rate and Lat long

      market_rate: '',
      rental_rate: '',
      verified_thru_name: '',
      verified_thru_contact: '',
      rate_and_lat_long_remarks: '',
      latitude_by_fe: '',
      longitude_by_fe: '',

      required_photos_check: {
        selfie: false,
        e_bill: false,
        map: false,
        applicant_selfie: false,
        property_selfie: false,
      },

      // FOr assigning to other department

      dm: '',
      rc: '',
      lcto: '',
      cto: '',

      // For DM Fields

      dm_fields: '',
      dm_remarks: '',

      // for adding addtional fileds
      additional_fields: '',

      fe_images_data: [],

      submitted_to_bank: '0',
      case_revise: '0',
    })

    fetchData()
  }, [navigate, id, state])

  const fetchData = async () => {
    try {
      const data = await useEffectFormData(`cases/show/${id}`, initialValues, isEditMode, 'coo')

      const engineersId = data.engineers.map((eng) => eng._id)
      const exteriorsId = data?.exteriors.map((ext) => ext._id)
      const positivePoinsId = data?.positive_point.map((ps) => ps._id)
      const negativePointsId = data?.negative_point.map((ng) => ng._id)
      const additionalAmenities = data?.additional_amenities_like.map((ad) => ad._id)
      const multistoryNoFloorsData = data?.multistory_no_of_floors.map((ad) => ad._id)
      const interiorsData = data?.interior.map((ad) => ad._id)
      const constructionAtSite = data?.construction_at_site.map((ad) => ad._id)
      const underConstructionAtSite = data?.under_construction_at_site.map((ad) => ad._id)
      const locatedOnFloor = data?.located_on_floor.map((ad) => ad._id)

      if (isEditMode) {
        setInitialValues({
          ...data,
          concern_resolution: data.concern_resolution.message,
          ra_branch: data.ra_branch,
          finance_name: data.finance_name,
          group: data.group._id,
          engineers: engineersId,
          dm_fields: data.dm_fields,
          exteriors: exteriorsId,
          positive_point: positivePoinsId,
          negative_point: negativePointsId,
          additional_amenities_like: additionalAmenities,
          tenant_details: data.tenant_details,
          multistory_no_of_floors: multistoryNoFloorsData,
          interior: interiorsData,
          construction_at_site: constructionAtSite,
          under_construction_at_site: underConstructionAtSite,
          located_on_floor: locatedOnFloor,
        })
        if (data.dm_remarks) {
          setEditorLoaded(true)
        }
      }
    } catch (error) {
      dispatch({ type: 'set', catcherror: error.data })
    }
  }

  const attachmentFields = ['dm_attechment', 'rc_attechment', 'lcto_attechment', 'cto_attechment']
  const availableAttachments = attachmentFields
    .filter((key) => showCaseData[key])
    .map((key) => showCaseData[key])

  useEffect(() => {
    fetchSHowCaseData()
    setCaseId(id)
  }, [navigate, id, state, visibleMapModel])

  let fetchSHowCaseData = async () => {
    try {
      const data = await new BasicProvider(`cases/show/${id}`, dispatch).getRequest()
      if (data) {
        setShowCaseData(data?.data)
      }
    } catch (error) {
      dispatch({ type: 'set', catcherror: error.data })
    }
  }

  useEffect(() => {
    if (initialValues.finance_name) {
      fetchFinanceData()
    }
  }, [initialValues.finance_name])

  const fetchFinanceData = async () => {
    try {
      let response = await new BasicProvider(
        `banks/show/${initialValues.finance_name._id || initialValues.finance_name}`,
        dispatch,
      ).getRequest()

      console.log('addistion al detila of bank show ', response)

      if (response.data.additional_keys) {
        setAdditionalFields(response.data.additional_keys)
      }
    } catch (error) {}
  }

  useEffect(() => {
    fetchSingleCaseData()
  }, [id])

  const fetchSingleCaseData = async () => {
    try {
      const response = await new BasicProvider(`cases/show/${id}`).getRequest()
      if (response) {
        setAdditionalJson(response?.data?.additional_fields)
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  const updatedFinance = (initialValues?.finance_name?.fields || []).map((item) => {
    // console.log('title',item.title);
    let updatedItem = { ...item }
    const matchedData = Object.entries(initialValues).find(([key, value]) => item.title === key)

    // console.log('matchedData',Object.entries(initialValues).find(([key, value]) => key));

    // Helper function to format dates
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
    } else if (initialValues.calculation_Json) {
      const calcField = initialValues.calculation_Json[item.title]
      // console.log('calcField', calcField);
      if (calcField !== undefined && calcField !== null && calcField !== '') {
        updatedItem.value = calcField
      }
    }

    if (initialValues.additional_fields && Array.isArray(initialValues.additional_fields)) {
      const additionalField = initialValues.additional_fields.find((field) => {
        return field?.role?.toLowerCase() === item?.role?.toLowerCase()
      })

      // console.log('additionalField',additionalField);

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
          // console.log('ANS' ,additionalField);
          updatedItem.value = additionalField[item.title]
        }
      }
    }

    // console.log('updatedItem',updatedItem);

    if (updatedItem.value === undefined) {
      updatedItem.value = ''
    }
    return updatedItem
  })

  const downloadPdf = async (pdfUrl, applicantName, fiName) => {
    if (pdfUrl) {
      let repoName = `${applicantName}-${fiName}`

      try {
        const response = await fetch(pdfUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${repoName}.pdf` ?? 'case-report.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (error) {
        console.error('Error downloading PDF:', error)
      }
    }
  }

  const generateReport = async () => {
    if (showCaseData && showCaseData?.finance_name) {
      let fullUrl = `${process.env.REACT_APP_NODE_URL}/${showCaseData?.finance_name?.featured_image?.filepath}`
      let json = {
        pdf_url: fullUrl,
        data: [],
        images: initialValues.fe_images_data,
        images_2: initialValues.dm_images_data,
        page: showCaseData?.finance_name?.images_page_no,
        addon_data: showCaseData.case_addons,
        header_image: `${process.env.REACT_APP_NODE_URL}/${showCaseData?.ra_branch?.featured_image?.filepath}`,
      }

      // console.log('JSONNNNNN', json)

      try {
        let response = await new BasicProvider('cases/genrate/report', dispatch).postRequest(json)
        if (response) {
          // console.log('LOLOLO', response.data.file_url)
          //192.168.1.117:8008/files/tmpnnntpclq.pdf
          downloadPdf(
            response.data.file_url,
            showCaseData?.applicant_name,
            showCaseData?.finance_name?.name,
          )
        }
      } catch (error) {}
    }
  }

  const reviewReport = async () => {
    if (showCaseData && showCaseData?.finance_name) {
      let fullUrl = `${process.env.REACT_APP_NODE_URL}/${showCaseData?.finance_name?.featured_image?.filepath}`
      let json = {
        pdf_url: fullUrl,
        data: [],
        images: initialValues.fe_images_data,
        images_2: initialValues.dm_images_data,
        page: showCaseData?.finance_name?.images_page_no,
        addon_data: showCaseData.case_addons,
        header_image:
          `${process.env.REACT_APP_NODE_URL}/${showCaseData?.ra_branch?.featured_image?.filepath}` ??
          '',
      }

      // console.log('JSONNNNNN', json)

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

  const [slugs, setSlugs] = useState([])

  useEffect(() => {
    fetchDefaultOptionForRC()
  }, [slugs])

  useEffect(() => {
    if (loggedinUserRole.name === process.env.REACT_APP_RC) {
      setSlugs([process.env.REACT_APP_LCTO, process.env.REACT_APP_CTO])
    } else if (loggedinUserRole.name === process.env.REACT_APP_LCTO) {
      setSlugs([process.env.REACT_APP_CTO])
    }
  }, [loggedinUserRole, showCaseData, initialValues])

  const extractRoleName = (roleValue) => {
    if (!roleValue) return ''
    if (Array.isArray(roleValue)) return roleValue[0]?.name || ''
    if (typeof roleValue === 'object') return roleValue?.name || ''
    if (typeof roleValue === 'string') return roleValue
    return ''
  }

  const fetchDefaultOptionForRC = async () => {
    const queryString = slugs.join(',')
    const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&page=1&count=500`
    try {
      const response = await new BasicProvider(url).getRequest()

      const options = [
        { label: 'Submit to Bank', value: 'submit to bank', role: 'bank-role' },
        ...response.data.map((item) => ({
          label: item.name,
          value: item._id,
          role: extractRoleName(item.role),
        })),
      ]
      setDefaultOptionsAdmins(options)
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
        role: extractRoleName(item.role),
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
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

  const getSelectedValue = (role) => {
    const matchedKey = Object.keys(slugsObj).find((key) => slugsObj[key] === role)
    return matchedKey ? initialValues[matchedKey] : null
  }

  const formatSubmitToOption = (option, { context }) => {
    const roleLabel = option?.role && option.role !== 'bank-role' ? option.role : null

    if (context === 'menu') {
      return (
        <div>
          <div>{option?.label}</div>
          {roleLabel && <small className="text-muted d-block">{roleLabel}</small>}
        </div>
      )
    }

    return (
      <div>
        <div>{option?.label}</div>
        {roleLabel && <small className="text-muted d-block">{roleLabel}</small>}
      </div>
    )
  }

  const handleAssign = async () => {
    try {
      setIsLoadingSpinner(true)

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
        setIsLoadingSpinner(false)
        setIsMapModelShown(true)

        return
      }

      if (!isMapModelShown) {
        setVisibleMapModel(true)
        setIsLoadingSpinner(false)
        setIsMapModelShown(true)

        return
      }

      // if (!showCaseData.map_data && initialValues.status == 'submitted to bank') {
      //   setVisibleMapModel(true)
      //   setIsLoadingSpinner(false)
      //   setIsMapModelShown(true)
      //   return
      // }

      // if (
      //   showCaseData.map_data &&
      //   Object.keys(showCaseData.map_data).length > 0
      //   && !isMapModelShown &&
      //   initialValues.status == 'submitted to bank'
      // ) {
      //   setVisibleMapModel(true)
      //   setIsMapModelShown(true)
      //   setIsLoadingSpinner(false)
      //   return
      // }

      if (!initialValues.final_address && initialValues.status == 'submitted to bank') {
        dispatch({ type: 'set', validations: ['Please Fill Final Address.'] })
        setIsLoadingSpinner(false)

        return
      }

      if (!selectedRole) {
        dispatch({ type: 'set', validations: ['Please Select Submit to.'] })
        setIsLoadingSpinner(false)

        return
      }

      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      var response

      if (isEditMode) {
        response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)
        if (response) navigate('/case/all')
        setIsLoadingSpinner(false)
      }

      setAlertTimeout(dispatch)
    } catch (error) {
      setIsLoadingSpinner(false)
      console.log(error)
      dispatch({ type: 'set', validations: [error.data] })
    } finally {
      setIsLoadingSpinner(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsLoadingSpinner(true)

      let formValues = { ...initialValues }

      delete formValues.status

      const data = await handleSubmitHelper(formValues, validationRules, dispatch)
      if (data === false) return

      var response
      if (isEditMode) {
        response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)
        setIsLoadingSpinner(false)
        fetchData()
      }

      customSuccessMSG(dispatch, 'Saved Successfully')
    } catch (error) {
      setIsLoadingSpinner(false)
      console.log(error)
      dispatch({ type: 'set', validations: [error.data] })
    } finally {
      setIsLoadingSpinner(false)
    }
  }

  let handleHold = () => {
    setCaseId(showCaseData._id)

    const statusObj = {
      rc: 'hold by rc',
      lcto: 'hold by lcto',
      cto: 'hold by cto',
    }

    const slugsObj = {
      rc: process.env.REACT_APP_RC,
      lcto: process.env.REACT_APP_LCTO,
      cto: process.env.REACT_APP_CTO,
    }

    const matchingSlug = Object.entries(slugsObj).find(
      ([key, value]) => value === loggedinUserRole.name,
    )

    setHoldStatus(statusObj[matchingSlug[0]])
    setHoldCall(`${matchingSlug[0]} call`)

    setVisibleHoldModel(!visibleHoldModel)
  }

  useEffect(() => {
    if (showCaseData.status === 'submitted to bank') {
      setIsSubmittedBank(true)
    }
  }, [showCaseData])

  return (
    <>
      {isLoadingSpinner && (
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

      {loggedinUserRole.name === process.env.REACT_APP_COO ||
      loggedinUserRole.name === process.env.REACT_APP_ADMIN ? (
        <SubHeader subHeaderItems={subHeaderItems} idBuklBtn={true} />
      ) : (
        <SingleSubHeader moduleName={'Case Details'} />
      )}
      <CContainer fluid className="mb-4">
        {loggedinUserRole.name !== SDM &&
          loggedinUserRole.name !== RA &&
          loggedinUserRole.name !== SFO && (
            <>
              <CRow className="align-items-center ">
                <CCol
                  md={
                    loggedinUserRole.name === DM ||
                    loggedinUserRole.name === RC ||
                    loggedinUserRole.name === LCTO ||
                    loggedinUserRole.name === CTO
                      ? 10
                      : 12
                  }
                  className="px-2"
                >
                  <CCard className=" py-2 pb-2 px-2 dm_tabs_list">
                    <CNav
                      variant="pills"
                      role="tablist"
                      className={` justify-content-between ${loggedinUserRole.name}`}
                    >
                      <CNavItem role="right-swipe">
                        <CNavLink
                          active={activeTab === 1}
                          component="button"
                          role="tab"
                          aria-controls="home-tab-pane"
                          aria-selected={activeTab === 1}
                          // className=""
                          onClick={() => {
                            setActiveTab(1)
                            fetchSHowCaseData()
                          }}
                          className={`${activeTab === 1 ? 'requested text-white' : ''}`}
                        >
                          <div className="d-flex white gold_heart align-items-center justify-content-center">
                            <h6 className="mb-0 like-text sizeW">
                              <CIcon icon={cilUser} /> COO
                            </h6>
                          </div>
                        </CNavLink>
                      </CNavItem>

                      <CNavItem role="left-swipe">
                        <CNavLink
                          active={activeTab === 2}
                          component="button"
                          role="tab"
                          aria-controls="profile-tab-pane"
                          aria-selected={activeTab === 2}
                          onClick={() => {
                            setActiveTab(2)
                            fetchSHowCaseData()
                          }}
                          className={`${activeTab === 2 ? 'received text-white' : ''}`}
                        >
                          <div className="d-flex white gold_heart align-items-center justify-content-center">
                            <h6 className="mb-0  like-text sizeW">
                              <CIcon icon={cilLocationPin} /> FE
                            </h6>
                          </div>
                        </CNavLink>
                      </CNavItem>

                      {loggedinUserRole.name === DM && (
                        <CNavItem role="matches">
                          <CNavLink
                            active={activeTab === 4}
                            component="button"
                            role="tab"
                            aria-controls="profile-tab-pane"
                            aria-selected={activeTab === 4}
                            onClick={() => {
                              setActiveTab(4)
                              fetchSHowCaseData()
                            }}
                            className={`${activeTab === 4 ? 'accepted text-white' : ''}`}
                          >
                            <div className="d-flex white gold_heart align-items-center justify-content-center">
                              <h6 className="mb-0  like-text sizeW">
                                <CIcon icon={cilShieldAlt} /> DM
                              </h6>
                            </div>
                          </CNavLink>
                        </CNavItem>
                      )}

                      {loggedinUserRole.name === RC && (
                        <CNavItem role="matches">
                          <CNavLink
                            active={activeTab === 5}
                            component="button"
                            role="tab"
                            aria-controls="profile-tab-pane"
                            aria-selected={activeTab === 5}
                            onClick={() => {
                              setActiveTab(5)
                              fetchSHowCaseData()
                            }}
                            className={`${activeTab === 5 ? 'accepted text-white' : ''}`}
                          >
                            <div className="d-flex white gold_heart align-items-center justify-content-center">
                              <h6 className="mb-0  like-text sizeW">
                                <CIcon icon={cilShieldAlt} /> RC
                              </h6>
                            </div>
                          </CNavLink>
                        </CNavItem>
                      )}
                      {loggedinUserRole.name === LCTO && (
                        <CNavItem role="matches">
                          <CNavLink
                            active={activeTab === 6}
                            component="button"
                            role="tab"
                            aria-controls="profile-tab-pane"
                            aria-selected={activeTab === 6}
                            onClick={() => {
                              setActiveTab(6)
                              fetchSHowCaseData()
                            }}
                            className={`${activeTab === 6 ? 'accepted text-white' : ''}`}
                          >
                            <div className="d-flex white gold_heart align-items-center justify-content-center">
                              <h6 className="mb-0  like-text sizeW">
                                <CIcon icon={cilShieldAlt} /> LCTO
                              </h6>
                            </div>
                          </CNavLink>
                        </CNavItem>
                      )}

                      {loggedinUserRole.name === CTO && (
                        <CNavItem role="matches">
                          <CNavLink
                            active={activeTab === 7}
                            component="button"
                            role="tab"
                            aria-controls="profile-tab-pane"
                            aria-selected={activeTab === 7}
                            onClick={() => {
                              setActiveTab(7)
                              fetchSHowCaseData()
                            }}
                            className={`${activeTab === 7 ? 'accepted text-white' : ''}`}
                          >
                            <div className="d-flex white gold_heart align-items-center justify-content-center">
                              <h6 className="mb-0  like-text sizeW">
                                <CIcon icon={cilShieldAlt} /> CTO
                              </h6>
                            </div>
                          </CNavLink>
                        </CNavItem>
                      )}
                      <CNavItem role="right-swipe">
                        <CNavLink
                          active={activeTab === 8}
                          component="button"
                          role="tab"
                          aria-controls="home-tab-pane"
                          aria-selected={activeTab === 8}
                          // className=""
                          onClick={() => {
                            setActiveTab(8)
                            fetchSHowCaseData()
                          }}
                          className={`${activeTab === 8 ? 'requested text-white' : ''}`}
                        >
                          <div className="d-flex white gold_heart align-items-center justify-content-center">
                            <h6 className="mb-0 like-text sizeW">
                              <CIcon icon={cilUser} />
                              Files
                            </h6>
                          </div>
                        </CNavLink>
                      </CNavItem>
                    </CNav>
                  </CCard>
                </CCol>

                {(loggedinUserRole.name === DM ||
                  loggedinUserRole.name === RC ||
                  loggedinUserRole.name === LCTO ||
                  loggedinUserRole.name === CTO) && (
                  <CCol
                    md={
                      showCaseData &&
                      Object.keys(showCaseData).length > 0 &&
                      typeof showCaseData.fe_images_data === 'object' &&
                      Object.keys(showCaseData.fe_images_data).length > 0 &&
                      Object.keys(showCaseData.fe_images_data).length > 0 &&
                      showCaseData?.additional_fields?.filter((item) => item.role == 'DM').length >
                        0
                        ? 2
                        : 2
                    }
                  >
                    <Link to={`/case/${id}/case-addons`} style={{ textDecoration: 'none' }}>
                      <CCard className=" py-2 pb-2 px-2 text-center submit_btn report_genrate_btn">
                        <div className="mb-1">
                          <FontAwesomeIcon icon={faFileImage} /> Case Addons
                        </div>
                      </CCard>
                    </Link>
                  </CCol>
                )}
              </CRow>
            </>
          )}

        {/* ==========================CASE DETAILS====================== */}
        {(loggedinUserRole.name === DM ||
          loggedinUserRole.name === RC ||
          loggedinUserRole.name === LCTO ||
          loggedinUserRole.name === CTO) && (
          <CommonCaseDetailsSDM
            generateReport={generateReport}
            reviewReport={reviewReport}
            showCaseData={showCaseData}
            visibleMapModel={visibleMapModel}
            setVisibleMapModel={setVisibleMapModel}
            setMapModelCount={setMapModelCount}
            // fetchSHowCaseData={() => {
            //   fetchData()
            //   fetchSHowCaseData()
            // }}
            setInitialValues={setInitialValues}
            setShowCaseData={setShowCaseData}
          />
        )}

        <CTabContent className="mt-3">
          <CTabPane visible={activeTab === 1}>
            {(DM === loggedinUserRole.name ||
              RC === loggedinUserRole.name ||
              LCTO === loggedinUserRole.name ||
              CTO === loggedinUserRole.name) && (
              <>
                {toggleForms && toggleForms.cooForm ? (
                  <>
                    <div className="mt-4">
                      <CooForm
                        initialValues={initialValues}
                        setInitialValues={setInitialValues}
                        handleSubmit={handleSubmit}
                        additionalFields={additionalFields}
                        setAdditionalFields={setAdditionalFields}
                        additionalJson={additionalJson}
                        setAdditionalJson={setAdditionalJson}
                      />
                    </div>
                  </>
                ) : (
                  <MainDetailsCase showCaseData={showCaseData} />
                )}
              </>
            )}

            {(loggedinUserRole.name == RC ||
              loggedinUserRole.name == DM ||
              loggedinUserRole.name == LCTO ||
              loggedinUserRole.name == CTO) && (
              <>
                <ShowSdmFiles />
              </>
            )}
          </CTabPane>

          <CTabPane visible={activeTab === 2}>
            {(loggedinUserRole.name == RC ||
              loggedinUserRole.name == DM ||
              loggedinUserRole.name == LCTO ||
              loggedinUserRole.name == CTO) && (
              <>
                {' '}
                <div className="d-flex gap-2 mt-4 flex-wrap align-items-center">
                  <button
                    className="btn btn-primary"
                    onClick={async (e) => {
                      const blob = await pdf(await FEFormatePDfCreate(showCaseData)).toBlob()
                      saveAs(blob, `${showCaseData?.applicant_name ?? 'Fe-Formate'}.pdf`)
                    }}
                    style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                  >
                    <CIcon icon={cilCloudDownload} size="lg" /> Download PDF
                  </button>
                  {showProgressButton && (
                    <CButton
                      color="success"
                      className="btn text-white"
                      onClick={() => setShowProgressModal(true)}
                    >
                      Progress
                    </CButton>
                  )}
                </div>
                {toggleForms && toggleForms.toggleFePersonalInfo && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <PersonalInfoSDM showCaseData={showCaseData} />
                )}
                {toggleForms && toggleForms.toogleFeBoundries && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <Boundries4 showCaseData={showCaseData} />
                )}
                {toggleForms && toggleForms.toogleFeFloorAndDim && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <FloorDimensionDetails showCaseData={showCaseData} />
                )}
                {toggleForms && toggleForms.toggleFeDevAndScope && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <DevelScopeDetails showCaseData={showCaseData} />
                )}
                {toggleForms && toggleForms.toggleFedistanceFrom && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <DistanceDetails showCaseData={showCaseData} />
                )}
                {toggleForms && toggleForms.toggleFeRateAndLatlong && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <RateDimesionDetails showCaseData={showCaseData} />
                )}
                {showCaseData.fe_note && <FE_Note_Comp showCaseData={showCaseData} />}
                <>
                  <CRow className="mt-4">
                    <CCol md={12}>
                      <CCard className="applicant-details">
                        <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm rounded">
                          Re-Visit/Case Details
                          <div className="action-btn">
                            <div className="edit-btn">
                              <CIcon
                                icon={cilPencil}
                                onClick={() => {
                                  setCaseId(id)
                                  setVisibleFeVisitReason(!visibleFeVisitReason)
                                }}
                              />
                            </div>

                            {showVisibleFeVisitReason ? (
                              <CIcon
                                icon={cilChevronCircleUpAlt}
                                size="xl"
                                onClick={() =>
                                  setshowVisibleFeVisitReason(!showVisibleFeVisitReason)
                                }
                              />
                            ) : (
                              <CIcon
                                icon={cilChevronCircleDownAlt}
                                size="xl"
                                onClick={() =>
                                  setshowVisibleFeVisitReason(!showVisibleFeVisitReason)
                                }
                              />
                            )}
                          </div>
                        </CCardHeader>

                        {showVisibleFeVisitReason && (
                          <CCardBody>
                            <CRow>
                              <CCol md={12}>
                                <div>
                                  {showCaseData?.visit_region_fe
                                    ? showCaseData?.visit_region_fe
                                    : '-'}
                                </div>
                              </CCol>
                            </CRow>
                          </CCardBody>
                        )}
                      </CCard>
                    </CCol>
                  </CRow>

                  <EditFeOldVisit
                    visible={visibleFeVisitReason}
                    close={() => setVisibleFeVisitReason(false)}
                    caseId={caseId}
                    fetchShowCaseData={fetchSHowCaseData}
                  />
                </>
              </>
            )}
          </CTabPane>
          <CTabPane visible={activeTab === 3}>
            {(loggedinUserRole.name == RC ||
              loggedinUserRole.name == DM ||
              loggedinUserRole.name == LCTO ||
              loggedinUserRole.name == CTO) && (
              <>
                <ShowSdmFiles />
              </>
            )}
          </CTabPane>

          {/* =========================DM PANNEL========================= */}

          <CTabPane visible={activeTab === 4}>
            {DM === loggedinUserRole.name && (
              <>
                <DmForm
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  handleSubmit={handleSubmit}
                  additionalFields={additionalFields}
                  setAdditionalFields={setAdditionalFields}
                  additionalJson={additionalJson}
                  setAdditionalJson={setAdditionalJson}
                  beforSubmitError={beforSubmitError}
                  setBeforSubmitError={setBeforSubmitError}
                  showCaseData={showCaseData}
                  fetchData={fetchData}
                  fetchSHowCaseData={fetchSHowCaseData}
                  editorLoaded={editorLoaded}
                  setEditorLoaded={setEditorLoaded}
                  visibleMapModel={visibleMapModel}
                  setVisibleMapModel={setVisibleMapModel}
                />
              </>
            )}

            {(loggedinUserRole.name == RC ||
              loggedinUserRole.name == LCTO ||
              loggedinUserRole.name == CTO) && (
              <>
                {toggleForms && toggleForms.toggleDMForm ? (
                  <>
                    <DmForm
                      initialValues={initialValues}
                      setInitialValues={setInitialValues}
                      handleSubmit={handleSubmit}
                      additionalFields={additionalFields}
                      setAdditionalFields={setAdditionalFields}
                      additionalJson={additionalJson}
                      setAdditionalJson={setAdditionalJson}
                      beforSubmitError={beforSubmitError}
                      setBeforSubmitError={setBeforSubmitError}
                      showCaseData={showCaseData}
                      fetchData={fetchData}
                      fetchSHowCaseData={fetchSHowCaseData}
                    />
                  </>
                ) : (
                  <>
                    <ShowDmDetails showCaseData={showCaseData} />
                  </>
                )}
              </>
            )}
          </CTabPane>

          {/* =========================RC PANNEL========================= */}
          <CTabPane visible={activeTab === 5}>
            {RC === loggedinUserRole.name && (
              <>
                <CCard className="mt-2">
                  <CCardBody>
                    <CCol md={4}>
                      <div className="d-flex gap-3">
                        <CButton onClick={() => setShowOthersAttechments(!showOthersAttechments)}>
                          <FontAwesomeIcon icon={faPaperclip} />
                          <span className="mx-2">Draft Attechments</span>
                        </CButton>
                        {showCaseData?.status === 'pending for rc' && (
                          <CButton
                            color="danger"
                            className="text-white"
                            onClick={() => setSendBackConform(true)}
                          >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span className="mx-2">Send back</span>
                          </CButton>
                        )}
                      </div>
                    </CCol>

                    <CCol md={4}>
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
                    </CCol>

                    {showCaseData.status === 'submitted to bank' &&
                      initialValues.case_revise == '1' && (
                        <>
                          <CRow className="mt-2">
                            <CCol md={4}>
                              <CFormLabel>
                                RC Attechment <span className="text-danger ">*</span>
                              </CFormLabel>
                              <CFormInput
                                id="image"
                                type="file"
                                accept=".xlsx, .xls, .docx, .doc, .pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp"
                                onChange={(event) => {
                                  const selectedFile = event.target.files[0]
                                  setInitialValues((prevValues) => ({
                                    ...prevValues,
                                    rc_attechment: selectedFile,
                                  }))
                                }}
                              />
                            </CCol>

                            {initialValues.rc_attechment && (
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
                                      <option value="">Select Shape Type</option>
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
                                      defaultOptions={defaultOptionsAdmins}
                                      isDisabled={[
                                        'pending for lcto',
                                        'pending for cto',
                                        'submitted to bank',
                                      ].includes(showCaseData?.status)}
                                      value={
                                        isSubmittedBank
                                          ? { label: 'Submit to Bank', value: 'submit to bank' }
                                          : defaultOptionsAdmins.find(
                                              (option) =>
                                                option.value === getSelectedValue(option.role) ||
                                                option.value === getSelectedValue(option.role)?._id,
                                            ) || null
                                      }
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                      formatOptionLabel={formatSubmitToOption}
                                      onChange={(selected) => {
                                        setSelectedRole(null)
                                        setInitialValues({
                                          ...initialValues,
                                          lcto: '',
                                          cto: '',
                                        })
                                        handleSelectChange(selected)
                                      }}
                                    />
                                  </div>
                                </CCol>
                              </>
                            )}
                          </CRow>

                          {(selectedRole && selectedRole?.value == 'submit to bank') ||
                            (initialValues?.case_revise === '1' && (
                              <CRow>
                                <CCol md={8}>
                                  <CFormLabel>Final Address</CFormLabel>

                                  <CFormTextarea
                                    className="mb-lg-0 mb-2"
                                    placeholder="Enter final address here.."
                                    name="final_address"
                                    value={initialValues.final_address}
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
                                RC Attechment <span className="text-danger ">*</span>
                              </CFormLabel>
                              <CFormInput
                                id="image"
                                type="file"
                                accept=".xlsx, .xls, .docx, .doc, .pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp"
                                onChange={(event) => {
                                  const selectedFile = event.target.files[0]
                                  setInitialValues((prevValues) => ({
                                    ...prevValues,
                                    rc_attechment: selectedFile,
                                  }))
                                }}
                              />
                            </CCol>

                            {initialValues.rc_attechment && (
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
                                      <option value="">Select Shape Type</option>
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
                                      defaultOptions={defaultOptionsAdmins}
                                      isDisabled={[
                                        'pending for lcto',
                                        'pending for cto',
                                        'submitted to bank',
                                      ].includes(showCaseData?.status)}
                                      value={
                                        isSubmittedBank
                                          ? { label: 'Submit to Bank', value: 'submit to bank' }
                                          : defaultOptionsAdmins.find(
                                              (option) =>
                                                option.value === getSelectedValue(option.role) ||
                                                option.value === getSelectedValue(option.role)?._id,
                                            ) || null
                                      }
                                      getOptionLabel={(option) => option.label}
                                      getOptionValue={(option) => option.value}
                                      formatOptionLabel={formatSubmitToOption}
                                      onChange={(selected) => {
                                        setSelectedRole(null)
                                        setInitialValues({
                                          ...initialValues,
                                          lcto: '',
                                          cto: '',
                                        })
                                        handleSelectChange(selected)
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
                                  value={initialValues.final_address}
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
                          {initialValues.rc_attechment && (
                            <CButton
                              type="submit"
                              name="buttonClicked"
                              value="submit"
                              onClick={async (e) => {
                                console.log('-=-==-on click csll')

                                await handleAssign()
                              }}
                              className="submit_btn mb-2"
                              disabled={[
                                'pending for lcto',
                                'pending for cto',
                                'submitted to bank',
                              ].includes(showCaseData?.status)}
                            >
                              Submit
                            </CButton>
                          )}
                          <CButton
                            onClick={handleHold}
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
                              navigate('/case/all')
                            }}
                          >
                            Cancel
                          </CButton>
                        </CCardBody>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </>
            )}
          </CTabPane>

          {/* =========================LCTO PANNEL========================= */}

          <CTabPane visible={activeTab === 6}>
            {LCTO === loggedinUserRole.name && (
              <>
                <CCard className="mt-2">
                  <CCardBody>
                    <CCol md={4}>
                      <div className="d-flex gap-3">
                        <CButton onClick={() => setShowOthersAttechments(!showOthersAttechments)}>
                          Others Attechments
                        </CButton>
                        {showCaseData?.status === 'pending for lcto' && (
                          <CButton
                            color="danger"
                            className="text-white"
                            onClick={() => setSendBackConform(true)}
                          >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span className="mx-2">Send back</span>
                          </CButton>
                        )}
                      </div>
                    </CCol>

                    {loggedinUserRole?.name &&
                      showCaseData?.lcto?.role?.[0]?.name &&
                      loggedinUserRole.name === showCaseData.lcto.role[0].name && (
                        <>
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

                          {showCaseData.status === 'submitted to bank' &&
                            initialValues.case_revise == '1' && (
                              <>
                                <CRow className="mt-2">
                                  <CCol md={4}>
                                    <CFormLabel>
                                      LCTO Attechment <span className="text-danger ">*</span>
                                    </CFormLabel>
                                    <CFormInput
                                      id="image"
                                      type="file"
                                      accept=".xlsx, .xls, .docx, .doc, .pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp"
                                      onChange={(event) => {
                                        const selectedFile = event.target.files[0]
                                        setInitialValues((prevValues) => ({
                                          ...prevValues,
                                          lcto_attechment: selectedFile,
                                        }))
                                      }}
                                    />
                                  </CCol>

                                  {initialValues.lcto_attechment && (
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
                                            <option value="">Select Shape Type</option>
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
                                            defaultOptions={defaultOptionsAdmins}
                                            value={
                                              isSubmittedBank
                                                ? {
                                                    label: 'Submit to Bank',
                                                    value: 'submit to bank',
                                                  }
                                                : defaultOptionsAdmins.find(
                                                    (option) =>
                                                      option.value ===
                                                        getSelectedValue(option.role) ||
                                                      option.value ===
                                                        getSelectedValue(option.role)?._id,
                                                  ) || null
                                            }
                                            isDisabled={[
                                              'pending for cto',
                                              'submitted to bank',
                                            ].includes(showCaseData?.status)}
                                            getOptionLabel={(option) => option.label}
                                            getOptionValue={(option) => option.value}
                                            formatOptionLabel={formatSubmitToOption}
                                            onChange={(selected) => {
                                              setSelectedRole(null)
                                              setInitialValues({
                                                ...initialValues,
                                                cto: '',
                                              })
                                              handleSelectChange(selected)
                                            }}
                                          />
                                        </div>
                                      </CCol>
                                    </>
                                  )}
                                </CRow>

                                {(selectedRole && selectedRole?.value == 'submit to bank') ||
                                  (initialValues?.case_revise == '1' && (
                                    <CRow>
                                      <CCol md={8}>
                                        <CFormLabel>Final Address</CFormLabel>

                                        <CFormTextarea
                                          className="mb-lg-0 mb-2"
                                          placeholder="Enter final address here.."
                                          name="final_address"
                                          value={initialValues.final_address}
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
                                      LCTO Attechment <span className="text-danger ">*</span>
                                    </CFormLabel>
                                    <CFormInput
                                      id="image"
                                      type="file"
                                      accept=".xlsx, .xls, .docx, .doc, .pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp"
                                      onChange={(event) => {
                                        const selectedFile = event.target.files[0]
                                        setInitialValues((prevValues) => ({
                                          ...prevValues,
                                          lcto_attechment: selectedFile,
                                        }))
                                      }}
                                    />
                                  </CCol>

                                  {initialValues.lcto_attechment && (
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
                                            <option value="">Select Shape Type</option>
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
                                            defaultOptions={defaultOptionsAdmins}
                                            value={
                                              isSubmittedBank
                                                ? {
                                                    label: 'Submit to Bank',
                                                    value: 'submit to bank',
                                                  }
                                                : defaultOptionsAdmins.find(
                                                    (option) =>
                                                      option.value ===
                                                        getSelectedValue(option.role) ||
                                                      option.value ===
                                                        getSelectedValue(option.role)?._id,
                                                  ) || null
                                            }
                                            isDisabled={[
                                              'pending for cto',
                                              'submitted to bank',
                                            ].includes(showCaseData?.status)}
                                            getOptionLabel={(option) => option.label}
                                            getOptionValue={(option) => option.value}
                                            formatOptionLabel={formatSubmitToOption}
                                            onChange={(selected) => {
                                              setSelectedRole(null)
                                              setInitialValues({
                                                ...initialValues,
                                                cto: '',
                                              })
                                              handleSelectChange(selected)
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
                                        value={initialValues.final_address}
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
                                <CButton
                                  type="submit"
                                  name="buttonClicked"
                                  value="submit"
                                  onClick={async (e) => {
                                    await handleAssign()
                                  }}
                                  className="submit_btn mb-2"
                                  disabled={['pending for cto', 'submitted to bank'].includes(
                                    showCaseData?.status,
                                  )}
                                >
                                  Submit
                                </CButton>

                                <CButton
                                  onClick={handleHold}
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
                                    navigate('/case/all')
                                  }}
                                >
                                  Cancel
                                </CButton>
                              </CCardBody>
                            </CCol>
                          </CRow>
                        </>
                      )}
                  </CCardBody>
                </CCard>
              </>
            )}
          </CTabPane>

          {/* =========================CTO PANNEL========================= */}

          <CTabPane visible={activeTab === 7}>
            {CTO === loggedinUserRole.name && (
              <>
                <CCard className="mt-2">
                  <CCardBody>
                    <CCol md={4}>
                      <div className="d-flex gap-3">
                        <CButton onClick={() => setShowOthersAttechments(!showOthersAttechments)}>
                          Others Attechments
                        </CButton>
                        {showCaseData?.status === 'pending for cto' && (
                          <CButton
                            color="danger"
                            className="text-white"
                            onClick={() => setSendBackConform(true)}
                          >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            <span className="mx-2">Send back</span>
                          </CButton>
                        )}
                      </div>
                    </CCol>

                    {loggedinUserRole?.name &&
                      showCaseData?.cto?.role?.[0]?.name &&
                      loggedinUserRole.name === showCaseData.cto.role[0].name && (
                        <>
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
                          {showCaseData.status === 'submitted to bank' &&
                            initialValues.case_revise == '1' && (
                              <>
                                <CRow className="mt-2">
                                  <CCol md={4}>
                                    <CFormLabel>
                                      CTO Attechment <span className="text-danger ">*</span>
                                    </CFormLabel>
                                    <CFormInput
                                      id="image"
                                      type="file"
                                      accept=".xlsx, .xls, .docx, .doc, .pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp"
                                      onChange={(event) => {
                                        const selectedFile = event.target.files[0]
                                        setInitialValues((prevValues) => ({
                                          ...prevValues,
                                          cto_attechment: selectedFile,
                                        }))
                                      }}
                                    />
                                  </CCol>

                                  {initialValues.cto_attechment && (
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
                                            <option value="">Select Shape Type</option>
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
                                            defaultOptions={defaultOptionsAdmins}
                                            value={
                                              isSubmittedBank
                                                ? {
                                                    label: 'Submit to Bank',
                                                    value: 'submit to bank',
                                                  }
                                                : defaultOptionsAdmins.find(
                                                    (option) =>
                                                      option.value ===
                                                        getSelectedValue(option.role) ||
                                                      option.value ===
                                                        getSelectedValue(option.role)?._id,
                                                  ) || null
                                            }
                                            isDisabled={['submitted to bank'].includes(
                                              showCaseData?.status,
                                            )}
                                            getOptionLabel={(option) => option.label}
                                            getOptionValue={(option) => option.value}
                                            formatOptionLabel={formatSubmitToOption}
                                            onChange={(selected) => {
                                              setSelectedRole(null)
                                              handleSelectChange(selected)
                                            }}
                                          />
                                        </div>
                                      </CCol>
                                    </>
                                  )}
                                </CRow>

                                {(selectedRole && selectedRole?.value == 'submit to bank') ||
                                  (initialValues?.case_revise == '1' && (
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
                                      CTO Attechment <span className="text-danger ">*</span>
                                    </CFormLabel>
                                    <CFormInput
                                      id="image"
                                      type="file"
                                      accept=".xlsx, .xls, .docx, .doc, .pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp"
                                      onChange={(event) => {
                                        const selectedFile = event.target.files[0]
                                        setInitialValues((prevValues) => ({
                                          ...prevValues,
                                          cto_attechment: selectedFile,
                                        }))
                                      }}
                                    />
                                  </CCol>

                                  {initialValues.cto_attechment && (
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
                                            <option value="">Select Shape Type</option>
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
                                            defaultOptions={defaultOptionsAdmins}
                                            value={
                                              isSubmittedBank
                                                ? {
                                                    label: 'Submit to Bank',
                                                    value: 'submit to bank',
                                                  }
                                                : defaultOptionsAdmins.find(
                                                    (option) =>
                                                      option.value ===
                                                        getSelectedValue(option.role) ||
                                                      option.value ===
                                                        getSelectedValue(option.role)?._id,
                                                  ) || null
                                            }
                                            isDisabled={['submitted to bank'].includes(
                                              showCaseData?.status,
                                            )}
                                            getOptionLabel={(option) => option.label}
                                            getOptionValue={(option) => option.value}
                                            formatOptionLabel={formatSubmitToOption}
                                            onChange={(selected) => {
                                              setSelectedRole(null)
                                              handleSelectChange(selected)
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
                                <CButton
                                  type="submit"
                                  name="buttonClicked"
                                  value="submit"
                                  onClick={async (e) => {
                                    console.log('-=----===-logi on click')

                                    await handleAssign()
                                  }}
                                  // disabled={['submitted to bank'].includes(showCaseData?.status)}
                                  className="submit_btn mb-2"
                                >
                                  Submit
                                </CButton>

                                <CButton
                                  onClick={handleHold}
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
                                    navigate('/case/all')
                                  }}
                                >
                                  Cancel
                                </CButton>
                              </CCardBody>
                            </CCol>
                          </CRow>
                        </>
                      )}
                  </CCardBody>
                </CCard>
              </>
            )}
          </CTabPane>

          <CTabPane visible={activeTab === 8}>
            {(loggedinUserRole.name == RC ||
              loggedinUserRole.name == DM ||
              loggedinUserRole.name == LCTO ||
              loggedinUserRole.name == CTO) && (
              <>
                <Files
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  handleSubmit={handleSubmit}
                  additionalFields={additionalFields}
                  setAdditionalFields={setAdditionalFields}
                  additionalJson={additionalJson}
                  setAdditionalJson={setAdditionalJson}
                  showCaseData={showCaseData}
                  activeTab={activeTab}
                  fetchData={fetchData}
                  fetchSHowCaseData={fetchSHowCaseData}
                />
              </>
            )}
          </CTabPane>
        </CTabContent>
        {/* ============================SDM============================ */}

        {SDM === loggedinUserRole.name && (
          <>
            <CommonCaseDetailsSDM showCaseData={showCaseData} additionalFields={additionalFields} />

            <div className="d-flex gap-2 mt-4 flex-wrap align-items-center">
              <button
                className="btn btn-primary"
                onClick={async (e) => {
                  const blob = await pdf(await FEFormatePDfCreate(showCaseData)).toBlob()
                  saveAs(blob, `${showCaseData?.applicant_name ?? 'Fe-Formate'}.pdf`)
                }}
                style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
              >
                <CIcon icon={cilCloudDownload} size="lg" /> Download PDF
              </button>
              {showProgressButton && (
                <CButton
                  color="success"
                  className="btn text-white"
                  onClick={() => setShowProgressModal(true)}
                >
                  Progress
                </CButton>
              )}
            </div>

            {toggleForms && toggleForms.cooForm ? (
              <>
                <div className="mt-4">
                  <CooForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    handleSubmit={handleSubmit}
                    setAdditionalFields={setAdditionalFields}
                    additionalJson={additionalJson}
                    setAdditionalJson={setAdditionalJson}
                  />
                </div>
              </>
            ) : (
              <MainDetailsCase showCaseData={showCaseData} />
            )}

            {toggleForms && toggleForms.toggleFePersonalInfo && formStep ? (
              <CommonMultistepForm
                initialValues={initialValues}
                setInitialValues={setInitialValues}
                formStep={formStep}
              />
            ) : (
              <PersonalInfoSDM showCaseData={showCaseData} />
            )}

            {toggleForms && toggleForms.toogleFeBoundries && formStep ? (
              <CommonMultistepForm
                initialValues={initialValues}
                setInitialValues={setInitialValues}
                formStep={formStep}
              />
            ) : (
              <Boundries4 showCaseData={showCaseData} />
            )}

            {toggleForms && toggleForms.toogleFeFloorAndDim && formStep ? (
              <CommonMultistepForm
                initialValues={initialValues}
                setInitialValues={setInitialValues}
                formStep={formStep}
              />
            ) : (
              <FloorDimensionDetails showCaseData={showCaseData} />
            )}

            {toggleForms && toggleForms.toggleFeDevAndScope && formStep ? (
              <CommonMultistepForm
                initialValues={initialValues}
                setInitialValues={setInitialValues}
                formStep={formStep}
              />
            ) : (
              <DevelScopeDetails showCaseData={showCaseData} />
            )}

            {toggleForms && toggleForms.toggleFedistanceFrom && formStep ? (
              <CommonMultistepForm
                initialValues={initialValues}
                setInitialValues={setInitialValues}
                formStep={formStep}
              />
            ) : (
              <DistanceDetails showCaseData={showCaseData} />
            )}

            {toggleForms && toggleForms.toggleFeRateAndLatlong && formStep ? (
              <CommonMultistepForm
                initialValues={initialValues}
                setInitialValues={setInitialValues}
                formStep={formStep}
              />
            ) : (
              <RateDimesionDetails showCaseData={showCaseData} />
            )}

            {showCaseData.fe_note && <FE_Note_Comp showCaseData={showCaseData} />}

            <>
              <CRow className="mt-4">
                <CCol md={12}>
                  <CCard className="applicant-details">
                    <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm rounded">
                      Re-Visit/Case Details
                      <div className="action-btn">
                        <div className="edit-btn">
                          <CIcon
                            icon={cilPencil}
                            onClick={() => {
                              setCaseId(id)
                              setVisibleFeVisitReason(!visibleFeVisitReason)
                            }}
                          />
                        </div>

                        {showVisibleFeVisitReason ? (
                          <CIcon
                            icon={cilChevronCircleUpAlt}
                            size="xl"
                            onClick={() => setshowVisibleFeVisitReason(!showVisibleFeVisitReason)}
                          />
                        ) : (
                          <CIcon
                            icon={cilChevronCircleDownAlt}
                            size="xl"
                            onClick={() => setshowVisibleFeVisitReason(!showVisibleFeVisitReason)}
                          />
                        )}
                      </div>
                    </CCardHeader>

                    {showVisibleFeVisitReason && (
                      <CCardBody>
                        <CRow>
                          <CCol md={12}>
                            <div>
                              {showCaseData?.visit_region_fe ? showCaseData?.visit_region_fe : '-'}
                            </div>
                          </CCol>
                        </CRow>
                      </CCardBody>
                    )}
                  </CCard>
                </CCol>
              </CRow>

              <EditFeOldVisit
                visible={visibleFeVisitReason}
                close={() => setVisibleFeVisitReason(false)}
                caseId={caseId}
                fetchShowCaseData={fetchSHowCaseData}
              />
            </>

            {additionalJson &&
              additionalFields?.filter((item) => item.role === 'FE').length > 0 &&
              (toggleForms.toggleAdditionalFieldsForm ? (
                <AdditionalFieldsFormSDM
                  additionalFields={additionalFields}
                  setAdditionalFields={setAdditionalFields}
                  additionalJson={additionalJson}
                  setAdditionalJson={setAdditionalJson}
                  initialValues={setInitialValues}
                  setInitialValues={setInitialValues}
                />
              ) : (
                <AdditionalFields showCaseData={showCaseData} role="FE" />
              ))}

            <SDMUploadFiles />
          </>
        )}

        {/* ============================BM SFO============================ */}
        {(BM === loggedinUserRole.name || SFO === loggedinUserRole.name) && (
          <>
            <CommonCaseDetailsSDM showCaseData={showCaseData} />
            <div className="d-flex gap-2 mt-4 flex-wrap align-items-center">
              <button
                className="btn btn-primary"
                onClick={async (e) => {
                  const blob = await pdf(await FEFormatePDfCreate(showCaseData)).toBlob()
                  saveAs(blob, `${showCaseData?.applicant_name ?? 'Fe-Formate'}.pdf`)
                }}
                style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
              >
                <CIcon icon={cilCloudDownload} size="lg" /> Download PDF
              </button>
              {showProgressButton && (
                <CButton
                  color="success"
                  className="btn text-white"
                  onClick={() => setShowProgressModal(true)}
                >
                  Progress
                </CButton>
              )}
            </div>
            {toggleForms && toggleForms.cooForm ? (
              <>
                <div className="mt-4">
                  <CooForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    handleSubmit={handleSubmit}
                    showCaseData={showCaseData}
                  />
                </div>
              </>
            ) : (
              <MainDetailsCase showCaseData={showCaseData} />
            )}

            {[
              'visit done',
              'pending for draft',
              'pending for rc',
              'pending for lcto',
              'pending for cto',
              'submitted to bank',
            ].includes(showCaseData.status) && (
              <>
                {toggleForms && toggleForms.toggleFePersonalInfo && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <PersonalInfoSDM showCaseData={showCaseData} />
                )}

                {toggleForms && toggleForms.toogleFeBoundries && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <Boundries4 showCaseData={showCaseData} />
                )}

                {toggleForms && toggleForms.toogleFeFloorAndDim && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <FloorDimensionDetails showCaseData={showCaseData} />
                )}

                {toggleForms && toggleForms.toggleFeDevAndScope && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <DevelScopeDetails showCaseData={showCaseData} />
                )}

                {toggleForms && toggleForms.toggleFedistanceFrom && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <DistanceDetails showCaseData={showCaseData} />
                )}

                {toggleForms && toggleForms.toggleFeRateAndLatlong && formStep ? (
                  <CommonMultistepForm
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    formStep={formStep}
                  />
                ) : (
                  <RateDimesionDetails showCaseData={showCaseData} />
                )}

                {showCaseData.fe_note && <FE_Note_Comp showCaseData={showCaseData} />}

                {additionalJson &&
                  additionalFields?.filter((item) => item.role === 'FE').length > 0 &&
                  (toggleForms.toggleAdditionalFieldsForm ? (
                    <AdditionalFieldsFormSDM
                      additionalFields={additionalFields}
                      setAdditionalFields={setAdditionalFields}
                      additionalJson={additionalJson}
                      setAdditionalJson={setAdditionalJson}
                      initialValues={setInitialValues}
                      setInitialValues={setInitialValues}
                    />
                  ) : (
                    <AdditionalFields showCaseData={showCaseData} role="FE" />
                  ))}

                <RAShowFiles />
              </>
            )}
          </>
        )}
      </CContainer>

      <OthersAttechments
        visible={showOthersAttechments}
        close={() => setShowOthersAttechments(false)}
        files={availableAttachments.length > 0 ? availableAttachments : []}
      />

      <ProgressAttachmentsModal
        visible={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        showCaseData={showCaseData}
      />

      <Hold
        visible={visibleHoldModel}
        close={() => setVisibleHoldModel(!visibleHoldModel)}
        caseId={caseId}
        fetchCaseData={fetchData}
        type="hold"
        status={holdStatus}
        call={holdCall}
        isRedirectToAll={true}
      />
      <SendBackConformModal
        moduleName={'cases'}
        visible={sendBackConform}
        setVisible={setSendBackConform}
        // handleClose
        // currentPage
        // rowPerPage
        userId={id}
        handleClose={() => setSendBackConform(false)}
        type="single"
      />
    </>
  )
}

export default commonUpdate
