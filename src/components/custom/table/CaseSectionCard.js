import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import AppFilterTheme from './AppFilterTheme'
import AppTableTheme from './AppTableTheme'

export default function CaseSectionCard({
  variant = 'table',
  title,
  action = null,
  children,
  className = '',
  bodyClassName = '',
}) {
  const isFilter = variant === 'filter'
  const ThemeComponent = isFilter ? AppFilterTheme : AppTableTheme
  const shellClassName = isFilter ? 'case-filter-shell' : 'case-table-shell'
  const headerClassName = isFilter ? 'case-filter-shell__header' : 'case-table-shell__header'
  const bodyShellClassName = isFilter ? 'case-filter-shell__body' : 'case-table-shell__body'
  const titleClassName = isFilter ? 'case-filter-shell__title' : 'case-table-shell__title'
  const rowClassName = isFilter ? 'case-filter-shell__header-row' : 'case-table-shell__header-row'

  return (
    <ThemeComponent>
      <CCard className={`mb-2 ${shellClassName} ${className}`.trim()}>
        <CCardHeader className={headerClassName}>
          <div className={`d-flex justify-content-between align-items-center ${rowClassName}`.trim()}>
            <span className={titleClassName}>{title}</span>
            {action ? <span>{action}</span> : null}
          </div>
        </CCardHeader>
        <CCardBody className={`${bodyShellClassName} ${bodyClassName}`.trim()}>{children}</CCardBody>
      </CCard>
    </ThemeComponent>
  )
}
