import {
    CheckCircle,
    ChevronRight,
    GraduationCap,
    Pencil,
    Plus,
    Trash2,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';

export default function TurmasScreen() {
    const {
        alunosData,
        registros,
        addAluno,
        updateAluno,
        removeAluno
    } = useData();

    const [selectedTurma, setSelectedTurma] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [turmaModal, setTurmaModal] = useState<string | null>(null);

    const [novoAluno, setNovoAluno] = useState('');
    const [alunoEditando, setAlunoEditando] = useState<{
        index: number;
        nome: string;
    } | null>(null);

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
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-3 border-b">
                <Text className="text-xl font-black">Turmas</Text>
                <Text className="text-xs text-gray-500">
                    Gerenciamento de classes
                </Text>
            </View>

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
                                    <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3">
                                        <GraduationCap size={20} color="#2563eb" />
                                    </View>
                                    <View>
                                        <Text className="font-bold">{item.name}</Text>
                                        <Text className="text-xs text-gray-500">
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
                                <View className="px-3 pb-3 pt-2 border-t border-gray-100">
                                    <Text className="text-xs font-bold mb-2">
                                        Alunos ({item.totalAlunos})
                                    </Text>

                                    <View className="flex-row flex-wrap gap-2">
                                        {alunosData[item.name].map((aluno, index) => (
                                            <View
                                                key={index}
                                                className="bg-gray-100 px-2 py-1 rounded-full"
                                            >
                                                <Text className="text-xs">{aluno}</Text>
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

            {/* MODAL GERENCIAR */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-2xl p-4 max-h-[95%]">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-lg font-bold">Gerenciar Alunos</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={22} />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row gap-2 mb-4">
                            <TextInput
                                value={novoAluno}
                                onChangeText={setNovoAluno}
                                placeholder="Nome do aluno"
                                className="flex-1 border rounded-lg px-3 py-2"
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
                                <View className="flex-row justify-between py-2 border-b">
                                    <Text>{item}</Text>
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
                        <Text className="mt-4 font-semibold">
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
                    <View className="bg-white rounded-2xl p-6 items-center w-4/5">
                        <CheckCircle size={48} color="#16a34a" />
                        <Text className="text-lg font-bold mt-3">Sucesso!</Text>
                        <Text className="text-sm text-gray-600 mt-1 text-center">
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
                    <View className="bg-white rounded-2xl p-5">
                        <Text className="text-lg font-bold mb-2">
                            Confirmar exclusão
                        </Text>

                        <Text className="text-sm text-gray-600 mb-4">
                            Deseja excluir o aluno:
                        </Text>

                        <View className="bg-gray-100 px-3 py-2 rounded-lg mb-6">
                            <Text className="font-semibold text-center">
                                {nomeAlunoExcluir}
                            </Text>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setConfirmVisible(false);
                                    setNomeAlunoExcluir(null);
                                }}
                                className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
                            >
                                <Text>Cancelar</Text>
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
