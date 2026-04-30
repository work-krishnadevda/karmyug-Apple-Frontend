import React, { useEffect } from 'react'
import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
  CWidgetStatsF,
  CFormLabel,
  CButton,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilBank, cilOptions } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
  cilSettings,
  cilMoon,
  cilBell,
} from '@coreui/icons'


import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const WidgetSideBox = ({ counts }) => {

  const navigate = useNavigate()

  return (
    <>

      <CRow className="align-items-center">
        <CCol xs={6} sm={5} md={4} lg={3} className="pe-md-0">
          {/* <CFormLabel htmlFor="startDate">Start Date</CFormLabel> */}
          <DatePicker
            // selected={startDateTime}
            // onChange={(date) => setStartDateTime(date)}
            dateFormat="yyyy-MM-dd"
            className="form-control full py-2"
            size="sm"
            // maxDate={endDate} // Optional: Prevent selecting a start date after the end date
            placeholderText="Select start date"
          />
        </CCol>
        <CCol xs={6} sm={5} md={4} lg={3} className="pe-md-0">
          {/* <CFormLabel htmlFor="endDate">End Date</CFormLabel> */}
          <DatePicker
            // selected={endDate}
            // onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="form-control full py-2"
            size="sm"
            // minDate={startDateTime}
            placeholderText="Select end date"
          />
        </CCol>
        <CCol xs={12} sm={2} md={4} lg={2} className="">
          <CFormLabel></CFormLabel>
          <div className="text-center text-md-end">
            <CButton className="submit_btn w-100" onClick={''}>
              Search
            </CButton>
          </div>
        </CCol>
      </CRow>

      <CRow className="cust_side_box mt-4">

        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBell} size="xl" />}
            padding={false}
            title="All Case"
            value={0}
            color="danger"
          />
        </CCol>

        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard visit"
            icon={<CIcon width={24} icon={cilSettings} size="xl" />}
            padding={false}
            title="Pending For Visit"
            value={0}
            color="primary"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="Visit Done"
            value={0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard "
            icon={<CIcon width={24} icon={cilUser} size="xl" className="" />}
            padding={false}
            title="Pending From Draft"
            value={0}
            color="info"
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard rc"
            icon={<CIcon width={24} icon={cilMoon} size="xl" />}
            padding={false}
            title="Pending For RC"
            value={0}
            color="warning"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard Query"
            icon={<CIcon width={24} icon={cilBell} size="xl" />}
            padding={false}
            title="Case Under Query"
            value={0}
            color="danger"
          />
        </CCol>

        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="Submitted to Bank"
            value={0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="Submitted to Bank"
            value={0}
            color="danger"
          />
        </CCol>
      </CRow>


    </>
  )

}

export default WidgetSideBox
