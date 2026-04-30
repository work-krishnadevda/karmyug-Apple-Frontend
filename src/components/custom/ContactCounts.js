import React, { useEffect, useState } from 'react'
import { CRow, CCol, CWidgetStatsF } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBasket, cilChildFriendly, cilStar } from '@coreui/icons'

const ContactCounts = (props) => {
    const { data, rowPerPage, filterData, setFilterData, onFilter, onReset } = props

    const [inputData, setInputData] = useState({
        sale: '',
        stock: '',
    })

    
    useEffect(() => {
        setInputData(filterData)
    }, [filterData])

    const handleFilter = (filterType) => {
        const updatedData = { ...inputData }

        if (filterType === 'out_of_stock') {
            updatedData.stock = updatedData.stock === 'out_of_stock' ? '' : 'out_of_stock'
            delete updatedData.sale
        } else if (filterType === 'on_sale') {
            updatedData.sale = updatedData.sale === 'on_sale' ? '' : 'on_sale'
            // updatedData.stock = '' // Remove the "Out of Stock" filter
            delete updatedData.stock
        }

        updatedData.count = rowPerPage
        updatedData.page = 1
        setFilterData(updatedData)
        onFilter(updatedData)
    }

    return (
        <CRow className="products_count">
            <CCol xs={4}>
                <CWidgetStatsF
                    className="mb-3"
                    color="success"
                    onClick={onReset}
                    icon={<CIcon icon={cilBasket} height={24} />}
                    title="Todays Enquiry / Total Enquiry "
                    // value={data.productCount ?? 0}
                />
            </CCol>

            
            <CCol xs={4}>
                <CWidgetStatsF
                    className="mb-3"
                    color="danger"
                    onClick={() => handleFilter('out_of_stock')}
                    icon={<CIcon icon={cilChildFriendly} height={24} />}
                    title="Spams"
                    // value={data.outOfStock ?? 0}
                />
            </CCol>
            <CCol xs={4}>
                <CWidgetStatsF
                    className="mb-3"
                    color="dark"
                    onClick={() => handleFilter('on_sale')}
                    icon={<CIcon icon={cilStar} height={24} />}
                    title="Enquiry"
                    // value={data.onSaleProduct ?? 0}
                />
            </CCol>
        </CRow>
    )
}

export default ContactCounts
