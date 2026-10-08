import { useCallback, useRef, useState, useEffect } from "react";
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
  maskRg,
  maskCnh,
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

/** Estado inicial do formulário de hóspede (criação e edição). */
const emptyForm = {
  nome: "",
  documento: "",
  telefone: "",
  email: "",
  documentoTipo: "CPF",
  observacoes: "",
  status: "Ativo",
};

/**
 * Colunas da tabela.
 * `width` + table-layout:fixed (Table.css) garante larguras fixas e
 * evita quebra de layout quando a sidebar reduz a área de conteúdo.
 */
const columns = [
  { key: "nome", label: "Nome", width: "50%" },
  { key: "cpf", label: "Documento", width: "20%" },
  { key: "statusBadge", label: "Status", width: "15%" },
];

export default function Hospedes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailsHospede, setDetailsHospede] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Quando o tipo de documento mudar, reformata o valor com a máscara correta.
  const tipoAnteriorRef = useRef(form.documentoTipo);

  useEffect(() => {
    if (tipoAnteriorRef.current !== form.documentoTipo) {
      tipoAnteriorRef.current = form.documentoTipo;
      const mask = getDocumentMask();
      setForm((current) => ({
        ...current,
        documento: mask(current.documento),
      }));
    }
  }, [form.documentoTipo]);

  // Debounce no input de busca para não disparar request a cada tecla.
  const debouncedSearch = useDebouncedValue(search);
  const { feedback, clear, run } = useFeedback();

  // Lista com filtros; `normalizeSearchTerm` remove pontuação se busca for só dígitos
  // (permite achar CPF digitado com ou sem máscara).
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

/**
 * Handler único para inputs do formulário.
 * Aplica máscara (documento/telefone) em tempo real via `masks[name]`
 * ou conforme o tipo de documento selecionado para o campo `documento`.
 */
function getDocumentMask() {
  const tipo = form.documentoTipo;

  if (tipo === "RG") return maskRg;
  if (tipo === "CNH") return maskCnh;

  return maskCpf;
}

function handleChange(event) {
  const { name, value } = event.target;
  let mask = masks[name];

  if (name === "documento") {
    mask = getDocumentMask();
  }

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

/**
 * Preenche formulário com dados do hóspede para edição.
 * Reaplica máscaras nos valores vindos da API (que vêm sem pontuação).
 */
function openEditModal(hospede) {
  const tipo = hospede.documentoTipo ?? "CPF";
  const documento = tipo === "RG" ? maskRg(hospede.cpf) : tipo === "CNH" ? maskCnh(hospede.cpf) : maskCpf(hospede.cpf);

  setEditingId(hospede.id);
  setForm({
    nome: hospede.nome ?? "",
    documento,
    telefone: maskTelefone(hospede.telefone),
    email: hospede.email ?? "",
    documentoTipo: tipo,
    observacoes: hospede.observacoes ?? "",
    status: hospede.status ?? "Ativo",
  });
  clear();
  setIsModalOpen(true);
}

  function openDetailsModal(hospede) {
    setDetailsHospede(hospede);
    setIsDetailsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function closeDetailsModal() {
    setIsDetailsModalOpen(false);
    setDetailsHospede(null);
  }

  /**
   * Salva (create ou update).
   * - `onlyDigits` remove máscaras antes de enviar à API (backend valida só dígitos).
   * - `run` (useFeedback) trata loading, erro e toast de sucesso.
   * - Em sucesso, fecha modal e recarrega lista via `reload()`.
   */
  async function saveGuest(event) {
    event?.preventDefault();
    setIsSaving(true);

    const payload = {
      nome: form.nome.trim(),
      cpf: onlyDigits(form.documento),
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

  /**
   * Prepara linhas para a Table:
   * - Aplica máscaras de exibição (documento/telefone formatados)
   * - Adiciona badge de status como JSX
   */
  const rows = hospedes.map((hospede) => {
    const tipo = hospede.documentoTipo;
    const documento =
      tipo === "RG"
        ? maskRg(hospede.cpf)
        : tipo === "CNH"
          ? maskCnh(hospede.cpf)
          : maskCpf(hospede.cpf);

    return {
      ...hospede,
      cpf: documento,
      telefone: maskTelefone(hospede.telefone),
      statusBadge: <StatusBadge status={hospede.status} />,
    };
  });

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
                  onClick={() => openDetailsModal(hospede)}
                >
                  Detalhes
                </Button>
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
            label={form.documentoTipo === "RG" ? "RG" : form.documentoTipo === "CNH" ? "CNH" : "CPF"}
            name="documento"
            value={form.documento}
            onChange={handleChange}
            placeholder={
              form.documentoTipo === "RG"
                ? "00.000.000-0"
                : form.documentoTipo === "CNH"
                  ? "000.000.000-00"
                  : "000.000.000-00"
            }
            inputMode="numeric"
            maxLength={form.documentoTipo === "RG" ? 12 : 14}
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

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        title="Detalhes do hóspede"
        footer={
          <Button variant="outline" onClick={closeDetailsModal}>
            Fechar
          </Button>
        }
      >
        {detailsHospede && (
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Nome completo</span>
              <span className="detail-value">{detailsHospede.nome}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                {detailsHospede.documentoTipo === "RG" ? "RG" : detailsHospede.documentoTipo === "CNH" ? "CNH" : "CPF"}
              </span>
              <span className="detail-value">
                {detailsHospede.documentoTipo === "RG"
                  ? maskRg(detailsHospede.cpf)
                  : detailsHospede.documentoTipo === "CNH"
                    ? maskCnh(detailsHospede.cpf)
                    : maskCpf(detailsHospede.cpf)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Telefone</span>
              <span className="detail-value">
                {detailsHospede.telefone ? maskTelefone(detailsHospede.telefone) : "—"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">E-mail</span>
              <span className="detail-value">
                {detailsHospede.email || "—"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Documento</span>
              <span className="detail-value">{detailsHospede.documentoTipo || "CPF"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value">
                <StatusBadge status={detailsHospede.status} />
              </span>
            </div>
            {detailsHospede.observacoes && (
              <div className="detail-item detail-full-width">
                <span className="detail-label">Observações</span>
                <span className="detail-value">{detailsHospede.observacoes}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
