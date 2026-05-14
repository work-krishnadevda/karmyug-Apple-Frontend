import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CHeader,
  CInputGroup,
  CRow,
  CSpinner,
} from '@coreui/react'

import { useParams } from 'react-router-dom'
import moment from 'moment'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import AppTableSkeleton from 'src/components/custom/table/AppTableSkeleton'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RowsPerPage } from 'src/constants/variables'

import BasicProvider from 'src/constants/BasicProvider'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import axios from 'axios'
import fileupload from 'src/assets/images/uploadIcon.png'
//   assets/images/uploadIcon.png
import { customSuccessMSG, setAlertTimeout } from 'src/helpers/alertHelper'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilTrash } from '@coreui/icons'

import videoIcon from 'src/assets/images/video-icon.png'
import pdfIcon from 'src/assets/images/pdfIcon.png'
import docIcon from 'src/assets/images/docc.png'

import Video from 'yet-another-react-lightbox/plugins/video'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import handleSubmitHelper from 'src/helpers/submitHelper'

const URL = process.env.REACT_APP_NODE_URL
const validationRules = {}

let DM = process.env.REACT_APP_DM
let FE = process.env.REACT_APP_FE
let COO = process.env.REACT_APP_COO

const COO_Attechement = () => {

    
  var params = useParams()
  const id = params.id
  const navigate = useNavigate()
  const isEditMode = !!id
  const uploadInProgress = useRef(false)
  const wrapperRef = useRef(null)
  const fileInputRef = useRef(null)

  // FOR DATA TABLE
  const [selectedFile, setSelectedFile] = useState(null)
  const [lgihtboxopen, setLightBoxOpen] = React.useState(false)
  const [rowPerPage, setRowPerPage] = useState(null)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)

  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage || 20
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.files)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)
  let loggedinUserRole = useSelector((state) => state?.userRole)

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
    const fetchSelectedRows = async () => {
      const savedSelectedRows = await handleSelectedRowChange('files')
      if (savedSelectedRows && !count) {
        setRowPerPage(savedSelectedRows)
      } else {
        setRowPerPage(count)
      }
    }
    fetchSelectedRows()
  }, [count])

  useEffect(() => {
    setIsLoadingSpinner(false)
  }, [])

  const handleRowChange = useCallback((state) => {
    const rows = state.selectedRows
    const rowsId = rows.map((item) => item._id)
    dispatch({ type: 'set', selectedrows: rowsId })
  }, [])

  const onDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    // const totalFiles = dmFiles?.length + files?.length
    // if (loggedinUserRole.name === DM && totalFiles > 2) {
    //   dispatch({ type: 'set', validations: ['You can only upload 2 files'] })
    //   return
    // }
    // handleFiles(files)
    wrapperRef.current.classList.remove('dragover')
  }

  const openLightbox = (file) => {
    setSelectedFile(file)
    setLightBoxOpen(true)
  }

  const handleFiles = async (files) => {
    try {
      const fileData = Array.from(files)

      await handleSubmit(fileData)
    } catch (error) {
      console.error('Error handling files:', error)
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }
console.count('FILE INPUT CHANGE')
  const onFileInputChange = (e) => {
    const files = e.target.files
    // const totalFiles = dmFiles?.length + files?.length
    // if (loggedinUserRole.name === DM && totalFiles > 2) {
    //   dispatch({ type: 'set', validations: ['You can only upload 2 files'] })
    //   return
    // }
    if (!files.length) return

    handleFiles(files)
    e.target.value = ''
  }

  useEffect(() => {
    const wrapper = wrapperRef.current

    const onDragEnter = (e) => {
      e.preventDefault()
      e.stopPropagation()
      wrapper.classList.add('dragover')
    }

    const onDragLeave = (e) => {
      e.preventDefault()
      e.stopPropagation()
      wrapper.classList.remove('dragover')
    }

    if (wrapper) {
      wrapper.addEventListener('dragenter', onDragEnter)
      wrapper.addEventListener('dragover', onDragOver)
      wrapper.addEventListener('dragleave', onDragLeave)
      wrapper.addEventListener('drop', onDrop)
    }

    return () => {
      if (wrapper) {
        wrapper.removeEventListener('dragenter', onDragEnter)
        wrapper.removeEventListener('dragover', onDragOver)
        wrapper.removeEventListener('dragleave', onDragLeave)
        wrapper.removeEventListener('drop', onDrop)
      }
    }
  }, [])

  // const handleSubmit = async (fileData) => {
  //     setIsLoadingSpinner(true)
  //     try {
  //         const formData = new FormData()
  //         if (fileData.length > 0) {
  //             for (let i = 0; i < fileData.length; i++) {
  //                 formData.append('gallery', fileData[i])
  //             }

  //         }

  //         if (formData) {
  //             let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(
  //                 formData,
  //             )

  //             customSuccessMSG(dispatch, 'File Uploaded Successfully !!')
  //             setIsLoadingSpinner(false)
  //             fetchData(currentPage, rowPerPage, searchcurrentPage, search, count)
  //         }

  //     } catch (error) {
  //         console.error('Error uploading files:', error)
  //         setIsLoadingSpinner(false)
  //     }
  // }
  const handleSubmit = async (fileData) => {
    if (uploadInProgress.current) return
    uploadInProgress.current = true

    setIsLoadingSpinner(true)

    try {
      const formData = new FormData()
      fileData.forEach((file) => formData.append('gallery', file))

      await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(formData)

      customSuccessMSG(dispatch, 'File Uploaded Successfully !!')
      fetchData(currentPage, rowPerPage, searchcurrentPage, search, count)
    } catch (err) {
      console.error(err)
    } finally {
      uploadInProgress.current = false
      setIsLoadingSpinner(false)
    }
  }

  useEffect(() => {
    if (rowPerPage) {
      fetchData(currentPage, rowPerPage, searchcurrentPage, search, count)
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search, count])

  const fetchData = async (currentPage, rowPerPage, searchcurrentPage, search, count) => {
    try {
      const roles = [COO]
      const rolesParam = roles.join(',')

      var queryData = {}

      for (const [key, value] of query.entries()) {
        if (key !== 'page' && key !== 'count') {
          queryData[key] = value
        }
      }

      const response = await new BasicProvider(
        `cms/files/by/roles?page=${currentPage}&count=${count}&id=${id}&role=${rolesParam}`,
      ).getRequest()
      dispatch({ type: 'set', data: { files: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setTimeout(() => {
        setIsLoading(false)
      }, [])
    }
  }

  async function handleDownload(key) {
    console.log('Downloading file from:', key)

    try {
      const response = await new BasicProvider(
        `cms/files/download?key=${key}`,
        dispatch,
      ).getRequest()

      // Directly use blob from response
      const blob = response.data
      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = key.split('/').pop() // Extract filename
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const columns = [
    {
      name: 'File',
      selector: (row) => {
        const isImage = row.mime_type?.startsWith('image/')
        const isVideo = row.mime_type?.startsWith('video/')
        const isPDF = row.mime_type?.startsWith('application/pdf')
        const isDOc = row.mime_type?.startsWith(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        )

        if (isImage) {
          return (
            <div className="data_table_column" onClick={() => openLightbox(row)}>
              <img
                src={`${URL}/api/cms/files/view?key=${row.filepath}`}
                alt={row.name}
                style={{ width: '45px', height: '45px', padding: '7px' }}
              />
            </div>
          )
        } else if (isVideo) {
          return (
            <div className="data_table_column" onClick={() => openLightbox(row)}>
              <img
                src={videoIcon}
                alt={row.name}
                style={{ width: '45px', height: '45px', padding: '7px' }}
              />
            </div>
          )
        } else if (isPDF) {
          return (
            <div className="data_table_column" onClick={() => openLightbox(row)}>
              <img
                src={pdfIcon}
                alt={row.name}
                style={{ width: '45px', height: '45px', padding: '7px' }}
              />
            </div>
          )
        } else if (isDOc) {
          return (
            <div className="data_table_column" onClick={() => openLightbox(row)}>
              <img
                src={docIcon}
                alt={row.name}
                style={{ width: '45px', height: '45px', padding: '7px' }}
              />
            </div>
          )
        }
      },
      width: '20%',
      // center: 'true',
    },
    {
      name: 'Name',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title">
          {row.name ? row.name : <ShimmerTitle line={5} />}
        </div>
      ),
      width: '20%',
      center: true,
    },
    {
      name: 'Size',
      selector: (row) => <div className="data_table_colum">{row.size}</div>,
      width: '20%',
      center: 'true',
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
      center: 'true',
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
      width: '20%',
      center: 'true',
    },
  ]

  return (
    <>
      <CContainer fluid>
        <CRow className="mt-4">
          <div className=" spinner_outerbox">
            <div className="text-center">
              <CSpinner size="lg" style={{ width: '3rem', height: '3rem' }} />
            </div>
          </div>

          <CCol className="mb-4">
            <div ref={wrapperRef} className="upload_files">
              <div className="file_upload">
                <img src={fileupload} alt="" width={50} />
                <p>Drag & Drop your files here</p>
              </div>

              <input
                name="gallery"
                type="file"
                accept="image/*, video/*, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ref={fileInputRef}
                style={{ display: 'block' }}
                multiple
                onChange={onFileInputChange}
              />
            </div>
          </CCol>

          {!isLoading ? (
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
                setSelectedRowForModule('files', value)
              }}
              onSelectedRowsChange={(state) => handleRowChange(state)}
              clearSelectedRows={toggleCleared}
            />
          ) : (
            <AppTableSkeleton />
          )}

          <DeleteModal
            visible={visible}
            userId={userId}
            moduleName="cms/files"
            currentPage={currentPage}
            rowPerPage={rowPerPage}
            setVisible={setVisible}
            deletionType="delete"
            handleClose={() => setVisible(false)}
            isDirectDelete={true}
            isFileWithPatams={true}
            isCaseDelete={true}
            selectedCaseId={id}
          />
        </CRow>
      </CContainer>

      {selectedFile && (
        <Lightbox
          open={lgihtboxopen}
          plugins={[Video]}
          close={() => setLightBoxOpen(false)}
          slides={[
            {
              type: selectedFile.mime_type?.startsWith('video/') ? 'video' : 'image',
              sources: selectedFile.mime_type?.startsWith('video/')
                ? [
                    {
                      src: `${URL}/api/cms/files/view?key=${selectedFile.filepath}`,
                      type: 'video/mp4',
                    },
                  ]
                : [],
              src: `${URL}/api/cms/files/view?key=${selectedFile.filepath}`,
            },
          ]}
          Video={
            {
              // controls,
              // playsInline,
              // autoPlay,
              // loop,
              // muted,
              // disablePictureInPicture,
              // disableRemotePlayback,
              // controlsList: controlsList.join(' '),
              // crossOrigin,
              // preload,
            }
          }
        />
      )}
    </>
  )
}

export default COO_Attechement

