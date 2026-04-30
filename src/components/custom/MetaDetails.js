import { CCard, CCardBody, CCardHeader, CFormInput, CFormLabel, CFormTextarea } from '@coreui/react'
import React from 'react'



const MetaDetails = ({
    initialValues,
    setInitialValues,
    customOnchnge


}) => {
  return (
    <>
      <CCard>
        <CCardHeader>Meta Details</CCardHeader>
        <CCardBody>
          <div className="mb-3">
            <CFormLabel>Meta Title</CFormLabel>
            <CFormInput
              name="meta_title"
              className="form-control"
              placeholder="Meta Title"
              value={initialValues.meta_title ?? ''}
              onChange={customOnchnge}
              id="validationCustom08"
            //   rows={4}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Meta Keywords</CFormLabel>
            <CFormInput
              name="meta_keywords"
              className="form-control"
              placeholder="Meta Keywords"
              value={initialValues.meta_keywords ?? ''}
              onChange={customOnchnge}
              id="validationCustom08"
            //   rows={4}
            />
          </div>
          <div>
            <CFormLabel>Meta Description</CFormLabel>
            <CFormTextarea
              name="meta_description"
              className="form-control"
              placeholder="Meta Description"
              value={initialValues.meta_description ?? ''}
              onChange={customOnchnge}
              id="validationCustom08"
              rows={2}
            />
          </div>
        </CCardBody>
      </CCard>
    </>
  )
}

export default MetaDetails
