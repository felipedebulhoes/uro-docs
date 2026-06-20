#!/usr/bin/env python3
"""Insert 'calculated' field into terapia-expulsiva configFields."""
import re

with open("client/src/data/proceduresExtra.ts", "r", encoding="utf-8") as f:
    content = f.read()

# The calculated field to insert — after the last configField (retorno) and before the closing ],
calc_field = """,
      {
        id: "calc_expulsao",
        label: "Calculadora de Expulsão",
        type: "calculated" as const,
        defaultValue: "",
        calculate: (c: Record<string, string>) => {
          const tam = parseFloat(c.tamanho) || 0;
          const loc = c.localizacao || "";

          // Evidence matrix: Hollingsworth JM et al. JAMA 2016;315(19):2104
          // EAU Urolithiasis Guidelines 2024 (Türk et al.)
          // Rows: size bands; Cols: location (distal/medio/proximal)
          type Band = { maxSize: number; distal: number; medio: number; proximal: number };
          const matrix: Band[] = [
            { maxSize: 4,  distal: 87, medio: 76, proximal: 63 },
            { maxSize: 6,  distal: 74, medio: 60, proximal: 48 },
            { maxSize: 8,  distal: 55, medio: 42, proximal: 32 },
            { maxSize: 10, distal: 40, medio: 30, proximal: 22 },
            { maxSize: 99, distal: 20, medio: 15, proximal: 10 },
          ];

          const isDistal  = loc.includes("distal") || loc.includes("JUV");
          const isProx    = loc.includes("proximal");
          const band      = matrix.find(b => tam <= b.maxSize) ?? matrix[matrix.length - 1];
          const prob      = isDistal ? band.distal : isProx ? band.proximal : band.medio;

          // Time estimate
          let timeEstimate = "";
          if (prob >= 75)      timeEstimate = "1–2 semanas";
          else if (prob >= 55) timeEstimate = "2–3 semanas";
          else if (prob >= 35) timeEstimate = "3–4 semanas";
          else                 timeEstimate = "> 4 semanas (baixa chance)";

          // Color
          const color: "green" | "yellow" | "orange" | "red" =
            prob >= 70 ? "green" : prob >= 50 ? "yellow" : prob >= 30 ? "orange" : "red";

          // Recommendation
          let recommendation = "";
          if (prob >= 70)
            recommendation = "Terapia expulsiva indicada. Alta probabilidade de passagem espontânea.";
          else if (prob >= 50)
            recommendation = "Terapia expulsiva razoável. Reavalie em 4 semanas com imagem.";
          else if (prob >= 30)
            recommendation = "Chance moderada. Considere intervenção se dor refratária ou obstrução progressiva.";
          else
            recommendation = "Baixa probabilidade de expulsão espontânea. Discutir intervenção precoce.";

          const locLabel = isDistal ? "distal (JUV)" : isProx ? "proximal" : "médio";

          return {
            probability: prob,
            probLabel: `~${prob}%`,
            timeEstimate,
            recommendation,
            color,
            details: [
              \`Tamanho: ${tam > 0 ? tam + " mm" : "não informado"}\`,
              \`Localização: ureter ${locLabel}\`,
              \`Taxa de expulsão (Hollingsworth 2016 / EAU 2024): ~${prob}%\`,
              \`Tempo médio estimado: ${timeEstimate}\`,
            ],
          };
        },
      }"""

# Find the closing of configFields array in terapia-expulsiva
# We look for the retorno field closing and then the ],
old = """      { id: "retorno", label: "Retorno para Reavalia\\u00e7\\u00e3o", type: "select", options: ["2 semanas", "4 semanas", "6 semanas"], defaultValue: "4 semanas" },
    ],"""

# The actual text in the file uses unicode escapes
old_actual = '      { id: "retorno", label: "Retorno para Reavalia\u00e7\u00e3o", type: "select", options: ["2 semanas", "4 semanas", "6 semanas"], defaultValue: "4 semanas" },\n    ],'

new_actual = '      { id: "retorno", label: "Retorno para Reavalia\u00e7\u00e3o", type: "select", options: ["2 semanas", "4 semanas", "6 semanas"], defaultValue: "4 semanas" }' + calc_field + '\n    ],'

if old_actual in content:
    content = content.replace(old_actual, new_actual, 1)
    print("Replacement successful.")
else:
    # Try to find the retorno line and the closing bracket
    idx = content.find('"retorno"')
    if idx == -1:
        print("ERROR: retorno field not found")
    else:
        # Find the closing ], after retorno
        close_idx = content.find('],', idx)
        if close_idx == -1:
            print("ERROR: closing ], not found after retorno")
        else:
            # Find the end of the retorno line
            line_end = content.find('\n', idx)
            # Insert calc_field before the closing ],
            content = content[:line_end] + calc_field + '\n    ],' + content[close_idx+2:]
            print(f"Fallback replacement at index {close_idx}")

with open("client/src/data/proceduresExtra.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Done.")
