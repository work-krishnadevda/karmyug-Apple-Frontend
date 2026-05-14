import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  CRow,
  CCol,
  CWidgetStatsF,
  CFormLabel,
  CButton,
  CToastClose,
  CSpinner,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import {
  cil3d,
  cil4k,
  cilAlbum,
  cilAlignCenter,
  cilApple,
  cilBank,
  cilCalendar,
  cilMap,
  cilNoteAdd,
  cilPenAlt,
  cilPencil,
  cilPenNib,
  cilPin,
  cilRowing,
  cilSearch,
} from '@coreui/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { cilUser, cilSettings, cilMoon, cilBell } from '@coreui/icons'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import BasicProvider from 'src/constants/BasicProvider'
import { useSelector } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare } from '@fortawesome/free-regular-svg-icons'
import SwitchingHeader from 'src/components/SwitchingHeader'

let ADMIN = process.env.REACT_APP_ADMIN
let COO = process.env.REACT_APP_COO
let FE = process.env.REACT_APP_FE
let RA = process.env.REACT_APP_RA
let SDM = process.env.REACT_APP_SDM
let DM = process.env.REACT_APP_DM
let RC = process.env.REACT_APP_RC
let LCTO = process.env.REACT_APP_LCTO
let CTO = process.env.REACT_APP_CTO
let SFO = process.env.REACT_APP_SFO
let AC = process.env.REACT_APP_AC
let BROKER = process.env.REACT_APP_BROKER
let HR = process.env.REACT_APP_HR

const AdminWidget = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [date_from, setDateFrom] = useState(new Date())
  const [data, setData] = useState([])

  const [date_to, setDateTo] = useState(new Date())
  const [todayCasesCounts, setTodayCasesCounts] = useState(null)
  const [brokerPinCount, setBrokerPinCount] = useState({ broker: 0, sold: 0, sale: 0 })

  const effectRef = useRef(false)

  const loggedinUserRole = useSelector((state) => state?.userRole)
  const isAdminOrHR = loggedinUserRole?.name === ADMIN || loggedinUserRole?.name === HR


  const [loadingCounts, setLoadingCounts] = useState(false)
  const [showAllCards, setShowAllCards] = useState(false)
  const dashboardCardsRef = useRef(null)
  const cardsScrollTimeoutRef = useRef(null)
  const isCondensedDashboardRole =
    loggedinUserRole.name === ADMIN || loggedinUserRole.name === COO

  const getDashboardCardProps = ({ primary = false, order, allCases = false } = {}) => {
    const className = ['dashboard-card-shell']
    let style

    if (isCondensedDashboardRole) {
      if (allCases) {
        className.push('dashboard-card-all-cases')
      }

      if (primary) {
        className.push('dashboard-card-primary')
        style = { order: allCases ? 0 : order ?? 1 }
      } else {
        className.push('dashboard-card-extra')
        if (showAllCards) className.push('is-open')
        style = {
          order: allCases ? 0 : 100 + (order ?? 0),
          '--dashboard-card-delay': `${Math.max((order ?? 1) - 1, 0) * 45}ms`,
        }
      }
    }

    return { className: className.join(' '), style }
  }

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

  const handleSearch = async () => {
    setLoadingCounts(true)
    updatePageQueryParams({
      start_date: formatDate(date_from),
      end_date: formatDate(date_to),
    })

    try {
      const url = `cms/dashboard/date-wise-cases/counts?date_from=${formatDate(
        date_from,
      )}&date_to=${formatDate(date_to)}&data=true`
      const response = await new BasicProvider(url).getRequest()
      setTodayCasesCounts(response.data)

      const forcePinCount = await new BasicProvider(
        `properties/all-counts?startDate=${formatDate(date_from)}&endDate=${formatDate(date_to)}`,
      ).getRequest()

      if (forcePinCount?.data) {
        setTodayCasesCounts((prevCounts) => ({
          ...prevCounts,
          totalPinCount: forcePinCount.data?.totalPinCount,
          PinCountToday: forcePinCount.data?.PinCountToday,
          totalPinNotVerifyCount: forcePinCount.data?.totalPinNotVerifyCount,
          createdByYouPins: forcePinCount.data?.createdByYouPins,
          totalPinVerifyCount: forcePinCount.data?.totalPinVerifyWithDate,
          // totalPinVerifyCount: forcePinCount.data?.totalPinVerifyCount,.totalPinVerifyWithDate
        }))
      }
      setLoadingCounts(false)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      setLoadingCounts(false)
    } finally {
      setLoadingCounts(false)
    }
  }

  useEffect(() => {
    if (effectRef.current === false) {
      effectRef.current = true
      handleSearch()
    }
  }, [date_from, date_to])

  useEffect(() => {
    const handleForcePinCreated = () => {
      handleSearch()
      if (loggedinUserRole.name === BROKER) {
        fetchBrokers(1, 0) // Pass a high perPage value to get all data (or apply server-side date filter)
      }
    }
    window.addEventListener('forcePinCreated', handleForcePinCreated)
    return () => {
      window.removeEventListener('forcePinCreated', handleForcePinCreated)
    }
  }, [handleSearch])

  const fetchBrokers = useCallback(
    async (page, perPage) => {
      setLoadingCounts(true)
      // setError('')
      const provider_broker = new BasicProvider(
        `properties/filter?type=broker&limit=${perPage}&page=${page}&startDate=${formatDate(
          date_from,
        )}&endDate=${formatDate(date_to)}`,
      )
      const provider_sold = new BasicProvider(
        `properties/filter?type=sold&limit=${perPage}&page=${page}&startDate=${formatDate(
          date_from,
        )}&endDate=${formatDate(date_to)}`,
      )
      const provider_for_sale = new BasicProvider(
        `properties/filter?type=for sale&limit=${perPage}&page=${page}&startDate=${formatDate(
          date_from,
        )}&endDate=${formatDate(date_to)}`,
      ) // 👈 changed 'sold' to 'for_sale'

      try {
        const [res_broker, res_sold, res_for_sale] = await Promise.all([
          provider_broker.getRequest(),
          provider_sold.getRequest(),
          provider_for_sale.getRequest(),
        ])

        setBrokerPinCount({
          broker: res_broker.data.totalDocs,
          sold: res_sold.data.totalDocs,
          sale: res_for_sale.data.totalDocs,
        })
      } catch (err) {
        console.error(err?.message || 'Failed to fetch brokers')
        setBrokerPinCount(0)
      }
      setLoadingCounts(false)
    },
    [date_from, date_to],
  )

  useEffect(() => {
    if (loggedinUserRole.name === BROKER) {
      fetchBrokers(1, 0) // Pass a high perPage value to get all data (or apply server-side date filter)
    }
  }, [date_from, date_to, loggedinUserRole, fetchBrokers])

  useEffect(() => {
    return () => {
      if (cardsScrollTimeoutRef.current) {
        clearTimeout(cardsScrollTimeoutRef.current)
      }
    }
  }, [])

  const handleDashboardCardsToggle = () => {
    if (cardsScrollTimeoutRef.current) {
      clearTimeout(cardsScrollTimeoutRef.current)
    }

    if (showAllCards) {
      setShowAllCards(false)
      cardsScrollTimeoutRef.current = setTimeout(() => {
        dashboardCardsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 180)
      return
    }

    setShowAllCards(true)
    requestAnimationFrame(() => {
      dashboardCardsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  return (
    <>
      {loadingCounts && (
        <div className="spinner_outerbox" style={{ zIndex: 9998 }}>
          <div className="text-center">
            <CSpinner color="white" size="lg" style={{ width: '2rem', height: '2rem' }} />
            <p className="text-white">Loading Counts...</p>
          </div>
        </div>
      )}

      <CRow className="align-items-center dashboard-toolbar">
        <CCol xs={12} lg={5} className="py-1">
          <div className="dashboard-toolbar__switcher">
            <SwitchingHeader />
          </div>
        </CCol>
        <CCol xs={12} lg={7} className="py-1">
          <div className="dashboard-toolbar__filters">
            <div className="dashboard-toolbar__field">
              <DatePicker
                selected={date_from}
                onChange={(date) => {
                  effectRef.current = false
                  setDateFrom(date || new Date())
                }}
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
                onChange={(date) => {
                  effectRef.current = false
                  setDateTo(date || new Date())
                }}
                dateFormat="yyyy-MM-dd"
                className="form-control full dashboard-toolbar__input"
                size="sm"
                minDate={date_from}
                maxDate={new Date()}
                placeholderText="Select end date"
              />
              <CIcon className="dashboard-toolbar__icon" icon={cilCalendar} />
            </div>

            <CButton className="submit_btn dashboard-toolbar__search" onClick={handleSearch}>
              <span className="d-none d-sm-inline">Search</span>
              <CIcon className="d-sm-none" icon={cilSearch} />
            </CButton>
          </div>
        </CCol>
      </CRow>

      <CRow
        ref={dashboardCardsRef}
        className={`cust_side_box mt-4 dashboard-cards-grid${
          isCondensedDashboardRole ? ' dashboard-cards-grid--condensed' : ''
        }${showAllCards ? ' is-expanded' : ''}`}
      >
        {loggedinUserRole.name != HR && loggedinUserRole.name != BROKER && (
          <>
            {loggedinUserRole.name === AC ? (
              <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 1, allCases: true })}>
                <CWidgetStatsF
                  className="mb-3 overview_dashboard All-case"
                  icon={<CIcon width={24} icon={cil3d} size="xl" />}
                  padding={false}
                  title="ALL CASE"
                  style={{ cursor: 'pointer' }}
                  value={todayCasesCounts?.allCasesCount ?? 0}
                  color="danger"
                  onClick={() => {
                    navigate(
                      `/account/all?count=20&date_from=${formatDate(
                        date_from,
                      )}&date_to=${formatDate(date_to)}&data=allcase`,
                    )
                  }}
                />
              </CCol>
            ) : (
              <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 1, allCases: true })}>
                <CWidgetStatsF
                  className="mb-3 overview_dashboard All-case"
                  icon={<CIcon width={24} icon={cil3d} size="xl" />}
                  padding={false}
                  title="ALL CASE"
                  style={{ cursor: 'pointer' }}
                  value={todayCasesCounts?.allCasesCount ?? 0}
                  color="danger"
                  onClick={() => {
                    navigate(
                      `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                        date_to,
                      )}&data=allcase`,
                    )
                  }}
                />
              </CCol>
            )}
          </>
        )}
        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === RA ||
          loggedinUserRole.name === SFO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 2 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_accept`,
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
        )}

        {loggedinUserRole.name === FE && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 3 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_accept`,
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
        )}

        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === FE ||
          loggedinUserRole.name === RA ||
          loggedinUserRole.name === SFO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 3 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_tieup`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilPenNib} size="xl" />}
              padding={false}
              title="TIE-UP PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.pendingTieUp ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === FE || loggedinUserRole.name === COO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 1 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_visit`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="TIE-UP DONE"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.pendingforvisit ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === FE ||
          loggedinUserRole.name === RA ||
          loggedinUserRole.name === SFO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 2 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_visit`,
                )
              }}
              className="mb-3 overview_dashboard "
              icon={<CIcon width={24} icon={cilRowing} size="xl" className="" />}
              padding={false}
              title="VISIT PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.pendingforvisit ?? 0}
              color="info"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === RA || loggedinUserRole.name === SFO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 2 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&overtatvisitpending=yes&data=overtat_visit_pending`,
                )
              }}
              className="mb-3 overview_dashboard "
              icon={<CIcon width={24} icon={cilUser} size="xl" className="" />}
              padding={false}
              title=" OT VISIT PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.overtatVisitPending ?? 0}
              color="info"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === RA ||
          loggedinUserRole.name === FE ||
          loggedinUserRole.name === SFO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 4 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=visit_done`,
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
        )}

        {loggedinUserRole.name === AC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 3 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/account/visit-done?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&data=visit_done`,
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
        )}

        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === DM ||
          loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 5 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_draft`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPencil} size="xl" />}
              padding={false}
              title="DRAFT PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.draftPending ?? 0}
              color="warning"
            />
          </CCol>
        )}

        {loggedinUserRole.name === SDM && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 5 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_draft_all_comm`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPencil} size="xl" />}
              padding={false}
              title="DRAFT PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.draftPendingAllComm ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === SDM && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 8 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_rc
                    `,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPenAlt} size="xl" />}
              padding={false}
              title="Draft Done"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.pendingForRC ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === RA && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 9 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_rc`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilBell} size="xl" />}
              padding={false}
              title="Draft Done"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.pendingForRC ?? 0}
              color="danger"
            />
          </CCol>
        )}
        {(loggedinUserRole.name === ADMIN || loggedinUserRole.name === COO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 4 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=draft_done`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilNoteAdd} size="xl" />}
              padding={false}
              title="Draft Done"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.draftDone ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === DM && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 10 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_rc`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilNoteAdd} size="xl" />}
              padding={false}
              title="Draft Done"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.pendingForRC ?? 0}
              color="secondary"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === RC) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 13 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=rc_pending_all_comm`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilAlbum} size="xl" />}
              padding={false}
              title="ALL RC PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.rcPendingAllComm ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === RA || loggedinUserRole.name === SDM) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 14 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=rc_pending_all_comm`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilAlbum} size="xl" />}
              padding={false}
              title="RC PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.rcPendingAllComm ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === RC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 15 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_rc`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilAlbum} size="xl" />}
              padding={false}
              title="MY RC PENDING"
              value={todayCasesCounts?.pendingForRC ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === RC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 16 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_lcto`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="MY RC DONE"
              value={todayCasesCounts?.pendingForLCTO ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === SDM || loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 17 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=rc_done`,
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
        )}

        {(loggedinUserRole.name === ADMIN || loggedinUserRole.name === COO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 7 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=rc_done`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilAlignCenter} size="xl" />}
              padding={false}
              title="RC DONE"
              value={todayCasesCounts?.rcDone ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === SDM ||
          loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 3 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_lcto`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<FontAwesomeIcon icon={faSquare} size="xl" />}
              padding={false}
              title="LCTO PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.pendingForLCTO ?? 0}
              color="primary"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === ADMIN || loggedinUserRole.name === COO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 4 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=lcto_done`,
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
        )}

        {loggedinUserRole.name === SDM && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 7 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=lcto_done`,
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
        )}

        {(loggedinUserRole.name === SDM || loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 8 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_cto`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="CTO PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.pendingForCTO ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === RC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 9 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=assign_to_lcto`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="SUBMITTED TO LCTO"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.assignToLCTO ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === RC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 10 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=ot_rc`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="OVER TAT RC"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.overtatRC ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === LCTO && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 8 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_lcto`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="MY SV Pending"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.pendingForLCTO ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === LCTO && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 9 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=ot_sv`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="OVER TAT SV"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.overtatSV ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === LCTO ||
          (loggedinUserRole.name === CTO && (
            <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 6 })}>
              <CWidgetStatsF
                onClick={() => {
                  navigate(
                    `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                      date_to,
                    )}&data=pending_for_cto`,
                  )
                }}
                className="mb-3 overview_dashboard rc"
                icon={<CIcon width={24} icon={cilMoon} size="xl" />}
                padding={false}
                title=" MY SV PENDING"
                style={{ cursor: 'pointer' }}
                value={todayCasesCounts?.pendingForCTO ?? 0}
                color="warning"
              />
            </CCol>
          ))}

        {loggedinUserRole.name === LCTO && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 6 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_cto`,
                )
              }}
              className="mb-3 overview_dashboard rc"
              icon={<CIcon width={24} icon={cilMoon} size="xl" />}
              padding={false}
              title="MY SV DONE"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.pendingForCTO ?? 0}
              color="warning"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === ADMIN || loggedinUserRole.name === COO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 7 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_cto`,
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
        )}

        {loggedinUserRole.name !== HR &&
          loggedinUserRole.name !== FE &&
          loggedinUserRole.name !== AC &&
          loggedinUserRole.name !== BROKER &&
          loggedinUserRole.name !== SDM &&
          loggedinUserRole.name !== SFO && (
            <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 6 })}>
              <CWidgetStatsF
                onClick={() => {
                  navigate(
                    `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                      date_to,
                    )}&data=submitted_to_bank`,
                  )
                }}
                className="mb-3 overview_dashboard Query"
                icon={<CIcon width={24} icon={cilBell} size="xl" />}
                padding={false}
                title="Submitted To Bank"
                style={{ cursor: 'pointer' }}
                value={todayCasesCounts?.submittedToBank ?? 0}
                color="info"
              />
            </CCol>
          )}

        {loggedinUserRole.name === SDM && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 6 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=submitted_to_bank`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilBell} size="xl" />}
              padding={false}
              title="Submitted To Bank"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.submittedToBank ?? 0}
              color="danger"
            />
          </CCol>
        )}
        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === FE ||
          loggedinUserRole.name === RA ||
          loggedinUserRole.name === SFO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 7 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=concern_by_fe`,
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
        )}

        {(loggedinUserRole.name === RA ||
          loggedinUserRole.name === RC ||
          loggedinUserRole.name === LCTO ||
          loggedinUserRole.name === CTO ||
          loggedinUserRole.name === DM ||
          loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 10 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=hold`,
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
        )}
        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === SDM ||
          loggedinUserRole.name === SFO) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 10 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=hold`,
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
        )}

        {loggedinUserRole.name === AC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 9 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/account/hold?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=hold`,
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
        )}

        {loggedinUserRole.name === AC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 8 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/account/ra-indore?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&data=indore`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="RA INDORE"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.indoreRA ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === AC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 9 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/account/ra-ratlam?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&data=ratlam`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="RA Ratlam"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.ratlamRA ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === AC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 10 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/account/ra-dhar?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&data=dhar`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="RA Dhar"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.dharRA ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === AC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 15 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/account/ra-ujjain?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&data=ujjain`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="RA Ujjian"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.ujjianRA ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === AC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 16 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/account/ra-mandsaur?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&data=mandsaur`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="RA Mandsaur"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.mandsaurRA ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === AC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 17 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/account/report-in-process?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&data=report_in_process`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="Report in Process"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.reportInProcess ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === AC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 18 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/account/submitted-to-bank?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&data=submitted_to_bank`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilBell} size="xl" />}
              padding={false}
              title="Submitted To Bank"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.submittedToBank ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === AC && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 13 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/account/acknowledged?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&data=acknowledged`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilBell} size="xl" />}
              padding={false}
              title="Acknowledged"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.acknowledged ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === ADMIN && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 14 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=acknowledged`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilBell} size="xl" />}
              padding={false}
              title="Acknowledged"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.acknowledged ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === RC ||
          loggedinUserRole.name === LCTO ||
          loggedinUserRole.name === CTO ||
          loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ order: 9 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&tat=overtat&data=ut_submitted_to_bank`,
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
        )}

        {loggedinUserRole.name === SDM && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 8 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&tat=overtat&data=ut_submitted_to_bank`,
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
        )}

        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === RC ||
          loggedinUserRole.name === LCTO ||
          loggedinUserRole.name === CTO ||
          loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&tat=overtat&data=ot_submitted_to_bank`,
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
        )}

        {loggedinUserRole.name === SDM && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&tat=overtat&data=ot_submitted_to_bank`,
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
        )}

        {loggedinUserRole.name === LCTO && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=assign_to_cto`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="SUBMITTED TO CTO"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.assignToCTO ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === DM && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=assign_to_rc`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="SUBMITTED TO RC"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.assignToRC ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === DM && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=assign_to_lcto`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="SUBMITTED TO LCTO"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.assignToLCTO ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === DM && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=assign_to_cto`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="SUBMITTED TO CTO"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.assignToCTO ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === RC && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=assign_to_cto`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="SUBMITTED TO CTO"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.assignToCTO ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === SDM) && (
          <CCol sm={6} md={3} {...getDashboardCardProps({ primary: true, order: 8 })}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=over_tat`,
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
        )}

        {loggedinUserRole.name === FE && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=overtat_visit`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="OVER TAT VISIT"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.overtatVisit ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === DM && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=ot_draft`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="OVER TAT DRAFT"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.overtatDraft ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === SDM && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=visit_done`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="ASSIGN PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.visitDone ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === ADMIN || loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=assign_pending`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="ASSIGN PENDING"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.assignPending ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === SDM && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=pending_for_draft`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="ASSIGN DONE"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.draftPending ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === RA && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=over_tat`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="Branch Overtat"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.overtatCount ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === SFO ||
          loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=updated_by_authority`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilAlignCenter} size="xl" />}
              padding={false}
              title="Updated By Authority"
              value={todayCasesCounts?.updatedByAuthority ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {(loggedinUserRole.name === RC ||
          loggedinUserRole.name === LCTO ||
          loggedinUserRole.name === CTO) && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=send_back`,
                )
              }}
              className="mb-3 overview_dashboard All-case"
              icon={<CIcon width={24} icon={cilBank} size="xl" />}
              padding={false}
              title="ACTIVE SENT BACK"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.sendBack ?? 0}
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === DM && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/case/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&data=send_back`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilBell} size="xl" />}
              padding={false}
              title="ACTIVE SENT BACK"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.sendBack ?? 0}
              color="danger"
            />
          </CCol>
        )}
        {(loggedinUserRole.name === DM ||
          loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === RC ||
          loggedinUserRole.name === LCTO ||
          loggedinUserRole.name === CTO ||
          loggedinUserRole.name === FE ||
          // loggedinUserRole.name === BROKER ||
          loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/property/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&isVerify=true`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Verified Force Pins"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.totalPinVerifyCount ?? 0}
              color="danger"
            />
          </CCol>
        )}
        {(loggedinUserRole.name === DM ||
          loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === RC ||
          loggedinUserRole.name === LCTO ||
          loggedinUserRole.name === CTO ||
          loggedinUserRole.name === FE ||
          // loggedinUserRole.name === BROKER ||
          loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/property/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&isVerify=false`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Pending Force Pins"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.totalPinNotVerifyCount ?? 0}
              color="danger"
            />
          </CCol>
        )}
        {(loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === RC ||
          loggedinUserRole.name === LCTO ||
          loggedinUserRole.name === CTO ||
          loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/property/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilMap} size="xl" />}
              padding={false}
              title="Total Force Pins"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.PinCountToday ?? 0}
              color="info"
            />
          </CCol>
        )}
        {(loggedinUserRole.name === DM ||
          loggedinUserRole.name === FE ||
          loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === RC ||
          loggedinUserRole.name === LCTO ||
          loggedinUserRole.name === CTO ||
          loggedinUserRole.name === BROKER ||
          loggedinUserRole.name === RA) && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/property/all?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&createdByYou=true`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilMap} size="xl" />}
              padding={false}
              title="My Force Pins"
              style={{ cursor: 'pointer' }}
              value={todayCasesCounts?.createdByYouPins ?? 0}
              color="info"
            />
          </CCol>
        )}

        {loggedinUserRole.name === BROKER && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/property/sold?count=20&date_from=${formatDate(date_from)}&date_to=${formatDate(
                    date_to,
                  )}&createdByYou=true`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Sold Pin"
              style={{ cursor: 'pointer' }}
              value={brokerPinCount.sold ?? 0} // ✅ use updated value
              color="success"
            />
          </CCol>
        )}

        {loggedinUserRole.name === BROKER && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/property/for-sale?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&createdByYou=true`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="For Sale Pin"
              style={{ cursor: 'pointer' }}
              value={brokerPinCount.sale ?? 0} // ✅ use updated value
              color="danger"
            />
          </CCol>
        )}

        {loggedinUserRole.name === BROKER && (
          <CCol sm={6} md={3}>
            <CWidgetStatsF
              onClick={() => {
                navigate(
                  `/property/broker?count=20&date_from=${formatDate(
                    date_from,
                  )}&date_to=${formatDate(date_to)}&createdByYou=true`,
                )
              }}
              className="mb-3 overview_dashboard Query"
              icon={<CIcon width={24} icon={cilPin} size="xl" />}
              padding={false}
              title="Broker Pin"
              value={brokerPinCount.broker} // ✅ use updated value
              color="warning"
              style={{ cursor: 'pointer' }}
            />
          </CCol>
        )}
      </CRow>
      {isCondensedDashboardRole && (
        <div className="dashboard-cards-toggle-wrap">
          <button
            type="button"
            className="dashboard-cards-toggle"
            aria-expanded={showAllCards}
            onClick={handleDashboardCardsToggle}
          >
            {showAllCards ? 'Close' : 'See all'}
          </button>
        </div>
      )}
    </>
  )
}

export default AdminWidget
