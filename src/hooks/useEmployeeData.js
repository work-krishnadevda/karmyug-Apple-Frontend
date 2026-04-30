import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import BasicProvider from '../constants/BasicProvider'
import { API_ENDPOINTS } from '../constants/hrmsConstants'

const useEmployeeData = (employeeId) => {
  const [employeeData, setEmployeeData] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Mock data for development
  const mockData = {
    profile: {
      employeeId: 'EMP001',
      name: 'John Doe',
      designation: 'Software Developer',
      staffType: 'permanent',
      contactNumber: '+91 9876543210',
      attendanceSupervisor: 'Jane Smith',
      department: 'it',
    },
    general: {
      firstName: 'John',
      middleName: '',
      lastName: 'Doe',
      dateOfBirth: '1990-05-15',
      gender: 'male',
    },
    personal: {
      email: 'john.doe@company.com',
      phone: '+91 9876543210',
      address: '123 Main Street, Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400001',
      gender: 'male',
      dob: '1990-05-15',
      maritalStatus: 'married',
      bloodGroup: 'O+',
      emergencyContact: '+91 9876543211',
      fatherName: 'Robert Doe',
      motherName: 'Mary Doe',
      spouseName: 'Jane Doe',
      physicallyChallenged: 'no',
      currentAddress: '123 Main Street, Apartment 4B',
      permanentAddress: '123 Main Street, Apartment 4B',
    },
    employment: {
      department: 'it',
      designation: 'Software Developer',
      joiningDate: '2023-01-15',
      employeeType: 'full-time',
      basicSalary: '50000',
      status: 'active',
    },
    bank: {
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      branchName: 'Mumbai Main Branch',
    },
    upi: {
      upiId: 'john.doe@hdfc',
      upiApp: 'gpay',
    },
    additional: {
      emergencyContactName: 'Jane Doe',
      emergencyContactNumber: '+91 9876543211',
      bloodGroup: 'O+',
      maritalStatus: 'married',
      notes: 'Reliable team player with excellent communication skills.',
    },
  }

  const fetchEmployeeData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to fetch from API first
      try {
        const response = await new BasicProvider(API_ENDPOINTS.EMPLOYEE_BY_ID(employeeId), null, 'GET').getRequest()
        setEmployeeData(response.data)
        setFormData(response.data)
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError)
        // Fallback to mock data
        setEmployeeData(mockData)
        setFormData(mockData)
      }
    } catch (error) {
      console.error('Error fetching employee data:', error)
      setError('Failed to fetch employee data')
      // Still set mock data as fallback
      setEmployeeData(mockData)
      setFormData(mockData)
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  const updateEmployeeData = useCallback(async (section, data) => {
    try {
      setSaving(true)
      setError(null)

      // Try to save to API first
      try {
        const response = await new BasicProvider(API_ENDPOINTS.EMPLOYEE_BY_ID(employeeId), null, 'PUT').putRequest(data)
        setEmployeeData(response.data)
        setFormData(response.data)
        return { success: true, data: response.data }
      } catch (apiError) {
        console.log('API not available, updating local data:', apiError)
        // Update local data when API is not available
        const updatedData = { ...formData, [section]: data[section] }
        setEmployeeData(updatedData)
        setFormData(updatedData)
        return { success: true, data: updatedData }
      }
    } catch (error) {
      console.error('Error updating employee data:', error)
      setError('Failed to update employee data')
      return { success: false, error: error.message }
    } finally {
      setSaving(false)
    }
  }, [employeeId, formData])

  const updateFormData = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }, [])

  const resetFormData = useCallback(() => {
    setFormData(employeeData)
  }, [employeeData])

  const uploadDocument = useCallback(async (section, file) => {
    try {
      setSaving(true)
      setError(null)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('section', section)

      try {
        const response = await new BasicProvider(API_ENDPOINTS.UPLOAD_DOCUMENT(employeeId), null, 'POST').postRequest(formData)
        return { success: true, data: response.data }
      } catch (apiError) {
        console.log('API not available for file upload:', apiError)
        // Mock successful upload
        return { success: true, data: { fileName: file.name, fileSize: file.size } }
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      setError('Failed to upload document')
      return { success: false, error: error.message }
    } finally {
      setSaving(false)
    }
  }, [employeeId])

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData()
    }
  }, [employeeId, fetchEmployeeData])

  return {
    employeeData,
    formData,
    loading,
    error,
    saving,
    updateEmployeeData,
    updateFormData,
    resetFormData,
    uploadDocument,
    refetch: fetchEmployeeData
  }
}

export default useEmployeeData
