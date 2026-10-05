import { useCallback, useState } from "react";
import Alert from "../../../components/Alert/Alert";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import Input from "../../../components/Input/Input";
import Modal from "../../../components/Modal/Modal";
import Select from "../../../components/Select/Select";
import Table from "../../../components/Table/Table";
import { useApiResource } from "../../../hooks/useApiResource";
import { acomodacoesService, financeiroService } from "../../../services";
import { formatCurrency, formatDate } from "../../../utils/format";
import { categoriaLabel } from "../../../utils/labels";
import "./DesempenhoImoveis.css";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function initialFilters() {
  const today = todayIso();
  return {
    dataInicial: `${today.slice(0, 8)}01`,
    dataFinal: today,
    acomodacaoId: "",
    bairro: "",
  };
}

function percent(value) {
  return `${Number(value ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function signedCurrency(value) {
  const amount = Number(value ?? 0);
  return `${amount < 0 ? "−" : ""}${formatCurrency(Math.abs(amount))}`;
}

const tableColumns = [
  { key: "imovel", label: "Imóvel" },
  { key: "localizacao", label: "Localização" },
  { key: "quantidadeHospedagens", label: "Reservas" },
  { key: "diariasOcupadas", label: "Diárias" },
  { key: "ocupacao", label: "Ocupação" },
  { key: "receita", label: "Receita" },
  { key: "despesas", label: "Despesas" },
  { key: "resultado", label: "Resultado" },
  { key: "margem", label: "Margem" },
];

const rankingItems = [
  ["maiorFaturamento", "Maior faturamento"],
  ["maisRentavel", "Mais rentável"],
  ["menosRentavel", "Menos rentável"],
  ["maiorOcupacao", "Maior ocupação"],
  ["menorOcupacao", "Menor ocupação"],
];

export default function DesempenhoImoveis() {
  const [filters, setFilters] = useState(initialFilters);
  const [selectedId, setSelectedId] = useState("");
  const load = useCallback(
    () => financeiroService.rentabilidade(filters),
    [filters],
  );
  const loadAccommodations = useCallback(() => acomodacoesService.list({}), []);
  const report = useApiResource(load, [filters]);
  const accommodationResource = useApiResource(loadAccommodations);
  const rows = report.data?.acomodacoes ?? [];
  const summary = report.data?.resumo;
  const detail = rows.find((row) => row.acomodacaoId === selectedId);
  const maximumBar = Math.max(
    1,
    ...rows.flatMap((row) => [
      row.receita,
      row.despesas,
      Math.abs(row.resultado),
    ]),
  );

  function changeFilter(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  const tableRows = rows.map((row) => ({
    ...row,
    id: row.acomodacaoId,
    imovel: row.nome,
    quantidadeHospedagens: row.quantidadeHospedagens,
    localizacao: row.localizacao,
    ocupacao: percent(row.taxaOcupacao),
    receita: formatCurrency(row.receita),
    despesas: formatCurrency(row.despesas),
    resultado: (
      <span
        className={`performance-result ${row.classificacaoResultado.toLowerCase()}`}
      >
        {row.classificacaoResultado}: {signedCurrency(row.resultado)}
      </span>
    ),
    margem: percent(row.margem),
  }));

  return (
    <div className="property-performance">
      <section
        className="property-performance-filters"
        aria-label="Filtros de desempenho"
      >
        <Input
          label="Data inicial"
          type="date"
          name="dataInicial"
          value={filters.dataInicial}
          onChange={changeFilter}
        />
        <Input
          label="Data final"
          type="date"
          name="dataFinal"
          value={filters.dataFinal}
          onChange={changeFilter}
        />
        <Select
          label="Imóvel"
          name="acomodacaoId"
          value={filters.acomodacaoId}
          onChange={changeFilter}
          placeholder="Todos os imóveis"
          options={(accommodationResource.data ?? [])
            .filter((item) => item.status !== "Inativa")
            .map((item) => ({
              value: item.id,
              label: item.nome,
            }))}
        />
        <Select
          label="Bairro"
          name="bairro"
          value={filters.bairro}
          onChange={changeFilter}
          placeholder="Todos os bairros"
          options={[
            ...new Set(
              (accommodationResource.data ?? [])
                .filter((item) => item.status !== "Inativa")
                .map((item) => item.endereco?.bairro)
                .filter(Boolean),
            ),
          ]
            .sort((left, right) => left.localeCompare(right, "pt-BR"))
            .map((bairro) => ({
              value: bairro,
              label: bairro,
            }))}
        />
      </section>

      {report.error && <Alert message={report.error} onClose={report.reload} />}
      {accommodationResource.error && (
        <Alert
          message={accommodationResource.error}
          onClose={accommodationResource.reload}
        />
      )}

      <section
        className="performance-kpis"
        aria-label="Resumo financeiro e operacional"
      >
        {[
          ["Receita total", summary?.receitaTotal, "revenue"],
          ["Despesas totais", summary?.despesasTotais, "expense"],
          ["Resultado líquido", summary?.resultadoLiquido, "result"],
        ].map(([label, value, variant]) => (
          <Card
            key={label}
            className={`performance-kpi ${variant}`}
            title={label}
          >
            <strong>
              {report.isLoading && !summary ? "—" : signedCurrency(value)}
            </strong>
          </Card>
        ))}
        <Card className="performance-kpi" title="Margem da carteira">
          <strong>
            {report.isLoading && !summary ? "—" : percent(summary?.margem)}
          </strong>
        </Card>
        <Card className="performance-kpi" title="Ocupação no período">
          <strong>
            {report.isLoading && !summary
              ? "—"
              : percent(summary?.taxaOcupacao)}
          </strong>
          <small>
            {summary?.diariasOcupadas ?? 0} de{" "}
            {summary?.diariasDisponiveis ?? 0} diárias
          </small>
        </Card>
      </section>

      <section
        className="performance-rankings"
        aria-label="Destaques por imóvel"
      >
        {rankingItems.map(([key, label]) => {
          const ranking = report.data?.rankings?.[key];
          if (!ranking) return null;

          const displayValue = key.toLowerCase().includes("ocupacao")
            ? percent(ranking.valor)
            : key === "maisRentavel" || key === "menosRentavel"
              ? signedCurrency(ranking.valor)
              : formatCurrency(ranking.valor);

          return (
            <Card key={key} className="performance-ranking" title={label}>
              <strong>{ranking.nome}</strong>
              <span>{displayValue}</span>
            </Card>
          );
        })}
      </section>

      <Card
        title="Comparação entre imóveis"
        subtitle="Receita, despesas e resultado no período"
      >
        <div
          className="performance-chart"
          role="img"
          aria-label="Barras comparativas de receita, despesas e resultado por imóvel"
        >
          {rows.map((row) => (
            <div className="performance-chart-row" key={row.acomodacaoId}>
              <strong>{row.nome}</strong>
              {[
                ["Receita", row.receita, "revenue"],
                ["Despesas", row.despesas, "expense"],
                [
                  "Resultado",
                  Math.abs(row.resultado),
                  row.resultado < 0 ? "negative" : "result",
                ],
              ].map(([label, value, variant]) => (
                <div className="performance-bar-line" key={label}>
                  <span>{label}</span>
                  <div className="performance-bar-track">
                    <i
                      className={`performance-bar ${variant}`}
                      style={{
                        width: `${Math.max(value > 0 ? 1 : 0, (value / maximumBar) * 100)}%`,
                      }}
                    />
                  </div>
                  <b>
                    {label === "Resultado"
                      ? signedCurrency(row.resultado)
                      : formatCurrency(value)}
                  </b>
                </div>
              ))}
            </div>
          ))}
          {!rows.length && !report.isLoading && (
            <p className="performance-empty">
              Nenhum imóvel encontrado para os filtros.
            </p>
          )}
        </div>
      </Card>

      <Card
        title="Desempenho por imóvel"
        subtitle="Selecione um imóvel para abrir o detalhamento"
      >
        <Table
          columns={tableColumns}
          data={tableRows}
          className="performance-table"
          isLoading={report.isLoading}
          emptyMessage="Nenhum imóvel encontrado para os filtros."
          actions={(row) => (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedId(row.acomodacaoId)}
            >
              Detalhes
            </Button>
          )}
        />
        {summary?.inconsistencias &&
          (summary.inconsistencias.hospedagensSemReceita > 0 ||
            summary.inconsistencias.receitasDuplicadas > 0) && (
            <p className="performance-integrity-note" role="status">
              Atenção: {summary.inconsistencias.hospedagensSemReceita}{" "}
              hospedagem(ns) sem receita vinculada e{" "}
              {summary.inconsistencias.receitasDuplicadas} receita(s)
              duplicada(s) foram detectadas.
            </p>
          )}
      </Card>

      <Modal
        isOpen={Boolean(detail)}
        onClose={() => setSelectedId("")}
        title={detail?.nome ?? "Detalhes do imóvel"}
        footer={
          <Button variant="outline" onClick={() => setSelectedId("")}>
            Fechar
          </Button>
        }
      >
        {detail && (
          <div className="property-detail">
            <p className="property-detail-address">{detail.localizacao}</p>
            <dl className="property-detail-grid">
              <div>
                <dt>Receita</dt>
                <dd>{formatCurrency(detail.receita)}</dd>
              </div>
              <div>
                <dt>Despesas</dt>
                <dd>{formatCurrency(detail.despesas)}</dd>
              </div>
              <div>
                <dt>Resultado</dt>
                <dd>
                  {detail.classificacaoResultado}:{" "}
                  {signedCurrency(detail.resultado)}
                </dd>
              </div>
              <div>
                <dt>Margem</dt>
                <dd>{percent(detail.margem)}</dd>
              </div>
              <div>
                <dt>Ocupação</dt>
                <dd>{percent(detail.taxaOcupacao)}</dd>
              </div>
              <div>
                <dt>Diárias ocupadas</dt>
                <dd>{detail.diariasOcupadas}</dd>
              </div>
              <div>
                <dt>Hospedagens</dt>
                <dd>{detail.quantidadeHospedagens}</dd>
              </div>
              <div>
                <dt>Diária cadastrada</dt>
                <dd>{formatCurrency(detail.diariaCadastrada)}</dd>
              </div>
              <div>
                <dt>Diária média realizada</dt>
                <dd>{formatCurrency(detail.diariaMediaRealizada)}</dd>
              </div>
            </dl>
            <section className="property-detail-expenses">
              <h3>Despesas do imóvel</h3>
              {detail.despesasDetalhe.length ? (
                <ul>
                  {detail.despesasDetalhe.map((expense) => (
                    <li key={expense.id}>
                      <span>
                        {expense.descricao} ·{" "}
                        {categoriaLabel(expense.categoria)}
                      </span>
                      <time>{formatDate(expense.dataVencimento)}</time>
                      <strong>{formatCurrency(expense.valor)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma despesa vinculada no período.</p>
              )}
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
}
