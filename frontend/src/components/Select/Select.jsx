import "./Select.css";

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Selecione",
  disabled = false,
  required = false,
  error = false,
  className = "",
  id,
  ...props
}) {
  const selectId = id || name;

  return (
    <div className={`select-field ${className}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span aria-hidden="true">*</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={error}
        className={`select ${error ? "select-error" : ""}`.trim()}
        {...props}
      >
        {placeholder && !value && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
