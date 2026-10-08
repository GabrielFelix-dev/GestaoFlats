import assert from "node:assert/strict";
import test from "node:test";
import { createAcomodacaoSchema } from "../src/schemas/acomodacao.schema.js";
import { createDespesaSchema } from "../src/schemas/despesa.schema.js";
import { dateString } from "../src/schemas/common.schema.js";

test("acomodação aceita registro legado sem endereço e novo endereço estruturado", () => {
    const legacy = createAcomodacaoSchema.parse({
        nome: "Flat 101",
        tipo: "Flat",
        capacidade: 2,
        valorDiaria: 220,
    });
    const updated = createAcomodacaoSchema.parse({
        nome: "Flat 102",
        tipo: "Flat",
        capacidade: 2,
        valorDiaria: 240,
        endereco: { bairro: "Catolé", cidade: "Campina Grande", estado: "PB" },
    });

    assert.equal(legacy.endereco, undefined);
    assert.equal(updated.endereco.bairro, "Catolé");
});

test("despesa aceita vínculo a imóvel e despesa geral nula", () => {
    const base = {
        descricao: "Conta de energia",
        categoria: "Energia",
        valor: 320,
        dataVencimento: "2026-09-10",
    };

    assert.equal(
        createDespesaSchema.parse({ ...base, acomodacaoId: "507f1f77bcf86cd799439011" })
            .acomodacaoId,
        "507f1f77bcf86cd799439011",
    );
    assert.equal(createDespesaSchema.parse({ ...base, acomodacaoId: null }).acomodacaoId, null);
    assert.equal(createDespesaSchema.parse(base).acomodacaoId, undefined);
});

test("validação de data recusa datas impossíveis no calendário", () => {
    assert.equal(dateString.safeParse("2026-02-30").success, false);
    assert.equal(dateString.safeParse("2026-09-30").success, true);
});