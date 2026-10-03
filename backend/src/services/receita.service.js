import Receita from "../models/Receita.js";
import { notFound } from "../utils/errors.js";

const VAZIO = { recebido: 0, pendente: 0, total: 0, aReceber: 0 };

export const receitaService = {
  async list(filters) {
    return Receita.listar(filters);
  },

  async getById(id) {
    const receita = await Receita.findById(id);

    if (!receita) {
      throw notFound("Receita não encontrada.");
    }

    return receita;
  },

  async create(data) {
    return Receita.create(data);
  },

  async update(id, data) {
    const receita = await this.getById(id);

    return Receita.findByIdAndUpdate(receita._id, data, {
      new: true,
      runValidators: true,
    });
  },

  async changeStatus(id, status) {
    const receita = await this.getById(id);

    if (receita.status === status) {
      return receita;
    }

    receita.status = status;
    await receita.save();

    return receita;
  },

  async remove(id) {
    const receita = await this.getById(id);

    await Receita.deleteOne({ _id: receita._id });

    return true;
  },

  async summary(filters) {
    const [resultado] = await Receita.resumo(filters);

    return resultado ?? VAZIO;
  },
};

export default receitaService;