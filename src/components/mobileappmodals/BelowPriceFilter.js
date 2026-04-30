import React, { useEffect, useState } from 'react';
import { CButton, CForm, CFormLabel, CFormInput, CModal, CModalBody, CModalHeader, CModalTitle, CModalFooter, CRow, CCol } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus, cilX } from '@coreui/icons';

const BelowPriceFilterModal = ({ visible,
    setVisible,
    setItems,
    items,
    CurrentWidget }) => {
    const [rows, setRows] = useState([]);

    const handleAddRow = () => {
        setRows([...rows, { below_price: '' }]);
    };


    useEffect(()=>{
        setRows(CurrentWidget.json)
      },[CurrentWidget])

    const handleChange = (index, event) => {
        const newRows = [...rows];
        newRows[index][event.target.name] = event.target.value;
        setRows(newRows);
    };

    const handleRemoveRow = (index) => {
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    const handleItemUpdate = () => {
       
        const selectedIndex = items.findIndex((item) => item.id === CurrentWidget.id);

        if (selectedIndex !== -1) {
        setItems((prevValues) => {
            const updatedItems = [...prevValues];

            updatedItems[selectedIndex] = {
            ...updatedItems[selectedIndex],
            json: rows,
            
            };
    
            return updatedItems;
        });
        }
         setVisible(false);
    };

    return (
        <>
            <CModal alignment="center" visible={visible} onClose={() => setVisible(false)} className='modal-lg'>
                <CModalHeader>
                    <CModalTitle>Below Price Filter Details</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CButton color="primary" className='mb-4' onClick={handleAddRow}>
                            <CIcon icon={cilPlus} />
                            Add Below Price
                        </CButton>
                        {rows && rows.length>0 && rows.map((row, index) => (
                            <CRow className='d-flex align-items-center' key={index}>
                                <CCol lg={3}>
                                    <CFormLabel className='mb-1 '>Below Price</CFormLabel>
                                    <CFormInput type="text" name="below_price" placeholder="Enter Price" value={row.below_price} onChange={(e) => handleChange(index, e)} />
                                </CCol>
                                <CCol>
                                    <CButton color="danger" className='text-white mt-2' onClick={() => handleRemoveRow(index)}>
                                        <CIcon icon={cilX} />
                                    </CButton>
                                </CCol>
                            </CRow>
                        ))}
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>
                        Close
                    </CButton>
                    <CButton onClick={handleItemUpdate} color="warning">
                        Update
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    );
};

export default BelowPriceFilterModal;
