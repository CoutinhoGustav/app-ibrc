const { Client } = require('pg');
// Pegando a URL direto do .env para testar exatamente o que o Nest está usando
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

console.log('Testando conexão com:', process.env.DATABASE_URL);

client.connect()
    .then(() => {
        console.log('✅ SUCESSO! O banco conectou corretamente.');
        process.exit(0);
    })
    .catch(err => {
        console.log('❌ ERRO DE CONEXÃO:');
        console.log('Mensagem:', err.message);
        console.log('Código:', err.code);
        if (err.message.includes('password authentication failed')) {
            console.log('👉 PROBLEMA: A senha "Coutinho98" ou o usuário no seu .env estão incorretos.');
        } else if (err.message.includes('does not exist')) {
            console.log('👉 PROBLEMA: O banco de dados ou o usuário não existem no seu PostgreSQL.');
        }
        process.exit(1);
    });
