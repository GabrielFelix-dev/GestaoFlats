import "./Input.css";

export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error = false,
  helperText,
  className = "",
  id,
  ...props
}) {
  const inputId = id || name;

  const handleDateChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`input-field ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span aria-hidden="true">*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        name={name}
        value={value || ""}
        onChange={handleDateChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={error}
        aria-describedby={helperText ? `${inputId}-help` : undefined}
        className={`input ${error ? "input-error" : ""}`.trim()}
        lang="pt-BR"
        data-date-format="DD/MM/YYYY"
        {...props}
      />

      {helperText && (
        <small id={`${inputId}-help`} className="input-helper">
          {helperText}
        </small>
      )}
    </div>
  );
}