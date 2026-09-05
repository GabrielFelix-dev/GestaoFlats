import "./Sidebar.css";

export default function Sidebar({
  items = [],
  activeItem,
  onNavigate,
  collapsed = false,
  onToggle,
  headerHeight = 72,
}) {
  return (
    <aside
      style={{ top: headerHeight }}
      className={`sidebar ${collapsed ? "sidebar-collapsed" : "sidebar-open"}`.trim()}
    >
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-mark">GF</span>
          {!collapsed && <span className="brand-text">Gestão Flats</span>}
        </div>

        {onToggle && (
          <button
            type="button"
            className="sidebar-collapse-button"
            onClick={onToggle}
            aria-label="Alternar sidebar"
          >
            {collapsed ? "›" : "‹"}
          </button>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {items.map((item) => {
          const itemActive = activeItem === item.value;

          return (
            <div key={item.value} className="nav-group">
              <button
                type="button"
                className={`nav-item ${itemActive ? "active" : ""}`.trim()}
                onClick={() => onNavigate && onNavigate(item.value)}
              >
                <span className="nav-label">{item.label}</span>
              </button>

              {!collapsed && item.children && (
                <div className="submenu">
                  {item.children.map((child) => (
                    <button
                      key={child.value}
                      type="button"
                      className={`nav-subitem ${activeItem === child.value ? "active" : ""}`.trim()}
                      onClick={() => onNavigate && onNavigate(child.value)}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
