const ROLE_DISPLAY_TO_SLUG = {
  'chief operating officer coo': 'chief-operating-officercoo',
  'chief operating officercoo': 'chief-operating-officercoo',
  'field engineer fe': 'field-engineer-fe',
  'sdm work allotter': 'sdm-work-allotter',
  'ra branch bm': 'ra-branch-bm',
  'draft maker': 'draft-maker',
  'report checker rc': 'report-checker-rc',
  'line chief technical officer lcto': 'line-chief-technical-officer-lcto',
  'chief technical officer cto': 'chief-technical-officer-cto',
  'senior field officersfo': 'senior-field-officersfo',
  'senior field officer sfo': 'senior-field-officersfo',
  account: 'account',
  hr: 'hr',
  broker: 'broker',
  'tenant admin': 'admin',
  admin: 'admin',
}

export function normalizeRoleDisplayKey(displayName) {
  return String(displayName || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function resolveRoleSlugFromDisplayName(displayName) {
  return ROLE_DISPLAY_TO_SLUG[normalizeRoleDisplayKey(displayName)] || null
}
