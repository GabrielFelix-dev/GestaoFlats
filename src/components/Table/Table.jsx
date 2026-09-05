import "./Table.css";

export default function Table({
  columns = [],
  data = [],
  emptyMessage = "Nenhum registro encontrado.",
  actions,
  className = "",
}) {
  if (!columns.length) {
    return null;
  }

  const hasActions = Boolean(actions);
  const actionHeader = <th scope="col">Ações</th>;

  return (
    <div className={`table-wrapper ${className}`.trim()}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
            {hasActions && actionHeader}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr className="data-table-empty-row">
              <td
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="table-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="data-table-row"
                data-row-index={rowIndex}
              >
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    data-label={column.label}
                  >
                    {row[column.key]}
                  </td>
                ))}
                {hasActions && (
                  <td data-label="Ações" className="data-table-actions">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
