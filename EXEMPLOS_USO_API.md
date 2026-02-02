# 📚 Exemplos de Uso - API Integration

## 1️⃣ Autenticação

### Login com Mock

```typescript
// app/login.tsx
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
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

// Credenciais de teste (mock):
// Email: admin@ibrc.com.br
// Senha: 123456
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  router.replace('/login');
};

<Button onPress={handleLogout} title="Sair" />
```

### Atualizar Perfil

```typescript
const { updateUser, user } = useAuth();

const handleUpdateProfile = async () => {
  try {
    await updateUser({
      name: "Novo Nome",
      email: "novo@ibrc.com.br",
    });
    Alert.alert("Sucesso", "Perfil atualizado!");
  } catch (err) {
    Alert.alert("Erro", "Falha ao atualizar perfil");
  }
};
```

---

## 2️⃣ Registros (Attendance Records)

### Listar Registros

```typescript
// app/(tabs)/index.tsx
import { useData } from '@/context/DataContext';

export default function HomeScreen() {
  const { registros, loading, error, refetchRegistros } = useData();

  useEffect(() => {
    refetchRegistros();
  }, []);

  if (loading) return <Text>Carregando...</Text>;
  if (error) return <Text>Erro: {error}</Text>;

  return (
    <FlatList
      data={registros}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text style={{ fontWeight: 'bold' }}>{item.turma}</Text>
          <Text>Professor: {item.professor}</Text>
          <Text>Presentes: {item.presentes}/{item.total}</Text>
          <Text>Data: {item.data}</Text>
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
const { addRegistro, loading, error } = useData();

const handleCreateRegistro = async () => {
  try {
    await addRegistro({
      turma: 'Berçário',
      professor: 'Ana Paula',
      data: '01/02/2026',
      presentes: 2,
      total: 5,
      visitantes: 'Maria Silva',
    });
    Alert.alert('Sucesso', 'Registro criado!');
  } catch (err) {
    Alert.alert('Erro', 'Falha ao criar registro');
  }
};

<Button
  onPress={handleCreateRegistro}
  disabled={loading}
  title="Novo Registro"
/>
```

### Atualizar Registro

```typescript
const { updateRegistro } = useData();

const handleUpdateRegistro = async (registro) => {
  try {
    await updateRegistro({
      ...registro,
      presentes: registro.presentes + 1,
    });
    Alert.alert("Sucesso", "Registro atualizado!");
  } catch (err) {
    Alert.alert("Erro", "Falha ao atualizar");
  }
};
```

### Deletar Registro

```typescript
const { removeRegistro } = useData();

const handleDeleteRegistro = async (id) => {
  try {
    await removeRegistro(id);
    Alert.alert('Sucesso', 'Registro deletado!');
  } catch (err) {
    Alert.alert('Erro', 'Falha ao deletar');
  }
};

<Button
  onPress={() => handleDeleteRegistro(item.id)}
  title="Deletar"
/>
```

---

## 3️⃣ Alunos (Students)

### Listar Alunos por Turma

```typescript
// app/(tabs)/turmas.tsx
import { useData } from '@/context/DataContext';

export default function TurmasScreen() {
  const { alunosData, loading, error } = useData();

  const turmas = [
    'Berçário',
    'Maternal',
    'Principiantes',
    'Juniores',
    'Intermediários',
    'Jovens',
    'Adultos',
  ];

  return (
    <View>
      {turmas.map((turma) => (
        <Section key={turma} title={turma}>
          <FlatList
            data={alunosData[turma] || []}
            keyExtractor={(item, index) => `${turma}-${index}`}
            renderItem={({ item, index }) => (
              <AlunoItem
                nome={item}
                turma={turma}
                index={index}
              />
            )}
          />
        </Section>
      ))}
    </View>
  );
}
```

### Adicionar Aluno

```typescript
const { addAluno, loading, error } = useData();

const handleAddAluno = async (turma, nome) => {
  try {
    await addAluno(turma, nome);
    Alert.alert('Sucesso', `${nome} adicionado!`);
  } catch (err) {
    Alert.alert('Erro', 'Falha ao adicionar aluno');
  }
};

<TextInput
  placeholder="Nome do aluno"
  onChangeText={(text) => setNovoNome(text)}
/>
<Button
  onPress={() => handleAddAluno('Berçário', novoNome)}
  disabled={loading}
  title="Adicionar"
/>
```

### Atualizar Nome do Aluno

```typescript
const { updateAluno } = useData();

const handleUpdateAluno = async (turma, index, novoNome) => {
  try {
    await updateAluno(turma, index, novoNome);
    Alert.alert("Sucesso", "Aluno atualizado!");
  } catch (err) {
    Alert.alert("Erro", "Falha ao atualizar aluno");
  }
};
```

### Remover Aluno

```typescript
const { removeAluno } = useData();

const handleRemoveAluno = async (turma, index) => {
  Alert.alert(
    'Confirmação',
    'Tem certeza que deseja remover este aluno?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        onPress: async () => {
          try {
            await removeAluno(turma, index);
            Alert.alert('Sucesso', 'Aluno removido!');
          } catch (err) {
            Alert.alert('Erro', 'Falha ao remover aluno');
          }
        },
      },
    ]
  );
};

<Button
  onPress={() => handleRemoveAluno(turma, index)}
  title="Remover"
  color="red"
/>
```

---

## 4️⃣ Tratamento de Erros

### Estrutura de Erro

```typescript
const { error, loading } = useData();

if (error) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Erro ao carregar dados:
      </Text>
      <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
      <Button
        onPress={refetchData}
        title="Tentar Novamente"
      />
    </View>
  );
}
```

### Tratamento de Erro em Operações

```typescript
try {
  await addRegistro(novoRegistro);
} catch (err) {
  if (err.response?.status === 401) {
    // Token expirado, fazer logout
    await logout();
  } else if (err.response?.status === 404) {
    Alert.alert("Erro", "Recurso não encontrado");
  } else if (err.response?.status === 400) {
    Alert.alert("Erro", err.response.data?.message);
  } else {
    Alert.alert("Erro", "Erro desconhecido");
  }
}
```

---

## 5️⃣ Estados de Carregamento

### Componente com Loading/Error/Data

```typescript
import { useData } from '@/context/DataContext';

export default function DataComponent() {
  const { registros, loading, error, refetchRegistros } = useData();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', marginBottom: 20 }}>Erro: {error}</Text>
        <Button onPress={refetchRegistros} title="Tentar Novamente" />
      </View>
    );
  }

  if (registros.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Nenhum registro encontrado</Text>
        <Button onPress={refetchRegistros} title="Recarregar" />
      </View>
    );
  }

  return (
    <FlatList
      data={registros}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <RegistroCard registro={item} />}
      onEndReached={refetchRegistros}
      refreshing={loading}
      onRefresh={refetchRegistros}
    />
  );
}
```

---

## 6️⃣ Alternando entre Mock e Backend Real

### Opção 1: Variável de Ambiente

**`.env.local`:**

```env
# Para modo de desenvolvimento (com mock):
EXPO_PUBLIC_USE_MOCK=true
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# Para conectar ao backend real:
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Depois reinicie o app:

```bash
expo start --clear
```

### Opção 2: Menu de Debug (Opcional)

```typescript
// Adicionar em uma tela de admin/debug
import { useAuth } from '@/context/AuthContext';

export default function DebugScreen() {
  const [useMock, setUseMock] = useState(
    process.env.EXPO_PUBLIC_USE_MOCK === 'true'
  );

  const toggleMock = async () => {
    // Reiniciar app com nova configuração
    Alert.alert(
      'Reiniciar App',
      useMock
        ? 'Vai conectar ao backend real'
        : 'Vai usar dados mock',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            // Aqui você poderia usar AsyncStorage para persistir a escolha
            setUseMock(!useMock);
          },
        },
      ]
    );
  };

  return (
    <View>
      <Text>Modo: {useMock ? 'Mock' : 'Backend Real'}</Text>
      <Button onPress={toggleMock} title="Alternar Modo" />
    </View>
  );
}
```

---

## 7️⃣ Integração com Telas Existentes

### Atualizar `app/(tabs)/index.tsx`

```typescript
import { useData } from '@/context/DataContext';

export default function HomeScreen() {
  const { registros, loading, error, refetchRegistros } = useData();

  useFocusEffect(
    useCallback(() => {
      refetchRegistros();
    }, [])
  );

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetchRegistros}
        />
      }
    >
      {error && <ErrorComponent error={error} onRetry={refetchRegistros} />}
      {registros.map((item) => (
        <RegistroCard key={item.id} registro={item} />
      ))}
    </ScrollView>
  );
}
```

### Atualizar `app/(tabs)/turmas.tsx`

```typescript
import { useData } from '@/context/DataContext';

export default function TurmasScreen() {
  const { alunosData, loading, error, refetchAlunos } = useData();

  useFocusEffect(
    useCallback(() => {
      refetchAlunos();
    }, [])
  );

  return (
    <ScrollView>
      {turmas.map((turma) => (
        <TurmaSection
          key={turma}
          turma={turma}
          alunos={alunosData[turma] || []}
          loading={loading}
          onRefresh={refetchAlunos}
        />
      ))}
    </ScrollView>
  );
}
```

---

## ✅ Checklist de Implementação

- [ ] Atualizou `app/login.tsx` com `useAuth()`
- [ ] Atualizou `app/(tabs)/index.tsx` com `useData()`
- [ ] Atualizou `app/(tabs)/turmas.tsx` com alunos
- [ ] Adicionou tratamento de erros com `Alert`
- [ ] Testou login com `admin@ibrc.com.br` / `123456`
- [ ] Testou criar registro
- [ ] Testou adicionar aluno
- [ ] Testou deletar registro/aluno
- [ ] Testou refresh de dados
- [ ] Documentou novos endpoints no seu backend

---

**Status:** ✅ Ready to use!
