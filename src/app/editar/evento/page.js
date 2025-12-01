'use client'; 

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, XCircle, FileText, Calendar, MapPin, 
  Link as LinkIcon, Image as ImageIcon, Tag, Loader2, Edit 
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation'; 

// URL base da API
const BASE_API_URL = 'http://localhost:8080/api/v1/evento';

// Mock do EventoEnum para o frontend
const EVENTO_TIPOS = [
    { value: 'CORRIDA', label: 'Corrida (GP)' },
    { value: 'TREINO', label: 'Treino / Teste' },
    { value: 'EXPOSICAO', label: 'Exposição / Feira' },
    { value: 'OUTRO', label: 'Outro' },
];

// ----------------------------------------------------------------------
// COMPONENTE DE INPUT REUTILIZÁVEL (MOVIDO PARA FORA)
// Requer as props: formData, handleChange, validationErrors
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
// PÁGINA PRINCIPAL (EDIT EVENT PAGE)
// ----------------------------------------------------------------------
export default function EditEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Assumimos que o ID do evento é passado na URL (ex: /evento/edit?id=1)
  const eventId = searchParams.get('id') || 1; // ID 1 como fallback

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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  
  // Função para carregar os dados do evento
  useEffect(() => {
    if (!eventId) {
        setApiError("ID do evento não fornecido.");
        setInitialLoading(false);
        return;
    }
    
    const fetchEvent = async () => {
        try {
            const response = await axios.get(`${BASE_API_URL}/${eventId}`);
            const data = response.data;
            
            // Tratamento de Data/Hora: Converte o formato do Spring (ISO string)
            // para o formato aceito pelo input type="datetime-local" (YYYY-MM-DDTHH:mm)
            const formatDateTime = (isoString) => {
                if (!isoString) return '';
                // Simplifica a string ISO para o formato local necessário
                return isoString.slice(0, 16); // Ex: '2025-12-01T10:00:00' -> '2025-12-01T10:00'
            };
            
            setFormData({
                nome: data.nome || '',
                descricao: data.descricao || '',
                tipo: data.tipo || EVENTO_TIPOS[0].value,
                local: data.local || '',
                dataInicio: formatDateTime(data.dataInicio),
                dataFinal: formatDateTime(data.dataFinal),
                linkEvento: data.linkEvento || '',
                linkImagem: data.linkImagem || '',
            });

        } catch (error) {
            setApiError(`Erro ao carregar evento: ${error.response?.data?.message || 'Evento não encontrado.'}`);
        } finally {
            setInitialLoading(false);
        }
    };

    fetchEvent();
  }, [eventId]); // Executa apenas quando o ID do evento muda

  
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
    setSuccessMessage('');
  };

  // Envio do formulário (PUT/PATCH)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});
    setApiError('');
    setSuccessMessage('');

    // Prepara os dados: Certifique-se de que as datas estão no formato ISO 8601 completo
    // Se você estiver usando LocalDateTime no backend, o formato YYYY-MM-DDTHH:mm:ss
    // pode ser necessário, mas muitos frameworks aceitam o formato simplificado do input.
    const submitData = { ...formData };
    
    try {
        // Envia o DTO atualizado via PUT
        const response = await axios.put(`${BASE_API_URL}/${eventId}`, submitData);
        
        if (response.status === 200) {
            setSuccessMessage(`Evento "${response.data.nome || formData.nome}" (ID: ${eventId}) atualizado com sucesso!`);
            // Opcional: Redirecionar
            // router.push(`/evento/${eventId}`);
        }
    } catch (error) {
        if (error.response) {
            const { status, message, errors } = error.response.data;

            if (status === 400 && errors) {
                setValidationErrors(errors);
                setApiError("Falha na validação. Verifique os erros abaixo.");
            } else {
                setApiError(`Erro ao atualizar evento: ${message || error.response.statusText}`);
            }
        } else {
            setApiError("Erro de rede: Não foi possível conectar ao servidor Spring.");
        }
    } finally {
        setLoading(false);
    }
  };


  if (initialLoading) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-redbull-dark-blue text-white">
              <Loader2 className="h-8 w-8 animate-spin text-redbull-accent" />
              <span className="ml-3">Carregando dados do evento...</span>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-redbull-dark-blue text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        
        {/* Título e Destaque Visual */}
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold uppercase tracking-wider text-redbull-accent md:text-5xl">
                <Edit className="inline-block h-8 w-8 mr-2" />
                Editar Evento (ID: {eventId})
            </h1>
            <p className="mt-2 text-gray-400">Atualize os detalhes do evento existente.</p>
        </div>

        {/* Mensagens de Feedback */}
        {apiError && (
            <div className="mx-auto mb-6 max-w-4xl rounded-lg bg-red-800/20 p-4 text-red-400 shadow-lg border border-red-700">
                <p className="font-bold">{apiError}</p>
            </div>
        )}
        {successMessage && (
            <div className="mx-auto mb-6 max-w-4xl rounded-lg bg-green-800/20 p-4 text-green-400 shadow-lg border border-green-700">
                <p className="font-bold">{successMessage}</p>
            </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 rounded-xl bg-redbull-dark-blue p-8 shadow-3xl border border-redbull-accent/30">
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Nome (Required) */}
            <InputField label="Nome do Evento (Máx. 150 caracteres)" name="nome" icon={FileText} required formData={formData} handleChange={handleChange} validationErrors={validationErrors} />

            {/* Local (Required) */}
            <InputField label="Local (Máx. 150 caracteres)" name="local" icon={MapPin} required formData={formData} handleChange={handleChange} validationErrors={validationErrors} />
            
            {/* Tipo (Enum) (Required) */}
            <SelectField label="Tipo de Evento" name="tipo" required options={EVENTO_TIPOS} formData={formData} handleChange={handleChange} validationErrors={validationErrors} />
            
            {/* Link Evento (Optional) */}
            <InputField label="Link Externo do Evento" name="linkEvento" icon={LinkIcon} type="url" formData={formData} handleChange={handleChange} validationErrors={validationErrors} />

            {/* Data Início (Required) */}
            <InputField label="Data e Hora de Início" name="dataInicio" icon={Calendar} required formData={formData} handleChange={handleChange} validationErrors={validationErrors} />
            
            {/* Data Final (Required) */}
            <InputField label="Data e Hora de Finalização" name="dataFinal" icon={Calendar} required formData={formData} handleChange={handleChange} validationErrors={validationErrors} />

            {/* Link Imagem (Optional) */}
            <div className="col-span-full">
                <InputField label="URL da Imagem de Destaque" name="linkImagem" icon={ImageIcon} type="url" formData={formData} handleChange={handleChange} validationErrors={validationErrors} />
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
              disabled={loading || initialLoading}
              className="flex items-center justify-center mx-auto rounded-full bg-green-600 px-10 py-3 text-lg font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-3" />
                  Atualizando...
                </>
              ) : (
                <>
                  <Edit className="h-5 w-5 mr-3" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}