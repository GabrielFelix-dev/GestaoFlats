import Acomodacao from "../models/Acomodacao.js";
import Hospedagem from "../models/Hospedagem.js";
import hospedagemService from "./hospedagem.service.js";
import { conflict, notFound } from "../utils/errors.js";

function inicioDoDia(iso) {
  return new Date(`${iso}T00:00:00.000Z`);
}

function inicioDoDiaSeguinte(iso) {
  const data = new Date(`${iso}T00:00:00.000Z`);
  data.setUTCDate(data.getUTCDate() + 1);
  return data;
}

function mesmoDia(valor, iso) {
  return new Date(valor).toISOString().slice(0, 10) === iso;
}

export const checkinCheckoutService = {
  async list({ data, status } = {}) {
    const referencia = data ?? new Date().toISOString().slice(0, 10);
    const inicio = inicioDoDia(referencia);
    const fim = inicioDoDiaSeguinte(referencia);
    const filtro = status ? { status } : {};

    const hospedagens = await Hospedagem.find(filtro)
      .populate("hospede", "nome")
      .populate("acomodacao", "nome tipo")
      .sort({ dataCheckIn: 1 });

    const checkIns = hospedagens.filter(
      (item) => item.status === "Confirmada" && mesmoDia(item.dataCheckIn, referencia),
    );

    const checkOuts = hospedagens.filter(
      (item) =>
        ["Confirmada", "Ativa"].includes(item.status) &&
        mesmoDia(item.dataCheckOut, referencia),
    );

    const hospedesNoLocal = hospedagens.filter(
      (item) =>
        item.status === "Ativa" &&
        item.dataCheckIn < fim &&
        item.dataCheckOut > inicio,
    );

    return {
      data: referencia,
      checkIns,
      checkOuts,
      hospedesNoLocal,
      totais: {
        checkIns: checkIns.length,
        checkOuts: checkOuts.length,
        hospedesNoLocal: hospedesNoLocal.length,
      },
    };
  },

  async checkIn(id) {
    const hospedagem = await Hospedagem.findById(id);

    if (!hospedagem) {
      throw notFound("Hospedagem não encontrada.");
    }

    if (hospedagem.status !== "Confirmada") {
      throw conflict("Somente hospedagens confirmadas permitem check-in.");
    }

    return hospedagemService.changeStatus(id, "Ativa");
  },

  async checkOut(id) {
    const hospedagem = await Hospedagem.findById(id);

    if (!hospedagem) {
      throw notFound("Hospedagem não encontrada.");
    }

    if (hospedagem.status !== "Ativa") {
      throw conflict("Somente hospedagens em andamento permitem check-out.");
    }

    return hospedagemService.changeStatus(id, "Concluida");
  },

  async calcularDisponibilidade({ dataInicial, dataFinal, tipo }) {
    const inicio = inicioDoDia(dataInicial);
    const fim = inicioDoDia(dataFinal);
    const totalDias = Math.max(0, Math.round((fim - inicio) / 86400000));

    const filtroAcomodacao = { status: { $nin: ["Inativa", "Manutencao"] } };

    if (tipo) {
      filtroAcomodacao.tipo = tipo;
    }

    const [acomodacoes, reservas] = await Promise.all([
      Acomodacao.find(filtroAcomodacao).sort({ nome: 1 }),
      Hospedagem.find({
        status: { $in: ["Confirmada", "Ativa"] },
        dataCheckIn: { $lt: fim },
        dataCheckOut: { $gt: inicio },
      })
        .populate("hospede", "nome")
        .populate("acomodacao", "nome tipo")
        .sort({ dataCheckIn: 1 }),
    ]);

    const lista = acomodacoes.map((acomodacao) => {
      const itens = reservas.filter(
        (item) => String(item.acomodacao._id) === String(acomodacao._id),
      );

      const diasReservados = itens.reduce((total, item) => {
        const reservaInicio = Math.max(inicio.getTime(), new Date(item.dataCheckIn).getTime());
        const reservaFim = Math.min(fim.getTime(), new Date(item.dataCheckOut).getTime());
        const dias = Math.max(0, Math.round((reservaFim - reservaInicio) / 86400000));

        return total + dias;
      }, 0);

      const diasDisponiveis = Math.max(0, totalDias - diasReservados);

      return {
        acomodacao,
        disponivel: diasReservados === 0,
        diasDisponiveis,
        ocupacaoPercentual: Math.min(
          100,
          Math.round(((totalDias - diasDisponiveis) / totalDias) * 100),
        ),
        reservas: itens,
      };
    });

    const disponiveis = lista.filter((item) => item.disponivel).length;

    return {
      periodo: { dataInicial, dataFinal, totalDias },
      total: lista.length,
      disponiveis,
      ocupadas: lista.length - disponiveis,
      taxaDisponibilidade: lista.length ? Math.round((disponiveis / lista.length) * 100) : 0,
      acomodacoes: lista,
    };
  },
};

export default checkinCheckoutService;