const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Coutinho98@127.0.0.1:5432/IBRC?sslmode=disable' });
async function check() {
    await client.connect();
    const res = await client.query("SELECT extname FROM pg_extension");
    console.log(JSON.stringify(res.rows.map(r => r.extname), null, 2));
    // Também tenta habilitar se faltar
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('EXTENSION uuid-ossp ENSURED');
    await client.end();
}
check().catch(console.error);
