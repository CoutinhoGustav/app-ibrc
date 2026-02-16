import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance } from "axios";

// ============================================
// API CONFIGURATION
// ============================================

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === "true" || true; // Default true for testing

interface ApiConfig {
  baseURL: string;
  timeout: number;
  useMock: boolean;
}

const config: ApiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  useMock: USE_MOCK,
};

// ============================================
// AXIOS INSTANCE
// ============================================

const api: AxiosInstance = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// REQUEST INTERCEPTOR - JWT TOKEN
// ============================================

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("@auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================
// RESPONSE INTERCEPTOR - REFRESH TOKEN
// ============================================

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle 401 - Token expired, try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem("@refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(`${config.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        await AsyncStorage.setItem("@auth_token", accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        // Refresh failed, clear storage and redirect to login
        await AsyncStorage.removeItem("@auth_token");
        await AsyncStorage.removeItem("@refresh_token");
        await AsyncStorage.removeItem("@user");
        // TODO: Navigate to login screen
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

// ============================================
// API CLASS WITH MOCK SUPPORT
// ============================================

export class ApiService {
  private useMock: boolean;

  constructor(useMock: boolean = config.useMock) {
    this.useMock = useMock;
  }

  // === AUTH ENDPOINTS ===

  async login(email: string, password: string) {
    if (this.useMock) {
      return this.mockLogin(email, password);
    }
    return api.post("/auth/login", { email, password });
  }

  async register(data: { name: string; email: string; password: string }) {
    if (this.useMock) {
      return this.mockRegister(data);
    }
    return api.post("/auth/register", data);
  }

  async refreshToken() {
    if (this.useMock) {
      return this.mockRefreshToken();
    }
    return api.post("/auth/refresh");
  }

  async logout() {
    if (this.useMock) {
      return this.mockLogout();
    }
    return api.post("/auth/logout");
  }

  async getProfile() {
    if (this.useMock) {
      return this.mockGetProfile();
    }
    return api.get("/auth/profile");
  }

  async updateProfile(data: any) {
    if (this.useMock) {
      return this.mockUpdateProfile(data);
    }
    return api.patch("/auth/profile", data);
  }

  // === TURMAS ENDPOINTS ===

  async getTurmas() {
    if (this.useMock) {
      return this.mockGetTurmas();
    }
    return api.get("/turmas");
  }

  async getTurmaById(id: number) {
    if (this.useMock) {
      return this.mockGetTurmaById(id);
    }
    return api.get(`/turmas/${id}`);
  }

  // === ALUNOS ENDPOINTS ===

  async getAlunosByTurma(turmaId: number) {
    if (this.useMock) {
      return this.mockGetAlunosByTurma(turmaId);
    }
    return api.get(`/turmas/${turmaId}/alunos`);
  }

  async createAluno(turmaId: number, data: any) {
    if (this.useMock) {
      return this.mockCreateAluno(turmaId, data);
    }
    return api.post(`/turmas/${turmaId}/alunos`, data);
  }

  async updateAluno(turmaId: number, alunoId: number, data: any) {
    if (this.useMock) {
      return this.mockUpdateAluno(turmaId, alunoId, data);
    }
    return api.patch(`/turmas/${turmaId}/alunos/${alunoId}`, data);
  }

  async deleteAluno(turmaId: number, alunoId: number) {
    if (this.useMock) {
      return this.mockDeleteAluno(turmaId, alunoId);
    }
    return api.delete(`/turmas/${turmaId}/alunos/${alunoId}`);
  }

  // === REGISTROS ENDPOINTS ===

  async getRegistros(page: number = 1, limit: number = 20) {
    if (this.useMock) {
      return this.mockGetRegistros(page, limit);
    }
    return api.get(`/registros?page=${page}&limit=${limit}`);
  }

  async getRegistroById(id: string) {
    if (this.useMock) {
      return this.mockGetRegistroById(id);
    }
    return api.get(`/registros/${id}`);
  }

  async createRegistro(data: any) {
    if (this.useMock) {
      return this.mockCreateRegistro(data);
    }
    return api.post("/registros", data);
  }

  async updateRegistro(id: string, data: any) {
    if (this.useMock) {
      return this.mockUpdateRegistro(id, data);
    }
    return api.patch(`/registros/${id}`, data);
  }

  async deleteRegistro(id: string) {
    if (this.useMock) {
      return this.mockDeleteRegistro(id);
    }
    return api.delete(`/registros/${id}`);
  }

  async searchRegistros(query: string) {
    if (this.useMock) {
      return this.mockSearchRegistros(query);
    }
    return api.get(`/registros/search?q=${query}`);
  }

  // === BUSCA CEP (ViaCEP) ===

  /**
   * Busca dados de endereço através do CEP usando a API pública ViaCEP.
   * Este é um exemplo de como consumir uma API REST externa que retorna JSON.
   */
  async buscarCep(cep: string) {
    // Sanitiza o CEP (remove tudo que não for número)
    const sanitizedCep = cep.replace(/\D/g, "");

    if (sanitizedCep.length !== 8) {
      throw new Error("CEP inválido. Deve conter 8 dígitos.");
    }

    try {
      // Usamos uma nova instância do axios ou o axios direto para evitar 
      // os interceptores da nossa 'api' (que adicionam Token de Auth e usam BaseURL diferente)
      const response = await axios.get(`https://viacep.com.br/ws/${sanitizedCep}/json/`);

      if (response.data.erro) {
        throw new Error("CEP não encontrado.");
      }

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      throw error;
    }
  }

  // ============================================
  // MOCK METHODS FOR TESTING
  // ============================================

  private async mockLogin(email: string, password: string) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (email === "admin@ibrc.com.br" && password === "123456") {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: "user_123",
            name: "Admin IBRC",
            email: "admin@ibrc.com.br",
            avatar: "https://ui-avatars.com/api/?name=Admin+IBRC",
            role: "admin",
          },
          accessToken: "mock_access_token_" + Date.now(),
          refreshToken: "mock_refresh_token_" + Date.now(),
        },
      };
      return Promise.resolve(mockResponse);
    }

    return Promise.reject({
      response: {
        status: 401,
        data: { success: false, message: "Credenciais inválidas" },
      },
    });
  }

  private async mockRegister(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return Promise.resolve({
      data: {
        success: true,
        data: {
          id: "user_new_" + Date.now(),
          ...data,
          avatar: `https://ui-avatars.com/api/?name=${data.name}`,
        },
      },
    });
  }

  private async mockRefreshToken() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({
      data: {
        success: true,
        accessToken: "mock_access_token_" + Date.now(),
      },
    });
  }

  private async mockLogout() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({ data: { success: true } });
  }

  private async mockGetProfile() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = await AsyncStorage.getItem("@user");
    return Promise.resolve({
      data: {
        success: true,
        data: user ? JSON.parse(user) : null,
      },
    });
  }

  private async mockUpdateProfile(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({
      data: {
        success: true,
        data,
      },
    });
  }

  private async mockGetTurmas() {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const turmas = [
      { id: 1, name: "Berçário" },
      { id: 2, name: "Maternal" },
      { id: 3, name: "Principiantes" },
      { id: 4, name: "Juniores" },
      { id: 5, name: "Intermediários" },
      { id: 6, name: "Jovens" },
      { id: 7, name: "Adultos" },
    ];
    return Promise.resolve({
      data: {
        success: true,
        data: turmas,
      },
    });
  }

  private async mockGetTurmaById(id: number) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const turmas: any = {
      1: { id: 1, name: "Berçário" },
      2: { id: 2, name: "Maternal" },
      3: { id: 3, name: "Principiantes" },
      4: { id: 4, name: "Juniores" },
      5: { id: 5, name: "Intermediários" },
      6: { id: 6, name: "Jovens" },
      7: { id: 7, name: "Adultos" },
    };
    return Promise.resolve({
      data: {
        success: true,
        data: turmas[id] || null,
      },
    });
  }

  private async mockGetAlunosByTurma(turmaId: number) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const alunosPorTurma: any = {
      1: [
        "Ana Clara",
        "Helena Baby",
        "Laura Mendes",
        "Lucas Baby",
        "Miguelzinho",
      ],
      2: ["Davi", "Joãozinho", "Mariana"],
      3: ["Ana Vitória", "Beatriz Santos", "Daniel Oliveira", "Enzo Gabriel"],
      4: ["Ana Júlia", "Fernando Souza", "Gustavo Lima", "Larissa Rocha"],
      5: ["Amanda Rocha", "Beatriz Fernandes", "Bruno Silva", "Carla Pereira"],
      6: ["Bianca Lima", "Camila Santos", "Felipe Martins", "João Pedro"],
      7: ["Aline Dias", "Amanda Lima", "Bruno Lima", "Camila Fernandes"],
    };

    const alunos = (alunosPorTurma[turmaId] || []).map(
      (nome: string, index: number) => ({
        id: `aluno_${turmaId}_${index}`,
        nome,
        turmaId,
        status: "ativo",
        dataInscricao: "2025-01-15",
      }),
    );

    return Promise.resolve({
      data: {
        success: true,
        data: alunos,
      },
    });
  }

  private async mockCreateAluno(turmaId: number, data: any) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({
      data: {
        success: true,
        data: {
          id: `aluno_${turmaId}_${Date.now()}`,
          turmaId,
          status: "ativo",
          dataInscricao: new Date().toISOString().split("T")[0],
          ...data,
        },
      },
    });
  }

  private async mockUpdateAluno(turmaId: number, alunoId: number, data: any) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({
      data: {
        success: true,
        data: {
          id: `aluno_${turmaId}_${alunoId}`,
          turmaId,
          ...data,
        },
      },
    });
  }

  private async mockDeleteAluno(turmaId: number, alunoId: number) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({ data: { success: true } });
  }

  private async mockGetRegistros(page: number, limit: number) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const registros = [
      {
        id: "1",
        turmaId: 1,
        turmaName: "Berçário",
        professorNome: "Ana Paula",
        dataRegistro: "2026-02-01",
        presentes: 1,
        total: 5,
        visitantes: "Laura Mendes",
      },
      {
        id: "2",
        turmaId: 2,
        turmaName: "Maternal",
        professorNome: "Carla Souza",
        dataRegistro: "2026-02-01",
        presentes: 3,
        total: 3,
        visitantes: "-",
      },
    ];

    return Promise.resolve({
      data: {
        success: true,
        data: registros,
        pagination: {
          page,
          limit,
          total: registros.length,
          pages: Math.ceil(registros.length / limit),
        },
      },
    });
  }

  private async mockGetRegistroById(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({
      data: {
        success: true,
        data: {
          id,
          turmaId: 1,
          turmaName: "Berçário",
          professorNome: "Ana Paula",
          dataRegistro: "2026-02-01",
          presentes: 1,
          total: 5,
          visitantes: "Laura Mendes",
        },
      },
    });
  }

  private async mockCreateRegistro(data: any) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({
      data: {
        success: true,
        data: {
          id: `registro_${Date.now()}`,
          ...data,
        },
      },
    });
  }

  private async mockUpdateRegistro(id: string, data: any) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({
      data: {
        success: true,
        data: {
          id,
          ...data,
        },
      },
    });
  }

  private async mockDeleteRegistro(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({ data: { success: true } });
  }

  private async mockSearchRegistros(query: string) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Promise.resolve({
      data: {
        success: true,
        data: [],
      },
    });
  }
}

// ============================================
// EXPORT INSTANCES
// ============================================

export const apiService = new ApiService(config.useMock);

export default api;
