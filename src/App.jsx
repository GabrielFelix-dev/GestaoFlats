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
import Perfil from "./pages/Admin/Perfil/Perfil";
import { adminNavItems } from "./pages/navigation";

function AdminPage({
  pageName,
  activeItem,
  onNavigate,
  children,
  onLogout,
  onViewProfile,
  onChangeAccount,
  onAccountSave,
  account,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Layout
      title={pageName}
      navItems={adminNavItems}
      activeItem={activeItem}
      onNavigate={onNavigate}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      userName={account?.name || "Administrador"}
      userRole="Administrador"
      onLogout={onLogout}
      onViewProfile={onViewProfile}
      onChangeAccount={onChangeAccount}
      userEmail={account?.email}
      onAccountSave={onAccountSave}
    >
      {children}
    </Layout>
  );
}

function PageInDevelopment({
  pageName,
  onNavigate,
  activeItem,
  onLogout,
  onViewProfile,
  onChangeAccount,
  onAccountSave,
  account,
}) {
  return (
    <AdminPage
      pageName={pageName}
      activeItem={activeItem}
      onNavigate={onNavigate}
      onLogout={onLogout}
      onViewProfile={onViewProfile}
      onChangeAccount={onChangeAccount}
      account={account}
      onAccountSave={onAccountSave}
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
  const [account, setAccount] = useState({
    name: "Administrador",
    email: "admin@gestaoflats.com",
  });
  const handleLogout = () => setIsAuthenticated(false);
  const handleViewProfile = () => setActiveItem("profile");
  const handleAccountSave = (updatedAccount) => {
    setAccount((current) => ({ ...current, ...updatedAccount }));
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  if (activeItem === "dashboard") {
    return (
      <Dashboard
        onNavigate={setActiveItem}
        onLogout={handleLogout}
        onViewProfile={handleViewProfile}
        onChangeAccount={() => undefined}
        onAccountSave={handleAccountSave}
        account={account}
      />
    );
  }

  if (activeItem === "hospedes") {
    return (
      <Hospedes
        onNavigate={setActiveItem}
        onLogout={handleLogout}
        onViewProfile={handleViewProfile}
        onChangeAccount={() => undefined}
        onAccountSave={handleAccountSave}
        account={account}
      />
    );
  }

  if (activeItem === "profile") {
    return (
      <Perfil
        account={account}
        onNavigate={setActiveItem}
        onLogout={handleLogout}
        onChangeAccount={() => undefined}
        onAccountSave={handleAccountSave}
      />
    );
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
        onViewProfile={handleViewProfile}
        onChangeAccount={() => undefined}
        account={account}
        onAccountSave={handleAccountSave}
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
      onViewProfile={handleViewProfile}
      onChangeAccount={() => undefined}
      account={account}
      onAccountSave={handleAccountSave}
    />
  );
}
