


// import { useEffect, useState } from 'react'
// import 'react-datepicker/dist/react-datepicker.css'
// import { useNavigate, useParams } from 'react-router-dom'
// // import ShopSideBar from 'src/components/custom/ShopSideBar'

// import { CCard, CCardBody, CCardHeader, CCol, CContainer, CForm, CRow } from '@coreui/react'

// import { cilPencil } from '@coreui/icons'
// import CIcon from '@coreui/icons-react'
// // import SingleSubHeader from 'src/components/custom/SingleSubHeader'
// import CustomerSidebar from 'src/components/CustomerSidebar'
// import BasicProvider from 'src/constants/BasicProvider'

// export default function profileOverView(props) {
//   var params = useParams()
//   const { user_Id } = useParams() // Get the userId from the URL
//   const [Shops, setShops] = useState(null)

//   const navigate = useNavigate() // Get the navigation function

//   const fetchUserInfo = async (id) => {
//     try {
//       const response = await new BasicProvider(`customer/show/${id}`).getRequest()
//       setShops(response.data)
//     } catch (error) {
//       console.error('Error fetching user information:', error)
//     }
//   }

//   useEffect(() => {
//     fetchUserInfo(params.id)
//   }, [])
//   const { id } = useParams()

//   const handleEditProfileClick = () => {
//     navigate(`/cms/customers/${id}/edit`, { state: { shopsData: Shops } })
//   }

//   return (
//     <>
//       {/* <SingleSubHeader moduleName="Personal Information" /> */}
//       <CContainer fluid className="px-4">
//         <CForm className="g-3">
//           <CRow fluid>
//             {/* Side Card */}
//             {/* <CCol md={4}>
//               <CustomerSidebar data="abc" />
//             </CCol> */}
//             <CCol md={8}>
//               <CRow>
//                 {/* First col-12 BasicInfo*/}
//                 <CCol xs={12}>
//                   <CCard>
//                     <CCardHeader className="d-flex justify-content-between align-items-center">
//                       <div>Basic Information</div>
//                       <div onClick={handleEditProfileClick}>
//                         <CIcon icon={cilPencil} size="lg" />
//                       </div>
//                     </CCardHeader>
//                     <CCardBody>
//                       <CContainer fluid className="px-4 shyamuBasicInfo">
//                         <CRow className="align-items-center my-2">
//                           <CCol xs={3}>
//                             <div>Name</div>
//                           </CCol>
//                           <CCol xs={8}>
//                             {/* <p>shyamus sim ki dukaan</p> */}
//                             <p>{Shops && Shops.name}</p>
//                           </CCol>
//                         </CRow>
//                         <CRow className="align-items-center my-2">
//                           <CCol xs={3}>
//                             <div>Email</div>
//                           </CCol>
//                           <CCol xs={8}>
//                             <p>{Shops && Shops.email}</p>
//                           </CCol>
//                         </CRow>
//                         <CRow className="align-items-center my-2">
//                           <CCol xs={3}>
//                             <div>Mobile No.</div>
//                           </CCol>
//                           <CCol xs={8}>
//                             <p>{Shops && Shops.mobile}</p>
//                           </CCol>
//                         </CRow>
//                       </CContainer>
//                     </CCardBody>
//                   </CCard>
//                 </CCol>
//                 {/* Profile Details Second col-12 */}
//                 {/* <CCol xs={12} className="mt-4">
//                   <CCard>
//                     <CCardHeader className="d-flex justify-content-between align-items-center">
//                       <div>Profile Details</div>
//                       <div onClick={handleEditProfileClick}>
//                         <CIcon icon={cilPencil} size="lg" />
//                       </div>
//                     </CCardHeader>
//                     <CCardBody>
//                       <CContainer fluid className="px-4 shyamuBasicInfo">
//                         <CRow className="align-items-center my-2">
//                           <CCol xs={3}>
//                             <div>Name</div>
//                           </CCol>
//                           <CCol xs={8}>
//                             <p>{Shops && Shops.retailer_name}</p>
//                           </CCol>
//                         </CRow>
//                         <CRow className="align-items-center my-2">
//                           <CCol xs={3}>
//                             <div>Date Of Birth</div>
//                           </CCol>
//                           <CCol xs={8}>
//                             <p>28 Jul 2023</p>
//                           </CCol>
//                         </CRow>
//                         <CRow className="align-items-center my-2">
//                           <CCol xs={3}>
//                             <div>Currency</div>
//                           </CCol>
//                           <CCol xs={8}>
//                             <p>
//                               {process.env.REACT_APP_DEFAULT_CURRENCY
//                                 ? process.env.REACT_APP_DEFAULT_CURRENCY
//                                 : '-'}
//                             </p>
//                           </CCol>
//                         </CRow>
//                         <CRow className="align-items-center my-2">
//                           <CCol xs={3}>
//                             <div>Type</div>
//                           </CCol>
//                           <CCol xs={8}>
//                             <p>{Shops && Shops.type}</p>
//                           </CCol>
//                         </CRow>
//                       </CContainer>
//                     </CCardBody>
//                   </CCard>
//                 </CCol> */}
//                 {/* Customer Billing Details Third col-12 */}
//                 {/* <CCol xs={12} className="mt-4">
//                   <CCard>
//                     <CCardHeader className="d-flex justify-content-between align-items-center">
//                       <div>Address Details</div>
//                       <div onClick={handleEditProfileClick}>
//                         <CIcon icon={cilPencil} size="lg" />
//                       </div>
//                     </CCardHeader>
//                     <CCardBody></CCardBody>
//                     <CContainer fluid className="px-4 shyamuBasicInfo">
//                       <CRow className="align-items-center my-2">
//                         <CCol xs={3}>
//                           <div>Door No. </div>
//                         </CCol>
//                         <CCol xs={8}>
//                           <p>{Shops && Shops.door_no}</p>
//                         </CCol>
//                       </CRow>
//                       <CRow className="align-items-center my-2">
//                         <CCol xs={3} className="">
//                           <div>Vat</div>
//                         </CCol>
//                         <CCol xs={8}>
//                           <p>{Shops && Shops.vat}</p>
//                         </CCol>
//                       </CRow>
//                       <CRow className="align-items-center my-2">
//                         <CCol xs={3}>
//                           <div>County</div>
//                         </CCol>
//                         <CCol xs={8}>
//                           <p>{Shops && Shops.county_id.name}</p>
//                         </CCol>
//                       </CRow>
//                       <CRow className="align-items-center my-2">
//                         <CCol xs={3}>
//                           <div>City</div>
//                         </CCol>
//                         <CCol xs={8}>
//                           <p>{Shops && Shops.city_id.name}</p>
//                         </CCol>
//                       </CRow>
//                       <CRow className="align-items-center my-2">
//                         <CCol xs={3}>
//                           <div>Region</div>
//                         </CCol>
//                         <CCol xs={8}>
//                           <p>{Shops && Shops.country_id ? Shops.country_id.name : ''}</p>
//                         </CCol>
//                       </CRow>

//                       <CRow className="align-items-center my-2">
//                         <CCol xs={3}>
//                           <div>Postal Code</div>
//                         </CCol>
//                         <CCol xs={8}>
//                           <p>{Shops && Shops.postal_code}</p>
//                         </CCol>
//                       </CRow>

//                       <CRow className="align-items-center my-2">
//                         <CCol xs={3}>
//                           <div>Address</div>
//                         </CCol>
//                         <CCol xs={8}>
//                           <p>{Shops && Shops.address}</p>
//                         </CCol>
//                       </CRow>
//                     </CContainer>
//                   </CCard>
//                 </CCol> */}
//               </CRow>
//             </CCol>
//           </CRow>
//         </CForm>
//       </CContainer>
//     </>
//   )
// }

import { CCard, CCardBody, CCol, CContainer, CForm, CRow } from '@coreui/react'
import { useEffect, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { useNavigate, useParams } from 'react-router-dom'

import HelperFunction from '../../../helpers/HelperFunctions'

import BasicProvider from 'src/constants/BasicProvider'

export default function profileOverView(props) {
  const { id } = useParams() 
  const [data, setData] = useState(null)
  const [collectionData, setCollectionData] = useState()
  const fetchUserInfo = async () => {
    try {
      const response = await HelperFunction.getData(`customer/show/${id}`)
      //console.log(response);
      setData(response.data)
    } catch (error) {
      console.error('Error fetching user information:', error)
    }
  }
  useEffect(() => {
    fetchUserInfo()
  }, [])
  return (
    <>
   
              <CCard>
                <CCardBody>
                  <CContainer fluid className="px-4 profileOverview">
                    <CRow className="justify-content-between d-flex align-items-center profileOverviewRow">
                      <CCol xs={5}>
                        <h6 className="mt-3">Member Profit</h6>
                        <p>Total Wallet Balance</p>
                      </CCol>
                      <CCol xs={3} className="d-flex justify-content-end">
                        <h5>
                         hghgff
                        </h5>
                      </CCol>
                    </CRow>
                    <CRow className="justify-content-between d-flex align-items-center profileOverviewRow">
                      <CCol xs={5}>
                        <h6 className="mt-3">Orders</h6>
                        <p>Total Orders</p>
                      </CCol>
                      <CCol xs={3} className="d-flex justify-content-end">
                        <h5>jgjghjhgjgh</h5>
                      </CCol>
                    </CRow>
                    <CRow className="justify-content-between d-flex align-items-center profileOverviewRow">
                      <CCol xs={5}>
                        <h6 className="mt-3">Issue Reports</h6>
                        <p>System bugs and issues</p>
                      </CCol>
                      <CCol xs={3} className=" d-flex justify-content-end">
                        <h5>-27,49%</h5>
                      </CCol>
                    </CRow>
                    <CRow className="justify-content-between d-flex align-items-center profileOverviewRow">
                      <CCol xs={5}>
                        <h6 className="mt-3">Customer Support</h6>
                        <p>Closed & pending issues</p>
                      </CCol>
                      <CCol xs={3} className="d-flex justify-content-end">
                        <h5>40%</h5>
                      </CCol>
                    </CRow>
                  </CContainer>
                </CCardBody>
              </CCard>
            
    </>
  )
}

