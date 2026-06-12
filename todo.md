
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
