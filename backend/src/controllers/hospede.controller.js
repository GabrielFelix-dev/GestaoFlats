import hospedeService from "../services/hospede.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const hospedeController = {
  index: asyncHandler(async (req, res) => {
    const hospedes = await hospedeService.list(req.validatedQuery ?? {});

    res.status(200).json({ hospedes, total: hospedes.length });
  }),

  show: asyncHandler(async (req, res) => {
    const hospede = await hospedeService.getById(req.params.id);

    res.status(200).json({ hospede });
  }),

  store: asyncHandler(async (req, res) => {
    const hospede = await hospedeService.create(req.body);

    res.status(201).json({ hospede });
  }),

  update: asyncHandler(async (req, res) => {
    const hospede = await hospedeService.update(req.params.id, req.body);

    res.status(200).json({ hospede });
  }),

  destroy: asyncHandler(async (req, res) => {
    await hospedeService.remove(req.params.id);

    res.status(204).send();
  }),
};

export default hospedeController;