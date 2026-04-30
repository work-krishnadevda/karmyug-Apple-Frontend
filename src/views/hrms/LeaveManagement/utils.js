// Utility functions for Leave Management System

const MS_PER_DAY = 86400000

/**
 * Parse API / form values the same way the UI displays them (toLocaleDateString uses local TZ).
 * Plain YYYY-MM-DD must become that calendar date at local midday — not UTC midnight (ES5 parses
 * date-only ISO as UTC → previous/next calendar day in India and breaks CL vs Emergency rows).
 */
function parseLeaveDateInput(input) {
  if (input == null || input === '') return new Date(Number.NaN)
  if (input instanceof Date) return new Date(input.getTime())

  const raw = String(input).trim()
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (ymd) {
    const y = Number(ymd[1])
    const mo = Number(ymd[2]) - 1
    const d = Number(ymd[3])
    return new Date(y, mo, d, 12, 0, 0, 0)
  }
  return new Date(raw)
}

function toLocalCalendarNoon(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
    0,
  )
}

/**
 * Inclusive leave days between start and end.
 * Uses local calendar stripping + midday anchor so same displayed day never yields 2 days due to TZ.
 */
export function calculateInclusiveLeaveDays(startDate, endDate) {
  const start = parseLeaveDateInput(startDate)
  const end = parseLeaveDateInput(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0

  const startNoon = toLocalCalendarNoon(start)
  const endNoon = toLocalCalendarNoon(end)
  if (endNoon < startNoon) return 0

  const diff = Math.round((endNoon.getTime() - startNoon.getTime()) / MS_PER_DAY)
  return diff + 1
}

/** @deprecated Prefer name calculateInclusiveLeaveDays; kept for callers */
export const calculateDays = calculateInclusiveLeaveDays

/**
 * Rows in My Leave: prefer server {@link totalDays} (same as admin / HR modals). Fallback when missing.
 */
export function getLeaveRequestDisplayDays(req) {
  if (!req) return 0
  const raw = req.totalDays
  if (raw !== undefined && raw !== null && raw !== '') {
    const n = Number(raw)
    if (Number.isFinite(n) && n >= 0) {
      return Math.trunc(n)
    }
  }
  return calculateInclusiveLeaveDays(req.start_date, req.end_date)
}

// Validate leave application
export const validateLeaveApplication = (leaveForm, leaveTypes) => {
  const { leaveType, startDate, endDate, reason } = leaveForm
  
  if (!leaveType || !startDate || !endDate || !reason.trim()) {
    return { valid: false, message: 'Please fill all required fields' }
  }

  const days = calculateDays(startDate, endDate)
  if (days <= 0) {
    return { valid: false, message: 'End date must be after start date' }
  }

  const selectedLeaveType = leaveTypes.find(lt => lt.id === leaveType)
  if (!selectedLeaveType) {
    return { valid: false, message: 'Invalid leave type selected' }
  }

  if (leaveType === 'CL' && days > selectedLeaveType.remaining) {
    return { valid: false, message: `Insufficient CL balance. Available: ${selectedLeaveType.remaining} days` }
  }

  if (leaveType === 'UL' && days > selectedLeaveType.remaining) {
    return { valid: false, message: `Insufficient UL balance. Available: ${selectedLeaveType.remaining} days` }
  }

  // Check quarterly limit for UL
  if (leaveType === 'UL' && selectedLeaveType.quarterlyUsed + days > 4) {
    return { valid: false, message: `Quarterly UL limit exceeded. Available: ${4 - selectedLeaveType.quarterlyUsed} days` }
  }

  return { valid: true }
}

// Calculate penalty for UL (double deduction)
export const calculatePenalty = (ulDays, quarterlyLimit = 4) => {
  if (ulDays <= quarterlyLimit) return 0
  return (ulDays - quarterlyLimit) * 2 // Double deduction for exceeding quarterly limit
}

// Determine final status based on approvals
export const determineFinalStatus = (approvals) => {
  const approvedCount = approvals.filter(a => a.status === 'approved').length
  const rejectedCount = approvals.filter(a => a.status === 'rejected').length

  if (approvedCount >= 2) {
    return 'approved'
  } else if (rejectedCount >= 2) {
    return 'rejected'
  } else if (approvedCount > 0 || rejectedCount > 0) {
    return 'partially_approved'
  }
  
  return 'pending'
}

// Get next approver in the chain
export const getNextApprover = (currentApprover, approvalChain) => {
  const currentIndex = approvalChain.indexOf(currentApprover)
  if (currentIndex === -1 || currentIndex === approvalChain.length - 1) {
    return null
  }
  return approvalChain[currentIndex + 1]
}

// Format date for display
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Check if user can take action on a request
export const canTakeAction = (request, currentUserRole) => {
  const userApproval = request.approvals.find(a => a.approver === currentUserRole)
  if (!userApproval) return false
  
  return userApproval.status === 'pending' && request.currentApprover === currentUserRole
}

// Get approval status for a specific user
export const getApprovalStatus = (request, currentUserRole) => {
  const userApproval = request.approvals.find(a => a.approver === currentUserRole)
  if (!userApproval) return 'not_assigned'
  return userApproval.status
}

// Constants
export const LEAVE_STATUSES = {
  pending: { color: 'warning', text: 'Pending' },
  partially_approved: { color: 'info', text: 'Partially Approved' },
  approved: { color: 'success', text: 'Approved' },
  rejected: { color: 'danger', text: 'Rejected' },
  cancelled: { color: 'secondary', text: 'Cancelled' },
}

export const APPROVAL_CHAIN = ['Admin', 'HR', 'Branch Manager', 'RC', 'SFO', 'LCTO']

export const LEAVE_TYPES = {
  CL: { id: 'CL', name: 'Casual Leave (CL)', balance: 12, color: 'primary' },
  UL: { id: 'UL', name: 'Unpaid Leave (UL)', balance: 16, color: 'warning' },
}
