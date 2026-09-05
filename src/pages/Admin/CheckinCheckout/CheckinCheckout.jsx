import React, { useState } from "react";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Select from "../../../components/Select/Select";
import Table from "../../../components/Table/Table";
import Modal from "../../../components/Modal/Modal";
import "./CheckinCheckout.css";

export default function CheckinCheckout() {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    guest: "",
    status: "",
  });

  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "pending_checkin", label: "Aguardando check-in" },
    { value: "checked_in", label: "Hospedado" },
    { value: "pending_checkout", label: "Aguardando check-out" },
    { value: "checked_out", label: "Finalizado" },
  ];

  const columns = [
    { key: "guest", label: "Hóspede" },
    { key: "accommodation", label: "Acomodação" },
    { key: "checkIn", label: "Check-in" },
    { key: "checkOut", label: "Check-out" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Ações" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="checkin-checkout-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gestão</p>
          <h1>Check-in / Check-out</h1>
          <p>Gerencie a entrada e saída dos hóspedes.</p>
        </div>
      </div>

      <Card title="Filtros">
        <form className="filter-grid" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Data inicial"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />

          <Input
            label="Data final"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />

          <Input
            label="Hóspede"
            type="text"
            name="guest"
            placeholder="Nome do hóspede"
            value={formData.guest}
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
            Filtrar
          </Button>
        </form>
      </Card>

      <Card title="Hospedagens">
        <Table
          columns={columns}
          data={[]}
          emptyMessage="Nenhuma hospedagem encontrada."
        />
      </Card>

      <Modal
        isOpen={false}
        onClose={() => {}}
        title="Confirmar operação"
        footer={
          <>
            <Button variant="outline">Cancelar</Button>
            <Button variant="secondary">Confirmar</Button>
          </>
        }
      >
        <p>Deseja confirmar esta operação?</p>
      </Modal>
    </div>
  );
}