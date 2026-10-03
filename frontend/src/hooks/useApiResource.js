import { useCallback, useEffect, useRef, useState } from "react";

const initialState = { data: null, isLoading: true, error: "" };

/**
 * Carrega dados de uma serviço da API e expõe reload para atualizar a tela
 * depois de um create/update/delete. `deps` funciona como no useEffect: cada
 * mudança dispara uma nova busca.
 */
export function useApiResource(load, deps = []) {
  const [state, setState] = useState(initialState);
  const loadRef = useRef(load);
  const isMountedRef = useRef(true);

  loadRef.current = load;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true }));

    try {
      const data = await loadRef.current();

      if (isMountedRef.current) {
        setState({ data, isLoading: false, error: "" });
      }

      return data;
    } catch (error) {
      if (isMountedRef.current) {
        setState({
          data: null,
          isLoading: false,
          error: error?.message ?? "Não foi possível carregar os dados.",
        });
      }

      return null;
    }
  }, []);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reload]);

  const setData = useCallback((updater) => {
    setState((current) => ({
      ...current,
      data: typeof updater === "function" ? updater(current.data) : updater,
    }));
  }, []);

  return { ...state, reload, setData };
}

export default useApiResource;
