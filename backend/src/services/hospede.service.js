import Hospede from "../models/Hospede.js";
import { conflict, notFound } from "../utils/errors.js";

function normalizarDocumento({ documentoTipo, cpf }) {
  const digits = String(cpf ?? "").replace(/\D/g, "");

  if (documentoTipo === "RG") {
    if (digits.length !== 9) {
      throw new Error("RG deve ter 9 dígitos.");
    }
  } else if (documentoTipo === "CNH") {
    if (digits.length !== 11) {
      throw new Error("CNH deve ter 11 dígitos.");
    }
  } else {
    if (digits.length !== 11) {
      throw new Error("CPF deve ter 11 dígitos.");
    }
  }

  return digits;
}

async function ensureCpfAvailable(cpf, ignoreId = null) {
  const filtro = { cpf };

  if (ignoreId) {
    filtro._id = { $ne: ignoreId };
  }

  const existente = await Hospede.findOne(filtro);

  if (existente) {
    throw conflict("Já existe um hóspede com este documento.");
  }
}

export const hospedeService = {
  async list(filters) {
    const hospedes = await Hospede.listar(filters);

    return hospedes;
  },

  async getById(id) {
    const hospede = await Hospede.findById(id);

    if (!hospede) {
      throw notFound("Hóspede não encontrado.");
    }

    return hospede;
  },

  async create(data) {
    const cpf = normalizarDocumento(data);
    await ensureCpfAvailable(cpf);

    return Hospede.create({ ...data, cpf });
  },

  async update(id, data) {
    const hospede = await this.getById(id);

    if (data.cpf) {
      const cpf = normalizarDocumento(data);
      await ensureCpfAvailable(cpf, hospede._id);
    }

    const updated = await Hospede.findByIdAndUpdate(hospede._id, data, {
      new: true,
      runValidators: true,
    });

    return updated;
  },

  async remove(id) {
    const hospede = await this.getById(id);

    await Hospede.deleteOne({ _id: hospede._id });

    return true;
  },
};

export default hospedeService;