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
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilAddressBook, cilApps, cilArrowBottom, cilArrowTop, cilBan, cilBank, cilNoteAdd, cilNotes, cilOptions, cilPaperclip, cilPencil } from '@coreui/icons'
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


const RCWidgetToday = ({ counts }) => {
  const navigate = useNavigate()

  return (
    <>
      <CRow className="cust_side_box mt-4">
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilApps} size="3xl" />}
            padding={false}
            title="Today Cases"
            value={counts?.allCasesCount}
            color="success"
          // style={{ color: '#00FF00' }}
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard visit"
            icon={<CIcon width={24} icon={cilNoteAdd} size="xl" />}
            padding={false}
            title="Today Visit Done"
            value={counts?.visitDone}
            color="success"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilNotes} size="xl" />}
            padding={false}
            title="Today Draft Done"
            value={counts?.draftDone}
            color="success"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard "
            icon={<CIcon width={24} icon={cilPencil} size="xl" className="" />}
            padding={false}
            title="Today RC Done"
            value={counts?.rcDone}
            color="success"
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard rc"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="Today Submit To Bank"
            value={counts?.submittedToBank}
            color="success"
          />
        </CCol>

        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBan} size="xl" />}
            padding={false}
            title="Today Hold"
            value={counts?.hold}
            color="success"
          />
        </CCol>

        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBell} size="xl" />}
            padding={false}
            title="Today Over TAT"
            value={counts?.overtatCount}
            color="success"
          />
        </CCol>


        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="Today XYZ"
            value={6677667698}
            color="success"
          />
        </CCol>



      </CRow>

    </>

  )
}

export default RCWidgetToday
