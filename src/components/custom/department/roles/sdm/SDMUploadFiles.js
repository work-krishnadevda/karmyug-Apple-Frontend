import {
  CButton,
  CCol,
  CFormLabel,
  CRow,
  CSpinner,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
import Select from 'react-select'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RowsPerPage } from 'src/constants/variables'

import { ShimmerTable, ShimmerTitle } from 'react-shimmer-effects'
import BasicProvider from 'src/constants/BasicProvider'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import axios from 'axios'
import fileupload from '../../../../../assets/images/uploadIcon.png'
import { customSuccessMSG, setAlertTimeout } from 'src/helpers/alertHelper'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilTrash, cilChevronCircleUpAlt } from '@coreui/icons'
import videoIcon from 'src/assets/images/video-icon.png'
import pdfIcon from 'src/assets/images/pdfIcon.png'
import docIcon from 'src/assets/images/docc.png'

import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Video from 'yet-another-react-lightbox/plugins/video'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import AsyncSelect from 'react-select/async'

// import { handleDownload } from 'src/constants/common'
import handleSubmitHelper from 'src/helpers/submitHelper'

const URL = process.env.REACT_APP_NODE_URL
let SDM = process.env.REACT_APP_SDM

const validationRules = {
  dm: {
    required: true,
  },
}

const SDMUploadFiles = ({ currentStep, setCurrentStep, showCaseData }) => {
  const totalSteps = 8
  const handlePreviousStep = () => {
    setCurrentStep((current) => (current > 1 ? current - 1 : current))
  }

  var params = useParams()
  const id = params.id
  const navigate = useNavigate()
  const isEditMode = !!id

  const wrapperRef = useRef(null)
  const fileInputRef = useRef(null)

  // FOR DATA TABLE
  const [selectedFile, setSelectedFile] = useState(null)
  const [lgihtboxopen, setLightBoxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const [signedUrls, setSignedUrls] = useState({})
  const [urlLoading, setUrlLoading] = useState({})
  const [selectedRows, setSelectedRows] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxSlides, setLightboxSlides] = useState([])
  const location = useLocation()

  const state = location.state || {}

  const [rowPerPage, setRowPerPage] = useState(20)
  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)

  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)

  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.files)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)
  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [currectCaseStatus, setCurrectCaseStatus] = useState('')

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
    setSelectedRows(state.selectedRows)
    const rows = state.selectedRows
    const rowsId = rows.map((item) => item._id)
    dispatch({ type: 'set', selectedrows: rowsId })
  }, [])

  const onDrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    handleFiles(files)
    wrapperRef.current.classList.remove('dragover')
  }

  const openLightbox = (file) => {
    if (
      file.mime_type?.startsWith('application/pdf') ||
      file.mime_type?.startsWith(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      )
    ) {
      const url = signedUrls[file._id]
      if (url) {
        window.open(url, '_blank')
      } else {
        console.error('URL not available for file')
      }
      return
    }

    const viewableFiles = data.filter(
      (f) => f.mime_type?.startsWith('image/') || f.mime_type?.startsWith('video/'),
    )

    const slides = viewableFiles.map((f) => {
      const url = signedUrls[f._id]
      return {
        type: f.mime_type?.startsWith('video/') ? 'video' : 'image',
        sources: f.mime_type?.startsWith('video/') ? [{ src: url, type: 'video/mp4' }] : [],
        src: url,
      }
    })

    const fileIndex = viewableFiles.findIndex((f) => f._id === file._id)

    setLightboxSlides(slides)
    setLightboxIndex(fileIndex)
    setLightBoxOpen(true)
  }

  // console.log('openlightbox', selectedFile)
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

  const onFileInputChange = (e) => {
    handleFiles(e.target.files)
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

  const handleSubmit = async (fileData) => {
    setIsLoadingSpinner(true)
    try {
      const formData = new FormData()
      if (fileData.length > 0) {
        for (let i = 0; i < fileData.length; i++) {
          formData.append('gallery', fileData[i])
        }
      }

      if (formData) {
        let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(
          formData,
        )

        fetchData(currentPage, rowPerPage, searchcurrentPage, search, count)
        customSuccessMSG(dispatch, 'File Uploaded Successfully !!')
        setIsLoadingSpinner(false)
      }

      // console.log('fileData', fileData)
    } catch (error) {
      console.error('Error uploading files:', error)
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
      var queryData = {}
      for (const [key, value] of query.entries()) {
        if (key !== 'page' && key !== 'count') {
          queryData[key] = value
        }
      }

      const response = await new BasicProvider(
        `cms/files?page=${currentPage}&count=${count}&id=${id}`,
      ).getRequest()

      console.log('response====>>', response.data.data)

      dispatch({ type: 'set', data: { files: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
    } catch (error) {
      console.error(error)
      setTimeout(() => {}, [])
    }
  }

  const fetchSignedUrl = async (fileId, fileKey) => {
    if (!fileKey || urlLoading[fileId]) return
    setUrlLoading((prev) => ({ ...prev, [fileId]: true }))
    try {
      const response = await new BasicProvider(
        `cms/files/signed-url?key=${fileKey}`,
        dispatch,
      ).getRequest()
      setSignedUrls((prev) => ({ ...prev, [fileId]: response.data.url }))
    } catch (error) {
      console.error(`Error fetching signed URL for ${fileKey}:`, error)
      setSignedUrls((prev) => ({ ...prev, [fileId]: 'error' }))
    } finally {
      setUrlLoading((prev) => ({ ...prev, [fileId]: false }))
    }
  }

  // New useEffect to fetch all signed URLs at once
  useEffect(() => {
    if (data && data.length > 0) {
      data.forEach((file) => {
        if (!signedUrls[file._id] && !urlLoading[file._id]) {
          fetchSignedUrl(file._id, file.filepath)
        }
      })
    }
  }, [data])

  const handleDownload = async (fileKey) => {
    try {
      const response = await new BasicProvider(
        `cms/files/signed-url?key=${fileKey}&download=true`,
        dispatch,
      ).getRequest()
      const url = response.data.url
      const link = document.createElement('a')
      link.href = url
      link.download = fileKey.split('/').pop()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const downloadFilesZip = async () => {
    if (selectedRows.length === 0) {
      dispatch({
        type: 'set',
        validations: ['At least one file must be selected for bulk download!'],
      })
      return
    }

    setIsLoadingSpinner(true)
    const zip = new JSZip()

    try {
      // Create an array of promises to fetch signed URLs for all selected files
      const urlPromises = selectedRows.map(async (item) => {
        const response = await new BasicProvider(
          `cms/files/signed-url?key=${item.filepath}&download=true`,
          dispatch,
        ).getRequest()
        return { url: response.data.url, name: item.name }
      })

      // Wait for all promises to resolve
      const filesToDownload = await Promise.all(urlPromises)

      // Loop through the fetched URLs and add them to the zip
      for (const file of filesToDownload) {
        const response = await fetch(file.url)
        const blob = await response.blob()
        zip.file(file.name, blob)
      }

      // Generate and save the zip file
      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'bulk-download-files.zip')
        setIsLoadingSpinner(false)
        customSuccessMSG(dispatch, 'Files downloaded successfully!')
      })
    } catch (error) {
      console.error('Error creating ZIP file:', error)
      setIsLoadingSpinner(false)
      dispatch({ type: 'set', validations: ['Failed to create ZIP file. Please try again.'] })
    }
  }

  const columns = [
    {
      name: 'File',
      selector: (row) => {
        const url = signedUrls[row._id]
        const isLoadingUrl = urlLoading[row._id]

        if (isLoadingUrl) {
          return <CSpinner size="sm" />
        }
        if (url === 'error') {
          return <p>Load Error</p>
        }
        const isImage = row.mime_type?.startsWith('image/')
        const isVideo = row.mime_type?.startsWith('video/')
        const isPDF = row.mime_type?.startsWith('application/pdf')
        const isDOc = row.mime_type?.startsWith(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        )

        if (isImage) {
          return (
            <div className="data_table_column">
              <img
                src={url}
                alt={row.name}
                style={{ width: '45px', height: '45px', padding: '7px' }}
                onClick={() => openLightbox(row)}
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
      width: '15%',
    },

    {
      name: 'File Name',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title">
          {row.name ? row.name : <ShimmerTitle line={5} />}
        </div>
      ),
      width: '30%',
      center: true,
    },
    {
      name: 'Uploaded By',
      selector: (row) => (
        <div className="">
          {/* {console.log('ROWWW',row)} */}
          <div className="data_table_colum pointer_cursor data_Table_title">
            {row && row.admin && row.admin.name ? `${row.admin.name}` : '-'}
          </div>
          <small>{row && row.admin && row.admin.role[0].display_name}</small>
        </div>
      ),
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
      ignoreRowClick: true,
      allowoverflow: true,
      button: 'true',
    },
  ]

  // -------------------------------- ASSIGN DM Data Handler -------------------------------- //

  const [defaultOptionDM, setDefaultOptionDM] = useState([])

  const [initialValues, setInitialValues] = useState({
    status: 'pending for draft',
    dm: '',
    ids: [],
  })

  const sendToDM = async () => {
    // console.log('INIT=====DM',initialValues);
    // return

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/assign/dm`, dispatch).patchRequest(data)
      if (response.status === 'success') {
        customSuccessMSG(dispatch, 'Assigned Successfuly')
        navigate('/case/all')
      }
    } catch (error) {
      console.log(error)
      // dispatch({ type: 'set', catcherror: error.data })
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  useEffect(() => {
    fetchDefaultOptionForDM()
    setInitialValues((prev) => ({ ...prev, ids: [id] }))
  }, [id])

  const fetchDefaultOptionForDM = async () => {
    try {
      let slugs = [process.env.REACT_APP_DM]
      const queryString = slugs.join(',')
      const url = `admins/get-multiple?slugs=${encodeURIComponent(queryString)}`

      const response = await new BasicProvider(url).getRequest()

      let ans = response?.data.map((item) => item._id)

      const response2 = await new BasicProvider(`cases/get-counts/dm`, dispatch).patchRequest({
        ids: ans,
      })

      let counts = response2.data

      const countMap = counts.reduce((map, item) => {
        map[item._id] = item.count
        return map
      }, {})

      const options = response.data.map((item) => ({
        label: item.name,
        value: item._id,
      }))

      const modifiedOptions = options.map((option) => {
        const count = countMap[option.value]
        if (count !== undefined) {
          option.label = `${option.label} (${count})`
        }
        return option
      })

      setDefaultOptionDM(modifiedOptions)
    } catch (error) {
      console.error(error)
    }
  }

  const loadOptionsForDM = async (inputValue, callback) => {
    try {
      let slugs = [process.env.REACT_APP_DM]
      const queryString = slugs.join(',')
      const response = await new BasicProvider(
        `admins/get-multiple?slugs=${encodeURIComponent(queryString)}&search=${inputValue}`,
      ).getRequest()

      const options = response.data.map((item) => ({
        label: item.name,
        value: item._id,
      }))

      let ans = response?.data.map((item) => item._id)

      const response2 = await new BasicProvider(`cases/get-counts/dm`, dispatch).patchRequest({
        ids: ans,
      })

      let counts = response2.data

      const countMap = counts.reduce((map, item) => {
        map[item._id] = item.count
        return map
      }, {})

      const modifiedOptions = options.map((option) => {
        const count = countMap[option.value]
        if (count !== undefined) {
          option.label = `${option.label} (${count})`
        }
        return option
      })
      callback(modifiedOptions)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchSHowCaseData()
  }, [navigate, id, state])

  let fetchSHowCaseData = async () => {
    try {
      const data = await new BasicProvider(`cases/show/${id}`, dispatch).getRequest()
      setCurrectCaseStatus(data?.data?.status)
    } catch (error) {
      dispatch({ type: 'set', catcherror: error.data })
    }
  }

  return (
    <>
      <div>
        <CRow className="mt-4">
          <CCol md={12}>
            <CCard className="applicant-details">
              <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm rounded">
                Upload Files
                {/* <CIcon icon={cilChevronCircleUpAlt} size="xl" /> */}
                <CButton
                  color="success"
                  size="sm"
                  // variant='outline'
                  onClick={downloadFilesZip}
                >
                  Bulk Download
                </CButton>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CRow className="mb-4 mt-4">
                    <CCol>
                      <div ref={wrapperRef} className="upload_files ms-4">
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
                  </CRow>
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
                      setSelectedRowForModule('files', value)
                    }}
                    onSelectedRowsChange={(state) => handleRowChange(state)}
                    clearSelectedRows={toggleCleared}
                  />

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
                    count={count}
                  />
                </CRow>

                {currectCaseStatus === 'visit done' && (
                  <CRow md={9} className="d-flex align-items-center">
                    <>
                      <CCol xs={12} lg={4} className="align-items-center mb-0">
                        <CFormLabel>Assign to DM</CFormLabel>
                        <AsyncSelect
                          name="dm"
                          loadOptions={(inputValue, callback) =>
                            loadOptionsForDM(inputValue, callback)
                          }
                          defaultOptions={defaultOptionDM}
                          value={
                            defaultOptionDM.find(
                              (option) =>
                                option.value === (initialValues?.dm?._id || initialValues?.dm),
                            ) || null
                          }
                          getOptionLabel={(option) => option.label}
                          getOptionValue={(option) => option.value}
                          onChange={(selected) =>
                            setInitialValues({ ...initialValues, dm: selected.value })
                          }
                        />
                      </CCol>
                      <CCol>
                        <CButton onClick={sendToDM} className="mt-4 submit_btn">
                          Assign Case
                        </CButton>
                      </CCol>
                    </>
                  </CRow>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>

      <>
        <Lightbox
          open={lgihtboxopen}
          plugins={[Video, Zoom]}
          close={() => setLightBoxOpen(false)}
          slides={lightboxSlides}
          index={lightboxIndex}
          on={{
            view: ({ index }) => {
              const nextIndex = (index + 1) % lightboxSlides.length
              const nextFile = data.find(
                (f) =>
                  (f.mime_type?.startsWith('image/') || f.mime_type?.startsWith('video/')) &&
                  f.filepath === lightboxSlides[nextIndex].src.split('/').pop().split('?')[0],
              )
              if (nextFile) {
                fetchSignedUrl(nextFile._id, nextFile.filepath)
              }
            },
          }}
          video={{
            controls: true,
            playsInline: true,
            autoPlay: true,
            loop: true,
            muted: false,
            disablePictureInPicture: false,
            disableRemotePlayback: false,
            controlsList: 'nodownload nofullscreen noremoteplayback',
            crossOrigin: 'anonymous',
            preload: 'auto',
          }}
          zoom={{
            maxZoomLevel: 5,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
            doubleClickDelay: 300,
            scrollToZoom: true,
          }}
        />
      </>
    </>
  )
}

export default SDMUploadFiles