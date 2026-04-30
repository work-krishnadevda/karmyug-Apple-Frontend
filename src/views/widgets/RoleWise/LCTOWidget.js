import React, { useEffect, useRef, useState } from 'react'
import { CRow, CCol, CWidgetStatsF, CFormLabel, CButton, CToastClose, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBank,
  cilSearch,
} from '@coreui/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { cilUser, cilSettings, cilMoon, cilBell } from '@coreui/icons'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import BasicProvider from 'src/constants/BasicProvider'


const getDatesFromSearch = (search) => {
  const params = new URLSearchParams(search)
  const start = params.get('start_date')
  const end = params.get('end_date')
  if (start && end) {
    const d1 = new Date(start)
    const d2 = new Date(end)
    if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) return { from: d1, to: d2 }
  }
  const today = new Date()
  return { from: today, to: today }
}

const LCTOWidget = ({ counts }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const initialDates = getDatesFromSearch(location.search)
  const [date_from, setDateFrom] = useState(initialDates.from)
  const [date_to, setDateTo] = useState(initialDates.to)
  const [todayCasesCounts, setTodayCasesCounts] = useState(null)

  const effectRef = useRef(false)
  const [loadingCounts, setLoadingCounts] = useState(false)

  // Sync date state from URL when location.search changes (e.g. refresh with params, back/forward)
  useEffect(() => {
    const { from, to } = getDatesFromSearch(location.search)
    const urlDifferent =
      date_from.getTime() !== from.getTime() || date_to.getTime() !== to.getTime()
    if (urlDifferent) {
      setDateFrom(from)
      setDateTo(to)
      effectRef.current = false
    }
  }, [location.search])

  const updatePageQueryParams = (params) => {
    const searchParams = new URLSearchParams(location.search)

    Object.keys(params).forEach((key) => {
      searchParams.set(key, params[key])
    })
    navigate({ search: searchParams.toString() })
  }

  const formatDate = (date) => {
    if (!date) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Handle search functionality
  const handleSearch = async () => {
    setLoadingCounts(true)

    updatePageQueryParams({
      start_date: formatDate(date_from),
      end_date: formatDate(date_to),
    })

    try {
      const url = `cms/dashboard/date-wise-cases/counts?date_from=${formatDate(
        date_from,
      )}&date_to=${formatDate(date_to)}&data=true&super=true`
      const response = await new BasicProvider(url).getRequest()
      setTodayCasesCounts(response.data)
      setLoadingCounts(false)
    } catch (error) {
      setLoadingCounts(false)
      console.error('Error fetching chart data:', error)
    } finally {
      setLoadingCounts(false)
    }

  }

  useEffect(() => {

    if (effectRef.current === false) {
      effectRef.current = true;
      handleSearch()

    }

  }, [location.search, date_from, date_to])

  return (
    <>
      {
        loadingCounts && (
          <div className="spinner_outerbox" style={{ zIndex: 9998 }}>
            <div className="text-center">
              <CSpinner color='white' size="lg" style={{ width: '2rem', height: '2rem' }} />
              <p className='text-white'>Loading Counts...</p>
            </div>
          </div>
        )
      }
      <CRow className="mt-4">
        <CCol xs={5} sm={5} md={4} lg={4} className="pe-1 pe-lg-2 py-1">
          <DatePicker
            selected={date_from}
            onChange={(date) => {
              effectRef.current = false
              setDateFrom(date || new Date())
            }}
            dateFormat="yyyy-MM-dd"
            className="form-control full py-2"
            size="sm"
            maxDate={date_to} // Optional: Prevent selecting a start date after the end date
            placeholderText="Select start date"
          />
        </CCol>
        <CCol xs={5} sm={5} md={4} lg={4} className="pe-1 pe-lg-2 ps-0 py-1">
          <DatePicker
            selected={date_to}
            onChange={(date) => {
              effectRef.current = false
              setDateTo(date || new Date())
            }}
            dateFormat="yyyy-MM-dd"
            className="form-control full py-2"
            size="sm"
            minDate={date_from} // Optional: Prevent selecting an end date before the start date
            placeholderText="Select end date"
          />
        </CCol>
        <CCol
          xs={2}
          sm={5}
          md={4}
          lg={2}
          className="pe-md-0 py-1 ps-lg-2 ps-0 d-flex justify-content-center align-items-center"
        >
          <CButton className="submit_btn w-100 d-lg-block d-none" onClick={handleSearch}>
            Search
          </CButton>
          <CButton className="submit_btn w-100 d-lg-none d-block" onClick={handleSearch}>
            <CIcon icon={cilSearch} />
          </CButton>
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
            value={todayCasesCounts?.allCasesCount ?? 0}
            color="danger"
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=allcase&super=true`,
              )
            }}
          />
        </CCol>


        <CCol sm={6} md={3}>
          <CWidgetStatsF
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=pendign_for_accept&super=true`,
              )
            }}
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
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=pending_tieup&super=true`,
              )
            }}
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="TIE-UP PENDING"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.pendingTieUp ?? 0}
            color="danger"
          />
        </CCol>





        <CCol sm={6} md={3}>
          <CWidgetStatsF
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=pending_for_visit&super=true`,
              )
            }}
            className="mb-3 overview_dashboard "
            icon={<CIcon width={24} icon={cilUser} size="xl" className="" />}
            padding={false}
            title="VISIT PENDING"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.pendingforvisit ?? 0}
            color="info"
          />
        </CCol>


        <CCol sm={6} md={3}>
          <CWidgetStatsF
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=visit_done&super=true`,
              )
            }}
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
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=pending_for_draft&super=true`,
              )
            }}
            className="mb-3 overview_dashboard Query"
            icon={<CIcon width={24} icon={cilBell} size="xl" />}
            padding={false}
            title="DRAFT PENDING"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.draftPending ?? 0}
            color="danger"
          />
        </CCol>

        <CCol sm={6} md={3}>
          <CWidgetStatsF
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=draft_done&super=true`,
              )
            }}

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

            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=rc_pending_all_comm&super=true`,
              )
            }}

            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title=" ALL RC PENDING"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.rcPendingAllComm ?? 0}
            color="danger"
          />
        </CCol>

        <CCol sm={6} md={3}>
          <CWidgetStatsF
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=rc_done&super=true`,
              )
            }}
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="RC DONE"
            value={todayCasesCounts?.rcDone ?? 0}
            color="danger"
          />
        </CCol>

        <CCol sm={6} md={3}>
          <CWidgetStatsF
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=pending_for_lcto&super=true`,
              )
            }}

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
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=lcto_done&super=true`,
              )
            }}
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="LCTO DONE"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.lctoDone ?? 0}
            color="danger"
          />
        </CCol>






        <CCol sm={6} md={3}>
          <CWidgetStatsF
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=pending_for_cto&super=true`,
              )
            }}
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
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=concern_by_fe&super=true`,
              )
            }}
            className="mb-3 overview_dashboard All-case"
            icon={<CIcon width={24} icon={cilBank} size="xl" />}
            padding={false}
            title="concern By FE"
            style={{ cursor: 'pointer' }}
            value={todayCasesCounts?.concernFE ?? 0}
            color="danger"
          />
        </CCol>


        <CCol sm={6} md={3}>
          <CWidgetStatsF
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=hold&super=true`,
              )
            }}
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
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&tat=overtat&data=ut_submitted_to_bank&super=true`,
              )
            }}

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
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&tat=overtat&data=ot_submitted_to_bank&super=true`,
              )
            }}
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
            onClick={() => {
              navigate(
                `/case/all?count=20&date_from=${formatDate(
                  date_from,
                )}&date_to=${formatDate(date_to)}&data=over_tat&super=true`,
              )
            }}

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

export default LCTOWidget
