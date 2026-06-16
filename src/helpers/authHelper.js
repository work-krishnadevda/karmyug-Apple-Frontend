import Cookies from 'js-cookie'
import BasicProvider from 'src/constants/BasicProvider'
import jwt_decode from 'jwt-decode'


class AuthHelpers {
  static getCookieOptions() {
    const options = { expires: 30, path: '', sameSite: 'strict' }
    const domain = process.env.REACT_APP_URL
    if (domain && !domain.includes('localhost')) {
      options.domain = domain
    }
    return options
  }

  static clearAuthCookies() {
    const scopedOptions = { path: '' }
    const domain = process.env.REACT_APP_URL
    if (domain && !domain.includes('localhost')) {
      scopedOptions.domain = domain
    }

    Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, scopedOptions)
    Cookies.remove('primery_user_id', scopedOptions)
    Cookies.remove('current_user_role', scopedOptions)
    Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, { path: '' })
    Cookies.remove('primery_user_id', { path: '' })
    Cookies.remove('current_user_role', { path: '' })
  }

  static async login(formdata, navigate, dispatch) {
    try {
      this.clearAuthCookies()
      const response = await new BasicProvider('auth/admin/login', dispatch).postRequest(formdata)
      const cookieOptions = this.getCookieOptions()
      Cookies.set(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, response.data.access_token, cookieOptions)
      Cookies.set(`primery_user_id`, response?.data?.data._id, cookieOptions)
      Cookies.set(`current_user_role`, response?.data?.data?.role[0]?.name, cookieOptions)
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
      
      this.clearAuthCookies()

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
