const os = require('os');
const fs = require('fs');
const path = require('path');
const localtunnel = require('localtunnel');
const ip = require('ip');

const mode = process.argv.includes('--tunnel') ? 'tunnel' : 'local';
const port = 3002;
const envPath = path.join(__dirname, '../.env.local');

async function updateEnv(newUrl) {
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, '');
    }

    let content = fs.readFileSync(envPath, 'utf8');
    const regex = /^EXPO_PUBLIC_API_URL=.*$/m;
    const newLine = `EXPO_PUBLIC_API_URL=${newUrl}`;

    if (regex.test(content)) {
        content = content.replace(regex, newLine);
    } else {
        content += `\n${newLine}\n`;
    }

    fs.writeFileSync(envPath, content);
    console.log(`\n✅ .env.local atualizado com: ${newUrl}`);
}

async function run() {
    console.log(`🚀 Configurando backend em modo: ${mode.toUpperCase()}`);

    if (mode === 'local') {
        const localIP = ip.address();
        const url = `http://${localIP}:${port}/api/`;
        console.log(`📡 IP Local detectado: ${localIP}`);
        await updateEnv(url);
        console.log(`\n👉 O backend deve estar rodando em: http://localhost:${port}`);
        console.log(`👉 Dispositivos na mesma rede devem usar: ${url}`);
        process.exit(0);
    } else {
        try {
            console.log('🔗 Criando túnel com localtunnel...');
            const tunnel = await localtunnel({ port });

            console.log(`\n✨ Túnel Criado: ${tunnel.url}`);
            const url = `${tunnel.url.endsWith('/') ? tunnel.url : tunnel.url + '/'}api/`;

            await updateEnv(url);

            console.log('\n⚠️  Mantenha este processo rodando para o túnel continuar ativo.');
            console.log('⚠️  Se o túnel cair, rode este comando novamente.');

            tunnel.on('close', () => {
                console.log('\n❌ O túnel foi fechado.');
                process.exit(1);
            });

            // Keep process alive
            process.stdin.resume();
        } catch (err) {
            console.error('\n❌ Erro ao criar túnel:', err);
            process.exit(1);
        }
    }
}

run();
