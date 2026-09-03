import { useState } from "react";
import AccountModal from "../AccountModal/AccountModal";
import "./Header.css";

export default function Header({
  title,
  userName = "Usuário",
  userRole = "Administrador",
  subtitle,
  onToggleSidebar,
  isSidebarOpen,
  onLogout,
  onViewProfile,
  onChangeAccount,
  userEmail,
  onAccountSave,
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [account, setAccount] = useState({ name: userName, email: userEmail });

  function handleChangeAccount() {
    setIsUserMenuOpen(false);
    setIsAccountModalOpen(true);
    onChangeAccount?.();
  }

  function handleSaveAccount(updatedAccount) {
    setAccount((current) => ({ ...current, ...updatedAccount }));
    onAccountSave?.(updatedAccount);
  }

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
            <span className="avatar">
              {(account.name || userName).charAt(0).toUpperCase()}
            </span>
            <span className="user-details">
              <strong>{account.name || userName}</strong>
              <small>{userRole}</small>
            </span>
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
      </div>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        account={account}
        onSave={handleSaveAccount}
      />
    </header>
  );
}
