import { useCallback, useEffect, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import StatusBadge from "../../../components/StatusBadge/StatusBadge";
import Table from "../../../components/Table/Table";
import CalendarPicker from "../../../components/CalendarPicker/CalendarPicker";
import { checkinCheckoutService } from "../../../services";
import { useApiResource } from "../../../hooks/useApiResource";
import { useFeedback } from "../../../hooks/useFeedback";
import { formatCurrency, formatDate, todayInputValue } from "../../../utils/format";
import "./CheckinCheckout.css";

/** Colunas da tabela de movimentações. */
const columns = [
  { key: "hospede", label: "Hóspede" },
  { key: "acomodacao", label: "Acomodação" },
  { key: "checkIn", label: "Check-in" },
  { key: "checkOut", label: "Check-out" },
  { key: "valorTotal", label: "Valor total" },
  { key: "situacao", label: "Situação" },
];

/**
 * Normaliza objeto da API para linha da tabela:
 * - Extrai nomes aninhados (hospede.nome, acomodacao.nome)
 * - Formata datas e moeda
 * - Adiciona badge de situação com label contextual
 */
function mapRow(hospedagem, situacao) {
  return {
    ...hospedagem,
    hospede: hospedagem.hospede?.nome,
    acomodacao: hospedagem.acomodacao?.nome,
    checkIn: formatDate(hospedagem.dataCheckIn),
    checkOut: formatDate(hospedagem.dataCheckOut),
    valorTotal: formatCurrency(hospedagem.valorTotal),
    situacao: <StatusBadge status={hospedagem.status} label={situacao} />,
  };
}

export default function CheckinCheckout() {
  const [data, setData] = useState(todayInputValue());
  const [diasComCheckIn, setDiasComCheckIn] = useState([]);
  const [diasComCheckOut, setDiasComCheckOut] = useState([]);
  const { feedback, clear, run } = useFeedback();

  // Busca dias com movimento quando o mês da data selecionada muda
  useEffect(() => {
    if (!data) return;
    const mes = data.slice(0, 7); // YYYY-MM
    checkinCheckoutService.diasComMovimento(mes).then((res) => {
      setDiasComCheckIn(res.diasComCheckIn ?? []);
      setDiasComCheckOut(res.diasComCheckOut ?? []);
    });
  }, [data.slice(0, 7)]);

  // Carrega movimentações do dia selecionado; recarrega quando `data` muda.
  const load = useCallback(() => checkinCheckoutService.list({ data }), [data]);

  const { data: resultado, isLoading, error, reload } = useApiResource(load, [
    data,
  ]);

  /** Check-in: confirma e chama API; em sucesso recarrega lista. */
  function fazerCheckIn(hospedagem) {
    if (!window.confirm(`Confirmar o check-in de ${hospedagem.hospede}?`))
      return;

    run(() => checkinCheckoutService.checkIn(hospedagem.id), {
      successMessage: "Check-in registrado com sucesso.",
      onSuccess: () => reload(),
    });
  }

  /** Check-out: confirma e chama API; em sucesso recarrega lista. */
  function fazerCheckOut(hospedagem) {
    if (!window.confirm(`Confirmar o check-out de ${hospedagem.hospede}?`))
      return;

    run(() => checkinCheckoutService.checkOut(hospedagem.id), {
      successMessage: "Check-out registrado com sucesso.",
      onSuccess: () => reload(),
    });
  }

  const checkIns = resultado?.checkIns ?? [];
  const checkOuts = resultado?.checkOuts ?? [];
  const hospedesNoLocal = resultado?.hospedesNoLocal ?? [];

  // Evita duplicar hóspedes que já aparecem na lista de check-out do dia.
  const idsEmCheckOut = new Set(checkOuts.map((item) => item.id));
  const linhas = [
    ...checkIns.map((item) => mapRow(item, "Aguardando check-in")),
    ...checkOuts.map((item) => mapRow(item, "Aguardando check-out")),
    ...hospedesNoLocal
      .filter((item) => !idsEmCheckOut.has(item.id))
      .map((item) => mapRow(item, "Hospedado")),
  ];

  /**
   * Renderiza botão de ação conforme status da hospedagem:
   * - checkIns: botão "Fazer check-in"
   * - checkOuts: botão "Fazer check-out"
   * - hospedesNoLocal sem ação: label "Sem ação para hoje"
   */
  function renderAction(hospedagem) {
    const podeEntrar = checkIns.some((item) => item.id === hospedagem.id);
    const podeSair = checkOuts.some((item) => item.id === hospedagem.id);

    if (podeEntrar) {
      return (
        <Button size="sm" variant="secondary" onClick={() => fazerCheckIn(hospedagem)}>
          Fazer check-in
        </Button>
      );
    }

    if (podeSair) {
      return (
        <Button size="sm" variant="secondary" onClick={() => fazerCheckOut(hospedagem)}>
          Fazer check-out
        </Button>
      );
    }

    return <span className="checkin-no-action">Sem ação para hoje</span>;
  }

  const totais = resultado?.totais;

  return (
    <div className="checkin-checkout-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Gestão</p>
          <h1>Check-in / Check-out</h1>
          <p>Gerencie a entrada e saída dos hóspedes.</p>
        </div>
      </div>

      {feedback && (
        <Alert type={feedback.type} message={feedback.message} onClose={clear} />
      )}
      {error && <Alert message={error} onClose={reload} />}

      <Card title="Filtros">
        <div className="filter-grid">
          <CalendarPicker
            label="Data"
            value={data}
            onChange={setData}
            diasComCheckIn={diasComCheckIn}
            diasComCheckOut={diasComCheckOut}
          />

          <div className="checkin-totais">
            <div>
              <span>Entradas</span>
              <strong>{totais?.checkIns ?? 0}</strong>
            </div>
            <div>
              <span>Saídas</span>
              <strong>{totais?.checkOuts ?? 0}</strong>
            </div>
            <div>
              <span>Hóspedes no local</span>
              <strong>{totais?.hospedesNoLocal ?? 0}</strong>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Movimentações" subtitle={`Hospedagens com movimento em ${formatDate(data)}`}>
        <Table
          columns={columns}
          data={linhas}
          isLoading={isLoading}
          emptyMessage="Nenhuma movimentação para a data selecionada."
          actions={renderAction}
        />
      </Card>
    </div>
  );
}
