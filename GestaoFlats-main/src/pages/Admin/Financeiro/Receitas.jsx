import React, { useState } from "react";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Select from "../../../components/Select/Select";
import Table from "../../../components/Table/Table";
import { receitas as initialReceitas } from "../../../data/receitas";

const actionButtonStyle = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "1.1rem",
  padding: "0.25rem 0.4rem",
  borderRadius: "4px"
};

const columns = [
  { key: "id", label: "ID" },
  { key: "descricao", label: "Descrição" },
  { key: "origem", label: "Origem" },
  { key: "valor", label: "Valor" },
  { key: "data", label: "Data" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Ações" },
];

export default function Receitas() {
  const [receitas, setReceitas] = useState(initialReceitas);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const handleToggleStatus = (id) => {
    setReceitas((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status.toLowerCase() === "recebido" ? "Pendente" : "Recebido" }
          : item
      )
    );
  };
  const handleExcluir = (id) => {
    setReceitas((prev) => prev.filter((item) => item.id !== id));
  };

  const receitasFiltradas = receitas.filter((r) => {
    const matchBusca = r.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = statusFiltro === "todos" || r.status.toLowerCase() === statusFiltro;
    return matchBusca && matchStatus;
  });

  const receitasComAcoes = receitasFiltradas.map((item) => ({
    ...item,
    actions: (
      <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
        <button
          style={actionButtonStyle}
          title={item.status.toLowerCase() === "recebido" ? "Marcar Pendente" : "Marcar Recebido"}
          onClick={() => handleToggleStatus(item.id)}
        >
          {item.status.toLowerCase() === "recebido" ? "↩️" : "💰"}
        </button>
        <button
          style={{ ...actionButtonStyle, color: "#e63946" }}
          title="Excluir Lançamento"
          onClick={() => handleExcluir(item.id)}
        >
          🗑️
        </button>
      </div>
    ),
  }));

  return (
    <div className="receitas-page">
      <Card title="Filtro de Receitas" subtitle="Gerencie as entradas financeiras">
        <div className="filter-grid" style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <Input
            label="Buscar por descrição"
            name="busca"
            placeholder="Ex: Reserva Flat 101"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Select
            label="Status"
            name="status"
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            options={[
              { value: "todos", label: "Todos os Status" },
              { value: "recebido", label: "Recebido" },
              { value: "pendente", label: "Pendente" },
            ]}
          />
          <Button variant="secondary" type="button">
            Filtrar
          </Button>
        </div>
      </Card>

      <Card title="Lançamentos de Receitas" subtitle="Histórico de pagamentos recebidos">
        <Table
          columns={columns}
          data={receitasComAcoes}
          emptyMessage="Nenhuma receita encontrada."
        />
      </Card>
    </div>
  );
}