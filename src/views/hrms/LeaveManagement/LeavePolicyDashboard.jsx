import React, { useEffect, useMemo, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CForm,
  CFormInput,
  CFormLabel,
  CAlert,
  CSpinner,
  CBadge,
  CCol,
  CRow,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import { cilPlus, cilPencil, cilTrash, cilCheckCircle, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { toast } from 'react-toastify'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch, useSelector } from 'react-redux'
import { checkRole } from 'src/constants/common'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import moment from 'moment'

const LeavePolicyDashboard = () => {
  const dispatch = useDispatch()
  const admin = useSelector((state) => state.userData)
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState(null)
  const [downloadingPolicyId, setDownloadingPolicyId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    clPerMonth: 1,
    clYearlyCap: 12,
    ulPerQuarter: 4,
    financialYearStartMonth: 3,
    effectiveFrom: '',
    effectiveTo: '',
    description: '',
    isActive: false,
  })

  const isAdminOrHR = useMemo(() => {
    const ADMIN = process.env.REACT_APP_ADMIN
    const HR = process.env.REACT_APP_HR
    return checkRole(ADMIN, admin) || checkRole(HR, admin)
  }, [admin])

  const isPolicyExpired = (policy) => {
    if (!policy?.effectiveTo) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const to = new Date(policy.effectiveTo)
    return !Number.isNaN(to.getTime()) && to < today
  }

  const toFinancialYearString = (policy) => {
    const startMonthIdx = Number(policy?.financialYearStartMonth ?? 3) // 0=Jan. Default 3 => April.
    const pivotRaw = policy?.effectiveTo || policy?.effectiveFrom || new Date().toISOString()
    const pivot = new Date(pivotRaw)
    if (Number.isNaN(pivot.getTime())) return ''

    const y = pivot.getFullYear()
    const m = pivot.getMonth()
    const fyStartYear = m >= startMonthIdx ? y : y - 1
    const fyEndYear = fyStartYear + 1
    return `${fyStartYear}-${fyEndYear}`
  }

  const fetchExpiredPolicyReport = async (policy) => {
    const financialYear = toFinancialYearString(policy)
    if (!financialYear) throw new Error('Unable to determine financial year')

    const res = await new BasicProvider(
      `leaves/fy-download?financialYear=${encodeURIComponent(financialYear)}`,
      dispatch,
    ).getRequest()

    // BasicProvider sometimes returns axios response, sometimes returns response.data directly.
    const payload =
      res && typeof res?.status === 'number' && res?.data && typeof res.data === 'object' ? res.data : res

    const rows = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : null

    if (!rows) throw new Error('Invalid report data')
    return { ...payload, data: rows }
  }

  const autoFitColumns = (worksheet, min = 6, max = 55) => {
    worksheet.columns.forEach((col) => {
      let widest = min
      col.eachCell({ includeEmpty: true }, (cell) => {
        const v = cell?.value
        const text =
          v === null || v === undefined
            ? ''
            : typeof v === 'object' && v?.richText
              ? v.richText.map((t) => t.text).join('')
              : String(v)
        // Tight fit: minimal padding, keep columns compact
        widest = Math.max(widest, text.length + 1)
      })
      col.width = Math.min(max, Math.max(min, widest))
    })
  }

  const thinBorder = {
    top: { style: 'thin', color: { argb: 'FFD0D7DE' } },
    left: { style: 'thin', color: { argb: 'FFD0D7DE' } },
    bottom: { style: 'thin', color: { argb: 'FFD0D7DE' } },
    right: { style: 'thin', color: { argb: 'FFD0D7DE' } },
  }

  const cellTextLength = (cell) => {
    const v = cell?.value
    if (v === null || v === undefined) return 0
    if (typeof v === 'object' && v?.richText) {
      return v.richText.map((t) => t.text).join('').length
    }
    return String(v).length
  }

  /** Per-column max width so empty / short text columns stay narrow; months/FY stay compact */
  const applySmartColumnWidths = (worksheet, columnCount, monthCount) => {
    const caps = []
    caps[0] = 8
    caps[1] = 24
    caps[2] = 24
    caps[3] = 20
    caps[4] = 22
    caps[5] = 10
    caps[6] = 24
    for (let i = 0; i < monthCount; i++) caps[7 + i] = 12
    caps[7 + monthCount] = 12

    for (let c = 1; c <= columnCount; c++) {
      const col = worksheet.getColumn(c)
      let widest = 5
      col.eachCell({ includeEmpty: true }, (cell) => {
        widest = Math.max(widest, cellTextLength(cell) + 1)
      })
      const cap = caps[c - 1] ?? 14
      col.width = Math.min(cap, Math.max(5, widest))
    }
  }

  const buildRoleLabel = (role) => {
    if (!role) return ''
    if (Array.isArray(role)) {
      return role
        .map((r) => r?.display_name || r?.name || '')
        .filter(Boolean)
        .join(', ')
    }
    if (typeof role === 'object') return role?.display_name || role?.name || ''
    return String(role)
  }

  const buildLocationLabel = (loc) => {
    if (!loc) return ''
    if (typeof loc === 'string') return loc
    return loc?.label || loc?.value || ''
  }

  // const downloadExpiredPolicyExcel = async (policy) => {
  //   if (!policy?._id) return
  //   try {
  //     setDownloadingPolicyId(policy._id)

  //     const report = await fetchExpiredPolicyReport(policy)
  //     const reportRowsRaw = Array.isArray(report?.data) ? report.data : []

  //     // Ensure all staff rows included, sorted by staff name for readability
  //     const reportRows = [...reportRowsRaw].sort((a, b) => {
  //       const an = (a?.staff?.name || '').toLowerCase()
  //       const bn = (b?.staff?.name || '').toLowerCase()
  //       return an.localeCompare(bn)
  //     })

  //     const wb = new ExcelJS.Workbook()
  //     wb.creator = 'Real Apple HRMS'
  //     wb.created = new Date()
  //     const ws = wb.addWorksheet('Expired Policy Report', {
  //       properties: { defaultRowHeight: 18 },
  //     })

  //     const title = `Leave Policy Report (Expired) - ${policy?.name || ''}`.trim()
  //     const fy = report?.financialYear ? `Financial Year: ${report.financialYear}` : 'Financial Year'
  //     const rangeLabel =
  //       report?.range?.start && report?.range?.end
  //         ? `Range: ${moment(report.range.start).format('DD-MM-YYYY')} to ${moment(report.range.end).format('DD-MM-YYYY')}`
  //         : ''
  //     const generated = `Generated: ${moment().format('DD-MM-YYYY HH:mm')}`

  //     const baseColumns = ['Staff Name', 'Email', 'Mobile', 'Role', 'Company', 'RA Location']
  //     // Compact row-wise layout:
  //     // - Staff info is merged once (no repetition)
  //     // - Month name in one column
  //     // - Each month has 3 rows (CL/UL/Penalty) with Days + Count in rows (not in header)
  //     const detailColumns = [
  //       ...baseColumns,
  //       'Month',
  //       'Leave Type',
  //       'Days',
  //       'Count',
  //       'FY Total Days (Type)',
  //     ]
  //     const totalCols = detailColumns.length

  //     // Title block (full width)
  //     ws.addRow([title])
  //     ws.addRow([fy])
  //     ws.addRow([rangeLabel])
  //     ws.addRow([generated])
  //     for (let r = 1; r <= 4; r++) {
  //       ws.mergeCells(r, 1, r, totalCols)
  //       const cell = ws.getCell(r, 1)
  //       const isTitle = r === 1
  //       cell.font = { bold: true, size: isTitle ? 14 : 11, color: { argb: 'FFFFFFFF' } }
  //       cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  //       cell.fill = {
  //         type: 'pattern',
  //         pattern: 'solid',
  //         fgColor: { argb: isTitle ? 'FF305496' : r === 2 ? 'FF4472C4' : 'FF5B9BD5' },
  //       }
  //     }

  //     const headerRowIdx = 5
  //     const headerRow = ws.addRow(detailColumns)
  //     headerRow.eachCell((cell) => {
  //       cell.font = { bold: true }
  //       cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
  //       cell.border = {
  //         top: { style: 'thin', color: { argb: 'D0D7DE' } },
  //         left: { style: 'thin', color: { argb: 'D0D7DE' } },
  //         bottom: { style: 'thin', color: { argb: 'D0D7DE' } },
  //         right: { style: 'thin', color: { argb: 'D0D7DE' } },
  //       }
  //       cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }
  //     })

  //     // Make month & numbers readable
  //     ws.getColumn(baseColumns.length + 1).alignment = { vertical: 'middle', horizontal: 'left' } // Month
  //     ws.getColumn(baseColumns.length + 2).alignment = { vertical: 'middle', horizontal: 'center' } // Leave Type

  //     ws.views = [{ state: 'frozen', ySplit: headerRowIdx }]

  //     reportRows.forEach((r) => {
  //       const staff = r?.staff || {}
  //       const roleLabel = buildRoleLabel(staff?.role)
  //       const locLabel = buildLocationLabel(staff?.ra_location)
  //       const totals = r?.totals || {}
  //       const fyTotals = {
  //         CL: Number(totals?.CL || 0),
  //         UL: Number(totals?.UL || 0),
  //         Penalty: Number(totals?.Penalty || 0),
  //       }

  //       const staffMonths = (Array.isArray(r?.months) ? r.months : []).slice().sort((a, b) => {
  //         return String(a?.monthKey || '').localeCompare(String(b?.monthKey || ''))
  //       })

  //       const staffStartRow = ws.rowCount + 1

  //       staffMonths.forEach((m) => {
  //         const lc = m?.leavesCount || {}
  //         const monthLabel = m?.monthLabel || m?.monthKey || ''

  //         ;[
  //           { type: 'CL', days: Number(m?.CL || 0), count: Number(lc?.CL || 0) },
  //           { type: 'UL', days: Number(m?.UL || 0), count: Number(lc?.UL || 0) },
  //           { type: 'Penalty', days: Number(m?.Penalty || 0), count: Number(lc?.Penalty || 0) },
  //         ].forEach((rowItem, idx) => {
  //           ws.addRow([
  //             staff?.name || '',
  //             staff?.email || '',
  //             staff?.mobile || '',
  //             roleLabel,
  //             staff?.company_name || '',
  //             locLabel,
  //             monthLabel, // keep month in every row for easy filter/sort
  //             rowItem.type,
  //             rowItem.days,
  //             rowItem.count,
  //             fyTotals[rowItem.type] ?? 0,
  //           ])
  //         })
  //       })

  //       const staffEndRow = ws.rowCount
  //       // Merge staff info columns vertically so staff details appear once
  //       if (staffEndRow >= staffStartRow) {
  //         for (let c = 1; c <= baseColumns.length; c++) {
  //           ws.mergeCells(staffStartRow, c, staffEndRow, c)
  //           const cell = ws.getCell(staffStartRow, c)
  //           cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
  //         }
  //       }
  //     })

  //     ws.autoFilter = {
  //       from: { row: headerRowIdx, column: 1 },
  //       to: { row: headerRowIdx, column: totalCols },
  //     }

  //     // Fit columns close to text size (no huge padding)
  //     autoFitColumns(ws, 6, 80)

  //     const buf = await wb.xlsx.writeBuffer()
  //     const arrayBuffer = buf instanceof ArrayBuffer ? buf : buf?.buffer
  //     const blob = new Blob([arrayBuffer], {
  //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     })

  //     const safeName = (policy?.name || 'LeavePolicy').replace(/[\\/:*?"<>|]+/g, '-')
  //     const filename = `${safeName}_${report?.financialYear || 'Report'}.xlsx`
  //     saveAs(blob, filename)
  //   } catch (e) {
  //     console.error('Excel export failed:', e)
  //     toast.error('Failed to download Excel report')
  //   } finally {
  //     setDownloadingPolicyId(null)
  //   }
  // }

  // Fetch all leave policies
  
  const downloadExpiredPolicyExcel = async (policy) => {
    if (!policy?._id) return
    try {
      setDownloadingPolicyId(policy._id)

      const report = await fetchExpiredPolicyReport(policy)
      const reportRowsRaw = Array.isArray(report?.data) ? report.data : []

      const reportRows = [...reportRowsRaw].sort((a, b) => {
        const an = (a?.staff?.name || '').toLowerCase()
        const bn = (b?.staff?.name || '').toLowerCase()
        return an.localeCompare(bn)
      })

      const monthLabels =
        reportRows[0]?.months?.length > 0
          ? [...reportRows[0].months]
              .sort((a, b) => String(a.monthKey || '').localeCompare(String(b.monthKey || '')))
              .map((m) => m.monthLabel)
          : [
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
              'January',
              'February',
              'March',
            ]

      // API keys (exact strings from backend)
      const metricDefs = [
        { label: 'CL Taken', key: 'CL Taken' },
        { label: 'CL Application', key: 'CL Application' },
        { label: 'UL Taken', key: 'UL Taken' },
        { label: 'UL Application', key: 'UL Application' },
        { label: 'Penalty Effected', key: 'Penalty Effected' },
        { label: 'Penalty Application', key: 'Penalty Application' },
        { label: 'Emergency Taken', key: 'Emergency Taken' },
        { label: 'Emergency Application', key: 'Emergency Application' },
      ]

      const baseHeaders = [
        'S/N',
        'Staff Name',
        'Company Name',
        'RA Location',
        'Designation',
        'Status',
        'Metric',
      ]
      const totalCols = baseHeaders.length + monthLabels.length + 1

      const getMetric = (obj, key) => {
        if (!obj) return 0
        const v = obj[key]
        if (v !== undefined && v !== null && v !== '') return Number(v) || 0
        return 0
      }

      const labelColorForMetric = (label) => {
        const s = String(label || '').toLowerCase()
        if (s.startsWith('cl')) return 'FFC6EFCE'
        if (s.startsWith('ul')) return 'FFFFF2CC'
        if (s.includes('penalty')) return 'FFF4CCCC'
        if (s.includes('emergency')) return 'FFDDEBF7'
        return 'FFE7E6E6'
      }

      const wb = new ExcelJS.Workbook()
      wb.creator = 'Real Apple HRMS'
      wb.created = new Date()
      const ws = wb.addWorksheet('Leave Summary Report', {
        properties: { defaultRowHeight: 18 },
      })

      const pol = report?.policy
      const REPORT_TITLE = 'Leave Summary Report (FY Download)'
      const metaRows = [
        REPORT_TITLE,
         report?.range?.start && report?.range?.end
          ? `Range: ${moment(report.range.start).format('DD-MM-YYYY')} to ${moment(report.range.end).format('DD-MM-YYYY')}`
          : '',  
          
      ].filter(Boolean)

      metaRows.forEach((txt, idx) => {
        const row = ws.addRow([txt])
        ws.mergeCells(row.number, 1, row.number, totalCols)
        const cell = ws.getCell(row.number, 1)
        const isTitle = idx === 0
        if (isTitle) {
          // richText forces plain display in Excel (avoids +cell refs being read as formula fragments)
          cell.value = {
            richText: [
              {
                font: { bold: true, size: 24, color: { argb: 'FFFFFFFF' } },
                text: REPORT_TITLE,
              },
            ],
          }
        } else {
          cell.value = String(txt)
          cell.font = {
            bold: true,
            size: 15,
            color: { argb: 'FFFFFFFF' },
          }
        }
        cell.numFmt = '@'
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isTitle ? 'FF305496' : 'FF4472C4' },
        }
        row.height = isTitle ? 46 : 28
      })

      const firstHeader = [...baseHeaders, ...monthLabels, 'FY Total']
      const headerRow1 = ws.addRow(firstHeader)

      headerRow1.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF305496' } }
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 14 }
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        cell.border = thinBorder
      })
      headerRow1.height = 28

      const headerRowNumber = headerRow1.number
      const metricRowCount = metricDefs.length

      reportRows.forEach((r, index) => {
        const staff = r?.staff || {}
        const designation = staff?.designation || buildRoleLabel(staff?.role) || ''
        const startRow = ws.rowCount + 1
        const totals = r?.totals || {}

        metricDefs.forEach((mt, mtIdx) => {
          const rowData = []
          if (mtIdx === 0) {
            rowData.push(
              index + 1,
              staff?.name || '',
              staff?.company_name || '',
              buildLocationLabel(staff?.ra_location),
              designation,
              '-',
              mt.label,
            )
          } else {
            rowData.push('', '', '', '', '', '', mt.label)
          }

          monthLabels.forEach((ml) => {
            const mData = (r.months || []).find((m) => m.monthLabel === ml)
            rowData.push(getMetric(mData, mt.key))
          })

          rowData.push(getMetric(totals, mt.key))
          const addedRow = ws.addRow(rowData)
          const totalColIndex = 8 + monthLabels.length

          addedRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.border = thinBorder
            if (colNumber >= 8 && colNumber <= totalColIndex) {
              cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false }
            } else if (colNumber === 7) {
              cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
            } else if (colNumber >= 2 && colNumber <= 5) {
              cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
            }
          })

          const labelCell = addedRow.getCell(7)
          labelCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: labelColorForMetric(mt.label) },
          }
          labelCell.font = { bold: true, color: { argb: 'FF000000' } }
          labelCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
        })

        for (let i = 1; i <= 6; i++) {
          ws.mergeCells(startRow, i, startRow + metricRowCount - 1, i)
          const mc = ws.getCell(startRow, i)
          if (i === 1 || i === 6) {
            mc.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
          } else {
            mc.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
          }
        }
      })

      if (report?.policyNote) {
        const noteRow = ws.addRow([])
        const nr = noteRow.number
        ws.mergeCells(nr, 1, nr, totalCols)
        const c = ws.getCell(nr, 1)
        c.value = {
          richText: [
            {
              font: { bold: true, size: 13, color: { argb: 'FFFFFFFF' } },
              text: `Note: ${report.policyNote}`,
            },
          ],
        }
        c.numFmt = '@'
        c.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' }
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
        c.border = thinBorder
        noteRow.height = 80
      }

      applySmartColumnWidths(ws, totalCols, monthLabels.length)

      ws.views = [{ state: 'frozen', ySplit: headerRowNumber }]

      const buf = await wb.xlsx.writeBuffer()
      const safePolicy = String(policy?.name || 'LeavePolicy').replace(/[\\/:*?"<>|]+/g, '-')
      const fyPart = report?.financialYear ? `_${report.financialYear}` : ''
      saveAs(new Blob([buf]), `${safePolicy}${fyPart}_Summary.xlsx`)
    } catch (e) {
      console.error(e)
      toast.error('Failed to export report')
    } finally {
      setDownloadingPolicyId(null)
    }
  }
  
  const fetchPolicies = async () => {
    try {
      setLoading(true)
      const response = await new BasicProvider('leaves/policies', dispatch).getRequest()
      let list = response?.data || []

      const expiredStillActive = list.filter((p) => isPolicyExpired(p) && p.isActive)
      if (expiredStillActive.length > 0) {
        let deactivated = 0
        for (const p of expiredStillActive) {
          try {
            await new BasicProvider(`leaves/policies/${p._id}`, dispatch).patchRequest({
              isActive: false,
            })
            deactivated += 1
          } catch (e) {
            console.error('Auto-deactivate expired policy failed:', p?._id, e)
          }
        }
        if (deactivated > 0) {
          try {
            const refreshed = await new BasicProvider('leaves/policies', dispatch).getRequest()
            list = refreshed?.data || list
          } catch (e) {
            list = list.map((row) =>
              expiredStillActive.some((x) => x._id === row._id) ? { ...row, isActive: false } : row,
            )
          }
          toast.info(
            deactivated === 1
              ? '1 expired policy was set to inactive.'
              : `${deactivated} expired policies were set to inactive.`,
          )
        }
      }

      setPolicies(list)
    } catch (err) {
      toast.error('Failed to fetch policies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  const handleOpenCreate = () => {
    setEditingPolicy(null)
    setFormData({
      name: '',
      clPerMonth: 1,
      clYearlyCap: 12,
      ulPerQuarter: 4,
      financialYearStartMonth: 3,
      effectiveFrom: '',
      effectiveTo: '',
      description: '',
      isActive: false,
    })
    setShowModal(true)
  }

  const handleEdit = (policy) => {
    setEditingPolicy(policy)
    setFormData({
      ...policy,
      effectiveFrom: policy.effectiveFrom ? policy.effectiveFrom.split('T')[0] : '',
      effectiveTo: policy.effectiveTo ? policy.effectiveTo.split('T')[0] : '',
    })
    setShowModal(true)
  }

  const handleDelete = (policy) => {
    // Check if policy is active
    if (policy.isActive) {
      toast.error('To delete this policy, please first make it inactive by editing it, then you can delete it')
      return
    }
    
    // If inactive, show confirmation modal
    setPolicyToDelete(policy)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!policyToDelete) return
    
    try {
      await new BasicProvider(`leaves/policies/${policyToDelete._id}`, dispatch).deleteRealRequest()
      toast.success('Policy deleted successfully')
      setShowDeleteModal(false)
      setPolicyToDelete(null)
      fetchPolicies()
    } catch (err) {
      toast.error('Error deleting policy')
      setShowDeleteModal(false)
      setPolicyToDelete(null)
    }
  }

  const handleActivate = async (id) => {
    try {
      await new BasicProvider(`leaves/policies/${id}/activate`, dispatch).postRequest()
      toast.success('Policy activated successfully')
      fetchPolicies()
    } catch (err) {
      toast.error('Error activating policy')
    }
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Please enter a policy name')
      return
    }

    setSaving(true)
    try {
      const payload = { ...formData }
      if (editingPolicy) {
        await new BasicProvider(`leaves/policies/${editingPolicy._id}`, dispatch).patchRequest(
          payload,
        )
        toast.success('Policy updated successfully')
      } else {
        await new BasicProvider('leaves/policies', dispatch).postRequest(payload)
        toast.success('Policy created successfully')
      }
      setShowModal(false)
      fetchPolicies()
    } catch (err) {
      toast.error('Error saving policy')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ width: '95%', margin: 'auto', padding: '20px' }}>
      <CRow className="mb-3">
        <CCol>
          <CButton color="primary" onClick={handleOpenCreate}>
            <CIcon icon={cilPlus} className="me-2" />
            Add New Policy
          </CButton>
        </CCol>
      </CRow>

      <CCard>
        <CCardHeader>
          <CCardTitle>Leave Policies</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center my-5">
              <CSpinner color="primary" />
            </div>
          ) : policies?.length === 0 ? (
            <CAlert color="info">No policies found.</CAlert>
          ) : (
            <CTable hover responsive bordered>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>CL/Month</CTableHeaderCell>
                  <CTableHeaderCell>CL Cap</CTableHeaderCell>
                  <CTableHeaderCell>UL/Quarter</CTableHeaderCell>
                  <CTableHeaderCell>FY Start</CTableHeaderCell>
                  <CTableHeaderCell>Effective From</CTableHeaderCell>
                  <CTableHeaderCell>Effective To</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Actions</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {policies?.length > 0 &&
                  policies?.map((policy) => (
                    <CTableRow key={policy._id}>
                      <CTableDataCell>{policy.name}</CTableDataCell>
                      <CTableDataCell>{policy.clPerMonth}</CTableDataCell>
                      <CTableDataCell>{policy.clYearlyCap}</CTableDataCell>
                      <CTableDataCell>{policy.ulPerQuarter}</CTableDataCell>
                      <CTableDataCell>
                        {new Date(2024, policy.financialYearStartMonth).toLocaleString('default', {
                          month: 'long',
                        })}
                      </CTableDataCell>
                      <CTableDataCell>
                        {policy.effectiveFrom
                          ? new Date(policy.effectiveFrom).toLocaleDateString()
                          : '-'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {policy.effectiveTo
                          ? new Date(policy.effectiveTo).toLocaleDateString()
                          : '-'}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={policy.isActive ? 'success' : 'secondary'}>
                          {policy.isActive ? 'Active' : 'Inactive'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="d-flex gap-2 flex-wrap">
                        {isAdminOrHR && isPolicyExpired(policy) && (
                          <CButton
                            size="sm"
                            color="success"
                            variant="outline"
                            onClick={() => downloadExpiredPolicyExcel(policy)}
                            disabled={downloadingPolicyId === policy._id}
                            title="Download Excel report"
                          >
                            {downloadingPolicyId === policy._id ? (
                              <CSpinner size="sm" className="me-1" />
                            ) : (
                              <CIcon icon={cilCloudDownload} />
                            )}
                          </CButton>
                        )}
                        <CButton size="sm" color="info" onClick={() => handleEdit(policy)}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton size="sm" color="danger" onClick={() => handleDelete(policy)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                        {/* {!policy.isActive && (
                          <CButton
                            size="sm"
                            color="success"
                            onClick={() => handleActivate(policy._id)}
                          >
                            <CIcon icon={cilCheckCircle} /> Activate
                          </CButton>
                        )} */}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Create/Edit Modal */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>{editingPolicy ? 'Edit Policy' : 'Create Policy'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Policy Name *</CFormLabel>
                <CFormInput
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Policy name"
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Financial Year Start Month</CFormLabel>
                <AppFormSelect
                  value={formData.financialYearStartMonth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      financialYearStartMonth: Number(e.target.value),
                    })
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </AppFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>CL / Month</CFormLabel>
                <CFormInput
                  type="number"
                  value={formData.clPerMonth}
                  onChange={(e) => setFormData({ ...formData, clPerMonth: Number(e.target.value) })}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>CL Yearly Cap</CFormLabel>
                <CFormInput
                  type="number"
                  value={formData.clYearlyCap}
                  onChange={(e) =>
                    setFormData({ ...formData, clYearlyCap: Number(e.target.value) })
                  }
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>UL / Quarter</CFormLabel>
                <CFormInput
                  type="number"
                  value={formData.ulPerQuarter}
                  onChange={(e) =>
                    setFormData({ ...formData, ulPerQuarter: Number(e.target.value) })
                  }
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Effective From</CFormLabel>
                <CFormInput
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Effective To</CFormLabel>
                <CFormInput
                  type="date"
                  value={formData.effectiveTo}
                  onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol>
                <CFormLabel>Description</CFormLabel>
                <CFormInput
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <CFormLabel>Status</CFormLabel>
                <AppFormSelect
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.value === 'true' })
                  }
                >
                  <option value="false">Inactive</option>
                  <option value="true">Active</option>
                </AppFormSelect>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </CButton>
          <CButton color="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </CButton>
          </CModalFooter>
      </CModal>

      {/* Delete Confirmation Modal */}
      <CModal 
        visible={showDeleteModal} 
        onClose={() => {
          setShowDeleteModal(false)
          setPolicyToDelete(null)
        }}
        alignment="center"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>Delete Policy Confirmation</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CAlert color="danger">
            <strong>Warning!</strong>
            <p className="mb-0 mt-2">
              Are you sure you want to delete the policy <strong>"{policyToDelete?.name}"</strong>?
            </p>
            <p className="mb-0 mt-2 small">
              This action cannot be undone.
            </p>
          </CAlert>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => {
              setShowDeleteModal(false)
              setPolicyToDelete(null)
            }}
          >
            Cancel
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            Yes, Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default LeavePolicyDashboard
