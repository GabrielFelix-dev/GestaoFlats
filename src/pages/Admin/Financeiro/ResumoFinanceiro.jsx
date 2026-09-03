import React from "react";
import Card from "../../../components/Card/Card";
import "./Financeiro.css";

export default function ResumoFinanceiro() {
  const resumoData = [
    { label: "Receitas Totais", valor: "R$ 15.400,00", variant: "success" },
    { label: "Despesas Totais", valor: "R$ 4.250,00", variant: "danger" },
    { label: "Saldo em Caixa", valor: "R$ 11.150,00", variant: "" },
  ];

  return (
    <div className="resumo-financeiro-grid">
      {resumoData.map((item, index) => (
        <Card key={index}>
          <div
            className={`resumo-financeiro-item ${item.variant}`.trim()}
          >
            <span>{item.label}</span>
            <h2>{item.valor}</h2>
          </div>
        </Card>
      ))}
    </div>
  );
}