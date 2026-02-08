import DateTimePicker from '@react-native-community/datetimepicker';
import {
    CheckCircle,
    ChevronRight,
    GraduationCap,
    Pencil,
    Plus,
    Trash2,
    X
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

// =====================
// COMPONENTE CARD DE RESUMO
// =====================
const ResumoCard = ({ label, value, destaque }: { label: string; value: string | number; destaque?: boolean }) => (
    <View
        className={`rounded-xl p-4 items-center justify-center flex-1 ${destaque ? 'bg-blue-600' : 'bg-gray-100 dark:bg-slate-800'
            }`}
    >
        <Text className={`text-[10px] uppercase font-bold mb-1 ${destaque ? 'text-blue-100' : 'text-gray-500'}`}>{label}</Text>
        <Text className={`text-xl font-black ${destaque ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</Text>
    </View>
);

// =====================
// HELPERS
// =====================
const normalizeDate = (date: string) => {
    // Agora a data já vem formatada como DD/MM/YYYY do picker ou estado
    // Se por acaso vier como YYYY-MM-DD (fallback), convertemos
    const matchISO = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (matchISO) {
        const [, year, month, day] = matchISO;
        return `${day}/${month}/${year}`;
    }
    return date;
};

export default function TurmasScreen() {
    const {
        alunosData,
        registros,
        addAluno,
        updateAluno,
        removeAluno
    } = useData();
    const { colorScheme } = useColorScheme();

    const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [turmaModal, setTurmaModal] = useState<string | null>(null);

    const [novoAluno, setNovoAluno] = useState('');
    const [alunoEditando, setAlunoEditando] = useState<{
        index: number;
        nome: string;
    } | null>(null);

    // ===== RELATÓRIOS =====
    const [activeTab, setActiveTab] = useState<'classes' | 'relatorio'>('classes');
    const [dataFiltro, setDataFiltro] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { user } = useAuth();

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear();
            setDataFiltro(`${day}/${month}/${year}`);
        }
    };

    // =====================
    // FILTRAGEM DE REGISTROS
    // =====================
    const registrosFiltrados = useMemo(() => {
        let filtered = registros;

        // filtra por data
        if (dataFiltro) {
            const normalizedFiltro = normalizeDate(dataFiltro);
            filtered = filtered.filter((r: any) => r.data === normalizedFiltro);
        }

        return filtered;
    }, [registros, dataFiltro, user]);

    // =====================
    // FUNÇÃO DE RESUMO
    // =====================
    const calcularResumo = (lista: any[]) => {
        let presentes = 0;
        let ausentes = 0;
        let visitantes = 0;

        lista.forEach(r => {
            // presentes
            if (typeof r.presentes === 'number') {
                presentes += r.presentes;
            } else if (Array.isArray(r.presentes)) {
                presentes += r.presentes.length;
            } else if (typeof r.presentes === 'string') {
                presentes += r.presentes.split(',').filter(Boolean).length;
            }

            // ausentes
            if (typeof r.ausentes === 'number') {
                ausentes += r.ausentes;
            } else if (Array.isArray(r.ausentes)) {
                ausentes += r.ausentes.length;
            } else if (typeof r.ausentes === 'string') {
                ausentes += r.ausentes.split(',').filter(Boolean).length;
            } else if (r.total && typeof r.presentes === 'number') {
                ausentes += (r.total - r.presentes);
            }

            // visitantes (ignora '-' e vazios)
            if (r.visitantes && typeof r.visitantes === 'string' && r.visitantes.trim() !== '' && r.visitantes.trim() !== '-') {
                visitantes += r.visitantes.split(',').map((v: string) => v.trim()).filter(Boolean).length;
            }
        });

        return {
            presentes,
            ausentes,
            visitantes,
            totalPresentes: presentes + visitantes
        };
    };

    // =====================
    // RESUMOS
    // =====================
    const resumoGeral = useMemo(() => calcularResumo(registrosFiltrados), [registrosFiltrados]);

    const resumoPorTurma = useMemo(() => {
        return Object.keys(alunosData).map(turma => {
            const registrosTurma = registrosFiltrados.filter((r: any) => r.turma === turma);
            return {
                turma,
                ...calcularResumo(registrosTurma)
            };
        });
    }, [alunosData, registrosFiltrados]);

    // ===== EXCLUSÃO =====
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [alunoParaExcluir, setAlunoParaExcluir] = useState<number | null>(null);
    const [nomeAlunoExcluir, setNomeAlunoExcluir] = useState<string | null>(null);

    // ===== FEEDBACK =====
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [acaoAtual, setAcaoAtual] = useState<'add' | 'delete'>('add');

    const TURMAS_PERMITIDAS = [
        'Berçário',
        'Maternal',
        'Principiantes',
        'Juniores',
        'Intermediários',
        'Jovens',
        'Adultos',
    ];

    const turmas = TURMAS_PERMITIDAS
        .filter(turma => alunosData[turma])
        .map(turma => {
            const record = registros.find(r => r.turma === turma);
            return {
                name: turma,
                professor: record ? record.professor : 'Não atribuído',
                totalAlunos: alunosData[turma].length
            };
        });

    const abrirModal = (turma: string) => {
        setTurmaModal(turma);
        setNovoAluno('');
        setAlunoEditando(null);
        setModalVisible(true);
    };

    const salvarAluno = () => {
        if (!turmaModal || !novoAluno.trim()) return;

        if (alunoEditando) {
            updateAluno(turmaModal, alunoEditando.index, novoAluno);
            setNovoAluno('');
            setAlunoEditando(null);
            return;
        }

        setAcaoAtual('add');
        setLoadingVisible(true);

        setTimeout(() => {
            addAluno(turmaModal, novoAluno);
            setLoadingVisible(false);
            setSuccessVisible(true);
            setNovoAluno('');

            setTimeout(() => setSuccessVisible(false), 1500);
        }, 800);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            {/* NOVO HEADER COM ABAS */}
            <View className="bg-white dark:bg-slate-900 px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex-row justify-between items-center">
                <View className="flex-1">
                    <Text className="text-2xl font-black text-gray-900 dark:text-white">Turmas</Text>
                    <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                        Relatórios e gerenciamento • {user?.name || 'Usuário'}
                    </Text>
                </View>

                <View className="flex-row bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                    <TouchableOpacity
                        onPress={() => setActiveTab('classes')}
                        className={`px-3 py-1.5 rounded-lg ${activeTab === 'classes' ? 'bg-blue-600' : ''}`}
                    >
                        <Text className={`font-bold text-[10px] ${activeTab === 'classes' ? 'text-white' : 'text-gray-500'}`}>Classes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('relatorio')}
                        className={`px-3 py-1.5 rounded-lg ${activeTab === 'relatorio' ? 'bg-blue-600' : ''}`}
                    >
                        <Text className={`font-bold text-[10px] ${activeTab === 'relatorio' ? 'text-white' : 'text-gray-500'}`}>Relatório</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* CONTEÚDO CLASSES */}
            {activeTab === 'classes' && (
                <FlatList
                    data={turmas}
                    keyExtractor={item => item.name}
                    contentContainerStyle={{ padding: 12 }}
                    renderItem={({ item }) => (
                        <Card className="mb-3">
                            <TouchableOpacity
                                onPress={() =>
                                    setSelectedTurma(item.name === selectedTurma ? null : item.name)
                                }
                            >
                                <View className="flex-row justify-between items-center p-3">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl items-center justify-center mr-3">
                                            <GraduationCap size={20} color="#2563eb" />
                                        </View>
                                        <View>
                                            <Text className="font-bold text-gray-900 dark:text-white">{item.name}</Text>
                                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                                                Prof. {item.professor}
                                            </Text>
                                        </View>
                                    </View>

                                    <ChevronRight
                                        size={18}
                                        color="#9ca3af"
                                        style={{
                                            transform: [
                                                { rotate: selectedTurma === item.name ? '90deg' : '0deg' }
                                            ]
                                        }}
                                    />
                                </View>

                                {selectedTurma === item.name && (
                                    <View className="px-3 pb-3 pt-2 border-t border-gray-100 dark:border-slate-800">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-xs font-bold text-gray-900 dark:text-white">
                                                Alunos ({item.totalAlunos})
                                            </Text>
                                        </View>

                                        <View className="flex-row flex-wrap gap-2">
                                            {alunosData[item.name].map((aluno, index) => (
                                                <View
                                                    key={index}
                                                    className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full"
                                                >
                                                    <Text className="text-xs text-gray-700 dark:text-gray-300">{aluno}</Text>
                                                </View>
                                            ))}
                                        </View>

                                        <Button
                                            variant="outline"
                                            className="mt-4 h-12"
                                            onPress={() => abrirModal(item.name)}
                                        >
                                            Gerenciar Alunos
                                        </Button>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Card>
                    )}
                />
            )}

            {/* CONTEÚDO RELATÓRIO */}
            {activeTab === 'relatorio' && (
                <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
                    {/* FILTRO */}
                    <View className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 mb-6 border border-gray-100 dark:border-slate-800">
                        <Text className="font-bold text-gray-900 dark:text-white mb-2">Filtrar por data:</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-3 flex-row justify-between items-center"
                        >
                            <Text className={dataFiltro ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                                {dataFiltro || "Selecionar data..."}
                            </Text>
                            {dataFiltro ? (
                                <TouchableOpacity onPress={() => setDataFiltro('')}>
                                    <X size={16} color="#94a3b8" />
                                </TouchableOpacity>
                            ) : null}
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={new Date()}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}
                    </View>

                    {/* RESUMO GERAL */}
                    <View className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 mb-6 border border-gray-100 dark:border-slate-800">
                        <Text className="text-lg font-black mb-4 text-gray-900 dark:text-white">Resumo Geral</Text>

                        <View className="flex-row gap-3 mb-3">
                            <ResumoCard label="Presentes" value={resumoGeral.presentes} />
                            <ResumoCard label="Ausentes" value={resumoGeral.ausentes} />
                        </View>
                        <View className="flex-row gap-3">
                            <ResumoCard label="Visitantes" value={resumoGeral.visitantes} />
                            <ResumoCard
                                label="Total"
                                value={resumoGeral.totalPresentes}
                                destaque
                            />
                        </View>
                    </View>

                    {/* RESUMO POR TURMA */}
                    <Text className="text-xl font-black mb-4 text-gray-900 dark:text-white px-2">Por Turma</Text>
                    <View className="gap-4">
                        {resumoPorTurma.map(r => (
                            <View
                                key={r.turma}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-slate-800"
                            >
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="text-base font-black text-gray-900 dark:text-white">{r.turma}</Text>
                                    <View className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                        <Text className="text-blue-600 dark:text-blue-400 text-[10px] font-bold">ATIVA</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between border-t border-gray-50 dark:border-slate-800 pt-3">
                                    <View className="flex-1">
                                        <Text className="text-[10px] text-gray-500 uppercase font-bold">Presenças</Text>
                                        <Text className="text-lg font-black text-gray-900 dark:text-white">{r.presentes}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[10px] text-gray-500 uppercase font-bold">Ausências</Text>
                                        <Text className="text-lg font-black text-gray-900 dark:text-white">{r.ausentes}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[10px] text-gray-500 uppercase font-bold">Visitantes</Text>
                                        <Text className="text-lg font-black text-gray-900 dark:text-white">{r.visitantes}</Text>
                                    </View>
                                    <View className="flex-1 items-end">
                                        <Text className="text-[10px] text-gray-500 uppercase font-bold">Total</Text>
                                        <Text className="text-lg font-black text-blue-600 dark:text-blue-400">{r.totalPresentes}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}

            {/* MODAL GERENCIAR */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white dark:bg-slate-900 rounded-t-2xl p-4 max-h-[95%]">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">Gerenciar Alunos</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={22} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row gap-2 mb-4">
                            <TextInput
                                value={novoAluno}
                                onChangeText={setNovoAluno}
                                placeholder="Nome do aluno"
                                placeholderTextColor="#94a3b8"
                                className="flex-1 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                            />
                            <TouchableOpacity
                                onPress={salvarAluno}
                                className="bg-blue-600 p-2 rounded-lg"
                            >
                                <Plus size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={turmaModal ? alunosData[turmaModal] : []}
                            keyExtractor={(_, i) => i.toString()}
                            renderItem={({ item, index }) => (
                                <View className="flex-row justify-between py-2 border-b border-gray-50 dark:border-slate-800">
                                    <Text className="text-gray-900 dark:text-white">{item}</Text>
                                    <View className="flex-row gap-4">
                                        <TouchableOpacity
                                            onPress={() => {
                                                setNovoAluno(item);
                                                setAlunoEditando({ index, nome: item });
                                            }}
                                        >
                                            <Pencil size={18} color="#2563eb" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => {
                                                setAlunoParaExcluir(index);
                                                setNomeAlunoExcluir(item);
                                                setConfirmVisible(true);
                                            }}
                                        >
                                            <Trash2 size={18} color="#dc2626" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* LOADING */}
            <Modal visible={loadingVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/50 items-center justify-center">
                    <View className="bg-white rounded-2xl p-6 items-center w-4/5">
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text className="mt-4 font-semibold text-gray-900 dark:text-white">
                            {acaoAtual === 'add'
                                ? 'Registrando aluno...'
                                : 'Excluindo aluno...'}
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* SUCESSO */}
            <Modal visible={successVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/50 items-center justify-center">
                    <View className="bg-white dark:bg-slate-900 rounded-2xl p-6 items-center w-4/5">
                        <CheckCircle size={48} color="#16a34a" />
                        <Text className="text-lg font-bold mt-3 text-gray-900 dark:text-white">Sucesso!</Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
                            {acaoAtual === 'add'
                                ? 'Aluno registrado com sucesso'
                                : 'Aluno excluído com sucesso'}
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* CONFIRMAÇÃO EXCLUSÃO */}
            <Modal visible={confirmVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center px-6">
                    <View className="bg-white dark:bg-slate-900 rounded-2xl p-5">
                        <Text className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                            Confirmar exclusão
                        </Text>

                        <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Deseja excluir o aluno:
                        </Text>

                        <View className="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-lg mb-6">
                            <Text className="font-semibold text-center text-gray-900 dark:text-white">
                                {nomeAlunoExcluir}
                            </Text>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setConfirmVisible(false);
                                    setNomeAlunoExcluir(null);
                                }}
                                className="flex-1 bg-gray-100 dark:bg-slate-800 py-3 rounded-lg items-center"
                            >
                                <Text className="text-gray-700 dark:text-gray-300">Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if (!turmaModal || alunoParaExcluir === null) return;

                                    setConfirmVisible(false);
                                    setAcaoAtual('delete');
                                    setLoadingVisible(true);

                                    setTimeout(() => {
                                        removeAluno(turmaModal, alunoParaExcluir);
                                        setLoadingVisible(false);
                                        setSuccessVisible(true);

                                        setTimeout(() => {
                                            setSuccessVisible(false);
                                            setAlunoParaExcluir(null);
                                            setNomeAlunoExcluir(null);
                                        }, 1500);
                                    }, 800);
                                }}
                                className="flex-1 bg-red-600 py-3 rounded-lg items-center"
                            >
                                <Text className="text-white">Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
