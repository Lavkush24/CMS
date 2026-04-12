function Table({ columns, data, renderActions }) {
  return (
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col}>{col}</th>
          ))}
          {renderActions && <th>Action</th>}
        </tr>
      </thead>

      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            {columns.map(col => (
              <td key={col}>{item[col]}</td>
            ))}
            {renderActions && (
              <td>{renderActions(item)}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;