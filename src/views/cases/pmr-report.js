import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CFormLabel,
  CRow,
  CSpinner,
} from '@coreui/react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import { useSelector } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import moment from 'moment'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const PMRReport = () => {
  const admin = useSelector((state) => state.userData)
  const [selectedDate, setSelectedDate] = useState(null)
  const [filters, setFilters] = useState({ month: null, year: null })
  const [isLoading, setIsLoading] = useState(false)

  const handleMonthChange = (date) => {
    setSelectedDate(date)
    setFilters({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    })
  }

  const normalizeNumber = (value) => {
    if (value === null || value === undefined) return 0
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }

  // Map backend role slugs to human-readable labels (similar to monthly-report.js)
  const ROLE_LABELS = {
    [process.env.REACT_APP_FE]: 'Field Engineer (FE)',
    [process.env.REACT_APP_DM]: 'Draft Maker (DM)',
    [process.env.REACT_APP_RA]: 'RA Branch BM',
    [process.env.REACT_APP_SFO]: 'Senior Field Officer (SFO)',
    [process.env.REACT_APP_RC]: 'Report Checker (RC)',
    [process.env.REACT_APP_LCTO]: 'Line Chief Technical Officer (LCTO)',
    [process.env.REACT_APP_CTO]: 'Chief Technical Officer (CTO)',
    [process.env.REACT_APP_COO]: 'Chief Operating Officer (COO)',
    [process.env.REACT_APP_SDM]: 'SDM Work Allocater (SDM)',
  }

  const getDaySuffix = (day) => {
    if (day >= 11 && day <= 13) return 'th'
    switch (day % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  }

  const extractDraftDoneForRow = (row) => {
    let totalDraft = 0

    // Prefer dailyStates if available (per-day data)
    if (Array.isArray(row.dailyStates)) {
      row.dailyStates.forEach((day) => {
        if (Array.isArray(day.sessions)) {
          day.sessions.forEach((s) => {
            if (s && s.today_draft_done !== undefined && s.today_draft_done !== null) {
              totalDraft += normalizeNumber(s.today_draft_done)
            }
          })
        } else if (
          day &&
          day.today_draft_done !== undefined &&
          day.today_draft_done !== null
        ) {
          totalDraft += normalizeNumber(day.today_draft_done)
        }
      })
    }

    // Fallbacks used in other parts of the app
    if (totalDraft === 0 && Array.isArray(row.sessions)) {
      row.sessions.forEach((s) => {
        if (s && s.today_draft_done !== undefined && s.today_draft_done !== null) {
          totalDraft += normalizeNumber(s.today_draft_done)
        }
      })
    }

    if (
      totalDraft === 0 &&
      row.today_draft_done !== undefined &&
      row.today_draft_done !== null
    ) {
      totalDraft += normalizeNumber(row.today_draft_done)
    }

    if (totalDraft === 0 && row.draftDone !== undefined && row.draftDone !== null) {
      totalDraft += normalizeNumber(row.draftDone)
    }

    return totalDraft
  }

  const generateReport = async () => {
    if (!filters.month || !filters.year) return

    try {
      setIsLoading(true)

      const res = await new BasicProvider(
        `cases/monthely-report?case_create_from=${filters.year}-${String(
          filters.month,
        ).padStart(2, '0')}-01&case_create_to=${filters.year}-${String(filters.month).padStart(
          2,
          '0',
        )}-31`,
      ).getRequest()

      const data = res?.data || []
      if (!data.length) {
        setIsLoading(false)
        return
      }

      const numberOfDays = data[0].countsPerDay.length

      // One row per employee-role (FE, DM, RC, LCTO...) – do NOT merge multiple roles
      const ROLE_ORDER = {
        [process.env.REACT_APP_FE]: 1,
        [process.env.REACT_APP_DM]: 2,
        [process.env.REACT_APP_RA]: 3,
        [process.env.REACT_APP_RC]: 4,
        [process.env.REACT_APP_SFO]: 5,
        [process.env.REACT_APP_LCTO]: 6,
        [process.env.REACT_APP_CTO]: 7,
        [process.env.REACT_APP_COO]: 8,
        [process.env.REACT_APP_SDM]: 9,
      }

      const sorted = [...data].sort((a, b) => {
        const orderA = ROLE_ORDER[a.roleSlug] || 99
        const orderB = ROLE_ORDER[b.roleSlug] || 99
        if (orderA !== orderB) return orderA - orderB
        const nameA = (a.adminName || '').toLowerCase()
        const nameB = (b.adminName || '').toLowerCase()
        if (nameA < nameB) return -1
        if (nameA > nameB) return 1
        return 0
      })

      const workbook = new ExcelJS.Workbook()
      const ws = workbook.addWorksheet('PMR')

      // Header / letterhead
      const lastHeaderCol = 5 + numberOfDays + 2 // S.No, Name, Role, RA Branch, Punch-in, days..., Punch-out, totals
      const lastColLetter = ExcelJS.utils
        ? ExcelJS.utils.encodeCol(lastHeaderCol - 1)
        : 'AI'

      ws.mergeCells(`A1:${lastColLetter}1`)
      ws.getCell('A1').value = 'ValuXpert Group'
      ws.getCell('A1').font = { size: 16, bold: true }
      ws.getCell('A1').alignment = { horizontal: 'center' }

      ws.mergeCells(`A2:${lastColLetter}2`)
      ws.getCell('A2').value = 'PMR Report'
      ws.getCell('A2').alignment = { horizontal: 'center' }
      ws.getCell('A2').font = { bold: true }

      ws.mergeCells(`A3:${lastColLetter}3`)
      ws.getCell('A3').value = `Date of Generation : ${moment(Date.now()).format(
        'D MMMM YYYY',
      )}`
      ws.getCell('A3').alignment = { horizontal: 'center' }

      ws.mergeCells(`A4:${lastColLetter}4`)
      ws.getCell('A4').value = `Generated BY : ${admin?.name || '-'}`
      ws.getCell('A4').alignment = { horizontal: 'center' }

      ws.mergeCells(`A5:${lastColLetter}5`)
      ws.getCell('A5').value = `Month : ${moment({
        year: filters.year,
        month: filters.month - 1,
      }).format('MMMM YYYY')}`
      ws.getCell('A5').alignment = { horizontal: 'center' }

      ws.addRow([])

      // Header row
      const dayHeaders = Array.from(
        { length: numberOfDays },
        (_, i) => `${i + 1}${getDaySuffix(i + 1)}`,
      )
      const headerRow = [
        'S.No',
        'Name of the FE/DM/RC/LCTO',
        'Role',
        'MA Location',
        'Punch-in time',
        '1st Closer',
        ...dayHeaders.slice(1),
        'Punch-out',
        'Total Closed',
        'Grand Total',
      ]
      const header = ws.addRow(headerRow)
      header.eachCell((cell) => {
        cell.font = { bold: true }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })

      // Data rows
      sorted.forEach((entry, index) => {
        const name = entry.adminName || 'Unknown'
        // Prefer RA location label if backend sends an object, otherwise fall back to string
        let raLocation = entry.raLocation || entry.raBranchName || entry.location || '-'
        if (raLocation && typeof raLocation === 'object') {
          raLocation =
            raLocation.label || raLocation.name || raLocation.value || raLocation.city || '-'
        }

        const roleLabel =
          ROLE_LABELS[entry.roleSlug] || entry.roleName || entry.roleSlug || ''

        const dailyCounts = Array.isArray(entry.countsPerDay)
          ? entry.countsPerDay.map((d) => normalizeNumber(d.count))
          : Array(numberOfDays).fill(0)

        const totalClosed = dailyCounts.reduce((sum, v) => sum + v, 0)

        const rowValues = [
          index + 1,
          name,
          roleLabel,
          raLocation,
          '', // Punch-in time (optional / future)
          ...dailyCounts,
          '', // Punch-out time (optional / future)
          totalClosed,
          totalClosed,
        ]

        const row = ws.addRow(rowValues)
        row.height = 18
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.alignment = {
            vertical: 'middle',
            horizontal: colNumber === 3 ? 'left' : 'center',
            wrapText: colNumber === 3,
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        })
      })

      ws.getColumn(1).width = 6
      ws.getColumn(2).width = 22
      ws.getColumn(3).width = 26
      ws.getColumn(4).width = 18
      ws.getColumn(5).width = 12
      for (let i = 6; i < 6 + numberOfDays; i++) {
        ws.getColumn(i).width = 8
      }

      const buffer = await workbook.xlsx.writeBuffer()
      const fileName = `PMR_Report_${String(filters.month).padStart(2, '0')}-${filters.year}.xlsx`
      saveAs(new Blob([buffer]), fileName)
    } catch (error) {
      console.error('Failed to generate PMR report', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SingleSubHeader moduleName={'PMR Report (Today Done)'} />
      <CContainer fluid>
        <CCard>
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span>PMR Report – Monthly Today Done Summary</span>
              <small className="text-muted">
                Logged in as: <strong>{admin?.name || '-'}</strong>
              </small>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow className="align-items-end g-3 mb-3">
              <CCol xs={12} lg={4}>
                <CFormLabel className="fw-semibold">Select Month</CFormLabel>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleMonthChange}
                  dateFormat="MMMM yyyy"
                  showMonthDropdown
                  showYearDropdown
                  showMonthYearPicker
                  maxDate={new Date()}
                  className="form-control full py-2"
                  placeholderText="Select Month.."
                />
              </CCol>
              <CCol xs={12} lg={3}>
                <CButton
                  className="mt-3 mt-lg-0"
                  color="success"
                  style={{ color: 'white', minWidth: 180 }}
                  onClick={generateReport}
                  disabled={!selectedDate || isLoading}
                >
                  {isLoading ? (
                    <>
                      <CSpinner color="white" size="sm" className="me-2" />
                      Generating Excel...
                    </>
                  ) : (
                    'Generate PMR Excel'
                  )}
                </CButton>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CContainer>
    </>
  )
}

export default PMRReport

