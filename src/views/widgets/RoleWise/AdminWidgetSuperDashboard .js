import React, { useEffect, useState } from 'react'
import { CRow, CCol, CWidgetStatsF, CFormLabel, CButton, CToastClose } from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilBank, cilCalendar, cilOptions } from '@coreui/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { cilUser, cilSettings, cilMoon, cilBell } from '@coreui/icons'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import BasicProvider from 'src/constants/BasicProvider'
import { useSelector } from 'react-redux'


let ADMIN = process.env.REACT_APP_ADMIN
let COO = process.env.REACT_APP_COO
let FE = process.env.REACT_APP_FE
let RA = process.env.REACT_APP_RA
let SDM = process.env.REACT_APP_SDM
let DM = process.env.REACT_APP_DM
let RC = process.env.REACT_APP_RC
let LCTO = process.env.REACT_APP_LCTO
let CTO = process.env.REACT_APP_CTO



const AdminWidgetSuperDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [date_from, setDateFrom] = useState(new Date());
  const [date_to, setDateTo] = useState(new Date());
  const [todayCasesCounts, setTodayCasesCounts] = useState(null);

  const loggedinUserRole = useSelector((state) => state?.userRole);

  const updatePageQueryParams = (params) => {
    const searchParams = new URLSearchParams(location.search);

    Object.keys(params).forEach(key => {
      searchParams.set(key, params[key]);
    });
    navigate({ search: searchParams.toString() })
  };

  const formatDate = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSearch = async () => {
    // Updat:)
    updatePageQueryParams({
      page: 1,
      start_date: formatDate(date_from),
      end_date: formatDate(date_to),

    });

    try {
      const url = `cms/dashboard/super-dashboard/date-wise-cases/counts?date_from=${formatDate(date_from)}&date_to=${formatDate(date_to)}`;
      const response = await new BasicProvider(url).getRequest();
      setTodayCasesCounts(response.data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [location.search, date_from, date_to]);


  return (
    <>
      <CRow className="mt-4 dashboard-toolbar dashboard-toolbar--standalone">
        <CCol xs={12} className="py-1">
          <div className="dashboard-toolbar__filters">
            <div className="dashboard-toolbar__field">
              <DatePicker
                selected={date_from}
                onChange={(date) => setDateFrom(date || new Date())}
                dateFormat="yyyy-MM-dd"
                className="form-control full dashboard-toolbar__input"
                size="sm"
                maxDate={date_to}
                placeholderText="Select start date"
              />
              <CIcon className="dashboard-toolbar__icon" icon={cilCalendar} />
            </div>

            <div className="dashboard-toolbar__field">
              <DatePicker
                selected={date_to}
                onChange={(date) => setDateTo(date || new Date())}
                dateFormat="yyyy-MM-dd"
                className="form-control full dashboard-toolbar__input"
                size="sm"
                minDate={date_from}
                placeholderText="Select end date"
              />
              <CIcon className="dashboard-toolbar__icon" icon={cilCalendar} />
            </div>

            <CButton className="submit_btn dashboard-toolbar__search" onClick={handleSearch}>
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
            title="ALL CASE"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.allCasesCount}
            color="danger"

          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard visit"
            icon={<CIcon width={24} icon={cilSettings} size="xl" />}
            padding={false}
            title="Pending For Accept"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.PenddingforAccept ?? 0}
            color="primary"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="TIE-UP PENDING"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.pendingTieUp}
            color="danger"
          />

        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard "
            icon={<CIcon width={24} icon={cilUser} size="xl" className="" />}
            padding={false}
            title="VISIT PENDING"
            value={todayCasesCounts?.pendingforvisit ?? 0}
            color="info"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard rc"
            icon={<CIcon width={24} icon={cilMoon} size="xl" />}
            padding={false}
            title="VISIT DONE"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.visitDone ?? 0}
            color="warning"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard Query"
            icon={<CIcon width={24} icon={cilBell} size="xl" />}
            padding={false}
            title="DRAFT PENDING"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.pendingDraftCount ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard Query"
            icon={<CIcon width={24} icon={cilBell} size="xl" />}
            padding={false}
            title="Draft Done"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.draftDone ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="RC PENDING"
            value={todayCasesCounts?.pendingForRC ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="RC DONE"
            value={todayCasesCounts?.pendingForLCTO ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="LCTO PENDING"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.pendingForLCTO ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="LCTO DONE"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.pendingForCTO ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard rc"
            icon={<CIcon width={24} icon={cilMoon} size="xl" />}
            padding={false}
            title="Pending For CTO"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.pendingForCTO ?? 0}
            color="warning"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard Query"
            icon={<CIcon width={24} icon={cilBell} size="xl" />}
            padding={false}
            title="Submitted To Bank"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.submittedToBank ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="concurn By FE"
            value={todayCasesCounts?.concernFE ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF

            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="Hold"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.hold ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="SUBMITTED TO BANK UT"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.submittedToBankUnderTat ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="SUBMITTED TO BANK OT"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.submittedToBankOverTat ?? 0}
            color="danger"
          />
        </CCol>
        <CCol sm={6} md={3}>
          <CWidgetStatsF
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="OVER TAT"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.overtatCount ?? 0}
            color="danger"
          />
        </CCol>
      </CRow>
    </>
  )
}

export default AdminWidgetSuperDashboard
