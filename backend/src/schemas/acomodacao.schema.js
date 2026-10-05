import { z } from "zod";
import { STATUS_ACOMODACAO, TIPO_ACOMODACAO } from "../utils/enums.js";
import { nonEmptyUpdate, trimmed } from "./common.schema.js";

const enderecoSchema = z.object({
  rua: z.string().trim().max(120).optional(),
  numero: z.string().trim().max(20).optional(),
  complemento: z.string().trim().max(80).optional(),
  bairro: z.string().trim().max(80).optional(),
  cidade: z.string().trim().max(80).optional(),
  estado: z.string().trim().max(2).optional(),
  cep: z.string().trim().max(9).optional(),
});

export const createAcomodacaoSchema = z.object({
  nome: trimmed(2, 120),
  tipo: z.enum(TIPO_ACOMODACAO),
  capacidade: z.coerce.number().int().min(1).max(20),
  valorDiaria: z.coerce.number().min(0, "Valor da diária inválido."),
  endereco: enderecoSchema.optional().nullable(),
  andar: z.string().trim().max(20).optional(),
  descricao: z.string().trim().max(500).optional(),
  status: z.enum(STATUS_ACOMODACAO).optional(),
});

export const updateAcomodacaoSchema = nonEmptyUpdate(createAcomodacaoSchema);

export const acomodacaoQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(STATUS_ACOMODACAO).optional(),
  tipo: z.enum(TIPO_ACOMODACAO).optional(),
});

export default { createAcomodacaoSchema, updateAcomodacaoSchema, acomodacaoQuerySchema };