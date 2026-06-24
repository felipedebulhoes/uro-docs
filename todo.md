

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
- [ ] Buscar imagem open-access de bexiga normal ao USG transabdominal com EPV medida (PMC/Wikimedia)
- [ ] Upload da imagem e adicionar como figura "Bexiga normal" na entrada usg-vias-urinarias-inferiores
- [ ] Criar entrada do Atlas "investigacao-hematuria" com fluxograma EAU 2024, critérios de urgência, laudo-modelo e referências
- [ ] Implementar calculadora de IPSS interativa embutida na entrada HPB do Atlas (AtlasProcedurePage.tsx): 7 questões, escore automático, interpretação e recomendação de conduta
- [ ] Testes e checkpoint
