import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { CelebrationCard } from './CelebrationCard'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import 'src/assets/css/upcoming-birthday-card.css'
 

const BirthdayToday = () => {
  const dispatch = useDispatch()
  const [birthdayData, setBirthdayData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch birthday data from API
  const fetchBirthdayData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await new BasicProvider(
        'celebration/birthday/today',
        dispatch
      ).getRequest()

      // Handle API response structure: { status: "success", today: [...] }
      if (response?.data?.today && Array.isArray(response.data.today)) {
        // Map API response to component format
        const mappedData = response.data.today.map((item, index) => ({
          id: item._id || index,
          name: item.name || '',
          designation: 
            Array.isArray(item.designation) && item.designation.length > 0
              ? item.designation[0]?.display_name || item.designation[0]?.name || ''
              : (typeof item.designation === 'string' ? item.designation : ''),
          branch:
            typeof item.ra_location === 'object'
              ? item.ra_location?.label || ''
              : item.ra_location || '',
          date: item.date || '',
          photo: item.profileImage?.filepath || null,
          profileImage: item.profileImage || null
        }))
        setBirthdayData(mappedData)
      } else {
        setBirthdayData([])
      }
    } catch (err) {
      console.error('Error fetching birthday data:', err)
      setError(err?.response?.data?.message || 'Failed to fetch birthday data')
      setBirthdayData([])
      toast.error('Failed to load birthday data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBirthdayData()
  }, [])

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-600">Loading birthdays...</p>
        </div>
      </div>
    )
  }

  if (error && birthdayData.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchBirthdayData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (birthdayData.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 text-lg">🎉 No birthdays today!</p>
          <p className="text-slate-500 mt-2">Check back tomorrow for more celebrations.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          🎂 Today's Birthdays 🎂
        </h2>
        <p className="text-slate-600">
          Wishing a wonderful day to our amazing team members!
        </p>
      </div>
      
      <div className="upcoming-birthday-grid">
        {birthdayData.map((item) => (
          <CelebrationCard 
            key={item.id || item._id}
            {...item}
            type="birthday"
            dispatch={dispatch}
            disableAnimation={true}
          />
        ))}
      </div>
    </div>
  )
}

export default BirthdayToday
