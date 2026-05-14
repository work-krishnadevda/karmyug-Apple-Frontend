import {
  cilCheck,
  cilCheckAlt,
  cilDelete,
  cilPencil,
  cilSpreadsheet,
  cilTrash,
  cilCheckCircle,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CContainer,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CFormInput,
  CFormTextarea,
  CSpinner,
} from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RowsPerPage } from 'src/constants/variables'
import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import { MessageShow } from 'src/components/custom/popup/viewMessageModel'
import ConfirmAccept from 'src/components/custom/popup/confirmAccept'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'


export default function RA_PendingCase() {
  const navigate = useNavigate()
  const [rowPerPage, setRowPerPage] = useState(20)
  const location = useLocation()
  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.pendingcases)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)
  const [popVisible, setPopVisible] = useState(false)
  const [popRejectVisible, setPopRejectVisible] = useState(false)

  const [caseValue, setCaseValue] = useState(null)

  const [visibleMessageModel, setVisibleMessageModel] = useState(false)

  const [visibleConfirmAcc, setVisibleConfirmAcc] = useState(false)

  const [caseId, setCaseId] = useState('')

  const loggedInUser = useSelector((state) => state.userData)

  let loggedinUserRole = useSelector((state) => state?.userRole)

  let loggedInUserId = loggedInUser._id

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {

      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

  useEffect(() => {
    if (rowPerPage) {
      fetchData()
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search])

  const fetchData = async () => {
    try {
      // setDefaultPage(currentPage)
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
      const status = 'pending for accept'
      if (performSearch) {

        queryData['page'] = currentPage
        queryData['count'] = count
        queryData['status'] = status
        response = await new BasicProvider(
          `cases/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
      } else {

        response = await new BasicProvider(
          `cases/pending?page=${currentPage}&count=${count}&status=${status}`,
        ).getRequest()

      }

      dispatch({ type: 'set', data: { pendingcases: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('pendingcases')
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

  const handleFilter = async (search) => {
    try {
      const searchParams = new URLSearchParams(location.search)
      if (search) searchParams.set('search', search)
      navigate({ search: searchParams.toString() })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }


  const handleFilterReset = async () => {
    setSearchCurrentPage(1)
    currentPage = 1
    setDefaultPage(1)
    navigate({ search: '' })
  }


  const handleAcceptCase = async (caseId) => {
    try {
      if (!caseId) {
        console.log('Csse id is not availble');
        return
      }
      let response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest({
        accepted_by: loggedInUserId,
        status: 'pending for tie-up',
        type: 'fe call',
      })
      if (response) {
        setPopVisible(!popVisible)
        fetchData()
        setTimeout(() => {
          setPopVisible(false)
        }, [2000])
      }
    } catch (error) { }
  }


  let showCaseDetails = async (caseId) => {
    setCaseId(caseId)
    setVisibleMessageModel(true)
    try {
      if (caseId) {
        const data = await new BasicProvider(`cases/show/${caseId}`, dispatch).getRequest()
        setCaseValue(data.data)

      }
    } catch (error) {
      console.log('error', error.data);
      dispatch({ type: 'set', validations: [error.data] })
    }
  }
  const columns = [
    {
      name: 'Applicant Name',
      selector: (row) => (
        <div onClick={() => showCaseDetails(row._id)} className="data_table_colum ">
          <div className="">{row && row.applicant_name ? row.applicant_name : '-'}</div>
          <div className="fs-12 pt-1">
            {row && row.contact_number_1 ? row.contact_number_1 : '-'}
          </div>
        </div>
      ),
      width: '25%',
    },
    {
      name: 'RA Branch',
      selector: (row) => (
        <div className="data_table_colum">
          <div className="">{row && row?.ra_branch?.name ? row?.ra_branch?.name : '-'}</div>
          <div className="fs-12 pt-1">{row && row.case_of_branch ? row.case_of_branch : '-'}</div>
        </div>
      ),
    },

    {
      name: 'City Or Village Name',
      selector: (row) => (
        <div className="data_table_colum">{row && row.location ? row.location : '-'}</div>
      ),
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
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn me-3">
          {row.status === 'concern by fe' && (
            <div
              onClick={() => {
                setCaseId(row._id)
                setHoldVisible(!holdVisible)
              }}
              className="edit-btn pointer_cursor"
            >
              <FontAwesomeIcon icon={faEye} />
            </div>
          )}

          <CustomTooltip content={'View details'}>
            <div
              className="edit-btn pointer_cursor"
              onClick={() =>
                navigate(`/case/${row._id}/update/details/by/${loggedinUserRole.name}`)
              }
            >
              <FontAwesomeIcon icon={faEye} />
            </div>
          </CustomTooltip>
        </div>
      ),

      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },

  ]


  return (
    <>
      <SingleSubHeader moduleName="My Pending Accept" />
      <CContainer fluid>
        <>
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
                // selectableRows
                selectableRowsHighlight
                highlightOnHover
                paginationRowsPerPageOptions={RowsPerPage}
                paginationPerPage={rowPerPage}
                onChangeRowsPerPage={(value) => {
                  count = value
                  setRowPerPage(value)
                  updatePageQueryParam('count', value)
                  setSelectedRowForModule('pendingcases', value)
                }}
                onSelectedRowsChange={(state) => handleRowChange(state)}
                clearSelectedRows={toggleCleared}
              />
            </div>
          ) : (
            <AppTableSkeleton />
          )}
        </>

        <DeleteModal
          visible={visible}
          userId={userId}
          moduleName="cases"
          currentPage={currentPage}
          rowPerPage={rowPerPage}
          setVisible={setVisible}
          deletionType="trash"
          handleClose={() => setVisible(false)}
        />

        <CModal
          alignment="center"
          visible={popVisible}
          onClose={() => setPopVisible(false)}
          className="delete_item_box"
        >
          <CModalBody className="text-center mt-4">
            {/* <CModalHeader onClose={() => setPopVisible(false)}></CModalHeader> */}

            <div className="logo_check m-auto mb-5">✓</div>
            <h1 className="h4">Accepted Successfully</h1>
          </CModalBody>
          <CModalFooter className="model_footer justify-content-center mb-3 pt-0"></CModalFooter>
        </CModal>
        <CModal
          alignment="center"
          visible={popRejectVisible}
          onClose={() => setPopRejectVisible(false)}
          className="delete_item_box"
        >
          <CModalHeader onClose={() => setPopRejectVisible(false)}>
            <CModalTitle id="StaticBackdropExampleLabel">Reason For Reject</CModalTitle>
          </CModalHeader>

          <CModalBody>
            <CFormTextarea
              placeholder="Leave a comment here"
              id="floatingTextarea2"
              style={{ height: '100px' }}
            ></CFormTextarea>
          </CModalBody>

          <CModalFooter>
            <CButton color="danger" className="text-white">
              Submit
            </CButton>
          </CModalFooter>
        </CModal>

        <MessageShow
          visible={visibleMessageModel}
          setshowMessage={setVisibleMessageModel}
          handleCloseShowMessage={() => setVisibleMessageModel(false)}
          caseValue={caseValue}
          isFromFE={false}
          caseId={caseId}
          visibleConfirmAcc={visibleConfirmAcc}
          setVisibleConfirmAcc={setVisibleConfirmAcc}
          close={() => setVisibleMessageModel(false)}
          handleAcceptCase={handleAcceptCase}

        />

      </CContainer>

      <ConfirmAccept
        visible={visibleConfirmAcc}
        close={() => setVisibleConfirmAcc(false)}
        caseId={caseId}
        handleAcceptCase={handleAcceptCase}
      />










    </>
  )
}

