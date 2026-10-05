import Despesa from "../models/Despesa.js";
import Acomodacao from "../models/Acomodacao.js";
import { notFound } from "../utils/errors.js";

const VAZIO = { pago: 0, pendente: 0, total: 0, aPagar: 0 };

function mapAcomodacao(data) {
  const mapped = { ...data };

  if (Object.hasOwn(data, "acomodacaoId")) {
    mapped.acomodacao = data.acomodacaoId || null;
    delete mapped.acomodacaoId;
  }

  return mapped;
}

async function assertAcomodacaoExists(acomodacaoId) {
  if (acomodacaoId && !(await Acomodacao.exists({ _id: acomodacaoId }))) {
    throw notFound("Acomodação não encontrada.");
  }
}

export const despesaService = {
  async list(filters) {
    return Despesa.listar(filters);
  },

  async getById(id) {
    const despesa = await Despesa.findById(id).populate("acomodacao", "nome endereco");

    if (!despesa) {
      throw notFound("Despesa não encontrada.");
    }

    return despesa;
  },

  async create(data) {
    await assertAcomodacaoExists(data.acomodacaoId);
    const despesa = await Despesa.create(mapAcomodacao(data));

    return this.getById(despesa._id);
  },

  async update(id, data) {
    const despesa = await this.getById(id);
    await assertAcomodacaoExists(data.acomodacaoId);

    await Despesa.findByIdAndUpdate(despesa._id, mapAcomodacao(data), {
      new: true,
      runValidators: true,
    });

    return this.getById(despesa._id);
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