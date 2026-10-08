import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Select from "../../../components/Select/Select";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Table from "../../../components/Table/Table";
import CalendarPicker from "../../../components/CalendarPicker/CalendarPicker";
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
  const [indicadoresEntrada, setIndicadoresEntrada] = useState({ livres: [], parciais: [], lotados: [] });
  const [indicadoresSaida, setIndicadoresSaida] = useState({ livres: [], parciais: [], lotados: [] });
  const [mesVisualizadoEntrada, setMesVisualizadoEntrada] = useState(null);
  const [mesVisualizadoSaida, setMesVisualizadoSaida] = useState(null);
  const { feedback, clear, run } = useFeedback();
  const timeoutRef = useRef(null);

  // Busca indicadores para o mês que cada calendário está exibindo
  function buscarIndicadores(mes, setState) {
    if (!mes) return;
    checkinCheckoutService.diasComDisponibilidade(mes, formData.tipo || undefined).then((res) => {
      setState({
        livres: res.diasLivres ?? [],
        parciais: res.diasParciais ?? [],
        lotados: res.diasLotados ?? [],
      });
    });
  }

  // Indicadores do calendário de entrada (baseado no mês visualizado ou no value)
  useEffect(() => {
    const mes = mesVisualizadoEntrada || formData.dataInicial.slice(0, 7);
    buscarIndicadores(mes, setIndicadoresEntrada);
  }, [mesVisualizadoEntrada, formData.dataInicial.slice(0, 7), formData.tipo]);

  // Indicadores do calendário de saída
  useEffect(() => {
    const mes = mesVisualizadoSaida || formData.dataFinal.slice(0, 7);
    buscarIndicadores(mes, setIndicadoresSaida);
  }, [mesVisualizadoSaida, formData.dataFinal.slice(0, 7), formData.tipo]);

  // Callbacks quando o mês visualizado muda no calendário
  function handleViewMonthChangeEntrada(year, month) {
    const mes = `${year}-${String(month + 1).padStart(2, "0")}`;
    setMesVisualizadoEntrada(mes);
  }

  function handleViewMonthChangeSaida(year, month) {
    const mes = `${year}-${String(month + 1).padStart(2, "0")}`;
    setMesVisualizadoSaida(mes);
  }

  const load = useCallback(async () => {
    const params = {
      dataInicial: formData.dataInicial,
      dataFinal: formData.dataFinal,
      ...(formData.tipo && { tipo: formData.tipo }),
    };
    return checkinCheckoutService.disponibilidade(params);
  }, [formData.dataInicial, formData.dataFinal, formData.tipo]);

  const { data, isLoading, error, reload } = useApiResource(load, [
    formData.dataInicial,
    formData.dataFinal,
    formData.tipo,
  ]);

  // Auto-reload com debounce - só se datas válidas
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (formData.dataFinal > formData.dataInicial) {
        reload();
      }
    }, 300);
    return () => clearTimeout(timeoutRef.current);
  }, [formData.dataInicial, formData.dataFinal, formData.tipo, reload]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleDateChange(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
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
      {error && formData.dataFinal > formData.dataInicial && (
        <Alert message={error} onClose={reload} />
      )}

      <Card title="Consultar disponibilidade">
        <div className="filter-grid">
          <CalendarPicker
            label="Data de entrada"
            name="dataInicial"
            value={formData.dataInicial}
            onChange={(value) => handleDateChange("dataInicial", value)}
            diasLivres={indicadoresEntrada.livres}
            diasParciais={indicadoresEntrada.parciais}
            diasLotados={indicadoresEntrada.lotados}
            required
            placeholder="Data de entrada"
            variant="availability"
            showLegend
            legendLabels={{ livre: "Livre", parcial: "Parcial", lotado: "Lotado" }}
            onViewMonthChange={handleViewMonthChangeEntrada}
          />

          <CalendarPicker
            label="Data de saída"
            name="dataFinal"
            value={formData.dataFinal}
            onChange={(value) => handleDateChange("dataFinal", value)}
            diasLivres={indicadoresSaida.livres}
            diasParciais={indicadoresSaida.parciais}
            diasLotados={indicadoresSaida.lotados}
            minDate={formData.dataInicial}
            required
            placeholder="Data de saída"
            variant="availability"
            showLegend
            legendLabels={{ livre: "Livre", parcial: "Parcial", lotado: "Lotado" }}
            onViewMonthChange={handleViewMonthChangeSaida}
          />

          <Select
            label="Tipo"
            name="tipo"
            options={toOptions(ACOMODACAO_TIPOS, (value) => value)}
            value={formData.tipo}
            onChange={handleChange}
          />
        </div>
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
