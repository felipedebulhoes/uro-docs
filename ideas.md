# Ideas - UroDocx

## Contexto
Web app de uso pessoal para o **Dr. Felipe Bulhões** — Urologista pelo Instituto D'Or de Ensino e Pesquisa, Cirurgião Geral TCBC, com foco em Andrologia. O objetivo é acessar rapidamente modelos de documentos cirúrgicos (descrição cirúrgica, PO imediato, receita de alta, orientações pós-alta) para os principais procedimentos urológicos. Deve funcionar bem em computador, iPhone e Android.

---

<response>
## Idea 1: "Medical Utility — Swiss Design Meets Clinical Precision"

**Design Movement:** Swiss/International Typographic Style adaptado para ferramentas médicas.

**Core Principles:**
1. Clareza absoluta — cada informação no lugar certo, sem ruído visual.
2. Hierarquia tipográfica forte — títulos, subtítulos e corpo com pesos distintos.
3. Grid rígido com espaçamento generoso.
4. Funcionalidade acima de decoração.

**Color Philosophy:** Paleta monocromática com acento em azul-petróleo (#1B4965) para transmitir confiança e profissionalismo médico. Background off-white (#FAFBFC) para reduzir fadiga visual em uso prolongado. Acento secundário em verde-menta (#5FA777) para indicadores de sucesso/status.

**Layout Paradigm:** Sidebar fixa à esquerda com lista de procedimentos; área principal com tabs para cada tipo de documento. No mobile, a sidebar vira um bottom sheet ou drawer.

**Signature Elements:** Cards com borda esquerda colorida indicando o tipo de documento. Tipografia monospace para prescrições e dosagens.

**Interaction Philosophy:** Transições mínimas e instantâneas. Toque/clique revela conteúdo imediatamente. Sem animações desnecessárias — é uma ferramenta de trabalho.

**Animation:** Apenas micro-interações: feedback de toque (scale 0.97), transição de tabs (150ms ease-out).

**Typography System:** DM Sans (headings, bold 700) + IBM Plex Mono (prescrições/dosagens) + Inter (corpo, regular 400).

<probability>0.08</probability>
</response>

<response>
## Idea 2: "Dark Clinical Dashboard — Surgical Command Center"

**Design Movement:** Dark UI inspirado em dashboards médicos de alta tecnologia (monitores de centro cirúrgico).

**Core Principles:**
1. Dark mode nativo — reduz fadiga em ambientes com pouca luz (centro cirúrgico, plantão).
2. Informação densa mas organizada em blocos visuais claros.
3. Acesso rápido com busca e atalhos.
4. Sensação de "cockpit" profissional.

**Color Philosophy:** Background escuro (#0F1419) com superfícies em cinza-grafite (#1C2128). Texto em cinza-claro (#E6EDF3). Acento primário em cyan cirúrgico (#58A6FF) para links e ações. Acento de alerta em âmbar (#D29922).

**Layout Paradigm:** Layout de painel único com navegação por cards grandes na home. Cada procedimento é um card que expande para revelar os 4 tipos de documento em formato de accordion. No desktop, grid de 2-3 colunas; no mobile, stack vertical.

**Signature Elements:** Ícones circulares com gradiente sutil para cada procedimento. Badges de cor para tipo de documento (azul=descrição, verde=PO, laranja=receita, roxo=orientações).

**Interaction Philosophy:** Feedback tátil forte. Cards com hover elevation. Accordion com transição suave. Busca com highlight instantâneo.

**Animation:** Cards entram com stagger de 50ms. Accordion abre com spring physics (200ms). Hover eleva card com shadow spread.

**Typography System:** Space Grotesk (headings, semibold 600) + JetBrains Mono (prescrições) + Inter (corpo, regular 400).

<probability>0.06</probability>
</response>

<response>
## Idea 3: "Notion-Inspired Knowledge Base — Clean & Scannable"

**Design Movement:** Minimalismo editorial inspirado em ferramentas de produtividade (Notion, Linear).

**Core Principles:**
1. Conteúdo é rei — interface desaparece para dar protagonismo ao texto.
2. Navegação por breadcrumbs e hierarquia clara.
3. Espaçamento generoso entre blocos de conteúdo.
4. Sensação de "documento vivo" que pode ser consultado rapidamente.

**Color Philosophy:** Background branco puro (#FFFFFF) com superfícies em cinza ultra-leve (#F7F8FA). Texto em preto suave (#1A1A2E). Acento único em índigo (#4F46E5) para links e navegação ativa. Sem cores excessivas — a informação fala por si.

**Layout Paradigm:** Página única com sidebar colapsável (tipo Notion). Navegação hierárquica: Procedimento → Tipo de Documento → Conteúdo. No mobile, navegação por stack com back button.

**Signature Elements:** Breadcrumb trail no topo. Blocos de conteúdo com dividers sutis. Tabelas com estilo clean e alternância de fundo.

**Interaction Philosophy:** Navegação fluida entre níveis. Sidebar com collapse suave. Conteúdo aparece instantaneamente sem loading states artificiais.

**Animation:** Sidebar collapse (200ms ease-out). Page transitions com fade (150ms). Hover em items da sidebar com background-color transition (100ms).

**Typography System:** Satoshi (headings, bold 700) + Source Code Pro (prescrições/tabelas) + Inter (corpo, regular 400).

<probability>0.07</probability>
</response>

---

## Decisão: Idea 2 — "Dark Clinical Dashboard"

Escolhi a Idea 2 por ser a mais adequada ao contexto de uso real:
- O Dr. Felipe usará o app frequentemente em ambientes hospitalares (centro cirúrgico, plantão noturno) onde o dark mode reduz fadiga visual.
- O layout de cards com accordion permite acesso rápido sem muitos cliques.
- A estética de "command center" transmite profissionalismo e é visualmente distinta.
- A busca integrada facilita encontrar procedimentos rapidamente.
- Personalizado com o nome e credenciais do Dr. Felipe Bulhões.
