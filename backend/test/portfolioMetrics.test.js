import assert from "node:assert/strict";
import mongoose from "mongoose";
import test from "node:test";
import {
    calculatePortfolioMetrics,
    countNightsInPeriod,
} from "../src/services/portfolioMetrics.js";

const period = {
    periodStart: "2026-09-01",
    periodEndExclusive: "2026-09-04",
};

test("check-out é exclusivo e permite próxima entrada no mesmo dia", () => {
    assert.equal(
        countNightsInPeriod("2026-09-01", "2026-09-02", "2026-09-02", "2026-09-03"),
        0,
    );
    assert.equal(
        countNightsInPeriod("2026-09-01", "2026-09-02", "2026-09-01", "2026-09-02"),
        1,
    );
});

test("rateia hospedagem parcial, ignora cancelada e separa despesas gerais", () => {
    const report = calculatePortfolioMetrics({
        ...period,
        acomodacoes: [
            {
                _id: "property-a",
                nome: "Flat Catolé",
                valorDiaria: 250,
                endereco: { bairro: "Catolé" },
            },
            {
                _id: "property-b",
                nome: "Apartamento Centro",
                valorDiaria: 200,
                endereco: { bairro: "Centro" },
            },
        ],
        hospedagens: [
            {
                _id: "stay-partial",
                acomodacao: "property-a",
                dataCheckIn: "2026-08-31",
                dataCheckOut: "2026-09-03",
                status: "Ativa",
            },
            {
                _id: "stay-a-complete",
                acomodacao: "property-a",
                dataCheckIn: "2026-09-03",
                dataCheckOut: "2026-09-04",
                status: "Confirmada",
            },
            {
                _id: "stay-b",
                acomodacao: "property-b",
                dataCheckIn: "2026-09-02",
                dataCheckOut: "2026-09-03",
                status: "Concluida",
            },
            {
                _id: "stay-cancelled",
                acomodacao: "property-a",
                dataCheckIn: "2026-09-01",
                dataCheckOut: "2026-09-03",
                status: "Cancelada",
            },
        ],
        receitas: [
            { hospedagem: "stay-partial", valor: 300, status: "Pendente" },
            { hospedagem: "stay-a-complete", valor: 250, status: "Recebido" },
            { hospedagem: "stay-b", valor: 80, status: "Recebido" },
            { hospedagem: "stay-cancelled", valor: 1000, status: "Cancelado" },
            { hospedagem: null, valor: 50, status: "Recebido" },
        ],
        despesas: [
            { _id: "expense-a", acomodacao: "property-a", valor: 20, descricao: "Energia" },
            { _id: "expense-b", acomodacao: "property-b", valor: 100, descricao: "Condomínio" },
            { _id: "expense-general", acomodacao: null, valor: 30, descricao: "Contador" },
        ],
    });

    assert.equal(report.resumo.receitaTotal, 580);
    assert.equal(report.resumo.despesasTotais, 150);
    assert.equal(report.resumo.resultadoLiquido, 430);
    assert.equal(report.resumo.taxaOcupacao, 67);
    assert.equal(report.resumo.diariasOcupadas, 4);

    const flat = report.acomodacoes.find((item) => item.acomodacaoId === "property-a");
    const center = report.acomodacoes.find((item) => item.acomodacaoId === "property-b");
    assert.equal(flat.receita, 450);
    assert.equal(flat.diariasOcupadas, 3);
    assert.equal(flat.diariaMediaRealizada, 150);
    assert.equal(center.resultado, -20);
    assert.equal(center.classificacaoResultado, "Prejuízo");
    assert.equal(flat.despesasDetalhe.length, 1);
    assert.equal(report.rankings.menosRentavel.nome, "Apartamento Centro");
});

test("não cria rankings de ocupação sem hospedagens no período", () => {
    const report = calculatePortfolioMetrics({
        ...period,
        acomodacoes: [{ _id: "property-a", nome: "Flat vazio", valorDiaria: 100 }],
        hospedagens: [],
        receitas: [],
        despesas: [],
    });

    assert.equal(report.rankings.maiorOcupacao, null);
    assert.equal(report.rankings.menorOcupacao, null);
    assert.equal(report.resumo.margem, 0);
});

test("evita duplicar receita vinculada e reporta inconsistências", () => {
    const report = calculatePortfolioMetrics({
        ...period,
        acomodacoes: [{ _id: "property-a", nome: "Flat", valorDiaria: 100 }],
        hospedagens: [
            {
                _id: "stay-a",
                acomodacao: "property-a",
                dataCheckIn: "2026-09-01",
                dataCheckOut: "2026-09-02",
                status: "Concluida",
            },
            {
                _id: "stay-b",
                acomodacao: "property-a",
                dataCheckIn: "2026-09-02",
                dataCheckOut: "2026-09-03",
                status: "Ativa",
            },
        ],
        receitas: [
            { hospedagem: "stay-a", valor: 100, status: "Recebido", criadoEm: "2026-09-02" },
            { hospedagem: "stay-a", valor: 900, status: "Recebido", criadoEm: "2026-09-03" },
        ],
        despesas: [],
    });

    assert.equal(report.acomodacoes[0].receita, 100);
    assert.deepEqual(report.resumo.inconsistencias, {
        hospedagensSemReceita: 1,
        receitasDuplicadas: 1,
    });
});

test("resolve identificadores ObjectId do Mongoose sem recursão", () => {
    const accommodationId = new mongoose.Types.ObjectId();
    const stayId = new mongoose.Types.ObjectId();
    const report = calculatePortfolioMetrics({
        ...period,
        acomodacoes: [{ _id: accommodationId, nome: "Flat", valorDiaria: 100 }],
        hospedagens: [
            {
                _id: stayId,
                acomodacao: accommodationId,
                dataCheckIn: "2026-09-01",
                dataCheckOut: "2026-09-02",
                status: "Concluida",
            },
        ],
        receitas: [{ hospedagem: stayId, valor: 100, status: "Recebido" }],
        despesas: [],
    });

    assert.equal(report.acomodacoes[0].acomodacaoId, accommodationId.toHexString());
    assert.equal(report.acomodacoes[0].receita, 100);
});