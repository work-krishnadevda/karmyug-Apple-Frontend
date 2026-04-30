import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CImage,
  CButtonGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX, cilArrowLeft, cilArrowRight } from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux'
import store, {
  selectActiveOffers,
  selectOfferPopupState,
  selectPunchInStatus,
} from 'src/store'
import BasicProvider from 'src/constants/BasicProvider'

/**
 * Global offer modal:
 * - After login: active offers (if any) before punch-in modal for all roles; no artificial delay.
 * - After a successful API punch-in: loads active offers and shows immediately when `selectActiveOffers` has items.
 * - Admin/HR see full copy in the modal; other roles image-only (see `imageOnlyView`).
 */
const OfferPopupManager = () => {
  const dispatch = useDispatch()
  const offers = useSelector(selectActiveOffers)
  const offerPopup = useSelector(selectOfferPopupState)
  const punchInStatus = useSelector(selectPunchInStatus)
  const prePunchSequenceCompleted = useSelector(
    (s) => !!s.offerPopup?.prePunchSequenceCompleted,
  )
  const userRole = useSelector((state) => state?.userRole)
  const prePunchLoginInFlight = useRef(false)

  const isAdminOrHr = useMemo(() => {
    const n = String(userRole?.name || '').toLowerCase()
    const admin = String(process.env.REACT_APP_ADMIN || '').toLowerCase()
    const hr = String(process.env.REACT_APP_HR || '').toLowerCase()
    return n === admin || n === hr
  }, [userRole])
  const [signedUrls, setSignedUrls] = useState({})
  const requestedKeysRef = useRef(new Set())

  const { lastPunchInAt, isVisible, activeOfferIndex } = offerPopup || {}

  // Sort offers: High priority first, then by startDate/createdAt
  const sortedOffers = useMemo(() => {
    if (!offers || !offers.length) return []

    return [...offers].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : 1
      }

      const aDate = new Date(a.startDate || a.createdAt || 0).getTime()
      const bDate = new Date(b.startDate || b.createdAt || 0).getTime()
      return aDate - bDate
    })
  }, [offers])

  const fetchActiveOffers = useCallback(async () => {
    try {
      const response = await new BasicProvider('offers/active', dispatch).getRequest()
      const list = response?.data || []
      if (Array.isArray(list)) {
        dispatch({ type: 'setOffers', offers: list })
      }
    } catch (error) {
      console.error('Failed to load active offers:', error)
    }
  }, [dispatch])

  // Already punched in: skip "offer before first punch" gating (punch modal not needed for this rule)
  useEffect(() => {
    if (punchInStatus?.isPunchedIn === true) {
      dispatch({ type: 'markPrePunchOfferLoginSkipped' })
    }
  }, [punchInStatus?.isPunchedIn, dispatch])

  // First session load (not punched in): block punch modal, fetch offers, show if any (all roles including admin/HR)
  useEffect(() => {
    if (punchInStatus?.isPunchedIn === true) return
    if (!punchInStatus || !Object.prototype.hasOwnProperty.call(punchInStatus, 'isPunchedIn')) {
      return
    }
    if (punchInStatus.isPunchedIn !== false) return
    if (prePunchSequenceCompleted) return
    if (prePunchLoginInFlight.current) return
    prePunchLoginInFlight.current = true

    let cancelled = false
    const run = async () => {
      try {
        dispatch({ type: 'setOfferPunchBlock', value: true })
        const response = await new BasicProvider('offers/active', dispatch).getRequest()
        if (cancelled) return
        const list = response?.data || []
        if (!Array.isArray(list) || list.length === 0) {
          dispatch({ type: 'clearOfferPunchBlockAndMarkPrePunchDone' })
          return
        }
        dispatch({ type: 'setOffers', offers: list })
        const st = store.getState()
        if (selectActiveOffers(st).length > 0) {
          dispatch({ type: 'showOfferPopup' })
        } else {
          dispatch({ type: 'clearOfferPunchBlockAndMarkPrePunchDone' })
        }
      } catch (e) {
        console.error('Pre-punch offers load failed:', e)
        if (!cancelled) {
          dispatch({ type: 'clearOfferPunchBlockAndMarkPrePunchDone' })
        }
      } finally {
        prePunchLoginInFlight.current = false
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [punchInStatus, prePunchSequenceCompleted, dispatch])

  // After successful punch-in (API), fetch offers and show as soon as data is in (no timer)
  useEffect(() => {
    if (!lastPunchInAt) return
    let cancelled = false
    const run = async () => {
      try {
        const response = await new BasicProvider('offers/active', dispatch).getRequest()
        if (cancelled) return
        const list = response?.data || []
        if (!Array.isArray(list)) return
        dispatch({ type: 'setOffers', offers: list })
        const st = store.getState()
        if (selectActiveOffers(st).length > 0) {
          dispatch({ type: 'showOfferPopup' })
        }
      } catch (e) {
        console.error('Failed to load offers after punch-in:', e)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [lastPunchInAt, dispatch])

  // Refetch when popup is open so list stays fresh
  useEffect(() => {
    if (isVisible) {
      fetchActiveOffers()
    }
  }, [isVisible, fetchActiveOffers])

  // Normalize banner key (backend may send bannerFileKey or banner_file_key)
  const getBannerKey = (offer) => {
    const raw = offer?.bannerFileKey ?? offer?.banner_file_key
    if (raw == null || raw === '') return ''
    return String(raw).trim()
  }

  const fetchSignedUrlForKey = useCallback(
    async (key) => {
      if (!key || requestedKeysRef.current.has(key)) return
      requestedKeysRef.current.add(key)
      try {
        const response = await new BasicProvider(
          `cms/files/signed-url?key=${encodeURIComponent(key)}`,
          dispatch,
        ).getRequest()
        const url = response?.data?.url ?? response?.url
        if (url) {
          setSignedUrls((prev) => ({ ...prev, [key]: url }))
        }
      } catch (error) {
        console.error('Failed to fetch signed url for banner:', error)
      }
    },
    [dispatch],
  )

  // Fetch signed URLs for all offer banners when list is available
  useEffect(() => {
    sortedOffers.forEach((offer) => {
      const key = getBannerKey(offer)
      if (key) fetchSignedUrlForKey(key)
    })
  }, [sortedOffers, fetchSignedUrlForKey])

  // Derive current offer index and offer so effects below can use them
  const safeIndex =
    sortedOffers.length > 0
      ? typeof activeOfferIndex === 'number'
        ? Math.min(Math.max(activeOfferIndex, 0), sortedOffers.length - 1)
        : 0
      : 0
  const currentOffer = sortedOffers[safeIndex] ?? null

  // When only one offer remains (e.g. after dismissing others), ensure current offer's banner URL is fetched
  useEffect(() => {
    if (!isVisible || !currentOffer) return
    const key = getBannerKey(currentOffer)
    if (key && !signedUrls[key]) fetchSignedUrlForKey(key)
  }, [isVisible, currentOffer, signedUrls, fetchSignedUrlForKey])

  if (!isVisible || !sortedOffers.length) {
    return null
  }

  const imageOnlyView = !isAdminOrHr
  const hasMultiple = sortedOffers.length > 1

  const currentBannerKey = getBannerKey(currentOffer)
  const bannerUrl =
    currentOffer?.imageUrl ||
    (currentBannerKey ? signedUrls[currentBannerKey] : null)

  const handleClose = () => {
    if (currentOffer?.id) {
      dispatch({ type: 'dismissOfferForSession', id: currentOffer.id })
    }
    dispatch({ type: 'hideOfferPopup' })
  }

  const handleNext = () => {
    if (!hasMultiple) return
    const nextIndex = (safeIndex + 1) % sortedOffers.length
    dispatch({ type: 'setActiveOfferIndex', index: nextIndex })
  }

  const handlePrev = () => {
    if (!hasMultiple) return
    const prevIndex = (safeIndex - 1 + sortedOffers.length) % sortedOffers.length
    dispatch({ type: 'setActiveOfferIndex', index: prevIndex })
  }

  return (
    <CModal
      visible={true}
      onClose={handleClose}
      alignment="center"
      size="lg"
      backdrop="static"
      portal={true}
      className="offer-popup-modal"
    >
      <div
        className={`offer-popup-shell ${imageOnlyView ? 'offer-popup-shell--image-only' : ''}`}
      >
        {imageOnlyView ? (
          <div className="position-relative">
            <CModalBody className="p-0">
              <div className="offer-banner offer-banner-169">
                {bannerUrl ? (
                  <CImage src={bannerUrl} alt="" className="offer-banner-img" />
                ) : null}
              </div>
            </CModalBody>
            <CButton
              color="link"
              className="p-0 text-white position-absolute top-0 end-0 m-2 offer-popup-close-floating"
              onClick={handleClose}
              aria-label="Close"
            >
              <span className="offer-popup-close-bg rounded-circle d-inline-flex p-1">
                <CIcon icon={cilX} size="lg" />
              </span>
            </CButton>
            {hasMultiple && (
              <div className="position-absolute start-0 end-0 bottom-0 d-flex justify-content-center align-items-center gap-2 pb-2 offer-popup-floating-nav">
                <CButton
                  size="sm"
                  color="light"
                  className="rounded-circle shadow border-0 p-2"
                  onClick={handlePrev}
                  aria-label="Previous offer"
                >
                  <CIcon icon={cilArrowLeft} />
                </CButton>
                <div className="offer-dots offer-dots--on-image">
                  {sortedOffers.map((offer, idx) => (
                    <span
                      key={offer.id || idx}
                      className={`offer-dot ${idx === safeIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
                <CButton
                  size="sm"
                  color="light"
                  className="rounded-circle shadow border-0 p-2"
                  onClick={handleNext}
                  aria-label="Next offer"
                >
                  <CIcon icon={cilArrowRight} />
                </CButton>
              </div>
            )}
          </div>
        ) : (
          <>
            <CModalHeader className="border-0 px-4 pt-3 pb-1" closeButton={false}>
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div>
                  <CModalTitle className="fw-bold text-dark">
                    {currentOffer?.title || 'Special Offer'}
                  </CModalTitle>
                  <div className="text-offer-subtitle mt-1">
                    {currentOffer?.priority === 'high' ? 'High Priority Campaign' : 'Offer Campaign'}
                  </div>
                </div>
                <CButton
                  color="link"
                  className="p-0 text-muted"
                  onClick={handleClose}
                  aria-label="Close"
                >
                  <CIcon icon={cilX} size="lg" />
                </CButton>
              </div>
            </CModalHeader>

            <CModalBody className="pt-0 px-4 pb-3">
              <div className="offer-banner offer-banner-169 mb-3">
                {bannerUrl ? (
                  <CImage
                    src={bannerUrl}
                    alt={currentOffer.title}
                    className="offer-banner-img"
                  />
                ) : (
                  <div className="offer-banner-placeholder">
                    <div className="badge-offer">LIMITED TIME</div>
                    <h3 className="mb-1">Exclusive offer for today&apos;s team</h3>
                    <p className="mb-0 text-muted small">
                      Crafted by Admin / HR for active offers.
                    </p>
                  </div>
                )}
              </div>

              <div className="offer-content">
                {currentOffer?.description && (
                  <p className="mb-0 offer-description">{currentOffer.description}</p>
                )}

                {currentOffer?.endDate && (
                  <div className="offer-dates mt-3">
                    <span>
                      Offer valid till:{' '}
                      <strong>{new Date(currentOffer.endDate).toLocaleString()}</strong>
                    </span>
                  </div>
                )}
              </div>
            </CModalBody>

            <CModalFooter className="border-0 px-4 pb-4 pt-1 d-flex justify-content-between">
              {hasMultiple && (
                <div className="d-flex align-items-center gap-2">
                  <CButtonGroup size="sm">
                    <CButton color="dark" variant="outline" onClick={handlePrev}>
                      <CIcon icon={cilArrowLeft} className="me-1" />
                      Previous
                    </CButton>
                    <CButton color="dark" variant="outline" onClick={handleNext}>
                      Next
                      <CIcon icon={cilArrowRight} className="ms-1" />
                    </CButton>
                  </CButtonGroup>
                  <div className="offer-dots">
                    {sortedOffers.map((offer, idx) => (
                      <span
                        key={offer.id || idx}
                        className={`offer-dot ${idx === safeIndex ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <CButton color="primary" onClick={handleClose}>
                Close
              </CButton>
            </CModalFooter>
          </>
        )}
      </div>

      <style jsx>{`
        .offer-popup-modal .modal-dialog {
          max-width: 720px;
        }

        .offer-popup-modal .modal-content {
          background: transparent;
          border: none;
        }

        .offer-popup-shell {
          border-radius: 20px;
          overflow: hidden;
          background: #ffffff;
          color: #111827;
          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.18),
            0 0 0 1px rgba(148, 163, 184, 0.35);
          transform: scale(0.96);
          opacity: 0;
          animation: offerPopupIn 0.35s ease-out forwards;
        }

        .offer-banner {
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #e0f2fe, #fef3c7);
        }

        .offer-banner-169 {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
        }

        .offer-banner-169 .offer-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .offer-popup-shell--image-only {
          background: transparent;
        }

        .offer-popup-close-floating {
          z-index: 2;
        }

        .offer-popup-close-bg {
          background: rgba(0, 0, 0, 0.5);
        }

        .offer-popup-floating-nav {
          z-index: 2;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.35) 0%,
            rgba(0, 0, 0, 0) 100%
          );
          padding-top: 2.5rem;
        }

        .offer-dots--on-image .offer-dot {
          background: rgba(255, 255, 255, 0.5);
        }

        .offer-dots--on-image .offer-dot.active {
          background: #fff;
        }

        .offer-banner-placeholder {
          padding: 18px 20px;
          color: #1f2933;
        }

        .badge-offer {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: #2563eb;
          color: #ffffff;
          border: 1px solid rgba(37, 99, 235, 0.3);
          margin-bottom: 8px;
        }

        .text-offer-subtitle {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .offer-content {
          margin-top: 4px;
        }

        .offer-description {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #374151;
        }

        .offer-dates {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 0.78rem;
          color: #6b7280;
        }

        .offer-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .offer-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.5);
        }

        .offer-dot.active {
          width: 11px;
          background: #2563eb;
        }

        @keyframes offerPopupIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </CModal>
  )
}

export default OfferPopupManager

