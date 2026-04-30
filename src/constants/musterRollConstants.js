// Muster Roll Report Constants and Configuration

export const ATTENDANCE_STATUS = {
  PRESENT: 'P',
  ABSENT: 'A',
  LATE: 'L',
  HALF_DAY: 'H',
  OVERTIME: 'O',
  LEAVE: 'LV',
  HOLIDAY: 'HD',
  WEEKEND: 'WE'
}

export const ATTENDANCE_STATUS_LABELS = {
  [ATTENDANCE_STATUS.PRESENT]: 'Present',
  [ATTENDANCE_STATUS.ABSENT]: 'Absent',
  [ATTENDANCE_STATUS.LATE]: 'Late',
  [ATTENDANCE_STATUS.HALF_DAY]: 'Half Day',
  [ATTENDANCE_STATUS.OVERTIME]: 'Overtime',
  [ATTENDANCE_STATUS.LEAVE]: 'Leave',
  [ATTENDANCE_STATUS.HOLIDAY]: 'Holiday',
  [ATTENDANCE_STATUS.WEEKEND]: 'Weekend'
}

export const ATTENDANCE_STATUS_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: 'success',
  [ATTENDANCE_STATUS.ABSENT]: 'danger',
  [ATTENDANCE_STATUS.LATE]: 'warning',
  [ATTENDANCE_STATUS.HALF_DAY]: 'info',
  [ATTENDANCE_STATUS.OVERTIME]: 'primary',
  [ATTENDANCE_STATUS.LEAVE]: 'secondary',
  [ATTENDANCE_STATUS.HOLIDAY]: 'dark',
  [ATTENDANCE_STATUS.WEEKEND]: 'light'
}

export const REPORT_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom'
}

export const REPORT_PERIOD_LABELS = {
  [REPORT_PERIODS.DAILY]: 'Daily',
  [REPORT_PERIODS.WEEKLY]: 'Weekly',
  [REPORT_PERIODS.MONTHLY]: 'Monthly',
  [REPORT_PERIODS.QUARTERLY]: 'Quarterly',
  [REPORT_PERIODS.YEARLY]: 'Yearly',
  [REPORT_PERIODS.CUSTOM]: 'Custom Range'
}

export const DEPARTMENT_FILTERS = [
  { value: 'all', label: 'All Departments' },
  { value: 'it', label: 'IT' },
  { value: 'hr', label: 'HR' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
  { value: 'technical', label: 'Technical' },
  { value: 'management', label: 'Management' }
]

export const EMPLOYEE_STATUS_FILTERS = [
  { value: 'all', label: 'All Employees' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on-leave', label: 'On Leave' }
]

export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv'
}

export const EXPORT_FORMAT_LABELS = {
  [EXPORT_FORMATS.PDF]: 'PDF',
  [EXPORT_FORMATS.EXCEL]: 'Excel',
  [EXPORT_FORMATS.CSV]: 'CSV'
}

export const SUMMARY_METRICS = {
  TOTAL_EMPLOYEES: 'totalEmployees',
  PRESENT_COUNT: 'presentCount',
  ABSENT_COUNT: 'absentCount',
  LATE_COUNT: 'lateCount',
  OVERTIME_COUNT: 'overtimeCount',
  TOTAL_WORKING_HOURS: 'totalWorkingHours',
  ATTENDANCE_GRADE: 'attendanceGrade',
  ATTENDANCE_PERCENTAGE: 'attendancePercentage',
  AVERAGE_HOURS: 'averageHours'
}

export const SUMMARY_METRIC_LABELS = {
  [SUMMARY_METRICS.TOTAL_EMPLOYEES]: 'Total Employees',
  [SUMMARY_METRICS.PRESENT_COUNT]: 'Present Today',
  [SUMMARY_METRICS.ABSENT_COUNT]: 'Absent Today',
  [SUMMARY_METRICS.LATE_COUNT]: 'Late Arrivals',
  [SUMMARY_METRICS.OVERTIME_COUNT]: 'Overtime Hours',
  [SUMMARY_METRICS.TOTAL_WORKING_HOURS]: 'Total Working Hours',
  [SUMMARY_METRICS.ATTENDANCE_GRADE]: 'Attendance Grade',
  [SUMMARY_METRICS.ATTENDANCE_PERCENTAGE]: 'Attendance %',
  [SUMMARY_METRICS.AVERAGE_HOURS]: 'Avg. Working Hours'
}

export const TABLE_COLUMNS = {
  EMPLOYEE_ID: 'employeeId',
  EMPLOYEE_NAME: 'employeeName',
  DEPARTMENT: 'department',
  DESIGNATION: 'designation',
  ATTENDANCE_STATUS: 'attendanceStatus',
  CHECK_IN: 'checkIn',
  CHECK_OUT: 'checkOut',
  WORKING_HOURS: 'workingHours',
  OVERTIME_HOURS: 'overtimeHours',
  REMARKS: 'remarks'
}

export const TABLE_COLUMN_LABELS = {
  [TABLE_COLUMNS.EMPLOYEE_ID]: 'Employee ID',
  [TABLE_COLUMNS.EMPLOYEE_NAME]: 'Employee Name',
  [TABLE_COLUMNS.DEPARTMENT]: 'Department',
  [TABLE_COLUMNS.DESIGNATION]: 'Designation',
  [TABLE_COLUMNS.ATTENDANCE_STATUS]: 'Status',
  [TABLE_COLUMNS.CHECK_IN]: 'Check In',
  [TABLE_COLUMNS.CHECK_OUT]: 'Check Out',
  [TABLE_COLUMNS.WORKING_HOURS]: 'Working Hours',
  [TABLE_COLUMNS.OVERTIME_HOURS]: 'Overtime',
  [TABLE_COLUMNS.REMARKS]: 'Remarks'
}

export const SORT_OPTIONS = {
  EMPLOYEE_NAME: 'employeeName',
  DEPARTMENT: 'department',
  CHECK_IN_TIME: 'checkInTime',
  WORKING_HOURS: 'workingHours',
  ATTENDANCE_STATUS: 'attendanceStatus'
}

export const SORT_OPTION_LABELS = {
  [SORT_OPTIONS.EMPLOYEE_NAME]: 'Employee Name',
  [SORT_OPTIONS.DEPARTMENT]: 'Department',
  [SORT_OPTIONS.CHECK_IN_TIME]: 'Check In Time',
  [SORT_OPTIONS.WORKING_HOURS]: 'Working Hours',
  [SORT_OPTIONS.ATTENDANCE_STATUS]: 'Attendance Status'
}

export const PAGINATION_OPTIONS = [
  { value: 10, label: '10 per page' },
  { value: 25, label: '25 per page' },
  { value: 50, label: '50 per page' },
  { value: 100, label: '100 per page' }
]

export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  API: 'YYYY-MM-DD',
  MONTH_YEAR: 'MMM YYYY',
  TIME: 'HH:mm'
}

export const API_ENDPOINTS = {
  MUSTER_ROLL: 'hrms/muster-roll',
  MUSTER_ROLL_EXPORT: 'hrms/muster-roll/export',
  ATTENDANCE_SUMMARY: 'hrms/attendance/summary',
  EMPLOYEE_ATTENDANCE: 'hrms/attendance/employee'
}

export const VALIDATION_RULES = {
  DATE_RANGE: {
    MAX_DAYS: 31,
    MIN_DAYS: 1
  },
  EXPORT: {
    MAX_RECORDS: 10000
  }
}

export const MOCK_DATA = {
  employees: [
    {
      id: 'EMP001',
      name: 'John Doe',
      department: 'IT',
      designation: 'Software Developer',
      status: 'active'
    },
    {
      id: 'EMP002',
      name: 'Jane Smith',
      department: 'HR',
      designation: 'HR Manager',
      status: 'active'
    },
    {
      id: 'EMP003',
      name: 'Mike Johnson',
      department: 'Finance',
      designation: 'Accountant',
      status: 'active'
    },
    {
      id: 'EMP004',
      name: 'Sarah Wilson',
      department: 'Marketing',
      designation: 'Marketing Executive',
      status: 'active'
    },
    {
      id: 'EMP005',
      name: 'David Brown',
      department: 'Operations',
      designation: 'Operations Manager',
      status: 'active'
    }
  ],
  attendanceData: [
    {
      employeeId: 'EMP001',
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '18:00',
      workingHours: 8,
      overtimeHours: 0,
      status: 'P',
      remarks: ''
    },
    {
      employeeId: 'EMP002',
      date: '2024-01-15',
      checkIn: '09:15',
      checkOut: '17:45',
      workingHours: 7.5,
      overtimeHours: 0,
      status: 'L',
      remarks: 'Late by 15 minutes'
    },
    {
      employeeId: 'EMP003',
      date: '2024-01-15',
      checkIn: '08:45',
      checkOut: '19:00',
      workingHours: 9,
      overtimeHours: 1,
      status: 'O',
      remarks: 'Overtime for month-end closing'
    },
    {
      employeeId: 'EMP004',
      date: '2024-01-15',
      checkIn: null,
      checkOut: null,
      workingHours: 0,
      overtimeHours: 0,
      status: 'A',
      remarks: 'Sick leave'
    },
    {
      employeeId: 'EMP005',
      date: '2024-01-15',
      checkIn: '09:00',
      checkOut: '13:00',
      workingHours: 4,
      overtimeHours: 0,
      status: 'H',
      remarks: 'Half day - personal work'
    }
  ]
}

