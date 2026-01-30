import {
    ChevronRight,
    GraduationCap,
    Pencil,
    Plus,
    Trash2,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
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

    // ===== MODAL CONFIRMAÇÃO =====
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [alunoParaExcluir, setAlunoParaExcluir] = useState<number | null>(null);

    // ================= TURMAS PERMITIDAS =================
    const TURMAS_PERMITIDAS = [
        'Berçário',
        'Maternal',
        'Principiantes',
        'Juniores',
        'Intermediários',
        'Jovens',
        'Adultos',
    ];

    // Cria a lista de turmas com professor e total de alunos, mas filtra apenas turmas permitidas
    const turmas = TURMAS_PERMITIDAS
        .filter(turmaName => alunosData[turmaName])
        .map(turmaName => {
            const record = registros.find(r => r.turma === turmaName);
            return {
                name: turmaName,
                professor: record ? record.professor : 'Não atribuído',
                totalAlunos: alunosData[turmaName].length
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
        } else {
            addAluno(turmaModal, novoAluno);
        }

        setNovoAluno('');
        setAlunoEditando(null);
    };

    const renderTurmaItem = ({ item }: { item: any }) => (
        <Card className="mb-3">
            <TouchableOpacity
                onPress={() =>
                    setSelectedTurma(item.name === selectedTurma ? null : item.name)
                }
                activeOpacity={0.7}
            >
                <View className="flex-row items-center justify-between p-3">
                    <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3">
                            <GraduationCap size={20} color="#2563eb" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold text-gray-900">
                                {item.name}
                            </Text>
                            <Text className="text-gray-500 text-xs">
                                Prof. {item.professor}
                            </Text>
                        </View>
                    </View>
                    <ChevronRight
                        size={18}
                        color="#9ca3af"
                        style={{
                            transform: [
                                {
                                    rotate:
                                        selectedTurma === item.name ? '90deg' : '0deg'
                                }
                            ]
                        }}
                    />
                </View>

                {selectedTurma === item.name && (
                    <View className="px-3 pb-3 pt-2 border-t border-gray-50">
                        <Text className="text-xs font-bold text-gray-700 mb-2">
                            Alunos ({item.totalAlunos})
                        </Text>

                        <View className="flex-row flex-wrap gap-2">
                            {alunosData[item.name].map((aluno, index) => (
                                <View
                                    key={index}
                                    className="bg-gray-100 px-2 py-1 rounded-full"
                                >
                                    <Text className="text-gray-700 text-xs">
                                        {aluno}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <Button
                            variant="outline"
                            className="mt-4 h-12"
                            textClassName="text-md"
                            onPress={() => abrirModal(item.name)}
                        >
                            Gerenciar Alunos
                        </Button>
                    </View>
                )}
            </TouchableOpacity>
        </Card>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* HEADER */}
            <View className="bg-white px-4 py-3 border-b border-gray-100">
                <Text className="text-xl font-black text-gray-900">Turmas</Text>
                <Text className="text-xs text-gray-500 font-medium">
                    Gerenciamento de classes
                </Text>
            </View>

            <FlatList
                data={turmas}
                renderItem={renderTurmaItem}
                keyExtractor={item => item.name}
                contentContainerStyle={{ padding: 12 }}
            />

            {/* ================= MODAL GERENCIAR ================= */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-2xl p-4 max-h-[95%]">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-lg font-bold">
                                Gerenciar Alunos
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={22} />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row items-center gap-2 mb-4">
                            <TextInput
                                value={novoAluno}
                                onChangeText={setNovoAluno}
                                placeholder="Nome do aluno"
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2"
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
                                <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
                                    <Text className="text-gray-800">{item}</Text>

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

            {/* ================= MODAL CONFIRMAÇÃO ================= */}
            {/* ================= MODAL CONFIRMAÇÃO ================= */}
            <Modal visible={confirmVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/50 items-center justify-center px-6">
                    <View className="bg-white rounded-2xl p-5 w-full max-w-sm">
                        <Text className="text-lg font-bold text-gray-900 mb-2">
                            Confirmar exclusão
                        </Text>

                        <Text className="text-sm text-gray-600 mb-6">
                            Tem certeza que deseja excluir este aluno? Essa ação não pode ser desfeita.
                        </Text>

                        {/* Botões lado a lado com margem explícita */}
                        <View className="flex-row">
                            {/* Cancelar */}
                            <TouchableOpacity
                                onPress={() => {
                                    setConfirmVisible(false);
                                    setAlunoParaExcluir(null);
                                }}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#f3f4f6', // cinza claro
                                    paddingVertical: 14,
                                    borderRadius: 10,
                                    marginRight: 8, // espaço entre os botões
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#374151', fontWeight: '600' }}>Cancelar</Text>
                            </TouchableOpacity>

                            {/* Excluir */}
                            <TouchableOpacity
                                onPress={() => {
                                    if (turmaModal && alunoParaExcluir !== null) {
                                        removeAluno(turmaModal, alunoParaExcluir);
                                    }
                                    setConfirmVisible(false);
                                    setAlunoParaExcluir(null);
                                }}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#ef4444', // vermelho
                                    paddingVertical: 14,
                                    borderRadius: 10,
                                    marginLeft: 8, // espaço entre os botões
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}
