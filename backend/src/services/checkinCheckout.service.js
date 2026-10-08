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

  async getDiasComMovimento({ mes }) {
    const [ano, mesNum] = mes.split("-").map(Number);
    const inicio = new Date(Date.UTC(ano, mesNum - 1, 1));
    const fim = new Date(Date.UTC(ano, mesNum, 1));

    const hospedagens = await Hospedagem.find({
      status: { $in: ["Confirmada", "Ativa"] },
      dataCheckIn: { $lt: fim },
      dataCheckOut: { $gt: inicio },
    }).select("dataCheckIn dataCheckOut").lean();

    const diasComCheckIn = new Set();
    const diasComCheckOut = new Set();

    for (const h of hospedagens) {
      const checkInDate = new Date(h.dataCheckIn).toISOString().slice(0, 10);
      const checkOutDate = new Date(h.dataCheckOut).toISOString().slice(0, 10);

      if (checkInDate >= mes + "-01" && checkInDate < new Date(fim).toISOString().slice(0, 10)) {
        diasComCheckIn.add(checkInDate);
      }
      if (checkOutDate >= mes + "-01" && checkOutDate < new Date(fim).toISOString().slice(0, 10)) {
        diasComCheckOut.add(checkOutDate);
      }
    }

    return {
      mes,
      diasComCheckIn: Array.from(diasComCheckIn).sort(),
      diasComCheckOut: Array.from(diasComCheckOut).sort(),
    };
  },

  async getDiasComDisponibilidade({ mes, tipo }) {
    const [ano, mesNum] = mes.split("-").map(Number);
    const inicioMes = `${ano}-${String(mesNum).padStart(2, "0")}-01`;
    const fimMes = new Date(Date.UTC(ano, mesNum, 1)).toISOString().slice(0, 10);

    const filtroAcomodacao = { status: { $nin: ["Inativa", "Manutencao"] } };
    if (tipo) {
      filtroAcomodacao.tipo = tipo;
    }

    const [acomodacoes, reservas] = await Promise.all([
      Acomodacao.find(filtroAcomodacao).select("_id").lean(),
      Hospedagem.find({
        status: { $in: ["Confirmada", "Ativa"] },
        dataCheckIn: { $lt: new Date(fimMes) },
        dataCheckOut: { $gt: new Date(inicioMes) },
      }).select("dataCheckIn dataCheckOut acomodacao").lean(),
    ]);

    const acomodacaoIds = new Set(acomodacoes.map((a) => String(a._id)));
    const totalAcomodacoes = acomodacaoIds.size;

    const intervalos = reservas.map((r) => ({
      checkIn: new Date(r.dataCheckIn).toISOString().slice(0, 10),
      checkOut: new Date(r.dataCheckOut).toISOString().slice(0, 10),
      acomodacaoId: String(r.acomodacao),
    }));

    const diasLivres = new Set();
    const diasParciais = new Set();
    const diasLotados = new Set();

    const diasNoMes = new Date(Date.UTC(ano, mesNum, 0)).getUTCDate();
    for (let d = 1; d <= diasNoMes; d++) {
      const dataISO = `${ano}-${String(mesNum).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      let acomodacoesOcupadas = 0;
      for (const r of intervalos) {
        if (dataISO >= r.checkIn && dataISO < r.checkOut) {
          if (acomodacaoIds.has(r.acomodacaoId)) {
            acomodacoesOcupadas++;
          }
        }
      }

      if (acomodacoesOcupadas === 0) {
        diasLivres.add(dataISO);
      } else if (acomodacoesOcupadas < totalAcomodacoes) {
        diasParciais.add(dataISO);
      } else {
        diasLotados.add(dataISO);
      }
    }

    return {
      mes,
      totalAcomodacoes,
      diasLivres: Array.from(diasLivres).sort(),
      diasParciais: Array.from(diasParciais).sort(),
      diasLotados: Array.from(diasLotados).sort(),
    };
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