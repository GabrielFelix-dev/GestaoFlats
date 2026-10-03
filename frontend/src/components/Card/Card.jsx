import "./Card.css";

export default function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  className = "",
  onClick,
}) {
  return (
    <article
      className={`card ${className}`.trim()}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {(title || subtitle || icon || action) && (
        <header className="card-header">
          {icon && <div className="card-icon">{icon}</div>}
          <div className="card-heading">
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </article>
  );
}
