import { useCallback } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import { hospedagensService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useFeedback } from "../../../hooks/useFeedback";
import {
  countNights,
  formatCurrency,
  formatDate,
  formatDateTime,
  pluralize,
} from "../../../utils/format";
import "./DetalhesHospedagem.css";

export default function DetalhesHospedagem({
  selectedHospedagemId,
  onNavigate,
}) {
  const { feedback, clear, run } = useFeedback();

  const load = useCallback(async () => {
    if (!selectedHospedagemId) return null;

    return hospedagensService.getById(selectedHospedagemId);
  }, [selectedHospedagemId]);

  const { data: hospedagem, isLoading, error, reload } = useApiResource(load, [
    selectedHospedagemId,
  ]);

  function handleStatusChange(event) {
    const status = event.target.value;
    if (!status) return;

    run(() => hospedagensService.changeStatus(hospedagem.id, status), {
      successMessage: `Hospedagem marcada como ${status}.`,
      onSuccess: () => reload(),
    });

    event.target.value = "";
  }

  if (!selectedHospedagemId) {
    return (
      <div className="detalhes-hospedagem-page">
        <Card title="Detalhes da Hospedagem">
          <p className="detalhes-hospedagem-empty">
            Selecione uma hospedagem na lista para ver os detalhes.
          </p>
          <Button variant="secondary" onClick={() => onNavigate?.("hospedagens")}>
            Ir para hospedagens
          </Button>
        </Card>
      </div>
    );
  }

  const dias = countNights(
    hospedagem?.dataCheckIn?.slice(0, 10),
    hospedagem?.dataCheckOut?.slice(0, 10),
  );

  return (
    <div className="detalhes-hospedagem-page">
      <Card
        title="Detalhes da Hospedagem"
        subtitle="Informações completas do registro"
      >
        {error && <Alert message={error} onClose={reload} />}
        {feedback && (
          <Alert
            type={feedback.type}
            message={feedback.message}
            onClose={clear}
          />
        )}

        {isLoading && !hospedagem && <p>Carregando hospedagem...</p>}

        {hospedagem && (
          <>
            <div className="detalhes-hospedagem-info">
              <div>
                <span>Hóspede</span>
                <strong>{hospedagem.hospede?.nome}</strong>
              </div>
              <div>
                <span>Acomodação</span>
                <strong>{hospedagem.acomodacao?.nome}</strong>
              </div>
              <div>
                <span>Check-in</span>
                <strong>{formatDate(hospedagem.dataCheckIn)}</strong>
              </div>
              <div>
                <span>Check-out</span>
                <strong>{formatDate(hospedagem.dataCheckOut)}</strong>
              </div>
              <div>
                <span>Diárias</span>
                <strong>{pluralize(dias, "diária", "diárias")}</strong>
              </div>
              <div>
                <span>Valor da diária</span>
                <strong>{formatCurrency(hospedagem.valorDiaria)}</strong>
              </div>
              <div>
                <span>Valor total</span>
                <strong>{formatCurrency(hospedagem.valorTotal)}</strong>
              </div>
              <div>
                <span>Hóspedes na reserva</span>
                <strong>{hospedagem.numeroHospedes}</strong>
              </div>
              <div>
                <span>Status</span>
                <StatusBadge status={hospedagem.status} />
              </div>
              <div>
                <span>Registrada em</span>
                <strong>{formatDateTime(hospedagem.criadoEm)}</strong>
              </div>
            </div>

            {hospedagem.observacoes && (
              <div className="detalhes-hospedagem-observacoes">
                <span>Observações</span>
                <p>{hospedagem.observacoes}</p>
              </div>
            )}

            <div className="detalhes-hospedagem-actions">
              {!["Concluida", "Cancelada"].includes(hospedagem.status) && (
                <select
                  className="select"
                  defaultValue=""
                  onChange={handleStatusChange}
                  aria-label="Alterar status da hospedagem"
                >
                  <option value="" disabled>
                    Alterar status...
                  </option>
                  {hospedagem.status === "Confirmada" && (
                    <option value="Ativa">Fazer check-in</option>
                  )}
                  {hospedagem.status === "Ativa" && (
                    <option value="Concluida">Fazer check-out</option>
                  )}
                  <option value="Cancelada">Cancelar hospedagem</option>
                </select>
              )}

              <Button variant="outline" onClick={() => onNavigate?.("hospedagens")}>
                Voltar
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
