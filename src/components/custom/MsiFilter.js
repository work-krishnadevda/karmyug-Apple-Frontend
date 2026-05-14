import {
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react'
import moment from 'moment'

import { useEffect, useState } from 'react'
import BasicProvider from 'src/constants/BasicProvider'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import AsyncSelect from 'react-select/async'
import { useDispatch, useSelector } from 'react-redux'
import { checkRole } from 'src/constants/common'

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const MsiFilter = ({
  rowPerPage,
  filterData,
  setFilterData,
  onFilter,
  onReset,
  data,
  isLoading,
}) => {
  let dispatch = useDispatch()

  const admin = useSelector((state) => state.userData)

  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [initialvalue, setInitialvalue] = useState({
    search_input: '',
    applicant_name: '',
    case_of_branch: '',
    ra_branch: '',
    finance_name: '',
    date_from: '',
    date_to: '',
    status_pending: '',
    status_done: '',
    group_id: '',
    user_id: '',
    case_revise: '0',
    visit_type_by_fe: '',
    my_done: '',
    done_status: '',
  })

  const [selected, setSelected] = useState({
    cin_number: false,
    finance_name: false,
    applicant_name: false,
    final_address: false, //
    date_initiation_bank: false,
    date_of_case_submited_to_bank: false,
    case_of_branch: false,
    ra_branch: false,
    nero_location: false,
    product_name: false,
    case_type: false,
    km: false,
    geo_distance: false,
    valuation_amount: false,
    acknowledged: false,
    submit_type: false,
    los_number: false,
    contact_number: false,
    status: false,
    address: false,
    location: false,
    cin_number: false,
    accepted_by: false,
    admin: false,
    dm: false,
    rc: false,
    lcto: false,
    cto: false,
    sfo: false,

    visit_done_date: false,
    property_land_area: false,
    lat_log: false,
    case_type: false,
    property_type: false,

    case_rating: false,
    case_review: false,

    base_amount: false,
    conveyance_charges: false,
    additional_charges: false,
    total: false,
    // case_type_n_p: false,
  })

  const [statusPending, setStatusPending] = useState([{ label: 'Select Status', value: '' }])

  const [statusDone, setStatusDone] = useState([{ label: 'Select Status', value: '' }])

  let isAdmin = checkRole(process.env.REACT_APP_ADMIN, admin)
  let isCOO = checkRole(process.env.REACT_APP_COO, admin)
  let isFE = checkRole(process.env.REACT_APP_FE, admin)
  let isSDM = checkRole(process.env.REACT_APP_SDM, admin)
  let isRA = checkRole(process.env.REACT_APP_RA, admin)
  let isDM = checkRole(process.env.REACT_APP_DM, admin)
  let isRC = checkRole(process.env.REACT_APP_RC, admin)
  let isLCTO = checkRole(process.env.REACT_APP_LCTO, admin)
  let isCTO = checkRole(process.env.REACT_APP_CTO, admin)
  let isSFO = checkRole(process.env.REACT_APP_SFO, admin)
  let isAC = checkRole(process.env.REACT_APP_AC, admin)

  useEffect(() => {
    if (isAdmin || isCOO) {
      setStatusPending([
        { label: 'Select Status', value: '' },
        { label: 'Pending for Accept', value: 'pending for accept' },
        { label: 'Pending for Tie-Up', value: 'pending for tie-up' },
        { label: 'Updated by COO', value: 'updated by coo' },
        { label: 'Updated by SFO', value: 'updated by sfo' },
        { label: 'Updated by BM', value: 'updated by bm' },
        { label: 'Updated by Admin', value: 'updated by admin' },
        { label: 'Pending for Visit', value: 'pending for visit' },
        { label: 'Draft pending', value: 'pending for draft' },
        { label: 'RC pending', value: 'pending for rc' },
        { label: 'LCTO pending', value: 'pending for lcto' },
        { label: 'CTO pending', value: 'pending for cto' },
        { label: 'Hold', value: 'hold by' },
      ])

      setStatusDone([
        { label: 'Select Status', value: '' },
        { label: 'Tie-up Done', value: 'pending for visit' },
        { label: 'Visit Done', value: 'visit done' },
        { label: 'Draft Done', value: 'pending for rc' },
        { label: 'RC Done', value: 'pending for lcto' },
        { label: 'LCTO Done', value: 'pending for cto' },
        { label: 'Submitted to Bank', value: 'submitted to bank' },
      ])
    } else if (isFE) {
      setStatusPending([
        { label: 'Select Status', value: '' },
        { label: 'Pending for Accept', value: 'pending for accept' },
        { label: 'Pending for Tie-Up', value: 'pending for tie-up' },
        { label: 'Pending for Visit', value: 'pending for visit' },
        { label: 'Updated by COO', value: 'updated by coo' },
        { label: 'Updated by Admin', value: 'updated by admin' },
        { label: 'Updated by BM', value: 'updated by bm' },
        { label: 'Updated by SFO', value: 'updated by sfo' },
        { label: 'Hold', value: 'hold by' },
      ])

      setStatusDone([
        { label: 'Select Status', value: '' },
        { label: 'Tie-up Done', value: 'pending for visit' },
        { label: 'Visit Done', value: 'visit done' },
      ])
    } else if (isRA || isSFO) {
      setStatusPending([
        { label: 'Select Status', value: '' },
        { label: 'Pending for Accept', value: 'pending for accept' },
        { label: 'Pending for Tie-Up', value: 'pending for tie-up' },
        { label: 'Pending for Visit', value: 'pending for visit' },
        { label: 'Updated by COO', value: 'updated by coo' },
        { label: 'Updated by Admin', value: 'updated by admin' },
        { label: 'Updated by BM', value: 'updated by bm' },
        { label: 'Updated by SFO', value: 'updated by sfo' },
        { label: 'Hold', value: 'hold by' },
      ])

      setStatusDone([
        { label: 'Select Status', value: '' },
        { label: 'Tie-up Done', value: 'pending for visit' },
        { label: 'Visit Done', value: 'visit done' },
        { label: 'Submitted to Bank', value: 'submitted to bank' },
      ])
    } else {
      setStatusPending([
        { label: 'Select Status', value: '' },
        { label: 'Pending for Accept', value: 'pending for accept' },
        { label: 'Pending for Tie-Up', value: 'pending for tie-up' },
        { label: 'Pending for Visit', value: 'pending for visit' },
        { label: 'Draft pending', value: 'pending for draft' },
        { label: 'RC pending', value: 'pending for rc' },
        { label: 'LCTO pending', value: 'pending for lcto' },
        { label: 'CTO pending', value: 'pending for cto' },
      ])

      setStatusDone([
        { label: 'Select Status', value: '' },
        { label: 'Tie-up Done', value: 'pending for visit' },
        { label: 'Visit Done', value: 'visit done' },
        { label: 'Draft Done', value: 'pending for rc' },
        { label: 'RC Done', value: 'pending for lcto' },
        { label: 'LCTO Done', value: 'pending for cto' },
        { label: 'Submitted to Bank', value: 'submitted to bank' },
      ])
    }
  }, [isAdmin, isCOO, isFE, isSDM, isRA, isDM, isRC, isLCTO, isCTO, isSFO, isAC])

  const [rabranchData, setRAbranchData] = useState()
  const [financenameData, setFinancenameData] = useState()
  const [groupData, setgroupData] = useState()
  const [userData, setUserData] = useState()

  useEffect(() => {
    setInitialvalue(filterData)
  }, [filterData])

  useEffect(() => {
    fetchRAbranch()
    fetchFinancename()
    fetchGroupData()
    fetchUserData()
  }, [])

  async function fetchRAbranch() {
    try {
      var response = await new BasicProvider(`ra_branch?count=100`).getRequest()
      var data = response?.data.data
      setRAbranchData(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchGroupData() {
    try {
      var response = await new BasicProvider(`cms/categories/tree/group`).getRequest()
      var data = response?.data.data
      setgroupData(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchUserData() {
    let slugs

    slugs = [
      process.env.REACT_APP_ADMIN,
      process.env.REACT_APP_COO,
      process.env.REACT_APP_FE,
      process.env.REACT_APP_RA,
      process.env.REACT_APP_SFO,
      process.env.REACT_APP_SDM,
      process.env.REACT_APP_DM,
      process.env.REACT_APP_RC,
      process.env.REACT_APP_LCTO,
      process.env.REACT_APP_CTO,
    ]

    if (loggedinUserRole.name === process.env.REACT_APP_SFO) {
      slugs = [process.env.REACT_APP_FE]
    }

    try {
      const queryString = slugs.join(',')
      const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&page=1&count=500`

      var response = await new BasicProvider(url).getRequest()
      var data = response?.data

      setUserData(data)
    } catch (error) {
      console.error(error)
    }
  }

  async function fetchFinancename() {
    try {
      var response = await new BasicProvider(`banks?count=100`).getRequest()

      var data = response?.data.data
      setFinancenameData(data)
    } catch (error) {
      console.error(error)
    }
  }

  function getOptionList(data, defaultOption = { value: '', label: 'All' }) {
    const options = data
      ? data.map((cast) => {
          return {
            value: cast?._id,
            label: cast?.name,
            role: cast?.role?.display_name,
          }
        })
      : []
    return [defaultOption, ...options]
  }

  const rabranchOptions = getOptionList(rabranchData)
  const financeOptions = getOptionList(financenameData)
  const groupOptions = getOptionList(groupData)
  const userOptions = getOptionList(userData)

  const handleFilter = async () => {
    initialvalue.count = rowPerPage
    initialvalue.page = 1
    setFilterData(initialvalue)
    onFilter(initialvalue)
  }

  const handleChange = (name, value) => {
    setInitialvalue((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const loadOptions = async (name, inputValue, callback) => {
    try {
      const selectData = await new BasicProvider(
        `${name}?search=${inputValue}&page=1&count=10`,
      ).getRequest()

      const options = selectData.data.data.map((item) => ({
        value: item._id,
        label: item.name,
      }))
      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsUser = async (inputValue, callback) => {
    try {
      let slugs = []

      slugs = [
        process.env.REACT_APP_ADMIN,
        process.env.REACT_APP_COO,
        process.env.REACT_APP_FE,
        process.env.REACT_APP_RA,
        process.env.REACT_APP_SFO,
        process.env.REACT_APP_SDM,
        process.env.REACT_APP_DM,
        process.env.REACT_APP_RC,
        process.env.REACT_APP_LCTO,
        process.env.REACT_APP_CTO,
      ]

      if (loggedinUserRole.name === process.env.REACT_APP_SFO) {
        slugs = [process.env.REACT_APP_FE]
      }

      const queryString = slugs.join(',')
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&search=${inputValue}`,
      ).getRequest()

      const options = response.data.map((item) => ({
        value: item._id,
        label: item.name,
        role: item?.role?.display_name,
      }))

      callback(options)
    } catch (error) {
      console.error(error)
    }
  }

  const handleStatusChangePending = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value)
    setInitialvalue((prevState) => ({
      ...prevState,
      status_pending: selectedValues,
    }))
  }

  const handleStatusChangeDone = (selectedOptions) => {
    const selectedValues = selectedOptions.map((option) => option.value)
    setInitialvalue((prevState) => ({
      ...prevState,
      status_done: selectedValues,
    }))
  }

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target

    if (name === 'select_all') {
      // If "Select All" is checked, update all fields accordingly
      const updatedSelection = Object.keys(selected).reduce((acc, key) => {
        acc[key] = checked
        return acc
      }, {})
      setSelected(updatedSelection)
    } else {
      // Otherwise, toggle the individual checkbox
      setSelected({
        ...selected,
        [name]: checked,
      })
    }
    // setSelected({
    //   ...selected,
    //   [event.target.name]: !selected[event.target.name],
    // })
  }

  const handleDownload = async () => {
    const isAnyFieldSelected = Object.values(selected).some((value) => value)

    if (!isAnyFieldSelected) {
      dispatch({ type: 'set', validations: ['Please select at least one field!'] })
      return
    }

    if (data.length === 0) {
      dispatch({ type: 'set', validations: ['Please filter first!'] })
      return
    }

    const columnOrder = [
      'serial_no',
      'cin_number',
      'finance_name',
      'los_number',
      'applicant_name',
      'address',
      'contact_number',
      'accepted_by',
      'dm',
      'rc',
      'lcto',
      'cto',
      'status',
      'final_address',
      'date_initiation_bank',
      'visit_done_date',
      'date_of_case_submited_to_bank',
      'case_of_branch',
      'ra_branch',
      'nero_location',
      'product_name',
      'case_type',
      'property_land_area',
      'property_type',
      'geo_distance',
      'valuation_amount',
      'acknowledged',
      'submit_type',
      'lat_log',
      'km',
      'case_rating',
      'case_review',
      'base_amount',
      'conveyance_charges',
      'additional_charges',
      'total',
    ]

    const formattedData = data.map((item, index) => {
      const formattedItem = { serial_no: index + 1 }
      for (const key of columnOrder) {
        if (selected[key]) {
          if (key === 'contact_number') {
            const contactNumbers = [
              item.contact_number_1,
              item.contact_number_2,
              item.contact_number_3,
            ]
              .filter((num) => num)
              .join(', ')
            formattedItem['contact_number'] = contactNumbers.length > 0 ? contactNumbers : '-'
          } else if (key === 'date_initiation_bank') {
            formattedItem[key] = item[key] ? moment(item[key]).format('D MMMM YYYY') : '-'
          } else if (key === 'finance_name') {
            formattedItem[key] = item[key]?.name ? item[key]?.name : '-'
          } else if (key === 'ra_branch') {
            formattedItem[key] = item[key]?.name ? item[key]?.name : '-'
          } else if (key === 'accepted_by') {
            formattedItem[key] = item['accepted_by']?.name ? item['accepted_by']?.name : '-'
          } else if (['dm', 'rc', 'lcto', 'cto'].includes(key)) {
            formattedItem[key] = item[key]?.name ? item[key]?.name : '-'
          } else if (key === 'date_of_case_submited_to_bank') {
            formattedItem[key] = item['bank_submitted_by']?.at
              ? moment(item['bank_submitted_by'].at).format('D MMMM YYYY')
              : '-'
          } else if (key === 'valuation_amount') {
            const firstrow = item['map_data']?.land_area * item['map_data']?.landarea_rate
            const secondrow = item['map_data']?.builtup_area * item['map_data']?.builtup_rate
            const thridrow = item['map_data']?.flat_area * item['map_data']?.flate_rate

            formattedItem[key] = firstrow + secondrow + thridrow
          } else if (key === 'acknowledged') {
            formattedItem[key] = item['acknowledged'] == '0' ? 'No' : 'Yes'
          } else if (key === 'geo_distance') {
            formattedItem[key] = item['ogl'] ?? '-'
          } else if (key === 'nero_location') {
            formattedItem[key] = item['location'] ? item['location'] : '-'
          } else if (key === 'visit_done_date') {
            formattedItem[key] = item['all_status']?.visit_done
              ? moment(item['all_status']?.visit_done).format('D MMMM YYYY')
              : '-'
          } else if (key === 'property_land_area') {
            formattedItem[key] = item['map_data']?.land_area ? item['map_data']?.land_area : '-'
          } else if (key === 'lat_log') {
            let lat = item['latitude_by_fe'] ? item['latitude_by_fe'] : '-'
            let lon = item['longitude_by_fe'] ? item['longitude_by_fe'] : '-'
            formattedItem[key] = `${lat}/${lon}`
          } else if (key === 'property_type') {
            if (item['current_use_property']) {
              formattedItem[key] =
                item['current_use_property'] === 'other'
                  ? item['current_use_property_other']
                    ? item['current_use_property_other']
                    : '-'
                  : item['current_use_property']
            }
          } else {
            formattedItem[key] = item[key] || '-'
          }
        }
      }

      return formattedItem
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Cases Report')

    // Add letterhead rows
    worksheet.mergeCells('A1:G1')
    worksheet.getCell('A1').value = 'Real Apple Consultancy House'
    worksheet.getCell('A1').font = { size: 16, bold: true }
    worksheet.getCell('A1').alignment = { horizontal: 'center' }

    worksheet.mergeCells('A2:G2')
    worksheet.getCell('A2').value = `Date of report generation : ${moment(Date.now()).format(
      'D MMMM YYYY',
    )}`
    worksheet.getCell('A2').alignment = { horizontal: 'center' }

    worksheet.mergeCells('A3:G3')
    worksheet.getCell('A3').value = `Name of user : ${admin.name ? admin.name : '-'}`
    worksheet.getCell('A3').alignment = { horizontal: 'center' }

    if (initialvalue.date_from && initialvalue.date_to) {
      worksheet.mergeCells('A4:G4')
      worksheet.getCell('A4').value = `Date to Date : ${moment(initialvalue.date_from).format(
        'D MMMM YYYY',
      )} to ${moment(initialvalue.date_to).format('D MMMM YYYY')}`
      worksheet.getCell('A4').alignment = { horizontal: 'center' }
    }

    worksheet.addRow([])

    const headerStyle = {
      font: { bold: true },
      alignment: { wrapText: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'CCCCFF' } },
    }

    const cellStyle = { alignment: { wrapText: true } }

    const selectedColumns = ['serial_no', ...columnOrder.filter((key) => selected[key])] // Always include serial_no

    const headerRow = worksheet.addRow(
      selectedColumns.map((column) => {
        switch (column) {
          case 'serial_no':
            return 'S. No.'
          case 'finance_name':
            return 'Finance Name'
          case 'ra_branch':
            return 'RA Branch'
          case 'applicant_name':
            return 'Applicant Name'
          case 'los_number':
            return 'LOS Number'
          case 'date_initiation_bank':
            return 'Date of Initiation by Bank'
          case 'address':
            return 'Visit Address'
          case 'accepted_by':
            return 'Visit By'
          case 'lat_log':
            return 'Lat / Long'
          case 'property_type':
            return 'Type of Property'
          case 'case_rating':
            return 'Draft Quality Rating'
          case 'case_review':
            return 'Disbursed Status'
          case 'total':
            return 'Total Amount'
          default:
            return column.replace(/_/g, ' ').toUpperCase()
        }
      }),
    )

    headerRow.eachCell((cell) => {
      cell.style = headerStyle
    })

    // formattedData.forEach((item) => {
    //   const row = worksheet.addRow(selectedColumns.map((column) => item[column]))
    //   row.eachCell((cell) => {
    //     cell.style = { ...cellStyle }
    //   })
    // })

    const excludeKeys = new Set(['cin_number', 'applicant_name', 'los_number', 'product_name'])
    formattedData.forEach((item) => {
      const row = worksheet.addRow(
        selectedColumns.map((column) => {
          const value = item[column]

          if (typeof value === 'string' && !excludeKeys.has(column)) {
            return value.replace(
              /\b\w+/g,
              (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
            )
          }

          return value
        }),
      )

      row.eachCell((cell) => {
        cell.style = { ...cellStyle }
      })
    })

    worksheet.columns.forEach((column, index) => {
      column.width = index === 0 ? 10 : 30
    })

    // Generate Excel file and trigger download
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, 'cases report.xlsx')
  }

  const onlyDoneOptions = [
    { label: 'FE Done', value: 'fe done' },
    { label: 'SDM Done', value: 'sdm done' },
    { label: 'DM Done', value: 'dm done' },
    { label: 'RC Done', value: 'rc done' },
    { label: 'LCTO Done', value: 'lcto done' },
    { label: 'CTO Done', value: 'cto done' },
    { label: 'Submitted To Bank', value: 'submit to bank' },
  ]

  const allChecked = Object.values(selected).every(Boolean)

  return (
    <div className="case-filter-theme app-filter-theme">
      <div className="datatable bg-white mb-2 p-3 pb-0">
        <CForm>
          <CRow>
            <CCol xs={12} lg={8} className="px-2 pe-0 pe-lg-2 ps-0 ">
              <CFormLabel>
                Search By (Applicant Name, CIN No, LOS No, Mobile No,Nero Location)
              </CFormLabel>
              <CFormInput
                name="search_input"
                className="mb-sm-2 mb-2"
                placeholder="Enter From above Fields ..."
                value={initialvalue.search_input}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
              />
            </CCol>
            <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0">
              <CFormLabel>Finance Name</CFormLabel>
              <AsyncSelect
                name="finance_name"
                classNamePrefix="case-filter-select"
                className="mb-sm-2 mb-2"
                loadOptions={(inputValue, callback) =>
                  loadOptions('banks/search', inputValue, callback)
                }
                defaultOptions={financeOptions}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                value={
                  financeOptions &&
                  financeOptions.find((option) => option.value === initialvalue?.finance_name)
                }
                onChange={(selectedOption) => {
                  setInitialvalue((prevValue) => ({
                    ...prevValue,
                    finance_name: selectedOption?.value,
                  }))
                }}
              />
            </CCol>

            <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0">
              <CFormLabel>RA Branch</CFormLabel>
              <AsyncSelect
                name="ra_branch"
                classNamePrefix="case-filter-select"
                className="mb-sm-2 mb-2"
                loadOptions={(inputValue, callback) =>
                  loadOptions('ra_branch/search', inputValue, callback)
                }
                defaultOptions={rabranchOptions}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                value={
                  rabranchOptions &&
                  rabranchOptions.find((option) => option.value === initialvalue.ra_branch)
                }
                onChange={(selectedOptions) => {
                  setInitialvalue((prevValue) => ({
                    ...prevValue,
                    ra_branch: selectedOptions?.value,
                  }))
                }}
              />
            </CCol>

            {!isFE && !isDM && (
              <>
                <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0">
                  <CFormLabel>Select Group</CFormLabel>
                  <AsyncSelect
                    name="group_id"
                classNamePrefix="case-filter-select"
                    className="mb-sm-2 mb-2"
                    loadOptions={(inputValue, callback) =>
                      loadOptions(
                        `cms/categories/search?page=1&count=10&search=${inputValue}`,
                        inputValue,
                        callback,
                      )
                    }
                    defaultOptions={groupOptions}
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    value={
                      groupOptions &&
                      groupOptions.find((option) => option.value === initialvalue?.group_id)
                    }
                    onChange={(selectedOptions) => {
                      setInitialvalue((prevValue) => ({
                        ...prevValue,
                        group_id: selectedOptions?.value,
                      }))
                    }}
                  />
                </CCol>

                <CCol xs={12} lg={4} className="mb-2 ps-0 pe-0 ps-md-2">
                  <CFormLabel>Select User</CFormLabel>
                  <AsyncSelect
                    name="user_id"
                classNamePrefix="case-filter-select"
                    loadOptions={(inputValue, callback) => loadOptionsUser(inputValue, callback)}
                    defaultOptions={userOptions}
                    getOptionLabel={(option) => (
                      <div>
                        <div>{option.label}</div>
                        <div style={{ color: 'green', fontSize: '0.8em', marginTop: '2px' }}>
                          {option.role}
                        </div>
                      </div>
                    )}
                    getOptionValue={(option) => option.value}
                    value={
                      userOptions &&
                      userOptions.find((option) => option.value === initialvalue?.user_id)
                    }
                    onChange={(selectedOption) => {
                      setInitialvalue((prevValue) => ({
                        ...prevValue,
                        user_id: selectedOption.value,
                      }))
                    }}
                    styles={{
                      option: (provided, state) => ({
                        ...provided,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        backgroundColor: state.isFocused ? '#e6f7ff' : '#fff',
                        color: '#000',
                        cursor: 'pointer',
                        padding: '10px',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }),
                    }}
                    components={{
                      Option: ({ data, innerRef, innerProps }) => (
                        <div ref={innerRef} {...innerProps} style={{ padding: '10px' }}>
                          <div>{data.label}</div>
                          <div style={{ color: 'green', fontSize: '0.8em', marginTop: '2px' }}>
                            {data.role}
                          </div>
                        </div>
                      ),
                    }}
                  />
                </CCol>
              </>
            )}

            <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0 RegisterUserInput">
              <CFormLabel htmlFor="publishDate">
                Create Case(from Date)<span className="text-danger"></span>
              </CFormLabel>

              <DatePicker
                showMonthDropdown
                showYearDropdown
                dateFormat="dd-MMM-yyyy"
                maxDate={new Date()}
                onChange={(date) => {
                  const timezoneOffset = date.getTimezoneOffset()
                  const adjustedDate = new Date(date.getTime() - timezoneOffset * 60 * 1000)
                  const formattedDate = adjustedDate.toISOString().split('T')[0]
                  setInitialvalue((prev) => ({
                    ...prev,
                    date_from: formattedDate,
                  }))
                }}
                selected={
                  initialvalue.date_from != undefined &&
                  initialvalue.date_from != null &&
                  initialvalue.date_from != ''
                    ? new Date(initialvalue.date_from)
                    : null
                }
                className="form-control full py-2"
                size="sm"
                aria-label="Small select example"
                placeholderText="Select From Date"
              />
            </CCol>

            <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0">
              <CFormLabel htmlFor="publishDate">
                Create Case(to Date)<span className="text-danger"></span>
              </CFormLabel>

              <DatePicker
                showMonthDropdown
                showYearDropdown
                minDate={new Date(initialvalue.date_from)}
                maxDate={new Date()}
                onChange={(date) => {
                  const timezoneOffset = date.getTimezoneOffset()
                  const adjustedDate = new Date(date.getTime() - timezoneOffset * 60 * 1000)
                  const formattedDate = adjustedDate.toISOString().split('T')[0]

                  setInitialvalue((prev) => ({
                    ...prev,
                    date_to: formattedDate,
                  }))
                }}
                selected={
                  initialvalue.date_to != undefined &&
                  initialvalue.date_to != null &&
                  initialvalue.date_to != ''
                    ? new Date(initialvalue.date_to)
                    : null
                }
                dateFormat="dd-MMM-yyyy"
                className="form-control full py-2"
                size="sm"
                aria-label="Small select example"
                placeholderText="Select To Date"
              />

              {/* {validationMessage && <div className="text-danger mt-1">{validationMessage}</div>} */}
            </CCol>

            <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0">
              <CFormLabel>By Status(Pending)</CFormLabel>
              <AsyncSelect
                name="user_id"
                classNamePrefix="case-filter-select"
                className="mb-sm-2 mb-2"
                isMulti
                loadOptions={(inputValue) => {
                  return new Promise((resolve) => {
                    const filteredOptions = statusPending.filter((option) =>
                      option.label.toLowerCase().includes(inputValue.toLowerCase()),
                    )
                    resolve(filteredOptions)
                  })
                }}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                value={statusPending.filter((option) =>
                  initialvalue.status_pending?.includes(option.value),
                )}
                onChange={handleStatusChangePending}
                defaultOptions={statusPending}
                isClearable
              />
            </CCol>

            <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0">
              <CFormLabel>By Status(Done)</CFormLabel>
              <AsyncSelect
                name="user_id"
                classNamePrefix="case-filter-select"
                className="mb-sm-2 mb-2"
                isMulti
                loadOptions={(inputValue) => {
                  return new Promise((resolve) => {
                    const filteredOptions = statusDone.filter((option) =>
                      option.label.toLowerCase().includes(inputValue.toLowerCase()),
                    )
                    resolve(filteredOptions)
                  })
                }}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                value={statusDone.filter((option) =>
                  initialvalue.status_done?.includes(option.value),
                )}
                onChange={handleStatusChangeDone}
                defaultOptions={statusDone}
                isClearable
              />
            </CCol>

            <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0">
              <CFormLabel>By Visit Done Type</CFormLabel>
              <CFormSelect
                name="visit_type_by_fe"
                value={initialvalue?.visit_type_by_fe || ''}
                onChange={(e) => {
                  setInitialvalue((prevValue) => ({
                    ...prevValue,
                    visit_type_by_fe: e.target.value,
                  }))
                }}
              >
                <option value={''}>All</option>
                <option value={'offline'}>offline</option>
                <option value={'online'}>online</option>
              </CFormSelect>
            </CCol>

            <CCol xs={12} lg={2} className="mt-4 d-flex align-items-center">
              <div className="">
                <CFormCheck
                  type="checkbox"
                  label={'Case Revise ?'}
                  className="credit ps-0 d-flex align-items-center"
                  checked={initialvalue.case_revise === '1'}
                  onChange={() => {
                    setInitialvalue({
                      ...initialvalue,
                      case_revise: initialvalue.case_revise === '1' ? '0' : '1',
                    })
                  }}
                />
              </div>
            </CCol>

            <CCol xs={12} lg={2} className="mt-4 d-flex align-items-center">
              <div className="">
                <CFormCheck
                  type="checkbox"
                  label={'Done Only?'}
                  className="credit ps-0 d-flex align-items-center"
                  checked={initialvalue.my_done === '1'}
                  onChange={() => {
                    setInitialvalue({
                      ...initialvalue,
                      my_done: initialvalue.my_done === '1' ? '0' : '1',
                    })
                  }}
                />
              </div>
            </CCol>

            {initialvalue.my_done == '1' && (
              <CCol xs={12} lg={4} className="px-2 pe-0 pe-lg-2 ps-0">
                <div className="">
                  <CFormLabel>Only Done </CFormLabel>

                  <CFormSelect
                    custom
                    name="location_type"
                    value={initialvalue.done_status}
                    onChange={(event) => {
                      setInitialvalue((prev) => ({
                        ...prev,
                        done_status: event.target.value,
                      }))
                    }}
                  >
                    <option value="">Select Done Only</option>

                    {isAdmin || isCOO || isRA || isSDM ? (
                      onlyDoneOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    ) : (
                      <>
                        {(isFE || isSFO || isAC) && <option value="fe done">FE Done</option>}
                        {isDM && <option value="dm done">DM Done</option>}
                        {isRC && <option value="rc done">RC Done</option>}
                        {isLCTO && <option value="lcto done">LCTO Done</option>}
                        {(isAC || isLCTO || isCTO || isRC || isDM) && (
                          <option value="submit to bank">Submitted To Bank</option>
                        )}
                        {isAC && <option value="hold">Holded</option>}
                      </>
                    )}
                  </CFormSelect>
                </div>
              </CCol>
            )}
            <CRow className="mt-4 ps-0">
              <CCol md={2}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label="Select All"
                    className="credit ps-0 checkbox-margin"
                    name="select_all"
                    checked={allChecked}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </CCol>
            </CRow>

            {/* <CRow className="mt-4 ps-0"> */}
            <div className="w-100 d-flex mb-3 mt-3">
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'CIN Number'}
                    className="credit ps-0 checkbox-margin"
                    name="cin_number"
                    checked={selected.cin_number}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Finance'}
                    className="credit ps-0 checkbox-margin"
                    name="finance_name"
                    checked={selected.finance_name}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>{' '}
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'LOS Number'}
                    className="credit ps-0 checkbox-margin"
                    name="los_number"
                    checked={selected.los_number}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Applicant Name'}
                    className="credit ps-0 checkbox-margin"
                    name="applicant_name"
                    checked={selected.applicant_name}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Visit Address'}
                    className="credit ps-0 checkbox-margin"
                    name="address"
                    checked={selected.address}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
            </div>

            <div className="w-100 d-flex mb-3">
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Contact'}
                    className="credit ps-0 checkbox-margin"
                    name="contact_number"
                    checked={selected.contact_number}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Visit By'}
                    className="ps-0 checkbox-margin"
                    name="accepted_by"
                    checked={selected.accepted_by}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'DM'}
                    className="credit ps-0 checkbox-margin"
                    name="dm"
                    checked={selected.dm}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'RC'}
                    className="credit ps-0 checkbox-margin"
                    name="rc"
                    checked={selected.rc}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'LCTO'}
                    className="credit ps-0 checkbox-margin"
                    name="lcto"
                    checked={selected.lcto}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
            </div>

            <div className="w-100 d-flex mb-3">
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'CTO'}
                    className="credit ps-0  checkbox-margin"
                    name="cto"
                    checked={selected.cto}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Status'}
                    className="credit ps-0 checkbox-margin"
                    name="status"
                    checked={selected.status}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Date Of Initaltion By Bank'}
                    className="credit ps-0 checkbox-margin"
                    name="date_initiation_bank"
                    checked={selected.date_initiation_bank}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Visit Done Date'}
                    className="credit ps-0 checkbox-margin"
                    name="visit_done_date"
                    checked={selected.visit_done_date}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Date Of Submit To Bank'}
                    className="credit ps-0 checkbox-margin"
                    name="date_of_case_submited_to_bank"
                    checked={selected.date_of_case_submited_to_bank}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
            </div>

            <div className="w-100 d-flex mb-3">
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Case Of Branch'}
                    className="credit ps-0 checkbox-margin"
                    name="case_of_branch"
                    checked={selected.case_of_branch}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'RA Branch'}
                    className="credit ps-0 checkbox-margin"
                    name="ra_branch"
                    checked={selected.ra_branch}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Nero Location'}
                    className="credit ps-0 checkbox-margin"
                    name="nero_location"
                    checked={selected.nero_location}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Product Name'}
                    className="credit ps-0 checkbox-margin"
                    name="product_name"
                    checked={selected.product_name}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Case Type'}
                    className="credit ps-0 checkbox-margin"
                    name="case_type"
                    checked={selected.case_type}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
            </div>

            <div className="w-100 d-flex mb-3">
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Property Land Area'}
                    className="credit ps-0 checkbox-margin"
                    name="property_land_area"
                    checked={selected.property_land_area}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Type Of Property'}
                    className="credit ps-0 checkbox-margin"
                    name="property_type"
                    checked={selected.property_type}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'GEO-Distance'}
                    className="credit ps-0 checkbox-margin"
                    name="geo_distance"
                    checked={selected.geo_distance}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Valuation Amount'}
                    className="credit ps-0 checkbox-margin"
                    name="valuation_amount"
                    checked={selected.valuation_amount}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Acknowledged'}
                    className="credit ps-0 checkbox-margin"
                    name="acknowledged"
                    checked={selected.acknowledged}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
            </div>

            <div className="w-100 d-flex mb-3">
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Submit Type'}
                    className="credit ps-0 checkbox-margin"
                    name="submit_type"
                    checked={selected.submit_type}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Disbursed Status'}
                    className="credit ps-0 checkbox-margin"
                    name="case_review"
                    checked={selected.case_review}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Draft Quality Rating'}
                    className="credit ps-0 checkbox-margin"
                    name="case_rating"
                    checked={selected.case_rating}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Lat / Long'}
                    className="credit ps-0 checkbox-margin"
                    name="lat_log"
                    checked={selected.lat_log}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'KM'}
                    className="credit ps-0 checkbox-margin"
                    name="km"
                    checked={selected.km}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
            </div>

            <div className="w-100 d-flex mb-3 ">
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Base Amount'}
                    className="credit ps-0 checkbox-margin"
                    name="base_amount"
                    checked={selected.base_amount}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Final Address'}
                    className="credit ps-0 checkbox-margin"
                    name="final_address"
                    checked={selected.final_address}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Conveyance Charges'}
                    className="credit ps-0 checkbox-margin"
                    name="conveyance_charges"
                    checked={selected.conveyance_charges}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Additional Charges'}
                    className="credit ps-0  checkbox-margin"
                    name="additional_charges"
                    checked={selected.additional_charges}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
              <div style={{ width: '20%' }}>
                <div className="">
                  <CFormCheck
                    type="checkbox"
                    label={'Total Amount'}
                    className="credit ps-0  checkbox-margin"
                    name="total"
                    checked={selected.total}
                    onChange={handleCheckboxChange}
                  />
                </div>
              </div>
            </div>

            <CCol xs={8} lg={3}>
              <div className="d-flex mt-3  align-items-center">
                <CButton
                  color="primary "
                  className=" w-70"
                  type="submit"
                  onClick={(event) => {
                    event.preventDefault()
                    handleFilter()
                  }}
                >
                  Filter
                </CButton>

                <CButton
                  className="mx-2"
                  color="success"
                  style={{ color: 'white' }}
                  onClick={handleDownload}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Download'}
                </CButton>
                <CButton
                  color="danger "
                  onClick={() => {
                    setSelected({
                      applicant_name: false,
                      los_number: false,
                      finance_name: false,
                      contact_number: false,
                      date_initiation_bank: false,
                      status: false,
                      ra_branch: false,
                      address: false,
                      location: false,
                      cin_number: false,
                      accepted_by: false,
                      admin: false,
                      dm: false,
                      rc: false,
                      lcto: false,
                      cto: false,
                      sfo: false,
                      // case_type_n_p: false,
                    })
                    onReset()
                  }}
                  className=""
                  style={{ color: 'white' }}
                >
                  Reset
                </CButton>
              </div>
            </CCol>
          </CRow>
        </CForm>
      </div>
    </div>
  )
}

export default MsiFilter
