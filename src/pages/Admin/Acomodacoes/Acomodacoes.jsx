import { useMemo, useState } from "react";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import Modal from "../../../components/Modal/Modal";
import Select from "../../../components/Select/Select";
import Table from "../../../components/Table/Table";
import "./Acomodacoes.css";

const tipoOptions = [
  { label: "Flat", value: "Flat" },
  { label: "Quarto", value: "Quarto" },
  { label: "Studio", value: "Studio" },
  { label: "Apartamento", value: "Apartamento" },
];

const statusOptions = [
  { label: "Disponível", value: "Disponível" },
  { label: "Ocupada", value: "Ocupada" },
  { label: "Manutenção", value: "Manutenção" },
  { label: "Inativa", value: "Inativa" },
];

const initialAccommodations = [
  { id: 1, nome: "Flat 101", tipo: "Flat", capacidade: 2, valorDiaria: 180, status: "Disponível" },
  { id: 2, nome: "Flat 204", tipo: "Flat", capacidade: 4, valorDiaria: 260, status: "Ocupada" },
  { id: 3, nome: "Quarto 03", tipo: "Quarto", capacidade: 1, valorDiaria: 110, status: "Disponível" },
  { id: 4, nome: "Studio 01", tipo: "Studio", capacidade: 2, valorDiaria: 150, status: "Manutenção" },
];

const emptyForm = {
  nome: "",
  tipo: "Flat",
  capacidade: "",
  valorDiaria: "",
  status: "Disponível",
};

const columns = [
  { key: "nome", label: "Acomodação" },
  { key: "tipo", label: "Tipo" },
  { key: "capacidadeLabel", label: "Capacidade" },
  { key: "valorDiariaLabel", label: "Valor da diária" },
  { key: "status", label: "Status" },
];

function formatCurrency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Acomodacoes({ onNavigate }) {
  const [accommodations, setAccommodations] = useState(initialAccommodations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredAccommodations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return accommodations
      .filter((item) => {
        const matchesSearch = !term || item.nome.toLowerCase().includes(term);
        const matchesStatus = !statusFilter || item.status === statusFilter;
        const matchesTipo = !tipoFilter || item.tipo === tipoFilter;
        return matchesSearch && matchesStatus && matchesTipo;
      })
      .map((item) => ({
        ...item,
        capacidadeLabel: `${item.capacidade} hóspede${Number(item.capacidade) === 1 ? "" : "s"}`,
        valorDiariaLabel: formatCurrency(item.valorDiaria),
      }));
  }, [accommodations, search, statusFilter, tipoFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(accommodation) {
    setEditingId(accommodation.id);
    setForm({
      nome: accommodation.nome,
      tipo: accommodation.tipo,
      capacidade: String(accommodation.capacidade),
      valorDiaria: String(accommodation.valorDiaria),
      status: accommodation.status,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function saveAccommodation() {
    if (!form.nome.trim() || !form.capacidade || !form.valorDiaria) {
      return;
    }

    const payload = {
      ...form,
      capacidade: Number(form.capacidade),
      valorDiaria: Number(form.valorDiaria),
    };

    if (editingId) {
      setAccommodations((current) =>
        current.map((item) =>
          item.id === editingId ? { ...item, ...payload } : item,
        ),
      );
    } else {
      setAccommodations((current) => [
        ...current,
        { id: Date.now(), ...payload },
      ]);
    }

    closeModal();
  }

  function deleteAccommodation(id) {
    const confirmed = window.confirm("Deseja realmente excluir esta acomodação?");
    if (!confirmed) return;

    setAccommodations((current) => current.filter((item) => item.id !== id));
  }

  return (
    <>
      <div className="accommodations-page">
        <section className="accommodations-heading">
          <div>
            <p className="page-eyebrow">Cadastros</p>
            <h2>Gestão de acomodações</h2>
            <p>Cadastre, consulte, edite e exclua as acomodações disponíveis.</p>
          </div>

          <Button variant="secondary" onClick={openCreateModal}>Nova acomodação</Button>
        </section>

        <section className="accommodations-filters" aria-label="Filtros de acomodações">
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
            options={tipoOptions}
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

        <section className="accommodations-table-section">
          <div className="accommodations-result-count">
            {filteredAccommodations.length} acomodação(ões) encontrada(s)
          </div>

          <Table
            columns={columns}
            data={filteredAccommodations}
            emptyMessage="Nenhuma acomodação encontrada."
            actions={(accommodation) => (
              <div className="accommodations-actions">
                <Button size="sm" variant="outline" onClick={() => openEditModal(accommodation)}>
                  Editar
                </Button>
                <Button size="sm" variant="danger" onClick={() => deleteAccommodation(accommodation.id)}>
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
            <Button variant="secondary" onClick={saveAccommodation}>
              {editingId ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </>
        }
      >
        <div className="accommodations-form-grid">
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
            options={tipoOptions}
          />

          <Input
            label="Capacidade"
            type="number"
            name="capacidade"
            value={form.capacidade}
            onChange={handleChange}
            placeholder="Nº de hóspedes"
            required
          />

          <Input
            label="Valor da diária"
            type="number"
            name="valorDiaria"
            value={form.valorDiaria}
            onChange={handleChange}
            placeholder="0,00"
            required
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            options={statusOptions}
          />
        </div>
      </Modal>
    </>
  );
}
