import confetti from 'canvas-confetti'

const CONFETTI_Z_INDEX = 100000

/**
 * Check if the current user is in today's celebration list (birthday, work or marriage anniversary).
 * Matches by name (case-insensitive trim).
 */
export function isCurrentUserCelebratedToday(celebrationData, currentUserName) {
  if (!celebrationData?.hasAny || !currentUserName) return false
  const name = String(currentUserName).trim().toLowerCase()
  if (!name) return false

  const checkList = (list) =>
    Array.isArray(list) && list.some((p) => String(p.name || '').trim().toLowerCase() === name)

  return (
    checkList(celebrationData.birthday) ||
    checkList(celebrationData.workAnniversary) ||
    checkList(celebrationData.marriageAnniversary)
  )
}

/**
 * Fire side cannon confetti for 8 seconds on top of the modal.
 * Creates a canvas in a high z-index layer so confetti appears above backdrop and modal.
 */
export function fireCelebrationConfetti() {
  const duration = 8 * 1000
  const end = Date.now() + duration
  const colors = [
    '#a786ff',
    '#9b7bc5',
    '#fd8bbc',
    '#e8b8dc',
    '#f8deb1',
    '#b8a0d9',
    '#ff6b9d',
    '#c44569',
    '#4ecdc4',
    '#ffe66d',
    '#95e1d3',
    '#f38181',
    '#aa96da',
    '#fcbad3',
    '#a8d8ea',
    '#ff9a8b',
    '#ffffff',
  ]

  const wrapper = document.createElement('div')
  wrapper.setAttribute('aria-hidden', 'true')
  wrapper.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: ${CONFETTI_Z_INDEX};
    pointer-events: none;
  `
  const canvas = document.createElement('canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.cssText = 'display: block; width: 100%; height: 100%;'
  wrapper.appendChild(canvas)
  document.body.appendChild(wrapper)

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resize)

  const myConfetti = confetti.create(canvas, { resize: true })

  const frame = () => {
    if (Date.now() > end) {
      window.removeEventListener('resize', resize)
      setTimeout(() => {
        if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper)
      }, 500)
      return
    }

    myConfetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      startVelocity: 60,
      origin: { x: 0, y: 0.5 },
      colors,
    })
    myConfetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      startVelocity: 60,
      origin: { x: 1, y: 0.5 },
      colors,
    })

    requestAnimationFrame(frame)
  }

  frame()
}
