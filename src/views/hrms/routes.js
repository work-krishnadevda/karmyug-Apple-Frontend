import { element } from 'prop-types'
import React from 'react' 
// const HRMSProfile = React.lazy(() => import('./HRMSProfile'))
const HRMSProfile = React.lazy(() => import('./MyProfile'))

const HolidayCalendar = React.lazy(() => import('./Holiday/HolidayLeave'))

const HRMSSTAFFProfile = React.lazy(() => import('./EmployeeProfile'))

const LeaveAcknowledgment = React.lazy(() => import('./LeaveManagement/Leaveacknowledgment'))

const HRMSProfileImproved = React.lazy(() => import('./HRMSProfileImproved'))
const StaffAttendance = React.lazy(() => import('./StaffAttendance'))
const Attendance = React.lazy(() => import('./LogUserAttendance'))
const MusterRollReport = React.lazy(() => import('./MusterRollReport'))
const LeaveEmployeeDashboard = React.lazy(() => import('./LeaveManagement/EmployeeDashboard'))
const ApproverDashboard = React.lazy(() => import('./LeaveManagement/ApproverDashboard'))
const AdminDashboard = React.lazy(() => import('./LeaveManagement/AdminDashboard'))
const LeaveAuthorityDashboard = React.lazy(() =>
  import('./LeaveManagement/LeaveAuthorityDashboard'),
)
const HRLeaveDashboard = React.lazy(() => import('./LeaveManagement/HRLeaveDashboard'))
const StaffOnLeave = React.lazy(() => import('./LeaveManagement/StaffOnLeave'))

const MonthlyLeaveSummary = React.lazy(() => import('./LeaveManagement/MonthlyLeaveSummary'))
const PendinApprovelsLeave = React.lazy(() => import('./LeaveManagement/PendingApprovelsLeave'))
const Staff = React.lazy(() => import('./Staff'))
const AddStaff = React.lazy(() => import('./AddStaff'))
const HRMSDashboard = React.lazy(() => import('./HRMSDashboard'))
const EmployeeDashboard = React.lazy(() => import('./EmployeeDashboard'))
const AdminUnapprovedAttendance = React.lazy(() => import('./AdminUnapprovedAttendance'))
const AdminAttendanceSettings = React.lazy(() => import('./AdminAttendanceSettings'))

const BirthdayToday = React.lazy(() => import('./celebration/BirthdayToday'))
const BirthdayUpcoming = React.lazy(() => import('./celebration/BirthdayUpcoming'))

const WorkAnniversaryToday = React.lazy(() => import('./celebration/WorkAnniversaryToday'))
const WorkAnniversaryUpcoming = React.lazy(() => import('./celebration/WorkAnniversaryUpcoming'))

const MarriageAnniversaryToday = React.lazy(() => import('./celebration/MarriageAnniversaryToday'))
const MarriageAnniversaryUpcoming = React.lazy(() => import('./celebration/MarriageAnniversaryUpcoming'))

const AddOnList = React.lazy(() => import('./addonPenalty/AddOnList'))
const PenaltyList = React.lazy(() => import('./addonPenalty/PenaltyList'))

const UserAddOnList = React.lazy(() => import('./addonPenalty/user_addOnList'))
const UserPenaltyList = React.lazy(() => import('./addonPenalty/user_PenaltyList'))
const PendingPunches = React.lazy(() => import('./PendingPunches'))

const routes = [
  { path: '/hrms', name: 'HRMS Dashboard', element: HRMSDashboard },
  { path: '/hrms/employee-dashboard', name: 'Employee Dashboard', element: EmployeeDashboard },
  { path: '/hrms/profile/:id?', name: 'HRMS Profile', element: HRMSProfile },
  { path: '/hrms/profile-improved', name: 'HRMS Profile (Improved)', element: HRMSProfileImproved },
  { path: '/hrms/attendance', name: 'Attendance', element: Attendance },
  {
    path: '/hrms/unapproved/attendance',
    name: 'Unapproved Attendance',
    element: AdminUnapprovedAttendance,
  },
  {
    path: '/hrms/unapproved/pending-punches',
    name: 'Pending Punches',
    element: PendingPunches,
  },
  {
    path: '/hrms/attendance/settings',
    name: 'Attendance Settings',
    element: AdminAttendanceSettings,
  },
  { path: '/hrms/leave/penelty', name: 'Leave Management', element: LeaveAcknowledgment },
  { path: '/hrms/staff/attendance/:id', name: 'Staff Attendance', element: StaffAttendance },
  { path: '/hrms/staff/attendance/:id', name: 'Staff Attendance', element: Attendance },
  { path: '/hrms/staff/muster-roll', name: 'Muster Roll Report', element: MusterRollReport },
  { path: '/hrms/staff', name: 'Staff', element: Staff },
  { path: '/hrms/staff/all', name: 'All Staff', element: Staff },
  { path: '/hrms/staff/profile/:id', name: 'Staff Profile', element: HRMSSTAFFProfile },
  { path: '/hrms/addstaff', name: 'Add Staff', element: AddStaff },
  {
    path: '/hrms/leave/employee',
    name: 'Leave Management - Employee',
    element: LeaveEmployeeDashboard,
  },
  { path: '/hrms/staff/Holiday', name: 'Leave Manahement', element: HolidayCalendar },
  { path: '/hrms/leave/approver', name: 'Leave Management - Approver', element: ApproverDashboard },
  { path: '/hrms/leave/admin', name: 'Leave Management - Admin', element: AdminDashboard },
  { path: '/hrms/staff/leave', name: 'Leave Management - Admin', element: HRLeaveDashboard },
  { path: '/hrms/staff/staffOnLeave/', name: 'Leave Management - Admin', element: StaffOnLeave },
  {
    path: '/hrms/staff/pendingLeaveApprove',
    name: 'Leave Management - Admin',
    element: PendinApprovelsLeave,
  },
  {
    path: '/hrms/authority/leave/',
    name: 'Leave Management -Admin',
    element: LeaveAuthorityDashboard,
  },
  {
    path: '/hrms/staff/monthly-leave-summary',
    name: 'Leave Management - Admin',
    element: MonthlyLeaveSummary,
  },
    { path: '/celebration/birthday/today', name: 'Birthday - Today', element: BirthdayToday },
  { path: '/celebration/birthday/upcoming', name: 'Birthday - Upcoming', element: BirthdayUpcoming },

  { path: '/celebration/work-anniversary/today', name: 'Work Anniversary - Today', element: WorkAnniversaryToday },
  { path: '/celebration/work-anniversary/upcoming', name: 'Work Anniversary - Upcoming', element: WorkAnniversaryUpcoming },

  { path: '/celebration/marriage-anniversary/today', name: 'Marriage Anniversary - Today', element: MarriageAnniversaryToday },
  { path: '/celebration/marriage-anniversary/upcoming', name: 'Marriage Anniversary - Upcoming', element: MarriageAnniversaryUpcoming },
  
  
  { path: '/hrms/addon/addonList', name: 'Add-On List', element: AddOnList },
  { path: '/hrms/penalty/penaltyList', name: 'Penalty List', element: PenaltyList },

  {path: '/hrms/addon/useraddonList', name: 'User Add-On List', element: UserAddOnList },
  {path: '/hrms/penalty/userPenaltyList', name: 'User Penalty List', element: UserPenaltyList },
]

export default routes
