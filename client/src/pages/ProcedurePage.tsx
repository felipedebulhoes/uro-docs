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
import {
  ArrowLeft,
  ClipboardCopy,
  FileText,
  Pill,
  Stethoscope,
  HeartPulse,
  CheckCircle2,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { useParams, Link } from "wouter";
import { toast } from "sonner";

export default function ProcedurePage() {
  const params = useParams<{ id: string }>();
  const procedure = procedures.find((p) => p.id === params.id);

  const [config, setConfig] = useState<Record<string, string>>(() => {
    if (!procedure) return {};
    const defaults: Record<string, string> = {};
    procedure.configFields.forEach((field) => {
      defaults[field.id] = field.defaultValue;
    });
    return defaults;
  });

  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const updateConfig = useCallback((fieldId: string, value: string) => {
    setConfig((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const documents = useMemo(() => {
    if (!procedure) return null;
    return {
      descricao: procedure.templates.descricao(config),
      posOperatorio: procedure.templates.posOperatorio(config),
      receitaAlta: procedure.templates.receitaAlta(config),
      orientacoes: procedure.templates.orientacoes(config),
    };
  }, [procedure, config]);

  const copyToClipboard = useCallback(
    (text: string, tabName: string) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedTab(tabName);
        toast.success("Copiado para a área de transferência!");
        setTimeout(() => setCopiedTab(null), 2000);
      });
    },
    []
  );

  if (!procedure) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Procedimento não encontrado.
          </p>
          <Link href="/">
            <Button variant="outline">Voltar ao Início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "descricao", label: "Descrição", icon: FileText },
    { id: "posOperatorio", label: "PO Imediato", icon: HeartPulse },
    { id: "receitaAlta", label: "Receita", icon: Pill },
    { id: "orientacoes", label: "Orientações", icon: Stethoscope },
  ];

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
            <Badge
              variant="outline"
              className="ml-auto text-[10px] border-primary/30 text-primary bg-primary/5 shrink-0"
            >
              {procedure.category}
            </Badge>
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
              </div>
            </Card>
          </div>

          {/* Documents Panel */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="descricao" className="w-full">
              <TabsList className="w-full bg-card border border-border h-auto p-1 grid grid-cols-4 gap-1">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="text-xs py-2 px-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border-primary/30 flex flex-col sm:flex-row items-center gap-1 text-muted-foreground"
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-[10px]">
                      {tab.label.split(" ")[0]}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
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
                      <pre className="text-xs leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-mono)] text-foreground/90 bg-nilo-dark p-4 rounded-lg border border-border/50">
                        {documents?.[tab.id as keyof typeof documents]}
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
