import { CButton, CCol, CContainer, CForm, CRow } from '@coreui/react'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { RowsPerPage } from 'src/constants/variables'
import HelperFunction from 'src/helpers/HelperFunctions'

export default function wallet() {
  var { id } = useParams()
  const dispatch = useDispatch()
  const [data, setData] = useState([])
  const [walletBalance, setWalletBalance] = useState(0)

  const fetchUserInfo = async () => {
    try {
      const response = await HelperFunction.getData(`shops/show/${id}`)
      setShops(response.data)
    } catch (error) {
      console.error('Error fetching user information:', error)
    }
  }
 
  const columns = [
    {
      name: 'Message',
      selector: (row) => (
        <div
          className="pointer_cursor data_Table_title user_details d-flex align-items-center"
          // onClick={() => navigate(`/cms/customers/${row._id}/Show`)}
        >
          <div>
            <div className="user_name mb-1"> {row.message}</div>
          </div>
        </div>
      ),
    },

    // {
    //   name: 'Credit/Debit',
    //   selector: (row) => (
    //     <div
    //       className={`data_table_column ${row.type == 'debit' ? 'text-danger' : 'text-success'}`}
    //     >
    //       {row.type == 'debit'
    //         ? ` -${process.env.REACT_APP_DEFAULT_CURRENCY}${row.amount}`
    //         : `+${process.env.REACT_APP_DEFAULT_CURRENCY}${row.amount}`}
    //     </div>
    //   ),
    //   center: true,
    // },

    {
      name: 'Total Balance',
      selector: (row) => (
        <div className="data_table_colum">{`${process.env.REACT_APP_DEFAULT_CURRENCY}${row.total_balance}`}</div>
      ),
      center: true,
    },
    {
      name: 'Created at',
      selector: (row) => <div className="data_table_colum">{moment(row.created_at).fromNow()}</div>,
    },
  ]
  
  const newdata = [
    {
      id: 1,
      message: 'No data available in table',
      total_balance: '',
      Created: null,
    },
  ]

  return (
              <CCol>
                <div className="text-end">
                  <CButton className="btn btn-warning me-2 mb-2 submit_btn">
                    Total Balance : {process.env.REACT_APP_DEFAULT_CURRENCY ?? '£'}
                    {walletBalance ?? 0}
                  </CButton>
                </div>
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
  )
}
