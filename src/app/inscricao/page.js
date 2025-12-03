'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, Send, Loader2, XCircle } from 'lucide-react';
import axios from 'axios';

// ====================================================================
// CONFIGURAÇÃO DOS ENDPOINTS DA API
// NOTA: Para este código funcionar no seu projeto, seu servidor Backend 
// deve estar rodando em http://localhost:8080.
// ATENÇÃO: A pré-visualização do Canvas NÃO conseguirá acessar seu localhost.
// ====================================================================

const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Busca a lista de usuários da API (GET /api/v1/usuario)
 * @returns {Promise<Array>} Lista de objetos de Usuário
 */
const fetchUserList = async () => {
    // Se preferir Axios, substitua esta lógica por:
    // const response = await axios.get(`${API_BASE_URL}/usuario`);
    // return response.data;
    const response = await fetch(`${API_BASE_URL}/usuario`);
    if (!response.ok) {
        throw new Error(`Erro ao buscar usuários: ${response.statusText}`);
    }
    return response.json();
};

/**
 * Busca a lista de eventos da API (GET /api/v1/evento)
 * @returns {Promise<Array>} Lista de objetos de Evento
 */
const fetchEventList = async () => {
    // Se preferir Axios, substitua esta lógica por:
    // const response = await axios.get(`${API_BASE_URL}/evento`);
    // return response.data;
    const response = await fetch(`${API_BASE_URL}/evento`);
    if (!response.ok) {
        throw new Error(`Erro ao buscar eventos: ${response.statusText}`);
    }
    return response.json();
};


// --- COMPONENTE SELECT REUTILIZÁVEL ---
/**
 * Componente de seleção genérico para listas de objetos.
 * O 'value' do <select> armazena o objeto completo como uma string JSON.
 */
function SelectField({ label, name, options, selectedValue, onChange, disabled }) {

    // Converte o objeto selecionado em string JSON para ser o 'value' do <select>
    const valueToDisplay = selectedValue ? JSON.stringify(selectedValue) : '';

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <select
                name={name}
                value={valueToDisplay}
                onChange={onChange}
                disabled={disabled || options.length === 0}
                className={`w-full rounded-lg border py-3 px-4 text-white shadow-inner focus:outline-none appearance-none cursor-pointer
            ${disabled || options.length === 0 ? 'bg-gray-700 border-gray-600 cursor-not-allowed' : 'bg-gray-800 border-gray-700 focus:ring-2 focus:ring-red-500'}`}
            >
                <option value="" disabled>Selecione um...</option>
                {options.map(option => (
                    <option
                        key={option.id}
                        // Armazena o objeto inteiro como string JSON
                        value={option.nome}
                    >
                        {option.nome}
                    </option>
                ))}
            </select>
            <span className="text-xs text-gray-500 mt-1">Selecionado: {selectedValue ? selectedValue.name : 'Nenhum'}</span>
        </div>
    );
}
// ----------------------------------------------------------------------


export default function InscricaoPage() {

    const [eventos, setEventos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [selectedUsuario, setSelectedUsuario] = useState(null);

    const [loading, setLoading] = useState(false); // Usado para o botão de envio
    const [isFetchingData, setIsFetchingData] = useState(true); // Usado para o carregamento inicial
    const [apiError, setApiError] = useState('');

    // 1. Lógica CRÍTICA: Busca Inicial dos Dados (Eventos e Usuários)
    useEffect(() => {
        const loadInitialData = async () => {
            setIsFetchingData(true);
            setApiError('');
            try {
                const [userList, eventList] = await Promise.all([
                    fetchUserList(),
                    fetchEventList(),
                ]);

                setUsuarios(userList);
                setEventos(eventList);

                // Define a primeira opção como selecionada por padrão, se existirem
                setSelectedUsuario(userList[0] || null);
                setSelectedEvento(eventList[0] || null);

                if (userList.length === 0 || eventList.length === 0) {
                    setApiError('Não há usuários ou eventos disponíveis na API.');
                }

            } catch (error) {
                console.error("Erro ao carregar dados iniciais:", error);
                // Mensagem mais informativa sobre a falha do localhost
                setApiError('ERRO (Conexão): Falha ao conectar em localhost:8080. Verifique se o backend está rodando.');
            } finally {
                setIsFetchingData(false);
            }
        };
        loadInitialData();
    }, []); // Executa apenas na montagem

    // 2. Função de manipulação de mudança para os campos <select>
    const handleSelectChange = (e) => {
        const { name, value } = e.target;

        // Converte a string JSON de volta para objeto
        // Se o valor for vazio, define como null
        const selectedObject = value ? JSON.parse(value) : null;

        if (name === 'selectedEvento') {
            setSelectedEvento(selectedObject);
        } else if (name === 'selectedUsuario') {
            setSelectedUsuario(selectedObject);
        }
    };


    // 3. Lógica de envio da inscrição
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError('');

        if (!selectedEvento || !selectedUsuario) {
            setApiError("Selecione um Evento e um Usuário válidos.");
            setLoading(false);
            return;
        }

        console.log(selectedEvento.id);

        const response = await axios.post(
            `${API_BASE_URL}/inscricao`,
            {
                evento: selectedEvento.id,
                usuario: selectedUsuario.id,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const responseData = response.data;



        setLoading(false)

        // Exibe mensagem de sucesso
        const successMessage = `Sucesso: Inscrição de ${selectedUsuario.nome} para ${selectedEvento.nome} realizada! ID: ${responseData.id}`;
        console.log("Inscrição Realizada:", responseData);
        setApiError(successMessage);
    };


    if (isFetchingData) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
                <Loader2 className="h-8 w-8 animate-spin text-red-500 mr-3" />
                <p className="text-lg">Carregando dados da API...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md px-4">

                <div className="rounded-xl bg-gray-800 p-8 shadow-3xl border border-red-500/30">

                    <div className="mb-8 text-center">
                        <UserPlus className="mx-auto mb-3 h-10 w-10 text-red-500" />
                        <h1 className="text-3xl font-extrabold text-white">
                            Registrar Nova Inscrição
                        </h1>
                        <p className="mt-1 text-gray-400">Selecione o usuário e o evento e envie o DTO.</p>
                    </div>

                    {apiError && (
                        <div className={`mb-6 rounded-lg p-3 shadow-lg border text-sm font-medium ${apiError.startsWith('Sucesso') ? 'bg-green-800/20 text-green-400 border-green-700' : 'bg-red-800/20 text-red-400 border-red-700'}`}>
                            <p className="flex items-center">
                                {apiError.startsWith('Sucesso') ?
                                    <Send className="mr-2 h-4 w-4" /> :
                                    <XCircle className="mr-2 h-4 w-4" />
                                }
                                {apiError}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 gap-6">

                            {/* Seleção de Evento */}
                            <SelectField
                                label="Selecionar Evento"
                                name="selectedEvento"
                                options={eventos}
                                selectedValue={selectedEvento}
                                onChange={handleSelectChange}
                                disabled={loading}
                            />

                            {/* Seleção de Usuário */}
                            <SelectField
                                label="Selecionar Usuário"
                                name="selectedUsuario"
                                options={usuarios}
                                selectedValue={selectedUsuario}
                                onChange={handleSelectChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || !selectedEvento || !selectedUsuario || eventos.length === 0 || usuarios.length === 0}
                                className="flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-3 text-lg font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <Loader2 className="h-5 w-5 animate-spin mr-3" />
                                        Processando Requisição...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <Send className="h-5 w-5 mr-3" />
                                        Inscrever-se
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        <a href="#" className="font-semibold text-red-500 hover:underline">
                            Voltar para a página inicial
                        </a>
                    </p>

                </div>
            </div>
        </div>
    );
}