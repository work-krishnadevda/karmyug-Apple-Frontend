const createArray = (count) => Array.from({ length: count })

function SkeletonLine({ width = '100%', className = '' }) {
  return (
    <span
      className={`app-content-skeleton__line ${className}`.trim()}
      style={{ width }}
    />
  )
}

export default function AppContentSkeleton({
  variant = 'page',
  cards = 3,
  rows = 4,
  className = '',
  ariaLabel = 'Loading content',
}) {
  if (variant === 'cards') {
    return (
      <div
        className={`app-content-skeleton app-content-skeleton--cards ${className}`.trim()}
        aria-busy="true"
        aria-label={ariaLabel}
      >
        {createArray(cards).map((_, index) => (
          <div className="app-content-skeleton__card" key={`card-${index}`}>
            <div className="app-content-skeleton__card-head">
              <span className="app-content-skeleton__avatar" />
              <div className="app-content-skeleton__card-copy">
                <SkeletonLine width="58%" />
                <SkeletonLine width="38%" className="is-short" />
              </div>
            </div>
            <div className="app-content-skeleton__stack">
              <SkeletonLine width="88%" />
              <SkeletonLine width="72%" />
              <SkeletonLine width="44%" className="is-short" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div
        className={`app-content-skeleton app-content-skeleton--list ${className}`.trim()}
        aria-busy="true"
        aria-label={ariaLabel}
      >
        {createArray(rows).map((_, index) => (
          <div className="app-content-skeleton__list-item" key={`item-${index}`}>
            <span className="app-content-skeleton__avatar is-small" />
            <div className="app-content-skeleton__stack">
              <SkeletonLine width="64%" />
              <SkeletonLine width="40%" className="is-short" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'detail') {
    return (
      <div
        className={`app-content-skeleton app-content-skeleton--detail ${className}`.trim()}
        aria-busy="true"
        aria-label={ariaLabel}
      >
        <div className="app-content-skeleton__detail-hero">
          <SkeletonLine width="34%" className="is-title" />
          <SkeletonLine width="48%" />
        </div>

        <div className="app-content-skeleton__detail-card">
          <div className="app-content-skeleton__detail-grid">
            {createArray(rows).map((_, index) => (
              <div className="app-content-skeleton__detail-field" key={`detail-${index}`}>
                <SkeletonLine width="36%" className="is-short" />
                <SkeletonLine width={index % 2 === 0 ? '88%' : '72%'} />
                <SkeletonLine width="54%" className="is-short" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'map') {
    return (
      <div
        className={`app-content-skeleton app-content-skeleton--map ${className}`.trim()}
        aria-busy="true"
        aria-label={ariaLabel}
      >
        <div className="app-content-skeleton__map-canvas" />
        <div className="app-content-skeleton__map-panel">
          <SkeletonLine width="46%" className="is-title" />
          <SkeletonLine width="82%" />
          <SkeletonLine width="68%" />
          <SkeletonLine width="58%" className="is-short" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={`app-content-skeleton app-content-skeleton--page ${className}`.trim()}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <div className="app-content-skeleton__hero">
        <SkeletonLine width="28%" className="is-title" />
        <SkeletonLine width="52%" />
      </div>

      <div className="app-content-skeleton__grid">
        {createArray(cards).map((_, index) => (
          <div className="app-content-skeleton__panel" key={`panel-${index}`}>
            <SkeletonLine width="42%" />
            <SkeletonLine width="86%" />
            <SkeletonLine width="68%" className="is-short" />
          </div>
        ))}
      </div>

      <div className="app-content-skeleton__table">
        {createArray(rows).map((_, index) => (
          <div className="app-content-skeleton__row" key={`row-${index}`}>
            <SkeletonLine width="18%" />
            <SkeletonLine width="24%" />
            <SkeletonLine width="14%" />
            <SkeletonLine width="16%" />
          </div>
        ))}
      </div>
    </div>
  )
}
