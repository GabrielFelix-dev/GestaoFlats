import asyncHandler from "../utils/asyncHandler.js";

export const cepController = asyncHandler(async (req, res) => {
  const { cep } = req.params;
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    return res.status(400).json({ erro: "CEP deve ter 8 dígitos." });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ erro: "API Key do Google Maps não configurada." });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cleanCep},Brasil&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return res.status(404).json({ erro: "CEP não encontrado." });
    }

    const addressComponents = data.results[0].address_components;
    const getComponent = (types) => {
      const comp = addressComponents.find((c) => types.some((t) => c.types.includes(t)));
      return comp ? comp.long_name : "";
    };

    res.json({
      cep: cleanCep,
      rua: getComponent(["street_address", "route"]),
      bairro: getComponent(["sublocality", "neighborhood"]),
      cidade: getComponent(["locality", "postal_town"]),
      estado: getComponent(["administrative_area_level_1"]),
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar CEP." });
  }
});

export default cepController;