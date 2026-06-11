// Modelos de prescrição personalizáveis — criar/editar/favoritar/reordenar
// receitas próprias por procedimento. Armazenamento local (localStorage),
// sincronizável na nuvem.

export interface PrescriptionTemplate {
  id: string;
  procedureId: string; // procedimento ao qual o modelo pertence
  name: string; // nome do modelo (ex: "Receita padrão pós-RTU")
  content: string; // texto completo da prescrição
  favorite: boolean;
  sortOrder: number; // ordem manual definida por arrastar (menor = primeiro)
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "urodocx_prescription_templates";

export function getAllTemplates(): PrescriptionTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PrescriptionTemplate[];
    // Backfill sortOrder for legacy records saved before this field existed.
    return parsed.map((t, i) => ({
      ...t,
      sortOrder: typeof t.sortOrder === "number" ? t.sortOrder : i,
    }));
  } catch {
    return [];
  }
}

/**
 * Modelos de um procedimento específico.
 * Ordena por: favoritos primeiro, depois pela ordem manual (sortOrder) e,
 * como desempate, mais recentes primeiro.
 */
export function getTemplatesForProcedure(procedureId: string): PrescriptionTemplate[] {
  return getAllTemplates()
    .filter((t) => t.procedureId === procedureId)
    .sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });
}

function persist(templates: PrescriptionTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function saveTemplate(
  input: Pick<PrescriptionTemplate, "procedureId" | "name" | "content"> & { favorite?: boolean }
): PrescriptionTemplate {
  const templates = getAllTemplates();
  const now = new Date().toISOString();
  // New template goes to the end of its procedure's list.
  const maxOrder = templates
    .filter((t) => t.procedureId === input.procedureId)
    .reduce((max, t) => Math.max(max, t.sortOrder), -1);
  const newTemplate: PrescriptionTemplate = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    procedureId: input.procedureId,
    name: input.name,
    content: input.content,
    favorite: input.favorite ?? false,
    sortOrder: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };
  templates.push(newTemplate);
  persist(templates);
  return newTemplate;
}

export function updateTemplate(
  id: string,
  updates: Partial<Pick<PrescriptionTemplate, "name" | "content" | "favorite">>
): void {
  const templates = getAllTemplates();
  const idx = templates.findIndex((t) => t.id === id);
  if (idx >= 0) {
    templates[idx] = {
      ...templates[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    persist(templates);
  }
}

export function toggleTemplateFavorite(id: string): boolean {
  const templates = getAllTemplates();
  const idx = templates.findIndex((t) => t.id === id);
  if (idx >= 0) {
    templates[idx].favorite = !templates[idx].favorite;
    templates[idx].updatedAt = new Date().toISOString();
    persist(templates);
    return templates[idx].favorite;
  }
  return false;
}

export function deleteTemplate(id: string): void {
  persist(getAllTemplates().filter((t) => t.id !== id));
}

/**
 * Reorder a procedure's templates. `orderedIds` is the desired full order of
 * the ids belonging to `procedureId`. Persists a new sortOrder (0..n) for those
 * templates while leaving other procedures untouched.
 */
export function reorderTemplates(procedureId: string, orderedIds: string[]): void {
  const templates = getAllTemplates();
  const orderMap = new Map<string, number>();
  orderedIds.forEach((id, i) => orderMap.set(id, i));
  const now = new Date().toISOString();
  const next = templates.map((t) => {
    if (t.procedureId !== procedureId) return t;
    const order = orderMap.get(t.id);
    if (order === undefined) return t;
    return { ...t, sortOrder: order, updatedAt: now };
  });
  persist(next);
}
