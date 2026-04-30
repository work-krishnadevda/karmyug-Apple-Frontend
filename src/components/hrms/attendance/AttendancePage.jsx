import React, { useState, useEffect } from "react";
import axios from "axios";
import AttendanceCard from "./AttendanceCard";
import AttendanceDetailsModal from "./AttendanceDetailsModal";
// import AttendanceFilters from "./AttendanceFilters";
// import AttendancePagination from "./AttendancePagination";

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("http://localhost:3007/api/attendances/calendar?month=9&year=2025");
      setAttendanceData(res.data.data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Attendance Records</h2>
      {/* <AttendanceFilters /> */}
      {attendanceData.map((record) => (
        <AttendanceCard
          key={record.date}
          record={record}
          onClick={(rec) => {
            setSelectedRecord(rec);
            setVisible(true);
          }}
        />
      ))}
      {/* <AttendancePagination /> */}

      <AttendanceDetailsModal
        visible={visible}
        onClose={() => setVisible(false)}
        record={selectedRecord}
      />
    </div>
  );
};

export default AttendancePage;
