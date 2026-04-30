import React from 'react'

const Create = React.lazy(() => import('./create'))

const routes = [
  { path: '/master/units', name: 'Create Tags', element: Create },
  { path: '/master/units/:id/edit', name: 'Edit Tag', element: Create },
]

export default routes
