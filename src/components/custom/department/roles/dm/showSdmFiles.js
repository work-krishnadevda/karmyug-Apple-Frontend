import React, { useState, useEffect } from 'react'
import { CCard, CCardHeader, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import {
  cilChevronCircleDownAlt,
  cilChevronCircleUpAlt,
  cilCloudDownload,
  cilPencil,
} from '@coreui/icons'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import moment from 'moment'
import { ShimmerTable, ShimmerTitle } from 'react-shimmer-effects'
import BasicProvider from 'src/constants/BasicProvider'
import { useParams } from 'react-router-dom'

import videoIcon from 'src/assets/images/video-icon.png'
import pdfIcon from 'src/assets/images/pdfIcon.png'
import docIcon from 'src/assets/images/docc.png'
import Video from 'yet-another-react-lightbox/plugins/video'
// import FsLightbox from 'fslightbox-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

const URL = process.env.REACT_APP_NODE_URL

const ShowSdmFiles = () => {
  const query = new URLSearchParams(location.search)
  const [show, setShow] = useState(false)
  const [rowPerPage, setRowPerPage] = useState(null)
  let [defaultPage, setDefaultPage] = useState(currentPage)
  var currentPage = parseInt(query.get('page') || 1)
  var count = query.get('count') || rowPerPage || 20
  const data = useSelector((state) => state.data?.files)
  const [selectedFile, setSelectedFile] = useState(null)
  const [lgihtboxopen, setLightBoxOpen] = useState(false)
  const [signedUrls, setSignedUrls] = useState({})
  const [urlLoading, setUrlLoading] = useState({})
  const [selectedRows, setSelectedRows] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [lightboxSlides, setLightboxSlides] = useState([])

  const dispatch = useDispatch()
  const { id } = useParams()

  useEffect(() => {
    // fetchData()
  }, [])

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

  const fetchData = async () => {
    try {
      const response = await new BasicProvider(
        `cms/files/by/roles/${process.env.REACT_APP_SDM}?paeg=${1}&count=${10}&id=${id}`,
      ).getRequest()

      dispatch({ type: 'set', data: { files: response.data.data } })
      dispatch({ type: 'set', totalCount: response.data.total })
    } catch (error) {
      console.error('Error' + error)
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
      width: '20%',
    },
    {
      name: 'Name',
      selector: (row) => (
        <div className="pointer_cursor data_Table_title">
          {row.name ? row.name : <ShimmerTitle line={5} />}
        </div>
      ),
      width: '40%',
      // center: true,
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
            <CCardHeader className="d-flex justify-content-between align-items-center c-card-headerSdm  rounded">
              Files Uploded By SDM
              <div className="action-btn">
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
  )
}

export default ShowSdmFiles
