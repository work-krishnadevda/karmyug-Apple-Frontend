import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CRow,
  CCol,
  CImage,
  CAlert,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
} from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import CIcon from '@coreui/icons-react'
import { cilSave, cilImage, cilInbox, cilX } from '@coreui/icons'
import { selectOffers } from 'src/store'
import BasicProvider from 'src/constants/BasicProvider'

/**
 * Full page for Publish Offer (sidebar → /offers/publish).
 * Form on page; no modal. Same Redux addOffer logic, API-ready.
 */
const PublishOfferPage = () => {
  const dispatch = useDispatch()
  const loggedInRole = useSelector((state) => state?.userRole)
  const offers = useSelector(selectOffers)

  const isAdminOrHr = useMemo(() => {
    const n = String(loggedInRole?.name || '').toLowerCase()
    const admin = String(process.env.REACT_APP_ADMIN || '').toLowerCase()
    const hr = String(process.env.REACT_APP_HR || '').toLowerCase()
    return n === admin || n === hr
  }, [loggedInRole])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('high')
  const [status, setStatus] = useState('active')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState('')
  const [bannerFileKey, setBannerFileKey] = useState('')
  const [bannerFileName, setBannerFileName] = useState('')
  const [editingOfferId, setEditingOfferId] = useState(null)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [savingOffer, setSavingOffer] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const bannerFileInputRef = useRef(null)
  const [viewPreviewOffer, setViewPreviewOffer] = useState(null)
  const [previewBannerUrl, setPreviewBannerUrl] = useState('')

  useEffect(() => {
    if (!bannerFile) {
      // keep preview from existing offer if editing and no new file chosen
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => setBannerPreview(e.target.result)
    reader.readAsDataURL(bannerFile)
  }, [bannerFile])

  // Load offers from backend on first mount
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoadingOffers(true)
        const response = await new BasicProvider('offers', dispatch).getRequest()
        const list = response?.data || []
        dispatch({ type: 'setOffers', offers: list })
      } catch (error) {
        console.error('Failed to load offers:', error)
        toast.error('Failed to load offers list')
      } finally {
        setLoadingOffers(false)
      }
    }
    fetchOffers()
  }, [dispatch])

  // Fetch signed URL for preview modal when viewing an offer with banner
  useEffect(() => {
    if (!viewPreviewOffer) {
      setPreviewBannerUrl('')
      return
    }
    const key = viewPreviewOffer.bannerFileKey || viewPreviewOffer.banner_file_key
    if (!key) {
      setPreviewBannerUrl('')
      return
    }
    let cancelled = false
    const fetchPreviewBanner = async () => {
      try {
        const response = await new BasicProvider(
          `cms/files/signed-url?key=${encodeURIComponent(key)}`,
          dispatch,
        ).getRequest()
        const url = response?.data?.url ?? response?.url
        if (!cancelled && url) setPreviewBannerUrl(url)
      } catch (error) {
        if (!cancelled) setPreviewBannerUrl('')
      }
    }
    fetchPreviewBanner()
    return () => { cancelled = true }
  }, [viewPreviewOffer, dispatch])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('high')
    setStartDate('')
    setEndDate('')
    setBannerFile(null)
    setBannerPreview('')
    setBannerFileKey('')
    setBannerFileName('')
    setStatus('active')
    setEditingOfferId(null)
    if (bannerFileInputRef.current) {
      bannerFileInputRef.current.value = ''
    }
  }

  const validateDates = () => {
    if (!startDate || !endDate) return true
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error('Please select valid start and end dates.')
      return false
    }
    if (end < start) {
      toast.error('End date should be after start date.')
      return false
    }
    return true
  }

  const getOfferStatus = (offer) => {
    const now = new Date()
    const start = offer.startDate ? new Date(offer.startDate) : null
    const end = offer.endDate ? new Date(offer.endDate) : null

    const status = offer.status ? String(offer.status).toLowerCase() : ''
    if (status && status !== 'active') {
      return 'inactive'
    }

    const isActive =
      (!start || start <= now) &&
      (!end || end >= now)

    if (isActive) return 'active'
    if (start && start > now) return 'upcoming'
    if (end && end < now) return 'expired'
    return 'inactive'
  }

  const toInputDateTime = (iso) => {
    if (!iso) return ''
    const date = new Date(iso)
    if (isNaN(date.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Please enter offer title.')
      return
    }
    if (!description.trim()) {
      toast.error('Please enter offer description.')
      return
    }
    if (!validateDates()) return

    const payload = {
      title: title.trim().toUpperCase(),
      description: description.trim(),
      priority,
      startDate: startDate ? new Date(startDate).toISOString() : '',
      endDate: endDate ? new Date(endDate).toISOString() : '',
      status,
      bannerFileKey: bannerFileKey || undefined,
      bannerFileName: bannerFileName || undefined,
    }

    try {
      setSavingOffer(true)
      if (editingOfferId) {
        const response = await new BasicProvider(`offers/${editingOfferId}`, dispatch).putRequest(
          payload,
        )
        const updated = response?.data || payload
        dispatch({ type: 'updateOffer', id: updated.id || editingOfferId, updates: updated })
        toast.success('Offer updated.')
      } else {
        const response = await new BasicProvider('offers', dispatch).postRequest(payload)
        const created = response?.data || payload
        dispatch({ type: 'addOffer', offer: created })
        toast.success('Offer created.')
      }
      resetForm()
    } catch (error) {
      console.error('Failed to save offer:', error)
      toast.error('Failed to save offer')
    } finally {
      setSavingOffer(false)
    }
  }

  const handleEdit = (offer) => {
    setEditingOfferId(offer.id)
    setTitle(offer.title || '')
    setDescription(offer.description || '')
    setPriority(offer.priority || 'normal')
    setStartDate(toInputDateTime(offer.startDate))
    setEndDate(toInputDateTime(offer.endDate))
    setBannerPreview(offer.imageUrl || '')
    setBannerFile(null)
    setBannerFileKey(offer.bannerFileKey || offer.banner_file_key || '')
    setBannerFileName(offer.bannerFileName || offer.banner_file_name || '')
    setStatus(offer.status || 'active')
  }

  const handleDelete = (id) => {
    setDeleteTargetId(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    try {
      await new BasicProvider(`offers/${deleteTargetId}`, dispatch).deleteRealRequest()
      dispatch({ type: 'deleteOffer', id: deleteTargetId })
      if (editingOfferId === deleteTargetId) {
        resetForm()
      }
      toast.success('Offer deleted.')
    } catch (error) {
      console.error('Failed to delete offer:', error)
      toast.error('Failed to delete offer')
    } finally {
      setShowDeleteModal(false)
      setDeleteTargetId(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeleteTargetId(null)
  }

  const sortedOffers = [...(offers || [])].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'high' ? -1 : 1
    }
    const aDate = new Date(a.startDate || a.createdAt || 0).getTime()
    const bDate = new Date(b.startDate || b.createdAt || 0).getTime()
    return aDate - bDate
  })

  return (
    <CContainer fluid className="py-4">
      <CCard className="border-0 shadow-sm publish-offer-page-card">
        <CCardHeader className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="publish-offer-badge me-2">Campaign</span>
              <h4 className="mb-0 fw-bold">Publish Offer</h4>
            </div>
          </div>
        </CCardHeader>

        <CCardBody className="p-4">
          {loadingOffers && (
            <div className="d-flex align-items-center gap-2 text-muted mb-3 py-2">
              <CSpinner size="sm" />
              <span className="small">Loading offers…</span>
            </div>
          )}

          <CForm onSubmit={handleSubmit}>
            <CRow className="g-3">
              <CCol md={7}>
                <CFormLabel>Offer Title *</CFormLabel>
                <CFormInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. FESTIVE INCENTIVE BONUS"
                  style={{ textTransform: 'uppercase' }}
                />
              </CCol>

              <CCol md={5}>
                <CFormLabel>Priority *</CFormLabel>
                <CFormSelect value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="high">High Priority (Show First)</option>
                  <option value="normal">Normal Priority</option>
                </CFormSelect>
              </CCol>

              <CCol md={4}>
                <CFormLabel>Status</CFormLabel>
                <CFormSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </CFormSelect>
              </CCol>

              <CCol md={12}>
                <CFormLabel>Offer Text / Description *</CFormLabel>
                <CFormTextarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a short, powerful message for employees..."
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>Start Date & Time *</CFormLabel>
                <CFormInput
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </CCol>

              <CCol md={6}>
                <CFormLabel>End Date & Time *</CFormLabel>
                <CFormInput
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </CCol>

              <CCol md={12}>
                <CFormLabel>
                  <CIcon icon={cilImage} className="me-1" />
                  Banner Image (Optional)
                </CFormLabel>
                <CFormInput
                  ref={bannerFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0] || null
                    setBannerFile(file)
                    if (!file) {
                      setBannerFileKey('')
                      setBannerFileName('')
                      return
                    }
                    try {
                      setUploadingBanner(true)
                      const formData = new FormData()
                      // follow existing backend convention: field name 'gallery'
                      formData.append('gallery', file)
                      const response = await new BasicProvider(
                        'cms/files/create',
                        dispatch,
                      ).postRequest(formData)
                      const uploadedFile = Array.isArray(response?.data)
                        ? response.data[0]
                        : null
                      if (uploadedFile?.filepath) {
                        setBannerFileKey(uploadedFile.filepath)
                        setBannerFileName(uploadedFile.originalName || file.name)
                        toast.success('Banner uploaded')
                      } else {
                        throw new Error('Invalid upload response')
                      }
                    } catch (error) {
                      console.error('Banner upload failed:', error)
                      toast.error('Failed to upload banner image')
                      setBannerFileKey('')
                      setBannerFileName('')
                    } finally {
                      setUploadingBanner(false)
                    }
                  }}
                />
                <div className="form-text">
                  This image will appear on top of the offer popup. Recommended ratio 16:9.
                </div>
                {bannerPreview && (
                  <div className="mt-3">
                    <CImage
                      src={bannerPreview}
                      alt="Banner Preview"
                      rounded
                      className="publish-offer-banner-preview"
                    />
                  </div>
                )}
                {editingOfferId && bannerFileKey && !bannerPreview && !bannerFile && (
                  <p className="small text-muted mt-2 mb-0">Banner image attached. Choose a new file to replace.</p>
                )}
              </CCol>

              <CCol xs={12} className="mt-3">
                <CButton type="submit" color="primary" className="px-4" disabled={savingOffer}>
                  <CIcon icon={cilSave} className="me-2" />
                  {savingOffer
                    ? editingOfferId
                      ? 'Updating...'
                      : 'Saving...'
                    : editingOfferId
                    ? 'Update Offer'
                    : 'Save Offer'}
                </CButton>
                <CButton
                  type="button"
                  color="secondary"
                  variant="ghost"
                  className="ms-2"
                  onClick={resetForm}
                >
                  Reset
                </CButton>
              </CCol>
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      <CCard className="border-0 shadow-sm mt-4">
        <CCardHeader className="bg-white border-bottom py-3">
          <h5 className="mb-0 fw-bold">Published Offers</h5>
        </CCardHeader>
        <CCardBody className="p-3">
          {loadingOffers ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p className="text-muted small mt-2 mb-0">Loading offers…</p>
            </div>
          ) : sortedOffers.length === 0 ? (
            <div className="text-center py-5">
              <CIcon icon={cilInbox} size="3xl" className="text-muted mb-2" />
              <h6 className="text-muted mb-1">No offers yet</h6>
              <p className="text-muted small mb-0">
                Use the form above to create your first offer.
              </p>
            </div>
          ) : (
            <CRow className="g-3">
              {sortedOffers.map((offer) => (
                <CCol md={6} key={offer.id}>
                  <CCard className="h-100 border-0 shadow-sm">
                    <CCardBody>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="mb-1 fw-bold">{offer.title}</h6>
                          <CBadge
                            color={offer.priority === 'high' ? 'danger' : 'secondary'}
                            className="me-2"
                          >
                            {offer.priority === 'high' ? 'High Priority' : 'Normal Priority'}
                          </CBadge>
                          {offer.createdByRole && (
                            <CBadge color="info" variant="outline">
                              {offer.createdByRole}
                            </CBadge>
                          )}
                        </div>
                      <div>
                        {(() => {
                          const status = getOfferStatus(offer)
                          const map = {
                            active: { color: 'success', label: 'Active' },
                            upcoming: { color: 'warning', label: 'Upcoming' },
                            expired: { color: 'secondary', label: 'Expired' },
                            inactive: { color: 'dark', label: 'Inactive' },
                          }
                          const meta = map[status] || map.inactive
                          return (
                            <CBadge color={meta.color} className="text-uppercase small">
                              {meta.label}
                            </CBadge>
                          )
                        })()}
                      </div>
                      </div>
                      {offer.startDate || offer.endDate ? (
                        <p className="small text-muted mb-1">
                          {offer.startDate && (
                            <>
                              <strong>Start:</strong>{' '}
                              {new Date(offer.startDate).toLocaleString()}{' '}
                            </>
                          )}
                          {offer.endDate && (
                            <>
                              <br />
                              <strong>End:</strong>{' '}
                              {new Date(offer.endDate).toLocaleString()}
                            </>
                          )}
                        </p>
                      ) : null}
                      {offer.description && (
                        <p className="small mb-2" style={{ maxHeight: 60, overflow: 'hidden' }}>
                          {offer.description}
                        </p>
                      )}
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="d-flex gap-2">
                          <CButton
                            size="sm"
                            color="info"
                            variant="outline"
                            onClick={() => setViewPreviewOffer(offer)}
                          >
                            View
                          </CButton>
                          <CButton
                            size="sm"
                            color="primary"
                            variant="outline"
                            onClick={() => handleEdit(offer)}
                          >
                            Edit
                          </CButton>
                          <CButton
                            size="sm"
                            color={getOfferStatus(offer) === 'active' ? 'secondary' : 'success'}
                            variant="outline"
                            onClick={async () => {
                              const newStatus = getOfferStatus(offer) === 'active' ? 'inactive' : 'active'
                              try {
                                const response = await new BasicProvider(
                                  `offers/${offer.id}`,
                                  dispatch,
                                ).putRequest({ status: newStatus })
                                const updated = response?.data || { ...offer, status: newStatus }
                                dispatch({
                                  type: 'updateOffer',
                                  id: offer.id,
                                  updates: updated,
                                })
                                toast.success(
                                  newStatus === 'active'
                                    ? 'Offer activated.'
                                    : 'Offer deactivated.',
                                )
                              } catch (error) {
                                console.error('Failed to toggle status:', error)
                                toast.error('Failed to update offer status')
                              }
                            }}
                          >
                            {getOfferStatus(offer) === 'active' ? 'Deactivate' : 'Activate'}
                          </CButton>
                          <CButton
                            size="sm"
                            color="danger"
                            variant="outline"
                            onClick={() => handleDelete(offer.id)}
                          >
                            Delete
                          </CButton>
                        </div>
                        {offer.imageUrl && (
                          <small className="text-muted">Banner attached</small>
                        )}
                      </div>
                    </CCardBody>
                  </CCard>
                </CCol>
              ))}
            </CRow>
          )}
        </CCardBody>
      </CCard>

      {/* Preview: how offer looks on user side */}
      <CModal
        visible={!!viewPreviewOffer}
        onClose={() => setViewPreviewOffer(null)}
        alignment="center"
        size="lg"
        backdrop="static"
        className="offer-preview-modal"
      >
        {viewPreviewOffer && (
          <div
            className={`offer-preview-shell rounded-3 shadow ${!isAdminOrHr ? 'offer-preview-shell--image-only' : ''}`}
          >
            {!isAdminOrHr ? (
              <div className="position-relative">
                <CModalBody className="p-0">
                  <div className="offer-preview-banner-169 rounded-3 overflow-hidden bg-light">
                    {(previewBannerUrl || viewPreviewOffer.imageUrl) ? (
                      <CImage
                        src={previewBannerUrl || viewPreviewOffer.imageUrl}
                        alt=""
                        className="offer-preview-banner-img"
                      />
                    ) : null}
                  </div>
                </CModalBody>
                <CButton
                  color="link"
                  className="p-0 text-white position-absolute top-0 end-0 m-2 offer-preview-close-floating"
                  onClick={() => setViewPreviewOffer(null)}
                  aria-label="Close"
                >
                  <span className="offer-preview-close-bg rounded-circle d-inline-flex p-1">
                    <CIcon icon={cilX} size="lg" />
                  </span>
                </CButton>
              </div>
            ) : (
              <>
                <CModalHeader className="border-0 px-4 pt-3 pb-1" closeButton={false}>
                  <div className="d-flex w-100 justify-content-between align-items-start">
                    <div>
                      <CModalTitle className="fw-bold text-dark">
                        {viewPreviewOffer.title || 'Special Offer'}
                      </CModalTitle>
                      <div className="text-muted small mt-1">
                        {viewPreviewOffer.priority === 'high' ? 'High Priority Campaign' : 'Offer Campaign'}
                      </div>
                    </div>
                    <CButton
                      color="link"
                      className="p-0 text-muted"
                      onClick={() => setViewPreviewOffer(null)}
                      aria-label="Close"
                    >
                      <CIcon icon={cilX} size="lg" />
                    </CButton>
                  </div>
                </CModalHeader>
                <CModalBody className="pt-0 px-4 pb-3">
                  <div
                    className="offer-preview-banner-169 mb-3 rounded-3 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #e0f2fe, #fef3c7)' }}
                  >
                    {(previewBannerUrl || viewPreviewOffer.imageUrl) ? (
                      <CImage
                        src={previewBannerUrl || viewPreviewOffer.imageUrl}
                        alt={viewPreviewOffer.title}
                        className="offer-preview-banner-img"
                      />
                    ) : (
                      <div className="p-3 text-dark">
                        <span className="badge bg-primary rounded-pill small">LIMITED TIME</span>
                        <h6 className="mt-2 mb-1">Exclusive offer for today&apos;s team</h6>
                        <p className="mb-0 text-muted small">Crafted by Admin / HR for active employees.</p>
                      </div>
                    )}
                  </div>
                  <div className="offer-preview-content">
                    {viewPreviewOffer.description && (
                      <p className="mb-0 small text-secondary">{viewPreviewOffer.description}</p>
                    )}
                    {viewPreviewOffer.endDate && (
                      <div className="mt-3 small text-muted">
                        Offer valid till: <strong>{new Date(viewPreviewOffer.endDate).toLocaleString()}</strong>
                      </div>
                    )}
                  </div>
                </CModalBody>
                <CModalFooter className="border-0 px-4 pb-4 pt-1">
                  <small className="text-muted me-auto">Preview — user side view</small>
                  <CButton color="primary" onClick={() => setViewPreviewOffer(null)}>
                    Close
                  </CButton>
                </CModalFooter>
              </>
            )}
          </div>
        )}
      </CModal>

      <CModal
        visible={showDeleteModal}
        onClose={cancelDelete}
        alignment="center"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Delete Offer</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-2">
            <strong>Do you want to delete this offer?</strong>
          </p>
          <p className="text-muted mb-0 small">
            This action will remove the offer from the popup list. You can create it again later if
            needed.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={cancelDelete}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            Yes, Delete
          </CButton>
        </CModalFooter>
      </CModal>

      <style jsx>{`
        .publish-offer-page-card {
          border-radius: 12px;
          overflow: hidden;
        }
        .publish-offer-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: linear-gradient(90deg, #22c55e, #0ea5e9);
          color: #fff;
          font-weight: 700;
        }
        .publish-offer-banner-preview {
          max-height: 200px;
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .offer-preview-banner-169 {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: min(60vh, 100%);
        }
        .offer-preview-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .offer-preview-shell--image-only {
          overflow: hidden;
        }
        .offer-preview-close-floating {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
          z-index: 2;
        }
        .offer-preview-close-bg {
          background: rgba(0, 0, 0, 0.45);
        }
      `}</style>
    </CContainer>
  )
}

export default PublishOfferPage
