import axios from 'axios'
import Cookies from 'js-cookie'
import AuthHelpers from 'src/helpers/authHelper'

axios.interceptors.response.use(
  (response) => {
    const data = response?.data;

    // Auto logout ONLY if backend explicitly sends inactive account message
    // NOTE: We don't check user.status fields here because those could be for OTHER users
    // (e.g., when admin views staff list, each staff has a status field)
    // We only check explicit error messages that indicate the CURRENT user is inactive
    if (
      data?.statusCode === 401 ||
      data?.error === "Unauthorized" ||
      data?.message === "Your account is inactive" ||
      (typeof data?.message === "string" && 
       data?.message.toLowerCase().includes("inactive") && 
       (data?.message.toLowerCase().includes("your account") || 
        data?.message.toLowerCase().includes("account is")))
    ) {
      Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, {
        path: "",
        domain: process.env.REACT_APP_URL,
      });

      Cookies.remove('primery_user_id', {
        path: "",
        domain: process.env.REACT_APP_URL,
      });

      window.location.href = "/login";
      return;
    }

    return response;
  },
  (error) => { 
    if (error?.response?.status === 401) { 

      Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, {
        path: "",
        domain: process.env.REACT_APP_URL,
      });

      Cookies.remove('primery_user_id', {
        path: "",
        domain: process.env.REACT_APP_URL,
      });

      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
function logoutUser() {
  Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, {
    path: '',
    domain: process.env.REACT_APP_URL,
  })

  // Redirect immediately
  window.location.href = "/login"
}
class BasicProvider {
  constructor(url, dispatch) {
    this.url = process.env.REACT_APP_NODE_URL + '/api/' + url
    this.dispatch = dispatch || (() => {}) //Default to no operation function
  }

  
  async getRequest() {
    try {
      const config = this.getHeaders()
      // if (this.url.includes('files')) {
      //   config.responseType = 'blob'
      // }
      if (this.url.includes('files/download')) {
        config.responseType = 'blob' // IMPORTANT: binary data
      }
      const response = await axios.get(this.url, config)
      return this.processResponse(response)
    } catch (error) {
      this.handleException(error)
    }
  }

  async postRequest(data) {
    try {
      // console.log(data);
      const response = await axios.post(this.url, data, this.getHeaders(data))
      return this.processResponse(response)
    } catch (error) {
      this.handleException(error)
    }
  }
 
  async putRequest(data) {
    try {
      const response = await axios.put(this.url, data, this.getHeaders(data))
      return this.processResponse(response)
    } catch (error) {
      console.error('Error occurred during PUT request:', error)
      this.handleException(error)
    }
  }

  async patchRequest(data, onUploadProgress = null) {
    try {
      const config = this.getHeaders(data)

      if (onUploadProgress && typeof onUploadProgress === 'function') {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onUploadProgress(percentCompleted)
        }
      }

      const response = await axios.patch(this.url, data, config)
      return this.processResponse(response)
    } catch (error) {
      this.handleException(error)
    }
  }

  async deleteRequest(data) {
    try {
      var config = this.getHeaders()
      const response = await axios.post(this.url, data, config)
      return this.processResponse(response)
    } catch (error) {
      console.error('Error occurred during DELETE request:', error)
      this.handleException(error)
    }
  }

  async deleteRealRequest(data) {
    try {
      const config = this.getHeaders()
      const response = await axios.delete(this.url, { ...config, data })
      return this.processResponse(response)
    } catch (error) {
      console.error('Error occurred during DELETE request:', error)
      this.handleException(error)
    }
  }

  processResponse(response) {
    // console.log(response)
    if (response.status >= 200 && response.status < 300) {
      if (response.data.data) {
        return response.data
      } else {
        return response
      }
    } else {
      throw new Error(response)
    }
  }

  getHeaders(data) {
    const headers = {}

    // FormData: do not set Content-Type — axios adds multipart boundary automatically
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const token = this.getTokenFromCookie()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return { headers: headers }
  }

  getTokenFromCookie() {
    const token = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)
    return token
  }

  handleException(error) {
    if (process.env.REACT_APP_DEBUG) {
      console.error(error.response?.data || error)
    }

    if (error.response?.data?.statusCode == 401) {
      Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, {
        path: '',
        domain: process.env.REACT_APP_URL,
      })
      Cookies.remove('primery_user_id', {
        path: '',
        domain: process.env.REACT_APP_URL,
      })
      if (this.dispatch) {
        this.dispatch({ type: 'set', isNotLoggin: error.response.data.error })
      }
    }

    if (error.response?.data?.statusCode == 403) {
      Cookies.remove(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`, {
        path: '',
        domain: process.env.REACT_APP_URL,
      })
      Cookies.remove('primery_user_id', {
        path: '',
        domain: process.env.REACT_APP_URL,
      })
      if (this.dispatch) {
        this.dispatch({ type: 'set', isBlock: error.response.data.message })
      }
    }

    if (error.hasOwnProperty('response')) {
      if (error.response.hasOwnProperty('data')) {
        if (this.dispatch) {
          this.dispatch({ type: 'set', isSuccessful: false })
        }
        // this.dispatch({ type: 'set', validations: [error.response.data] })
        throw error.response.data
      }
      throw error.response
    }
    throw error
  }
}

export default BasicProvider
