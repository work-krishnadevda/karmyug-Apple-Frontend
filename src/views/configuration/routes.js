import React from 'react'

const All = React.lazy(() => import('./storeSettings'))

const routes = [{ path: '/settings/store', name: 'Category', element: All }]

export default routes
