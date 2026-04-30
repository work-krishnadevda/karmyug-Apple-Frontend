import React from 'react'
const Create = React.lazy(() => import('./create'))

const routes = [
  { path: '/master/currency', name: 'Create Tags', element: Create },
  { path: '/master/currency/:id/edit', name: 'Edit Tag', element: Create },
]

export default routes

// /ecommerce/currency
