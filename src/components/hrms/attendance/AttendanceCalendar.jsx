// /components/attendance/AttendanceCalendar.jsx
import React from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import StatusBadge from "./StatusBadge"

const AttendanceCalendar = ({ data, onSelect }) => {
  const getStatusForDate = (date) => {
    const record = data.find(
      (item) => new Date(item.date).toDateString() === date.toDateString()
    )
    return record?.status || null
  }

  return (
    <div className="w-full h-full p-4">
      <Calendar
        className="w-full h-full border rounded-lg shadow-md"
        tileContent={({ date }) => {
          const status = getStatusForDate(date)
          return status ? (
            <div className="mt-1 flex justify-center">
              <StatusBadge status={status} />
            </div>
          ) : null
        }}
        onClickDay={(value) => {
          const record = data.find(
            (item) => new Date(item.date).toDateString() === value.toDateString()
          )
          if (record) onSelect(record)
        }}
      />
    </div>
  )
}

export default AttendanceCalendar
