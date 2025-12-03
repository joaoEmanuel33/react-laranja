'use client'; 

import { useState } from 'react';
import axios from 'axios';
import { 
  UserPlus, Mail, Lock, User, Phone, 
  Tag, Calendar, XCircle, Loader2, Send, FileText 
} from 'lucide-react';
import { useRouter } from 'next/navigation'; 
// A linha abaixo foi removida, pois 'next/link' não é suportado no ambiente Canvas.
// import Link from 'next/link'; 

const API_ENDPOINT = 'http://localhost:8080/api/v1/usuario';

// Mock do UsuarioEnum para o frontend
const USUARIO_TIPOS = [
    { value: 'CLIENTE', label: 'Cliente' },
    { value: 'ADMINISTRADOR', label: 'Administrador' },
    { value: 'ORGANIZADOR', label: 'Organizador de Eventos' },
];

// --- UTILITIES DE MASCARAMENTO ---
const maskCPF = (value) => {
    return value
        .replace(/\D/g, '') // Remove tudo que não é dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 3º dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 6º dígito
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Coloca hífen após o 9º dígito
        .slice(0, 14); // Limita ao tamanho máximo do CPF
};

const maskPhone = (value) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2') // Coloca parênteses no DDD
        .replace(/(\d{5})(\d)/, '$1-$2') // Coloca hífen no número (para 9 dígitos)
        .replace(/(\d{4})(\d)/, '$1-$2') // Corrige para 8 dígitos + 9º dígito
        .slice(0, 15); // Limita ao tamanho máximo do telefone (ex: (11) 99999-9999)
};

// --- COMPONENTE DE INPUT REUTILIZÁVEL ---
// Ajustado para consistência de estilo Dark Mode (foco em red-500)
const InputField = ({ label, name, type = 'text', icon: Icon, required = false, value, onChange, error }) => {
    
    let inputType = type;
    if (name === 'dataNascimento') {
        inputType = 'date';
    }

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
            type={inputType}
            value={value} 
            onChange={onChange} 
            required={required}
            // Estilo Dark Mode unificado
            className={`w-full rounded-lg border bg-gray-800 py-3 pl-12 pr-4 text-white placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 transition duration-150 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-red-500'
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
export default function RegisterPage() {
    const [formData, setFormData] = useState({
      nome: '',
      email: '',
      senha: '',
      cpf: '',
      telefone: '',
      tipo: USUARIO_TIPOS[0].value, 
      dataNascimento: '', 
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // router é mantido para compatibilidade com Next.js, assumindo o ambiente.
    const router = {
        push: (path) => console.log(`Simulando redirecionamento para: ${path}`) 
    };

    // Lida com a mudança nos campos de formulário, incluindo o mascaramento
    const handleChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'cpf') {
            newValue = maskCPF(value);
        } else if (name === 'telefone') {
            newValue = maskPhone(value);
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
        
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
        setSuccessMessage('');

        let submitData = { ...formData };

        // Formata a data de nascimento de YYYY-MM-DD para DD/MM/YYYY (API espera este formato)
        if (submitData.dataNascimento) {
            const parts = submitData.dataNascimento.split('-');
            if (parts.length === 3) {
                submitData.dataNascimento = `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }

        // Remove as máscaras de CPF e Telefone
        submitData.cpf = submitData.cpf.replace(/\D/g, '');
        submitData.telefone = submitData.telefone.replace(/\D/g, '');
        
        try {
            const response = await axios.post(API_ENDPOINT, submitData);
            
            if (response.status === 201 || response.status === 200) {
                setSuccessMessage(`Usuário ${response.data.nome || formData.nome} cadastrado com sucesso! Redirecionando...`);
                setTimeout(() => {
                    // Simulação de redirecionamento
                    router.push('/login'); 
                }, 2000); 
            }
        } catch (error) {
            if (error.response) {
                const { status, message, errors } = error.response.data;

                if (status === 400 && errors) {
                    // Mapeia erros de validação do Spring (se forem no formato chave: valor)
                    const mappedErrors = Object.keys(errors).reduce((acc, key) => {
                        // Assuming the API returns a list of errors for a field, taking the first one
                        acc[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                        return acc;
                    }, {});
                    setValidationErrors(mappedErrors);
                    setApiError("Falha na validação. Verifique os campos com erros.");
                } else {
                    setApiError(`Erro no servidor: ${message || error.response.statusText}`);
                }
            } else {
                setApiError("Erro de conexão: Não foi possível conectar ao servidor (Verifique http://localhost:8080).");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
      // Fundo escuro (bg-gray-900)
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white py-12">
        <div className="w-full max-w-2xl px-4">
          
          {/* Card principal com sombra e borda sutis */}
          <div className="rounded-xl bg-gray-800 p-8 shadow-3xl border border-gray-700/50">
              
              <div className="mb-8 text-center">
                  {/* Ícone e Título em destaque vermelho */}
                  <UserPlus className="mx-auto mb-3 h-10 w-10 text-red-500" />
                  <h1 className="text-3xl font-extrabold uppercase tracking-wide text-red-500">
                      Registro de Novo Usuário
                  </h1>
                  <p className="mt-1 text-gray-400">Informe seus dados para criar uma conta.</p>
              </div>

              {/* Mensagens de Feedback */}
              {apiError && (
                  <div className="mb-6 rounded-lg bg-red-800/20 p-3 text-red-400 shadow-lg border border-red-700 text-sm font-medium">
                      <p>{apiError}</p>
                  </div>
              )}
                {successMessage && (
                    <div className="mb-6 rounded-lg bg-green-800/20 p-3 text-green-400 shadow-lg border border-green-700 text-sm font-medium">
                        <p>{successMessage}</p>
                    </div>
              )}

              {/* FORMULÁRIO */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  
                  {/* Nome */}
                  <InputField 
                      label="Nome Completo" 
                      name="nome" 
                      icon={User} 
                      required 
                      value={formData.nome} 
                      onChange={handleChange} 
                      error={validationErrors.nome} 
                  />

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

                  {/* CPF */}
                  <InputField 
                      label="CPF (apenas números)" 
                      name="cpf" 
                      icon={FileText} 
                      required 
                      value={formData.cpf} 
                      onChange={handleChange} 
                      error={validationErrors.cpf} 
                  />

                  {/* Telefone */}
                  <InputField 
                      label="Telefone (com DDD)" 
                      name="telefone" 
                      icon={Phone} 
                      required 
                      value={formData.telefone} 
                      onChange={handleChange} 
                      error={validationErrors.telefone} 
                  />

                  {/* Data de Nascimento */}
                  <InputField 
                      label="Data de Nascimento" 
                      name="dataNascimento" 
                      type="date" 
                      icon={Calendar} 
                      required 
                      value={formData.dataNascimento} 
                      onChange={handleChange} 
                      error={validationErrors.dataNascimento} 
                  />

                  {/* Tipo de Usuário (Dropdown) */}
                  <div className="col-span-full md:col-span-1 flex flex-col space-y-2">
                      <label htmlFor="tipo" className="text-sm font-medium text-gray-300">
                          Tipo de Usuário <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                          <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                          <select
                              id="tipo"
                              name="tipo"
                              value={formData.tipo}
                              onChange={handleChange}
                              // Estilo Dark Mode unificado
                              className={`w-full appearance-none rounded-lg border bg-gray-800 py-3 pl-12 pr-4 text-white shadow-inner focus:outline-none focus:ring-2 transition duration-150 ${
                                  validationErrors.tipo ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-red-500'
                              }`}
                          >
                              {USUARIO_TIPOS.map(tipo => (
                                  <option key={tipo.value} value={tipo.value} className="bg-gray-800">
                                      {tipo.label}
                                  </option>
                              ))}
                          </select>
                           {/* Ícone de seta customizado para o select */}
                            <svg className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                      </div>
                      {validationErrors.tipo && (
                          <p className="flex items-center text-sm font-medium text-red-400">
                              <XCircle className="mr-1 h-4 w-4" />
                              {validationErrors.tipo}
                          </p>
                      )}
                  </div>
                </div>

                {/* Botão de Envio */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    // Botão principal em destaque vermelho (estilo consistente com CreateEventPage)
                    className="flex w-full items-center justify-center rounded-full bg-red-500 px-10 py-3 text-lg font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-3" />
                        Cadastrar
                      </>
                    )}
                  </button>
                </div>
              </form>
          </div>
          
          <p className="mt-6 text-center text-sm text-gray-500">
              Já tem uma conta? <a href="/login" className="font-semibold text-red-500 hover:underline">Faça login aqui</a>
          </p>

        </div>
      </div>
    );
}