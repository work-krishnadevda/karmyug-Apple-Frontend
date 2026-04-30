import React from "react";
import { CBadge } from "@coreui/react";

const statusColors = {
  Present: "success",
  Absent: "danger",
  Leave: "warning",
  Holiday: "info",
  WeeklyOff: "secondary",
  NotMarked: "dark",
};

const StatusBadge = ({ status }) => {
  const color = statusColors[status] || "secondary";
  return <CBadge color={color}>{status}</CBadge>;
};

export default StatusBadge;
