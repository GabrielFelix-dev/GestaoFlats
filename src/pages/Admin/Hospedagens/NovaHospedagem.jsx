import React, { useState } from "react";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Select from "../../../components/Select/Select";
import "./NovaHospedagem.css";

export default function NovaHospedagem() {
  const [formData, setFormData] = useState({
    hospede: "",
    acomodacao: "",
    checkIn: "",
    checkOut: "",
    valorTotal: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Hospedagem cadastrada com sucesso!");
  };

  const handleCancel = () => {
    setFormData({
      hospede: "",
      acomodacao: "",
      checkIn: "",
      checkOut: "",
      valorTotal: "",
    });
  };

  return (
    <div className="nova-hospedagem-page">
      <Card title="Nova Hospedagem" subtitle="Preencha os dados para registrar uma reserva">
        <form onSubmit={handleSubmit} className="nova-hospedagem-form">
          <Input
            label="Nome do Hóspede"
            name="hospede"
            placeholder="Digite o nome completo"
            value={formData.hospede}
            onChange={handleChange}
          />
          <Select
            label="Acomodação"
            name="acomodacao"
            value={formData.acomodacao}
            onChange={handleChange}
            options={[
              { value: "", label: "Selecione a acomodação" },
              { value: "Flat 101", label: "Flat 101" },
              { value: "Flat 102", label: "Flat 102" },
              { value: "Studio 201", label: "Studio 201" },
            ]}
          />
          <Input
            label="Data de Check-in"
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
          />
          <Input
            label="Data de Check-out"
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
          />
          <Input
            label="Valor Total (R$)"
            name="valorTotal"
            placeholder="Ex: 1200,00"
            value={formData.valorTotal}
            onChange={handleChange}
          />
          <div className="nova-hospedagem-actions">
            <Button variant="primary" type="submit">
              Salvar Reserva
            </Button>
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}