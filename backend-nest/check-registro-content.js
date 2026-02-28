const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Coutinho98@localhost:5432/IBRC?sslmode=disable' });
async function check() {
    await client.connect();
    const res = await client.query('SELECT * FROM "Registro"');
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}
check().catch(console.error);
