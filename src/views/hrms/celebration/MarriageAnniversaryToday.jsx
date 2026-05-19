import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { CelebrationCard } from './CelebrationCard'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'
import 'src/assets/css/upcoming-birthday-card.css'

 

const MarriageAnniversaryToday = () => {
  const dispatch = useDispatch()
  const [anniversaryData, setAnniversaryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch marriage anniversary data from API
  const fetchAnniversaryData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await new BasicProvider(
        'celebration/marriage-anniversary/today',
        dispatch
      ).getRequest()

      // Handle API response structure: { status: "success", today: [...] }
      if (response?.data?.today && Array.isArray(response.data.today)) {
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
        setAnniversaryData(mappedData)
      } else {
        setAnniversaryData([])
      }
    } catch (err) {
      console.error('Error fetching marriage anniversary data:', err)
      setError(err?.response?.data?.message || 'Failed to fetch marriage anniversary data')
      setAnniversaryData([])
      toast.error('Failed to load marriage anniversary data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnniversaryData()
  }, [])

  if (loading) {
    return (
      <AppContentSkeleton
        variant="cards"
        cards={3}
        ariaLabel="Loading marriage anniversaries"
      />
    )
  }

  if (error && anniversaryData.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAnniversaryData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (anniversaryData.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600 text-lg">💞 No marriage anniversaries today!</p>
          <p className="text-slate-500 mt-2">Check back tomorrow for more celebrations.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          💐 Today's Marriage Anniversaries 💐
        </h2>
        <p className="text-slate-600">
          Celebrating love and togetherness!
        </p>
      </div>
      
      <div className="upcoming-birthday-grid">
        {anniversaryData.map((item) => (
          <CelebrationCard 
            key={item.id || item._id}
            {...item}
            type="marriage-anniversary"
            dispatch={dispatch}
            disableAnimation={true}
          />
        ))}
      </div>
    </div>
  )
}

export default MarriageAnniversaryToday
