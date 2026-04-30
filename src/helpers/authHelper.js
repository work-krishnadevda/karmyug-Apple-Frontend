import Cookies from 'js-cookie'
import BasicProvider from 'src/constants/BasicProvider'
import jwt_decode from 'jwt-decode'


class AuthHelpers {
  static async login(formdata, navigate, dispatch) {
    try {
      const response = await new BasicProvider('auth/admin/login', dispatch).postRequest(formdata)
      // console.log('process.env.REACT_APP_COOKIE_EXPIRE', process.env.REACT_APP_COOKIE_EXPIRE);
      Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, response.data.access_token, {
        expires: 30,
        path: '',
        domain: process.env.REACT_APP_URL,
        sameSite: 'strict',
      })
      Cookies.set(`primery_user_id`, response?.data?.data._id, {
        expires: 30,
        path: '',
        domain: process.env.REACT_APP_URL,
        sameSite: 'strict',
      })
      Cookies.set(`current_user_role`, response?.data?.data?.role[0]?.name, {
        expires: 30,
        path: '',
        domain: process.env.REACT_APP_URL,
        sameSite: 'strict',
      })
      dispatch({ type: 'set', isLogin: true })
      dispatch({ type: 'set', isNotLoggin: '' })
      dispatch({ type: 'set', isBlock: '' })

      navigate('/dashboard')
    } catch (error) {
      console.error(error)
    }
  }

  static async logout(navigate) {
    try {
      // Clear all punch in statuses from both localStorage and sessionStorage
      this.clearPunchInStatuses()
      
      Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, {
        path: '',
        domain: process.env.REACT_APP_URL,
      })
      Cookies.remove(`primery_user_id`)
      Cookies.remove(`current_user_role`)

      navigate('/login');
      window.location.reload();
    } catch (error) {
      console.error(error)
    }
  }

  // New method to clear all punch in statuses
  static clearPunchInStatuses() {
    try {
      // Clear localStorage
      const localStorageKeys = Object.keys(localStorage)
      localStorageKeys.forEach(key => {
        if (key.startsWith('punchInStatus_')) {
          localStorage.removeItem(key)
          console.log(`AuthHelper: Cleared localStorage - ${key}`)
        }
      })
      
      // Clear sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage)
      sessionStorageKeys.forEach(key => {
        if (key.startsWith('punchInStatus_')) {
          sessionStorage.removeItem(key)
          console.log(`AuthHelper: Cleared sessionStorage - ${key}`)
        }
      })
      
      console.log('AuthHelper: All punch in statuses cleared')
    } catch (error) {
      console.error('AuthHelper: Error clearing punch in statuses:', error)
    }
  }
}
export default AuthHelpers
