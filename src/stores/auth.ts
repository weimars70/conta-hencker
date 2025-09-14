import { defineStore } from 'pinia';
import axios from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
  empresa: string;
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  username: string;
  empresa?: string;
  empresaData?: any;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
  },
  
  actions: {
    async login(credentials: LoginCredentials) {
      // Temporalmente deshabilitado - login sin validación backend
      console.log('Login temporal sin backend:', credentials);
      
      // Validación básica del frontend
      if (!credentials.email || !credentials.password || !credentials.empresa) {
        console.error('Credenciales incompletas');
        return false;
      }
      
      // Simular respuesta exitosa del backend
      const mockUser = {
        id: credentials.email,
        username: credentials.email,
        email: credentials.email,
        name: credentials.email,
        empresa: credentials.empresa,
      };
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      this.setSession(mockToken, mockUser);
      return true;
    },
    
    setSession(token: string, user: User) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Configurar el token en el header por defecto de axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Limpiar el header de autorización
      delete axios.defaults.headers.common['Authorization'];
    },
    
    initializeAuth() {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          this.setSession(token, user);
        } catch (e) {
          console.error('Error parsing user data:', e);
          this.logout(); // Clear invalid data
        }
      } else {
        this.logout(); // Ensure clean state if any data is missing
      }
    }
  }
});
