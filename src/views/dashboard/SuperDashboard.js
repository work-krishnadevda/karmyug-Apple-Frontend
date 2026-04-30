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
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import LCTOWidget from '../widgets/RoleWise/LCTOWidget'
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

const Dashboard = () => {
  let dispatch = useDispatch()

  let loggedinUserRole = useSelector((state) => state?.userRole)

  // const [startDateTime, setstartDateTime] = useState(
  //   new Date(new Date().setMonth(new Date().getMonth() - 1)),
  // )

  const [startDateTime, setStartDateTime] = useState(new Date())

  const [endDate, setEndDate] = useState(new Date())
  const [date_from, setDateFrom] = useState(new Date())
  const [date_to, setDateTo] = useState(new Date())
  const [casesCounts, setCasesCounts] = useState(null)
  const [todayCasesCounts, setTodayCasesCounts] = useState(null)
  const [defaultOptions, setDefaultOptions] = useState([])
  const [casescountcharts, setcasecountChart] = useState([])
  const [casecountgraphical2, setcasecountgraphical2] = useState([])
  const [casecountgraphical3, setcasecountgraphical3] = useState([])
  const [defaultSelectedValue, setDefaultSelectedValue] = useState(null)


  //   const handleSearch = async () => {
  //     const results = await chartCases(formatted_Start_Date, formatted_End_Date);
  //     console.log(results);
  // };


  const [initialValues, setInitialValues] = useState({
    role: '',
  })

  const fetchData = async () => {
    const formatted_Start_Date = `${startDateTime.getFullYear()}-${String(
      startDateTime.getMonth() + 1,
    ).padStart(2, '0')}-${String(startDateTime.getDate()).padStart(2, '0')}`
    const formatted_End_Date = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(endDate.getDate()).padStart(2, '0')}`

    try {
      let url = `cms/dashboard/date-wise-cases/counts?date_from=${formatted_Start_Date}&date_to=${formatted_End_Date}&data=true&super=true`

      const response = await new BasicProvider(url).getRequest()
      setcasecountgraphical3(response.data)
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

  return (
    <>
      <SingleSubHeader moduleName={'Dashboard'} />
      <CContainer fluid>
        <LCTOWidget counts={casesCounts} />
      </CContainer>
    </>
  )
}

export default Dashboard
