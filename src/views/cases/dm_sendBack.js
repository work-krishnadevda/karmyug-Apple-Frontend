import { useSelector } from 'react-redux'

import { checkRole } from 'src/constants/common'

import Dm_SendBack from 'src/components/custom/department/roles/rc/dm_sendBack'

export default function DM_SendBack() {
  const admin = useSelector((state) => state.userData)

  let isRC = checkRole(process.env.REACT_APP_RC, admin)
  let isLCTO = checkRole(process.env.REACT_APP_LCTO, admin)
  let isCTO = checkRole(process.env.REACT_APP_CTO, admin)

  return (
    <>
      {isRC && <Dm_SendBack />}
      {isLCTO && <Dm_SendBack />}
      {isCTO && <Dm_SendBack />}
    </>
  )
}
