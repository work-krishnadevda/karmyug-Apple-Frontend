// /components/attendance/AttendanceTable.jsx
import React from "react"
import StatusBadge from "./StatusBadge"

const AttendanceTable = ({ data, filters, onSelect }) => {
  const filtered = data.filter((item) => {
    if (filters.status && item.status.toLowerCase() !== filters.status) return false
    if (filters.startDate && new Date(item.date) < new Date(filters.startDate)) return false
    if (filters.endDate && new Date(item.date) > new Date(filters.endDate)) return false
    return true
  })

  return (
    <div className="overflow-x-auto border rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Check In</th>
            <th className="px-3 py-2">Check Out</th>
            <th className="px-3 py-2">Draft Done</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => {
            // Get draft done from sessions
            const lastSession = item.sessions?.[item.sessions?.length - 1]
            const draftDone = lastSession?.today_draft_done
            return (
              <tr
                key={item._id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect(item)}
              >
                <td className="px-3 py-2">{item.date}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-3 py-2">{item.punch_in || "--"}</td>
                <td className="px-3 py-2">{item.punch_out || "--"}</td>
                <td className="px-3 py-2">
                  {draftDone !== null && draftDone !== undefined ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      {draftDone}
                    </span>
                  ) : (
                    "--"
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default AttendanceTable
