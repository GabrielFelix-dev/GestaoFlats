import { useState } from "react";
import Card from "./components/Card/Card";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Hospedes from "./pages/Admin/Hospedes/Hospedes";
import { adminNavItems } from "./pages/navigation";

function PageInDevelopment({ pageName, onNavigate, activeItem }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Layout
      title={pageName}
      navItems={adminNavItems}
      activeItem={activeItem}
      onNavigate={onNavigate}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      userName="Administrador"
      userRole="Administrador"
    >
      <Card title={pageName} subtitle="Módulo administrativo">
        <p>Esta página ainda está em desenvolvimento.</p>
      </Card>
    </Layout>
  );
}

export default function App() {
  const [activeItem, setActiveItem] = useState("dashboard");

  if (activeItem === "dashboard") {
    return <Dashboard onNavigate={setActiveItem} />;
  }

  if (activeItem === "hospedes") {
    return <Hospedes onNavigate={setActiveItem} />;
  }

  const page = adminNavItems
    .flatMap((item) => [item, ...(item.children || [])])
    .find((item) => item.value === activeItem);

  return (
    <PageInDevelopment
      pageName={page?.label || "Página"}
      activeItem={activeItem}
      onNavigate={setActiveItem}
    />
  );
}
