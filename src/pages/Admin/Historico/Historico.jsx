import { useMemo, useState } from "react";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import Modal from "../../../components/Modal/Modal";
import Select from "../../../components/Select/Select";
import Table from "../../../components/Table/Table";
import "./Historico.css";

const statusOptions = [
  { label: "Concluída", value: "Concluída" },
  { label: "Cancelada", value: "Cancelada" },
];

const historyRecords = [
  {
    id: 1,
    hospede: "Mariana Alves",
    acomodacao: "Flat 101",
    checkin: "01/08/2026",
    checkout: "05/08/2026",
    diarias: 4,
    valorTotal: 720,
    status: "Concluída",
  },
  {
    id: 2,
    hospede: "Carlos Lima",
    acomodacao: "Flat 204",
    checkin: "10/08/2026",
    checkout: "14/08/2026",
    diarias: 4,
    valorTotal: 1040,
    status: "Concluída",
  },
  {
    id: 3,
    hospede: "João Pereira",
    acomodacao: "Quarto 03",
    checkin: "15/08/2026",
    checkout: "16/08/2026",
    diarias: 1,
    valorTotal: 110,
    status: "Cancelada",
  },
  {
    id: 4,
    hospede: "Ana Beatriz",
    acomodacao: "Studio 01",
    checkin: "20/08/2026",
    checkout: "27/08/2026",
    diarias: 7,
    valorTotal: 1050,
    status: "Concluída",
  },
];

const columns = [
  { key: "hospede", label: "Hóspede" },
  { key: "acomodacao", label: "Acomodação" },
  { key: "checkin", label: "Check-in" },
  { key: "checkout", label: "Check-out" },
  { key: "diariasLabel", label: "Diárias" },
  { key: "valorTotalLabel", label: "Valor total" },
  { key: "status", label: "Status" },
];

function formatCurrency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Historico({ onNavigate }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return historyRecords
      .filter((record) => {
        const matchesSearch =
          !term ||
          record.hospede.toLowerCase().includes(term) ||
          record.acomodacao.toLowerCase().includes(term);

        const matchesStatus = !statusFilter || record.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .map((record) => ({
        ...record,
        diariasLabel: `${record.diarias} diária${record.diarias === 1 ? "" : "s"}`,
        valorTotalLabel: formatCurrency(record.valorTotal),
      }));
  }, [search, statusFilter]);

  function openDetails(record) {
    setSelectedRecord(record);
  }

  function closeDetails() {
    setSelectedRecord(null);
  }

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
            emptyMessage="Nenhum registro encontrado."
            actions={(record) => (
              <Button size="sm" variant="outline" onClick={() => openDetails(record)}>
                Detalhes
              </Button>
            )}
          />
        </section>
      </div>

      <Modal
        isOpen={Boolean(selectedRecord)}
        onClose={closeDetails}
        title="Detalhes da hospedagem"
        footer={
          <Button variant="outline" onClick={closeDetails}>
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
              <strong>{selectedRecord.status}</strong>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
