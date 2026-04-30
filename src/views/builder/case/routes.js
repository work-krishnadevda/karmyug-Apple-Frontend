import React from 'react'

const All = React.lazy(() => import('./all'))
const Create = React.lazy(() => import('./create'))
const Trash = React.lazy(() => import('./trash'))

const routes = [
  { path: '/builder/case/all', name: 'Cases', element: All },
  { path: '/builder/case/create', name: 'Create Case', element: Create },
  { path: '/builder/case/:id/edit', name: 'Edit Cases', element: Create },
  { path: '/builder/case/trash', name: 'Trash Cases', element: Trash },
]

export default routes
