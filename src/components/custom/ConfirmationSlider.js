import React, { useState, useRef, useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning } from '@coreui/icons'

const ConfirmationSlider = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Are you sure want to inactive this employee?',
}) => {
  const [sliderProgress, setSliderProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const sliderRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!visible) {
      // Reset when modal closes
      setSliderProgress(0)
      setIsDragging(false)
      setIsConfirmed(false)
    }
  }, [visible])

  const handleMouseDown = (e) => {
    if (isConfirmed) return
    setIsDragging(true)
    updateSlider(e)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || isConfirmed) return
    updateSlider(e)
  }

  const handleMouseUp = () => {
    if (isConfirmed) {
      onConfirm()
      return
    }
    setIsDragging(false)
    // Reset if not fully filled
    if (sliderProgress < 100) {
      setSliderProgress(0)
    }
  }

  const handleTouchStart = (e) => {
    if (isConfirmed) return
    setIsDragging(true)
    updateSlider(e.touches[0])
  }

  const handleTouchMove = (e) => {
    if (!isDragging || isConfirmed) return
    e.preventDefault()
    updateSlider(e.touches[0])
  }

  const handleTouchEnd = () => {
    handleMouseUp()
  }

  const updateSlider = (e) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const progress = Math.max(0, Math.min(100, (x / width) * 100))

    setSliderProgress(progress)

    if (progress >= 100) {
      setIsConfirmed(true)
    }
  }

  // Add global event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, sliderProgress])

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      alignment="center"
      backdrop="static"
      className="confirmation-slider-modal"
    >
      <CModalHeader>
        <CModalTitle className="d-flex align-items-center gap-2">
          <CIcon icon={cilWarning} className="text-danger" />
          {title || 'Confirmation Required'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        <CAlert color="danger" className="mb-4">
          <strong className="d-block mb-2"> Warning</strong>
          {message || (
            <>
              <p className="mb-2">Are you sure you want to set this employee as inactive?</p>
              <p className="mb-0 small">Please confirm that the following are clear:</p>
              <ul className="mb-0 mt-2 small">
                <li>Add-On & Penalties Effects</li>
                <li>Attendance & Weeks Status </li>
                <li>Salary, Advance & Adjustments</li>
                <li>Assets & Other Pendings</li>
              </ul>
            </>
          )}
        </CAlert>

        <div className="mb-3">
          {!isConfirmed && (
            <p className="text-center mb-3 fw-semibold">
              <span className="text-muted">Hold and drag to confirm</span>
            </p>
          )}

          <div
            ref={containerRef}
            className="slider-container"
            style={{
              position: 'relative',
              width: '100%',
              height: '50px',
              backgroundColor: '#e9ecef',
              borderRadius: '25px',
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'grab',
              border: '2px solid #dee2e6',
              userSelect: 'none',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Progress Fill */}
            <div
              className="slider-fill"
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${sliderProgress}%`,
                backgroundColor: isConfirmed ? '#28a745' : '#dc3545',
                transition: isDragging ? 'none' : 'width 0.2s ease',
                borderRadius: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: '15px',
                paddingRight: '15px',
                overflow: 'hidden',
              }}
            >
              {/* White text that appears as slider fills - centered */}
              {sliderProgress > 15 && (
                <span
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: sliderProgress > 50 ? '13px' : '12px',
                    textAlign: 'left',
                    flex: 1,
                    opacity: sliderProgress > 25 ? 1 : (sliderProgress - 15) / 10,
                    transition: isDragging ? 'none' : 'opacity 0.2s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: sliderProgress > 70 ? 'calc(100% - 50px)' : '100%',
                  }}
                >
                  {confirmText}
                </span>
              )}
              {/* Percentage count on the right side */}
              {sliderProgress > 25 && (
                <span
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginLeft: '10px',
                    flexShrink: 0,
                  }}
                >
                  {Math.round(sliderProgress)}%
                </span>
              )}
            </div>

            {/* Slider Handle */}
            <div
              ref={sliderRef}
              className="slider-handle"
              style={{
                position: 'absolute',
                left: `${sliderProgress}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '46px',
                height: '46px',
                backgroundColor: isConfirmed ? '#28a745' : '#dc3545',
                borderRadius: '50%',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: isDragging ? 'none' : 'left 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                zIndex: 10,
              }}
            >
              {isConfirmed ? '✓' : '→'}
            </div>

            {/* Text Overlay */}
            {sliderProgress < 20 && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#6c757d',
                  fontWeight: '600',
                  fontSize: '14px',
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              >
                Slide to Confirm
              </div>
            )}
          </div>

          {isConfirmed && (
            <div className="text-center mt-3">
              <p className="text-success fw-bold mb-0">✓ Confirmation Complete</p>
            </div>
          )}
        </div>
      </CModalBody>

      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancel
        </CButton>
        <CButton
          color="danger"
          onClick={onConfirm}
          disabled={!isConfirmed}
          style={{
            opacity: isConfirmed ? 1 : 0.5,
            cursor: isConfirmed ? 'pointer' : 'not-allowed',
          }}
        >
          {isConfirmed ? 'Yes, Set as Inactive' : 'Complete Slider First'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ConfirmationSlider
