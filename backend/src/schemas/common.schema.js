import mongoose from "mongoose";
import { z } from "zod";

export const trimmed = (min, max = 255) => z.string().trim().min(min).max(max);

export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.");

export const emailString = z
  .string()
  .trim()
  .toLowerCase()
  .email("E-mail inválido.");

export const idParam = z
  .string()
  .trim()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Identificador inválido.",
  });

export const nonEmptyUpdate = (schema, message = "Informe ao menos um campo para atualizar.") =>
  schema
    .partial()
    .refine((data) => Object.keys(data).length > 0, { message, path: [] });

export const dateRangeBaseSchema = z.object({
  dataInicial: dateString.optional(),
  dataFinal: dateString.optional(),
});

export const dateRangeSchema = dateRangeBaseSchema.superRefine((data, ctx) => {
  if (data.dataInicial && data.dataFinal && data.dataFinal < data.dataInicial) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A data final deve ser igual ou posterior à inicial.",
      path: ["dataFinal"],
    });
  }
});

export default { trimmed, dateString, emailString, idParam };