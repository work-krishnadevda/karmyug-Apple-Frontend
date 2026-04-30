import React from 'react'

const Create = React.lazy(() => import('./create'))


const routes = [
  { path: '/permission/create', name: 'Permissions', element: Create },
  { path: '/permission/:id/edit', name: 'Permissions', element: Create },

]

export default routes
