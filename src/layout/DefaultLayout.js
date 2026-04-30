import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import SwitchingHeader from 'src/components/SwitchingHeader'
import useUserStatusCheck from 'src/hooks/useUserStatusCheck'
import useLeaveApprovalCheck from 'src/hooks/useLeaveApprovalCheck'
import AutoPunchOutWarning from 'src/constants/AutoPunchOutWarning'
import OfferPopupManager from 'src/components/offers/OfferPopupManager'
import CelebrationPopupManager from 'src/components/celebration/CelebrationPopupManager'

const DefaultLayout = () => {
 
  useUserStatusCheck(30000, true)
 
  useLeaveApprovalCheck(30000, true)

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <AutoPunchOutWarning />
        <SwitchingHeader />
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
