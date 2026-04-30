import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderNav,
  CHeaderToggler,
  CFormInput,
  CImage,
  CButton,
  CBadge,
  CInputGroup,
  CListGroupItem,
  CListGroup,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import { AppHeaderDropdown } from './header/index'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import BasicProvider from 'src/constants/BasicProvider'
import logoimg from 'src/assets/images/logo/Apple-2-logo.png'
import ViewQuickLinks from './custom/popup/quickLinks'

import { useCombobox } from 'downshift';
import { debounce } from 'lodash';
import MaterFilter from './custom/MasterFilter'
import ForcePinModal from './ForcePinModal'
import PunchInModal from './custom/popup/PunchInModal'
import { useUserAttendanceActions } from 'src/hooks/useAttendance'

let SDM = process.env.REACT_APP_SDM
let DM = process.env.REACT_APP_DM
let RC = process.env.REACT_APP_RC
let LCTO = process.env.REACT_APP_LCTO
let CTO = process.env.REACT_APP_CTO
let FE = process.env.REACT_APP_FE
let BROKER = process.env.REACT_APP_BROKER
let ADMIN = process.env.REACT_APP_ADMIN
let COO = process.env.REACT_APP_COO
let RA = process.env.REACT_APP_RA
let SFO = process.env.REACT_APP_SFO

const HRMSHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const effectRef = useRef(false)
  const effectRef1 = useRef(false)
  const loggedinUserRole = useSelector((state) => state?.userRole)
  const token = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)
  const id = Cookies.get(`primery_user_id`)

  var decoded = jwtDecode(token)

  useEffect(() => {
    dispatch({ type: 'setUserData', userData: decoded })
    dispatch({ type: 'setUserRole', userRole: decoded?.role[0] })
  }, [])

  const sidebarShow = useSelector((state) => state.sidebarShow)
  const userData = useSelector((state) => state.userData)
  const offerBlocksPunchModal = useSelector(
    (state) => !!state.offerPopup?.blockPunchModalForOffer,
  )

  let [concernTotal, setConcernTotal] = useState(null)
  let [concernUpdatedTotal, setConcernUpdatedTotal] = useState(0)
  let [visibleQuickLinkModel, setVisibleQuickLinkModel] = useState(false)
  const [visibleForcePinModal, setVisibleForcePinModal] = useState(false)
  const [options, setOptions] = useState([])
  const [mutualAdmins, setMutualAdmins] = useState([])
  const [primeryAdmin, setPrimeryAdmin] = useState({})
  const [selectedType, setSelectedType] = useState(null)
  const [loading, setLoading] = useState(false)

  // Punch in states
  const [showPunchInModal, setShowPunchInModal] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [showToggle, setShowToggle] = useState(false)
  const { handlePunchIn,punchStatus}= useUserAttendanceActions();

  useEffect(() => {
    if (punchStatus?.isPunchedIn) {
      setIsOnline(true)
      setShowToggle(false)
      setShowPunchInModal(false)
    } else {
      setIsOnline(false)
      setShowToggle(true)
      if (!offerBlocksPunchModal) {
        setShowPunchInModal(true)
      } else {
        setShowPunchInModal(false)
      }
    }
  }, [punchStatus, offerBlocksPunchModal])
  // Check if user needs to punch in on component mount
  // useEffect(() => {
  //   if (token && userData) {
  //     const currentRole = userData?.role?.[0]?.name
  //     console.log('Current role:', currentRole) // Debug log
      
  //     // Check both localStorage and sessionStorage
  //     const localStorageStatus = localStorage.getItem(`punchInStatus_${currentRole}`)
  //     const sessionStorageStatus = sessionStorage.getItem(`punchInStatus_${currentRole}`)
      
  //     console.log('localStorage status:', localStorageStatus) // Debug log
  //     console.log('sessionStorage status:', sessionStorageStatus) // Debug log
      
  //     // If no status found, show modal
  //     if (!localStorageStatus && !sessionStorageStatus) {
  //       console.log('No punch in status found, showing modal') // Debug log
  //       setShowPunchInModal(true)
  //     } else if (localStorageStatus === 'online' || sessionStorageStatus === 'online') {
  //       console.log('User is online') // Debug log
  //       setIsOnline(true)
  //     } else if (localStorageStatus === 'offline' || sessionStorageStatus === 'offline') {
  //       console.log('User is offline, showing toggle') // Debug log
  //       setShowToggle(true)
  //     }
  //   }
  // }, [token, userData])

  const handlePunchInYes = () => {
    const currentRole = userData?.role?.[0]?.name
    setIsOnline(true)
    setShowToggle(false)
    setShowPunchInModal(false)
    
    // Save to both localStorage and sessionStorage
    localStorage.setItem(`punchInStatus_${currentRole}`, 'online')
    sessionStorage.setItem(`punchInStatus_${currentRole}`, 'online')
    
    // console.log(`Punch in successful for role: ${currentRole}`) // Debug log - removed for production
    
    // Log punch in activity
    createLoginActivity('punch_in')
  }

  const handlePunchInNo = () => {
    const currentRole = userData?.role?.[0]?.name
    setShowToggle(true)
    setIsOnline(false)
    setShowPunchInModal(false)
    
    // Save to both localStorage and sessionStorage
    localStorage.setItem(`punchInStatus_${currentRole}`, 'offline')
    sessionStorage.setItem(`punchInStatus_${currentRole}`, 'offline')
    
    // console.log(`Punch in declined for role: ${currentRole}`) // Debug log - removed for production
  }

  const handleToggleOn = () => {
    if (offerBlocksPunchModal) return
    setShowPunchInModal(true)
  }

  const handleToggleOff = () => {
    const currentRole = userData?.role?.[0]?.name
    setIsOnline(false)
    setShowToggle(false)
    
    // Save to both localStorage and sessionStorage
    localStorage.setItem(`punchInStatus_${currentRole}`, 'offline')
    sessionStorage.setItem(`punchInStatus_${currentRole}`, 'offline')
  }

  // Create login activity function
  const createLoginActivity = async (type) => {
    try {
      await new BasicProvider('login-activity/create', dispatch).postRequest({
        type: type,
      })
    } catch (error) {
      console.error('Error creating login activity:', error)
    }
  }

  useEffect(() => {
    setOptions([])
  }, [navigate])

  useEffect(() => {
    if (effectRef.current === false) {
      effectRef.current = true
      fetchData()
    }
  }, [location])

  useEffect(() => {
    if (effectRef1.current === false) {
      effectRef1.current = true
    }
    fetchData2()
  }, [location])

  const fetchData = async () => {
    try {
      let response4 = await new BasicProvider(
        `admins/show/${id}`,
        dispatch,
      ).getRequest()

      const adminData = response4.data;
      setPrimeryAdmin(adminData)

      let response3 = await new BasicProvider(
        `admins/get-mutual`,
        dispatch,
      ).postRequest({ id: id })

      setMutualAdmins(response3?.data)

    } catch (error) { }
  }

  const fetchData2 = async () => {
    try {
      let response = await new BasicProvider(
        `cases/fe-concern`,
        dispatch,
      ).getRequest()

      setConcernTotal(response?.data)

      let response2 = await new BasicProvider(`cases/fe-concurn/count`, dispatch).getRequest()
      if (response2?.data?.data) {
        setConcernUpdatedTotal(response2?.data?.data)
      } else {
        setConcernUpdatedTotal(response2?.data)
      }
    } catch (error) { }
  }

  const handleSearch = useCallback(async (query) => {
    if (query.trim().length < 2) {
      if (options.length > 0) {
        setOptions([]);
      }
      return;
    }
    setLoading(true);
    try {
      const response = await new BasicProvider(
        `cases/master-filter?search_input=${query.trim()}`,
        dispatch,
      ).getRequest();

      const backendResponse = response.data;
      const dataArray = Array.isArray(backendResponse) ? backendResponse : [backendResponse];
      const roleName = userData?.role?.[0]?.name || 'only-see';

      const newOptions = dataArray.map((item) => ({
        name: item?.applicant_name || 'Unknown',
        value: item?.applicant_name || 'Unknown',
        url: `/case/${item?._id}/show-case-details/by/${roleName}`,
      }));

      setOptions(newOptions);
    } catch (error) {
      console.error('Error fetching data:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [dispatch, userData]);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    inputValue,
  } = useCombobox({
    items: options,
    onInputValueChange: ({ inputValue }) => {
      if (inputValue) {
        handleSearch(inputValue);
      }
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem?.url) {
        navigate(selectedItem.url);
      }
    },
    itemToString: (item) => (item ? item.name : ''),
  });

  const handleClose = () => {
    setSelectedType(null)
    setVisibleForcePinModal(false)
  }

  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid>
        {/* Left: Hamburger */}
        <CHeaderToggler
          className="ps-1"
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        {/* Right: Profile dropdown */}
        <CHeaderNav className="ms-auto">
          <AppHeaderDropdown userData={userData} />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default HRMSHeader
