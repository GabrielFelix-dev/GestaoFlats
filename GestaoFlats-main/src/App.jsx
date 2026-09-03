import { useState } from "react";
import Button from "./components/Button/Button";
import Card from "./components/Card/Card";
import Header from "./components/Header/Header";
import Input from "./components/Input/Input";
import Layout from "./components/Layout/Layout";
import Modal from "./components/Modal/Modal";
import Select from "./components/Select/Select";
import Table from "./components/Table/Table";
import Hospedagens from "./pages/Admin/Hospedagens/Hospedagens";
import Receitas from "./pages/Admin/Financeiro/Receitas";
import Despesas from "./pages/Admin/Financeiro/Despesas";
import ResumoFinanceiro from "./pages/Admin/Financeiro/ResumoFinanceiro";
import Disponibilidade from "./pages/Admin/Disponibilidade/Disponibilidade";
import CheckinCheckout from "./pages/Admin/CheckinCheckout/CheckinCheckout";

const sidebarItems = [
  { label: "Dashboard", value: "Dashboard" },
  { label: "Hóspedes", value: "Hóspedes" },
  { label: "Acomodações", value: "Acomodações" },
  { label: "Hospedagens", value: "Hospedagens" },
  { label: "Disponibilidade", value: "Disponibilidade" },
  { label: "Check-in / Check-out", value: "Check-in / Check-out" },
  { label: "Histórico", value: "Histórico" },
  {
    label: "Financeiro",
    value: "Financeiro",
    children: [
      { label: "Receitas", value: "Receitas" },
      { label: "Despesas", value: "Despesas" },
      { label: "Resumo financeiro", value: "Resumo financeiro" },
    ],
  },
];

const stats = [
  {
    title: "Hospedagens ativas",
    value: "42",
    subtitle: "+8% em relação ao mês",
  },
  { title: "Ocupação", value: "86%", subtitle: "Média semanal" },
  {
    title: "Receitas",
    value: "R$ 18.400",
    subtitle: "Acumulado neste período",
  },
  { title: "Check-ins hoje", value: "11", subtitle: "3 pendentes" },
];

const guestColumns = [
  { key: "nome", label: "Nome" },
  { key: "quarto", label: "Acomodação" },
  { key: "status", label: "Status" },
  { key: "entrada", label: "Check-in" },
  { key: "saida", label: "Check-out" },
];

const guestData = [
  {
    nome: "Ana Beatriz",
    quarto: "Flat 02",
    status: "Ativa",
    entrada: "05/09",
    saida: "12/09",
  },
  {
    nome: "Lucas Mendes",
    quarto: "Quarto 14",
    status: "Confirmada",
    entrada: "07/09",
    saida: "15/09",
  },
  {
    nome: "Marina Costa",
    quarto: "Studio 01",
    status: "Em andamento",
    entrada: "04/09",
    saida: "10/09",
  },
  {
    nome: "Pedro Nobre",
    quarto: "Flat 05",
    status: "Pendente",
    entrada: "11/09",
    saida: "18/09",
  },
];

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "ativa", label: "Ativa" },
  { value: "confirmada", label: "Confirmada" },
  { value: "pendente", label: "Pendente" },
];

export default function App() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Layout
      title={activeItem}
      activeItem={activeItem}
      navItems={sidebarItems}
      onNavigate={setActiveItem}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      userName="Maria Souza"
      userRole="Administrador"
    >
      {/* Suas Páginas */}
      {activeItem === "Hospedagens" && <Hospedagens />}
      {activeItem === "Receitas" && <Receitas />}
      {activeItem === "Despesas" && <Despesas />}
      {(activeItem === "Financeiro" || activeItem === "Resumo financeiro") && (
        <ResumoFinanceiro />
      )}
      {activeItem === "Disponibilidade" && <Disponibilidade />}
      {activeItem === "Check-in / Check-out" && <CheckinCheckout />}

      {/* Dashboard dos seus colegas */}
      {activeItem === "Dashboard" && (
        <div className="dashboard-page">
          <div className="page-header">
            <div>
              <p className="eyebrow">Visão geral</p>
              <h1>Gestão de hospedagens</h1>
            </div>

            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              + Novo hóspede
            </Button>
          </div>

          <div className="stats-grid">
            {stats.map((item) => (
              <Card key={item.title} title={item.title} subtitle={item.subtitle}>
                <div className="stat-value">{item.value}</div>
              </Card>
            ))}
          </div>

          <div className="content-grid">
            <Card title="Filtro rápido" subtitle="Buscar hóspedes e registros">
              <div className="filter-grid">
                <Input label="Nome" name="nome" placeholder="Digite o nome" />
                <Select
                  label="Status"
                  name="status"
                  options={statusOptions}
                  value="all"
                />
                <Button variant="secondary" type="button">
                  Filtrar
                </Button>
              </div>
            </Card>

            <Card title="Resumo rápido" subtitle="Indicadores do período">
              <ul className="summary-list">
                <li>
                  <span>Taxa de ocupação</span>
                  <strong>86%</strong>
                </li>
                <li>
                  <span>Reservas confirmadas</span>
                  <strong>18</strong>
                </li>
                <li>
                  <span>Check-out pendentes</span>
                  <strong>04</strong>
                </li>
              </ul>
            </Card>
          </div>

          <Card title="Últimos hóspedes" subtitle="Acompanhamento geral">
            <Table
              columns={guestColumns}
              data={guestData}
              emptyMessage="Nenhum hóspede encontrado."
            />
          </Card>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cadastrar hóspede"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="modal-form">
          <Input
            label="Nome completo"
            name="nomeCompleto"
            placeholder="Digite o nome"
          />
          <Input
            label="E-mail"
            type="email"
            name="email"
            placeholder="nome@email.com"
          />
          <Select
            label="Tipo de hospedagem"
            name="tipoHospedagem"
            placeholder="Selecione"
            options={[
              { value: "flat", label: "Flat" },
              { value: "quarto", label: "Quarto" },
              { value: "studio", label: "Studio" },
            ]}
          />
        </div>
      </Modal>
    </Layout>
  );
}