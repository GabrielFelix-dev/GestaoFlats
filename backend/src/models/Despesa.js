import mongoose from "mongoose";
import { STATUS_DESPESA } from "../utils/enums.js";
import { escapeRegex } from "../utils/regex.js";

const despesaSchema = new mongoose.Schema(
  {
    descricao: { type: String, required: true, trim: true, maxlength: 200 },
    categoria: { type: String, required: true, trim: true, maxlength: 80, index: true },
    valor: { type: Number, required: true, min: 0 },
    dataVencimento: { type: Date, required: true, index: true },
    dataPagamento: { type: Date, default: null },
    status: { type: String, enum: STATUS_DESPESA, default: "Pendente", index: true },
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
    versionKey: false,
    collection: "despesas",
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  },
);

despesaSchema.statics.listar = function listar({ search, status, categoria, dataInicial, dataFinal } = {}) {
  const filtro = {};

  if (search) {
    const termo = new RegExp(escapeRegex(search), "i");
    filtro.$or = [{ descricao: termo }, { categoria: termo }];
  }

  if (status) {
    filtro.status = status;
  }

  if (categoria) {
    filtro.categoria = categoria;
  }

  if (dataInicial || dataFinal) {
    filtro.dataVencimento = {};

    if (dataInicial) {
      filtro.dataVencimento.$gte = new Date(`${dataInicial}T00:00:00.000Z`);
    }

    if (dataFinal) {
      filtro.dataVencimento.$lte = new Date(`${dataFinal}T23:59:59.999Z`);
    }
  }

  return this.find(filtro).sort({ dataVencimento: -1 });
};

despesaSchema.statics.resumo = function resumo({ dataInicial, dataFinal } = {}) {
  const filtro = {};

  if (dataInicial || dataFinal) {
    filtro.dataVencimento = {};

    if (dataInicial) {
      filtro.dataVencimento.$gte = new Date(`${dataInicial}T00:00:00.000Z`);
    }

    if (dataFinal) {
      filtro.dataVencimento.$lte = new Date(`${dataFinal}T23:59:59.999Z`);
    }
  }

  return this.aggregate([
    { $match: filtro },
    {
      $group: {
        _id: null,
        pago: { $sum: { $cond: [{ $eq: ["$status", "Pago"] }, "$valor", 0] } },
        pendente: {
          $sum: {
            $cond: [{ $in: ["$status", ["Pendente", "Atrasado"]] }, "$valor", 0],
          },
        },
        total: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        pago: 1,
        pendente: 1,
        total: 1,
        aPagar: { $add: ["$pago", "$pendente"] },
      },
    },
  ]);
};

export const Despesa = mongoose.model("Despesa", despesaSchema);

export default Despesa;