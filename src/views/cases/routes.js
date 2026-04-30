import React from 'react'
import FE_PENDING_VISIT_PAGE from './fe_pending_visit'
import RA_PENDING_VISIT_PAGE from './ra_pending_visit'
const Create = React.lazy(() => import('./create'))
const All = React.lazy(() => import('./all'))
const Trash = React.lazy(() => import('./trash'))
const Show = React.lazy(() => import('./show'))
const Pending = React.lazy(() => import('./fe_pendings'))
const RAPending = React.lazy(() => import('./ra_pending_accept'))

const Activity = React.lazy(() => import('./activity'))
const AllLogs = React.lazy(() => import('./allogs'))
const FEAllFiles = React.lazy(() => import('./showFiles/feShowFiles'))
const SDMAllFiles = React.lazy(() => import('./showFiles/sdmShowFiles'))
const CommonUpdate = React.lazy(() => import('./CommonUpdate/commonUpdate'))
const CaseAddons = React.lazy(() => import('./caseaddons'))
const CaseCalculation = React.lazy(() => import('./case_calculation'))
const My_Pendings = React.lazy(() => import('./my_pendings'))
const DM_SendBack = React.lazy(() => import('../cases/dm_sendBack'))
const My_Completed = React.lazy(() => import('./my_completed'))
const Live = React.lazy(() => import('./live'))
const Hold = React.lazy(() => import('./hold'))
const OverTate = React.lazy(() => import('./overtate'))
const AllRACH = React.lazy(() => import('./all_rach'))
const Concern = React.lazy(() => import('./concern'))
const cooAttechement = React.lazy(() => import('./coo_attechment'))

const Genrate_MSI = React.lazy(() => import('./genrate_MSI'))
const MAP = React.lazy(() => import('./map'))

const ReassignToAnotherDM = React.lazy(() => import('./reasignToAnotherDm'))
const ReassignToAnotherFE = React.lazy(() => import('./reasignToAnotherFE'))
const ReassignToAnotherFEByBM = React.lazy(() => import('./reasignToAnotherFEBY-BM'))

const BulkUpload = React.lazy(() => import('./bulkUpload'))
const Log = React.lazy(() => import('./log'))

const Initiated = React.lazy(() => import('./initated'))

const Account = React.lazy(() => import('./accounts'))

const MonthlyReport = React.lazy(() => import('./monthly-report'))
const PMRReport = React.lazy(() => import('./pmr-report'))

const routes = [
  // Noramal Routes hai **
  { path: '/case/create', name: 'case Create', element: Create },
  { path: '/case/:id/edit', name: 'case Create', element: Create },
  { path: '/case/all', name: 'case All', element: All },
  { path: '/case/trash', name: 'case Trash', element: Trash },
  { path: '/case/:id/show', name: 'case Show', element: Show },
  { path: '/case/mypendingcase', name: 'case Pending', element: Pending },
  { path: '/case/ra_pendingcase', name: 'case Pending', element: RAPending },
  { path: '/case/activity', name: 'case Activity', element: Activity },
  { path: '/case/allogs', name: 'case Logs', element: AllLogs },
  { path: '/case/fe/:id/all-files', name: 'FE Files', element: FEAllFiles },
  { path: '/case/sdm/:id/all-files', name: 'SDM Files', element: SDMAllFiles },
  { path: '/case/pending/visit', name: 'Fe', element: FE_PENDING_VISIT_PAGE },
  { path: '/case/pending/ra_pending_visit', name: 'RA', element: RA_PENDING_VISIT_PAGE },

  // Daynamic roures for case update

  { path: '/case/:id/update/:form/by/:role', name: 'case Create', element: CommonUpdate },

  { path: '/case/:id/:type/by/:role', name: 'Show', element: Create },

  { path: '/case/:id/case-addons', name: 'case Addons', element: CaseAddons },

  { path: '/case/:id/case-calculation', name: 'Case Calculation', element: CaseCalculation },

  // Additoinal routes

  { path: '/case/role-pending/:status', name: 'Pendings', element: My_Pendings },
  { path: '/case/role-send-back/:status', name: 'SendBack', element: DM_SendBack },

  { path: '/case/role-completes/:status', name: 'Pendings', element: My_Completed },

  { path: '/case/live', name: 'case All', element: Live },
  { path: '/case/hold', name: 'case All', element: Hold },
  { path: '/case/overtate', name: 'case All', element: OverTate },
  { path: '/case/rach/all', name: 'case All', element: AllRACH },
  { path: '/case/all/concern', name: 'case All', element: Concern },
  { path: '/case/:id/attachment', name: 'case Show', element: cooAttechement },
  { path: '/case/genrate-msi', name: 'MSI Genrate', element: Genrate_MSI },
  { path: '/case/map', name: 'MAP', element: MAP },
  { path: '/case/re-assign/dm', name: 'Re-assign', element: ReassignToAnotherDM },
  { path: '/case/re-assign/fe', name: 'Re-assign', element: ReassignToAnotherFE },
  { path: '/case/re-assign/fe-by-bm', name: 'Re-assign', element: ReassignToAnotherFEByBM },
  { path: '/case/bulk-upload', name: 'MAP', element: BulkUpload },
  { path: '/case/:id/logs', name: 'MAP', element: Log },
  { path: '/account/:slug', name: 'Account', element: Account },
  { path: '/case/initated', name: 'Initiated', element: Initiated },
  { path: '/case/monthly-report', name: 'Monthly Report', element: MonthlyReport },
  { path: '/case/pmr-report', name: 'PMR Report', element: PMRReport },
]

export default routes
