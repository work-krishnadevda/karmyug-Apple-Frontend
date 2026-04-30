//customerLayout.js

import { CCol, CRow } from '@coreui/react'

import VendorSidebar from 'src/components/VendorSidebar'
import VendorContent from '../components/VemdorContent'

const VendorLayout = () => {
  return (
    <div className="px-3 pt-4">
      <CRow>
        <CCol md={4}>
          <VendorSidebar />
        </CCol>
        <CCol md={8}>
          <VendorContent />
        </CCol>
      </CRow>
    </div>
  )
}

export default VendorLayout
