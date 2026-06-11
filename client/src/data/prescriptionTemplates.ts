// Modelos de prescrição personalizáveis — criar/editar/favoritar receitas próprias
// por procedimento. Armazenamento local (localStorage), sincronizável na nuvem.

export interface PrescriptionTemplate {
  id: string;
  procedureId: string; // procedimento ao qual o modelo pertence
  name: string; // nome do modelo (ex: "Receita padrão pós-RTU")
  content: string; // texto completo da prescrição
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "urodocx_prescription_templates";

export function getAllTemplates(): PrescriptionTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Modelos de um procedimento específico — favoritos primeiro, depois mais recentes
export function getTemplatesForProcedure(procedureId: string): PrescriptionTemplate[] {
  return getAllTemplates()
    .filter((t) => t.procedureId === procedureId)
    .sort((a, b) => {
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
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
  const newTemplate: PrescriptionTemplate = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    procedureId: input.procedureId,
    name: input.name,
    content: input.content,
    favorite: input.favorite ?? false,
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
