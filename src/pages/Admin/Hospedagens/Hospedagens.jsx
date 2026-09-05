import React, { useState } from "react";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Select from "../../../components/Select/Select";
import Table from "../../../components/Table/Table";
import { hospedagens as initialHospedagens } from "../../../data/hospedagens";
import "./Hospedagens.css";

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
  { key: "hospede", label: "Hóspede" },
  { key: "acomodacao", label: "Acomodação" },
  { key: "checkIn", label: "Check-in" },
  { key: "checkOut", label: "Check-out" },
  { key: "valorTotal", label: "Valor Total" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Ações" },
];

export default function Hospedagens() {
  const [hospedagens, setHospedagens] = useState(initialHospedagens);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");

  const handleCancelarReserva = (id) => {
    setHospedagens((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Cancelada" } : item
      )
    );
  };

  const handleExcluirReserva = (id) => {
    setHospedagens((prev) => prev.filter((item) => item.id !== id));
  };

  const hospedagensFiltradas = hospedagens.filter((h) => {
    const matchBusca =
      h.hospede.toLowerCase().includes(busca.toLowerCase()) ||
      h.acomodacao.toLowerCase().includes(busca.toLowerCase());
    const matchStatus =
      statusFiltro === "todos" || h.status.toLowerCase() === statusFiltro;
    return matchBusca && matchStatus;
  });

  const hospedagensComAcoes = hospedagensFiltradas.map((item) => ({
    ...item,
    actions: (
      <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
        <button 
          style={actionButtonStyle} 
          title="Cancelar Reserva" 
          onClick={() => handleCancelarReserva(item.id)}
        >
          🚫
        </button>
        <button 
          style={{ ...actionButtonStyle, color: "#e63946" }} 
          title="Excluir do Sistema" 
          onClick={() => handleExcluirReserva(item.id)}
        >
          🗑️
        </button>
      </div>
    ),
  }));

  return (
    <div className="hospedagens-page">
      <Card title="Filtro de Hospedagens" subtitle="Pesquise por hóspede ou acomodação">
        <div className="filter-grid">
          <Input
            label="Buscar"
            name="busca"
            placeholder="Nome do hóspede ou acomodação..."
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
              { value: "ativa", label: "Ativa" },
              { value: "confirmada", label: "Confirmada" },
              { value: "finalizada", label: "Finalizada" },
              { value: "cancelada", label: "Cancelada" },
            ]}
          />
          <Button variant="secondary" type="button">
            Filtrar
          </Button>
        </div>
      </Card>

      <Card title="Lista de Hospedagens" subtitle="Gerenciamento de reservas ativas e históricas">
        <Table
          columns={columns}
          data={hospedagensComAcoes}
          emptyMessage="Nenhuma hospedagem encontrada."
        />
      </Card>
    </div>
  );
}