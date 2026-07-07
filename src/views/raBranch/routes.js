import { element } from 'prop-types'
import React from 'react'

const Create = React.lazy(() => import('./create'))
const All = React.lazy(() => import('./all'))
const Trash = React.lazy(() => import('./trash'))

const routes = [
    { path: '/rabranch/create', name: 'MA Branch Create', element: Create },
    { path: '/rabranch/all', name: 'MA Branch All', element: All },
    { path: '/rabranch/trash', name: 'MA Branch Trash', element: Trash },
    { path: '/rabranch/:id/edit', name: 'MA Branch Edit', element: Create },
]

export default routes