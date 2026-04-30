import React from 'react'
import { CCard, CCardBody, CCardHeader, CFormInput, CFormLabel, CFormSelect, CButton, CCol, CRow } from '@coreui/react'
import { cilFilter, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import PropTypes from 'prop-types'
import { DEPARTMENT_FILTERS, EMPLOYEE_STATUS_FILTERS, SORT_OPTIONS, SORT_OPTION_LABELS } from '../../../constants/musterRollConstants'

const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  disabled = false,
  className = ''
}) => {
  const {
    department,
    employeeStatus,
    searchTerm,
    sortBy,
    sortOrder
  } = filters

  const handleInputChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    })
  }

  const handleClearFilters = () => {
    onClearFilters()
  }

  const hasActiveFilters = department !== 'all' || 
                          employeeStatus !== 'all' || 
                          searchTerm || 
                          sortBy !== 'employeeName'

  return (
    <CCard className={`filter-panel ${className}`}>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <CIcon icon={cilFilter} className="me-2" />
          <h6 className="mb-0">Filters & Search</h6>
        </div>
        {hasActiveFilters && (
          <CButton
            color="link"
            size="sm"
            onClick={handleClearFilters}
            disabled={disabled}
          >
            <CIcon icon={cilX} className="me-1" />
            Clear
          </CButton>
        )}
      </CCardHeader>
      
      <CCardBody>
        <CRow className="g-3">
          <CCol md={3}>
            <CFormLabel>Search Employee</CFormLabel>
            <CFormInput
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => handleInputChange('searchTerm', e.target.value)}
              disabled={disabled}
            />
          </CCol>
          
          <CCol md={3}>
            <CFormLabel>Department</CFormLabel>
            <CFormSelect
              value={department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              disabled={disabled}
            >
              {DEPARTMENT_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          
          <CCol md={3}>
            <CFormLabel>Employee Status</CFormLabel>
            <CFormSelect
              value={employeeStatus}
              onChange={(e) => handleInputChange('employeeStatus', e.target.value)}
              disabled={disabled}
            >
              {EMPLOYEE_STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          
          <CCol md={3}>
            <CFormLabel>Sort By</CFormLabel>
            <CFormSelect
              value={sortBy}
              onChange={(e) => handleInputChange('sortBy', e.target.value)}
              disabled={disabled}
            >
              {Object.entries(SORT_OPTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
        </CRow>
        
        <CRow className="mt-3">
          <CCol md={3}>
            <CFormLabel>Sort Order</CFormLabel>
            <CFormSelect
              value={sortOrder}
              onChange={(e) => handleInputChange('sortOrder', e.target.value)}
              disabled={disabled}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </CFormSelect>
          </CCol>
          
          <CCol md={9} className="d-flex align-items-end">
            <CButton
              color="primary"
              onClick={onApplyFilters}
              disabled={disabled}
              className="me-2"
            >
              <CIcon icon={cilFilter} className="me-1" />
              Apply Filters
            </CButton>
            
            {hasActiveFilters && (
              <CButton
                color="secondary"
                variant="outline"
                onClick={handleClearFilters}
                disabled={disabled}
              >
                <CIcon icon={cilX} className="me-1" />
                Clear All
              </CButton>
            )}
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

FilterPanel.propTypes = {
  filters: PropTypes.shape({
    department: PropTypes.string,
    employeeStatus: PropTypes.string,
    searchTerm: PropTypes.string,
    sortBy: PropTypes.string,
    sortOrder: PropTypes.string
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  onApplyFilters: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string
}

export default FilterPanel
