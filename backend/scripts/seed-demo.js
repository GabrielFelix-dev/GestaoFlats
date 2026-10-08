import mongoose from "mongoose";
import { closeDatabase, connectDatabase } from "../src/config/database.js";
import Acomodacao from "../src/models/Acomodacao.js";
import Despesa from "../src/models/Despesa.js";
import Hospedagem from "../src/models/Hospedagem.js";
import Hospede from "../src/models/Hospede.js";
import Receita from "../src/models/Receita.js";

const marker = "DEMO-GESTAOFLATS-2026";
const demoCpfPrefix = "99000000";
const defaultMonth = new Date().toISOString().slice(0, 7);

function dateAtDay(month, day) {
    return new Date(`${month}-${String(day).padStart(2, "0")}T00:00:00.000Z`);
}

function daysBetween(checkIn, checkOut) {
    return Math.round((checkOut - checkIn) / 86400000);
}

async function upsertAccommodation(data) {
    return Acomodacao.findOneAndUpdate(
        { nome: data.nome },
        { $set: data },
        { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
    );
}

async function upsertGuest(data) {
    return Hospede.findOneAndUpdate(
        { cpf: data.cpf },
        { $set: data },
        { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
    );
}

async function main() {
    const selectedMonth = process.argv[2] ?? defaultMonth;
    if (!/^\d{4}-\d{2}$/.test(selectedMonth)) {
        throw new Error("Informe o mês no formato AAAA-MM, por exemplo 2026-09.");
    }

    const monthEnd = new Date(`${selectedMonth}-01T00:00:00.000Z`);
    monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);

    await connectDatabase();

    const accommodations = await Promise.all([
        upsertAccommodation({
            nome: `${marker} Flat Catolé`, tipo: "Flat", capacidade: 3, valorDiaria: 250,
            endereco: { rua: "Rua das Acácias", numero: "120", bairro: "Catolé", cidade: "Campina Grande", estado: "PB", cep: "58410-120" },
            descricao: "Imóvel fictício para validar o relatório financeiro.", status: "Disponivel",
        }),
        upsertAccommodation({
            nome: `${marker} Apartamento Mirante`, tipo: "Apartamento", capacidade: 4, valorDiaria: 310,
            endereco: { rua: "Avenida do Mirante", numero: "45", complemento: "Apto 302", bairro: "Mirante", cidade: "Campina Grande", estado: "PB", cep: "58407-045" },
            descricao: "Imóvel fictício para validar o relatório financeiro.", status: "Disponivel",
        }),
        upsertAccommodation({
            nome: `${marker} Studio Centro`, tipo: "Studio", capacidade: 2, valorDiaria: 190,
            endereco: { rua: "Rua Maciel Pinheiro", numero: "88", bairro: "Centro", cidade: "Campina Grande", estado: "PB", cep: "58400-100" },
            descricao: "Imóvel fictício para validar o relatório financeiro.", status: "Disponivel",
        }),
        upsertAccommodation({
            nome: `${marker} Flat Alto Branco`, tipo: "Flat", capacidade: 3, valorDiaria: 230,
            endereco: { rua: "Rua José do Patrocínio", numero: "260", bairro: "Alto Branco", cidade: "Campina Grande", estado: "PB", cep: "58401-180" },
            descricao: "Imóvel fictício para validar o relatório financeiro.", status: "Disponivel",
        }),
        // Novos tipos de acomodação (tipos válidos: Flat, Quarto, Studio, Apartamento)
        upsertAccommodation({
            nome: `${marker} Apartamento Loft`, tipo: "Apartamento", capacidade: 2, valorDiaria: 280,
            endereco: { rua: "Rua da Modernidade", numero: "100", bairro: "Bairro Novo", cidade: "Campina Grande", estado: "PB", cep: "58405-000" },
            descricao: "Apartamento estilo loft para validação de relatórios.", status: "Disponivel",
        }),
        upsertAccommodation({
            nome: `${marker} Casa de Praia`, tipo: "Flat", capacidade: 6, valorDiaria: 450,
            endereco: { rua: "Avenida Beira Mar", numero: "500", bairro: "Praia do Sol", cidade: "Campina Grande", estado: "PB", cep: "58408-000" },
            descricao: "Casa de praia (tipo Flat) para testes de capacidade maior.", status: "Disponivel",
        }),
        upsertAccommodation({
            nome: `${marker} Quarto da Serra`, tipo: "Quarto", capacidade: 4, valorDiaria: 320,
            endereco: { rua: "Estrada da Serra", numero: "1000", bairro: "Serra Verde", cidade: "Campina Grande", estado: "PB", cep: "58409-000" },
            descricao: "Quarto em chalé rústico para diversificar tipos.", status: "Manutencao",
        }),
        upsertAccommodation({
            nome: `${marker} Quarto Estudante`, tipo: "Quarto", capacidade: 1, valorDiaria: 120,
            endereco: { rua: "Rua Universitária", numero: "50", bairro: "Universitário", cidade: "Campina Grande", estado: "PB", cep: "58410-000" },
            descricao: "Quarto econômico para testes.", status: "Inativa",
        }),
    ]);

    const guests = await Promise.all([
        upsertGuest({ nome: `${marker} Ana Souza`, cpf: `${demoCpfPrefix}001`, telefone: "83999990001", email: "demo.ana@example.test", observacoes: marker, status: "Ativo", documentoTipo: "CPF" }),
        upsertGuest({ nome: `${marker} Bruno Lima`, cpf: `${demoCpfPrefix}002`, telefone: "83999990002", email: "demo.bruno@example.test", observacoes: marker, status: "Ativo", documentoTipo: "CPF" }),
        upsertGuest({ nome: `${marker} Carla Alves`, cpf: `${demoCpfPrefix}003`, telefone: "83999990003", email: "demo.carla@example.test", observacoes: marker, status: "Ativo", documentoTipo: "CPF" }),
        upsertGuest({ nome: `${marker} Diego Nunes`, cpf: `${demoCpfPrefix}004`, telefone: "83999990004", email: "demo.diego@example.test", observacoes: marker, status: "Ativo", documentoTipo: "CPF" }),
        // Hóspedes com RG
        upsertGuest({ nome: `${marker} Eduardo Costa`, cpf: `${demoCpfPrefix}005`, telefone: "83999990005", email: "demo.eduardo@example.test", observacoes: marker, status: "Ativo", documentoTipo: "RG" }),
        upsertGuest({ nome: `${marker} Fernanda Rocha`, cpf: `${demoCpfPrefix}006`, telefone: "83999990006", email: "demo.fernanda@example.test", observacoes: marker, status: "Ativo", documentoTipo: "RG" }),
        // Hóspedes com CNH
        upsertGuest({ nome: `${marker} Gustavo Mendes`, cpf: `${demoCpfPrefix}007`, telefone: "83999990007", email: "demo.gustavo@example.test", observacoes: marker, status: "Ativo", documentoTipo: "CNH" }),
        upsertGuest({ nome: `${marker} Helena Dias`, cpf: `${demoCpfPrefix}008`, telefone: "83999990008", email: "demo.helena@example.test", observacoes: marker, status: "Ativo", documentoTipo: "CNH" }),
        // Hóspedes inativos
        upsertGuest({ nome: `${marker} Igor Pinto`, cpf: `${demoCpfPrefix}009`, telefone: "83999990009", email: "demo.igor@example.test", observacoes: marker, status: "Inativo", documentoTipo: "CPF" }),
        upsertGuest({ nome: `${marker} Julia Martins`, cpf: `${demoCpfPrefix}010`, telefone: "83999990010", email: "demo.julia@example.test", observacoes: marker, status: "Inativo", documentoTipo: "RG" }),
    ]);

    const staySpecs = [
        { key: "catole-01", property: 0, guest: 0, checkIn: 1, nights: 3, status: "Concluida", dailyPrice: 250 },
        { key: "catole-02", property: 0, guest: 1, checkIn: 12, nights: 4, status: "Confirmada", dailyPrice: 230 },
        { key: "mirante-01", property: 1, guest: 2, checkIn: 2, nights: 3, status: "Concluida", dailyPrice: 310 },
        { key: "mirante-02", property: 1, guest: 3, checkIn: 19, nights: 3, status: "Confirmada", dailyPrice: 295 },
        { key: "centro-01", property: 2, guest: 0, checkIn: 8, nights: 2, status: "Cancelada", dailyPrice: 190 },
        { key: "centro-02", property: 2, guest: 1, checkIn: 23, nights: 3, status: "Confirmada", dailyPrice: 175 },
        { key: "alto-branco-01", property: 3, guest: 2, checkIn: 1, nights: 2, status: "Concluida", dailyPrice: 230 },
        // Novas hospedagens com mais status e combinações
        { key: "loft-01", property: 4, guest: 4, checkIn: 3, nights: 5, status: "Concluida", dailyPrice: 280 },
        { key: "loft-02", property: 4, guest: 5, checkIn: 15, nights: 2, status: "Confirmada", dailyPrice: 260 },
        { key: "casa-praia-01", property: 5, guest: 6, checkIn: 5, nights: 7, status: "Concluida", dailyPrice: 450 },
        { key: "casa-praia-02", property: 5, guest: 7, checkIn: 20, nights: 4, status: "Confirmada", dailyPrice: 420 },
        { key: "chale-01", property: 6, guest: 8, checkIn: 10, nights: 3, status: "Cancelada", dailyPrice: 320 },
        { key: "kitnet-01", property: 7, guest: 9, checkIn: 1, nights: 10, status: "Concluida", dailyPrice: 120 },
        { key: "kitnet-02", property: 7, guest: 0, checkIn: 18, nights: 2, status: "Confirmada", dailyPrice: 110 },
        { key: "catole-03", property: 0, guest: 2, checkIn: 25, nights: 2, status: "Confirmada", dailyPrice: 240 },
        { key: "mirante-03", property: 1, guest: 3, checkIn: 28, nights: 1, status: "Concluida", dailyPrice: 300 },
    ];

    const stays = [];
    for (const spec of staySpecs) {
        const checkIn = dateAtDay(selectedMonth, spec.checkIn);
        const checkOut = new Date(checkIn.getTime() + spec.nights * 86400000);
        const stay = await Hospedagem.findOneAndUpdate(
            { observacoes: `${marker}:${spec.key}` },
            {
                $set: {
                    hospede: guests[spec.guest]._id,
                    acomodacao: accommodations[spec.property]._id,
                    dataCheckIn: checkIn,
                    dataCheckOut: checkOut,
                    valorDiaria: spec.dailyPrice,
                    valorTotal: spec.dailyPrice * daysBetween(checkIn, checkOut),
                    numeroHospedes: 2,
                    observacoes: `${marker}:${spec.key}`,
                    status: spec.status,
                },
            },
            { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
        );
        stays.push({ stay, spec });
    }

    const revenues = [];
    for (const { stay, spec } of stays) {
        const revenueStatus = spec.status === "Cancelada"
            ? "Cancelado"
            : spec.status === "Concluida"
                ? "Recebido"
                : "Pendente";
        const revenue = await Receita.findOneAndUpdate(
            { origem: marker, categoria: spec.key },
            {
                $set: {
                    descricao: `${marker} Reserva ${spec.key}`,
                    valor: stay.valorTotal,
                    data: stay.dataCheckIn,
                    origem: marker,
                    categoria: spec.key,
                    hospedagem: stay._id,
                    status: revenueStatus,
                },
            },
            { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
        );
        revenues.push(revenue);
    }

    const expenseSpecs = [
        { key: "catole-condominio", property: 0, category: "Condominio", amount: 420, day: 5 },
        { key: "catole-energia", property: 0, category: "Energia", amount: 185, day: 14 },
        { key: "mirante-condominio", property: 1, category: "Condominio", amount: 510, day: 6 },
        { key: "mirante-manutencao", property: 1, category: "Manutencao", amount: 135, day: 17 },
        { key: "centro-energia", property: 2, category: "Energia", amount: 900, day: 3 },
        { key: "alto-branco-condominio", property: 3, category: "Condominio", amount: 390, day: 9 },
        { key: "geral-contabilidade", property: null, category: "Outros", amount: 300, day: 4 },
        { key: "geral-software", property: null, category: "Marketing", amount: 120, day: 20 },
        // Novas despesas com mais categorias
        { key: "loft-agua", property: 4, category: "Agua", amount: 85, day: 11 },
        { key: "loft-internet", property: 4, category: "Internet", amount: 120, day: 12 },
        { key: "casa-praia-condominio", property: 5, category: "Condominio", amount: 650, day: 7 },
        { key: "casa-praia-limpeza", property: 5, category: "Limpeza", amount: 200, day: 8 },
        { key: "chale-manutencao", property: 6, category: "Manutencao", amount: 350, day: 15 },
        { key: "kitnet-energia", property: 7, category: "Energia", amount: 75, day: 2 },
        { key: "geral-seguro", property: null, category: "Seguro", amount: 450, day: 22 },
        { key: "geral-impostos", property: null, category: "Impostos", amount: 800, day: 25 },
        { key: "geral-marketing2", property: null, category: "Marketing", amount: 200, day: 18 },
    ];

    const expenses = await Promise.all(expenseSpecs.map((spec) => {
        const dueDate = dateAtDay(selectedMonth, spec.day);
        const isPaid = spec.day < new Date().getUTCDate() || selectedMonth < new Date().toISOString().slice(0, 7);

        return Despesa.findOneAndUpdate(
            { descricao: `${marker}:${spec.key}` },
            {
                $set: {
                    descricao: `${marker}:${spec.key}`,
                    categoria: spec.category,
                    valor: spec.amount,
                    acomodacao: spec.property === null ? null : accommodations[spec.property]._id,
                    dataVencimento: dueDate,
                    dataPagamento: isPaid ? dueDate : null,
                    status: isPaid ? "Pago" : "Pendente",
                },
            },
            { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
        );
    }));

    const unmarkedDemoData = await Promise.all([
        Hospedagem.countDocuments({ observacoes: new RegExp(`^${marker}:`) }),
        Receita.countDocuments({ origem: marker }),
        Despesa.countDocuments({ descricao: new RegExp(`^${marker}:`) }),
    ]);

    console.log(JSON.stringify({
        database: mongoose.connection.name,
        month: selectedMonth,
        accommodations: accommodations.length,
        guests: guests.length,
        stays: unmarkedDemoData[0],
        revenues: unmarkedDemoData[1],
        expenses: unmarkedDemoData[2],
        linkedRevenues: revenues.length,
        note: "Todos os nomes e CPFs são fictícios; os registros estão marcados com DEMO-GESTAOFLATS-2026.",
    }, null, 2));
}

main()
    .catch((error) => {
        console.error("Não foi possível preparar os dados de demonstração:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await closeDatabase();
    });