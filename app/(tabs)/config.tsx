import { Bell, LogOut, Moon, Shield, Sun, Trash2, User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import {
    Image,
    Modal,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ConfigScreen() {
    const { user, logout, deleteAccount } = useAuth();
    const { colorScheme } = useColorScheme();
    const { setUserTheme } = useTheme();

    const [notifEmail, setNotifEmail] = useState(true);
    const [notifSistema, setNotifSistema] = useState(false);

    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Funções para lidar com modais
    const handleLogout = async () => {
        setLogoutModalVisible(false);
        await logout();
    };

    const handleDeleteAccount = async () => {
        setDeleteModalVisible(false);
        await deleteAccount();
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-950">
            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Text className="text-2xl font-black text-gray-900 dark:text-white">Configurações</Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">Sua conta e preferências</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Aparência (Tema) */}
                <Card className="mb-4">
                    <View className="flex-row items-center mb-4">
                        {colorScheme === 'dark' ? (
                            <Moon size={20} color="#3b82f6" />
                        ) : (
                            <Sun size={20} color="#eab308" />
                        )}
                        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">Aparência</Text>
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => setUserTheme('light')}
                            className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border-2 ${colorScheme === 'light'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-100 bg-gray-50'
                                }`}
                        >
                            <Sun size={18} color={colorScheme === 'light' ? '#2563eb' : '#64748b'} />
                            <Text className={`ml-2 font-bold ${colorScheme === 'light' ? 'text-blue-600' : 'text-gray-500'
                                }`}>Claro</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setUserTheme('dark')}
                            className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border-2 ${colorScheme === 'dark'
                                ? 'border-blue-500 bg-blue-900/20'
                                : 'border-gray-100 bg-gray-50'
                                }`}
                        >
                            <Moon size={18} color={colorScheme === 'dark' ? '#3b82f6' : '#64748b'} />
                            <Text className={`ml-2 font-bold ${colorScheme === 'dark' ? 'text-blue-400' : 'text-gray-500'
                                }`}>Escuro</Text>
                        </TouchableOpacity>
                    </View>
                </Card>
                {/* Informações do usuário */}
                <Card className="mb-4">
                    <View className="flex-row items-center mb-4">
                        <View className="w-14 h-14 bg-gray-200 dark:bg-slate-800 rounded-full items-center justify-center mr-3">
                            {user?.avatar ? (
                                <Image
                                    source={{ uri: user.avatar }}
                                    className="w-14 h-14 rounded-full"
                                />
                            ) : (
                                <User size={28} color={colorScheme === 'dark' ? '#94a3b8' : '#9ca3af'} />
                            )}
                        </View>
                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</Text>
                        </View>
                    </View>

                    <Input label="Nome" placeholder="Seu nome" defaultValue={user?.name} />
                    <Input label="E-mail" placeholder="seu@email.com" defaultValue={user?.email} />

                    <Button className="mt-2">Salvar Alterações</Button>
                </Card>

                {/* Notificações */}
                <Card className="mb-4">
                    <View className="flex-row items-center mb-4">
                        <Bell size={20} color="#2563eb" />
                        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">Notificações</Text>
                    </View>

                    <View className="flex-row items-center justify-between py-3 border-b border-gray-50 dark:border-slate-800">
                        <Text className="text-gray-700 dark:text-gray-300">Notificações por e-mail</Text>
                        <Switch value={notifEmail} onValueChange={setNotifEmail} />
                    </View>

                    <View className="flex-row items-center justify-between py-3">
                        <Text className="text-gray-700 dark:text-gray-300">Notificações do sistema</Text>
                        <Switch value={notifSistema} onValueChange={setNotifSistema} />
                    </View>
                </Card>

                {/* Segurança */}
                <Card className="mb-4">
                    <View className="flex-row items-center mb-4">
                        <Shield size={20} color="#2563eb" />
                        <Text className="text-lg font-bold text-gray-900 dark:text-white ml-2">Segurança</Text>
                    </View>
                    <Input label="Nova Senha" placeholder="••••••••" secureTextEntry />
                    <Button variant="outline">Atualizar Senha</Button>
                </Card>

                {/* Ações */}
                <View className="gap-4 mb-10">
                    {/* Logout */}
                    <Button
                        variant="ghost"
                        className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800"
                        textClassName="text-red-500"
                        onPress={() => setLogoutModalVisible(true)}
                    >
                        <LogOut size={20} color="#ef4444" />
                        <Text className="ml-2">Sair da Conta</Text>
                    </Button>

                    {/* Excluir Conta */}
                    <TouchableOpacity
                        className="flex-row items-center justify-center p-4"
                        onPress={() => setDeleteModalVisible(true)}
                    >
                        <Trash2 size={18} color="#ef4444" />
                        <Text className="text-red-500 font-bold ml-2">Excluir minha conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal de Logout */}
            <Modal
                visible={logoutModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-80">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Tem certeza que deseja sair?
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-400 mb-6">
                            Você será desconectado da sua conta atual.
                        </Text>

                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={() => setLogoutModalVisible(false)}
                                className="flex-1 mr-2 bg-gray-100 dark:bg-slate-800 rounded-lg py-3 items-center"
                            >
                                <Text className="text-gray-700 dark:text-gray-300 font-semibold">Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleLogout}
                                className="flex-1 ml-2 bg-red-500 rounded-lg py-3 items-center"
                            >
                                <Text className="text-white font-semibold">Sair</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Delete Account */}
            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeleteModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-80">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Tem certeza que deseja excluir sua conta?
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-400 mb-6">
                            Esta ação é irreversível e todos os seus dados serão perdidos.
                        </Text>

                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={() => setDeleteModalVisible(false)}
                                className="flex-1 mr-2 bg-gray-100 dark:bg-slate-800 rounded-lg py-3 items-center"
                            >
                                <Text className="text-gray-700 dark:text-gray-300 font-semibold">Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDeleteAccount}
                                className="flex-1 ml-2 bg-red-500 rounded-lg py-3 items-center"
                            >
                                <Text className="text-white font-semibold">Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
