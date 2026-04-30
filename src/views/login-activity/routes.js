
import React from 'react'

const All = React.lazy(() => import('./all'))

const routes = [{ path: '/login-activity/all', name: 'All Banks', element: All }]

export default routes
