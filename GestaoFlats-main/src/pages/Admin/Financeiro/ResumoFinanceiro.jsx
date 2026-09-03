import React from "react";
import Card from "../../../components/Card/Card";

export default function ResumoFinanceiro() {
  const resumoData = [
    { label: "Receitas Totais", valor: "R$ 15.400,00", cor: "#2a9d8f" },
    { label: "Despesas Totais", valor: "R$ 4.250,00", cor: "#e63946" },
    { label: "Saldo em Caixa", valor: "R$ 11.150,00", cor: "#1d3557" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
      {resumoData.map((item, index) => (
        <Card key={index}>
          <div style={{ padding: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem", color: "#6c757d" }}>{item.label}</span>
            <h2 style={{ color: item.cor, marginTop: "0.5rem", fontSize: "1.6rem" }}>{item.valor}</h2>
          </div>
        </Card>
      ))}
    </div>
  );
}