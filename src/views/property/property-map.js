import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  CButton,
  CCard,
  CCol,
  CContainer,
  CFormCheck,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTooltip,
  CFormSwitch,
} from '@coreui/react'

import {
  GoogleMap,
  useJsApiLoader,
  InfoWindow,
  StandaloneSearchBox,
  InfoWindowF,
} from '@react-google-maps/api'
import BasicProvider from 'src/constants/BasicProvider'
import Markericon from 'src/assets/images/bluemarker.png'
import RedMarkericon from 'src/assets/images/redMarkerIcons.png'
import yellowMarkericon from 'src/assets/images/yellowMarker.png'
import blackMarkericon from 'src/assets/images/blackMarker.png'
import moment from 'moment'
import { Marker } from '@react-google-maps/api'
import CIcon from '@coreui/icons-react'
import { cilAlbum, cilMap, cilPencil, cilSearch, cilSettings } from '@coreui/icons'
import CustomTooltip from 'src/components/custom/CustomTooltip'
import ForcePinAttachmentImage from 'src/components/property/ForcePinAttachmentImage'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { cilCheck } from '@coreui/icons'
import { useSelector } from 'react-redux'
const libraries = ['places']
const containerStyle = {
  width: '100%',
  height: '75vh',
}
let BROKER = process.env.REACT_APP_BROKER

const Map = () => {
  const loggedinUserRole = useSelector((state) => state?.userRole)

  const [center, setCenter] = useState({ lat: 23.2, lng: 78.0 })
  const [zoom, setZoom] = useState(8)
  const [map, setMap] = useState(null)
  const [searchBox, setSearchBox] = useState(null)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [selectedPropertyMarker, setSelectedPropertyMarker] = useState(null)
  const [cases, setCases] = useState([])
  const [markerIcon, setMarkerIcon] = useState(null)
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [error, setError] = useState(null)
  const markersRef = useRef([])
  const debounceTimerRef = useRef(null)
  const [searchedLocation, setSearchedLocation] = useState(null)
  const [properties, setProperties] = useState([])
  const [propertyMarkerIcon, setPropertyMarkerIcon] = useState(null)

  const [isSatellite, setIsSatellite] = useState(false)

  const [date_from, setDateFrom] = useState()
  const [date_to, setDateTo] = useState()
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all')
  const [isVerify, setIsVerify] = useState(false)
  const effectRef = useRef(false)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries: libraries,
  })

  const toggleMapType = () => {
    if (map) {
      const newMapType = isSatellite ? 'roadmap' : 'satellite'
      map.setMapTypeId(newMapType)
      setIsSatellite(!isSatellite)
    }
  }

  // Debounced center update handler
  const onCenterChanged = useCallback(() => {
    if (map) {
      const newCenter = map.getCenter()

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        const updatedCenter = {
          lat: newCenter.lat(),
          lng: newCenter.lng(),
        }
        setCenter(updatedCenter)
      }, 1000)
    }
  }, [map])

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().slice(0, 10)
  }

  // Fetch property data
  const fetchPropertyData = useCallback(async () => {
    try {
      setIsDataLoaded(false)
      const params = [
        `lat=${center.lat}`,
        `lng=${center.lng}`,
        propertyTypeFilter !== 'all' ? `type=${encodeURIComponent(propertyTypeFilter)}` : '',
        isVerify ? 'isVerify=true' : '',
        `startDate=${formatDate(date_from)}`,
        `endDate=${formatDate(date_to)}`,
      ]
        .filter(Boolean)
        .join('&')

      const response = await new BasicProvider(`properties/map-data?${params}`).getRequest()
      if (response && response.data) {
        setProperties(response.data)
      } else {
        setProperties([])
      }
    } catch (error) {
      console.error('Error fetching property data:', error)
      setProperties([])
    } finally {
      setIsDataLoaded(true)
    }
  }, [center, propertyTypeFilter, isVerify, date_from, date_to])
  // Initialize marker icon
  useEffect(() => {
    if (isLoaded && window.google) {
      const blueMarker = {
        url: Markericon,
        scaledSize: new window.google.maps.Size(40, 40),
      }
      setMarkerIcon(blueMarker)

      // Use a different color marker for properties (e.g., red)
      const redMarker = {
        url: RedMarkericon, // Place your red marker image in public folder or import it
        scaledSize: new window.google.maps.Size(40, 40),
      }
      const yellowMarker = {
        url: yellowMarkericon, // Place your red marker image in public folder or import it
        scaledSize: new window.google.maps.Size(40, 40),
      }
      const blackMarker = {
        url: blackMarkericon, // Place your red marker image in public folder or import it
        scaledSize: new window.google.maps.Size(40, 40),
      }
      setPropertyMarkerIcon({ broker: yellowMarker, sold: blackMarker, 'for sale': redMarker })
    }
  }, [isLoaded])

  // Fetch data when center changes
  useEffect(() => {
    fetchPropertyData()
  }, [center, propertyTypeFilter, isVerify, date_from, date_to, fetchPropertyData])
  // useEffect(() => {
  //   fetchPropertyData()
  // }, [center, propertyTypeFilter, isVerify, date_from, date_to, fetchPropertyData])

  // Handle map load
  const onLoad = useCallback((map) => {
    setMap(map)
    map.setCenter({ lat: 23.2, lng: 78.0 })
    map.setZoom(8)
  }, [])

  // Handle places search
  const onPlacesChanged = () => {
    if (searchBox && map) {
      const places = searchBox.getPlaces()
      if (places.length === 0) return

      const place = places[0]
      if (!place.geometry || !place.geometry.location) {
        console.log('Returned place contains no geometry')
        return
      }

      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport)
      } else {
        map.setCenter(place.geometry.location)
        map.setZoom(17)
      }

      setCenter(place.geometry.location.toJSON())
      setSearchedLocation(place.geometry.location.toJSON())
      setZoom(map.getZoom())
    }
  }

  // Update markers when data changes
  useEffect(() => {
    if (isLoaded && map && markerIcon) {
      // Clear existing markers
      markersRef.current
        .filter((marker) => marker !== null)
        .forEach((marker) => marker.setMap(null))

      // Create new markers
      markersRef.current = cases
        .filter((caseData) => caseData.latitude_by_fe && caseData.longitude_by_fe)
        .map((caseData) => {
          const lat = Number(caseData.latitude_by_fe)
          const lng = Number(caseData.longitude_by_fe)

          const marker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            icon: markerIcon,
            title: caseData.applicant_name,
          })

          marker.addListener('click', () => {
            setSelectedPropertyMarker(caseData)
            // setSelectedMarker(caseData)
          })

          return marker
        })
        .filter((marker) => marker !== null)
    }
  }, [isLoaded, map, markerIcon, cases])

  const handleSearch = async () => {}

  useEffect(() => {
    if (effectRef.current === false) {
      effectRef.current = true
      handleSearch()
    }
  }, [date_from, date_to])

  if (loadError) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <h1 className="text-danger">Google API Error</h1>
          <p>This error occurred on the Google API</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h6 className="text-primary">Loading, please wait...</h6>
        </div>
      </div>
    )
  }

  // ...existing code...

  // Helper to render created/updated by info and verification status
  const renderCreatedUpdatedBy = (property) => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong>Status:</strong>
        {property.isVerify ? (
          <h6 className="text-success  d-flex align-items-center">
            Verified{' '}
            <CIcon icon={cilCheck} className="ms-1" style={{ color: 'green', fontSize: 18 }} />
          </h6>
        ) : (
          <span className="text-warning">Pending</span>
        )}
      </div>
      {property.createdBy && (
        <p>
          <strong>Created By:</strong> {property.createdBy.name}
          {property.created_at && (
            <> on {moment(property.created_at).format('DD MMM YYYY, HH:mm')}</>
          )}
        </p>
      )}
      {property.updatedBy && (
        <p>
          <strong>Updated By:</strong> {property.updatedBy.name}
          {property.updated_at && (
            <> on {moment(property.updated_at).format('DD MMM YYYY, HH:mm')}</>
          )}
        </p>
      )}
    </>
  )

  // Helper to render property InfoWindow based on type
  const renderPropertyInfoWindow = (property) => {
    if (!property) return null

    const infoWindowProps = {
      position: {
        lat: Number(property.latitude),
        lng: Number(property.longitude),
      },
      onCloseClick: () => setSelectedPropertyMarker(null),
    }

    switch (property.type) {
      case 'for sale':
        return (
          <InfoWindowF {...infoWindowProps}>
            <CContainer>
              <CRow className="mb-2">
                <CCol md={12}>
                  <h6 className="text-success mb-2">For Sale Property</h6>
                  <ForcePinAttachmentImage
                    attachmentKey={property.attachmentKey}
                    attachmentKeys={property.attachmentKeys}
                  />
                  <p>
                    <strong>Seller Name:</strong> {property.sellerName}
                  </p>
                  <p>
                    <strong>Contact No. 1:</strong> {property.contactNumber1}
                  </p>
                  <p>
                    <strong>Contact No. 2:</strong> {property.contactNumber2}
                  </p>
                  <p>
                    <strong>Property Type:</strong> {property.propertyType}
                  </p>
                  <p>
                    <strong>City:</strong> {property.city}
                  </p>
                  <p>
                    <strong>District:</strong> {property.district}
                  </p>
                  <p>
                    <strong>Super Built-up Area:</strong> {property.superBuiltupArea}
                  </p>
                  <p>
                    <strong>Carpet Area:</strong> {property.carpetArea}
                  </p>
                  <p>
                    <strong>Rate per Sqft:</strong> {property.ratePerSqft}
                  </p>
                  <p>
                    <strong>Total Rate:</strong> {property.totalRate}
                  </p>
                  <p>
                    <strong>Rental Income:</strong> {property.isOnRentalIncome ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong>Remark:</strong> {property.remark}
                  </p>
                  <p>
                    <strong>Lat/Lng:</strong> {property.latitude} / {property.longitude}
                  </p>
                  {property.created_at && (
                    <p>
                      <strong>Created At:</strong>
                      {property.created_at && (
                        <> on {moment(property.created_at).format('DD MMM YYYY, HH:mm')}</>
                      )}
                    </p>
                  )}

                  {loggedinUserRole.name === BROKER ? '' : renderCreatedUpdatedBy(property)}
                </CCol>
              </CRow>
            </CContainer>
          </InfoWindowF>
        )
      case 'sold':
        return (
          <InfoWindowF {...infoWindowProps}>
            <CContainer>
              <CRow className="mb-2">
                <CCol md={12}>
                  <h6 className="text-dark mb-2">Sold Property</h6>
                  <ForcePinAttachmentImage
                    attachmentKey={property.attachmentKey}
                    attachmentKeys={property.attachmentKeys}
                  />
                  <p>
                    <strong>Seller Name:</strong> {property.sellerName}
                  </p>
                  <p>
                    <strong>Seller Contact:</strong> {property.sellerContact}
                  </p>
                  <p>
                    <strong>Buyer Name:</strong> {property.buyerName}
                  </p>
                  <p>
                    <strong>Buyer Contact:</strong> {property.buyerContact}
                  </p>
                  <p>
                    <strong>Deal Date:</strong> {property.dealDate}
                  </p>
                  <p>
                    <strong>Sold Amount:</strong> {property.soldAmount}
                  </p>
                  <p>
                    <strong>Property Type:</strong> {property.propertyType}
                  </p>
                  <p>
                    <strong>City:</strong> {property.city}
                  </p>
                  <p>
                    <strong>District:</strong> {property.district}
                  </p>
                  <p>
                    <strong>Super Built-up Area:</strong> {property.superBuiltupArea}
                  </p>
                  <p>
                    <strong>Carpet Area:</strong> {property.carpetArea}
                  </p>
                  <p>
                    <strong>Rental Income:</strong> {property.isOnRentalIncome ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong>Remark:</strong> {property.remark}
                  </p>
                  <p>
                    <strong>Lat/Lng:</strong> {property.latitude} / {property.longitude}
                  </p>
                  {property.created_at && (
                    <p>
                      <strong>Created At:</strong>
                      {property.created_at && (
                        <> on {moment(property.created_at).format('DD MMM YYYY, HH:mm')}</>
                      )}
                    </p>
                  )}
                  {loggedinUserRole.name === BROKER ? '' : renderCreatedUpdatedBy(property)}
                </CCol>
              </CRow>
            </CContainer>
          </InfoWindowF>
        )
      case 'broker':
        return (
          <InfoWindowF {...infoWindowProps}>
            <CContainer>
              <CCol md={12}>
                <h6 className="text-primary mb-2">Broker</h6>
                <ForcePinAttachmentImage
                  attachmentKey={property.attachmentKey}
                  attachmentKeys={property.attachmentKeys}
                />
                <p>
                  <strong>Name:</strong> {property.name}
                </p>
                <p>
                  <strong>Contact No. 1:</strong> {property.contactNumber1}
                </p>
                <p>
                  <strong>Contact No. 2:</strong> {property.contactNumber2}
                </p>
                <p>
                  <strong>Address:</strong> {property.address}
                </p>
                <p>
                  <strong>City:</strong> {property.city}
                </p>
                <p>
                  <strong>Area of Work:</strong> {property.areaOfWork}
                </p>
                <p>
                  <strong>District:</strong> {property.district}
                </p>
                <p>
                  <strong>Years of Working:</strong> {property.yearsOfWorking}
                </p>
                <p>
                  <strong>Remark:</strong> {property.remark}
                </p>
                <p>
                  <strong>Lat/Lng:</strong> {property.latitude} / {property.longitude}
                </p>
                {property.created_at && (
                  <p>
                    <strong>Created At:</strong>
                    {property.created_at && (
                      <> on {moment(property.created_at).format('DD MMM YYYY, HH:mm')}</>
                    )}
                  </p>
                )}
                {loggedinUserRole.name === BROKER ? '' : renderCreatedUpdatedBy(property)}
              </CCol>
            </CContainer>
          </InfoWindowF>
        )
      default:
        return null
    }
  }

  return (
    <CContainer fluid className="mt-2">
      <CRow className="g-3 align-items-end mb-3 ">
        <CCol xs={6} sm={3} md={3}>
          <label className="form-label fw-semibold mb-1">From Date</label>
          <DatePicker
            selected={date_from}
            onChange={(date) => {
              effectRef.current = false
              setDateFrom(date || today)
            }}
            dateFormat="yyyy-MM-dd"
            className="form-control"
            maxDate={date_to}
            placeholderText="Select start date"
          />
        </CCol>
        <CCol xs={6} sm={3} md={3}>
          <label className="form-label fw-semibold mb-1">To Date</label>
          <DatePicker
            selected={date_to}
            onChange={(date) => {
              effectRef.current = false
              setDateTo(date || today)
            }}
            dateFormat="yyyy-MM-dd"
            className="form-control"
            minDate={date_from}
            maxDate={new Date()}
            placeholderText="Select end date"
          />
        </CCol>
        <CCol xs={6} sm={3} md={3}>
          <label className="form-label fw-semibold mb-1">Pin Type</label>
          <select
            className="form-select"
            style={{ height: '38px' }} // Match DatePicker height
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
          >
            <option value="all">All Property</option>
            <option value="sold">Sold</option>
            <option value="for sale">For Sale</option>
            <option value="broker">Broker</option>
          </select>
        </CCol>
        {loggedinUserRole.name === BROKER ? (
          ''
        ) : (
          <CCol
            xs="auto"
            className="d-flex align-items-center"
            style={{ minWidth: 'unset', width: 'auto' }}
          >
            <div>
              <label className="form-label fw-semibold mb-2 ">
                {isVerify ? 'Verified' : 'Not Verified'}
              </label>
              {/* <div style={{ border:"2px solid green",paddingLeft:"0px" }}> */}
              {/* <input
                type="checkbox"
                checked={isVerify}
                onChange={(e) => setIsVerify(e.target.checked)}
                className="form-check-input"
                style={{
                  height: '38px',
                  width: '38px',
                }}
              /> */}
              <CFormSwitch
                id="verifyFormSwitch"
                checked={isVerify}
                onChange={(e) => setIsVerify(e.target.checked)}
                size="xl"
                style={{
                  paddingLeft: '50px',
                }}
              />

              {/* </div> */}
            </div>
          </CCol>
        )}
      </CRow>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        onDragEnd={onCenterChanged}
        onZoomChanged={() => {
          if (map) {
            onCenterChanged()
          }
        }}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={() => setMap(null)}
      >
        <StandaloneSearchBox onLoad={(ref) => setSearchBox(ref)} onPlacesChanged={onPlacesChanged}>
          <div className="map_search_box d-lg-flex justify-content-center">
            <CTooltip content="Change Map Type">
              <CButton
                size="sm"
                className="map_toggle_button me-4 mt-1"
                color={'warning'}
                onClick={toggleMapType}
              >
                {<CIcon icon={cilMap} />}
              </CButton>
            </CTooltip>
            <input
              className="map_input"
              type="text"
              placeholder="Search for any location or address..."
            />
            {!isDataLoaded && (
              <div className="d-lg-flex align-items-center bg-success text-white py-0 px-3 rounded-5 map_loader">
                <CSpinner size="sm" className="me-1"></CSpinner> Loading ...
              </div>
            )}
          </div>
        </StandaloneSearchBox>

        {searchedLocation && (
          <Marker
            position={searchedLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#FF0000',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          />
        )}

        {isLoaded &&
          map &&
          propertyMarkerIcon &&
          properties.map(
            (property, idx) =>
              property.latitude &&
              property.longitude && (
                <Marker
                  key={`property-${idx}`}
                  position={{ lat: Number(property.latitude), lng: Number(property.longitude) }}
                  icon={propertyMarkerIcon[property.type] || propertyMarkerIcon['for sale']}
                  title={property.name || 'Property'}
                  onClick={() => {
                    // setSelectedMarker(null)
                    setSelectedPropertyMarker(property)
                  }}
                />
              ),
          )}
        {selectedPropertyMarker && renderPropertyInfoWindow(selectedPropertyMarker)}
      </GoogleMap>
      <div className="d-flex justify-content-center mt-3 mb-3">
        <div className="px-4 py-2 bg-light rounded-3 shadow-sm border">
          <h6 className="m-0 text-danger">
            Current Coordinates:{' '}
            <span className="text-dark">
              {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
            </span>
          </h6>
        </div>
      </div>
    </CContainer>
  )
}

export default Map
