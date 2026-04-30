import React from 'react'

const Create = React.lazy(() => import('./create'))

const routes = [
  { path: '/master/tags', name: 'Create Tags', element: Create },
  { path: '/master/tags/:id/edit', name: 'Edit region', element: Create },
]

export default routes
