import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "../lib/api";

/* ================= TYPES ================= */

interface Registro {
  id: string | number;
  turma: string;
  professor: string;
  data: string;
  presentes: number;
  total: number;
  visitantes: string;
}

interface RegistroISO extends Omit<Registro, "data"> {
  data: string; // YYYY-MM-DD (INTERNO)
}

interface AlunosData {
  [key: string]: string[];
}

interface DataContextType {
  registros: Registro[];
  alunosData: AlunosData;
  loading: boolean;
  error: string | null;
  addRegistro: (novoRegistro: Omit<Registro, "id">) => Promise<void>;
  updateRegistro: (updatedRegistro: Registro) => Promise<void>;
  removeRegistro: (id: string | number) => Promise<void>;
  getAlunosByTurma: (turma: string) => string[];
  addAluno: (turma: string, nome: string) => Promise<void>;
  updateAluno: (turma: string, index: number, nome: string) => Promise<void>;
  removeAluno: (turma: string, index: number) => Promise<void>;
  refetchRegistros: () => Promise<void>;
  refetchAlunos: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/* ================= FUNÇÕES DE DATA ================= */

const brToISO = (date: string): string => {
  const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return date;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
};

const isoToBR = (date: string): string => {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return date;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
};

const normalizeForUI = (registros: RegistroISO[]): Registro[] =>
  registros.map((r) => ({ ...r, data: isoToBR(r.data) }));

/* ================= DADOS PADRÃO ================= */

const registrosDefaultISO: RegistroISO[] = [
  {
    id: 1,
    turma: "Berçário",
    professor: "Ana Paula",
    data: "2023-10-15",
    presentes: 1,
    total: 5,
    visitantes: "Laura Mendes",
  },
  {
    id: 2,
    turma: "Maternal",
    professor: "Carla Souza",
    data: "2023-10-15",
    presentes: 3,
    total: 3,
    visitantes: "-",
  },
  {
    id: 3,
    turma: "Principiantes",
    professor: "Rafael Lima",
    data: "2023-10-15",
    presentes: 7,
    total: 7,
    visitantes: "João Pedro",
  },
  {
    id: 4,
    turma: "Juniores",
    professor: "Marcos Silva",
    data: "2023-10-15",
    presentes: 9,
    total: 9,
    visitantes: "-",
  },
  {
    id: 5,
    turma: "Intermediários",
    professor: "Luciana Rocha",
    data: "2023-10-15",
    presentes: 10,
    total: 10,
    visitantes: "Carlos André",
  },
  {
    id: 6,
    turma: "Jovens",
    professor: "João Paulo",
    data: "2023-10-15",
    presentes: 12,
    total: 12,
    visitantes: "-",
  },
  {
    id: 7,
    turma: "Adultos",
    professor: "Maria Silva",
    data: "2023-10-15",
    presentes: 40,
    total: 40,
    visitantes: "Pedro Henrique",
  },
];

const alunosDataDefault: AlunosData = {
  Berçário: [
    "Lucas Baby",
    "Ana Clara",
    "Miguelzinho",
    "Helena Baby",
    "Laura Mendes",
  ].sort(),
  Maternal: ["Joãozinho", "Mariana", "Davi"].sort(),
  Principiantes: [
    "Cauã Silva",
    "Beatriz Santos",
    "Daniel Oliveira",
    "Enzo Gabriel",
    "Helena Costa",
    "Lucas Pereira",
    "Ana Vitória",
  ].sort(),
  Juniores: [
    "Pedro Lucas",
    "Ana Júlia",
    "Gustavo Lima",
    "Larissa Rocha",
    "Rafael Costa",
    "Camila Dias",
    "Fernando Souza",
    "Isabela Martins",
    "Thiago Alves",
  ].sort(),
  Intermediários: [
    "Lucas Gabriel",
    "Mariana Lima",
    "Felipe Costa",
    "Amanda Rocha",
    "Bruno Silva",
    "Juliana Souza",
    "Renato Oliveira",
    "Carla Pereira",
    "Matheus Lima",
    "Beatriz Fernandes",
  ].sort(),
  Jovens: [
    "João Pedro",
    "Camila Santos",
    "Matheus Oliveira",
    "Bianca Lima",
    "Gustavo Henrique",
    "Larissa Costa",
    "Felipe Martins",
    "Ana Beatriz",
    "Lucas Souza",
    "Carolina Dias",
    "Rafael Almeida",
    "Mariana Fernandes",
  ].sort(),
  Adultos: [
    "Ricardo Alves",
    "Teresa Cristina",
    "Marcos Paulo",
    "Juliana Nunes",
    "Pedro Henrique",
    "Fernanda Costa",
    "Gabriel Oliveira",
    "Mariana Silva",
    "Lucas Santos",
    "Patrícia Lima",
    "Rafael Souza",
    "Camila Fernandes",
    "Eduardo Martins",
    "Carla Almeida",
    "Vinícius Rocha",
    "Aline Dias",
    "Daniela Pereira",
    "Bruno Lima",
    "Tatiane Costa",
    "Felipe Santos",
    "João Vitor",
    "Amanda Lima",
    "Carlos Henrique",
    "Isabela Fernandes",
    "Marcelo Souza",
    "Juliana Costa",
    "Thiago Oliveira",
    "Larissa Almeida",
    "Gabriela Martins",
    "Rafael Dias",
    "Natália Souza",
    "Fernando Lima",
    "Bianca Costa",
    "Gustavo Fernandes",
    "Carolina Silva",
    "Renan Oliveira",
    "Marina Santos",
    "Lucas Martins",
    "Patrícia Almeida",
    "Pedro Silva",
  ].sort(),
};

/* ================= PROVIDER ================= */

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [registrosISO, setRegistrosISO] = useState<RegistroISO[]>([]);
  const [alunosData, setAlunosData] = useState<AlunosData>({});
  const [turmaIdMap, setTurmaIdMap] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================= LOAD DATA FROM API =================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Carrega registros
      const registrosRes = await apiService.getRegistros(1, 100);
      const registrosData = registrosRes.data.data || [];

      // Converte para formato ISO interno
      const registrosISO: RegistroISO[] = registrosData.map((r: any) => ({
        id: r.id,
        turma: r.turmaName,
        professor: r.professorNome,
        data: r.dataRegistro, // Já vem em YYYY-MM-DD do backend
        presentes: r.presentes,
        total: r.total,
        visitantes: r.visitantes,
      }));
      setRegistrosISO(registrosISO);

      // Carrega alunos e constrói mapa de turmas
      const turmasRes = await apiService.getTurmas();
      const turmas = turmasRes.data.data || [];

      const alunosObj: AlunosData = {};
      const newTurmaIdMap: { [key: string]: number } = {};

      for (const turma of turmas) {
        newTurmaIdMap[turma.name] = turma.id;
        try {
          const alunosRes = await apiService.getAlunosByTurma(turma.id);
          const alunos = alunosRes.data.data || [];
          alunosObj[turma.name] = alunos
            .map((a: any) => a.nome)
            .sort((a, b) => a.localeCompare(b, "pt-BR"));
        } catch (err) {
          console.error(`Erro ao carregar alunos de ${turma.name}:`, err);
        }
      }
      setTurmaIdMap(newTurmaIdMap);
      setAlunosData(alunosObj);
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao carregar dados";
      setError(errorMsg);
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= AUTO SAVE =================

  useEffect(() => {
    if (!loading && registrosISO.length > 0) {
      AsyncStorage.setItem("registros", JSON.stringify(registrosISO));
      AsyncStorage.setItem("alunosData", JSON.stringify(alunosData));
    }
  }, [registrosISO, alunosData, loading]);

  /* ================= FUNÇÕES ================= */

  const addRegistro = async (novoRegistro: Omit<Registro, "id">) => {
    try {
      const response = await apiService.createRegistro({
        ...novoRegistro,
        data: brToISO(novoRegistro.data),
      });

      const newRegistro = {
        ...novoRegistro,
        id: response.data.data.id,
        data: brToISO(novoRegistro.data),
      };

      setRegistrosISO((prev) => [newRegistro, ...prev]);
    } catch (err: any) {
      console.error("Erro ao criar registro:", err);
      throw err;
    }
  };

  const updateRegistro = async (updatedRegistro: Registro) => {
    try {
      await apiService.updateRegistro(updatedRegistro.id as number, {
        ...updatedRegistro,
        data: brToISO(updatedRegistro.data),
      });

      setRegistrosISO((prev) =>
        prev.map((r) =>
          r.id === updatedRegistro.id
            ? { ...updatedRegistro, data: brToISO(updatedRegistro.data) }
            : r,
        ),
      );
    } catch (err: any) {
      console.error("Erro ao atualizar registro:", err);
      throw err;
    }
  };

  const removeRegistro = async (id: string | number) => {
    try {
      // Aceita tanto id numérico quanto string (útil para mock ids)
      await apiService.deleteRegistro(id as any);
      // Faz a comparação convertendo para string para evitar problemas de tipo ("1" vs 1)
      setRegistrosISO((prev) =>
        prev.filter((r) => String(r.id) !== String(id)),
      );
    } catch (err: any) {
      console.error("Erro ao deletar registro:", err);
      throw err;
    }
  };

  const getAlunosByTurma = (turma: string) => alunosData[turma] || [];

  // Encontra turma ID por nome
  const getTurmaIdByName = (turmaName: string): number | null => {
    return turmaIdMap[turmaName] || null;
  };

  // Ordena os alunos sempre que adiciona ou atualiza
  const addAluno = async (turma: string, nome: string) => {
    try {
      const turmaId = getTurmaIdByName(turma);
      if (!turmaId) {
        throw new Error(`Turma "${turma}" não encontrada`);
      }

      await apiService.createAluno(turmaId, { nome, ativo: true });

      setAlunosData((prev) => {
        const lista = [...(prev[turma] || []), nome].sort((a, b) =>
          a.localeCompare(b, "pt-BR"),
        );
        return { ...prev, [turma]: lista };
      });
    } catch (err: any) {
      console.error("Erro ao adicionar aluno:", err);
      throw err;
    }
  };

  const updateAluno = async (turma: string, index: number, nome: string) => {
    try {
      const turmaId = getTurmaIdByName(turma);
      if (!turmaId) {
        throw new Error(`Turma "${turma}" não encontrada`);
      }

      const alunoAtual = alunosData[turma]?.[index];
      if (!alunoAtual) {
        throw new Error("Aluno não encontrado");
      }

      await apiService.updateAluno(turmaId, alunoAtual, { nome, ativo: true });

      setAlunosData((prev) => {
        const lista = [...(prev[turma] || [])];
        lista[index] = nome;
        lista.sort((a, b) => a.localeCompare(b, "pt-BR"));
        return { ...prev, [turma]: lista };
      });
    } catch (err: any) {
      console.error("Erro ao atualizar aluno:", err);
      throw err;
    }
  };

  const removeAluno = async (turma: string, index: number) => {
    try {
      const turmaId = getTurmaIdByName(turma);
      if (!turmaId) {
        throw new Error(`Turma "${turma}" não encontrada`);
      }

      const alunoParaRemover = alunosData[turma]?.[index];
      if (!alunoParaRemover) {
        throw new Error("Aluno não encontrado");
      }

      await apiService.deleteAluno(turmaId, alunoParaRemover);

      setAlunosData((prev) => {
        const lista = [...(prev[turma] || [])];
        lista.splice(index, 1);
        return { ...prev, [turma]: lista };
      });
    } catch (err: any) {
      console.error("Erro ao deletar aluno:", err);
      throw err;
    }
  };

  // Refetch functions
  const refetchRegistros = async () => {
    try {
      setLoading(true);
      const registrosRes = await apiService.getRegistros(1, 100);
      const registrosData = registrosRes.data.data || [];

      const registrosISO: RegistroISO[] = registrosData.map((r: any) => ({
        id: r.id,
        turma: r.turmaName,
        professor: r.professorNome,
        data: r.dataRegistro,
        presentes: r.presentes,
        total: r.total,
        visitantes: r.visitantes,
      }));
      setRegistrosISO(registrosISO);
    } catch (err: any) {
      console.error("Erro ao atualizar registros:", err);
    } finally {
      setLoading(false);
    }
  };

  const refetchAlunos = async () => {
    try {
      setLoading(true);
      const turmasRes = await apiService.getTurmas();
      const turmas = turmasRes.data.data || [];

      const alunosObj: AlunosData = {};
      const newTurmaIdMap: { [key: string]: number } = {};

      for (const turma of turmas) {
        newTurmaIdMap[turma.name] = turma.id;
        try {
          const alunosRes = await apiService.getAlunosByTurma(turma.id);
          const alunos = alunosRes.data.data || [];
          alunosObj[turma.name] = alunos
            .map((a: any) => a.nome)
            .sort((a, b) => a.localeCompare(b, "pt-BR"));
        } catch (err) {
          console.error(`Erro ao carregar alunos de ${turma.name}:`, err);
        }
      }
      setTurmaIdMap(newTurmaIdMap);
      setAlunosData(alunosObj);
    } catch (err: any) {
      console.error("Erro ao atualizar alunos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        registros: normalizeForUI(registrosISO),
        alunosData,
        loading,
        error,
        addRegistro,
        updateRegistro,
        removeRegistro,
        getAlunosByTurma,
        addAluno,
        updateAluno,
        removeAluno,
        refetchRegistros,
        refetchAlunos,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useData = () => {
  const context = useContext(DataContext);
  if (!context)
    throw new Error("useData deve ser usado dentro do DataProvider");
  return context;
};
