import "./Table.css";

function renderCell(value) {
  if (value === null || value === undefined || value === "") {
    return <span className="table-empty-value">—</span>;
  }

  return value;
}

export default function Table({
  columns = [],
  data = [],
  emptyMessage = "Nenhum registro encontrado.",
  loadingMessage = "Carregando registros...",
  actions,
  isLoading = false,
  className = "",
}) {
  if (!columns.length) {
    return null;
  }

  const hasActions = Boolean(actions);
  const actionHeader = <th scope="col">Ações</th>;
  const colSpan = columns.length + (hasActions ? 1 : 0);

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
          {isLoading ? (
            <tr className="data-table-empty-row">
              <td colSpan={colSpan} className="table-empty">
                {loadingMessage}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr className="data-table-empty-row">
              <td colSpan={colSpan} className="table-empty">
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
                    {renderCell(row[column.key])}
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
