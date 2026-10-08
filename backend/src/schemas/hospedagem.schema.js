import { z } from "zod";
import { STATUS_HOSPEDAGEM, TIPO_ACOMODACAO } from "../utils/enums.js";
import { dateRangeBaseSchema, dateString, idParam, trimmed } from "./common.schema.js";

const hospedagemBaseSchema = z.object({
  hospedeId: idParam,
  acomodacaoId: idParam,
  dataCheckIn: dateString,
  dataCheckOut: dateString,
  valorDiaria: z.coerce.number().min(0, "Valor da diária inválido.").optional(),
  numeroHospedes: z.coerce.number().int().min(1).max(20).optional(),
  observacoes: z.string().trim().max(500).optional(),
  status: z.enum(STATUS_HOSPEDAGEM).optional(),
});

export const createHospedagemSchema = hospedagemBaseSchema.omit({ status: true }).refine(
  (data) => data.dataCheckOut > data.dataCheckIn,
  {
    message: "A data de check-out deve ser posterior à data de check-in.",
    path: ["dataCheckOut"],
  },
);

export const updateHospedagemSchema = hospedagemBaseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
    path: [],
  });

export const hospedagemQuerySchema = dateRangeBaseSchema.extend({
  search: trimmed(0, 120).optional(),
  status: z.enum(STATUS_HOSPEDAGEM).optional(),
  hospedeId: idParam.optional(),
  acomodacaoId: idParam.optional(),
});

export const hospedagemStatusSchema = z.object({
  status: z.enum(STATUS_HOSPEDAGEM),
});

export const checkinCheckoutQuerySchema = z.object({
  data: dateString.optional(),
  status: z.enum(STATUS_HOSPEDAGEM).optional(),
});

export const disponibilidadeQuerySchema = z
  .object({
    dataInicial: dateString,
    dataFinal: dateString,
    tipo: z.enum(TIPO_ACOMODACAO).optional(),
  })
  .refine((data) => data.dataFinal > data.dataInicial, {
    message: "A data final deve ser posterior à data inicial.",
    path: ["dataFinal"],
  });

export const diasComMovimentoQuerySchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (YYYY-MM)."),
});

export const diasComDisponibilidadeQuerySchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (YYYY-MM)."),
  tipo: z.enum(TIPO_ACOMODACAO).optional(),
});

export default {
  createHospedagemSchema,
  updateHospedagemSchema,
  hospedagemQuerySchema,
  hospedagemStatusSchema,
  checkinCheckoutQuerySchema,
  disponibilidadeQuerySchema,
};