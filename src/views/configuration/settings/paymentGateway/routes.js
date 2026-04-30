import React from 'react'

const Create = React.lazy(() => import('./create'))

const routes = [
  { path: '/settings/payment-gateway/create', name: 'Payment gateway', element: Create },
  { path: '/settings/payment-gateway/:id/edit', name: 'Payment gateway', element: Create },
]

export default routes
