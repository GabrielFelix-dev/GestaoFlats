import Acomodacao from "../models/Acomodacao.js";
import Despesa from "../models/Despesa.js";
import Hospedagem from "../models/Hospedagem.js";
import { conflict, notFound } from "../utils/errors.js";
import { escapeRegex } from "../utils/regex.js";

async function ensureNomeDisponivel(nome, ignoreId = null) {
  const filtro = { nome: new RegExp(`^${escapeRegex(String(nome).trim())}$`, "i") };

  if (ignoreId) {
    filtro._id = { $ne: ignoreId };
  }

  const existente = await Acomodacao.findOne(filtro);

  if (existente) {
    throw conflict("Já existe uma acomodação com este nome.");
  }
}

export const acomodacaoService = {
  async list(filters) {
    return Acomodacao.listar(filters);
  },

  async getById(id) {
    const acomodacao = await Acomodacao.findById(id);

    if (!acomodacao) {
      throw notFound("Acomodação não encontrada.");
    }

    return acomodacao;
  },

  async create(data) {
    await ensureNomeDisponivel(data.nome);

    return Acomodacao.create(data);
  },

  async update(id, data) {
    const acomodacao = await this.getById(id);

    if (data.nome) {
      await ensureNomeDisponivel(data.nome, acomodacao._id);
    }

    return Acomodacao.findByIdAndUpdate(acomodacao._id, data, {
      new: true,
      runValidators: true,
    });
  },

  async changeStatus(id, status) {
    const acomodacao = await this.getById(id);

    if (status === "Ocupada") {
      const hoje = new Date();
      const amanha = new Date(hoje.getTime() + 86400000);

      const ocupada = await Hospedagem.disponiveis(acomodacao._id, hoje, amanha);

      if (ocupada) {
        throw conflict("Acomodação possui hospedagem ativa no período.");
      }
    }

    acomodacao.status = status;
    await acomodacao.save();

    return acomodacao;
  },

  async remove(id) {
    const acomodacao = await this.getById(id);

    const vinculadas = await Hospedagem.countDocuments({
      acomodacao: acomodacao._id,
      status: { $ne: "Cancelada" },
    });

    if (vinculadas > 0) {
      throw conflict("Acomodação possui hospedagens vinculadas.");
    }

    const despesasVinculadas = await Despesa.countDocuments({ acomodacao: acomodacao._id });

    if (despesasVinculadas > 0) {
      throw conflict("Acomodação possui despesas vinculadas.");
    }

    await Acomodacao.deleteOne({ _id: acomodacao._id });

    return true;
  },
};

export default acomodacaoService;