import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormInput,
  CFormLabel,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { cilPencil, cilSave, cilX, cilFile, cilCloudDownload, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useEmployeeData } from 'src/components/EmployeeProfile/hooks/useEmployeeData'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch } from 'react-redux'

const DocumentUpload = ({
  formData,
  editMode,
  canEditAttachments,
  handleEditToggle,
  handleSave,
  handleCancel,
  handleAttachmentUpload,
  handleDocumentUpload,
  editAttempts,
  isAC,
  isHR,
}) => {
  const documentTypes = [
    { key: 'resume', label: 'Upload Documents', required: true },
  ]
  const getDocumentType = (docName, mime) => {
    docName = docName.toLowerCase()

    if (docName.includes('resume') || docName.includes('cv')) return 'Resume/CV'
    if (docName.includes('aadhar') || docName.includes('aadhaar') || docName.includes('pan'))
      return 'ID Proof (Aadhar/PAN)'
    if (docName.includes('certificate')) return 'Educational Certificates'
    if (docName.includes('experience')) return 'Experience Letter'
    if (docName.includes('salary') || docName.includes('slip')) return 'Salary Slip'

    return 'Other Document'
  }

  const dispatch = useDispatch()
  const { signedUrls, urlLoading } = useEmployeeData()

  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [imageUrls, setImageUrls] = useState({})

  // Function to check if file is an image
  const isImageFile = (mimeType) => {
    return mimeType?.startsWith('image/')
  }

  // Function to get image URL for preview
  const getImageUrl = async (doc) => {
    if (!isImageFile(doc.mime_type)) return null
    
    const docId = doc._id
    if (imageUrls[docId]) return imageUrls[docId]

    const fileKey = doc.filepath || doc.key
    let imageUrl = null

    // Try to fetch signed URL
    if (fileKey) {
      try {
        const res = await new BasicProvider(
          `cms/files/signed-url?key=${encodeURIComponent(fileKey)}`,
          dispatch
        ).getRequest()
        imageUrl = res?.data?.url
      } catch (err) {
        console.error('Error fetching signed URL for image:', err)
      }
    }

    // Fallback: try using document ID
    if (!imageUrl && doc._id) {
      try {
        const res = await new BasicProvider(
          `cms/files/show-file-with-signed-url/${doc._id}`,
          dispatch
        ).getRequest()
        imageUrl = res?.data?.url || res?.data
      } catch (err) {
        console.error('Error fetching fallback URL for image:', err)
      }
    }

    if (imageUrl) {
      setImageUrls(prev => ({ ...prev, [docId]: imageUrl }))
      return imageUrl
    }

    return null
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDoc) return
    try {
      setDeleteModal(false)

      const res = await new BasicProvider(
        `profiles/${formData.profile._id}/remove-documents/${selectedDoc._id}?deleteRecord=true`,
        dispatch,
      ).deleteRealRequest()

      if (res?.status === 'success') {
        const updatedDocs = formData.additional.documents.filter((d) => d._id !== selectedDoc._id)
        formData.additional.documents = updatedDocs
        setSelectedDoc(null)
        setForceUpdate((p) => p + 1)
      } else {
        alert('Failed to delete document. Try again.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const documents = Array.isArray(formData?.additional?.documents)
    ? formData.additional.documents
    : []
  console.log('Documents', documents)

  // Load image URLs for all image documents
  useEffect(() => {
    const loadImageUrls = async () => {
      const imageDocs = documents.filter(doc => isImageFile(doc.mime_type))
      for (const doc of imageDocs) {
        if (!imageUrls[doc._id]) {
          const fileKey = doc.filepath || doc.key
          let imageUrl = null

          // Try to fetch signed URL
          if (fileKey) {
            try {
              const res = await new BasicProvider(
                `cms/files/signed-url?key=${encodeURIComponent(fileKey)}`,
                dispatch
              ).getRequest()
              imageUrl = res?.data?.url
            } catch (err) {
              console.error('Error fetching signed URL for image:', err)
            }
          }

          // Fallback: try using document ID
          if (!imageUrl && doc._id) {
            try {
              const res = await new BasicProvider(
                `cms/files/show-file-with-signed-url/${doc._id}`,
                dispatch
              ).getRequest()
              imageUrl = res?.data?.url || res?.data
            } catch (err) {
              console.error('Error fetching fallback URL for image:', err)
            }
          }

          if (imageUrl) {
            setImageUrls(prev => ({ ...prev, [doc._id]: imageUrl }))
          }
        }
      }
    }
    if (documents.length > 0) {
      loadImageUrls()
    }
  }, [documents, dispatch])
  return (
    <CRow className="mb-4">
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CIcon icon={cilFile} className="me-2" />
              <h5 className="mb-0">Document Attachments</h5>
            </div>

            {canEditAttachments(editAttempts) && (
              <CButton
                color="primary"
                variant="outline"
                size="sm"
                onClick={() => handleEditToggle('attachments')}
              >
                <CIcon icon={cilPencil} className="me-1" />
                {editMode.attachments ? 'Cancel' : 'Edit'}
              </CButton>
            )}
          </CCardHeader>

          <CCardBody>
            {documents?.length > 0 ? (
              <div className="mb-4">
                <h6 className="text-success mb-3">
                  <CIcon icon={cilFile} className="me-2" />
                  Uploaded Documents ({documents.length})
                </h6>
                <div className="row">
                  {documents.map((doc, i) => {
                    const docName = doc.original_name || doc.name || 'Document'
                    const truncatedName =
                      docName.length > 22 ? docName.slice(0, 22) + '...' : docName
                    const fileKey = doc.filepath || doc.key
                    const signedKey = doc._id
                    const fileUrl = signedUrls?.[signedKey]
                    
                    // Debug logging
                    if (i === 0) {
                      console.log('Document object:', doc)
                      console.log('Document filepath:', doc.filepath)
                      console.log('Document key:', doc.key)
                      console.log('Document _id:', doc._id)
                      console.log('FileKey used:', fileKey)
                      console.log('Signed URL from state:', fileUrl)
                    }
                    
                    // Get image URL for preview if it's an image
                    const imageUrl = isImageFile(doc.mime_type) ? imageUrls[doc._id] : null
                    if (isImageFile(doc.mime_type) && !imageUrl) {
                      getImageUrl(doc)
                    }

                    return (
                      <div key={doc._id || i} className="col-md-6 col-lg-4 mb-3">
                        <div className="card border">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-start">
                              {/* Image Thumbnail or Icon */}
                              <div className="me-3" style={{ flexShrink: 0 }}>
                                {isImageFile(doc.mime_type) && imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={docName}
                                    style={{
                                      width: '80px',
                                      height: '80px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                      border: '1px solid #dee2e6',
                                      cursor: 'pointer'
                                    }}
                                    onClick={async () => {
                                      const url = await getImageUrl(doc)
                                      if (url) window.open(url, '_blank')
                                    }}
                                    onError={(e) => {
                                      if (e.target) {
                                        e.target.style.display = 'none'
                                      }
                                      if (e.target?.nextElementSibling) {
                                        e.target.nextElementSibling.style.display = 'block'
                                      }
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '80px',
                                      height: '80px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor: '#f8f9fa',
                                      borderRadius: '4px',
                                      border: '1px solid #dee2e6'
                                    }}
                                  >
                                    <CIcon icon={cilFile} className="text-primary" size="2xl" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Document Info */}
                              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <p className="text-primary fw-bold mb-1">
                                  {getDocumentType(doc.name, doc.mime_type)}
                                </p>

                                <h6 className="card-title mb-1 text-truncate" title={docName}>
                                  {truncatedName}
                                </h6>
                                <p className="card-text small text-muted mb-2">{doc.size}</p>

                                <div className="d-flex gap-2">
                                  <CButton
                                    color="primary"
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      try {
                                        // Always fetch a fresh signed URL when View is clicked to avoid expired URLs
                                        // Don't use cached signed URLs as they might be expired
                                        
                                        // Try to fetch signed URL using filepath/key
                                        if (fileKey) {
                                          try {
                                            console.log('Fetching fresh signed URL for fileKey:', fileKey)
                                            const res = await new BasicProvider(
                                              `cms/files/signed-url?key=${encodeURIComponent(fileKey)}`,
                                              dispatch
                                            ).getRequest()

                                            console.log('Signed URL API response:', res)
                                            const liveUrl = res?.data?.url
                                            if (liveUrl) {
                                              console.log('Got fresh signed URL, opening directly:', liveUrl)
                                              // Open the URL directly without HEAD check
                                              // HEAD requests might fail due to CORS, but GET (window.open) should work
                                              // Also, checking with HEAD wastes time and the URL might expire during the check
                                              return window.open(liveUrl, '_blank')
                                            } else {
                                              console.error('No URL in API response:', res)
                                              throw new Error('No URL returned from API')
                                            }
                                          } catch (err) {
                                            console.error('Error fetching signed URL - Full error:', err)
                                            console.error('Error response:', err.response)
                                            console.error('Error data:', err.response?.data)
                                            // Check for different error types
                                            const errorStatus = err.response?.status || err.status
                                            const errorMessage = err.response?.data?.message || err.message || err.response?.data?.error || JSON.stringify(err.response?.data) || 'Unknown error'
                                            
                                            console.log('Error status:', errorStatus, 'Error message:', errorMessage)
                                            
                                            if (errorStatus === 404 || errorMessage?.includes('NoSuchKey') || errorMessage?.includes('not found')) {
                                              alert('File not found. The document may have been deleted from storage.')
                                              return
                                            } else if (errorStatus === 403) {
                                              alert('Access denied. You may not have permission to view this file.')
                                              return
                                            } else if (errorStatus === 500) {
                                              alert('Server error. Please try again later or contact support.')
                                              return
                                            } else if (!fileKey) {
                                              alert('File path is missing. Please contact support.')
                                              return
                                            }
                                            // If it's a network error or other error, throw it to outer catch
                                            if (errorMessage?.includes('Network') || errorMessage?.includes('network') || errorMessage?.includes('Failed to fetch')) {
                                              throw new Error('Network error: ' + errorMessage)
                                            }
                                            // For other errors, throw with the actual message so outer catch can handle it
                                            throw new Error(errorMessage || 'Failed to fetch signed URL')
                                          }
                                        }

                                        // Fallback: try using document ID
                                        if (doc._id) {
                                          try {
                                            console.log('Trying fallback method with document ID:', doc._id)
                                            const res = await new BasicProvider(
                                              `cms/files/show-file-with-signed-url/${doc._id}`,
                                              dispatch
                                            ).getRequest()

                                            const fallbackUrl = res?.data?.url || res?.data
                                            if (fallbackUrl) {
                                              console.log('Got fallback URL, opening directly:', fallbackUrl)
                                              // Open the URL directly without HEAD check
                                              // HEAD requests might fail due to CORS, but GET (window.open) should work
                                              return window.open(fallbackUrl, '_blank')
                                            } else {
                                              throw new Error('No URL returned from fallback API')
                                            }
                                          } catch (err) {
                                            console.error('Fallback URL fetch failed:', err)
                                            const fallbackError = err.response?.data?.message || err.message || 'Fallback method failed'
                                            throw new Error(fallbackError)
                                          }
                                        }

                                        // If we reach here, all methods failed and no error was thrown
                                        if (!fileKey && !doc._id) {
                                          throw new Error('File information is missing. Please contact support.')
                                        } else {
                                          throw new Error('Unable to open file. The file may not exist, has been deleted, or is temporarily unavailable.')
                                        }
                                      } catch (err) {
                                        console.error('Error viewing file - Full error object:', err)
                                        console.error('Error message:', err.message)
                                        console.error('Error response:', err.response)
                                        
                                        // Get error details - check message first (for thrown errors), then response
                                        const errorStatus = err.response?.status || err.status
                                        const errorMessage = err.message || err.response?.data?.message || err.response?.data?.error || JSON.stringify(err.response?.data) || 'Unknown error'
                                        
                                        console.log('Final error status:', errorStatus, 'Final error message:', errorMessage)
                                        
                                        // Check error message content first (since we're throwing errors with messages)
                                        if (errorMessage?.includes('NoSuchKey') || errorMessage?.includes('not found') || errorMessage?.includes('404') || errorStatus === 404) {
                                          alert('File not found. The document may have been deleted from storage.')
                                        } else if (errorMessage?.includes('403') || errorStatus === 403 || errorMessage?.includes('Access denied') || errorMessage?.includes('permission')) {
                                          alert('Access denied. You may not have permission to view this file.')
                                        } else if (errorMessage?.includes('500') || errorStatus === 500 || errorMessage?.includes('Server error')) {
                                          alert('Server error. Please try again later or contact support.')
                                        } else if (errorMessage?.includes('Network') || errorMessage?.includes('network') || errorMessage?.includes('Failed to fetch')) {
                                          alert('Network error. Please check your internet connection and try again.')
                                        } else if (errorMessage?.includes('File information is missing')) {
                                          alert(errorMessage)
                                        } else if (errorMessage?.includes('Unable to open file')) {
                                          alert(errorMessage)
                                        } else {
                                          // Show the actual error message
                                          alert(`Failed to view file: ${errorMessage}`)
                                        }
                                      }
                                    }}
                                    disabled={urlLoading?.[doc._id]}
                                  >
                                    <CIcon icon={cilFile} className="me-1" />
                                    {urlLoading?.[doc._id] ? 'Loading...' : 'View'}
                                  </CButton>

                                  <CButton
                                    color="success"
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      try {
                                        let downloadUrl = null

                                        // First try existing signed URL
                                        if (fileUrl && fileUrl !== 'error') {
                                          try {
                                            const testResponse = await fetch(fileUrl, { method: 'HEAD' })
                                            if (testResponse.ok) {
                                              downloadUrl = fileUrl
                                            }
                                          } catch (e) {
                                            console.log('Existing URL not accessible, fetching new one')
                                          }
                                        }

                                        // If no valid URL, fetch new one
                                        if (!downloadUrl && fileKey) {
                                          try {
                                            const res = await new BasicProvider(
                                              `cms/files/signed-url?key=${encodeURIComponent(fileKey)}`,
                                              dispatch
                                            ).getRequest()
                                            downloadUrl = res?.data?.url

                                            // Verify the URL is accessible
                                            if (downloadUrl) {
                                              try {
                                                const testResponse = await fetch(downloadUrl, { method: 'HEAD' })
                                                if (!testResponse.ok) {
                                                  if (testResponse.status === 404) {
                                                    throw new Error('File not found in S3 (404)')
                                                  } else {
                                                    throw new Error(`File access failed with status: ${testResponse.status}`)
                                                  }
                                                }
                                              } catch (fetchErr) {
                                                if (fetchErr.message?.includes('404') || fetchErr.message?.includes('NoSuchKey')) {
                                                  throw new Error('File not found in S3')
                                                }
                                                throw fetchErr
                                              }
                                            } else {
                                              throw new Error('No URL returned from API')
                                            }
                                          } catch (err) {
                                            console.error('Error fetching signed URL for download:', err)
                                            const errorStatus = err.response?.status || err.status
                                            const errorMessage = err.response?.data?.message || err.message || err.response?.data?.error || 'Unknown error'
                                            
                                            if (errorStatus === 404 || errorMessage?.includes('NoSuchKey') || errorMessage?.includes('not found')) {
                                              return alert('File not found. The document may have been deleted from storage.')
                                            } else if (errorStatus === 403) {
                                              return alert('Access denied. You may not have permission to download this file.')
                                            } else if (errorStatus === 500) {
                                              return alert('Server error. Please try again later or contact support.')
                                            } else if (!fileKey) {
                                              return alert('File path is missing. Please contact support.')
                                            }
                                            // Continue to fallback if it's not a critical error
                                            console.log('Continuing to fallback method for download')
                                          }
                                        }

                                        // Fallback: try using document ID
                                        if (!downloadUrl && doc._id) {
                                          try {
                                            const res = await new BasicProvider(
                                              `cms/files/show-file-with-signed-url/${doc._id}`,
                                              dispatch
                                            ).getRequest()
                                            downloadUrl = res?.data?.url || res?.data
                                            
                                            if (downloadUrl) {
                                              try {
                                                const testResponse = await fetch(downloadUrl, { method: 'HEAD' })
                                                if (!testResponse.ok) {
                                                  downloadUrl = null // Mark as invalid
                                                }
                                              } catch (e) {
                                                console.error('Fallback URL not accessible:', e)
                                                downloadUrl = null
                                              }
                                            }
                                          } catch (err) {
                                            console.error('Fallback URL fetch failed:', err)
                                          }
                                        }

                                        if (!downloadUrl) {
                                          if (!fileKey && !doc._id) {
                                            return alert('File information is missing. Please contact support.')
                                          } else {
                                            return alert('Unable to download file. The file may not exist, has been deleted, or is temporarily unavailable.')
                                          }
                                        }

                                        // Fetch and download the file
                                        try {
                                          const response = await fetch(downloadUrl)
                                          if (!response.ok) {
                                            if (response.status === 404) {
                                              return alert('File not found. The document may have been deleted from storage.')
                                            } else if (response.status === 403) {
                                              return alert('Access denied. You may not have permission to download this file.')
                                            } else {
                                              throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`)
                                            }
                                          }

                                          const blob = await response.blob()
                                          const blobUrl = URL.createObjectURL(blob)
                                          const link = document.createElement('a')
                                          link.href = blobUrl
                                          link.download = docName
                                          document.body.appendChild(link)
                                          link.click()
                                          document.body.removeChild(link)
                                          URL.revokeObjectURL(blobUrl)
                                        } catch (fetchErr) {
                                          console.error('Error fetching file for download:', fetchErr)
                                          if (fetchErr.message?.includes('404') || fetchErr.message?.includes('NoSuchKey')) {
                                            return alert('File not found. The document may have been deleted from storage.')
                                          } else if (fetchErr.message?.includes('Network') || fetchErr.message?.includes('network')) {
                                            return alert('Network error. Please check your internet connection and try again.')
                                          }
                                          throw fetchErr
                                        }
                                      } catch (err) {
                                        console.error('Error downloading file:', err)
                                        const errorStatus = err.response?.status || err.status
                                        const errorMessage = err.response?.data?.message || err.message || err.response?.data?.error || 'Unknown error'
                                        
                                        if (errorStatus === 404 || errorMessage?.includes('NoSuchKey') || errorMessage?.includes('not found')) {
                                          alert('File not found. The document may have been deleted from storage.')
                                        } else if (errorStatus === 403) {
                                          alert('Access denied. You may not have permission to download this file.')
                                        } else if (errorStatus === 500) {
                                          alert('Server error. Please try again later or contact support.')
                                        } else if (errorMessage?.includes('Network') || errorMessage?.includes('network')) {
                                          alert('Network error. Please check your internet connection and try again.')
                                        } else {
                                          alert(`Failed to download file: ${errorMessage || 'Please try again later.'}`)
                                        }
                                      }
                                    }}
                                    disabled={urlLoading?.[doc._id] || (!fileUrl && !fileKey)}
                                  >
                                    <CIcon icon={cilCloudDownload} className="me-1" />
                                    {urlLoading?.[doc._id] ? 'Loading...' : 'Download'}
                                  </CButton>

                                  {(isAC || isHR) && (
                                    <CButton
                                      color="danger"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedDoc(doc)
                                        setDeleteModal(true)
                                      }}
                                    >
                                      <CIcon icon={cilTrash} className="me-1" />
                                      Delete
                                    </CButton>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <CIcon icon={cilFile} size="3xl" className="text-muted mb-3" />
                <h6 className="text-muted">No documents uploaded yet</h6>
              </div>
            )}

            {editMode.attachments && canEditAttachments(editAttempts) && (
              <>
                <h6 className="text-primary mb-3">
                  <CIcon icon={cilPencil} className="me-2" />
                  Upload New Documents
                </h6>
                <CRow>
                  {documentTypes.map((doc) => (
                    <CCol md={6} key={doc.key} className="mb-3">
                      <CFormLabel>
                        {doc.label} {doc.required && <span className="text-danger">*</span>}
                      </CFormLabel>
                      <CFormInput
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleAttachmentUpload(doc.key, e)}
                      />
                    </CCol>
                  ))}
                </CRow>

                <div className="d-flex justify-content-end mt-3">
                  <CButton
                    color="success"
                    className="me-2"
                    onClick={() => {
                      handleSave('attachments')
                      handleDocumentUpload()
                    }}
                  >
                    <CIcon icon={cilSave} className="me-1" />
                    Save
                  </CButton>

                  <CButton color="secondary" onClick={() => handleCancel('attachments')}>
                    <CIcon icon={cilX} className="me-1" />
                    Cancel
                  </CButton>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Delete Modal */}
      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete <strong>{selectedDoc?.name}</strong>?
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDeleteConfirm}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default DocumentUpload

 
