import { useCallback, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import Modal from "../../../components/Modal/Modal";
import Select from "../../../components/Select/Select";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Table from "../../../components/Table/Table";
import { hospedesService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useFeedback } from "../../../hooks/useFeedback";
import {
  maskCpf,
  maskTelefone,
  masks,
  normalizeSearchTerm,
  onlyDigits,
} from "../../../utils/mask";
import {
  DOCUMENTO_TIPOS,
  HOSPEDE_STATUS,
  toOptions,
} from "../../../utils/labels";
import "./Hospedes.css";

const emptyForm = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  documentoTipo: "CPF",
  observacoes: "",
  status: "Ativo",
};

const columns = [
  { key: "nome", label: "Nome" },
  { key: "cpf", label: "CPF" },
  { key: "telefone", label: "Telefone" },
  { key: "email", label: "E-mail" },
  { key: "statusBadge", label: "Status" },
];

export default function Hospedes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedSearch = useDebouncedValue(search);
  const { feedback, clear, run } = useFeedback();

  const load = useCallback(
    () =>
      hospedesService.list({
        search: normalizeSearchTerm(debouncedSearch),
        status: statusFilter,
      }),
    [debouncedSearch, statusFilter],
  );

  const { data, isLoading, error, reload } = useApiResource(load, [
    debouncedSearch,
    statusFilter,
  ]);

  const hospedes = data ?? [];

  function handleChange(event) {
    const { name, value } = event.target;
    const mask = masks[name];

    setForm((current) => ({
      ...current,
      [name]: mask ? mask(value) : value,
    }));
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    clear();
    setIsModalOpen(true);
  }

  function openEditModal(hospede) {
    setEditingId(hospede.id);
    setForm({
      nome: hospede.nome ?? "",
      cpf: maskCpf(hospede.cpf),
      telefone: maskTelefone(hospede.telefone),
      email: hospede.email ?? "",
      documentoTipo: hospede.documentoTipo ?? "CPF",
      observacoes: hospede.observacoes ?? "",
      status: hospede.status ?? "Ativo",
    });
    clear();
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveGuest(event) {
    event?.preventDefault();
    setIsSaving(true);

    const payload = {
      nome: form.nome.trim(),
      cpf: onlyDigits(form.cpf),
      status: form.status,
    };

    if (onlyDigits(form.telefone)) payload.telefone = onlyDigits(form.telefone);
    if (form.email.trim()) payload.email = form.email.trim();
    if (form.observacoes.trim()) payload.observacoes = form.observacoes.trim();
    if (form.documentoTipo) payload.documentoTipo = form.documentoTipo;

    const result = await run(
      () =>
        editingId
          ? hospedesService.update(editingId, payload)
          : hospedesService.create(payload),
      {
        successMessage: editingId
          ? "Hóspede atualizado com sucesso."
          : "Hóspede cadastrado com sucesso.",
        onSuccess: () => closeModal(),
      },
    );

    if (result) reload();
    setIsSaving(false);
  }

  function deleteGuest(hospede) {
    if (!window.confirm(`Excluir o hóspede ${hospede.nome}?`)) return;

    run(() => hospedesService.remove(hospede.id), {
      successMessage: "Hóspede excluído.",
      onSuccess: () => reload(),
    });
  }

  const rows = hospedes.map((hospede) => ({
    ...hospede,
    cpf: maskCpf(hospede.cpf),
    telefone: maskTelefone(hospede.telefone),
    statusBadge: <StatusBadge status={hospede.status} />,
  }));

  return (
    <>
      <div className="guests-page">
        <section className="guests-heading">
          <div>
            <p className="page-eyebrow">Cadastros</p>
            <h2>Gestão de hóspedes</h2>
            <p>Cadastre, consulte, edite e exclua hóspedes do sistema.</p>
          </div>

          <Button variant="secondary" onClick={openCreateModal}>
            Novo hóspede
          </Button>
        </section>

        {feedback && (
          <Alert
            type={feedback.type}
            message={feedback.message}
            onClose={clear}
          />
        )}
        {error && <Alert message={error} onClose={reload} />}

        <section className="guest-filters" aria-label="Filtros de hóspedes">
          <Input
            label="Pesquisar"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, CPF ou e-mail"
          />

          <Select
            label="Status"
            name="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="Todos"
            options={toOptions(HOSPEDE_STATUS)}
          />
        </section>

        <section className="guest-table-section">
          <div className="guest-result-count">
            {hospedes.length} hóspede(s) encontrado(s)
          </div>

          <Table
            columns={columns}
            data={rows}
            isLoading={isLoading}
            emptyMessage="Nenhum hóspede encontrado."
            actions={(hospede) => (
              <div className="guest-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(hospede)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteGuest(hospede)}
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
        title={editingId ? "Editar hóspede" : "Cadastrar hóspede"}
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              type="submit"
              form="hospede-form"
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
          id="hospede-form"
          className="modal-form guest-form-grid"
          onSubmit={saveGuest}
        >
          <Input
            label="Nome completo"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            placeholder="Digite o nome"
            required
          />

          <Input
            label="CPF"
            name="cpf"
            value={form.cpf}
            onChange={handleChange}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
          />

          <Input
            label="Telefone"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            inputMode="numeric"
            maxLength={15}
          />

          <Input
            label="E-mail"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="hospede@email.com"
          />

          <Select
            label="Documento"
            name="documentoTipo"
            value={form.documentoTipo}
            onChange={handleChange}
            options={toOptions(DOCUMENTO_TIPOS)}
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            options={toOptions(HOSPEDE_STATUS)}
          />

          <Input
            label="Observações"
            name="observacoes"
            value={form.observacoes}
            onChange={handleChange}
            placeholder="Informações adicionais (opcional)"
          />
        </form>
      </Modal>
    </>
  );
}
