import {
  CContainer,
  CBadge,
  CTooltip,
} from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RowsPerPage, statusValue } from 'src/constants/variables'
import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import BasicProvider from 'src/constants/BasicProvider'
import { checkRole } from 'src/constants/common'

import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import MsiFilter from 'src/components/custom/MsiFilter'

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import { CommonMessageShowModel } from 'src/components/custom/popup/commonMessageModel'
import CaseSectionCard from 'src/components/custom/table/CaseSectionCard'
import { assignedFeColumn } from 'src/helpers/caseDisplayHelpers'

export default function Genrate_MSI() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()

  const [userId, setuserId] = useState([])

  const [isLoading, setIsLoading] = useState(false)

  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const [data, setData] = useState([])
  const [totalCount, setTotalCount] = useState('')

  const [wholeData, setWholeData] = useState([])
  const [isLoadingWholeData, setIsloadingWholeData] = useState(false)
  const [commonMessageShowModel, setCommonMessageShowModel] = useState(false)
  const [caseId, setCaseId] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [rabranchData, setRAbranchData] = useState()
  const [financenameData, setFinancenameData] = useState()

  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [isFilter, setIsFilter] = useState(false)

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {
      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

  const admin = useSelector((state) => state.userData)

  let isAdmin = checkRole(process.env.REACT_APP_ADMIN, admin)
  let isCOO = checkRole(process.env.REACT_APP_COO, admin)
  let isFE = checkRole(process.env.REACT_APP_FE, admin)
  let isSDM = checkRole(process.env.REACT_APP_SDM, admin)
  let isRA = checkRole(process.env.REACT_APP_RA, admin)
  let isDM = checkRole(process.env.REACT_APP_DM, admin)
  let isRC = checkRole(process.env.REACT_APP_RC, admin)
  let isLCTO = checkRole(process.env.REACT_APP_LCTO, admin)
  let isCTO = checkRole(process.env.REACT_APP_CTO, admin)

  const [selected, setSelected] = useState({
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
  })

  useEffect(() => {
    for (const [key, value] of query.entries()) {
      if (key !== 'page' && key !== 'count') {
        setFilteredData((prev) => ({
          ...prev,
          [key]: value,
        }))
      }
    }
  }, [])

  useEffect(() => {
    if (rowPerPage) {
      fetchData()
    }
  }, [currentPage, rowPerPage, filteredData, search])

  console.log('-=-=-=-filteredData', filteredData)

  const fetchData = async () => {
    try {
      setIsLoading(true)

      let performSearch = false
      var queryData = {}
      for (const [key, value] of query.entries()) {
        if (key !== 'page' && key !== 'count') {
          queryData[key] = value
          if (value !== '' && value !== null) {
            performSearch = true
          }
        }
      }

      var response
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count
        queryData['data'] = 'msi_ganarate'

        // queryData['data'] = 'pending_for_rc'

        if (Object.entries(queryData).length > 0) {
          response = await new BasicProvider(
            `cms/dashboard/date-wise-cases/counts?${HelperFunction.convertToQueryString(
              queryData,
            )}`,
          ).getRequest()

          setData(response.data.data.data)
          // setWholeData(response.data.wholeData)
          setTotalCount(response.data.data.total)
        }
      }
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error(error)
    }
  }

  const fetchWholeData = async () => {
    try {
      setIsloadingWholeData(true)

      let performSearch = false
      var queryData = {}
      for (const [key, value] of query.entries()) {
        if (key !== 'page' && key !== 'count') {
          queryData[key] = value
          if (value !== '' && value !== null) {
            performSearch = true
          }
        }
      }

      var response
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count
        queryData['data'] = 'msi_ganarate'

        if (Object.entries(queryData).length > 0) {
          response = await new BasicProvider(
            `cms/dashboard/date-wise-cases/counts/wholedata?${HelperFunction.convertToQueryString(
              queryData,
            )}`,
          ).getRequest()

          setWholeData(response.data.wholeData)
        }
      }
      setIsloadingWholeData(false)
    } catch (error) {
      setIsloadingWholeData(false)
      console.error(error)
    }
  }

  useEffect(() => {
    fetchWholeData()
  }, [filteredData])

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('cases')
      if (savedSelectedRows && !count) {
        setRowPerPage(savedSelectedRows)
      } else {
        setRowPerPage(count)
      }
    }
    fetchSelectedRows()
  }, [count])

  const handleRowChange = useCallback((state) => {
    const rows = state.selectedRows
    const rowsId = rows.map((item) => item._id)
    dispatch({ type: 'set', selectedrows: rowsId })
  }, [])

  const handleFilterReset = async () => {
    setFilteredData({
      cin_number: '',
      applicant_name: '',
      case_of_branch: '',
      ra_branch: '',
      finance_name: '',
      search_input: '',
      date_from: '',
      date_to: '',
      status: [],
      group_id: '',
      user_id: '',
      case_revise: '0',
      visit_type_by_fe: '',
    })

    setRAbranchData('')
    setFinancenameData('')
    setSearchCurrentPage(1)
    currentPage = 1
    setDefaultPage(1)
    setData([])
    setWholeData([])
    setTotalCount(0)
    navigate({ search: '' })
  }

  const columns = [
    {
      name: 'CIN Number',
      selector: (row) => (
        <div
          onClick={() => {
            setCaseId(row._id)
            setCommonMessageShowModel(!commonMessageShowModel)
          }}
          className="data_table_colum"
        >
          {row && row.cin_number ? row.cin_number : '-'}
        </div>
      ),
    },
    {
      name: 'Applicant Name',
      selector: (row) => (
        <div
          onClick={() => {
            setCaseId(row._id)
            setCommonMessageShowModel(!commonMessageShowModel)
          }}
          className="data_table_colum"
        >
          {row && row.applicant_name ? row.applicant_name : '-'}
        </div>
      ),
    },

    {
      name: 'Lat/Long',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row.latitude_by_fe && row.longitude_by_fe
            ? `${row.latitude_by_fe} / ${row.longitude_by_fe}`
            : '-'}
        </div>
      ),
    },

    assignedFeColumn,
    {
      name: 'Visit Done By',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="">{row?.accepted_by?.name ? row.accepted_by?.name : '-'}</div>
          <div className="fs-12 pt-1">
            {row?.all_status?.visit_done && moment(row.all_status.visit_done).isValid() ? (
              <CTooltip
                content={moment(row.all_status.visit_done).format('DD MMM YYYY hh:mm:ss A')}
              >
                <div style={{ padding: '5px 10px' }}>
                  <div className="data_table_colum">
                    {moment(row.all_status.visit_done).fromNow()}
                  </div>
                </div>
              </CTooltip>
            ) : (
              <div style={{ padding: '5px 10px' }}>-</div>
            )}
          </div>
        </div>
      ),
      width: '150px',
    },

    {
      name: 'Financec Name',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row?.finance_name?.name ? row.finance_name.name : '-'}
        </div>
      ),
    },

    {
      name: 'Status',
      selector: (row) => (
        <div className="data_table_colum">
          {row && row.status ? (
            <p className="rounded-pill mb-0 text-capitalize">
              <CBadge
                style={{
                  background:
                    statusValue.find((item) => item.label === row?.status)?.bgcolor || '#3399FF',
                }}
              >
                {row.status === 'updated by bm' ? (
                  'Updated By BM'
                ) : (
                  <>
                    {row.status
                      .toLowerCase()
                      .replace(/\b(coo|fe|rc|dm|bm|sdm|lcto|cto)\b/g, (match) =>
                        match.toUpperCase(),
                      )}
                  </>
                )}
              </CBadge>
            </p>
          ) : (
            '-'
          )}
        </div>
      ),
      width: '15%',
    },

    {
      name: 'Created',
      cell: (row) => (
        <CustomTooltip content={moment(row.created_at).format('DD MMM YYYY HH:mm:ss')}>
          <div style={{ padding: '5px 10px' }}>
            <div className="data_table_colum">{moment(row.created_at).fromNow()}</div>
          </div>
        </CustomTooltip>
      ),
      center: 'true',
    },
  ]

  const handleCheckboxChange = (event) => {
    setSelected({
      ...selected,
      [event.target.name]: !selected[event.target.name],
    })
  }

  const handleDownload = async () => {
    const isAnyFieldSelected = Object.values(selected).some((value) => value)

    if (!isAnyFieldSelected) {
      dispatch({ type: 'set', validations: ['Please select atleast one field!'] })
      return
    }

    if (data.length === 0) {
      dispatch({ type: 'set', validations: ['Please filter first!'] })
      return
    }

    const formattedData = data.map((item) => {
      const formattedItem = {}
      for (const key in selected) {
        if (selected[key]) {
          if (key.startsWith('contact_number')) {
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
          } else if (key === 'admin') {
            formattedItem[key] = item[key]?.name ? item[key]?.name : '-'
          } else if (
            key === 'dm' ||
            key === 'rc' ||
            key === 'lcto' ||
            key === 'cto' ||
            key === 'sfo'
          ) {
            formattedItem[key] = item[key]?.name ? item[key]?.name : '-'
          } else {
            formattedItem[key] = item[key] || '-'
          }
        }
      }

      return formattedItem
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Cases Report')

    // 3. Add headers and apply styles
    const headerStyle = {
      font: { bold: true },
      alignment: { wrapText: true },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'CCCCFF' } },
    }

    const cellStyle = { alignment: { wrapText: true } }

    const selectedColumns = Object.keys(selected).filter((key) => selected[key])

    const headerRow = worksheet.addRow(
      selectedColumns.map((column) => {
        switch (column) {
          case 'finance_name.name':
            return 'Finance Name'
          case 'ra_branch':
            return 'MA Branch'
          case 'applicant_name':
            return 'Applicant Name'
          case 'los_number':
            return 'LOS Number'
          case 'date_initiation_bank':
            return 'date of initiation by bank'
          case 'address':
            return 'Visit Address'
          case 'location':
            return 'City Or Village Name(Nero Location)'
          case 'accepted_by':
            return 'Visit By'
          case 'admin':
            return 'Created By'
          default:
            return column.replace(/_/g, ' ').toUpperCase()
        }
      }),
    )

    headerRow.eachCell((cell) => {
      cell.style = headerStyle
    })

    // Add data rows
    formattedData.forEach((item) => {
      const row = worksheet.addRow(selectedColumns.map((column) => item[column]))
      row.eachCell((cell) => {
        cell.style = { ...cellStyle }
      })
    })

    // 4. Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 30
    })

    // 5. Generate Excel file and trigger download
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, 'cases report.xlsx')
  }

  return (
    <>
      <SingleSubHeader moduleName={'Generate MIS'} />
      <CContainer fluid>
        {true && (
          <CaseSectionCard variant="filter" title="Filter Cases">
            <MsiFilter
              rowPerPage={rowPerPage}
              filterData={filteredData}
              setFilterData={setFilteredData}
              rabranchData
              setRAbranchData
              financenameData
              setFinancenameData
              isLoading={isLoadingWholeData}
              onReset={() => {
                handleFilterReset()
              }}
              onFilter={(filterParams) => {
                const searchParams = new URLSearchParams(location.search)
                for (const key in filterParams) {
                  if (filterParams.hasOwnProperty(key)) {
                    const value = filterParams[key]
                    if (value != '' && value != '0') searchParams.set(key, value)
                    else searchParams.delete(key)
                  }
                }
                searchParams.set('filter', 'true')
                navigate({ search: searchParams.toString() })
              }}
              data={wholeData}
            />
          </CaseSectionCard>
        )}

        <CaseSectionCard title="Case Details">
          {!isLoading ? (
            <div className="datatable">
              <DataTable
                responsive="true"
                columns={columns}
                data={data}
                paginationServer
                paginationTotalRows={totalCount}
                paginationDefaultPage={defaultPage}
                onChangePage={(page) => {
                  currentPage = page
                  setDefaultPage(parseInt(page))
                  updatePageQueryParam('page', currentPage)
                }}
                pagination
                selectableRowsHighlight
                highlightOnHover
                paginationRowsPerPageOptions={RowsPerPage}
                paginationPerPage={rowPerPage}
                onChangeRowsPerPage={(value) => {
                  count = value
                  setRowPerPage(value)
                  updatePageQueryParam('count', value)
                  setSelectedRowForModule('cases', value)
                }}
                onSelectedRowsChange={(state) => handleRowChange(state)}
                clearSelectedRows={toggleCleared}
              />
            </div>
          ) : (
            <AppTableSkeleton />
          )}
        </CaseSectionCard>
      </CContainer>

      <CommonMessageShowModel
        visible={commonMessageShowModel}
        close={() => setCommonMessageShowModel(false)}
        caseId={caseId}
        isShowCopyBtn={false}
      />
    </>
  )
}

