import React, { useState, useEffect } from 'react'
import { CCard, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'

import { cilChevronCircleDownAlt, cilChevronCircleUpAlt, cilCloudDownload, cilPencil } from '@coreui/icons'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import moment from 'moment'
import { ShimmerTable, ShimmerTitle } from 'react-shimmer-effects'
import videoIcon from 'src/assets/images/video-icon.png'
import BasicProvider from 'src/constants/BasicProvider'
import { useParams } from 'react-router-dom'
const URL = process.env.REACT_APP_NODE_URL

const SubmitDetailsSDM = ({ showCaseData }) => {
  const query = new URLSearchParams(location.search)
  const [show, setShow] = useState(false)
  const [rowPerPage, setRowPerPage] = useState(null)
  let [defaultPage, setDefaultPage] = useState(currentPage)
  var currentPage = parseInt(query.get('page') || 1)
  var count = query.get('count') || rowPerPage || 20
  const data = useSelector((state) => state.data?.files)

  const dispatch = useDispatch()
  const { id } = useParams();
  // console.log("Param SDM Id",id)

  useEffect(() => {
    fetchData();
  }, [])
  const fetchData = async () => {
    try {
      const response = await new BasicProvider(`cms/files?paeg=${currentPage}&count=${count}&id=${id}`).getRequest()
      dispatch({ type: 'set', data: { files: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
    } catch (error) {
      console.error('Error' + error)
    }
  }

 async function handleDownload(key) {
  console.log('Downloading file from:', key);

  try {
    const response = await new BasicProvider(
      `cms/files/download?key=${key}`,
      dispatch
    ).getRequest();

    // Directly use blob from response
    const blob = response.data;
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = key.split('/').pop(); // Extract filename
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
}


  const columns = [
    {
      name: 'File',
      selector: (row) => {
        const isImage = row.mime_type.startsWith('image/')
        const isVideo = row.mime_type.startsWith('video/')
        const isPDF = row.mime_type?.startsWith('application/pdf')
        if (isImage) {
          return (
            <div className="data_table_column">
              <img
                src={`${URL}/api/cms/files/view?key=${row.filepath}`}
                alt={row.name}
                style={{ width: '50px', height: '50px' }}
              />
            </div>
          )
        } else if (isVideo) {
          return (
            <div className="data_table_column">
              <img src={videoIcon} alt={row.name} style={{ width: '50px', height: '50px' }} />
            </div>
          )
        }
        else if (isPDF) {
          return (
            <div className="data_table_column pointer_cursor" onClick={() => openLightbox(row)}>
              <img src={PdfIcon} alt={row.name} style={{ width: '50px', height: '50px' }} />
            </div>
          )
        }
      },
      width: '10%',
    },
    {
      name: 'Name',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title">
          {row.name ? row.name : <ShimmerTitle line={5} />}
        </div>
      ),
      width: '40%',
      center: true,
    },
    {
      name: 'Size',
      selector: (row) => <div className="data_table_colum">{row.size}</div>,
      width: '20%',
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
      width: '20%',
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
        </div>
      ),
      width: '10%',
      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },
  ]

  return (
    <>
      <CRow className="mt-4">
        <CCol md={12}>
          <CCard className="applicant-details">
            <CCardHeader

              className="d-flex justify-content-between align-items-center c-card-headerSdm  rounded"
            >
              Files Uploded By FE
              <div className="action-btn" >
                <div className="edit-btn">
                  <CIcon icon={cilPencil} />
                </div>
                {show ? (
                  <CIcon icon={cilChevronCircleUpAlt} size="xl" onClick={() => setShow(!show)} />
                ) : (
                  <CIcon icon={cilChevronCircleDownAlt} size="xl" onClick={() => setShow(!show)} />
                )}
              </div>
            </CCardHeader>
            {show && (
              <DataTable
                data={data}
                columns={columns}
                responsive="true"
                paginationServer
                pagination
                selectableRowsHighlight
                highlightOnHover
              />
            )}
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export { SubmitDetailsSDM }
