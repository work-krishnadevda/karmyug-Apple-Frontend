import { useEffect, useState } from 'react'
import axios from 'axios'
import BasicProvider from 'src/constants/BasicProvider'

export const useAttendance = (month, year) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  console.log(month, year)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true)
        const response = await new BasicProvider(
          `attendances/calendar?month=${month}&year=${year}`,
          dispatch,
        ).getRequest()
        console.log(data, 'hjfjsdhfjds')

        // console.log('API response for attendance_________', response)
        setData(response.data.data || [])
        // const res = await axios.get(
        //   `http://localhost:3007/api/attendances/calendar?month=${month}&year=${year}`,
        // )
        // setData(res.data.data || [])
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [month, year])

  return { data, loading, error }
}
