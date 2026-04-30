
import React from 'react'

const All = React.lazy(() => import('./all'))

const routes = [{ path: '/settings/all', name: 'All Banks', element: All }]

export default routes
