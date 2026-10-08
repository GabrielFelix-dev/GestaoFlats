import { useCallback } from "react";
import Card from "../../../components/Card/Card";
import { dashboardService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { formatCurrency } from "../../../utils/format";
import "./Financeiro.css";

export default function ResumoFinanceiro() {
  const load = useCallback(() => dashboardService.resumo(), []);
  const { data, isLoading } = useApiResource(load);

  const financeiro = data?.financeiro;

  const resumoData = [
    {
      label: "Receitas Totais",
      valor: formatCurrency(
        (financeiro?.receitasRecebidas ?? 0) + (financeiro?.receitasPendentes ?? 0),
      ),
      detail: `${formatCurrency(financeiro?.receitasRecebidas)} recebidos · ${formatCurrency(
        financeiro?.receitasPendentes,
      )} a receber`,
      variant: "success",
    },
    {
      label: "Despesas Totais",
      valor: formatCurrency(
        (financeiro?.despesasPagas ?? 0) + (financeiro?.despesasPendentes ?? 0),
      ),
      detail: `${formatCurrency(financeiro?.despesasPagas)} pagas · ${formatCurrency(
        financeiro?.despesasPendentes,
      )} a pagar`,
      variant: "danger",
    },
    {
      label: "Saldo em Caixa",
      valor: isLoading && !data ? "—" : formatCurrency(financeiro?.saldo),
      detail: "Receitas menos despesas lançadas",
      variant: "",
    },
  ];

  return (
    <div className="resumo-financeiro-grid">
      {resumoData.map((item) => (
        <Card key={item.label}>
          <div className={`resumo-financeiro-item ${item.variant}`.trim()}>
            <span>{item.label}</span>
            <h2>{item.valor}</h2>
            <small>{item.detail}</small>
          </div>
        </Card>
      ))}
    </div>
  );
}
