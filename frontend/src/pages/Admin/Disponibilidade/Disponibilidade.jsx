import { useCallback, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Select from "../../../components/Select/Select";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Table from "../../../components/Table/Table";
import { checkinCheckoutService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useFeedback } from "../../../hooks/useFeedback";
import { formatCurrency, formatDate, pluralize } from "../../../utils/format";
import { ACOMODACAO_TIPOS, toOptions } from "../../../utils/labels";
import "./Disponibilidade.css";

const columns = [
  { key: "nome", label: "Acomodação" },
  { key: "tipo", label: "Tipo" },
  { key: "capacidade", label: "Capacidade" },
  { key: "valorDiariaLabel", label: "Diária" },
  { key: "situacao", label: "Situação" },
  { key: "diasDisponiveis", label: "Dias livres" },
  { key: "ocupacaoPercentual", label: "Ocupação" },
];

function hojeMais(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

export default function Disponibilidade() {
  const [formData, setFormData] = useState({
    dataInicial: hojeMais(0),
    dataFinal: hojeMais(1),
    tipo: "",
  });
  const [consulta, setConsulta] = useState(null);
  const { feedback, clear, run } = useFeedback();

  const load = useCallback(
    () =>
      consulta
        ? checkinCheckoutService.disponibilidade({
            dataInicial: consulta.dataInicial,
            dataFinal: consulta.dataFinal,
            tipo: consulta.tipo,
          })
        : null,
    [consulta],
  );

  const { data, isLoading, error, reload } = useApiResource(load, [consulta]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (formData.dataFinal <= formData.dataInicial) {
      return;
    }

    setConsulta(formData);
  }

  const linhas = (data?.acomodacoes ?? []).map((item) => ({
    id: item.acomodacao.id,
    nome: item.acomodacao.nome,
    tipo: item.acomodacao.tipo,
    capacidade: item.acomodacao.capacidade,
    valorDiariaLabel: formatCurrency(item.acomodacao.valorDiaria),
    situacao: (
      <StatusBadge
        status={item.disponivel ? "Disponivel" : "Ocupada"}
        label={item.disponivel ? "Disponível" : "Ocupada no período"}
      />
    ),
    diasDisponiveis: `${item.diasDisponiveis}/${data?.periodo?.totalDias ?? 0}`,
    ocupacaoPercentual: `${item.ocupacaoPercentual}%`,
  }));

  return (
    <div className="disponibilidade-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Consultas</p>
          <h1>Disponibilidade</h1>
          <p>Consulte a disponibilidade das acomodações em um período.</p>
        </div>
      </div>

      {feedback && (
        <Alert type={feedback.type} message={feedback.message} onClose={clear} />
      )}
      {error && <Alert message={error} onClose={reload} />}

      <Card title="Consultar disponibilidade">
        <form className="filter-grid" onSubmit={handleSubmit}>
          <Input
            label="Data de entrada"
            type="date"
            name="dataInicial"
            value={formData.dataInicial}
            onChange={handleChange}
            required
          />

          <Input
            label="Data de saída"
            type="date"
            name="dataFinal"
            min={formData.dataInicial}
            value={formData.dataFinal}
            onChange={handleChange}
            required
          />

          <Select
            label="Tipo"
            name="tipo"
            options={toOptions(ACOMODACAO_TIPOS, (value) => value)}
            value={formData.tipo}
            onChange={handleChange}
          />

          <Button type="submit" variant="secondary" disabled={isLoading}>
            {isLoading ? "Consultando..." : "Consultar"}
          </Button>
        </form>
      </Card>

      {data && (
        <Card
          title="Resumo do período"
          subtitle={`${formatDate(`${data.periodo.dataInicial}T00:00:00.000Z`)} até ${formatDate(
            `${data.periodo.dataFinal}T00:00:00.000Z`,
          )}`}
        >
          <div className="disponibilidade-resumo">
            <div>
              <span>Total</span>
              <strong>{data.total}</strong>
            </div>
            <div>
              <span>Livres</span>
              <strong>{data.disponiveis}</strong>
            </div>
            <div>
              <span>Ocupadas</span>
              <strong>{data.ocupadas}</strong>
            </div>
            <div>
              <span>Taxa de disponibilidade</span>
              <strong>{data.taxaDisponibilidade}%</strong>
            </div>
            <div>
              <span>Período</span>
              <strong>{pluralize(data.periodo.totalDias, "dia", "dias")}</strong>
            </div>
          </div>
        </Card>
      )}

      <Card
        title="Acomodações"
        subtitle="Situação das acomodações cadastradas no período."
      >
        <Table
          columns={columns}
          data={linhas}
          isLoading={isLoading}
          emptyMessage="Consulte um período para ver a disponibilidade."
        />
      </Card>
    </div>
  );
}
