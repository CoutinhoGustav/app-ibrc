import { Bell, LogOut, Shield, Trash2, User } from 'lucide-react-native';
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

export default function ConfigScreen() {
    const { user, logout, deleteAccount } = useAuth();

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
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-100 bg-white">
                <Text className="text-2xl font-black text-gray-900">Configurações</Text>
                <Text className="text-sm text-gray-500 font-medium">Sua conta e preferências</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Informações do usuário */}
                <Card className="mb-4">
                    <View className="flex-row items-center mb-4">
                        <View className="w-14 h-14 bg-gray-200 rounded-full items-center justify-center mr-3">
                            {user?.avatar ? (
                                <Image
                                    source={{ uri: user.avatar }}
                                    className="w-14 h-14 rounded-full"
                                />
                            ) : (
                                <User size={28} color="#9ca3af" />
                            )}
                        </View>
                        <View>
                            <Text className="text-lg font-bold text-gray-900">{user?.name}</Text>
                            <Text className="text-sm text-gray-500">{user?.email}</Text>
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
                        <Text className="text-lg font-bold text-gray-900 ml-2">Notificações</Text>
                    </View>

                    <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
                        <Text className="text-gray-700">Notificações por e-mail</Text>
                        <Switch value={notifEmail} onValueChange={setNotifEmail} />
                    </View>

                    <View className="flex-row items-center justify-between py-3">
                        <Text className="text-gray-700">Notificações do sistema</Text>
                        <Switch value={notifSistema} onValueChange={setNotifSistema} />
                    </View>
                </Card>

                {/* Segurança */}
                <Card className="mb-4">
                    <View className="flex-row items-center mb-4">
                        <Shield size={20} color="#2563eb" />
                        <Text className="text-lg font-bold text-gray-900 ml-2">Segurança</Text>
                    </View>
                    <Input label="Nova Senha" placeholder="••••••••" secureTextEntry />
                    <Button variant="outline">Atualizar Senha</Button>
                </Card>

                {/* Ações */}
                <View className="gap-4 mb-10">
                    {/* Logout */}
                    <Button
                        variant="ghost"
                        className="bg-white border border-gray-100"
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
                    <View className="bg-white rounded-2xl p-6 w-80">
                        <Text className="text-lg font-bold text-gray-900 mb-2">
                            Tem certeza que deseja sair?
                        </Text>
                        <Text className="text-gray-600 mb-6">
                            Você será desconectado da sua conta atual.
                        </Text>

                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={() => setLogoutModalVisible(false)}
                                className="flex-1 mr-2 bg-gray-100 rounded-lg py-3 items-center"
                            >
                                <Text className="text-gray-700 font-semibold">Cancelar</Text>
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
                    <View className="bg-white rounded-2xl p-6 w-80">
                        <Text className="text-lg font-bold text-gray-900 mb-2">
                            Tem certeza que deseja excluir sua conta?
                        </Text>
                        <Text className="text-gray-600 mb-6">
                            Esta ação é irreversível e todos os seus dados serão perdidos.
                        </Text>

                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={() => setDeleteModalVisible(false)}
                                className="flex-1 mr-2 bg-gray-100 rounded-lg py-3 items-center"
                            >
                                <Text className="text-gray-700 font-semibold">Cancelar</Text>
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
