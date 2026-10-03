import checkinCheckoutService from "../services/checkinCheckout.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const checkinCheckoutController = {
  index: asyncHandler(async (req, res) => {
    const resultado = await checkinCheckoutService.list(req.validatedQuery ?? {});

    res.status(200).json(resultado);
  }),

  checkIn: asyncHandler(async (req, res) => {
    const hospedagem = await checkinCheckoutService.checkIn(req.params.id);

    res.status(200).json({ mensagem: "Check-in realizado com sucesso.", hospedagem });
  }),

  checkOut: asyncHandler(async (req, res) => {
    const hospedagem = await checkinCheckoutService.checkOut(req.params.id);

    res.status(200).json({ mensagem: "Check-out realizado com sucesso.", hospedagem });
  }),

  disponibilidade: asyncHandler(async (req, res) => {
    const resultado = await checkinCheckoutService.calcularDisponibilidade(
      req.validatedQuery ?? {},
    );

    res.status(200).json(resultado);
  }),
};

export default checkinCheckoutController;