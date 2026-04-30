import React from 'react'

const All = React.lazy(() => import('./all'))
const Create = React.lazy(() => import('./create'))
const Trash = React.lazy(() => import('./trash'))

const routes = [
  { path: '/builder/form/all', name: 'Pages', element: All },
  { path: '/builder/form/create', name: 'Create Page', element: Create },
  { path: '/builder/form/:id/edit', name: 'Edit Pages', element: Create },
  { path: '/builder/form/trash', name: 'Trash Pages', element: Trash },
]

export default routes
