import AppTableSkeleton from './AppTableSkeleton'

export default function CaseTableSkeleton(props) {
  return <AppTableSkeleton {...props} ariaLabel={props.ariaLabel || 'Loading cases'} />
}
