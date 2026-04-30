import React from 'react'

const Create = React.lazy(() => import('./category'))

const routes = [
  { path: '/master/category', name: 'Category', element: Create },
  { path: '/master/category/:id/edit', name: 'Category Edit', element: Create },
]

export default routes
