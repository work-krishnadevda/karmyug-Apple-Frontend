import CIcon from '@coreui/icons-react'
import { CNavItem, CNavGroup } from '@coreui/react'
import { cilUser, cilFile } from '@coreui/icons'

let ADMIN = process.env.REACT_APP_ADMIN
let COO = process.env.REACT_APP_COO
let FE = process.env.REACT_APP_FE
let SDM = process.env.REACT_APP_SDM
let RA = process.env.REACT_APP_RA
let DM = process.env.REACT_APP_DM
let RC = process.env.REACT_APP_RC
let SFO = process.env.REACT_APP_SFO
let HR = process.env.REACT_APP_HR

const _hrmsNav = [
  {
    component: CNavGroup,
    name: 'HRMS',
    to: '/hrms',
    meta: { role: [FE, RA, SDM, COO, DM, RC, SFO, HR, ADMIN] },
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/hrms',
        meta: { role: [FE, RA, SDM, COO, DM, RC, SFO, HR, ADMIN] },
      },
      {
        component: CNavItem,
        name: 'My Profile',
        to: '/hrms/profile',
        meta: { role: [FE, RA, SDM, COO, DM, RC, SFO, HR, ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Attendance',
        to: '/hrms/attendance',
        meta: { role: [FE, RA, SDM, COO, DM, RC, SFO, HR, ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Staff',
        to: '/hrms/staff',
        meta: { role: [HR, ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Leave',
        to: '/hrms/leave/employee',
        meta: { role: [FE, RA, SDM, COO, DM, RC, SFO, HR, ADMIN] },
      },
      {
        component: CNavItem,
        name: 'Muster Roll Report',
        to: '/hrms/muster-roll',
        meta: { role: [HR, ADMIN] },
        icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
      },
    ],
  },
]

export default _hrmsNav
