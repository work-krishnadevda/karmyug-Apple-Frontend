import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { CelebrationCard } from './CelebrationCard'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import moment from 'moment'

 

const MarriageAnniversaryUpcoming = () => {
  const dispatch = useDispatch()
  const [anniversaryData, setAnniversaryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch upcoming marriage anniversary data from API
  const fetchAnniversaryData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await new BasicProvider(
        'celebration/marriage-anniversary/upcoming',
        dispatch
      ).getRequest()

      // Handle API response structure: { status: "success", upcoming: [...] }
      if (response?.data?.upcoming && Array.isArray(response.data.upcoming)) {
        const today = moment().startOf('day')
        const sevenDaysLater = moment().add(7, 'days').endOf('day')
        
        const mappedData = response.data.upcoming
          .map((item, index) => ({
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
          .filter((item) => {
            if (!item.date) return false
            
            // Parse the date - handle different formats
            let celebrationDate
            const dateParts = item.date.split('-')
            
            // If date has 3 parts (YYYY-MM-DD), extract month and day for anniversary
            if (dateParts.length === 3) {
              // For anniversaries, we only care about month and day, not the original year
              const month = parseInt(dateParts[1], 10)
              const day = parseInt(dateParts[2], 10)
              const currentYear = moment().year()
              
              celebrationDate = moment({ year: currentYear, month: month - 1, day: day })
              
              // If anniversary has passed this year, use next year
              if (celebrationDate.isBefore(today)) {
                celebrationDate.year(currentYear + 1)
              }
            } else if (dateParts.length === 2) {
              // Format: MM-DD
              celebrationDate = moment(item.date, 'MM-DD')
              const currentYear = moment().year()
              celebrationDate.year(currentYear)
              
              // If anniversary has passed this year, use next year
              if (celebrationDate.isBefore(today)) {
                celebrationDate.year(currentYear + 1)
              }
            } else {
              // Try to parse as-is
              celebrationDate = moment(item.date)
              if (!celebrationDate.isValid()) return false
            }
            
            // Check if celebration is within next 7 days
            return celebrationDate.isSameOrAfter(today) && celebrationDate.isSameOrBefore(sevenDaysLater)
          })
        
        setAnniversaryData(mappedData)
      } else {
        setAnniversaryData([])
      }
    } catch (err) {
      console.error('Error fetching upcoming marriage anniversary data:', err)
      setError(err?.response?.data?.message || 'Failed to fetch upcoming marriage anniversary data')
      setAnniversaryData([])
      toast.error('Failed to load upcoming marriage anniversary data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnniversaryData()
  }, [])

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-slate-600">Loading upcoming marriage anniversaries...</p>
        </div>
      </div>
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
          <p className="text-slate-600 text-lg">💐 No upcoming marriage anniversaries!</p>
          <p className="text-slate-500 mt-2">Check back later for upcoming celebrations.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          🌹 Upcoming Marriage Anniversaries 🌹
        </h2>
        <p className="text-slate-600">
          Get ready to celebrate love and togetherness!
        </p>
      </div>
      
      <div className="celebration-cards-container px-4">
        {anniversaryData.map((item) => (
          <CelebrationCard 
            key={item.id || item._id}
            {...item}
            type="marriage-anniversary"
            dispatch={dispatch}
            disableAnimation={true}
            variant="upcoming"
          />
        ))}
      </div>
    </div>
  )
}

export default MarriageAnniversaryUpcoming
