import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { Link } from 'react-router-dom'

const AllLogs = () => {
  return (
    <>
      <CRow>
        <CCol md={8} className="m-auto">
          <CCard className="mt-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">All Logs</div>
            </CCardHeader>
            <CCardBody>
              <section class="py-3 px-3 custom_timeline justify-content-start">
                <ul class="timeline">
                  <li class="timeline-item mb-3">
                    <h6 class="fw-bold">Coo fill case details</h6>
                    <p class="text-muted mb-2">11 March 2020</p>
                  </li>

                  <li class="timeline-item mb-3">
                    <h6 class="fw-bold">FE fill all his fields</h6>
                    <p class="text-muted mb-2">19 March 2020</p>
                  </li>

                  <li class="timeline-item mb-3">
                    <h6 class="fw-bold">Sended to Draft Manager(DM)</h6>
                    <p class="text-muted mb-2">24 June 2020</p>
                  </li>

                  <li class="timeline-item mb-3">
                    <h6 class="fw-bold">Case completed sent to Bank Manager(RM)</h6>
                    <p class="text-muted mb-2">15 October 2020</p>
                  </li>
                </ul>
              </section>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}
export default AllLogs
