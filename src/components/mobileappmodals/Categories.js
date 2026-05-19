import { CButton, CForm, CModal, CModalBody, CModalHeader, CModalTitle, CModalFooter, CFormInput, CFormLabel, CRow, CCol } from '@coreui/react'


import AppFormSelect from 'src/components/form/AppFormSelect'
import React, { useEffect, useState } from 'react'
import AsyncSelect from 'react-select/async'

import BasicProvider from 'src/constants/BasicProvider';


const CategoriesModal = ({ visible,
    setVisible,
    setItems,
    items,
    CurrentWidget}) => {
    const [selectedType, setSelectedType] = useState('');
    const [categories, setCategories] = useState([])
    const [showSpecific, setshowSpecific] = useState(false)

    const [initialValues, setInitialValues] = useState({
        category_type: '',
        category_view: '',
        no_of_row: '',
        category_id:'',
        no_of_column: '',
        no_of_item: '',
    })
    const loadOptions = async (name, inputValue, callback) => {
        try {
            const selectData = await new BasicProvider(
                `${name}/search?page=1&count=10&search=${inputValue}`,
            ).getRequest()
            const options = selectData.data.data.map((item) => ({
                value: item._id,
                label: item.name,
            }))
            callback(options)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])


    useEffect(()=>{
        setInitialValues(CurrentWidget.json)
      },[CurrentWidget])

      useEffect(()=>{
        if (CurrentWidget.json && CurrentWidget.json?.category_type === 'specific_category') {
          setshowSpecific(true);
        } else {
          setshowSpecific(false);
          setInitialValues((prevValues) => ({
            ...prevValues,
            category_id: '',
          }))
        }
      },[CurrentWidget])

    const fetchData = async () => {
        try {
            const cat = await new BasicProvider('cms/categories/get-first-parent/product').getRequest()
            setCategories(cat.data.data)
        } catch (e) {
            console.log('Error while Fetching the data ', e)
        }
    }

    const transformData = (sourceArray, labelKey) =>
        sourceArray.map((elem) => ({
            value: elem._id,
            label: elem.item ? elem.item.name : elem.variant || elem[labelKey],
        }))

    const CategoryData = categories ? transformData(categories, 'name') : []



    const handleChange = (event) => {
        const categoryname = event.target.value;
        setInitialValues((prevValues) => ({
            ...prevValues,
            category_type: categoryname,
        }))
        if (categoryname == 'specific_category') {
            setshowSpecific(true)
        }
        else {
            setshowSpecific(false)
            setInitialValues((prevValues) => ({
                ...prevValues,
                category_id: '',
            }))
        }
    };

    const handleViewChange = (event)=>{
        const { name, value } = event.target;

        const viewtype = event.target.value;

        setInitialValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
        if(viewtype == 'grid_view'){
            setInitialValues((prevValues) => ({
                ...prevValues,
                no_of_item: '',
            }));
        }
        else if(viewtype == 'list_view'){
            setInitialValues((prevValues) => ({
                ...prevValues,
                no_of_row: '',
            }));
            setInitialValues((prevValues) => ({
                ...prevValues,
                no_of_column: '',
            }));
        }
        else{
            setInitialValues((prevValues) => ({
                ...prevValues,
                no_of_row: '',
            }));
            setInitialValues((prevValues) => ({
                ...prevValues,
                no_of_column: '',
            }));
            setInitialValues((prevValues) => ({
                ...prevValues,
                no_of_item: '',
            }));
        }
        
    }


    const handleOnChange = (e) => {
        const { name, value } = e.target
        setInitialValues({ ...initialValues, [name]: value })

    }

    const handleSubmit = () => {

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
                    <CModalTitle>Categories Details</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CRow>
                            <CCol>
                                <CFormLabel className='mb-1'>Select Category type</CFormLabel>
                                <AppFormSelect name='category_type' options={[
                                    'Select Category Type',
                                    { label: 'Parent Category', value: 'parent_category' },
                                    { label: 'Random Category', value: 'random_category' },
                                    { label: 'Specific Category', value: 'specific_category' },

                                ]} onChange={(event) => handleChange(event)} value={initialValues?.category_type ? initialValues.category_type : ''} />
                            </CCol>
                            <CCol>
                                <CFormLabel className='mb-1'>Select Category View</CFormLabel>
                                <AppFormSelect name='category_view' options={[
                                    'Select Category View',
                                    { label: 'Grid View', value: 'grid_view' },
                                    { label: 'List View', value: 'list_view' },

                                ]} onChange={(event) => handleViewChange(event)} value={initialValues?.category_view ? initialValues.category_view : ''} />
                            </CCol>
                        </CRow>
                        {showSpecific && <div>
                            <CFormLabel className='mb-1 mt-4'>Select Categories</CFormLabel>

                            <AsyncSelect
                                loadOptions={(inputValue, callback) =>
                                    loadOptions('cms/categories', inputValue, callback)
                                }
                                defaultOptions={CategoryData}
                                placeholder="Select categories"
                                name="category_id"
                                value={CategoryData.filter(option =>
                                    initialValues?.category_id.includes(option.value)
                                )}
                                onChange={(selectedOptions) => {
                                    const selectedCategoriesIds = selectedOptions
                                        ? selectedOptions.map((option) => option.value)
                                        : []
                                    setInitialValues((prevValues) => ({
                                        ...prevValues,
                                        category_id: selectedCategoriesIds,
                                    }))
                                }}
                                isClearable
                                isMulti
                            />
                        </div>}
                        {initialValues?.category_view === 'grid_view' && (
                            <>
                                <CRow>
                                    <CCol>
                                        <CFormLabel className='mb-1 mt-4'>No of Rows</CFormLabel>
                                        <CFormInput onChange={handleOnChange} value={initialValues?.no_of_row} type="text" name="no_of_row" placeholder="Enter no of rows" />
                                    </CCol>
                                    <CCol>
                                        <CFormLabel className='mb-1 mt-4'>No of Columns</CFormLabel>
                                        <CFormInput onChange={handleOnChange} value={initialValues?.no_of_column} type="text" name="no_of_column" placeholder="Enter no of columns" />
                                    </CCol>
                                </CRow>
                            </>
                        )}
                        {initialValues?.category_view === 'list_view' && (
                            <>
                                <CRow>
                                    <CCol>
                                        <CFormLabel className='mb-1 mt-4'>No of Items</CFormLabel>
                                        <CFormInput onChange={handleOnChange} value={initialValues?.no_of_item} type="text" name="no_of_item" placeholder="Enter no of items" />
                                    </CCol>
                                </CRow>
                            </>
                        )}
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>
                        Close
                    </CButton>
                    <CButton onClick={handleSubmit} color="warning">
                        Update
                    </CButton>
                </CModalFooter>
            </CModal>

        </>
    )
}

export default CategoriesModal
