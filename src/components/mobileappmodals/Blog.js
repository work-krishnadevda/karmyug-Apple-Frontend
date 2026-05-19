import { CButton, CForm, CModal, CModalBody, CModalHeader, CModalTitle, CModalFooter, CFormInput, CFormLabel, CRow, CCol } from '@coreui/react'


import AppFormSelect from 'src/components/form/AppFormSelect'
import React, { useEffect, useState } from 'react'
import AsyncSelect from 'react-select/async'

import BasicProvider from 'src/constants/BasicProvider';


const BlogModal = ({ visible,
    setVisible,
    setItems,
    items,
    CurrentWidget }) => {
    const [selectedType, setSelectedType] = useState('');
    const [categories, setCategories] = useState([])
    const [showSpecific, setshowSpecific] = useState(false)

    const [initialValues, setInitialValues] = useState({
        blog_type: '',
        no_of_blog: '',
        category_id:'',
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
        if (CurrentWidget.json && CurrentWidget.json?.blog_type === 'specific_category') {
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
        // setSelectedType(categoryname);
        setInitialValues((prevValues) => ({
            ...prevValues,
            blog_type: categoryname,
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
                    <CModalTitle>Blog Details</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CRow>
                            <CCol>
                                <CFormLabel className='mb-1 '>Select Blog type</CFormLabel>
                                <AppFormSelect name='blog_type' options={[
                                    'Select Blog Type',
                                    { label: 'Specific Category', value: 'specific_category' },
                                    { label: 'Featured Blog', value: 'featured_blog' },


                                ]} onChange={(event) => handleChange(event)} value={initialValues?.blog_type ? initialValues.blog_type : ''} />
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

                        value={initialValues?.category_id}
                        onChange={(selectedOption) => {
                            setInitialValues((prevValues) => ({
                                ...prevValues,
                                category_id: selectedOption
                            }));
                        }}
                        />
                
                        </div>}
                        <CFormLabel className='mb-1 mt-4'>No of Blog</CFormLabel>
                        <CFormInput onChange={handleOnChange} value ={initialValues?.no_of_blog} type="text" name="no_of_blog" placeholder="Enter no of blog" />
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

export default BlogModal
