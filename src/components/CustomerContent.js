//CustomerContent.js

import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import routes from '../views/user/customer/contentRoute'
const CustomerContent = () => {
  return (
    <>
      <Suspense>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element />}
                />
              )
            )
          })}
        </Routes>
      </Suspense>
    </>
  )
}

export default React.memo(CustomerContent)
