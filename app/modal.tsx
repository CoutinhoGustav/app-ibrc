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
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
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
    // Android envia event.type = 'set' | 'dismissed'.
    // Alguns ambientes podem disparar onChange ao montar; só fechamos quando houver uma ação do usuário.
    if (Platform.OS === "android") {
      if (!event) return; // evento inicial, ignorar
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

    // iOS inline/compact: atualiza data quando houver seleção
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

      // Mostra tela de sucesso
      setIsSaving(false);
      setIsSaved(true);

      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (err) {
      console.error("Erro ao salvar registro:", err);
      setIsSaving(false);
      // Aqui você pode mostrar um alerta/toast de erro
    }
  };

  const confirmDelete = async () => {
    if (!idParam) {
      setDeleteError("ID inválido para exclusão");
      return;
    }

    if (isDeleting) return; // evita múltiplos envios

    setDeleteError(null);
    setIsDeleting(true);
    try {
      // Passa o id (string ou number) para o contexto que lida com a chamada ao backend
      await removeRegistro(idParam);

      // sucesso: fecha modal e mostra overlay de confirmação
      setShowDeleteModal(false);
      setIsDeleting(false);
      setIsDeleted(true);

      // Limpa possíveis estados locais relacionados ao registro atual

      setTimeout(() => {
        setIsDeleted(false);
        router.back();
      }, 900);
    } catch (err: any) {
      console.error("Erro ao excluir registro:", err);
      setDeleteError(err?.message || "Erro ao excluir registro");
      setIsDeleting(false);
      // mantém a modal aberta para que o usuário possa tentar novamente
    }
  };

  /* ================= UI ================= */

  const MONTH_NAMES = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const webDaysInMonth = new Date(webYear, webMonth + 1, 0).getDate();
  const webFirstDay = new Date(webYear, webMonth, 1).getDay();
  const webPrevMonthDays = new Date(webYear, webMonth, 0).getDate();

  // animações para seleção e confirmação no calendário web
  const animatedScale = useRef(new Animated.Value(1)).current;
  const animatedConfirmScale = useRef(new Animated.Value(1)).current;
  const [animatedDay, setAnimatedDay] = useState<number | null>(null);

  // Monta array de células para preencher semanas completas (6 linhas possíveis)
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
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View className="border-b border-gray-200 px-4 py-3 flex-row justify-between items-center">
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
              className={`flex-row items-center border rounded-lg px-4 py-3 ${
                errors.data ? "border-red-500" : "border-gray-300"
              }`}
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
                    className={`flex-row items-center p-3 mb-2 rounded-lg ${
                      ativo ? "bg-blue-50" : "bg-gray-100"
                    }`}
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

          <Input
            label="Visitantes"
            value={visitantes}
            onChangeText={setVisitantes}
            multiline
            className="min-h-[96px] text-sm"
            containerClassName="mb-6"
          />
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View className="border-t px-4 py-3 flex-row">
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

      {/* MODAL CONFIRMAÇÃO */}
      {showDeleteModal && (
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={() => !isDeleting && setShowDeleteModal(false)}
        >
          <View className="absolute inset-0 bg-black/50 justify-center items-center">
            <View
              onStartShouldSetResponder={() => true}
              className="bg-white w-4/5 rounded-2xl p-5"
            >
              <Text className="text-lg font-bold mb-2">Confirmar exclusão</Text>

              <Text className="text-gray-600 mb-3">
                Tem certeza que deseja excluir este registro? Essa ação não pode
                ser desfeita.
              </Text>

              {deleteError && (
                <Text className="text-red-500 mb-3 text-center">
                  {deleteError}
                </Text>
              )}

              {/* BOTÕES CENTRALIZADOS */}
              <View className="flex-row justify-center gap-4">
                <Button
                  variant="secondary"
                  className="min-w-[110px]"
                  onPress={() => !isDeleting && setShowDeleteModal(false)}
                >
                  Cancelar
                </Button>

                <Button
                  variant="danger"
                  className="min-w-[110px]"
                  loading={isDeleting}
                  onPress={confirmDelete}
                >
                  Excluir
                </Button>
              </View>
            </View>
          </View>
        </Pressable>
      )}

      {/* OVERLAYS: SALVANDO / SUCESSO (renderizados por último para garantir prioridade) */}
      {isSaving && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 items-center w-11/12 max-w-xs">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-4 font-semibold">Salvando...</Text>
          </View>
        </View>
      )}

      {isSaved && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 items-center w-11/12 max-w-xs">
            <View className="bg-green-100 rounded-full p-3 mb-3">
              <CheckSquare size={36} color="#16a34a" />
            </View>
            <Text className="font-semibold text-lg">
              Registro salvo com sucesso!
            </Text>
          </View>
        </View>
      )}

      {/* Excluído com sucesso */}
      {isDeleted && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 items-center w-11/12 max-w-xs">
            <View className="bg-green-100 rounded-full p-3 mb-3">
              <CheckSquare size={36} color="#16a34a" />
            </View>
            <Text className="font-semibold text-lg">Registro excluído</Text>
          </View>
        </View>
      )}

      {/* Deletando (overlay) */}
      {isDeleting && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 items-center w-11/12 max-w-xs">
            <ActivityIndicator size="large" color="#ef4444" />
            <Text className="mt-4 font-semibold">Excluindo...</Text>
          </View>
        </View>
      )}

      {/* Calendário web (overlay deslocado para não impactar layout) */}
      {showDatePicker && Platform.OS === "web" && (
        <View
          pointerEvents="auto"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          <View className="absolute inset-0 bg-black/50 justify-center items-center p-4">
            <View className="bg-white rounded-2xl p-4 w-full max-w-md">
              <View className="flex-row items-center justify-between mb-3">
                <TouchableOpacity
                  onPress={() => {
                    if (webMonth === 0) {
                      setWebMonth(11);
                      setWebYear((y) => y - 1);
                    } else {
                      setWebMonth((m) => m - 1);
                    }
                  }}
                  className="px-3 py-1"
                >
                  <Text className="text-lg">‹</Text>
                </TouchableOpacity>

                <Text className="font-semibold text-lg">
                  {MONTH_NAMES[webMonth]} {webYear}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    if (webMonth === 11) {
                      setWebMonth(0);
                      setWebYear((y) => y + 1);
                    } else {
                      setWebMonth((m) => m + 1);
                    }
                  }}
                  className="px-3 py-1"
                >
                  <Text className="text-lg">›</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                  <Text
                    key={d}
                    className="flex-1 text-center text-sm text-gray-600"
                  >
                    {d}
                  </Text>
                ))}
              </View>

              <View className="flex-row flex-wrap">
                {webCells.map((cell, idx) => {
                  const { day, offset } = cell;
                  const isCurrent = offset === 0;
                  const isSelected = isCurrent && day === webSelectedDay;

                  const handleDayPress = () => {
                    // navega entre meses se clicar em dia adjacente
                    if (offset === -1) {
                      if (webMonth === 0) {
                        setWebMonth(11);
                        setWebYear((y) => y - 1);
                      } else setWebMonth((m) => m - 1);
                    } else if (offset === 1) {
                      if (webMonth === 11) {
                        setWebMonth(0);
                        setWebYear((y) => y + 1);
                      } else setWebMonth((m) => m + 1);
                    }

                    setWebSelectedDay(day);

                    // anima seleção
                    setAnimatedDay(day);
                    animatedScale.setValue(0.7);
                    Animated.spring(animatedScale, {
                      toValue: 1,
                      useNativeDriver: true,
                    }).start(() => setAnimatedDay(null));
                  };

                  const cellTextClass = isCurrent
                    ? isSelected
                      ? "text-white"
                      : "text-gray-800"
                    : "text-gray-400";
                  const cellBgClass = isSelected ? "bg-blue-600" : "";

                  return (
                    <TouchableOpacity
                      key={`cell-${idx}`}
                      onPress={handleDayPress}
                      style={{ width: `${100 / 7}%` }}
                      className="p-1 items-center"
                    >
                      <Animated.View
                        style={
                          animatedDay === day
                            ? { transform: [{ scale: animatedScale }] }
                            : undefined
                        }
                        className={`w-10 h-10 items-center justify-center rounded-full ${cellBgClass}`}
                      >
                        <Text className={`${cellTextClass}`}>{day}</Text>
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="flex-row justify-end gap-3 mt-4">
                <Button
                  variant="secondary"
                  className="px-4 py-2"
                  onPress={() => setShowDatePicker(false)}
                >
                  Cancelar
                </Button>

                <Animated.View
                  style={{ transform: [{ scale: animatedConfirmScale }] }}
                >
                  <Button
                    className="px-4 py-2"
                    onPress={() => {
                      Animated.sequence([
                        Animated.timing(animatedConfirmScale, {
                          toValue: 0.95,
                          duration: 80,
                          useNativeDriver: true,
                          easing: Easing.ease,
                        }),
                        Animated.timing(animatedConfirmScale, {
                          toValue: 1,
                          duration: 120,
                          useNativeDriver: true,
                          easing: Easing.ease,
                        }),
                      ]).start();

                      setData(new Date(webYear, webMonth, webSelectedDay));
                      setShowDatePicker(false);
                    }}
                  >
                    Confirmar
                  </Button>
                </Animated.View>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
