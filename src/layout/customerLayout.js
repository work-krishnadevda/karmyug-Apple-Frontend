//customerLayout.js

import { CCol, CRow } from '@coreui/react'
import CustomerSidebar from 'src/components/CustomerSidebar'
import CustomerContent from '../components/CustomerContent'

const CustomerLayout = () => {
  return (
    <div className="px-3 pt-4">
      <CRow>
        <CCol md={4}>
          <CustomerSidebar />
        </CCol>
        <CCol md={8}>
          <CustomerContent />
        </CCol>
      </CRow>
    </div>
  )
}

export default CustomerLayout
