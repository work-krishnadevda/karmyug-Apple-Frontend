// HRMS Constants and Configuration

export const FORM_SECTIONS = {
  PROFILE: 'profile',
  GENERAL: 'general',
  PERSONAL: 'personal',
  EMPLOYMENT: 'employment',
  BANK: 'bank',
  UPI: 'upi',
  ADDITIONAL: 'additional',
  ATTACHMENTS: 'attachments'
}

export const USER_ROLES = {
  HR: 'hr',
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
}

export const EDIT_PERMISSIONS = {
  ALL_SECTIONS: [FORM_SECTIONS.PROFILE, FORM_SECTIONS.GENERAL, FORM_SECTIONS.PERSONAL, FORM_SECTIONS.EMPLOYMENT, FORM_SECTIONS.BANK, FORM_SECTIONS.UPI, FORM_SECTIONS.ADDITIONAL, FORM_SECTIONS.ATTACHMENTS],
  LIMITED_SECTIONS: [FORM_SECTIONS.BANK, FORM_SECTIONS.ATTACHMENTS]
}

export const STAFF_TYPES = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'intern', label: 'Intern' },
  { value: 'consultant', label: 'Consultant' }
]

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' }
]

export const BLOOD_GROUP_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
]

export const DEPARTMENT_OPTIONS = [
  { value: 'it', label: 'IT' },
  { value: 'hr', label: 'HR' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
  { value: 'technical', label: 'Technical' },
  { value: 'management', label: 'Management' }
]

export const EMPLOYEE_TYPE_OPTIONS = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' }
]

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'terminated', label: 'Terminated' }
]

export const UPI_APP_OPTIONS = [
  { value: 'gpay', label: 'Google Pay' },
  { value: 'phonepe', label: 'PhonePe' },
  { value: 'paytm', label: 'Paytm' },
  { value: 'amazonpay', label: 'Amazon Pay' },
  { value: 'other', label: 'Other' }
]

export const PHYSICALLY_CHALLENGED_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
]

export const DOCUMENT_TYPES = {
  RESUME: 'resume',
  ID_PROOF: 'idProof',
  CERTIFICATES: 'certificates',
  EXPERIENCE_LETTER: 'experienceLetter',
  SALARY_SLIP: 'salarySlip',
  OTHER_DOCUMENTS: 'otherDocuments'
}

export const DOCUMENT_CONFIG = {
  [DOCUMENT_TYPES.RESUME]: {
    label: 'Upload Documents',
    accept: '.pdf,.doc,.docx',
    icon: 'cilFile',
    iconColor: 'text-primary'
  },
  [DOCUMENT_TYPES.ID_PROOF]: {
    label: 'ID Proof (Aadhar/PAN/Passport)',
    accept: '.pdf,.jpg,.jpeg,.png',
    icon: 'cilFile',
    iconColor: 'text-warning'
  },
  [DOCUMENT_TYPES.CERTIFICATES]: {
    label: 'Educational Certificates',
    accept: '.pdf,.doc,.docx',
    icon: 'cilFile',
    iconColor: 'text-info'
  },
  [DOCUMENT_TYPES.EXPERIENCE_LETTER]: {
    label: 'Experience Letter',
    accept: '.pdf,.doc,.docx',
    icon: 'cilFile',
    iconColor: 'text-success'
  },
  [DOCUMENT_TYPES.SALARY_SLIP]: {
    label: 'Salary Slip (Last 3 Months)',
    accept: '.pdf,.doc,.docx',
    icon: 'cilFile',
    iconColor: 'text-danger'
  },
  [DOCUMENT_TYPES.OTHER_DOCUMENTS]: {
    label: 'Other Documents',
    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
    icon: 'cilFile',
    iconColor: 'text-secondary'
  }
}

export const VALIDATION_RULES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  PHONE: 'phone',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern'
}

export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  MIN_LENGTH: 'Minimum length is {min} characters',
  MAX_LENGTH: 'Maximum length is {max} characters',
  INVALID_PATTERN: 'Please enter a valid value',
  FILE_TOO_LARGE: 'File size must be less than {maxSize}MB',
  INVALID_FILE_TYPE: 'Please select a valid file type'
}

export const API_ENDPOINTS = {
  EMPLOYEES: 'hrms/employees',
  EMPLOYEE_BY_ID: (id) => `hrms/employees/${id}`,
  UPLOAD_DOCUMENT: (id) => `hrms/employees/${id}/documents`
}

export const FILE_SIZE_LIMITS = {
  IMAGE: 5, // MB
  DOCUMENT: 10, // MB
  MAX_TOTAL: 50 // MB
}

/**
 * True when an admin/staff record should appear in manager / leave-authority dropdowns.
 * Relies on status === 'active' (case-insensitive) and excludes soft-inactive / deleted rows.
 */
export function isAdminActiveForDropdown(record) {
  if (!record || typeof record !== 'object') return false
  if (record.deleted_at) return false
  const st = (record.status ?? '').toString().toLowerCase().trim()
  if (st !== 'active') return false
  if (record.inactive_at || record.inactiveAt) return false
  return true
}

/** String for UI when role may be a string, populated object, or missing */
export function formatAdminRoleLabel(role) {
  if (role == null || role === '') return ''
  if (typeof role === 'string') return role
  if (typeof role === 'object') {
    return role.display_name || role.name || role.label || (typeof role.slug === 'string' ? role.slug : '') || ''
  }
  return String(role)
}
