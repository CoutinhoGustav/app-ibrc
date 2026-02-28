const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:Coutinho98@localhost:5432/IBRC?sslmode=disable' });
async function run() {
    await client.connect();
    // Renomeia a tabela de admins para User (com "U" maiúsculo conforme o @Entity('User'))
    await client.query('ALTER TABLE IF EXISTS admins RENAME TO "User"');
    // Garante que outras tabelas também sigam o padrão se necessário
    await client.query('ALTER TABLE IF EXISTS students RENAME TO "Aluno"');
    await client.query('ALTER TABLE IF EXISTS turmas RENAME TO "Turma"');
    console.log('TABLES RENAMED SUCCESSFULLY');
    await client.end();
}
run().catch(console.error);
