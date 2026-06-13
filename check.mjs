import 'dotenv/config';
import mysql from 'mysql2/promise';
const conn = await mysql.createConnection(process.env.DATABASE_URL);
const ids = ['vasectomia-tecnica-sem-bisturi','varicocelectomia-subinguinal-microcirurgica','implante-de-protese-testicular'];
for (const id of ids){
  const [rows] = await conn.query('SELECT figureIndex FROM atlas_figure_images WHERE atlasId=? ORDER BY figureIndex',[id]);
  console.log(id, '=>', rows.map(r=>r.figureIndex).join(','));
}
await conn.end();
