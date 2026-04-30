import React, { Suspense } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'

// routes config
import { AlertHelper } from 'src/helpers/alertHelper'
import Cookies from 'js-cookie'
import routes from 'src/views/hrms/routes'

const HRMSContent = () => {
  var token = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)

  var navigate = useNavigate()
  const isEditMode = !!window.location.href.includes('/edit')
  return (
    <>
      <AlertHelper isEditMode={isEditMode} />

      <Suspense>
        <Routes>
        {routes.map((route, idx) => {
            if (token) {
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path.replace('/hrms', '')} 
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                )
              )
            } else {
              return navigate('/login')
            }
          })}
          <Route path="/" element={<Navigate to="profile" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default React.memo(HRMSContent)
