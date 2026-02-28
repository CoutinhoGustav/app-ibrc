const axios = require('axios');

const BASE_URL = 'http://192.168.0.60:3002/api';

async function test() {
    console.log("--- TESTING REAL DATA FETCH ---");

    try {
        console.log("\n1. Testing /turmas...");
        const turmasRes = await axios.get(`${BASE_URL}/turmas`);
        console.log("Status:", turmasRes.status);
        console.log("Full turmas list:", turmasRes.data.data.map(t => t.name).join(", "));

        if (turmasRes.data.data.length > 0) {
            const firstTurma = turmasRes.data.data[0].id;
            console.log(`\n2. Testing /turmas/${firstTurma}/alunos...`);
            const alumnosRes = await axios.get(`${BASE_URL}/turmas/${encodeURIComponent(firstTurma)}/alunos`);
            console.log("Status:", alumnosRes.status);
            console.log("Student count:", alumnosRes.data.data.length);
            console.log("Student sample:", JSON.stringify(alumnosRes.data.data.slice(0, 2), null, 2));
        }

        console.log("\n3. Testing /registros...");
        const registrosRes = await axios.get(`${BASE_URL}/registros`);
        console.log("Status:", registrosRes.status);
        console.log("Record count:", registrosRes.data.data.length);

        console.log("\n4. Testing POST /turmas/Sem Turma/alunos...");
        try {
            const createRes = await axios.post(`${BASE_URL}/turmas/Sem%20Turma/alunos`, {
                nome: "Teste Aluno Novo",
                status: "ativo"
            });
            console.log("Status:", createRes.status);
            console.log("Created student:", createRes.data.data.name);
        } catch (postErr) {
            console.error("POST failed:", postErr.message);
            if (postErr.response) console.error("Response:", postErr.response.data);
        }

    } catch (e) {
        console.error("Test failed:", e.message);
        if (e.response) console.error("Response:", e.response.data);
    }
}

test();
