import { useState } from "react";
import Card from "./components/Card/Card";
import Layout from "./components/Layout/Layout";
import CheckinCheckout from "./pages/Admin/CheckinCheckout/CheckinCheckout";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Disponibilidade from "./pages/Admin/Disponibilidade/Disponibilidade";
import Despesas from "./pages/Admin/Financeiro/Despesas";
import Financeiro from "./pages/Admin/Financeiro/Financeiro";
import Receitas from "./pages/Admin/Financeiro/Receitas";
import ResumoFinanceiro from "./pages/Admin/Financeiro/ResumoFinanceiro";
import Hospedagens from "./pages/Admin/Hospedagens/Hospedagens";
import Hospedes from "./pages/Admin/Hospedes/Hospedes";
import Login from "./pages/Login/Login";
import { adminNavItems } from "./pages/navigation";

function AdminPage({ pageName, activeItem, onNavigate, children }) {
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
      onLogout={onLogout}
    >
      {children}
    </Layout>
  );
}

function PageInDevelopment({ pageName, onNavigate, activeItem, onLogout }) {
  return (
    <AdminPage
      pageName={pageName}
      activeItem={activeItem}
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <Card title={pageName} subtitle="Módulo administrativo">
        <p>Esta página ainda está em desenvolvimento.</p>
      </Card>
    </AdminPage>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const handleLogout = () => setIsAuthenticated(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  if (activeItem === "dashboard") {
    return <Dashboard onNavigate={setActiveItem} onLogout={handleLogout} />;
  }

  if (activeItem === "hospedes") {
    return <Hospedes onNavigate={setActiveItem} onLogout={handleLogout} />;
  }

  const implementedPages = {
    "checkin-checkout": CheckinCheckout,
    disponibilidade: Disponibilidade,
    hospedagens: Hospedagens,
    financeiro: Financeiro,
    receitas: Receitas,
    despesas: Despesas,
    "resumo-financeiro": ResumoFinanceiro,
  };

  const PageComponent = implementedPages[activeItem];
  if (PageComponent) {
    return (
      <AdminPage
        pageName={
          adminNavItems
            .flatMap((item) => [item, ...(item.children || [])])
            .find((item) => item.value === activeItem)?.label
        }
        activeItem={activeItem}
        onNavigate={setActiveItem}
        onLogout={handleLogout}
      >
        <PageComponent />
      </AdminPage>
    );
  }

  const page = adminNavItems
    .flatMap((item) => [item, ...(item.children || [])])
    .find((item) => item.value === activeItem);

  return (
    <PageInDevelopment
      pageName={page?.label || "Página"}
      activeItem={activeItem}
      onNavigate={setActiveItem}
      onLogout={handleLogout}
    />
  );
}
