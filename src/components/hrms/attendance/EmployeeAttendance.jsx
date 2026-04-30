// /pages/EmployeeAttendance.jsx
import React, { useState, useEffect } from 'react'
import AttendanceCalendar from './AttendanceCalendar'
import AttendanceTable from './AttendanceTable'
import AttendanceDetailsModal from './AttendanceDetailsModal1'
import BasicProvider from 'src/constants/BasicProvider'
// import AttendanceFilters from "../components/attendance/AttendanceFilters"
// import AttendanceTable from "../components/attendance/AttendanceTable"
// import AttendanceCalendar from "../components/attendance/AttendanceCalendar"
// import AttendanceDetailsModal from "../components/attendance/AttendanceDetailsModal"

const EmployeeAttendance = ({data}) => {
  const [attendanceData, setAttendanceData] = useState(data||[])
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    search: '',
  })
  const [selected, setSelected] = useState(null)

  // 🚀 Fetch attendance of logged-in employee
  useEffect(() => {
// fetchAttendanceData()

}, [])

 const fetchAttendanceData = async () => {
    try {
      const response = await new BasicProvider(
        `attendances/calendar?month=${filters.month}&year=${filters.year}`,
        dispatch,
      ).getRequest()
      // console.log('API response for attendance_________', response)
      setAttendanceData(response.data || [])
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      setAttendanceData([])
    } finally {
    }
  }
   return (
    <div className="h-screen w-screen flex flex-col">
      {/* Full height calendar */}
      <div className="flex-grow">
        <AttendanceCalendar data={attendanceData} onSelect={setSelected} />
      </div>

      {/* Modal overlay on click */}
      {/* {selected && (
        <AttendanceDetailsModal
          visible={!!selected}
          onClose={() => setSelected(null)}
          attendance={selected}
        />
      )} */}
    </div>
  )
}

export default EmployeeAttendance
