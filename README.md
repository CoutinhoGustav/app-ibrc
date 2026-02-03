# 📖 App IBRC - Integração API NestJS

**Status:** ✅ Pronto para usar  
**Versão:** 1.0.0  
**Data:** Fevereiro 2026

---

## 🚀 Começar em 60 Segundos

```bash
# 1. Limpar cache
npm start --clear

# 2. Credenciais de teste
Email: admin@ibrc.com.br
Senha: 123456

# 3. Pronto! ✅
```

---

## 📦 O Que Você Tem?

✅ **API Service com mock** - Funciona sem backend  
✅ **Autenticação JWT** - Login/logout com tokens  
✅ **CRUD Completo** - Registros e Alunos  
✅ **Sem dependências extras** - Pronto para usar  
✅ **Fácil mudar para backend real** - Basta alterar .env

---

## 🧪 Como Usar - Hooks

### useAuth() - Autenticação

```typescript
import { useAuth } from "@/context/AuthContext";

const { user, login, logout, loading, error } = useAuth();

// Login
await login("admin@ibrc.com.br", "123456");

// Logout
await logout();

// Usuário atual
console.log(user.name, user.email);

// Atualizar perfil
await updateUser({ name: "Novo Nome" });
```

### useData() - Registros e Alunos

```typescript
import { useData } from "@/context/DataContext";

const {
  registros, // Lista de registros
  alunosData, // { turma: [alunos] }
  loading,
  error,
  // CRUD Registros
  addRegistro,
  updateRegistro,
  removeRegistro,
  // CRUD Alunos
  getAlunosByTurma,
  addAluno,
  updateAluno,
  removeAluno,
  // Recarregar
  refetchRegistros,
  refetchAlunos,
} = useData();
```

---

## 📝 Exemplos de Código

### Login

```typescript
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      // Vai para home
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button
        onPress={handleLogin}
        disabled={loading}
        title={loading ? 'Entrando...' : 'Entrar'}
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

### Listar Registros

```typescript
import { useData } from '@/context/DataContext';

export default function HomeScreen() {
  const { registros, loading, error, refetchRegistros } = useData();

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Erro: {error}</Text>;

  return (
    <FlatList
      data={registros}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item.turma}</Text>
          <Text>Professor: {item.professor}</Text>
          <Text>Presentes: {item.presentes}/{item.total}</Text>
        </View>
      )}
      refreshing={loading}
      onRefresh={refetchRegistros}
    />
  );
}
```

### Criar Registro

```typescript
const { addRegistro } = useData();

const handleAdd = async () => {
  try {
    await addRegistro({
      turma: 'Berçário',
      professor: 'Ana Paula',
      data: '01/02/2026',
      presentes: 2,
      total: 5,
      visitantes: 'Maria',
    });
    Alert.alert('Sucesso', 'Registro criado!');
  } catch (err) {
    Alert.alert('Erro', 'Falha ao criar');
  }
};

<Button onPress={handleAdd} title="Novo Registro" />
```

### Adicionar Aluno

```typescript
const { addAluno, loading } = useData();

const handleAdd = async () => {
  try {
    await addAluno('Berçário', 'Maria Silva');
    Alert.alert('Sucesso', 'Aluno adicionado!');
  } catch (err) {
    Alert.alert('Erro', 'Falha ao adicionar');
  }
};

<Button
  onPress={handleAdd}
  disabled={loading}
  title="Adicionar Aluno"
/>
```

### Listar Alunos por Turma

```typescript
const { alunosData } = useData();

const turmas = ['Berçário', 'Maternal', 'Principiantes', ...];

return (
  <>
    {turmas.map((turma) => (
      <View key={turma}>
        <Text style={{ fontWeight: 'bold' }}>{turma}</Text>
        {alunosData[turma]?.map((aluno, idx) => (
          <Text key={idx}>{aluno}</Text>
        ))}
      </View>
    ))}
  </>
);
```

### Editar Aluno

```typescript
const { updateAluno } = useData();

const handleUpdate = async (turma, index, novoNome) => {
  try {
    await updateAluno(turma, index, novoNome);
    Alert.alert("Sucesso", "Aluno atualizado!");
  } catch (err) {
    Alert.alert("Erro", "Falha ao atualizar");
  }
};
```

### Remover Aluno

```typescript
const { removeAluno } = useData();

const handleRemove = async (turma, index) => {
  try {
    await removeAluno(turma, index);
    Alert.alert("Sucesso", "Aluno removido!");
  } catch (err) {
    Alert.alert("Erro", "Falha ao remover");
  }
};
```

### Deletar Registro

```typescript
const { removeRegistro } = useData();

const handleDelete = async (id) => {
  try {
    await removeRegistro(id);
    Alert.alert("Sucesso", "Registro deletado!");
  } catch (err) {
    Alert.alert("Erro", "Falha ao deletar");
  }
};
```

---

## 🎨 Padrão Recomendado - Componente com Loading/Error

```typescript
import { useData } from '@/context/DataContext';
import { ActivityIndicator } from 'react-native';

export default function MyScreen() {
  const { registros, loading, error, refetchRegistros } = useData();

  // Loading
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Error
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', marginBottom: 20 }}>Erro: {error}</Text>
        <Button onPress={refetchRegistros} title="Tentar Novamente" />
      </View>
    );
  }

  // Sem dados
  if (registros.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Nenhum registro</Text>
      </View>
    );
  }

  // Sucesso
  return (
    <FlatList
      data={registros}
      renderItem={({ item }) => <RegistroCard registro={item} />}
      keyExtractor={(item) => item.id.toString()}
      refreshing={loading}
      onRefresh={refetchRegistros}
    />
  );
}
```

---

## 🔐 Dados Mockados (Para Teste)

### Credenciais

```
Email: admin@ibrc.com.br
Senha: 123456
```

### Registros (7 turmas)

- Berçário (Ana Paula) - 1/5 presentes
- Maternal (Carla Souza) - 3/3 presentes
- Principiantes (Rafael Lima) - 7/7 presentes
- Juniores (Marcos Silva) - 9/9 presentes
- Intermediários (Luciana Rocha) - 10/10 presentes
- Jovens (João Paulo) - 12/12 presentes
- Adultos (Maria Silva) - 40/40 presentes

### Alunos por Turma

```
Berçário: 5 alunos
Maternal: 3 alunos
Principiantes: 7 alunos
Juniores: 9 alunos
Intermediários: 10 alunos
Jovens: 12 alunos
Adultos: 40 alunos
```

---

## 🔄 Alternância Mock ↔ Backend Real

### Modo Mock (Desenvolvimento)

Edite `.env.local`:

```env
EXPO_PUBLIC_USE_MOCK=true
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Execute:

```bash
npm start --clear
```

### Modo Backend Real

1. Edite `.env.local`:

```env
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

2. Inicie o backend NestJS:

```bash
cd backend-ibrc
npm run start:dev
```

3. Reinicie o frontend:

```bash
npm start --clear
```

---

## 📡 Endpoints Disponíveis

### Autenticação

- `POST /auth/login` - Login
- `POST /auth/register` - Registrar
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Perfil do usuário
- `PATCH /auth/profile` - Atualizar perfil
- `DELETE /auth/account` - Deletar conta

### Registros

- `GET /registros` - Listar (com paginação)
- `GET /registros/:id` - Buscar um
- `POST /registros` - Criar
- `PATCH /registros/:id` - Atualizar
- `DELETE /registros/:id` - Deletar
- `GET /registros/search` - Buscar

### Turmas

- `GET /turmas` - Listar
- `GET /turmas/:id` - Detalhes
- `GET /turmas/:id/alunos` - Alunos da turma

### Alunos

- `POST /turmas/:id/alunos` - Criar
- `PATCH /turmas/:id/alunos/:nome` - Atualizar
- `DELETE /turmas/:id/alunos/:nome` - Deletar

---

## 🛠️ Estrutura de Resposta API

### Login Response

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "Admin IBRC",
    "email": "admin@ibrc.com.br",
    "role": "admin"
  },
  "accessToken": "token...",
  "refreshToken": "token..."
}
```

### Registros Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "turmaName": "Berçário",
      "professorNome": "Ana Paula",
      "dataRegistro": "2023-10-15",
      "presentes": 2,
      "total": 5,
      "visitantes": "Maria"
    }
  ]
}
```

### Alunos Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Ana Clara",
      "turmaId": 1,
      "ativo": true
    }
  ]
}
```

---

## 🧪 Como Testar

### Teste 1: Login

1. Abra app
2. Vá para login
3. Use: `admin@ibrc.com.br` / `123456`
4. ✅ Deve fazer login

### Teste 2: Registros

1. Vá para Home
2. Deve aparecer 7 registros
3. Puxe para baixo (refresh)
4. ✅ Dados devem recarregar

### Teste 3: Alunos

1. Vá para Turmas
2. Deve aparecer alunos de cada turma
3. ✅ Alunos devem estar em ordem alfabética

### Teste 4: Criar Registro

1. Clique em "Novo Registro"
2. Preencha dados
3. Clique "Salvar"
4. ✅ Novo registro deve aparecer na lista

### Teste 5: Adicionar Aluno

1. Vá para Turmas
2. Clique em "Adicionar Aluno"
3. Digite nome
4. ✅ Aluno deve aparecer na turma

### Teste 6: Editar Registro

1. Clique em um registro
2. Altere dados
3. Clique "Salvar"
4. ✅ Registro deve atualizar

### Teste 7: Deletar Registro

1. Clique em um registro
2. Clique "Deletar"
3. ✅ Registro deve desaparecer

### Teste 8: Logout

1. Vá para Config
2. Clique "Sair"
3. ✅ Deve voltar para login

---

## 🐛 Troubleshooting

| Problema                   | Solução                                                  |
| -------------------------- | -------------------------------------------------------- |
| Erro ao fazer login        | Verifique credenciais: `admin@ibrc.com.br` / `123456`    |
| Dados não carregam         | Execute `npm start --clear`                              |
| Token inválido             | Limpe AsyncStorage via Expo DevTools                     |
| Nenhum dado no mock        | Verifique se `EXPO_PUBLIC_USE_MOCK=true` no `.env.local` |
| Erro de tipagem TypeScript | Execute `npm install` para atualizar tipos               |
| Componente não renderiza   | Verifique se está dentro de `<DataProvider>`             |
| useData retorna undefined  | Confirme que está sendo usado dentro do Provider         |
| AsyncStorage vazio         | Faça login novamente, dados serão salvos                 |

---

## ✅ Checklist Rápido

- [ ] `npm start --clear` executado
- [ ] App abriu
- [ ] Login funcionou
- [ ] Registros aparecem
- [ ] Alunos aparecem
- [ ] CRUD funciona
- [ ] Logout funciona

**Tudo OK?** Você está pronto! ✅

---

## 📂 Arquivos Criados/Modificados

### Novos Arquivos

- `lib/api.ts` - API Service (580 linhas)
- `.env.local` - Variáveis de ambiente

### Modificados

- `context/AuthContext.tsx` - Com integração API
- `context/DataContext.tsx` - Com integração API

### Mantidos

- `babel.config.js` - Sem mudanças
- `global.css` - Sem mudanças

---

## 🔒 Segurança

### ✅ Implementado

- JWT automaticamente adicionado em requests
- Refresh token renovado em 401
- Tokens salvos em AsyncStorage
- Logout remove tokens
- Interceptor de erro para 401

### ⚠️ Futuro (Opcional)

- Encrypted AsyncStorage
- Token expiration check
- Certificate pinning

---

## 📋 Padrão de Projeto

```
Frontend (React Native)
    ↓
[Screens] → Usa hooks
    ↓
[Hooks: useAuth, useData] → Contextos
    ↓
[Contextos] → ApiService
    ↓
[apiService (lib/api.ts)] → Axios + Interceptors
    ↓
[Mock ou Backend NestJS] ← Toggleável via .env
```

---

## 🎯 Próximas Tarefas

### Hoje

1. [ ] Execute `npm start --clear`
2. [ ] Teste login com mock
3. [ ] Valide registros
4. [ ] Teste um CRUD

### Esta Semana

1. [ ] Integre useAuth em suas telas
2. [ ] Integre useData em suas telas
3. [ ] Teste todos endpoints
4. [ ] Execute CHECKLIST_VALIDACAO.md

### Próximas Semanas

1. [ ] Implemente backend NestJS
2. [ ] Conecte endpoints reais
3. [ ] Mude `EXPO_PUBLIC_USE_MOCK=false`
4. [ ] Teste com backend real

---

## 🆘 Precisa de Ajuda?

### Não consegue fazer login?

- Verifique se `EXPO_PUBLIC_USE_MOCK=true` no `.env.local`
- Credenciais: `admin@ibrc.com.br` / `123456`

### Dados não carregam?

- Execute `npm start --clear`
- Verifique console para erros

### Erro de tipo TypeScript?

- Execute `npm install`

### useData não funciona?

- Confirme que está dentro de `<DataProvider>`

### Precisa de exemplo?

- Veja a seção "Exemplos de Código" acima

---

## 💡 Dicas Importantes

1. **Sempre fazer `npm start --clear`** quando mudar `.env.local`
2. **Tokens são renovados automaticamente** em 401
3. **Mock funciona sem backend rodando** - perfeito para dev
4. **Dados mockados são realistas** - bom para testes
5. **Fácil mudar para backend real** - basta alterar variável

---

## 📞 Links Úteis

- **Axios Docs:** https://axios-http.com/
- **React Context:** https://react.dev/reference/react/useContext
- **AsyncStorage:** https://react-native-async-storage.github.io/
- **Expo Router:** https://docs.expo.dev/routing/introduction/
- **NestJS:** https://docs.nestjs.com/

---

## 🎉 Pronto Para Usar!

Você tem:

- ✅ API Service completo com mock
- ✅ Autenticação JWT funcional
- ✅ CRUD de Registros pronto
- ✅ CRUD de Alunos pronto
- ✅ Código pronto para copiar
- ✅ Tudo sem dependências extras

### Comece agora: `npm start --clear`

---

**Gerado:** Fevereiro 2026  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Usar
