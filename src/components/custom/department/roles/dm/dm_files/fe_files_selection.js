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
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RowsPerPage } from 'src/constants/variables'

import { ShimmerTable, ShimmerTitle } from 'react-shimmer-effects'
import BasicProvider from 'src/constants/BasicProvider'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import axios from 'axios'
import fileupload from '../../../../../../../src/assets/images/uploadIcon.png'
//   assets/images/uploadIcon.png
import { customSuccessMSG, setAlertTimeout } from 'src/helpers/alertHelper'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilTrash } from '@coreui/icons'

import videoIcon from 'src/assets/images/video-icon.png'
import pdfIcon from 'src/assets/images/pdfIcon.png'
import docIcon from 'src/assets/images/docc.png'

import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Video from 'yet-another-react-lightbox/plugins/video'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import handleSubmitHelper from 'src/helpers/submitHelper'

import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const URL = process.env.REACT_APP_NODE_URL
const validationRules = {}

let DM = process.env.REACT_APP_DM
let FE = process.env.REACT_APP_FE

const FE_Files_Selection = ({
  initialValues,
  setInitialValues,
  showCaseData,
  activeTab,
  fetchSHowCaseData,
}) => {
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

  const [rowPerPage, setRowPerPage] = useState(null)
  const location = useLocation()

  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)

  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [signedUrls, setSignedUrls] = useState({})
  const [urlLoading, setUrlLoading] = useState({})

  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxSlides, setLightboxSlides] = useState([])

  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage || 20
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.otherFiles)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)
  let loggedinUserRole = useSelector((state) => state?.userRole)

  const [feImagesData, srtFeImagesData] = useState([])

  const [selectedRows, setSelectedRows] = useState([])

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
    setInitialValues((prev) => ({ ...prev, fe_images_data: feImagesData }))
  }, [feImagesData])

  useEffect(() => {
    if (showCaseData?.fe_images_data?.length > 0) {
      srtFeImagesData(showCaseData?.fe_images_data)
    } else {
      srtFeImagesData([])
    }
  }, [showCaseData])

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
    // const totalFiles = dmFiles?.length + files?.length
    // if (loggedinUserRole.name === DM && totalFiles > 2) {
    //   dispatch({ type: 'set', validations: ['You can only upload 2 files'] })
    //   return
    // }
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
    const files = e.target.files
    // const totalFiles = dmFiles?.length + files?.length
    // if (loggedinUserRole.name === DM && totalFiles > 2) {
    //   dispatch({ type: 'set', validations: ['You can only upload 2 files'] })
    //   return
    // }

    handleFiles(files)
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
        formData.append('use_for', 'fe-image-selection')
      }

      if (formData) {
        let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(
          formData,
        )
        if (response) {
          customSuccessMSG(dispatch, 'File Uploaded Successfully !!')
          setIsLoadingSpinner(false)
          fetchData(currentPage, rowPerPage, searchcurrentPage, search, count)
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      setIsLoadingSpinner(false)
    } finally {
      setIsLoadingSpinner(false)
    }
  }

  useEffect(() => {
    if (rowPerPage) {
      fetchData(currentPage, rowPerPage, searchcurrentPage, search, count)
    }
  }, [currentPage, rowPerPage, searchcurrentPage, search, count, activeTab])

  const fetchData = async (currentPage, rowPerPage, searchcurrentPage, search, count) => {
    try {
      const roles = [FE, DM]
      const rolesParam = roles.join(',')
      // console.log('rolesParam', rolesParam);

      var queryData = {}

      for (const [key, value] of query.entries()) {
        if (key !== 'page' && key !== 'count') {
          queryData[key] = value
        }
      }

      const response = await new BasicProvider(
        `cms/files?page=${currentPage}&count=${count}&id=${id}&use_for=not`,
        dispatch,
      ).getRequest()

      // console.log('RESSS=======^^^^^^^^', response);

      dispatch({ type: 'set', data: { otherFiles: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setTimeout(() => {
        setIsLoading(false)
      }, [])
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

  const handleFeImagesChange = (e, row) => {
    if (e.target.name == 'check') {
      const selected = e.target.checked
      srtFeImagesData((prevState) => {
        const existingIndex = prevState.findIndex((item) => item.image_url === row.filepath)
        if (selected) {
          if (existingIndex !== -1) {
            const updatedState = [...prevState]
            updatedState[existingIndex].selected = selected
            return updatedState
          } else {
            return [...prevState, { image_url: row.filepath, position: '', selected }]
          }
        } else {
          if (existingIndex !== -1) {
            const updatedState = [...prevState]
            updatedState.splice(existingIndex, 1)
            return updatedState
          }
          return prevState
        }
      })
    } else if (e.target.name == 'position') {
      const position = Number(e.target.value)

      srtFeImagesData((prevState = []) => {
        const existingIndex = prevState?.findIndex((item) => item.image_url === row.filepath)
        if (existingIndex !== -1) {
          const updatedState = [...prevState]
          updatedState[existingIndex].position = position
          return updatedState
        } else {
          return [...prevState, { image_url: row.filepath, position, selected: false }]
        }
      })
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
            <div
              className="data_table_column"
              onClick={() => {
                // setCurrentIndex(index)
                openLightbox(row)
              }}
            >
              <img
                src={videoIcon}
                alt={row.name}
                style={{ width: '45px', height: '45px', padding: '7px' }}
              />
            </div>
          )
        } else if (isPDF) {
          return (
            <div
              className="data_table_column"
              onClick={() => {
                // setCurrentIndex(index)
                openLightbox(row)
              }}
            >
              <img
                src={pdfIcon}
                alt={row.name}
                style={{ width: '45px', height: '45px', padding: '7px' }}
              />
            </div>
          )
        } else if (isDOc) {
          return (
            <div
              className="data_table_column"
              onClick={() => {
                // setCurrentIndex(index)
                openLightbox(row)
              }}
            >
              <img
                src={docIcon}
                alt={row.name}
                style={{ width: '45px', height: '45px', padding: '7px' }}
              />
            </div>
          )
        }
      },
      // width: '15%',
    },
    {
      name: 'Name',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title">
          {row.name ? row.name : <ShimmerTitle line={5} />}
        </div>
      ),
      width: '10%',
      // center: true,
    },
    {
      name: 'Size',
      selector: (row) => <div className="data_table_colum">{row.size}</div>,
      width: '10%',
    },
    {
      name: 'Uploaded By',
      selector: (row) => (
        <div className="">
          <div className="data_table_colum pointer_cursor data_Table_title">
            {row && row.admin && row.admin.name ? row.admin.name : '-'}
          </div>
          <small style={{ color: '#61a528' }}>
            {row &&
            row.admin &&
            Array.isArray(row.admin.role) &&
            row.admin.role.length > 0 &&
            row.admin.role[0].display_name
              ? row.admin.role[0].display_name
              : '-'}
          </small>
        </div>
      ),
      width: '20%',
      center: 'true',
    },
    {
      name: 'Image Selection',
      selector: (row) => {
        const isImage = row.mime_type?.startsWith('image/')
        const isFe =
          Array.isArray(row.admin.role) &&
          row.admin.role.length > 0 &&
          row.admin.role[0].name === process.env.REACT_APP_FE

        const isDM =
          Array.isArray(row.admin.role) &&
          row.admin.role.length > 0 &&
          row.admin.role[0].name === process.env.REACT_APP_DM

        if (isImage) {
          return (
            <CFormCheck
              className="fe_image_chack data_table_colum"
              type="checkbox"
              label="Select"
              name="check"
              checked={
                feImagesData?.find((item) => item?.image_url === row?.filepath)?.selected || false
              }
              onChange={(e) => handleFeImagesChange(e, row)}
            />
          )
        } else if (isImage) {
          return (
            <CFormCheck
              className="fe_image_chack data_table_colum"
              type="checkbox"
              label="Select"
              name="check"
              checked={
                dmImagesData?.find((item) => item?.image_url === row?.filepath)?.selected || false
              }
              onChange={(e) => handleDmImagesChange(e, row)}
            />
          )
        } else {
          return '-'
        }
      },
      center: true,
    },

    {
      name: 'Position',
      selector: (row) => {
        const isImage = row.mime_type?.startsWith('image/')
        const isFe =
          Array.isArray(row.admin.role) &&
          row.admin.role.length > 0 &&
          row.admin.role[0].name === process.env.REACT_APP_FE

        let isFeVisible =
          feImagesData?.find((item) => item.image_url === row.filepath)?.selected || false

        if (isImage && isFeVisible) {
          return (
            <CFormSelect
              size="sm"
              name="position"
              aria-label="Default select example"
              onChange={(e) => handleFeImagesChange(e, row)}
              value={feImagesData.find((item) => item.image_url === row.filepath)?.position}
            >
              <option>Select Position</option>
              {[...Array(12)].map((_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </CFormSelect>
          )
        } else {
          return '-'
        }
      },
      center: true,
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
      width: '15%',
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
      // width: '10%',
    },
  ]

  const placeImages = async () => {
    initialValues.fe_images_data = feImagesData

    if (feImagesData.length > 12) {
      dispatch({ type: 'set', validations: ['You only select 12 images '] })
      return
    }

    try {
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)

      if (response) {
        customSuccessMSG(dispatch, 'Images Placed Successfully')
      }
    } catch (error) {
      console.log(error)
      dispatch({ type: 'set', validations: [error.data] })
    }
  }

  return (
    <>
      {isLoadingSpinner ? (
        <div className=" spinner_outerbox">
          <div className="text-center">
            <CSpinner size="lg" style={{ width: '3rem', height: '3rem' }} />
          </div>
        </div>
      ) : (
        <>
          <CCardBody>
            <CRow>
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

              <div className="datatable">
                <CRow>
                  <div className="mb-2">
                    <CButton color="success" size="sm" variant="outline" onClick={downloadFilesZip}>
                      Bulk Download
                    </CButton>
                  </div>
                </CRow>

                {isLoading ? (
                  <div className="text-center">
                    <CSpinner size="sm" style={{ width: '3rem', height: '3rem' }} />
                    <p>Loading..</p>
                  </div>
                ) : (
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
                )}
              </div>

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
                selectedCaseId={id}
                isOther={true}
                caseId={id}
              />
            </CRow>
          </CCardBody>

          <CCard className="mt-2">
            <CCardBody className="text-center">
              <CButton
                className="btn btn-primary me-2  submit_btn"
                onClick={async () => {
                  await placeImages()
                  // fetchSHowCaseData()
                  await fetchData(currentPage, rowPerPage, searchcurrentPage, search, count)
                }}
              >
                Place Images
              </CButton>
            </CCardBody>
          </CCard>
        </>
      )}

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

export default FE_Files_Selection
