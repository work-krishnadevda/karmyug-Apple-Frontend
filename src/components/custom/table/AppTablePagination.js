import Select from 'react-select'

export const defaultRowsPerPageOptions = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: 500, label: '500' },
]

export default function AppTablePagination({
  rowsPerPage,
  rowCount,
  onChangePage,
  onChangeRowsPerPage,
  currentPage,
  rowsPerPageOptions = defaultRowsPerPageOptions,
  labels = {},
}) {
  const pageSize = Number(rowsPerPage) || rowsPerPageOptions[0]?.value || 10
  const totalRows = Number(rowCount) || 0
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize))
  const safePage = Math.min(Math.max(Number(currentPage) || 1, 1), pageCount)
  const from = totalRows === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, totalRows)
  const selectedRowsPerPage =
    rowsPerPageOptions.find((option) => option.value === pageSize) || {
      value: pageSize,
      label: String(pageSize),
    }

  const handleRowsPerPageChange = (selectedOption) => {
    if (!selectedOption) return
    onChangeRowsPerPage(selectedOption.value, safePage)
  }

  return (
    <div className="case-table-pagination app-table-pagination">
      <div className="case-table-pagination__summary app-table-pagination__summary">
        <span>{labels.rowsPerPage || 'Rows per page'}</span>
        <Select
          className="case-table-pagination__select app-table-pagination__select"
          classNamePrefix="case-table-pagination-select"
          isSearchable={false}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          options={rowsPerPageOptions}
          value={selectedRowsPerPage}
          onChange={handleRowsPerPageChange}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 30000 }),
          }}
        />
        <span>
          {from}-{to} of {totalRows}
        </span>
      </div>

      <div className="case-table-pagination__actions app-table-pagination__actions" aria-label="Table pagination">
        <button
          type="button"
          onClick={() => onChangePage(1, totalRows)}
          disabled={safePage <= 1}
          aria-label="First page"
        >
          {labels.first || 'First'}
        </button>
        <button
          type="button"
          onClick={() => onChangePage(safePage - 1, totalRows)}
          disabled={safePage <= 1}
          aria-label="Previous page"
        >
          {labels.previous || 'Prev'}
        </button>
        <span className="case-table-pagination__page app-table-pagination__page">
          {safePage} / {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onChangePage(safePage + 1, totalRows)}
          disabled={safePage >= pageCount}
          aria-label="Next page"
        >
          {labels.next || 'Next'}
        </button>
        <button
          type="button"
          onClick={() => onChangePage(pageCount, totalRows)}
          disabled={safePage >= pageCount}
          aria-label="Last page"
        >
          {labels.last || 'Last'}
        </button>
      </div>
    </div>
  )
}
