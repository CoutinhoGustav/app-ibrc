import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export default function CadastroScreen() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCadastro = async () => {
        setLoading(true);
        // Simulating registration
        setTimeout(() => {
            setLoading(false);
            router.back();
        }, 1000);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="flex-1 p-4">
                        <TouchableOpacity onPress={() => router.back()} className="mb-4 w-10 h-10 items-center justify-center">
                            <ArrowLeft size={22} color="#374151" />
                        </TouchableOpacity>

                        <View className="items-center mb-6">
                            <Text className="text-2xl font-extrabold text-gray-900">Cadastro IBRC</Text>
                            <Text className="text-sm text-gray-500 font-medium">Crie sua conta para acessar o sistema</Text>
                        </View>

                        <Card className="p-4">
                            <Input
                                label="Nome Completo"
                                placeholder="Seu nome"
                                value={nome}
                                onChangeText={setNome}
                            />
                            <Input
                                label="E-mail"
                                placeholder="seu@email.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <Input
                                label="Senha"
                                placeholder="••••••••"
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry
                            />

                            <Button
                                onPress={handleCadastro}
                                loading={loading}
                                className="mt-4"
                            >
                                Cadastrar
                            </Button>
                        </Card>

                        <View className="flex-row justify-center mt-6">
                            <Text className="text-gray-500 font-medium">Já tem conta? </Text>
                            <Button variant="ghost" className="p-0 h-auto" textClassName="text-blue-600 font-bold" onPress={() => router.replace('/login' as any)}>
                                Entrar
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
