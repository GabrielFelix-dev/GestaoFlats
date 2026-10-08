import Acomodacao from "../models/Acomodacao.js";
import Hospedagem from "../models/Hospedagem.js";
import Hospede from "../models/Hospede.js";
import Receita from "../models/Receita.js";
import { conflict, notFound } from "../utils/errors.js";

function calcularDiarias(dataCheckIn, dataCheckOut) {
  const inicio = new Date(dataCheckIn);
  const fim = new Date(dataCheckOut);
  const diff = Math.round((fim - inicio) / 86400000);

  return diff > 0 ? diff : 1;
}

async function resolverRelacionados(data) {
  const [hospede, acomodacao] = await Promise.all([
    Hospede.findById(data.hospedeId),
    Acomodacao.findById(data.acomodacaoId),
  ]);

  if (!hospede) {
    throw notFound("Hóspede não encontrado.");
  }

  if (!acomodacao) {
    throw notFound("Acomodação não encontrada.");
  }

  if (["Manutencao", "Inativa"].includes(acomodacao.status)) {
    throw conflict("Acomodação indisponível para novas hospedagens.");
  }

  return { hospede, acomodacao };
}

async function sincronizarReceita(hospedagem, status) {
  const receita = await Receita.findOne({ hospedagem: hospedagem._id });

  if (!receita) {
    return null;
  }

  if (status === "Cancelada") {
    receita.status = "Cancelado";
  } else if (status === "Concluida") {
    receita.status = "Recebido";
  } else {
    return receita;
  }

  await receita.save();

  return receita;
}

async function sincronizarValorReceita(hospedagem, acomodacao) {
  let receita = await Receita.findOne({ hospedagem: hospedagem._id });

  if (!receita) {
    receita = await Receita.create({
      descricao: `Reserva ${acomodacao.nome}`,
      origem: "Hospedagem",
      categoria: "Reserva",
      valor: hospedagem.valorTotal,
      data: new Date(),
      hospedagem: hospedagem._id,
      status: "Pendente",
    });
    return receita;
  }

  receita.descricao = `Reserva ${acomodacao.nome}`;
  receita.valor = hospedagem.valorTotal;
  await receita.save();

  return receita;
}

export const hospedagemService = {
  async list(filters) {
    return Hospedagem.listar(filters);
  },

  async getById(id) {
    const hospedagem = await Hospedagem.findById(id)
      .populate("hospede", "nome")
      .populate("acomodacao", "nome tipo");

    if (!hospedagem) {
      throw notFound("Hospedagem não encontrada.");
    }

    return hospedagem;
  },

  async create(data) {
    const { acomodacao } = await resolverRelacionados(data);

    const inicio = new Date(`${data.dataCheckIn}T00:00:00.000Z`);
    const fim = new Date(`${data.dataCheckOut}T00:00:00.000Z`);

    const conflito = await Hospedagem.disponiveis(acomodacao._id, inicio, fim);

    if (conflito) {
      throw conflict("Acomodação ocupada no período informado.");
    }

    if ((data.numeroHospedes ?? 1) > acomodacao.capacidade) {
      throw conflict("Número de hóspedes excede a capacidade da acomodação.");
    }

    const valorDiaria = data.valorDiaria ?? acomodacao.valorDiaria;
    const valorTotal = valorDiaria * calcularDiarias(inicio, fim);

    const hospedagem = await Hospedagem.create({
      hospede: data.hospedeId,
      acomodacao: data.acomodacaoId,
      dataCheckIn: inicio,
      dataCheckOut: fim,
      valorDiaria,
      valorTotal,
      numeroHospedes: data.numeroHospedes ?? 1,
      observacoes: data.observacoes,
      status: data.status,
    });

    const criada = await this.getById(hospedagem._id);

    await Receita.create({
      descricao: `Reserva ${acomodacao.nome}`,
      origem: "Hospedagem",
      categoria: "Reserva",
      valor: valorTotal,
      data: new Date(),
      hospedagem: criada._id,
      status: "Pendente",
    });

    return criada;
  },

  async update(id, data) {
    const atual = await this.getById(id);

    if (["Concluida", "Cancelada"].includes(atual.status)) {
      throw conflict("Hospedagem finalizada não pode ser editada.");
    }

    if (data.status && data.status !== atual.status) {
      throw conflict("Altere o status usando as ações de check-in, check-out ou cancelamento.");
    }

    const merged = {
      hospedeId: data.hospedeId ?? atual.hospede._id,
      acomodacaoId: data.acomodacaoId ?? atual.acomodacao._id,
      dataCheckIn: data.dataCheckIn ?? atual.dataCheckIn,
      dataCheckOut: data.dataCheckOut ?? atual.dataCheckOut,
      valorDiaria: data.valorDiaria ?? atual.valorDiaria,
      numeroHospedes: data.numeroHospedes ?? atual.numeroHospedes,
      observacoes: data.observacoes ?? atual.observacoes,
      status: data.status ?? atual.status,
    };

    const inicio = new Date(merged.dataCheckIn);
    const fim = new Date(merged.dataCheckOut);

    if (fim <= inicio) {
      throw conflict("A data de check-out deve ser posterior à data de check-in.");
    }

    const { acomodacao } = await resolverRelacionados(merged);

    const conflito = await Hospedagem.disponiveis(merged.acomodacaoId, inicio, fim, atual._id);

    if (conflito) {
      throw conflict("Acomodação ocupada no período informado.");
    }

    const valorTotal = merged.valorDiaria * calcularDiarias(inicio, fim);

    const atualizada = await Hospedagem.findByIdAndUpdate(
      atual._id,
      {
        hospede: merged.hospedeId,
        acomodacao: merged.acomodacaoId,
        dataCheckIn: inicio,
        dataCheckOut: fim,
        valorDiaria: merged.valorDiaria,
        valorTotal,
        numeroHospedes: merged.numeroHospedes,
        observacoes: merged.observacoes,
        status: merged.status,
      },
      { new: true, runValidators: true },
    );

    await sincronizarValorReceita(atualizada, acomodacao);

    return this.getById(atualizada._id);
  },

  async changeStatus(id, status) {
    const hospedagem = await this.getById(id);

    if (hospedagem.status === status) {
      return hospedagem;
    }

    if (status === "Ativa" && hospedagem.status !== "Confirmada") {
      throw conflict("Somente hospedagens confirmadas podem ser iniciadas.");
    }

    if (status === "Concluida" && hospedagem.status !== "Ativa") {
      throw conflict("O check-out exige uma hospedagem em andamento.");
    }

    if (status === "Cancelada" && ["Concluida", "Cancelada"].includes(hospedagem.status)) {
      throw conflict("Hospedagem concluída ou cancelada não pode ser cancelada novamente.");
    }

    hospedagem.status = status;
    await hospedagem.save();

    await sincronizarReceita(hospedagem, status);

    return this.getById(id);
  },

  async remove(id) {
    const hospedagem = await this.getById(id);

    if (hospedagem.status === "Ativa") {
      throw conflict("Não é possível excluir uma hospedagem em andamento.");
    }

    await Receita.deleteMany({ hospedagem: hospedagem._id });
    await Hospedagem.deleteOne({ _id: hospedagem._id });

    return true;
  },
};

export default hospedagemService;