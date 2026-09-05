import { useState } from "react";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import homeLogoImg from "../../assets/predios.png";
import "./Home.css";

export default function Home({ startInLogin = false }) {
  const [isLogin, setIsLogin] = useState(startInLogin);
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (isLogin) {
      window.dispatchEvent(new Event("gestao-flats:login"));
    } else {
      setIsLogin(true);
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
              aria-label="Prédios"
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
                required
              />

              <Button type="submit" size="lg" className="home-submit">
                {isLogin ? "Entrar" : "Criar conta"}
              </Button>
            </form>

            <p className="home-form-footer">
              {isLogin ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin((value) => !value)}
              >
                {isLogin ? "Cadastre-se" : "Entrar"}
              </button>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
