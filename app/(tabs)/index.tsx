import { useRouter } from "expo-router";
import { Calendar, Plus, Users } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useData } from "../../context/DataContext";

// Função para remover acentos e normalizar string
const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function HomeScreen() {
  const { registros } = useData();
  const router = useRouter();

  const [search, setSearch] = useState("");

  // Ordena os registros do mais recente para o mais antigo (usa a data para suportar ids string/number)
  const registrosOrdenados = useMemo(() => {
    return [...registros].sort((a, b) => {
      const parseDateToTime = (dateStr: string) => {
        const parts = dateStr.split("/");
        if (parts.length !== 3) return 0;
        const [d, m, y] = parts;
        return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
      };

      const ta = parseDateToTime(a.data);
      const tb = parseDateToTime(b.data);
      return tb - ta;
    });
  }, [registros]);

  // Filtra os registros pelo campo de busca: turma, professor, ano ou data parcial
  const registrosFiltrados = useMemo(() => {
    if (!search.trim()) return registrosOrdenados;

    const searchNormalized = normalizeString(search);

    return registrosOrdenados.filter((r) => {
      const turmaNormalized = normalizeString(r.turma);
      const professorNormalized = normalizeString(r.professor);
      const dataNormalized = normalizeString(r.data); // ex: "15/01/2026"
      const ano = r.data.split("/")[2]; // extrai ano

      return (
        turmaNormalized.includes(searchNormalized) ||
        professorNormalized.includes(searchNormalized) ||
        dataNormalized.includes(searchNormalized) || // busca parcial por data
        ano.includes(searchNormalized)
      );
    });
  }, [search, registrosOrdenados]);

  const renderItem = ({ item }: { item: any }) => (
    <Card className="mb-3 p-3">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-bold text-gray-900">
            {item.turma}
          </Text>
          <Text className="text-gray-500 text-xs">Prof. {item.professor}</Text>
        </View>
        <View className="bg-blue-100 px-2 py-1 rounded-full">
          <Text className="text-blue-700 text-xs font-bold">
            {item.presentes}/{item.total}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mt-2 pt-2 border-t border-gray-50">
        <View className="flex-row items-center mr-3">
          <Calendar size={12} color="#6b7280" />
          <Text className="text-gray-500 text-xs ml-1">{item.data}</Text>
        </View>
        <View className="flex-row items-center flex-1">
          <Users size={12} color="#6b7280" />
          <Text
            className="text-gray-500 text-xs ml-1 truncate"
            numberOfLines={1}
          >
            {item.visitantes !== "-"
              ? `Visitantes: ${item.visitantes}`
              : "Sem visitantes"}
          </Text>
        </View>
        <Button
          variant="ghost"
          className="p-0 h-auto ml-2"
          textClassName="text-blue-600 text-xs font-bold"
          onPress={() =>
            router.push({ pathname: "/modal" as any, params: { id: item.id } })
          }
        >
          Editar
        </Button>
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-xl font-black text-gray-900">IBRC</Text>
            <Text className="text-xs text-gray-500 font-medium">
              Lista de Presenças
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/modal" as any)}
            className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/30"
          >
            <Plus size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* CAMPO DE PESQUISA */}
        <TextInput
          placeholder="Pesquisar turma, professor, data ou ano..."
          value={search}
          onChangeText={setSearch}
          className="border border-gray-200 rounded-lg px-4 py-2 text-gray-900"
        />
      </View>

      <FlatList
        data={registrosFiltrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-400 text-sm font-medium">
              Nenhum registro encontrado
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
