import {
  CButton,
  CForm,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
  CFormFeedback,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import BasicProvider from 'src/constants/BasicProvider'

const SliderModal = ({
  visible,
  setVisible,
  setItems,
  items,
  CurrentWidget
}) => {

  const [slider, setSlider] = useState([])
  const [selectedSlider, setSelectedSlider] = useState({ _id: '', name: '' })
  const [sliderError, setSliderError] = useState('');

  const handleChange = (event) => {
    setSliderError('');
    const selectedIndex = event.target.selectedIndex
    const label = event.target.options[selectedIndex].text
    const sliderId = event.target.value
    setSelectedSlider({ _id: sliderId, name: label })
  }


  useEffect(() => {
    getSlider()
  }, [])

  useEffect(()=>{
    setSelectedSlider(CurrentWidget.json)
  },[CurrentWidget])


  const getSlider = async () => {
    try {
      const response = await new BasicProvider(`cms/sliders`).getRequest()
      const data = response.data.data
      setSlider(data)
    } catch (error) {
      console.error(error)
    }
  }


  const handleItemUpdate = () => {
    if (!selectedSlider._id) {
      setSliderError('Please select a slider'); 
      return; 
    }
    
    const selectedIndex = items.findIndex((item) => item.id === CurrentWidget.id);
  
    if (selectedIndex !== -1) {
      setItems((prevValues) => {
        const updatedItems = [...prevValues];

        updatedItems[selectedIndex] = {
          ...updatedItems[selectedIndex],
          json: selectedSlider,
          
        };
  
        return updatedItems;
      });
    }
    setVisible(false)
  };
  
  return (
    <>
      <CModal
        alignment="center"
        visible={visible}
        onClose={() =>
          setVisible(false)
        }
      >
        <CModalHeader>
          <CModalTitle>Slider Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormLabel className="mb-1">Select Slider<span className='text-danger'>*</span></CFormLabel>
            <CFormSelect
              value={selectedSlider ? selectedSlider._id : ''}
              options={[
                { label: 'Select Slider', value: '' }, 
                ...slider.map((item) => ({ label: item.name, value: item._id }))
              ]}
              invalid={!!sliderError}
              onChange={(event) => handleChange(event)}
            />
            {sliderError && <CFormFeedback className="d-block fs-6 text-danger">{sliderError}</CFormFeedback>} 
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            onClick={() =>
              setVisible(false)
            }
          >
            Close
          </CButton>
          <CButton onClick={handleItemUpdate} color="warning">
            Update
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default SliderModal
