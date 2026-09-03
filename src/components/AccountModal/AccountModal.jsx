import { useEffect, useState } from "react";
import Button from "../Button/Button";
import Input from "../Input/Input";
import Modal from "../Modal/Modal";
import "./AccountModal.css";

export default function AccountModal({ isOpen, onClose, account, onSave }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmation: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      name: account?.name || "",
      email: account?.email || "",
      password: "",
      confirmation: "",
    });
    setError("");
  }, [account, isOpen]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setError("Nome e e-mail são obrigatórios.");
      return;
    }

    if (form.password && form.password !== form.confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    onSave({ name: form.name.trim(), email: form.email.trim() });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alterar conta"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="account-form">
            Salvar alterações
          </Button>
        </>
      }
    >
      <form id="account-form" className="modal-form" onSubmit={handleSubmit}>
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
        <div className="account-modal-divider">
          <span>Atualizar senha</span>
          <small>Deixe em branco para manter a senha atual.</small>
        </div>
        <Input
          label="Nova senha"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Digite uma nova senha"
          autoComplete="new-password"
          error={Boolean(error)}
          helperText={error || undefined}
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
      </form>
    </Modal>
  );
}
