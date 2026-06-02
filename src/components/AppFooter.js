import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <span className="ms-1">&copy; 2026 All rights reserved by Karmyug Pvt Ltd</span>
      </div>
      {/* <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
         Foduu
        </a>
      </div> */}
    </CFooter>
  )
}

export default React.memo(AppFooter)
