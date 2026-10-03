const TOKEN_STORAGE_KEY = "gestao-flats:token";
const USER_STORAGE_KEY = "gestao-flats:user";

export const UNAUTHORIZED_EVENT = "gestao-flats:unauthorized";

// Em desenvolvimento o Vite faz proxy de /api para a porta 3333, então o
// caminho relativo funciona sem configuração. Na publicação basta definir
// VITE_API_URL com a URL pública da API.
export const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "/api").replace(
  /\/+$/,
  "",
);

export class ApiError extends Error {
  constructor(message, { status = 0, detalhes = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detalhes = detalhes;
  }
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Modo privado do navegador ou storage bloqueado: a sessão continua
    // apenas em memória e o usuário precisa entrar novamente.
  }
}

export function getStoredToken() {
  return readStorage(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  const raw = readStorage(USER_STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeSession({ token, user }) {
  if (token) writeStorage(TOKEN_STORAGE_KEY, token);
  if (user) writeStorage(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Sem storage disponível não há nada a limpar.
  }
}

function buildQuery(params) {
  if (!params) return "";

  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

function extractMessage(payload, fallback) {
  if (!payload) return fallback;

  if (typeof payload.erro === "string" && payload.erro) {
    return payload.erro;
  }

  if (Array.isArray(payload.detalhes) && payload.detalhes.length) {
    const mensagens = payload.detalhes
      .map((item) => item?.mensagem)
      .filter(Boolean);

    if (mensagens.length) return mensagens.join(" ");
  }

  return fallback;
}

export async function request(
  path,
  { method = "GET", body, params, auth = true } = {},
) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = auth ? getStoredToken() : null;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${apiBaseUrl}${path}${buildQuery(params)}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique se a API está em execução.",
    );
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : null;

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSession();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(
      extractMessage(payload, "Não foi possível concluir a operação."),
      { status: response.status, detalhes: payload?.detalhes ?? null },
    );
  }

  return payload;
}

export default { request, storeSession, clearSession, getStoredToken, getStoredUser };
