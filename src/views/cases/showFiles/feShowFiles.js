import { cilInfo, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CContainer, CBadge } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import SubHeader from 'src/components/custom/SubHeader'
import { RowsPerPage } from 'src/constants/variables'
// import HelperFunction from '../../helpers/HelperFunctions'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import { DeleteModal, handleConfirmDelete } from 'src/helpers/deleteModalHelper'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'
import { ShimmerTable, ShimmerTitle } from 'react-shimmer-effects'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import HelperFunction from 'src/helpers/HelperFunctions'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import SubHeaderWithOutDropDown from 'src/components/custom/SubHeaderWithoutDropDown'
import { cilCloudDownload } from '@coreui/icons'
import { useParams } from 'react-router-dom'
import axios from 'axios'


import videoIcon from 'src/assets/images/video-icon.png'
import pdfIcon from 'src/assets/images/pdfIcon.png'
import docIcon from 'src/assets/images/docc.png'
import { handleDownload } from 'src/constants/common'


export default function FeShowFiles() {
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
  const data = useSelector((state) => state.data?.files)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)

  const feRole = process.env.REACT_APP_FE
  const URL = process.env.REACT_APP_NODE_URL

  const [feAttachments, setFeAttachments] = useState([]);

  var params = useParams()
  const id = params.id

  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {

      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

  // console.log('data', data)

  useEffect(() => {
    if (rowPerPage) {
      fetchData()
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search, id])


  const fetchData = async () => {
    try {
      // setDefaultPage(currentPage)
      let performSearch = false
      var queryData = {}
      const roles = [feRole];
      const rolesParam = roles.join(',');
      for (const [key, value] of query.entries()) {
        if (key !== 'page' && key !== 'count') {
          queryData[key] = value
          if (value !== '' && value !== null) {
            performSearch = true
          }
        }
      }


      var response
      // console.log(performSearch);
      if (performSearch) {
        queryData['page'] = currentPage
        queryData['count'] = count
        response = await new BasicProvider(
          `cases/search?${HelperFunction.convertToQueryString(queryData)}`,
        ).getRequest()
        // console.log(response)
      } else {
        response = await new BasicProvider(`cms/files/by/roles?page=${1}&count=${10}&id=${id}&role=${rolesParam}`, dispatch).getRequest();
        const feFiles = response.data.data;
        // console.log( 'LOLOLOLs',response)


        dispatch({ type: 'set', data: { files: feFiles } })
        dispatch({ type: 'set', totalCount: response.data.total })

        setIsLoading(false)
      }

    } catch (error) {
      setIsLoading(false)

      console.error(error)
    }
  }

  const handleRowChange = useCallback((state) => {
    const rows = state.selectedRows
    const rowsId = rows.map((item) => item._id)
    dispatch({ type: 'set', selectedrows: rowsId })
  }, [])

  const columns = [
    {
      name: 'File',
      selector: (row) => {
        const isImage = row.mime_type?.startsWith('image/')
        const isVideo = row.mime_type?.startsWith('video/')
        const isPDF = row.mime_type?.startsWith('application/pdf')
        const isDOc = row.mime_type?.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')

        if (isImage) {
          return (
            <div className="data_table_column" onClick={() => openLightbox(row)}>

              <img
                src={`${URL}/api/cms/files/view?key=${row.filepath}`}
                alt={row.name}
                style={{ width: '50px', height: '50px' }}
              />
            </div>
          )
        } else if (isVideo) {
          return (
            <div className="data_table_column" onClick={() => openLightbox(row)}>
              <img src={videoIcon} alt={row.name} style={{ width: '50px', height: '50px' }} />
            </div>
          )
        } else if (isPDF) {
          return (
            <div className="data_table_column" onClick={() => openLightbox(row)}>
              <img src={pdfIcon} alt={row.name} style={{ width: '50px', height: '50px' }} />
            </div>
          )
        } else if (isDOc) {
          return (
            <div className="data_table_column" onClick={() => openLightbox(row)}>
              <img src={docIcon} alt={row.name} style={{ width: '50px', height: '50px' }} />
            </div>
          )
        }
      },
      //width: '20%',
    },
    {
      name: 'Name',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title">
          {row.name ? row.name : <ShimmerTitle line={5} />}
        </div>
      ),

      // width: '40%',
      center: true,
    },
    {
      name: 'Uploaded by',
      selector: (row) => (
        <>
          <div className="pointer_cursor data_Table_title">
            {row.admins.name && row.admins.name ? row.admins.name : <ShimmerTitle line={5} />}
          </div>
          <small>{row.admins.role.display_name}</small>
        </>
      ),
      //   width: '40%',
      center: true,
    },
    {
      name: 'Size',
      cell: (row) => <div className="data_table_column">{row.size}</div>,
      //  width: '10%',
    },
    {
      name: 'Created',
      cell: (row) => (
        <CustomTooltip content={moment(row.created_at).format('DD MMM YYYY HH:mm:ss')}>
          <div style={{ padding: '5px 10px' }}>
            <div className="data_table_column">{moment(row.created_at).fromNow()}</div>
          </div>
        </CustomTooltip>
      ),
      //width: '20%',
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="action-btn">
          <div className="download-btn edit-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilCloudDownload}
              onClick={() => handleDownload(`${row.filepath}`)}
            />
          </div>
          <div className="download-btn ms-2 delet-btn">
            <CIcon
              className="pointer_cursor"
              icon={cilTrash}
              onClick={() => {
                setVisible(true)
                setuserId([row._id])
              }}
            />
          </div>
        </div>
      ),
      //   width: '10%',
      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },
  ]

  return (
    <>
      <SingleSubHeader moduleName={'FE All Files'} />

      <CContainer fluid>
        {/* {rowPerPage && data && ( */}
        {isLoading ? (
          <div className="custom-table-shimmer">
            <ShimmerTable row={10} />
          </div>
        ) : (
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
              selectableRows
              selectableRowsHighlight
              highlightOnHover
              paginationRowsPerPageOptions={RowsPerPage}
              paginationPerPage={rowPerPage}
              onChangeRowsPerPage={(value) => {
                count = value
                setRowPerPage(value)
                updatePageQueryParam('count', value)
                setSelectedRowForModule('admin', value)
              }}

              onSelectedRowsChange={(state) => handleRowChange(state)}
              clearSelectedRows={toggleCleared}
            />

          </div>
        )}

        <DeleteModal
          visible={visible}
          userId={userId}
          moduleName="admins"
          currentPage={currentPage}
          rowPerPage={rowPerPage}
          setVisible={setVisible}
          deletionType="trash"
          handleClose={() => setVisible(false)}
        />

      </CContainer>
    </>
  )
}
