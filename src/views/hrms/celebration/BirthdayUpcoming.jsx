import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { CelebrationCard } from './CelebrationCard'
import BasicProvider from 'src/constants/BasicProvider'
import { toast } from 'react-toastify'
import moment from 'moment'
import 'src/assets/css/upcoming-birthday-card.css'

 

const BirthdayUpcoming = () => {
  const dispatch = useDispatch()
  const [birthdayData, setBirthdayData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch upcoming birthday data from API
  const fetchBirthdayData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await new BasicProvider(
        'celebration/birthday/upcoming',
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
            
            // If date has 3 parts (YYYY-MM-DD), extract month and day for birthday
            if (dateParts.length === 3) {
              // For birthdays, we only care about month and day, not the birth year
              const month = parseInt(dateParts[1], 10)
              const day = parseInt(dateParts[2], 10)
              const currentYear = moment().year()
              
              celebrationDate = moment({ year: currentYear, month: month - 1, day: day })
              
              // If birthday has passed this year, use next year
              if (celebrationDate.isBefore(today)) {
                celebrationDate.year(currentYear + 1)
              }
            } else if (dateParts.length === 2) {
              // Format: MM-DD
              celebrationDate = moment(item.date, 'MM-DD')
              const currentYear = moment().year()
              celebrationDate.year(currentYear)
              
              // If birthday has passed this year, use next year
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
        
        setBirthdayData(mappedData)
      } else {
        setBirthdayData([])
      }
    } catch (err) {
      console.error('Error fetching upcoming birthday data:', err)
      setError(err?.response?.data?.message || 'Failed to fetch upcoming birthday data')
      setBirthdayData([])
      toast.error('Failed to load upcoming birthday data')
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
          <p className="text-slate-600">Loading upcoming birthdays...</p>
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
          <p className="text-slate-600 text-lg">📅 No upcoming birthdays!</p>
          <p className="text-slate-500 mt-2">Check back later for upcoming celebrations.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-black mb-2">
          Upcoming Birthday
        </h2>
      </div>
      
      <div className="upcoming-birthday-grid">
        {birthdayData.map((item) => (
          <CelebrationCard 
            key={item.id || item._id}
            {...item}
            type="birthday"
            dispatch={dispatch}
            disableAnimation={true}
            variant="upcoming"
          />
        ))}
      </div>
    </div>
  )
}

export default BirthdayUpcoming
