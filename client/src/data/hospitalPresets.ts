// Hospital Presets — salvar e carregar configurações padrão por hospital

export interface HospitalPreset {
  id: string;
  name: string;
  defaults: Record<string, string>;
  createdAt: string;
}

const STORAGE_KEY = "uro-docs-hospital-presets";

export function getPresets(): HospitalPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePreset(preset: Omit<HospitalPreset, "id" | "createdAt">): HospitalPreset {
  const presets = getPresets();
  const newPreset: HospitalPreset = {
    ...preset,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
  };
  presets.push(newPreset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  return newPreset;
}

export function updatePreset(id: string, updates: Partial<Omit<HospitalPreset, "id" | "createdAt">>): void {
  const presets = getPresets();
  const idx = presets.findIndex((p) => p.id === id);
  if (idx >= 0) {
    presets[idx] = { ...presets[idx], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  }
}

export function deletePreset(id: string): void {
  const presets = getPresets().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}
