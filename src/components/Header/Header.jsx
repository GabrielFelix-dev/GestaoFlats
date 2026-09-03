import { useState } from "react";
import "./Header.css";

export default function Header({
  title,
  userName = "Usuário",
  userRole = "Administrador",
  subtitle,
  onToggleSidebar,
  isSidebarOpen,
  onLogout,
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
        <div className="user-menu">
          <button
            type="button"
            className="user-badge"
            aria-label={`Abrir opções da conta de ${userName}`}
            aria-expanded={isUserMenuOpen}
            onClick={() => setIsUserMenuOpen((open) => !open)}
          >
            <span className="avatar">{userName.charAt(0).toUpperCase()}</span>
            <span className="user-details">
              <strong>{userName}</strong>
              <small>{userRole}</small>
            </span>
            <span className="user-menu-chevron" aria-hidden="true">
              {isUserMenuOpen ? "⌃" : "⌄"}
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="account-menu" role="menu">
              <button type="button" role="menuitem" disabled>
                Ver perfil
              </button>
              <button type="button" role="menuitem" disabled>
                Alterar conta
              </button>
              <button
                type="button"
                role="menuitem"
                className="logout-action"
                onClick={onLogout}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
