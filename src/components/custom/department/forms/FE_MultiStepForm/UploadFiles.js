import {
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormLabel,
  CFormTextarea,
  CInputGroup,
  CRow,
  CSpinner,
} from '@coreui/react'

import { useParams } from 'react-router-dom'
import moment from 'moment'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import DataTable from 'src/components/custom/table/AppDataTable'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { RowsPerPage } from 'src/constants/variables'

import { ShimmerTitle } from 'react-shimmer-effects'
import BasicProvider from 'src/constants/BasicProvider'
import { DeleteModal } from 'src/helpers/deleteModalHelper'
import { handleSelectedRowChange, setSelectedRowForModule } from 'src/helpers/paginationCookie'
import fileupload from '../../../../../assets/images/uploadIcon.png'
import { customSuccessMSG, setAlertTimeout } from 'src/helpers/alertHelper'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import CIcon from '@coreui/icons-react'
import { cilCheckAlt, cilCloudDownload, cilTrash, cilX } from '@coreui/icons'
import {
  compressImage,
  FE_COMPRESS_TARGET_MB,
  FE_COMPRESS_THRESHOLD_BYTES,
} from 'src/utils/feCompressImage'

import videoIcon from 'src/assets/images/video-icon.png'
import pdfIcon from 'src/assets/images/pdfIcon.png'
import docIcon from 'src/assets/images/docc.png'

import handleSubmitHelper from 'src/helpers/submitHelper'

import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Video from 'yet-another-react-lightbox/plugins/video'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'

import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import AdditionalFieldsForm from './additionalFieldsForm'
import ConfirmSubmit from 'src/components/custom/popup/ConfirmSubmit'

import axios from 'axios'

import { io } from 'socket.io-client'

const URL = process.env.REACT_APP_NODE_URL
const getGlobalUploadLockSet = () => {
  if (!window.__raFileUploadLocks) window.__raFileUploadLocks = new Set()
  return window.__raFileUploadLocks
}
const dedupeLikelyDuplicateUploads = (rows = []) => {
  const arr = Array.isArray(rows) ? rows : []
  const seen = new Map()
  return arr.filter((item) => {
    const name = String(item?.name || '').trim().toLowerCase()
    const size = String(item?.size || '').trim().toLowerCase()
    const mime = String(item?.mime_type || '').trim().toLowerCase()
    const key = `${name}::${size}::${mime}`
    const createdAt = new Date(item?.created_at || 0).getTime()
    const prev = seen.get(key)
    // If same file signature appears again within 10s, treat as accidental duplicate.
    if (prev && Math.abs(createdAt - prev) <= 10000) return false
    seen.set(key, createdAt)
    return true
  })
}

const validationRules = {
  required_photos_check: {
    required: true,
  },
}

const UploadFiles = ({
  initialValues,
  setInitialValues,
  currentStep,
  setCurrentStep,
  additionalFields,
  setAdditionalFields,
  additionalJson,
  setAdditionalJson,
  totalSteps,
  handlePreviousStep,
  handleNextStep,
}) => {
  var params = useParams()
  const id = params.id
  const navigate = useNavigate()

  const wrapperRef = useRef(null)
  const fileInputRef = useRef(null)
  const uploadInProgressRef = useRef(false)
  const lastUploadRef = useRef({ signature: '', timestamp: 0 })
  const recentlyUploadedRef = useRef(new Set())
  const RECENT_UPLOAD_TTL_MS = 60000

  const [lgihtboxopen, setLightBoxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedRows, setSelectedRows] = useState([])

  const [rowPerPage, setRowPerPage] = useState(null)
  const location = useLocation()
  const [userId, setuserId] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [visible, setVisible] = useState(false)
  const [searchcurrentPage, setSearchCurrentPage] = useState(null)
  const [caseId, setCaseId] = useState('')

  const [isLoadingSpinner, setIsLoadingSpinner] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})

  const [filesCounts, setFilesCoujnts] = useState({
    totalCount: 0,
    uplaoded: 0,
  })

  const query = new URLSearchParams(location.search)
  var count = query.get('count') || rowPerPage || 20
  var currentPage = parseInt(query.get('page') || 1)
  var search = query.get('search') || ''
  let [defaultPage, setDefaultPage] = useState(currentPage)
  const dispatch = useDispatch()
  const data = useSelector((state) => state.data?.files)
  const toggleCleared = useSelector((state) => state.toggleCleared)
  const totalCount = useSelector((state) => state.totalCount)
  const [popVisible, setPopVisible] = useState(false)
  const [visibleConfirmAcc, setVisibleConfirmAcc] = useState(false)
  const [isPopupVisible, setIsPopupVisible] = useState(false)

  const [isSaveBtnLoading, setIsSaveBtnLoading] = useState(false);
  const [isSubmitBtnLoading, setIsSubmitBtnLoading] = useState(false);
  const [signedUrls, setSignedUrls] = useState({})
  const [urlLoading, setUrlLoading] = useState({})
  // const [selectedRows, setSelectedRows] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxSlides, setLightboxSlides] = useState([])

  const [errors, setErrors] = useState(null)
  const [isNext, setIsNext] = useState(false)
  const [inputVisible, setInputVisible] = useState(false)
  const [errorvisit, setErrorsvisit] = useState(null)
  const [isUpdateQueryParams, setIsUpdateQueryParams] = useState(false)

  let loggedinUser = useSelector((state) => state.userData)

  const updatePageQueryParam = (paramName, page) => {
    if (isUpdateQueryParams) {
      const searchParams = new URLSearchParams(location.search)
      searchParams.set(paramName, page)
      navigate({ search: searchParams.toString() })
    }
    setIsUpdateQueryParams(true)
  }

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
    if (file.mime_type?.startsWith('application/pdf') || file.mime_type?.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
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
      const fileArray = Array.from(files || [])
      if (fileArray.length === 0) return

      // Deduplicate same file entries within one selection/drop
      const seen = new Set()
      const dedupedFiles = fileArray.filter((f) => {
        const sig = `${f.name}::${f.size}::${f.lastModified}`
        if (seen.has(sig)) return false
        seen.add(sig)
        return true
      })

      const signature = dedupedFiles
        .map((f) => `${f.name}::${f.size}::${f.lastModified}`)
        .sort()
        .join('|')
      const now = Date.now()

      // Guard against duplicate UI events (drop + input change, double fire, etc.)
      if (uploadInProgressRef.current) return
      if (
        signature &&
        lastUploadRef.current.signature === signature &&
        now - lastUploadRef.current.timestamp < 2000
      ) {
        return
      }
      uploadInProgressRef.current = true
      lastUploadRef.current = { signature, timestamp: now }

      setIsLoadingSpinner(true)
      setUploadProgress({
        totalCount: dedupedFiles.length,
        uploaded: 0,
        status: 'Preparing photos…',
        file: '',
        files: dedupedFiles.map((file, index) => ({
          id: `${file.name}::${file.size}::${file.lastModified}::${index}`,
          name: file.name,
          status: 'pending',
        })),
      })

      // Compress images that are larger than 1MB (same as shared feCompressImage helper)
      const processedFiles = await Promise.all(
        dedupedFiles.map(async (file, index) => {
          if (file.type.startsWith('image/') && file.size > FE_COMPRESS_THRESHOLD_BYTES) {
            setUploadProgress((prev) => ({
              ...prev,
              status: 'Compressing…',
              file: file.name,
              files: (prev.files || []).map((item, i) =>
                i === index ? { ...item, status: 'compressing' } : item,
              ),
            }))
            return await compressImage(file, FE_COMPRESS_TARGET_MB)
          }
          return file
        }),
      )

      await handleSubmit(processedFiles)
    } catch (error) {
      console.error('Error handling files:', error)
      setIsLoadingSpinner(false)
      setUploadProgress({})
    } finally {
      uploadInProgressRef.current = false
    }
  }

  const onDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const onFileInputChange = (e) => {
    handleFiles(e.target.files)
    // allow selecting the same file again later if needed
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

  useEffect(() => {
    const socket = io(URL)

    socket.on('connect', () => {
      socket.emit('identify', loggedinUser._id)
      console.log('Connected to WebSocket server')
    })

    socket.on('upload-progress', (data) => {
      setUploadProgress((prev) => ({
        ...prev,
        file: data.file || prev.file,
        status: data.status || prev.status,
      }))
    })

    return () => {
      socket.close()
    }
  }, [loggedinUser])

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

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target
    setInitialValues({
      ...initialValues,
      required_photos_check: {
        ...initialValues?.required_photos_check,
        [name]: checked,
      },
    })
    setErrors('')
  }

  const updateFileStatus = (index, status) => {
    setUploadProgress((prev) => {
      const files = Array.isArray(prev.files) ? [...prev.files] : []
      if (!files[index]) return prev
      files[index] = { ...files[index], status }
      const uploaded = files.filter((item) => item.status === 'done').length
      return {
        ...prev,
        files,
        uploaded,
        totalCount: files.length || prev.totalCount || 0,
      }
    })
  }

  const handleSubmit = async (fileData) => {
    try {
      if (fileData.length > 0) {
        setIsLoadingSpinner(true)
        setUploadProgress((prev) => ({
          totalCount: fileData.length,
          uploaded: 0,
          status: 'Uploading…',
          file: fileData[0]?.name || '',
          files:
            Array.isArray(prev.files) && prev.files.length === fileData.length
              ? prev.files.map((item) =>
                  item.status === 'done' || item.status === 'error'
                    ? item
                    : { ...item, status: 'pending' },
                )
              : fileData.map((file, index) => ({
                  id: `${file.name}::${file.size}::${file.lastModified}::${index}`,
                  name: file.name,
                  status: 'pending',
                })),
        }))

        let successCount = 0

        for (let i = 0; i < fileData.length; i++) {
          const file = fileData[i]
          const fileSig = `${file.name}::${file.size}::${file.lastModified}`
          const globalKey = `${id || 'no-case'}::${fileSig}`
          const globalLocks = getGlobalUploadLockSet()

          if (recentlyUploadedRef.current.has(fileSig) || globalLocks.has(globalKey)) {
            console.warn('Skipping duplicate file upload:', file.name)
            updateFileStatus(i, 'done')
            successCount += 1
            continue
          }

          recentlyUploadedRef.current.add(fileSig)
          globalLocks.add(globalKey)
          setTimeout(() => {
            recentlyUploadedRef.current.delete(fileSig)
            globalLocks.delete(globalKey)
          }, RECENT_UPLOAD_TTL_MS)

          updateFileStatus(i, 'uploading')
          setUploadProgress((prev) => ({
            ...prev,
            status: 'Uploading…',
            file: file.name,
          }))

          const formData = new FormData()
          formData.append('featured_image', file)
          formData.append('case', id)

          // Call the API for each file
          let response = await new BasicProvider(
            `cms/files/create`, // Single file per request
            dispatch,
          ).postRequest(formData)

          if (response.status === 'success') {
            updateFileStatus(i, 'done')
            successCount += 1
            fetchData(currentPage, rowPerPage, searchcurrentPage, search, count)
          } else {
            updateFileStatus(i, 'error')
          }
        }

        if (successCount > 0) {
          customSuccessMSG(
            dispatch,
            successCount === fileData.length
              ? 'All files uploaded successfully!'
              : `${successCount}/${fileData.length} photos uploaded successfully!`,
          )
        }

        // Keep final tick list visible briefly so FE can see completed count
        await new Promise((resolve) => setTimeout(resolve, 900))
      }
    } catch (error) {
      console.error('Error uploading files:', error)
    } finally {
      setIsLoadingSpinner(false)
      setUploadProgress({})
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
      const roles = [process.env.REACT_APP_FE]
      const rolesParam = roles.join(',')
      for (const [key, value] of query.entries()) {
        if (key !== 'page' && key !== 'count') {
          queryData[key] = value
        }
      }

      const response = await new BasicProvider(
        `cms/files/by/roles?page=${currentPage}&count=${count}&id=${id}&role=${rolesParam}`,
      ).getRequest()
      const dedupedFiles = dedupeLikelyDuplicateUploads(response?.data?.data || [])
      dispatch({ type: 'set', data: { files: dedupedFiles } })
      dispatch({ type: 'set', totalCount: response.data.total })
      setIsLoading(false)
      setInitialValues((prevValues) => ({
        ...prevValues,
        visit_region_fe: '',
      }))
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
      data.forEach(file => {
        if (!signedUrls[file._id] && !urlLoading[file._id]) {
          fetchSignedUrl(file._id, file.filepath);
        }
      });
    }
  }, [data]);


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
            <div
              className="data_table_column"
             
            >
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
      // width: '15%',
    },
    {
      name: 'Name',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title">
          {row.name ? row.name : <ShimmerTitle line={5} />}
        </div>
      ),
      width: '30%',
      center: true,
    },

    {
      name: 'Size',
      selector: (row) => <div className="data_table_colum">{row.size}</div>,
      // width: '25%',
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
      width: '25%',
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
                setCaseId(row._id)
                setVisible(true)
                setuserId([row._id])
              }}
            />
          </div>
        </div>
      ),
      // width: '25%',
    },
  ]

  const isAllRequiredPhotosChecked = () => {
    const { required_photos_check } = initialValues
    return required_photos_check && Object.values(required_photos_check).every((checked) => checked)
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setInitialValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }))
    setErrorsvisit('')
  }

  const handleAcceptCase = async () => {
    setPopVisible(!popVisible)
    fetchData()
    setTimeout(() => {
      setPopVisible(false)
    }, [2000])
  }

  const sendToSDM = async () => {
    // e.preventDefault()
    setPopVisible(!popVisible)

    // setVisibleConfirmAcc(false);
    initialValues.status = 'visit done'
    initialValues.additional_fields = additionalJson
    initialValues.fe_end_visit = Date.now()

    // Validate Latitude
    let errors = [] // Array to store all error messages

    if (initialValues.latitude_by_fe.trim() === '') {
      errors.push('Latitude is required!!')
    } else if (!/^[-+]?\d{1,2}\.\d+$/.test(initialValues.latitude_by_fe)) {
      errors.push('Invalid latitude format. Use a number between -90 and 90.')
    } else if (
      parseFloat(initialValues.latitude_by_fe) < -90 ||
      parseFloat(initialValues.latitude_by_fe) > 90
    ) {
      errors.push('Latitude must be between -90 and 90.')
    }

    // Validate Longitude
    if (initialValues.longitude_by_fe.trim() === '') {
      errors.push('Longitude is required!!')
    } else if (!/^[-+]?\d{1,3}\.\d+$/.test(initialValues.longitude_by_fe)) {
      errors.push('Invalid longitude format. Use a number between -180 and 180.')
    } else if (
      parseFloat(initialValues.longitude_by_fe) < -180 ||
      parseFloat(initialValues.longitude_by_fe) > 180
    ) {
      errors.push('Longitude must be between -180 and 180.')
    }

    // Dispatch errors if any
    if (errors.length > 0) {
      dispatch({ type: 'set', validations: errors })
      return // Exit if there are validation errors
    }

    if (isAllRequiredPhotosChecked()) {
      setErrors('')
    } else {
      setErrors('Please check all required fields.')
      return
    }

    try {

      setIsSubmitBtnLoading(true)

      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)
      if (response.status === 'success') {
        setAlertTimeout(dispatch)
        handleNextStep()
      }
    } catch (error) {
      console.log(error)
      dispatch({ type: 'set', validations: [error.data] })
    } finally {
      setIsSubmitBtnLoading(false)
    }
  }


  const handleClick = async (e) => {
    e.preventDefault()


    if (!initialValues.visit_region_fe) {
      setVisibleConfirmAcc(!visibleConfirmAcc)
    } else {
      setIsPopupVisible(!isPopupVisible)
    }

    if (!initialValues.visit_region_fe.trim()) {
      setErrorsvisit('Reason is required!!')

      return
    }

    setErrors('')
    if (isNext && isAllRequiredPhotosChecked()) {
      sendToSDM()
    }
  }

  const handleSave = async (e) => {
    // e.preventDefault()

    try {
      setIsSaveBtnLoading(true);
      const data = await handleSubmitHelper(initialValues, validationRules, dispatch)
      if (data === false) return

      let response = await new BasicProvider(`cases/update/${id}`, dispatch).patchRequest(data)

      setAlertTimeout(dispatch)
    } catch (error) {
      console.log(error)
      dispatch({ type: 'set', validations: [error.data] })
    } finally {
      setIsSaveBtnLoading(false);
    }
  }

  const downloadFilesZip = async () => {
    if (selectedRows.length === 0) {
      dispatch({ type: 'set', validations: ['At least one file must be selected for bulk download!'] });
      return;
    }

    setIsLoadingSpinner(true);
    const zip = new JSZip();

    try {
      // Create an array of promises to fetch signed URLs for all selected files
      const urlPromises = selectedRows.map(async (item) => {
        const response = await new BasicProvider(`cms/files/signed-url?key=${item.filepath}&download=true`, dispatch).getRequest();
        return { url: response.data.url, name: item.name };
      });

      // Wait for all promises to resolve
      const filesToDownload = await Promise.all(urlPromises);

      // Loop through the fetched URLs and add them to the zip
      for (const file of filesToDownload) {
        const response = await fetch(file.url);
        const blob = await response.blob();
        zip.file(file.name, blob);
      }

      // Generate and save the zip file
      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'bulk-download-files.zip');
        setIsLoadingSpinner(false);
        customSuccessMSG(dispatch, 'Files downloaded successfully!');
      });

    } catch (error) {
      console.error('Error creating ZIP file:', error);
      setIsLoadingSpinner(false);
      dispatch({ type: 'set', validations: ['Failed to create ZIP file. Please try again.'] });
    }
  };


  return (
    <>
      <CRow>
        {isLoadingSpinner ? (
          <div className="spinner_outerbox">
            {Array.isArray(uploadProgress.files) && uploadProgress.files.length > 0 ? (
              <div
                className="fe-upload-progress-card bg-light p-3"
                style={{
                  width: 'min(420px, 92vw)',
                  maxHeight: '80vh',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                  border: '1px solid #ddd',
                }}
              >
                <p
                  className="mb-1"
                  style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937' }}
                >
                  {uploadProgress.status || 'Uploading photos…'}
                </p>
                <p style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
                  <strong>
                    {uploadProgress.uploaded || 0}/{uploadProgress.totalCount || 0}
                  </strong>{' '}
                  photos uploaded
                </p>

                <div
                  className="progress mb-3"
                  style={{
                    height: '12px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{
                      width: `${
                        uploadProgress.totalCount
                          ? ((uploadProgress.uploaded || 0) / uploadProgress.totalCount) * 100
                          : 0
                      }%`,
                      backgroundColor: '#28a745',
                    }}
                    aria-valuenow={uploadProgress.uploaded || 0}
                    aria-valuemin="0"
                    aria-valuemax={uploadProgress.totalCount || 0}
                  />
                </div>

                {uploadProgress.file ? (
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>
                    Current: <strong>{uploadProgress.file}</strong>
                  </p>
                ) : null}

                <div
                  style={{
                    maxHeight: '42vh',
                    overflowY: 'auto',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '8px',
                  }}
                >
                  {uploadProgress.files.map((item) => {
                    const isDone = item.status === 'done'
                    const isUploading =
                      item.status === 'uploading' || item.status === 'compressing'
                    const isError = item.status === 'error'

                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 4px',
                          borderBottom: '1px solid #f3f4f6',
                        }}
                      >
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            backgroundColor: isDone
                              ? '#28a745'
                              : isError
                                ? '#dc3545'
                                : isUploading
                                  ? '#0d6efd'
                                  : '#d1d5db',
                            color: '#fff',
                          }}
                        >
                          {isDone ? (
                            <CIcon icon={cilCheckAlt} size="sm" />
                          ) : isError ? (
                            <CIcon icon={cilX} size="sm" />
                          ) : isUploading ? (
                            <CSpinner size="sm" style={{ width: '12px', height: '12px' }} />
                          ) : (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
                          )}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            color: isDone ? '#166534' : isError ? '#991b1b' : '#374151',
                            wordBreak: 'break-word',
                            flex: 1,
                          }}
                          title={item.name}
                        >
                          {item.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <CSpinner size="lg" style={{ width: '2rem', height: '2rem' }} />
              </div>
            )}
          </div>
        ) : (
          <>
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

            <CRow>
              <div className="mb-2">
                <CButton color="success" size="sm" variant="outline" onClick={downloadFilesZip}>
                  Bulk Download
                </CButton>
              </div>
            </CRow>
          </>
        )}

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
        ) : (
          <div className="text-center">
            <CSpinner size="sm" style={{ width: '3rem', height: '3rem' }} />
            <p>Loading..</p>
          </div>
        )}
        <hr />

        <CForm className="g-3 needs-validation mb-3 mb-4 px-2 coo-form " onSubmit={sendToSDM}>
          <div className="">
            <CFormLabel className="ms-1">Required Photo Check :- </CFormLabel>
            <CInputGroup className="has-validation mt-1 required-photo d-lg-flex d-block">
              <CFormCheck
                className="d-flex align-items-center ps-2"
                inline
                type="checkbox"
                id="selfieCheckbox"
                name="selfie"
                label="Selfie With Property"
                checked={initialValues?.required_photos_check?.selfie}
                onChange={handleCheckboxChange}
              />
              <CFormCheck
                className="d-flex align-items-center ps-2"
                inline
                type="checkbox"
                id="appliciantselfieCheckbox"
                name="applicant_selfie"
                label="Selfie With Applicant"
                checked={initialValues?.required_photos_check?.applicant_selfie}
                onChange={handleCheckboxChange}
              />
              <CFormCheck
                className="d-flex align-items-center ps-2"
                inline
                type="checkbox"
                id="propertyselfieCheckbox"
                name="property_selfie"
                label="2 Side Road Photo With Property"
                checked={initialValues?.required_photos_check?.property_selfie}
                onChange={handleCheckboxChange}
              />
              <CFormCheck
                className="d-flex align-items-center ps-2"
                inline
                type="checkbox"
                id="eBillCheckbox"
                name="e_bill"
                label="E-BILL"
                checked={initialValues?.required_photos_check?.e_bill}
                onChange={handleCheckboxChange}
              />
              <CFormCheck
                className="d-flex align-items-center ps-2 "
                inline
                type="checkbox"
                id="mapCheckbox"
                name="map"
                label="Drow the property map"
                checked={initialValues?.required_photos_check?.map}
                onChange={handleCheckboxChange}
              />
            </CInputGroup>
          </div>

          <div className="mt-4">{errors && <small className="text-danger">{errors}</small>}</div>

          {inputVisible && (
            <CCol md={3}>
              <div className="py-2">
                <CFormLabel>Enter Old Visit Details</CFormLabel>
                <CFormTextarea
                  type="text"
                  name="visit_region_fe"
                  value={initialValues.visit_region_fe ?? ''}
                  onChange={handleInputChange}
                  placeholder="Enter Old Visit Details.."
                  className="form-control"
                />
                <div className="">
                  {errorvisit && <small className="text-danger">{errorvisit}</small>}
                </div>
              </div>
            </CCol>
          )}

          <AdditionalFieldsForm
            additionalFields={additionalFields}
            setAdditionalFields={setAdditionalFields}
            additionalJson={additionalJson}
            setAdditionalJson={setAdditionalJson}
          />
        </CForm>

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
          isFeFiles={true}
          caseId={id}
        />

        <div className="text-center mb-4">
          {currentStep > 1 && currentStep != totalSteps && (
            <CButton
              className="btn btn-success me-2 mt-2 mFt-2 letter-limit next w-lg-17 w-sm-auto submit_btn"
              type="button"
              onClick={handlePreviousStep}
            >
              Previous
            </CButton>
          )}

          {currentStep === totalSteps - 1 && id != undefined && (
            <CButton
              className="btn btn-warning text-white me-2 mt-2 mFt-2 next w-lg-17 w-sm-auto"
              type="submit"
              disabled={isSaveBtnLoading}
              onClick={handleSave}
            >
              {/* Save */}
              {isSaveBtnLoading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  <span>Save...</span>
                </>
              ) : (
                'Save'
              )}
            </CButton>
          )}

          {currentStep === totalSteps - 1 && id != undefined && (
            <CButton
              className="btn btn-success text-white me-2 letter-limit  mt-2 mFt-2 next w-lg-17 w-sm-auto"
              type="submit"
              disabled={isSubmitBtnLoading}
              onClick={handleClick}
            >
              {/* Submit */}
              {isSubmitBtnLoading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  <span>Submit...</span>
                </>
              ) : (
                'Submit'
              )}
            </CButton>
          )}

          {currentStep < totalSteps - 1 && (
            <CButton
              className="btn-warning btn me-2 mx-3 w-lg-17 w-sm-auto"
              onClick={handleNextStep}
            >
              Next
            </CButton>
          )}
        </div>
      </CRow>

      <ConfirmSubmit
        visible={visibleConfirmAcc}
        setInputVisible={setInputVisible}
        close={() => setVisibleConfirmAcc(false)}
        caseId={caseId}
        handleAcceptCase={handleAcceptCase}
        handlesubmit={sendToSDM}
        handleNextStep={handleNextStep}
        isAllRequired={isAllRequiredPhotosChecked}
        isPopupVisible={isPopupVisible}
        setIsPopupVisible={setIsPopupVisible}
        setIsNext={setIsNext}
      />

      <>
       <Lightbox
          open={lgihtboxopen}
          plugins={[Video, Zoom]}
          close={() => setLightBoxOpen(false)}
          slides={lightboxSlides}
          index={lightboxIndex}
          on={{
            view: ({ index }) => {
              const nextIndex = (index + 1) % lightboxSlides.length;
              const nextFile = data.find(
                  (f) =>
                      (f.mime_type?.startsWith('image/') || f.mime_type?.startsWith('video/')) &&
                      f.filepath === lightboxSlides[nextIndex].src.split('/').pop().split('?')[0],
              );
              if (nextFile) {
                fetchSignedUrl(nextFile._id, nextFile.filepath);
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

export default UploadFiles

