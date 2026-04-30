import React, { useEffect, useRef, useState } from 'react';
import { CButton, CForm, CFormLabel, CFormSelect, CModal, CModalBody, CModalHeader, CModalTitle, CModalFooter, CCol, CRow, CFormInput } from '@coreui/react';
import BasicProvider from 'src/constants/BasicProvider';
import { ImageHelper, variantImageHelper } from 'src/helpers/imageHelper';
import ImagePreview from '../custom/ImagePreview';
import AsyncSelect from 'react-select/async';

const IconButtonModal = ({ visible,
    setVisible,
    setItems,
    items,
    CurrentWidget }) => {

    const [categories, setCategories] = useState({})

    const fileInputRef = useRef(null);
    
    const [loadOptionsname, setloadOptionsname] = useState(null);

    const [selectedOptions, setSelectedOptions] = useState([]);

    const [initialValues, setInitialValues] = useState({
        no_of_columns: '',
        columndata: {}, 
    });
     
   
 
    

    useEffect(()=>{
        if(CurrentWidget){
            setInitialValues(CurrentWidget.json)
        }
      },[CurrentWidget])

    // console.log(loadOptionsname);
      useEffect(() => {
        if (initialValues && initialValues.columndata) {
            const linkTypes = Object.values(initialValues.columndata).map(item => item.link_type);
            linkTypes.forEach(async (linkType, index) => {
                if(linkType ==='product'){
                    try {
                        var cat = await new BasicProvider('ecommerce/products').getRequest()

                        setCategories((prevValues) => ({
                            ...prevValues,
                            [index]:cat.data.data ,
                        }));
                        setloadOptionsname((prevValues) => ({
                            ...prevValues,
                            [index]:'ecommerce/products',
                        }));
                    } catch (e) {
                        console.log('Error while Fetching the data ', e)
                    }
                }
                if(linkType ==='category'){

                    try {
                        var cat = await new BasicProvider('cms/categories/get-first-parent/product').getRequest()

                        setCategories((prevValues) => ({
                            ...prevValues,
                            [index]:cat.data.data ,
                        }));
                        setloadOptionsname((prevValues) => ({
                            ...prevValues,
                            [index]:'cms/categories',
                        }));
                    } catch (e) {
                        console.log('Error while Fetching the data ', e)
                    }         
                }
                if(linkType ==='mobile_app_page'){

                    try {
                        var cat = await new BasicProvider('mobile/pages').getRequest()
                        setCategories((prevValues) => ({
                            ...prevValues,
                            [index]:cat.data.data ,
                        }));
                        setloadOptionsname((prevValues) => ({
                            ...prevValues,
                            [index]:'mobile/pages',
                        }));
                        
                    } catch (e) {
                        console.log('Error while Fetching the data ', e)
                    }
                }
            });
            const updatedSelectedOptions = Object.values(initialValues.columndata).map((item, index) => {
                if (item && item.link) {
                    return {
                        value: item.link.value,
                        label: item.link.label,
                    };
                }
                return null;
            });
            setSelectedOptions(updatedSelectedOptions);
        }
    }, [initialValues]);


    

    const transformData = (sourceArray, labelKey) =>
    sourceArray.map((elem) => ({
      value: elem._id,
      label: elem.item ? elem.item.name : elem.variant || elem[labelKey],
    }))
  
  const CategoryData = categories ? transformData([], 'name') : []


    const loadOptions = async (name, inputValue, callback) => {
        try {
            const selectData = await new BasicProvider(
                `${name}/search?page=1&count=10&search=${inputValue}`,
            ).getRequest();
            const options = selectData.data.data.map((item) => ({
                value: item._id,
                label: item.name,
            }));
            callback(options);
        } catch (error) {
            console.log(error);
        }
    };


    const handleChange = (event) => {
        const { name, value } = event.target;
        const { no_of_columns, columndata } = initialValues;
        
        if (name === 'no_of_columns') {
            var existingRowsCount; 
            if(columndata !=undefined){
                 existingRowsCount = Object.keys(columndata).length;
            }
            else{
                 existingRowsCount ='';
            }
            const newColumnCount = parseInt(value, 10);
            
            if (existingRowsCount < newColumnCount) {
                const newColumndata = { ...columndata };
                for (let i = existingRowsCount; i < newColumnCount; i++) {
                    newColumndata[i] = {};
                }
    
                setInitialValues({
                    ...initialValues,
                    [name]: value,
                    columndata: newColumndata,
                });
            } else {
                setInitialValues({
                    ...initialValues,
                    [name]: value,
                });
            }
        }
    };
    
    const handleLinkTypeChange = async (rowIndex, event) => {

        const { name, value } = event.target;
        setInitialValues((prevValues) => ({
            ...prevValues,
            columndata: {
                ...prevValues.columndata,
                [rowIndex]: {
                    ...prevValues.columndata[rowIndex],
                    link_type: value,
                },
            },
        }));
        

        if(value ==='product'){
            try {
                var cat = await new BasicProvider('ecommerce/products').getRequest()
                setCategories({
                    ...categories,
                    [rowIndex]: cat.data.data,
                });
                setloadOptionsname((prevValues) => ({
                    ...prevValues,
                    [rowIndex]:'ecommerce/products',
                }));
            } catch (e) {
                console.log('Error while Fetching the data ', e)
            }
        }
        if(value ==='category'){
            try {
                var cat = await new BasicProvider('cms/categories/get-first-parent/product').getRequest()
                setCategories({
                    ...categories,
                    [rowIndex]: cat.data.data,
                });
                setloadOptionsname((prevValues) => ({
                    ...prevValues,
                    [rowIndex]:'cms/categories',
                }));
            } catch (e) {
                console.log('Error while Fetching the data ', e)
            }         
        }
        if(value ==='mobile_app_page'){
            try {
                var cat = await new BasicProvider('mobile/pages').getRequest()
                setCategories({
                    ...categories,
                    [rowIndex]: cat.data.data,
                });
                setloadOptionsname((prevValues) => ({
                    ...prevValues,
                    [rowIndex]:'mobile/pages',
                }));
            } catch (e) {
                console.log('Error while Fetching the data ', e)
            }
        }

        const updatedSelectedOptions = [...selectedOptions];
        updatedSelectedOptions[rowIndex] = null;
        setSelectedOptions(updatedSelectedOptions);
    };


    const handleLinkTextChange = async (rowIndex, event) => {
        const { name, value } = event.target;
        setInitialValues((prevValues) => ({
            ...prevValues,
            columndata: {
                ...prevValues.columndata,
                [rowIndex]: {
                    ...prevValues.columndata[rowIndex],
                    link_text: value,
                },
            },
        }));
    }
    
    const handleSelectChange = (selectedOption, index) => {
        const updatedSelectedOptions = [...selectedOptions];
        updatedSelectedOptions[index] = selectedOption;
        setSelectedOptions(updatedSelectedOptions);
    
        setInitialValues(prevValues => ({
          ...prevValues,
          columndata: {
            ...prevValues.columndata,
            [index]: {
              ...prevValues.columndata[index],
              link: selectedOption ? selectedOption : null,
            },
          },
        }));
      };
    
    const renderRows = () => {
        const rows = [];
        for (let i = 0; i < initialValues?.no_of_columns; i++) {
            rows.push(
                <CRow key={i} className='mt-4'>
                    <CCol lg={3}>
                        <CFormLabel className='mb-1'>Icon Image {i + 1}</CFormLabel>
                        <CFormInput
                            id={`imageInput_${i}`}
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => {
                                
                                HandleImageChange(e ,i)
                            }}
                        />
                        <ImagePreview
                            file={
                                initialValues.columndata[i] && initialValues.columndata[i].featured_image?.filepath
                                    ? initialValues.columndata[i].featured_image.filepath
                                    : initialValues.columndata[i]?.featured_image
                            }
                            onDelete={() => {
                                HandleOnDelete(i)
                                fileInputRef.current.value = '';
                            }}
                        />
                    </CCol>
                    <CCol lg={3}>
                        <CFormLabel className='mb-1'>Link Text</CFormLabel>
                        <CFormInput type="text" onChange={(event) => handleLinkTextChange(i, event)} value={initialValues.columndata[i]?.link_text || ''}  name={`link_text_${i}`}   placeholder="Enter link text" />       
                    </CCol>
                    <CCol lg={3}>
                        <CFormLabel className='mb-1'>Select Link Type</CFormLabel>
                        <CFormSelect name={`link_type_${i}`} value={initialValues.columndata[i]?.link_type || ''} onChange={(event) => handleLinkTypeChange(i, event)}>
                            <option value="">Select type</option>
                            <option value="category">Category</option>
                            <option value="product">Product</option>
                            <option value="mobile_app_page">Mobile App pages</option>
                        </CFormSelect>
                    </CCol>
                    <CCol lg={3}>
                        <CFormLabel className='mb-1'>Select Link</CFormLabel>
                        <AsyncSelect
                          loadOptions={(inputValue, callback) =>
                            loadOptions(loadOptionsname[i], inputValue, callback)
                          }
                        defaultOptions={
                            Object.keys(categories).length > 0 && categories[i] && categories[i].length > 0 && categories[i].map((elem) => ({
                              value: elem._id,
                              label: elem.item ? elem.item.name : elem.variant || elem['name'],
                            }))
                          }
                          placeholder="Select Link"
                          name={`link_${i}`}
                          value={selectedOptions.length>0 && selectedOptions[i]}
                          onChange={(selectedOption) => handleSelectChange(selectedOption, i)}
                        />
                    </CCol>
                </CRow>
            );
        }
        return rows;
    };

    const HandleImageChange = async (e, rowIndex, product) => {
        const file = variantImageHelper(e)

        var formData = new FormData()
        formData.append('featured_image', file[0])
        const response = await new BasicProvider(`cms/files/create`).postRequest(formData)
  
        setInitialValues((prevValues) => ({
                ...prevValues,
                columndata: {
                    ...prevValues.columndata,
                    [rowIndex]: {
                        ...prevValues.columndata[rowIndex],
                        featured_image: response.data,
                    },
                },
            }));
    }
    const HandleOnDelete = async (rowIndex) => {
        var image_id
          image_id = initialValues.columndata[rowIndex].featured_image._id
        const formdata = {
          ids: [image_id],
        }
        const response = await new BasicProvider(`cms/files/multi/delete`).postRequest(formdata)

        setInitialValues((prevValues) => ({
            ...prevValues,
            columndata: {
                ...prevValues.columndata,
                [rowIndex]: {
                    ...prevValues.columndata[rowIndex],
                    featured_image: null,
                },
            },
        }));
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
            <CModal alignment="center" visible={visible} onClose={() => setVisible(false)} className='modal-xl'>
                <CModalHeader>
                    <CModalTitle>Banner Details</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormLabel className='mb-1'>Select no of columns</CFormLabel>
                        <CFormSelect name='no_of_columns' options={[
                            'Select no of columns',
                            { label: 'One', value: '1' },
                            { label: 'Two', value: '2' },
                            { label: 'Three', value: '3' },
                            { label: 'Four', value: '4' },
                        ]} onChange={(event) => handleChange(event)} value={initialValues?.no_of_columns ? initialValues?.no_of_columns : ''} />
                        {renderRows()}
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

export default IconButtonModal;
