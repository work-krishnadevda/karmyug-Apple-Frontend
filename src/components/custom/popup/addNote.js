import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  CButton,
  CModal,
  CModalBody,
  CModalFooter,
  CFormLabel,
} from '@coreui/react'
import BasicProvider from 'src/constants/BasicProvider'
import { useDispatch } from 'react-redux'
import { customSuccessMSG } from 'src/helpers/alertHelper'

const AddNote = (props) => {
  const { visible, close, caseId } = props
  const dispatch = useDispatch()

  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')

  const editorRef = useRef()
  const { CKEditor, ClassicEditor } = editorRef.current || {}
  const [editorLoaded, setEditorLoaded] = useState(false)

  useEffect(() => {
    editorRef.current = {
      CKEditor: require('@ckeditor/ckeditor5-react').CKEditor, // v3+
      ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
    }
    setEditorLoaded(true)
  }, [])

  useEffect(() => {
    return () => {
      setMessage('')
      setContact('')
    }
  }, [])

  useLayoutEffect(() => {
    ; (async () => {
      try {
        if (caseId) {
          const data = await new BasicProvider(`cases/show-popup-data/${caseId}`, dispatch).getRequest()
          setMessage(data.data.fe_note ?? '')
        }
      } catch (error) {
        dispatch({ type: 'set', validations: [error.data] })
      }
    })()
  }, [visible, caseId])

  const handleAddNote = async () => {
    try {
      if (!caseId && !null) {
        dispatch({ type: 'set', validations: ['Something went wrong!'] })
        return
      }

      if (!message && !null) {
        dispatch({ type: 'set', validations: ['Enter valid note!'] })
        return
      }
      let data = {
        fe_note: message,
        map_data: { reference_contact_number: contact }
      }
      let response = await new BasicProvider(`cases/update/${caseId}`, dispatch).patchRequest(data)
      if (response) {
        customSuccessMSG(dispatch, 'Note Sent Successfully!')
        close()
        setMessage('')
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <>
      <CModal alignment="center" visible={visible} className="delete_item_box">
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Broker/Reference Contact Number</CFormLabel>
            <input
              type="number"
              name="contact"
              value={contact ?? ''}
              className="form-control"
              placeholder="Enter contact here"
              onChange={(e) => {
                const input = e.target.value
                const regex = /^[0-9\b]+$/
                if (input === '' || regex.test(input)) {
                  setContact(input.slice(0, 10))
                }
              }}
              maxLength={10}
              autoComplete="off"
            />
          </div>


          <div>
            <CFormLabel>Enter Extra Details</CFormLabel>
            {editorLoaded && (
              <>
                <CKEditor
                  name="message"
                  editor={ClassicEditor}
                  config={{
                    ckfinder: {
                      uploadUrl: '',
                    },
                  }}
                  data={message ?? ''}
                  onChange={(e, editor) => {
                    const data = editor.getData() || ''
                    setMessage(data)

                  }}
                />
              </>
            )}

          </div>
        </CModalBody>

        <CModalFooter>
          <CButton onClick={handleAddNote} color="danger" className="text-white close_btn model_btn">
            Submit
          </CButton>
          <CButton
            className="text-white"
            color="danger"
            onClick={() => {
              close()
              setMessage('')
              setContact('')
            }}
          >
            Cancel
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default AddNote
