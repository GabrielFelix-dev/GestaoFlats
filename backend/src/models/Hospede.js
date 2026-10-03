import mongoose from "mongoose";
import { DOCUMENTO_TIPOS, STATUS_HOSPEDE } from "../utils/enums.js";
import { escapeRegex } from "../utils/regex.js";

const hospedeSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true, minlength: 3, maxlength: 120, index: true },
    cpf: { type: String, required: true, unique: true, trim: true, index: true },
    telefone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    documentoTipo: { type: String, enum: DOCUMENTO_TIPOS, default: "CPF" },
    observacoes: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: STATUS_HOSPEDE, default: "Ativo", index: true },
  },
  {
    timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" },
    versionKey: false,
    collection: "hospedes",
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  },
);

hospedeSchema.index({ nome: "text", email: "text" });

hospedeSchema.statics.listar = function listar({ search, status } = {}) {
  const filtro = {};

  if (search) {
    const termo = new RegExp(escapeRegex(search), "i");
    filtro.$or = [{ nome: termo }, { cpf: termo }, { email: termo }];
  }

  if (status) {
    filtro.status = status;
  }

  return this.find(filtro).sort({ nome: 1 });
};

export const Hospede = mongoose.model("Hospede", hospedeSchema);

export default Hospede;