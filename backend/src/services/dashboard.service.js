import Acomodacao from "../models/Acomodacao.js";
import checkinCheckoutService from "./checkinCheckout.service.js";
import Despesa from "../models/Despesa.js";
import Hospedagem from "../models/Hospedagem.js";
import Hospede from "../models/Hospede.js";
import Receita from "../models/Receita.js";

function filtroPeriodo(campo, dataInicial, dataFinal) {
  const filtro = {};

  if (dataInicial || dataFinal) {
    filtro[campo] = {};

    if (dataInicial) {
      filtro[campo].$gte = new Date(`${dataInicial}T00:00:00.000Z`);
    }

    if (dataFinal) {
      filtro[campo].$lte = new Date(`${dataFinal}T23:59:59.999Z`);
    }
  }

  return filtro;
}

export const dashboardService = {
  async resumo({ dataInicial, dataFinal } = {}) {
    const hoje = new Date().toISOString().slice(0, 10);
    const movimentacoes = await checkinCheckoutService.list({ data: hoje });

    const [
      hospedagensAtivas,
      acomodacoesTotal,
      acomodacoesDisponiveis,
      hospedesCadastrados,
      receitas,
      despesas,
      proximasMovimentacoes,
    ] = await Promise.all([
      Hospedagem.countDocuments({ status: { $in: ["Confirmada", "Ativa"] } }),
      Acomodacao.countDocuments({}),
      Acomodacao.countDocuments({ status: "Disponivel" }),
      Hospede.countDocuments({}),
      Receita.aggregate([
        { $match: filtroPeriodo("data", dataInicial, dataFinal) },
        {
          $group: {
            _id: null,
            recebido: {
              $sum: { $cond: [{ $eq: ["$status", "Recebido"] }, "$valor", 0] },
            },
            pendente: {
              $sum: { $cond: [{ $eq: ["$status", "Pendente"] }, "$valor", 0] },
            },
          },
        },
        { $project: { _id: 0, recebido: 1, pendente: 1 } },
      ]),
      Despesa.aggregate([
        { $match: filtroPeriodo("dataVencimento", dataInicial, dataFinal) },
        {
          $group: {
            _id: null,
            pago: { $sum: { $cond: [{ $eq: ["$status", "Pago"] }, "$valor", 0] } },
            pendente: {
              $sum: {
                $cond: [{ $in: ["$status", ["Pendente", "Atrasado"]] }, "$valor", 0],
              },
            },
          },
        },
        { $project: { _id: 0, pago: 1, pendente: 1 } },
      ]),
      Hospedagem.find({
        status: { $in: ["Confirmada", "Ativa"] },
        dataCheckIn: { $gte: new Date(`${hoje}T00:00:00.000Z`) },
      })
        .sort({ dataCheckIn: 1 })
        .limit(5)
        .populate("hospede", "nome")
        .populate("acomodacao", "nome tipo")
        .select("hospede acomodacao dataCheckIn dataCheckOut status")
        .lean(),
    ]);

    const resumoReceitas = receitas[0] ?? { recebido: 0, pendente: 0 };
    const resumoDespesas = despesas[0] ?? { pago: 0, pendente: 0 };

    return {
      periodo: { dataInicial: dataInicial ?? null, dataFinal: dataFinal ?? null },
      indicadores: {
        hospedagensAtivas,
        acomodacoesTotal,
        acomodacoesDisponiveis,
        taxaOcupacao: acomodacoesTotal
          ? Math.round(((acomodacoesTotal - acomodacoesDisponiveis) / acomodacoesTotal) * 100)
          : 0,
        hospedesCadastrados,
      },
      financeiro: {
        receitasRecebidas: resumoReceitas.recebido,
        receitasPendentes: resumoReceitas.pendente,
        despesasPagas: resumoDespesas.pago,
        despesasPendentes: resumoDespesas.pendente,
        saldo:
          resumoReceitas.recebido +
          resumoReceitas.pendente -
          (resumoDespesas.pago + resumoDespesas.pendente),
      },
      checkinCheckout: movimentacoes.totais,
      proximasMovimentacoes,
    };
  },

  async historico({ status, dataInicial, dataFinal } = {}) {
    const filtro = {};

    if (status) {
      filtro.status = status;
    }

    if (dataInicial) {
      filtro.dataCheckOut = { ...(filtro.dataCheckOut ?? {}), $gte: new Date(`${dataInicial}T00:00:00.000Z`) };
    }

    if (dataFinal) {
      filtro.dataCheckIn = { ...(filtro.dataCheckIn ?? {}), $lte: new Date(`${dataFinal}T23:59:59.999Z`) };
    }

    const registros = await Hospedagem.find(filtro)
      .populate("hospede", "nome")
      .populate("acomodacao", "nome")
      .sort({ dataCheckIn: -1 })
      .select("hospede acomodacao dataCheckIn dataCheckOut valorTotal status criadoEm")
      .lean();

    return { total: registros.length, registros };
  },
};

export default dashboardService;