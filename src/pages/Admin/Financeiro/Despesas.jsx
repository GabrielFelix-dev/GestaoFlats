import React, { useState } from "react";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Select from "../../../components/Select/Select";
import Table from "../../../components/Table/Table";
import { despesas as initialDespesas } from "../../../data/despesas";

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
  { key: "categoria", label: "Categoria" },
  { key: "valor", label: "Valor" },
  { key: "dataVencimento", label: "Vencimento" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Ações" },
];

export default function Despesas() {
  const [despesas, setDespesas] = useState(initialDespesas);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const handleToggleStatus = (id) => {
    setDespesas((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status.toLowerCase() === "pago" ? "Pendente" : "Pago" }
          : item
      )
    );
  };

  const handleExcluir = (id) => {
    setDespesas((prev) => prev.filter((item) => item.id !== id));
  };

  const despesasFiltradas = despesas.filter((d) => {
    const matchBusca = d.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = statusFiltro === "todos" || d.status.toLowerCase() === statusFiltro;
    return matchBusca && matchStatus;
  });

  const despesasComAcoes = despesasFiltradas.map((item) => ({
    ...item,
    actions: (
      <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
        <button
          style={actionButtonStyle}
          title={item.status.toLowerCase() === "pago" ? "Marcar como Pendente" : "Marcar como Pago"}
          onClick={() => handleToggleStatus(item.id)}
        >
          {item.status.toLowerCase() === "pago" ? "↩️" : "✅"}
        </button>
        <button
          style={{ ...actionButtonStyle, color: "#e63946" }}
          title="Excluir Despesa"
          onClick={() => handleExcluir(item.id)}
        >
          🗑️
        </button>
      </div>
    ),
  }));

  return (
    <div className="despesas-page">
      <Card title="Filtro de Despesas" subtitle="Gerencie as saídas financeiras e contas">
        <div className="filter-grid" style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <Input
            label="Buscar por descrição"
            name="busca"
            placeholder="Ex: Taxa de condomínio"
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
              { value: "pago", label: "Pago" },
              { value: "pendente", label: "Pendente" },
            ]}
          />
          <Button variant="secondary" type="button">
            Filtrar
          </Button>
        </div>
      </Card>

      <Card title="Lançamentos de Despesas" subtitle="Contas a pagar e pagas">
        <Table
          columns={columns}
          data={despesasComAcoes}
          emptyMessage="Nenhuma despesa encontrada."
        />
      </Card>
    </div>
  );
}