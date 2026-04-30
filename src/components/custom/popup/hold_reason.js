import React, { useEffect, useState } from 'react';
import Hold from './hold';
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react';
import BasicProvider from 'src/constants/BasicProvider';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';


const Hold_Reason = (props) => {

  const { visible, close, caseId } = props;
  const [message, setMessage] = useState({});
  const [visibleHoldModel, setVisibleHoldModel] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const loggedInUser = useSelector((state) => state.userData);
  const dispatch = useDispatch();

  // Function to fetch data and update state
  const fetchData = async () => {
    try {
      if (caseId) {
        let response = await new BasicProvider(`cases/show-popup-data/${caseId}`, dispatch).getRequest();
        let data = response?.data;

        if (response) {
          setMessage({
            message: data?.hold_message?.message,
            template: data?.hold_message?.template,
            by: data?.hold_message?.by,
            at: data?.hold_message?.at
          });
        }
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [caseId, visible, dispatch]);

  const handleEditClick = () => {
    close();
    setVisibleHoldModel(true);
  };

  return (
    <>
      <CModal alignment="center" visible={visible} className="delete_item_box">
        <CModalHeader>
          <div>
            <CModalTitle id="StaticBackdropExampleLabel">Hold Reason</CModalTitle>
            {message?.by && (
              <>
                <div>
                  <small>By: <strong>{message.by.name ? message.by.name : 'N/A'}</strong></small>
                </div>
                <div>
                  <small>At: <strong>{message.at ? moment(message.at).format('MMMM Do YYYY, h:mm:ss a') : '-'}</strong></small>
                </div>
              </>
            )}
          </div>
        </CModalHeader>

        <CModalBody>
          <h6>{message?.template?.subject}</h6>
          <p>{message?.message}</p>
        </CModalBody>

        <CModalFooter>
          <CButton
            className="text-white"
            color="danger"
            onClick={close}
          >
            Close
          </CButton>
          {loggedInUser._id === message?.by?._id && (
            <CButton
              className="text-white"
              color="primary"
              onClick={() => {
                setIsEdit(!isEdit);
                handleEditClick();
              }}
            >
              Edit
            </CButton>
          )}
        </CModalFooter>
      </CModal>

      <Hold
        visible={visibleHoldModel}
        close={() => setVisibleHoldModel(false)}
        caseId={caseId}
        type="hold"
        status="hold by admin"
        call="admin call"
        isEdit={isEdit}
        onUpdate={fetchData}

      />
    </>
  );
};

export default Hold_Reason;
