'use client'; 

import { useState } from 'react';
import axios from 'axios';
import { 
  UserPlus, Mail, Lock, User, Phone, 
  Tag, Calendar, XCircle, Loader2, Send, FileText 
} from 'lucide-react';
import { useRouter } from 'next/navigation'; 

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

// --- COMPONENTE PRINCIPAL ---
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cpf: '',
    telefone: '',
    tipo: USUARIO_TIPOS[0].value, // Valor inicial
    dataNascimento: '', // Formato yyyy-MM-dd para input type="date"
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

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

    // Preparação dos dados para o Spring: 
    // O Spring espera a data de nascimento no formato DD/MM/YYYY no DTO.
    // O input type="date" fornece no formato YYYY-MM-DD.
    // O CPF e Telefone precisam estar limpos de máscara para a validação no backend, se necessário.
    
    let submitData = { ...formData };

    // Formata a data de nascimento de YYYY-MM-DD para DD/MM/YYYY
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
            setSuccessMessage(`Usuário ${response.data.nome} cadastrado com sucesso! Redirecionando...`);
            // Redireciona para o login após um breve delay
            setTimeout(() => {
                router.push('/login');
            }, 2000); 
        }
    } catch (error) {
        if (error.response) {
            const { status, message, errors } = error.response.data;

            if (status === 400 && errors) {
                // Erros de validação do Spring (DTO Validation)
                setValidationErrors(errors);
                setApiError("Falha na validação. Verifique os campos com erros.");
            } else {
                // Outros erros (ex: conflito de email já registrado)
                setApiError(`Erro no servidor: ${message || error.response.statusText}`);
            }
        } else {
            setApiError("Erro de conexão: Não foi possível conectar ao servidor.");
        }
    } finally {
        setLoading(false);
    }
  };

  // Componente de Input Reutilizável com estilo e feedback de erro
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
    <div className="flex min-h-screen items-center justify-center bg-redbull-dark-blue text-white py-12">
      <div className="w-full max-w-2xl px-4">
        
        {/* Card do Formulário */}
        <div className="rounded-xl bg-redbull-dark-blue p-8 shadow-3xl border border-redbull-accent/30">
            
            {/* Cabeçalho */}
            <div className="mb-8 text-center">
                <UserPlus className="mx-auto mb-3 h-10 w-10 text-redbull-accent" />
                <h1 className="text-3xl font-extrabold text-white">
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
                />

                {/* Email */}
                <InputField 
                    label="Email" 
                    name="email" 
                    type="email" 
                    icon={Mail} 
                    required 
                />

                {/* Senha */}
                <InputField 
                    label="Senha" 
                    name="senha" 
                    type="password" 
                    icon={Lock} 
                    required 
                />

                {/* CPF */}
                <InputField 
                    label="CPF" 
                    name="cpf" 
                    icon={FileText} 
                    required 
                />

                {/* Telefone */}
                <InputField 
                    label="Telefone" 
                    name="telefone" 
                    icon={Phone} 
                    required 
                />

                {/* Data de Nascimento */}
                <InputField 
                    label="Data de Nascimento" 
                    name="dataNascimento" 
                    type="date" 
                    icon={Calendar} 
                    required 
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
                            className={`w-full appearance-none rounded-lg border bg-gray-800 py-3 pl-12 pr-4 text-white shadow-inner focus:outline-none focus:ring-2 ${
                                validationErrors.tipo ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-redbull-accent'
                            }`}
                        >
                            {USUARIO_TIPOS.map(tipo => (
                                <option key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                </option>
                            ))}
                        </select>
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
                  className="flex w-full items-center justify-center rounded-lg bg-redbull-accent px-4 py-3 text-lg font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-redbull-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
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
            Já tem uma conta? <a href="/login" className="font-semibold text-redbull-accent hover:underline">Faça login aqui</a>
        </p>

      </div>
    </div>
  );
}