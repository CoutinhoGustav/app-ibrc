import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  CheckSquare,
  Save,
  Square,
  Trash2,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { useData } from "../context/DataContext";

/* ================= HELPERS ================= */
const formatDateBR = (date: Date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const parseDateBR = (date: string) => {
  const [d, m, y] = date.split("/");
  return new Date(Number(y), Number(m) - 1, Number(d));
};

/* ================= TURMAS ================= */
const TURMAS_PERMITIDAS = [
  "Berçário",
  "Maternal",
  "Principiantes",
  "Juniores",
  "Intermediários",
  "Jovens",
  "Adultos",
];

/* ================= COMPONENTE ================= */
export default function ModalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const idParam = Array.isArray(id) ? id[0] : id;
  const { registros, addRegistro, updateRegistro, removeRegistro, alunosData } =
    useData();

  const turmaOptions = TURMAS_PERMITIDAS.filter((turma) => alunosData[turma]);

  const [turma, setTurma] = useState("");
  const [professor, setProfessor] = useState("");
  const [data, setData] = useState<Date>(new Date());
  const [visitantes, setVisitantes] = useState("");
  const [alunosPresentes, setAlunosPresentes] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para salvar/excluir com feedback
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estado do calendário web (fallback)
  const [webMonth, setWebMonth] = useState(data.getMonth());
  const [webYear, setWebYear] = useState(data.getFullYear());
  const [webSelectedDay, setWebSelectedDay] = useState<number>(data.getDate());

  const [errors, setErrors] = useState({
    turma: false,
    professor: false,
    data: false,
  });

  const alunosDaTurma = turma ? alunosData[turma] || [] : [];

  /* ================= LOAD ================= */
  useEffect(() => {
    if (idParam) {
      const reg = registros.find((r) => r.id.toString() === idParam);
      if (reg) {
        setTurma(reg.turma);
        setProfessor(reg.professor);
        setData(parseDateBR(reg.data));
        setVisitantes(reg.visitantes === "-" ? "" : reg.visitantes);

        const alunos = alunosData[reg.turma] || [];
        setAlunosPresentes(alunos.slice(0, reg.presentes));
      }
    }
  }, [idParam, registros, alunosData]);

  useEffect(() => {
    if (turma && !idParam) setAlunosPresentes([]);
  }, [turma, idParam]);

  /* ================= HANDLERS ================= */
  const toggleAlunoPresenca = (aluno: string) => {
    setAlunosPresentes((prev) =>
      prev.includes(aluno) ? prev.filter((a) => a !== aluno) : [...prev, aluno],
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (!event) return;
      if (event.type === "dismissed") {
        setShowDatePicker(false);
        return;
      }
      if (event.type === "set") {
        setShowDatePicker(false);
        if (selectedDate) setData(selectedDate);
        return;
      }
      return;
    }
    if (selectedDate) setData(selectedDate);
  };

  const clearError = (field: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const handleSave = async () => {
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
      visitantes: visitantes || "-",
    };

    setIsSaving(true);
    try {
      if (idParam) await updateRegistro({ ...payload, id: idParam as any });
      else await addRegistro(payload);

      setIsSaving(false);
      setIsSaved(true);

      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (err) {
      console.error("Erro ao salvar registro:", err);
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!idParam) {
      setDeleteError("ID inválido para exclusão");
      return;
    }
    if (isDeleting) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await removeRegistro(idParam);
      setShowDeleteModal(false);
      setIsDeleting(false);
      setIsDeleted(true);
      setTimeout(() => {
        setIsDeleted(false);
        router.back();
      }, 900);
    } catch (err: any) {
      console.error("Erro ao excluir registro:", err);
      setDeleteError(err?.message || "Erro ao excluir registro");
      setIsDeleting(false);
    }
  };

  /* ================= UI ================= */
  const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const webDaysInMonth = new Date(webYear, webMonth + 1, 0).getDate();
  const webFirstDay = new Date(webYear, webMonth, 1).getDay();
  const webPrevMonthDays = new Date(webYear, webMonth, 0).getDate();

  const totalCells = Math.ceil((webFirstDay + webDaysInMonth) / 7) * 7;
  const webCells = Array.from({ length: totalCells }).map((_, idx) => {
    const dayNumber = idx - webFirstDay + 1;
    if (dayNumber <= 0)
      return { day: webPrevMonthDays + dayNumber, offset: -1 };
    if (dayNumber > webDaysInMonth)
      return { day: dayNumber - webDaysInMonth, offset: 1 };
    return { day: dayNumber, offset: 0 };
  });

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* HEADER */}
        <View className="border-b border-gray-200 px-4 pt-10 pb-4 flex-row justify-between items-center bg-white">
          <Text className="font-semibold text-gray-800">
            {idParam ? "Editar Registro" : "Novo Registro"}
          </Text>
          <TouchableOpacity onPress={router.back}>
            <X size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!showDatePicker}
        >
          <View className="p-4 gap-4">
            <Select
              label="Turma *"
              placeholder="Selecione"
              value={turma}
              options={turmaOptions}
              onValueChange={(v) => {
                setTurma(v);
                clearError("turma");
              }}
              error={errors.turma ? "Campo obrigatório" : undefined}
            />

            <Input
              label="Professor *"
              value={professor}
              onChangeText={(t) => {
                setProfessor(t);
                clearError("professor");
              }}
              error={errors.professor ? "Campo obrigatório" : undefined}
            />

            <View>
              <Text className="text-sm mb-1">Data *</Text>
              <TouchableOpacity
                onPress={() => {
                  setWebMonth(data.getMonth());
                  setWebYear(data.getFullYear());
                  setWebSelectedDay(data.getDate());
                  setShowDatePicker(true);
                  clearError("data");
                }}
                className={`flex-row items-center border rounded-lg px-4 py-3 ${errors.data ? "border-red-500" : "border-gray-300"}`}
              >
                <Calendar size={18} color="#6b7280" />
                <Text className="ml-3">{data.toLocaleDateString("pt-BR")}</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && Platform.OS !== "web" && (
              <DateTimePicker
                value={data}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
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
                      className={`flex-row items-center p-3 mb-2 rounded-lg ${ativo ? "bg-blue-50" : "bg-gray-100"}`}
                    >
                      {ativo ? <CheckSquare size={22} color="#2563eb" /> : <Square size={22} color="#9ca3af" />}
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
              className="min-h-[96px] text-sm"
              containerClassName="mb-10"
            />
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View className="border-t px-4 py-4 flex-row bg-white">
          {idParam && (
            <Button
              variant="danger"
              className="flex-1 mr-2"
              onPress={() => setShowDeleteModal(true)}
            >
              <Trash2 size={18} color="white" />
              <Text className="text-white ml-2">Excluir</Text>
            </Button>
          )}
          <Button
            className="flex-1"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving || isSaved}
          >
            {!isSaving && <Save size={18} color="white" />}
            <Text className="text-white ml-2">
              {idParam ? "Atualizar" : "Salvar"}
            </Text>
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* OVERLAYS */}
      {showDeleteModal && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <View className="bg-white w-4/5 rounded-2xl p-5 shadow-2xl">
            <Text className="text-lg font-bold mb-2">Confirmar exclusão</Text>
            <Text className="text-gray-600 mb-6">Tem certeza que deseja excluir este registro?</Text>
            <View className="flex-row justify-center gap-4">
              <Button variant="secondary" className="min-w-[110px]" onPress={() => !isDeleting && setShowDeleteModal(false)}>Cancelar</Button>
              <Button variant="danger" className="min-w-[110px]" loading={isDeleting} onPress={confirmDelete}>Excluir</Button>
            </View>
          </View>
        </View>
      )}

      {(isSaving || isSaved || isDeleting || isDeleted) && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-[60]">
          <View className="bg-white rounded-2xl p-8 items-center w-11/12 max-w-xs shadow-2xl">
            {isSaving || isDeleting ? (
              <>
                <ActivityIndicator size="large" color={isSaving ? "#2563eb" : "#ef4444"} />
                <Text className="mt-4 font-bold">{isSaving ? "Salvando..." : "Excluindo..."}</Text>
              </>
            ) : (
              <>
                <View className="bg-green-100 rounded-full p-4 mb-4">
                  <CheckSquare size={40} color="#16a34a" />
                </View>
                <Text className="font-bold text-lg text-center">{isSaved ? "Registro salvo!" : "Registro excluído!"}</Text>
              </>
            )}
          </View>
        </View>
      )}

      {showDatePicker && Platform.OS === "web" && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-[100] p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={() => webMonth === 0 ? (setWebMonth(11), setWebYear(y => y - 1)) : setWebMonth(m => m - 1)} className="p-2"><Text className="text-2xl">‹</Text></TouchableOpacity>
              <Text className="font-bold text-lg">{MONTH_NAMES[webMonth]} {webYear}</Text>
              <TouchableOpacity onPress={() => webMonth === 11 ? (setWebMonth(0), setWebYear(y => y + 1)) : setWebMonth(m => m + 1)} className="p-2"><Text className="text-2xl">›</Text></TouchableOpacity>
            </View>
            <View className="flex-row mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => <Text key={d} className="flex-1 text-center text-xs font-bold text-gray-500">{d}</Text>)}
            </View>
            <View className="flex-row flex-wrap">
              {webCells.map((cell, idx) => {
                const isSelected = cell.offset === 0 && cell.day === webSelectedDay;
                return (
                  <TouchableOpacity key={idx} onPress={() => { if (cell.offset !== 0) return; setWebSelectedDay(cell.day); }} style={{ width: "14.28%" }} className="aspect-square items-center justify-center">
                    <View className={`w-8 h-8 items-center justify-center rounded-full ${isSelected ? "bg-blue-600" : ""}`}>
                      <Text className={`text-sm ${cell.offset === 0 ? (isSelected ? "text-white font-bold" : "text-gray-800") : "text-gray-300"}`}>{cell.day}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="flex-row justify-end gap-3 mt-6">
              <Button variant="secondary" onPress={() => setShowDatePicker(false)}>Cancelar</Button>
              <Button onPress={() => { setData(new Date(webYear, webMonth, webSelectedDay)); setShowDatePicker(false); }}>Confirmar</Button>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
