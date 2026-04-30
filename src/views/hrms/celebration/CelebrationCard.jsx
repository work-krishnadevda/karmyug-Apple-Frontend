import React, { useState, useEffect } from 'react'
import BasicProvider from 'src/constants/BasicProvider'
import '../../../assets/css/birthday-card.css'

export const CelebrationCard = ({
  name,
  designation,
  photo,
  branch,
  formattedDate,
  date,
  yearsCompleted,
  dispatch,
  type = 'birthday',
  title,
  message,
  disableAnimation = false,
  variant = 'today',
}) => {
  const [imageUrl, setImageUrl] = useState(photo)
  const [loading, setLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const fetchImage = async () => {
      setImageError(false) // Reset error state
      if (!photo) {
        setImageUrl(null)
        setLoading(false)
        return
      }

      if (photo.startsWith('http')) {
        setImageUrl(photo)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await new BasicProvider(
          `cms/files/signed-url?key=${encodeURIComponent(photo)}`,
          dispatch,
        ).getRequest()

        setImageUrl(response?.data?.url || `${process.env.REACT_APP_NODE_URL}/files/${photo}`)
      } catch {
        setImageUrl(null)
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [photo, dispatch])

  const getTitle = () => {
    if (title) return title
    if (type === 'work-anniversary') return '🎉 Happy Work Anniversary 🎉'
    if (type === 'marriage-anniversary') return '💞 Happy Marriage Anniversary 💞'
    return '🎉 Happy Birthday 🎉'
  }

  const getMessage = () => {
    if (message) return message
    if (type === 'work-anniversary')
      return 'Thank you for your dedication and hard work. We truly appreciate you! 🌟'
    if (type === 'marriage-anniversary')
      return 'Celebrating the beautiful journey of love and togetherness! May your bond grow stronger with each passing year. 💕🌹'
    return 'Wishing you a day full of happiness and success! 🎂'
  }

  const getCardClasses = () => {
    const baseClasses = {
      birthday: {
        container: 'birthday-card-3d',
        inner: 'birthday-card-inner',
        front: 'birthday-card-front',
      },
      'work-anniversary': {
        container: 'work-anniversary-card-3d',
        inner: 'work-anniversary-card-inner',
        front: 'work-anniversary-card-front',
      },
      'marriage-anniversary': {
        container: 'marriage-anniversary-card-3d',
        inner: 'marriage-anniversary-card-inner',
        front: 'marriage-anniversary-card-front',
      },
    }
    return baseClasses[type] || baseClasses.birthday
  }

  const cardClasses = getCardClasses()
  const noAnimationClass = disableAnimation ? 'no-animation' : ''

  // If disableAnimation is true, render simplified horizontal card design
  if (disableAnimation) {
    // For birthday type, use template background with overlay content
    // if (type === 'birthday') {
    //   return (
    //     <div className="birthday-template-card">
    //       {/* Circular Image - positioned absolutely */}
    //       <div className="birthday-template-image">
    //         {loading ? (
    //           <div className="loading-spinner-small" />
    //         ) : imageUrl && !imageError ? (
    //           <img 
    //             src={imageUrl} 
    //             alt={name} 
    //             className="birthday-template-photo" 
    //             onError={() => setImageError(true)}
    //           />
    //         ) : (
    //           <div className="birthday-template-placeholder"></div>
    //         )}
    //       </div>
          
    //       {/* Name and Role Banner - below image in blue box */}
    //       <div className="birthday-template-banner">
    //         <div className="birthday-template-name">{name || 'Staff Name'}</div>
    //         <div className="birthday-template-role">{designation || 'Designation'}</div>
    //       </div>
    //     </div>
    //   )
    // }
    if (disableAnimation && type === 'birthday' && variant === 'today') {
  return (
    <div className="birthday-template-card">

      {/* Profile Image */}
      <div className="birthday-template-image">
        {loading ? (
          <div className="loading-spinner-small" />
        ) : imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={name}
            className="birthday-template-photo"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="birthday-template-placeholder"></div>
        )}
      </div>

      {/* Name + Role Banner */}
      <div className="birthday-template-banner">

        <div className="birthday-template-name">
          {name || 'Employee Name'}
        </div>

        <div className="birthday-template-role">
          {designation || 'Role'}
        </div>

      </div>

    </div>
  )
}

    // For work anniversary type, create card from scratch with CSS
    if (disableAnimation && type === 'work-anniversary' && variant === 'today') {
      // Helper function to get ordinal suffix (1st, 2nd, 3rd, 9th, etc.)
      const getOrdinalSuffix = (num) => {
        const j = num % 10
        const k = num % 100
        if (j === 1 && k !== 11) return num + 'st'
        if (j === 2 && k !== 12) return num + 'nd'
        if (j === 3 && k !== 13) return num + 'rd'
        return num + 'th'
      }

      // Calculate joining year from date
      const getJoiningYear = () => {
        if (!date) return new Date().getFullYear()
        const joinDate = new Date(date)
        return joinDate.getFullYear()
      }

      const joiningYear = getJoiningYear()
      const currentYear = new Date().getFullYear()
      const yearRange = `(${joiningYear} to ${currentYear})`
      const anniversaryText = yearsCompleted > 0 
        ? `${getOrdinalSuffix(yearsCompleted)} HAPPY WORK ANNIVERSARY`
        : 'HAPPY WORK ANNIVERSARY'

      return (
        <div className="work-anniversary-card-scratch">
          {/* Confetti particles */}
          <div className="confetti-container">
            {[...Array(30)].map((_, i) => (
              <div key={i} className={`confetti confetti-${i + 1}`}></div>
            ))}
          </div>

          {/* Golden ribbons */}
          <div className="ribbon ribbon-1"></div>
          <div className="ribbon ribbon-2"></div>
          <div className="ribbon ribbon-3"></div>

          {/* Golden trophy graphic on left */}
          <div className="trophy-graphic"></div>

          {/* Profile Image - positioned on right side */}
          <div className="work-anniversary-image">
            {loading ? (
              <div className="loading-spinner-small" />
            ) : imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={name}
                className="work-anniversary-photo"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="work-anniversary-placeholder"></div>
            )}
          </div>

          {/* Name - script font at top center */}
          <div className="work-anniversary-name">
            {name || 'Employee Name'}
          </div>

          {/* Years Range - below name */}
          <div className="work-anniversary-years">
            {yearRange}
          </div>

          {/* Anniversary Number - below years */}
          {yearsCompleted > 0 && (
            <div className="work-anniversary-number">
              {getOrdinalSuffix(yearsCompleted)} Anniversary
            </div>
          )}

          {/* Anniversary Text - large bold */}
          <div className="work-anniversary-anniversary">
            HAPPY WORK
          </div>
           <div className="work-anniversary-anniversary-1">
              ANNIVERSARY
          </div>

          {/* Thank You Message */}
          <div className="work-anniversary-message">
            THANK YOU FOR GROWING WITH US!
          </div>

          {/* Bright Wishes From */}
          <div className="work-anniversary-wishes">
            Bright Wishes From:
          </div>

          {/* Company Name */}
          <div className="work-anniversary-company">
            Real Apple Group
          </div>
        </div>
      )
    }

    // For marriage anniversary type, create card from scratch with CSS
    if (disableAnimation && type === 'marriage-anniversary' && variant === 'today') {
      // Helper function to get ordinal suffix (1st, 2nd, 3rd, 8th, etc.)
      const getOrdinalSuffix = (num) => {
        const j = num % 10
        const k = num % 100
        if (j === 1 && k !== 11) return num + 'st'
        if (j === 2 && k !== 12) return num + 'nd'
        if (j === 3 && k !== 13) return num + 'rd'
        return num + 'th'
      }

      // Calculate years completed from date
      const getYearsCompleted = () => {
        if (!date) return 0
        const anniversaryDate = new Date(date)
        const today = new Date()
        let years = today.getFullYear() - anniversaryDate.getFullYear()
        const monthDiff = today.getMonth() - anniversaryDate.getMonth()
        const dayDiff = today.getDate() - anniversaryDate.getDate()
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          years--
        }
        return years < 0 ? 0 : years
      }

      // Extract surname from full name (e.g., "Manish Kumar Patidar" -> "Patidar")
      const getSurname = (fullName) => {
        if (!fullName) return ''
        const nameParts = fullName.trim().split(/\s+/)
        return nameParts.length > 0 ? nameParts[nameParts.length - 1] : fullName
      }

      const yearsCompleted = getYearsCompleted()
      const surname = getSurname(name)
      const anniversaryNumber = yearsCompleted > 0 ? getOrdinalSuffix(yearsCompleted) : ''

      return (
        <div className="marriage-anniversary-card-scratch">
          {/* Bokeh lights background effect */}
          <div className="bokeh-container">
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`bokeh bokeh-${i + 1}`}></div>
            ))}
          </div>

          {/* Swirling lines */}
          <div className="swirl swirl-1"></div>
          <div className="swirl swirl-2"></div>
          <div className="swirl swirl-3"></div>

          {/* Red heart graphic - lower left */}
          <div className="marriage-heart-graphic"></div>

          {/* Profile Image - upper left */}
          <div className="marriage-anniversary-image">
            {loading ? (
              <div className="loading-spinner-small" />
            ) : imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={name}
                className="marriage-anniversary-photo"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="marriage-anniversary-placeholder"></div>
            )}
          </div>

          {/* Anniversary Number with Happy - upper right */}
          <div className="marriage-anniversary-title-container">
            {anniversaryNumber && (
              <span className="marriage-anniversary-number">
                {anniversaryNumber}{' '}
              </span>
            )}
            <span className="marriage-anniversary-happy">Happy</span>
            <div className="marriage-anniversary-word">Anniversary</div>
          </div>

          {/* Congratulations - center left */}
          <div className="marriage-anniversary-congrats">
            Congratulations!
          </div>

          {/* Mr & Mrs Surname - center right */}
          <div className="marriage-anniversary-couple">
            Mr & Mrs {surname || 'Family'}
          </div>

          {/* From - bottom left */}
          <div className="marriage-anniversary-from">
            From:
          </div>

          {/* Company Name - bottom */}
          <div className="marriage-anniversary-company">
            <span className="real-apple-text">Real Apple</span>{' '}
            <span className="group-text">Group</span>
          </div>
        </div>
      )
    }

    // For upcoming cards (variant === 'upcoming'), use golden yellow horizontal design for ALL types
    if (variant === 'upcoming') {
      return (
        <div className="upcoming-birthday-card">
          <div className="upcoming-card-image-wrapper">
            {loading ? (
              <div className="loading-spinner-small" />
            ) : imageUrl && !imageError ? (
              <img 
                src={imageUrl} 
                alt={name} 
                className="upcoming-card-image" 
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="upcoming-card-placeholder">
                <svg 
                  width="50" 
                  height="50" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
                    fill="currentColor"
                  />
                  <path 
                    d="M12.0002 14.5C7.58172 14.5 4 15.8423 4 17.5C4 19.1577 7.58172 20.5 12.0002 20.5C16.4187 20.5 20.0004 19.1577 20.0004 17.5C20.0004 15.8423 16.4187 14.5 12.0002 14.5Z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="upcoming-card-content">
            <h3 className="upcoming-card-name">{name || 'Staff Name'}</h3>
            <p className="upcoming-card-designation">{designation || 'Designation'}</p>
            <p className="upcoming-card-date">
              {date
                ? new Date(date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : type === 'work-anniversary'
                ? 'Date of Joining'
                : type === 'marriage-anniversary'
                ? 'Marriage Anniversary'
                : 'Date of Birth'}
            </p>
          </div>
        </div>
      )
    }

    // For other cases, return null or fallback
    return null
  }

  return (
    <div className={`${cardClasses.container} ${noAnimationClass}`}>
      <div className={`${cardClasses.inner} ${noAnimationClass}`}>
        <div className={`${cardClasses.front} ${noAnimationClass}`}>
          <div className="birthday-card-content">
            <div className="birthday-image-wrapper">
              {loading ? (
                <div className="loading-spinner" />
              ) : (
                <img src={imageUrl} alt={name} className="birthday-image" />
              )}
            </div>

            <h2 className="birthday-title">{getTitle()}</h2>
            <h3 className="birthday-name">{name}</h3>

            {designation && <p className="birthday-designation">{designation}</p>}

            {branch && <p className="birthday-branch">📍 {branch}</p>}

            {type === 'work-anniversary' && yearsCompleted > 0 && (
              <div className="birthday-date">
                🏆 {yearsCompleted} Year
                {yearsCompleted > 1 ? 's' : ''} with Real Apple
              </div>
            )}

            {/* {formattedDate && (
              <div className="birthday-date">
                📅 Joined on {formattedDate}
              </div>
            )} */}
            {date && (
              <div className="birthday-date">
                📅{' '}
                {type === 'work-anniversary'
                  ? 'Joined on'
                  : type === 'marriage-anniversary'
                  ? 'Anniversary on'
                  : 'Birthday on'}{' '}
                {new Date(date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            )}

            <p className="birthday-message">{getMessage()}</p>

            <h2 className="birthday-name"> Real Apple Group</h2>
          </div>
        </div>
      </div>
    </div>
  )
}
 
