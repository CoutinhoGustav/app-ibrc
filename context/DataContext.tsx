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

interface AlunoEntry {
  id: string;
  nome: string;
}

interface AlunosData {
  [key: string]: string[]; // nome dos alunos para exibição
}

interface AlunosIdMap {
  [key: string]: AlunoEntry[]; // { id, nome } para CRUD
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
  // Trata tanto "YYYY-MM-DD" quanto timestamps ISO completos "YYYY-MM-DDTHH:mm:ss..."
  const match = date?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return date || "";
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
};

const normalizeForUI = (registros: RegistroISO[]): Registro[] =>
  registros.map((r) => ({ ...r, data: isoToBR(r.data) }));

/* ================= PROVIDER ================= */

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [registrosISO, setRegistrosISO] = useState<RegistroISO[]>([]);
  const [alunosData, setAlunosData] = useState<AlunosData>({});
  const [alunosIdMap, setAlunosIdMap] = useState<AlunosIdMap>({}); // UUID map para CRUD
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

      // Backend agora entrega: turmaName, professorNome, dataRegistro
      const registrosISO: RegistroISO[] = registrosData.map((r: any) => ({
        id: r.id,
        turma: r.turmaName ?? r.turma ?? "",
        professor: r.professorNome ?? r.professor ?? "",
        data: r.dataRegistro ?? r.data ?? "",
        presentes: r.presentes ?? 0,
        total: r.total ?? 0,
        visitantes: r.visitantes ?? "-",
      }));
      setRegistrosISO(registrosISO);

      // Carrega turmas e alunos
      await loadAlunos();
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao carregar dados";
      setError(errorMsg);
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAlunos = async () => {
    const turmasRes = await apiService.getTurmas();
    const turmas = turmasRes.data.data || [];

    const alunosObj: AlunosData = {};
    const idMapObj: AlunosIdMap = {};
    const newTurmaIdMap: { [key: string]: number } = {};

    for (const turma of turmas) {
      newTurmaIdMap[turma.name] = turma.id;
      try {
        const alunosRes = await apiService.getAlunosByTurma(turma.id);
        const alunos: AlunoEntry[] = (alunosRes.data.data || []).map((a: any) => ({
          id: a.id,
          nome: a.nome ?? a.name ?? "",
        }));

        // Para exibição: só os nomes ordenados
        alunosObj[turma.name] = alunos
          .map((a) => a.nome)
          .sort((a, b) => a.localeCompare(b, "pt-BR"));

        // Para CRUD: lista com id + nome, também ordenada por nome
        idMapObj[turma.name] = alunos.sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR")
        );
      } catch (err) {
        console.error(`Erro ao carregar alunos de ${turma.name}:`, err);
        alunosObj[turma.name] = [];
        idMapObj[turma.name] = [];
      }
    }

    setTurmaIdMap(newTurmaIdMap);
    setAlunosData(alunosObj);
    setAlunosIdMap(idMapObj);
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
      const payload = {
        turmaName: novoRegistro.turma,
        professorNome: novoRegistro.professor,
        dataRegistro: brToISO(novoRegistro.data),
        presentes: novoRegistro.presentes,
        total: novoRegistro.total,
        visitantes: novoRegistro.visitantes,
      };

      const response = await apiService.createRegistro(payload);

      const newRegistro: RegistroISO = {
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
      const payload = {
        turmaName: updatedRegistro.turma,
        professorNome: updatedRegistro.professor,
        dataRegistro: brToISO(updatedRegistro.data),
        presentes: updatedRegistro.presentes,
        total: updatedRegistro.total,
        visitantes: updatedRegistro.visitantes,
      };

      await apiService.updateRegistro(updatedRegistro.id as string, payload);

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
      await apiService.deleteRegistro(id as any);
      setRegistrosISO((prev) =>
        prev.filter((r) => String(r.id) !== String(id)),
      );
    } catch (err: any) {
      console.error("Erro ao deletar registro:", err);
      throw err;
    }
  };

  const getAlunosByTurma = (turma: string) => alunosData[turma] || [];

  const getTurmaIdByName = (turmaName: string): number | null => {
    return turmaIdMap[turmaName] || null;
  };

  const addAluno = async (turma: string, nome: string) => {
    try {
      const turmaId = getTurmaIdByName(turma);
      if (!turmaId) {
        throw new Error(`Turma "${turma}" não encontrada`);
      }

      const response = await apiService.createAluno(turmaId, { nome, status: "ativo" });
      const novoAluno: AlunoEntry = {
        id: response.data.data.id,
        nome,
      };

      setAlunosData((prev) => {
        const lista = [...(prev[turma] || []), nome].sort((a, b) =>
          a.localeCompare(b, "pt-BR"),
        );
        return { ...prev, [turma]: lista };
      });

      setAlunosIdMap((prev) => {
        const lista = [...(prev[turma] || []), novoAluno].sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR"),
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

      // Busca o UUID do aluno pelo índice no mapa ordenado
      const alunoEntry = alunosIdMap[turma]?.[index];
      if (!alunoEntry) {
        throw new Error("Aluno não encontrado");
      }

      // Passa o UUID real para a API (PATCH /alunos/:uuid)
      await apiService.updateAluno(turmaId, alunoEntry.id, { nome, status: "ativo" });

      setAlunosIdMap((prev) => {
        const lista = [...(prev[turma] || [])];
        lista[index] = { ...lista[index], nome };
        lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        return { ...prev, [turma]: lista };
      });

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

      // Busca o UUID do aluno pelo índice no mapa ordenado
      const alunoEntry = alunosIdMap[turma]?.[index];
      if (!alunoEntry) {
        throw new Error("Aluno não encontrado");
      }

      // Passa o UUID real para a API (DELETE /alunos/:uuid)
      await apiService.deleteAluno(turmaId, alunoEntry.id);

      setAlunosIdMap((prev) => {
        const lista = [...(prev[turma] || [])];
        lista.splice(index, 1);
        return { ...prev, [turma]: lista };
      });

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
        turma: r.turmaName ?? r.turma ?? "",
        professor: r.professorNome ?? r.professor ?? "",
        data: r.dataRegistro ?? r.data ?? "",
        presentes: r.presentes ?? 0,
        total: r.total ?? 0,
        visitantes: r.visitantes ?? "-",
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
      await loadAlunos();
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
