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
import {
  ACOMODACAO_STATUS,
  ACOMODACAO_TIPOS,
  toOptions,
} from "../../../utils/labels";
import "./Acomodacoes.css";

const emptyForm = {
  nome: "",
  tipo: "Flat",
  capacidade: "",
  valorDiaria: "",
  andar: "",
  descricao: "",
  endereco: {
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  },
  status: "Disponivel",
};

const columns = [
  { key: "nome", label: "Acomodação", width: "50%" },
  { key: "tipo", label: "Tipo", width: "20%" },
  { key: "statusBadge", label: "Status", width: "15%" },
];

export default function Acomodacoes() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailsAcomodacao, setDetailsAcomodacao] = useState(null);
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

    if (name.startsWith("endereco.")) {
      const field = name.slice("endereco.".length);
      setForm((current) => ({
        ...current,
        endereco: { ...current.endereco, [field]: value },
      }));
      return;
    }

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
      endereco: {
        rua: acomodacao.endereco?.rua ?? "",
        numero: acomodacao.endereco?.numero ?? "",
        complemento: acomodacao.endereco?.complemento ?? "",
        bairro: acomodacao.endereco?.bairro ?? "",
        cidade: acomodacao.endereco?.cidade ?? "",
        estado: acomodacao.endereco?.estado ?? "",
        cep: acomodacao.endereco?.cep ?? "",
      },
      status: acomodacao.status ?? "Disponivel",
    });
    clear();
    setIsModalOpen(true);
  }

  function openDetailsModal(acomodacao) {
    setDetailsAcomodacao(acomodacao);
    setIsDetailsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function closeDetailsModal() {
    setIsDetailsModalOpen(false);
    setDetailsAcomodacao(null);
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
    const endereco = Object.fromEntries(
      Object.entries(form.endereco)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value),
    );
    payload.endereco = Object.keys(endereco).length ? endereco : null;

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
    localizacao:
      [acomodacao.endereco?.bairro, acomodacao.endereco?.cidade]
        .filter(Boolean)
        .join(" · ") || "—",
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
            <p>
              Cadastre, consulte, edite e exclua as acomodações disponíveis.
            </p>
          </div>

          <Button variant="secondary" onClick={openCreateModal}>
            Nova acomodação
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
                  onClick={() => openDetailsModal(acomodacao)}
                >
                  Detalhes
                </Button>
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

          <Input
            label="Rua"
            name="endereco.rua"
            value={form.endereco.rua}
            onChange={handleChange}
          />
          <Input
            label="Número"
            name="endereco.numero"
            value={form.endereco.numero}
            onChange={handleChange}
          />
          <Input
            label="Complemento"
            name="endereco.complemento"
            value={form.endereco.complemento}
            onChange={handleChange}
          />
          <Input
            label="Bairro"
            name="endereco.bairro"
            value={form.endereco.bairro}
            onChange={handleChange}
          />
          <Input
            label="Cidade"
            name="endereco.cidade"
            value={form.endereco.cidade}
            onChange={handleChange}
          />
          <Input
            label="Estado"
            name="endereco.estado"
            maxLength={2}
            value={form.endereco.estado}
            onChange={handleChange}
          />
          <Input
            label="CEP"
            name="endereco.cep"
            value={form.endereco.cep}
            onChange={handleChange}
          />
        </form>
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        title="Detalhes da acomodação"
        footer={
          <Button variant="outline" onClick={closeDetailsModal}>
            Fechar
          </Button>
        }
      >
        {detailsAcomodacao && (
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Nome</span>
              <span className="detail-value">{detailsAcomodacao.nome}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tipo</span>
              <span className="detail-value">{detailsAcomodacao.tipo}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Capacidade</span>
              <span className="detail-value">
                {pluralize(
                  Number(detailsAcomodacao.capacidade) || 0,
                  "hóspede",
                  "hóspedes",
                )}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Valor da diária</span>
              <span className="detail-value">
                {formatCurrency(detailsAcomodacao.valorDiaria)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Andar</span>
              <span className="detail-value">
                {detailsAcomodacao.andar || "—"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value">
                <StatusBadge status={detailsAcomodacao.status} />
              </span>
            </div>
            {detailsAcomodacao.descricao && (
              <div className="detail-item detail-full-width">
                <span className="detail-label">Descrição</span>
                <span className="detail-value">{detailsAcomodacao.descricao}</span>
              </div>
            )}
            {detailsAcomodacao.endereco && (
              <div className="detail-item detail-full-width">
                <span className="detail-label">Endereço completo</span>
                <span className="detail-value">
                  {[
                    detailsAcomodacao.endereco.rua,
                    detailsAcomodacao.endereco.numero,
                    detailsAcomodacao.endereco.complemento,
                    detailsAcomodacao.endereco.bairro,
                    detailsAcomodacao.endereco.cidade,
                    detailsAcomodacao.endereco.estado,
                    detailsAcomodacao.endereco.cep,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
