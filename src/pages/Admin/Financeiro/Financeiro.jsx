import React, { useState } from "react";
import Card from "../../../components/Card/Card";
import Button from "../../../components/Button/Button";
import ResumoFinanceiro from "./ResumoFinanceiro";
import Receitas from "./Receitas";
import Despesas from "./Despesas";

export default function Financeiro() {
  const [abaAtiva, setAbaAtiva] = useState("resumo");

  return (
    <div className="financeiro-page" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Card title="Gestão Financeira" subtitle="Controle de receitas, despesas e fluxo de caixa">
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button 
            variant={abaAtiva === "resumo" ? "primary" : "outline"} 
            onClick={() => setAbaAtiva("resumo")}
          >
            📊 Visão Geral
          </Button>
          <Button 
            variant={abaAtiva === "receitas" ? "primary" : "outline"} 
            onClick={() => setAbaAtiva("receitas")}
          >
            🟢 Receitas
          </Button>
          <Button 
            variant={abaAtiva === "despesas" ? "primary" : "outline"} 
            onClick={() => setAbaAtiva("despesas")}
          >
            🔴 Despesas
          </Button>
        </div>
      </Card>

      {abaAtiva === "resumo" && (
        <>
          <ResumoFinanceiro />
          <Receitas />
          <Despesas />
        </>
      )}

      {abaAtiva === "receitas" && <Receitas />}
      {abaAtiva === "despesas" && <Despesas />}
    </div>
  );
}