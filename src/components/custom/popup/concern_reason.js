import React, { useEffect, useState } from 'react';
import Hold from './hold';
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react';
import BasicProvider from 'src/constants/BasicProvider';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import Concern from './concern';


const ConcernReason = (props) => {

  const { visible, close, caseId } = props;
  const [message, setMessage] = useState({});
  const [visibleHoldModel, setVisibleHoldModel] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const dispatch = useDispatch();
  const [concernData, setConcernData] = useState(null); // New state to hold data for Concern

  // Function to fetch data and update state
  const fetchData = async () => {
    try {
      if (caseId) {
        let response = await new BasicProvider(`cases/show-popup-data/${caseId}`, dispatch).getRequest();
        let data = response?.data;

        if (response) {
          setMessage({
            message: data?.concern_message?.message,
            template: data?.concern_message?.template,
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
    setConcernData({
      message: message.message,
      template: message.template,
    });
    close();
    setVisibleHoldModel(true);
  };


  console.log('concern data data data --', concernData)

  return (
    <>
      <CModal alignment="center" visible={visible} className="delete_item_box" backdrop="static">
        <CModalHeader>
          <div>
            <CModalTitle id="StaticBackdropExampleLabel">Concern Reason</CModalTitle>
            <>
              <div>
                <small>At: <strong>{message.at ? moment(message.at).format('MMMM Do YYYY, h:mm:ss a') : '-'}</strong></small>
              </div>
            </>
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
            onClick={(e) => {
              setConcernData(null);
              close();
            }}
          >
            Close
          </CButton>
          <CButton
            className="text-white"
            color="primary"
            onClick={() => {
              close();
              setIsEdit(true);
              handleEditClick();
            }}
          >
            Edit
          </CButton>
        </CModalFooter>
      </CModal>

      <Concern
        visible={visibleHoldModel}
        close={() => {
          close()
          return setVisibleHoldModel(false);
        }}
        caseId={caseId}
        type="hold"
        status="hold by admin"
        call="admin call"
        isEdit={isEdit}
        onUpdate={fetchData}
        prefilledData={concernData}

      />



    </>
  );
};

export default ConcernReason;
