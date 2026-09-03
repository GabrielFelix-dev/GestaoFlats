import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

export default function Layout({
  children,
  title,
  navItems = [],
  activeItem,
  onNavigate,
  sidebarOpen = true,
  setSidebarOpen,
  userName,
  userRole,
  onLogout,
  onViewProfile,
  onChangeAccount,
  userEmail,
  onAccountSave,
}) {
  return (
    <div className="app-shell">
      <Header
        title={title}
        userName={userName}
        userRole={userRole}
        onToggleSidebar={
          setSidebarOpen ? () => setSidebarOpen((open) => !open) : undefined
        }
        isSidebarOpen={sidebarOpen}
        onLogout={onLogout}
        onViewProfile={onViewProfile}
        onChangeAccount={onChangeAccount}
        userEmail={userEmail}
        onAccountSave={onAccountSave}
      />

      <div className="content-shell">
        <Sidebar
          items={navItems}
          activeItem={activeItem}
          onNavigate={onNavigate}
          collapsed={!sidebarOpen}
          onToggle={
            setSidebarOpen ? () => setSidebarOpen((open) => !open) : undefined
          }
        />

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
