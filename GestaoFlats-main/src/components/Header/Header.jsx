import "./Header.css";

export default function Header({
  title,
  userName = "Usuário",
  userRole = "Administrador",
  subtitle,
  onToggleSidebar,
  isSidebarOpen,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {onToggleSidebar && (
          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Fechar sidebar" : "Abrir sidebar"}
          >
            ☰
          </button>
        )}

        <div>
          <p className="topbar-label">Gestão Flats</p>
          <h1>{title || "Dashboard"}</h1>
        </div>
      </div>

      <div className="topbar-right">
        {subtitle && <span className="topbar-subtitle">{subtitle}</span>}
        <div className="user-badge" aria-label={`Usuário ${userName}`}>
          <span className="avatar">{userName.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{userName}</strong>
            <small>{userRole}</small>
          </div>
        </div>
      </div>
    </header>
  );
}
