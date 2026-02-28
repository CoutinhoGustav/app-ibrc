# 📱 App IBRC - Documentação

**v1.0.0** | Fevereiro 2026 | Em Desenvolvimento

---

## ⚡ Quick Start

| Aspecto          | Detalhes                                  |
| ---------------- | ----------------------------------------- |
| **Frontend**     | React Native + Expo + TypeScript          |
| **Backend**      | NestJS + PostgreSQL (Supabase)            |
| **Deploy**       | Vercel (Backend)                          |
| **Autenticação** | JWT + Refresh Tokens                      |
| **Storage**      | AsyncStorage (Local) + Supabase (Backend) |

---

## 🏗️ Arquitetura

### Estrutura Frontend

```
app-ibrc/
├── app/              # Rotas (Expo Router)
│   ├── login.tsx
│   ├── cadastro.tsx
│   └── (tabs)/
│       ├── index.tsx (Home)
│       ├── turmas.tsx
│       ├── explore.tsx
│       └── config.tsx
├── context/          # State Management
│   ├── AuthContext.tsx
│   └── DataContext.tsx
├── components/ui/    # UI Components
├── lib/
│   └── api.ts       # Axios config
└── assets/
```

### Padrão de Arquitetura

- **State:** Context API (Auth + Data)
- **Roteamento:** Expo Router (file-based)
- **Requisições:** Axios com interceptors
- **Cache:** AsyncStorage

---

## 📋 Entidades (Banco de Dados)

### Users

```sql
id (PK) | name | email (UQ) | password_hash | avatar | created_at
```

### Turmas

```sql
id (PK) | name (UQ) | description | created_at
```

**Valores padrão:** Berçário, Maternal, Principiantes, Juniores, Intermediários, Jovens, Adultos

### Alunos

```sql
id (PK) | turma_id (FK) | nome | status | data_inscricao | created_at | deleted_at
```

### Registros Presença

```sql
id (PK) | user_id (FK) | turma_id (FK) | professor_nome | data_registro | presentes | total | visitantes | created_at | deleted_at
```

---

## 🔗 Relacionamentos

| Relacionamento    | Tipo                         |
| ----------------- | ---------------------------- |
| User → Registros  | 1:N                          |
| Turma → Alunos    | 1:N                          |
| Turma → Registros | 1:N                          |
| Aluno → Registros | N:N (via attendance_details) |

---

## 📡 API Endpoints

### 🔐 Autenticação

| Método | Endpoint         | Descrição              |
| ------ | ---------------- | ---------------------- |
| POST   | `/auth/register` | Registrar usuário      |
| POST   | `/auth/login`    | Login (retorna tokens) |
| POST   | `/auth/refresh`  | Renovar access token   |
| POST   | `/auth/logout`   | Logout                 |
| GET    | `/auth/profile`  | Dados do usuário       |
| PATCH  | `/auth/profile`  | Atualizar perfil       |

### 📚 Turmas

| Método | Endpoint      | Descrição             |
| ------ | ------------- | --------------------- |
| GET    | `/turmas`     | Listar turmas         |
| GET    | `/turmas/:id` | Detalhes turma        |
| POST   | `/turmas`     | Criar turma (admin)   |
| PATCH  | `/turmas/:id` | Editar turma (admin)  |
| DELETE | `/turmas/:id` | Deletar turma (admin) |

### 👥 Alunos

| Método | Endpoint                           | Descrição     |
| ------ | ---------------------------------- | ------------- |
| GET    | `/turmas/:turmaId/alunos`          | Listar alunos |
| POST   | `/turmas/:turmaId/alunos`          | Criar aluno   |
| PATCH  | `/turmas/:turmaId/alunos/:alunoId` | Editar aluno  |
| DELETE | `/turmas/:turmaId/alunos/:alunoId` | Deletar aluno |

### 📊 Registros

| Método | Endpoint                     | Descrição            |
| ------ | ---------------------------- | -------------------- |
| GET    | `/registros?page=1&limit=20` | Listar com paginação |
| GET    | `/registros/:id`             | Detalhes registro    |
| POST   | `/registros`                 | Criar registro       |
| PATCH  | `/registros/:id`             | Editar registro      |
| DELETE | `/registros/:id`             | Deletar registro     |

---

## 📦 Requisição/Resposta

### Login Request

```json
{
  "email": "admin@ibrc.com.br",
  "password": "123456"
}
```

### Login Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Admin IBRC",
    "email": "admin@ibrc.com.br",
    "role": "admin"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Criar Registro Request

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

### Listar Registros Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "turmaId": 1,
      "turmaName": "Berçário",
      "professorNome": "Ana Paula",
      "dataRegistro": "2026-02-01",
      "presentes": 1,
      "total": 5,
      "visitantes": "Laura Mendes"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

---

## 🔌 Configuração Frontend

### `.env.local`

```env
EXPO_PUBLIC_API_URL=https://api.ibrc.vercel.app
EXPO_PUBLIC_APP_NAME=IBRC
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### `lib/api.ts` (Axios com Interceptors)

```typescript
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request Interceptor - Adiciona JWT token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("@auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Refresh token em 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem("@refresh_token");
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        await AsyncStorage.setItem("@auth_token", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        await AsyncStorage.removeItem("@auth_token");
        await AsyncStorage.removeItem("@refresh_token");
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

---

## 🔧 Configuração Backend (NestJS + Supabase)

### `.env.local` (Backend)

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres
DB_SSL=true

# JWT
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_REFRESH_EXPIRATION=604800

# App
NODE_ENV=production
PORT=3000
API_URL=https://api.ibrc.vercel.app
CLIENT_URL=https://ibrc.app
```

### `vercel.json` (Deploy Vercel)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run start:dev"
}
```

### `package.json` Scripts

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "typeorm:migration:run": "typeorm migration:run"
  }
}
```

---

## 🎯 Regras de Negócio

### Autenticação

- ✅ Login com email + senha
- ✅ JWT Access Token (3600s)
- ✅ Refresh Token (7 dias)
- ✅ Token armazenado em AsyncStorage

### Turmas

- ✅ 7 turmas padrão (enums)
- ✅ Cada turma pode ter múltiplos alunos
- ✅ Cada aluno pertence a apenas 1 turma

### Registros Presença

- ✅ Presentes ≤ Total
- ✅ Data obrigatória (formato DD/MM/YYYY UI, YYYY-MM-DD BD)
- ✅ Busca por: turma, professor, data, ano
- ✅ Paginação (20 itens/página)

### Validações

- ✅ Email único
- ✅ Aluno único por turma
- ✅ Soft delete (deleted_at)

---

## 📱 Telas Frontend

| Tela     | Rota              | Descrição                      |
| -------- | ----------------- | ------------------------------ |
| Login    | `/login`          | Email + Senha                  |
| Registro | `/cadastro`       | Novo usuário                   |
| Home     | `/(tabs)`         | Listar registros + busca       |
| Turmas   | `/(tabs)/turmas`  | Gerenciar alunos               |
| Explorar | `/(tabs)/explore` | Analytics                      |
| Config   | `/(tabs)/config`  | Perfil + Notificações + Logout |

---

## 🔄 Fluxo Autenticação

```
Usuário
  ↓
[Login Screen] → email + senha
  ↓
[AuthContext.login()] → API /auth/login
  ↓
[Se válido]
  ├─ Salva accessToken
  ├─ Salva refreshToken
  └─ Navega para /(tabs) ✓

[Se inválido]
  └─ Exibe erro
```

---

## 💾 Storage Chaves

| Chave            | Conteúdo           | Tipo         |
| ---------------- | ------------------ | ------------ |
| `@auth_token`    | JWT Access Token   | String       |
| `@refresh_token` | Refresh Token      | String       |
| `@user`          | Dados do usuário   | JSON         |
| `registros`      | Registros presença | JSON (LOCAL) |
| `alunosData`     | Alunos por turma   | JSON (LOCAL) |

---

## 🚀 Stack Completo

| Camada         | Tecnologia                   |
| -------------- | ---------------------------- |
| **Frontend**   | React Native 0.81.5          |
| **Runtime**    | Expo 54.0.32                 |
| **Roteamento** | Expo Router 6.0.22           |
| **Styling**    | Tailwind + NativeWind        |
| **HTTP**       | Axios 1.13.4                 |
| **Backend**    | NestJS                       |
| **Linguagem**  | TypeScript 5.9.2             |
| **Database**   | PostgreSQL (Supabase)        |
| **ORM**        | TypeORM / Prisma             |
| **Auth**       | JWT + Refresh Tokens         |
| **Deploy**     | Vercel                       |
| **Ícones**     | Lucide React Native          |
| **Gestos**     | React Native Gesture Handler |

---

## 📋 Context API

### AuthContext

```typescript
interface User {
  name: string;
  email: string;
  avatar?: string;
}

type AuthContextType = {
  user: User | null;
  login(email: string, password: string): Promise<boolean>;
  logout(): Promise<void>;
  updateUser(newData: Partial<User>): Promise<void>;
  updateAvatar(uri: string): Promise<void>;
  deleteAccount(): Promise<void>;
  loading: boolean;
};
```

### DataContext

```typescript
type Registro = {
  id: number;
  turma: string;
  professor: string;
  data: string; // DD/MM/YYYY
  presentes: number;
  total: number;
  visitantes: string;
};

type DataContextType = {
  registros: Registro[];
  alunosData: { [turma: string]: string[] };
  addRegistro(registro: Omit<Registro, "id">): void;
  updateRegistro(registro: Registro): void;
  removeRegistro(id: number): void;
  getAlunosByTurma(turma: string): string[];
  addAluno(turma: string, nome: string): void;
  updateAluno(turma: string, index: number, nome: string): void;
  removeAluno(turma: string, index: number): void;
};
```

---

## ✅ Checklist Próximas Fases

### Fase 1: Backend ✅

- [ ] Criar repo NestJS
- [ ] Setup Supabase
- [ ] Implementar Auth (JWT)
- [ ] Criar migrations
- [ ] Documentação Swagger
- [ ] Testes E2E

### Fase 2: Integração

- [ ] Remover mock login
- [ ] Integrar API endpoints
- [ ] Testar fluxos
- [ ] Testes unitários frontend

### Fase 3: Features

- [ ] Relatórios/Charts
- [ ] Exportar PDF/Excel
- [ ] Upload de fotos
- [ ] Notificações push

### Fase 4: Polish

- [ ] Dark mode
- [ ] Multi-language
- [ ] Sync offline
- [ ] Performance

---

## 🔗 Links

| Recurso  | URL                            |
| -------- | ------------------------------ |
| Supabase | https://supabase.com/dashboard |
| Vercel   | https://vercel.com/dashboard   |
| NestJS   | https://docs.nestjs.com        |
| Expo     | https://docs.expo.dev          |
| TypeORM  | https://typeorm.io             |
| Prisma   | https://www.prisma.io/docs     |

---

**Última Atualização:** 02/02/2026
