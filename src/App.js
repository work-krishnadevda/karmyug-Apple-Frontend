import React, { Component, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './scss/style.scss'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import HRMSLayout from './layout/HRMSLayout'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

class App extends Component {
  render() {
    const token = this.props.token
    const isLogin = this.props.isLogin

    let validToken = null

    if (typeof token === 'string' && token.trim().length > 0) {
      try {
        validToken = jwtDecode(token)

        if (validToken.exp * 1000 < Date.now()) {
          console.warn('Token has expired.')
          validToken = null
        }
      } catch (error) {
        console.error('Invalid token', error)
      }
    } else {
      console.warn('No valid token found.')
    }

    const isAuthenticated = Boolean(validToken)

    return (
      <DndProvider backend={HTML5Backend}>
        <HashRouter>
          <Suspense fallback={loading}>
            <Routes>
              <Route exact path="/login" name="Login Page" element={<Login />} />
              <Route exact path="/register" name="Register Page" element={<Register />} />
              <Route exact path="/404" name="Page 404" element={<Page404 />} />
              <Route exact path="/500" name="Page 500" element={<Page500 />} />
              {/* <Route path="/hrms/*" element={isAuthenticated ? <HRMSLayout /> : <Login />} /> */}
              <Route
                path="*"
                name="Home"
                element={isAuthenticated ? <DefaultLayout /> : <Login />}
              />
            </Routes>
          </Suspense>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="toast-container-custom"
            style={{ zIndex: 99999 }} // 👈 important
          />
        </HashRouter>
      </DndProvider>
    )
  }
}

App.propTypes = {
  isLogin: PropTypes.any,
}

function mapStateToProps(state) {
  const token = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)
  const isLogin = state.isLogin

  return {
    token,
    isLogin,
  }
}

export default connect(mapStateToProps)(App)
