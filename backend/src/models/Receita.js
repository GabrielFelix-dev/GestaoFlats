import mongoose from "mongoose";
import { STATUS_RECEITA } from "../utils/enums.js";
import { escapeRegex } from "../utils/regex.js";

const receitaSchema = new mongoose.Schema(
  {
    descricao: { type: String, required: true, trim: true, maxlength: 200 },
    valor: { type: Number, required: true, min: 0 },
    data: { type: Date, required: true, index: true },
    origem: { type: String, trim: true, maxlength: 80 },
    categoria: { type: String, trim: true, maxlength: 80 },
    hospedagem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospedagem",
      default: null,
      index: true,
    },
    status: { type: String, enum: STATUS_RECEITA, default: "Pendente", index: true },
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
    versionKey: false,
    collection: "receitas",
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  },
);

receitaSchema.statics.listar = function listar({ search, status, dataInicial, dataFinal } = {}) {
  const filtro = {};

  if (search) {
    const termo = new RegExp(escapeRegex(search), "i");
    filtro.$or = [{ descricao: termo }, { origem: termo }, { categoria: termo }];
  }

  if (status) {
    filtro.status = status;
  }

  if (dataInicial || dataFinal) {
    filtro.data = {};

    if (dataInicial) {
      filtro.data.$gte = new Date(`${dataInicial}T00:00:00.000Z`);
    }

    if (dataFinal) {
      filtro.data.$lte = new Date(`${dataFinal}T23:59:59.999Z`);
    }
  }

  return this.find(filtro).sort({ data: -1 });
};

receitaSchema.statics.resumo = function resumo({ dataInicial, dataFinal } = {}) {
  const filtro = {};

  if (dataInicial || dataFinal) {
    filtro.data = {};

    if (dataInicial) {
      filtro.data.$gte = new Date(`${dataInicial}T00:00:00.000Z`);
    }

    if (dataFinal) {
      filtro.data.$lte = new Date(`${dataFinal}T23:59:59.999Z`);
    }
  }

  return this.aggregate([
    { $match: filtro },
    {
      $group: {
        _id: null,
        recebido: {
          $sum: { $cond: [{ $eq: ["$status", "Recebido"] }, "$valor", 0] },
        },
        pendente: {
          $sum: { $cond: [{ $eq: ["$status", "Pendente"] }, "$valor", 0] },
        },
        total: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        recebido: 1,
        pendente: 1,
        total: 1,
        aReceber: { $add: ["$recebido", "$pendente"] },
      },
    },
  ]);
};

export const Receita = mongoose.model("Receita", receitaSchema);

export default Receita;