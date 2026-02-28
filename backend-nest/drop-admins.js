const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Coutinho98@localhost:5432/IBRC?sslmode=disable' });
async function run() {
    await client.connect();
    await client.query('DROP TABLE IF EXISTS admins CASCADE');
    console.log('REDUNDANT admins TABLE DROPPED');
    await client.end();
}
run().catch(console.error);
