import mongoose from "mongoose";
import {
  STATUS_ACOMODACAO,
  TIPO_ACOMODACAO,
} from "../utils/enums.js";
import { escapeRegex } from "../utils/regex.js";

const acomodacaoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true, minlength: 2, maxlength: 120, index: true },
    tipo: { type: String, enum: TIPO_ACOMODACAO, required: true, index: true },
    capacidade: { type: Number, required: true, min: 1, max: 20 },
    valorDiaria: { type: Number, required: true, min: 0 },
    endereco: {
      rua: { type: String, trim: true, maxlength: 120 },
      numero: { type: String, trim: true, maxlength: 20 },
      complemento: { type: String, trim: true, maxlength: 80 },
      bairro: { type: String, trim: true, maxlength: 80, index: true },
      cidade: { type: String, trim: true, maxlength: 80 },
      estado: { type: String, trim: true, maxlength: 2 },
      cep: { type: String, trim: true, maxlength: 9 },
    },
    andar: { type: String, trim: true },
    descricao: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: STATUS_ACOMODACAO,
      default: "Disponivel",
      index: true,
    },
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
    versionKey: false,
    collection: "acomodacoes",
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  },
);

acomodacaoSchema.statics.listar = function listar({ search, status, tipo } = {}) {
  const filtro = {};

  if (search) {
    filtro.nome = new RegExp(escapeRegex(search), "i");
  }

  if (status) {
    filtro.status = status;
  }

  if (tipo) {
    filtro.tipo = tipo;
  }

  return this.find(filtro).sort({ nome: 1 });
};

export const Acomodacao = mongoose.model("Acomodacao", acomodacaoSchema);

export default Acomodacao;