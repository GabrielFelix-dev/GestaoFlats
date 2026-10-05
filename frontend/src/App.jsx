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
import Acomodacoes from "./pages/Admin/Acomodacoes/Acomodacoes";
import Historico from "./pages/Admin/Historico/Historico";
import Financeiro from "./pages/Admin/Financeiro/Financeiro";
import Receitas from "./pages/Admin/Financeiro/Receitas";
import Despesas from "./pages/Admin/Financeiro/Despesas";
import ResumoFinanceiro from "./pages/Admin/Financeiro/ResumoFinanceiro";
import Perfil from "./pages/Admin/Perfil/Perfil";
import { useAuth } from "./context/AuthContext";
import { authService } from "./services";
import { adminNavItems } from "./pages/navigation";
import "./App.css";

/**
 * Rótulos de exibição para cada rota/página.
 * Chaves devem bater com os valores usados em `activeItem` e no `adminNavItems`.
 */
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
  perfil: "Perfil",
};

/** Chave do localStorage que guarda a última aba ativa do admin. */
const ACTIVE_ITEM_KEY = "gestao-flats:active-item";

/** Lê o parâmetro ?pagina= da URL; se válido, retorna o item correspondente. */
function readParamItem() {
  const param = new URLSearchParams(window.location.search).get("pagina");

  return param && pageLabels[param] ? param : null;
}

/**
 * Determina a aba inicial: prioriza ?pagina=, depois localStorage,
 * fallback para "dashboard".
 */
function readStoredActiveItem() {
  const fromParam = readParamItem();

  if (fromParam) {
    return fromParam;
  }

  const stored = localStorage.getItem(ACTIVE_ITEM_KEY);

  return stored && pageLabels[stored] ? stored : "dashboard";
}

/** Placeholder genérico para páginas ainda não implementadas. */
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

/**
 * Roteador simples baseado em estado (sem react-router).
 * Cada case retorna o componente da página, passando props compartilhadas.
 */
function renderPage(activeItem, pageProps) {
  switch (activeItem) {
    case "dashboard":
      return <Dashboard {...pageProps} />;
    case "perfil":
      return <Perfil {...pageProps} />;
    case "hospedes":
      return <Hospedes {...pageProps} />;
    case "acomodacoes":
      return <Acomodacoes {...pageProps} />;
    case "hospedagens":
      return <Hospedagens {...pageProps} />;
    case "nova-hospedagem":
      return <NovaHospedagem {...pageProps} />;
    case "detalhes-hospedagem":
      return <DetalhesHospedagem {...pageProps} />;
    case "checkin-checkout":
      return <CheckinCheckout {...pageProps} />;
    case "disponibilidade":
      return <Disponibilidade {...pageProps} />;
    case "historico":
      return <Historico {...pageProps} />;
    case "financeiro":
      return <Financeiro {...pageProps} />;
    case "receitas":
      return <Receitas {...pageProps} />;
    case "despesas":
      return <Despesas {...pageProps} />;
    case "resumo-financeiro":
      return <ResumoFinanceiro {...pageProps} />;
    default:
      return <PageInDevelopment pageName={pageLabels[activeItem] || activeItem} />;
  }
}

export default function App() {
  const { user, isAuthenticated, isCheckingSession, logout, updateProfile } =
    useAuth();
  const [activeItem, setActiveItem] = useState(readStoredActiveItem);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginAfterLogout, setShowLoginAfterLogout] = useState(false);
  const [selectedHospedagemId, setSelectedHospedagemId] = useState(null);

  // Persiste a aba ativa para restaurar ao recarregar.
  useEffect(() => {
    localStorage.setItem(ACTIVE_ITEM_KEY, activeItem);
  }, [activeItem]);

  /** Troca a aba e fecha a sidebar (mobile). */
  function handleNavigate(page) {
    setActiveItem(page);
    setSidebarOpen(false);
  }

  /** Faz logout e prepara a tela de login para o próximo acesso. */
  function handleLogout() {
    setShowLoginAfterLogout(true);
    setSelectedHospedagemId(null);
    setActiveItem("dashboard");
    logout();
  }

  async function handleAccountSave(updatedAccount) {
    return updateProfile({
      name: updatedAccount.name,
      email: updatedAccount.email,
    });
  }

  async function handlePasswordChange(credentials) {
    await authService.changePassword(credentials);
  }

  // Estado de bootstrap: valida token salvo no localStorage via /auth/me.
  if (isCheckingSession) {
    return (
      <div className="app-loading">
        <p>Carregando sua sessão...</p>
      </div>
    );
  }

  // Não autenticado: exibe tela de login/cadastro (Home) sem sidebar.
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
        <Home startInLogin={showLoginAfterLogout} />
      </Layout>
    );
  }

  // Props compartilhadas com todas as páginas administrativas.
  const pageProps = {
    onNavigate: handleNavigate,
    user,
    account: { name: user?.name, email: user?.email },
    onAccountSave: handleAccountSave,
    onPasswordChange: handlePasswordChange,
    selectedHospedagemId,
    onSelectHospedagem: setSelectedHospedagemId,
  };

  // Layout autenticado: header + sidebar + conteúdo dinâmico.
  return (
    <Layout
      title={pageLabels[activeItem] || activeItem}
      navItems={adminNavItems}
      activeItem={activeItem}
      onNavigate={handleNavigate}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      isAuthenticated
      userName={user?.name}
      userRole={user?.role === "admin" ? "Administrador" : user?.role}
      onLogout={handleLogout}
      onViewProfile={() => handleNavigate("perfil")}
    >
      {renderPage(activeItem, pageProps)}
    </Layout>
  );
}
