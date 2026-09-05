import { useState } from "react";
import AccountModal from "../AccountModal/AccountModal";
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
  onLogout,
  onViewProfile,
  onChangeAccount,
  userEmail,
  onAccountSave,
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  function handleChangeAccount() {
    setIsUserMenuOpen(false);
    setIsAccountModalOpen(true);
    onChangeAccount?.();
  }

  function handleSaveAccount(updatedAccount) {
    onAccountSave?.(updatedAccount);
  }

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
          <img
            src={gestaoFlatsLogo}
            alt="Gestão Flats"
            className="topbar-brand-image"
          />
          {showTitle && (
            <div className="topbar-page-title">
              <h1>{title || "Dashboard"}</h1>
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {subtitle && <span className="topbar-subtitle">{subtitle}</span>}
        {isAuthenticated && (
          <>
            <div className="user-menu">
              <button
                type="button"
                className="user-badge"
                aria-label={`Abrir opções da conta de ${userName}`}
                aria-expanded={isUserMenuOpen}
                onClick={() => setIsUserMenuOpen((open) => !open)}
              >
                <span className="avatar">
                  {userName.charAt(0).toUpperCase()}
                </span>
                <div className="user-badge-text">
                  <strong>{userName}</strong>
                  <small>{userRole}</small>
                </div>
                <span className="user-menu-chevron" aria-hidden="true">
                  {isUserMenuOpen ? "⌃" : "⌄"}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="account-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onViewProfile?.();
                    }}
                  >
                    Ver perfil
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleChangeAccount}
                  >
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
          </>
        )}
      </div>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        account={{ name: userName, email: userEmail }}
        onSave={handleSaveAccount}
      />
    </header>
  );
}
