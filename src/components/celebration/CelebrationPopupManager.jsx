import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CModal } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX, cilChevronLeft, cilChevronRight } from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux'
import { selectOfferPopupState, selectProfileData, selectPunchInStatus } from 'src/store'
import BasicProvider from 'src/constants/BasicProvider'
import { CelebrationPopupCard } from './CelebrationPopupCard'
import { fireCelebrationConfetti } from 'src/utils/celebrationConfetti'
import 'src/assets/css/celebration-popup-modal.css'

const CELEBRATION_DELAY_MS = 0

const calculateYears = (dateStr) => {
  if (!dateStr) return 0
  const start = new Date(dateStr)
  const today = new Date()
  let years = today.getFullYear() - start.getFullYear()
  const monthDiff = today.getMonth() - start.getMonth()
  const dayDiff = today.getDate() - start.getDate()
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) years--
  return years < 0 ? 0 : years
}

const mapItem = (item, type, index) => {
  const designation =
    Array.isArray(item.designation) && item.designation.length > 0
      ? item.designation[0]?.display_name || item.designation[0]?.name || ''
      : typeof item.designation === 'string'
        ? item.designation
        : ''
  const photo = item.profileImage?.filepath || null
  const yearsCompleted =
    type === 'work-anniversary' || type === 'marriage-anniversary'
      ? calculateYears(item.date)
      : 0

  return {
    id: `${type}-${index}-${item.name || index}`,
    name: item.name || 'Employee',
    designation,
    photo,
    date: item.date || null,
    yearsCompleted,
    type,
  }
}

const CelebrationPopupManager = () => {
  const dispatch = useDispatch()
  const offerPopup = useSelector(selectOfferPopupState)
  const profileData = useSelector(selectProfileData)
  const punchInStatus = useSelector(selectPunchInStatus)
  const [celebrationData, setCelebrationData] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const lastHandledPunchInRef = useRef(null)

  const lastPunchInAt = offerPopup?.lastPunchInAt
  const currentUserName = profileData?.user?.name

  const fetchCelebration = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await new BasicProvider('celebration/today', dispatch).getRequest()
      const data = response?.data
      if (data?.hasAny) {
        setCelebrationData(data)
      } else {
        setCelebrationData(null)
      }
    } catch (err) {
      console.error('CelebrationPopupManager: failed to fetch today celebrations', err)
      setCelebrationData(null)
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  useEffect(() => {
    if (!lastPunchInAt) return
    if (lastHandledPunchInRef.current === lastPunchInAt) return
    lastHandledPunchInRef.current = lastPunchInAt
    const timer = setTimeout(fetchCelebration, CELEBRATION_DELAY_MS)
    return () => {
      clearTimeout(timer)
    }
  }, [lastPunchInAt, fetchCelebration])

  useEffect(() => {
    if (!isLoading && celebrationData?.hasAny && punchInStatus?.isPunchedIn) {
      setIsVisible(true)
      setCurrentIndex(0)
    }
  }, [isLoading, celebrationData, punchInStatus?.isPunchedIn])

  // Keep celebration panel active only while staff is punched in.
  useEffect(() => {
    if (punchInStatus?.isPunchedIn) return
    setIsVisible(false)
    setCelebrationData(null)
    setCurrentIndex(0)
  }, [punchInStatus?.isPunchedIn])

  const flatList = useMemo(() => {
    if (!celebrationData) return []
    const items = []
    celebrationData.birthday?.forEach((b, i) =>
      items.push(mapItem(b, 'birthday', i)),
    )
    celebrationData.workAnniversary?.forEach((w, i) =>
      items.push(mapItem(w, 'work-anniversary', i)),
    )
    celebrationData.marriageAnniversary?.forEach((m, i) =>
      items.push(mapItem(m, 'marriage-anniversary', i)),
    )
    return items
  }, [celebrationData])

  // Fire celebration confetti for every popup card (birthday/work/marriage),
  // so all staff see the same festive behavior after punch-in.
  useEffect(() => {
    if (!isVisible || !celebrationData?.hasAny || !flatList.length) return
    fireCelebrationConfetti()
  }, [isVisible, celebrationData, currentIndex, flatList.length])

  const currentCard = flatList[currentIndex] ?? null
  const hasMultiple = flatList.length > 1

  const handleClose = () => {
    const hasNext = hasMultiple && currentIndex < flatList.length - 1
    if (hasNext) {
      setCurrentIndex((i) => i + 1)
    } else {
      // Only loop when there are multiple celebration cards; a single card must close.
      if (
        hasMultiple &&
        punchInStatus?.isPunchedIn &&
        flatList.length > 0
      ) {
        setCurrentIndex(0)
        return
      }
      setIsVisible(false)
      setCelebrationData(null)
    }
  }

  const handlePrev = () => {
    setCurrentIndex((i) => (i - 1 + flatList.length) % flatList.length)
  }

  const handleNext = () => {
    setCurrentIndex((i) => (i + 1) % flatList.length)
  }

  if (!isVisible || !celebrationData?.hasAny) return null

  return (
    <CModal
      visible={true}
      onClose={handleClose}
      alignment="center"
      size="lg"
      backdrop="static"
      className="celebration-popup-modal"
    >
      <div className="celebration-popup-card-only">
        <button
          type="button"
          className="celebration-popup-close-x"
          onClick={handleClose}
          aria-label="Close"
        >
          <CIcon icon={cilX} size="lg" />
        </button>

        {hasMultiple && (
          <button
            type="button"
            className="celebration-popup-nav celebration-popup-prev"
            onClick={handlePrev}
            aria-label="Previous"
          >
            <CIcon icon={cilChevronLeft} size="xl" />
          </button>
        )}

        {currentCard && (
          <CelebrationPopupCard
            key={currentCard.id}
            name={currentCard.name}
            designation={currentCard.designation}
            photo={currentCard.photo}
            type={currentCard.type}
            yearsCompleted={currentCard.yearsCompleted}
            dispatch={dispatch}
          />
        )}

        {hasMultiple && (
          <button
            type="button"
            className="celebration-popup-nav celebration-popup-next"
            onClick={handleNext}
            aria-label="Next"
          >
            <CIcon icon={cilChevronRight} size="xl" />
          </button>
        )}

        {hasMultiple && (
          <div className="celebration-popup-dots">
            {flatList.map((_, idx) => (
              <span
                key={idx}
                className={`celebration-popup-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentIndex(idx)}
                role="button"
                tabIndex={0}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .celebration-popup-modal :global(.modal-dialog) {
          max-width: 420px !important;
          width: auto !important;
          margin: 0.5rem auto !important;
          padding: 0 !important;
        }

        .celebration-popup-modal :global(.modal-content) {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          background-color: transparent !important;
        }

        .celebration-popup-modal :global(.modal-body),
        .celebration-popup-modal :global(.modal-header),
        .celebration-popup-modal :global(.modal-footer),
        .celebration-popup-modal :global([class*="modal-"]) {
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
        }

        .celebration-popup-modal :global(.modal-backdrop) {
          background-color: rgba(0, 0, 0, 0.6) !important;
        }

        .celebration-popup-card-only {
          position: relative;
          display: inline-block;
          margin: 0;
          padding: 0;
          animation: celebrationFadeIn 0.4s ease-out forwards;
        }

        .celebration-popup-close-x {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 10;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.35);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: background 0.2s;
        }

        .celebration-popup-close-x:hover {
          background: rgba(0, 0, 0, 0.5);
        }

        .celebration-popup-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.35);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: background 0.2s;
        }

        .celebration-popup-nav:hover {
          background: rgba(0, 0, 0, 0.5);
        }

        .celebration-popup-prev {
          left: 6px;
        }

        .celebration-popup-next {
          right: 6px;
        }

        .celebration-popup-dots {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: 5px;
        }

        .celebration-popup-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s;
        }

        .celebration-popup-dot:hover,
        .celebration-popup-dot.active {
          background: rgba(255, 255, 255, 0.95);
        }

        .celebration-popup-dot.active {
          width: 16px;
          border-radius: 3px;
        }

        @keyframes celebrationFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </CModal>
  )
}

export default CelebrationPopupManager
