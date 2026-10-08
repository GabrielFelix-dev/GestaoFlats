import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { useAuth } from "../../context/AuthContext";
import homeLogoImg from "../../assets/casa_gestaoflats.png";
import "./Home.css";

const emptyForm = { nome: "", email: "", senha: "" };

export default function Home({ startInLogin = false }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(startInLogin);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setNotice("");
  }

  function switchMode() {
    setIsLogin((value) => !value);
    setError("");
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const email = form.email.trim();

      if (isLogin) {
        await login({ email, password: form.senha });
        return;
      }

      await register({
        name: form.nome.trim(),
        email,
        password: form.senha,
      });

      setForm({ ...emptyForm, email });
      setIsLogin(true);
      setNotice("Conta criada com sucesso. Faça login para entrar.");
    } catch (submitError) {
      setError(submitError?.message ?? "Não foi possível acessar o sistema.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="home-page">
      <section className="home-scene">
        <div className="home-banner">
          <div className="home-banner-content">
            <div
              className="home-banner-image"
              style={{ backgroundImage: `url(${homeLogoImg})` }}
              role="img"
              aria-label="Casa do Gestão Flats"
            />
            <div className="home-banner-body">
              <h3 className="home-banner-title">
                Gestão inteligente para mais controle, organização e resultados
                reais.
              </h3>
              <span className="home-banner-divider" aria-hidden="true" />
              <p className="home-banner-text">
                O sistema completo para administrar flats com eficiência,
                praticidade e segurança.
              </p>
            </div>
          </div>

          <div className="home-form-card">
            <div className="home-form-header">
              <p className="home-eyebrow">
                {isLogin ? "Acesso" : "Comece agora"}
              </p>
              <h2>{isLogin ? "Entrar no sistema" : "Criar conta"}</h2>
              <p>
                {isLogin
                  ? "Informe suas credenciais para acessar o painel."
                  : "Preencha os dados abaixo para começar a usar o Gestão Flats."}
              </p>
            </div>

            <form className="home-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <Input
                  label="Nome completo"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Digite seu nome"
                  minLength={3}
                  required
                />
              )}

              <Input
                label="E-mail"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nome@email.com"
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
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={isLogin ? undefined : 6}
                error={Boolean(error)}
                helperText={error || undefined}
                required
              />

              <Button
                type="submit"
                size="lg"
                className="home-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Aguarde..."
                  : isLogin
                    ? "Entrar"
                    : "Criar conta"}
              </Button>
            </form>

            {notice && (
              <p className="home-form-notice" role="status">
                {notice}
              </p>
            )}

            <p className="home-form-footer">
              {isLogin ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
              <button type="button" onClick={switchMode}>
                {isLogin ? "Cadastre-se" : "Entrar"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
