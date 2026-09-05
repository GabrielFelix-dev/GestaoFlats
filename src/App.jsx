import { useEffect, useState } from "react";
import Card from "./components/Card/Card";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Hospedes from "./pages/Admin/Hospedes/Hospedes";
import Hospedagens from "./pages/Admin/Hospedagens/Hospedagens";
import NovaHospedagem from "./pages/Admin/Hospedagens/NovaHospedagem";
import DetalhesHospedagem from "./pages/Admin/Hospedagens/DetalhesHospedagem";
import CheckinCheckout from "./pages/Admin/CheckinCheckout/CheckinCheckout";
import Disponibilidade from "./pages/Admin/Disponibilidade/Disponibilidade";
import Historico from "./pages/Admin/Historico/Historico";
import Financeiro from "./pages/Admin/Financeiro/Financeiro";
import Receitas from "./pages/Admin/Financeiro/Receitas";
import Despesas from "./pages/Admin/Financeiro/Despesas";
import ResumoFinanceiro from "./pages/Admin/Financeiro/ResumoFinanceiro";
import "./App.css";

const sidebarItems = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Hóspedes", value: "hospedes" },
  { label: "Acomodações", value: "acomodacoes" },
  { label: "Hospedagens", value: "hospedagens" },
  { label: "Disponibilidade", value: "disponibilidade" },
  { label: "Check-in / Check-out", value: "checkin-checkout" },
  { label: "Histórico", value: "historico" },
  {
    label: "Financeiro",
    value: "financeiro",
    children: [
      { label: "Resumo", value: "resumo-financeiro" },
      { label: "Receitas", value: "receitas" },
      { label: "Despesas", value: "despesas" },
    ],
  },
];

const pageLabels = {
  dashboard: "Dashboard",
  hospedes: "Hóspedes",
  acomodacoes: "Acomodações",
  hospedagens: "Hospedagens",
  "nova-hospedagem": "Nova Hospedagem",
  "detalhes-hospedagem": "Detalhes da Hospedagem",
  disponibilidade: "Disponibilidade",
  "checkin-checkout": "Check-in / Check-out",
  historico: "Histórico",
  financeiro: "Financeiro",
  receitas: "Receitas",
  despesas: "Despesas",
  "resumo-financeiro": "Resumo financeiro",
};

function PageInDevelopment({ pageName }) {
  return (
    <div className="page-placeholder">
      <Card>
        <h2>{pageName}</h2>
        <p>Esta página ainda está em desenvolvimento.</p>
      </Card>
    </div>
  );
}

function AdminPage({
  pageName,
  activeItem,
  children,
  onNavigate,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <Layout
      title={pageName}
      navItems={sidebarItems}
      activeItem={activeItem}
      onNavigate={onNavigate}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      isAuthenticated
      userName="Maria Souza"
      userRole="Administrador"
      onLogout={onLogout}
    >
      {children}
    </Layout>
  );
}

function AdminRouter({ activeItem, props, sidebarOpen, setSidebarOpen }) {
  const pageName = pageLabels[activeItem] || activeItem;
  const layoutProps = {
    ...props,
    sidebarOpen,
    setSidebarOpen,
  };

  switch (activeItem) {
    case "dashboard":
      return <Dashboard {...props} />;
    case "hospedes":
      return <Hospedes {...props} />;
    case "hospedagens":
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <Hospedagens />
        </AdminPage>
      );
    case "nova-hospedagem":
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <NovaHospedagem />
        </AdminPage>
      );
    case "detalhes-hospedagem":
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <DetalhesHospedagem />
        </AdminPage>
      );
    case "checkin-checkout":
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <CheckinCheckout />
        </AdminPage>
      );
    case "disponibilidade":
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <Disponibilidade />
        </AdminPage>
      );
    case "historico":
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <Historico />
        </AdminPage>
      );
    case "financeiro":
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <Financeiro />
        </AdminPage>
      );
    case "receitas":
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <Receitas />
        </AdminPage>
      );
    case "despesas":
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <Despesas />
        </AdminPage>
      );
    case "resumo-financeiro":
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <ResumoFinanceiro />
        </AdminPage>
      );
    default:
      return (
        <AdminPage pageName={pageName} activeItem={activeItem} {...layoutProps}>
          <PageInDevelopment pageName={pageName} />
        </AdminPage>
      );
  }
}

export default function App() {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("gestao-flats:auth") === "true";
  });

  useEffect(() => {
    function handleLogin() {
      localStorage.setItem("gestao-flats:auth", "true");
      setIsAuthenticated(true);
      setActiveItem("dashboard");
    }

    function handleLogout() {
      localStorage.removeItem("gestao-flats:auth");
      setIsAuthenticated(false);
      setActiveItem("dashboard");
    }

    window.addEventListener("gestao-flats:login", handleLogin);
    window.addEventListener("gestao-flats:logout", handleLogout);
    return () => {
      window.removeEventListener("gestao-flats:login", handleLogin);
      window.removeEventListener("gestao-flats:logout", handleLogout);
    };
  }, []);

  const handleLogout = () => {
    window.dispatchEvent(new Event("gestao-flats:logout"));
  };

  if (!isAuthenticated) {
    return (
      <Layout
        title="Home"
        showSidebar={false}
        isAuthenticated={false}
        sidebarOpen={false}
        setSidebarOpen={setSidebarOpen}
        headerProps={{ showToggle: false, showTitle: false }}
      >
        <Home />
      </Layout>
    );
  }

  const adminProps = {
    onNavigate: setActiveItem,
    onLogout: handleLogout,
    onViewProfile: () => undefined,
    onChangeAccount: () => undefined,
    onAccountSave: () => undefined,
    account: { name: "Maria Souza", email: "admin@gestaoflats.com" },
  };

  return (
    <AdminRouter
      activeItem={activeItem}
      props={adminProps}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  );
}