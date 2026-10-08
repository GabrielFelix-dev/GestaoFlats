# Gestão Flats

Sistema web para administração de flats, hospedagens e operações financeiras. O projeto é dividido em dois módulos independentes: uma aplicação front-end em React e uma API REST com persistência em banco de dados.

![Identidade visual do Gestão Flats](frontend/src/assets/gestãoflats-nome.png)

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Testes](#testes)
- [API](#api)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Arquitetura do front-end](#arquitetura-do-front-end)
- [PWA](#pwa)
- [Arquitetura do backend](#arquitetura-do-backend)
- [Limitações conhecidas](#limitações-conhecidas)
- [Próximos passos](#próximos-passos)
- [Contribuidores](#contribuidores)

## Sobre o projeto

O Gestão Flats é um painel administrativo para apoiar a operação de imóveis destinados a hospedagem. A aplicação reúne, em um único ambiente, informações sobre hóspedes, acomodações, reservas, disponibilidade, check-in/check-out, histórico e finanças.

O sistema foi pensado para reduzir a fragmentação das tarefas operacionais e oferecer uma visão rápida da rotina do negócio por meio de:

- dashboard com indicadores;
- cadastros e filtros;
- check-in e check-out;
- controle visual de status;
- menu de conta e perfil administrativo;
- módulo financeiro com receitas, despesas e resumo.

## Estrutura do repositório

```text
GestaoFlats/
│
├── frontend/                  # Aplicação React (Vite)
│   ├── src/
│   │   ├── assets/
│   │   ├── components/        # Button, Card, Input, Modal, Table, Layout...
│   │   ├── context/           # AuthContext: sessão e usuário autenticado
│   │   ├── hooks/             # useApiResource, useFeedback, useDebouncedValue
│   │   ├── pages/             # Home e páginas administrativas
│   │   ├── services/          # Cliente HTTP da API, um módulo por recurso
│   │   ├── utils/             # Formatação de valores, datas e rótulos
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/
│   │   ├── manifest.webmanifest
│   │   ├── sw.js
│   │   ├── pwa-192.png
│   │   ├── pwa-512.png
│   │   ├── pwa-maskable-512.png
│   │   └── apple-touch-icon.png
│   ├── scripts/
│   │   └── gerar-icones-pwa.mjs # Gera os ícones da PWA a partir da arte
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Inclui proxy de /api para o back-end
│
├── backend/                   # API REST (Express)
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/
│   │   └── smoke-test.js       # Teste de fumaça da API
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── arquitetura.md
├── package.json                # Comandos para rodar os dois módulos
└── README.md
```

## Tecnologias

### Front-end

- [React](https://react.dev/) `18.3.1`;
- [React DOM](https://react.dev/reference/react-dom) `18.3.1`;
- [Vite](https://vite.dev/) `5.4.10`;
- `@vitejs/plugin-react`;
- JavaScript com módulos ES;
- CSS próprio, sem biblioteca visual externa.

### Back-end

- [Express](https://expressjs.com/pt-br/4x/) `4.x`;
- [MongoDB](https://www.mongodb.com/) com [Mongoose](https://mongoosejs.com/) `9.x`;
- [Zod](https://zod.dev/) para validação de payloads;
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) para tokens JWT;
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) para hash de senhas;
- `helmet`, `cors`, `morgan` e `express-rate-limit` para segurança e observabilidade.

## Como executar

### Pré-requisitos

- Node.js 18 ou superior;
- npm instalado;
- MongoDB em execução (local ou uma URI do MongoDB Atlas).

### Instalação

```bash
git clone git@github.com:GabrielFelix-dev/GestaoFlats.git
cd GestaoFlats
npm run install:all
```

O comando acima instala as dependências do `frontend` e do `backend`.

### Configuração do back-end

```bash
cp backend/.env.example backend/.env
```

Em Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

Crie esse arquivo localmente e ajuste `MONGODB_URI`, `JWT_SECRET` e `CLIENT_URL`. O arquivo de ambiente não é incluído no repositório.

### Ambiente de desenvolvimento

Para subir a API e o front-end ao mesmo tempo:

```bash
npm run dev
```

Comandos separados também estão disponíveis:

```bash
npm run dev:backend    # API em http://localhost:3333
npm run dev:frontend   # Vite em http://localhost:5173
```

O Vite está configurado com um proxy para `/api`, portanto o front-end consome a API local sem configurar CORS manualmente no navegador.

### Primeiro acesso

O banco começa vazio. Na tela inicial, escolha **Cadastre-se** e crie a conta administrativa: o primeiro usuário cadastrado recebe o perfil `admin` e é o responsável pela operação. A partir daí, entre com e-mail e senha.

### Build de produção do front-end

```bash
npm run build
```

## Testes

Os testes unitários do backend usam o runner nativo do Node.js e não precisam de MongoDB:

```bash
npm test --prefix backend
```

Ainda não há teste de integração HTTP que valide a API completa contra um MongoDB. Os fluxos de cadastro/login, hospedagens e persistência precisam ser exercitados em ambiente configurado antes de serem considerados validados.

## API

Todas as rotas, exceto autenticação e saúde, exigem o header `Authorization: Bearer <token>`.

| Método | Rota                                    | Descrição                        |
| ------ | --------------------------------------- | -------------------------------- |
| GET    | `/health`                               | Verificação de disponibilidade   |
| POST   | `/api/auth/register`                    | Criação de conta                 |
| POST   | `/api/auth/login`                       | Autenticação                     |
| GET    | `/api/auth/me`                          | Dados do usuário autenticado     |
| PUT    | `/api/auth/profile`                     | Atualização de nome e e-mail     |
| PUT    | `/api/auth/password`                    | Troca de senha                   |
| GET    | `/api/hospedes`                         | Listagem com filtros             |
| POST   | `/api/hospedes`                         | Cadastro de hóspede              |
| GET    | `/api/hospedes/:id`                     | Detalhe de hóspede               |
| PUT    | `/api/hospedes/:id`                     | Edição de hóspede                |
| DELETE | `/api/hospedes/:id`                     | Exclusão de hóspede              |
| GET    | `/api/acomodacoes`                      | Listagem com filtros             |
| POST   | `/api/acomodacoes`                      | Cadastro de acomodação           |
| PUT    | `/api/acomodacoes/:id`                  | Edição de acomodação             |
| PATCH  | `/api/acomodacoes/:id/status`           | Alteração de status              |
| DELETE | `/api/acomodacoes/:id`                  | Exclusão de acomodação           |
| GET    | `/api/hospedagens`                      | Reservas com filtros             |
| POST   | `/api/hospedagens`                      | Criação de reserva               |
| PUT    | `/api/hospedagens/:id`                  | Edição de reserva                |
| PATCH  | `/api/hospedagens/:id/status`           | Cancelamento ou conclusão        |
| DELETE | `/api/hospedagens/:id`                  | Exclusão de reserva              |
| GET    | `/api/checkin-checkout`                 | Entradas e saídas de uma data    |
| POST   | `/api/checkin-checkout/:id/checkin`     | Registrar check-in               |
| POST   | `/api/checkin-checkout/:id/checkout`    | Registrar check-out              |
| GET    | `/api/checkin-checkout/disponibilidade` | Disponibilidade por período      |
| GET    | `/api/receitas`                         | Listagem de receitas             |
| POST   | `/api/receitas`                         | Cadastro de receita              |
| PUT    | `/api/receitas/:id`                     | Edição de receita                |
| PATCH  | `/api/receitas/:id/status`              | Alteração de status              |
| DELETE | `/api/receitas/:id`                     | Exclusão de receita              |
| GET    | `/api/despesas`                         | Listagem de despesas             |
| POST   | `/api/despesas`                         | Cadastro de despesa              |
| PUT    | `/api/despesas/:id`                     | Edição de despesa                |
| PATCH  | `/api/despesas/:id/status`              | Baixa de pagamento               |
| DELETE | `/api/despesas/:id`                     | Exclusão de despesa              |
| GET    | `/api/dashboard/resumo`                 | Indicadores consolidados         |
| GET    | `/api/dashboard/historico`              | Histórico de hospedagens         |
| GET    | `/api/financeiro/rentabilidade`         | Desempenho financeiro por imóvel |

### Exemplo de uso

```bash
# 1. Criar conta
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Souza","email":"admin@gestaoflats.com","password":"senha123"}'

# 2. Autenticar
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gestaoflats.com","password":"senha123"}'

# 3. Usar o token retornado
curl http://localhost:3333/api/dashboard/resumo \
  -H "Authorization: Bearer <token>"
```

### Convenções de resposta

Sucesso:

```json
{ "hospede": { "id": "6abfb07fe7e7458c37dfb88b", "nome": "Mariana Alves" } }
```

Listagem:

```json
{ "hospedes": [], "total": 0 }
```

Erro:

```json
{
  "erro": "Dados inválidos.",
  "detalhes": [{ "campo": "cpf", "mensagem": "CPF deve ter 11 dígitos." }]
}
```

O `id` é o ObjectId do MongoDB em forma de string; o campo `_id` nunca é devolvido.

Códigos utilizados: `200`, `201`, `204`, `401` (não autenticado), `404` (não encontrado), `409` (conflito de regra de negócio), `422` (validação de payload) e `500` (erro interno).

## Variáveis de ambiente

### Back-end (`backend/.env`)

| Variável         | Descrição                        | Padrão                                  |
| ---------------- | -------------------------------- | --------------------------------------- |
| `PORT`           | Porta da API                     | `3333`                                  |
| `NODE_ENV`       | Ambiente de execução             | `development`                           |
| `MONGODB_URI`    | String de conexão com o MongoDB  | `mongodb://127.0.0.1:27017/gestaoflats` |
| `JWT_SECRET`     | Segredo de assinatura dos tokens | valor de desenvolvimento                |
| `JWT_EXPIRES_IN` | Validade do token                | `1d`                                    |
| `CLIENT_URL`     | Origem permitida no CORS         | `http://localhost:5173`                 |

### Front-end (`frontend/.env`)

| Variável       | Descrição                                                      | Padrão |
| -------------- | -------------------------------------------------------------- | ------ |
| `VITE_API_URL` | URL base da API. Em desenvolvimento usa o proxy `/api` do Vite | `/api` |

O arquivo `.env` do front-end é opcional em desenvolvimento. Ele só é necessário quando a API roda em outro domínio, como na publicação:

```bash
VITE_API_URL=https://gestaoflats-api.vercel.app/api
```

## Arquitetura do front-end

O front-end não mantém dados próprios: toda a informação vem da API REST. O fluxo é sempre o mesmo.

```text
página → hook (useApiResource) → serviço (services/*) → request (services/api.js) → API
```

### Camadas

| Pasta                     | Responsabilidade                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `services/api.js`         | Cliente HTTP: URL base, token JWT, serialização, `ApiError` e expiração de sessão      |
| `services/*.js`           | Um módulo por recurso, com os endpoints da API e o formato da resposta                 |
| `context/AuthContext`     | Sessão: usuário, login, cadastro, logout, atualização de perfil e revalidação do token |
| `hooks/useApiResource`    | Carregamento, estado de erro e recarga de uma lista após create/update/delete          |
| `hooks/useFeedback`       | Mensagens de sucesso e erro exibidas em `<Alert>`                                      |
| `hooks/useDebouncedValue` | Atrasa a busca enquanto o usuário digita, evitando uma requisição por tecla            |
| `utils/format.js`         | Moeda, datas e cálculo de diárias                                                      |
| `utils/mask.js`           | Máscaras de CPF e telefone aplicadas enquanto o usuário digita                         |
| `utils/labels.js`         | Rótulos acentuados dos enums que a API grava sem acento                                |

### Sessão e token

- O cadastro cria a conta e devolve o usuário ao formulário de login: a sessão só começa no `POST /api/auth/login`.
- O login guarda o token em `localStorage` e o usuário em JSON.
- Toda requisição autenticada envia `Authorization: Bearer <token>`.
- Uma resposta `401` limpa a sessão e dispara o evento `gestao-flats:unauthorized`, que devolve o usuário à tela de acesso.
- Ao abrir a aplicação com um token guardado, o `AuthContext` chama `GET /api/auth/me` para confirmar que a sessão ainda é válida.

### Datas

Check-in, check-out, vencimento e lançamento são gravados como meia-noite UTC (`YYYY-MM-DDT00:00:00.000Z`). Exibi-los no fuso local do navegador voltaria um dia em fusos negativos como o do Brasil, então `formatDate` formata explicitamente em UTC. Já `formatDateTime`, usada em datas reais de criação, usa o fuso local.

### CPF e telefone

`utils/mask.js` aplica a pontuação enquanto o usuário digita (`000.000.000-00` e `(00) 00000-0000`) e reformata o que vem do banco. O valor gravado é sempre só dígitos, no front-end e também na API (`schemas/hospede.schema.js` remove a pontuação antes de validar), para que a busca por CPF e o índice único do campo não dependam de como o número foi digitado. Por isso a busca de hóspedes remove os separadores quando o termo tem apenas dígitos e pontuação.

## PWA

A aplicação front-end é instalável e funciona como aplicativo de janela própria (sem barra de navegador).

### Arquivos envolvidos

| Arquivo                                | Função                                                       |
| -------------------------------------- | ------------------------------------------------------------ |
| `frontend/public/manifest.webmanifest` | Nome, cores, ícones, modo de exibição e atalhos.             |
| `frontend/public/sw.js`                | Service worker: cache do app shell e dos arquivos estáticos. |
| `frontend/public/pwa-192.png`          | Ícone 192x192 (qualquer propósito).                          |
| `frontend/public/pwa-512.png`          | Ícone 512x512 (qualquer propósito).                          |
| `frontend/public/pwa-maskable-512.png` | Ícone 512x512 adaptativo (máscara do sistema).               |
| `frontend/public/apple-touch-icon.png` | Ícone para iOS/iPadOS.                                       |
| `frontend/src/assets/pwa-icon.png`     | Arte original usada para gerar os ícones.                    |
| `frontend/src/main.jsx`                | Registra o service worker apenas no build de produção.       |

### Gerar os ícones

Os ícones não são editados à mão: eles são gerados a partir de `src/assets/pwa-icon.png`.

```bash
npm run gerar-icones --prefix frontend
```

Para trocar a arte, substitua `src/assets/pwa-icon.png` e rode o comando de novo.

Dois cuidados que o script já resolve:

- **Nada de fundo branco.** A arte original tem os cantos transparentes, e é justamente isso que faz o Android, o Chrome e sobretudo o iOS comporem o PNG sobre a cor branca da tela. Todos os ícones saem opacos, com o preenchimento na cor média da própria arte — o fundo some na emenda em vez de virar uma moldura.
- **A arte ocupa o máximo possível.** O ícone do iOS é o único com recuo (10%), porque o sistema aplica o próprio arredondamento e recortaria as bordas da ilustração; os demais são Sangria total.

Depois de gerar os ícones, suba a versão de `CACHE_NAME` em `frontend/public/sw.js` para que os usuários com o app instalado recebam os arquivos novos.

### Testar localmente

O service worker só é registrado em produção, porque no servidor de desenvolvimento do Vite ele conflita com o hot reload. Para validar:

```bash
npm run build
npm run preview
```

Acesse `http://localhost:4173`, abra o DevTools e confirme a aba **Application**: `Manifest` com os três ícones, `Service Workers` registrado e `Cache Storage` com `gestaoflats-v3`.

No celular, use a mesma rede local e abra `http://192.168.1.x:4173` (o endereço aparece no terminal do preview). O botão de instalar aparece na barra de endereços do Chrome, ou pelo menu do navegador.

### Estratégia de cache

- **App shell** (`/`, `index.html`, manifest, ícones): pré-cacheado na instalação.
- **Navegação** (`/`): rede primeiro, com fallback para o `index.html` em cache — sem internet, o app abre.
- **`/assets/`**: cache primeiro. Os arquivos têm hash no nome, então nunca mudam de conteúdo.
- **`/api`**: **nunca** é cacheado. Dados desatualizados em um painel administrativo são piores do que uma falha de rede visível.

### Atalhos do manifesto

Os atalhos do manifesto abrem páginas específicas via `?pagina=dashboard`, `?pagina=hospedes` e `?pagina=financeiro`. O `App.jsx` lê esse parâmetro ao iniciar e, se o valor for válido, abre a página correspondente em vez da última visitada.

## Arquitetura do backend

A API segue uma separação em camadas:

```text
routes → middlewares → controllers → services → models → MongoDB
```

- **routes**: define os caminhos, encadeia os middlewares e os controllers.
- **middlewares**: autenticação por JWT, validação com Zod e tratamento de erros.
- **controllers**: traduzem requisição e resposta HTTP.
- **services**: regras de negócio, validações de domínio e cálculo de valores.
- **models**: acesso ao banco e mapeamento entre documentos e objetos da API.

### Regras de negócio implementadas

- CPF e nome de acomodação não podem ser duplicados.
- Uma acomodação não pode receber duas reservas que se sobreponham no tempo.
- O número de hóspedes é validado contra a capacidade da acomodação.
- O valor total da hospedagem é calculado a partir do número de diárias e da diária.
- A criação de uma hospedagem gera automaticamente uma receita vinculada.
- O cancelamento de uma hospedagem cancela a receita correspondente.
- O check-out marca a receita como recebida.
- Acomodações com hospedagens vinculadas não podem ser excluídas.
- Hospedagens em andamento não podem ser excluídas.

### Banco de dados

O banco é o MongoDB, indicado pela string `MONGODB_URI`. As coleções e os índices são criados automaticamente pelo Mongoose na primeira execução.

Os nomes das coleções são definidos explicitamente em cada model (opção `collection`), para não depender da regra de pluralização do Mongoose:

| Model        | Coleção       | Conteúdo                               |
| ------------ | ------------- | -------------------------------------- |
| `User`       | `users`       | contas administrativas                 |
| `Hospede`    | `hospedes`    | hóspedes cadastrados                   |
| `Acomodacao` | `acomodacoes` | flats, quartos, studios e Apartamentos |
| `Hospedagem` | `hospedagens` | reservas e ciclo de hospedagem         |
| `Receita`    | `receitas`    | entradas financeiras                   |
| `Despesa`    | `despesas`    | saídas financeiras                     |

Conexões usuais:

```text
# MongoDB local
mongodb://127.0.0.1:27017/gestaoflats

# MongoDB Atlas
mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/gestaoflats?retryWrites=true&w=majority
```

Para começar do zero, apague o banco `gestaoflats` pelo MongoDB Compass ou pelo shell do MongoDB.

## Limitações conhecidas

- Não há paginação, ordenação ou filtros avançados no servidor.
- Não há recuperação de senha por e-mail.
- A PWA só registra o service worker em HTTPS ou em `localhost`; accessada por IP local em HTTP o navegador não permite a instalação.
- Os arquivos de imagem do front-end somam cerca de 12 MB e ainda não foram otimizados.
- Não há testes unitários no front-end, nem lint configurado.
- Não há pipeline de integração contínua.

## Próximos passos

### Publicação

- Definir entre GitHub Pages e Vercel e aplicar a configuração de `base`, manifesto, service worker e `VITE_API_URL` correspondente.
- Publicar a API com `MONGODB_URI`, `JWT_SECRET` e `CLIENT_URL` do ambiente.

### Produto e operação

- Adicionar paginação, ordenação e filtros avançados no servidor.
- Relatórios de occupancy e receita por período.
- Recuperação de senha por e-mail.

### Qualidade e manutenção

- Adicionar testes unitários dos hooks e das páginas.
- Configurar ESLint e formatação automática.
- Otimizar as imagens de fundo e o logotipo.
- Criar pipeline de integração contínua.

## Contribuidores

### Grupo Gestão Flats

| Nome                     | Perfil                                                   |
| ------------------------ | -------------------------------------------------------- |
| Gabriel Felix            | [@GabrielFelix-dev](https://github.com/GabrielFelix-dev) |
| Samires do Carmo         | [@eusam04](https://github.com/eusam04)                   |
| Marina Guimarães         | [@marinagv95](https://github.com/marinagv95)             |
| José Luiz Nogueira Silva | [@jluizns](https://github.com/jluizns)                   |
| Ana Karolyne             | [@anakarolyne-oa](https://github.com/anakarolyne-oa)     |
| Raphael Vicente          | [@RaphaelVicente08](https://github.com/RaphaelVicente08) |
