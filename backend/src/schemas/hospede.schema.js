import { z } from "zod";
import { DOCUMENTO_TIPOS, STATUS_HOSPEDE } from "../utils/enums.js";
import { emailString, nonEmptyUpdate, trimmed } from "./common.schema.js";

// A pontuação de CPF, RG e CNH é apenas de exibição no front-end. A API grava
// só dígitos no campo `cpf`, que funciona como documento genérico do hóspede.
const onlyDigits = (schema) =>
  z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(schema);

export const createHospedeSchema = z.object({
  nome: trimmed(3, 120),
  cpf: onlyDigits(z.string().trim().min(1)),
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