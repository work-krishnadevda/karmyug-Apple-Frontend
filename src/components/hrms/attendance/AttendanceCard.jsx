import React from "react";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";
import StatusBadge from "./StatusBadge";

const AttendanceCard = ({ record, onClick }) => {
  return (
    <CCard className="mb-3" onClick={() => onClick(record)} style={{ cursor: "pointer" }}>
      <CCardHeader>
        {record.date} <StatusBadge status={record.status} />
      </CCardHeader>
      <CCardBody>
        {record.workingHours && <p><strong>Working Hours:</strong> {record.workingHours}</p>}
        {record.logs && record.logs.length > 0 && (
          <p><strong>Logs:</strong> {record.logs.length} entries</p>
        )}
      </CCardBody>
    </CCard>
  );
};

export default AttendanceCard;
