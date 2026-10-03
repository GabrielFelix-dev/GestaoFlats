import { useState } from "react";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Despesas from "./Despesas";
import Receitas from "./Receitas";
import ResumoFinanceiro from "./ResumoFinanceiro";
import "./Financeiro.css";

const abas = [
  { id: "resumo", label: "Visão geral" },
  { id: "receitas", label: "Receitas" },
  { id: "despesas", label: "Despesas" },
];

export default function Financeiro() {
  const [abaAtiva, setAbaAtiva] = useState("resumo");

  return (
    <div className="financeiro-page">
      <Card
        title="Gestão Financeira"
        subtitle="Controle de receitas, despesas e fluxo de caixa"
      >
        <div className="financeiro-tabs">
          {abas.map((aba) => (
            <Button
              key={aba.id}
              variant={abaAtiva === aba.id ? "primary" : "outline"}
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.label}
            </Button>
          ))}
        </div>
      </Card>

      {abaAtiva === "resumo" && (
        <>
          <ResumoFinanceiro />
          <Receitas compact />
          <Despesas compact />
        </>
      )}

      {abaAtiva === "receitas" && <Receitas />}
      {abaAtiva === "despesas" && <Despesas />}
    </div>
  );
}
