import { CCard, CCardBody, CCol, CImage, CRow } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import BasicProvider from 'src/constants/BasicProvider'
import noImage from 'src/assets/images/noImage.png'

const URL = process.env.REACT_APP_NODE_URL

const CustomerSidebar = (props) => {
  const [Users, setUsers] = useState(null)
  const { id } = useParams()
  const fetchUserInfo = async () => {
    try {
      const response = await new BasicProvider(`customers/show/${id}`).getRequest()
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching user information:', error)
    }
  }
  useEffect(() => {
    fetchUserInfo()
  }, [])

  const getStatusColor = (status) => {
    if (status === 'active') {
      return 'success' // Green
    } else if (status === 'inactive') {
      return 'warning' // Yellow
    } else if (status === 'blacklist') {
      return 'danger' // Red
    }
    return 'info' // Default color
  }

  return (
    <>
      <CCard>
        <CCard className="ShopProfile_side_bar">
          {/* <CCardHeader>Create Status</CCardHeader> */}
          <CCardBody className="p-4">
            <CRow>
              <div className="d-flex">
                <div className="profile_picture">
                  {Users && Users?.featured_image?.filepath ? (
                    <CImage rounded thumbnail src={URL + '/' + Users?.featured_image?.filepath} />
                  ) : (
                    <CImage rounded thumbnail src={noImage} />
                  )}
                </div>
                <div className="usr_name ">
                  <div>
                    <h1>{Users && Users.name}</h1>
                  </div>
                </div>
              </div>
            </CRow>
            <CRow className="py-4 user_details justify-content-center">
              <CRow className="justify-content-between align-items-center">
                <CCol className="justify-content-start ">
                  <div className="user_prsl_details">Email:</div>
                </CCol>
                <CCol className=" ">
                  <span>{Users && Users.email}</span>
                </CCol>
              </CRow>
              <CRow className="justify-content-between align-items-center">
                <CCol className="justify-content-start ">
                  <div className="user_prsl_details">Phone:</div>
                </CCol>
                <CCol className="d-flex justify-content-end ">
                  {/* <span>kkkd</span> */}
                  <span>{Users && Users.mobile}</span>
                </CCol>
              </CRow>
            </CRow>
            <CRow className="profile_tab_icon p-2">
              <NavLink
                to={{
                  pathname: `profile-overview`,
                }}
                style={({ isActive }) => ({
                  color: isActive ? '#8d89ff' : 'gray',
                  background: isActive ? '#f2f3f7' : '#ffffff',
                })}
                className="p-2 d-flex"
              >
                {/* <FontAwesomeIcon icon={faLayerGroup} /> */}

                <h6 className="ms-2 heads">Profile Overview</h6>
              </NavLink>

              <NavLink
                to={{
                  pathname: `info`,
                }}
                style={({ isActive }) => ({
                  color: isActive ? '#8d89ff' : 'gray',
                  background: isActive ? '#f2f3f7' : '#ffffff',
                })}
                className="p-2 d-flex"
              >
                {/* <FontAwesomeIcon icon={faUserAlt} /> */}
                <h6 className="ms-2 heads">Personal Information</h6>
              </NavLink>

              <NavLink
                to={{
                  pathname: `change-password`,
                }}
                style={({ isActive }) => ({
                  color: isActive ? '#8d89ff' : 'gray',
                  background: isActive ? '#f2f3f7' : '#ffffff',
                })}
                className="p-2 d-flex"
              >
                {/* <FontAwesomeIcon icon={faKey} /> */}
                <h6 className="ms-2 heads">Change Password</h6>
              </NavLink>

              <NavLink
                to={{
                  pathname: `email-log`,
                }}
                style={({ isActive }) => ({
                  color: isActive ? '#8d89ff' : 'gray',
                  background: isActive ? '#f2f3f7' : '#ffffff',
                })}
                className="p-2 d-flex"
              >
                {/* <FontAwesomeIcon icon={faEnvelopeOpenText} /> */}
                <h6 className="ms-2 heads">Email Log</h6>
              </NavLink>

              <NavLink
                to={{
                  pathname: `wallet`,
                }}
                style={({ isActive }) => ({
                  color: isActive ? '#8d89ff' : 'gray',
                  background: isActive ? '#f2f3f7' : '#ffffff',
                })}
                className="p-2 d-flex "
              >
                {/* <FontAwesomeIcon icon={faWallet} /> */}
                <h6 className="ms-2 heads">Wallet</h6>
              </NavLink>

              <NavLink
                to={{
                  pathname: `order`,
                }}
                style={({ isActive }) => ({
                  color: isActive ? '#8d89ff' : 'gray',
                  background: isActive ? '#f2f3f7' : '#ffffff',
                })}
                className="p-2 d-flex "
              >
                {/* <FontAwesomeIcon icon={faShoppingBasket} /> */}
                <h6 className="ms-2 heads">Orders</h6>
              </NavLink>

              <NavLink
                to={{
                  pathname: `contact-req`,
                }}
                style={({ isActive }) => ({
                  color: isActive ? '#8d89ff' : 'gray',
                  background: isActive ? '#f2f3f7' : '#ffffff',
                })}
                className="p-2 d-flex "
              >
                {/* <FontAwesomeIcon icon={faShoppingBasket} /> */}
                <h6 className="ms-2 heads">Contact Requests</h6>
              </NavLink>

              <NavLink
                to={{
                  pathname: `support-ticket`,
                }}
                style={({ isActive }) => ({
                  color: isActive ? '#8d89ff' : 'gray',
                  background: isActive ? '#f2f3f7' : '#ffffff',
                })}
                className="p-2 d-flex "
              >
                {/* <FontAwesomeIcon icon={faShoppingBasket} /> */}
                <h6 className="ms-2 heads">Support Ticket</h6>
              </NavLink>


              <NavLink
                to={{
                  pathname: `reviews`,
                }}
                style={({ isActive }) => ({
                  color: isActive ? '#8d89ff' : 'gray',
                  background: isActive ? '#f2f3f7' : '#ffffff',
                })}
                className="p-2 d-flex "
              >
                {/* <FontAwesomeIcon icon={faShoppingBasket} /> */}
                <h6 className="ms-2 heads">Reviews</h6>
              </NavLink>

              <NavLink
                to={{
                  pathname: `activity-log`,
                }}
                style={({ isActive }) => ({
                  color: isActive ? '#8d89ff' : 'gray',
                  background: isActive ? '#f2f3f7' : '#ffffff',
                })}
                className="p-2 d-flex "
              >
                {/* <FontAwesomeIcon icon={faShoppingBasket} /> */}
                <h6 className="ms-2 heads">Activity Log </h6>
              </NavLink>







            </CRow>
          </CCardBody>
        </CCard>
      </CCard>
    </>
  )
}

// export default CustomerSidebar

export default React.memo(CustomerSidebar)
