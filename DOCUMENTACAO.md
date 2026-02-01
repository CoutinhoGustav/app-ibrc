# 📱 Documentação App IBRC

**Versão:** 1.0.0  
**Data:** Fevereiro 2026  
**Status:** Em Desenvolvimento

---

## 📚 Índice

1. [Stack Tecnológico](#stack-tecnológico)
2. [Arquitetura da Aplicação](#arquitetura-da-aplicação)
3. [Regras de Negócio](#regras-de-negócio)
4. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
5. [Mapeamento de Entidades](#mapeamento-de-entidades)
6. [Relacionamentos](#relacionamentos)
7. [Estrutura de Dados (Backend)](#estrutura-de-dados-backend)
8. [Rotas e Navegação](#rotas-e-navegação)
9. [Componentes Principais](#componentes-principais)
10. [Variáveis de Estado](#variáveis-de-estado)

---

## 🔧 Stack Tecnológico

### Frontend Mobile/Web

- **Framework:** React Native (0.81.5)
- **Runtime:** Expo (~54.0.32)
- **Roteamento:** Expo Router (~6.0.22)
- **Linguagem:** TypeScript (~5.9.2)
- **Styling:**
  - Tailwind CSS (3.4.19)
  - NativeWind (4.2.1) - Tailwind para React Native
  - Tailwind Merge (3.4.0)
- **Navegação:** React Navigation (7.x)
  - Bottom Tabs Navigator (7.4.0)
  - Native (7.1.8)
  - Elements (2.6.3)

### HTTP & Armazenamento

- **API Client:** Axios (1.13.4)
- **Storage Local:** AsyncStorage (2.2.0)

### UI & Animações

- **Ícones:**
  - Lucide React Native (0.563.0)
  - Expo Vector Icons (15.0.3)
  - Expo Symbols (1.0.8)
- **Animações:** React Native Reanimated (~4.1.1)
- **Gestos:** React Native Gesture Handler (~2.28.0)
- **Imagens:** Expo Image (3.0.11)
- **Image Picker:** Expo Image Picker (~17.0.10)

### Utilitários

- **Haptics:** Expo Haptics (~15.0.8)
- **Date/Time:** React Native Community DateTimePicker (8.4.4)
- **Safe Area:** React Native Safe Area Context (~5.6.0)
- **Web Support:** React DOM (19.1.0) + React Native Web (0.21.0)

### Desenvolvimento & Ferramentas

- **Linter:** ESLint (9.25.0) + Expo Config
- **Build:** Metro (0.83.3)
- **Babel:** babel.config.js

---

## 🏗️ Arquitetura da Aplicação

### Estrutura de Pastas

```
app-ibrc/
├── app/                          # Rotas e telas (Expo Router)
│   ├── _layout.tsx              # Layout raiz + ThemeProvider
│   ├── login.tsx                # Tela de login
│   ├── cadastro.tsx             # Tela de registro
│   ├── modal.tsx                # Modal genérico
│   └── (tabs)/                  # Abas principais (Layout com navegação inferior)
│       ├── _layout.tsx          # Layout das tabs
│       ├── index.tsx            # Home - Registros
│       ├── turmas.tsx           # Gerenciamento de Turmas e Alunos
│       ├── explore.tsx          # Exploração/Analytics
│       └── config.tsx           # Configurações do usuário
│
├── components/                   # Componentes reutilizáveis
│   ├── external-link.tsx
│   ├── haptic-tab.tsx
│   ├── hello-wave.tsx
│   ├── parallax-scroll-view.tsx
│   ├── themed-text.tsx
│   ├── themed-view.tsx
│   └── ui/                      # Componentes de UI
│       ├── Button.tsx           # Botão reutilizável
│       ├── Card.tsx             # Card/Container
│       ├── collapsible.tsx      # Accordion
│       ├── icon-symbol.tsx
│       ├── Input.tsx            # Input de texto
│       └── Select.tsx           # Seletor/Dropdown
│
├── context/                      # React Context (State Management)
│   ├── AuthContext.tsx          # Contexto de autenticação
│   └── DataContext.tsx          # Contexto de dados (registros e alunos)
│
├── hooks/                        # Hooks customizados
│   ├── use-color-scheme.ts      # Detecta tema escuro/claro
│   ├── use-color-scheme.web.ts  # Versão web
│   └── use-theme-color.ts       # Hook para cores do tema
│
├── lib/                          # Utilitários
│   └── utils.ts                 # Funções auxiliares
│
├── constants/                    # Constantes
│   └── theme.ts                 # Configurações de tema
│
├── assets/                       # Assets estáticos
│   └── images/                  # Imagens (logo, ícones, etc)
│
├── global.css                    # Estilos globais
├── tailwind.config.js           # Configuração Tailwind
├── tsconfig.json                # Configuração TypeScript
├── app.json                     # Configuração Expo
├── package.json                 # Dependências
└── README.md                    # README padrão

```

### Padrão de Arquitetura

- **Context API:** Gerenciamento de estado global (Auth + Data)
- **Expo Router:** Roteamento baseado em arquivos
- **AsyncStorage:** Persistência local de dados
- **Bottom Tab Navigation:** Navegação por abas inferiores

---

## 📋 Regras de Negócio

### 1. Autenticação

#### Login

- Email obrigatório
- Senha obrigatória
- Credencial mockada: `admin@ibrc.com.br` / `123456`
- Usuário armazenado em AsyncStorage após login bem-sucedido
- Token de autenticação: Não implementado (usando dados mockados)

#### Registro (Cadastro)

- Nome completo obrigatório
- Email obrigatório e único (validação não implementada)
- Senha obrigatória
- Atualmente é um formulário sem integração com backend

#### Sessão

- Usuário persistido enquanto estiver logado
- Logout limpa dados do AsyncStorage
- Acesso negado ao usuário não autenticado

---

### 2. Turmas e Alunos

#### Turmas Disponíveis (Enum)

```
1. Berçário
2. Maternal
3. Principiantes
4. Juniores
5. Intermediários
6. Jovens
7. Adultos
```

#### Alunos

- Cada aluno pertence a apenas **uma turma**
- Lista de alunos ordenada alfabeticamente por sobrenome
- Nomes normalizados (português)
- Alunos padrão carregados na inicialização

#### Operações em Alunos

- ✅ Adicionar novo aluno à turma
- ✅ Editar nome do aluno
- ✅ Remover aluno da turma
- ❌ Buscar aluno por ID

---

### 3. Registros de Presença

#### Registro (Attendance Record)

Cada registro contém:

- **ID único** (timestamp de criação)
- **Turma** (referência à turma)
- **Professor** (nome do professor responsável)
- **Data** (formato DD/MM/YYYY para exibição, YYYY-MM-DD internamente)
- **Presentes** (quantidade de alunos presentes)
- **Total** (quantidade total de alunos na turma)
- **Visitantes** (nomes dos visitantes ou "-" se nenhum)

#### Operações em Registros

- ✅ Criar novo registro
- ✅ Editar registro existente
- ✅ Excluir registro
- ✅ Buscar registros por:
  - Nome da turma
  - Nome do professor
  - Data (parcial ou completa)
  - Ano
- ✅ Ordenar por data (mais recente primeiro)

---

### 4. Validações

#### Campos Obrigatórios

- Login: email, senha
- Cadastro: nome, email, senha
- Novo Aluno: nome
- Novo Registro: turma, professor, data, presentes, total

#### Formatos

- **Data:** Deve estar em DD/MM/YYYY na interface
- **Email:** Padrão básico (não validado atualmente)
- **Números:** Presentes ≤ Total

---

### 5. Persistência de Dados

#### AsyncStorage Keys

```
@user               → Dados do usuário logado (JSON)
registros           → Array de registros de presença (JSON)
alunosData          → Object com turmas e alunos (JSON)
```

#### Sincronização

- Dados são salvos automaticamente quando modificados
- Dados são carregados na inicialização da app
- Sem sincronização com backend (dados locais apenas)

---

## 🔄 Fluxo de Funcionamento

### 1. Inicialização da Aplicação

```
App Inicia
    ↓
[RootLayout]
    ├─→ SafeAreaProvider
    ├─→ ThemeProvider (Light/Dark)
    ├─→ AuthProvider (carrega usuário do AsyncStorage)
    │   └─→ Se usuário existe → redireciona para (tabs)
    │   └─→ Se não existe → redireciona para /login
    └─→ DataProvider (carrega registros e alunos)
        └─→ Inicializa com dados padrão
```

---

### 2. Fluxo de Autenticação

```
Usuário Abre App
    ↓
[LoginScreen]
    ├─→ Insere email e senha
    └─→ Clica em "Entrar"
        ↓
    [AuthContext.login()]
        ├─→ Valida credenciais (mock)
        ├─→ Se válido:
        │   ├─→ Cria objeto User
        │   ├─→ Salva em AsyncStorage (@user)
        │   ├─→ Navega para /(tabs)
        │   └─→ Acesso liberado ✓
        └─→ Se inválido:
            └─→ Exibe erro "Email ou senha inválidos"
```

---

### 3. Fluxo Home - Listar Registros

```
[HomeScreen]
    ├─→ useData() → busca registros do context
    ├─→ Ordena por data (mais recente primeiro)
    ├─→ Aplicar filtro de busca (opcional)
    │   ├─→ Por turma
    │   ├─→ Por professor
    │   ├─→ Por data
    │   └─→ Por ano
    └─→ Exibe em FlatList
        ├─→ Cada item mostra: Turma, Professor, Presença, Data
        └─→ Botões: Editar, Excluir, Detalhes
```

---

### 4. Fluxo Turmas - Gerenciar Alunos

```
[TurmasScreen]
    ├─→ Lista todas as turmas
    ├─→ Para cada turma:
    │   ├─→ Nome da turma
    │   ├─→ Professor responsável
    │   └─→ Total de alunos
    │
    └─→ Ao clicar em uma turma:
        ├─→ Abre modal com lista de alunos
        ├─→ Opções:
        │   ├─→ Adicionar novo aluno
        │   ├─→ Editar nome do aluno
        │   ├─→ Remover aluno (com confirmação)
        │   └─→ Atualizar automática (AsyncStorage)
        └─→ Sucesso/Erro feedback
```

---

### 5. Fluxo Configurações

```
[ConfigScreen]
    ├─→ Exibe dados do usuário
    ├─→ Opções:
    │   ├─→ Editar perfil (nome, email)
    │   ├─→ Gerenciar notificações
    │   │   ├─→ Email
    │   │   └─→ Sistema
    │   ├─→ Privacidade
    │   ├─→ Sobre
    │   ├─→ Logout (com confirmação)
    │   └─→ Deletar conta (com confirmação)
    │
    └─→ Ao clicar Logout:
        ├─→ Limpa dados do AsyncStorage
        ├─→ Navega para /login
        └─→ Sessão encerrada
```

---

## 📊 Mapeamento de Entidades

### Entidade: User (Usuário)

**Localização:** `context/AuthContext.tsx`

```typescript
interface User {
  name: string; // Nome completo do usuário
  email: string; // Email único
  avatar?: string; // URL da foto do perfil (opcional)
}
```

**Status:** ✅ Implementado  
**Armazenamento:** AsyncStorage (@user)  
**Operações:**

- Criar (login/registro)
- Ler (carregamento inicial)
- Atualizar (updateUser, updateAvatar)
- Deletar (deleteAccount)

---

### Entidade: Registro (Attendance Record)

**Localização:** `context/DataContext.tsx`

```typescript
interface Registro {
  id: number; // ID único (timestamp)
  turma: string; // Nome da turma
  professor: string; // Nome do professor
  data: string; // DD/MM/YYYY (para exibição)
  presentes: number; // Quantidade presente
  total: number; // Total de alunos
  visitantes: string; // Nomes dos visitantes ou "-"
}

interface RegistroISO extends Omit<Registro, "data"> {
  data: string; // YYYY-MM-DD (armazenamento interno)
}
```

**Status:** ✅ Implementado  
**Armazenamento:** AsyncStorage (registros)  
**Operações:**

- Criar (addRegistro)
- Ler (registros array)
- Atualizar (updateRegistro)
- Deletar (removeRegistro)
- Buscar (por turma, professor, data)

---

### Entidade: Aluno (Student)

**Localização:** `context/DataContext.tsx`

```typescript
interface AlunosData {
  [key: string]: string[];  // Turma → Array de nomes de alunos
}

// Exemplo:
{
  "Berçário": ["Ana Clara", "Helena Baby", "Laura Mendes", "Lucas Baby", "Miguelzinho"],
  "Maternal": ["Davi", "Joãozinho", "Mariana"],
  "Principiantes": ["Ana Vitória", "Beatriz Santos", ...],
  ...
}
```

**Status:** ✅ Implementado  
**Armazenamento:** AsyncStorage (alunosData)  
**Operações:**

- Criar (addAluno)
- Ler (getAlunosByTurma)
- Atualizar (updateAluno)
- Deletar (removeAluno)

---

## 🔗 Relacionamentos

### 1. User ↔️ Registro (Attendance Record)

```
User (1) ────────────── (N) Registro
  |                         |
  └─ Um usuário pode       └─ Um registro é criado por um usuário
     criar múltiplos          (professor/gestor)
     registros
```

**Tipo:** Um para Muitos (One-to-Many)  
**Implementação:** Não há chave estrangeira (sem backend)  
**Futuro Backend:** Adicionar `userId` em Registro

---

### 2. Turma ↔️ Registro

```
Turma (1) ────────────────── (N) Registro
  |                              |
  └─ Uma turma pode ter        └─ Um registro refere-se a
     múltiplos registros         uma turma específica
```

**Tipo:** Um para Muitos (One-to-Many)  
**Implementação:** Campo `turma: string` em Registro  
**Relacionamento:** `turma` em Registro referencia uma turma válida

---

### 3. Turma ↔️ Aluno

```
Turma (1) ────────────────── (N) Aluno
  |                             |
  └─ Uma turma contém         └─ Um aluno pertence a
     múltiplos alunos           exatamente uma turma
```

**Tipo:** Um para Muitos (One-to-Many)  
**Implementação:** Chave de objeto em AlunosData  
**Relacionamento:** `AlunosData[turma]` = Array de alunos

---

### 4. Aluno ↔️ Registro (Presença)

```
Aluno (1) ───────────────── (N) Registro
  |                             |
  └─ Um aluno pode estar     └─ Um registro registra
     em múltiplos registros     múltiplos alunos
```

**Tipo:** Um para Muitos (One-to-Many)  
**Implementação:** Contagem em `Registro.presentes`  
**Futuro Backend:** Criar tabela de junção `attendance_records`

---

### Diagrama Entidade-Relacionamento (E-R)

```
┌──────────────┐
│     User     │
├──────────────┤
│ id (PK)      │
│ name         │
│ email (UQ)   │
│ avatar       │
└──────────────┘
       │
       │ (1:N)
       │
       ▼
┌──────────────────┐
│    Registro      │
├──────────────────┤
│ id (PK)          │
│ turma (FK)       │◄─────┐
│ professor        │      │
│ data             │      │
│ presentes        │      │ (1:N)
│ total            │      │
│ visitantes       │      │
└──────────────────┘      │
                          │
                     ┌────────────┐
                     │   Turma    │
                     ├────────────┤
                     │ name (PK)  │
                     └────────────┘
                          │
                          │ (1:N)
                          │
                          ▼
                     ┌────────────┐
                     │   Aluno    │
                     ├────────────┤
                     │ id (PK)    │
                     │ nome       │
                     │ turmaId(FK)│
                     └────────────┘
```

---

## 🗄️ Estrutura de Dados (Backend)

### Proposta de Estrutura para Backend

Quando o projeto migrar para um backend real (Node.js, Django, etc), essa será a estrutura recomendada:

---

### Tabela: `users`

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar URL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

**Índices:**

- PRIMARY KEY: `id`
- UNIQUE: `email`
- Índice: `deleted_at` (soft delete)

---

### Tabela: `turmas`

```sql
CREATE TABLE turmas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Valores Padrão:**

```
1. Berçário
2. Maternal
3. Principiantes
4. Juniores
5. Intermediários
6. Jovens
7. Adultos
```

**Índices:**

- PRIMARY KEY: `id`
- UNIQUE: `name`

---

### Tabela: `alunos`

```sql
CREATE TABLE alunos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  turma_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  data_inscricao DATE,
  status ENUM('ativo', 'inativo', 'transferido') DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_aluno_turma (turma_id, nome)
);
```

**Índices:**

- PRIMARY KEY: `id`
- FOREIGN KEY: `turma_id` → `turmas.id`
- UNIQUE: `(turma_id, nome)` - evita duplicatas na mesma turma
- Índice: `deleted_at` (soft delete)

---

### Tabela: `registros_presenca`

```sql
CREATE TABLE registros_presenca (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  turma_id INT NOT NULL,
  professor_nome VARCHAR(255) NOT NULL,
  data_registro DATE NOT NULL,
  presentes INT NOT NULL,
  total INT NOT NULL,
  visitantes TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE RESTRICT
);
```

**Índices:**

- PRIMARY KEY: `id`
- FOREIGN KEY: `user_id` → `users.id`
- FOREIGN KEY: `turma_id` → `turmas.id`
- Índice: `(turma_id, data_registro)` - busca por turma e data
- Índice: `(user_id, created_at)` - histórico de usuário
- Índice: `deleted_at` (soft delete)

---

### Tabela: `attendance_details` (Futura - Detalhe de Presença)

Para rastrear qual aluno estava presente/ausente em cada registro:

```sql
CREATE TABLE attendance_details (
  id INT PRIMARY KEY AUTO_INCREMENT,
  registro_presenca_id INT NOT NULL,
  aluno_id INT NOT NULL,
  status ENUM('presente', 'ausente', 'atrasado') DEFAULT 'presente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (registro_presenca_id) REFERENCES registros_presenca(id) ON DELETE CASCADE,
  FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (registro_presenca_id, aluno_id)
);
```

---

### Modelo JSON para API

#### GET `/api/registros` - Listar Registros

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "turmaId": 1,
      "turmaName": "Berçário",
      "professorNome": "Ana Paula",
      "dataRegistro": "2026-02-01",
      "presentes": 1,
      "total": 5,
      "visitantes": "Laura Mendes",
      "createdAt": "2026-02-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42
  }
}
```

---

#### POST `/api/registros` - Criar Registro

```json
{
  "turmaId": 1,
  "professorNome": "Ana Paula",
  "dataRegistro": "2026-02-01",
  "presentes": 1,
  "total": 5,
  "visitantes": "Laura Mendes"
}
```

---

#### GET `/api/turmas/:turmaId/alunos` - Listar Alunos de Turma

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Ana Clara",
      "turmaId": 1,
      "status": "ativo",
      "dataInscricao": "2025-01-15"
    }
  ]
}
```

---

#### POST `/api/turmas/:turmaId/alunos` - Criar Aluno

```json
{
  "nome": "Ana Clara",
  "dataInscricao": "2026-02-01"
}
```

---

## 🗂️ Rotas e Navegação

### Estrutura de Rotas (Expo Router)

```
/                          ← RootLayout (_layout.tsx)
├── /login                 ← Tela de Login (sem autenticação)
├── /cadastro              ← Tela de Registro (sem autenticação)
│
└── /(tabs)                ← Layout com Bottom Tab Navigator (autenticado)
    ├── /                  ← Home - Listar Registros
    ├── /turmas            ← Turmas e Alunos
    ├── /explore           ← Exploração/Analytics
    └── /config            ← Configurações do Usuário

└── /modal                 ← Modal genérico (sobreposto)
```

### Proteção de Rotas

- ✅ Usuário não autenticado → Redireciona para `/login`
- ✅ Usuário autenticado → Acesso às abas `/(tabs)`
- ✅ Logout → Redireciona para `/login`

---

## 🧩 Componentes Principais

### 1. AuthProvider (`context/AuthContext.tsx`)

**Responsabilidade:** Gerenciar autenticação, sessão e dados do usuário

**Exports:**

- `AuthContext` - Context React
- `AuthProvider` - Provider component
- `useAuth()` - Hook customizado
- `User` - Interface de usuário
- `AuthContextType` - Interface do context

**Métodos:**

```typescript
login(email: string, password: string): Promise<boolean>
logout(): Promise<void>
updateUser(newData: Partial<User>): Promise<void>
updateAvatar(uri: string): Promise<void>
deleteAccount(): Promise<void>
```

---

### 2. DataProvider (`context/DataContext.tsx`)

**Responsabilidade:** Gerenciar registros de presença e dados de alunos

**Exports:**

- `DataContext` - Context React
- `DataProvider` - Provider component
- `useData()` - Hook customizado
- `Registro` - Interface de registro
- `AlunosData` - Interface de alunos

**Métodos:**

```typescript
addRegistro(novoRegistro: Omit<Registro, 'id'>): void
updateRegistro(updatedRegistro: Registro): void
removeRegistro(id: number): void
getAlunosByTurma(turma: string): string[]
addAluno(turma: string, nome: string): void
updateAluno(turma: string, index: number, nome: string): void
removeAluno(turma: string, index: number): void
```

---

### 3. Button (`components/ui/Button.tsx`)

**Props:**

```typescript
variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
className?: string
disabled?: boolean
onPress?: () => void
children: React.ReactNode
```

---

### 4. Card (`components/ui/Card.tsx`)

**Props:**

```typescript
className?: string
children: React.ReactNode
```

---

### 5. Input (`components/ui/Input.tsx`)

**Props:**

```typescript
label?: string
placeholder?: string
value: string
onChangeText: (text: string) => void
keyboardType?: 'default' | 'email-address' | 'numeric'
secureTextEntry?: boolean
autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
```

---

### 6. Select (`components/ui/Select.tsx`)

**Props:**

```typescript
label?: string
options: Array<{ label: string; value: any }>
value: any
onValueChange: (value: any) => void
```

---

## 📱 Variáveis de Estado

### AuthContext State

```typescript
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
```

**Fluxo:**

1. Ao iniciar: `loading = true`
2. Carrega usuario do AsyncStorage
3. Se existe: `user = userData`, `loading = false`
4. Se não: `user = null`, `loading = false`
5. Após login bem-sucedido: `user = userData`
6. Após logout: `user = null`

---

### DataContext State

```typescript
const [registrosISO, setRegistrosISO] =
  useState<RegistroISO[]>(registrosDefaultISO);
const [alunosData, setAlunosData] = useState<AlunosData>(alunosDataDefault);
const [loading, setLoading] = useState(true);
```

**Sincronização:**

- Ao modificar `registrosISO` ou `alunosData`: Salva em AsyncStorage
- Na inicialização: Carrega dados do AsyncStorage ou usa defaults

---

### HomeScreen State

```typescript
const [search, setSearch] = useState("");
```

**Comportamento:**

- Filtra registros em tempo real
- Busca por: turma, professor, data (parcial), ano
- Normaliza strings (remove acentos)

---

### TurmasScreen State

```typescript
const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
const [modalVisible, setModalVisible] = useState(false);
const [turmaModal, setTurmaModal] = useState<string | null>(null);
const [novoAluno, setNovoAluno] = useState("");
const [alunoEditando, setAlunoEditando] = useState<{
  index: number;
  nome: string;
} | null>(null);
const [confirmVisible, setConfirmVisible] = useState(false);
const [alunoParaExcluir, setAlunoParaExcluir] = useState<number | null>(null);
const [loadingVisible, setLoadingVisible] = useState(false);
const [successVisible, setSuccessVisible] = useState(false);
```

**Fluxo Modal:**

1. Usuário clica em turma
2. `modalVisible = true`, `turmaModal = turma`
3. Usuário pode:
   - Adicionar aluno: `novoAluno` field
   - Editar aluno: `alunoEditando = {index, nome}`
   - Remover aluno: `confirmVisible = true`, `alunoParaExcluir = index`

---

### ConfigScreen State

```typescript
const [notifEmail, setNotifEmail] = useState(true);
const [notifSistema, setNotifSistema] = useState(false);
const [logoutModalVisible, setLogoutModalVisible] = useState(false);
const [deleteModalVisible, setDeleteModalVisible] = useState(false);
```

---

## 🚀 Próximos Passos (Roadmap)

### Fase 1: Backend Integration

- [ ] Criar API REST (Node.js/Express ou Django)
- [ ] Implementar autenticação JWT
- [ ] Migrar dados para banco de dados
- [ ] Remover mock login

### Fase 2: Funcionalidades

- [ ] Detalhes completos de alunos (foto, data de nascimento, etc)
- [ ] Relatórios de presença (gráficos, estatísticas)
- [ ] Busca avançada de registros
- [ ] Exportar dados (PDF, Excel)

### Fase 3: Melhorias

- [ ] Notificações push
- [ ] Sincronização offline-first
- [ ] Modo escuro completo
- [ ] Multi-idioma (EN, ES)

### Fase 4: Admin Dashboard

- [ ] Painel web para gestores
- [ ] Relatórios avançados
- [ ] Gerenciamento de usuários
- [ ] Auditoria de dados

---

## 📞 Contato e Suporte

**Desenvolvedor:** App IBRC Team  
**Data de Documentação:** 02/02/2026  
**Versão da App:** 1.0.0

---

**Última Atualização:** Fevereiro 2026
