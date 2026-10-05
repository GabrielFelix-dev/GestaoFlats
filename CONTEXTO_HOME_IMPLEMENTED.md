# Contexto da branch `home-implemented`

Este documento resume as mudanças trazidas por `home-implemented` em relação à `main`, para servir de referência durante os próximos ajustes.

## Integração no Git

- A branch remota `origin/home-implemented` foi mesclada por fast-forward na branch `ajustes-home-implemented`.
- No momento do merge, ambas apontavam para o commit `d10d4fb` (`chore: remove configuracao antiga do Vite da raiz`).
- O histórico integrado inclui a reorganização do projeto, a criação da API e a integração do front-end com dados persistidos.

## Resumo das mudanças

### Reorganização do projeto

- O front-end React/Vite foi movido da raiz para `frontend/`.
- Foi criado `backend/`, uma API REST em Express conectada ao MongoDB por Mongoose.
- O `package.json` da raiz reúne comandos para instalar e executar os dois módulos.
- A configuração antiga do Vite na raiz foi removida; a configuração ativa fica no módulo `frontend`.
- Foram adicionados `README.md` e `arquitetura.md` com instruções, endpoints e decisões arquiteturais.

### Front-end administrativo

As telas existentes foram adaptadas para consumir a API, e foram adicionadas telas e componentes para os fluxos completos de administração:

- acesso, cadastro e perfil da conta;
- dashboard com indicadores operacionais, ocupação, financeiro e próximas movimentações;
- cadastro e manutenção de hóspedes e acomodações;
- hospedagens, detalhes da reserva e disponibilidade por período;
- check-in e check-out;
- histórico de hospedagens;
- receitas, despesas e resumo financeiro.

O cliente HTTP fica em `frontend/src/services/api.js`; módulos de serviço por recurso encapsulam os endpoints. `AuthContext` mantém a sessão e os hooks compartilhados cuidam de carregamento, busca com atraso e mensagens de feedback.

### API e persistência

A API oferece endpoints para autenticação, hóspedes, acomodações, hospedagens, check-in/check-out, receitas, despesas e dashboard. A estrutura separa rotas, middlewares, controllers, services, schemas e models.

As coleções MongoDB incluem `users`, `hospedes`, `acomodacoes`, `hospedagens`, `receitas` e `despesas`. As principais regras de negócio documentadas são:

- CPF de hóspede e nome de acomodação não podem duplicar;
- uma acomodação não pode ter reservas com períodos sobrepostos;
- a capacidade da acomodação limita a quantidade de hóspedes;
- o total da hospedagem é calculado usando diária e número de diárias;
- criar uma hospedagem gera receita pendente; cancelar a hospedagem cancela essa receita;
- o check-out conclui a hospedagem e marca a receita relacionada como recebida;
- há restrições para excluir acomodações vinculadas e hospedagens em andamento.

### Autenticação e validação

- Cadastro e login são reais e usam MongoDB; senhas são armazenadas com hash bcrypt.
- A API emite tokens JWT. O front-end guarda a sessão no `localStorage`, envia o token como Bearer e revalida a sessão ao iniciar.
- Payloads são validados com Zod; há middlewares de autenticação, tratamento de erros, CORS e Helmet.
- A API limita tentativas nas rotas de cadastro e login.

### PWA e interface

O front-end inclui manifesto, ícones e service worker para instalação como PWA. O service worker é registrado no build de produção; as chamadas `/api` não entram no cache.

## Como executar

Pré-requisitos: Node.js 18 ou superior, npm e MongoDB local ou uma URI do MongoDB Atlas.

Na raiz do repositório:

```bash
npm run install:all
```

Configure o ambiente da API copiando `backend/.env.example` para `backend/.env` e ajuste, conforme o ambiente, `MONGODB_URI`, `JWT_SECRET` e `CLIENT_URL`. No PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Para executar front-end e API juntos:

```bash
npm run dev
```

Comandos separados: `npm run dev:backend` e `npm run dev:frontend`. Por padrão, a API usa a porta `3333` e o Vite encaminha `/api` para ela. Para produção, o front-end aceita `VITE_API_URL`.

## Arquivos de referência

- `README.md`: instalação, variáveis de ambiente, endpoints e limitações conhecidas.
- `arquitetura.md`: camadas, fluxo de dados e regras de negócio.
- `frontend/src/App.jsx`: composição e navegação entre módulos.
- `frontend/src/context/AuthContext.jsx`: sessão e estado de autenticação.
- `frontend/src/services/`: chamadas do front-end à API.
- `backend/src/app.js`: registro dos endpoints da API.
- `backend/src/services/`: regras de negócio no servidor.

## Observações para os próximos ajustes

- O front-end depende da API e do MongoDB; telas com dados podem falhar se esses serviços ou as variáveis de ambiente não estiverem configurados.
- A navegação do front-end é controlada por estado e persistida no `localStorage`, conforme a documentação de arquitetura.
- A seção de testes do README menciona `npm run test:api`, mas esse script não aparece atualmente em `backend/package.json`. Confirme ou corrija essa divergência antes de usar o comando como validação.
- A documentação lista limitações conhecidas, incluindo ausência de paginação e de testes unitários de front-end.
