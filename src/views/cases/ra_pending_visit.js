
import { CContainer } from '@coreui/react'

import { useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { checkRole } from 'src/constants/common'

import SingleSubHeader from 'src/components/custom/SingleSubHeader'


import RA_Pending_VISIT from 'src/components/custom/department/roles/ra/ra_pending_visit'

export default function  RA_Pending_VISIT_PAGE() {
    // const navigate = useNavigate()
    // const [rowPerPage, setRowPerPage] = useState(20)
    // const location = useLocation()

    // const [userId, setuserId] = useState([])
    // const [isLoading, setIsLoading] = useState(false)

    // const [visible, setVisible] = useState(false)
    // const [searchcurrentPage, setSearchCurrentPage] = useState(null)
    // const query = new URLSearchParams(location.search)
    // var count = query.get('count') || rowPerPage
    // var currentPage = parseInt(query.get('page') || 1)
    // var search = query.get('search') || ''
    // let [defaultPage, setDefaultPage] = useState(currentPage)
    // const dispatch = useDispatch()
    // const data = useSelector((state) => state.data?.cases)
    // const toggleCleared = useSelector((state) => state.toggleCleared)
    // const totalCount = useSelector((state) => state.totalCount)
    // const [filteredData, setFilteredData] = useState([])
    // const [rabranchData, setRAbranchData] = useState()
    // const [financenameData, setFinancenameData] = useState()
    // const updatePageQueryParam = (paramName, page) => {
    //     const searchParams = new URLSearchParams(location.search)
    //     searchParams.set(paramName, page)
    //     navigate({ search: searchParams.toString() })
    // }

    const admin = useSelector((state) => state.userData)

    let isRA = checkRole(process.env.REACT_APP_RA, admin)
    let isSFO = checkRole(process.env.REACT_APP_SFO, admin)


    return (
        <>
            <SingleSubHeader moduleName={'My-Pendings'} />

            <CContainer fluid>

                {(isRA || isSFO) && <RA_Pending_VISIT/>}

            </CContainer>
        </>
    )
}
