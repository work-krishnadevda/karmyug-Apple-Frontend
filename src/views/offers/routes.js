import React from 'react'

const PublishOfferPage = React.lazy(() => import('./PublishOfferPage'))

const routes = [
  { path: '/offers/publish', name: 'Publish Offer', element: PublishOfferPage },
]

export default routes
