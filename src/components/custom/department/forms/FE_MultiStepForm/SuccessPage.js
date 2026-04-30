import React, { useLayoutEffect, useState } from 'react'

import successImg from '../../../../../assets/images/success-img.jpg'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleLeft } from '@fortawesome/free-solid-svg-icons'

// import contact from './contact-success.png'
// import contactImg from 'contact-success.png'
// assets/images/success-img.jpg


const SuccessPage = () => {
  let naviget = useNavigate()
  var params = useParams()
  var dispatch = useDispatch()
  const location = useLocation()
  const id = params.id
  const isEditMode = !!id

  let [time, setTime] = useState('')

  useLayoutEffect(() => {

    ; (async () => {
      try {
        const data = await new BasicProvider(`cases/show/${id}`, dispatch).getRequest()
        setTime(data.data.fe_visit_time)
      } catch (error) { }
    })()

  }, [])

  return (
    <div className="form-card">
      <div
        className="btn btn-success me-2 mt-2 mFt-2 next w-lg-17 w-sm-auto submit_btn"
        type="button"
        onClick={() => naviget('/case/all')}
      >
        <FontAwesomeIcon icon={faCircleLeft} /> All cases
      </div>
      <h2 className="purple-text text-center">
        <strong>SUCCESS !</strong>
      </h2>
      <br />

      <div className="row justify-content-center">
        <div className="col-3 text-center">
          <img
            width={100}
            height={100}

            src={successImg}
            className="fit-image"
            alt="Success Image"
          />
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-7 text-center">
          <h5 className="purple-text text-center">Visit Done Successfully !!</h5>
          {time && (
            <p className="fw-bold">
              Your visit time is<span className="ps-2">{time}</span>
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default SuccessPage
