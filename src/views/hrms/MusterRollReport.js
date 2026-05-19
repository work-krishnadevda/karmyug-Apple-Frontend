import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { CContainer, CRow, CCol, CAlert, CFormLabel, CButton, CCard, CCardBody, CCardHeader } from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import AppContentSkeleton from 'src/components/custom/AppContentSkeleton'
import { cilPeople, cilCalendar, cilFilter, cilCloudDownload, cilReload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import moment from 'moment'

// Components
import DateRangePicker from '../../components/hrms/musterRoll/DateRangePicker'
import FilterPanel from '../../components/hrms/musterRoll/FilterPanel'
import SummaryCards from '../../components/hrms/musterRoll/SummaryCards'
import MusterRollTable from '../../components/hrms/musterRoll/MusterRollTable'
import ExportPanel from '../../components/hrms/musterRoll/ExportPanel'

// Hooks
import useMusterRollData from '../../hooks/useMusterRollData'

// Constants
import { REPORT_PERIODS, DATE_FORMATS } from '../../constants/musterRollConstants'

const MusterRollReport = () => {
  // Month and Year state (primary selection method) - exactly like AdminPayRoll.jsx
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [day, setDay] = useState(new Date().getDate())
  
  // Date range state (for compatibility with DateRangePicker)
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      period: REPORT_PERIODS.MONTHLY,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    }
  })
 

  // Sync dateRange when month/year changes (one-way sync to avoid circularoids)
  useEffect(() => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    setDateRange(prev => ({
      ...prev,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0]
    }))
  }, [month, year])

  // Filter state
  const [filters, setFilters] = useState({
    department: 'all',
    employeeStatus: 'all',
    searchTerm: '',
    name: '',
    raLocation: 'all',
    role: 'all',
    sortBy: 'employeeName',
    sortOrder: 'asc'
  })

  // Custom hook for data management - pass month/year/day directly
  const {
    data,
    originalData, // Original unfiltered data for building filter options
    summaryData,
    loading,
    error,
    exportLoading,
    exportData,
    refreshData
  } = useMusterRollData(filters, dateRange, month, year, day)

  
 

  const handleClearFilters = useCallback(() => {
    setFilters({
      department: 'all',
      employeeStatus: 'all',
      searchTerm: '',
      name: '',
      raLocation: 'all',
      role: 'all',
      sortBy: 'employeeName',
      sortOrder: 'asc'
    })
  }, [])

  const handleApplyFilters = useCallback(() => {
    // Filters are applied automatically through the hook
    console.log('Filters applied:', filters)
  }, [filters])

 
 
 

  // Build dynamic filter options from original unfiltered data
  const raLocations = useMemo(() => {
    const setLoc = new Set()
    // Use originalData instead of filtered data to show all options
    const sourceData = originalData || data
    sourceData.forEach(d => {
      let locValue = ''
      
      // Check raLocationLabel first (preferred)
      if (d.raLocationLabel && d.raLocationLabel !== '-') {
        locValue = d.raLocationLabel.toString().trim()
      }
      // If raLocation is an object, extract label
      else if (d.raLocation && typeof d.raLocation === 'object') {
        locValue = (d.raLocation.label || d.raLocation.name || d.raLocation.value || '').toString().trim()
      }
      // If raLocation is a string
      else if (d.raLocation && d.raLocation !== '-') {
        locValue = d.raLocation.toString().trim()
      }
      
      // Include '-' values as they appear from API; skip empty strings
      if (locValue !== '' || d.raLocation === '-') {
        setLoc.add(locValue || '-')
      }
    })
    return ['all', ...Array.from(setLoc).sort()]
  }, [originalData, data])

  const roles = useMemo(() => {
    const setRole = new Set()
    // Use originalData instead of filtered data to show all options
    const sourceData = originalData || data
    sourceData.forEach(d => {
      const v = (d.designation || '').toString().trim()
      if (v && v !== '-') setRole.add(v)
    })
    return ['all', ...Array.from(setRole).sort()]
  }, [originalData, data])

  if (loading && data.length === 0) {
    return (
      <CContainer fluid className="py-4">
        <AppContentSkeleton
          ariaLabel="Loading muster roll report"
          cards={3}
          rows={6}
        />
      </CContainer>
    )
  }

  return (
    <CContainer fluid>
      {/* Header */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1 fw-bold text-dark">Muster Roll Report</h2>
              <p className="mb-0 text-muted">Employee attendance and working hours report</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <CIcon icon={cilPeople} size="2xl" className="text-primary" />
            </div>
          </div>
        </CCol>
      </CRow>

      {/* Error Alert */}
      {error && (
        <CRow className="mb-4">
          <CCol xs={12}>
            <CAlert color="danger" dismissible>
              <strong>Error:</strong> {error}
              <br />
              <small className="mt-2 d-block">
                If this error persists, please check:
                <ul className="mb-0 mt-2">
                  <li>Backend server is running and accessible</li>
                  <li>You have proper permissions to access muster roll data</li>
                  <li>The selected month/year has attendance data available</li>
                </ul>
              </small>
            </CAlert>
          </CCol>
        </CRow>
      )}

      {/* Month/Year Selection */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <div className="card">
            <div className="card-body">
              <CRow className="g-3 align-items-end">
                <CCol md={3}>
                  <CFormLabel>Select Date</CFormLabel>
                  <input 
                    type="date"
                    className="form-control"
                    value={`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      setMonth(date.getMonth() + 1)
                      setYear(date.getFullYear())
                      setDay(date.getDate())
                    }}
                    disabled={loading}
                  />
                </CCol>

                <CCol md={3}>
                  <CButton
                    color="primary"
                    onClick={refreshData}
                    disabled={loading}
                    className="w-100"
                  >
                    <CIcon icon={cilReload} className="me-2" />
                    {loading ? 'Loading...' : 'Refresh Data'}
                  </CButton>
                </CCol>

                <CCol md={6}>
                  <div className="text-muted small">
                    <strong>Selected Date:</strong> {moment().month(month - 1).date(day).format('MMMM DD, YYYY')}
                  </div>
                </CCol>
              </CRow>
            </div>
          </div>
        </CCol>
      </CRow>

      {/* Summary Cards */}
      <CRow className="mb-4">
        <CCol xs={12}>
          <SummaryCards
            summaryData={summaryData}
            loading={loading}
          />
        </CCol>
      </CRow>

      {/* Filters: Name, RA Location, Role (card-style) */}
      <CRow className="mb-3">
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilFilter} />
                <strong>Filters</strong>
              </div>
              <div className="small text-muted">Apply filters to narrow results</div>
            </CCardHeader>
            <CCardBody>
              <CRow className="g-3 align-items-end">
                <CCol md={4}>
                  <CFormLabel>Filter by Name</CFormLabel>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name"
                    value={filters.name}
                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    disabled={loading}
                  />
                </CCol>

                <CCol md={3}>
                  <CFormLabel>RA Location</CFormLabel>
                  <AppFormSelect
                    value={filters.raLocation}
                    onChange={(e) => setFilters(prev => ({ ...prev, raLocation: e.target.value }))}
                    disabled={loading}
                  >
                    {raLocations.map((loc) => (
                      <option key={loc} value={loc}>{loc === 'all' ? 'All' : loc}</option>
                    ))}
                  </AppFormSelect>
                </CCol>

                <CCol md={3}>
                  <CFormLabel>Role</CFormLabel>
                  <AppFormSelect
                    value={filters.role}
                    onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                    disabled={loading}
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r === 'all' ? 'All' : r}</option>
                    ))}
                  </AppFormSelect>
                </CCol>

                <CCol md={2} className="d-flex align-items-end gap-2">
                  <CButton color="secondary" onClick={handleClearFilters} disabled={loading}>Clear</CButton>
                  <CButton color="primary" onClick={handleApplyFilters} disabled={loading}>Apply</CButton>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Main Content */}
      <CRow>
        <CCol>
          <MusterRollTable
            data={data}
            loading={loading}
            sortable={true}
          />
        </CCol>
      </CRow>

      {/* Additional Information */}
      <CRow className="mt-4">
        <CCol xs={12}>
          <div className="text-muted small">
            <strong>Report Information:</strong>
            <ul className="mb-0 mt-2">
              <li>Report generated for: {moment().month(month - 1).format('MMMM')} {year}</li>
              <li>Total attendance records: {data.length}</li>
              <li>Unique employees: {summaryData.totalEmployees || 0}</li>
              <li>Last updated: {new Date().toLocaleString()}</li>
              <li>Data source: {error ? 'Error loading data' : 'Live API data'}</li>
            </ul>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default MusterRollReport
