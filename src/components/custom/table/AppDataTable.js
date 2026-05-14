import DataTableBase, { createTheme, defaultThemes } from 'react-data-table-component'
import AppTablePagination from './AppTablePagination'
import AppTableSkeleton from './AppTableSkeleton'

export { createTheme, defaultThemes }
export * from 'react-data-table-component'

export default function AppDataTable({
  className = '',
  wrapperClassName = '',
  pagination,
  paginationComponent,
  progressPending,
  progressComponent,
  ...props
}) {
  const tableClassName = `app-data-table ${className}`.trim()
  const wrapperClasses =
    `case-table-theme app-table-theme app-data-table-shell ${wrapperClassName}`.trim()
  const resolvedPaginationComponent =
    pagination && !paginationComponent ? AppTablePagination : paginationComponent
  const resolvedProgressComponent =
    progressPending && !progressComponent ? <AppTableSkeleton /> : progressComponent

  return (
    <div className={wrapperClasses} data-app-table-theme="true">
      <DataTableBase
        {...props}
        className={tableClassName}
        pagination={pagination}
        paginationComponent={resolvedPaginationComponent}
        progressPending={progressPending}
        progressComponent={resolvedProgressComponent}
      />
    </div>
  )
}

