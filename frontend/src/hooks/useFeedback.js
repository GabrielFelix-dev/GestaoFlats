import { useCallback, useState } from "react";

/**
 * Mantém uma mensagem de sucesso ou erro para exibir em um <Alert> no topo da
 * página. `run` encapsula uma chamada da API já convertendo a exceção em
 * mensagem de erro, evitando try/catch repetido em cada formulário.
 */
export function useFeedback() {
  const [feedback, setFeedback] = useState(null);

  const notify = useCallback((type, message) => {
    setFeedback({ type, message });
  }, []);

  const clear = useCallback(() => setFeedback(null), []);

  const run = useCallback(
    async (action, { successMessage, onSuccess } = {}) => {
      try {
        const result = await action();

        if (successMessage) notify("success", successMessage);
        onSuccess?.(result);

        return result;
      } catch (error) {
        notify("error", error?.message ?? "Não foi possível concluir a operação.");
        return null;
      }
    },
    [notify],
  );

  return { feedback, notify, clear, run };
}

export default useFeedback;
