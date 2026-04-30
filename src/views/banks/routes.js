import { element } from 'prop-types'
import React from 'react'

const Create = React.lazy(() => import('./create'))
const All = React.lazy(() => import('./all'))
const Trash = React.lazy(() => import('./trash'))
const detail = React.lazy(() => import('./detail'))
const calculation = React.lazy(() => import('./calculation'))



const routes = [
    { path: '/bank/create', name: 'Bank Create', element: Create },
    { path: '/bank/all', name: 'All Banks', element: All },
    { path: '/bank/trash', name: 'Trash Bank', element: Trash },
    { path: '/bank/:id/edit', name: 'Bank Edit', element: Create },
    { path: '/bank/:id/detail', name: 'Bank Detail', element: detail },
    { path: '/bank/:id/calculation', name: 'Bank Calculation', element:calculation },

]

export default routes