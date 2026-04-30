import React, { useEffect, useState } from 'react'

import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CFormLabel,
  CRow,
} from '@coreui/react'
import { CChart, CChartDoughnut, CChartLine, CChartPie } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import BasicProvider from 'src/constants/BasicProvider'
import WidgetSideBox from '../widgets/WidgetSidebox'
import PieChart from '../charts/PieChart'
import DonutChart from '../charts/DonutChart'
import WidgetSideBoxToday from '../widgets/WidgetSideboxToday '
import { useDispatch, useSelector } from 'react-redux'
import AdminWidget from '../widgets/RoleWise/AdminWidget'
import FeWidgetRoll from '../widgets/RoleWise/FeWidget'
import FeWidget from '../widgets/fewidgets'
import SDMWidgetRoll from '../widgets/RoleWise/sdmwidget'
import SDMWidget from '../widgets/sdmwidgets'
import DMWidget from '../widgets/dmwidgets'
import DmWidget from '../widgets/RoleWise/dmWidgets'
import CooWidgetToday from '../widgets/CooWidgetToday'
import RAWidgetToday from '../widgets/raWidgetToday'
import RCWidgetToday from '../widgets/RcWidgetToday'
import LCTOWidgetToday from '../widgets/lctoWidgetstoday'
import CTOWidgetToday from '../widgets/lctoWidgetstoday'
import AsyncSelect from 'react-select/async'
import AdminWidgetSuperDashboard from '../widgets/RoleWise/AdminWidgetSuperDashboard '

let ADMIN = process.env.REACT_APP_ADMIN
let COO = process.env.REACT_APP_COO
let FE = process.env.REACT_APP_FE
let RA = process.env.REACT_APP_RA
let SDM = process.env.REACT_APP_SDM
let DM = process.env.REACT_APP_DM
let RC = process.env.REACT_APP_RC
let LCTO = process.env.REACT_APP_LCTO
let CTO = process.env.REACT_APP_CTO

const SuperDashboard = () => {
  let dispatch = useDispatch()

  let loggedinUserRole = useSelector((state) => state?.userRole)

  // const [startDateTime, setstartDateTime] = useState(
  //   new Date(new Date().setMonth(new Date().getMonth() - 1)),
  // )
  const [startDateTime, setStartDateTime] = useState(new Date())

  const [endDate, setEndDate] = useState(new Date())

  const [casesCounts, setCasesCounts] = useState(null)
  const [todayCasesCounts, setTodayCasesCounts] = useState(null)
  const [defaultOptions, setDefaultOptions] = useState([])
  const [casescountcharts, setcasecountChart] = useState([])
  const [casecountgraphical2, setcasecountgraphical2] = useState([])
  const [casecountgraphical3, setcasecountgraphical3] = useState([])

  //   const handleSearch = async () => {
  //     const results = await chartCases(formatted_Start_Date, formatted_End_Date);
  //     console.log(results);
  // };

  const [initialValues, setInitialValues] = useState({
    role: '',
  })
  const handleRoleChange = (selectedOption) => {
    setInitialValues((prevState) => ({
      ...prevState,
      role: selectedOption,
    }))
  }

  const handleSearch = async () => {
    const formatted_Start_Date = `${startDateTime.getFullYear()}-${String(
      startDateTime.getMonth() - 1,
    ).padStart(1, '0')}-${String(startDateTime.getDate()).padStart(2, '0')}`
    const formatted_End_Date = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(endDate.getDate()).padStart(2, '0')}`

    const roleId = initialValues.role ? initialValues.role.value : ''

    try {
      let url = `cms/dashboard/Cases-by-chart?startDate=${formatted_Start_Date}&endDate=${formatted_End_Date}`

      if (roleId) {
        url += `&roleId=${roleId}`
      }

      const response = await new BasicProvider(url).getRequest()

      setcasecountChart(response.data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    }
  }

  const loadOptionsGroup = async (inputValue, callback) => {
    try {
      const response = await new BasicProvider(
        `cms/categories/search?page=1&count=10&search=${inputValue}`,
      ).getRequest()

      const options = response.data.data.map((group) => ({
        label: group.display_name,
        value: group._id,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    defaultOptionsRoles()
  }, [])

  const defaultOptionsRoles = async () => {
    try {
      const response = await new BasicProvider('roles').getRequest()
      const options = response.data.data.map((role) => ({
        label: role.display_name,
        slug: role.name,
        value: role._id,
      }))

      setDefaultOptions(options)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchDashboardCountData()
  }, [])

  const fetchDashboardCountData = async () => {
    try {
      const response1 = await new BasicProvider(
        `cms/dashboard/cases-graph1/counts`,
        dispatch,
      ).getRequest()
      // console.log('response6786876======================>', response1)
      setCasesCounts(response1.data)

      const response3 = await new BasicProvider(`cms/dashboard/Cases-by-chart`).getRequest()
      setcasecountChart(response3.data)

      const response4 = await new BasicProvider(
        `cms/dashboard/cases/counts/getGraphical2`,
      ).getRequest()
      setcasecountgraphical2(response4.data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchData = async () => {
    const formatted_Start_Date = `${startDateTime.getFullYear()}-${String(
      startDateTime.getMonth() + 1,
    ).padStart(2, '0')}-${String(startDateTime.getDate()).padStart(2, '0')}`
    const formatted_End_Date = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(endDate.getDate()).padStart(2, '0')}`

    try {
      let url = `cms/dashboard/cases/counts/getGraphical3?startDate=${formatted_Start_Date}&endDate=${formatted_End_Date}`

      const response = await new BasicProvider(url).getRequest()

      setcasecountgraphical3(response.data)
      // console.log('response.data')
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (startDateTime && endDate) {
      fetchData()
    }
  }, [startDateTime, endDate])

  const [allCasesAnalyticChartData, setAllCasesAnalyticChartData] = useState([])
  const [allcasecountgraphical2, setAllcasecountgraphical2] = useState([])
  const [allcasecountgraphical3, setAllcasecountgraphical3] = useState([])
  const [allcasecountgraphicalDM2, setAllcasecountgraphicalDM2] = useState([])
  const [allcasecountgraphicalDM3, setAllcasecountgraphicalDM3] = useState([])
  const [allcasecountgraphicalFE2, setAllcasecountgraphicalFE2] = useState([])
  const [allcasecountgraphicalFE3, setAllcasecountgraphicalFE3] = useState([])
  const [allcasecountgraphicalRC3, setAllcasecountgraphicalRC3] = useState([])
  const [allcasecountgraphicalCTO2, setAllcasecountgraphicalCTO2] = useState([])
  const [allcasecountgraphicalLCTO2, setAllcasecountgraphicalLCTO2] = useState([])
  const [allcasecountgraphicalCTO3, setAllcasecountgraphicalCTO3] = useState([])
  const [allcasecountgraphicalLCTO3, setAllcasecountgraphicalLCTO3] = useState([])

  useEffect(() => {
    setAllCasesAnalyticChartData([casesCounts?.allCasesCount, casesCounts?.submittedToBank])
    setAllcasecountgraphical2([
      casecountgraphical2?.pendingFordm,
      casecountgraphical2?.pendingforvisit,
      casecountgraphical2?.pendingforaccept,
      casecountgraphical2?.pendingForCTO,
      casecountgraphical2?.pendingForLCTO,
      casecountgraphical2?.pendingTieUp,
      casecountgraphical2?.hold,
    ])
    setAllcasecountgraphical3([
      casecountgraphical3?.visitDone,
      casecountgraphical3?.DraftDoneCount,
      casecountgraphical3?.rcDone,
      casecountgraphical3?.submittedToBank,
    ])
    setAllcasecountgraphicalDM2([casecountgraphical2?.MyDraftCount, casecountgraphical2?.hold])
    setAllcasecountgraphicalDM3([
      casecountgraphical3?.submitedUT,
      casecountgraphical3?.submitedOT,
      casecountgraphical3?.DraftDoneCount,
    ])
    setAllcasecountgraphicalFE2([
      casecountgraphical2?.pendingforaccept,
      casecountgraphical2?.pendingTieUp,
      casecountgraphical2?.pendingforvisit,
    ])
    setAllcasecountgraphicalFE3([
      casecountgraphical3?.visitDone,
      casecountgraphical3?.rcDone,
      casecountgraphical3?.submittedToBank,
    ])
    setAllcasecountgraphicalRC3([
      casecountgraphical3?.submitedUT,
      casecountgraphical3?.submitedOT,
      casecountgraphical3?.DraftDoneCount,
    ])
    setAllcasecountgraphicalCTO2([
      casecountgraphical2?.MyDraftCount,
      casecountgraphical2?.visitpending,
      casecountgraphical2?.pendingforRc,
      casecountgraphical2?.pendingForCTO,
    ])
    setAllcasecountgraphicalLCTO2([
      casecountgraphical2?.submitedUT,
      casecountgraphical2?.submitedOT,
      casecountgraphical2?.DraftDoneCount,
    ])
    setAllcasecountgraphicalCTO3([
      casecountgraphical3?.submitedUT,
      casecountgraphical3?.submitedOT,
      casecountgraphical3?.DraftDoneCount,
      casecountgraphical3?.visitDone,
    ])
    setAllcasecountgraphicalLCTO3([
      casecountgraphical3?.submitedUT,
      casecountgraphical3?.submitedOT,
      casecountgraphical3?.DraftDoneCount,
    ])
  }, [casesCounts, casecountgraphical2, casecountgraphical3])

  const options = {
    plugins: {
      legend: {
        position: 'right',
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  }

  return (
    <>
      <CContainer fluid>
        <AdminWidgetSuperDashboard />

        <CRow className="my-3">
          <CCol sm={6} md={4}>
            <CCard>
              <CCardHeader> Cases Records </CCardHeader>
              <CCardBody className="d-flex justify-content-center align-items-center">
                <PieChart
                  data={{
                    labels: ['All Cases', 'Submitted to bank'],
                    datasets: [
                      {
                        data: allCasesAnalyticChartData,
                        backgroundColor: ['#3399FF', '#73b43c'],
                        hoverOffset: 4,
                      },
                    ],
                  }}
                />
              </CCardBody>
            </CCard>
          </CCol>

          {loggedinUserRole.name !== DM &&
            loggedinUserRole.name !== FE &&
            loggedinUserRole.name !== CTO &&
            loggedinUserRole.name !== LCTO && (
              <CCol sm={6} md={8}>
                <CCard className="mt-4 mt-sm-0 mt-md-0">
                  <CCardHeader>Cases Analytics Graph</CCardHeader>
                  <CCardBody
                    className={`d-flex justify-content-center align-items-center cases_analytics_${loggedinUserRole.name}`}
                  >
                    <PieChart
                      options={options}
                      data={{
                        labels: [
                          'pending for DM',
                          'pending for Visit',
                          'pending for Accept',
                          'pending for CTO',
                          'pending for LCTO',
                          'pendingTieUp',
                          'Hold',
                        ],
                        datasets: [
                          {
                            data: allcasecountgraphical2,
                            backgroundColor: [
                              '#3399FF',
                              '#F9B115',
                              '#F9B115',
                              '#92C7CF',
                              '#f7365e',
                              '#A020F0',
                              '#FF0000',
                            ],
                            hoverOffset: 12,
                          },
                        ],
                      }}
                    />
                  </CCardBody>
                </CCard>
              </CCol>
            )}

          {loggedinUserRole.name !== DM &&
            loggedinUserRole.name !== FE &&
            loggedinUserRole.name !== RC &&
            loggedinUserRole.name !== CTO &&
            loggedinUserRole.name !== LCTO && (
              <CCol sm={6} md={12}>
                <CCard className="mt-4 ml-2">
                  <CCardHeader> Submission Graph</CCardHeader>
                  <CCardBody
                    className={`d-flex flex-column align-items-center justify-content-center cases_analytics_${loggedinUserRole.name}`}
                  >
                    <CRow>
                      <CCol xs={6} sm={5} md={4} lg={5} className="pe-md-0 py-1">
                        <DatePicker
                          selected={startDateTime}
                          onChange={(date) => setStartDateTime(date || today)}
                          dateFormat="yyyy-MM-dd"
                          className="form-control full py-2"
                          size="sm"
                          maxDate={endDate} // Optional: Prevent selecting a start date after the end date
                          placeholderText="Select start date"
                        />
                      </CCol>

                      <CCol
                        xs={6}
                        sm={5}
                        md={4}
                        lg={5}
                        className="pe-md-0 d-flex justify-content-center align-items-center"
                      >
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date || today)}
                          dateFormat="yyyy-MM-dd"
                          className="form-control full py-2"
                          size="sm"
                          minDate={startDateTime} // Optional: Prevent selecting an end date before the start date
                          placeholderText="Select end date"
                        />
                      </CCol>
                    </CRow>

                    {allcasecountgraphical3.some((count) => count > 0) ? (
                      <PieChart
                        options={options}
                        data={{
                          labels: ['Visit Done', 'Draft Done', 'RC Done', 'Submitted to bank'],
                          datasets: [
                            {
                              data: allcasecountgraphical3,
                              backgroundColor: ['#3399FF', '#F9B115', '#92C7CF', '#73b43c'],
                              hoverOffset: 4,
                            },
                          ],
                        }}
                      />
                    ) : (
                      <div className="mt-4 text-center">
                        <p>No data available for today</p>
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            )}

          {loggedinUserRole.name === DM && (
            <CCol sm={6} md={8}>
              <CCard className="mt-4 mt-sm-0 mt-md-0">
                <CCardHeader>Cases Analytics Graph</CCardHeader>
                <CCardBody
                  className={`d-flex justify-content-center align-items-center cases_analytics_${loggedinUserRole.name}`}
                >
                  <PieChart
                    options={options}
                    data={{
                      labels: ['MyDraft', 'Hold'],
                      datasets: [
                        {
                          data: allcasecountgraphicalDM2,
                          backgroundColor: ['#92C7CF', ' #CCD3CA'],
                          hoverOffset: 4,
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          )}
          {loggedinUserRole.name === CTO && (
            <CCol sm={6} md={8}>
              <CCard className="mt-4 mt-sm-0 mt-md-0">
                <CCardHeader>Cases Analytics Graph</CCardHeader>
                <CCardBody
                  className={`d-flex justify-content-center align-items-center cases_analytics_${loggedinUserRole.name}`}
                >
                  <PieChart
                    options={options}
                    data={{
                      labels: ['Draft Pending', 'Vsit Pending', ' RC Pending', 'Pending LCTO'],
                      datasets: [
                        {
                          data: allcasecountgraphicalCTO2,
                          backgroundColor: ['#92C7CF', ' #CCD3CA', '#92C7CF', ' #73b43c'],
                          hoverOffset: 4,
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          )}
          {loggedinUserRole.name === LCTO && (
            <CCol sm={6} md={8}>
              <CCard className="mt-4 mt-sm-0 mt-md-0">
                <CCardHeader>Cases Analytics Graph</CCardHeader>
                <CCardBody
                  className={`d-flex justify-content-center align-items-center cases_analytics_${loggedinUserRole.name}`}
                >
                  <PieChart
                    options={options}
                    data={{
                      labels: ['Draft Pending', 'Vsit Pending', ' RC Pending', 'Pending LCTO'],
                      datasets: [
                        {
                          data: allcasecountgraphicalLCTO2,
                          backgroundColor: ['#92C7CF', ' #CCD3CA', '#92C7CF', ' #73b43c'],
                          hoverOffset: 4,
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {loggedinUserRole.name === FE && (
            <CCol sm={6} md={8}>
              <CCard className="mt-4 mt-sm-0 mt-md-0">
                <CCardHeader>Cases Analytics Graph</CCardHeader>
                <CCardBody
                  className={`d-flex justify-content-center align-items-center cases_analytics_${loggedinUserRole.name}`}
                >
                  <PieChart
                    options={options}
                    data={{
                      labels: ['Pending for Accept', 'Pending for Tie-Up', 'Pending for Visit'],
                      datasets: [
                        {
                          data: allcasecountgraphicalFE2,
                          backgroundColor: ['#f7365c', '#92C7CF', ' #73b43c'],
                          hoverOffset: 12,
                        },
                      ],
                    }}
                  />
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {loggedinUserRole.name == FE && (
            <CCol sm={6} md={12}>
              <CCard className="mt-4 ml-2">
                <CCardHeader> Submission Graph</CCardHeader>
                <CCardBody className="d-flex flex-column align-items-center justify-content-center cases_analytics">
                  <CRow>
                    <CCol xs={6} sm={5} md={4} lg={5} className="pe-md-0 py-1">
                      <DatePicker
                        selected={startDateTime}
                        onChange={(date) => setStartDateTime(date || today)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        maxDate={endDate} // Optional: Prevent selecting a start date after the end date
                        placeholderText="Select start date"
                      />
                    </CCol>
                    <CCol
                      xs={6}
                      sm={5}
                      md={4}
                      lg={5}
                      className="pe-md-0 d-flex justify-content-center align-items-center"
                    >
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date || today)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        minDate={startDateTime} // Optional: Prevent selecting an end date before the start date
                        placeholderText="Select end date"
                      />
                    </CCol>
                  </CRow>
                  {allcasecountgraphicalFE3.some((count) => count > 0) ? (
                    <PieChart
                      options={options}
                      data={{
                        labels: ['visitDone', 'Draft Done', 'Submitted to bank'],
                        datasets: [
                          {
                            data: allcasecountgraphicalFE3,
                            backgroundColor: ['#f7365c', '#F9B115', '#92C7CF', '#73b43c'],
                            hoverOffset: 4,
                          },
                        ],
                      }}
                    />
                  ) : (
                    <div className="mt-4 text-center">
                      <p>No data available for today</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {loggedinUserRole.name == DM && (
            <CCol sm={6} md={12}>
              <CCard className="mt-4 ml-2">
                <CCardHeader> Submission Graph</CCardHeader>
                <CCardBody className="d-flex flex-column align-items-center justify-content-center cases_analytics">
                  <CRow>
                    <CCol xs={6} sm={5} md={4} lg={5} className="pe-md-0 py-1">
                      <DatePicker
                        selected={startDateTime}
                        onChange={(date) => setStartDateTime(date || today)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        maxDate={endDate} // Optional: Prevent selecting a start date after the end date
                        placeholderText="Select start date"
                      />
                    </CCol>
                    <CCol
                      xs={6}
                      sm={5}
                      md={4}
                      lg={5}
                      className="pe-md-0 d-flex justify-content-center align-items-center"
                    >
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date || today)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        minDate={startDateTime} // Optional: Prevent selecting an end date before the start date
                        placeholderText="Select end date"
                      />
                    </CCol>
                  </CRow>

                  {allcasecountgraphicalDM3.some((count) => count > 0) ? (
                    <PieChart
                      options={options}
                      data={{
                        labels: ['submiited(UT)', 'submitted(OT)', 'Draft Done'],
                        datasets: [
                          {
                            data: allcasecountgraphicalDM3,
                            backgroundColor: ['#F9B115', '#73b43c', '#F9B115'],
                            hoverOffset: 4,
                          },
                        ],
                      }}
                    />
                  ) : (
                    <div className="mt-4 text-center">
                      <p>No data available for today</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          )}

          {loggedinUserRole.name == RC && (
            <CCol sm={6} md={12}>
              <CCard className="mt-4 ml-2">
                <CCardHeader> Submission Graph</CCardHeader>
                <CCardBody className="d-flex flex-column align-items-center justify-content-center cases_analytics">
                  <CRow>
                    <CCol xs={6} sm={5} md={4} lg={5} className="pe-md-0 py-1">
                      <DatePicker
                        selected={startDateTime}
                        onChange={(date) => setStartDateTime(date || today)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        maxDate={endDate} // Optional: Prevent selecting a start date after the end date
                        placeholderText="Select start date"
                      />
                    </CCol>
                    <CCol
                      xs={6}
                      sm={5}
                      md={4}
                      lg={5}
                      className="pe-md-0 d-flex justify-content-center align-items-center"
                    >
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date || today)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        minDate={startDateTime} // Optional: Prevent selecting an end date before the start date
                        placeholderText="Select end date"
                      />
                    </CCol>
                  </CRow>
                  {allcasecountgraphicalRC3.some((count) => count > 0) ? (
                    <PieChart
                      options={options}
                      data={{
                        labels: ['submiited(UT)', 'submitted(OT)', 'Draft Done'],
                        datasets: [
                          {
                            data: allcasecountgraphicalRC3,
                            backgroundColor: ['#f7365c', '#F9B115', '#92C7CF'],
                            hoverOffset: 4,
                          },
                        ],
                      }}
                    />
                  ) : (
                    <div className="mt-4 text-center">
                      <p>No data available for today</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          )}
          {loggedinUserRole.name == CTO && (
            <CCol sm={6} md={12}>
              <CCard className="mt-4 ml-2">
                <CCardHeader> Submission Graph</CCardHeader>
                <CCardBody className="d-flex flex-column align-items-center justify-content-center cases_analytics">
                  <CRow>
                    <CCol xs={6} sm={5} md={4} lg={5} className="pe-md-0 py-1">
                      <DatePicker
                        selected={startDateTime}
                        onChange={(date) => setStartDateTime(date || today)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        maxDate={endDate} // Optional: Prevent selecting a start date after the end date
                        placeholderText="Select start date"
                      />
                    </CCol>
                    <CCol
                      xs={6}
                      sm={5}
                      md={4}
                      lg={5}
                      className="pe-md-0 d-flex justify-content-center align-items-center"
                    >
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date || today)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        minDate={startDateTime} // Optional: Prevent selecting an end date before the start date
                        placeholderText="Select end date"
                      />
                    </CCol>
                  </CRow>
                  {allcasecountgraphicalCTO3.some((count) => count > 0) ? (
                    <PieChart
                      options={options}
                      data={{
                        labels: ['submiited(UT)', 'submitted(OT)', 'Draft Done', 'Visit Done'],
                        datasets: [
                          {
                            data: allcasecountgraphicalRC3,
                            backgroundColor: ['#f7365c', '#F9B115', '#92C7CF'],
                            hoverOffset: 4,
                          },
                        ],
                      }}
                    />
                  ) : (
                    <div className="mt-4 text-center">
                      <p>No data available for today</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          )}
          {loggedinUserRole.name == LCTO && (
            <CCol sm={6} md={12}>
              <CCard className="mt-4 ml-2">
                <CCardHeader> Submission Graph</CCardHeader>
                <CCardBody className="d-flex flex-column align-items-center justify-content-center cases_analytics">
                  <CRow>
                    <CCol xs={6} sm={5} md={4} lg={5} className="pe-md-0 py-1">
                      <DatePicker
                        selected={startDateTime}
                        onChange={(date) => setStartDateTime(date || today)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        maxDate={endDate} // Optional: Prevent selecting a start date after the end date
                        placeholderText="Select start date"
                      />
                    </CCol>
                    <CCol
                      xs={6}
                      sm={5}
                      md={4}
                      lg={5}
                      className="pe-md-0 d-flex justify-content-center align-items-center"
                    >
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date || today)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        minDate={startDateTime} // Optional: Prevent selecting an end date before the start date
                        placeholderText="Select end date"
                      />
                    </CCol>
                  </CRow>
                  {allcasecountgraphicalLCTO3.some((count) => count > 0) ? (
                    <PieChart
                      options={options}
                      data={{
                        labels: ['submiited(UT)', 'submitted(OT)', 'Draft Done'],
                        datasets: [
                          {
                            data: allcasecountgraphicalRC3,
                            backgroundColor: ['#f7365c', '#F9B115', '#92C7CF'],
                            hoverOffset: 4,
                          },
                        ],
                      }}
                    />
                  ) : (
                    <div className="mt-4 text-center">
                      <p>No data available for today</p>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          )}
        </CRow>

        {(loggedinUserRole.name == ADMIN || loggedinUserRole.name == ADMIN) && (
          <CRow className="my-4">
            <CCol md={8} lg={12}>
              <CCard>
                <CCardHeader>Filter Cases by Dates</CCardHeader>
                <CCardBody>
                  <CRow className="align-items-center mb-4">
                    <CCol xs={6} sm={5} md={4} lg={3} className="pe-md-0">
                      <CFormLabel htmlFor="startDate">Start Date</CFormLabel>
                      <DatePicker
                        selected={startDateTime}
                        onChange={(date) => setStartDateTime(date)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        maxDate={endDate} // Optional: Prevent selecting a start date after the end date
                        placeholderText="Select start date"
                      />
                    </CCol>
                    <CCol xs={6} sm={5} md={4} lg={3} className="pe-md-0">
                      <CFormLabel htmlFor="endDate">End Date</CFormLabel>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        className="form-control full py-2"
                        size="sm"
                        minDate={startDateTime} // Optional: Prevent selecting an end date before the start date
                        placeholderText="Select end date"
                      />
                    </CCol>
                    <CCol xs={6} sm={5} md={4} lg={3} className="pe-md-0">
                      <CFormLabel>
                        Select Role<span className="text-danger">*</span>
                      </CFormLabel>
                      <AsyncSelect
                        name="role"
                        loadOptions={(inputValue, callback) =>
                          loadOptionsGroup(inputValue, callback)
                        }
                        defaultOptions={defaultOptions}
                        value={initialValues.role}
                        onChange={handleRoleChange}
                      />
                    </CCol>
                    <CCol xs={12} sm={2} md={4} lg={2} className="">
                      <CFormLabel></CFormLabel>
                      <div className="text-center text-md-end">
                        <CButton className="submit_btn w-100" onClick={handleSearch}>
                          Search
                        </CButton>
                      </div>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CChart
                      type="bar"
                      data={{
                        labels:
                          casescountcharts.length > 0 &&
                          casescountcharts.map((item) => item.branchName),
                        datasets: [
                          {
                            label: 'Total Case',
                            data:
                              casescountcharts.length > 0 &&
                              casescountcharts.map((item) => item.totalCount),
                            backgroundColor: ['#39f'],
                          },
                          {
                            label:
                              casescountcharts.length > 0
                                ? casescountcharts[0].status === 'Submitted to Bank'
                                  ? 'Submitted to Bank'
                                  : 'Visit Done'
                                : '',
                            data:
                              casescountcharts.length > 0 &&
                              casescountcharts.map((item) =>
                                item.status === 'Submitted to Bank'
                                  ? item.submittedToBank
                                  : item.visitDoneCount,
                              ),
                            backgroundColor: ['#e54023'],
                          },
                        ],
                      }}
                      labels="months"
                      options={{
                        plugins: {
                          legend: {
                            labels: {
                              color: getStyle('--cui-body-color'),
                            },
                          },
                        },
                        scales: {
                          x: {
                            grid: {
                              color: getStyle('--cui-border-color-translucent'),
                            },
                            ticks: {
                              color: getStyle('--cui-body-color'),
                            },
                          },
                          y: {
                            grid: {
                              color: getStyle('--cui-border-color-translucent'),
                            },
                            ticks: {
                              color: getStyle('--cui-body-color'),
                            },
                          },
                        },
                      }}
                    />
                  </CRow>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        )}
      </CContainer>
    </>
  )
}

export default SuperDashboard
