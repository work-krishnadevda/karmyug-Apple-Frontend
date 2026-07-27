import React, { useEffect } from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import SwitchingHeader from 'src/components/SwitchingHeader'
import { useLocation } from 'react-router-dom'
import useUserStatusCheck from 'src/hooks/useUserStatusCheck'
import useLeaveApprovalCheck from 'src/hooks/useLeaveApprovalCheck'
import AutoPunchOutWarning from 'src/constants/AutoPunchOutWarning'
import OfferPopupManager from 'src/components/offers/OfferPopupManager'
import CelebrationPopupManager from 'src/components/celebration/CelebrationPopupManager'
import { initPushNotifications } from 'src/helpers/pushNotifications'

const DefaultLayout = () => {
  const location = useLocation()
 
  useUserStatusCheck(30000, true)
 
  useLeaveApprovalCheck(30000, true)

  useEffect(() => {
    initPushNotifications().catch((error) => {
      console.warn('Push notification init failed:', error?.message || error)
    })
  }, [])

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <AutoPunchOutWarning />
        {location.pathname !== '/dashboard' && location.pathname !== '/hrms' && (
          <div className="page-switcher-shell">
            <div className="dashboard-toolbar dashboard-toolbar--standalone">
              <div className="dashboard-toolbar__switcher">
                <SwitchingHeader />
              </div>
            </div>
          </div>
        )}
        <CelebrationPopupManager />
        <OfferPopupManager />

        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
