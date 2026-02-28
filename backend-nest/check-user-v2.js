const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Coutinho98@127.0.0.1:5432/IBRC?sslmode=disable' });
async function check() {
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'User'");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}
check().catch(console.error);
