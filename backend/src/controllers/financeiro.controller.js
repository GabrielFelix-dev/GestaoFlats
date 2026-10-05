import financeiroService from "../services/financeiro.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const financeiroController = {
    rentabilidade: asyncHandler(async (req, res) => {
        const dados = await financeiroService.rentabilidade(req.validatedQuery ?? {});

        res.status(200).json(dados);
    }),
};

export default financeiroController;