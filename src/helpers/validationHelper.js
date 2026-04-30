const validations = {
  required: (value) => value && value.length > 0,
  minLength: (value, length) => value && value.trim().length >= length,
  maxLength: (value, length) => value && value.trim().length <= length,
  isEmail: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return value && emailRegex.test(value.trim())
  },
  isStrongPassword: (value) => {
    // Strong password criteria: at least 8 characters, at least one uppercase letter,
    // at least one lowercase letter, at least one number, and at least one special character
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
    return value && strongPasswordRegex.test(value)
  },
  isNumeric: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value)
  },
  // Add more custom validation rules here as needed
}

const validate = (value, rules) => {
  for (const rule in rules) {
    const ruleValue = rules[rule]
    if (!validations[rule](value && value.toString(), ruleValue)) {
      return false
    } 
    
  }

  return true
}

export const validateInput = (initialValues, validationRules) => {
  var errors = []
  for (const field in initialValues) {
      if (!validate(initialValues[field], validationRules[field])) {
        if (field === 'password') {
          errors.push(
            `Enter a password with at least 8 characters, including letters, numbers, and special characters`,
          )
        } else {
          errors.push(`Validation failed for ${field}`)
        }
      }
  }
  return errors
}
