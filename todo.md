

# Lote OA 7 (completar figuras dos procedimentos modernos/diferenciados)
- [x] Vasectomia sem bisturi: imagem OA para oclusão/interposição fascial (fig3, Labrecque Int Braz J Urol 2011, CC BY) e anatomia do deferente (fig4, OpenStax CC BY 3.0)
- [x] Varicocelectomia subinguinal microcirúrgica: fig2 identificação/ligadura no cordão (Int Braz J Urol 2017, CC BY)
- [x] Implante de prótese testicular: fig1 preparo (ilustração autoral), fig2 loja/fixação (World J Surg Oncol 2019, CC BY), fig3 técnica intravaginal pós-torção (ilustração autoral) — dossiê completo fig0-fig4 + legenda ajustada
- [x] Varicocelectomia: fig3 exteriorização/delivery testicular (ilustração autoral) — dossiê completo fig0-fig3
- [x] Validar licenças/créditos (CC BY) e preparar recortes (QC visual)
- [x] Ingerir imagens no storage + DB com crédito (DELETE+INSERT idempotente, 4/4 OK)
- [x] Validar storage (HTTP 206/image-jpeg), banco sem duplicatas e testes vitest (198/198)
- [x] Salvar checkpoint e reportar ao usuário
- [x] Esquemas conceituais como ilustração médica autoral: algoritmo de decisão (vasovaso vs vasoepi, fig4), microscopia comparativa do fluido vasal (vasoepi fig3) e posicionamento do reservatório da prótese peniana inflável (fig4)
- [x] Reversão de vasectomia (vasovasostomia fig4 e vasoepididimostomia fig3) e prótese peniana inflável de 3 volumes (fig4): dossiês completos, validados no storage (HTTP 206) sem duplicatas
- [x] Rezūm: dossiê completo (fig0-fig3). Como não havia fonte CC BY/CC0 pura para dispositivo/cistoscopia, produzidas ilustrações médicas autorais — fig1 (handpiece/dispositivo transuretral), fig2 (angulação da agulha lobos laterais ~90° vs mediano ~45°) e fig3 (visão cistoscópica da injeção de vapor); validadas no storage (HTTP 206) sem duplicatas

# Calculadora Interativa de Expulsão (Lote OA 9)
- [x] Campo `calc_expulsao` type="calculated" inserido em proceduresExtra.ts (terapia-expulsiva-calculo-ureteral)
- [x] Lógica da calculadora: matriz 5×3 (tamanho × localização) baseada em Hollingsworth JAMA 2016 + EAU 2024
- [x] Renderização do painel visual em ProcedurePage.tsx (badge colorido + recomendação + detalhes)
- [x] Correção de backticks escapados e vírgula dupla no proceduresExtra.ts
- [x] TypeScript sem erros, 198/198 testes passando

# Lote OA 10 — HPB, Litíase (risco recorrência) e Exportação PDF
- [x] Protocolo HPB tratamento clínico: alfa-bloqueadores, 5-ARIs, antimuscarínicos, beta-3 — com calculadora IPSS (campo calculated)
- [x] Protocolo HPB tratamento cirúrgico: RTU-P, HoLEP, Rezūm (já existente) — com indicações baseadas em IPSS/volume prostático
- [x] Calculadora de risco de recorrência de litíase (campo calculated) no protocolo de investigação metabólica
- [x] Exportar resultado da calculadora de expulsão nas orientações ao paciente (template orientacoes)
- [x] Atualizar contadores (Atlas + Home subtitle)
- [x] TypeScript sem erros, 198/198 testes passando
- [x] Salvar checkpoint

# Gaps identificados após Lote OA 10
- [x] Adicionar campo calc_indicacao_cirurgica (calculated) no protocolo HPB cirúrgico para recomendar RTU-P vs HoLEP vs Rezūm/UroLift baseado em IPSS + volume prostático

# Atlas — Imagens de Andrologia e Estética Genital
- [x] Buscar imagens open-access licenciadas (PMC/CC/Wikimedia) para 22 procedimentos
- [x] Validar URLs, baixar e revisar visualmente (descartar duplicadas/irrelevantes)
- [x] Upload de 47 imagens via manus-upload-file --webdev
- [x] Inserir imageUrl + credit + sourceUrl nas figuras do atlasData.ts
- [x] Cobertura: 22/22 procedimentos com >=1 imagem; 47 figuras com imagem real
- [x] Testes de rastreabilidade (crédito+fonte obrigatórios) — 200/200 passando
- [x] Salvar checkpoint

# Lightbox de figuras do Atlas
- [x] Componente Lightbox em tela cheia (Dialog) com imagem ampliada
- [x] Clicar na imagem do FigureCard abre o lightbox
- [x] Navegação entre figuras com imagem da entrada (anterior/próxima) por botão e teclado (setas)
- [x] Fechar por ESC, clique no backdrop e botão X
- [x] Exibir legenda, descrição e crédito no lightbox + link da fonte
- [x] Respeitar prefers-reduced-motion (motion-safe no zoom); foco acessível via Radix Dialog
- [x] Testes e checkpoint

# Lightbox de figuras do Atlas (concluído)

- [x] Componente AtlasLightbox (Dialog fullscreen, ESC/backdrop/X para fechar)
- [x] Imagens das figuras clicáveis (cursor-zoom-in + ícone Maximize2 no hover)
- [x] Navegação entre figuras com imagem (setas na tela + teclado ArrowLeft/ArrowRight)
- [x] Rodapé com legenda, descrição, crédito e link "Ver fonte original"
- [x] Lógica pura extraída para client/src/lib/lightboxNav.ts (testável)
- [x] 7 testes vitest em lightboxNav.test.ts (build de figuras, wrap circular, mapeamento de índice)
- [x] TypeScript sem erros, 207/207 testes passando, build de produção OK

# Reforço de acessibilidade do lightbox
- [x] Regra global @media (prefers-reduced-motion: reduce) no index.css neutraliza animações de Dialog/overlay (fade/zoom) e transições, cobrindo o lightbox sem editar o componente UI compartilhado
- [x] TypeScript sem erros, 207/207 testes passando

# Correção das figuras — Aumento peniano com preenchimento de ácido hialurônico (haste)
- [x] Inspecionar as 4 figuras atuais e identificar 2 imagens incorretas/inadequadas + 2 vazias
- [x] Buscar imagens open-access CC BY 4.0 (BMC Urology 2023, African J Urol 2024)
- [x] Substituir Fig1 (esquema de planos/padrões de injeção)
- [x] Preencher Fig2 (técnica com microcânula / múltiplas punções)
- [x] Substituir Fig3 (técnica em leque/fanning — diagrama correto)
- [x] Substituir Fig4 (fotos clínicas de resultados e complicações)
- [x] Adicionar Fig5 didática (forest plot de incidência de eventos adversos)
- [x] Todas as figuras com crédito + sourceUrl (CC BY 4.0)
- [x] TypeScript limpo, 207/207 testes passando, URLs respondendo (307 signed redirect)
- [x] Checkpoint salvo

# Tooltips interativos nas imagens do Atlas
- [x] Tooltip/popover interativo nas imagens: hover/click exibe referência bibliográfica completa + link para artigo via Portal CAPES
- [x] Construir URL CAPES a partir do DOI (https://www-periodicos-capes-gov-br.ez24.periodicos.capes.gov.br/index.php?option=com_pmetabusca&mn=88&smn=88&base=find-db-1&type=b&Itemid=109&sfx=https://doi.org/{DOI})
- [x] Extrair DOI do sourceUrl quando disponível, ou usar sourceUrl diretamente
- [x] Animação suave de entrada/saída do tooltip (CSS transition)
- [x] Acessibilidade: teclado (focus) e aria-label
- [x] TypeScript sem erros, testes passando

# Ampliação USG em Urologia — Material Cetrus
- [x] Enriquecer entrada "usg-doppler-peniano": protocolo detalhado (posicionamento, agulha, timing), tabela ISSM 2012 expandida (6 categorias), PVS flácido, EHS, laudo-modelo, redose
- [x] Nova entrada "usg-anatomia-peniana-modo-b": anatomia modo-B, variações anatômicas (artéria perfurante, dorsal única), ateromatose, artérias helicinas, fibrose pós-priapismo
- [x] Nova entrada "usg-doppler-peniano-reversao-seguranca": protocolo de reversão (etilefrina/fenilefrina), TCLE, critérios de alta, manejo de priapismo pós-exame

## USG - Melhorias (Jun 2026)
- [x] Adicionar procedimento usg-renal ao catálogo (proceduresExtra.ts) com template de laudo — já existia (linha 2929)
- [x] Adicionar procedimento usg-prostata-transabdominal ao catálogo (proceduresExtra.ts) com template de laudo — já existia (linha 2998)
- [x] Atualizar atlasToProcedure para mapear usg-renal e usg-prostata-transabdominal aos novos procedimentos — já mapeado (linhas 4588-4589)
- [x] Buscar e fazer upload de imagens open-access: hidronefrose (PMC13266088 CC BY), cálculo renal (PMC13117089 CC BY), próstata ao USG (Wikimedia CC BY-SA 4.0)
- [x] Implementar botão "Laudo em Branco" (PDF) nas entradas com laudo-modelo (usg-renal, usg-prostata-transabdominal, usg-escrotal-doppler-testicular)
- [x] Testes e checkpoint

# Lote USG Avançado (Jun 2026)
- [x] Criar entrada do Atlas "usg-vias-urinarias-inferiores" (atlasData.ts) com protocolo de avaliação vesical: espessura da parede, divertículos, resíduo pós-miccional, IPP, bexiga hiperativa
- [x] Criar procedimento interativo "usg-escrotal-doppler-testicular" no proceduresExtra.ts com campos de volume testicular, Doppler e conclusão automatizada
- [x] Criar procedimento interativo "usg-vias-urinarias-inferiores" no proceduresExtra.ts com campos de RPM, EPV, IPP, divertículos, cálculo, lesão
- [x] Implementar botão "Laudo PDF" (azul) na aba Descrição do ProcedurePage.tsx com assinatura e barra de paciente
- [x] Testes e checkpoint (218/218)

# Lote USG Imagens + Doppler Peniano (Jun 2026)
- [x] Buscar imagens open-access PMC/Wikimedia para usg-escrotal-doppler-testicular: volumetria (PMC13281861 CC BY), varicocele (Wikimedia CC BY 3.0), hidrocele (Wikimedia CC0), massa paratesticular (PMC13283463 CC BY)
- [x] Buscar imagens open-access PMC/Wikimedia para usg-vias-urinarias-inferiores: nodulo endoluminal vesical (PMC13263390 CC BY)
- [x] Upload das imagens aprovadas e atualizar atlasData.ts com imageUrl, credit e sourceUrl
- [x] Criar procedimento interativo usg-doppler-peniano no proceduresExtra.ts com campos PSV/EDV/RI e calculadora ISSM 2012 - ja existia completo
- [x] Mapear usg-doppler-peniano no atlasToProcedure - ja mapeado (linhas 4662-4664)
- [x] Testes e checkpoint (218/218) - versao c2b05d34

# Lote Atlas Hematúria + IPSS + Bexiga Normal (Jun 2026)
- [x] Buscar imagem open-access de bexiga normal ao USG transabdominal com EPV medida (PMC/Wikimedia)
- [x] Upload da imagem e adicionar como figura "Bexiga normal" na entrada usg-vias-urinarias-inferiores
- [x] Criar entrada do Atlas "investigacao-hematuria" com fluxograma EAU 2024, critérios de urgência, laudo-modelo e referências
- [x] Implementar calculadora de IPSS interativa embutida na entrada HPB do Atlas (AtlasProcedurePage.tsx): 7 questões, escore automático, interpretação e recomendação de conduta
- [x] Testes e checkpoint

# Exportação em Lote (Jun 2026)
- [x] Implementar botão "Exportar Tudo (PDF)" no ProcedurePage.tsx que gera um PDF único com todas as abas em sequência (descrição cirúrgica, pós-operatório, receita e orientações) — já existia, label atualizado para "Exportar Tudo" com tooltip explicativo
- [x] Testes e checkpoint (218/218)

# Lote Câncer de Próstata (Jun 2026)
- [x] Criar componente ErspcCalculator.tsx com campos PSA, volume prostático, toque retal, histórico familiar, DRE, TRUS e cálculo de risco ERSPC RC4 (câncer clinicamente significativo ≥ Gleason 7)
- [x] Integrar ErspcCalculator no AtlasProcedurePage.tsx na entrada de câncer de próstata (seção de rastreamento/diagnóstico)
- [x] Criar entrada do Atlas "investigacao-cancer-prostata" com protocolo PSA, PIRADS, biópsia e estadiamento (EAU 2024)
- [x] Criar procedimento interativo "investigacao-cancer-prostata" no proceduresExtra.ts com campos e templates de solicitação de biópsia e laudo de estadiamento clínico
- [x] Mapear investigacao-cancer-prostata no atlasToProcedure
- [x] Testes e checkpoint (218/218; checkpoint fb29e174)

# Seguimento Pós-Prostatectomia e ERSPC (Ago 2026)
- [x] Adicionar cálculo automático de PSA Density (PSA ÷ volume prostático) na calculadora ERSPC
- [x] Adicionar cálculo automático de PSA Velocity a partir de dois valores de PSA e suas respectivas datas na calculadora ERSPC
- [x] Criar entrada do Atlas "seguimento-pos-prostatectomia" com cronograma de PSA, critérios de recidiva bioquímica e abordagem de tratamento de resgate, baseada na EAU 2026
- [x] Criar procedimento interativo "seguimento-pos-prostatectomia" com campos de PSA seriado, patologia, estadiamento e templates de seguimento/encaminhamento
- [x] Mapear a nova entrada do Atlas ao procedimento de seguimento pós-prostatectomia
- [x] Validar TypeScript e Vitest (222/222) e preparar checkpoint do lote

# Correção de Integridade do Catálogo (Ago 2026)
- [x] Localizar e eliminar a duplicação do ID `usg-escrotal-doppler-testicular` que gera chave React duplicada na página inicial
- [x] Adicionar teste de regressão para garantir unicidade dos IDs de procedimentos do catálogo
- [x] Validar TypeScript/Vitest (223/223) e preparar checkpoint da correção

# Pesquisa Rápida do Catálogo (Ago 2026)
- [x] Revisar e aprimorar a barra de busca inicial para localizar procedimentos, categorias e calculadoras
- [x] Adicionar lógica testável de pesquisa com correspondência por nome, abreviação, categoria e indicadores de calculadora
- [x] Validar TypeScript/Vitest (226/226) e preparar checkpoint da busca rápida

# Auditoria e Complementação de Imagens do Atlas (Ago 2026)
- [x] Auditar as figuras por entrada: cobertura, relevância clínica, crédito e fonte bibliográfica (69 entradas; relatório reprodutível em audit/atlas-images-audit.md)
- [x] Priorizar procedimentos sem imagem e selecionar figuras de literatura e ilustrações médicas autorais conforme adequação clínica
- [x] Atualizar créditos, fontes e descrições no Atlas (106 figuras com imagem e rastreabilidade completa; cobertura mínima de todas as 69 entradas)
- [x] Validar TypeScript/Vitest (227/227) e preparar checkpoint da auditoria visual

# Enriquecimento de Quadros Secundários do Atlas (Ago 2026)
- [x] Priorizar procedimentos com quatro ou mais quadros secundários vazios, começando por técnicas oncológicas, endourológicas e andrológicas
- [x] Selecionar e revisar oito imagens médicas complementares, evitando repetição de conteúdo e mantendo créditos e fontes
- [x] Preencher oito quadros secundários priorizados no Atlas com descrições didáticas (pellets, nefrectomias, nefroureterectomia, postectomia, prostatectomia, RTU-P, RTU-B e RIRS)
- [x] Validar TypeScript/Vitest (227/227), atualizar auditoria (114 figuras com imagem) e preparar checkpoint

# Quadros Secundários — Andrologia e Fertilidade (Ago 2026)
- [x] Priorizar procedimentos de andrologia e fertilidade com maior número de quadros vazios
- [x] Selecionar e revisar dez imagens médicas complementares de anatomia, técnica, diagnóstico e seguimento
- [x] Atualizar quadros secundários de vasovasostomia, vasoepididimostomia, varicocelectomia, biópsia testicular, PESA/TESA, micro-TESE, próteses penianas e correções de curvatura/Peyronie
- [x] Validar TypeScript/Vitest (227/227), atualizar auditoria (124 figuras com imagem) e preparar checkpoint

# Enriquecimento Didático Contínuo — Lote 06 (Ago 2026)
- [x] Priorizar os quadros secundários remanescentes por ganho didático: anatomia, acesso, técnica, imagem diagnóstica, complicações e seguimento
- [x] Selecionar e revisar nove imagens clínicas, técnicas e esquemáticas complementares; descartar foto de pós-orquiectomia sem valor técnico suficiente
- [x] Atualizar adrenalectomia, cistoscopia, HoLEP, orquidopexia, pieloplastia, vasectomia, hidrocelectomia, NLP e reimplante ureteral com novas imagens e legendas didáticas
- [x] Validar TypeScript/Vitest (227/227), atualizar auditoria (133 figuras com imagem) e preparar checkpoint

# Complicações e Revisão Cirúrgica — Lote 07 (Ago 2026)
- [x] Priorizar procedimentos sem quadro visual de complicação, falha terapêutica ou revisão cirúrgica
- [x] Selecionar e revisar oito imagens médicas que ilustram sangramento, extravasamento, avulsão, perfuração, enfisema e salvamento protético
- [x] Atualizar nefrectomia parcial, prostatectomia radical, RIRS, NLP, HoLEP, RTU-P, prótese peniana inflável e reimplante ureteral com imagens e legendas de segurança clínica
- [x] Validar TypeScript/Vitest (227/227), atualizar auditoria (141 figuras com imagem) e preparar checkpoint

# Seguimento, Filtros e Alertas — Lote 08 (Ago 2026)
- [x] Priorizar procedimentos para imagens de seguimento pós-operatório e desfechos funcionais
- [x] Selecionar e revisar sete imagens complementares de controle, recuperação e resultado funcional; descartar tabela de reabilitação pós-prostatectomia sem legibilidade adequada
- [x] Adicionar filtros no Atlas por técnica, complicação e imagem diagnóstica, com indicadores por cartão
- [x] Adicionar alertas visuais para priapismo isquêmico, ureteroscopia, NLP, RTU-P e HoLEP
- [x] Atualizar imagens de seguimento em pieloplastia, reimplante ureteral, HoLEP, varicocelectomia, sling masculino, prótese peniana e NLP
- [x] Validar TypeScript/Vitest (230/230), atualizar auditoria (148 figuras com imagem) e preparar checkpoint

# Filtros Avançados, Seguimento e Alertas — Lote 09 (Ago 2026)
- [x] Implementar filtros por subespecialidade e nível de evidência no índice do Atlas
- [x] Criar linha do tempo visual de seguimento pós-operatório em postectomia, varicocelectomia, prostatectomia radical, pieloplastia, NLP, HoLEP, sling masculino e prótese peniana inflável
- [x] Expandir alertas de urgência para pós-operatório escrotal e cenários oncológicos (torção/orquidopexia, hidrocelectomia, orquiectomia radical, RTU-B e nefrectomia parcial)
- [x] Validar TypeScript/Vitest (232/232) e preparar checkpoint do lote avançado

# Revisão Visual — Estética Genital (Ago 2026)
- [x] Inventariar as imagens das sete entradas de estética genital e seus créditos
- [x] Revisar adequação clínica, anatômica e didática de cada imagem; registrar parecer em audit/esthetic-images-visual-review.md
- [x] Corrigir legendas incoerentes de ligamentólise e circuncisão; substituir imagem pediátrica de escrotoplastia por esquema adulto; adicionar esquemas autorais de enxerto dermogorduroso, reconstrução de pênis enterrado e circuncisão em sleeve
- [x] Validar TypeScript/Vitest (232/232) e preparar checkpoint da revisão visual

# Segurança Visual e Orientação Estética Genital (Ago 2026)
- [x] Adicionar etiqueta de conteúdo clínico sensível às fotografias genitais e de complicações pertinentes
- [x] Criar esquemas visuais de orientação pós-operatória para as sete técnicas estéticas do Atlas
- [x] Criar comparação visual entre indicações estéticas e reconstrutivas
- [x] Validar TypeScript/Vitest (235/235) e preparar checkpoint de segurança visual
