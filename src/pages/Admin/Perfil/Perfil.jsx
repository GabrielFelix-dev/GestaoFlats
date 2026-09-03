import { useState } from "react";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Layout from "../../../components/Layout/Layout";
import AccountModal from "../../../components/AccountModal/AccountModal";
import { adminNavItems } from "../../navigation";
import "./Perfil.css";

const recentActivity = [
  {
    action: "Atualizou uma hospedagem",
    detail: "Reserva #204 · Flat 101",
    time: "Hoje, 10:42",
  },
  {
    action: "Cadastrou um hóspede",
    detail: "Mariana Alves",
    time: "Ontem, 16:18",
  },
  {
    action: "Registrou uma despesa",
    detail: "Taxa de condomínio",
    time: "02 set, 09:05",
  },
];

export default function Perfil({
  account,
  onNavigate,
  onLogout,
  onChangeAccount,
  onAccountSave,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const displayName = account?.name || "Administrador";
  const email = account?.email || "admin@gestaoflats.com";

  return (
    <Layout
      title="Perfil"
      navItems={adminNavItems}
      activeItem=""
      onNavigate={onNavigate}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      userName={displayName}
      userRole="Administrador"
      onLogout={onLogout}
      onViewProfile={() => undefined}
      onChangeAccount={onChangeAccount}
      userEmail={email}
      onAccountSave={onAccountSave}
    >
      <div className="profile-page">
        <section className="profile-cover" aria-hidden="true" />

        <section className="profile-intro">
          <div className="profile-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-identity">
            <p className="profile-eyebrow">Conta administrativa</p>
            <h2>{displayName}</h2>
            <p className="profile-handle">@administrador · Gestão Flats</p>
            <p className="profile-bio">
              Responsável pela operação, reservas e acompanhamento financeiro
              dos flats.
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsAccountModalOpen(true)}>
            Editar perfil
          </Button>
        </section>

        <div className="profile-layout">
          <div className="profile-main-column">
            <Card
              title="Atividade recente"
              subtitle="Últimas ações realizadas no painel"
            >
              <div className="activity-list">
                {recentActivity.map((item) => (
                  <div
                    className="activity-item"
                    key={`${item.action}-${item.time}`}
                  >
                    <span className="activity-dot" aria-hidden="true" />
                    <div>
                      <strong>{item.action}</strong>
                      <p>{item.detail}</p>
                    </div>
                    <time>{item.time}</time>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              title="Acesso e segurança"
              subtitle="Informações da sua conta"
            >
              <div className="security-row">
                <div>
                  <strong>E-mail principal</strong>
                  <p>{email}</p>
                </div>
                <span className="status-badge">Verificado</span>
              </div>
              <div className="security-row">
                <div>
                  <strong>Último acesso</strong>
                  <p>Hoje, às 08:31 · Este dispositivo</p>
                </div>
                <span className="security-device">Ativo</span>
              </div>
            </Card>
          </div>

          <aside className="profile-side-column">
            <Card title="Visão operacional" subtitle="Resumo do seu escopo">
              <div className="profile-stats">
                <div>
                  <strong>18</strong>
                  <span>Acomodações</span>
                </div>
                <div>
                  <strong>42</strong>
                  <span>Hospedagens</span>
                </div>
                <div>
                  <strong>03</strong>
                  <span>Usuários ativos</span>
                </div>
              </div>
            </Card>

            <Card title="Permissões" subtitle="Nível de acesso atual">
              <div className="permission-list">
                <span>Gestão de hospedagens</span>
                <span>Controle financeiro</span>
                <span>Cadastro de hóspedes</span>
                <span>Configurações administrativas</span>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        account={account}
        onSave={onAccountSave}
      />
    </Layout>
  );
}
