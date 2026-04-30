import React from 'react'

const All = React.lazy(() => import('./all'))
// const Show = React.lazy(() => import('./show'))

const routes = [
  { path: '/logs/admin-logs', name: 'LOGS', element: All },
//   { path: '/support/support-ticket/:id/show', name: 'Support Ticket', element: Show },
]

export default routes
