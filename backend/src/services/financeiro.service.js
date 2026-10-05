import Acomodacao from "../models/Acomodacao.js";
import Despesa from "../models/Despesa.js";
import Hospedagem from "../models/Hospedagem.js";
import Receita from "../models/Receita.js";
import { escapeRegex } from "../utils/regex.js";
import { calculatePortfolioMetrics } from "./portfolioMetrics.js";

function todayIso() {
    return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonth(isoDate) {
    return `${isoDate.slice(0, 8)}01`;
}

function nextDayIso(isoDate) {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
}

function escapeRegexLiteral(value) {
    return escapeRegex(value);
}

export const financeiroService = {
    async rentabilidade({ dataInicial, dataFinal, acomodacaoId, bairro } = {}) {
        const today = todayIso();
        const end = dataFinal ?? (dataInicial && dataInicial > today ? dataInicial : today);
        const start = dataInicial ?? firstDayOfMonth(end);
        const startDate = new Date(`${start}T00:00:00.000Z`);
        const endExclusive = new Date(`${nextDayIso(end)}T00:00:00.000Z`);
        const propertyFilter = { status: { $ne: "Inativa" } };

        if (acomodacaoId) propertyFilter._id = acomodacaoId;
        if (bairro) {
            propertyFilter["endereco.bairro"] = new RegExp(
                `^${escapeRegexLiteral(bairro.trim())}$`,
                "i",
            );
        }

        const acomodacoes = await Acomodacao.find(propertyFilter).sort({ nome: 1 }).lean();
        const propertyIds = acomodacoes.map((item) => item._id);
        const includeGeneral = !acomodacaoId && !bairro;
        const stayFilter = {
            acomodacao: { $in: propertyIds },
            status: { $in: ["Confirmada", "Ativa", "Concluida"] },
            dataCheckIn: { $lt: endExclusive },
            dataCheckOut: { $gt: startDate },
        };
        const hospedagens = propertyIds.length
            ? await Hospedagem.find(stayFilter).lean()
            : [];
        const stayIds = hospedagens.map((item) => item._id);
        const revenueBranches = [];

        if (stayIds.length) revenueBranches.push({ hospedagem: { $in: stayIds } });
        if (includeGeneral) {
            revenueBranches.push({
                hospedagem: null,
                data: { $gte: startDate, $lt: endExclusive },
            });
        }

        const expenseBranches = [];
        if (propertyIds.length) expenseBranches.push({ acomodacao: { $in: propertyIds } });
        if (includeGeneral) expenseBranches.push({ acomodacao: null });

        const [receitas, despesas] = await Promise.all([
            revenueBranches.length
                ? Receita.find({ status: { $ne: "Cancelado" }, $or: revenueBranches })
                    .sort({ criadoEm: 1 })
                    .lean()
                : [],
            expenseBranches.length
                ? Despesa.find({
                    dataVencimento: { $gte: startDate, $lt: endExclusive },
                    $or: expenseBranches,
                })
                    .populate("acomodacao", "nome endereco")
                    .lean()
                : [],
        ]);

        return calculatePortfolioMetrics({
            acomodacoes,
            hospedagens,
            receitas,
            despesas,
            periodStart: start,
            periodEndExclusive: nextDayIso(end),
            includeGeneral,
        });
    },
};

export default financeiroService;