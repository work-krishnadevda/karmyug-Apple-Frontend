import { useState, useCallback } from 'react'
import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants/hrmsConstants'

const useFormValidation = (initialData = {}) => {
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validateField = useCallback((name, value, rules = {}) => {
    const fieldErrors = []

    if (rules[VALIDATION_RULES.REQUIRED] && (!value || value.toString().trim() === '')) {
      fieldErrors.push(ERROR_MESSAGES.REQUIRED)
    }

    if (value && rules[VALIDATION_RULES.EMAIL]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        fieldErrors.push(ERROR_MESSAGES.INVALID_EMAIL)
      }
    }

    if (value && rules[VALIDATION_RULES.PHONE]) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        fieldErrors.push(ERROR_MESSAGES.INVALID_PHONE)
      }
    }

    if (value && rules[VALIDATION_RULES.MIN_LENGTH] && value.length < rules[VALIDATION_RULES.MIN_LENGTH]) {
      fieldErrors.push(ERROR_MESSAGES.MIN_LENGTH.replace('{min}', rules[VALIDATION_RULES.MIN_LENGTH]))
    }

    if (value && rules[VALIDATION_RULES.MAX_LENGTH] && value.length > rules[VALIDATION_RULES.MAX_LENGTH]) {
      fieldErrors.push(ERROR_MESSAGES.MAX_LENGTH.replace('{max}', rules[VALIDATION_RULES.MAX_LENGTH]))
    }

    if (value && rules[VALIDATION_RULES.PATTERN] && !rules[VALIDATION_RULES.PATTERN].test(value)) {
      fieldErrors.push(ERROR_MESSAGES.INVALID_PATTERN)
    }

    return fieldErrors[0] || null // Return first error or null
  }, [])

  const validateForm = useCallback((data, validationRules) => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach(section => {
      if (typeof validationRules[section] === 'object' && validationRules[section] !== null) {
        Object.keys(validationRules[section]).forEach(field => {
          const fieldName = `${section}.${field}`
          const fieldValue = data[section]?.[field]
          const fieldRules = validationRules[section][field]

          const error = validateField(fieldName, fieldValue, fieldRules)
          if (error) {
            newErrors[fieldName] = error
            isValid = false
          }
        })
      }
    })

    setErrors(newErrors)
    return isValid
  }, [validateField])

  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }))
  }, [])

  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[fieldName]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const setFieldTouched = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }))
  }, [])

  const isFieldTouched = useCallback((fieldName) => {
    return touched[fieldName] || false
  }, [touched])

  const getFieldError = useCallback((fieldName) => {
    return errors[fieldName] || null
  }, [errors])

  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0
  }, [errors])

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setFieldTouched,
    isFieldTouched,
    getFieldError,
    hasErrors
  }
}

export default useFormValidation
