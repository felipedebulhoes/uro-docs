// Ingestão Lote OA 4 (CC BY): fig1 de hidrocele e prótese testicular + 5 figuras do dossiê USG Doppler peniano.
// Upload via Forge presigned PUT (mesmo fluxo de server/storage.ts) e upsert em atlas_figure_images.
import fs from "node:fs";
import crypto from "node:crypto";
import mysql from "mysql2/promise";

const FORGE_URL = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
const FORGE_KEY = process.env.BUILT_IN_FORGE_API_KEY;
const DB_URL = process.env.DATABASE_URL;
if (!FORGE_URL || !FORGE_KEY || !DB_URL) {
  console.error("Faltam variáveis de ambiente (FORGE/DATABASE_URL).");
  process.exit(1);
}

const DIR = "/home/ubuntu/atlas_lote4_work/ingest";

const CREDIT_SCIELO =
  "Fonte: ensaio iconográfico 'Avaliação ultrassonográfica do pênis', Radiologia Brasileira 51(4):247-251, 2018. DOI 10.1590/0100-3984.2016.0152. Licença CC BY 4.0.";
const SRC_SCIELO = "https://www.scielo.br/j/rb/a/5vLy37MfqHvrdKn5y34rTqQ/?lang=pt";

const items = [
  {
    atlasId: "hidrocelectomia-tecnicas-de-jaboulay-e-lord",
    figureIndex: 1,
    file: "hidrocele_fig1.jpg",
    credit:
      "Fonte: Saber A. Surgical management of hydrocele. Int Braz J Urol 2015;41(4):750-756. DOI 10.1590/S1677-5538.IBJU.2015.0033. Licença CC BY.",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4757005/",
  },
  {
    atlasId: "implante-de-protese-testicular",
    figureIndex: 1,
    file: "protese_fig1.jpg",
    credit:
      "Fonte: Chantzi A, et al. Children (Basel) 2025. Implante de prótese testicular (painéis A-C). Licença CC BY.",
    sourceUrl: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12190729/",
  },
  { atlasId: "usg-doppler-peniano", figureIndex: 0, file: "usg_fig0.jpg", credit: CREDIT_SCIELO, sourceUrl: SRC_SCIELO },
  { atlasId: "usg-doppler-peniano", figureIndex: 1, file: "usg_fig1.jpg", credit: CREDIT_SCIELO, sourceUrl: SRC_SCIELO },
  { atlasId: "usg-doppler-peniano", figureIndex: 2, file: "usg_fig2.jpg", credit: CREDIT_SCIELO, sourceUrl: SRC_SCIELO },
  { atlasId: "usg-doppler-peniano", figureIndex: 3, file: "usg_fig3.jpg", credit: CREDIT_SCIELO, sourceUrl: SRC_SCIELO },
  { atlasId: "usg-doppler-peniano", figureIndex: 4, file: "usg_fig4.jpg", credit: CREDIT_SCIELO, sourceUrl: SRC_SCIELO },
];

function hashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  return lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

async function storagePut(relKey, buffer, contentType) {
  const key = hashSuffix(relKey.replace(/^\/+/, ""));
  const presignUrl = new URL("v1/storage/presign/put", FORGE_URL + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, { headers: { Authorization: `Bearer ${FORGE_KEY}` } });
  if (!presignResp.ok) throw new Error(`presign falhou ${presignResp.status}: ${await presignResp.text()}`);
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("presign URL vazia");
  const up = await fetch(s3Url, { method: "PUT", headers: { "Content-Type": contentType }, body: new Blob([buffer], { type: contentType }) });
  if (!up.ok) throw new Error(`upload S3 falhou ${up.status}`);
  return { key, url: `/manus-storage/${key}` };
}

const conn = await mysql.createConnection(DB_URL + (DB_URL.includes("?") ? "&" : "?") + "ssl={\"rejectUnauthorized\":true}");

for (const it of items) {
  const buf = fs.readFileSync(`${DIR}/${it.file}`);
  const relKey = `atlas/${it.atlasId}/fig-${it.figureIndex}.jpg`;
  const { key, url } = await storagePut(relKey, buf, "image/jpeg");

  const [rows] = await conn.execute(
    "SELECT id FROM atlas_figure_images WHERE atlasId = ? AND figureIndex = ?",
    [it.atlasId, it.figureIndex]
  );
  if (rows.length > 0) {
    await conn.execute(
      "UPDATE atlas_figure_images SET storageKey=?, url=?, credit=?, sourceUrl=?, mimeType=? WHERE atlasId=? AND figureIndex=?",
      [key, url, it.credit, it.sourceUrl, "image/jpeg", it.atlasId, it.figureIndex]
    );
    console.log(`UPDATE ${it.atlasId} fig${it.figureIndex} -> ${url}`);
  } else {
    await conn.execute(
      "INSERT INTO atlas_figure_images (atlasId, figureIndex, storageKey, url, credit, sourceUrl, mimeType) VALUES (?,?,?,?,?,?,?)",
      [it.atlasId, it.figureIndex, key, url, it.credit, it.sourceUrl, "image/jpeg"]
    );
    console.log(`INSERT ${it.atlasId} fig${it.figureIndex} -> ${url}`);
  }
}

await conn.end();
console.log("Ingestão concluída.");
