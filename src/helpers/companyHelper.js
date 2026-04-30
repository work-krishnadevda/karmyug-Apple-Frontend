import BasicProvider from 'src/constants/BasicProvider'

/**
 * Fetch companies from API and format them for form options
 * @returns {Promise<Array>} Array of company options with value and label
 */
export const fetchCompanies = async () => {
  try {
    const response = await new BasicProvider('companies?page=1&count=100').getRequest()
    
    if (response?.status === 'success' && response.data?.data && Array.isArray(response.data.data)) {
      const companyOptions = response.data.data
        .map((company) => ({
          value: company?.display_name || '',
          label: company?.display_name || '',
          id: company?._id || '',
          name: company?.name || '',
        }))
        .filter((option) => option.value && option.label)
      
      return [{ value: '', label: 'Select Company' }, ...companyOptions]
    } else {
      throw new Error('Invalid response structure')
    }
  } catch (error) {
    console.error('Error fetching companies:', error)
    
    // Fallback to static data if API fails
    const fallbackCompanies = [
      { value: '', label: 'Select Company' },
      { value: 'REAL APPLE ADVISORY SERVICE', label: 'REAL APPLE ADVISORY SERVICE', id: 'RA' },
      { value: 'GAURAV AIRAN', label: 'GAURAV AIRAN', id: 'GA' },
      { value: 'SHREE SHYAM TECHNOCRATS', label: 'SHREE SHYAM TECHNOCRATS', id: 'SS' },
      { value: 'THE VOCALEARN EDUCORP', label: 'THE VOCALEARN EDUCORP', id: 'VL' },
      { value: 'REAL APPLE CONSULTANCY HOUSE', label: 'REAL APPLE CONSULTANCY HOUSE', id: 'RAC' },
    ]
    
    return fallbackCompanies
  }
}

/**
 * Get company display name by value (company name)
 * @param {string} companyValue - Company value (display name)
 * @param {Array} companies - Array of company options
 * @returns {string} Company display name
 */
export const getCompanyDisplayName = (companyValue, companies = []) => {
  if (!companyValue || !companies.length) return ''
  
  const company = companies.find(comp => comp.value === companyValue)
  return company ? company.label : ''
}

/**
 * Get company ID by value (company name)
 * @param {string} companyValue - Company value (display name)
 * @param {Array} companies - Array of company options
 * @returns {string} Company ID
 */
export const getCompanyId = (companyValue, companies = []) => {
  if (!companyValue || !companies.length) return ''
  
  const company = companies.find(comp => comp.value === companyValue)
  return company ? company.id : ''
}

/**
 * Get company name (slug) by value (company name)
 * @param {string} companyValue - Company value (display name)
 * @param {Array} companies - Array of company options
 * @returns {string} Company name/slug
 */
export const getCompanyName = (companyValue, companies = []) => {
  if (!companyValue || !companies.length) return ''
  
  const company = companies.find(comp => comp.value === companyValue)
  return company ? company.name : ''
}
