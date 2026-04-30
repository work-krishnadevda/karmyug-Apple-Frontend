import { element } from 'prop-types'
import React from 'react'

const Create = React.lazy(() => import('./create'))
const All = React.lazy(() => import('./all'))
const Trash = React.lazy(() => import('./trash'))

const routes = [
    { path: '/rabranch/create', name: 'RA Branch Create', element: Create },
    { path: '/rabranch/all', name: 'RA Branch All', element: All },
    { path: '/rabranch/trash', name: 'RA Branch Trash', element: Trash },
    { path: '/rabranch/:id/edit', name: 'RA Branch Edit', element: Create },
]

export default routes