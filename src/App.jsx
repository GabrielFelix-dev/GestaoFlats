import { useEffect, useState } from "react";
import Card from "./components/Card/Card";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Admin/Dashboard/Dashboard";
import Hospedes from "./pages/Admin/Hospedes/Hospedes";
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
      { label: "Receitas", value: "receitas" },
      { label: "Despesas", value: "despesas" },
      { label: "Resumo financeiro", value: "resumo-financeiro" },
    ],
  },
];

const pageLabels = {
  dashboard: "Dashboard",
  hospedes: "Hóspedes",
  acomodacoes: "Acomodações",
  hospedagens: "Hospedagens",
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

function AdminRouter({ activeItem, props }) {
  switch (activeItem) {
    case "dashboard":
      return <Dashboard {...props} />;
    case "hospedes":
      return <Hospedes {...props} />;
    default:
      return (
        <PageInDevelopment pageName={pageLabels[activeItem] || activeItem} />
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

  return <AdminRouter activeItem={activeItem} props={adminProps} />;
}