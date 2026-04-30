import React from 'react'

const Create = React.lazy(() => import('./create'))

const routes = [
  { path: '/master/templates', name: 'Create template', element: Create },
  { path: '/master/template/:id/edit', name: 'Edit template', element: Create },
]

export default routes
