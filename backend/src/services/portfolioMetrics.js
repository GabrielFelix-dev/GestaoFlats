const DAY_MS = 24 * 60 * 60 * 1000;
const OCCUPANCY_STATUSES = new Set(["Confirmada", "Ativa", "Concluida"]);

function idOf(value) {
    if (value === null || value === undefined) return null;
    if (typeof value?.toHexString === "function") return value.toHexString();
    if (typeof value === "object" && value._id !== undefined) return idOf(value._id);
    if (typeof value?.id === "string") return value.id;
    return String(value);
}

function dayIndex(value) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
    }

    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? Math.floor(timestamp / DAY_MS) : NaN;
}

export function countNightsInPeriod(checkIn, checkOut, periodStart, periodEndExclusive) {
    const start = Math.max(dayIndex(checkIn), dayIndex(periodStart));
    const end = Math.min(dayIndex(checkOut), dayIndex(periodEndExclusive));

    return Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : 0;
}

export function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function propertyAddress(acomodacao) {
    const address = acomodacao.endereco ?? {};
    return [
        address.rua,
        address.numero,
        address.complemento,
        address.bairro,
        address.cidade,
        address.estado,
        address.cep,
    ]
        .filter(Boolean)
        .join(", ");
}

function resultLabel(value) {
    if (value > 0) return "Lucro";
    if (value < 0) return "Prejuízo";
    return "Equilíbrio";
}

function makeRanking(rows, field, direction, hasData) {
    if (!rows.length || !hasData(rows)) return null;

    const sorted = [...rows].sort((left, right) =>
        direction === "asc" ? left[field] - right[field] : right[field] - left[field],
    );

    return {
        acomodacaoId: sorted[0].acomodacaoId,
        nome: sorted[0].nome,
        valor: sorted[0][field],
    };
}

export function calculatePortfolioMetrics({
    acomodacoes,
    hospedagens,
    receitas,
    despesas,
    periodStart,
    periodEndExclusive,
    includeGeneral = true,
}) {
    const startDay = dayIndex(periodStart);
    const endDay = dayIndex(periodEndExclusive);
    const periodDays = Math.max(0, endDay - startDay);
    const propertyById = new Map(acomodacoes.map((item) => [idOf(item), item]));
    const staysByProperty = new Map();
    const stayById = new Map();

    for (const stay of hospedagens) {
        if (!OCCUPANCY_STATUSES.has(stay.status)) continue;

        const stayId = idOf(stay);
        const propertyId = idOf(stay.acomodacao);
        const overlapNights = countNightsInPeriod(
            stay.dataCheckIn,
            stay.dataCheckOut,
            periodStart,
            periodEndExclusive,
        );

        if (!stayId || !propertyById.has(propertyId) || overlapNights === 0) continue;

        const record = { stay, stayId, propertyId, overlapNights };
        stayById.set(stayId, record);
        const propertyStays = staysByProperty.get(propertyId) ?? [];
        propertyStays.push(record);
        staysByProperty.set(propertyId, propertyStays);
    }

    const revenuesByStay = new Map();
    const generalRevenues = [];

    for (const revenue of receitas) {
        if (revenue.status === "Cancelado") continue;

        const stayId = idOf(revenue.hospedagem);

        if (!stayId) {
            generalRevenues.push(revenue);
            continue;
        }

        if (!stayById.has(stayId)) continue;
        const matching = revenuesByStay.get(stayId) ?? [];
        matching.push(revenue);
        revenuesByStay.set(stayId, matching);
    }

    const expensesByProperty = new Map();
    const generalExpenses = [];

    for (const expense of despesas) {
        const propertyId = idOf(expense.acomodacao);

        if (!propertyId) {
            generalExpenses.push(expense);
            continue;
        }

        const matching = expensesByProperty.get(propertyId) ?? [];
        matching.push(expense);
        expensesByProperty.set(propertyId, matching);
    }

    let duplicateRevenueCount = 0;
    let missingRevenueCount = 0;

    const rows = acomodacoes.map((acomodacao) => {
        const acomodacaoId = idOf(acomodacao);
        const stays = staysByProperty.get(acomodacaoId) ?? [];
        const occupiedNights = Math.min(
            periodDays,
            stays.reduce((total, item) => total + item.overlapNights, 0),
        );
        const propertyExpenses = expensesByProperty.get(acomodacaoId) ?? [];
        const expenseDetails = propertyExpenses.map((expense) => ({
            id: idOf(expense),
            descricao: expense.descricao,
            categoria: expense.categoria,
            valor: roundMoney(expense.valor),
            dataVencimento: expense.dataVencimento,
        }));
        const expensesTotal = roundMoney(
            propertyExpenses.reduce((total, expense) => total + Number(expense.valor || 0), 0),
        );
        let revenueTotal = 0;

        for (const item of stays) {
            const linkedRevenues = revenuesByStay.get(item.stayId) ?? [];
            const orderedRevenues = [...linkedRevenues].sort(
                (left, right) => new Date(left.criadoEm ?? 0) - new Date(right.criadoEm ?? 0),
            );

            if (orderedRevenues.length === 0) {
                missingRevenueCount += 1;
                continue;
            }

            duplicateRevenueCount += Math.max(0, orderedRevenues.length - 1);
            const bookedNights = Math.max(
                1,
                countNightsInPeriod(
                    item.stay.dataCheckIn,
                    item.stay.dataCheckOut,
                    item.stay.dataCheckIn,
                    item.stay.dataCheckOut,
                ),
            );
            revenueTotal +=
                (Number(orderedRevenues[0].valor || 0) * item.overlapNights) / bookedNights;
        }

        const revenue = roundMoney(revenueTotal);
        const result = roundMoney(revenue - expensesTotal);

        return {
            acomodacaoId,
            nome: acomodacao.nome,
            localizacao: propertyAddress(acomodacao) || "Endereço não informado",
            bairro: acomodacao.endereco?.bairro ?? "",
            quantidadeHospedagens: stays.length,
            diariasOcupadas: occupiedNights,
            diariasDisponiveis: periodDays,
            taxaOcupacao: periodDays ? Math.round((occupiedNights / periodDays) * 100) : 0,
            receita: revenue,
            despesas: expensesTotal,
            resultado: result,
            margem: revenue ? roundMoney((result / revenue) * 100) : 0,
            diariaCadastrada: roundMoney(acomodacao.valorDiaria),
            diariaMediaRealizada: occupiedNights
                ? roundMoney(revenue / occupiedNights)
                : 0,
            classificacaoResultado: resultLabel(result),
            despesasDetalhe: expenseDetails,
        };
    });

    const propertyRevenue = rows.reduce((total, item) => total + item.receita, 0);
    const propertyExpenses = rows.reduce((total, item) => total + item.despesas, 0);
    const generalRevenue = includeGeneral
        ? roundMoney(generalRevenues.reduce((total, item) => total + Number(item.valor || 0), 0))
        : 0;
    const generalExpenseTotal = includeGeneral
        ? roundMoney(generalExpenses.reduce((total, item) => total + Number(item.valor || 0), 0))
        : 0;
    const totalRevenue = roundMoney(propertyRevenue + generalRevenue);
    const totalExpenses = roundMoney(propertyExpenses + generalExpenseTotal);
    const totalOccupiedNights = rows.reduce((total, item) => total + item.diariasOcupadas, 0);
    const totalAvailableNights = periodDays * acomodacoes.length;
    const totalResult = roundMoney(totalRevenue - totalExpenses);
    const hasFinancialData = (item) => item.receita !== 0 || item.despesas !== 0;

    return {
        periodo: { dataInicial: periodStart, dataFinal: new Date((endDay - 1) * DAY_MS).toISOString().slice(0, 10) },
        resumo: {
            receitaTotal: totalRevenue,
            despesasTotais: totalExpenses,
            resultadoLiquido: totalResult,
            margem: totalRevenue ? roundMoney((totalResult / totalRevenue) * 100) : 0,
            taxaOcupacao: totalAvailableNights
                ? Math.round((totalOccupiedNights / totalAvailableNights) * 100)
                : 0,
            diariasOcupadas: totalOccupiedNights,
            diariasDisponiveis: totalAvailableNights,
            quantidadeHospedagens: rows.reduce(
                (total, item) => total + item.quantidadeHospedagens,
                0,
            ),
            receitasGerais: generalRevenue,
            despesasGerais: generalExpenseTotal,
            inconsistencias: { hospedagensSemReceita: missingRevenueCount, receitasDuplicadas: duplicateRevenueCount },
        },
        acomodacoes: rows,
        rankings: {
            maiorFaturamento: makeRanking(rows, "receita", "desc", (items) =>
                items.some((item) => item.receita > 0),
            ),
            maisRentavel: makeRanking(rows, "resultado", "desc", (items) =>
                items.some(hasFinancialData),
            ),
            menosRentavel: makeRanking(rows, "resultado", "asc", (items) =>
                items.some(hasFinancialData),
            ),
            maiorOcupacao: makeRanking(rows, "taxaOcupacao", "desc", (items) =>
                items.some((item) => item.quantidadeHospedagens > 0),
            ),
            menorOcupacao: makeRanking(rows, "taxaOcupacao", "asc", (items) =>
                items.some((item) => item.quantidadeHospedagens > 0),
            ),
        },
    };
}

export default calculatePortfolioMetrics;