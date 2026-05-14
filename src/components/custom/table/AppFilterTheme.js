export default function AppFilterTheme({
  children,
  className = '',
  variantClassName = 'case-filter-theme',
}) {
  return (
    <section
      className={`${variantClassName} app-filter-theme ${className}`.trim()}
      data-app-filter-theme="true"
    >
      <div className="case-filter-theme__surface app-filter-theme__surface">{children}</div>
    </section>
  )
}
