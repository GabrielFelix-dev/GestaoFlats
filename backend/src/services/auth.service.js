import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AppError, conflict, unauthorized } from "../utils/errors.js";
import { signToken, verifyToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

function buildSession(user) {
  const { _id, name, email, role } = user;

  return {
    token: signToken({ sub: _id.toString(), email, role }),
    user: { id: _id.toString(), name, email, role },
  };
}

export const authService = {
  async register({ name, email, password }) {
    const existente = await User.findOne({ email });

    if (existente) {
      throw conflict("Já existe uma conta com este e-mail.");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: passwordHash });

    return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw unauthorized("E-mail ou senha inválidos.");
    }

    const valid = await user.comparePassword(password);

    if (!valid) {
      throw unauthorized("E-mail ou senha inválidos.");
    }

    return buildSession(user);
  },

  async me(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
  },

  async updateProfile(userId, data) {
    if (data.email) {
      const existente = await User.findOne({ email: data.email, _id: { $ne: userId } });

      if (existente) {
        throw conflict("Já existe uma conta com este e-mail.");
      }
    }

    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    const valid = await user.comparePassword(currentPassword);

    if (!valid) {
      throw new AppError("Senha atual incorreta.", 401);
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
  },

  verifyToken,
};

export default authService;