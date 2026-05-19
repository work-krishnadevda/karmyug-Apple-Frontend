import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormInput,
  CRow,
  CCard,
  CCardHeader,
  CCardFooter,
  CCardBody,
  CContainer,
  CFormCheck,
  CFormSwitch,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CFormLabel,
} from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilPencil, cilSpreadsheet, cilTrash } from '@coreui/icons'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Nestable from 'react-nestable'
import 'react-nestable/dist/styles/index.css'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch, useSelector } from 'react-redux'
import HelperFunction from 'src/helpers/HelperFunctions'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import handleSubmitHelper from 'src/helpers/submitHelper'
import SubHeader from 'src/components/custom/SubHeader'
import SliderModal from 'src/components/mobileappmodals/Slider'
import ProductModal from 'src/components/mobileappmodals/Products'
import BannerModal from 'src/components/mobileappmodals/Banner'
import CategoriesModal from 'src/components/mobileappmodals/Categories'
import TextareaModal from 'src/components/mobileappmodals/Textarea'
import BlogModal from 'src/components/mobileappmodals/Blog'
import IconButtonModal from 'src/components/mobileappmodals/IconButton'
import SearchModal from 'src/components/mobileappmodals/Search'
import BelowPriceFilterModal from 'src/components/mobileappmodals/BelowPriceFilter'

const validationRules = {
  name: {
    required: true,
    minLength: 3,
  },
}

var subHeaderItems = [

  {
    name: 'Create Form',
    link: '/builder/form/create ',
    icon: cilPencil,
  },
  {
    name: 'All Forms',
    link: '/builder/form/all',
    icon: cilSpreadsheet,
  },
  {
    name: 'Trash Form',
    link: '/builder/form/trash',
    icon: cilTrash,
  },
]

const ItemList = ['Text Field', 'Email', 'Password', 'Number', 'Datetime', 'File', 'Textarea', 'Select', 'Checkbox', 'Radio', 'Captcha'];

export default function CreateMobilePages() {
  const { id } = useParams()
  const isEditMode = !!id
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [checkedwidgets, setCheckedwidgets] = useState([])
  const [widgetChecked, setwidgetChecked] = useState(false)
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState({})
  const [Widgets, setWidgets] = useState({})
  const [visible, setVisible] = useState(false)
  const [CurrentWidget, setCurrentWidget] = useState([])


  const [editItemdata, seteditItemdata] = useState({
    id: '',
    text: '',
    type: '',
    json: '',
  })


  const [formdata, setformdata] = useState({
    name: '',
    value: [],
    slug: '',
  })
  const renderItem = ({ item }) => {
    return (
      <div className="d-flex justify-content-between">
        <div>
          <CIcon icon={cilMenu} className="me-3"></CIcon>
          {item.text}
          {/* <span className="navigation_badge"> ({item.type})</span> */}
        </div>
        <div className="list-actions">
          <CIcon icon={cilPencil} onClick={() => { handleItemEdit(item), setCurrentWidget(item) }} className="me-3"></CIcon>
          <CIcon icon={cilTrash} onClick={() => handleItemRemoval(item.id)}></CIcon>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (isEditMode) {
      fetchData()
    }

    setformdata({
      name: '',
      value: [],
    })
    setItems([])
  }, [isEditMode])

  const fetchData = async () => {
    try {
      const response = await new BasicProvider(`mobile/pages/show/${id}`).getRequest()
      const data = response.data
      setformdata(data)

      // const { name, slug, value } = data;

      // // Constructing items based on the nested objects in the value field
      // const newItems = [];
      // for (const [key, nestedObj] of Object.entries(value)) {
      //   console.log(nestedObj);
      //   const newItem = {
      //     id: key, 
      //     text: key, 
      //     // slug: slug,
      //     key: key,
      //     // link: '', 
      //     // children: [], 
      //     // json:json
      //   };
      //   newItems.push(newItem);
      // }

      // Set the items state with the newly created items
      setItems(data.value);

    } catch (error) {
      console.error(error)
    }
  }

  const findGreatestId = (items) => {
    let greatestId = 0

    items.forEach((item) => {
      if (item.id > greatestId) {
        greatestId = item.id
      }

      // if (item.children && item.children.length > 0) {
      //     const childGreatestId = findGreatestId(item.children)
      //     if (childGreatestId > greatestId) {
      //     greatestId = childGreatestId
      //     }
      // }
    })

    return greatestId
  }

  const lastId = findGreatestId(items)
  const newId = lastId + 1

  const removeItem = (itemId, list) => {
    const updatedList = list.filter((item) => {
      if (item.id === itemId) {
        return false // Exclude the item to be removed
      }

      // if (item.children) {
      //     item.children = removeItem(itemId, item.children) // Recursively remove item from children
      // }

      return true // Keep the item in the updated list
    })

    return updatedList
  }

  const handleCheckboxChange = (name, type) => (event) => {

    setMsg(false)

    if (event.target.checked && type == 'pages') {
      setCheckedwidgets((prevCheckedwidgets) => [...prevCheckedwidgets, name])
    } else {
      setCheckedwidgets((prevCheckedwidgets) => prevCheckedwidgets.filter((page) => page !== name))
    }

    setWidgets((prevWidgets) => {
      const updatedTypeArray = event.target.checked
        ? [...(prevWidgets[type] || []), name]
        : (prevWidgets[type] || []).filter((Widgets) => Widgets !== name)

      return {
        ...prevWidgets,
        [type]: updatedTypeArray,
      }
    })
  }


  const handleItemEdit = (item) => {
    setMsg(false)
    seteditItemdata(item)
    setVisible(!visible)
  }


  const handleItemRemoval = (itemId) => {
    const updatedItems = removeItem(itemId, items)
    setItems(updatedItems)
  }

  const handleOnNavChange = async (item) => {
    const newItem = item.items
    setItems(newItem)

    const updatedFormdata = {
      ...formdata,
      value: newItem,
    }

    setformdata(updatedFormdata)
  }

  const AddWidgettoList = (event) => {
    if (checkedwidgets.length > 0) {
      const newItems = checkedwidgets.map((page, index) => {
        return {
          id: newId + index,
          text: page,
          type: page,
          // slug: HelperFunction.createSlug(page),
          // key: newId + index,
          json: '',
        };
      });

      setItems([...items, ...newItems]);
      setMsg({ ...msg, pageMsg: true });

      setCheckedwidgets([]);

      const updatedFormdata = {
        ...formdata,
        value: Array.isArray(formdata.value) ? [...formdata.value, ...newItems] : [...newItems],
      };
      setformdata(updatedFormdata);
    }
  }

  const HandleOnChange = (event) => {
    setformdata((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    formdata.value = items;
    // console.log(formdata);
    // return


    try {
      const data = await handleSubmitHelper(formdata, validationRules, dispatch)
      if (data === false) {
        return
      }
      if (isEditMode) {
        const response = await new BasicProvider(`mobile/pages/update/${id}`).patchRequest(
          formdata,
        )
      } else {
        const response = await new BasicProvider(`mobile/pages/create`).postRequest(formdata)
        navigate(`/mobile/pages/${response.data._id}/edit`)
      }
      setAlertTimeout(dispatch)
    } catch (error) {
      throw new Error(error)
    }
  }

  return <>
    <SubHeader subHeaderItems={subHeaderItems} />
    <CContainer fluid>
      <CForm className="g-3 needs-validation" noValidate>
        <CCard className="mb-4">
          <CCardBody>
            <CRow>
              <CCol md={11}>
                <CFormInput
                  type="text"
                  name="name"
                  onChange={HandleOnChange}
                  value={formdata.name}
                  feedbackValid="Looks good!"
                  id="validationCustom01"
                  placeholder="Enter Name*"
                  required
                />
              </CCol>

              <CCol md={1} className="text-end ps-0 text-center">
                {isEditMode ? (
                  <>
                    <CButton color="primary" onClick={handleSubmit}>
                      Update
                    </CButton>
                  </>
                ) : (
                  <>
                    <CButton color="primary" onClick={handleSubmit}>
                      Submit
                    </CButton>
                  </>
                )}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
        <CRow>
          <CCol md={4}>
            {/* pages start*/}
            <CCard>
              <CCardHeader className="d-flex justify-content-between">
                <div>Form Fields</div>
              </CCardHeader>
              <>
                <CCardBody className="switch-data">
                  {ItemList.map((item, index) => {
                    return (
                      <CFormCheck
                        key={`${index}`}
                        id={`flexCheckDefaultpage${index}`}
                        value={`${item}`}
                        label={`${item}`}
                        onChange={handleCheckboxChange(item, 'pages')}
                        checked={checkedwidgets.includes(item)}
                        className="d-flex align-items-center"
                        style={{ marginRight: '10px' }}
                      />
                    )
                  })}
                </CCardBody>
                <CCardFooter>
                  <CButton
                    color="warning"
                    name="value"
                    value={formdata.value}
                    onClick={AddWidgettoList}
                  >
                    Add to Form
                  </CButton>
                  {msg.pageMsg && (
                    <div className="successmsg mt-2">Field successfully added!</div>
                  )}
                  {msg.duplicateMsg && (
                    <div className="text-danger mt-2">You can't add any widget multiple time.</div>
                  )}
                </CCardFooter>
              </>
            </CCard>
          </CCol>
          <CCol md={8}>
            <CCard>
              <CCardHeader>Form Builder</CCardHeader>
              <CCardBody className="navigationBlock">
                <Nestable
                  items={items}
                  renderItem={renderItem}
                  onChange={(item) => handleOnNavChange(item)}
                  maxDepth={1}
                />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CForm>
    </CContainer>


    {/* {All Widgets Modals } */}

    <TextareaModal
      visible={visible && CurrentWidget.text === 'Textarea'}
      setVisible={setVisible}
      setItems={setItems}
      items={items}
      CurrentWidget={CurrentWidget}
    />
    <SearchModal
      visible={visible && CurrentWidget.text === 'Search'}
      setVisible={setVisible}
      setItems={setItems}
      items={items}
      CurrentWidget={CurrentWidget}
    />
    <BlogModal
      visible={visible && CurrentWidget.text === 'Blog'}
      setVisible={setVisible}
      setItems={setItems}
      items={items}
      CurrentWidget={CurrentWidget}
    />
    <ProductModal
      visible={visible && CurrentWidget.text === 'Products'}
      setVisible={setVisible}
      setItems={setItems}
      items={items}
      CurrentWidget={CurrentWidget}
    />
    <SliderModal
      visible={visible && CurrentWidget.text === 'Slider'}
      setVisible={setVisible}
      setItems={setItems}
      items={items}
      CurrentWidget={CurrentWidget}
    />
    <BannerModal
      visible={visible && CurrentWidget.text === 'Banner'}
      setVisible={setVisible}
      setItems={setItems}
      items={items}
      CurrentWidget={CurrentWidget}
    />
    <CategoriesModal
      visible={visible && CurrentWidget.text === 'Categories'}
      setVisible={setVisible}
      setItems={setItems}
      items={items}
      CurrentWidget={CurrentWidget}
    />
    <IconButtonModal
      visible={visible && CurrentWidget.text === 'Icon Button'}
      setVisible={setVisible}
      setItems={setItems}
      items={items}
      CurrentWidget={CurrentWidget}
    />
    <BelowPriceFilterModal
      visible={visible && CurrentWidget.text === 'Below Price Filter'}
      setVisible={setVisible}
      setItems={setItems}
      items={items}
      CurrentWidget={CurrentWidget}
    />
  </>
}