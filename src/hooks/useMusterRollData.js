import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  MOCK_DATA,
  API_ENDPOINTS,
  VALIDATION_RULES,
  REPORT_PERIODS,
} from '../constants/musterRollConstants'
import BasicProvider from '../constants/BasicProvider'
import moment from 'moment'

/** Match muster row to staff user id for merging leave applications */
function getMusterRowUserId(row) {
  return row.userId || row.user?._id || row.staffUserId || row.employeeUserId
}

function getLeaveApplicationUserId(leave) {
  return leave.user?._id || leave.userId || leave.user
}

function leaveApplicationCoversDate(leave, ymd) {
  const d = moment(ymd, 'YYYY-MM-DD')
  const start = leave.start_date || leave.startDate || leave.fromDate || leave.from
  const end = leave.end_date || leave.endDate || leave.toDate || leave.to
  const from = moment(start).startOf('day')
  if (!from.isValid()) return false
  const toM = end ? moment(end).startOf('day') : from
  const endOk = toM.isValid() ? toM : from
  return d.isSameOrAfter(from) && d.isSameOrBefore(endOk)
}

function pickLeaveForStaffAndDate(leaves, userId, ymd) {
  if (!userId || !Array.isArray(leaves)) return null
  const uid = String(userId)
  const matches = leaves.filter((lv) => {
    if (!leaveApplicationCoversDate(lv, ymd)) return false
    const lid = getLeaveApplicationUserId(lv)
    if (!lid) return false
    return String(lid) === uid
  })
  if (matches.length === 0) return null
  if (matches.length === 1) return matches[0]
  const order = { Pending: 0, Approved: 1, PartiallyAdjusted: 2, Rejected: 3 }
  return [...matches].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))[0]
}

/**
 * Muster-summary often does not include leave approval; enrich from `leaves` API for the same date.
 */
function mergeLeavesIntoMusterRows(rows, leavesList, selectedDate) {
  if (!Array.isArray(rows) || !Array.isArray(leavesList) || leavesList.length === 0) return rows
  return rows.map((row) => {
    let uid = getMusterRowUserId(row)
    let lv = uid ? pickLeaveForStaffAndDate(leavesList, uid, selectedDate) : null
    if (!lv && row.name) {
      const nm = String(row.name).trim().toLowerCase()
      const byName = leavesList.find(
        (l) =>
          leaveApplicationCoversDate(l, selectedDate) &&
          nm &&
          String(l.user?.name || '')
            .trim()
            .toLowerCase() === nm,
      )
      if (byName) lv = byName
    }
    if (!lv) return row
    const st = lv.status || lv.approvalStatus || ''
    return {
      ...row,
      leave: lv,
      leaveApprovalStatus: st,
      leaveApplicationStatus: st,
      approvalStatus: st,
    }
  })
}

// Initial summary state
const initialSummaryState = {
  totalEmployees: 0,
  presentCount: 0,
  absentCount: 0,
  halfdayCount: 0,
  weeklyOffCount: 0,
  leaveCount: 0,
  holidayCount: 0,
  lateCount: 0,
  overtimeCount: 0,
  attendancePercentage: 0,
  averageHours: 0,
  totalWorkingHours: 0,
  headerDays: [],
}

const useMusterRollData = (filters, dateRange, month, year, day = 1) => {
  const [data, setData] = useState([])
  const [summaryData, setSummaryData] = useState(initialSummaryState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [rawMusterData, setRawMusterData] = useState(null)

  // Transform API muster summary data to table format (new format from attendances/muster-summary)
  const transformMusterDataToTableFormat = useCallback((apiResponse) => {
    if (!apiResponse) {
      console.error('No muster data provided')
      return []
    }

    // Handle new API format where rows are directly in the response (not nested)
    const rows = Array.isArray(apiResponse) ? apiResponse : apiResponse.rows || []

    if (!Array.isArray(rows) || rows.length === 0) {
      console.error('Missing or invalid rows:', rows)
      return []
    }

    const getAttendanceGrade = (totalHours) => {
      if (totalHours >= 241) return 'Very Good'
      if (totalHours >= 230) return 'Good'
      if (totalHours >= 208) return 'Need Improvement'
      return 'Very Poor'
    }

    const tableData = rows.map((row, idx) => {
      // Get designation from multiple possible sources
      const designation = 
        row.designation || 
        row.role?.[0]?.display_name || 
        row.role?.[0]?.name ||
        row.user?.role?.[0]?.display_name ||
        row.user?.role?.[0]?.name ||
        row.employee?.designation ||
        row.employee?.role?.[0]?.display_name ||
        '-'

      // Get employee status from multiple possible sources
      let employeeStatus = 
        row.employeeStatus ||
        row.user?.status ||
        row.employee?.status ||
        row.userStatus
      
      // Handle boolean isActive field
      if (!employeeStatus && row.isActive !== undefined) {
        employeeStatus = row.isActive ? 'active' : 'inactive'
      }
      
      // Default to active if not specified
      if (!employeeStatus) {
        employeeStatus = 'active'
      }

      // Handle raLocation - can be object or string
      let raLocationValue = row.raLocation || row.location || '-'
      let raLocationLabel = '-'
      
      if (raLocationValue && typeof raLocationValue === 'object') {
        // If it's an object, extract label
        raLocationLabel = raLocationValue.label || raLocationValue.name || raLocationValue.value || '-'
      } else if (raLocationValue && raLocationValue !== '-') {
        // If it's a string, use it as label
        raLocationLabel = raLocationValue
      }

      // Get Today Done/Draft Done from latest available source.
      // NOTE: sessions can be an empty array; in that case fall back to row-level fields.
      let draftDone = null
      if (Array.isArray(row.sessions) && row.sessions.length > 0) {
        for (let i = row.sessions.length - 1; i >= 0; i--) {
          const session = row.sessions[i]
          const sessionDraftDone =
            session?.today_draft_done ??
            session?.todayDraftDone ??
            session?.draftDone ??
            session?.today_done
          if (sessionDraftDone !== null && sessionDraftDone !== undefined && sessionDraftDone !== '') {
            draftDone = sessionDraftDone
            break
          }
        }
      }

      if (draftDone === null || draftDone === undefined || draftDone === '') {
        draftDone =
          row.today_draft_done ??
          row.todayDraftDone ??
          row.today_done ??
          row.draftDone ??
          row.draft_done ??
          null
      }

      const leaveApprovalRaw =
        row.leaveApprovalStatus ??
        row.leave_approval_status ??
        row.leaveApplicationStatus ??
        row.leave_application_status ??
        row.approvalStatus ??
        row.approval_status ??
        row.leaveStatus ??
        row.leave_status ??
        (row.leave &&
          (row.leave.approvalStatus ||
            row.leave.applicationStatus ||
            row.leave.status ||
            row.leave.state)) ??
        null

      const leaveAsObject =
        typeof row.leave === 'object' && row.leave !== null
          ? row.leave
          : row.leaveInfo || row.leaveRecord || null
      const monthlyLeaveDays =
        typeof row.leave === 'number' ? row.leave : (row.leaveCount ?? row.monthlyLeave ?? 0)

      return {
        _id: row._id || `row-${idx}`,
        sn: idx + 1,
        employeeId: row.employeeId || row.employee_id || '-',
        userId: row.user?._id || row.userId || row.staffUserId || row.employeeUserId,
        user: row.user || null,
        name: row.employeeName || row.name || row.user?.name || '-',
        designation: designation,
        raLocation: raLocationValue, // Keep original for reference
        raLocationLabel: raLocationLabel, // Store label for filtering
        status: row.status || row.dayStatus || 'NotMarked',
        dayStatus: row.dayStatus || row.status || 'NotMarked',
        leaveApprovalStatus: leaveApprovalRaw,
        leaveApplicationStatus: row.leaveApplicationStatus ?? row.leave_application_status,
        approvalStatus: row.approvalStatus ?? row.approval_status,
        leave: leaveAsObject,
        monthlyLeaveCount: monthlyLeaveDays,
        employeeStatus: employeeStatus, // Add employee status field
        punchIn: row.punchIn || '-',
        punchOut: row.punchOut || '-',
        workingHours: row.workingHours || '-',
        draftDone: draftDone,
        overtimeMinutes: row.overtimeMinutes || 0,
        // Add counts if available
        present: row.present || 0,
        absent: row.absent || 0,
        halfday: row.halfday || 0,
        holiday: row.holiday || 0,
        dailyStates: row.dailyStates || [],
      }
    })

    return tableData
  }, [])

  // Helper function to normalize minutes (same as AdminPayRoll.jsx)
  const normalizeToMinutes = (value) => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'object') {
      if (value.$numberDecimal) {
        const num = Number(value.$numberDecimal)
        return Number.isFinite(num) ? num : 0
      }
      if (typeof value.toString === 'function') {
        const num = Number(value.toString())
        return Number.isFinite(num) ? num : 0
      }
    }
    if (typeof value === 'string') {
      const match = value.match(/(\d+)\s*Hrs?\s*([\d.]+)\s*min/i)
      if (match) {
        const hrs = parseInt(match[1], 10)
        const mins = parseFloat(match[2])
        return hrs * 60 + mins
      }
      const n = Number(value)
      if (!Number.isFinite(n)) return 0
      if (n > 0 && n <= 24 && value.includes('.')) {
        return n * 60
      }
      return n
    }
    const num = Number(value)
    if (!Number.isFinite(num)) return 0
    if (num > 0 && num <= 24 && String(value).includes('.')) {
      return num * 60
    }
    return num
  }

  const parseWorkingHours = (value) => {
    if (!value || value === '-') return 0
    if (typeof value === 'number') return value

    // "5h 40m" → 5.66
    const h = value.match(/(\d+)h/i)
    const m = value.match(/(\d+)m/i)

    const hours = h ? Number(h[1]) : 0
    const minutes = m ? Number(m[1]) : 0

    return hours + minutes / 60
  }

  const getAttendanceGrade = (totalHours) => {
    if (totalHours >= 241) return 'Very Good'
    if (totalHours >= 230) return 'Good'
    if (totalHours >= 208) return 'Need Improvement'
    return 'Very Poor'
  }

  // Calculate summary from transformed data (new API format)
  const calculateSummaryFromTableData = useCallback((tableData, apiSummary = null) => {
    if (!tableData || tableData.length === 0) {
      return {
        ...initialSummaryState,
        ...(apiSummary || {}),
      }
    }

    // Group by employee (each row is one employee now)
    const totalEmployees = tableData.length

    let totalPresent = 0
    let totalAbsent = 0
    let totalLate = 0
    let totalOvertime = 0
    let totalWorkingHours = 0

    tableData.forEach((employee) => {
      totalWorkingHours += parseWorkingHours(employee.workingHours)
    })
    tableData.forEach((employee) => {
      const status = employee.status || employee.dayStatus || 'NotMarked'

      if (status === 'Present' || status === 'P') {
        totalPresent++
      } else if (status === 'Absent' || status === 'A' || status === 'NotMarked') {
        totalAbsent++
      }

      // Check for late arrivals
      if (employee.punchIn && employee.punchIn !== '-') {
        const punchTime = moment(employee.punchIn, 'HH:mm')
        const workStartTime = moment('09:00', 'HH:mm')
        if (punchTime.isAfter(workStartTime)) {
          totalLate++
        }
      }

      // Count overtime
      if (employee.overtimeMinutes > 0) {
        totalOvertime += employee.overtimeMinutes
      }
    })

    const attendancePercentage = totalEmployees > 0 ? (totalPresent / totalEmployees) * 100 : 0
    const summary = {
      totalEmployees,
      presentCount: totalPresent,
      absentCount: totalAbsent,
      lateCount: totalLate,
      overtimeCount: Math.round(totalOvertime / 60),
      attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
      totalWorkingHours: Number(totalWorkingHours.toFixed(2)),
      averageHours:
        totalEmployees > 0 ? Number((totalWorkingHours / totalEmployees).toFixed(2)) : 0,
      attendanceGrade: getAttendanceGrade(totalWorkingHours),
      headerDays: [],
    }

    // Override with API summary if available
    if (apiSummary) {
      // Use totalActiveStaff if available, otherwise use totalStaff or calculated totalEmployees
      const activeStaffCount = apiSummary.totalActiveStaff || apiSummary.totalStaff || totalEmployees
      
      return {
        ...summary,
        totalEmployees: activeStaffCount,
        totalActiveStaff: apiSummary.totalActiveStaff, // Store for reference
        totalStaff: apiSummary.totalStaff, // Keep for reference
        presentCount: apiSummary.totalTodayPresent || totalPresent,
        absentCount: apiSummary.totalTodayAbsent || totalAbsent,
        lateCount: apiSummary.lateArrivals || totalLate,
        overtimeCount: apiSummary.overtimeHours || totalOvertime,
        attendancePercentage: apiSummary.attendancePercent || attendancePercentage,
        averageHours: apiSummary.avgWorkingHours || 0,
        attendanceStatusText: apiSummary.attendanceStatusText || 'Normal',
        attendanceGrade: apiSummary.attendanceGrade || getAttendanceGrade(totalWorkingHours),
        totalWorkingHours: apiSummary.totalWorkingHours || totalWorkingHours,
      }
    }

    return summary
  }, [])

  // Fetch data from API - exactly like AdminPayRoll.jsx
  const fetchData = useCallback(async () => {
    if (!month || !year) return

    try {
      setLoading(true)
      setError(null)

      const selectedDate = moment({ year, month: month - 1, day }).format('YYYY-MM-DD')

      const url = `attendances/muster-summary?date=${selectedDate}`

      const res = await new BasicProvider(url).getRequest()

      // Extract data from Axios response
      const apiData = res?.data || res

      if (!apiData?.success) {
        setError('Invalid response from API')
        setData([])
        setSummaryData(initialSummaryState)
        return
      }

      // SAVE RAW DATA
      setRawMusterData(apiData)

      // SUMMARY FROM API
      // setSummaryData(apiData.summary)
      const transformedData = transformMusterDataToTableFormat(apiData.rows || [])

      let mergedData = transformedData
      try {
        const leaveRes = await new BasicProvider(
          `leaves?from=${selectedDate}&to=${selectedDate}&count=10000`,
        ).getRequest()
        const lrPayload = leaveRes?.data !== undefined ? leaveRes.data : leaveRes
        const leavesList = Array.isArray(lrPayload)
          ? lrPayload
          : Array.isArray(lrPayload?.data)
            ? lrPayload.data
            : []
        mergedData = mergeLeavesIntoMusterRows(transformedData, leavesList, selectedDate)
      } catch (leaveErr) {
        console.warn('Muster roll: leave merge skipped', leaveErr)
      }

      setData(mergedData)

      const calculatedSummary = calculateSummaryFromTableData(mergedData, apiData.summary)

      setSummaryData(calculatedSummary)

      console.log('Muster roll data fetched for', summaryData)
    } catch (err) {
      console.error('API error:', err)
      setError(err?.message || 'Something went wrong')
      setData([])
      setSummaryData(initialSummaryState)
    } finally {
      setLoading(false)
    }
  }, [month, year, day])

  // Export data - use raw muster data if available
  const exportData = useCallback(
    async (format) => {
      try {
        setExportLoading(true)
        setError(null)

        // Use month and year directly if provided, otherwise extract from dateRange
        let selectedMonth, selectedYear
        if (month && year) {
          selectedMonth = month
          selectedYear = year
        } else if (dateRange?.startDate) {
          const date = moment(dateRange.startDate, 'YYYY-MM-DD', true)
          if (!date.isValid()) {
            throw new Error('Invalid date format')
          }
          selectedMonth = date.month() + 1
          selectedYear = date.year()
        } else {
          const now = moment()
          selectedMonth = now.month() + 1
          selectedYear = now.year()
        }

        // Validate
        if (!selectedMonth || selectedMonth < 1 || selectedMonth > 12) {
          throw new Error('Invalid month')
        }
        if (!selectedYear || selectedYear < 2000 || selectedYear > 2100) {
          throw new Error('Invalid year')
        }

        // If we have raw muster data, use it for export
        if (rawMusterData) {
          // You can implement export logic here using rawMusterData
          // For now, just show a message
          console.log('Export data available:', rawMusterData)
          alert(
            `Export functionality for ${format} format will be implemented. Data is ready for export.`,
          )
          return
        }

        // Fallback: try to fetch fresh data for export
        try {
          const url = `attendances/admin/muster?month=${selectedMonth}&year=${selectedYear}`
          const response = await new BasicProvider(url).getRequest()

          if (response?.status === 'success' && response?.data) {
            // Export logic can be implemented here
            alert(`Export functionality for ${format} format will be implemented.`)
          } else {
            throw new Error('No data available for export')
          }
        } catch (apiError) {
          throw new Error('Failed to fetch data for export')
        }
      } catch (error) {
        setError('Failed to export data')
        throw error
      } finally {
        setExportLoading(false)
      }
    },
    [rawMusterData, month, year, dateRange],
  )

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // Filter only active staff by default
    filtered = filtered.filter((item) => {
      const empStatus = (item.employeeStatus || 'active').toLowerCase()
      return empStatus === 'active'
    })

    // Name filter (exact/partial)
    if (filters.name && filters.name.trim()) {
      const nameLower = filters.name.trim().toLowerCase()
      filtered = filtered.filter((item) => (item.name || '').toLowerCase().includes(nameLower))
    }

    // Search term (legacy) - search across name, employeeId, designation
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          (item.name || '').toLowerCase().includes(searchLower) ||
          (item.employeeId || '').toLowerCase().includes(searchLower) ||
          (item.designation || '').toLowerCase().includes(searchLower),
      )
    }

    // RA Location filter - handle both object and string formats
    if (filters.raLocation && filters.raLocation !== 'all') {
      const filterLoc = filters.raLocation.toLowerCase()
      filtered = filtered.filter((item) => {
        // Check raLocationLabel first (for filtering)
        const locLabel = item.raLocationLabel || ''
        if (locLabel.toLowerCase() === filterLoc) return true
        
        // Fallback: check if raLocation is an object
        if (item.raLocation && typeof item.raLocation === 'object') {
          const objLabel = (item.raLocation.label || item.raLocation.name || '').toLowerCase()
          if (objLabel === filterLoc) return true
        }
        
        // Fallback: check as string
        const locStr = (item.raLocation || '').toString().toLowerCase()
        return locStr === filterLoc
      })
    }

    // Role / Designation filter - handle both object and string formats
    if (filters.role && filters.role !== 'all') {
      const filterRole = filters.role.toLowerCase()
      filtered = filtered.filter((item) => {
        const desig = (item.designation || '').toString().toLowerCase()
        return desig === filterRole
      })
    }

    // Apply department filter (backwards compatibility)
    if (filters.department && filters.department !== 'all') {
      filtered = filtered.filter(
        (item) => (item.department || '').toLowerCase() === filters.department,
      )
    }

    // Apply employee status filter (uses status/dayStatus/attendanceStatus if present)
    if (filters.employeeStatus && filters.employeeStatus !== 'all') {
      filtered = filtered.filter((item) => {
        const att = (item.attendanceStatus || item.status || item.dayStatus || '').toString()
        if (filters.employeeStatus === 'active') return att !== 'A'
        if (filters.employeeStatus === 'inactive') return att === 'A'
        if (filters.employeeStatus === 'on-leave') return att === 'LV'
        return true
      })
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[filters.sortBy]
        const bValue = b[filters.sortBy]

        if (aValue === undefined || aValue === null) return 1
        if (bValue === undefined || bValue === null) return -1

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'asc'
            ? aValue.localeCompare(bValue, undefined, { numeric: true })
            : bValue.localeCompare(aValue, undefined, { numeric: true })
        }

        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, filters])

  // Refresh data
  const refreshData = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Use ref to prevent multiple simultaneous calls
  const fetchingRef = useRef(false)
  const lastFetchedRef = useRef({ month: null, year: null, day: null })

  useEffect(() => {
    // Only fetch if we have valid month/year/day
    if (
      !month ||
      !year ||
      !day ||
      typeof month !== 'number' ||
      typeof year !== 'number' ||
      typeof day !== 'number' ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return
    }

    // Validate: Don't fetch for future dates
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    const currentDay = currentDate.getDate()

    if (
      year > currentYear ||
      (year === currentYear && month > currentMonth) ||
      (year === currentYear && month === currentMonth && day > currentDay)
    ) {
      setError(
        `Cannot fetch data for future dates. Please select ${moment().format(
          'MMMM DD, YYYY',
        )} or earlier.`,
      )
      setData([])
      setSummaryData(initialSummaryState)
      setLoading(false)
      return
    }

    // Skip if already fetching
    if (fetchingRef.current) {
      return
    }

    // Skip if same month/year/day was just fetched
    if (
      lastFetchedRef.current.month === month &&
      lastFetchedRef.current.year === year &&
      lastFetchedRef.current.day === day
    ) {
      return
    }

    // Small delay to ensure component is fully mounted
    const timeoutId = setTimeout(() => {
      fetchingRef.current = true
      lastFetchedRef.current = { month, year, day }

      fetchData().finally(() => {
        fetchingRef.current = false
      })
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [month, year, day, fetchData])

  return {
    data: filteredData,
    originalData: data, // Return original unfiltered data for filter options
    summaryData,
    loading,
    error,
    exportLoading,
    exportData,
    refreshData,
  }
}

export default useMusterRollData
