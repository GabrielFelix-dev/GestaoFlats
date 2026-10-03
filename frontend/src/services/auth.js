import { clearSession, getStoredToken, request, storeSession } from "./api";

export const authService = {
  async register({ name, email, password }) {
    const { user } = await request("/auth/register", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    });

    return user;
  },

  async login({ email, password }) {
    const data = await request("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });

    storeSession(data);
    return data.user;
  },

  async me() {
    const { user } = await request("/auth/me");

    storeSession({ token: getStoredToken(), user });
    return user;
  },

  async updateProfile(data) {
    const { user } = await request("/auth/profile", { method: "PUT", body: data });

    storeSession({ token: getStoredToken(), user });
    return user;
  },

  async changePassword({ currentPassword, newPassword }) {
    const { mensagem } = await request("/auth/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
    });

    return mensagem;
  },

  logout() {
    clearSession();
  },
};

export default authService;
