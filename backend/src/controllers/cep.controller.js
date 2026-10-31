import asyncHandler from "../utils/asyncHandler.js";

/**
 * Busca endereço por CEP usando ViaCEP (gratuita, sem autenticação).
 * Endpoint: GET /api/cep/:cep
 */
export const cepController = asyncHandler(async (req, res) => {
  const { cep } = req.params;
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    return res.status(400).json({ erro: "CEP deve ter 8 dígitos." });
  }

  try {
    const response = await fetch(`https://viacep.com.br/api/cep/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) {
      return res.status(404).json({ erro: "CEP não encontrado." });
    }

    res.json({
      cep: data.cep,
      rua: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    });
  } catch (error) {
    console.error("Erro ViaCEP:", error);
    res.status(500).json({ erro: "Erro ao buscar CEP." });
  }
});

export default cepController;