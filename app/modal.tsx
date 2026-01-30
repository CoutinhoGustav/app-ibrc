import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, CheckSquare, Save, Square, Trash2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
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

/* ================= TURMAS PERMITIDAS ================= */
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
  const [errors, setErrors] = useState({ turma: false, professor: false, data: false });

  const alunosDaTurma = turma ? alunosData[turma] || [] : [];

  /* ================= LOAD REGISTRO ================= */
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
      prev.includes(aluno) ? prev.filter(a => a !== aluno) : [...prev, aluno]
    );
  };

  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setData(selectedDate);
  };

  const clearError = (field: 'turma' | 'professor' | 'data') => {
    setErrors(prev => ({ ...prev, [field]: false }));
  };

  const handleSave = () => {
    const newErrors = { turma: !turma, professor: !professor, data: !data };
    setErrors(newErrors);

    if (newErrors.turma || newErrors.professor || newErrors.data) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

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
    if (!id) return;
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            removeRegistro(Number(id));
            router.back();
          },
        },
      ]
    );
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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

          {/* TURMA */}
          <Select
            label="Turma *"
            placeholder="Selecione"
            value={turma}
            options={turmaOptions}
            onValueChange={v => { setTurma(v); clearError('turma'); }}
            error={errors.turma ? 'Campo obrigatório' : undefined}
            containerClassName="rounded-lg" // opcional
          />



          {/* PROFESSOR */}
          <Input
            label="Professor *"
            value={professor}
            onChangeText={t => { setProfessor(t); clearError('professor'); }}
            className={`border rounded-lg px-4 py-3 ${errors.professor ? 'border-red-500' : 'border-gray-300'}`}
            error={errors.professor ? 'Campo obrigatório' : undefined}
          />




          {/* DATA */}
          <View>
            <Text className="text-sm mb-1">Data *</Text>
            <TouchableOpacity
              onPress={() => { setShowDatePicker(true); clearError('data'); }}
              className={`flex-row items-center border rounded-lg px-4 py-3 ${errors.data ? 'border-red-500' : 'border-gray-300'}`}
            >
              <Calendar size={18} color="#6b7280" />
              <Text className="ml-3">{data.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>
            {errors.data && <Text className="text-red-500 text-sm mt-1">Campo obrigatório</Text>}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={data}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          {/* PRESENÇA */}
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
                    className={`flex-row items-center p-3 mb-2 rounded-lg ${ativo ? 'bg-blue-50' : 'bg-gray-100'}`}
                  >
                    {ativo ? (
                      <CheckSquare size={22} color="#2563eb" />
                    ) : (
                      <Square size={22} color="#9ca3af" />
                    )}
                    <Text className="ml-3">{aluno}</Text>
                  </TouchableOpacity>
                );
              })}
            </Card>
          )}

          {/* VISITANTES */}
          <Input
            label="Visitantes"
            value={visitantes}
            onChangeText={setVisitantes}
            multiline
            className="border rounded-lg px-4 py-3 border-gray-300"
          />
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View className="border-t px-4 py-3 flex-row justify-between items-center">
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
        <Button
          className={id ? 'flex-1' : ''}
          onPress={handleSave}
        >
          <Save size={18} color="white" />
          <Text className="text-white ml-2">{id ? 'Atualizar' : 'Salvar'}</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
