'use client'; 

import { useState } from 'react';
import axios from 'axios';
import { 
  LogIn, Mail, Lock, XCircle, Loader2, Send 
} from 'lucide-react';
// import Link from 'next/link'; // Removido para compatibilidade com o ambiente Canvas
// import { useRouter } from 'next/navigation'; // Removido para compatibilidade com o ambiente Canvas

const API_ENDPOINT = 'http://localhost:8080/api/v1/auth';

// --- COMPONENTE DE INPUT REUTILIZÁVEL ---
// Estilos Dark Mode unificados para o esquema cinza/vermelho
const InputField = ({ label, name, type = 'text', icon: Icon, required = false, value, onChange, error }) => {
    return (
      <div className="flex flex-col space-y-2">
        <label htmlFor={name} className="text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
          {Icon && <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />}
          <input
            id={name}
            name={name}
            type={type}
            value={value} 
            onChange={onChange} 
            required={required}
            // Estilo Dark Mode unificado
            className={`w-full rounded-lg border bg-gray-800 py-3 pl-12 pr-4 text-white placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 transition duration-150 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-red-500' // 'redbull-accent' substituído por red-500
            }`}
          />
        </div>
        {error && (
          <p className="flex items-center text-sm font-medium text-red-400">
            <XCircle className="mr-1 h-4 w-4" />
            {error}
          </p>
        )}
      </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function LoginPage() {
    const [formData, setFormData] = useState({
      email: '',
      senha: '',
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    
    // Mock do useRouter, pois 'next/navigation' não é suportado no ambiente Canvas
    const router = {
        push: (path) => console.log(`Simulando redirecionamento para: ${path}`) 
    };

    // Lida com a mudança nos campos de formulário
    const handleChange = (e) => {
      const { name, value } = e.target;
      
      setFormData(prev => ({ ...prev, [name]: value }));
      
      setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
      });
      setApiError('');
    };

    // Envio do formulário
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setValidationErrors({});
      setApiError('');

      try {
          const response = await axios.post(API_ENDPOINT, formData);
          
          if (response.status === 200 || response.status === 201) {
              console.log("Login bem-sucedido. Dados recebidos:", response.data);
              // 🚨 Em um aplicativo real, você salvaria o token aqui
              router.push('/'); 
          }
      } catch (error) {
          if (error.response) {
              const { status, message, errors } = error.response.data;

              if (status === 400 && errors) {
                  // Mapeia erros de validação
                  const mappedErrors = Object.keys(errors).reduce((acc, key) => {
                        acc[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                        return acc;
                    }, {});
                  setValidationErrors(mappedErrors);
                  setApiError("Preencha todos os campos obrigatórios.");
              } else if (status === 401) {
                  setApiError("Credenciais inválidas. Verifique seu email e senha.");
              } else {
                  setApiError(`Erro no servidor: ${message || error.response.statusText}`);
              }
          } else {
              setApiError("Erro de conexão: Não foi possível alcançar o servidor de autenticação.");
          }
      } finally {
          setLoading(false);
      }
    };

    return (
      // Fundo escuro (bg-gray-900, substituindo redbull-dark-blue)
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="w-full max-w-md px-4">
          
          {/* Card principal com sombra e borda sutis */}
          <div className="rounded-xl bg-gray-800 p-8 shadow-3xl border border-red-500/30">
              
              <div className="mb-8 text-center">
                  {/* Ícone e Título em destaque vermelho (red-500, substituindo redbull-accent) */}
                  <LogIn className="mx-auto mb-3 h-10 w-10 text-red-500" />
                  <h1 className="text-3xl font-extrabold text-white">
                      Acesso Exclusivo
                  </h1>
                  <p className="mt-1 text-gray-400">Entre com suas credenciais.</p>
              </div>

              {/* Mensagens de Feedback */}
              {apiError && (
                  <div className="mb-6 rounded-lg bg-red-800/20 p-3 text-red-400 shadow-lg border border-red-700 text-sm font-medium">
                      <p>{apiError}</p>
                  </div>
              )}

              {/* FORMULÁRIO */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email */}
                <InputField 
                    label="Email" 
                    name="email" 
                    type="email" 
                    icon={Mail} 
                    required 
                    value={formData.email} 
                    onChange={handleChange} 
                    error={validationErrors.email} 
                />

                {/* Senha */}
                <InputField 
                    label="Senha" 
                    name="senha" 
                    type="password" 
                    icon={Lock} 
                    required 
                    value={formData.senha} 
                    onChange={handleChange} 
                    error={validationErrors.senha} 
                />

                {/* Botão de Envio */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    // Botão principal em destaque vermelho (substituindo redbull-accent)
                    className="flex w-full items-center justify-center rounded-full bg-red-500 px-4 py-3 text-lg font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                        Autenticando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-3" />
                        Entrar
                      </>
                    )}
                  </button>
                </div>
              </form>
          </div>
          
          <p className="mt-6 text-center text-sm text-gray-500">
              Ainda não tem conta? 
              {/* Link substituído por <a> para evitar erros de compilação no Canvas */}
              <a href="/cadastro" className="font-semibold text-red-500 hover:underline ml-1">
                  Registre-se aqui
              </a>
          </p>

        </div>
      </div>
    );
}