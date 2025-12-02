'use client'; 

import { useState } from 'react';
import axios from 'axios';
import { 
  LogIn, Mail, Lock, XCircle, Loader2, Send 
} from 'lucide-react';
import Link from 'next/link'; // Importe o Link
import { useRouter } from 'next/navigation'; 

const API_ENDPOINT = 'http://localhost:8080/api/v1/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const router = useRouter(); 

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
            router.push('/'); 
        }
    } catch (error) {
        if (error.response) {
            const { status, message, errors } = error.response.data;

            if (status === 400 && errors) {
                setValidationErrors(errors);
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

  // Componente de Input Reutilizável
  const InputField = ({ label, name, type = 'text', icon: Icon, required = false }) => {
    const error = validationErrors[name];
    
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
            value={formData[name]}
            onChange={handleChange}
            required={required}
            className={`w-full rounded-lg border bg-gray-800 py-3 pl-12 pr-4 text-white placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-redbull-accent'
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-redbull-dark-blue text-white">
      <div className="w-full max-w-md px-4">
        
        <div className="rounded-xl bg-redbull-dark-blue p-8 shadow-3xl border border-redbull-accent/30">
            
            <div className="mb-8 text-center">
                <LogIn className="mx-auto mb-3 h-10 w-10 text-redbull-accent" />
                <h1 className="text-3xl font-extrabold text-white">
                    Acesso Exclusivo
                </h1>
                <p className="mt-1 text-gray-400">Entre com suas credenciais.</p>
            </div>

            {apiError && (
                <div className="mb-6 rounded-lg bg-red-800/20 p-3 text-red-400 shadow-lg border border-red-700 text-sm font-medium">
                    <p>{apiError}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <InputField 
                  label="Email" 
                  name="email" 
                  type="email" 
                  icon={Mail} 
                  required 
              />

              <InputField 
                  label="Senha" 
                  name="senha" 
                  type="password" 
                  icon={Lock} 
                  required 
              />

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-lg bg-redbull-accent px-4 py-3 text-lg font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-redbull-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
        
        {/* CORREÇÃO DO REDIRECIONAMENTO */}
        <p className="mt-6 text-center text-sm text-gray-500">
            Ainda não tem conta? 
            <Link href="/cadastro" passHref legacyBehavior>
                <div className="font-semibold text-redbull-accent hover:underline ml-1">
                    Registre-se aqui
                </div>
            </Link>
        </p>

      </div>
    </div>
  );
}