import { useCallback, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import AccountModal from "../../../components/AccountModal/AccountModal";
import { dashboardService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useFeedback } from "../../../hooks/useFeedback";
import { formatDate, formatDateTime } from "../../../utils/format";
import { statusLabel } from "../../../utils/labels";
import "./Perfil.css";

const ROLE_LABELS = {
  admin: "Administrador",
  atendente: "Atendente",
};

export default function Perfil({ user, account, onAccountSave, onPasswordChange }) {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const { feedback, notify, clear } = useFeedback();

  async function handleAccountSave(updatedAccount) {
    await onAccountSave(updatedAccount);
    notify("success", "Dados da conta atualizados com sucesso.");
  }

  const loadResumo = useCallback(() => dashboardService.resumo(), []);
  const loadHistorico = useCallback(() => dashboardService.historico(), []);

  const resumo = useApiResource(loadResumo);
  const historico = useApiResource(loadHistorico);

  const displayName = account?.name || user?.name || "Administrador";
  const email = account?.email || user?.email || "";
  const role = user?.role ?? "admin";

  const initials = displayName
    .split(" ")
    .map((parte) => parte?.[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const indicadores = resumo.data?.indicadores;
  const atividade = (historico.data ?? []).slice(0, 5);

  return (
    <div className="profile-page">
      {feedback && (
        <Alert type={feedback.type} message={feedback.message} onClose={clear} />
      )}

      <div className="profile-cover">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-heading">
          <div className="profile-identity">
            <p className="page-eyebrow">Conta administrativa</p>
            <h2>{displayName}</h2>
            <p>
              Responsável pela operação, reservas e acompanhamento financeiro
              dos flats.
            </p>
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
            subtitle="Últimas hospedagens registradas no sistema"
          >
            {historico.error && (
              <Alert message={historico.error} onClose={historico.reload} />
            )}

            <div className="activity-list">
              {historico.isLoading && !historico.data && (
                <p className="profile-empty">Carregando atividade...</p>
              )}

              {!historico.isLoading && atividade.length === 0 && (
                <p className="profile-empty">
                  Nenhuma hospedagem registrada até agora.
                </p>
              )}

              {atividade.map((registro) => (
                <div
                  className="activity-item"
                  key={registro._id}
                >
                  <span className="activity-dot" aria-hidden="true" />
                  <div>
                    <strong>
                      {registro.hospede?.nome ?? "Hóspede"} ·{" "}
                      {registro.acomodacao?.nome ?? "Acomodação"}
                    </strong>
                    <p>
                      {formatDate(registro.dataCheckIn)} →{" "}
                      {formatDate(registro.dataCheckOut)} ·{" "}
                      {statusLabel(registro.status)}
                    </p>
                  </div>
                  <time>{formatDateTime(registro.criadoEm ?? null)}</time>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Acesso e segurança" subtitle="Informações da sua conta">
            <div className="security-row">
              <div>
                <strong>E-mail principal</strong>
                <p>{email}</p>
              </div>
              <span className="status-badge">Verificado</span>
            </div>
            <div className="security-row">
              <div>
                <strong>Perfil de acesso</strong>
                <p>{ROLE_LABELS[role] ?? role}</p>
              </div>
              <span className="security-device">Ativo</span>
            </div>
            <div className="security-row">
              <div>
                <strong>Sessão</strong>
                <p>Autenticada por token JWT</p>
              </div>
              <span className="security-device">Local</span>
            </div>
          </Card>
        </div>

        <aside className="profile-side-column">
          <Card title="Visão operacional" subtitle="Resumo do sistema">
            <div className="profile-stats">
              <div>
                <strong>{indicadores?.acomodacoesTotal ?? "—"}</strong>
                <span>Acomodações</span>
              </div>
              <div>
                <strong>{indicadores?.hospedesCadastrados ?? "—"}</strong>
                <span>Hóspedes</span>
              </div>
              <div>
                <strong>{indicadores?.hospedagensAtivas ?? "—"}</strong>
                <span>Hospedagens ativas</span>
              </div>
            </div>
            {resumo.error && (
              <Alert message={resumo.error} onClose={resumo.reload} />
            )}
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
        account={{ name: displayName, email }}
        onSave={handleAccountSave}
        onChangePassword={onPasswordChange}
      />
    </div>
  );
}
