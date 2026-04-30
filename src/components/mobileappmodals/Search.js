import { CButton, CForm, CFormLabel, CFormSelect, CModal, CModalBody, CModalHeader, CModalTitle,CModalFooter, CFormInput } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import BasicProvider from 'src/constants/BasicProvider'


const SearchModal = ({ visible,
  setVisible,
  setItems,
  items,
  CurrentWidget  }) => {
 
const [initialValues, setInitialValues] = useState({
    name: '',
    placeholder: '',
  })



useEffect(()=>{
  setInitialValues(CurrentWidget.json)
},[CurrentWidget])


const handleOnChange = (e) => {
    const { name, value } = e.target
      setInitialValues({ ...initialValues, [name]: value })
  
  }

const handleItemUpdate = () => {

  const selectedIndex = items.findIndex((item) => item.id === CurrentWidget.id);

        if (selectedIndex !== -1) {
        setItems((prevValues) => {
            const updatedItems = [...prevValues];

            updatedItems[selectedIndex] = {
            ...updatedItems[selectedIndex],
            json: initialValues,
            
            };
    
            return updatedItems;
        });
        }
  setVisible(false);
};

  return (
   <>
   <CModal alignment="center" visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Search Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
          <CFormLabel className='mb-1'>Name</CFormLabel>
            <CFormInput onChange={handleOnChange} type="text" value={initialValues?.name??''} name="name" placeholder="Enter Name or Label" />
            <CFormLabel className='mb-1 mt-4'>Placeholder</CFormLabel>
            <CFormInput onChange={handleOnChange}  type="text" value={initialValues?.placeholder??''} name="placeholder" placeholder="Enter Placeholder"/>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton  onClick={handleItemUpdate} color="warning">
            Update
          </CButton>
        </CModalFooter>
      </CModal>
   </>
  )
}



export default SearchModal
