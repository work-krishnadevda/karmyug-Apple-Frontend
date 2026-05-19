import React from 'react'
import { CFormInput, CFormLabel, CFormTextarea, CInputGroup, CInputGroupText } from '@coreui/react'

import AppFormSelect from 'src/components/form/AppFormSelect'
import PropTypes from 'prop-types'

const FormField = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  disabled = false,
  placeholder,
  options = [],
  required = false,
  error,
  className = '',
  rows,
  inputGroupText,
  ...props
}) => {
  const fieldId = `field-${name}`
  const hasError = !!error

  const renderField = () => {
    const commonProps = {
      id: fieldId,
      value: value || '',
      onChange: (e) => onChange(name, e.target.value),
      disabled,
      placeholder,
      className: `${className} ${hasError ? 'is-invalid' : ''}`,
      ...props
    }

    switch (type) {
      case 'select':
        return (
          <AppFormSelect {...commonProps}>
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AppFormSelect>
        )

      case 'textarea':
        return <CFormTextarea {...commonProps} rows={rows} />

      case 'number':
        return <CFormInput type="number" {...commonProps} />

      case 'date':
        return <CFormInput type="date" {...commonProps} />

      case 'email':
        return <CFormInput type="email" {...commonProps} />

      case 'file':
        return <CFormInput type="file" {...commonProps} />

      case 'number-with-currency':
        return (
          <CInputGroup>
            <CInputGroupText>{inputGroupText || '₹'}</CInputGroupText>
            <CFormInput type="number" {...commonProps} />
          </CInputGroup>
        )

      default:
        return <CFormInput type="text" {...commonProps} />
    }
  }

  return (
    <div className="form-field">
      <CFormLabel htmlFor={fieldId} className={required ? 'required' : ''}>
        {label}
      </CFormLabel>
      {renderField()}
      {hasError && <div className="invalid-feedback">{error}</div>}
    </div>
  )
}

FormField.propTypes = {
  type: PropTypes.oneOf([
    'text',
    'email',
    'number',
    'date',
    'select',
    'textarea',
    'file',
    'number-with-currency'
  ]),
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  required: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  rows: PropTypes.number,
  inputGroupText: PropTypes.string
}

export default FormField
