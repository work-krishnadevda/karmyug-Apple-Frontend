import React from 'react'

export function getAssignedFeDisplay(row) {
  if (Array.isArray(row?.engineers) && row.engineers.length > 0) {
    const names = row.engineers.map((engineer) => engineer?.name).filter(Boolean)
    if (names.length > 0) {
      return names.join(', ')
    }
  }

  if (row?.engineers && typeof row.engineers === 'object' && row.engineers.name) {
    return row.engineers.name
  }

  return '-'
}

export function AssignedFeCell({ row }) {
  return <div className="data_table_colum">{getAssignedFeDisplay(row)}</div>
}

export const assignedFeColumn = {
  name: 'Assigned FE',
  cell: (row) => <AssignedFeCell row={row} />,
  width: '170px',
}
