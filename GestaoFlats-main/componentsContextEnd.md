# Componentização final do projeto GestaoFlats

## Visão geral

Este arquivo registra o que foi implementado no projeto em relação à componentização, conforme o escopo front-end do sistema administrativo de hospedagens.

O objetivo foi criar uma base de componentes reutilizáveis, genéricos e organizados em src/components, seguindo os princípios do briefing do projeto:

- reutilização
- responsabilidade única
- baixa acoplamento
- composição
- visual profissional
- paleta oficial
- manutenção simples

---

## Estrutura de componentes criada

A estrutura atual do projeto inclui os seguintes componentes reutilizáveis:

src/components/
├── Button/
│ ├── Button.jsx
│ └── Button.css
├── Input/
│ ├── Input.jsx
│ └── Input.css
├── Select/
│ ├── Select.jsx
│ └── Select.css
├── Card/
│ ├── Card.jsx
│ └── Card.css
├── Table/
│ ├── Table.jsx
│ └── Table.css
├── Modal/
│ ├── Modal.jsx
│ └── Modal.css
├── Header/
│ ├── Header.jsx
│ └── Header.css
├── Sidebar/
│ ├── Sidebar.jsx
│ └── Sidebar.css
├── Layout/
│ ├── Layout.jsx
│ └── Layout.css

---

## Componentes implementados

### 1. Button

Responsável por ações principais e secundárias da interface.

Características:

- props reutilizáveis: children, type, variant, size, disabled, onClick, className
- variantes: primary, secondary, outline, danger, ghost
- foco visível
- estado disabled
- estilos conforme a paleta oficial do sistema
- sem lógica de negócio

Uso típico:

- salvar
- cancelar
- filtrar
- abrir modal
- ações em listas

---

### 2. Input

Responsável por campos de formulário genéricos.

Características:

- label associado ao input via htmlFor/id
- suporte a texto, email, number, password, date, tel
- helperText
- error state
- disabled
- required
- foco visual com borda azul
- estilo padrão do sistema

Uso típico:

- nome
- e-mail
- filtros
- cadastro de hóspedes

---

### 3. Select

Responsável por escolha de opções em formulário.

Características:

- label + name + value + onChange + options
- visual consistente com Input
- suporte a placeholder
- disabled
- required
- error state
- reutilizável em filtros e formulários

Uso típico:

- status
- tipo de hospedagem
- seleção de categoria

---

### 4. Card

Responsável por blocos informativos de dados e conteúdo.

Características:

- title
- subtitle
- icon
- children
- className
- onClick
- visual com background branco, borda sutil e sombra leve
- reutilizável para dashboard e áreas de resumo

Uso típico:

- métricas
- indicadores
- resumos
- conteúdo agrupado

---

### 5. Table

Responsável por exibir dados em formato tabular.

Características:

- API baseada em columns e data
- suporte a colunas dinâmicas
- estados vazios
- overflow horizontal
- layout responsivo
- ações opcionais por linha

Uso típico:

- hóspedes
- acomodações
- hospedagens
- receitas
- despesas
- histórico

---

### 6. Modal

Responsável pela interface de modal genérica.

Características:

- overlay escuro
- centralizado na tela
- botão de fechar
- conteúdo dinâmico via children
- footer customizável
- acessibilidade básica com role dialog e aria-modal
- fechamento por Escape e clique fora

Uso típico:

- cadastro de hóspede
- edição
- confirmação
- formulários breves

---

### 7. Header

Responsável pela barra superior da área administrativa.

Características:

- título da página
- nome do usuário
- cargo/role
- avatar inicial
- botão para recolher sidebar em telas menores
- visual consistente com identidade do sistema

Uso típico:

- área administrativa geral
- apresentação do usuário logado

---

### 8. Sidebar

Responsável pela navegação principal do sistema administrativo.

Características:

- itens de menu
- destaque de item ativo
- submenu para financeiro
- comportamento responsivo
- versão recolhida para mobile/desktop
- cor base azul principal

Itens principais considerados:

- Dashboard
- Hóspedes
- Acomodações
- Hospedagens
- Disponibilidade
- Check-in / Check-out
- Histórico
- Financeiro
  - Receitas
  - Despesas
  - Resumo financeiro

---

### 9. Layout

Responsável por estruturar a área administrativa.

Características:

- Header no topo
- Sidebar lateral
- conteúdo principal central
- recebe children
- organiza a aplicação de forma consistente

Estrutura lógica:

- topo: Header
- lateral: Sidebar
- conteúdo: área principal

---

## Paleta de cores aplicada

Foi usada como base a paleta oficial do projeto:

- principal: #163C79
- secundário: #335B91
- intermediário: #5F7EA8
- azul claro: #7EA2C5
- azul muito claro: #9BC8DA
- cinza azulado: #D7E1E7
- fundo: #F5F6F4

Esses valores foram configurados em variáveis globais em src/index.css, garantindo padronização visual do sistema.

---

## Estilo visual e padrão geral

Os componentes foram pensados para manter uma aparência:

- moderna
- profissional
- limpa
- administrativa
- minimalista
- tecnológica

Também foram aplicados:

- borda levemente arredondada
- sombras discretas
- contraste adequado
- foco acessível
- responsividade básica

---

## Arquivos globais criados

Além dos componentes, foi necessário preparar a base da aplicação para o frontend funcionar corretamente.

Arquivos principais:

- package.json
- vite.config.js
- index.html
- src/main.jsx
- src/App.jsx
- src/index.css

Esses arquivos montam a base do projeto React/Vite e carregam a interface inicial da aplicação.

---

## Estado da aplicação atual

A aplicação atual está em um estado de protótipo funcional de front-end, com:

- layout administrativo pronto
- componentes reutilizáveis funcionando
- dashboard inicial com cards, filtros e tabela
- modal de cadastro demo
- navegação visual com destaque de itens ativos

Importante:

- não há backend
- não há banco de dados
- não há autenticação real
- não há persistência de dados
- dados estão em memória/local no próprio app

Isso está adequado ao escopo de um frontend de protótipo administrativo sem integração de dados reais.

---

## Conclusão

A componentização foi implementada de forma consistente e funcional para a área administrativa do sistema.

O projeto já possui a base correta para evoluir para páginas específicas de:

- Dashboard
- Hóspedes
- Acomodações
- Hospedagens
- Disponibilidade
- Financeiro
- Histórico

A arquitetura atual permite que essas páginas sejam criadas em seguida usando os componentes reutilizáveis já estruturados.
