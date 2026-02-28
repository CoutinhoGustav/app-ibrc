const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Coutinho98@localhost:5432/IBRC?sslmode=disable' });
async function check() {
    await client.connect();

    console.log("--- TABLES ---");
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(tables.rows.map(r => r.table_name).join(", "));

    for (const table of tables.rows) {
        console.log(`\n--- TABLE: ${table.table_name} ---`);
        const columns = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table.table_name}'`);
        console.log(columns.rows);

        const count = await client.query(`SELECT count(*) FROM "${table.table_name}"`);
        console.log(`Row count: ${count.rows[0].count}`);
    }

    await client.end();
}
check().catch(console.error);
