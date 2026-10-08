import { useCallback } from "react";
import Alert from "../../../components/Alert/Alert";
import Card from "../../../components/Card/Card";
import Table from "../../../components/Table/Table";
import { dashboardService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { formatCurrency, formatDate } from "../../../utils/format";
import { statusLabel } from "../../../utils/labels";
import "./Dashboard.css";

const columns = [
  { key: "hospede", label: "Hóspede" },
  { key: "acomodacao", label: "Acomodação" },
  { key: "tipo", label: "Movimentação" },
  { key: "data", label: "Data" },
  { key: "status", label: "Situação" },
];

export default function Dashboard() {
  const load = useCallback(() => dashboardService.resumo(), []);
  const { data, isLoading, error, reload } = useApiResource(load);

  const indicadores = data
    ? [
        {
          title: "Hospedagens ativas",
          value: data.indicadores.hospedagensAtivas,
          detail: "Confirmadas ou em andamento",
        },
        {
          title: "Acomodações disponíveis",
          value: data.indicadores.acomodacoesDisponiveis,
          detail: `De ${data.indicadores.acomodacoesTotal} acomodações cadastradas`,
        },
        {
          title: "Check-ins hoje",
          value: data.checkinCheckout.checkIns,
          detail: "Entradas previstas para hoje",
        },
        {
          title: "Check-outs hoje",
          value: data.checkinCheckout.checkOuts,
          detail: "Saídas previstas para hoje",
        },
      ]
    : [];

  const movimentacoes = (data?.proximasMovimentacoes ?? []).map((item) => ({
    id: item._id?.toString() ?? `${item.dataCheckIn}-${item.status}`,
    hospede: item.hospede?.nome,
    acomodacao: item.acomodacao?.nome,
    tipo: "Check-in",
    data: formatDate(item.dataCheckIn),
    status: statusLabel(item.status),
  }));

  const financeiro = data?.financeiro;
  const ocupacao = data?.indicadores ?? {};

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <div>
          <p className="page-eyebrow">Visão geral</p>
          <h2>Resumo da operação</h2>
          <p>Acompanhe os principais números e movimentações da hospedagem.</p>
        </div>
      </section>

      {error && <Alert message={error} onClose={reload} />}

      <section className="dashboard-kpis" aria-label="Indicadores principais">
        {indicadores.map((item) => (
          <Card key={item.title} title={item.title} className="kpi-card">
            <strong className="kpi-value">
              {isLoading && !data ? "—" : item.value}
            </strong>
            <p className="kpi-detail">{item.detail}</p>
          </Card>
        ))}
      </section>

      <section className="dashboard-grid">
        <Card title="Resumo financeiro" subtitle="Valores lançados no sistema">
          <div className="finance-summary">
            <div>
              <span>Receitas</span>
              <strong>{formatCurrency(financeiro?.receitasRecebidas)}</strong>
            </div>
            <div>
              <span>Despesas</span>
              <strong>{formatCurrency(financeiro?.despesasPagas)}</strong>
            </div>
            <div className="finance-balance">
              <span>Saldo</span>
              <strong>{formatCurrency(financeiro?.saldo)}</strong>
            </div>
          </div>
        </Card>

        <Card title="Ocupação" subtitle="Situação atual das acomodações">
          <div className="occupancy-box">
            <strong>{ocupacao.taxaOcupacao ?? 0}%</strong>
            <span>
              {Math.max(
                0,
                (ocupacao.acomodacoesTotal ?? 0) -
                  (ocupacao.acomodacoesDisponiveis ?? 0),
              )}{" "}
              de {ocupacao.acomodacoesTotal ?? 0} acomodações ocupadas
            </span>
            <div className="occupancy-track" aria-hidden="true">
              <div
                className="occupancy-fill"
                style={{ width: `${ocupacao.taxaOcupacao ?? 0}%` }}
              />
            </div>
          </div>
        </Card>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="page-eyebrow">Próximas</p>
            <h2>Movimentações futuras</h2>
          </div>
        </div>
        <Table
          columns={columns}
          data={movimentacoes}
          isLoading={isLoading}
          emptyMessage="Nenhuma entrada prevista para os próximos dias."
        />
      </section>
    </div>
  );
}
