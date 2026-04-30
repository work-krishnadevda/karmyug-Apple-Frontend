import { useEffect, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { useNavigate, useParams } from 'react-router-dom'
// import VendorideBar from 'src/components/custom/VendorideBar'

import { CCard, CCardBody, CCardHeader, CCol, CContainer, CForm, CRow } from '@coreui/react'

import { cilPencil } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
// import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import CustomerSidebar from 'src/components/CustomerSidebar'
import BasicProvider from 'src/constants/BasicProvider'

export default function personalInfo(props) {
  const { id } = useParams() // Get the userId from the URL
  const [Vendor, setVendor] = useState(null)

  const navigate = useNavigate() // Get the navigation function

  const fetchUserInfo = async () => {
    try {
      const response = await new BasicProvider(`vendors/${id}`).getRequest()
      setVendor(response.data)
    } catch (error) {
      console.error('Error fetching user information:', error)
    }
  }

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const handleEditProfileClick = () => {
    navigate(`/cms/vendors/${id}/edit`, { state: { VendorData: Vendor } })
  }

  return (
    <>
      <CCol>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>Basic Information</div>
            <div onClick={handleEditProfileClick}>
              <CIcon icon={cilPencil} size="lg" />
            </div>
          </CCardHeader>
          <CCardBody>
            <CContainer fluid className="px-4 shyamuBasicInfo">
              <CRow className="align-items-center my-2">
                <CCol xs={3}>
                  <div>Name</div>
                </CCol>
                <CCol xs={8}>
                  {/* <p>shyamus sim ki dukaan</p> */}
                  <p>{Vendor && Vendor.name}</p>
                </CCol>
              </CRow>
              <CRow className="align-items-center my-2">
                <CCol xs={3}>
                  <div>Email</div>
                </CCol>
                <CCol xs={8}>
                  <p>{Vendor && Vendor.email}</p>
                </CCol>
              </CRow>
              <CRow className="align-items-center my-2">
                <CCol xs={3}>
                  <div>Mobile No.</div>
                </CCol>
                <CCol xs={8}>
                  <p>{Vendor && Vendor.mobile}</p>
                </CCol>
              </CRow>
            </CContainer>
          </CCardBody>
        </CCard>
      </CCol>
    </>
  )
}
