import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        setError(false);
        setLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                router.replace('/(tabs)' as any);
            } else {
                setError(true);
            }
        } catch (e) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="flex-1 p-4 justify-center">

                        {/* LOGO */}
                        <View className="items-center mb-6">
                            <Image
                                source={require('../assets/images/ibrc.png')}
                                className="w-24 h-24 mb-3"
                                resizeMode="contain"
                            />

                            <Text className="text-2xl font-extrabold text-gray-900">
                                IBRC
                            </Text>
                            <Text className="text-sm text-gray-500 font-medium">
                                Acesso ao sistema
                            </Text>
                        </View>

                        {/* CARD LOGIN */}
                        <Card className="p-4">
                            <Input
                                label="E-mail"
                                placeholder="exemplo@exemplo.com.br"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />

                            <Input
                                label="Senha"
                                placeholder="••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            {error && (
                                <Text className="text-red-500 text-sm font-bold mb-4 text-center">
                                    E-mail ou senha inválidos
                                </Text>
                            )}

                            <Button onPress={handleLogin} loading={loading}>
                                Entrar
                            </Button>
                        </Card>

                        {/* FOOTER */}
                        <View className="flex-row justify-center mt-6">
                            <Text className="text-gray-500 font-medium">
                                Não tem conta?{' '}
                            </Text>
                            <Button
                                variant="ghost"
                                className="p-0 h-auto"
                                textClassName="text-blue-600 font-bold"
                                onPress={() => router.push('/cadastro' as any)}
                            >
                                Cadastrar
                            </Button>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
