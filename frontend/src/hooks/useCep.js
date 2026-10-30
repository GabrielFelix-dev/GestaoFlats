import { useCallback, useState } from "react";
import { request } from "../services/api";

/**
 * Hook para buscar endereço via CEP usando Google Maps Geocoding API.
 * A chamada é feita pelo backend (protege a API Key).
 */
export function useCep() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCep = useCallback(async (cep) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return null;

    setLoading(true);
    setError(null);

    try {
      const data = await request(`/cep/${cleanCep}`);
      return {
        rua: data.rua,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
      };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { fetchCep, loading, error };
}

export default useCep;