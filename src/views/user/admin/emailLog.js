import { useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import 'react-datepicker/dist/react-datepicker.css'
import { useNavigate, useParams } from 'react-router-dom'
import { CCard, CCardBody, CCardHeader, CCol, CContainer, CForm, CRow } from '@coreui/react'
import HelperFunction from '../../../helpers/HelperFunctions'

export default function emailLog() {
  const { id } = useParams() // Get the userId from the URL
  const navigate = useNavigate() // Get the navigation function
  const [data, setData] = useState(null)

  const fetchUserInfo = async () => {
    try {
      const response = await HelperFunction.getData(`customers/show/${id}`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching user information:', error)
    }
  }
  useEffect(() => {
    fetchUserInfo()
  }, [])

  const columns = [
    {
      name: 'Subject',
      selector: (row) => row.Subject,
      sortable: true,
    },
    {
      name: 'Form',
      selector: (row) => row.Form,
      sortable: true,
    },
    {
      name: 'Created',
      selector: (row) => row.Created,
      sortable: true,
    },
    {
      name: 'Action',
      selector: (row) => row.Action,
      sortable: true,
    },
  ]

  const newdata = [
    {
      id: 1,
      Subject: 'No data available in table',
      Form: '',
      Created: '',
      Action: '',
    },
  ]

  const customStyles = {
    headCells: {
      style: {
        border: '1px solid #ccc', // Add border to header cells only
      },
    },

    rows: {
      style: {
        borderBottom: '1px solid #ccc', // Add  border Bottom to all rows
        borderLeft: '1px solid #ccc', // Add border Left to all rows
        borderRight: '1px solid #ccc', // Add border Right to all rows
      },
    },
  }

  return (
    <>
      <CCard className="mb-4 emailLog">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          Email Log
        </CCardHeader>
        <CCardBody>
          <DataTable
            columns={columns}
            data={newdata}
            customStyles={customStyles}
            paginationServer
            // paginationTotalRows={totalRows}
            pagination
            selectableRowsHighlight
            highlightOnHover
          />
        </CCardBody>
      </CCard>
    </>
  )
}
