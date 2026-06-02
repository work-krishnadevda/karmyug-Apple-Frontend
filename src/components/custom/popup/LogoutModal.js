import React, { useState, useEffect } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CImage,
  CSpinner,
} from '@coreui/react'
import { useSelector, useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import realAppleLogo from 'src/assets/images/logo/Apple-logo.png'

const LogoutModal = ({ visible, onYes, onNo, userData }) => {
  const dispatch = useDispatch()
  const [profilePicture, setProfilePicture] = useState(null)
  const [loadingPicture, setLoadingPicture] = useState(true)

  // Generate signed URL for profile picture
  const generateSignedUrl = async (imageId) => {
    if (!imageId) return null

    try {
      // Handle case where imageId is an object (with file details)
      if (typeof imageId === 'object' && imageId !== null) {
        if (imageId.filepath) {
          const signedUrlResponse = await new BasicProvider(
            `cms/files/signed-url?key=${imageId.filepath}`,
            dispatch,
          ).getRequest()
          return signedUrlResponse.data?.url || null
        } else if (imageId._id) {
          // Use show-file-with-signed-url endpoint
          const signedUrlResponse = await new BasicProvider(
            `cms/files/show-file-with-signed-url/${imageId._id}`,
            dispatch,
          ).getRequest()
          return signedUrlResponse.data || null
        }
      }

      // Handle case where imageId is a string
      if (typeof imageId === 'string') {
        // If it looks like a filepath (contains slashes or uploads), use it directly
        if (imageId.includes('/') || imageId.includes('uploads')) {
          const signedUrlResponse = await new BasicProvider(
            `cms/files/signed-url?key=${imageId}`,
            dispatch,
          ).getRequest()
          return signedUrlResponse.data?.url || null
        }

        // If it's an ID, use the show-file-with-signed-url endpoint
        const signedUrlResponse = await new BasicProvider(
          `cms/files/show-file-with-signed-url/${imageId}`,
          dispatch,
        ).getRequest()
        return signedUrlResponse.data || null
      }

      return null
    } catch (error) {
      console.error('Error generating signed URL:', error)
      // Fallback to direct URL
      if (typeof imageId === 'object' && imageId?._id) {
        return `${process.env.REACT_APP_NODE_URL}/files/${imageId._id}`
      }
      if (typeof imageId === 'string') {
        return `${process.env.REACT_APP_NODE_URL}/files/${imageId}`
      }
      return null
    }
  }

  // Load profile picture when modal opens or userData changes
  useEffect(() => {
    const loadProfilePicture = async () => {
      if (!visible) return
      
      setLoadingPicture(true)
      try {
        // Try to get profileImage from userData first
        let imageId = userData?.profileImage || userData?.profile_picture || userData?.profile?.profileImage

        // If not in userData, fetch from profiles API
        if (!imageId) {
          try {
            const res = await new BasicProvider('profiles', dispatch).getRequest()
            imageId = res?.data?.profileImage
          } catch (err) {
            console.log('Profile fetch error:', err)
          }
        }

        if (!imageId) {
          setProfilePicture(null)
          setLoadingPicture(false)
          return
        }

        const signedUrl = await generateSignedUrl(imageId)
        setProfilePicture(signedUrl || null)
      } catch (error) {
        console.error('Error loading profile picture:', error)
        setProfilePicture(null)
      } finally {
        setLoadingPicture(false)
      }
    }

    loadProfilePicture()
  }, [visible, userData, dispatch])

  return (
    <CModal alignment="center" visible={visible} backdrop="static" className="logout-modal">
      <CModalHeader className="border-0 pb-2">
        <CModalTitle>Logout Confirmation</CModalTitle>
      </CModalHeader>
      <CModalBody className="text-center">
        {/* Real Apple Logo */}
        <div className="mb-4 d-flex justify-content-center align-items-center">
          <h3 style={{ fontWeight: '700', margin: 0 }}>
            <span style={{ color: '#dc3545' }}>ValuXpert</span>{' '}
            <span style={{ color: '#28a745' }}>Group</span>
          </h3>
        </div>
        <div className="mb-4">
          {loadingPicture ? (
            <div 
              className="d-flex justify-content-center align-items-center mb-3" 
              style={{ 
                width: 200, 
                height: 200, 
                margin: '0 auto',
                borderRadius: '50%',
                border: '4px solid #e9ecef',
                background: '#f8f9fa'
              }}
            >
              <CSpinner size="sm" />
            </div>
          ) : (
            <div 
              className="mb-3 mx-auto"
              style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #dee2e6',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8f9fa'
              }}
            >
              <CImage
                src={profilePicture || '/default-avatar.png'}
                width={140}
                height={140}
                style={{ 
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }}
                onError={(e) => {
                  e.target.src = '/default-avatar.png'
                }}
              />
            </div>
          )}
          <h5 className="mb-2 mt-3" style={{ fontWeight: 600, fontSize: '1.25rem' }}>
            {userData?.name || 'Employee Name'}
          </h5>
          <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
            {userData?.role?.[0]?.display_name || userData?.role?.[0]?.name || 'Role'}
          </p>
        </div>

        <div className="alert alert-warning mb-0">
          <h6 className="mb-0">Are you sure you want to logout?</h6>
        </div>
      </CModalBody>
      <CModalFooter className="justify-content-center">
        <CButton color="danger" className="me-3 px-5" onClick={onYes} style={{ fontWeight: 500 }}>
          Yes, Logout
        </CButton>
        <CButton color="secondary" className="px-5" onClick={onNo} style={{ fontWeight: 500 }}>
          No, Cancel
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default LogoutModal
