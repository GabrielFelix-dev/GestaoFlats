export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFound(message = "Recurso não encontrado.") {
  return new AppError(message, 404);
}

export function conflict(message) {
  return new AppError(message, 409);
}

export function unauthorized(message = "Credenciais inválidas.") {
  return new AppError(message, 401);
}

export default AppError;