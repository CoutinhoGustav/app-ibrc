import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "../lib/api";

/* =========================
   TIPOS
========================= */

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (newData: Partial<User>) => Promise<void>;
  updateAvatar: (uri: string) => Promise<void>;
  removeAvatar: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =========================
   PROVIDER
========================= */

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =========================
       LOAD USER ON INIT
    ========================= */

  useEffect(() => {
    async function loadUser() {
      try {
        const storedUser = await AsyncStorage.getItem("@user");
        const token = await AsyncStorage.getItem("@auth_token");

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        } else if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        setError("Erro ao carregar dados do usuário");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  /* =========================
       LOGIN
    ========================= */

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login(email, password);
      const { data, accessToken, refreshToken } = response.data;

      // Store tokens
      await AsyncStorage.setItem("@auth_token", accessToken);
      await AsyncStorage.setItem("@refresh_token", refreshToken);
      await AsyncStorage.setItem("@user", JSON.stringify(data));

      setUser(data);
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erro ao fazer login";
      setError(errorMsg);
      console.error("Login error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* =========================
       LOGOUT
    ========================= */

  const logout = async () => {
    setLoading(true);
    try {
      await apiService.logout();
    } catch (err) {
      console.error("Erro ao fazer logout na API:", err);
    } finally {
      await AsyncStorage.removeItem("@user");
      await AsyncStorage.removeItem("@auth_token");
      await AsyncStorage.removeItem("@refresh_token");
      setUser(null);
      setLoading(false);
      router.replace("/login");
    }
  };

  /* =========================
       UPDATE USER
    ========================= */

  const updateUser = async (newData: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(newData);
      const updatedUser = response.data?.data || response.data;

      if (!updatedUser) {
        throw new Error("Dados de usuário não retornados pela API");
      }

      // Merge com dados atuais para garantir que não percamos campos
      const fullUser = { ...user, ...updatedUser };

      await AsyncStorage.setItem("@user", JSON.stringify(fullUser));
      setUser(fullUser);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Erro ao atualizar perfil";
      setError(errorMsg);
      console.error("Update user error:", err);
    }
  };

  /* =========================
       UPDATE AVATAR (ATALHO)
    ========================= */

  const updateAvatar = async (uri: string) => {
    await updateUser({ avatar: uri });
  };

  const removeAvatar = async () => {
    await updateUser({ avatar: "" });
  };

  /* =========================
       CHANGE PASSWORD
    ========================= */

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user?.email) return false;
    try {
      await apiService.updatePassword({
        email: user.email,
        currentPassword,
        newPassword
      });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erro ao atualizar senha";
      setError(errorMsg);
      console.error("Change password error:", err);
      return false;
    }
  };

  /* =========================
       DELETE ACCOUNT
    ========================= */

  const deleteAccount = async () => {
    setLoading(true);
    try {
      // await apiService.deleteAccount(); // Uncomment when backend is ready
      await AsyncStorage.removeItem("@user");
      await AsyncStorage.removeItem("@auth_token");
      await AsyncStorage.removeItem("@refresh_token");
      setUser(null);
      router.replace("/login");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erro ao deletar conta";
      setError(errorMsg);
      console.error("Delete account error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
       PROVIDER
    ========================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        updateAvatar,
        removeAvatar,
        changePassword,
        deleteAccount,
        loading,
        error,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

/* =========================
   HOOK
========================= */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};
