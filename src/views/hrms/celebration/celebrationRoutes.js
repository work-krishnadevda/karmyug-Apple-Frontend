import React from 'react'

// lazy import each page component (keeps bundle small)
const BirthdayToday = React.lazy(() => import('./BirthdayToday'))
const BirthdayUpcoming = React.lazy(() => import('./BirthdayUpcoming'))

const WorkAnniversaryToday = React.lazy(() => import('./WorkAnniversaryToday'))
const WorkAnniversaryUpcoming = React.lazy(() => import('./WorkAnniversaryUpcoming'))

const MarriageAnniversaryToday = React.lazy(() => import('./MarriageAnniversaryToday'))
const MarriageAnniversaryUpcoming = React.lazy(() => import('./MarriageAnniversaryUpcoming'))

export const celebrationRoutes = [
  { path: '/celebration/birthday/today', name: 'Birthday - Today', element: BirthdayToday },
  { path: '/celebration/birthday/upcoming', name: 'Birthday - Upcoming', element: BirthdayUpcoming },

  { path: '/celebration/work-anniversary/today', name: 'Work Anni - Today', element: WorkAnniversaryToday },
  { path: '/celebration/work-anniversary/upcoming', name: 'Work Anni - Upcoming', element: WorkAnniversaryUpcoming },

  { path: '/celebration/marriage-anniversary/today', name: 'Marriage Anni - Today', element: MarriageAnniversaryToday },
  { path: '/celebration/marriage-anniversary/upcoming', name: 'Marriage Anni - Upcoming', element: MarriageAnniversaryUpcoming },
]
