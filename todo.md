

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
