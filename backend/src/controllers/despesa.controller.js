import despesaService from "../services/despesa.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const despesaController = {
  index: asyncHandler(async (req, res) => {
    const despesas = await despesaService.list(req.validatedQuery ?? {});

    res.status(200).json({ despesas, total: despesas.length });
  }),

  show: asyncHandler(async (req, res) => {
    const despesa = await despesaService.getById(req.params.id);

    res.status(200).json({ despesa });
  }),

  store: asyncHandler(async (req, res) => {
    const despesa = await despesaService.create(req.body);

    res.status(201).json({ despesa });
  }),

  update: asyncHandler(async (req, res) => {
    const despesa = await despesaService.update(req.params.id, req.body);

    res.status(200).json({ despesa });
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const despesa = await despesaService.changeStatus(
      req.params.id,
      req.body.status,
      req.body.dataPagamento,
    );

    res.status(200).json({ despesa });
  }),

  destroy: asyncHandler(async (req, res) => {
    await despesaService.remove(req.params.id);

    res.status(204).send();
  }),
};

export default despesaController;