import { useState } from "react";
import Card from "../../../components/Card/Card";
import Layout from "../../../components/Layout/Layout";
import Table from "../../../components/Table/Table";
import { adminNavItems } from "../../navigation";
import "./Dashboard.css";



const indicadores = [
  { title: "Hospedagens ativas", value: 8, detail: "Em andamento neste momento" },
  { title: "Acomodações disponíveis", value: 12, detail: "De 18 acomodações cadastradas" },
  { title: "Check-ins hoje", value: 3, detail: "Entradas previstas para hoje" },
  { title: "Check-outs hoje", value: 2, detail: "Saídas previstas para hoje" },
];

const proximasMovimentacoes = [
  { id: 1, hospede: "Mariana Alves", acomodacao: "Flat 101", tipo: "Check-in", horario: "14:00" },
  { id: 2, hospede: "Carlos Lima", acomodacao: "Flat 204", tipo: "Check-out", horario: "11:00" },
  { id: 3, hospede: "João Pereira", acomodacao: "Quarto 03", tipo: "Check-in", horario: "15:30" },
];

const columns = [
  { key: "hospede", label: "Hóspede" },
  { key: "acomodacao", label: "Acomodação" },
  { key: "tipo", label: "Movimentação" },
  { key: "horario", label: "Horário" },
];

export default function Dashboard({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Layout
      title="Dashboard"
      navItems={adminNavItems}
      activeItem="dashboard"
      onNavigate={onNavigate}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      userName="Administrador"
      userRole="Administrador"
    >
      <div className="dashboard-page">
        <section className="dashboard-welcome">
          <div>
            <p className="page-eyebrow">Visão geral</p>
            <h2>Resumo da operação</h2>
            <p>Acompanhe os principais números e movimentações da hospedagem.</p>
          </div>
        </section>

        <section className="dashboard-kpis" aria-label="Indicadores principais">
          {indicadores.map((item) => (
            <Card key={item.title} title={item.title} className="kpi-card">
              <strong className="kpi-value">{item.value}</strong>
              <p className="kpi-detail">{item.detail}</p>
            </Card>
          ))}
        </section>

        <section className="dashboard-grid">
          <Card title="Resumo financeiro" subtitle="Valores simulados do MVP">
            <div className="finance-summary">
              <div>
                <span>Receitas</span>
                <strong>R$ 12.450,00</strong>
              </div>
              <div>
                <span>Despesas</span>
                <strong>R$ 4.120,00</strong>
              </div>
              <div className="finance-balance">
                <span>Saldo</span>
                <strong>R$ 8.330,00</strong>
              </div>
            </div>
          </Card>

          <Card title="Ocupação" subtitle="Situação atual das acomodações">
            <div className="occupancy-box">
              <strong>33%</strong>
              <span>6 de 18 acomodações ocupadas</span>
              <div className="occupancy-track" aria-hidden="true">
                <div className="occupancy-fill" />
              </div>
            </div>
          </Card>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="page-eyebrow">Hoje</p>
              <h2>Próximas movimentações</h2>
            </div>
          </div>
          <Table columns={columns} data={proximasMovimentacoes} />
        </section>
      </div>
    </Layout>
  );
}
