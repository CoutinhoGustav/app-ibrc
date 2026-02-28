const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Coutinho98@localhost:5432/IBRC?sslmode=disable' });
async function check() {
    await client.connect();

    const tables = ['students', 'Aluno', 'registros', 'Registro', 'Turma', 'admins', 'User'];

    for (const table of tables) {
        try {
            const count = await client.query(`SELECT count(*) FROM "${table}"`);
            console.log(`\n--- TABLE: ${table} (Rows: ${count.rows[0].count}) ---`);
            const columns = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(columns.rows.map(c => `${c.column_name} (${c.data_type})`).join(", "));
        } catch (e) {
            console.log(`\n--- TABLE: ${table} (Does not exist or error) ---`);
        }
    }

    await client.end();
}
check().catch(console.error);
