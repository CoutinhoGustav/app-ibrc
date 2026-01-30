import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

/* ================= TYPES ================= */

interface Registro {
    id: number;
    turma: string;
    professor: string;
    data: string; // DD/MM/YYYY (EXIBIÇÃO)
    presentes: number;
    total: number;
    visitantes: string;
}

interface RegistroISO extends Omit<Registro, 'data'> {
    data: string; // YYYY-MM-DD (INTERNO)
}

interface AlunosData {
    [key: string]: string[];
}

interface DataContextType {
    registros: Registro[];
    alunosData: AlunosData;
    addRegistro: (novoRegistro: Omit<Registro, 'id'>) => void;
    updateRegistro: (updatedRegistro: Registro) => void;
    removeRegistro: (id: number) => void;
    getAlunosByTurma: (turma: string) => string[];
    addAluno: (turma: string, nome: string) => void;
    updateAluno: (turma: string, index: number, nome: string) => void;
    removeAluno: (turma: string, index: number) => void;
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
    registros.map(r => ({ ...r, data: isoToBR(r.data) }));

/* ================= DADOS PADRÃO ================= */

const registrosDefaultISO: RegistroISO[] = [
    { id: 1, turma: 'Berçário', professor: 'Ana Paula', data: '2023-10-15', presentes: 1, total: 5, visitantes: 'Laura Mendes' },
    { id: 2, turma: 'Maternal', professor: 'Carla Souza', data: '2023-10-15', presentes: 3, total: 3, visitantes: '-' },
    { id: 3, turma: 'Principiantes', professor: 'Rafael Lima', data: '2023-10-15', presentes: 7, total: 7, visitantes: 'João Pedro' },
    { id: 4, turma: 'Juniores', professor: 'Marcos Silva', data: '2023-10-15', presentes: 9, total: 9, visitantes: '-' },
    { id: 5, turma: 'Intermediários', professor: 'Luciana Rocha', data: '2023-10-15', presentes: 10, total: 10, visitantes: 'Carlos André' },
    { id: 6, turma: 'Jovens', professor: 'João Paulo', data: '2023-10-15', presentes: 12, total: 12, visitantes: '-' },
    { id: 7, turma: 'Adultos', professor: 'Maria Silva', data: '2023-10-15', presentes: 40, total: 40, visitantes: 'Pedro Henrique' },
];

const alunosDataDefault: AlunosData = {
    Berçário: ['Lucas Baby', 'Ana Clara', 'Miguelzinho', 'Helena Baby', 'Laura Mendes'].sort(),
    Maternal: ['Joãozinho', 'Mariana', 'Davi'].sort(),
    Principiantes: ['Cauã Silva', 'Beatriz Santos', 'Daniel Oliveira', 'Enzo Gabriel', 'Helena Costa', 'Lucas Pereira', 'Ana Vitória'].sort(),
    Juniores: ['Pedro Lucas', 'Ana Júlia', 'Gustavo Lima', 'Larissa Rocha', 'Rafael Costa', 'Camila Dias', 'Fernando Souza', 'Isabela Martins', 'Thiago Alves'].sort(),
    Intermediários: ['Lucas Gabriel', 'Mariana Lima', 'Felipe Costa', 'Amanda Rocha', 'Bruno Silva', 'Juliana Souza', 'Renato Oliveira', 'Carla Pereira', 'Matheus Lima', 'Beatriz Fernandes'].sort(),
    Jovens: ['João Pedro', 'Camila Santos', 'Matheus Oliveira', 'Bianca Lima', 'Gustavo Henrique', 'Larissa Costa', 'Felipe Martins', 'Ana Beatriz', 'Lucas Souza', 'Carolina Dias', 'Rafael Almeida', 'Mariana Fernandes'].sort(),
    Adultos: [
        'Ricardo Alves', 'Teresa Cristina', 'Marcos Paulo', 'Juliana Nunes', 'Pedro Henrique', 'Fernanda Costa', 'Gabriel Oliveira', 'Mariana Silva', 'Lucas Santos', 'Patrícia Lima',
        'Rafael Souza', 'Camila Fernandes', 'Eduardo Martins', 'Carla Almeida', 'Vinícius Rocha', 'Aline Dias', 'Daniela Pereira', 'Bruno Lima', 'Tatiane Costa', 'Felipe Santos',
        'João Vitor', 'Amanda Lima', 'Carlos Henrique', 'Isabela Fernandes', 'Marcelo Souza', 'Juliana Costa', 'Thiago Oliveira', 'Larissa Almeida', 'Gabriela Martins', 'Rafael Dias',
        'Natália Souza', 'Fernando Lima', 'Bianca Costa', 'Gustavo Fernandes', 'Carolina Silva', 'Renan Oliveira', 'Marina Santos', 'Lucas Martins', 'Patrícia Almeida', 'Pedro Silva'
    ].sort(),
};

/* ================= PROVIDER ================= */

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [registrosISO, setRegistrosISO] = useState<RegistroISO[]>(registrosDefaultISO);
    const [alunosData, setAlunosData] = useState<AlunosData>(alunosDataDefault);
    const [loading, setLoading] = useState(true);

    // LOAD e RESET AsyncStorage
    useEffect(() => {
        (async () => {
            try {
                // Remove dados antigos
                await AsyncStorage.removeItem('registros');
                await AsyncStorage.removeItem('alunosData');

                // Seta os dados padrões
                setRegistrosISO(registrosDefaultISO);
                setAlunosData(alunosDataDefault);
            } catch (e) {
                console.error('Erro ao resetar dados', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // SAVE
    useEffect(() => {
        if (!loading) {
            AsyncStorage.setItem('registros', JSON.stringify(registrosISO));
            AsyncStorage.setItem('alunosData', JSON.stringify(alunosData));
        }
    }, [registrosISO, alunosData, loading]);

    /* ================= FUNÇÕES ================= */

    const addRegistro = (novoRegistro: Omit<Registro, 'id'>) => {
        setRegistrosISO(prev => [
            { ...novoRegistro, id: Date.now(), data: brToISO(novoRegistro.data) },
            ...prev,
        ]);
    };

    const updateRegistro = (updatedRegistro: Registro) => {
        setRegistrosISO(prev =>
            prev.map(r =>
                r.id === updatedRegistro.id
                    ? { ...updatedRegistro, data: brToISO(updatedRegistro.data) }
                    : r
            )
        );
    };

    const removeRegistro = (id: number) => {
        setRegistrosISO(prev => prev.filter(r => r.id !== id));
    };

    const getAlunosByTurma = (turma: string) => alunosData[turma] || [];

    // Ordena os alunos sempre que adiciona ou atualiza
    const addAluno = (turma: string, nome: string) => {
        setAlunosData(prev => {
            const lista = [...(prev[turma] || []), nome].sort((a, b) => a.localeCompare(b, 'pt-BR'));
            return { ...prev, [turma]: lista };
        });
    };

    const updateAluno = (turma: string, index: number, nome: string) => {
        setAlunosData(prev => {
            const lista = [...(prev[turma] || [])];
            lista[index] = nome;
            lista.sort((a, b) => a.localeCompare(b, 'pt-BR'));
            return { ...prev, [turma]: lista };
        });
    };

    const removeAluno = (turma: string, index: number) => {
        setAlunosData(prev => {
            const lista = [...(prev[turma] || [])];
            lista.splice(index, 1);
            return { ...prev, [turma]: lista };
        });
    };

    return (
        <DataContext.Provider
            value={{
                registros: normalizeForUI(registrosISO),
                alunosData,
                addRegistro,
                updateRegistro,
                removeRegistro,
                getAlunosByTurma,
                addAluno,
                updateAluno,
                removeAluno,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

/* ================= HOOK ================= */

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData deve ser usado dentro do DataProvider');
    return context;
};
