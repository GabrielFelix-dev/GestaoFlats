import React, { useState } from "react";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Select from "../../../components/Select/Select";
import Table from "../../../components/Table/Table";

export default function Disponibilidade() {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    accommodation: "",
    status: "",
  });

  // Corrigido: Opção padrão vazia incluída para evitar sobreposição com o placeholder
  const accommodationOptions = [
    { value: "", label: "Todas as acomodações" },
    { value: "101", label: "Quarto 101 - Casal" },
    { value: "102", label: "Quarto 102 - Duplo" },
    { value: "201", label: "Suíte Master" },
  ];

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "available", label: "Disponível" },
    { value: "occupied", label: "Ocupado" },
    { value: "reserved", label: "Reservado" },
  ];

  const columns = [
    { key: "accommodation", label: "Acomodação" },
    { key: "type", label: "Tipo" },
    { key: "capacity", label: "Capacidade" },
    { key: "status", label: "Status" },
    { key: "nextReservation", label: "Próxima reserva" },
    { key: "actions", label: "Ações" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Consultas</p>
          <h1>Disponibilidade</h1>
          <p>Consulte a disponibilidade das acomodações.</p>
        </div>
      </div>

      <Card title="Consultar disponibilidade">
        <form className="filter-grid" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Data de entrada"
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
          />

          <Input
            label="Data de saída"
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
          />

          <Select
            label="Acomodação"
            name="accommodation"
            options={accommodationOptions}
            value={formData.accommodation}
            onChange={handleChange}
          />

          <Select
            label="Status"
            name="status"
            options={statusOptions}
            value={formData.status}
            onChange={handleChange}
          />

          <Button type="submit" variant="secondary">
            Consultar
          </Button>
        </form>
      </Card>

      <Card
        title="Acomodações"
        subtitle="Situação atual das acomodações cadastradas."
      >
        <Table
          columns={columns}
          data={[]}
          emptyMessage="Nenhuma acomodação encontrada."
        />
      </Card>
    </div>
  );
}