import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";

function formatarErros(error) {
  return error.issues.map((issue) => ({
    campo: issue.path.join(".") || "corpo",
    mensagem: issue.message,
  }));
}

export function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(new AppError("Dados inválidos.", 422, formatarErros(result.error)));
    }

    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req.body = result.data;
    }

    return next();
  };
}

export function validateObjectId(param = "id") {
  return (req, res, next) => {
    const value = req.params[param];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return next(new AppError("Identificador inválido.", 400));
    }

    req.params[param] = value;

    return next();
  };
}

export { ZodError };

export default validate;