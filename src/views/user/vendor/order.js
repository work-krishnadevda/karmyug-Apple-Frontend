import { CCol } from '@coreui/react'
import moment from 'moment'
import { useState } from 'react'
import DataTable from 'react-data-table-component'
import { useParams } from 'react-router-dom'
import BasicProvider from 'src/constants/BasicProvider'
import { RowsPerPage } from 'src/constants/variables'
export default function orders() {
  var { id } = useParams()
  const [data, setData] = useState(null)

  const fetchUserInfo = async () => {
    try {
      const response = await new BasicProvider(`customer/show/${id}`).getRequest()
      setData(response.data)
    } catch (error) {
      console.error('Error fetching Shop information:', error)
    }
  }
  //   useEffect(() => {
  //     fetchUserInfo()
  //   }, [])
  const columns = [
    {
      name: 'Name',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title user_details d-flex align-items-center"
          onClick={() => navigate(`/orders/orderdetails/${row._id}`)}
        >
          <div>
            <div className="user_name mb-1"> {row.name}</div>
          </div>
        </div>
      ),
    },

    {
      name: 'User',
      selector: (row) => <div className="data_table_colum">{row.user_id && row.user_id.name}</div>,
    },
    {
      name: 'Current Status',
      selector: (row) => <div className="data_table_colum">{row.current_status}</div>,
    },

    {
      name: 'Total',
      selector: (row) => (
        <div className="data_table_colum">{`${process.env.REACT_APP_DEFAULT_CURRENCY}${row.total}`}</div>
      ),
    },
    {
      name: 'Date',
      selector: (row) => <div className="data_table_colum">{moment(row.created_at).fromNow()}</div>,
    },
  ]

  const newdata = [
    {
      name: 'demo',
      message: 'No data available in table',
      total_balance: '',
      Created: null,
    },
  ]
  return (
    <div>
      <CCol>
        <div className="datatable">
          <DataTable
            responsive="true"
            columns={columns}
            data={newdata}
            paginationServer
            highlightOnHover
            pagination
            paginationRowsPerPageOptions={RowsPerPage}
          />
        </div>
      </CCol>
    </div>
  )
}
