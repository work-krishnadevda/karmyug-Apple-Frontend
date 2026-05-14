const defaultSkeletonColumns = ['76px', '170px', '170px', '130px', '190px', '150px', '300px', '170px']

export default function AppTableSkeleton({
  rows = 8,
  columns = defaultSkeletonColumns,
  ariaLabel = 'Loading table',
}) {
  return (
    <div className="case-table-theme app-table-theme app-table-skeleton-shell">
      <div className="datatable case-table-skeleton app-table-skeleton" aria-busy="true" aria-label={ariaLabel}>
        <div className="case-table-skeleton__head app-table-skeleton__head">
          {columns.map((width, index) => (
            <div className="case-table-skeleton__cell app-table-skeleton__cell" style={{ width }} key={`head-${index}`}>
              <span className="case-table-skeleton__bar case-table-skeleton__bar--head app-table-skeleton__bar app-table-skeleton__bar--head" />
            </div>
          ))}
        </div>

        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div className="case-table-skeleton__row app-table-skeleton__row" key={`row-${rowIndex}`}>
            {columns.map((width, colIndex) => (
              <div className="case-table-skeleton__cell app-table-skeleton__cell" style={{ width }} key={`cell-${colIndex}`}>
                {colIndex === 0 ? (
                  <span className="case-table-skeleton__check app-table-skeleton__check" />
                ) : colIndex === 6 ? (
                  <span className="case-table-skeleton__pill app-table-skeleton__pill" />
                ) : (
                  <>
                    <span className="case-table-skeleton__bar app-table-skeleton__bar" />
                    <span className="case-table-skeleton__bar case-table-skeleton__bar--short app-table-skeleton__bar app-table-skeleton__bar--short" />
                  </>
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="case-table-skeleton__pagination app-table-skeleton__pagination">
          <span className="case-table-skeleton__bar case-table-skeleton__bar--pager app-table-skeleton__bar app-table-skeleton__bar--pager" />
          <span className="case-table-skeleton__pager-buttons app-table-skeleton__pager-buttons">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>
    </div>
  )
}
