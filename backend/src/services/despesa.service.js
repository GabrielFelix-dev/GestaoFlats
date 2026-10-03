import Despesa from "../models/Despesa.js";
import { notFound } from "../utils/errors.js";

const VAZIO = { pago: 0, pendente: 0, total: 0, aPagar: 0 };

export const despesaService = {
  async list(filters) {
    return Despesa.listar(filters);
  },

  async getById(id) {
    const despesa = await Despesa.findById(id);

    if (!despesa) {
      throw notFound("Despesa não encontrada.");
    }

    return despesa;
  },

  async create(data) {
    return Despesa.create(data);
  },

  async update(id, data) {
    const despesa = await this.getById(id);

    return Despesa.findByIdAndUpdate(despesa._id, data, {
      new: true,
      runValidators: true,
    });
  },

  async changeStatus(id, status, dataPagamento) {
    const despesa = await this.getById(id);

    if (despesa.status === status && dataPagamento === undefined) {
      return despesa;
    }

    despesa.status = status;

    if (dataPagamento !== undefined) {
      despesa.dataPagamento = dataPagamento ? new Date(`${dataPagamento}T00:00:00.000Z`) : null;
    } else if (status === "Pago" && !despesa.dataPagamento) {
      despesa.dataPagamento = new Date();
    } else if (status !== "Pago") {
      despesa.dataPagamento = null;
    }

    await despesa.save();

    return despesa;
  },

  async remove(id) {
    const despesa = await this.getById(id);

    await Despesa.deleteOne({ _id: despesa._id });

    return true;
  },

  async summary(filters) {
    const [resultado] = await Despesa.resumo(filters);

    return resultado ?? VAZIO;
  },
};

export default despesaService;