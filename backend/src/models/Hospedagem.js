import mongoose from "mongoose";
import { STATUS_HOSPEDAGEM } from "../utils/enums.js";
import { escapeRegex } from "../utils/regex.js";

const hospedagemSchema = new mongoose.Schema(
  {
    hospede: { type: mongoose.Schema.Types.ObjectId, ref: "Hospede", required: true, index: true },
    acomodacao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Acomodacao",
      required: true,
      index: true,
    },
    dataCheckIn: { type: Date, required: true, index: true },
    dataCheckOut: { type: Date, required: true },
    valorDiaria: { type: Number, required: true, min: 0 },
    valorTotal: { type: Number, required: true, min: 0 },
    numeroHospedes: { type: Number, default: 1, min: 1, max: 20 },
    observacoes: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: STATUS_HOSPEDAGEM, default: "Confirmada", index: true },
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
    versionKey: false,
    collection: "hospedagens",
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

hospedagemSchema.index({ acomodacao: 1, dataCheckIn: 1, dataCheckOut: 1 });

hospedagemSchema.path("dataCheckOut").validate(function validarDatas(valor) {
  if (!this.dataCheckIn || !valor) {
    return true;
  }

  return valor > this.dataCheckIn;
}, "A data de check-out deve ser posterior à data de check-in.");

hospedagemSchema.statics.listar = function listar({
  search,
  status,
  hospede,
  acomodacao,
  dataInicial,
  dataFinal,
} = {}) {
  const filtro = {};

  if (search) {
    filtro.$or = [
      { "hospede.nome": new RegExp(escapeRegex(search), "i") },
      { "acomodacao.nome": new RegExp(escapeRegex(search), "i") },
    ];
  }

  if (status) {
    filtro.status = status;
  }

  if (hospede) {
    filtro.hospede = hospede;
  }

  if (acomodacao) {
    filtro.acomodacao = acomodacao;
  }

  if (dataInicial || dataFinal) {
    if (dataInicial) {
      filtro.dataCheckOut = { $gte: new Date(`${dataInicial}T00:00:00.000Z`) };
    }

    if (dataFinal) {
      filtro.dataCheckIn = { $lte: new Date(`${dataFinal}T23:59:59.999Z`) };
    }
  }

  return this.find(filtro)
    .populate("hospede", "nome")
    .populate("acomodacao", "nome tipo")
    .sort({ dataCheckIn: -1 });
};

hospedagemSchema.statics.disponiveis = function disponiveis(acomodacaoId, inicio, fim, ignoreId) {
  const condicoes = [
    { acomodacao: acomodacaoId },
    { status: { $in: ["Confirmada", "Ativa"] } },
    { dataCheckIn: { $lt: fim } },
    { dataCheckOut: { $gt: inicio } },
  ];

  if (ignoreId) {
    condicoes.push({ _id: { $ne: ignoreId } });
  }

  return this.findOne({ $and: condicoes });
};

export const Hospedagem = mongoose.model("Hospedagem", hospedagemSchema);

export default Hospedagem;