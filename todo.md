
- [x] Botão "Sincronizar agora" (force pull + push) com estado de carregamento
- [x] Detecção e resolução visual de conflitos (registro existe na nuvem e localmente com dados divergentes)
- [x] Exportar histórico completo em CSV
- [x] Exportar histórico completo em PDF
- [x] Testes vitest para nova procedure de pull/detecção e validação no navegador
- [x] Substituir window.confirm por AlertDialog na limpeza de histórico

- [x] Campo de nome do paciente no topo dos modelos de receituário (inserção antes de copiar)
- [x] Botões "Agendar pelo Doctoralia" e "Chamar no WhatsApp" nos scripts/indicações
- [x] Suporte PWA: manifest, service worker, instalável e offline completo

- [x] Modelos de prescrição personalizáveis por procedimento (criar/editar/favoritar, salvos localmente)
- [x] Sincronizar modelos de prescrição personalizados na nuvem
- [x] Painel de estatísticas no Histórico (cirurgias por mês e por tipo de procedimento)
- [x] Atalho "duplicar último registro" para preencher cirurgia semelhante
- [x] Testes vitest para nova lógica e validação no navegador

- [x] Exportar painel de estatísticas (gráficos + tabela) em PDF
- [x] Filtro por período (mês/ano) no Histórico
- [x] Reordenar modelos de prescrição por arrastar (drag-and-drop)
- [x] Testes vitest da nova lógica e validação no navegador
- [x] Corrigir exportação PDF bloqueada por Trusted Types (usar Blob URL no lugar de document.write)

- [x] Filtro por intervalo de datas livre (data inicial/final) no Histórico
- [x] Cabeçalho institucional (nome, CRM, instituição) nos PDFs de histórico e estatísticas
- [x] Filtro por procedimento na exportação de estatísticas em PDF
- [x] Testes vitest do intervalo de datas e do escopo por procedimento; validação no navegador

- [x] Logotipo gráfico (imagem) no cabeçalho dos PDFs de histórico e estatísticas
- [x] Resumo executivo automático no PDF de estatísticas (texto gerado: total, período, mais frequente)
- [x] Predefinições de período no Histórico (Últimos 30 dias, Últimos 90 dias, Ano corrente)
- [x] Testes vitest do resumo executivo e das predefinições; validação no navegador

- [x] Botão "Copiar resumo" (texto puro) no painel de estatísticas
- [x] Gráfico de tendência mensal (linha) no PDF de estatísticas
- [x] Comparativo entre períodos com variação percentual (módulo + UI/PDF)
- [x] Testes vitest de comparePeriods/comparisonLabel/previousRange; validação no navegador

- [x] Comparativo por procedimento (deltas individuais) entre períodos (módulo, UI e PDF)
- [x] Metas mensais com % de atingimento (config local, painel e PDF)
- [x] Exportar gráfico de tendência mensal como imagem PNG
- [x] Testes vitest de compareProcedures/procedureDeltaLabel/renderTrendPng; validação no navegador

- [x] Incluir novos procedimentos: BipoLEP, HoLEP, Rezūm, preenchimento peniano com ácido hialurônico
- [x] Meta anual com barra de progresso acumulada do ano corrente
- [x] Alertas de ritmo de meta (mês corrente abaixo do necessário)
- [x] Exportar painel completo de estatísticas como PNG (Canvas 2D, CSP-seguro)
- [x] Testes vitest das novas funções (goals, exportPanelImage); validação no navegador
- [x] Incluir procedimento "Implante de Testosterona" (pellets subcutâneos) com modelos de documentos
- [x] Alerta mensal de ritmo como linha destacada no topo do PDF de estatísticas
- [x] Meta mensal por procedimento (além da meta global)
- [x] Semáforo de ritmo (verde/âmbar/vermelho) no topo do Histórico
- [x] Testes vitest das novas funções (paceSignal, perProcedureMonthlyPaces, load/save); validação no navegador
- [x] Corrigir deslocamento de fuso ao salvar/exibir datas (data local, sem UTC)
- [x] Permitir editar meta mensal por procedimento já criada (não só adicionar/remover)
- [x] Adicionar campo configurável de pellets/dose no Implante de Testosterona (dose total calculada automaticamente; reflete em descrição e orientações)
- [x] Adequar o app à identidade visual do Dr. Felipe e aplicar o logo (isótipo FB no app/PDFs/favicon, Roboto, azul petróleo)

- [x] Atlas: definir lista final de procedimentos (andrologia, estética genital, saúde do homem) e pesquisar evidências/recomendações (34 dossiês)
- [x] Atlas: curar figuras (133 figuras com legenda, descrição e termos de busca em inglês; placeholders informativos)
- [x] Atlas: modelar dados (atlasData.ts: 34 entradas com seções markdown, figuras e referências)
- [x] Atlas: construir UI (índice /atlas + página /atlas/:id com accordion, figuras e referências; banner e botão na Home)
- [x] Atlas: helper de categoria/evidência (atlasMeta) e link cruzado Atlas→catálogo (atlasToProcedure)
- [x] Atlas: testes vitest de integridade de dados/helpers (13 testes) — suíte completa 157 testes OK

- [x] Atlas: validar no navegador os fluxos /atlas e /atlas/:id (conteúdo, figuras, referências)
- [x] Atlas: link cruzado da página do procedimento (/procedimento/:id) para a entrada do Atlas correspondente
- [x] Atlas: salvar checkpoint do projeto

- [x] Unificação: gerar 20 dossiês do Atlas para os procedimentos do catálogo sem entrada (endourologia, oncologia renal, próstata, funcional, implante de testosterona) — Atlas agora com 54 entradas
- [x] Unificação: gerar documentos cirúrgicos completos (descrição + receita + orientações) para os 25 procedimentos do Atlas ausentes na página principal — catálogo agora com 52 procedimentos
- [x] Unificação: integrar dados (atlasData, proceduresExtra) e completar o mapa atlasToProcedure bidirecional (54 pares)
- [x] Unificação: garantir card na Home para todos os procedimentos (lista dinâmica) e botão Atlas↔documento nos dois sentidos
- [x] Unificação: testes vitest de cobertura cruzada (todo procedimento↔Atlas, 160 testes) e validação no navegador; checkpoint

- [x] Atlas+: botão "abrir busca" em cada figura (ClinicalKey + Portal CAPES) abrindo termos em nova aba
- [x] Atlas+: exportar dossiê do Atlas em PDF com cabeçalho institucional (impressão/estudo)
- [x] Atlas+: schema de figura (tabela atlas_figure_images), storage com URL assinada protegida por login (trpc.atlas.images) + fallback onError; procedures admin de upload/delete
- [x] Atlas+: via ClinicalKey/CAPES — fluxo assistido pelo painel admin (download automático de fontes protegidas não é viável/legal); botões de busca + upload manual
- [x] Atlas+: integrar imagens às figuras-chave, testes/links e checkpoint
- [x] Atlas+: painel administrativo de upload de imagens por figura (/atlas/admin, crédito/fonte, preview, remoção, só admin)
- [x] Atlas+: coletar figuras Open Access (PMC/CC-BY) — 40/54 figuras-chave com imagem real verificada (licença + crédito), 14 sem fonte redistribuível (placeholder)
- [x] Atlas+: ingestão no storage + tabela (crédito/fonte), leitura por procedure autenticado, fallback onError; 170 testes OK

- [x] Atlas++: painel admin já gerencia imagens de todas as figuras (itera entry.figures, figureIndex 0..N)
- [x] Atlas++: UI do dossiê já exibe imagem do banco em qualquer figura (imageByIndex por figureIndex)
- [x] Atlas++: PDF exportado embute imagens cadastradas (data URI + crédito) quando logado; placeholder textual quando não há imagem
- [x] Atlas++: nova rodada de busca Open Access — 7 fig0 faltantes resolvidas (54/54 com figura principal; 85 imagens no banco)
- [x] Atlas++: ingestão das novas imagens (storage + tabela, crédito/fonte) — Lote 3 (7/7) OK
- [x] Atlas++: testes (172 OK), validação e checkpoint

## Lote Hinman (figuras do Hinman's Atlas — uso pessoal/privado, com crédito)
- [x] Mapear sumário/páginas dos procedimentos no Hinman's Atlas (1117 págs)
- [x] Definir prioridades (andrologia primeiro) e lista de procedimentos/figuras (13 procedimentos)
- [x] Extrair e recortar figuras técnicas das páginas mapeadas (13 recortes 300 DPI validados)
- [x] Ingerir figuras no storage + DB com crédito Hinman's completo (13/13 OK; total 98 imagens)
- [x] Validar testes (172 OK), storage proxy (HTTP 200 PNG) e PDF (embute imagens cadastradas)
- [x] Checkpoint e reportar ao usuário

## Lote Hinman 2 (não-andrológicos + figuras extras de andrologia)
- [x] Mapear capítulos/páginas do Hinman's para procedimentos não-andrológicos (12 procedimentos)
- [x] Definir figuras extras (fig2-4) para procedimentos-chave de andrologia (4 figuras)
- [x] Renderizar páginas, selecionar e recortar figuras (300 DPI) com validação visual (16 recortes, 4 duplicatas descartadas)
- [x] Ingerir figuras no storage + DB com crédito Hinman's completo (16/16 OK; total 114 imagens)
- [x] Validar testes (172 OK), storage (PNG íntegro) e PDF (embute imagens); checkpoint e reportar ao usuário

## Lote Hinman 3 (pediátricos/funcionais — figura secundária)
- [x] Identificar procedimentos sem figura secundária e mapear capítulos no Hinman's (offset corrigido via bookmarks)
- [x] Renderizar páginas, selecionar e recortar figuras (300 DPI) com validação visual (7 recortes, 121.8 re-recortada)
- [x] Ingerir figuras no storage + DB com crédito Hinman's completo (7/7 OK; total 121 imagens)
- [x] Validar testes (172 OK), storage (PNG íntegro) e PDF (embute imagens); checkpoint e reportar ao usuário
- Procedimentos: uretrotomia interna (92.4), orquiectomia simples/subcapsular (109.2), orquidopexia/criptorquidia (114.3), postectomia adulto (120.1), circuncisão estética/revisão (120.3), curvatura peniana congênita/plicatura (121.8), prótese peniana na Peyronie grave (123.15)
- Nota: hidrocelectomia e prótese testicular não têm capítulo ilustrado dedicado no Hinman's — sugeridos para rodada Open Access futura
