import "./Header.css";
import gestaoFlatsLogo from "../../assets/gestãoflats-nome.png";

export default function Header({
  title,
  userName = "Usuário",
  userRole = "Administrador",
  subtitle,
  onToggleSidebar,
  isSidebarOpen,
  isAuthenticated = false,
  showToggle = true,
  showTitle = true,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {showToggle && onToggleSidebar && (
          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Fechar sidebar" : "Abrir sidebar"}
          >
            ☰
          </button>
        )}

        <div className="topbar-brand">
          <img src={gestaoFlatsLogo} alt="Gestão Flats" className="topbar-brand-image" />
          {showTitle && (
            <div>
              <h1>{title || "Dashboard"}</h1>
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {subtitle && <span className="topbar-subtitle">{subtitle}</span>}
        {isAuthenticated && (
          <div className="user-badge" aria-label={`Usuário ${userName}`}>
            <span className="avatar">{userName.charAt(0).toUpperCase()}</span>
            <div>
              <strong>{userName}</strong>
              <small>{userRole}</small>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
