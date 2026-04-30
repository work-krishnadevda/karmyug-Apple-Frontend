import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CFooter,
  CFormLabel,
  CFormSwitch,
  CInputGroup,
  CRow,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import SingleSubHeader from 'src/components/custom/SingleSubHeader'
import BasicProvider from 'src/constants/BasicProvider'
import { setAlertTimeout } from 'src/helpers/alertHelper'
import handleSubmitHelper from 'src/helpers/submitHelper'


const validationRules = {
  paypal_email: {
    required: true,
    isEmail: true,
  },
  client_id: {
    required: true,
  },
  paypal_secret: {
    required: true,
  },
  stripe_privet_key: {
    required: true,
  },
  stripe_secret: {
    required: true,
  },
  phonepe_merchant_id: {
    required: true,
  },
  phonepe_salt_key: {
    required: true,
  },
  phonepe_index: {
    required: true,
  },
}

const paymentGetway = () => {
  const dispatch = useDispatch()

  const [initialValues, setInitialValues] = useState({
    paypal: {
      id: null,
      name: 'paypal',
      value: [
        {
          paypal_email: '',
          client_id: '',
          paypal_secret: '',
        },
      ],
      type: 'gateway',
      enable: '',
    },
    stripe: {
      id: null,
      name: 'stripe',
      value: [
        {
          stripe_privet_key: '',
          stripe_secret: '',
        },
      ],
      type: 'gateway',
      enable: '',
    },
    phonepe: {
      id: null,
      name: 'phonepay',
      value: [
        {
          phonepe_merchant_id: '',
          phonepe_salt_key: '',
          phonepe_index: '',
        },
      ],
      type: 'gateway',
      enable: '',
    },
  })
  const [validationErrors, setValidationErrors] = useState({
    paypal: {},
    stripe: {},
    phonepe: {},
  });

  const extractInitialValues = (data) => {
    const initialValues = {
      paypal: {
        id: null,
        name: 'paypal',
        value: [
          {
            paypal_email: '',
            client_id: '',
            paypal_secret: '',
          },
        ],
        type: 'gateway',
        enable: '',
      },
      stripe: {
        id: null,
        name: 'stripe',
        value: [
          {
            stripe_privet_key: '',
            stripe_secret: '',
          },
        ],
        type: 'gateway',
        enable: '',
      },
      phonepe: {
        id: null,
        name: 'phonepay',
        value: [
          {
            phonepe_merchant_id: '',
            phonepe_salt_key: '',
            phonepe_index: '',
          },
        ],
        type: 'gateway',
        enable: '',
      },
    }

    data.forEach((item) => {
      if (item.name === 'paypal') {
        initialValues.paypal = {
          ...initialValues.paypal,
          id: item._id,
          value: [
            {
              paypal_email: item.value[0]?.paypal_email || '',
              client_id: item.value[0]?.client_id || '',
              paypal_secret: item.value[0]?.paypal_secret || '',
            },
          ],
          enable: item.enable || '',
        }
      } else if (item.name === 'stripe') {
        initialValues.stripe = {
          ...initialValues.stripe,
          id: item._id,
          value: [
            {
              stripe_privet_key: item.value[0]?.stripe_privet_key || '',
              stripe_secret: item.value[0]?.stripe_secret || '',
            },
          ],
          enable: item.enable || '',
        }
      } else if (item.name === 'phonepay') {
        initialValues.phonepe = {
          ...initialValues.phonepe,
          id: item._id,
          value: [
            {
              phonepe_merchant_id: item.value[0]?.phonepe_merchant_id || '',
              phonepe_salt_key: item.value[0]?.phonepe_salt_key || '',
              phonepe_index: item.value[0]?.phonepe_index || '',
            },
          ],
          enable: item.enable || '',
        }
      }
    })
    return initialValues
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    let responseData = await new BasicProvider(
      `ecomerce/payment-gateway/all`,
      dispatch,
    ).getRequest()
    if (responseData) {
      setInitialValues(extractInitialValues(responseData?.data))
    }
  }
  const handleChange = (e, gateway) => {
    const { name, value } = e.target;
    setInitialValues((prevState) => ({
      ...prevState,
      [gateway]: {
        ...prevState[gateway],
        value: [
          {
            ...prevState[gateway].value[0],
            [name]: value,
          },
        ],
      },
    }));
  
    setValidationErrors((prevState) => ({
      ...prevState,
      [gateway]: {
        ...prevState[gateway],
        [name]: '',
      },
    }));
  
    validateField(gateway, name, value);
  };
  

  const validateField = (gateway, fieldName, value) => {
    const rules = validationRules[fieldName];
    let errors = {};
  
    if (rules) {
      if (rules.required && value.trim() === '') {
        errors = { ...errors, [fieldName]: 'This field is required' };
      }
      if (rules.isEmail && !/\S+@\S+\.\S+/.test(value)) {
        errors = { ...errors, [fieldName]: 'Invalid email format' };
      }
    }
  
    setValidationErrors((prevState) => ({
      ...prevState,
      [gateway]: {
        ...prevState[gateway],
        ...errors,
      },
    }));
  };
  

  const handleSwitchToggle = async (gateway, id) => {
    try {
      let response
      response = await new BasicProvider(
        `ecomerce/payment-gateway/switch/${id}`,
        dispatch,
      ).postRequest()
    } catch (error) {
      console.log('error', error)
    }

    setInitialValues((prevState) => ({
      ...prevState,
      [gateway]: {
        ...prevState[gateway],
        enable: prevState[gateway].enable === '1' ? '0' : '1',
      },
    }))
  }


  const handleSubmit = async (gateway) => {
    try {
      try {
        var data
        data = await handleSubmitHelper(initialValues[gateway], validationRules, dispatch)
        if (data === 'error') {
          return
        }

        const gatewayData = initialValues[gateway];
        let errors = {};
  
        Object.keys(gatewayData.value[0]).forEach((field) => {
          const value = gatewayData.value[0][field];
          if (value.trim() === '') {
            errors[field] = 'This field is required';
          }
        });
  
        setValidationErrors((prevState) => ({
          ...prevState,
          [gateway]: {
            ...prevState[gateway],
            ...errors,
          },
        }));
  
        if (Object.keys(errors).length > 0) {
          return;
        }
       

        let response
        response = await new BasicProvider(
          `ecomerce/payment-gateway/create/`,
          dispatch,
        ).postRequest(initialValues[gateway])

        setAlertTimeout(dispatch)
      } catch (error) {
        console.log(error)
      }
    } catch (e) {
      console.log('Error while Submitting ', e)
    }
  }

  return (
    <>
      <SingleSubHeader moduleName={'Payment Gateway'} />
      <CContainer fluid className="mb-4">
        <CRow>
          <CCol md={6}>
            <CCard>
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <div>Paypal</div>
                <div className="default_toggel">
                  <CFormSwitch
                    id="toggleSwitch"
                    className="mx-2"
                    color="info"
                    shape="pill"
                    onChange={() => handleSwitchToggle('paypal', initialValues.paypal.id)}
                    checked={initialValues.paypal.enable === '1'}
                  />
                </div>
              </CCardHeader>
              <CCardBody>
                <div className="my-2">
                  <CFormLabel>Paypal Email</CFormLabel>
                  <input
                    type="text"
                    name="paypal_email"
                    className="form-control"
                    placeholder="Enter Paypal Email"
                    value={initialValues.paypal.value[0].paypal_email}
                    onChange={(e) => handleChange(e, 'paypal')}
                  />
                  <small className="text-danger">{validationErrors.paypal.paypal_email}</small>

                </div>
                <div className="my-2">
                  <CFormLabel>Client ID</CFormLabel>
                  <input
                    type="text"
                    name="client_id"
                    className="form-control"
                    placeholder="Enter Client ID "
                    value={initialValues.paypal.value[0].client_id}
                    onChange={(e) => handleChange(e, 'paypal')}
                  />
                  <small className="text-danger">{validationErrors.paypal.client_id}</small>

                </div>

                <div className="my-2">
                  <CFormLabel>Secret</CFormLabel>
                  <input
                    type="text"
                    name="paypal_secret"
                    className="form-control"
                    placeholder="Enter Secret"
                    value={initialValues.paypal.value[0].paypal_secret}
                    onChange={(e) => handleChange(e, 'paypal')}
                  />
                  <small className="text-danger">{validationErrors.paypal.paypal_secret}</small>
                </div>
                <div>
                  <CButton
                    onClick={() => handleSubmit('paypal')}
                    className="submit_btn mt-4"
                    type="submit"
                  >
                    Submit
                  </CButton>
                  {/* <CButton className="text-white btn btn-secondary mx-2 mt-4" type="submit">
                    Cancel
                  </CButton> */}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={6}>
            <CCard>
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <div>Stripe</div>
                <div className="default_toggel">
                  <CFormSwitch
                    onChange={() => handleSwitchToggle('stripe', initialValues.stripe.id)}
                    checked={initialValues.stripe.enable === '1'}
                    id="toggleSwitch"
                    className="mx-2"
                    color="info"
                    shape="pill"
                  />
                </div>
              </CCardHeader>
              <CCardBody>
                <div className="my-2">
                  <CFormLabel>Privet Key</CFormLabel>
                  <input
                    type="text"
                    name="stripe_privet_key"
                    className="form-control"
                    placeholder="Enter Privet Key "
                    value={initialValues.stripe.value[0].stripe_privet_key}
                    onChange={(e) => handleChange(e, 'stripe')}
                  />
                  <small className="text-danger">{validationErrors.stripe.stripe_privet_key}</small>

                </div>

                <div className="my-2">
                  <CFormLabel>Secret</CFormLabel>
                  <input
                    type="text"
                    name="stripe_secret"
                    className="form-control"
                    placeholder="Enter Secret"
                    value={initialValues.stripe.value[0].stripe_secret}
                    onChange={(e) => handleChange(e, 'stripe')}
                  />
                  <small className="text-danger">{validationErrors.stripe.stripe_secret}</small>
                </div>
                <div>
                  <CButton
                    onClick={() => handleSubmit('stripe')}
                    className="submit_btn mt-4"
                    type="submit"
                  >
                    Submit
                  </CButton>
                  {/* <CButton className="text-white btn btn-secondary mx-2 mt-4" type="submit">
                    Cancel
                  </CButton> */}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        <CRow className="mt-4">
          <CCol md={6}>
            <CCard>
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <div>PhonePe</div>
                <div className="default_toggel">
                  <CFormSwitch
                    onChange={() => handleSwitchToggle('phonepe', initialValues.phonepe.id)}
                    checked={initialValues.phonepe.enable === '1'}
                    id="toggleSwitch"
                    className="mx-2"
                    color="info"
                    shape="pill"
                  />
                </div>
              </CCardHeader>
              <CCardBody>
                <div className="my-2">
                  <CFormLabel>Merchant ID</CFormLabel>
                  <input
                    type="text"
                    name="phonepe_merchant_id"
                    className="form-control"
                    placeholder="Enter Merchant ID "
                    value={initialValues.phonepe.value[0].phonepe_merchant_id}
                    onChange={(e) => handleChange(e, 'phonepe')}
                  />
                  <small className="text-danger">{validationErrors.phonepe.phonepe_merchant_id}</small>

                </div>
                <div className="my-2">
                  <CFormLabel>Salt Key</CFormLabel>
                  <input
                    type="text"
                    name="phonepe_salt_key"
                    className="form-control"
                    placeholder="Enter Key "
                    value={initialValues.phonepe.value[0].phonepe_salt_key}
                    onChange={(e) => handleChange(e, 'phonepe')}
                  />
                  <small className="text-danger">{validationErrors.phonepe.phonepe_salt_key}</small>

                </div>

                <div className="my-2">
                  <CFormLabel>Index</CFormLabel>
                  <input
                    type="text"
                    name="phonepe_index"
                    className="form-control"
                    placeholder="Enter Index"
                    value={initialValues.phonepe.value[0].phonepe_index}
                    onChange={(e) => handleChange(e, 'phonepe')}
                  />
                  <small className="text-danger">{validationErrors.phonepe.phonepe_index}</small>

                </div>
                <div>
                  <CButton
                    onClick={() => handleSubmit('phonepe')}
                    className="submit_btn mt-4"
                    type="submit"
                  >
                    Submit
                  </CButton>
                  {/* <CButton className="text-white btn btn-secondary mx-2 mt-4" type="submit">
                    Cancel
                  </CButton> */}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </>
  )
}

export default paymentGetway
