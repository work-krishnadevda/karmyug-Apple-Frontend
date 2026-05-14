import React from 'react'
import { AppHeader, AppFooter } from '../components/index'
import AppSidebar from '../components/AppSidebar'
import hrmsNav from '../_nav'
import HRMSContent from 'src/components/hrms/HRMSContent'
import HRMSHeader from 'src/components/HRMSHeader'
import SwitchingHeader from 'src/components/SwitchingHeader'
import { useLocation } from 'react-router-dom'

const HRMSLayout = () => {
  const location = useLocation()

  return (
    <div>
      <AppSidebar navItems={hrmsNav} />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        {/* <HRMSHeader /> */}
        <AppHeader />
        {location.pathname !== '/hrms' && (
          <div className="page-switcher-shell">
            <div className="dashboard-toolbar dashboard-toolbar--standalone">
              <div className="dashboard-toolbar__switcher">
                <SwitchingHeader />
              </div>
            </div>
          </div>
        )}
        <div className="body flex-grow-1">
          <HRMSContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default HRMSLayout
