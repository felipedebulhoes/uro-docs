// Design: Azul do Nilo Dark Mode
// Background: oklch(18% .04 247.3) | Card: oklch(22% .045 247.3)
// Primary/Accent: oklch(61.8% .117 60.4) = Cobre #B87333

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { procedures } from "@/data/procedures";
import { atlasToProcedure } from "@/data/atlasData";
import { getExtraDocs } from "@/data/extraDocuments";
import { addToHistory, addDJTimer, addToRecents, getLastRecordForProcedure } from "@/data/surgeryStore";
import { getPresets, savePreset, deletePreset, type HospitalPreset } from "@/data/hospitalPresets";
import { LOGO_SVG } from "@/lib/institution";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCopy,
  FileText,
  Pill,
  Stethoscope,
  HeartPulse,
  CheckCircle2,
  Copy,
  Save,
  ClipboardList,
  Package,
  FlaskConical,
  FileCheck,
  ShieldCheck,
  Download,
  Pencil,
  X,
  Building2,
  Plus,
  Trash2,
  MessageCircle,
  Mic,
  MicOff,
  CalendarPlus,
  Phone,
  CopyPlus,
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { toast } from "sonner";
import { useSpeechDictation } from "@/hooks/useSpeechDictation";
import { useCloudSync } from "@/hooks/useCloudSync";
import { PrescriptionTemplates } from "@/components/PrescriptionTemplates";
import { todayLocalISO, addDaysISO, formatBR } from "@/lib/dateLocal";

export default function ProcedurePage() {
  const params = useParams<{ id: string }>();
  const procedure = procedures.find((p) => p.id === params.id);
  // primeira entrada do Atlas que aponta para este procedimento (link reverso)
  const atlasEntryId = procedure
    ? Object.keys(atlasToProcedure).find((k) => atlasToProcedure[k] === procedure.id)
    : undefined;
  const extraDocs = params.id ? getExtraDocs(params.id) : null;
  const cloud = useCloudSync();

  // Mark as recent
  useEffect(() => {
    if (params.id) addToRecents(params.id);
  }, [params.id]);

  const [config, setConfig] = useState<Record<string, string>>(() => {
    if (!procedure) return {};
    const defaults: Record<string, string> = {};
    procedure.configFields.forEach((field) => {
      defaults[field.id] = field.defaultValue;
    });
    defaults.paciente = "";
    defaults.data_cirurgia = "";
    defaults.hospital = "";
    defaults.convenio = "";
    defaults.carteirinha = "";
    defaults.data_nascimento = "";
    defaults.cid = "";
    defaults.indicacao = "";
    defaults.historia_clinica = "";
    defaults.exames_justificativa = "";
    defaults.horario_internacao = "2h";
    defaults.data_evolucao = "";
    defaults.queixa_d1 = "";
    defaults.ferida_operatoria = "";
    defaults.diurese = "";
    defaults.dreno = "";
    defaults.plano_adicional = "";
    defaults.numero_guia = "";
    defaults.carater = "Eletivo";
    defaults.regime = "Internação (hospital-dia)";
    return defaults;
  });

  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [presets, setPresets] = useState<HospitalPreset[]>(() => getPresets());
  const [showPresetSave, setShowPresetSave] = useState(false);
  const [presetName, setPresetName] = useState("");

  // Duplicate the last saved record for this procedure into the current config.
  const duplicateLast = useCallback(() => {
    if (!procedure) return;
    const last = getLastRecordForProcedure(procedure.id);
    if (!last) {
      toast.error("Nenhum registro anterior deste procedimento.");
      return;
    }
    setConfig((prev) => ({ ...prev, ...last.config }));
    setEditedTexts({});
    toast.success(
      last.patientName
        ? `Dados de "${last.patientName}" carregados — ajuste o que precisar.`
        : "Dados do último registro carregados."
    );
  }, [procedure]);

  const loadPreset = useCallback((preset: HospitalPreset) => {
    setConfig((prev) => ({ ...prev, ...preset.defaults }));
    toast.success(`Preset "${preset.name}" carregado!`);
  }, []);

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) {
      toast.error("Digite um nome para o preset.");
      return;
    }
    const fieldsToSave: Record<string, string> = {};
    // Save hospital and procedure-specific config fields
    if (config.hospital) fieldsToSave.hospital = config.hospital;
    if (config.convenio) fieldsToSave.convenio = config.convenio;
    if (procedure) {
      procedure.configFields.forEach((field) => {
        if (config[field.id]) fieldsToSave[field.id] = config[field.id];
      });
    }
    savePreset({ name: presetName.trim(), defaults: fieldsToSave });
    setPresets(getPresets());
    setPresetName("");
    setShowPresetSave(false);
    cloud.syncPresets();
    toast.success(`Preset "${presetName.trim()}" salvo!`);
  }, [presetName, config, procedure, cloud]);

  const handleDeletePreset = useCallback((id: string) => {
    deletePreset(id);
    setPresets(getPresets());
    cloud.syncPresets();
    toast.info("Preset removido.");
  }, [cloud]);

  const updateConfig = useCallback((fieldId: string, value: string) => {
    setConfig((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  // Documents that are handed directly to the patient should carry a clear
  // patient-identification header at the top (name + date), so the printed/
  // copied prescription is immediately personalized.
  const PATIENT_HEADER_DOCS = ["receitaAlta", "orientacoes", "preOperatorio"];

  const withPatientHeader = useCallback(
    (docId: string, text: string): string => {
      if (!PATIENT_HEADER_DOCS.includes(docId)) return text;
      const name = (config.paciente || "").trim();
      if (!name) return text;
      const dateStr = config.data_cirurgia
        ? formatBR(config.data_cirurgia)
        : "";
      const header =
        `Paciente: ${name}` + (dateStr ? `   |   Data: ${dateStr}` : "");
      const rule = "─".repeat(Math.min(48, Math.max(header.length, 24)));
      return `${header}\n${rule}\n\n${text}`;
    },
    [config.paciente, config.data_cirurgia]
  );

  const documents = useMemo(() => {
    if (!procedure) return null;
    const base = {
      descricao: procedure.templates.descricao(config),
      posOperatorio: procedure.templates.posOperatorio(config),
      receitaAlta: withPatientHeader("receitaAlta", procedure.templates.receitaAlta(config)),
      orientacoes: withPatientHeader("orientacoes", procedure.templates.orientacoes(config)),
    };
    const extra = extraDocs
      ? {
          preOperatorio: withPatientHeader("preOperatorio", extraDocs.preOperatorio(config)),
          tcle: extraDocs.tcle(config),
          evolucaoD1: extraDocs.evolucaoD1(config),
          materiaisOPME: extraDocs.materiaisOPME(config),
          examesPosOp: extraDocs.examesPosOp(config),
          relatorioConvenio: extraDocs.relatorioConvenio(config),
        }
      : null;
    return { ...base, ...extra };
  }, [procedure, config, extraDocs, withPatientHeader]);

  // Get the actual displayed text (edited or generated)
  const getDocText = useCallback(
    (tabId: string) => {
      if (editedTexts[tabId] !== undefined) return editedTexts[tabId];
      return documents?.[tabId as keyof typeof documents] || "";
    },
    [documents, editedTexts]
  );

  const copyToClipboard = useCallback(
    (tabId: string) => {
      const text = getDocText(tabId);
      navigator.clipboard.writeText(text).then(() => {
        setCopiedTab(tabId);
        toast.success("Copiado!");
        setTimeout(() => setCopiedTab(null), 2000);
      });
    },
    [getDocText]
  );

  // Voice dictation
  const dictation = useSpeechDictation("pt-BR");

  const dictateField = useCallback(
    (fieldId: string) => {
      if (!dictation.supported) {
        toast.error("Ditado por voz não suportado neste navegador. Use Chrome/Edge.");
        return;
      }
      dictation.toggle(fieldId, (chunk) => {
        setConfig((prev) => {
          const existing = prev[fieldId] ? prev[fieldId] + " " : "";
          return { ...prev, [fieldId]: existing + chunk };
        });
      });
    },
    [dictation]
  );

  // Clinic scheduling shortcuts (Dr. Felipe Bulhões)
  const DOCTORALIA_URL =
    "https://www.doctoralia.com.br/felipe-de-bulhoes-ojeda-2/urologista/campinas";
  const CLINIC_WHATSAPP = "5511981124455"; // 11 98112-4455

  const openDoctoralia = useCallback(() => {
    window.open(DOCTORALIA_URL, "_blank", "noopener,noreferrer");
    toast.success("Abrindo agendamento no Doctoralia...");
  }, []);

  const openClinicWhatsApp = useCallback(() => {
    const msg = encodeURIComponent(
      `Olá! Sou ${config.paciente?.trim() || "paciente"} do Dr. Felipe Bulhões e gostaria de agendar um retorno.`
    );
    window.open(`https://wa.me/${CLINIC_WHATSAPP}?text=${msg}`, "_blank", "noopener,noreferrer");
    toast.success("Abrindo WhatsApp do consultório...");
  }, [config.paciente]);

  // WhatsApp share (patient instructions)
  const shareWhatsApp = useCallback(
    (tabId: string) => {
      const text = getDocText(tabId);
      if (!text) {
        toast.error("Nenhum conteúdo para compartilhar.");
        return;
      }
      const header = `*${procedure?.name || "Orientações"}*${config.paciente ? "\nPaciente: " + config.paciente : ""}\n\n`;
      const footer = `\n\n_Dr. Felipe de Bulhões — Urologia & Andrologia_\n_CRM-SP 202.291 — RQE 146538_`;
      const message = encodeURIComponent(header + text + footer);
      window.open(`https://wa.me/?text=${message}`, "_blank");
      toast.success("Abrindo WhatsApp...");
    },
    [getDocText, procedure, config.paciente]
  );

  const copyAll = useCallback(() => {
    if (!documents) return;
    const allTabs = Object.keys(documents);
    const allText = allTabs.map((tabId) => getDocText(tabId)).join("\n\n" + "═".repeat(60) + "\n\n");
    navigator.clipboard.writeText(allText).then(() => {
      toast.success("Todos os documentos copiados!");
    });
  }, [documents, getDocText]);

  const saveToHistory = useCallback(() => {
    if (!procedure) return;
    addToHistory({
      procedureId: procedure.id,
      procedureName: procedure.name,
      patientName: config.paciente || "Sem nome",
      date: config.data_cirurgia || todayLocalISO(),
      config: { ...config },
    });
    toast.success("Salvo no histórico!");

    if (config.duplo_j && config.duplo_j !== "Não implantado") {
      const insertionDate = config.data_cirurgia || todayLocalISO();
      const removalDate = addDaysISO(insertionDate, 21);
      addDJTimer({
        patientName: config.paciente || "Paciente",
        insertionDate,
        removalDate,
        lateralidade: config.lateralidade || "",
        procedureId: procedure.id,
      });
      cloud.syncTimers();
      toast.info("Timer de DJ criado (retirada em 3 semanas).");
    }
    cloud.syncSurgeries();
  }, [procedure, config, cloud]);

  // Edit functionality
  const startEditing = useCallback(
    (tabId: string) => {
      const currentText = getDocText(tabId);
      setEditedTexts((prev) => ({ ...prev, [tabId]: currentText }));
      setEditingTab(tabId);
      setTimeout(() => editTextareaRef.current?.focus(), 100);
    },
    [getDocText]
  );

  const stopEditing = useCallback(() => {
    setEditingTab(null);
    toast.success("Alterações salvas!");
  }, []);

  const resetEdit = useCallback((tabId: string) => {
    setEditedTexts((prev) => {
      const next = { ...prev };
      delete next[tabId];
      return next;
    });
    setEditingTab(null);
    toast.info("Texto restaurado ao original.");
  }, []);

  // PDF Export
  const exportPDF = useCallback(
    (tabId: string) => {
      const text = getDocText(tabId);
      const tabLabel =
        allTabs.find((t) => t.id === tabId)?.label || tabId;

      // Create a styled HTML document for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Popup bloqueado. Permita popups para exportar PDF.");
        return;
      }

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${tabLabel} - ${procedure?.shortName || ""}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Roboto', sans-serif;
      padding: 40px;
      color: #1a1a1a;
      line-height: 1.6;
      font-size: 11pt;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 2px solid #1C3D5A;
      margin-bottom: 24px;
    }
    .header-left h1 {
      font-size: 14pt;
      font-weight: 700;
      color: #1C3D5A;
    }
    .header-left p {
      font-size: 9pt;
      color: #555;
      margin-top: 2px;
    }
    .header-right {
      text-align: right;
      font-size: 8pt;
      color: #666;
    }
    .header-right .name {
      font-size: 10pt;
      font-weight: 700;
      color: #1C3D5A;
    }
    .document-title {
      font-size: 12pt;
      font-weight: 700;
      color: #B87333;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      white-space: pre-wrap;
      font-size: 10pt;
      line-height: 1.7;
    }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      font-size: 8pt;
      color: #888;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left" style="display:flex;align-items:center;gap:12px;">
      ${LOGO_SVG}
      <div>
        <h1>${procedure?.name || ""}</h1>
        <p>${config.paciente ? "Paciente: " + config.paciente : ""}${config.data_cirurgia ? " | Data: " + formatBR(config.data_cirurgia) : ""}${config.hospital ? " | " + config.hospital : ""}</p>
      </div>
    </div>
    <div class="header-right">
      <div class="name">Dr. Felipe de Bulhões</div>
      <div>CRM-SP 202.291 | RQE 146538</div>
      <div>Urologista — Instituto D'Or de Ensino e Pesquisa</div>
    </div>
  </div>
  <div class="document-title">${tabLabel}</div>
  <div class="content">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  <div class="footer">
    Dr. Felipe de Bulhões — CRM-SP 202.291 — Urologia & Andrologia — Instituto D'Or de Ensino e Pesquisa
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("PDF aberto para impressão!");
    },
    [getDocText, procedure, config]
  );

  const exportAllPDF = useCallback(() => {
    if (!documents || !procedure) return;

    const allTabsList = Object.keys(documents);
    const allContent = allTabsList
      .map((tabId) => {
        const label = allTabs.find((t) => t.id === tabId)?.label || tabId;
        const text = getDocText(tabId);
        return `<div class="page-break"><div class="document-title">${label}</div><div class="content">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div></div>`;
      })
      .join("");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup bloqueado. Permita popups para exportar PDF.");
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Documentos - ${procedure.shortName} - ${config.paciente || "Paciente"}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Roboto', sans-serif;
      padding: 40px;
      color: #1a1a1a;
      line-height: 1.6;
      font-size: 11pt;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 2px solid #1C3D5A;
      margin-bottom: 24px;
    }
    .header-left h1 {
      font-size: 14pt;
      font-weight: 700;
      color: #1C3D5A;
    }
    .header-left p {
      font-size: 9pt;
      color: #555;
      margin-top: 2px;
    }
    .header-right {
      text-align: right;
      font-size: 8pt;
      color: #666;
    }
    .header-right .name {
      font-size: 10pt;
      font-weight: 700;
      color: #1C3D5A;
    }
    .document-title {
      font-size: 12pt;
      font-weight: 700;
      color: #B87333;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      white-space: pre-wrap;
      font-size: 10pt;
      line-height: 1.7;
    }
    .page-break {
      page-break-before: always;
      margin-top: 30px;
      padding-top: 20px;
    }
    .page-break:first-child {
      page-break-before: avoid;
      margin-top: 0;
      padding-top: 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      font-size: 8pt;
      color: #888;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left" style="display:flex;align-items:center;gap:12px;">
      ${LOGO_SVG}
      <div>
        <h1>${procedure.name}</h1>
        <p>${config.paciente ? "Paciente: " + config.paciente : ""}${config.data_cirurgia ? " | Data: " + formatBR(config.data_cirurgia) : ""}${config.hospital ? " | " + config.hospital : ""}</p>
      </div>
    </div>
    <div class="header-right">
      <div class="name">Dr. Felipe de Bulhões</div>
      <div>CRM-SP 202.291 | RQE 146538</div>
      <div>Urologista — Instituto D'Or de Ensino e Pesquisa</div>
    </div>
  </div>
  ${allContent}
  <div class="footer">
    Dr. Felipe de Bulhões — CRM-SP 202.291 — Urologia & Andrologia — Instituto D'Or de Ensino e Pesquisa
  </div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success("PDF com todos os documentos aberto!");
  }, [documents, procedure, config, getDocText]);

  if (!procedure) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Procedimento não encontrado.</p>
          <Link href="/">
            <Button variant="outline">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const baseTabs = [
    { id: "descricao", label: "Descrição", icon: FileText },
    { id: "posOperatorio", label: "PO Imediato", icon: HeartPulse },
    { id: "receitaAlta", label: "Receita", icon: Pill },
    { id: "orientacoes", label: "Orientações", icon: Stethoscope },
  ];

  const extraTabs = extraDocs
    ? [
        { id: "preOperatorio", label: "Pré-Op", icon: ClipboardList },
        { id: "tcle", label: "TCLE", icon: ShieldCheck },
        { id: "evolucaoD1", label: "Evolução D1", icon: FileCheck },
        { id: "materiaisOPME", label: "OPME", icon: Package },
        { id: "examesPosOp", label: "Exames", icon: FlaskConical },
        { id: "relatorioConvenio", label: "Convênio", icon: FileText },
      ]
    : [];

  const allTabs = [...baseTabs, ...extraTabs];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 backdrop-blur-md bg-background/90">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center hover:border-primary/40 hover:bg-primary/10 transition-all duration-150">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl">{procedure.icon}</span>
              <div className="min-w-0">
                <h1 className="text-sm font-bold truncate text-foreground">
                  {procedure.shortName}
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  {procedure.name}
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              {atlasEntryId && (
                <Link href={`/atlas/${atlasEntryId}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                    title="Ver técnica no Atlas Cirúrgico"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span className="hidden sm:inline">Atlas</span>
                  </Button>
                </Link>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 border-border text-muted-foreground hover:text-primary hover:border-primary/40"
                onClick={duplicateLast}
                title="Carregar os dados do último registro deste procedimento"
              >
                <CopyPlus className="w-3 h-3" />
                <span className="hidden sm:inline">Duplicar último</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                onClick={copyAll}
              >
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Copiar Todos</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                onClick={exportAllPDF}
              >
                <Download className="w-3 h-3" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs gap-1 bg-primary text-white hover:bg-primary/90"
                onClick={saveToHistory}
              >
                <Save className="w-3 h-3" />
                <span className="hidden sm:inline">Salvar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Config Panel */}
          <div className="lg:col-span-4">
            <Card className="p-4 bg-card border-border sticky top-20">
              <h2 className="text-sm font-bold mb-4 text-primary flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Configuração
              </h2>
              <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                {/* Hospital Presets */}
                <div className="space-y-1.5 pb-3 border-b border-border/50">
                  <Label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Presets de Hospital
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {presets.map((preset) => (
                      <div key={preset.id} className="flex items-center gap-0.5">
                        <button
                          onClick={() => loadPreset(preset)}
                          className="text-[10px] px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                        >
                          {preset.name}
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="w-4 h-4 flex items-center justify-center rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                    {!showPresetSave ? (
                      <button
                        onClick={() => setShowPresetSave(true)}
                        className="text-[10px] px-2 py-1 rounded border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors flex items-center gap-0.5"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        Salvar atual
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 w-full mt-1">
                        <Input
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          placeholder="Nome do hospital"
                          className="h-7 text-[10px] bg-secondary border-border text-foreground placeholder:text-muted-foreground flex-1"
                          onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
                        />
                        <Button size="sm" className="h-7 text-[10px] px-2 bg-primary text-white" onClick={handleSavePreset}>
                          Salvar
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => setShowPresetSave(false)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Name */}
                <div className="space-y-1.5 pb-3 border-b border-border/50">
                  <Label className="text-xs text-primary font-semibold">
                    Paciente
                  </Label>
                  <Input
                    value={config.paciente || ""}
                    onChange={(e) => updateConfig("paciente", e.target.value)}
                    placeholder="Nome do paciente"
                    className="h-9 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Surgery Date */}
                <div className="space-y-1.5 pb-3 border-b border-border/50">
                  <Label className="text-xs text-primary font-semibold">
                    Data da Cirurgia
                  </Label>
                  <Input
                    type="date"
                    value={config.data_cirurgia || ""}
                    onChange={(e) => updateConfig("data_cirurgia", e.target.value)}
                    className="h-9 text-xs bg-secondary border-border text-foreground"
                  />
                </div>

                {/* Hospital */}
                <div className="space-y-1.5 pb-3 border-b border-border/50">
                  <Label className="text-xs text-muted-foreground font-medium">
                    Hospital
                  </Label>
                  <Input
                    value={config.hospital || ""}
                    onChange={(e) => updateConfig("hospital", e.target.value)}
                    placeholder="Nome do hospital"
                    className="h-9 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                {/* Procedure-specific fields */}
                {procedure.configFields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-medium">
                      {field.label}
                    </Label>
                    {field.type === "select" && field.options ? (
                      <Select
                        value={config[field.id] || field.defaultValue}
                        onValueChange={(val) => updateConfig(field.id, val)}
                      >
                        <SelectTrigger className="h-9 text-xs bg-secondary border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          {field.options.map((opt) => (
                            <SelectItem key={opt} value={opt} className="text-xs">
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Input
                          value={config[field.id] || ""}
                          onChange={(e) => updateConfig(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          className="h-9 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground flex-1"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => dictateField(field.id)}
                          title={
                            dictation.activeField === field.id
                              ? "Parar ditado"
                              : "Ditar por voz"
                          }
                          className={`h-9 w-9 shrink-0 ${
                            dictation.activeField === field.id
                              ? "border-red-500/60 text-red-400 bg-red-500/10 animate-pulse"
                              : "border-border text-muted-foreground hover:text-primary hover:border-primary/40"
                          }`}
                        >
                          {dictation.activeField === field.id ? (
                            <MicOff className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Extra fields for convênio */}
                <details className="pt-2 border-t border-border/50">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                    Campos adicionais (convênio, evolução...)
                  </summary>
                  <div className="space-y-3 mt-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">Convênio</Label>
                      <Input
                        value={config.convenio || ""}
                        onChange={(e) => updateConfig("convenio", e.target.value)}
                        placeholder="Operadora"
                        className="h-9 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">Carteirinha</Label>
                      <Input
                        value={config.carteirinha || ""}
                        onChange={(e) => updateConfig("carteirinha", e.target.value)}
                        placeholder="Nº carteirinha"
                        className="h-9 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">CID-10</Label>
                      <Input
                        value={config.cid || ""}
                        onChange={(e) => updateConfig("cid", e.target.value)}
                        placeholder="Ex: N20.1"
                        className="h-9 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-medium">Indicação Clínica</Label>
                      <Input
                        value={config.indicacao || ""}
                        onChange={(e) => updateConfig("indicacao", e.target.value)}
                        placeholder="Indicação do procedimento"
                        className="h-9 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </details>
              </div>
            </Card>
          </div>

          {/* Documents Panel */}
          <div className="lg:col-span-8">
            {/* Quick patient name field — editable here without scrolling the config panel */}
            <Card className="p-3 mb-3 bg-card border-border">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-primary font-semibold shrink-0">
                  Paciente
                </Label>
                <div className="flex items-center gap-1.5 flex-1">
                  <Input
                    value={config.paciente || ""}
                    onChange={(e) => updateConfig("paciente", e.target.value)}
                    placeholder="Nome do paciente (aparece no topo das receitas e orientações)"
                    className="h-8 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground flex-1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => dictateField("paciente")}
                    title={
                      dictation.activeField === "paciente"
                        ? "Parar ditado"
                        : "Ditar nome por voz"
                    }
                    className={`h-8 w-8 shrink-0 ${
                      dictation.activeField === "paciente"
                        ? "border-red-500/60 text-red-400 bg-red-500/10 animate-pulse"
                        : "border-border text-muted-foreground hover:text-primary hover:border-primary/40"
                    }`}
                  >
                    {dictation.activeField === "paciente" ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              {!config.paciente?.trim() && (
                <p className="text-[10px] text-yellow-400/80 mt-1.5">
                  Sem nome preenchido — receitas e orientações sairão sem identificação do paciente.
                </p>
              )}
            </Card>
            <Tabs defaultValue="descricao" className="w-full">
              <TabsList className="w-full bg-card border border-border h-auto p-1 flex flex-wrap gap-1">
                {allTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="text-[11px] py-1.5 px-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border-primary/30 flex items-center gap-1 text-muted-foreground"
                  >
                    <tab.icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0].slice(0, 4)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {allTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-4">
                  <Card className="bg-card border-border overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-primary/10">
                          <tab.icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-foreground">{tab.label}</span>
                        {editedTexts[tab.id] !== undefined && (
                          <Badge variant="outline" className="text-[9px] h-4 border-yellow-500/40 text-yellow-400">
                            editado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Edit button */}
                        {editingTab === tab.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() => resetEdit(tab.id)}
                            >
                              <X className="w-3 h-3" />
                              Reset
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1 bg-green-600 text-white hover:bg-green-700"
                              onClick={stopEditing}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              OK
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                            onClick={() => startEditing(tab.id)}
                          >
                            <Pencil className="w-3 h-3" />
                            Editar
                          </Button>
                        )}
                        {/* WhatsApp share (orientações, receita, pré-op) */}
                        {["orientacoes", "receitaAlta", "preOperatorio"].includes(tab.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10"
                            onClick={() => shareWhatsApp(tab.id)}
                            title="Enviar documento ao paciente via WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span className="hidden sm:inline">Enviar</span>
                          </Button>
                        )}
                        {/* Scheduling shortcuts (orientações) */}
                        {tab.id === "orientacoes" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                              onClick={openDoctoralia}
                              title="Agendar retorno pelo Doctoralia"
                            >
                              <CalendarPlus className="w-3 h-3" />
                              <span className="hidden sm:inline">Doctoralia</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10"
                              onClick={openClinicWhatsApp}
                              title="Chamar o consultório no WhatsApp"
                            >
                              <Phone className="w-3 h-3" />
                              <span className="hidden sm:inline">Consultório</span>
                            </Button>
                          </>
                        )}
                        {/* PDF button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                          onClick={() => exportPDF(tab.id)}
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </Button>
                        {/* Copy button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                          onClick={() => copyToClipboard(tab.id)}
                        >
                          {copiedTab === tab.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <ClipboardCopy className="w-3 h-3" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    {tab.id === "receitaAlta" && (
                      <PrescriptionTemplates
                        procedureId={procedure.id}
                        currentContent={getDocText("receitaAlta")}
                        onApply={(content) =>
                          setEditedTexts((prev) => ({
                            ...prev,
                            receitaAlta: content,
                          }))
                        }
                        onChange={() => cloud.syncTemplates()}
                      />
                    )}
                    <div className="p-4">
                      {editingTab === tab.id ? (
                        <textarea
                          ref={editTextareaRef}
                          value={editedTexts[tab.id] ?? ""}
                          onChange={(e) =>
                            setEditedTexts((prev) => ({
                              ...prev,
                              [tab.id]: e.target.value,
                            }))
                          }
                          className="w-full min-h-[400px] text-xs leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-mono)] text-foreground/90 bg-[oklch(16%_.035_247.3)] p-4 rounded-lg border border-primary/30 focus:border-primary focus:outline-none resize-y"
                        />
                      ) : (
                        <pre className="text-xs leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-mono)] text-foreground/90 bg-[oklch(16%_.035_247.3)] p-4 rounded-lg border border-border/50">
                          {getDocText(tab.id) || "Documento não disponível para este procedimento."}
                        </pre>
                      )}
                    </div>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
