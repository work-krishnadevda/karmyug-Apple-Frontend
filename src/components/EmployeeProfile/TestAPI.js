import React, { useState, useEffect } from 'react'
import { CContainer, CAlert, CButton, CCard, CCardBody, CCardHeader } from '@coreui/react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import BasicProvider from 'src/constants/BasicProvider'

const TestAPI = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [testResults, setTestResults] = useState([])
  const [loading, setLoading] = useState(false)

  const testEndpoints = async () => {
    setLoading(true)
    setTestResults([])
    
    const endpoints = [
      { name: 'Staff List (to verify ID exists)', url: 'admins?page=1&count=100' },
      { name: 'Admins', url: `admins/${id}` },
      { name: 'Admins with Profile', url: `admins/${id}?populate=profile` },
      { name: 'Profiles', url: `profiles/${id}` },
      { name: 'HRMS Employees', url: `hrms/employees/${id}` },
      { name: 'HRMS Profile', url: `hrms/profile/${id}` },
      { name: 'User', url: `user/${id}` },
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.name}: ${endpoint.url}`)
        const response = await new BasicProvider(endpoint.url, dispatch).getRequest()
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'success',
          data: response.data,
          statusCode: response.status,
        })
        console.log(`✅ ${endpoint.name} succeeded:`, response.data)
      } catch (error) {
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'error',
          error: error.message,
          statusCode: error.response?.status,
          responseData: error.response?.data,
        })
        console.log(`❌ ${endpoint.name} failed:`, error.message)
      }
    }

    // Check if the specific employee ID exists in the staff list
    const staffListResult = results.find(r => r.name === 'Staff List (to verify ID exists)')
    if (staffListResult && staffListResult.status === 'success') {
      const staffList = staffListResult.data?.data || []
      const employeeExists = staffList.find(emp => emp._id === id)
      
      if (employeeExists) {
        results.push({
          name: 'Employee ID Verification',
          url: 'N/A',
          status: 'success',
          data: {
            found: true,
            employee: employeeExists,
            message: `Employee with ID ${id} found in staff list`
          }
        })
      } else {
        results.push({
          name: 'Employee ID Verification',
          url: 'N/A',
          status: 'error',
          error: `Employee with ID ${id} NOT found in staff list`,
          data: {
            found: false,
            availableIds: staffList.map(emp => emp._id).slice(0, 10), // Show first 10 IDs
            totalStaff: staffList.length
          }
        })
      }
    }

    setTestResults(results)
    setLoading(false)
  }

  useEffect(() => {
    if (id) {
      testEndpoints()
    }
  }, [id])

  return (
    <CContainer fluid>
      <CCard>
        <CCardHeader>
          <h5>🔍 API Endpoint Test Results</h5>
          <p>Employee ID: <code>{id}</code></p>
          <CButton color="primary" onClick={testEndpoints} disabled={loading}>
            {loading ? 'Testing...' : 'Re-test All Endpoints'}
          </CButton>
        </CCardHeader>
        <CCardBody>
          {testResults.map((result, index) => (
            <div key={index} className="mb-3">
              <CAlert color={result.status === 'success' ? 'success' : 'danger'}>
                <h6>
                  {result.status === 'success' ? '✅' : '❌'} {result.name}
                </h6>
                <p><strong>URL:</strong> <code>{result.url}</code></p>
                <p><strong>Status Code:</strong> {result.statusCode || 'N/A'}</p>
                
                {result.status === 'success' ? (
                  <div>
                    <p><strong>Response Data:</strong></p>
                    <pre style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '10px', 
                      borderRadius: '4px',
                      fontSize: '12px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <p><strong>Error:</strong> {result.error}</p>
                    {result.responseData && (
                      <div>
                        <p><strong>Response Data:</strong></p>
                        <pre style={{ 
                          backgroundColor: '#f8f9fa', 
                          padding: '10px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(result.responseData, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CAlert>
            </div>
          ))}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default TestAPI
