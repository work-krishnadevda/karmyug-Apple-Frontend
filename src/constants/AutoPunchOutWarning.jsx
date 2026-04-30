import { useEffect, useState } from 'react'
import BasicProvider from 'src/constants/BasicProvider'

const AUTO_PUNCHOUT_MIN = 30
const WARNING_START_MIN = 25

const AutoPunchOutWarning = () => {
  const [showWarning, setShowWarning] = useState(false)
  const [remainingMin, setRemainingMin] = useState(0)

  useEffect(() => {
    let interval

    const checkInactivity = async () => {
      try {
        const api = new BasicProvider('attendance/today')
        const res = await api.getRequest()

        const lastActiveAt =
          res?.data?.last_active_at ||
          res?.data?.sessions?.slice(-1)?.[0]?.last_active_at

        if (!lastActiveAt) return

        const diffMin = Math.floor(
          (Date.now() - new Date(lastActiveAt).getTime()) / 60000
        )

        if (diffMin >= WARNING_START_MIN && diffMin < AUTO_PUNCHOUT_MIN) {
          setShowWarning(true)
          setRemainingMin(AUTO_PUNCHOUT_MIN - diffMin)
        } else {
          setShowWarning(false)
        }
      } catch (err) {
        console.error('Auto punch warning error', err)
      }
    }

    checkInactivity()
    interval = setInterval(checkInactivity, 60000)

    return () => clearInterval(interval)
  }, [])

  if (!showWarning) return null

  return (
    <div className="auto-punch-warning">
      <strong> Inactivity Warning</strong>
      <div>
        Your panel will be <b>auto punched out</b> in{' '}
        <b>{remainingMin} minute(s)</b>.
      </div>
      <small>Please interact to stay active.</small>
    </div>
  )
}

export default AutoPunchOutWarning
