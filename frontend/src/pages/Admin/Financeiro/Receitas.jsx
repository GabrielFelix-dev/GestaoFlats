import { useCallback, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Modal from "../../../components/Modal/Modal";
import Select from "../../../components/Select/Select";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Table from "../../../components/Table/Table";
import { receitasService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useFeedback } from "../../../hooks/useFeedback";
import { formatCurrency, formatDate, todayInputValue } from "../../../utils/format";
import { RECEITA_STATUS, toOptions } from "../../../utils/labels";
import "./Financeiro.css";

const emptyForm = {
  descricao: "",
  valor: "",
  data: todayInputValue(),
  origem: "",
  categoria: "",
  status: "Pendente",
};

const columns = [
  { key: "descricao", label: "Descrição" },
  { key: "origem", label: "Origem" },
  { key: "valorLabel", label: "Valor" },
  { key: "dataLabel", label: "Data" },
  { key: "statusBadge", label: "Status" },
];

export default function Receitas({ compact = false }) {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const { feedback, clear, run } = useFeedback();

  const debouncedBusca = useDebouncedValue(busca);

  const load = useCallback(
    () =>
      receitasService.list({
        search: debouncedBusca.trim(),
        status: statusFiltro,
      }),
    [debouncedBusca, statusFiltro],
  );

  const { data, isLoading, error, reload } = useApiResource(load, [
    debouncedBusca,
    statusFiltro,
  ]);

  const receitas = data ?? [];

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    clear();
    setIsModalOpen(true);
  }

  function openEditModal(receita) {
    setEditingId(receita.id);
    setForm({
      descricao: receita.descricao ?? "",
      valor: String(receita.valor ?? ""),
      data: (receita.data ?? "").slice(0, 10),
      origem: receita.origem ?? "",
      categoria: receita.categoria ?? "",
      status: receita.status ?? "Pendente",
    });
    clear();
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveReceita(event) {
    event?.preventDefault();
    setIsSaving(true);

    const payload = {
      descricao: form.descricao.trim(),
      valor: Number(form.valor),
      data: form.data,
      status: form.status,
    };

    if (form.origem.trim()) payload.origem = form.origem.trim();
    if (form.categoria.trim()) payload.categoria = form.categoria.trim();

    const result = await run(
      () =>
        editingId
          ? receitasService.update(editingId, payload)
          : receitasService.create(payload),
      {
        successMessage: editingId
          ? "Receita atualizada com sucesso."
          : "Receita lançada com sucesso.",
        onSuccess: () => closeModal(),
      },
    );

    if (result) reload();
    setIsSaving(false);
  }

  function alternarStatus(receita) {
    const proximoStatus = receita.status === "Recebido" ? "Pendente" : "Recebido";

    run(() => receitasService.changeStatus(receita.id, proximoStatus), {
      successMessage: `Receita marcada como ${proximoStatus.toLowerCase()}.`,
      onSuccess: () => reload(),
    });
  }

  function excluirReceita(receita) {
    if (!window.confirm(`Excluir a receita "${receita.descricao}"?`)) return;

    run(() => receitasService.remove(receita.id), {
      successMessage: "Receita excluída.",
      onSuccess: () => reload(),
    });
  }

  const rows = receitas.map((receita) => ({
    ...receita,
    valorLabel: formatCurrency(receita.valor),
    dataLabel: formatDate(receita.data),
    statusBadge: <StatusBadge status={receita.status} />,
  }));

  return (
    <>
      <div className="receitas-page">
        {!compact && (
          <Card title="Filtro de Receitas" subtitle="Gerencie as entradas financeiras">
            <div className="filter-grid">
              <Input
                label="Buscar por descrição"
                name="busca"
                placeholder="Ex: Reserva Flat 101"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
              <Select
                label="Status"
                name="status"
                value={statusFiltro}
                onChange={(event) => setStatusFiltro(event.target.value)}
                placeholder="Todos os status"
                options={toOptions(RECEITA_STATUS)}
              />
            </div>
          </Card>
        )}

        {feedback && (
          <Alert
            type={feedback.type}
            message={feedback.message}
            onClose={clear}
          />
        )}
        {error && <Alert message={error} onClose={reload} />}

        <Card
          title="Lançamentos de Receitas"
          subtitle="Histórico de pagamentos recebidos"
          action={
            <Button variant="secondary" onClick={openCreateModal}>
              Nova receita
            </Button>
          }
        >
          <Table
            columns={columns}
            data={rows}
            isLoading={isLoading}
            emptyMessage="Nenhuma receita encontrada."
            actions={(receita) => (
              <div className="financeiro-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => alternarStatus(receita)}
                >
                  {receita.status === "Recebido" ? "Marcar pendente" : "Receber"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(receita)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => excluirReceita(receita)}
                >
                  Excluir
                </Button>
              </div>
            )}
          />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Editar receita" : "Lançar receita"}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              type="submit"
              form="receita-form"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <form id="receita-form" className="modal-form" onSubmit={saveReceita}>
          <Input
            label="Descrição"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            placeholder="Ex: Reserva Flat 101"
            required
          />

          <Input
            label="Valor (R$)"
            type="number"
            name="valor"
            min={0}
            step="0.01"
            value={form.valor}
            onChange={handleChange}
            placeholder="0,00"
            required
          />

          <Input
            label="Data"
            type="date"
            name="data"
            value={form.data}
            onChange={handleChange}
            required
          />

          <Input
            label="Origem"
            name="origem"
            value={form.origem}
            onChange={handleChange}
            placeholder="Ex: Hospedagem, Booking"
          />

          <Input
            label="Categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            placeholder="Ex: Reserva"
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={toOptions(RECEITA_STATUS)}
            required
          />
        </form>
      </Modal>
    </>
  );
}
