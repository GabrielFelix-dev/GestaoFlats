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
            {actions && <th scope="col">Ações</th>}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="table-empty"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((column) => (
                  <td key={`${rowIndex}-${column.key}`}>{row[column.key]}</td>
                ))}
                {actions && <td>{actions(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
