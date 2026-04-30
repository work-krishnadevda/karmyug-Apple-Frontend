//contentRoutes,js

import React from 'react'

const All = React.lazy(() => import('./all'))
const personalInfo = React.lazy(() => import('./personalInfo'))
const profileOverView = React.lazy(() => import('./profileOverView'))
const changePassword = React.lazy(() => import('./changePassword'))
const emailLog = React.lazy(() => import('./emailLog'))
const wallet = React.lazy(() => import('./wallet'))
const order = React.lazy(() => import('./order'))

const routes = [
  { path: 'info', name: 'Personal Info', element: personalInfo },
  { path: 'profile-overview', name: 'Profile overview', element: profileOverView },
  { path: 'change-password', name: 'change Password', element: changePassword },
  { path: 'email-log', name: 'change Password', element: emailLog },
  { path: 'wallet', name: 'change Password', element: wallet },
  { path: 'order', name: 'change Password', element: order },
]

export default routes
