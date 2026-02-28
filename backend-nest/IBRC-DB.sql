-- Habilitar extensão para gerar UUIDs (opcional, mas recomendado)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 3. Criar Tabela de Usuários (User)
CREATE TABLE "User" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    avatar TEXT DEFAULT 'https://ui-avatars.com/api/?name=Admin+IBRC',
    role VARCHAR(50) DEFAULT 'user',
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Tabela de Alunos
CREATE TABLE "Aluno" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    turma VARCHAR(255),
    registered_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Tabela de Turmas
CREATE TABLE "Turma" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turma VARCHAR(255) NOT NULL,
    professor VARCHAR(255) NOT NULL,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    presentes INTEGER DEFAULT 0,
    ausentes INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    visitantes TEXT,
    present_students JSONB,
    absent_students JSONB,
    recorded_by VARCHAR(255)
);
-- Tabela de Desenvolvedores
CREATE TABLE "Developer" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    date_of_birth VARCHAR(50)
);

-- Tabela de Status do Sistema
CREATE TABLE system_status (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    is_call_active BOOLEAN DEFAULT FALSE
);