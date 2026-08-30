import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = process.argv[2] ?? "/home/ubuntu/webdev-static-assets/atlas-batch-01";
const manifest = await readFile(path.join(outputDirectory, "figure-downloads.tsv"), "utf8");
const records = manifest.trim().split("\n").map((line) => line.split("\t"));

await mkdir(outputDirectory, { recursive: true });

for (const [entryId, filename, pmcid, figureId] of records) {
  try {
    const articleUrl = `https://pmc.ncbi.nlm.nih.gov/articles/${pmcid}/`;
    const articleResponse = await fetch(articleUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!articleResponse.ok) throw new Error(`artigo indisponível (${articleResponse.status})`);

    const html = await articleResponse.text();
    const number = figureId.replace(/\D/g, "");
    const ids = [figureId, `Fig${number}`, `fig${number}`, `F${number}`];
    const figureMatch = ids
      .map((id) => html.match(new RegExp(`<figure[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/figure>`, "i")))
      .find(Boolean) ?? [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi)][Number(number) - 1];
    const sourceMatch = figureMatch?.[0].match(/<img[^>]+src="([^"]+)"/i);
    if (!sourceMatch) throw new Error(`figura ${figureId} não encontrada`);

    const imageUrl = sourceMatch[1].replace(/&amp;/g, "&");
    const imageResponse = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: articleUrl },
    });
    if (!imageResponse.ok) throw new Error(`imagem indisponível (${imageResponse.status})`);

    const contentType = imageResponse.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      throw new Error(`fonte não retornou imagem (${contentType || "tipo ausente"})`);
    }

    await writeFile(path.join(outputDirectory, filename), Buffer.from(await imageResponse.arrayBuffer()));
    console.log(`${entryId}\t${filename}\t${imageUrl}`);
  } catch (error) {
    console.error(`${entryId}\tERRO\t${error instanceof Error ? error.message : String(error)}`);
  }
}
