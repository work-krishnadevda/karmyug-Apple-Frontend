import React, { useState, useEffect } from 'react'
import BasicProvider from 'src/constants/BasicProvider'
import 'src/assets/css/celebration-popup-card.css'

const getTitle = (type) => {
  if (type === 'birthday') return 'HAPPY BIRTHDAY'
  if (type === 'work-anniversary') return 'Happy Work Anniversary'
  if (type === 'marriage-anniversary') return 'Happy married anniversary'
  return 'Celebration'
}

const getMessage = (type) => {
  if (type === 'birthday')
    return 'Wishing you a bright and joyful day filled with happiness, laughter, and memorable moments today.'
  if (type === 'work-anniversary')
    return 'Thank you for your dedication and hard work. We truly appreciate you!'
  if (type === 'marriage-anniversary')
    return 'Wishing you joy and happiness today'
  return 'Congratulations!'
}

export const CelebrationPopupCard = ({
  name,
  designation,
  photo,
  type = 'birthday',
  yearsCompleted,
  dispatch,
}) => {
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (!photo) {
      setImageUrl(null)
      return
    }
    if (photo.startsWith('http')) {
      setImageUrl(photo)
      return
    }
    const fetchUrl = async () => {
      setLoading(true)
      setImageError(false)
      try {
        const response = await new BasicProvider(
          `cms/files/signed-url?key=${encodeURIComponent(photo)}`,
          dispatch,
        ).getRequest()
        setImageUrl(response?.data?.url || null)
      } catch {
        setImageError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchUrl()
  }, [photo, dispatch])

  const typeClass =
    type === 'work-anniversary'
      ? 'work'
      : type === 'marriage-anniversary'
        ? 'marriage'
        : 'birthday'
  const cardClass = `celebration-popup-card celebration-popup-${typeClass}`

  const renderContent = () => (
    <div className={cardClass}>
      {/* Falling party popups/confetti from top (snowfall style) */}
      {[
        [6, 0, 4.8], [12, 0.9, 5.6], [18, 0.3, 4.4], [24, 1.5, 5.1], [31, 0.6, 4.9],
        [38, 1.2, 5.8], [45, 0.2, 4.7], [52, 1.8, 5.3], [59, 0.7, 4.6], [66, 1.1, 5.9],
        [73, 0.4, 4.5], [80, 1.4, 5.2], [87, 0.8, 5.5], [94, 1.7, 4.8],
      ].map(([left, delay, duration], i) => (
        <div
          key={i}
          className="celebration-popup-confetti"
          style={{
            left: `${left}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      ))}

      {/* Marriage: floral corners */}
      {type === 'marriage-anniversary' && (
        <>
          <div className="celebration-popup-floral celebration-popup-floral-1" />
          <div className="celebration-popup-floral celebration-popup-floral-2" />
          <div className="celebration-popup-floral celebration-popup-floral-3" />
          <div className="celebration-popup-floral celebration-popup-floral-4" />
        </>
      )}

      {/* Birthday: bunting */}
      {type === 'birthday' && (
        <div className="celebration-popup-bunting">
          {[...Array(9)].map((_, i) => (
            <span key={i} />
          ))}
        </div>
      )}

      {/* Birthday: balloons with animation */}
      {type === 'birthday' && (
        <div className="celebration-popup-balloons" aria-hidden="true">
          {[
            { left: '2%', top: '35%', color: 'balloon-purple', delay: 0 },
            { left: '88%', top: '28%', color: 'balloon-lavender', delay: 0.4 },
            { left: '5%', top: '68%', color: 'balloon-pink', delay: 0.8 },
            { left: '90%', top: '62%', color: 'balloon-purple', delay: 0.2 },
            { left: '0%', top: '50%', color: 'balloon-lavender', delay: 0.6 },
            { left: '92%', top: '48%', color: 'balloon-pink', delay: 0.3 },
          ].map((b, i) => (
            <div
              key={i}
              className={`celebration-balloon celebration-balloon-${b.color}`}
              style={{
                left: b.left,
                top: b.top,
                animationDelay: `${b.delay}s`,
              }}
            >
              <span className="celebration-balloon-knot" />
            </div>
          ))}
        </div>
      )}

      <div className="celebration-popup-card-title">{getTitle(type)}</div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="celebration-popup-card-photo-wrap">
          {loading ? (
            <div
              className="celebration-popup-card-placeholder"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div className="celebration-popup-loading" />
            </div>
          ) : imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={name}
              className="celebration-popup-card-photo"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="celebration-popup-card-placeholder">👤</div>
          )}
        </div>

        {type === 'work-anniversary' ? (
          <div className="celebration-popup-card-badge">
            <span className="celebration-popup-card-name">{name || 'Employee'}</span>
            <span className="celebration-popup-card-designation">
              {designation || 'Team Member'}
            </span>
          </div>
        ) : (
          <>
            <span className="celebration-popup-card-name">{name || 'Employee'}</span>
            <span className="celebration-popup-card-designation">
              {designation || 'Team Member'}
            </span>
          </>
        )}
      </div>

      {type === 'work-anniversary' && (
        <>
          <div className="celebration-popup-card-congrats">CONGRATULATIONS</div>
          <div className="celebration-popup-card-message">
            Hard Work and Dedication
          </div>
        </>
      )}

      {type !== 'work-anniversary' && (
        <div className="celebration-popup-card-message">{getMessage(type)}</div>
      )}

      {type === 'work-anniversary' && yearsCompleted > 0 && (
        <div
          style={{
            textAlign: 'center',
            color: '#f5c842',
            fontSize: '0.9rem',
            marginTop: '0.5rem',
          }}
        >
          {yearsCompleted}
          {yearsCompleted === 1 ? 'st' : yearsCompleted === 2 ? 'nd' : yearsCompleted === 3 ? 'rd' : 'th'}{' '}
          Anniversary
        </div>
      )}

      {type === 'marriage-anniversary' && yearsCompleted > 0 && (
        <div
          style={{
            textAlign: 'center',
            color: '#7c4a5a',
            fontSize: '0.95rem',
            marginTop: '0.5rem',
          }}
        >
          {yearsCompleted} wonderful years together
        </div>
      )}
    </div>
  )

  return renderContent()
}
