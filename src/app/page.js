'use client'; 

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, Link as LinkIcon, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link'; 

// --- 1. CONFIGURAÇÃO E CONSTANTES ---

const API_ENDPOINT = 'http://localhost/api/v1/evento';

// --- 2. UTILITÁRIO DE FORMATAÇÃO DE DATA ---

/**
 * Formata as strings ISO Date de início e fim para exibição, incluindo ranges.
 * Assume que dataInicio e dataFinal vêm do Spring como strings ISO.
 */
function formatEventDates(dataInicio, dataFinal) {
  const startDate = new Date(dataInicio);
  const endDate = new Date(dataFinal);
  
  const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  
  const startDay = startDate.toLocaleDateString('pt-BR', dateOptions);
  const startTime = startDate.toLocaleTimeString('pt-BR', timeOptions);
  
  const endDay = endDate.toLocaleDateString('pt-BR', dateOptions);
  const endTime = endDate.toLocaleTimeString('pt-BR', timeOptions);
  
  const isMultiDay = startDay !== endDay;

  let schedule = '';
  if (isMultiDay) {
    schedule = `${startDay} ${startTime} - ${endDay} ${endTime}`;
  } else if (startTime !== endTime) {
    schedule = `${startDay} das ${startTime} às ${endTime}`;
  } else {
    schedule = `${startDay} às ${startTime}`;
  }

  return { 
    startDay, 
    startTime, 
    fullSchedule: schedule, 
    isMultiDay 
  };
}

// --- 3. COMPONENTE DE MINIATURA (MINIEVENTCARD) ---

function MiniEventCard({ evento }) {
  const { fullSchedule } = formatEventDates(evento.dataInicio, evento.dataFinal);
  
  return (
    <div className="group overflow-hidden rounded-lg border border-redbull-accent/30 bg-redbull-dark-blue p-5 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-redbull-accent/50 cursor-pointer">
      
      <div className="flex items-start">
        <div className="mr-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-redbull-accent/10">
          <MapPin className="h-7 w-7 text-redbull-accent" />
        </div>

        <div>
          <h3 className="mb-1 text-xl font-bold transition-colors duration-300 group-hover:text-redbull-accent">
            {evento.nome}
          </h3>
          <div className="flex items-center text-sm font-medium text-gray-400">
            <Calendar className="mr-1 h-4 w-4" />
            <span>{fullSchedule}</span>
          </div>
          <p className="mt-2 text-sm text-gray-300 line-clamp-2">
            {evento.descricao}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- 4. COMPONENTE DE DESTAQUE (FEATUREDEVENTCARD) ---

function FeaturedEventCard({ evento }) {
  const { fullSchedule } = formatEventDates(evento.dataInicio, evento.dataFinal);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-redbull-dark-blue p-8 shadow-3xl transition-transform duration-300 hover:scale-[1.01] sm:flex sm:min-h-[400px]">
      
      {/* Efeito de Iluminação */}
      <div className="absolute inset-0 bg-gradient-to-r from-redbull-accent/20 to-transparent opacity-50"></div>
      
      <div className="relative z-10 sm:w-2/3">
        <h1 className="mb-2 text-4xl font-extrabold leading-tight text-redbull-accent md:text-5xl">
          {evento.nome}
        </h1>
        <p className="mb-6 text-xl font-light text-gray-300">
          {evento.descricao}
        </p>

        <div className="space-y-3">
          <div className="flex items-center text-lg font-medium text-gray-200">
            <Calendar className="mr-3 h-6 w-6 text-redbull-accent" />
            <span>{fullSchedule}</span>
          </div>
          <div className="flex items-center text-lg font-medium text-gray-200">
            <MapPin className="mr-3 h-6 w-6 text-redbull-accent" />
            <span>{evento.local}</span>
          </div>
        </div>
        
        {evento.linkEvento && (
          <Link href={evento.linkEvento} target="_blank" rel="noopener noreferrer">
            <button className="mt-8 flex items-center rounded-full bg-redbull-accent px-8 py-3 text-lg font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-redbull-accent/90 hover:shadow-2xl">
              <LinkIcon className="h-5 w-5 mr-2" />
              Acessar Evento
            </button>
          </Link>
        )}
      </div>
      
      {/* Imagem em destaque */}
      <div className="relative hidden sm:block sm:w-1/3">
        <div className="ml-auto h-full w-full max-w-sm overflow-hidden rounded-lg shadow-2xl">
          {evento.linkImagem ? (
             


 
            <img 
              src={evento.linkImagem} 
              alt={`Imagem de ${evento.nome}`} 
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-800">
              <ImageIcon className="h-12 w-12 text-gray-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 5. PÁGINA PRINCIPAL (EVENTLISTPAGE) ---

export default function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get('http://localhost:8080/api/v1/evento');
        setEvents(response.data); 
      } catch (err) {
        console.error("Erro ao buscar eventos:", err);
        setError('❌ Erro ao carregar eventos. Verifique a conexão com o servidor Spring.');
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // --- Renderização Condicional ---
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-redbull-dark-blue p-8">
        <Loader2 className="h-12 w-12 animate-spin text-redbull-accent" />
        <p className="mt-4 text-xl font-medium text-redbull-accent">
          Conectando ao servidor...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-redbull-dark-blue p-8 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
        <p className="text-xl font-bold text-white">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-redbull-dark-blue p-8 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-gray-400" />
        <p className="text-xl font-bold text-white">Nenhum evento agendado no momento.</p>
      </div>
    );
  }
  
  const featuredEvent = events[0];
  const miniEvents = events.slice(1);

  return (
    <main className="container mx-auto px-4 py-12">
      <h2 className="mb-10 text-center text-5xl font-extrabold uppercase tracking-widest text-white">
        Calendário de Eventos 🏎️
      </h2>
      
      {/* SEÇÃO DE DESTAQUE */}
      <section className="mb-16">
        <FeaturedEventCard evento={featuredEvent} />
      </section>

      {/* SEÇÃO DE MINIATURAS */}
      {miniEvents.length > 0 && (
        <>
          <h3 className="mb-8 text-3xl font-bold text-redbull-accent border-b border-redbull-accent/50 pb-2">
            Próximos Eventos
          </h3>
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {miniEvents.map(evento => (
              <MiniEventCard key={evento.id} evento={evento} />
            ))}
          </section>
        </>
      )}
      
      <div className='mt-16 text-center text-gray-600'>
        <p className='text-sm'>Dados consumidos via Axios do endpoint: `{API_ENDPOINT}`</p>
      </div>
    </main>
  );
}