import Receita from "../models/Receita.js";
import Hospedagem from "../models/Hospedagem.js";
import { conflict, notFound } from "../utils/errors.js";

const VAZIO = { recebido: 0, pendente: 0, total: 0, aReceber: 0 };

function mapHospedagem(data) {
  const mapped = { ...data };

  if (Object.hasOwn(data, "hospedagemId")) {
    mapped.hospedagem = data.hospedagemId;
    delete mapped.hospedagemId;
  }

  return mapped;
}

async function assertHospedagemAvailable(hospedagemId, ignoreId = null) {
  if (!hospedagemId) return;

  if (!(await Hospedagem.exists({ _id: hospedagemId }))) {
    throw notFound("Hospedagem não encontrada.");
  }

  const filtro = { hospedagem: hospedagemId };
  if (ignoreId) filtro._id = { $ne: ignoreId };

  if (await Receita.exists(filtro)) {
    throw conflict("Já existe uma receita vinculada a esta hospedagem.");
  }
}

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
    const mapped = mapHospedagem(data);
    await assertHospedagemAvailable(mapped.hospedagem);

    return Receita.create(mapped);
  },

  async update(id, data) {
    const receita = await this.getById(id);
    const mapped = mapHospedagem(data);
    await assertHospedagemAvailable(mapped.hospedagem, receita._id);

    return Receita.findByIdAndUpdate(receita._id, mapped, {
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