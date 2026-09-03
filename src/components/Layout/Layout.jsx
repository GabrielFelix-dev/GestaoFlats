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
  isAuthenticated = false,
  showSidebar = true,
  headerProps = {},
  onLogout,
}) {
  return (
    <div className="app-shell">
      <Header
        title={title}
        userName={userName}
        userRole={userRole}
        isAuthenticated={isAuthenticated}
        onToggleSidebar={
          setSidebarOpen ? () => setSidebarOpen((open) => !open) : undefined
        }
        isSidebarOpen={sidebarOpen}
        onLogout={onLogout}
        {...headerProps}
      />

      <div className="content-shell">
        {showSidebar && (
          <Sidebar
            items={navItems}
            activeItem={activeItem}
            onNavigate={onNavigate}
            collapsed={!sidebarOpen}
            onToggle={
              setSidebarOpen ? () => setSidebarOpen((open) => !open) : undefined
            }
          />
        )}

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
