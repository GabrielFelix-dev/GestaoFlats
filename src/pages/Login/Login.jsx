import { useState } from "react";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import Input from "../../components/Input/Input";
import "./Login.css";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.email.trim() || !form.senha.trim()) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }

    onLogin?.({ email: form.email });
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="login-brand-mark">GF</span>
          <div>
            <strong>Gestão Flats</strong>
            <span>Painel administrativo</span>
          </div>
        </div>

        <Card className="login-card">
          <div className="login-heading">
            <p className="login-eyebrow">Acesso administrativo</p>
            <h1 id="login-title">Entrar no sistema</h1>
            <p>Informe suas credenciais para acessar o painel de gestão.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@gestaoflats.com"
              autoComplete="email"
              required
            />

            <Input
              label="Senha"
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
              error={Boolean(error)}
              helperText={error || undefined}
            />

            <Button type="submit" size="lg" className="login-submit">
              Entrar
            </Button>
          </form>

          <p className="login-demo-note">
            MVP Front-end: qualquer e-mail e senha preenchidos permitem simular o acesso.
          </p>
        </Card>
      </section>
    </main>
  );
}
