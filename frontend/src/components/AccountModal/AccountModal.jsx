import { useEffect, useState } from "react";
import Button from "../Button/Button";
import Input from "../Input/Input";
import Modal from "../Modal/Modal";
import "./AccountModal.css";

const emptyForm = {
  name: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmation: "",
};

export default function AccountModal({
  isOpen,
  onClose,
  account,
  onSave,
  onChangePassword,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      name: account?.name || "",
      email: account?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmation: "",
    });
    setError("");
    setSuccess("");
  }, [account, isOpen]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setError("Nome e e-mail são obrigatórios.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      await onSave?.({ name: form.name.trim(), email: form.email.trim() });
      onClose?.();
    } catch (saveError) {
      setError(saveError?.message ?? "Não foi possível atualizar a conta.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (!form.currentPassword || !form.newPassword) {
      setError("Informe a senha atual e a nova senha.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }

    if (form.newPassword !== form.confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsSavingPassword(true);
    setError("");
    setSuccess("");

    try {
      await onChangePassword?.({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setForm((current) => ({
        ...current,
        currentPassword: "",
        newPassword: "",
        confirmation: "",
      }));
      setSuccess("Senha alterada com sucesso.");
    } catch (passwordError) {
      setError(passwordError?.message ?? "Não foi possível alterar a senha.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alterar conta"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button
            type="submit"
            form="account-form"
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </>
      }
    >
      <form
        id="account-form"
        className="modal-form account-modal-form"
        onSubmit={handleSubmit}
      >
        <Input
          label="Nome exibido"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Seu nome"
          required
        />
        <Input
          label="E-mail"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          required
        />
        {error && (
          <p className="account-modal-message account-modal-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="account-modal-message account-modal-success">{success}</p>
        )}
      </form>

      <form
        className="modal-form account-modal-form"
        onSubmit={handlePasswordSubmit}
      >
        <div className="account-modal-divider">
          <span>Atualizar senha</span>
          <small>Deixe em branco para manter a senha atual.</small>
        </div>
        <Input
          label="Senha atual"
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          placeholder="Digite a senha atual"
          autoComplete="current-password"
        />
        <Input
          label="Nova senha"
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          placeholder="Digite uma nova senha"
          autoComplete="new-password"
        />
        <Input
          label="Confirmar nova senha"
          type="password"
          name="confirmation"
          value={form.confirmation}
          onChange={handleChange}
          placeholder="Repita a nova senha"
          autoComplete="new-password"
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={isSavingPassword}
        >
          {isSavingPassword ? "Atualizando..." : "Alterar senha"}
        </Button>
      </form>
    </Modal>
  );
}
