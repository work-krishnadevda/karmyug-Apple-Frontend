import React, { useEffect, useRef, useState } from 'react'
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
import { CChart } from '@coreui/react-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import BasicProvider from 'src/constants/BasicProvider'
import PieChart from '../charts/PieChart'
import { useDispatch, useSelector } from 'react-redux'
import AdminWidget from '../widgets/RoleWise/AdminWidget'
import AsyncSelect from 'react-select/async'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import { useNavigate } from 'react-router-dom'

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

const Dashboard = () => {
  let dispatch = useDispatch()
  let navigate = useNavigate()
  let loggedinUserRole = useSelector((state) => state?.userRole)
  const [startDateTime, setStartDateTime] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())

  const [casesCounts, setCasesCounts] = useState(null)
  const [defaultOptions, setDefaultOptions] = useState([])
  const [casescountcharts, setcasecountChart] = useState([])
  const [casecountgraphical2, setcasecountgraphical2] = useState([])
  const [casecountgraphical3, setcasecountgraphical3] = useState([])
  const [defaultSelectedValue, setDefaultSelectedValue] = useState(null)

  const effectRef1 = useRef(false)
  const effectRef2 = useRef(false)
  const effectRef3 = useRef(false)
  const effectRef4 = useRef(false)

  const [initialValues, setInitialValues] = useState({
    role: '',
  })
  const handleRoleChange = (selectedOption) => {
    setDefaultSelectedValue(selectedOption)
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
    if (effectRef3.current === false) {
      effectRef3.current = true
      defaultOptionsRoles()
    }
  }, [])

  const defaultOptionsRoles = async () => {
    try {
      const response = await new BasicProvider('roles').getRequest()
      const excludedRoleIds = ['661633d7b2d7998b68130ae9', '66051ea0733d1b03df154cd2']
      const options = response.data.data
        .filter((role) => !excludedRoleIds.includes(role._id))
        .map((role) => ({
          label: role.display_name,
          slug: role.name,
          value: role._id,
        }))

      setDefaultOptions(options)
      if (options.length > 0) {
        setDefaultSelectedValue(options[3])
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (effectRef2.current === false) {
      effectRef2.current = true
      fetchDashboardCountData()
    }
  }, [])

  const fetchDashboardCountData = async () => {
    try {
      const response1 = await new BasicProvider(
        `cms/dashboard/cases-graph1/counts`,
        dispatch,
      ).getRequest()

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
      let url = `cms/dashboard/date-wise-cases/counts?date_from=${formatted_Start_Date}&date_to=${formatted_End_Date}&data=true&isadmin=true`

      const response = await new BasicProvider(url).getRequest()
      setcasecountgraphical3(response.data)
      // console.log('response.data')
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    if (effectRef1.current == false) {
      effectRef1.current = true
      if (startDateTime && endDate) {
        fetchData()
      }
    }
  }, [startDateTime, endDate])

  const [allCasesAnalyticChartData, setAllCasesAnalyticChartData] = useState([])

  const [allcasecountgraphical2, setAllcasecountgraphical2] = useState([])
  const [allcasecountgraphical3, setAllcasecountgraphical3] = useState([])
  const [allcasecountgraphicalDM2, setAllcasecountgraphicalDM2] = useState([])
  const [allcasecountgraphicalDM3, setAllcasecountgraphicalDM3] = useState([])
  const [allcasecountgraphicalSDM3, setAllcasecountgraphicalSDM3] = useState([])
  const [allcasecountgraphicalFE2, setAllcasecountgraphicalFE2] = useState([])
  const [allcasecountgraphicalFE3, setAllcasecountgraphicalFE3] = useState([])
  const [allcasecountgraphicalRC3, setAllcasecountgraphicalRC3] = useState([])
  const [allcasecountgraphicalCTO2, setAllcasecountgraphicalCTO2] = useState([])
  const [allcasecountgraphicalLCTO2, setAllcasecountgraphicalLCTO2] = useState([])
  const [allcasecountgraphicalCTO3, setAllcasecountgraphicalCTO3] = useState([])
  const [allcasecountgraphicalLCTO3, setAllcasecountgraphicalLCTO3] = useState([])

  // console.log('allcasecountgraphicalRC3', allcasecountgraphicalSDM3)

  useEffect(() => {
    setAllCasesAnalyticChartData([casesCounts?.allCasesCount, casesCounts?.submittedToBank])

    setAllcasecountgraphical2([
      casecountgraphical2?.pendingFordm,
      casecountgraphical2?.pendingforvisit,
      casecountgraphical2?.pendingAccept,
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
    setAllcasecountgraphicalSDM3([
      casecountgraphical3?.submitedUT,
      casecountgraphical3?.submitedOT,
      casecountgraphical3?.rcDone,
      casecountgraphical3?.DraftDoneSDm,
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
      {/* <SingleSubHeader moduleName={'Dashboard'} /> */}

      {/* <div className="d-flex bg-light p-3 bg-white shadow-lg mb-4 rounded">
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Technical
        </button>
        <button className="btn btn-success ms-3" onClick={() => navigate('/hrms')}>
          Management
        </button>
            
      </div> */}

      <CContainer fluid>
        {(loggedinUserRole.name === HR ||
          loggedinUserRole.name === ADMIN ||
          loggedinUserRole.name === COO ||
          loggedinUserRole.name === RA ||
          loggedinUserRole.name === RC ||
          loggedinUserRole.name === LCTO ||
          loggedinUserRole.name === FE ||
          loggedinUserRole.name === SDM ||
          loggedinUserRole.name === DM ||
          loggedinUserRole.name === CTO ||
          loggedinUserRole.name === AC ||
          loggedinUserRole.name === BROKER ||
          loggedinUserRole.name === SFO) && <AdminWidget counts={casesCounts} />}

        {loggedinUserRole.name !== BROKER && (
          <CRow className="my-3">
            {loggedinUserRole.name !== AC && (
              <CCol sm={6} md={4}>
                <CCard>
                  <CCardHeader className="dashboard-graph-heading"> Cases Records </CCardHeader>
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
            )}
            {loggedinUserRole.name !== DM &&
              loggedinUserRole.name !== FE &&
              loggedinUserRole.name !== CTO &&
              loggedinUserRole.name !== AC &&
              loggedinUserRole.name !== LCTO && (
                <CCol sm={6} md={8}>
                  <CCard className="mt-4 mt-sm-0 mt-md-0 ">
                    <CCardHeader className="dashboard-graph-heading">
                      Cases Analytics Graph
                    </CCardHeader>
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
                                '#eb85c1',
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
              loggedinUserRole.name !== SDM &&
              loggedinUserRole.name !== FE &&
              loggedinUserRole.name !== RC &&
              loggedinUserRole.name !== CTO &&
              loggedinUserRole.name !== AC &&
              loggedinUserRole.name !== LCTO && (
                <CCol sm={6} md={12}>
                  <CCard className="mt-4 ml-2">
                    <CCardHeader className="dashboard-graph-heading"> Submission Graph</CCardHeader>
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
                  <CCardHeader className="dashboard-graph-heading">
                    Cases Analytics Graph
                  </CCardHeader>
                  <CCardBody
                    className={`d-flex justify-content-center align-items-center cases_analytics_${loggedinUserRole.name}`}
                  >
                    <PieChart
                      options={options}
                      data={{
                        labels: ['Draft pending', 'Hold'],
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
                  <CCardHeader className="dashboard-graph-heading">
                    Cases Analytics Graph
                  </CCardHeader>
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
                  <CCardHeader className="dashboard-graph-heading">
                    Cases Analytics Graph
                  </CCardHeader>
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
                  <CCardHeader className="dashboard-graph-heading">
                    Cases Analytics Graph
                  </CCardHeader>
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
                            backgroundColor: ['#f7365c', '#92C7CF', ' #eb85c1'],
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
                  <CCardHeader className="dashboard-graph-heading"> Submission Graph</CCardHeader>
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
                          labels: ['visit Done', 'Draft Done', 'Submitted to bank'],
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
                  <CCardHeader className="dashboard-graph-heading"> Submission Graph</CCardHeader>
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

            {loggedinUserRole.name == SDM && (
              <CCol sm={6} md={12}>
                <CCard className="mt-4 ml-2">
                  <CCardHeader className="dashboard-graph-heading"> Submission Graph</CCardHeader>
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

                    {allcasecountgraphicalSDM3.some((count) => count > 0) ? (
                      <PieChart
                        options={options}
                        data={{
                          labels: ['submiited(UT)', 'submitted(OT)', 'RCdone', 'Draft Done'],
                          datasets: [
                            {
                              data: allcasecountgraphicalSDM3,
                              backgroundColor: ['#F9B115', '#73b43c', '#f7365c', '#F9B115'],
                              hoverOffset: 12,
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
                  <CCardHeader className="dashboard-graph-heading"> Submission Graph</CCardHeader>
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
                  <CCardHeader className="dashboard-graph-heading"> Submission Graph</CCardHeader>
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
                  <CCardHeader className="dashboard-graph-heading"> Submission Graph</CCardHeader>
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
        )}

        {(loggedinUserRole.name == ADMIN || loggedinUserRole.name == COO) && (
          <CRow className="my-4">
            <CCol md={8} lg={12}>
              <CCard>
                <CCardHeader className="dashboard-graph-heading">Filter Cases by Dates</CCardHeader>
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
                        value={defaultSelectedValue}
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
                            backgroundColor: ['#73b43c'],
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

export default Dashboard
