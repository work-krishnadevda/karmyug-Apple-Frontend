import React from "react";
import { CModal, CModalBody, CModalHeader, CModalTitle } from "@coreui/react";

const AttendanceDetailsModal = ({ visible, onClose, record }) => {
  if (!record) return null;

  return (
    <CModal visible={visible} onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>Attendance Details - {record.date}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p><strong>Status:</strong> {record.status}</p>
        {record.sessions && record.sessions.length > 0 && (
          <div>
            <h6>Sessions:</h6>
            <ul>
              {record.sessions.map((s) => (
                <li key={s._id}>
                  Punch In: {new Date(s.punch_in).toLocaleTimeString()}{" "}
                  {s.punch_out && ` | Punch Out: ${new Date(s.punch_out).toLocaleTimeString()}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CModalBody>
    </CModal>
  );
};

export default AttendanceDetailsModal;
