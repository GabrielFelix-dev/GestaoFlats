import React from "react";
import Card from "../../../components/Card/Card";

export default function DetalhesHospedagem() {
  return (
    <div className="detalhes-hospedagem-page">
      <Card title="Detalhes da Hospedagem" subtitle="Informações completas do registro">
        <div style={{ display: "grid", gap: "0.75rem", lineHeight: "1.5" }}>
          <p><strong>Hóspede:</strong> Ana Beatriz</p>
          <p><strong>Acomodação:</strong> Flat 101</p>
          <p><strong>Check-in:</strong> 05/10/2026</p>
          <p><strong>Check-out:</strong> 12/10/2026</p>
          <p><strong>Valor Total:</strong> R$ 1.750,00</p>
          <p><strong>Status:</strong> Ativa</p>
        </div>
      </Card>
    </div>
  );
}