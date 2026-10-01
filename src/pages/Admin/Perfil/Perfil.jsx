import { useState } from "react";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import AccountModal from "../../../components/AccountModal/AccountModal";
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
  onAccountSave,
}) {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const displayName = account?.name || "Administrador";
  const email = account?.email || "admin@gestaoflats.com";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-cover">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-heading">
          <div className="profile-identity">
            <p className="page-eyebrow">Conta administrativa</p>
            <h2>{displayName}</h2>
            <p>Responsável pela operação, reservas e acompanhamento financeiro dos flats.</p>
          </div>
          <Button variant="secondary" onClick={() => setIsAccountModalOpen(true)}>
            Editar perfil
          </Button>
        </div>
      </div>

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

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        account={account}
        onSave={onAccountSave}
      />
    </div>
  );
}
