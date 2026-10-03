import { useEffect, useState } from "react";

/**
 * Atrasa a propagação do valor para evitar uma requisição por tecla digitada
 * nos campos de pesquisa.
 */
export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebouncedValue;
