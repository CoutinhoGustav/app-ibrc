import * as ImagePicker from 'expo-image-picker';
import { Bell, Camera, Eye, EyeOff, LogOut, Moon, Shield, Sun, Trash2, User as UserIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
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
    const { user } = useAuth();
    const { colorScheme } = useColorScheme();
    const { setUserTheme } = useTheme();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const [successProfile, setSuccessProfile] = useState(false);
    const [successPassword, setSuccessPassword] = useState(false);
    const [updatingAvatar, setUpdatingAvatar] = useState(false);
    const [successAvatar, setSuccessAvatar] = useState(false);

    const [notifEmail, setNotifEmail] = useState(true);
    const [notifSistema, setNotifSistema] = useState(false);

    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const { logout, deleteAccount, updateUser, changePassword, updateAvatar, removeAvatar } = useAuth();

    // Funções para lidar com modais
    const handleLogout = async () => {
        setLogoutModalVisible(false);
        await logout();
    };

    const handleDeleteAccount = async () => {
        setDeleteModalVisible(false);
        await deleteAccount();
    };

    const handleSaveProfile = async () => {
        setUpdatingProfile(true);
        try {
            await updateUser({ name, email });
            setSuccessProfile(true);
            setTimeout(() => setSuccessProfile(false), 3000);
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setUpdatingAvatar(true);
            try {
                await updateAvatar(result.assets[0].uri);
                setSuccessAvatar(true);
                setTimeout(() => setSuccessAvatar(false), 3000);
            } catch (error) {
                console.error('Erro ao atualizar avatar:', error);
            } finally {
                setUpdatingAvatar(false);
            }
        }
    };

    const handleRemoveAvatar = async () => {
        setUpdatingAvatar(true);
        try {
            await removeAvatar();
            setSuccessAvatar(true);
            setTimeout(() => setSuccessAvatar(false), 3000);
        } catch (error) {
            console.error('Erro ao remover avatar:', error);
        } finally {
            setUpdatingAvatar(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword) return;
        setUpdatingPassword(true);
        try {
            const success = await changePassword(currentPassword, newPassword);
            if (success) {
                setSuccessPassword(true);
                setCurrentPassword('');
                setNewPassword('');
                setTimeout(() => setSuccessPassword(false), 3000);
            }
        } catch (error) {
            console.error('Erro ao atualizar senha:', error);
        } finally {
            setUpdatingPassword(false);
        }
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} className="flex-1 bg-gray-50 dark:bg-slate-950">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Header */}
                <View className="px-4 pt-10 pb-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
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
                        <View className="flex-row items-center mb-6">
                            <TouchableOpacity
                                onPress={handlePickImage}
                                disabled={updatingAvatar}
                                className="relative"
                            >
                                <View className="w-20 h-20 bg-gray-200 dark:bg-slate-800 rounded-full items-center justify-center mr-4 border-2 border-blue-500/20">
                                    {user?.avatar ? (
                                        <Image
                                            source={{ uri: user.avatar }}
                                            className="w-20 h-20 rounded-full"
                                        />
                                    ) : (
                                        <UserIcon size={40} color={colorScheme === 'dark' ? '#94a3b8' : '#9ca3af'} />
                                    )}
                                    {updatingAvatar && (
                                        <View className="absolute inset-0 bg-black/30 rounded-full items-center justify-center">
                                            <ActivityIndicator color="#fff" size="small" />
                                        </View>
                                    )}
                                    {user?.avatar && (
                                        <View className="absolute -top-1 -right-1">
                                            <TouchableOpacity
                                                onPress={handleRemoveAvatar}
                                                disabled={updatingAvatar}
                                                className="bg-red-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm"
                                            >
                                                <Trash2 size={10} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                                <View className="absolute bottom-0 right-3 bg-blue-600 w-7 h-7 rounded-full items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                                    <Camera size={14} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            <View className="flex-1">
                                <Text className="text-xl font-black text-gray-900 dark:text-white leading-tight">{user?.name}</Text>
                                <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">{user?.email}</Text>
                                {successAvatar && (
                                    <Text className="text-[10px] text-green-500 font-bold uppercase mt-1">
                                        {user?.avatar ? 'Foto atualizada!' : 'Foto removida!'}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <Input
                            label="Nome"
                            placeholder="Seu nome"
                            value={name}
                            onChangeText={setName}
                        />
                        <Input
                            label="E-mail"
                            placeholder="seu@email.com"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <Button
                            className="mt-2"
                            onPress={handleSaveProfile}
                            disabled={updatingProfile}
                        >
                            {updatingProfile ? 'Salvando...' : successProfile ? 'Perfil Atualizado!' : 'Salvar Alterações'}
                        </Button>
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
                        <View className="relative">
                            <Input
                                label="Senha Atual"
                                placeholder="••••••••"
                                secureTextEntry={!showCurrentPassword}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-10"
                            >
                                {showCurrentPassword ? (
                                    <EyeOff size={20} color="#94a3b8" />
                                ) : (
                                    <Eye size={20} color="#94a3b8" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className="relative">
                            <Input
                                label="Nova Senha"
                                placeholder="••••••••"
                                secureTextEntry={!showNewPassword}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-10"
                            >
                                {showNewPassword ? (
                                    <EyeOff size={20} color="#94a3b8" />
                                ) : (
                                    <Eye size={20} color="#94a3b8" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Button
                            variant="outline"
                            onPress={handleUpdatePassword}
                            disabled={updatingPassword}
                        >
                            {updatingPassword ? 'Atualizando...' : successPassword ? 'Senha Atualizada!' : 'Atualizar Senha'}
                        </Button>
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
                    <View className="flex-1 justify-center items-center bg-black/60 px-6">
                        <View className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                            <View className="items-center mb-6">
                                <View className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                                    <LogOut size={32} color="#ef4444" />
                                </View>
                                <Text className="text-xl font-bold text-gray-900 dark:text-white">Sair da Conta</Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">Deseja realmente sair do aplicativo?</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 rounded-2xl items-center"
                                    onPress={() => setLogoutModalVisible(false)}
                                >
                                    <Text className="font-semibold text-gray-700 dark:text-gray-300">Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 py-4 bg-red-500 rounded-2xl items-center shadow-lg shadow-red-200"
                                    onPress={handleLogout}
                                >
                                    <Text className="font-semibold text-white">Sair</Text>
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
                    <View className="flex-1 justify-center items-center bg-black/60 px-6">
                        <View className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                            <View className="items-center mb-6">
                                <View className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4">
                                    <Trash2 size={32} color="#ef4444" />
                                </View>
                                <Text className="text-xl font-bold text-gray-900 dark:text-white">Excluir Conta</Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">Esta ação é irreversível e todos os seus dados serão perdidos.</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 rounded-2xl items-center"
                                    onPress={() => setDeleteModalVisible(false)}
                                >
                                    <Text className="font-semibold text-gray-700 dark:text-gray-300">Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 py-4 bg-red-500 rounded-2xl items-center shadow-lg shadow-red-200"
                                    onPress={handleDeleteAccount}
                                >
                                    <Text className="text-white font-semibold">Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
}
