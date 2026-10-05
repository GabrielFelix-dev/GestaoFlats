import { useCallback, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Modal from "../../../components/Modal/Modal";
import Select from "../../../components/Select/Select";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Table from "../../../components/Table/Table";
import { acomodacoesService, despesasService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useFeedback } from "../../../hooks/useFeedback";
import {
  formatCurrency,
  formatDate,
  todayInputValue,
} from "../../../utils/format";
import {
  DESPESA_CATEGORIAS,
  DESPESA_STATUS,
  categoriaLabel,
  toOptions,
} from "../../../utils/labels";
import "./Financeiro.css";

const emptyForm = {
  descricao: "",
  categoria: "Condominio",
  valor: "",
  dataVencimento: todayInputValue(),
  dataPagamento: "",
  status: "Pendente",
  acomodacaoId: "geral",
};

const columns = [
  { key: "descricao", label: "Descrição" },
  { key: "categoriaLabel", label: "Categoria" },
  { key: "acomodacaoLabel", label: "Imóvel" },
  { key: "valorLabel", label: "Valor" },
  { key: "dataVencimentoLabel", label: "Vencimento" },
  { key: "statusBadge", label: "Status" },
];

export default function Despesas({ compact = false }) {
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const { feedback, clear, run } = useFeedback();
  const loadAccommodations = useCallback(() => acomodacoesService.list({}), []);
  const accommodations = useApiResource(loadAccommodations).data ?? [];

  const debouncedBusca = useDebouncedValue(busca);

  const load = useCallback(
    () =>
      despesasService.list({
        search: debouncedBusca.trim(),
        status: statusFiltro,
      }),
    [debouncedBusca, statusFiltro],
  );

  const { data, isLoading, error, reload } = useApiResource(load, [
    debouncedBusca,
    statusFiltro,
  ]);

  const despesas = data ?? [];

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

  function openEditModal(despesa) {
    setEditingId(despesa.id);
    setForm({
      descricao: despesa.descricao ?? "",
      categoria: despesa.categoria ?? "Condominio",
      valor: String(despesa.valor ?? ""),
      dataVencimento: (despesa.dataVencimento ?? "").slice(0, 10),
      dataPagamento: despesa.dataPagamento
        ? despesa.dataPagamento.slice(0, 10)
        : "",
      status: despesa.status ?? "Pendente",
      acomodacaoId: despesa.acomodacao?.id ?? "geral",
    });
    clear();
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveDespesa(event) {
    event?.preventDefault();
    setIsSaving(true);

    const payload = {
      descricao: form.descricao.trim(),
      categoria: form.categoria,
      valor: Number(form.valor),
      dataVencimento: form.dataVencimento,
      status: form.status,
      acomodacaoId: form.acomodacaoId === "geral" ? null : form.acomodacaoId,
    };

    if (form.dataPagamento) payload.dataPagamento = form.dataPagamento;

    const result = await run(
      () =>
        editingId
          ? despesasService.update(editingId, payload)
          : despesasService.create(payload),
      {
        successMessage: editingId
          ? "Despesa atualizada com sucesso."
          : "Despesa lançada com sucesso.",
        onSuccess: () => closeModal(),
      },
    );

    if (result) reload();
    setIsSaving(false);
  }

  function alternarStatus(despesa) {
    const proximoStatus = despesa.status === "Pago" ? "Pendente" : "Pago";

    run(
      () =>
        despesasService.changeStatus(
          despesa.id,
          proximoStatus,
          proximoStatus === "Pago" ? todayInputValue() : undefined,
        ),
      {
        successMessage: `Despesa marcada como ${proximoStatus.toLowerCase()}.`,
        onSuccess: () => reload(),
      },
    );
  }

  function excluirDespesa(despesa) {
    if (!window.confirm(`Excluir a despesa "${despesa.descricao}"?`)) return;

    run(() => despesasService.remove(despesa.id), {
      successMessage: "Despesa excluída.",
      onSuccess: () => reload(),
    });
  }

  const rows = despesas.map((despesa) => ({
    ...despesa,
    categoriaLabel: categoriaLabel(despesa.categoria),
    acomodacaoLabel: despesa.acomodacao?.nome ?? "Geral",
    valorLabel: formatCurrency(despesa.valor),
    dataVencimentoLabel: formatDate(despesa.dataVencimento),
    statusBadge: <StatusBadge status={despesa.status} />,
  }));

  return (
    <>
      <div className="despesas-page">
        {!compact && (
          <Card
            title="Filtro de Despesas"
            subtitle="Gerencie as saídas financeiras e contas"
          >
            <div className="filter-grid">
              <Input
                label="Buscar por descrição"
                name="busca"
                placeholder="Ex: Taxa de condomínio"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
              <Select
                label="Status"
                name="status"
                value={statusFiltro}
                onChange={(event) => setStatusFiltro(event.target.value)}
                placeholder="Todos os status"
                options={toOptions(DESPESA_STATUS)}
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
          title="Lançamentos de Despesas"
          subtitle="Contas a pagar e pagas"
          action={
            <Button variant="secondary" onClick={openCreateModal}>
              Nova despesa
            </Button>
          }
        >
          <Table
            columns={columns}
            data={rows}
            isLoading={isLoading}
            emptyMessage="Nenhuma despesa encontrada."
            actions={(despesa) => (
              <div className="financeiro-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => alternarStatus(despesa)}
                >
                  {despesa.status === "Pago"
                    ? "Marcar pendente"
                    : "Marcar pago"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(despesa)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => excluirDespesa(despesa)}
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
        title={editingId ? "Editar despesa" : "Lançar despesa"}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              type="submit"
              form="despesa-form"
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <form id="despesa-form" className="modal-form" onSubmit={saveDespesa}>
          <Input
            label="Descrição"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            placeholder="Ex: Taxa de condomínio"
            required
          />

          <Select
            label="Categoria"
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            options={toOptions(DESPESA_CATEGORIAS, categoriaLabel)}
            required
          />

          <Select
            label="Vincular a imóvel"
            name="acomodacaoId"
            value={form.acomodacaoId}
            onChange={handleChange}
            placeholder="Selecione o imóvel"
            options={[
              { value: "geral", label: "Despesa geral" },
              ...accommodations.map((acomodacao) => ({
                value: acomodacao.id,
                label: acomodacao.nome,
              })),
            ]}
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
            label="Data de vencimento"
            type="date"
            name="dataVencimento"
            value={form.dataVencimento}
            onChange={handleChange}
            required
          />

          <Input
            label="Data de pagamento"
            type="date"
            name="dataPagamento"
            value={form.dataPagamento}
            onChange={handleChange}
            helperText="Preencha quando a conta estiver quitada."
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={toOptions(DESPESA_STATUS)}
            required
          />
        </form>
      </Modal>
    </>
  );
}
