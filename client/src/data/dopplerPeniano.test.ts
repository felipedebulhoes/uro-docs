import { describe, it, expect } from "vitest";
import { classificarDopplerPeniano } from "./proceduresExtra";

describe("classificarDopplerPeniano", () => {
  it("classifica insuficiência arterial quando PSV < 25", () => {
    const r = classificarDopplerPeniano("18", "2");
    expect(r).toMatch(/INSUFICI[ÊE]NCIA ARTERIAL/i);
  });

  it("classifica inflow indeterminado/limítrofe quando 25 <= PSV < 35", () => {
    const r = classificarDopplerPeniano("30", "3");
    expect(r).toMatch(/INDETERMINADO\/LIM[ÍI]TROFE/i);
  });

  it("classifica venous leak quando PSV >= 35 e EDV > 5", () => {
    const r = classificarDopplerPeniano("40", "8");
    expect(r).toMatch(/VENO-OCLUSIVA|venous leak/i);
  });

  it("classifica normalidade quando PSV >= 35 e EDV <= 5", () => {
    const r = classificarDopplerPeniano("38", "3");
    expect(r).toMatch(/DENTRO DA NORMALIDADE/i);
  });

  it("limite exato: PSV = 35 e EDV = 5 é normal (EDV não > 5)", () => {
    const r = classificarDopplerPeniano("35", "5");
    expect(r).toMatch(/DENTRO DA NORMALIDADE/i);
  });

  it("aceita vírgula decimal no RI/EDV/PSV", () => {
    const r = classificarDopplerPeniano("40,0", "6,2");
    expect(r).toMatch(/VENO-OCLUSIVA|venous leak/i);
  });

  it("PSV ausente retorna mensagem de indisponibilidade", () => {
    const r = classificarDopplerPeniano("", "4");
    expect(r).toMatch(/indispon[íi]vel/i);
  });

  it("PSV normal sem EDV pede o EDV", () => {
    const r = classificarDopplerPeniano("40", "");
    expect(r).toMatch(/Informe o EDV/i);
  });

  it("EDV elevado com PSV indeterminado traz ressalva de interpretação", () => {
    const r = classificarDopplerPeniano("30", "9");
    expect(r).toMatch(/interpret[áa]vel.*PSV normal|PSV normal/i);
  });

  it("ignora unidades e texto, extraindo número (ex.: '38 cm/s')", () => {
    const r = classificarDopplerPeniano("38 cm/s", "3 cm/s");
    expect(r).toMatch(/DENTRO DA NORMALIDADE/i);
  });
});
