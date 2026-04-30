import React from 'react'

const AnnouncementManagement = React.lazy(() => import('./AnnouncementManagement'))

const routes = [
  { path: '/announcement', name: 'Announcements', element: AnnouncementManagement }
]

export default routes
