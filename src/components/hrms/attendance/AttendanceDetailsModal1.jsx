// /components/attendance/AttendanceDetailsModal.jsx
import React from "react"
import StatusBadge from "./StatusBadge"

const AttendanceDetailsModal = ({ visible, onClose, attendance }) => {
  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl relative">
        <h3 className="text-lg font-semibold mb-3">Attendance Details</h3>
        <p><strong>Date:</strong> {attendance.date}</p>
        <p><strong>Status:</strong> <StatusBadge status={attendance.status} /></p>
        <p><strong>Check In:</strong> {attendance.punch_in || "--"}</p>
        <p><strong>Check Out:</strong> {attendance.punch_out || "--"}</p>
        <p><strong>Location:</strong> {attendance.location?.address || "N/A"}</p>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default AttendanceDetailsModal
