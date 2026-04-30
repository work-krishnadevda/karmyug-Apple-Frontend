import { useParams } from 'react-router-dom'

const { CFormSelect, CForm, CRow, CCol, CFormLabel, CButton } = require('@coreui/react')

const AssignSdm = ({ currentStep, setCurrentStep, initialValues, setInitialValues }) => {
  const totalSteps = 8
  var params = useParams()
  const id = params.id

  const handlePreviousStep = () => {
    setCurrentStep((current) => (current > 1 ? current - 1 : current))
  }
  const handleNextStep = async () => {
    setCurrentStep((current) => (current < totalSteps ? current + 1 : current))
  }
  return (
    <>
      <CForm className="g-3 needs-validation">
        <CRow className="w-100 m-0">
          <CCol md={4}>
            <div className="py-2">
              <CFormLabel>Assign to SDM :-</CFormLabel>
              <CFormSelect
                custom
                name="person_meet_at_site_relation"
                value=""
                placeholder="Select"
                // onChange={handleOnChange}
              >
                <option>Select Type Relation</option>
                <option value="son">Son</option>
                <option value="daughter">Daughter</option>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="brother">Brother</option>
                <option value="sister">Sister</option>
                <option value="grandfather">Grandfather</option>
                <option value="grandmother">Grandmother</option>
                <option value="uncle">Uncle</option>
                <option value="aunt">Aunt</option>
                <option value="cousin">Cousin</option>
              </CFormSelect>
            </div>
          </CCol>

          <div className="text-center mt-4">
            {currentStep > 1 && currentStep != totalSteps && (
              <CButton
                className="btn btn-success me-2 mt-2 mFt-2 next w-17 submit_btn"
                type="button"
                onClick={handlePreviousStep}
              >
                Prev
              </CButton>
            )}
             {currentStep === totalSteps - 1 && id != undefined && (
            <CButton
              className="btn btn-success text-white me-2 mt-2 mFt-2 next w-17"
              type="submit"
              onClick={handleNextStep}
            >
              Submit
            </CButton>
          )}
            {currentStep < totalSteps - 1 && (
              <CButton
                className="btn-warning btn me-2 mx-3 w-17"
                // type="submit"
                onClick={() => {
                  handleSubmit()
                  handleNextStep()
                }}
              >
                Next
              </CButton>
            )}
            {/* <CButton
            className="btn btn-success me-2 mt-2 w-17 previous mx-3 w-17 my-4"
            type="button"
            // onClick={handleSubmit}
          >
            Save
          </CButton> */}
          </div>
        </CRow>
      </CForm>
    </>
  )
}
export default AssignSdm
