import React from 'react'

const Create = React.lazy(() => import('./create'))

const routes = [
  { path: '/master/regions', name: 'Create region', element: Create },
  { path: '/master/region/:id/edit', name: 'Edit region', element: Create },
]

export default routes
