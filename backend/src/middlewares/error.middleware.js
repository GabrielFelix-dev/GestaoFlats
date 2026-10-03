import mongoose from "mongoose";

export function notFoundHandler(req, res) {
  res.status(404).json({
    erro: "Rota não encontrada.",
    caminho: `${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(error, req, res, next) {
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(422).json({
      erro: "Dados inválidos.",
      detalhes: Object.values(error.errors).map((item) => ({
        campo: item.path,
        mensagem: item.message,
      })),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      erro: "Já existe um registro com este valor.",
      detalhes: Object.keys(error.keyValue ?? {}).map((campo) => ({
        campo,
        mensagem: "Valor duplicado.",
      })),
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ erro: "Identificador inválido." });
  }

  const statusCode = error.statusCode ?? 500;
  const payload = {
    erro: statusCode >= 500 ? "Erro interno do servidor." : error.message,
  };

  if (error.details) {
    payload.detalhes = error.details;
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== "production") {
    console.error(error);
    payload.detalhes = { stack: error.stack };
  }

  return res.status(statusCode).json(payload);
}

export default { notFoundHandler, errorHandler };