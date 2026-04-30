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
import { getUnreadAnnouncementCount } from 'src/helpers/announcementHelper'
import logoimg from 'src/assets/images/logo/Apple-2-logo.png'
import ViewQuickLinks from './custom/popup/quickLinks'
import { cilBell } from '@coreui/icons'
import { useCombobox } from 'downshift'
import { debounce } from 'lodash'
import MaterFilter from './custom/MasterFilter'
import ForcePinModal from './ForcePinModal'
import PunchInModal from './custom/popup/PunchInModal'
import { useUserAttendanceActions } from 'src/hooks/useAttendance'
import { selectProfileData } from 'src/store'

let SDM = process.env.REACT_APP_SDM
let DM = process.env.REACT_APP_DM
let RC = process.env.REACT_APP_RC
let LCTO = process.env.REACT_APP_LCTO
let CTO = process.env.REACT_APP_CTO
let FE = process.env.REACT_APP_FE
let BROKER = process.env.REACT_APP_BROKER
let ADMIN = process.env.REACT_APP_ADMIN
let HR = process.env.REACT_APP_HR
let COO = process.env.REACT_APP_COO
let RA = process.env.REACT_APP_RA
let SFO = process.env.REACT_APP_SFO

const AppHeader = ({ employeeDatas, formData }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const effectRef = useRef(false)
  const effectRef1 = useRef(false)
  const loggedinUserRole = useSelector((state) => state?.userRole)
  const token = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)
  const id = Cookies.get(`primery_user_id`)
  const employeeId = id
  var decoded = jwtDecode(token)

  useEffect(() => {
    dispatch({ type: 'setUserData', userData: decoded })
    dispatch({ type: 'setUserRole', userRole: decoded?.role[0] })
  }, [])

  const sidebarShow = useSelector((state) => state.sidebarShow)
  const userData = useSelector((state) => state.userData)
  const punchStatus = useSelector((state) => state.punchInStatus)
  const profileData = useSelector(selectProfileData)
  const offerBlocksPunchModal = useSelector(
    (state) => !!state.offerPopup?.blockPunchModalForOffer,
  )
  let [concernTotal, setConcernTotal] = useState(null)
  let [concernUpdatedTotal, setConcernUpdatedTotal] = useState(0)
  let [announcementCount, setAnnouncementCount] = useState(0)
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
  const { handlePunchIn, isPunchingIn } = useUserAttendanceActions()

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null)
  useEffect(() => {
    if (punchStatus?.isPunchedIn) {
      setIsOnline(true)
      setShowToggle(false)
      setShowPunchInModal(false)
    } else {
      setIsOnline(false)
      setShowToggle(true)
      // Defer punch-in modal until the offer popup closes (see OfferPopupManager)
      if (!offerBlocksPunchModal) {
        setShowPunchInModal(true)
      } else {
        setShowPunchInModal(false)
      }
    }
  }, [punchStatus, offerBlocksPunchModal])

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const res = await new BasicProvider('profiles').getRequest()
        const img = res?.data?.profileImage

        if (!img) {
          setProfilePicture(null)
          return
        }

        let finalUrl = null

        // CASE 1: Backend returns filepath
        if (img.filepath) {
          const signed = await new BasicProvider(
            `cms/files/show-file-with-signed-url/${img._id}`,
            dispatch,
          ).getRequest()

          finalUrl = signed?.data || null
        }

        // CASE 2: fallback
        if (!finalUrl) {
          finalUrl = `${process.env.REACT_APP_NODE_URL}/files/${img._id}`
        }

        setProfilePicture(finalUrl)
        dispatch({ type: 'setProfilePicture', profilePicture: finalUrl })
      } catch (err) {
        console.log('Profile image load error:', err)
        setProfilePicture(null)
      }
    }

    loadProfileImage()
  }, [dispatch])

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
    fetchAnnouncementCount()

    // Auto-refresh unread count every 30 seconds
    const interval = setInterval(fetchAnnouncementCount, 30000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [location])

  const fetchData = async () => {
    try {
      let response4 = await new BasicProvider(`admins/show/${id}`, dispatch).getRequest()

      const adminData = response4.data
      setPrimeryAdmin(adminData)

      let response3 = await new BasicProvider(`admins/get-mutual`, dispatch).postRequest({ id: id })
      console.log('mutual admins response:', response3.data)
      setMutualAdmins(response3?.data)
    } catch (error) {}
  }

  const fetchData2 = async () => {
    try {
      let response = await new BasicProvider(`cases/fe-concern`, dispatch).getRequest()

      setConcernTotal(response?.data)

      let response2 = await new BasicProvider(`cases/fe-concurn/count`, dispatch).getRequest()
      if (response2?.data?.data) {
        setConcernUpdatedTotal(response2?.data?.data)
      } else {
        setConcernUpdatedTotal(response2?.data)
      }
    } catch (error) {}
  }

  const fetchAnnouncementCount = async () => {
    try {
      const staffId = Cookies.get('primery_user_id')
      const userRole = userData?.role?.[0]?.name || decoded?.role?.[0]?.name

      // Always call ALL announcements
      const response = await new BasicProvider('announcements/all').getRequest()
      const allAnnouncements = response?.data || []

      const readData = JSON.parse(localStorage.getItem('announcement_read')) || {}
      const now = new Date()

      // Get user's RA location from profile (can be in different places)
      const userRaLocation = profileData?.ra_location || null
      
      // Helper function to extract ID from location (handles both objects and strings)
      const extractLocationId = (loc) => {
        if (!loc) return null
        if (typeof loc === 'string') return loc
        if (typeof loc === 'object') {
          return loc.value || loc._id || loc.id || null
        }
        return null
      }
      
      // Convert user's location to array of IDs
      const userRaLocationIds = []
      if (Array.isArray(userRaLocation)) {
        userRaLocation.forEach((loc) => {
          const id = extractLocationId(loc)
          if (id) userRaLocationIds.push(String(id))
        })
      } else if (userRaLocation) {
        const id = extractLocationId(userRaLocation)
        if (id) userRaLocationIds.push(String(id))
      }

      // Admin and HR see ALL announcements (same as Manage Announcements page)
      const isAdminOrHR = userRole === ADMIN || userRole === HR

      const visibleAnnouncements = allAnnouncements.filter((ann) => {
        // Filter out unpublished announcements
        if (!ann?.is_published) return false
        
        // Filter out scheduled announcements that haven't been published yet
        if (ann?.schedule_at && new Date(ann.schedule_at) > now) return false

        // Admin and HR: show all announcements (no targeting filter)
        if (isAdminOrHR) return true

        // Other users: check targeting criteria
        const hasStaffTargeting = ann.staff && Array.isArray(ann.staff) && ann.staff.length > 0
        const hasRoleTargeting = ann.target_roles && Array.isArray(ann.target_roles) && ann.target_roles.length > 0
        const hasLocationTargeting = ann.ra_location && Array.isArray(ann.ra_location) && ann.ra_location.length > 0

        // If no targeting specified (all empty) → show to everyone
        if (!hasStaffTargeting && !hasRoleTargeting && !hasLocationTargeting) {
          return true
        }

        let matchesLocation = false
        let matchesStaff = false
        let matchesRole = false

        if (hasLocationTargeting) {
          matchesLocation = userRaLocationIds.some((userLocId) => {
            return ann.ra_location.some((annLoc) => {
              return String(userLocId) === String(annLoc)
            })
          })
        }

        if (hasStaffTargeting) {
          matchesStaff = staffId && ann.staff.includes(staffId)
        }

        if (hasRoleTargeting) {
          matchesRole = userRole && ann.target_roles.includes(userRole)
        }

        return matchesLocation || matchesStaff || matchesRole
      })

      // Count unread
      const unreadCount = visibleAnnouncements.reduce((acc, ann) => {
        const isRead = !!readData[ann._id]
        return acc + (isRead ? 0 : 1)
      }, 0)

      setAnnouncementCount(unreadCount)
    } catch (error) {
      console.error('Error fetching unread announcement count:', error)
      setAnnouncementCount(0)
    }
  }

  const handleSearch = useCallback(
    async (query) => {
      if (query.trim().length < 2) {
        if (options.length > 0) {
          setOptions([])
        }
        return
      }
      setLoading(true)
      try {
        const response = await new BasicProvider(
          `cases/master-filter?search_input=${query.trim()}`,
          dispatch,
        ).getRequest()

        const backendResponse = response.data
        const dataArray = Array.isArray(backendResponse) ? backendResponse : [backendResponse]
        const roleName = userData?.role?.[0]?.name || 'only-see'

        const newOptions = dataArray.map((item) => ({
          name: item?.applicant_name || 'Unknown',
          value: item?.applicant_name || 'Unknown',
          url: `/case/${item?._id}/show-case-details/by/${roleName}`,
        }))

        setOptions(newOptions)
      } catch (error) {
        console.error('Error fetching data:', error)
        setOptions([])
      } finally {
        setLoading(false)
      }
    },
    [dispatch, userData],
  )

  const { isOpen, getMenuProps, getInputProps, getItemProps, highlightedIndex, inputValue } =
    useCombobox({
      items: options,
      onInputValueChange: ({ inputValue }) => {
        if (inputValue) {
          handleSearch(inputValue)
        }
      },
      onSelectedItemChange: ({ selectedItem }) => {
        if (selectedItem?.url) {
          navigate(selectedItem.url)
        }
      },
      itemToString: (item) => (item ? item.name : ''),
    })

  const handleClose = () => {
    setSelectedType(null)
    setVisibleForcePinModal(false)
  }

  return (
    <>
      <CHeader position="sticky">
        <CContainer fluid>
          <CHeaderToggler
            className="ps-1"
            onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          >
            <CIcon icon={cilMenu} size="lg" />
          </CHeaderToggler>

          <div className="d-flex align-items-center">
            {decoded.role[0].name !== process.env.REACT_APP_FE &&
              decoded.role[0].name !== process.env.REACT_APP_BROKER && (
                <MaterFilter userData={userData} />
              )}

            <CHeaderBrand className="mx-auto d-md-none mms-2" to="/">
           
            </CHeaderBrand>
          </div>

          {decoded.role[0].name === process.env.REACT_APP_COO && (
            <CButton className="add_new w-lg-10 mx-2" onClick={() => navigate(`/case/create`)}>
              Create Case
            </CButton>
          )}

          {(decoded.role[0].name === process.env.REACT_APP_ADMIN ||
            decoded.role[0].name === process.env.REACT_APP_COO ||
            decoded.role[0].name === process.env.REACT_APP_RA ||
            decoded.role[0].name === process.env.REACT_APP_SFO ||
            decoded.role[0].name === process.env.REACT_APP_RC ||
            decoded.role[0].name === process.env.REACT_APP_LCTO ||
            decoded.role[0].name === process.env.REACT_APP_CTO ||
            decoded.role[0].name === RC ||
            decoded.role[0].name === LCTO ||
            decoded.role[0].name === CTO ||
            decoded.role[0].name === SFO) && (
            <CButton
              onClick={() => navigate('/case/all/concern')}
              className="concorn mx-2 position-relative"
            >
              CONCERN
              {concernTotal !== null && concernTotal !== undefined && (
                <CBadge color="danger" position="top-end" shape="rounded-pill">
                  {concernTotal}
                </CBadge>
              )}
            </CButton>
          )}

          {decoded.role[0].name === process.env.REACT_APP_FE && (
            <CButton
              onClick={() => navigate('/case/all/concern')}
              className="concorn mx-2 position-relative"
            >
              CONCERN
              {concernUpdatedTotal !== null && concernUpdatedTotal !== undefined && (
                <CBadge color="danger" position="top-end" shape="rounded-pill">
                  {concernUpdatedTotal}
                </CBadge>
              )}
            </CButton>
          )}

          {(decoded.role[0].name == SDM ||
            decoded.role[0].name == DM ||
            decoded.role[0].name == RC ||
            decoded.role[0].name == LCTO ||
            decoded.role[0].name == ADMIN ||
            decoded.role[0].name == CTO) && (
            <CButton
              onClick={() => setVisibleQuickLinkModel(!visibleQuickLinkModel)}
              className="concorn mx-2 position-relative"
            >
              Quick Links
            </CButton>
          )}

          {/* Force Pin Button */}
          <CButton
            color="success"
            className="concorn1 mx-2 position-relative"
            onClick={() => setVisibleForcePinModal(true)}
          >
            ADD FORCE PIN
          </CButton>

          <CHeaderNav className="d-none d-md-flex me-auto"></CHeaderNav>

          {/* Here i want to set bell icon for or notification icon for announcement  */}
          <CHeaderNav className="me-3">
            <CButton
              className="position-relative rounded-circle d-flex align-items-center justify-content-center"
              color="light"
              style={{ width: '45px', height: '45px', padding: 0, top: '4px' }}
              onClick={() => navigate('/announcement')}
            >
              <CIcon icon={cilBell} style={{ fontSize: '1.5rem', height: '28px', width: '28px' }} />
              {announcementCount > 0 && (
                <CBadge  
                  position="top-end" 
                  shape="rounded-pill"
                  style={{ backgroundColor: '#dc3545', fontWeight: 'bold' }}
                >
                  {announcementCount}
                </CBadge>
              )}
            </CButton>
          </CHeaderNav>

          <CHeaderNav className="align-items-center">
            {/* <span className="text-capitalize">{`  ${userData?.role?.[0]?.name ?? '-'}`}</span> */}
            <div className="text-end">
              {/* ROLE */}
              <div className="fw-semibold text-capitalize" style={{ lineHeight: '1.2' }}>
                {userData?.role?.[0]?.name ?? '-'}
              </div>

              {/* USER NAME */}
              <div
                // className="text-muted"
                style={{
                  fontSize: '12px',
                  lineHeight: '1',
                  marginTop: '2px',
                  color: '#90979bff',
                  fontWeight: 'bold',
                }}
              >
                {userData?.name || userData?.email || ''}
              </div>
            </div>
            {/* Online Status Indicators */}
            {isOnline && (
              <div className="ms-2">
                <span
                  className="badge bg-success rounded-circle online-dot"
                  style={{ width: '12px', height: '12px' }}
                ></span>
                <small className="ms-1 text-success fw-bold">Online</small>
              </div>
            )}
            {showToggle && (
              <div className="ms-2">
                <CButton
                  size="sm"
                  color="outline-secondary"
                  onClick={handleToggleOn}
                  className="toggle-btn"
                >
                  Go Online
                </CButton>
              </div>
            )}
            <AppHeaderDropdown
              userData={userData}
              mutualAdmins={mutualAdmins}
              primeryAdmin={primeryAdmin}
              punchStatus={punchStatus}
            />
          </CHeaderNav>
        </CContainer>
      </CHeader>

      <ViewQuickLinks
        visible={visibleQuickLinkModel}
        close={() => setVisibleQuickLinkModel(false)}
      />

      {/* Force Pin Modal */}
      <ForcePinModal
        visible={visibleForcePinModal}
        close={handleClose}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      {/* Punch In Modal */}
      <PunchInModal
        visible={showPunchInModal}
        onYes={handlePunchIn}
        onNo={handlePunchInNo}
        userData={userData}
        isPunchingIn={isPunchingIn}
      />
    </>
  )
}

export default AppHeader
