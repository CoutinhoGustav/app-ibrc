Este guia são os conceitos solicitados, usando exemplos práticos baseados na estrutura do projeto.

1. API REST: O que é, como funciona e como usar
O que é? REST (Representational State Transfer) é um "estilo de arquitetura" para sistemas distribuídos. Uma API REST permite que dois sistemas se comuniquem usando o protocolo HTTP.

Como funciona?

Cliente (Seu Front-end): Faz um pedido (Request).
Servidor (Seu Back-end): Processa o pedido e envia uma resposta (Response).
Recursos: Tudo é tratado como um recurso (ex: /alunos, /turmas), identificado por uma URL única.
Como usar? Você usa verbos HTTP para dizer o que quer fazer com o recurso:

GET /turmas -> "Me dê a lista de turmas"
POST /turmas -> "Crie uma nova turma"
2. Webhook: Como funciona
Um Webhook é como um "Push Notification" para servidores.

API Comum: Você (Cliente) pergunta ao servidor: "Tem novidades?" (Polling).
Webhook: O servidor envia o dado para você assim que algo acontece.
Exemplo: Quando um pagamento é aprovado, o sistema de pagamento (Stripe/Mercado Pago) envia um POST para uma URL que você definiu no seu back-end avisando: "O pagamento X foi pago!".

3. Exemplo Prático: ViaCEP (JSON API)
Aqui está como você pode integrar o ViaCEP no seu projeto usando a estrutura de 
api.ts
 que você já tem:

typescript
// Exemplo de como adicionar ao seu ApiService (api.ts)
async buscarCep(cep: string) {
  // O ViaCEP retorna um JSON com os dados do endereço
  const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
  return response.data; // Aqui estão os dados recebidos
}
// Como usar no seu Componente (Front-end)
const handleCepSearch = async (cep: string) => {
  try {
    const dados = await apiService.buscarCep(cep);
    if (dados.erro) {
      console.log("CEP não encontrado");
    } else {
      console.log("Endereço:", dados.logradouro, dados.bairro);
      // Você retorna esses dados para o estado do seu formulário
    }
  } catch (error) {
    console.error("Erro na busca:", error);
  }
};
4. Postman e Insomnia
São ferramentas para testar APIs antes de escrever o código.

Como usar:

Crie uma Request: Escolha o método (GET, POST, etc).
Coloque a URL: ex: http://localhost:3000/api/auth/login.
Configue o Body (se necessário): Para POST/PUT, selecione "raw" e "JSON" e escreva o objeto: {"email": "...", "password": "..."}.
Headers: Adicione Content-Type: application/json.
Aperte "Send": Veja a resposta (status 200 OK, 401 Unauthorized, etc).
5. Métodos HTTP: Diferenças
Método	Objetivo	Exemplo no seu Projeto
GET	Ler/Recuperar dados	Buscar lista de alunos (
getAlunosByTurma
)
POST	Criar novos dados	Registrar novo aluno (
createAluno
)
PUT	Substituir um dado inteiro	Atualizar todos os campos de um perfil
PATCH	Atualizar campos específicos	Mudar só o status de um aluno (
updateAluno
)
DELETE	Remover um dado	Apagar um registro (
deleteRegistro
)
TIP

Use PATCH quando quiser alterar apenas uma parte do objeto, economizando banda e evitando sobrescrever dados que você não enviou.

6. Axios
O Axios é uma biblioteca para fazer as requisições HTTP que você já está usando no seu arquivo 
api.ts
.

Principais Vantagens:

Interceptores: Você usa isso para adicionar o Token JWT automaticamente em todas as chamadas (linhas 40-49 do seu 
api.ts
).
Transformação de Dados: Ele transforma automaticamente JSON em objetos JavaScript.
Suporte a Timestamps: Você configurou 10 segundos de timeout no seu código.
7. CORS (Cross-Origin Resource Sharing)
O que é? CORS é um mecanismo de segurança dos navegadores. Ele impede que um site (ex: meuapp.com) acesse dados de uma API em outro domínio (ex: minhaapi.com) a menos que o servidor da API explicitamente autorize.

Como funciona? O navegador faz uma "pre-request" (chamada OPTIONS) perguntando: "Ei API, este site pode te chamar?".

Se o servidor responder com o header Access-Control-Allow-Origin, o navegador deixa a requisição passar.
Se não, você verá o famoso erro: "Blocked by CORS policy".
Como resolver? Isso deve ser configurado no Back-end. Você define quais domínios (ou * para todos) podem acessar a API. No front-end, você não consegue "burlar" o CORS, é uma proteção do navegador do usuário.