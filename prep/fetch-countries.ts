import { Client } from 'pg';
import 'dotenv/config.js';
import 'node:fs';
import { writeFile } from 'node:fs/promises';

async function main() {
  const client = new Client({
    user: process.env['DB_USER'],
    password: process.env['DB_PW'],
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '') ?? 5432,
    database: process.env['DB_DATABASE'],
  });

  await client.connect();

  const result = await client.query(`
    SELECT 
      gid, 
      code, 
      shapename as name, 
      ST_X(p1) as p1x,
      ST_Y(p1) as p1y,
      ST_X(p3) as p3x,
      ST_Y(p3) as p3y
    FROM countries
    WHERE shapetype = 'ADM0'
  `);

  const countries = result.rows.map((row) => ({
    id: row.gid,
    code: row.code,
    name: row.name,
    p1: {
      x: Number(row.p1x),
      y: Number(row.p1y),
    },
    p3: {
      x: Number(row.p3x),
      y: Number(row.p3y),
    },
  }));

  writeFile('static/data/countries.json', JSON.stringify(countries, null, 2));

  const continentsResult = await client.query(`
    SELECT json_agg(continent) AS continents
    FROM (
      SELECT
        regioncode AS code,
        region AS name,
        json_agg(code ORDER BY code) AS countries
      FROM countries
      WHERE shapetype = 'ADM0'
      GROUP BY regioncode, region
      ORDER BY region
    ) continent;
  `);

  const continents = continentsResult.rows[0].continents ?? [];

  writeFile('static/data/continents.json', JSON.stringify(continents, null, 2));

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
