import React, { useEffect } from 'react'
import {
  CRow,
  CCol,
  CWidgetStatsF,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilBank, cilOptions } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import {
  cilUser,
  cilSettings,
  cilMoon,
  cilBell,
} from '@coreui/icons'

const DmWidget = ({ counts }) => {

  const navigate = useNavigate()

  return (

    <>

<CRow className="cust_side_box mt-4">
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBell} size="xl" />}
            padding={false}
            title="All Case"
            value={counts?.allCasesCount}
            color="danger"
          />
        </CCol>

        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard visit"
            icon={<CIcon width={24} icon={cilSettings} size="xl" />}
            padding={false}
            title="My Draft"
            value={counts?.pendingDraftCount}
            color="primary"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="My Draft Done"
            value={counts?.pendingForRC}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard "
            icon={<CIcon width={24} icon={cilUser} size="xl" className="" />}
            padding={false}
            title="Submitted To Bank"
            value={counts?.submittedToBank}
            color="info"
          />
        </CCol>
      </CRow>

    
    </>



  )
}

export default DmWidget
