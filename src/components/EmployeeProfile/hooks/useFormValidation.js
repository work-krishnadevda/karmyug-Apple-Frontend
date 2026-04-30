import { useState, useCallback } from 'react'

export const useFormValidation = () => {
  const [validationErrors, setValidationErrors] = useState({})

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
  }

  const validateAadhar = (aadhar) => {
    const aadharRegex = /^[0-9]{12}$/
    return aadharRegex.test(aadhar.replace(/\s/g, ''))
  }

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
    return panRegex.test(pan)
  }

  const validatePincode = (pincode) => {
    const pincodeRegex = /^[0-9]{6}$/
    return pincodeRegex.test(pincode)
  }

  const validateSection = (section, data) => {
    const errors = {}

    switch (section) {
      case 'profile':
        // Only validate if data exists and is not empty
        if (data && Object.keys(data).length > 0) {
          if (data.department && data.department.trim() === '') {
            errors.department = 'Department cannot be empty'
          }
          if (data.employeeId && data.employeeId.trim() === '') {
            errors.employeeId = 'Employee ID cannot be empty'
          }
        }
        break

      case 'personal':
        // Only validate if data exists and field has a value
        if (data && Object.keys(data).length > 0) {
          if (data.email && data.email.trim() !== '' && !validateEmail(data.email)) {
            errors.email = 'Please enter a valid email address'
          }
          if (data.phone && data.phone.trim() !== '' && !validatePhone(data.phone)) {
            errors.phone = 'Please enter a valid 10-digit phone number'
          }
          if (data.aadharNo && data.aadharNo.trim() !== '' && !validateAadhar(data.aadharNo)) {
            errors.aadharNo = 'Please enter a valid 12-digit Aadhar number'
          }
          if (data.panNo && data.panNo.trim() !== '' && !validatePAN(data.panNo)) {
            errors.panNo = 'Please enter a valid PAN number'
          }
          if (data.currentAddressPincode && data.currentAddressPincode.trim() !== '' && !validatePincode(data.currentAddressPincode)) {
            errors.currentAddressPincode = 'Please enter a valid 6-digit pincode'
          }
          if (data.permanentAddressPincode && data.permanentAddressPincode.trim() !== '' && !validatePincode(data.permanentAddressPincode)) {
            errors.permanentAddressPincode = 'Please enter a valid 6-digit pincode'
          }
        }
        break

      case 'employment':
        // Only validate if data exists and field has a value
        if (data && Object.keys(data).length > 0) {
          if (data.department && data.department.trim() === '') {
            errors.department = 'Department cannot be empty'
          }
          if (data.designation && data.designation.trim() === '') {
            errors.designation = 'Designation cannot be empty'
          }
          if (data.ctcPerMonth && data.ctcPerMonth.toString().trim() !== '' && isNaN(parseFloat(data.ctcPerMonth))) {
            errors.ctcPerMonth = 'Please enter a valid CTC amount'
          }
          if (data.basicPerMonth && data.basicPerMonth.toString().trim() !== '' && isNaN(parseFloat(data.basicPerMonth))) {
            errors.basicPerMonth = 'Please enter a valid basic salary amount'
          }
          if (data.hraPerMonth && data.hraPerMonth.toString().trim() !== '' && isNaN(parseFloat(data.hraPerMonth))) {
            errors.hraPerMonth = 'Please enter a valid HRA amount'
          }
        }
        break

      case 'bank':
        // Only validate if data exists and field has a value
        if (data && Object.keys(data).length > 0) {
          if (data.bankName && data.bankName.trim() === '') {
            errors.bankName = 'Bank name cannot be empty'
          }
          if (data.accountNumber && data.accountNumber.trim() === '') {
            errors.accountNumber = 'Account number cannot be empty'
          }
          if (data.ifscCode && data.ifscCode.trim() === '') {
            errors.ifscCode = 'IFSC code cannot be empty'
          }
          if (data.branchName && data.branchName.trim() === '') {
            errors.branchName = 'Branch name cannot be empty'
          }
        }
        break

      default:
        break
    }

    return errors
  }

  const validateForm = useCallback((formData, specificSection = null) => {
    const allErrors = {}

    // If specific section is provided, only validate that section
    const sectionsToValidate = specificSection ? [specificSection] : Object.keys(formData)

    sectionsToValidate.forEach((section) => {
      const sectionErrors = validateSection(section, formData[section])
      if (Object.keys(sectionErrors).length > 0) {
        allErrors[section] = sectionErrors
      }
    })

    setValidationErrors(allErrors)
    return Object.keys(allErrors).length === 0
  }, [])

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({})
  }, [])

  const getFieldError = useCallback((section, field) => {
    return validationErrors[section]?.[field] || null
  }, [validationErrors])

  const hasErrors = Object.keys(validationErrors).length > 0

  return {
    validationErrors,
    validateForm,
    clearValidationErrors,
    getFieldError,
    hasErrors,
    validateEmail,
    validatePhone,
    validateAadhar,
    validatePAN,
    validatePincode,
  }
}
