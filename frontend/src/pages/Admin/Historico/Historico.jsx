import { useCallback, useMemo, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import Modal from "../../../components/Modal/Modal";
import Select from "../../../components/Select/Select";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Table from "../../../components/Table/Table";
import { dashboardService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { countNights, formatCurrency, formatDate, pluralize } from "../../../utils/format";
import { statusLabel } from "../../../utils/labels";
import "./Historico.css";

const statusOptions = [
  { label: "Concluída", value: "Concluida" },
  { label: "Cancelada", value: "Cancelada" },
];

const columns = [
  { key: "hospede", label: "Hóspede", width: "28%" },
  { key: "acomodacao", label: "Acomodação", width: "22%" },
  { key: "checkin", label: "Check-in", width: "10%" },
  { key: "checkout", label: "Check-out", width: "10%" },
  { key: "diariasLabel", label: "Diárias", width: "8%" },
  { key: "valorTotalLabel", label: "Valor total", width: "12%" },
  { key: "statusBadge", label: "Status", width: "10%" },
];

export default function Historico() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const debouncedSearch = useDebouncedValue(search);

  const load = useCallback(() => dashboardService.historico(), []);
  const { data, isLoading, error, reload } = useApiResource(load);

  const registros = data ?? [];

  const filteredRecords = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return registros
      .filter((record) => {
        const hospede = record.hospede?.nome ?? "";
        const acomodacao = record.acomodacao?.nome ?? "";
        const matchesSearch =
          !term ||
          hospede.toLowerCase().includes(term) ||
          acomodacao.toLowerCase().includes(term);
        const matchesStatus = !statusFilter || record.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .map((record) => {
        const hospede = record.hospede?.nome ?? "";
        const acomodacao = record.acomodacao?.nome ?? "";
        const checkin = record.dataCheckIn?.slice(0, 10);
        const checkout = record.dataCheckOut?.slice(0, 10);
        const diarias = countNights(checkin, checkout);

        return {
          ...record,
          id: record._id,
          hospede,
          acomodacao,
          checkin: formatDate(record.dataCheckIn),
          checkout: formatDate(record.dataCheckOut),
          diarias,
          valorTotal: record.valorTotal,
          diariasLabel: pluralize(diarias, "diária", "diárias"),
          valorTotalLabel: formatCurrency(record.valorTotal),
          statusBadge: <StatusBadge status={record.status} />,
        };
      });
  }, [registros, debouncedSearch, statusFilter]);

  return (
    <>
      <div className="history-page">
        <section className="history-heading">
          <div>
            <p className="page-eyebrow">Consulta</p>
            <h2>Histórico de hospedagens</h2>
            <p>
              Consulte as hospedagens já finalizadas ou canceladas no sistema.
            </p>
          </div>
        </section>

        {error && <Alert message={error} onClose={reload} />}

        <section className="history-filters" aria-label="Filtros de histórico">
          <Input
            label="Pesquisar"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Hóspede ou acomodação"
          />

          <Select
            label="Status"
            name="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="Todos"
            options={statusOptions}
          />
        </section>

        <section className="history-table-section">
          <div className="history-result-count">
            {filteredRecords.length} registro(s) encontrado(s)
          </div>

          <Table
            columns={columns}
            data={filteredRecords}
            isLoading={isLoading}
            emptyMessage="Nenhum registro encontrado."
            actions={(record) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedRecord(record)}
              >
                Detalhes
              </Button>
            )}
          />
        </section>
      </div>

      <Modal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Detalhes da hospedagem"
        footer={
          <Button variant="outline" onClick={() => setSelectedRecord(null)}>
            Fechar
          </Button>
        }
      >
        {selectedRecord && (
          <div className="history-details-grid">
            <div>
              <span>Hóspede</span>
              <strong>{selectedRecord.hospede}</strong>
            </div>
            <div>
              <span>Acomodação</span>
              <strong>{selectedRecord.acomodacao}</strong>
            </div>
            <div>
              <span>Check-in</span>
              <strong>{selectedRecord.checkin}</strong>
            </div>
            <div>
              <span>Check-out</span>
              <strong>{selectedRecord.checkout}</strong>
            </div>
            <div>
              <span>Diárias</span>
              <strong>{selectedRecord.diarias}</strong>
            </div>
            <div>
              <span>Valor total</span>
              <strong>{formatCurrency(selectedRecord.valorTotal)}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{statusLabel(selectedRecord.status)}</strong>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
