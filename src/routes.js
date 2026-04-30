import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const SuperDashboard = React.lazy(() => import('./views/dashboard/SuperDashboard'))

import Case from './views/cases/routes'
import Property from './views/property/routes'
import RabranchRoutes from './views/raBranch/routes'
import TemplateRoutes from './views/configuration/master/template/routes'
import Region from './views/configuration/master/region/routes'
import Admin from './views/user/admin/routes'
import Status from './views/configuration/master/status/routes'
import category from './views/configuration/master/categories/routes'
import caseBuilder from './views/builder/case/routes'
import Bank from './views/banks/routes'
import Settings from './views/settings/routes'
import LoginActivity from './views/login-activity/routes'
import HRMS from './views/hrms/routes'
import Announcements from './views/announcements/routes'
import Offers from './views/offers/routes'

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/super-dashboard', name: 'Dashboard', element: SuperDashboard },

  //MASTER ROUTES
  ...category,
  // ...Region,
  // ...Status,

  //USERS,
  ...Admin,
  ...Property,
  // OTHER
  ...Case,
  ...RabranchRoutes,
  ...TemplateRoutes,
  ...caseBuilder,
  ...Bank,

  //SETTINGS
  ...Settings,

  //HRMS
  ...HRMS,

  //LOGIN ACTIVITY
  ...LoginActivity,

  //ANNOUNCEMENTS
  ...Announcements,

  //OFFERS (Publish Offer - Admin/HR)
  ...Offers,
]

export default routes
