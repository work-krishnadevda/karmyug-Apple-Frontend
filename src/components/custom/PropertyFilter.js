import { CButton, CCol, CForm, CFormLabel, CFormSelect, CRow } from '@coreui/react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useState } from 'react'

const pinTypes = [
  { value: '', label: 'All' },
  { value: 'sold', label: 'Sold' },
  { value: 'for sale', label: 'For Sale' },
  { value: 'broker', label: 'Broker' },
  // Add more types as needed
]

const verifyOptions = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Verified' },
  { value: 'false', label: 'Not Verified' },
]

const PropertyFilter = ({ filterData, setFilterData, onFilter, onReset }) => {
  const [localFilter, setLocalFilter] = useState({ ...filterData, search: filterData.search || '' })

  const handleChange = (name, value) => {
    setLocalFilter((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFilterData(localFilter)
    onFilter(localFilter)
  }

  return (
    <div className="datatable bg-white mb-2 p-3 pb-2">
      <CForm onSubmit={handleSubmit}>
        <CRow>
          <CCol xs={12} md={3}>
            <CFormLabel>From Date</CFormLabel>
            <DatePicker
              selected={localFilter.fromDate ? new Date(localFilter.fromDate) : null}
              onChange={(date) =>
                handleChange('fromDate', date ? date : '')
              }
              dateFormat="yyyy-MM-dd"
              className="form-control"
              placeholderText="Select From Date"
              maxDate={new Date()}
            />
          </CCol>
          <CCol xs={12} md={3}>
            <CFormLabel>To Date</CFormLabel>
            <DatePicker
              selected={localFilter.toDate ? new Date(localFilter.toDate) : null}
              onChange={(date) =>
                handleChange('toDate', date ? date : '')
              }
              dateFormat="yyyy-MM-dd"
              className="form-control"
              placeholderText="Select To Date"
              maxDate={new Date()}
              minDate={localFilter.fromDate ? new Date(localFilter.fromDate) : null}
            />
          </CCol>
          <CCol xs={12} md={3}>
            <CFormLabel>Pin Type</CFormLabel>
            <CFormSelect
              value={localFilter.pinType || ''}
              onChange={(e) => handleChange('pinType', e.target.value)}
            >
              {pinTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol xs={12} md={3}>
            <CFormLabel>Is Verified</CFormLabel>
            <CFormSelect
              value={localFilter.isVerify || ''}
              onChange={(e) => handleChange('isVerify', e.target.value)}
            >
              {verifyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>
          <CCol xs={12} md={3}>
            <CFormLabel>Property Type<span className="text-danger">*</span></CFormLabel>
            <CFormSelect
              name="propertyType"
              value={localFilter.propertyType || ''}
              onChange={e => handleChange('propertyType', e.target.value)}
              // required
              size="sm"
            >
              <option value="">Select property type</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="land">Land</option>
              <option value="other">Other</option>
            </CFormSelect>
          </CCol>
          <CCol xs={12} md={3} className="mb-2">
            <CFormLabel>Search</CFormLabel>
            <input
              type="text"
              className="form-control"
              placeholder="Type to search..."
              value={localFilter.search || ''}
              onChange={e => handleChange('search', e.target.value)}
            />
            <small className="text-muted">
              You can search by name, contact, city, years of working, seller name, age of property, buyer name, buyer contact, sold amount, Address or landmark.
            </small>
          </CCol>
        </CRow>
        <CRow className="mt-3">
          <CCol>
            <CButton type="submit" color="primary" className="me-2">
              Filter
            </CButton>
            <CButton
              type="button"
              color="danger"
              onClick={() => {
                setLocalFilter({ fromDate: '', toDate: '', pinType: '', isVerify: '', search: '' , propertyType: '' })
                setFilterData({ fromDate: '', toDate: '', pinType: '', isVerify: '', search: '' , propertyType: '' })
                onReset()
              }}
            >
              Reset
            </CButton>
          </CCol>
        </CRow>
      </CForm>
    </div>
  )
}

export default PropertyFilter