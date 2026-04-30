import React from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CSpinner,
} from '@coreui/react'
import { Home, IndianRupee, User } from 'lucide-react'
import BrokerForm from './forms/BrokerForm'
import ForSaleForm from './forms/ForSaleForm'
import SoldForm from './forms/SoldForm'
import BasicProvider from 'src/constants/BasicProvider'

const ForcePinModal = ({ visible, close, setSelectedType, selectedType }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const handleButtonClick = (type) => setSelectedType(type)
  const handleBack = () => {
    if (isSubmitting) return
    setSelectedType(null)
  }

  const handleSubmit = async (formData) => {
    // formData may be JSON object or FormData (when optional image is attached)
    try {
      setIsSubmitting(true)
      const response = await new BasicProvider(`properties/create`).postRequest(formData)
      if (response?.status === 'success') {
        window.dispatchEvent(new Event('forcePinCreated'))
        close()
        setSelectedType(null)
      }
      return response
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CModal
      visible={visible}
      onClose={close}
      alignment="center"
      size={selectedType ? 'lg' : 'md'}
      className="force-pin-modal"
      backdrop="static"
      keyboard={false}
    >
      <CModalHeader onClose={isSubmitting ? undefined : close}>
        <CModalTitle className="fw-bold text-primary">
          {selectedType
            ? `Add Force Pin - ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`
            : 'Add Force Pin'}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {!selectedType ? (
          <>
            <p className="text-muted text-center mb-4">
              Select which type of Force Pin you’d like to create:
            </p>

            <CRow className="justify-content-center">
              <CCol xs={12}>
                <div className="d-flex justify-content-center align-items-center gap-3 flex-nowrap">
                  {/* Sold */}
                  <div
                    className="pin-card"
                    onClick={() => handleButtonClick('sold')}
                    style={{ borderTop: '3px solid #198754' }}
                  >
                    <Home size={20} color="#198754" />
                    <span className="text-success fw-semibold">Sold</span>
                  </div>

                  {/* For Sale */}
                  <div
                    className="pin-card"
                    onClick={() => handleButtonClick('forSale')}
                    style={{ borderTop: '3px solid #dc3545' }}
                  >
                    <IndianRupee size={20} color="#dc3545" />
                    <span className="text-danger fw-semibold">For Sale</span>
                  </div>

                  {/* Broker */}
                  <div
                    className="pin-card"
                    onClick={() => handleButtonClick('broker')}
                    style={{ borderTop: '3px solid #ffc107' }}
                  >
                    <User size={20} color="#ffc107" />
                    <span className="text-warning fw-semibold">Broker</span>
                  </div>
                </div>
              </CCol>
            </CRow>
          </>
        ) : (
          <>
            {selectedType === 'broker' && <BrokerForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
            {selectedType === 'forSale' && <ForSaleForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
            {selectedType === 'sold' && <SoldForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />}
          </>
        )}
      </CModalBody>

      <CModalFooter>
        {selectedType ? (
          <>
            {isSubmitting && (
              <div className="me-auto text-muted d-flex align-items-center gap-2">
                <CSpinner size="sm" />
                <span>Uploading data and attachment...</span>
              </div>
            )}
            <CButton color="secondary" onClick={handleBack} disabled={isSubmitting}>
              Back
            </CButton>
          </>
        ) : (
          <CButton color="secondary" onClick={close} disabled={isSubmitting}>
            Cancel
          </CButton>
        )}
      </CModalFooter>

      <style jsx>{`
        .pin-card {
          width: 150px;
          height: 90px;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #eee;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.25s ease-in-out;
        }

        .pin-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }

        @media (max-width: 576px) {
          .pin-card {
            width: 120px;
            height: 80px;
          }
        }
      `}</style>
    </CModal>
  )
}

export default ForcePinModal

// import React, { useState } from 'react'
// import {
//   CButton,
//   CModal,
//   CModalHeader,
//   CModalTitle,
//   CModalBody,
//   CModalFooter,
//   CRow,
//   CCol,
// } from '@coreui/react'
// import BrokerForm from './forms/BrokerForm'
// import ForSaleForm from './forms/ForSaleForm'
// import SoldForm from './forms/SoldForm'
// import BasicProvider from 'src/constants/BasicProvider'

// const ForcePinModal = ({ visible, close, setSelectedType, selectedType }) => {
//   // const [selectedType, setSelectedType] = useState(null);

//   const handleButtonClick = (type) => {
//     setSelectedType(type)
//   }

//   const handleBack = () => {
//     setSelectedType(null)
//   }

//   const handleSubmit = async (formData) => {
//     console.log(`Force pin ${selectedType} form submitted:`, formData)
//     const response = await new BasicProvider(`properties/create`).postRequest(formData)

//     if (response && response.status === 'success') {
//       console.log('Response from API:', response)
//       window.dispatchEvent(new Event('forcePinCreated'))
//       close()
//       setSelectedType(null)
//     }

//     return response
//   }

//   return (
//     <CModal visible={visible} onClose={close} alignment="center" size={selectedType ? 'lg' : 'md'}>
//       <CModalHeader onClose={close}>
//         <CModalTitle>
//           {selectedType
//             ? `Add Force Pin - ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`
//             : 'Add Force Pin'}
//         </CModalTitle>
//       </CModalHeader>

//       <CModalBody>
//         {!selectedType ? (
//           <>
//             <p>Select force pin type:</p>
//             <CRow className="justify-content-center mt-3">
//               <CCol xs={12} className="d-flex flex-column gap-3">
//                 <CButton color="success" className="py-2" onClick={() => handleButtonClick('sold')}>
//                   Sold
//                 </CButton>

//                 <CButton
//                   color="danger"
//                   className="py-2 text-white"
//                   onClick={() => handleButtonClick('forSale')}
//                 >
//                   For Sale
//                 </CButton>

//                 <CButton
//                   color="warning"
//                   className="py-2"
//                   onClick={() => handleButtonClick('broker')}
//                 >
//                   Broker
//                 </CButton>
//               </CCol>
//             </CRow>
//           </>
//         ) : (
//           <>
//             {selectedType === 'broker' && <BrokerForm onSubmit={handleSubmit} />}
//             {selectedType === 'forSale' && <ForSaleForm onSubmit={handleSubmit} />}
//             {selectedType === 'sold' && <SoldForm onSubmit={handleSubmit} />}
//           </>
//         )}
//       </CModalBody>

//       <CModalFooter>
//         {selectedType ? (
//           <>
//             <CButton color="secondary" onClick={handleBack}>
//               Back
//             </CButton>
//           </>
//         ) : (
//           <CButton color="secondary" onClick={close}>
//             Cancel
//           </CButton>
//         )}
//       </CModalFooter>
//     </CModal>
//   )
// }

// export default ForcePinModal
