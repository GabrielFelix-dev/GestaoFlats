import { createApp } from "./app.js";
import { closeDatabase, connectDatabase } from "./config/database.js";
import env from "./config/env.js";

async function start() {
  try {
    await connectDatabase();

    const app = createApp();
    const server = app.listen(env.port);

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `\nA porta ${env.port} já está em uso.\n` +
            `Ou existe outra instância da API rodando, ou outro programa ocupa a porta.\n` +
            `Para usar outra porta, altere PORT no arquivo .env.\n`,
        );
        process.exit(1);
      }

      console.error("Erro ao iniciar o servidor:", error.message);
      process.exit(1);
    });

    server.on("listening", () => {
      console.log(`API do Gestão Flats em http://localhost:${env.port}`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} recebido, encerrando servidor...`);
      // O close so para de aceitar conexoes novas; as que ja estão abertas
      // (keep-alive) manteriam o processo vivo e a porta ocupada. Por isso as
      // conexoes em aberto sao encerradas de uma vez, e ha um limite de tempo
      // para nao depender do banco responder no meio do encerramento.
      server.closeAllConnections?.();
      const expirar = setTimeout(() => process.exit(0), 3000);
      try {
        await closeDatabase();
      } catch (error) {
        console.error("Erro ao fechar o banco:", error.message);
      }
      clearTimeout(expirar);
      server.close(() => process.exit(0));
      // Rede de seguranca: se o close nao concluir, encerra assim mesmo.
      setTimeout(() => process.exit(0), 3000).unref();
    };

    // Um segundo Ctrl+C encerra na hora, sem esperar o encerramento orderly.
    let encerrando = false;
    const aoReceberSinal = (signal) => {
      if (encerrando) {
        process.exit(0);
      }
      encerrando = true;
      shutdown(signal);
    };

    process.on("SIGINT", () => aoReceberSinal("SIGINT"));
    process.on("SIGTERM", () => aoReceberSinal("SIGTERM"));

    return server;
  } catch (error) {
    console.error("Não foi possível iniciar a API:", error.message);
    process.exit(1);
  }
}

start();

export default start;