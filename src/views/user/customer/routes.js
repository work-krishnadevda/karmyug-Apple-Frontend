//routes.js

import React from 'react'

const All = React.lazy(() => import('./all'))
const Create = React.lazy(() => import('./create'))
const Trash = React.lazy(() => import('./trash'))
const CustomerLayouts = React.lazy(() => import('../../../layout/customerLayout'))
const CustomerBlock = React.lazy(() => import('./customerBlock'))

const routes = [
  { path: '/customers/all', name: 'Customers', element: All },
  { path: '/customers/trash', name: 'Customers trash', element: Trash },
  { path: '/customers/create', name: 'Customers Create', element: Create },
  { path: '/customers/:id/edit', name: 'Customers Edit', element: Create },
  { path: '/customers/:id/*', name: 'Customers', element: CustomerLayouts },
  { path: '/customers/block', name: 'Customers', element: CustomerBlock },
]

export default routes
