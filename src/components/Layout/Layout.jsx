import { useRef, useState, useEffect } from "react";
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
  onViewProfile,
  onChangeAccount,
  userEmail,
  onAccountSave,
}) {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    function updateHeight() {
      setHeaderHeight(node.offsetHeight);
    }

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(node);

    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div
      className="app-shell"
      style={{ "--header-height": `${headerHeight}px` }}
    >
      <div ref={headerRef} className="shell-header">
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
          onViewProfile={onViewProfile}
          onChangeAccount={onChangeAccount}
          userEmail={userEmail}
          onAccountSave={onAccountSave}
          {...headerProps}
        />
      </div>

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
            headerHeight={headerHeight}
          />
        )}

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
