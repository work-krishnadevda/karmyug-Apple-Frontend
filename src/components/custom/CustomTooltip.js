import React, { useState } from 'react'

function CustomTooltip({ content, children, placement = 'top' }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleMouseEnter = () => {
    setShowTooltip(true)
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  const isBottom = placement === 'bottom'

  const tooltipBoxStyle = {
    whiteSpace: 'nowrap',
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '5px 15px',
    borderRadius: '4px',
    left: '50%',
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
    fontSize: '12px',
    zIndex: 9999,
    ...(isBottom
      ? { top: '100%', marginTop: '6px' }
      : { top: '-75%' }),
  }

  const arrowStyle = isBottom
    ? {
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderBottom: '6px solid rgba(0, 0, 0, 0.7)',
        borderTop: '6px solid transparent',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
      }
    : {
        position: 'absolute',
        top: '100%',
        left: '40%',
        marginLeft: '0',
        width: 0,
        height: 0,
        borderTop: '6px solid rgba(0, 0, 0, 0.7)',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
      }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}
      {showTooltip && (
        <div style={tooltipBoxStyle}>
          <div style={arrowStyle} />
          {content}
        </div>
      )}
    </div>
  )
}

export default CustomTooltip
