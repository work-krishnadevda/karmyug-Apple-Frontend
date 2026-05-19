
import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CFormLabel,
  CCardTitle,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { toast } from 'react-toastify'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import BasicProvider from 'src/constants/BasicProvider'
import moment from 'moment'
import Select from 'react-select'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilCloudDownload } from '@coreui/icons'

// ==== Excel Styling Helpers (ONLY UI/STYLING) ====
const baseFont = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } }
const headerFont = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } }
const titleFont = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
const companyFont = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }

const thinBorderGray = {
  top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
  right: { style: 'thin', color: { argb: 'FFBFBFBF' } },
}

const centerMiddle = { horizontal: 'center', vertical: 'middle' }
const centerWrap = { horizontal: 'center', vertical: 'middle', wrapText: true }
const rightMiddle = { horizontal: 'right', vertical: 'middle' }

// Auto-fit with sensible min/max so column बड़ा but text compact रहे
const autoFitColumns = (worksheet, { min = 8, max = 30 } = {}) => {
  worksheet.columns.forEach((col) => {
    let maxLength = 0
    col.eachCell({ includeEmpty: true }, (cell) => {
      const value = cell.value
      const columnLength = value ? value.toString().length : 0
      if (columnLength > maxLength) maxLength = columnLength
    })
    // 1 char ≈ width 1, thoda padding + bounds
    const width = Math.min(Math.max(maxLength + 2, min), max)
    col.width = width
  })
}

const AdminPayRoll = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [managers, setManagers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    type: '', // 'month' | 'user'
  })

  const [exporting, setExporting] = useState(false)

  /**
   * Helpers to ensure we always deal with plain numbers when backend sends Mongo Decimal128 objects
   * or strings (e.g. "129.80") for duration fields.
   */

  // Helper to normalize overtime minutes - ALWAYS treats as minutes, never as hours
  const normalizeOvertimeMinutes = (value) => {
    // null / undefined
    if (value === null || value === undefined) return 0

    // Mongo Decimal128 ya object
    if (typeof value === 'object') {
      if (value.$numberDecimal) {
        const num = Number(value.$numberDecimal)
        return Number.isFinite(num) ? num : 0
      }
      if (typeof value.toString === 'function') {
        const num = Number(value.toString())
        return Number.isFinite(num) ? num : 0
      }
      return 0
    }

    // String cases - parse as minutes only
    if (typeof value === 'string') {
      // Empty string
      if (value.trim() === '') return 0
      
      // "1Hrs 56.62 min" type
      const match = value.match(/(\d+)\s*Hrs?\s*([\d.]+)\s*min/i)
      if (match) {
        const hrs = parseInt(match[1], 10)
        const mins = parseFloat(match[2])
        return hrs * 60 + mins
      }

      // plain numeric string: always treat as minutes (even if it's "1", "12", etc.)
      const n = Number(value)
      return Number.isFinite(n) ? n : 0
    }

    // Number - always treat as minutes (even if it's 1, 12, etc.)
    const num = Number(value)
    return Number.isFinite(num) ? num : 0
  }

  const formatMinutesToHourLabel = (value) => {
    const minutes = normalizeToMinutes(value)
    if (minutes <= 0) return '-'

    const totalMinutes = Math.round(minutes)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60

    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m` // e.g. "07h 42m"
  }

  // Format overtime minutes - uses dedicated normalizer that always treats as minutes
  const formatOvertimeToHourLabel = (value) => {
    const minutes = normalizeOvertimeMinutes(value)
    if (minutes <= 0 || !Number.isFinite(minutes)) return '-'

    const totalMinutes = Math.round(Math.abs(minutes)) // Ensure positive and rounded
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60

    // Always format as "00h 01m" even for small values like 1 minute
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m` // e.g. "00h 01m", "00h 12m"
  }

  // Format overtime from hours (backend sends overtime in hours, e.g., 1.422083333)
  const formatOvertimeFromHours = (hoursValue) => {
    if (hoursValue === null || hoursValue === undefined || hoursValue === 0) return '-'
    
    const hours = Number(hoursValue)
    if (!Number.isFinite(hours) || hours <= 0) return '-'

    // Convert hours to minutes
    const totalMinutes = Math.round(hours * 60)
    const hoursPart = Math.floor(totalMinutes / 60)
    const minsPart = totalMinutes % 60

    return `${hoursPart.toString().padStart(2, '0')}h ${minsPart.toString().padStart(2, '0')}m`
  }
  const getLateDays = (details, cutoff = "10:31") => {
  if (!Array.isArray(details)) return 0;

  let lateCount = 0;
  const [cutHour, cutMin] = cutoff.split(':').map(Number);

  details.forEach(d => {
    if (d?.sessions?.length > 0) {
      const firstIn = moment(d.sessions[0].punch_in);
      if (firstIn.isValid()) {
        const isLate =
          firstIn.hour() > cutHour ||
          (firstIn.hour() === cutHour && firstIn.minute() > cutMin);
          
        if (isLate) lateCount++;
      }
    }
  });

  return lateCount;
};

  // Active/Inactive staff split helper - used across all sheet exports
  const isActiveStatus = (status) => (status || '').toString().toLowerCase() === 'active'
  const getEmployeeStatusFromRow = (row) => {
    let status = row?.status || 'active'
    if (row?.details && Array.isArray(row.details) && row.details.length > 0) {
      for (const detail of row.details) {
        if (detail?.user?.status) {
          status = detail.user.status
          break
        }
      }
    }
    return status
  }
  const getEmployeeStatusFromItem = (item) => {
    let status = item?.status || 'active'
    if (item?.details && Array.isArray(item.details) && item.details.length > 0) {
      for (const detail of item.details) {
        if (detail?.user?.status) {
          status = detail.user.status
          break
        }
      }
    }
    return status
  }

  // Upar helpers ke paas add karo
  const normalizeToMinutes = (value) => {
    // null / undefined
    if (value === null || value === undefined) return 0

    // Mongo Decimal128 ya object
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

    // String cases
    if (typeof value === 'string') {
      // "1Hrs 56.62 min" type
      const match = value.match(/(\d+)\s*Hrs?\s*([\d.]+)\s*min/i)
      if (match) {
        const hrs = parseInt(match[1], 10)
        const mins = parseFloat(match[2])
        return hrs * 60 + mins
      }

      // plain numeric string: assume minutes, except very small hour values
      const n = Number(value)
      if (!Number.isFinite(n)) return 0
      if (n > 0 && n <= 24 && value.includes('.')) {
        // most probably "hours" – convert to minutes
        return n * 60
      }
      return n // minutes
    }

    // Number
    const num = Number(value)
    if (!Number.isFinite(num)) return 0

    // Agar 0 < num <= 24 AND decimal hai => treat as hours
    if (num > 0 && num <= 24 && String(value).includes('.')) {
      return num * 60
    }

    return num // already minutes
  }

  const parseMinutes = (value) => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'object') {
      if (value.$numberDecimal) {
        return parseFloat(value.$numberDecimal) || 0
      }
      if (typeof value.toString === 'function') {
        const parsed = Number(value.toString())
        return Number.isFinite(parsed) ? parsed : 0
      }
    }
    const num = Number(value)
    return Number.isFinite(num) ? num : 0
  }

   

  const formatMinutesToHHMM = (value) => {
    const minutes = normalizeToMinutes(value)
    if (minutes <= 0) return '-'
    const totalMinutes = Math.round(minutes)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  // const formatMinutesToHourText = (value) => {
  //   const minutes = parseMinutes(value)
  //   if (minutes <= 0) return '-'
  //   return `${(minutes / 60).toFixed(2)}h`
  // }

  const formatMinutesToHourText = (value) => {
    const minutes = normalizeToMinutes(value)
    if (minutes <= 0) return '-'
    const totalMinutes = Math.round(minutes)
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return `${hours}h ${mins}m`
  }
 

  const formatWorkingHours = (minutes) => {
    return formatMinutesToHourText(minutes) // minutes → "Xh Ym"
  }

  const getTotalWorkingMinutesFromDetails = (details) => {
    if (!Array.isArray(details)) return 0
    return details.reduce((sum, d) => {
      return sum + normalizeToMinutes(d?.total_duration_minutes || 0)
    }, 0)
  }

  // Helper function to filter addons/penalties by month and year
  const filterByMonthYear = (items, filterMonth, filterYear) => {
    if (!Array.isArray(items)) return []
    // Convert monthArg to numeric if it's a string like "January"
    const numericMonth = typeof filterMonth === 'string' ? moment(filterMonth, 'MMMM').month() + 1 : filterMonth
    const monthStr = String(numericMonth).padStart(2, '0')
    const yearMonthPattern = `${filterYear}-${monthStr}`
    return items.filter((item) => {
      if (!item.date) return false
      // Date format can be YYYY-MM-DD or YYYY-MM
      return item.date.startsWith(yearMonthPattern)
    })
  }

  // === CHANGE END ===

  const formatPunchTime = (dateTime) => {
    if (!dateTime) return '-'
    const time = moment(dateTime)
    return time.isValid() ? time.format('HH:mm:ss') : '-'
  }

  // -----------------------
  // Generate payroll API and Excel
  // -----------------------
  const generatePayroll = async (type) => {
    setLoading(true)
    try {
      const url =
        type === 'month'
          ? `attendances/admin/payroll/month?month=${month}&year=${year}`
          : `attendances/admin/payroll/user/${userId}?month=${month}&year=${year}`

      const res = await new BasicProvider(url).getRequest()

      if (res.status === 'success') {
        try {
          // Export single-user (or month) detailed muster — you already used this in original code
          if (type === 'user') {
            await exportAttendanceMusterRoll1(res, month, year)
          } else {
            if (!res?.data) {
              toast.error('No data received from API')
              return
            }
            await exportAttendanceMusterRoll(res.data, month, year)
          }
          toast.success('Payroll generated and exported successfully')
          // If you want the other payroll excel version, uncomment:
          // await exportPayrollToExcel(res.data, type)
        } catch (exportError) {
          console.error('Error exporting payroll:', exportError)
          toast.error(`Payroll generated but export failed: ${exportError?.message || 'Unknown error'}`)
        }
      } else {
        toast.error('Failed to generate payroll')
      }
    } catch (err) {
      toast.error(err?.message || 'Error generating payroll')
    } finally {
      setLoading(false)
      setConfirmModal({ visible: false, type: '' })
    }
  }

  // Helper function to count Sundays in a given month/year (calendar-based)
  // If joiningDate is provided, only count Sundays from joining date onwards (including joining date if it's a Sunday)
  const countSundaysInMonth = (month, year, joiningDate = null) => {
    const date = new Date(year, month - 1, 1)
    let count = 0
    
    // If joining date is provided, parse it and use as start date
    let startDate = date
    if (joiningDate) {
      const joinDate = moment(joiningDate).isValid() ? moment(joiningDate).toDate() : null
      if (joinDate) {
        const joinYear = joinDate.getFullYear()
        const joinMonth = joinDate.getMonth() + 1
        
        // Only consider joining date if it's in the same month/year
        if (joinYear === year && joinMonth === month) {
          startDate = joinDate
        } else if (joinYear > year || (joinYear === year && joinMonth > month)) {
          // Joining date is after this month, return 0
          return 0
        }
        // If joining date is before this month, count all Sundays (startDate remains first day of month)
      }
    }
    
    // Start from the later of: first day of month or joining date
    const currentDate = new Date(startDate)
    while (currentDate.getMonth() === month - 1) {
      if (currentDate.getDay() === 0) {
        count++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return count
  }

  const exportPayrollToExcel = async (payrollData, type) => {
  if (!payrollData) return
  setExporting(true)
  try {
    const records = Array.isArray(payrollData) ? payrollData : [payrollData]
    const activeRecords = records.filter((r) => isActiveStatus(getEmployeeStatusFromRow(r)))
    const inactiveRecords = records.filter((r) => !isActiveStatus(getEmployeeStatusFromRow(r)))
    const payrollSheetGroups = [
      { name: 'Payroll - Active Staff', records: activeRecords },
      { name: 'Payroll - Inactive Staff', records: inactiveRecords },
    ]

    const workbook = new ExcelJS.Workbook()

    const headerLabels = [
      'Employee Name',
      'Email',
      'Present',
      'Half Day',
      'Absent',
      'Leave',
      'Holiday',
      'Weekly Off',
      'Overtime (hrs)',
      'Total Working Hours',
      'Total Days',
      'Employee Status',
      'Attendance Status',
      'Date',
      'Punch In',
      'Punch Out',
      'Duration (mins)',
      'Approved',
      'Approved By',
      'Logs',
    ]

    payrollSheetGroups.forEach(({ name: sheetName, records: sheetRecords }) => {
      const worksheet = workbook.addWorksheet(sheetName, { properties: { defaultRowHeight: 18 } })
      worksheet.properties.defaultRowHeight = 18

      worksheet.mergeCells('A1:S1')
      const titleCell = worksheet.getCell('A1')
      titleCell.value =
        type === 'month'
          ? `${sheetName} - ${month}/${year}`
          : `${sheetName} - ${month}/${year} (User)`
      titleCell.font = titleFont
      titleCell.alignment = centerMiddle
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF305496' },
      }

      const headerRow = worksheet.addRow(headerLabels)
      headerRow.eachCell((cell) => {
        cell.font = headerFont
        cell.alignment = centerWrap
        cell.border = thinBorderGray
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD9E1F2' },
        }
      })

      sheetRecords.forEach((record) => {
      const {
        user,
        present,
        halfday,
        absent,
        leave,
        holiday,
        overtime,
        totalWorkingHours,
        totalDays,
        details,
      } = record
      
      // Get joining date from user object
      const joiningDate = user?.joining_date || user?.onboarding_date || record?.joining_date || record?.onboarding_date
      // Calculate weekly off based on joining date
      const weeklyOff = countSundaysInMonth(month, year, joiningDate)

      const totalWorkingMinutes = getTotalWorkingMinutesFromDetails(details)

      // Get status from details array user object (as per user requirement)
      // Check all details items to find user.status, not just the first one
      let employeeStatus = record.status || user.status || 'active'
      if (details && Array.isArray(details) && details.length > 0) {
        for (const detail of details) {
          if (detail?.user?.status) {
            employeeStatus = detail.user.status
            break
          }
        }
      }

      details.forEach((detail) => {
        const logMessages = detail.logs.map((l) => `[${l.role}] ${l.message}`).join('\n')

        if (detail.sessions.length > 0) {
          detail.sessions.forEach((session) => {
            const row = worksheet.addRow([
              user.name,
              user.email,
              present,
              halfday,
              absent,
              leave,
              holiday,
              weeklyOff,
              formatOvertimeToHourLabel(overtime),
              formatWorkingHours(totalWorkingMinutes),
              totalDays,
              employeeStatus,
              detail.status,
              detail.date,
              session.punch_in,
              session.punch_out,
              session.duration_minutes.toFixed(2),
              detail.approved ? 'Yes' : 'No',
              detail.approvedBy || '-',
              logMessages,
            ])

            row.eachCell((cell, colNumber) => {
              cell.font = baseFont
              cell.border = thinBorderGray

              // Alignment by type - updated for new Employee Status column
              if (colNumber <= 2 || colNumber >= 13 && colNumber <= 16 || colNumber >= 18) {
                cell.alignment = centerMiddle
              } else if (
                colNumber >= 3 &&
                colNumber <= 11 &&
                typeof cell.value === 'number'
              ) {
                cell.alignment = rightMiddle
              } else {
                cell.alignment = { horizontal: 'left', vertical: 'middle' }
              }

              if (colNumber === 20) {
                // Logs column – allow wrapping (shifted by +1)
                cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
              }
            })
          })
        } else {
          const row = worksheet.addRow([
            user.name,
            user.email,
            present,
            halfday,
            absent,
            leave,
            holiday,
              weeklyOff,
              formatOvertimeToHourLabel(overtime),
              formatWorkingHours(totalWorkingHours),
            totalDays,
            employeeStatus, // Use status from details array user object
            detail.status,
            detail.date,
            '-',
            '-',
            '-',
            detail.approved ? 'Yes' : 'No',
            detail.approvedBy || '-',
            logMessages,
          ])

          row.eachCell((cell, colNumber) => {
            cell.font = baseFont
            cell.border = thinBorderGray

            if (colNumber <= 2 || colNumber >= 13 && colNumber <= 16 || colNumber >= 18) {
              cell.alignment = centerMiddle
            } else if (
              colNumber >= 3 &&
              colNumber <= 11 &&
              typeof cell.value === 'number'
            ) {
              cell.alignment = rightMiddle
            } else {
              cell.alignment = { horizontal: 'left', vertical: 'middle' }
            }

            if (colNumber === 20) {
              cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
            }
          })
        }
      })
    })

      autoFitColumns(worksheet, { min: 10, max: 35 })
      worksheet.getColumn(1).width = 20
      worksheet.getColumn(2).width = 26
      worksheet.getColumn(19).width = 40
      worksheet.views = [{ state: 'frozen', ySplit: 2 }]
    })

    const filename =
      type === 'month'
        ? `Payroll_${month}_${year}.xlsx`
        : `Payroll_${userId}_${month}_${year}.xlsx`

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), filename)
    toast.success('Payroll Excel exported successfully')
  } catch (err) {
    toast.error('Error exporting Excel')
  } finally {
    setExporting(false)
  }
}

 

async function exportAttendanceMusterRoll1(singleUserData, month, year) {
  const {
    header,
    user,
    days,
    dailyStates,
    penaltyDays,
    totalWorkingHours,
    present,
    absent,
    halfday,
    weeklyOff,
    leave,
    holiday,
    netPresentDay,
    weekOfPresent,
    weekOfHalfDay,
    details,
    leaveCL,
    leaveEmergency,
    leavePenalty,
    leaveUL,
    totalDeductedDays,
  } = singleUserData.data

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Attendance Muster Roll')
  worksheet.properties.defaultRowHeight = 18

  const borderStyle = thinBorderGray

  // Header Row 1 - Company Name
  worksheet.mergeCells('A1:T1')
  const companyCell = worksheet.getCell('A1')
  companyCell.value = 'Real Apple Advisory Services'
  companyCell.font = companyFont
  companyCell.alignment = centerMiddle
  companyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF305496' } }

  // Header Row 2 - Report Title
  worksheet.mergeCells('A2:T2')
  const titleCell = worksheet.getCell('A2')
  titleCell.value = `Attendance Sheet - ${moment().month(month - 1).format('MMMM')} ${year}`
  titleCell.font = titleFont
  titleCell.alignment = centerMiddle
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }

  // Column Headers
  let headerRow = ['S.N.', 'Staff Name', 'Company Name', 'Branch', 'Designation', 'Status', 'Days']
  header.forEach((h) =>
    headerRow.push(`${h.weekday}\n${h.date.split('-')[2]}-${h.date.split('-')[1]}`),
  )
  headerRow.push(
    'Late Days',
    'Total Working Hrs',
    'Present',
    'Absent',
    'Half Day',
    'WO Half Days',
    'WO Present',
    'Weekly Off',
    'CL',
    'UL',
    'Emergency',
    'Penalty',
    'Add Ons',
    'Penalties',
    'Total Leave',
    'Deducted Days',
    'Holiday',
    'Net Present',
  )

  const singleTrailingHeaders = [
    'Present Days',
    'Absent Days',
    'Half Day Count',
    'Paid Leave',
    'Penalty Days (DD)',
    'Net Present',
  ]
  singleTrailingHeaders.forEach((h) => headerRow.push(h))

  const headerRowObj = worksheet.addRow(headerRow)
  headerRowObj.eachCell((cell) => {
    cell.font = headerFont
    cell.alignment = centerWrap
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B9BD5' } }
    cell.border = borderStyle
  })
  const singleHeaderRow = headerRowObj
  for (
    let i = singleHeaderRow.cellCount - singleTrailingHeaders.length + 1;
    i <= singleHeaderRow.cellCount;
    i++
  ) {
    const c = singleHeaderRow.getCell(i)
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }
    c.font = headerFont
    c.border = borderStyle
  }

  // Color Add Ons / Penalties headers
  singleHeaderRow.eachCell((cell) => {
    if (cell.value === 'Add Ons') {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } } // greenish
    }
    if (cell.value === 'Penalties') {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4CCCC' } } // reddish
    }
  })

  // DISPLAY STATES (same logic as before)
  const displayStates = header.map((h, idx) => {
    let state = dailyStates[idx] || ''
    const headerDate = h.date
    const weekday = h.weekday

    const dayDetail = details?.find((d) => d.date === headerDate)
    const rawDuration = parseMinutes(dayDetail?.total_duration_minutes || 0)
    const workingMinutes = rawDuration > 0 && rawDuration <= 24 ? rawDuration * 60 : rawDuration
    const hasPunch = Array.isArray(dayDetail?.sessions) && dayDetail.sessions.length > 0

    const isNotMarked =
      state === 'NotMarked' || state === '' || state === null || state === undefined

    const isSunday =
      weekday === 'Su' ||
      weekday === 'Sun' ||
      moment(headerDate, ['DD-MM-YYYY', 'YYYY-MM-DD']).day() === 0

    if (isSunday) {
      if (workingMinutes < 30) return 'WO'
      if (workingMinutes < 6 * 60) return 'WOH'
      return 'WOP'
    }

    if (isNotMarked) {
      const working = workingMinutes
      return working > 0 ? 'P' : 'A'
    }

    if (state === 'L') {
      const leaveDetail = details?.find((d) => d.date === headerDate && d.leaveType)
      return leaveDetail?.leaveType || 'L'
    }

    if (
      state === 'WO' ||
      state === 'WeeklyOff' ||
      state?.toString().toLowerCase().includes('weekly')
    ) {
      return 'WO'
    }

    return state
  })

  // Fixed Weekly Off: Count Sundays in the month based on joining date
  const joiningDate = user?.joining_date || user?.onboarding_date || singleUserData.data?.joining_date || singleUserData.data?.onboarding_date
  const fixedWeeklyOff = countSundaysInMonth(month, year, joiningDate)
  const weeklyOffOnly = fixedWeeklyOff // Always use calendar-based value
  const weeklyOffHalfDay = displayStates.filter((s) => s === 'WOH').length
  const weeklyOffPresent = displayStates.filter((s) => s === 'WOP').length

  const companyName =
    user.companyName ||
    user.company ||
    singleUserData.data?.companyName ||
    'Real Apple Advisory Services'

  // Get status from details array user object (as per user requirement)
  // Check all details items to find user.status, not just the first one
  let userStatus = singleUserData.data?.status || user?.status || 'active'
  if (singleUserData.data?.details && Array.isArray(singleUserData.data.details) && singleUserData.data.details.length > 0) {
    for (const detail of singleUserData.data.details) {
      if (detail?.user?.status) {
        userStatus = detail.user.status
        break
      }
    }
  }
  
  let userRow = [
    1,
    user.name || '-',
    companyName,
    user.branch || '-',
    user.designation || '-',
    userStatus,
    days,
    ...displayStates,
  ]

  const totalWorkingMinutes = getTotalWorkingMinutesFromDetails(details)
  const net_present_day_column = (present || 0) + weeklyOffPresent
  // compute add-ons / penalties totals for single user - filter by month and year
  const allAddonsPenalties = singleUserData.data.penalty_or_addon || []
  // Helper function to filter by month/year (local to this function)
  const filterByMonthYearLocal = (items, filterMonth, filterYear) => {
    if (!Array.isArray(items)) return []
    const monthStr = String(filterMonth).padStart(2, '0')
    const yearMonthPattern = `${filterYear}-${monthStr}`
    return items.filter((item) => {
      if (!item.date) return false
      return item.date.startsWith(yearMonthPattern)
    })
  }
  const monthFilteredItems = filterByMonthYearLocal(allAddonsPenalties, month, year)
  const singleAddOnsTotal = monthFilteredItems.filter((a) => a.type === 'addon').reduce((s, it) => s + (Number(it.amount) || 0), 0)
  const singlePenaltiesTotal = monthFilteredItems.filter((a) => a.type === 'penalty').reduce((s, it) => s + (Number(it.amount) || 0), 0)

  userRow.push(
    penaltyDays,
    formatWorkingHours(totalWorkingMinutes),
    present,
    absent,
    halfday,
    weeklyOffHalfDay,
    weeklyOffPresent,
    weeklyOffOnly,
    leaveCL,
    leaveUL,
    leaveEmergency,
    leavePenalty,
    singleAddOnsTotal,
    singlePenaltiesTotal,
    leave,
    totalDeductedDays,
    holiday,
    net_present_day_column,
  )

  const single_present_days = (present || 0) + weeklyOffPresent
  const single_absent_days = (absent || 0) + (leaveUL || 0) + (leaveEmergency || 0) + (leavePenalty || 0)
  const single_halfday_count = (halfday || 0) + weeklyOffHalfDay
  const single_paid_leave = (leaveCL || 0) + (holiday || 0) + weeklyOffOnly
  const single_penalty_days = leavePenalty || 0
  const single_net_present =
    single_present_days + single_halfday_count / 2 + single_paid_leave - totalDeductedDays

  userRow.push(
    single_present_days,
    single_absent_days,
    single_halfday_count,
    single_paid_leave,
    single_penalty_days,
    single_net_present,
  )

  const userRowObj = worksheet.addRow(userRow)
  userRowObj.eachCell((cell, colNumber) => {
    cell.font = baseFont
    cell.alignment = centerMiddle
    cell.border = borderStyle

    const val = cell.value
    if (val === 'P')
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92D050' } }
    if (val === 'A')
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }
    if (val === 'WO')
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }
    if (val?.toString()?.includes('L'))
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }
    if (val === 'HD')
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4B084' } }
    if (val === 'H')
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9DC3E6' } }
    if (val === 'WOP')
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5A6BD' } }
    if (val === 'WOH')
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4A7D6' } }
  })

  // IN / OUT / TWHR / OT Rows
  // Structure: [S.N., Staff Name, Company Name, Branch, Designation, Status, Days, ...daily dates]
  // So IN/OUT/TWHR/OT should be: [empty, empty, empty, empty, empty, empty (Status), 'IN'/'OUT'/'TWHR'/'OT', ...daily data]
  const inRow = ['', '', '', '', '', '', 'IN']
  const outRow = ['', '', '', '', '', '', 'OUT']
  const twhRow = ['', '', '', '', '', '', 'TWHR']
  const otRow = ['', '', '', '', '', '', 'OT']

  header.forEach((h) => {
    const detail = details.find((d) => d.date === h.date)
    if (detail && detail.sessions?.length > 0) {
      const firstIn = formatPunchTime(detail.sessions[0].punch_in)
      const lastSession = detail.sessions[detail.sessions.length - 1]
      const lastOut = formatPunchTime(lastSession?.punch_out)
      const totalHoursLabel = formatMinutesToHourLabel(detail.total_duration_minutes)
      inRow.push(firstIn)
      outRow.push(lastOut)
      twhRow.push(totalHoursLabel)
      otRow.push(formatOvertimeToHourLabel(detail.overtime_minutes))
    } else {
      inRow.push('-')
      outRow.push('-')
      twhRow.push('-')
      otRow.push('-')
    }
  })

  ;[inRow, outRow, twhRow, otRow].forEach((rowData, idx) => {
    const row = worksheet.addRow(rowData)
    row.eachCell((cell) => {
      cell.font = { ...baseFont, size: 9 }
      cell.alignment = centerMiddle
      cell.border = borderStyle
      if (idx === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
      }
    })
  })

  // Auto-fit + manual tweaks for better visual
  autoFitColumns(worksheet, { min: 6, max: 18 })

  // First columns slightly wider
  worksheet.getColumn(1).width = 5   // S.N.
  worksheet.getColumn(2).width = 20  // Staff Name
  worksheet.getColumn(3).width = 24  // Company
  worksheet.getColumn(4).width = 16  // Branch
  worksheet.getColumn(5).width = 16  // Designation
  worksheet.getColumn(6).width = 12  // Status (proper width for active/inactive)
  worksheet.getColumn(7).width = 6  // Days

  // Day columns slightly compact (start from column 8 now, since Status is column 6 and Days is column 7)
 const dayStartCol = 8
const dayEndCol = 7 + header.length
for (let c = dayStartCol; c <= dayEndCol; c++) {
  worksheet.getColumn(c).width = 7.5
}

  // Freeze header row + title
  worksheet.views = [{ state: 'frozen', ySplit: 3 }]

  const buf = await workbook.xlsx.writeBuffer()
  saveAs(
    new Blob([buf]),
    `Attendance_${user.name}_${moment().month(month - 1).format('MMM')}${year}.xlsx`,
  )
}


const exportAttendanceMusterRoll = async (data, monthArg, yearArg) => {
  try {
    if (!data?.header || !data?.rows) {
      toast.error('No muster data available to export')
      return
    }

    // Helper function to filter addons/penalties by month and year (local to this function)
    const filterByMonthYearLocal = (items, filterMonth, filterYear) => {
      if (!Array.isArray(items)) return []
      // Convert monthArg to numeric if it's a string like "January"
      const numericMonth = typeof filterMonth === 'string' ? moment(filterMonth, 'MMMM').month() + 1 : filterMonth
      const monthStr = String(numericMonth).padStart(2, '0')
      const yearMonthPattern = `${filterYear}-${monthStr}`
      return items.filter((item) => {
        if (!item.date) return false
        // Date format can be YYYY-MM-DD or YYYY-MM
        return item.date.startsWith(yearMonthPattern)
      })
    }

    // Split rows by active / inactive staff
    const activeRows = data.rows.filter((r) => isActiveStatus(getEmployeeStatusFromRow(r)))
    const inactiveRows = data.rows.filter((r) => !isActiveStatus(getEmployeeStatusFromRow(r)))
    const sheetGroups = [
      { name: 'Attendance Muster Roll - Active Staff', rows: activeRows },
      { name: 'Attendance Muster Roll - Inactive Staff', rows: inactiveRows },
    ]

    const workbook = new ExcelJS.Workbook()

    const staticHeaders = ['S/N', 'Staff Name', 'Company Name', 'RA Location', 'Designation', 'Status', 'Days']
    const summaryHeadersBase = [
      'Late Days',
      'Total Working Hrs',
      'Present',
      'Absent',
      'Half Day',
      'Weekly Off HalfDay',
      'Weekly Off Present',
      'Weekly Off',
      'CL Leave',
      'UL Leave',
      'Emergency Leave',
      'Penalty Leave',
      'Add Ons',
      'Penalties',
      'Holiday',
      'Overtime',
      'Net Present Day',
    ]
    const trailingHeaders = [
      'Present Days',
      'Absent Days',
      'Half Day Count',
      'Paid Leave',
      'Penalty Days (DD)',
      'Net Present',
    ]
    const summaryHeaders = [...summaryHeadersBase, ...trailingHeaders]

    sheetGroups.forEach(({ name: sheetName, rows }) => {
      const musterSheet = workbook.addWorksheet(sheetName, { properties: { defaultRowHeight: 18 } })
      musterSheet.properties.defaultRowHeight = 18

      musterSheet.mergeCells('A1:Z1')
      const titleCell = musterSheet.getCell('A1')
      titleCell.value = `${sheetName} - ${monthArg} ${yearArg}`
      titleCell.alignment = centerMiddle
      titleCell.font = companyFont
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF305496' } }

      const dayHeaders = data.header.map((h) => h.label)
      musterSheet.addRow([...staticHeaders, ...dayHeaders, ...summaryHeadersBase, ...trailingHeaders])
      const headerRow = musterSheet.getRow(2)
      headerRow.eachCell((cell) => {
        cell.font = headerFont
        cell.alignment = centerWrap
        cell.border = thinBorderGray
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
      })
      for (let i = headerRow.cellCount - trailingHeaders.length + 1; i <= headerRow.cellCount; i++) {
        const c = headerRow.getCell(i)
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }
        c.font = headerFont
        c.border = thinBorderGray
      }
      headerRow.eachCell((cell) => {
        if (cell.value === 'Add Ons') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }
        if (cell.value === 'Penalties') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4CCCC' } }
      })

      rows.forEach((row) => {
    const totalWorkingMinutes = getTotalWorkingMinutesFromDetails(row.details)
    const displayStates = row.dailyStates.map((state, i) => {
      const headerItem = data.header[i]
      const headerDate = headerItem.date
      const weekday = headerItem.weekday

      const dayDetail = row.details?.find((d) => d.date === headerDate)
      const rawDuration = parseMinutes(dayDetail?.total_duration_minutes || 0)
      const workingMinutes = rawDuration > 0 && rawDuration <= 24 ? rawDuration * 60 : rawDuration
      const hasPunch = Array.isArray(dayDetail?.sessions) && dayDetail.sessions.length > 0

      const isNotMarked =
        state === 'NotMarked' || state === '' || state === null || state === undefined

      const isSunday = weekday === 'Su' || weekday === 'Sun'

      if (isSunday) {
        if (workingMinutes < 30) return 'WO'
        if (workingMinutes < 6 * 60) return 'WOH'
        return 'WOP'
      }

      if (isNotMarked) {
        const working = workingMinutes
        return working > 0 ? 'P' : 'A'
      }

      if (state === 'L') {
        const leaveDetail = row.details?.find((d) => d.date === headerDate && d.leaveType)
        return leaveDetail?.leaveType || 'L'
      }

      if (
        state === 'WO' ||
        state === 'WeeklyOff' ||
        state?.toString().toLowerCase().includes('weekly')
      ) {
        return 'WO'
      }

      return state
    })

    // Fixed Weekly Off: Count Sundays in the month based on joining date
    const joiningDate = row.joining_date || row.onboarding_date || row.user?.joining_date || row.user?.onboarding_date
    const fixedWeeklyOff = countSundaysInMonth(monthArg, yearArg, joiningDate)
    const weeklyOffOnly = fixedWeeklyOff // Always use calendar-based value
    const weeklyOffHalfDay = displayStates.filter((s) => s === 'WOH').length
    const weeklyOffPresent = displayStates.filter((s) => s === 'WOP').length

    row._weeklyOffOnly = weeklyOffOnly
    row._weeklyOffHalfDay = weeklyOffHalfDay
    row._weeklyOffPresent = weeklyOffPresent

    const net_present_day_column = (row.present || 0) + weeklyOffPresent

    // compute add-ons / penalties totals - filter by month and year
    const allAddonsPenalties = row.penalty_or_addon || []
    const monthFilteredItems = filterByMonthYearLocal(allAddonsPenalties, monthArg, yearArg)
    const addOnsTotal = monthFilteredItems.filter((a) => a.type === 'addon').reduce((s, it) => s + (Number(it.amount) || 0), 0)
    const penaltiesTotal = monthFilteredItems.filter((a) => a.type === 'penalty').reduce((s, it) => s + (Number(it.amount) || 0), 0)

    // Get status from details array user object (as per user requirement)
    // Check all details items to find user.status, not just the first one
    let employeeStatus = row.status || 'active'
    if (row.details && Array.isArray(row.details) && row.details.length > 0) {
      for (const detail of row.details) {
        if (detail?.user?.status) {
          employeeStatus = detail.user.status
          break
        }
      }
    }

    // Safe getter for RA Location - extract label if it's an object
    const ra_location = 
      (typeof row.ra_location === 'object' && row.ra_location?.label) 
        ? row.ra_location.label 
        : (row.ra_location || row.branch || row.user?.branch || '-')

  
    const rowData = [
      row.sn,
      row.name,
      row.company_name,
      ra_location,
      row.designation,
      employeeStatus,
      row.days,
      ...displayStates,
     getLateDays(row.details),
      formatWorkingHours(totalWorkingMinutes),
      row.present,
      row.absent,
      row.halfday,
      weeklyOffHalfDay,
      weeklyOffPresent,
      weeklyOffOnly,
      row.leaveCL,
      row.leaveUL,
      row.leaveEmergency,
      // row.leavePenalty,
      (row.leavePenalty || 0) * 2,
      addOnsTotal,
      penaltiesTotal,
      row.holiday,
      formatOvertimeToHourLabel(row.overtime), 
      net_present_day_column,
    ]

    const present_days = (row.present || 0) + weeklyOffPresent
    const absent_days = (row.absent || 0) + (row.leaveUL || 0) + (row.leaveEmergency || 0) + (row.leavePenalty || 0)
    const halfday_count = (row.halfday || 0) + weeklyOffHalfDay
    const paid_leave = (row.leaveCL || 0) + (row.holiday || 0) + weeklyOffOnly
    const penalty_days_calc = row.leavePenalty || 0
    // const penalty_days_calc = (row.leavePenalty || 0) * 2
    const penalty_days_calc_net = (row.leavePenalty || 0) * 2
    const net_present_calc =
      present_days + halfday_count / 2 + paid_leave - penalty_days_calc_net

    rowData.push(
      present_days,
      absent_days,
      halfday_count,
      paid_leave,
      penalty_days_calc,
      net_present_calc,
    )

    const excelRow = musterSheet.addRow(rowData)

    excelRow.eachCell((cell) => {
      cell.font = baseFont
      cell.border = thinBorderGray
      cell.alignment = centerMiddle

      const value = cell.value?.toString()
     if (value === 'P') {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } } // white
    cell.font = {  color: { argb: 'FF000000' } } 
  }
      if (value === 'A')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } }
      if (value === 'HD')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } }
      if (value === 'WO')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB7DEE8' } }
      if (value === 'H')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCC0DA' } }
      if (value === 'CL')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDAE3F3' } }
      if (value === 'UL')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
      if (value === 'Emergency')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }
      if (value === 'Penalty')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4CCCC' } }
      if (value === 'WOP')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5A6BD' } }
      if (value === 'WOH')
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4A7D6' } }
    })

    // IN, OUT, TWHR, OT rows same as before, just styling consistent
    const infoTypes = ['IN', 'OUT', 'TWHR', 'OT']
    infoTypes.forEach((type) => {
      const rowValues = [
        '',
        '',
        '',
        '',
        '',
        '',
        type,
        ...data.header.map((h) => {
          const dayDetail = row.details.find((d) => d.date === h.date)
          if (type === 'IN')
            return dayDetail?.sessions?.[0]?.punch_in
              ? moment(dayDetail.sessions[0].punch_in).format('HH:mm')
              : '-'
          if (type === 'OUT') {
            const lastSession = dayDetail?.sessions?.slice(-1)?.[0]
            return lastSession?.punch_out ? moment(lastSession.punch_out).format('HH:mm') : '-'
          }
          if (type === 'TWHR') return formatMinutesToHourLabel(dayDetail?.total_duration_minutes)
          if (type === 'OT') return formatOvertimeToHourLabel(dayDetail?.overtime_minutes)
        }),
      ]

      const infoRow = musterSheet.addRow(rowValues)
      infoRow.eachCell((cell) => {
        cell.border = thinBorderGray
        cell.alignment = centerMiddle
        cell.font = { ...baseFont, size: 9 }
      })
    })
  })

      autoFitColumns(musterSheet, { min: 6, max: 20 })
      musterSheet.getColumn(1).width = 5
      musterSheet.getColumn(2).width = 20
      musterSheet.getColumn(3).width = 22
      musterSheet.getColumn(4).width = 16
      musterSheet.getColumn(5).width = 16
      musterSheet.getColumn(6).width = 12
      musterSheet.getColumn(7).width = 6
      const dayStartCol = 8
      const dayEndCol = 7 + data.header.length
      for (let c = dayStartCol; c <= dayEndCol; c++) {
        musterSheet.getColumn(c).width = 7.5
      }
      musterSheet.views = [{ state: 'frozen', ySplit: 2 }]
    })

    // === Monthly Summary Sheets - Active Staff & Inactive Staff ===
    const numericMonth = typeof monthArg === 'string' ? moment(monthArg, 'MMMM').month() + 1 : monthArg
    const summaryGroups = [
      { name: 'Monthly Summary - Active Staff', rows: activeRows },
      { name: 'Monthly Summary - Inactive Staff', rows: inactiveRows },
    ]

    const summaryHeadersArr = [
      'Employee Name',
      'Branch',
      'Designation',
      'Status',
      'Present',
      'Absent',
      'Half Day',
      'Weekly Off',
      'Holiday',
      'CL Leave',
      'UL Leave',
      'Emergency Leave',
      'Penalty Leave',
      'Add Ons',
      'Penalties',
      'Overtime',
      'Net Present Day',
    ]

    summaryGroups.forEach(({ name: summarySheetName, rows: summaryRows }) => {
      const summarySheet = workbook.addWorksheet(summarySheetName, { properties: { defaultRowHeight: 18 } })
      summarySheet.properties.defaultRowHeight = 18

      summarySheet.mergeCells('A1:N1')
      summarySheet.getCell('A1').value = `${summarySheetName} - ${monthArg} ${yearArg}`
      summarySheet.getCell('A1').alignment = centerMiddle
      summarySheet.getCell('A1').font = companyFont
      summarySheet.getCell('A1').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF305496' },
      }
      summarySheet.addRow(summaryHeadersArr)

      const sHeader = summarySheet.getRow(2)
      sHeader.eachCell((cell) => {
        cell.font = headerFont
        cell.alignment = centerWrap
        cell.border = thinBorderGray
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
      })

      summaryRows.forEach((row) => {
    // Weekly Off Total should only be the calendar-based Sundays based on joining date
    const joiningDate = row.joining_date || row.onboarding_date || row.user?.joining_date || row.user?.onboarding_date
    const weeklyOffTotal = countSundaysInMonth(numericMonth, yearArg, joiningDate)
    // Filter addons/penalties by month and year
    const allAddonsPenalties = row.penalty_or_addon || []
    const monthFilteredItems = filterByMonthYear(allAddonsPenalties, monthArg, yearArg)
    const addOnsTotal = monthFilteredItems.filter((a) => a.type === 'addon').reduce((s, it) => s + (Number(it.amount) || 0), 0)
    const penaltiesTotal = monthFilteredItems.filter((a) => a.type === 'penalty').reduce((s, it) => s + (Number(it.amount) || 0), 0)

    // Get status from details array user object (as per user requirement)
    // Check all details items to find user.status, not just the first one
    let employeeStatus = row.status || 'active'
    if (row.details && Array.isArray(row.details) && row.details.length > 0) {
      for (const detail of row.details) {
        if (detail?.user?.status) {
          employeeStatus = detail.user.status
          break
        }
      }
    }

    const r = summarySheet.addRow([
      row.name,
      row.branch,
      row.designation,
      employeeStatus,
      row.present,
      row.absent,
      row.halfday,
      weeklyOffTotal,
      row.holiday,
      row.leaveCL,
      row.leaveUL,
      row.leaveEmergency,
      row.leavePenalty,
      addOnsTotal,
      penaltiesTotal,
      formatOvertimeToHourLabel(row.overtime), 
      row.netPresentDay,
    ])

    r.eachCell((cell, colNumber) => {
      cell.font = baseFont
      cell.border = thinBorderGray
      if (colNumber <= 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' }
      } else {
        cell.alignment = rightMiddle
      }
    })
  })

      autoFitColumns(summarySheet, { min: 10, max: 22 })
      summarySheet.views = [{ state: 'frozen', ySplit: 2 }]
    })

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), `Attendance_Muster_${monthArg}_${yearArg}.xlsx`)
  } catch (err) {
    console.error('Error exporting attendance muster roll:', err)
    toast.error(`Failed to export: ${err?.message || 'Unknown error'}`)
    throw err // Re-throw to be caught by generatePayroll
  }
}



  // -----------------------
  // Fetch managers (kept original logic)
  // -----------------------
  const fetchManagers = async () => {
    try {
      const slugs = [
        process.env.REACT_APP_ADMIN,
        process.env.REACT_APP_COO,
        process.env.REACT_APP_FE,
        process.env.REACT_APP_RA,
        process.env.REACT_APP_SFO,
        process.env.REACT_APP_SDM,
        process.env.REACT_APP_DM,
        process.env.REACT_APP_RC,
        process.env.REACT_APP_LCTO,
        process.env.REACT_APP_CTO,
      ]
      const queryString = slugs.join(',')
      // original API call
      const response = await new BasicProvider('admins?page=1&count=1000').getRequest()
      const staff = response.data.data || []
      const managerOptions = staff.map((manager) => ({
        value: manager._id,
        label: `${manager.name}`,
      }))
      setManagers(managerOptions)
    } catch (error) {
      console.error('Error fetching managers:', error)
      toast.error('Failed to load employees list')
    }
  }

  useEffect(() => {
    fetchManagers()
  }, [])

  // keep existing behavior: selectedUser -> userId
  useEffect(() => {
    if (selectedUser?.value) {
      setUserId(selectedUser.value)
    } else {
      setUserId('')
    }
  }, [selectedUser])

  // -----------------------
  // NEW: safe fetch for muster data then export (fix undefined `data` issue)
  // -----------------------
  const handleExportMuster = async () => {
    setLoading(true)
    try {
      // replace this endpoint with your actual muster endpoint if different
      const url = `attendances/admin/muster?month=${month}&year=${year}`
      const res = await new BasicProvider(url).getRequest()
      if (res?.status === 'success' && res?.data) {
        // call your existing function with proper args
        await exportAttendanceMusterRoll(
          res.data,
          moment()
            .month(month - 1)
            .format('MMMM'),
          year,
        )
      } else {
        toast.error('No muster data available for selected month/year')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch muster data')
    } finally {
      setLoading(false)
    }
  }

const exportSalarySheet = async (data, monthArg, yearArg) => {
  try {
    const header = data?.header || data?.data?.header || []
    const rows = data?.rows || data?.data?.rows || []

    if (!header.length || !rows.length) {
      toast.error('No muster data available to export')
      return
    }

    // Helper function to filter addons/penalties by month and year (local to this function)
    const filterByMonthYearLocal = (items, filterMonth, filterYear) => {
      if (!Array.isArray(items)) return []
      // Convert monthArg to numeric if it's a string like "January"
      const numericMonth = typeof filterMonth === 'string' ? moment(filterMonth, 'MMMM').month() + 1 : filterMonth
      const monthStr = String(numericMonth).padStart(2, '0')
      const yearMonthPattern = `${filterYear}-${monthStr}`
      return items.filter((item) => {
        if (!item.date) return false
        // Date format can be YYYY-MM-DD or YYYY-MM
        return item.date.startsWith(yearMonthPattern)
      })
    }

    const activeRows = rows.filter((r) => isActiveStatus(getEmployeeStatusFromRow(r)))
    const inactiveRows = rows.filter((r) => !isActiveStatus(getEmployeeStatusFromRow(r)))
    const salarySheetGroups = [
      { name: 'Salary Sheet - Active Staff', rows: activeRows },
      { name: 'Salary Sheet - Inactive Staff', rows: inactiveRows },
    ]

    const workbook = new ExcelJS.Workbook()
    const toNum = (v) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }
    const salaryMonthLabel = `${monthArg} ${String(yearArg).slice(-2)}`
    const activeSummaryRows = []
    const inactiveSummaryRows = []

    const staticHeaders = ['S/N', 'Staff Name', 'Company Name', 'RA Location', 'Designation', 'Status', 'Days']
    const summaryHeadersBase = [
      'Late Days',
      'Total Working Hrs',
      'Present',
      'Absent',
      'Half Day',
      'Weekly Off HalfDay',
      'Weekly Off Present',
      'Weekly Off',
      'CL Leave',
      'UL Leave',
      'Emergency Leave',
      'Penalty Leave',
      'Add Ons',
      'Penalties',
      'Holiday',
      'Overtime',
      'Net Present Day',
    ]
    const trailingHeaders = [
      'Present Days',
      'Absent Days',
      'Half Day Count',
      'Paid Leave',
      'Penalty Days (DD)',
      'Net Present',
    ]
    const summaryHeaders = [...summaryHeadersBase, ...trailingHeaders]

    salarySheetGroups.forEach(({ name: sheetName, rows: sheetRows }) => {
      const sheet = workbook.addWorksheet(sheetName, { properties: { defaultRowHeight: 18 } })
      sheet.properties.defaultRowHeight = 18

      sheet.mergeCells('A1:Z1')
      const titleCell = sheet.getCell('A1')
      titleCell.value = `${sheetName} - ${monthArg} ${yearArg}`
      titleCell.alignment = centerMiddle
      titleCell.font = companyFont
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF305496' },
      }

      const dayHeaders = header.map((h) => h.label || `${h.weekday}\n${h.date?.split('-')?.[2] || ''}`)
      sheet.addRow([...staticHeaders, ...dayHeaders, ...summaryHeaders])

      const headerRow = sheet.getRow(2)
      headerRow.eachCell((cell) => {
        cell.font = headerFont
        cell.alignment = centerWrap
        cell.border = thinBorderGray
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
      })
      for (let i = headerRow.cellCount - trailingHeaders.length + 1; i <= headerRow.cellCount; i++) {
        const c = headerRow.getCell(i)
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }
        c.font = headerFont
        c.border = thinBorderGray
      }
      headerRow.eachCell((cell) => {
        if (cell.value === 'Add Ons') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }
        if (cell.value === 'Penalties') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4CCCC' } }
      })

      sheetRows.forEach((row) => {
      const details = row.details || []
      const totalWorkingMinutes = getTotalWorkingMinutesFromDetails(details)

      const displayStates = (row.dailyStates || []).map((state, i) => {
        const headerItem = header[i] || {}
        const headerDate = headerItem.date
        const weekday = headerItem.weekday

        const dayDetail = details.find((d) => d.date === headerDate) || {}
        const rawDuration = parseMinutes(dayDetail?.total_duration_minutes || 0)
        const workingMinutes = rawDuration > 0 && rawDuration <= 24 ? rawDuration * 60 : rawDuration

        const isNotMarked = state === 'NotMarked' || state === '' || state === null || state === undefined

        const isSunday = weekday === 'Su' || weekday === 'Sun'

        if (isSunday) {
          if (workingMinutes < 30) return 'WO'
          if (workingMinutes < 6 * 60) return 'WOH'
          return 'WOP'
        }

        if (isNotMarked) return workingMinutes > 0 ? 'P' : 'A'

        if (state === 'L') {
          const leaveDetail = details.find((d) => d.date === headerDate && d.leaveType)
          return leaveDetail?.leaveType || 'L'
        }

        if (state === 'WO' || state === 'WeeklyOff' || state?.toString().toLowerCase().includes('weekly')) {
          return 'WO'
        }

        return state
      })

      // Fixed Weekly Off: Count Sundays in the month based on joining date
      // Convert monthArg (string like "January") to numeric month (1-12)
      const numericMonth = typeof monthArg === 'string' ? moment(monthArg, 'MMMM').month() + 1 : monthArg
      const joiningDate = row.joining_date || row.onboarding_date || row.user?.joining_date || row.user?.onboarding_date
      const fixedWeeklyOff = countSundaysInMonth(numericMonth, yearArg, joiningDate)
      const weeklyOffOnly = fixedWeeklyOff // Always use calendar-based value
      const weeklyOffHalfDay = displayStates.filter((s) => s === 'WOH').length
      const weeklyOffPresent = displayStates.filter((s) => s === 'WOP').length

      const net_present_day_column = (row.present || 0) + weeklyOffPresent

      // Filter addons/penalties by month and year
      const allAddonsPenalties = row.penalty_or_addon || []
      const monthFilteredItems = filterByMonthYearLocal(allAddonsPenalties, monthArg, yearArg)
      const addOnsTotal = monthFilteredItems.filter((a) => a.type === 'addon').reduce((s, it) => s + (Number(it.amount) || 0), 0)
      const penaltiesTotal = monthFilteredItems.filter((a) => a.type === 'penalty').reduce((s, it) => s + (Number(it.amount) || 0), 0)

      // Safe getters for fields that may change shape
      const name = row.name || row.user?.name || row.userName || '-'
      const company = row.company_name || row.company || row.user?.companyName || '-'
      // Safe getter for RA Location - extract label if it's an object
      const ra_location = 
        (typeof row.ra_location === 'object' && row.ra_location?.label) 
          ? row.ra_location.label 
          : (row.ra_location || row.branch || row.user?.branch || '-')
  
      // Get status from details array user object (as per user requirement)
      // Check all details items to find user.status, not just the first one
      let employeeStatus = row.status || 'active'
      if (details && Array.isArray(details) && details.length > 0) {
        for (const detail of details) {
          if (detail?.user?.status) {
            employeeStatus = detail.user.status
            break
          }
        }
      }

      const rowData = [
        row.sn || row.sn_no || '-',
        name,
        company,
        ra_location,
        designation,
        employeeStatus,
        row.days || '-',
        ...displayStates,
        getLateDays(details),
        formatWorkingHours(totalWorkingMinutes),
        row.present || 0,
        row.absent || 0,
        row.halfday || 0,
        weeklyOffHalfDay,
        weeklyOffPresent,
        weeklyOffOnly,
        row.leaveCL || 0,
        row.leaveUL || 0,
        row.leaveEmergency || 0,
        (row.leavePenalty || 0) * 2,
        addOnsTotal,
        penaltiesTotal,
        row.holiday || 0,
        formatOvertimeToHourLabel(row.overtime || 0),
        net_present_day_column,
      ]

      const present_days = (row.present || 0) + weeklyOffPresent
      const absent_days = (row.absent || 0) + (row.leaveUL || 0) + (row.leaveEmergency || 0) + (row.leavePenalty || 0)
      const halfday_count = (row.halfday || 0) + weeklyOffHalfDay
      const paid_leave = (row.leaveCL || 0) + (row.holiday || 0) + weeklyOffOnly
      const penalty_days_calc = row.leavePenalty || 0
      const penalty_days_calc_net = (row.leavePenalty || 0) * 2
      const net_present_calc = present_days + halfday_count / 2 + paid_leave - penalty_days_calc_net

      rowData.push(present_days, absent_days, halfday_count, paid_leave, penalty_days_calc, net_present_calc)

      // ---- Salary Sheet Summary row build (uses existing computed attendance totals) ----
      // Fields from API sample:
      // - ctc_per_month, hra_per_month, basic_per_month, bank_details, joining_date/onboarding_date, location/ra_location
      const bank = row.bank_details || row.user?.bank_details || {}
      const dojRaw =
        row.joining_date || row.onboarding_date || row.user?.joining_date || row.user?.onboarding_date
      // Your sample shows "Aug-25" style for DOJ
      const doj =
        dojRaw && moment(dojRaw).isValid() ? moment(dojRaw).format('MMM-YY') : ''

      const daysInMonth = toNum(row.days || header.length || 0)

      // Monthly components (from API; keep extremely defensive)
      const revisedBasic = toNum(row.ctc_per_month || row.revised_basic_per_month || row.revised_basic || 0)
      const incentive = toNum(row.incentive_per_month || row.incentive || 0)
      const hra = toNum(row.hra_per_month || 0)

      // Travel/Bike placeholders (no explicit fields in current payroll response)
      const travelW1 = 0
      const travelW2 = 0
      const travelW3 = 0
      const travelW4 = 0
      const bikeService = 0

      // Attendance numbers (match your enterprise sample row)
      const presentDaysCol = toNum(present_days) // (P + WOP) — WO is included in Paid Leave per requirement
      const absentDaysA = toNum(row.absent || 0)
      // Half Day column should be Halfday + WOH (weekoff halfday), represented in DAYS (0.5, 1.0, ...)
      const halfDayDays = (toNum(row.halfday || 0) + toNum(weeklyOffHalfDay)) / 2
      // Paid Leave column should be CL (casual leave) + WO + Holiday (H)
      const paidLeaveCol = toNum(row.leaveCL || 0) + toNum(row.holiday || 0) + toNum(weeklyOffOnly)
      const penaltyDaysDD = toNum(penalty_days_calc_net) // already in "DD" units used by net_present_calc

      // Total Present Days (exactly like existing net_present_calc used in the first sheet)
      const totalPresentDays = toNum(net_present_calc)

      // -------- Salary math (matches your example: 12000/31*32.5 => 12581) --------
      // Basic Salary of the Month is prorated ONLY on Revised Basic Salary.
      const basicSalaryOfMonth =
        daysInMonth > 0 ? Math.round((revisedBasic / daysInMonth) * totalPresentDays) : 0

      // Adjustments/deductions:
      // - penalty_or_addon entries are month-scoped (see AddOnList/PenaltyList screens)
      // We map them conservatively to "Last Month Leave Adj." (net add/penalty).
      // Advance Deduction is kept separate (if backend provides it).
      const addOnsTotalNum = toNum(addOnsTotal)
      const penaltiesTotalNum = toNum(penaltiesTotal)
      const lastMonthLeaveAdj = addOnsTotalNum - penaltiesTotalNum

      const roiDeduction = toNum(row.roi_deduction || row.roiDeduction || 0)
      const advanceDeductionOrPenalty = toNum(
        row.advance_deduction ||
          row.advanceDeduction ||
          row.advance_deduction_amount ||
          row.advance_penalty ||
          0,
      )
      const extraPaidOrLastMonthAdj = toNum(row.extra_paid || row.extraPaid || 0)
      const paidForCash = toNum(row.paid_for_cash || row.paidForCash || 0)

      // Current Month Salary
      const currentMonthSalary = Math.round(
        basicSalaryOfMonth +
          incentive +
          hra +
          travelW1 +
          travelW2 +
          travelW3 +
          travelW4 +
          bikeService +
          lastMonthLeaveAdj +
          extraPaidOrLastMonthAdj -
          roiDeduction -
          advanceDeductionOrPenalty,
      )

      const amountOfMonth = Math.round(currentMonthSalary + paidForCash)

      const summaryRow = [
        row.sn || row.sn_no || '-',
        doj,
        name,
        company,
        name,
        employeeStatus,
        String(bank.account_number || ''),
        String(bank.ifsc_code || ''),
        String(bank.bank_name || ''),
        row.work_location || row.location || '',
        ra_location,
        revisedBasic,
        incentive,
        hra,
        daysInMonth,
        travelW1,
        travelW2,
        travelW3,
        travelW4,
        bikeService,
        presentDaysCol,
        absentDaysA,
        halfDayDays,
        paidLeaveCol,
        penaltyDaysDD,
        lastMonthLeaveAdj,
        totalPresentDays,
        basicSalaryOfMonth,
        roiDeduction,
        advanceDeductionOrPenalty,
        currentMonthSalary,
        extraPaidOrLastMonthAdj,
        paidForCash,
        amountOfMonth,
        '',
        '',
      ]
      if (isActiveStatus(employeeStatus)) {
        activeSummaryRows.push(summaryRow)
      } else {
        inactiveSummaryRows.push(summaryRow)
      }

      const excelRow = sheet.addRow(rowData)
      excelRow.eachCell((cell) => {
        cell.font = baseFont
        cell.border = thinBorderGray
        cell.alignment = centerMiddle

        const value = cell.value?.toString()
        if (value === 'P') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
          cell.font = { color: { argb: 'FF000000' } }
        }
        if (value === 'A') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } }
        if (value === 'HD') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } }
        if (value === 'WO') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB7DEE8' } }
        if (value === 'H') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCC0DA' } }
        if (value === 'CL') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDAE3F3' } }
        if (value === 'UL') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }
        if (value === 'Emergency') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }
        if (value === 'Penalty') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4CCCC' } }
        if (value === 'WOP') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5A6BD' } }
        if (value === 'WOH') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4A7D6' } }
      })
    })

      autoFitColumns(sheet, { min: 6, max: 20 })
      sheet.getColumn(1).width = 5
      sheet.getColumn(2).width = 20
      sheet.getColumn(3).width = 22
      sheet.getColumn(4).width = 16
      sheet.getColumn(5).width = 16
      sheet.getColumn(6).width = 12
      sheet.getColumn(7).width = 6
      const dayStartCol = 8
      const dayEndCol = 7 + header.length
      for (let c = dayStartCol; c <= dayEndCol; c++) {
        sheet.getColumn(c).width = 7.5
      }
      sheet.views = [{ state: 'frozen', ySplit: 2 }]
    })

    // -----------------------
    // Build "Salary Sheet Summary - Active Staff" & "Salary Sheet Summary - Inactive Staff"
    // -----------------------
    const summarySheetGroups = [
      { name: 'Salary Sheet Summary - Active Staff', rows: activeSummaryRows },
      { name: 'Salary Sheet Summary - Inactive Staff', rows: inactiveSummaryRows },
    ]

    summarySheetGroups.forEach(({ name: summarySheetName, rows: salarySummaryRows }) => {
      const summarySheet = workbook.addWorksheet(summarySheetName, { properties: { defaultRowHeight: 18 } })
      summarySheet.properties.defaultRowHeight = 18

      summarySheet.mergeCells('A1:AJ1')
      const summaryTitleCell = summarySheet.getCell('A1')
      summaryTitleCell.value = `${summarySheetName} - ${monthArg} ${yearArg}`
    summaryTitleCell.alignment = centerMiddle
    summaryTitleCell.font = companyFont
    summaryTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF305496' } }

    // Header text exactly like your sheet (with line breaks where you provided them)
    const salarySummaryHeaders = [
      'S.No',
      'DOJ',
      'Name of Employee',
      'Company',
      'Name of Employee',
      'Status',
      'Account No.',
      'IFSC Code',
      'Bank Name',
      'Sub Location',
      'RA Branch',
      `${salaryMonthLabel} Revised Basic Salary`,
      'Incentive',
      'Room \nRent (HRA)',
      'Days in Month',
      'Traveling\nExpensesOf Week 1',
      'Traveling\nExpensesOf Week 2',
      'Traveling\nExpensesOf Week 3',
      'Traveling\nExpensesOf Week 4',
      'Bike\nService',
      'Present\nDays (P+WO+WOP)',
      'Absent\nDays (A)',
      'Half Day (HD)',
      'Paid Leave (L+WO)',
      'Penalty Days (DD)',
      'Last Month Leave Adj. (add/penalty)',
      'Total Present Days',
      'Basic Salary of the Month',
      'ROI Deduction',
      'Advance Deduction / Penalty',
      'Current Month Salary',
      'Extra Paid/Last Month Adju.',
      'Paid For Cash',
      'Amount of the Month',
      'Remark 1',
      'Remark 2',
    ]

    summarySheet.addRow(salarySummaryHeaders)
    const sHeaderRow = summarySheet.getRow(2)
    sHeaderRow.eachCell((cell) => {
      cell.font = headerFont
      cell.alignment = centerWrap
      cell.border = thinBorderGray
      // Green header like your sample sheet
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00A65A' } }
    })

      salarySummaryRows.forEach((r) => summarySheet.addRow(r))

    // Column color bands (rows 3..end) to make it enterprise-friendly & beautiful like your screenshot
    const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })
    const fillsByCol = {
      // Yellow: Company + Name columns
      4: fill('FFFFEB9C'),
      5: fill('FFFFEB9C'),

      // Status column - light gray
      6: fill('FFE7E6E6'),

      // Cyan: location/branch (shifted by +1 due to Status column)
      10: fill('FFB7DEE8'),
      11: fill('FFB7DEE8'),

      // Peach: Revised basic salary (shifted by +1)
      12: fill('FFFCE4D6'),

      // Purple: Incentive + HRA (shifted by +1)
      13: fill('FFD9D2E9'),
      14: fill('FFD9D2E9'),

      // Lavender: Days in month (shifted by +1)
      15: fill('FFB4A7D6'),

      // Light purple: weekly travel/bike (shifted by +1)
      16: fill('FFD9D2E9'),
      17: fill('FFD9D2E9'),
      18: fill('FFD9D2E9'),
      19: fill('FFD9D2E9'),
      20: fill('FFD9D2E9'),

      // Light blue: attendance block (shifted by +1)
      21: fill('FFBDD7EE'),
      22: fill('FFBDD7EE'),
      23: fill('FFBDD7EE'),
      24: fill('FFBDD7EE'),
      25: fill('FFBDD7EE'),

      // Yellow highlight: last month adj + extra (shifted by +1)
      26: fill('FFFFF2CC'),
      32: fill('FFFFF2CC'),

      // Light blue: totals (shifted by +1)
      27: fill('FFBDD7EE'),
      28: fill('FFBDD7EE'),

      // Orange: ROI + Advance/Penalty + Paid for cash (shifted by +1)
      29: fill('FFF4B084'),
      30: fill('FFF4B084'),
      33: fill('FFF4B084'),

      // Green: current month salary (shifted by +1)
      31: fill('FFC6EFCE'),

      // Blue: amount of month (shifted by +1)
      34: fill('FF9DC3E6'),

      // Light blue for remarks (shifted by +1)
      35: fill('FFDEEAF6'),
      36: fill('FFDEEAF6'),
    }

    // Apply fills + bold key numeric columns
    const lastRowNumber = summarySheet.rowCount
    for (let r = 3; r <= lastRowNumber; r++) {
      const rowObj = summarySheet.getRow(r)
      Object.entries(fillsByCol).forEach(([colStr, f]) => {
        const col = Number(colStr)
        const cell = rowObj.getCell(col)
        cell.fill = f
      })
      // Bold key columns (like your sample sheet) - shifted by +1 due to Status column
      ;[12, 27, 28, 31, 34].forEach((col) => {
        const cell = rowObj.getCell(col)
        cell.font = { ...baseFont, bold: true }
      })
    }

    // Add filters like the Google sheet header row
    summarySheet.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: 2, column: 36 }, // A..AJ (added Status column)
    }

    // Formatting (1-based columns) - shifted by +1 due to Status column:
    // Money: 12..14, 16..20, 26, 28..34
    ;[12, 13, 14, 16, 17, 18, 19, 20, 26, 28, 29, 30, 31, 32, 33, 34].forEach((idx) => {
      summarySheet.getColumn(idx).numFmt = '#,##0'
    })
    // Day/count columns (integers) - shifted by +1
    ;[15, 21, 22, 24, 25].forEach((idx) => {
      summarySheet.getColumn(idx).numFmt = '0'
    })
    // Day columns that can be fractional (Half Day, Total Present Days) - shifted by +1
    ;[23, 27].forEach((idx) => {
      summarySheet.getColumn(idx).numFmt = '0.0'
    })

    // Style all body cells with borders/alignment (keep it readable like a pro)
    // Match existing sheet feel: borders everywhere, left-align key text cols, center numbers
    summarySheet.eachRow({ includeEmpty: false }, (rowObj, rowNumber) => {
      if (rowNumber <= 2) return
      rowObj.eachCell((cell, colNumber) => {
        cell.font = baseFont
        cell.border = thinBorderGray
        // Name/company columns left, everything else centered - Status column (6) centered
        if (colNumber === 3 || colNumber === 4 || colNumber === 5 || colNumber === 9 || colNumber === 10 || colNumber === 11) {
          cell.alignment = { horizontal: 'left', vertical: 'middle' }
        } else {
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
        }
      })
    })

    // Header row wrap + height for multiline headers (like other sheets)
      summarySheet.getRow(2).height = 36

      summarySheet.getColumn(1).width = 6
      summarySheet.getColumn(2).width = 10
      summarySheet.getColumn(3).width = 22
      summarySheet.getColumn(4).width = 18
      summarySheet.getColumn(5).width = 22
      summarySheet.getColumn(6).width = 18
      summarySheet.getColumn(7).width = 14
      summarySheet.getColumn(8).width = 16
      summarySheet.getColumn(9).width = 14
      summarySheet.getColumn(10).width = 14
      autoFitColumns(summarySheet, { min: 10, max: 28 })

      summarySheet.views = [{ state: 'frozen', ySplit: 2 }]
    })

    const buffer = await workbook.xlsx.writeBuffer()
    saveAs(new Blob([buffer]), `Salary_Sheet_${monthArg}_${yearArg}.xlsx`)
  } catch (err) {
    console.error('Error exporting salary sheet', err)
    toast.error('Failed to export salary sheet')
  }
}

  // -----------------------
  // CL-UL Sheet Export
  // -----------------------
  const exportCLULSheet = async () => {
    setLoading(true)
    try {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`
      const url = `leaves/monthly-summary?month=${monthStr}&page=1&count=1000`
      const res = await new BasicProvider(url).getRequest()
      
      if (!res?.data || !Array.isArray(res.data)) {
        toast.error('No leave data available for selected month/year')
        return
      }

      const monthName = moment().month(month - 1).format('MMMM')
      const monthYearLabel = `${monthName} ${year}`

      const activeData = res.data.filter((item) => isActiveStatus(getEmployeeStatusFromItem(item)))
      const inactiveData = res.data.filter((item) => !isActiveStatus(getEmployeeStatusFromItem(item)))
      const clulSheetGroups = [
        { name: 'CL-UL Sheet - Active Staff', data: activeData },
        { name: 'CL-UL Sheet - Inactive Staff', data: inactiveData },
      ]

      const workbook = new ExcelJS.Workbook()

      clulSheetGroups.forEach(({ name: sheetName, data: sheetData }) => {
        const sheet = workbook.addWorksheet(sheetName, { properties: { defaultRowHeight: 18 } })
        sheet.properties.defaultRowHeight = 18

        sheet.mergeCells('A1:J1')
        const titleCell = sheet.getCell('A1')
        titleCell.value = 'Real Apple Advisory services'
        titleCell.font = companyFont
        titleCell.alignment = centerMiddle
        titleCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF305496' },
        }

        sheet.mergeCells('A2:J2')
        const monthTitleCell = sheet.getCell('A2')
        monthTitleCell.value = `Generated for: ${monthYearLabel} - ${sheetName}`
        monthTitleCell.font = titleFont
        monthTitleCell.alignment = centerMiddle
        monthTitleCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' },
        }

        sheet.addRow([])

        const clData = sheetData.filter((item) => {
        return (
          item.leavePolicyAllotted === 'CL' ||
          item.quarterCLOpened !== undefined ||
          item.quarterCLTaken !== undefined ||
          item.quarterCLRemaining !== undefined ||
          item.clTaken !== undefined ||
          item.remainingCL !== undefined
        )
      })

        const ulData = sheetData.filter((item) => {
        return (
          item.leavePolicyAllotted === 'UL' ||
          item.quarterULOpened !== undefined ||
          item.quarterULTaken !== undefined ||
          item.quarterULRemaining !== undefined ||
          item.ulTaken !== undefined ||
          item.ulUsed !== undefined
        )
      })
      
      // Table 1 Header (Blue)
      const table1Headers = [
        'S.N.',
        'Compnay',
        'RA BRANCH',
        'Staff Name',
        'Email',
        'Status',
        'Role',
        'Leave Policy Allotted',
        'Annual allowted',
        'Leaves Opened',
        'Leaves Taken',
        'Encashable Leaves',
        'Non Accrued Leaves',
      ]
      
      const table1HeaderRow = sheet.addRow(table1Headers)
      table1HeaderRow.eachCell((cell) => {
        cell.font = headerFont
        cell.alignment = centerWrap
        cell.border = thinBorderGray
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }, // Blue
        }
      })

      // Table 1 Data - CL first, then UL
      let sn = 1
      
      // CL Data
      clData.forEach((item) => {
        // Use quarter data for CL
        const leavesOpened = item.quarterCLOpened || 0
        const leavesTaken = item.quarterCLTaken || 0
        const encashableLeaves = item.quarterCLRemaining || 0
        const annualAllotted = 12 // Fixed 12 for CL (full year)
        // Non Accrued = Annual Allotted - Leaves Opened
        const nonAccruedLeaves = Math.max(0, annualAllotted - leavesOpened)
        
        // Get status from details array user object if available, otherwise use item.status
        let employeeStatus = item.status || 'active'
        if (item.details && Array.isArray(item.details) && item.details.length > 0) {
          for (const detail of item.details) {
            if (detail?.user?.status) {
              employeeStatus = detail.user.status
              break
            }
          }
        }

        // Extract RA Location - handle object with name property
        const raLocation = 
          (typeof item.ra_location === 'object' && item.ra_location !== null && item.ra_location.name)
            ? item.ra_location.name
            : (typeof item.ra_location === 'object' && item.ra_location?.label)
            ? item.ra_location.label
            : (item.ra_location || item.raLocation || '')

        // Extract company name
        const companyName = item.company || item.company_name || ''

        // Extract RA Location label if it's an object
        const raLocationCL = 
          (typeof item.raLocation === 'object' && item.raLocation?.label) 
            ? item.raLocation.label 
            : (item.raLocation || '')

        const row = sheet.addRow([
          sn++,
          companyName,
          raLocation,
          item.company_name || '',
          raLocationCL,
          raLocationCL,
          item.name || '',
          item.email || '',
          employeeStatus,
          item.role || '',
          'CL',
          annualAllotted,
          leavesOpened,
          leavesTaken,
          encashableLeaves,
          nonAccruedLeaves,
        ])

        row.eachCell((cell) => {
          cell.font = baseFont
          cell.alignment = centerMiddle
          cell.border = thinBorderGray
        })
      })

      // UL Data
      ulData.forEach((item) => {
        // Use quarter data for UL
        const leavesOpened = item.quarterULOpened || 0
        const leavesTaken = item.quarterULTaken || 0
        const encashableLeaves = item.quarterULRemaining || 0
        const annualAllotted = item.annualAllotted || 16 // Default 16 for UL
        // Non Accrued = Annual Allotted - Leaves Opened
        const nonAccruedLeaves = Math.max(0, annualAllotted - leavesOpened)
        
        // Get status from details array user object if available, otherwise use item.status
        let employeeStatus = item.status || 'active'
        if (item.details && Array.isArray(item.details) && item.details.length > 0) {
          for (const detail of item.details) {
            if (detail?.user?.status) {
              employeeStatus = detail.user.status
              break
            }
          }
        }

        // Extract RA Location - handle object with name property
        const raLocation = 
          (typeof item.ra_location === 'object' && item.ra_location !== null && item.ra_location.name)
            ? item.ra_location.name
            : (typeof item.ra_location === 'object' && item.ra_location?.label)
            ? item.ra_location.label
            : (item.ra_location || item.raLocation || '')

        // Extract company name
        const companyName = item.company || item.company_name || ''

        // Extract RA Location label if it's an object
        const raLocationUL = 
          (typeof item.raLocation === 'object' && item.raLocation?.label) 
            ? item.raLocation.label 
            : (item.raLocation || '')

        const row = sheet.addRow([
          sn++,
          companyName,
          raLocation,
          item.company_name || '',
          raLocationUL,
          raLocationUL,
          item.name || '',
          item.email || '',
          employeeStatus,
          item.role || '',
          'UL',
          annualAllotted,
          leavesOpened,
          leavesTaken,
          encashableLeaves,
          nonAccruedLeaves,
        ])

        row.eachCell((cell) => {
          cell.font = baseFont
          cell.alignment = centerMiddle
          cell.border = thinBorderGray
        })
      })

        sheet.addRow([])

        const ddEmrData = sheetData.filter((item) => item.penaltyBucket && item.penaltyBucket > 0)

      // Table 2 Header (Orange)
      const table2Headers = [
        'S.N.',
        'Compnay',
        'RA BRANCH',
        'Staff Name',
        'Email',
        'Status',
        'Role',
        'Leave Policy Allotted',
        'Annual total Penalty',
        'Actual taken',
        'DD',
        'month',
      ]

      const table2HeaderRow = sheet.addRow(table2Headers)
      table2HeaderRow.eachCell((cell) => {
        cell.font = headerFont
        cell.alignment = centerWrap
        cell.border = thinBorderGray
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC000' }, // Orange
        }
      })

      // Table 2 Data
      sn = 1
      const monthLabel = moment().month(month - 1).format('MMM').toLowerCase() + '.' + String(year).slice(-2)
      
      ddEmrData.forEach((item) => {
        // Annual total Penalty = penaltyBucket
        const annualTotalPenalty = item.penaltyBucket || 0
        // Actual taken = Annual total Penalty / 2
        const actualTaken = Math.floor(annualTotalPenalty / 2)
        // DD = penaltyBucket (same as Annual total Penalty)
        const dd = annualTotalPenalty
        
        // Get status from details array user object if available, otherwise use item.status
        let employeeStatus = item.status || 'active'
        if (item.details && Array.isArray(item.details) && item.details.length > 0) {
          for (const detail of item.details) {
            if (detail?.user?.status) {
              employeeStatus = detail.user.status
              break
            }
          }
        }

        // Extract RA Location - handle object with name property
        const raLocation = 
          (typeof item.ra_location === 'object' && item.ra_location !== null && item.ra_location.name)
            ? item.ra_location.name
            : (typeof item.ra_location === 'object' && item.ra_location?.label)
            ? item.ra_location.label
            : (item.ra_location || item.raLocation || '')

        // Extract company name
        const companyName = item.company || item.company_name || ''

        // Extract RA Location label if it's an object
        const raLocationDD = 
          (typeof item.raLocation === 'object' && item.raLocation?.label) 
            ? item.raLocation.label 
            : (item.raLocation || '')

        const row = sheet.addRow([
          sn++,
          companyName,
          raLocation,
          item.company_name || '',
          raLocationDD,
          raLocationDD,
          item.name || '',
          item.email || '',
          employeeStatus,
          item.role || '',
          item.leavePolicyAllotted || '',
          annualTotalPenalty,
          actualTaken,
          dd,
          monthLabel,
        ])

        row.eachCell((cell) => {
          cell.font = baseFont
          cell.alignment = centerMiddle
          cell.border = thinBorderGray
        })
      })

      // Auto-fit columns
      autoFitColumns(sheet, { min: 8, max: 25 })

      // Manual column widths - updated for Role column at position 7
      sheet.getColumn(1).width = 6  // S.N.
      sheet.getColumn(2).width = 12 // Company
      sheet.getColumn(3).width = 16 // RA BRANCH
      sheet.getColumn(4).width = 22 // Staff Name
      sheet.getColumn(5).width = 28 // Email
      sheet.getColumn(6).width = 12 // Status
      sheet.getColumn(7).width = 18 // Role
      sheet.getColumn(8).width = 20 // Leave Policy Allotted
      sheet.getColumn(9).width = 16 // Annual allotted / Annual total Penalty
      sheet.getColumn(10).width = 14 // Leaves Opened / Actual taken
      sheet.getColumn(11).width = 14 // Leaves Taken / DD
      sheet.getColumn(12).width = 18 // Encashable Leaves / month
      sheet.getColumn(13).width = 18 // Non Accrued Leaves

        sheet.views = [{ state: 'frozen', ySplit: 3 }]
      })

      const buffer = await workbook.xlsx.writeBuffer()
      saveAs(new Blob([buffer]), `CL_UL_Sheet_${monthName}_${year}.xlsx`)
      toast.success('CL-UL Sheet exported successfully')
    } catch (err) {
      console.error('Error exporting CL-UL Sheet', err)
      toast.error('Failed to export CL-UL Sheet')
    } finally {
      setLoading(false)
    }
  }

  // -----------------------
  // UI (improved, but logic unchanged)
  // -----------------------
  return (
    <CCard className="m-3">
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Generate Payroll</h5>
          <small className="text-muted">
            Select month, year and (optionally) a user to generate payroll
          </small>
        </div>
        <div>
          <CButton
            color="secondary"
            size="sm"
            onClick={() => {
              setMonth(new Date().getMonth() + 1)
              setYear(new Date().getFullYear())
              setSelectedUser(null)
              toast.info('Filters reset')
            }}
          >
            Reset
          </CButton>
        </div>
      </CCardHeader>

      <CCardBody>
        {loading ? (
          <div className="text-center my-4">
            <CSpinner />
          </div>
        ) : (
          <>
            <CRow className="g-3 align-items-end mb-3">
              <CCol md={3}>
                <CFormLabel>Month</CFormLabel>
                <AppFormSelect value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </AppFormSelect>
              </CCol>

              <CCol md={3}>
                <CFormLabel>Year</CFormLabel>
                <AppFormSelect value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </AppFormSelect>
              </CCol>

            </CRow>
              <CRow className="g-3 align-items-end mb-4">
                    

            </CRow>
              <CRow className="g-3 align-items-end mb-4">
                    
              <CCol md={3}>
                <CButton
                  color="primary"
                  onClick={() => setConfirmModal({ visible: true, type: 'month' })}
                  className="w-100"
                >
                  <CIcon icon={cilCloudDownload} className="me-2" />
                  Generate Payroll for All Users
                </CButton>
              </CCol>

            
              <CCol md={3}>
                <CButton
                  color="warning"
                  onClick={async () => {
                    setLoading(true)
                    try {
                      const url = selectedUser
                        ? `attendances/admin/payroll/user/${userId}?month=${month}&year=${year}`
                        : `attendances/admin/payroll/month?month=${month}&year=${year}`
                      const res = await new BasicProvider(url).getRequest()
                      if (res?.status === 'success' && res?.data) {
                        await exportSalarySheet(
                          res.data,
                          moment().month(month - 1).format('MMMM'),
                          year,
                        )
                      } else {
                        toast.error('No muster data available for selected month/year')
                      }
                    } catch (err) {
                      console.error(err)
                      toast.error('Failed to fetch payroll data')
                    } finally {
                      setLoading(false)
                    }
                  }}
                  className="w-100"
                >
                  <CIcon icon={cilCloudDownload} className="me-2" />
                  Export Salary Sheet
                </CButton>
              </CCol>
              <CCol md={3}>
                <CButton
                  color="success"
                  onClick={exportCLULSheet}
                  className="w-100"
                  disabled={loading}
                >
                  <CIcon icon={cilCloudDownload} className="me-2" />
                  CL-UL Sheet
                </CButton>
              </CCol>

            </CRow>
            <CRow className="g-3 align-items-end">
              <CCol md={6}>
                <CFormLabel>Select Employee (optional)</CFormLabel>
                <Select
                  options={managers}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  isClearable
                  isSearchable
                  placeholder="Search employee..."
                />
              </CCol>

              <CCol md={3}>
                <div style={{ height: 44 }} />
                {selectedUser && (
                  <CButton
                    color="success"
                    onClick={() => setConfirmModal({ visible: true, type: 'user' })}
                    className="w-100"
                  >
                    <CIcon icon={cilPlus} className="me-2" />
                    Generate Payroll for User
                  </CButton>
                )}
              </CCol>

              {/* <CCol md={3}>
              {/* <CCol md={3}>
                <div style={{ height: 44 }} />
                <CButton
                  color="secondary"
                  onClick={() => {
                    // quick feedback button to preview selected user id
                    if (selectedUser) {
                      toast.info(`Selected: ${selectedUser.label}`)
                    } else {
                      toast.info('No user selected')
                    }
                  }}
                  className="w-100"
                >
                  {selectedUser ? 'Selected: ' + selectedUser.label : 'No user selected'}
                </CButton>
              </CCol> */}
            </CRow>
          </>
        )}
      </CCardBody>

      {/* Confirmation Modal */}
      <CModal
        visible={confirmModal.visible}
        onClose={() => setConfirmModal({ visible: false, type: '' })}
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Confirm Payroll Generation</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {confirmModal.type === 'month'
            ? `Are you sure you want to generate payroll for ALL users for ${new Date(
                year,
                month - 1,
              ).toLocaleString('default', { month: 'long', year: 'numeric' })}?`
            : `Are you sure you want to generate payroll for User: ${
                selectedUser?.label || userId
              }?`}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setConfirmModal({ visible: false, type: '' })}>
            Cancel
          </CButton>
          <CButton
            color="primary"
            onClick={() =>
              confirmModal.type === 'month' ? generatePayroll('month') : generatePayroll('user')
            }
            disabled={exporting || loading}
          >
            {exporting || loading ? (
              <>
                <CSpinner size="sm" /> Generating...
              </>
            ) : (
              'Yes, Generate'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default AdminPayRoll
