import React, { useEffect, useState } from 'react';
import {
    CButton,
    CModal,
    CModalBody,
    CModalFooter,
} from '@coreui/react';

const OfflineVisitDone = (props) => {
    const { visible, close, caseId, updateCase, fetchData } = props;
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                setShowSuccessModal(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [showSuccessModal]);


    return (
        <>
            {/* Main Confirmation Modal */}
            <CModal alignment="center" visible={visible} className="delete_item_box">
                <CModalBody className="text-center mt-4">
                    <div className="m-auto">
                        <img src="/offline-visit.png" className='w-20' alt="Confirmation" />
                    </div>
                    <span>Are You Sure You Want To Do Offline Visit?</span>
                </CModalBody>

                <CModalFooter className="model_footer justify-content-center mb-3 pt-0">
                    <CButton
                        onClick={async () => {
                            caseId && await updateCase(caseId, 'offline');
                            setShowSuccessModal(true);
                            fetchData()
                            close();
                        }}
                        className="close_btn model_btn w-20"
                        color="danger"
                    >
                        Yes
                    </CButton>
                    <CButton
                        className="btn-danger model_btn w-20 text-white"
                        color="secondary"
                        onClick={close}
                    >
                        No
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Success Modal */}

            <CModal
                alignment="center"
                visible={showSuccessModal}
                onClose={() => setShowSuccessModal(false)} // Close success modal
                className="delete_item_box"
            >
                <CModalBody className="text-center mt-4">
                    <div className="logo_check m-auto mb-5">✓</div>
                    <h1 className="h4">Visit Done Successfully</h1>
                </CModalBody>
                <CModalFooter className="model_footer justify-content-center mb-3 pt-0"></CModalFooter>
            </CModal>
        </>
    );
};

export default OfflineVisitDone;
