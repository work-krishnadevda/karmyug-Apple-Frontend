import React, { forwardRef, useMemo } from 'react'
import Select from 'react-select'

const defaultMenuPortalTarget = typeof document !== 'undefined' ? document.body : null

const baseStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: 38,
    borderColor: state.isFocused ? '#044f45' : '#ced4da',
    boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(4, 79, 69, 0.14)' : 'none',
    '&:hover': {
      borderColor: '#044f45',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    paddingLeft: 8,
    paddingRight: 8,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#066054' : state.isFocused ? '#eaf5f2' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#16342f',
    cursor: 'pointer',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6c757d',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#16342f',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: '#d7dee4',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#044f45' : '#6c757d',
    '&:hover': {
      color: '#044f45',
    },
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 11000,
  }),
}

const normalizeOption = (option, index) => {
  if (typeof option === 'string' || typeof option === 'number') {
    return {
      label: String(option),
      value: index === 0 ? '' : String(option),
    }
  }

  if (!option || typeof option !== 'object') {
    return null
  }

  return {
    label: option.label ?? option.text ?? option.children ?? '',
    value:
      option.value !== undefined && option.value !== null ? String(option.value) : '',
    isDisabled: Boolean(option.disabled),
  }
}

const getOptionsFromChildren = (children) =>
  React.Children.toArray(children)
    .map((child) => {
      if (!React.isValidElement(child) || child.type !== 'option') {
        return null
      }

      return {
        label: child.props.children,
        value:
          child.props.value !== undefined && child.props.value !== null
            ? String(child.props.value)
            : '',
        isDisabled: Boolean(child.props.disabled),
      }
    })
    .filter(Boolean)

const AppFormSelect = forwardRef(
  (
    {
      className = '',
      children,
      options,
      onChange,
      name,
      value,
      placeholder,
      disabled = false,
      id,
      invalid = false,
      'aria-label': ariaLabel,
      menuPortalTarget,
      menuPosition,
      styles,
      custom: _custom,
      ...rest
    },
    ref,
  ) => {
    const normalizedOptions = useMemo(() => {
      if (Array.isArray(options) && options.length > 0) {
        return options.map(normalizeOption).filter(Boolean)
      }

      return getOptionsFromChildren(children)
    }, [children, options])

    const selectedOption = useMemo(() => {
      const normalizedValue =
        value !== undefined && value !== null ? String(value) : ''

      return (
        normalizedOptions.find((option) => String(option.value) === normalizedValue) ||
        null
      )
    }, [normalizedOptions, value])

    const placeholderOption =
      normalizedOptions.find((option) => option.value === '') || null

    const mergedStyles = useMemo(() => {
      if (!styles) {
        return baseStyles
      }

      const merged = { ...baseStyles }

      Object.keys(styles).forEach((key) => {
        const baseFn = baseStyles[key]
        const overrideFn = styles[key]

        merged[key] = (provided, state) => ({
          ...(typeof baseFn === 'function' ? baseFn(provided, state) : provided),
          ...(typeof overrideFn === 'function' ? overrideFn(provided, state) : {}),
        })
      })

      return merged
    }, [styles])

    const resolvedMenuPortalTarget = menuPortalTarget ?? defaultMenuPortalTarget

    return (
      <>
        <Select
          ref={ref}
          inputId={id}
          name={name}
          value={selectedOption}
          options={normalizedOptions}
          onChange={(selected) => {
            if (!onChange) {
              return
            }

            const nextValue = selected?.value ?? ''
            onChange({
              target: {
                name,
                value: nextValue,
              },
            })
          }}
          isDisabled={disabled}
          isSearchable={false}
          placeholder={placeholder || placeholderOption?.label || 'Select'}
          className={`app-form-select ${invalid ? 'is-invalid' : ''} ${className}`.trim()}
          classNamePrefix="app-form-select"
          menuPortalTarget={resolvedMenuPortalTarget}
          menuPosition={menuPosition || (resolvedMenuPortalTarget ? 'fixed' : 'absolute')}
          menuShouldScrollIntoView={false}
          styles={mergedStyles}
          aria-label={ariaLabel}
          {...rest}
        />
        <input type="hidden" name={name} value={selectedOption?.value ?? ''} />
      </>
    )
  },
)

AppFormSelect.displayName = 'AppFormSelect'

export default AppFormSelect
