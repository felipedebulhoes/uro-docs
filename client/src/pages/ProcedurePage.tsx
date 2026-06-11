// Identidade Visual: felipebulhoes.com (dark mode)
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
import { getExtraDocs } from "@/data/extraDocuments";
import { addToHistory, addDJTimer, addToRecents } from "@/data/surgeryStore";
import {
  ArrowLeft,
  ClipboardCopy,
  FileText,
  Pill,
  Stethoscope,
  HeartPulse,
  CheckCircle2,
  Copy,
  Save,
  Timer,
  ClipboardList,
  Package,
  FlaskConical,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useParams, Link } from "wouter";
import { toast } from "sonner";

export default function ProcedurePage() {
  const params = useParams<{ id: string }>();
  const procedure = procedures.find((p) => p.id === params.id);
  const extraDocs = params.id ? getExtraDocs(params.id) : null;

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
    // Add extra fields for patient info
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

  const updateConfig = useCallback((fieldId: string, value: string) => {
    setConfig((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const documents = useMemo(() => {
    if (!procedure) return null;
    const base = {
      descricao: procedure.templates.descricao(config),
      posOperatorio: procedure.templates.posOperatorio(config),
      receitaAlta: procedure.templates.receitaAlta(config),
      orientacoes: procedure.templates.orientacoes(config),
    };
    const extra = extraDocs
      ? {
          preOperatorio: extraDocs.preOperatorio(config),
          tcle: extraDocs.tcle(config),
          evolucaoD1: extraDocs.evolucaoD1(config),
          materiaisOPME: extraDocs.materiaisOPME(config),
          examesPosOp: extraDocs.examesPosOp(config),
          relatorioConvenio: extraDocs.relatorioConvenio(config),
        }
      : null;
    return { ...base, ...extra };
  }, [procedure, config, extraDocs]);

  const copyToClipboard = useCallback((text: string, tabName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTab(tabName);
      toast.success("Copiado!");
      setTimeout(() => setCopiedTab(null), 2000);
    });
  }, []);

  const copyAll = useCallback(() => {
    if (!documents) return;
    const allText = Object.values(documents).join("\n\n" + "═".repeat(60) + "\n\n");
    navigator.clipboard.writeText(allText).then(() => {
      toast.success("Todos os documentos copiados!");
    });
  }, [documents]);

  const saveToHistory = useCallback(() => {
    if (!procedure) return;
    addToHistory({
      procedureId: procedure.id,
      procedureName: procedure.name,
      patientName: config.paciente || "Sem nome",
      date: config.data_cirurgia || new Date().toISOString().split("T")[0],
      config: { ...config },
    });
    toast.success("Salvo no histórico!");

    // Auto-create DJ timer if applicable
    if (config.duplo_j && config.duplo_j !== "Não implantado") {
      const insertionDate = config.data_cirurgia || new Date().toISOString().split("T")[0];
      const removalDate = new Date(insertionDate);
      removalDate.setDate(removalDate.getDate() + 21); // 3 weeks default
      addDJTimer({
        patientName: config.paciente || "Paciente",
        insertionDate,
        removalDate: removalDate.toISOString().split("T")[0],
        lateralidade: config.lateralidade || "",
        procedureId: procedure.id,
      });
      toast.info("Timer de DJ criado (retirada em 3 semanas).");
    }
  }, [procedure, config]);

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
                      <Input
                        value={config[field.id] || ""}
                        onChange={(e) => updateConfig(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="h-9 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      />
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
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                        onClick={() =>
                          copyToClipboard(
                            documents?.[tab.id as keyof typeof documents] || "",
                            tab.id
                          )
                        }
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
                    <div className="p-4">
                      <pre className="text-xs leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-mono)] text-foreground/90 bg-[oklch(16%_.035_247.3)] p-4 rounded-lg border border-border/50">
                        {documents?.[tab.id as keyof typeof documents] || "Documento não disponível para este procedimento."}
                      </pre>
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
