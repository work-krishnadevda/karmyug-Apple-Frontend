import React from 'react'

const Create = React.lazy(() => import('./create'))

const routes = [
  { path: '/master/status', name: 'Create Status', element: Create },
  { path: '/master/status/:id/edit', name: 'Edit Status', element: Create },
]

export default routes
