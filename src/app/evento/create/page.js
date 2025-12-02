'use client'; 

import { useState } from 'react';
import axios from 'axios';
import { 
  Send, XCircle, FileText, Calendar, MapPin, 
  Link as LinkIcon, Image as ImageIcon, Tag, Loader2 
} from 'lucide-react';

const API_ENDPOINT = 'http://localhost:8080/api/v1/evento';

// Mock do EventoEnum para o frontend
const EVENTO_TIPOS = [
    { value: 'CONGRESSO', label: 'CONGRESSO' },
    { value: 'TREINAMENTO', label: 'TREINAMENTO' },
    { value: 'WORKSHOP', label: 'WORKSHOP' },
    { value: 'IMERSÃO', label: 'IMERSAO' },
    { value: 'REUNIÃO', label: 'REUNIAO' },
    { value: 'HACKATON', label: 'HACKATON' },
    { value: 'STARTUP', label: 'STARTUP' }
];

// ----------------------------------------------------------------------
// COMPONENTE DE INPUT REUTILIZÁVEL (MOVIDO PARA FORA)
// ----------------------------------------------------------------------
function InputField({ label, name, type = 'text', icon: Icon, required = false, rows = 1, formData, handleChange, validationErrors }) {
  const error = validationErrors[name];
    
  let inputType = type;
  if (name === 'dataInicio' || name === 'dataFinal') {
      inputType = 'datetime-local';
  }

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />}
        
        {rows > 1 ? (
            <textarea
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              rows={rows}
              maxLength={name === 'descricao' ? 500 : undefined}
              className={`w-full rounded-lg border bg-gray-800 py-3 pl-12 pr-4 text-white placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-redbull-accent'
              }`}
            />
        ) : (
          <input
            id={name}
            name={name}
            type={inputType}
            value={formData[name]}
            onChange={handleChange}
            className={`w-full rounded-lg border bg-gray-800 py-3 pl-12 pr-4 text-white placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-redbull-accent'
            }`}
          />
        )}
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

// ----------------------------------------------------------------------
// COMPONENTE SELECT REUTILIZÁVEL (MOVIDO PARA FORA)
// ----------------------------------------------------------------------
function SelectField({ label, name, required = false, formData, handleChange, validationErrors, options }) {
    const error = validationErrors[name];

    return (
        <div className="flex flex-col space-y-2">
            <label htmlFor={name} className="text-sm font-medium text-gray-300">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <select
                    id={name}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`w-full appearance-none rounded-lg border bg-gray-800 py-3 pl-12 pr-4 text-white shadow-inner focus:outline-none focus:ring-2 ${
                        error ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-redbull-accent'
                    }`}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {error && (
                <p className="flex items-center text-sm font-medium text-red-400">
                    <XCircle className="mr-1 h-4 w-4" />
                    {error}
                </p>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// PÁGINA PRINCIPAL (CREATEEVENTPAGE)
// ----------------------------------------------------------------------
export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: EVENTO_TIPOS[0].value,
    local: '',
    dataInicio: '',
    dataFinal: '',
    linkEvento: '',
    linkImagem: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // CORRIGIDO: Esta função de callback garante a atualização correta do estado
    setFormData(prev => ({ ...prev, [name]: value }));
    
    setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
    });
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});
    setSuccessMessage('');
    setApiError('');

    try {
        const response = await axios.post(API_ENDPOINT, formData);
        
        if (response.status === 201 || response.status === 200) {
            setSuccessMessage(`Evento "${response.data.nome || formData.nome}" criado com sucesso! (ID: ${response.data.id})`);
            setFormData({
                nome: '', descricao: '', tipo: EVENTO_TIPOS[0].value, 
                local: '', dataInicio: '', dataFinal: '', 
                linkEvento: '', linkImagem: '',
            });
        }
    } catch (error) {
        if (error.response) {
            const { status, message, errors } = error.response.data;

            if (status === 400 && errors) {
                setValidationErrors(errors);
                setApiError("Falha na validação dos campos. Verifique os erros abaixo.");
            } else {
                setApiError(`Erro ao criar evento: ${message || error.response.statusText}`);
            }
        } else {
            setApiError("Erro de rede: Não foi possível conectar ao servidor Spring.");
        }
    } finally {
        setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-redbull-dark-blue text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold uppercase tracking-wider text-redbull-accent md:text-5xl">
                Criar Novo Evento
            </h1>
            <p className="mt-2 text-gray-400">Preencha os dados para registrar um evento.</p>
        </div>

        {/* Mensagens de Feedback */}
        {apiError && (
            <div className="mx-auto mb-6 max-w-2xl rounded-lg bg-red-800/20 p-4 text-red-400 shadow-lg border border-red-700">
                <p className="font-bold">{apiError}</p>
            </div>
        )}
        {successMessage && (
            <div className="mx-auto mb-6 max-w-2xl rounded-lg bg-green-800/20 p-4 text-green-400 shadow-lg border border-green-700">
                <p className="font-bold">{successMessage}</p>
            </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 rounded-xl bg-redbull-dark-blue p-8 shadow-3xl border border-redbull-accent/30">
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Nome (Required) */}
            <InputField 
                label="Nome do Evento (Máx. 150 caracteres)" 
                name="nome" 
                icon={FileText} 
                required 
                formData={formData} 
                handleChange={handleChange} 
                validationErrors={validationErrors} 
            />

            {/* Local (Required) */}
            <InputField 
                label="Local (Máx. 150 caracteres)" 
                name="local" 
                icon={MapPin} 
                required 
                formData={formData} 
                handleChange={handleChange} 
                validationErrors={validationErrors} 
            />
            
            {/* Tipo (Enum) (Required) */}
            <SelectField
                label="Tipo de Evento"
                name="tipo"
                required
                options={EVENTO_TIPOS}
                formData={formData} 
                handleChange={handleChange} 
                validationErrors={validationErrors} 
            />
            
            {/* Link Evento (Optional) */}
            <InputField 
                label="Link Externo do Evento" 
                name="linkEvento" 
                icon={LinkIcon} 
                type="url" 
                formData={formData} 
                handleChange={handleChange} 
                validationErrors={validationErrors} 
            />

            {/* Data Início (Required) */}
            <InputField 
                label="Data e Hora de Início" 
                name="dataInicio" 
                icon={Calendar} 
                required 
                formData={formData} 
                handleChange={handleChange} 
                validationErrors={validationErrors} 
            />
            
            {/* Data Final (Required) */}
            <InputField 
                label="Data e Hora de Finalização" 
                name="dataFinal" 
                icon={Calendar} 
                required 
                formData={formData} 
                handleChange={handleChange} 
                validationErrors={validationErrors} 
            />

            {/* Link Imagem (Optional) */}
            <div className="col-span-full">
                <InputField 
                    label="URL da Imagem de Destaque" 
                    name="linkImagem" 
                    icon={ImageIcon} 
                    type="url" 
                    formData={formData} 
                    handleChange={handleChange} 
                    validationErrors={validationErrors} 
                />
            </div>
          </div>
          
          {/* Descrição (Required) */}
          <div className="col-span-full">
             <InputField 
                label="Descrição (Máx. 500 caracteres)" 
                name="descricao" 
                icon={FileText} 
                required 
                rows={4}
                formData={formData} 
                handleChange={handleChange} 
                validationErrors={validationErrors} 
             />
          </div>

          {/* Botão de Envio */}
          <div className="pt-4 text-center">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center mx-auto rounded-full bg-redbull-accent px-10 py-3 text-lg font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-redbull-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-3" />
                  Criar Evento
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}