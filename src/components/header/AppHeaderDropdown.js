import React, { useState, useEffect } from 'react'
import { resetPunchInStatus, checkPunchInAvailability, fetchProfileData } from 'src/store'

import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CImage,
} from '@coreui/react'
import { cilLockUnlocked, cilClock } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import AuthHelpers from 'src/helpers/authHelper'
import { useNavigate, useParams } from 'react-router-dom'
import noImage from 'src/assets/images/noImage.png'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch, useSelector } from 'react-redux'
import LogoutModal from '../custom/popup/LogoutModal'
import PunchInModal from '../custom/popup/PunchInModal'
import PunchOutModal from '../custom/popup/PunchOutModal'

import Cookies from 'js-cookie'
import { useUserAttendanceActions } from 'src/hooks/useAttendance'

const URL = process.env.REACT_APP_NODE_URL

const AppHeaderDropdown = ({
  userData,
  mutualAdmins,
  primeryAdmin,
  onLogoutClick,
  punchStatus,
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [signedUrl, setSignedUrl] = useState(null)
  const [profilePicture, setProfilePicture] = useState(null)
  const [todayDoneSettings, setTodayDoneSettings] = useState(null)
  const profileData = useSelector((state) => state.profileData)
  const offerBlocksPunchModal = useSelector(
    (state) => !!state.offerPopup?.blockPunchModalForOffer,
  )

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (userData?.featured_image) {
        try {
          const response = await new BasicProvider(
            `cms/files/signed-url?key=${userData.featured_image}`,
            dispatch,
          ).getRequest()
          setSignedUrl(response.data.url)
        } catch (error) {
          console.error('Error fetching signed URL:', error)
          setSignedUrl(null)
        }
      }
    }
    fetchSignedUrl()
  }, [userData?.featured_image, dispatch])

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showPunchInModal, setShowPunchInModal] = useState(false)
  const [showPunchOutModal, setShowPunchOutModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPunchingIn, setIsPunchingIn] = useState(false)
  const [isPunchingOut, setIsPunchingOut] = useState(false)

  useEffect(() => {
    if (profileData?.today_done_settings) {
      setTodayDoneSettings(profileData.today_done_settings)
    }
  }, [profileData?.today_done_settings])

  // Fetch latest today_done_settings when punch out modal opens
  useEffect(() => {
    const fetchTodayDoneSettings = async () => {
      if (showPunchOutModal) {
        try {
          const response = await new BasicProvider('profiles', dispatch).getRequest()
          if (response?.data?.today_done_settings) {
            setTodayDoneSettings(response.data.today_done_settings)
          }
        } catch (error) {
          console.error('Error fetching today done settings:', error)
        }
      }
    }
    fetchTodayDoneSettings()
  }, [showPunchOutModal, dispatch])
  const { handlePunchIn, handlePunchOut, isPunchingIn: isPunchingInFromHook } = useUserAttendanceActions()

  // const checkPunchStatus = async () => {
  //   try {
  //     const response = await new BasicProvider(`attendances/today`, dispatch).getRequest()
  //     const todayData = response?.data
  //     if (!todayData) {
  //       // No record today → show punch in modal
  //       setPunchStatus({ isPunchedIn: false })
  //       setShowPunchInModal(true)
  //     } else {
  //       const sessions = todayData.sessions || []
  //       const lastSession = sessions[sessions.length - 1]
  //       if (lastSession && lastSession.punch_out) {
  //         setPunchStatus({ isPunchedIn: false })
  //         setShowPunchInModal(true)
  //       } else if (lastSession && !lastSession.punch_out) {
  //         // Active session
  //         setPunchStatus({ isPunchedIn: true, punchInTime: lastSession.punch_in })
  //         setShowPunchOutModal(true)
  //       } else {
  //         // Already punched out
  //         setPunchStatus({ isPunchedIn: false, punchOutTime: lastSession?.punch_out })
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error checking punch status:', error)
  //     setPunchStatus({ isPunchedIn: false })
  //   }
  // }

  let createLoginActivity = async (type) => {
    try {
      const response = await new BasicProvider('login-activity/create', dispatch).postRequest({
        type: type,
      })
    } catch (error) {
      console.error('Error creating login activity:', error)
    }
  }

  let handleSwitchRole = async (user) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await new BasicProvider(`admins/switch-role`, dispatch).postRequest({
        user,
      })

      if (response?.data?.token) {
        // Set cookies with proper configuration
        const cookieOptions = {
          expires: 30,
          path: '/',
          sameSite: 'strict',
        }

        // Only set domain if it's not localhost
        if (process.env.REACT_APP_URL && !process.env.REACT_APP_URL.includes('localhost')) {
          cookieOptions.domain = process.env.REACT_APP_URL
        }

        Cookies.set(
          `${process.env.REACT_APP_COOKIE_PREFIX}_auth`,
          response.data.token,
          cookieOptions,
        )
        Cookies.set(`current_user_id`, response?.data?.data?._id, cookieOptions)
        Cookies.set(`current_user_role`, response?.data?.data?.role[0]?.name, cookieOptions)

        dispatch({ type: 'set', isLogin: true })
        navigate('/dashboard')
        window.location.reload()
      } else {
        console.error('Invalid response format for role switch')
      }
    } catch (error) {
      console.error('Error switching role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoutClick = () => {
    if (onLogoutClick) {
      onLogoutClick()
    } else {
      setShowLogoutModal(true)
    }
  }

  const handlePunchInClick = () => {
    if (offerBlocksPunchModal) return
    setShowPunchInModal(true)
  }

  const handlePunchOutClick = () => {
    setShowPunchOutModal(true)
  }

  // ✅ Enhanced Punch-In Handler
  const handlePunchInConfirm = async (data = {}) => {
    if (isPunchingIn || isPunchingInFromHook) return

    // Don't set local state - rely on hook's state management
    try {
      console.log('AppHeaderDropdown: Confirming punch-in')
      await handlePunchIn(data)
      setShowPunchInModal(false)
      console.log('AppHeaderDropdown: Punch-in successful')
    } catch (error) {
      console.error('AppHeaderDropdown: Punch-in failed:', error)
      // Modal will stay open for user to retry
      // Don't reset loading state here - let hook manage it
    }
  }

  // ✅ Enhanced Punch-Out Handler
  // const handlePunchOutConfirm = async (data) => {
  //   if (isPunchingOut) return

  //   setIsPunchingOut(true)
  //   try {
  //     console.log('AppHeaderDropdown: Confirming punch-out')
  //     await handlePunchOut(data)
  //     setShowPunchOutModal(false)
  //     console.log('AppHeaderDropdown: Punch-out successful')

  //     // Auto logout after punch out
  //     console.log('AppHeaderDropdown: Redirecting to login after punch out')
  //     await handleLogoutYes()
  //   } catch (error) {
  //     console.error('AppHeaderDropdown: Punch-out failed:', error)

  //     // Handle specific backend validation errors
  //     if (error.message && error.message.includes('not a valid enum value')) {
  //       console.log('AppHeaderDropdown: Backend validation error detected')
  //       console.log('AppHeaderDropdown: This is a backend schema issue, not frontend')
  //       console.log('AppHeaderDropdown: Closing modal anyway since status will be updated')
  //     }

  //     // Even if punch-out fails, close modal and redirect to login
  //     setShowPunchOutModal(false)
  //     console.log('AppHeaderDropdown: Redirecting to login after punch out (even with error)')
  //     await handleLogoutYes()
  //   } finally {
  //     setIsPunchingOut(false)
  //   }
  // }

  const handlePunchOutConfirm = async (data) => {
    if (isPunchingOut) return

    setIsPunchingOut(true)
    try {
      console.log('AppHeaderDropdown: Confirming punch-out')
      await handlePunchOut(data)

      // ✅ STEP 1 — Update Redux punchInStatus manually
      dispatch({
        type: 'set',
        punchInStatus: {
          ...window.store.getState().punchInStatus,
          isOnline: false, // user now offline after punch-out
          canPunchIn: true, // allow next punch-in
          showModal: false,
          showToggle: false,
          punchInDisabledReason: null,
        },
      })

      // ✅ STEP 2 — Reset Redux and recheck availability properly
      dispatch({ type: 'resetPunchInStatus' })

      if (userData?._id) {
        await dispatch(fetchProfileData(userData._id))
      }

      dispatch(checkPunchInAvailability())

      console.log('✅ Redux after punch-out:', window.store.getState().punchInStatus)
      console.log(
        '✅ Profile after refresh:',
        window.store.getState().profileData.auto_punchout_settings,
      )

      // ✅ STEP 3 — Close modal and proceed with logout
      setShowPunchOutModal(false)
      console.log('AppHeaderDropdown: Punch-out successful')
      await handleLogoutYes()
    } catch (error) {
      console.error('AppHeaderDropdown: Punch-out failed:', error)
      setShowPunchOutModal(false)
      await handleLogoutYes()
    } finally {
      setIsPunchingOut(false)
    }
  }
  // Load profile image
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

  // const handlePunchIn = async () => {
  //   try {
  //     const response = await new BasicProvider(`attendances/punch-in`, dispatch).postRequest({
  //       photo_url: 'selfie.png', // optional if you capture photo
  //     })

  //     const punchData = response?.data?.data
  //     setPunchStatus({
  //       isPunchedIn: true,
  //       punchInTime: punchData?.sessions?.slice(-1)[0]?.punch_in,
  //     })
  //     setShowPunchInModal(false)

  //     localStorage.setItem('lastActivity', Date.now().toString())
  //   } catch (error) {
  //     console.error('Error punching in:', error)
  //   }
  // }

  // const handlePunchOut = async () => {
  //   try {
  //     const response = await new BasicProvider(`attendances/punch-out`, dispatch).postRequest({})

  //     const punchData = response?.data?.data
  //     const lastSession = punchData?.sessions?.slice(-1)[0]

  //     setPunchStatus({ isPunchedIn: false, punchOutTime: lastSession?.punch_out })
  //     setShowPunchOutModal(false)
  //   } catch (error) {
  //     console.error('Error punching out:', error)
  //   }
  // }

  const handleLogoutYes = async () => {
    try {
      // Clear all punch in statuses before logout
      clearAllPunchInStatuses()

      await createLoginActivity('logout')
      await AuthHelpers.logout(navigate)
      setShowLogoutModal(false)
      navigate('/login')
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if there's an error, we should still logout
      setShowLogoutModal(false)
      navigate('/login')
    }
  }

  const handleLogoutNo = () => {
    setShowLogoutModal(false)
  }

  // Function to clear all punch in statuses
  const clearAllPunchInStatuses = () => {
    try {
      // Clear localStorage
      const localStorageKeys = Object.keys(localStorage)
      localStorageKeys.forEach((key) => {
        if (key.startsWith('punchInStatus_')) {
          localStorage.removeItem(key)
          console.log(`Cleared localStorage: ${key}`)
        }
      })

      // Clear sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage)
      sessionStorageKeys.forEach((key) => {
        if (key.startsWith('punchInStatus_')) {
          sessionStorage.removeItem(key)
          console.log(`Cleared sessionStorage: ${key}`)
        }
      })

      console.log('All punch in statuses cleared successfully')
    } catch (error) {
      console.error('Error clearing punch in statuses:', error)
    }
  }

  const getAvatarSrc = () => {
    if (signedUrl) return signedUrl
    if (userData?.featured_image) return `${URL}/${userData.featured_image}`
    return noImage
  }

  const switchableRoles = (Array.isArray(mutualAdmins) ? mutualAdmins : []).filter(
    (admin) => admin?.role?.[0]?.display_name || admin?.role?.[0]?.name,
  )

  return (
    <>
      <CDropdown variant="nav-item">
        <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
          {userData && (
            <CImage
  
              src={
                profilePicture ||
                'https://static.vecteezy.com/system/resources/thumbnails/002/002/403/small/man-with-beard-avatar-character-isolated-icon-free-vector.jpg'
              }
              alt="Profile"
              
              style={{ width: '50px', height: '50px', objectFit: 'cover',borderRadius:'50%' }}
            />
          )}
        </CDropdownToggle>
        <CDropdownMenu className="pt-0 app-header-profile-menu" placement="bottom-end">
          {primeryAdmin && primeryAdmin?.role?.[0] && (
            <CDropdownItem
              onClick={() => handleSwitchRole(primeryAdmin)}
              href="#"
              className="mt-2 dropdown-item-with-dot"
              disabled={isLoading}
            >
              {isLoading ? 'Switching...' : primeryAdmin?.role?.[0]?.display_name || primeryAdmin?.role?.[0]?.name}
              {userData?.role?.[0]?.name === primeryAdmin?.role?.[0]?.name && (
                <span className="dot"></span>
              )}
            </CDropdownItem>
          )}
          {switchableRoles.length > 0 && (
            <>
              <CDropdownHeader className="bg-light fw-semibold py-2">
                Switchable Roles
              </CDropdownHeader>
              {switchableRoles.map((role, index) => (
                <CDropdownItem
                  onClick={() => handleSwitchRole(role)}
                  key={role?._id || index}
                  href="#"
                  className="mt-2 dropdown-item-with-dot"
                  disabled={isLoading}
                >
                  {isLoading ? 'Switching...' : role?.role?.[0]?.display_name || role?.role?.[0]?.name}
                  {userData?.role?.[0]?.name === role?.role?.[0]?.name && <span className="dot"></span>}
                </CDropdownItem>
              ))}
            </>
          )}
          <CDropdownDivider />
          {/* PUNCH-IN/PUNCH-OUT FUNCTIONALITY */}
          {punchStatus?.isPunchedIn ? (
            <CDropdownItem
              onClick={handlePunchOutClick}
              disabled={isPunchingOut}
              className={`dropdown-item-with-punch ${isPunchingOut ? 'opacity-50' : ''}`}
            >
              <CIcon icon={cilClock} className="me-2" />
              {isPunchingOut ? 'Processing...' : 'Punch Out'}
            </CDropdownItem>
          ) : (
            <CDropdownItem
              onClick={handlePunchInClick}
              disabled={isPunchingIn}
              className={`dropdown-item-with-punch ${isPunchingIn ? 'opacity-50' : ''}`}
            >
              <CIcon icon={cilClock} className="me-2" />
              {isPunchingIn ? 'Processing...' : 'Punch In'}
            </CDropdownItem>
          )}
          <CDropdownDivider />
          <CDropdownHeader>
            <br /> <strong style={{ color: 'grey' }}>{userData?.name || 'User'}</strong>
          </CDropdownHeader>
          <CDropdownItem onClick={handleLogoutClick}>
            <CIcon icon={cilLockUnlocked} className="me-2" />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      {/* Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onYes={handleLogoutYes}
        onNo={handleLogoutNo}
        userData={userData}
      />

      {/* Punch In Modal */}
      <PunchInModal
        visible={showPunchInModal}
        onYes={handlePunchInConfirm}
        onNo={() => setShowPunchInModal(false)}
        userData={userData}
        isPunchingIn={isPunchingInFromHook}
      />

      {/* Punch Out Modal */}
      <PunchOutModal
        visible={showPunchOutModal}
        onYes={handlePunchOutConfirm}
        onNo={() => setShowPunchOutModal(false)}
        userData={userData}
        punchInTime={punchStatus?.punchInTime}
        todayDoneSettings={todayDoneSettings}
      />
    </>
  )
}

export default AppHeaderDropdown
