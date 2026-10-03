import { z } from "zod";
import { DOCUMENTO_TIPOS, STATUS_HOSPEDE } from "../utils/enums.js";
import { emailString, nonEmptyUpdate, trimmed } from "./common.schema.js";

// A pontuação de CPF e telefone é apenas de exibição no front-end. A API grava
// só dígitos para que a busca e o índice único não dependam de como o valor foi
// digitado.
const onlyDigits = (schema) =>
  z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(schema);

export const createHospedeSchema = z.object({
  nome: trimmed(3, 120),
  cpf: onlyDigits(z.string().trim().length(11, "CPF deve ter 11 dígitos.")),
  telefone: onlyDigits(
    z.string().trim().min(8, "Telefone deve ter entre 8 e 11 dígitos.").max(11),
  ).optional(),
  email: emailString.optional(),
  documentoTipo: z.enum(DOCUMENTO_TIPOS).optional(),
  observacoes: z.string().trim().max(500).optional(),
  status: z.enum(STATUS_HOSPEDE).optional(),
});

export const updateHospedeSchema = nonEmptyUpdate(createHospedeSchema);

export const hospedeQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(STATUS_HOSPEDE).optional(),
});

export default { createHospedeSchema, updateHospedeSchema, hospedeQuerySchema };