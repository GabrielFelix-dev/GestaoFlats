import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { unauthorized } from "../utils/errors.js";

export function authenticate(req, res, next) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(unauthorized("Token de acesso não informado."));
  }

  try {
    const payload = jwt.verify(token, env.jwt.secret);

    req.user = { id: payload.sub, email: payload.email, role: payload.role };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(unauthorized("Sessão expirada. Faça login novamente."));
    }

    return next(unauthorized("Token inválido."));
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(unauthorized("Acesso negado."));
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(unauthorized("Perfil sem permissão para esta operação."));
    }

    return next();
  };
}

export default { authenticate, authorize };