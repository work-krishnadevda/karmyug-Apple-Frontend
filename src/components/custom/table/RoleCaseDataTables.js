import AdminDataTable from 'src/components/custom/department/roles/admin/admin_datatable'
import CooDataTable from 'src/components/custom/department/roles/coo/coodatatable'
import CTO_DataTable from 'src/components/custom/department/roles/cto/CTO_DataTable'
import DM_DataTable from 'src/components/custom/department/roles/dm/DM_DataTable'
import FeDataTable from 'src/components/custom/department/roles/fe/fedatatable'
import LCTO_DataTable from 'src/components/custom/department/roles/lcto/LCTO_DataTable'
import RA_DataTable from 'src/components/custom/department/roles/ra/RA_DataTable'
import RC_DataTable from 'src/components/custom/department/roles/rc/RC_DataTable'
import SdmDataTable from 'src/components/custom/department/roles/sdm/sdmdatatable'
import SFO_DataTable from 'src/components/custom/department/roles/sfo/SFO_DataTable'

export default function RoleCaseDataTables({
  isAdmin,
  isCOO,
  isFE,
  isSDM,
  isRA,
  isDM,
  isRC,
  isLCTO,
  isCTO,
  isSFO,
}) {
  return (
    <>
      {isCOO && <CooDataTable />}
      {isFE && <FeDataTable />}
      {isSDM && <SdmDataTable />}
      {isRA && <RA_DataTable />}
      {isDM && <DM_DataTable />}
      {isRC && <RC_DataTable />}
      {isLCTO && <LCTO_DataTable />}
      {isCTO && <CTO_DataTable />}
      {isAdmin && <AdminDataTable />}
      {isSFO && <SFO_DataTable />}
    </>
  )
}
