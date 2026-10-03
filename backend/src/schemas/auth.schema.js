import { z } from "zod";
import { emailString, trimmed } from "./common.schema.js";

export const registerSchema = z.object({
  name: trimmed(3, 120),
  email: emailString,
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres.").max(72),
});

export const loginSchema = z.object({
  email: emailString,
  password: z.string().min(1, "Informe a senha."),
});

export const updateProfileSchema = z
  .object({
    name: trimmed(3, 120).optional(),
    email: emailString.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo para atualizar.",
    path: [],
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual."),
  newPassword: z.string().min(6, "A nova senha deve ter ao menos 6 caracteres.").max(72),
});

export default { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema };