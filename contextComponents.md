3. RESPONSABILIDADE DOS COMPONENTS

Minha responsabilidade neste projeto é desenvolver SOMENTE os componentes reutilizáveis dentro de:

src/components/

Os componentes NÃO devem conter regras específicas de uma página.

Exemplo:

CORRETO:

<Button> <Input> <Card> <Modal> <Table> <Sidebar> <Header>

INCORRETO:

<DashboardFinanceiro> <HistoricoHospedagens> <CadastroHospede>

Esses componentes específicos pertencem às páginas.

Os components devem ser genéricos, reutilizáveis e receber informações através de props.

4. PRINCÍPIO FUNDAMENTAL

Sempre pensar:

"Este componente poderia ser utilizado em mais de uma página?"

Se a resposta for SIM, ele provavelmente pertence a /components.

Se o componente possui lógica extremamente específica de uma única funcionalidade, ele provavelmente pertence à página correspondente.

Priorizar:

Reutilização
Simplicidade
Legibilidade
Manutenção
Responsividade
Acessibilidade
Separação de responsabilidades

Evitar criar componentes excessivamente complexos.

5. PALETA DE CORES OFICIAL

Utilizar exclusivamente esta paleta como base visual do sistema:

PRINCIPAL:
#163C79

AZUL SECUNDÁRIO:
#335B91

AZUL INTERMEDIÁRIO:
#5F7EA8

AZUL CLARO:
#7EA2C5

AZUL MUITO CLARO:
#9BC8DA

CINZA/AZUL CLARO:
#D7E1E7

FUNDO:
#F5F6F4

6. SIGNIFICADO VISUAL DAS CORES

Utilizar as cores de maneira consistente.

#163C79
Cor principal da aplicação.

Usar principalmente em:

Sidebar
Header quando necessário
Botões principais
Títulos importantes
Ícones de destaque
Elementos de navegação ativos
Links principais

#335B91
Cor secundária.

Usar em:

Hover de elementos principais
Botões secundários
Destaques
Elementos de navegação

#5F7EA8
Cor intermediária.

Usar em:

Ícones
Elementos secundários
Bordas destacadas
Estados intermediários

#7EA2C5
Azul claro.

Usar em:

Backgrounds suaves
Hover
Badges
Elementos decorativos

#9BC8DA
Azul muito claro.

Usar em:

Backgrounds informativos
Destaques suaves
Elementos de apoio

#D7E1E7
Cinza azulado.

Usar em:

Bordas
Divisores
Backgrounds secundários
Estados desabilitados

#F5F6F4
Cor principal de fundo.

Usar em:

Background geral
Áreas vazias
Container principal
7. CORES ADICIONAIS

Não inventar uma nova paleta.

Quando for necessário representar estados como:

sucesso
erro
alerta
informação

usar cores sem saturação excessiva e de forma pontual.

Essas cores devem ser utilizadas SOMENTE quando semanticamente necessárias.

Não transformar o sistema em uma interface colorida demais.

A identidade visual deve continuar predominantemente azul, branca e cinza.

8. ESTILO VISUAL

O sistema deve possuir aparência:

Moderna
Profissional
Limpa
Minimalista
Administrativa
Elegante
Tecnológica
Fácil de utilizar

Evitar:

Gradientes exagerados
Sombras muito fortes
Bordas excessivamente arredondadas
Excesso de cores
Animações exageradas
Elementos decorativos desnecessários
Interfaces semelhantes a dashboards genéricos de template

Priorizar uma aparência profissional semelhante a sistemas SaaS modernos.

9. BORDER RADIUS

Utilizar bordas levemente arredondadas.

Preferência:

Inputs: 8px
Buttons: 8px
Cards: 12px
Modals: 12px
Containers: 12px
Badges: 999px ou formato pill

Não utilizar border-radius exagerado em containers grandes.

10. SOMBRAS

Usar sombras discretas.

Exemplo conceitual:

box-shadow:
0 2px 8px rgba(22, 60, 121, 0.08);

As sombras devem transmitir profundidade sem deixar o sistema pesado.

Evitar sombras muito escuras.

11. TIPOGRAFIA

Utilizar uma fonte sans-serif moderna.

Priorizar:

Inter
Arial
sans-serif

Hierarquia:

Títulos:
font-weight: 600 ou 700

Subtítulos:
font-weight: 500 ou 600

Texto normal:
font-weight: 400

Labels:
font-weight: 500

Evitar utilizar muitos pesos diferentes.

12. COMPONENTE BUTTON

O Button deve ser reutilizável.

Deve aceitar props como:

children
onClick
type
disabled
variant
size
className

Variantes recomendadas:

primary
secondary
outline
danger
ghost

Exemplo de uso:

<Button variant="primary"> Salvar </Button>

<Button variant="secondary"> Cancelar </Button>

<Button variant="outline"> Editar </Button>

O botão primary deve utilizar #163C79.

O hover deve utilizar #335B91.

O botão deve possuir:

cursor pointer
transição suave
estado disabled
boa área de clique
foco acessível

Não adicionar lógica de negócio ao Button.

13. COMPONENTE INPUT

O Input deve ser genérico e reutilizável.

Props esperadas:

label
type
name
value
onChange
placeholder
disabled
required
error
helperText
className

Deve suportar:

text
email
password
number
date
tel

Exemplo:

<Input label="Nome completo" placeholder="Digite o nome" />

Estados:

Normal:
border #D7E1E7

Focus:
border #5F7EA8 ou #163C79

Erro:
usar uma cor de erro discreta

Disabled:
background #D7E1E7

O label deve estar sempre associado corretamente ao input através de htmlFor/id.

14. COMPONENTE SELECT

Criar Select reutilizável.

Props:

label
name
value
onChange
options
placeholder
disabled
required
error

Exemplo:

<Select
label="Tipo de acomodação"
options={[
{ value: "flat", label: "Flat" },
{ value: "quarto", label: "Quarto" }
]}
/>

O Select deve manter o mesmo padrão visual do Input.

15. COMPONENTE CARD

O Card será utilizado principalmente no Dashboard.

Deve ser genérico.

Pode aceitar:

children
title
subtitle
icon
className
onClick

Exemplo:

<Card
title="Hospedagens"
subtitle="Total no período"




25
</Card>

Visual:

background #FFFFFF
border sutil #D7E1E7
border-radius 12px
sombra discreta
padding consistente

O Card não deve possuir conteúdo específico de hospedagem.

16. COMPONENTE MODAL

Criar Modal reutilizável.

Responsável apenas pela interface do modal.

Props:

isOpen
onClose
title
children
footer

Exemplo:

<Modal
isOpen={isOpen}
onClose={handleClose}
title="Cadastrar hóspede"




...
</Modal>

O Modal deve:

possuir overlay
ficar centralizado
ter botão de fechar
permitir conteúdo dinâmico
possuir boa responsividade
impedir visualmente que o conteúdo de fundo interfira
possuir acessibilidade básica

Não colocar lógica de cadastro dentro do Modal.

17. COMPONENTE TABLE

Criar uma tabela reutilizável.

Ela deverá ser suficientemente genérica para mostrar:

hóspedes
acomodações
hospedagens
receitas
despesas
histórico

Não criar uma tabela específica para cada página.

Preferir uma API baseada em colunas e dados.

Exemplo conceitual:

<Table columns={[ { key: "nome", label: "Nome" }, { key: "email", label: "E-mail" } ]} data={hospedes} />

Também deve permitir futuramente:

ações
edição
exclusão
visualização
estados vazios

A tabela deve ser responsiva.

18. COMPONENTE HEADER

O Header representa a barra superior da área administrativa.

Pode conter:

Nome do sistema
Título da página atual
Informações do usuário
Avatar
Menu de usuário
Notificações, caso necessário

Não colocar informações específicas de uma única página.

19. COMPONENTE SIDEBAR

O Sidebar é o principal componente de navegação administrativa.

Itens:

Dashboard
Hóspedes
Acomodações
Hospedagens
Disponibilidade
Check-in / Check-out
Histórico
Financeiro

Financeiro pode possuir submenu:

Receitas
Despesas
Resumo financeiro

O Sidebar deve:

destacar página ativa
possuir ícones
permitir navegação
funcionar em desktop
possuir comportamento responsivo em telas menores
utilizar a cor #163C79 como base

O item ativo pode utilizar uma variação de #335B91 ou #5F7EA8.

Não colocar regras de negócio dentro do Sidebar.

20. COMPONENTE LAYOUT

O Layout deve estruturar a área administrativa.

Estrutura:

┌───────────────────────────────┐
│ Header │
├───────────┬───────────────────┤
│ │ │
│ Sidebar │ Main Content │
│ │ │
│ │ │
└───────────┴───────────────────┘

O Layout deve receber children.

Exemplo:

<Layout> <Dashboard /> </Layout>

Não colocar conteúdo específico de nenhuma página dentro dele.

21. RESPONSIVIDADE

Todos os componentes devem funcionar em:

Desktop
Tablet
Mobile

Prioridade do projeto:

Desktop primeiro, mas sem quebrar em telas menores.

A Sidebar pode virar menu recolhível em telas pequenas.

Tabelas devem possuir overflow horizontal quando necessário.

Cards devem se reorganizar conforme a largura disponível.

Formulários devem utilizar layouts responsivos.

22. CSS

Como o projeto utiliza JavaScript/JSX, NÃO utilizar TypeScript.

Preferir CSS separado por componente.

Exemplo:

Button/
├── Button.jsx
└── Button.css

Card/
├── Card.jsx
└── Card.css

Input/
├── Input.jsx
└── Input.css

Não colocar todo o CSS dos componentes dentro de index.css.

O index.css deve conter apenas estilos globais, reset, variáveis e configurações gerais.

23. VARIÁVEIS CSS

Criar variáveis globais para a paleta.

Exemplo:

{
--color-primary: #163C79;
--color-secondary: #335B91;
--color-blue-medium: #5F7EA8;
--color-blue-light: #7EA2C5;
--color-blue-soft: #9BC8DA;
--color-border: #D7E1E7;
--color-background: #F5F6F4;
--color-white: #FFFFFF;
}

Sempre que possível, utilizar essas variáveis em vez de repetir os valores hexadecimais.

24. ÍCONES

Se for necessário utilizar ícones, preferir uma biblioteca consistente, como Lucide React, caso ela já esteja instalada no projeto.

Não misturar estilos de diferentes bibliotecas de ícones.

Os ícones devem ser simples e discretos.

Exemplos:

Dashboard → LayoutDashboard
Hóspedes → Users
Acomodações → Building
Hospedagens → CalendarCheck
Disponibilidade → CalendarDays
Check-in/out → LogIn / LogOut
Histórico → History
Financeiro → Wallet
Receitas → TrendingUp
Despesas → TrendingDown

25. ACESSIBILIDADE

Sempre que possível:

Utilizar HTML semântico
Labels associados aos inputs
Botões reais para ações
aria-label quando necessário
Estados de foco visíveis
Contraste adequado
Não depender apenas de cores para transmitir informação
26. REGRAS DE CÓDIGO

Sempre gerar código:

simples
limpo
legível
modular
reutilizável

Não criar abstrações desnecessárias.

Não utilizar TypeScript.

Não criar arquivos que não sejam necessários.

Não instalar bibliotecas novas sem solicitar autorização.

Não modificar componentes existentes sem necessidade.

Não modificar páginas quando a solicitação for exclusivamente para components.

Não implementar backend.

Não criar chamadas de API.

Não criar autenticação real.

Não criar integração com Booking ou Airbnb.

27. REGRA IMPORTANTE SOBRE PROPS

Os componentes devem ser controláveis pelas páginas.

Evitar colocar dados fixos dentro dos componentes.

ERRADO:

const users = [
...
];

dentro de Table.jsx.

CORRETO:

<Table data={users} />

Os dados pertencem às páginas, hooks ou arquivos de mock data.

28. REGRA SOBRE LÓGICA

Components devem cuidar principalmente de:

apresentação
interação visual
eventos recebidos por props

Não devem cuidar de:

regras financeiras
cálculos de hospedagem
chamadas de API
persistência
regras de negócio
autenticação

Essas responsabilidades pertencem a outras camadas.

29. PADRÃO DE NOMENCLATURA

Utilizar:

PascalCase para componentes:

Button.jsx
Input.jsx
Modal.jsx
Sidebar.jsx

camelCase para:

funções
variáveis
props

Exemplo:

handleSubmit
isOpen
onClose
className

30. OBJETIVO FINAL

O resultado deve ser um conjunto de componentes reutilizáveis que permita construir todas as páginas administrativas do sistema utilizando os mesmos elementos visuais.

O sistema deve transmitir:

"Um software profissional de gestão de hospedagens."

Não deve parecer um site de reserva para hóspedes.

A interface é exclusivamente voltada para o ADMINISTRADOR.

INSTRUÇÃO FINAL PARA O COPILOT

Sempre que eu solicitar a criação ou alteração de um componente:

Analise primeiro as regras acima.
Verifique se o componente deve realmente ficar em src/components/.
Gere JavaScript/JSX, nunca TypeScript.
Crie o CSS correspondente quando necessário.
Utilize a paleta oficial.
Priorize reutilização através de props.
Não coloque regras de negócio no componente.
Não crie dados mockados dentro dos componentes.
Não altere páginas ou outras partes do projeto sem necessidade.
Mantenha o código simples e profissional.
Preserve a identidade visual dos componentes já existentes.
Antes de criar uma nova abstração, verifique se algum componente existente pode ser reutilizado.