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
      const response = await HelperFunction.getData(`vendors/${id}`)
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
                <h5>hghgff</h5>
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
