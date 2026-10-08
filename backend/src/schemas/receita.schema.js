import { z } from "zod";
import { STATUS_RECEITA } from "../utils/enums.js";
import { dateRangeBaseSchema, dateString, idParam, nonEmptyUpdate, trimmed } from "./common.schema.js";

export const createReceitaSchema = z.object({
  descricao: trimmed(3, 200),
  valor: z.coerce.number().min(0, "Valor da receita inválido."),
  data: dateString,
  origem: z.string().trim().max(80).optional(),
  categoria: z.string().trim().max(80).optional(),
  hospedagemId: idParam.optional(),
  status: z.enum(STATUS_RECEITA).optional(),
});

export const updateReceitaSchema = nonEmptyUpdate(createReceitaSchema);

export const receitaQuerySchema = dateRangeBaseSchema.extend({
  search: z.string().trim().optional(),
  status: z.enum(STATUS_RECEITA).optional(),
});

export default { createReceitaSchema, updateReceitaSchema, receitaQuerySchema };