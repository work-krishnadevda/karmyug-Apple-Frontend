import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { CelebrationCard } from './CelebrationCard'
import BasicProvider from 'src/constants/BasicProvider'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'
import { toast } from 'react-toastify'
import 'src/assets/css/upcoming-birthday-card.css'

// 🔹 Years calculation function
const calculateYears = (joiningDate) => {
  if (!joiningDate) return 0

  const start = new Date(joiningDate)
  const today = new Date()

  let years = today.getFullYear() - start.getFullYear()

  const monthDiff = today.getMonth() - start.getMonth()
  const dayDiff = today.getDate() - start.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years--
  }

  return years < 0 ? 0 : years
}

const WorkAnniversaryToday = () => {
  const dispatch = useDispatch()
  const [anniversaryData, setAnniversaryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnniversaryData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await new BasicProvider(
        'celebration/work-anniversary/today',
        dispatch,
      ).getRequest()

      if (response?.data?.today && Array.isArray(response.data.today)) {
        const mappedData = response.data.today.map((item, index) => {
          const yearsCompleted = calculateYears(item.date)

          return {
            id: index,
            name: item.name || '',
            designation: 
              Array.isArray(item.designation) && item.designation.length > 0
                ? item.designation[0]?.display_name || item.designation[0]?.name || ''
                : (typeof item.designation === 'string' ? item.designation : ''),
            branch:
              typeof item.ra_location === 'object'
                ? item.ra_location?.label || ''
                : item.ra_location || '',
            joiningDate: item.date || '',
            date: item.date || '',
            yearsCompleted,
            photo: item.profileImage?.filepath || null,
            profileImage: item.profileImage || null,
          }
        })

        setAnniversaryData(mappedData)
      } else {
        setAnniversaryData([])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to fetch work anniversary data')
      toast.error('Failed to load work anniversary data')
      setAnniversaryData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnniversaryData()
  }, [])

  if (loading) {
    return (
      <div className="p-4">
        <AppContentSkeleton variant="cards" cards={3} ariaLabel="Loading work anniversaries" />
      </div>
    )
  }

  if (!anniversaryData.length) {
    return (
      <div className="p-4 text-center bg-slate-50 rounded-lg">🎉 No work anniversaries today!</div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold text-center mb-6">🎊 Today’s Work Anniversaries 🎊</h2>

      <div className="upcoming-birthday-grid">
        {anniversaryData.map((item) => (
          <CelebrationCard 
            key={item.id} 
            {...item} 
            type="work-anniversary" 
            dispatch={dispatch}
            disableAnimation={true}
          />
        ))}
      </div>
    </div>
  )
}

export default WorkAnniversaryToday
