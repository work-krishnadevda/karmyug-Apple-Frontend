import React, { useState } from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CListGroup,
  CListGroupItem,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload } from '@coreui/icons'
import moment from 'moment'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

const ATTACHMENT_KEYS = [
  { key: 'dm_attechment', label: 'DM (Draft Maker)' },
  { key: 'rc_attechment', label: 'RC (Report Checker)' },
  { key: 'lcto_attechment', label: 'LCTO (Line Chief Technical Officer)' },
  { key: 'cto_attechment', label: 'CTO (Chief Technical Officer)' },
]

/**
 * Builds a flat list of attachments from case data for display.
 * Each attachment can be populated (object with filepath, name, admin) or just an id.
 */
const getAttachmentsList = (showCaseData) => {
  if (!showCaseData) return []
  const list = []
  ATTACHMENT_KEYS.forEach(({ key, label }, orderIndex) => {
    const att = showCaseData[key]
    if (!att) return
    const isObj = typeof att === 'object' && att !== null
    const filepath = isObj ? att.filepath : null
    if (!filepath) return
    const name = isObj ? att.name : null
    const admin = isObj ? att.admin : null
    const created_at = isObj ? att.created_at : null
    list.push({
      key,
      roleLabel: label,
      filepath,
      fileName: name || filepath.split('/').pop() || 'document',
      uploadedByName: admin?.name || null,
      uploadedByRole: Array.isArray(admin?.role) ? admin.role[0]?.name : admin?.role?.name || null,
      createdAt: created_at || null,
      orderIndex,
    })
  })

  // Latest attachment on top: sort by createdAt desc, then by role order
  return list.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    if (aTime !== bTime) return bTime - aTime
    return a.orderIndex - b.orderIndex
  })
}

const ProgressAttachmentsModal = ({ visible, onClose, showCaseData }) => {
  const dispatch = useDispatch()
  const [downloadingKey, setDownloadingKey] = useState(null)

  const attachmentsList = getAttachmentsList(showCaseData)

  const buildCandidateKeys = (rawFilepath) => {
    if (!rawFilepath || typeof rawFilepath !== 'string') return []

    let normalizedPath = rawFilepath.trim()
    if (!normalizedPath) return []

    // If an absolute URL is stored, extract only the S3 object key.
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

    // Legacy data can have folder mismatch between images/ and uploads/.
    if (normalizedPath.startsWith('images/')) {
      keys.push(normalizedPath.replace(/^images\//, 'uploads/'))
    }
    if (normalizedPath.startsWith('uploads/')) {
      keys.push(normalizedPath.replace(/^uploads\//, 'images/'))
    }

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

  const handleDownload = async (filepath, fileName, itemKey) => {
    if (!filepath) {
      toast.error('Attachment path is missing')
      return
    }

    setDownloadingKey(itemKey)
    try {
      const candidateKeys = buildCandidateKeys(filepath)
      let downloaded = false

      for (const key of candidateKeys) {
        try {
          const response = await new BasicProvider(
            `cms/files/signed-url?key=${encodeURIComponent(key)}&download=true`,
            dispatch,
          ).getRequest()
          const url = response?.data?.url || response?.url
          if (!url) continue

          await fetchAndDownload(url, fileName || key.split('/').pop() || 'document')
          downloaded = true
          break
        } catch (innerError) {
          // Try next candidate key before showing final error.
        }
      }

      if (!downloaded) {
        toast.error('File not found in storage. Please re-upload this attachment.')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Unable to download attachment')
    } finally {
      setDownloadingKey(null)
    }
  }

  return (
    <CModal alignment="center" visible={visible} onClose={onClose} size="lg" scrollable>
      <CModalHeader>
        <CModalTitle>Case Progress – Documents & Attachments</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {attachmentsList.length === 0 ? (
          <p className="text-muted mb-0">No documents uploaded yet for this case.</p>
        ) : (
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            <CListGroup className="border-0">
            {attachmentsList.map((item, index) => {
              const total = attachmentsList.length
              const stepNumber = total - index // oldest = 1, latest = total
              const isFirstStep = stepNumber === 1

              return (
              <CListGroupItem
                key={`${item.key}-${index}`}
                className="border-0 px-0"
              >
                <div className="d-flex">
                  {/* Timeline column */}
                  <div
                    className="d-flex flex-column align-items-center me-3"
                    style={{ minWidth: '32px' }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background:
                          isFirstStep
                            ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 600,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    >
                      {stepNumber}
                    </div>
                    {index !== attachmentsList.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          width: 2,
                          background:
                            'linear-gradient(to bottom, rgba(102,126,234,0.4), rgba(0,242,254,0.2))',
                          marginTop: 4,
                        }}
                      />
                    )}
                  </div>

                  {/* Content + actions */}
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 flex-grow-1 pb-2 border-bottom">
                    <div className="file-info" style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-flex align-items-center mb-1">
                        <span className="fw-semibold text-primary me-2">
                          {item.roleLabel}
                        </span>
                        <small className="text-muted">
                          {isFirstStep ? 'Started here' : `Step ${stepNumber}`}
                        </small>
                      </div>
                      <div className="small text-dark" title={item.fileName}>
                        {item.fileName?.length > 70
                          ? item.fileName.substring(0, 70) + '...'
                          : item.fileName}
                      </div>
                      {(item.uploadedByName || item.uploadedByRole) && (
                        <small className="text-muted d-block mt-1">
                          Uploaded by:{' '}
                          <strong>{item.uploadedByName || item.uploadedByRole || '—'}</strong>
                          {item.uploadedByRole && item.uploadedByName && (
                            <span> ({item.uploadedByRole})</span>
                          )}
                        </small>
                      )}
                      {item.createdAt && (
                        <small className="text-muted d-block">
                          At:{' '}
                          <strong>
                            {moment(item.createdAt).format('DD MMM YYYY, hh:mm A')}
                          </strong>
                        </small>
                      )}
                    </div>
                    <div className="download-btn">
                      <CButton
                        color="primary"
                        size="sm"
                        disabled={downloadingKey === item.key}
                        onClick={() => handleDownload(item.filepath, item.fileName, item.key)}
                      >
                        {downloadingKey === item.key ? (
                          <CSpinner size="sm" className="me-1" />
                        ) : (
                          <CIcon icon={cilCloudDownload} className="me-1" />
                        )}
                        Download
                      </CButton>
                    </div>
                  </div>
                </div>
              </CListGroupItem>
            )})}
            </CListGroup>
          </div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ProgressAttachmentsModal
