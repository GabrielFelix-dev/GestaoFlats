import { z } from "zod";
import { STATUS_DESPESA } from "../utils/enums.js";
import { dateRangeBaseSchema, dateString, idParam, nonEmptyUpdate, trimmed } from "./common.schema.js";

export const createDespesaSchema = z.object({
  descricao: trimmed(3, 200),
  categoria: trimmed(3, 80),
  valor: z.coerce.number().min(0, "Valor da despesa inválido."),
  acomodacaoId: idParam.nullable().optional(),
  dataVencimento: dateString,
  dataPagamento: dateString.optional(),
  status: z.enum(STATUS_DESPESA).optional(),
});

export const updateDespesaSchema = nonEmptyUpdate(createDespesaSchema);

export const despesaQuerySchema = dateRangeBaseSchema.extend({
  search: z.string().trim().optional(),
  status: z.enum(STATUS_DESPESA).optional(),
  categoria: z.string().trim().max(80).optional(),
  acomodacaoId: idParam.optional(),
});

export const despesaStatusSchema = z.object({
  status: z.enum(STATUS_DESPESA),
  dataPagamento: dateString.optional(),
});

export default {
  createDespesaSchema,
  updateDespesaSchema,
  despesaQuerySchema,
  despesaStatusSchema,
};