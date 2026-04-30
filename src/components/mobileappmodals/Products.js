import {
  CButton,
  CForm,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CModalFooter,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormFeedback,
} from '@coreui/react'

import React, { useEffect, useState } from 'react'
import AsyncSelect from 'react-select/async'

import BasicProvider from 'src/constants/BasicProvider'

const ProductModal = ({ visible, setVisible, setItems, items, CurrentWidget }) => {
  const [selectedType, setSelectedType] = useState('')
  const [categories, setCategories] = useState([])
  const [showSpecific, setshowSpecific] = useState(false)

  const [initialValues, setInitialValues] = useState({
    heading: '',
    sub_heading: '',
    category_type: '',
    category_id: '',
    no_of_product: '',
  })

  const [formErrors, setFormErrors] = useState({
    heading: '',
    category_type: '',
    no_of_product: '',
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

  useEffect(() => {
    setInitialValues(CurrentWidget.json)
  }, [CurrentWidget])

  useEffect(() => {
    if (CurrentWidget.json && CurrentWidget.json?.category_type === 'specific_category') {
      setshowSpecific(true)
    } else {
      setshowSpecific(false)
      setInitialValues((prevValues) => ({
        ...prevValues,
        category_id: '',
      }))
    }
  }, [CurrentWidget])

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
    const categoryname = event.target.value
    // setSelectedType(categoryname);
    if (event.target.name == 'category_type') {
      setFormErrors({ ...formErrors, category_type: '' })
    }
    setInitialValues((prevValues) => ({
      ...prevValues,
      category_type: categoryname,
    }))
    if (categoryname == 'specific_category') {
      setshowSpecific(true)
    } else {
      setshowSpecific(false)
      setInitialValues((prevValues) => ({
        ...prevValues,
        category_id: '',
      }))
    }
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setInitialValues({ ...initialValues, [name]: value })
    if (name == 'heading') {
      setFormErrors({ ...formErrors, heading: '' })
    }
    if (name == 'no_of_product') {
      setFormErrors({ ...formErrors, no_of_product: '' })
    }
  }

  const handleSubmit = () => {
    const errors = {}

    if (!initialValues.heading) {
      errors.heading = 'Heading is required'
    }
    if (!initialValues.category_type) {
      errors.category_type = 'Category type is required'
    }
    if (!initialValues.no_of_product) {
      errors.no_of_product = 'No of product is required'
    }

    if (Object.keys(errors).length === 0) {
      const selectedIndex = items.findIndex((item) => item.id === CurrentWidget.id)
      if (selectedIndex !== -1) {
        setItems((prevValues) => {
          const updatedItems = [...prevValues]

          updatedItems[selectedIndex] = {
            ...updatedItems[selectedIndex],
            json: initialValues,
          }

          return updatedItems
        })
      }
      setVisible(false)
    } else {
      setFormErrors(errors)
    }
  }

  return (
    <>
      <CModal alignment="center" visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Products Details</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormLabel className="mb-1">
              Heading<span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              invalid={!!formErrors.heading}
              onChange={handleOnChange}
              type="text"
              value={initialValues?.heading ?? ''}
              name="heading"
              placeholder="Enter Heading"
            />
            <CFormFeedback invalid={!!formErrors.heading}>{formErrors.heading}</CFormFeedback>
            <CFormLabel className="mb-1 mt-4">Sub heading (Optional)</CFormLabel>
            <CFormInput
              onChange={handleOnChange}
              type="text"
              value={initialValues?.sub_heading ?? ''}
              name="sub_heading"
              placeholder="Enter Subheading"
            />
            <CFormLabel className="mb-1 mt-4">
              Select Category type<span className="text-danger">*</span>
            </CFormLabel>
            <CFormSelect
              invalid={!!formErrors.category_type}
              name="category_type"
              options={[
                'Select Category Type',
                { label: 'Parent Category', value: 'parent_category' },
                { label: 'Random Category', value: 'random_category' },
                { label: 'Specific Category', value: 'specific_category' },
                { label: 'Popular Products', value: 'popular_products' },
                { label: 'Recently Viewed', value: 'recently_viewed' },
                { label: 'Discounted Products', value: 'discounted_products' },
              ]}
              onChange={(event) => handleChange(event)}
              value={initialValues?.category_type ? initialValues.category_type : ''}
            />
            <CFormFeedback invalid={!!formErrors.category_type}>
              {formErrors.category_type}
            </CFormFeedback>
            {showSpecific && (
              <div>
                <CFormLabel className="mb-1 mt-4">Select Categories</CFormLabel>

                <AsyncSelect
                  loadOptions={(inputValue, callback) =>
                    loadOptions('cms/categories', inputValue, callback)
                  }
                  defaultOptions={CategoryData}
                  placeholder="Select categories"
                  name="category_id"
                  value={CategoryData.filter((option) =>
                    initialValues.category_id.includes(option.value),
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
              </div>
            )}
            <CFormLabel className="mb-1 mt-4">
              No of Product<span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              onChange={handleOnChange}
              invalid={!!formErrors.no_of_product}
              value={initialValues?.no_of_product}
              type="text"
              name="no_of_product"
              placeholder="Enter no of product"
            />
            <CFormFeedback invalid={!!formErrors.no_of_product}>
              {formErrors.no_of_product}
            </CFormFeedback>
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

export default ProductModal
