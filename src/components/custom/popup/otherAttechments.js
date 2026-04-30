import React from 'react'
import {
  CButton,
  CListGroup,
  CListGroupItem,
  CModal,
  CModalBody,
  CModalFooter,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'

import moment from 'moment'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

const URL = process.env.REACT_APP_NODE_URL

const OthersAttechments = (props) => {
  const { visible, close, files } = props
  const dispatch = useDispatch()
  const buildCandidateKeys = (rawFilepath) => {
    if (!rawFilepath || typeof rawFilepath !== 'string') return []
    let normalizedPath = rawFilepath.trim()
    if (!normalizedPath) return []

    // If an absolute URL is stored, extract only the object key.
    if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
      try {
        const parsed = new URL(normalizedPath)
        normalizedPath = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''))
      } catch (error) {
        normalizedPath = normalizedPath
      }
    }

    normalizedPath = decodeURIComponent(normalizedPath).replace(/^\/+/, '')
    const keys = [normalizedPath]

    // Legacy mismatch images/ <-> uploads/
    if (normalizedPath.startsWith('images/')) keys.push(normalizedPath.replace(/^images\//, 'uploads/'))
    if (normalizedPath.startsWith('uploads/')) keys.push(normalizedPath.replace(/^uploads\//, 'images/'))

    return [...new Set(keys)]
  }

  const triggerBrowserDownload = (blob, fileName) => {
    const objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = fileName || 'document'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(objectUrl)
  }

  const fetchAndDownload = async (signedUrl, fileName) => {
    const downloadResponse = await fetch(signedUrl)
    if (!downloadResponse.ok) {
      throw new Error(`Download failed with status ${downloadResponse.status}`)
    }

    const contentType = downloadResponse.headers.get('content-type') || ''
    if (contentType.includes('xml') || contentType.includes('text')) {
      const responseText = await downloadResponse.text()
      if (responseText.includes('<Code>NoSuchKey</Code>')) {
        throw new Error('NoSuchKey')
      }
      throw new Error('Invalid file response')
    }

    const fileBlob = await downloadResponse.blob()
    triggerBrowserDownload(fileBlob, fileName)
  }

  const handleDownload = async (fileKey, fileName) => {
    try {
      if (!fileKey) {
        toast.error('Attachment path is missing')
        return
      }

      const candidateKeys = buildCandidateKeys(fileKey)
      let downloaded = false

      for (const key of candidateKeys) {
        try {
          const response = await new BasicProvider(
            `cms/files/signed-url?key=${encodeURIComponent(key)}&download=true`,
            dispatch,
          ).getRequest()
          const url = response?.data?.url || response?.url
          if (!url) continue

          await fetchAndDownload(url, fileName || key.split('/').pop())
          downloaded = true
          break
        } catch (innerError) {
          // Try next key
        }
      }

      if (!downloaded) {
        toast.error('File not found in storage. Please re-upload this attachment.')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Unable to download attachment')
    }
  }

  return (
    <>
      <CModal alignment="center" visible={visible} className="delete_item_box">
        <CModalBody>
          <CListGroup>
            {files && files?.length > 0 ? (
              files.map((file) => (
                <CListGroupItem
                  key={file?._id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="file-info" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="file-name" title={file?.name}>
                      {file?.name?.length > 30 ? file?.name.substring(0, 30) + '...' : file?.name}
                    </div>
                    <small className="text-muted" style={{ display: 'block' }}>
                      Uploaded By : <strong>{file?.admin?.name}</strong>
                    </small>
                    <small className="text-muted" style={{ display: 'block' }}>
                      At:{' '}
                      <strong>{file ? moment(file.created_at).format('LLL') : 'No date'}</strong>
                    </small>
                  </div>

                  <div className="download-btn edit-btn">
                    <CIcon
                      className="pointer_cursor"
                      icon={cilCloudDownload}
                      onClick={() => handleDownload(`${file.filepath}`, file?.name)}
                    />
                  </div>
                </CListGroupItem>
              ))
            ) : (
              <CListGroupItem>No files found</CListGroupItem>
            )}
          </CListGroup>
        </CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={close}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default OthersAttechments
