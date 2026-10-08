import { useCallback, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Select from "../../../components/Select/Select";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Table from "../../../components/Table/Table";
import { hospedagensService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useFeedback } from "../../../hooks/useFeedback";
import { formatCurrency, formatDate } from "../../../utils/format";
import { HOSPEDAGEM_STATUS, toOptions } from "../../../utils/labels";
import "./Hospedagens.css";

const columns = [
  { key: "hospede", label: "Hóspede", width: "30%" },
  { key: "acomodacao", label: "Acomodação", width: "25%" },
  { key: "dataCheckIn", label: "Check-in", width: "12%" },
  { key: "dataCheckOut", label: "Check-out", width: "12%" },
  { key: "valorTotal", label: "Valor total", width: "12%" },
  { key: "statusBadge", label: "Status", width: "9%" },
];

export default function Hospedagens({ onNavigate, onSelectHospedagem }) {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const { feedback, clear, run } = useFeedback();

  const debouncedBusca = useDebouncedValue(busca);

  const load = useCallback(
    () =>
      hospedagensService.list({
        search: debouncedBusca.trim(),
        status: statusFiltro,
      }),
    [debouncedBusca, statusFiltro],
  );

  const { data, isLoading, error, reload } = useApiResource(load, [
    debouncedBusca,
    statusFiltro,
  ]);

  const hospedagens = data ?? [];

  function abrirDetalhes(hospedagem) {
    onSelectHospedagem?.(hospedagem.id);
    onNavigate?.("detalhes-hospedagem");
  }

  function cancelarReserva(hospedagem) {
    const confirmed = window.confirm(
      `Cancelar a hospedagem de ${hospedagem.hospede?.nome ?? "hóspede"}?`,
    );
    if (!confirmed) return;

    run(() => hospedagensService.changeStatus(hospedagem.id, "Cancelada"), {
      successMessage: "Hospedagem cancelada.",
      onSuccess: () => reload(),
    });
  }

  function excluirReserva(hospedagem) {
    const confirmed = window.confirm(
      `Excluir definitivamente a hospedagem de ${hospedagem.hospede?.nome ?? "hóspede"}?`,
    );
    if (!confirmed) return;

    run(() => hospedagensService.remove(hospedagem.id), {
      successMessage: "Hospedagem excluída.",
      onSuccess: () => reload(),
    });
  }

  const rows = hospedagens.map((hospedagem) => ({
    ...hospedagem,
    hospede: hospedagem.hospede?.nome,
    acomodacao: hospedagem.acomodacao?.nome,
    dataCheckIn: formatDate(hospedagem.dataCheckIn),
    dataCheckOut: formatDate(hospedagem.dataCheckOut),
    valorTotal: formatCurrency(hospedagem.valorTotal),
    statusBadge: <StatusBadge status={hospedagem.status} />,
  }));

  return (
    <div className="hospedagens-page">
      <section className="hospedagens-heading">
        <div>
          <p className="page-eyebrow">Reservas</p>
          <h2>Gestão de hospedagens</h2>
          <p>Acompanhe, edite e cancele as reservas do sistema.</p>
        </div>

        <Button variant="secondary" onClick={() => onNavigate?.("nova-hospedagem")}>
          Nova hospedagem
        </Button>
      </section>

      {feedback && (
        <Alert type={feedback.type} message={feedback.message} onClose={clear} />
      )}
      {error && <Alert message={error} onClose={reload} />}

      <Card title="Filtro de Hospedagens" subtitle="Pesquise por hóspede ou acomodação">
        <div className="filter-grid">
          <Input
            label="Buscar"
            name="busca"
            placeholder="Nome do hóspede ou acomodação..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
          <Select
            label="Status"
            name="status"
            value={statusFiltro}
            onChange={(event) => setStatusFiltro(event.target.value)}
            placeholder="Todos os status"
            options={toOptions(HOSPEDAGEM_STATUS)}
          />
        </div>
      </Card>

      <Card title="Lista de Hospedagens" subtitle="Gerenciamento de reservas ativas e históricas">
        <Table
          columns={columns}
          data={rows}
          isLoading={isLoading}
          emptyMessage="Nenhuma hospedagem encontrada."
          actions={(hospedagem) => (
            <div className="hospedagens-actions">
              <Button
                size="sm"
                variant="outline"
                onClick={() => abrirDetalhes(hospedagem)}
              >
                Detalhes
              </Button>
              {hospedagem.status === "Confirmada" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => cancelarReserva(hospedagem)}
                >
                  Cancelar
                </Button>
              )}
              {hospedagem.status !== "Ativa" && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => excluirReserva(hospedagem)}
                >
                  Excluir
                </Button>
              )}
            </div>
          )}
        />
        <p className="hospedagens-legend">
          {hospedagens.length} hospedagem(ns) encontrada(s)
        </p>
      </Card>
    </div>
  );
}
