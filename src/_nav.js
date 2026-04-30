import {
  cilAvTimer,
  cilBookmark,
  cilBuilding,
  cilClone,
  cilFilter,
  cilHome,
  cilLan,
  cilLibraryAdd,
  cilLocationPin,
  cilPin,
  cilSettings,
  cilSpeedometer,
  cilUserPlus,
  cilUser,
  cilClock,
  cilCalendar,
  cilChartLine,
  cilFile,
  cilMoney,
} from '@coreui/icons'
import { useSelector } from 'react-redux'
let ADMIN = process.env.REACT_APP_ADMIN
let COO = process.env.REACT_APP_COO
let FE = process.env.REACT_APP_FE
let SDM = process.env.REACT_APP_SDM
let RA = process.env.REACT_APP_RA
let DM = process.env.REACT_APP_DM
let RC = process.env.REACT_APP_RC
let LCTO = process.env.REACT_APP_LCTO
let CTO = process.env.REACT_APP_CTO
let SFO = process.env.REACT_APP_SFO
let AC = process.env.REACT_APP_AC
let BROKER = process.env.REACT_APP_BROKER
let HR = process.env.REACT_APP_HR

import CIcon from '@coreui/icons-react'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

import store from './store' // <-- change './store' to actual relative path if necessary
import Cookies from 'js-cookie'

const syncGet = (url) => {
  try {
    const xhr = new window.XMLHttpRequest()
    xhr.open('GET', url, false) // synchronous
    xhr.setRequestHeader('Content-Type', 'application/json')
    const token = Cookies.get(`${process.env.REACT_APP_COOKIE_PREFIX}_auth`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(null)
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        return JSON.parse(xhr.responseText)
      } catch (e) {
        return null
      }
    }
  } catch (e) {
    // ignore errors
  }
  return null
}

// Read current core value from API (fallback false)
const coreValue = (() => {
  try {
    const base = (process.env.REACT_APP_NODE_URL || '') + '/api/'
    const userId = store.getState()?.profileData?._id || Cookies.get('primery_user_id')

    // Prefer user-specific profile endpoint (stable). Listing endpoint can return arrays.
    let resp = userId ? syncGet(base + `profiles/${userId}`) : null
    if (!resp) resp = syncGet(base + 'profiles')

    // Parse core value from possible response shapes (object / axios {data} / array)
    let core = false
    if (resp) {
      const data = resp.data ?? resp
      const obj = Array.isArray(data)
        ? userId
          ? data.find((p) => String(p?._id) === String(userId))
          : data[0]
        : data
      core = obj?.core ?? obj?.employment?.core ?? obj?.user?.core ?? false
    }

    return core === true || String(core) === 'true'
  } catch (e) {
    return false
  }
})()

let _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    meta: {
      role: [COO, FE, SDM, DM, RA, RC, LCTO, CTO, ADMIN, SFO, AC, BROKER, HR],
    },
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Publish Offer',
    to: '/offers/publish',
    meta: {
      role: [ADMIN, HR],
    },
    icon: <CIcon icon={cilLibraryAdd} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Super Dashboard',
    to: '/super-dashboard',
    meta: {
      role: [LCTO, CTO],
    },
    icon: <CIcon icon={cilAvTimer} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Initiated',
    to: '/case/initated',
    meta: {
      role: [RC],
    },
    icon: <CIcon icon={cilFilter} customClassName="nav-icon" />,
  },

  {
    component: CNavGroup,
    name: 'Cases ',
    to: '',
    meta: {
      role: [
        'chief-operating-officercoo',
        'field-engineer-fe',
        'sdm-work-allotter',
        RA,
        DM,
        RC,
        LCTO,
        CTO,
        ADMIN,
        SFO,
        HR,
      ],
    },

    icon: <CIcon icon={cilClone} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        // name: 'All Cases (SAP)',
        name: 'Self Assign (SAP)',
        to: '/case/rach/all',
        meta: {
          role: [DM, ADMIN],
        },
      },

      // COO

      {
        component: CNavItem,
        name: 'My All Cases',
        to: '/case/all',
        meta: {
          role: [COO, FE, SDM, RA, DM, RC, LCTO, CTO, ADMIN, SFO],
        },
      },

      {
        component: CNavItem,
        name: 'Pending Accept',
        to: '/case/mypendingcase',
        meta: { role: [FE] },
        // icon: <CIcon icon={cilAvTimer} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'My Pending Tie-Up',
        to: '/case/role-pending/my-pending-tied-up',
        meta: { role: [FE] },
        // icon: <CIcon icon={cilAvTimer} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Pending Tie-Up',
        to: '/case/role-pending/ra_pending_tie_up',
        meta: { role: [RA, SFO] },
        // icon: <CIcon icon={cilAvTimer} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Pending Accept',
        to: '/case/ra_pendingcase',
        meta: { role: [RA, SFO] },
        // icon: <CIcon icon={cilAvTimer} customClassName="nav-icon" />,
      },

      {
        component: CNavItem,
        name: 'My Pending Visit',
        to: '/case/pending/visit',
        meta: { role: [FE] },
        // icon: <CIcon icon={cilAvTimer} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Pending Visit',
        to: '/case/pending/ra_pending_visit',
        meta: { role: [RA, SFO] },
        // icon: <CIcon icon={cilAvTimer} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Completed Visits',
        to: '/case/role-completes/my-completed-visits',
        meta: { role: [RA, SFO] },
      },
      {
        component: CNavItem,
        name: 'Over T.A.T',
        to: '/case/overtate',
        meta: { role: [RA, SFO] },
      },
      {
        component: CNavItem,
        name: 'Live Cases',
        to: '/case/live',
        meta: {
          role: [COO, ADMIN],
        },
      },
      {
        component: CNavItem,
        name: 'Hold Cases',
        to: '/case/hold',
        meta: {
          role: [COO, ADMIN],
        },
      },
      {
        component: CNavItem,
        name: 'Create Cases',
        to: '/case/create',
        meta: { role: [COO, ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Bulk Upload Cases',
        to: '/case/bulk-upload',
        meta: { role: [COO, ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Trash Cases',
        to: '/case/trash',
        meta: { role: [ADMIN, COO] },
      },

      //FOR PENDING...
      {
        component: CNavItem,
        name: 'Assign pending',
        to: '/case/role-pending/assigned-pending',
        meta: { role: [SDM] },
      },
      {
        component: CNavItem,
        name: 'My Draft Pending',
        to: '/case/role-pending/my-draft-pending',
        meta: { role: [DM] },
      },
      {
        component: CNavItem,
        name: 'RC Pending',
        to: '/case/role-pending/rc-pending',
        meta: { role: [RC] },
      },
      {
        component: CNavItem,
        name: 'Send Back DM',
        to: '/case/role-send-back/dm-send-back',
        meta: { role: [RC, LCTO, CTO] },
      },
      {
        component: CNavItem,
        name: 'S.V. Pending',
        to: '/case/role-pending/sv-pending',
        meta: { role: [LCTO, CTO] },
      },

      //FOR COMPLTETES
      {
        component: CNavItem,
        name: 'My Completed Visits',
        to: '/case/role-completes/my-completed-visits',
        meta: { role: [FE] },
      },
      {
        component: CNavItem,
        name: 'Assign Done',
        to: '/case/role-completes/assigned-done',
        meta: { role: [SDM] },
      },
      {
        component: CNavItem,
        name: 'My Draft Done',
        to: '/case/role-completes/my-draft-done',
        meta: { role: [DM] },
      },
      {
        component: CNavItem,
        name: 'RC Done',
        to: '/case/role-completes/rc-done',
        meta: { role: [RC] },
      },
      {
        component: CNavItem,
        name: 'Re-Assign to FE',
        to: '/case/re-assign/fe-by-bm',
        meta: {
          role: [RA],
        },
      },
      {
        component: CNavItem,
        name: 'Over T.A.T',
        to: '/case/overtate',
        meta: {
          role: [COO, FE, SDM, DM, RC, ADMIN, LCTO, CTO],
        },
      },
      {
        component: CNavItem,
        name: 'Re-Assign to FE',
        to: '/case/re-assign/fe',
        meta: {
          role: [''],
        },
      },
      {
        component: CNavItem,
        name: 'Re-Assign to DM',
        to: '/case/re-assign/dm',
        meta: {
          role: [SDM],
        },
      },
      {
        component: CNavItem,
        name: 'S.V. Done',
        to: '/case/role-completes/sv-done',
        meta: { role: [LCTO, CTO] },
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Product Name',
    to: '',
    meta: { role: [AC] },
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'HL',
        to: '/account/hl',
        meta: { role: [AC] },
      },
      {
        component: CNavItem,
        name: 'LAP',
        to: '/account/lap',
        meta: { role: [AC] },
      },
      {
        component: CNavItem,
        name: 'NPA',
        to: '/account/npa',
        meta: { role: [AC] },
      },
      {
        component: CNavItem,
        name: 'APF',
        to: '/account/apf',
        meta: { role: [AC] },
      },
      {
        component: CNavItem,
        name: 'Estimate',
        to: '/account/estimate',
        meta: { role: [AC] },
      },
      {
        component: CNavItem,
        name: 'Other',
        to: '/account/other',
        meta: { role: [AC] },
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Acknowledged',
    to: '/account/acknowledged',
    meta: {
      role: [AC],
    },
    icon: <CIcon icon={cilClone} customClassName="nav-icon" />,
  },

  {
    component: CNavGroup,
    name: 'RA Branch',
    to: '',
    meta: { role: [ADMIN] },
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All RA Branch',
        to: '/rabranch/all',
        meta: { role: [ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Create RA Branch',
        to: '/rabranch/create',
        meta: { role: [ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Trash RA Branch',
        to: '/rabranch/trash',
        meta: { role: [ADMIN] },
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Finance',
    to: '',
    meta: { role: [ADMIN, COO, AC] },
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Finance',
        to: '/bank/all',
        meta: {
          role: [ADMIN, CTO, COO, AC],
        },
      },
      {
        component: CNavItem,
        name: 'Create Finance',
        to: '/bank/create',
        meta: {
          role: [ADMIN, COO, AC],
        },
      },
      {
        component: CNavItem,
        name: 'Trash Finance',
        to: '/bank/trash',
        meta: { role: [ADMIN, COO, AC] },
      },
    ],
  },
  // {
  //   component: CNavGroup,
  //   name: 'MIS',
  //   to: '',
  //   meta: { role: [ADMIN, COO, FE, RA, SFO, SDM, DM, RC, LCTO, CTO, AC] },
  //   icon: <CIcon icon={cilLibraryAdd} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Generate MIS Report',
  //       to: '/case/genrate-msi',
  //       meta: { role: [ADMIN, COO, FE, RA, SFO, SDM, DM, RC, LCTO, CTO, AC] },
  //     },
  //   ],
  // },
  {
    component: CNavGroup,
    name: 'MAP',
    to: '',
    meta: { role: [], universalAccess: true }, // Empty roles = accessible to all
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Google Pins',
        to: '/case/map',
        meta: { role: [], universalAccess: true },
      },
      {
        component: CNavItem,
        name: 'All Google Pins (FE/Broker)',
        to: '/property/map',
        meta: { role: [], universalAccess: true },
      },
    ],
  },

  {
    component: CNavGroup,
    name: 'FORCE PIN',
    to: '',
    meta: { role: [], universalAccess: true }, // Empty roles = accessible to all
    icon: <CIcon icon={cilPin} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Force Pins',
        to: '/property/all',
        meta: { role: [], universalAccess: true },
      },
      {
        component: CNavItem,
        name: 'For Sale',
        to: '/property/for-sale',
        meta: { role: [], universalAccess: true },
      },
      {
        component: CNavItem,
        name: 'Sold',
        to: '/property/sold',
        meta: { role: [], universalAccess: true },
      },
      {
        component: CNavItem,
        name: 'Broker',
        to: '/property/broker',
        meta: { role: [], universalAccess: true },
      },
    ],
  },

  {
    component: CNavGroup,
    name: 'Report',
    to: '',
    meta: { role: [ADMIN, COO, FE, RA, HR, SFO, SDM, DM, RC, LCTO, CTO, AC] },
    icon: <CIcon icon={cilBookmark} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Monthly Report',
        to: '/case/monthly-report',
        meta: { role: [ADMIN, COO, LCTO, CTO, HR] },
      },
      {
        component: CNavItem,
        name: 'PMR Report',
        to: '/case/pmr-report',
        meta: { role: [ADMIN, HR] },
      },
      {
        component: CNavItem,
        name: 'Generate MIS Report',
        to: '/case/genrate-msi',
        meta: { role: [ADMIN, COO, FE, RA, SFO, SDM, DM, RC, LCTO, CTO, AC] },
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'CONFIGURATION',
    meta: { role: [ADMIN] },
  },
  {
    component: CNavGroup,
    name: 'Master',
    to: '/cms/master',
    meta: { role: [ADMIN] },
    icon: <CIcon icon={cilLan} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Categories',
        to: '/master/category',
        meta: { role: [ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Region',
        to: '/master/regions',
        meta: { role: [] },
      },
      {
        component: CNavItem,
        name: 'Templates',
        to: '/master/templates',
        meta: { role: [ADMIN] },
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Users',
    meta: { role: [ADMIN, COO] },
  },
  {
    component: CNavGroup,
    name: 'Admins',
    to: '/admins',
    meta: { role: [ADMIN, LCTO] },
    icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Users',
        to: '/admins/all',
        meta: { role: [ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Add User',
        to: '/admin/create',
        meta: { role: [ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Trash Users',
        to: '/admins/trash',
        meta: { role: [ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Permissions',
        to: '/admin/permission/create',
        meta: { role: [] },
      },
      {
        component: CNavItem,
        name: 'Roles',
        to: '/admin/role/create',
        meta: { role: [ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Companies',
        to: '/admin/company/create',
        meta: { role: [ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Login Activity',
        to: '/admin/login-activity',
        meta: { role: [ADMIN, LCTO] },
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Module Builder',
    meta: { role: [] },
  },

  // {
  //   component: CNavGroup,
  //   name: 'Case Builder',
  //   to: '',
  //   meta: { role: ['sdm-work-allotter'] },
  //   icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'All Case Builder',
  //       to: '/builder/case/all',
  //       meta: { role: ['sdm-work-allotter'] },
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Create Case Builder',
  //       to: '/builder/case/create',
  //       meta: { role: ['sdm-work-allotter'] },
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Trash Case Builder',
  //       to: '/builder/case/trash',
  //       meta: { role: ['sdm-work-allotter'] },
  //     },
  //   ],
  // },

  // {
  //   component: CNavTitle,
  //   name: 'Login Activity',
  //   meta: { role: [ADMIN , FE] },
  // },

  {
    component: CNavGroup,
    name: 'HRMS',
    to: '/hrms',
    meta: { role: [], universalAccess: true }, // Empty roles = accessible to all
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/hrms',
        meta: { role: [], universalAccess: true },
      },
      {
        component: CNavItem,
        name: 'My Profile',
        to: '/hrms/profile',
        meta: { role: [], universalAccess: true },
      },
      {
        component: CNavItem,
        name: 'Attendance',
        to: '/hrms/attendance',
        meta: { role: [], universalAccess: true },
      },
      // {
      //   component: CNavItem,
      //   name: 'Staff On Leave',
      //   to: '/hrms/staff/staffOnLeave/',
      //   meta: { role: [], universalAccess: true },
      // },
      {
        component: CNavItem,
        name: 'My Leave',
        to: '/hrms/leave/employee',
        meta: { role: [], universalAccess: true },
      },
      {
        component: CNavItem,
        name: 'Addon',
        to: '/hrms/addon/useraddonList',
        meta: { role: [], universalAccess: true },
      },
      {
        component: CNavItem,
        name: 'Penalty',
        to: '/hrms/penalty/userPenaltylist',
        meta: { role: [], universalAccess: true },
      },
      {
        component: CNavItem,
        name: 'Teams Approvals',
        to: '/hrms/authority/leave/',
        meta: { role: [FE, RA, SDM, COO, DM, RC, SFO, HR, ADMIN, LCTO, AC] },
      },
      // {
      //   component: CNavItem,
      //   name: 'Muster Roll Report',
      //   to: '/hrms/muster-roll',
      //   meta: { role: [HR, ADMIN] },
      //   // icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      // },
      // {
      //   component: CNavGroup,
      //   name: 'Staff',
      //   // to: '/hrms/staff',
      //   meta: { role: [HR, ADMIN, AC] },
      //   items: [
      //     {
      //       component: CNavItem,
      //       name: 'All Staff',
      //       to: '/hrms/staff/all',
      //       meta: { role: [HR, ADMIN, AC] },
      //     },
      //     // {
      //     //   component: CNavItem,
      //     //   name: 'staff Profile',
      //     //   to: '/hrms/staff/profile/',
      //     //   meta: { role: [HR, ADMIN, AC] },
      //     // },
      //     // {
      //     //   component: CNavItem,
      //     //   name: 'Unapproved Attendance',
      //     //   to: '/hrms/unapproved/attendance',
      //     //   meta: { role: [HR, ADMIN] },
      //     // },
      //     // {
      //     //   component: CNavItem,
      //     //   name: 'Leave Acknowledgment',
      //     //   to: '/hrms/leave/penelty',
      //     //   meta: { role: [HR, ADMIN] },
      //     // },
      //     {
      //       component: CNavItem,
      //       name: 'Attendance Settings',
      //       to: '/hrms/attendance/settings',
      //       meta: { role: [HR, ADMIN] },
      //     },
      //     // {
      //     //   component: CNavItem,
      //     //   name: 'Staff Attendance',
      //     //   to: '/',
      //     //   meta: { role: [HR, ADMIN] },
      //     // },

      //     {
      //       component: CNavItem,
      //       name: 'staff Leave',
      //       to: '/hrms/staff/leave/',
      //       meta: { role: [HR, ADMIN] },
      //     },

      //     {
      //       component: CNavItem,
      //       name: 'staff Monthly Leave Summary',
      //       to: '/hrms/staff/monthly-leave-summary/',
      //       meta: { role: [HR, ADMIN] },
      //     },
      //     {
      //       component: CNavItem,
      //       name: 'staff Muster Roll Report',
      //       to: '/hrms/staff/muster-roll/',
      //       meta: { role: [HR, ADMIN] },
      //       // icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      //     },
      //     {
      //       component: CNavGroup,
      //       name: 'Unapproved',
      //       meta: { role: [HR, ADMIN, AC] },
      //       items: [
      //         {
      //           component: CNavItem,
      //           name: 'Punch',
      //           to: '/hrms/unapproved/attendance',
      //           meta: { role: [HR, ADMIN] },
      //         },
      //         {
      //           component: CNavItem,
      //           name: 'Leave',
      //           to: '/hrms/leave/penelty',
      //           meta: { role: [HR, ADMIN] },
      //         },
      //       ],
      //     },
      //   ],
      // },

      // {
      //   component: CNavItem,
      //   name: 'Leave Management - Approver',
      //   to: '/hrms/leave/approver',
      //   meta: { role: [HR, ADMIN,RC,LCTO,CTO,SFO,RA] },
      // },
      // {
      //   component: CNavItem,
      //   name: 'Leave Management - Admin',
      //   to: '/hrms/leave/admin',
      //   meta: { role: [ADMIN,HR] },
      // },
    ],
  },

  ...(coreValue
    ? [
        {
          component: CNavGroup,
          name: 'Leave Updates',
          to: '/hrms',
          meta: { role: [], universalAccess: true },
          icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Staff On Leave',
              to: '/hrms/staff/staffOnLeave/',
              meta: { role: [], universalAccess: true },
            },
            {
              component: CNavItem,
              name: 'Pending Punches',
              to: '/hrms/unapproved/pending-punches',
              meta: { role: [HR, ADMIN] },
            },
          ],
        },
      ]
    : []),

  {
    component: CNavGroup,
    name: 'Staff',
    // to: '/hrms/staff',
    meta: { role: [HR, ADMIN, AC] },
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,

    items: [
      {
        component: CNavItem,
        name: 'All Staff',
        to: '/hrms/staff/all',
        meta: { role: [HR, ADMIN, AC] },
      },
      // {
      //   component: CNavItem,
      //   name: 'staff Profile',
      //   to: '/hrms/staff/profile/',
      //   meta: { role: [HR, ADMIN, AC] },
      // },
      // {
      //   component: CNavItem,
      //   name: 'Unapproved Attendance',
      //   to: '/hrms/unapproved/attendance',
      //   meta: { role: [HR, ADMIN] },
      // },
      // {
      //   component: CNavItem,
      //   name: 'Leave Acknowledgment',
      //   to: '/hrms/leave/penelty',
      //   meta: { role: [HR, ADMIN] },
      // },
      {
        component: CNavItem,
        name: 'PayCycle',
        to: '/hrms/attendance/settings',
        meta: { role: [HR, ADMIN] },
      },
      // {
      //   component: CNavItem,
      //   name: 'Staff Attendance',
      //   to: '/hrms/staff/attendance/',
      //   meta: { role: [HR, ADMIN] },
      // },

      {
        component: CNavItem,
        name: 'Staff Leave',
        to: '/hrms/staff/leave/',
        meta: { role: [HR, ADMIN] },
      },

      {
        component: CNavItem,
        name: 'Monthly Leave Summary',
        to: '/hrms/staff/monthly-leave-summary/',
        meta: { role: [HR, ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Muster Roll Report',
        to: '/hrms/staff/muster-roll/',
        meta: { role: [HR, ADMIN] },
        // icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Holiday Pannel',
        to: '/hrms/staff/Holiday',
        meta: { role: [HR, ADMIN] },
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Unapproved',
    meta: { role: [HR, ADMIN] },
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Punch',
        to: '/hrms/unapproved/attendance',
        meta: { role: [HR, ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Leave Acknow',
        to: '/hrms/leave/penelty',
        meta: { role: [HR, ADMIN] },
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Add-Goes',
    meta: { role: [HR, ADMIN] },
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Addon',
        to: '/hrms/addon/addonList',
        meta: { role: [], universalAccess: true },
      },
      {
        component: CNavItem,
        name: 'Penalty',
        to: '/hrms/penalty/penaltyList',
        meta: { role: [], universalAccess: true },
      },
    ],
  },

  {
    component: CNavGroup,
    name: 'Celebration',
    to: '',
    meta: { role: [], universalAccess: true },
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavGroup,
        name: 'Birthday',
        to: '',
        meta: { role: [], universalAccess: true },
        items: [
          {
            component: CNavItem,
            name: "Today's Birthday",
            to: '/celebration/birthday/today',
            meta: { role: [], universalAccess: true },
          },
          {
            component: CNavItem,
            name: 'Upcoming Birthday',
            to: '/celebration/birthday/upcoming',
            meta: { role: [], universalAccess: true },
          },
        ],
      },

      {
        component: CNavGroup,
        name: 'Work Anniversary',
        to: '',
        meta: { role: [], universalAccess: true },
        items: [
          {
            component: CNavItem,
            name: "Today's Work Anniversary",
            to: '/celebration/work-anniversary/today',
            meta: { role: [], universalAccess: true },
          },
          {
            component: CNavItem,
            name: 'Upcoming Work Anniversary',
            to: '/celebration/work-anniversary/upcoming',
            meta: { role: [], universalAccess: true },
          },
        ],
      },

      {
        component: CNavGroup,
        name: 'Marriage Anniversary',
        to: '',
        meta: { role: [], universalAccess: true },
        items: [
          {
            component: CNavItem,
            name: "Today's Marriage Anniversary",
            to: '/celebration/marriage-anniversary/today',
            meta: { role: [], universalAccess: true },
          },
          {
            component: CNavItem,
            name: 'Upcoming Marriage Anniversary',
            to: '/celebration/marriage-anniversary/upcoming',
            meta: { role: [], universalAccess: true },
          },
        ],
      },
    ],
  },

  // {
  //   component: CNavGroup,
  //   name: 'Staff',
  //   to: '/hrms',
  //   icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  //   meta: { role: [AC] },
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'All Staff',
  //       to: '/hrms/staff/all',
  //       meta: { role: [AC] },
  //     },
  //   ],
  // },

  {
    component: CNavGroup,
    name: 'Login Activity',
    to: '/login-activity',
    meta: { role: [FE, RA, SDM, COO, DM, RC, SFO] },

    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Activity',
        to: '/login-activity/all',
        meta: { role: [FE, RA, SDM, COO, DM, RC, SFO] },
      },
    ],
  },

  {
    component: CNavTitle,
    name: 'Settings',
    meta: { role: [ADMIN] },
  },
  {
    component: CNavGroup,
    name: 'Setting',
    to: '/setting',
    meta: { role: [ADMIN] },

    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'All Settings',
        to: '/settings/all',
        meta: { role: [ADMIN] },
      },
    ],
  },
]

export default _nav
