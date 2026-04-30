import React from 'react'

const Create = React.lazy(() => import('./create'))


const routes = [
  { path: '/roles/create', name: 'Roles', element: Create },
]

export default routes
