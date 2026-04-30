import React from 'react'

const All = React.lazy(() => import('./all'))
const Create = React.lazy(() => import('./create'))
const Trash = React.lazy(() => import('./trash'))
// const VendorLayout = React.lazy(()=> import('../../../layout/VendorLayout '))


const routes = [
  { path: '/vendors/all', name: 'Vendors', element: All },
  { path: '/vendors/create', name: 'Create Page', element: Create },
  { path: '/vendors/:id/edit', name: 'Edit Pages', element: Create },
  { path: '/vendors/trash', name: 'Trash vendors', element: Trash },
  // { path: '/vendors/:id*', name:'Vendor Layout', element: VendorLayout },

]


export default routes
