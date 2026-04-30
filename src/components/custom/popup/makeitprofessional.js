import { cilCheckAlt, cilPaperPlane } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CFormInput,
  CFormLabel,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react'
import { useState } from 'react'
import ImagePreview from '../ImagePreview'

const MakeitProfessional = (props) => {
  const { visible, closeMakeitProfsModel } = props
  const [show, setShow] = useState(false)
  const [isSelected, setIsSelected] = useState([])


// for multiple select value
  // const handleClick = (index) => {
  //   if (isSelected.includes(index)) {
  //     setIsSelected(isSelected.filter((item) => item !== index))
  //   } else {
  //     setIsSelected([...isSelected, index])
  //   }
  // }

  const handleClick = (index) => {
    if (isSelected === index) {
      // If the clicked item is already selected, deselect it
      setIsSelected(null);
    } else {
      // If a different item is clicked, select it
      setIsSelected(index);
    }
  }

  const handleSubmit = async () => {
    setShow(true)
  }

  const data = {
    images: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png',
      },
      {
        url: 'https://buffer.com/cdn-cgi/image/w=1000,fit=contain,q=90,f=auto/library/content/images/size/w1200/2023/10/free-images.jpg',
      },
      {
        url: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg',
      },
      {
        url: 'https://buffer.com/cdn-cgi/image/w=1000,fit=contain,q=90,f=auto/library/content/images/size/w1200/2023/09/instagram-image-size.jpg',
      },
    ],
  }

  return (
    <>
      <CModal
        alignment="center"
        scrollable
        visible={visible}
        onClose={closeMakeitProfsModel}
        aria-labelledby="VerticallyCenteredScrollableExample"
        className="model_show"
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Make It Professional</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="report_user_Select">
            <CFormLabel className="white">Enter prompt here</CFormLabel>
            <div className="d-flex align-items-center ">
              <CFormInput id="floatingInput" placeholder="Type..." className='rounded-start rounded-0' />
              <CButton className="btn-default btn-md submit_btn rounded-end rounded-0" onClick={handleSubmit}>
                <CIcon icon={cilPaperPlane} size="md" />
              </CButton>
            </div>
          </div>
          {show && (
            <CRow className="mt-4">
              <CFormLabel className="white">Seleect any one</CFormLabel>

              {data.images.map((item, index) => (
                <CCol md={3} key={index} className="my-2">
                  <div
                    key={index}
                    // className={`${isSelected ? 'selected' : ''}`}
                    className={`${isSelected === index ? 'selected' : ''}`}
                    onClick={() => {
                      handleClick(index)
                    }}
                  >
                    {isSelected === index && (
                      <div className='selected-items'>
                        <CIcon key={index} icon={cilCheckAlt} size="lg" className="selectd_item" />
                      </div>
                    )}
                    <ImagePreview
                      className="w-100"
                      MakeitProfessionalimg
                      file={item.url}
                      // file={"https://upload.wikimedia.org/wikipedia/commons/b/b6/Image_created_with_a_mobile_phone.png"}
                
                    />
                  </div>
                </CCol>
              ))}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
   
          <CButton className='submit_btn'>Insert</CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
export default MakeitProfessional
