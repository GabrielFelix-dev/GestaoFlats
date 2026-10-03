import { useCallback, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import Modal from "../../../components/Modal/Modal";
import Select from "../../../components/Select/Select";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Table from "../../../components/Table/Table";
import { acomodacoesService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useFeedback } from "../../../hooks/useFeedback";
import { formatCurrency, pluralize } from "../../../utils/format";
import { ACOMODACAO_STATUS, ACOMODACAO_TIPOS, toOptions } from "../../../utils/labels";
import "./Acomodacoes.css";

const emptyForm = {
  nome: "",
  tipo: "Flat",
  capacidade: "",
  valorDiaria: "",
  andar: "",
  descricao: "",
  status: "Disponivel",
};

const columns = [
  { key: "nome", label: "Acomodação" },
  { key: "tipo", label: "Tipo" },
  { key: "capacidadeLabel", label: "Capacidade" },
  { key: "valorDiariaLabel", label: "Valor da diária" },
  { key: "statusBadge", label: "Status" },
];

export default function Acomodacoes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedSearch = useDebouncedValue(search);
  const { feedback, clear, run } = useFeedback();

  const load = useCallback(
    () =>
      acomodacoesService.list({
        search: debouncedSearch.trim(),
        status: statusFilter,
        tipo: tipoFilter,
      }),
    [debouncedSearch, statusFilter, tipoFilter],
  );

  const { data, isLoading, error, reload } = useApiResource(load, [
    debouncedSearch,
    statusFilter,
    tipoFilter,
  ]);

  const acomodacoes = data ?? [];

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

  function openEditModal(acomodacao) {
    setEditingId(acomodacao.id);
    setForm({
      nome: acomodacao.nome ?? "",
      tipo: acomodacao.tipo ?? "Flat",
      capacidade: String(acomodacao.capacidade ?? ""),
      valorDiaria: String(acomodacao.valorDiaria ?? ""),
      andar: acomodacao.andar ?? "",
      descricao: acomodacao.descricao ?? "",
      status: acomodacao.status ?? "Disponivel",
    });
    clear();
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveAccommodation(event) {
    event?.preventDefault();
    setIsSaving(true);

    const payload = {
      nome: form.nome.trim(),
      tipo: form.tipo,
      capacidade: Number(form.capacidade),
      valorDiaria: Number(form.valorDiaria),
      status: form.status,
    };

    if (form.andar.trim()) payload.andar = form.andar.trim();
    if (form.descricao.trim()) payload.descricao = form.descricao.trim();

    const result = await run(
      () =>
        editingId
          ? acomodacoesService.update(editingId, payload)
          : acomodacoesService.create(payload),
      {
        successMessage: editingId
          ? "Acomodação atualizada com sucesso."
          : "Acomodação cadastrada com sucesso.",
        onSuccess: () => closeModal(),
      },
    );

    if (result) reload();
    setIsSaving(false);
  }

  function deleteAccommodation(acomodacao) {
    if (!window.confirm(`Excluir a acomodação ${acomodacao.nome}?`)) return;

    run(() => acomodacoesService.remove(acomodacao.id), {
      successMessage: "Acomodação excluída.",
      onSuccess: () => reload(),
    });
  }

  const rows = acomodacoes.map((acomodacao) => ({
    ...acomodacao,
    capacidadeLabel: pluralize(
      Number(acomodacao.capacidade) || 0,
      "hóspede",
      "hóspedes",
    ),
    valorDiariaLabel: formatCurrency(acomodacao.valorDiaria),
    statusBadge: <StatusBadge status={acomodacao.status} />,
  }));

  return (
    <>
      <div className="accommodations-page">
        <section className="accommodations-heading">
          <div>
            <p className="page-eyebrow">Cadastros</p>
            <h2>Gestão de acomodações</h2>
            <p>Cadastre, consulte, edite e exclua as acomodações disponíveis.</p>
          </div>

          <Button variant="secondary" onClick={openCreateModal}>
            Nova acomodação
          </Button>
        </section>

        {feedback && (
          <Alert type={feedback.type} message={feedback.message} onClose={clear} />
        )}
        {error && <Alert message={error} onClose={reload} />}

        <section
          className="accommodations-filters"
          aria-label="Filtros de acomodações"
        >
          <Input
            label="Pesquisar"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome da acomodação"
          />

          <Select
            label="Tipo"
            name="tipoFilter"
            value={tipoFilter}
            onChange={(event) => setTipoFilter(event.target.value)}
            placeholder="Todos"
            options={toOptions(ACOMODACAO_TIPOS, (value) => value)}
          />

          <Select
            label="Status"
            name="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="Todos"
            options={toOptions(ACOMODACAO_STATUS)}
          />
        </section>

        <section className="accommodations-table-section">
          <div className="accommodations-result-count">
            {acomodacoes.length} acomodação(ões) encontrada(s)
          </div>

          <Table
            columns={columns}
            data={rows}
            isLoading={isLoading}
            emptyMessage="Nenhuma acomodação encontrada."
            actions={(acomodacao) => (
              <div className="accommodations-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(acomodacao)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteAccommodation(acomodacao)}
                >
                  Excluir
                </Button>
              </div>
            )}
          />
        </section>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? "Editar acomodação" : "Cadastrar acomodação"}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              type="submit"
              form="acomodacao-form"
              disabled={isSaving}
            >
              {isSaving
                ? "Salvando..."
                : editingId
                  ? "Salvar alterações"
                  : "Cadastrar"}
            </Button>
          </>
        }
      >
        <form
          id="acomodacao-form"
          className="modal-form accommodations-form-grid"
          onSubmit={saveAccommodation}
        >
          <Input
            label="Nome da acomodação"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Ex: Flat 101"
            required
          />

          <Select
            label="Tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            required
            options={toOptions(ACOMODACAO_TIPOS, (value) => value)}
          />

          <Input
            label="Capacidade"
            type="number"
            name="capacidade"
            min={1}
            max={20}
            value={form.capacidade}
            onChange={handleChange}
            placeholder="Nº de hóspedes"
            required
          />

          <Input
            label="Valor da diária (R$)"
            type="number"
            name="valorDiaria"
            min={0}
            step="0.01"
            value={form.valorDiaria}
            onChange={handleChange}
            placeholder="0,00"
            required
          />

          <Input
            label="Andar"
            name="andar"
            value={form.andar}
            onChange={handleChange}
            placeholder="Ex: 1º andar"
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            options={toOptions(ACOMODACAO_STATUS)}
          />

          <Input
            label="Descrição"
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            placeholder="Características da acomodação (opcional)"
          />
        </form>
      </Modal>
    </>
  );
}
