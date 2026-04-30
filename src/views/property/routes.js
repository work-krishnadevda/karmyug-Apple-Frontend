import { element } from 'prop-types'
import React from 'react'

const All = React.lazy(() => import('./all'))
const BROKER = React.lazy(() => import('./broker'))
const FORSALE = React.lazy(() => import('./for-sale'))
const SOLD = React.lazy(() => import('./sold'))
const PropertyMap = React.lazy(() => import('./property-map'))

const routes = [
    { path: '/property/all', name: 'Property All', element: All },
    { path: '/property/broker', name: 'Property Broker', element: BROKER },
    { path: '/property/for-sale', name: 'Property For-Sale', element: FORSALE },
    { path: '/property/sold', name: 'Property Sold', element: SOLD },
    { path: '/property/map', name: 'Force Pin Map', element: PropertyMap },
]

export default routes