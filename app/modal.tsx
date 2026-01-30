import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, CheckSquare, Save, Square, Trash2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useData } from '../context/DataContext';

/* ================= HELPERS ================= */
const formatDateBR = (date: Date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const parseDateBR = (date: string) => {
  const [d, m, y] = date.split('/');
  return new Date(Number(y), Number(m) - 1, Number(d));
};

/* ================= TURMAS ================= */
const TURMAS_PERMITIDAS = [
  'Berçário', 'Maternal', 'Principiantes', 'Juniores',
  'Intermediários', 'Jovens', 'Adultos',
];

/* ================= COMPONENTE ================= */
export default function ModalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { registros, addRegistro, updateRegistro, removeRegistro, alunosData } = useData();

  const turmaOptions = TURMAS_PERMITIDAS.filter(turma => alunosData[turma]);

  const [turma, setTurma] = useState('');
  const [professor, setProfessor] = useState('');
  const [data, setData] = useState<Date>(new Date());
  const [visitantes, setVisitantes] = useState('');
  const [alunosPresentes, setAlunosPresentes] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [errors, setErrors] = useState({
    turma: false,
    professor: false,
    data: false,
  });

  const alunosDaTurma = turma ? alunosData[turma] || [] : [];

  /* ================= LOAD ================= */
  useEffect(() => {
    if (id) {
      const reg = registros.find(r => r.id.toString() === id);
      if (reg) {
        setTurma(reg.turma);
        setProfessor(reg.professor);
        setData(parseDateBR(reg.data));
        setVisitantes(reg.visitantes === '-' ? '' : reg.visitantes);

        const alunos = alunosData[reg.turma] || [];
        setAlunosPresentes(alunos.slice(0, reg.presentes));
      }
    }
  }, [id, registros]);

  useEffect(() => {
    if (turma && !id) setAlunosPresentes([]);
  }, [turma]);

  /* ================= HANDLERS ================= */
  const toggleAlunoPresenca = (aluno: string) => {
    setAlunosPresentes(prev =>
      prev.includes(aluno)
        ? prev.filter(a => a !== aluno)
        : [...prev, aluno]
    );
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setData(selectedDate);
  };

  const clearError = (field: keyof typeof errors) => {
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleSave = () => {
    const newErrors = {
      turma: !turma,
      professor: !professor,
      data: !data,
    };
    setErrors(newErrors);

    if (newErrors.turma || newErrors.professor || newErrors.data) return;

    const payload = {
      turma,
      professor,
      data: formatDateBR(data),
      presentes: alunosPresentes.length,
      total: alunosDaTurma.length,
      visitantes: visitantes || '-',
    };

    if (id) updateRegistro({ ...payload, id: Number(id) });
    else addRegistro(payload);

    router.back();
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!id) return;
    removeRegistro(Number(id));
    setShowDeleteModal(false);
    router.back();
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="border-b border-gray-200 px-4 py-3 flex-row justify-between items-center">
        <Text className="font-semibold text-gray-800">
          {id ? 'Editar Registro' : 'Novo Registro'}
        </Text>
        <TouchableOpacity onPress={router.back}>
          <X size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4 gap-4">

          <Select
            label="Turma *"
            placeholder="Selecione"
            value={turma}
            options={turmaOptions}
            onValueChange={v => {
              setTurma(v);
              clearError('turma');
            }}
            error={errors.turma ? 'Campo obrigatório' : undefined}
          />

          <Input
            label="Professor *"
            value={professor}
            onChangeText={t => {
              setProfessor(t);
              clearError('professor');
            }}
            error={errors.professor ? 'Campo obrigatório' : undefined}
          />

          <View>
            <Text className="text-sm mb-1">Data *</Text>
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(true);
                clearError('data');
              }}
              className={`flex-row items-center border rounded-lg px-4 py-3 ${errors.data ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <Calendar size={18} color="#6b7280" />
              <Text className="ml-3">
                {data.toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={data}
              mode="date"
              onChange={onDateChange}
            />
          )}

          {turma && alunosDaTurma.length > 0 && (
            <Card className="p-4">
              <Text className="font-semibold mb-3">
                Presença ({alunosPresentes.length}/{alunosDaTurma.length})
              </Text>

              {alunosDaTurma.map((aluno, i) => {
                const ativo = alunosPresentes.includes(aluno);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => toggleAlunoPresenca(aluno)}
                    className={`flex-row items-center p-3 mb-2 rounded-lg ${ativo ? 'bg-blue-50' : 'bg-gray-100'
                      }`}
                  >
                    {ativo
                      ? <CheckSquare size={22} color="#2563eb" />
                      : <Square size={22} color="#9ca3af" />
                    }
                    <Text className="ml-3">{aluno}</Text>
                  </TouchableOpacity>
                );
              })}
            </Card>
          )}

          <Input
            label="Visitantes"
            value={visitantes}
            onChangeText={setVisitantes}
            multiline
          />
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View className="border-t px-4 py-3 flex-row">
        {id && (
          <Button
            variant="danger"
            className="flex-1 mr-2"
            onPress={handleDelete}
          >
            <Trash2 size={18} color="white" />
            <Text className="text-white ml-2">Excluir</Text>
          </Button>
        )}

        <Button className="flex-1" onPress={handleSave}>
          <Save size={18} color="white" />
          <Text className="text-white ml-2">
            {id ? 'Atualizar' : 'Salvar'}
          </Text>
        </Button>
      </View>

      {/* MODAL CONFIRMAÇÃO */}
      {showDeleteModal && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white w-4/5 rounded-2xl p-5">
            <Text className="text-lg font-bold mb-2">
              Confirmar exclusão
            </Text>

            <Text className="text-gray-600 mb-5">
              Tem certeza que deseja excluir este registro?
              Essa ação não pode ser desfeita.
            </Text>

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100"
              >
                <Text className="font-semibold text-gray-700">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600"
              >
                <Text className="font-semibold text-white">
                  Excluir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
