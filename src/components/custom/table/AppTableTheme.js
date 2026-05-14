export default function AppTableTheme({
  children,
  className = '',
  variantClassName = 'case-table-theme',
}) {
  return (
    <section className={`${variantClassName} app-table-theme ${className}`.trim()}>
      <div className="case-table-theme__surface app-table-theme__surface">{children}</div>
    </section>
  )
}
