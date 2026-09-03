import { useMemo, useState } from "react";
import Button from "../../../components/Button/Button";
import Input from "../../../components/Input/Input";
import Layout from "../../../components/Layout/Layout";
import Modal from "../../../components/Modal/Modal";
import Select from "../../../components/Select/Select";
import Table from "../../../components/Table/Table";
import { adminNavItems } from "../../navigation";
import "./Hospedes.css";

const initialGuests = [
  {
    id: 1,
    nome: "Mariana Alves",
    cpf: "123.456.789-00",
    telefone: "(85) 99999-1001",
    email: "mariana@email.com",
    status: "Ativo",
  },
  {
    id: 2,
    nome: "Carlos Lima",
    cpf: "987.654.321-00",
    telefone: "(85) 99999-1002",
    email: "carlos@email.com",
    status: "Ativo",
  },
  {
    id: 3,
    nome: "João Pereira",
    cpf: "456.789.123-00",
    telefone: "(85) 99999-1003",
    email: "joao@email.com",
    status: "Inativo",
  },
];

const emptyForm = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  status: "Ativo",
};

const columns = [
  { key: "nome", label: "Nome" },
  { key: "cpf", label: "CPF" },
  { key: "telefone", label: "Telefone" },
  { key: "email", label: "E-mail" },
  { key: "status", label: "Status" },
];

export default function Hospedes({
  onNavigate,
  onLogout,
  onViewProfile,
  onChangeAccount,
  onAccountSave,
  account,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [guests, setGuests] = useState(initialGuests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredGuests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return guests.filter((guest) => {
      const matchesSearch =
        !term ||
        guest.nome.toLowerCase().includes(term) ||
        guest.cpf.toLowerCase().includes(term) ||
        guest.email.toLowerCase().includes(term);

      const matchesStatus = !statusFilter || guest.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [guests, search, statusFilter]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(guest) {
    setEditingId(guest.id);
    setForm({
      nome: guest.nome,
      cpf: guest.cpf,
      telefone: guest.telefone,
      email: guest.email,
      status: guest.status,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function saveGuest() {
    if (
      !form.nome.trim() ||
      !form.cpf.trim() ||
      !form.telefone.trim() ||
      !form.email.trim()
    ) {
      return;
    }

    if (editingId) {
      setGuests((current) =>
        current.map((guest) =>
          guest.id === editingId ? { ...guest, ...form } : guest,
        ),
      );
    } else {
      setGuests((current) => [...current, { id: Date.now(), ...form }]);
    }

    closeModal();
  }

  function deleteGuest(id) {
    const confirmed = window.confirm("Deseja realmente excluir este hóspede?");
    if (!confirmed) return;

    setGuests((current) => current.filter((guest) => guest.id !== id));
  }

  return (
    <Layout
      title="Hóspedes"
      navItems={adminNavItems}
      activeItem="hospedes"
      onNavigate={onNavigate}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      userName={account?.name || "Administrador"}
      userRole="Administrador"
      onLogout={onLogout}
      onViewProfile={onViewProfile}
      onChangeAccount={onChangeAccount}
      userEmail={account?.email}
      onAccountSave={onAccountSave}
    >
      <div className="guests-page">
        <section className="guests-heading">
          <div>
            <p className="page-eyebrow">Cadastros</p>
            <h2>Gestão de hóspedes</h2>
            <p>Cadastre, consulte, edite e exclua hóspedes do sistema.</p>
          </div>

          <Button onClick={openCreateModal}>Novo hóspede</Button>
        </section>

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
            options={[
              { label: "Ativo", value: "Ativo" },
              { label: "Inativo", value: "Inativo" },
            ]}
          />
        </section>

        <section className="guest-table-section">
          <div className="guest-result-count">
            {filteredGuests.length} hóspede(s) encontrado(s)
          </div>

          <Table
            columns={columns}
            data={filteredGuests}
            emptyMessage="Nenhum hóspede encontrado."
            actions={(guest) => (
              <div className="guest-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditModal(guest)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteGuest(guest.id)}
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
            <Button onClick={saveGuest}>
              {editingId ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </>
        }
      >
        <div className="guest-form-grid">
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
            required
          />

          <Input
            label="Telefone"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            required
          />

          <Input
            label="E-mail"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="hospede@email.com"
            required
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            options={[
              { label: "Ativo", value: "Ativo" },
              { label: "Inativo", value: "Inativo" },
            ]}
          />
        </div>
      </Modal>
    </Layout>
  );
}
