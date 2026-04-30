import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export function AlertHelper(props) {
  const { isEditMode, alert } = props
  const isSuccessful = useSelector((state) => state.isSuccessful)
  const validations = useSelector((state) => state.validations)
  const catcherror = useSelector((state) => state.catcherror)
  const successMessage = useSelector((state) => state.successMessage)
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage)
    }
    {
      isSuccessful ? toast.success(`${isEditMode ? 'Updated' : 'Created'} successfully`) : null
    }

    {
      catcherror ? toast.error(`${catcherror}`) : null
    }

    {
      validations && validations.length > 0
        ? toast.error(
            <ul>
              {validations.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>,
          )
        : null
    }
  }, [isSuccessful, validations, alert, successMessage])
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
}

export function setAlertTimeout(dispatch) {
  dispatch({ type: 'set', isSuccessful: true })
  setTimeout(() => {
    dispatch({ type: 'set', isSuccessful: false })
    dispatch({ type: 'set', validations: [] })
    dispatch({ type: 'set', catcherror: null })
  }, 100)
}

export function customSuccessMSG(dispatch, successMessage) {
  dispatch({ type: 'set', successMessage: successMessage })
  setTimeout(() => {
    dispatch({ type: 'set', successMessage: null })
  }, 100)
}
