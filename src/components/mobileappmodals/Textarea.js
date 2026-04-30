import { CButton, CForm, CFormLabel, CFormSelect, CModal, CModalBody, CModalHeader, CModalTitle, CModalFooter, CFormTextarea } from '@coreui/react'
import React, { useEffect, useRef, useState } from 'react'
import BasicProvider from 'src/constants/BasicProvider'


const TextareaModal = ({ visible,
    setVisible,
    setItems,
    items,
    CurrentWidget }) => {

    const [editorLoaded, setEditorLoaded] = useState(false)
    const [initialValues, setInitialValues] = useState({
        content: '',
    })

    const editorRef = useRef()
    const { CKEditor, ClassicEditor } = editorRef.current || {}



    useEffect(() => {
        editorRef.current = {
            CKEditor: require('@ckeditor/ckeditor5-react').CKEditor, // v3+
            ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
        }
        setEditorLoaded(true)

    }, [])

    useEffect(()=>{
        setInitialValues(CurrentWidget.json)
      },[CurrentWidget])


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
            <CModal alignment="center" visible={visible} onClose={() => setVisible(false)} className='modal-lg'>
                <CModalHeader>
                    <CModalTitle>Textarea Details</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <div>
                            {editorLoaded && (
                                <CKEditor
                                    type="text"
                                    name="content"
                                    editor={ClassicEditor}
                                    config={{
                                        ckfinder: {
                                            uploadUrl: '', 
                                        },
                                    }}
                                    data={initialValues?.content}
                                    onChange={(e, editor) => {
                                        const data = editor.getData()
                                        setInitialValues((previewValue) => ({
                                            ...previewValue,
                                            content: data,
                                        }))
                                    }}
                                />
                            )}
                        </div>
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
    )
}



export default TextareaModal
