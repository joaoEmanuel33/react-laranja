'use client';

import React, { useState, useEffect } from 'react';
// import Link from 'next/link'; // REMOVIDO: Next.js Link para evitar erro de compilação no Canvas
import { Menu, PlusCircle, LogIn, CalendarClock, UserPlus } from 'lucide-react'; 

export default function TopBar() {
  // Estado para controlar a visibilidade da barra (true = visível)
  const [isVisible, setIsVisible] = useState(true);
  // Estado para armazenar a última posição Y conhecida
  const [lastScrollY, setLastScrollY] = useState(0);

  // Efeito para detectar a direção da rolagem e controlar a visibilidade
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Define a margem do topo (por exemplo, 80px)
      const topOffset = 80;

      // 1. Se estiver no topo da página, a barra é sempre visível
      if (currentScrollY <= topOffset) {
        setIsVisible(true);
      } 
      // 2. Se a rolagem for para baixo E já tiver saído do topo (currentScrollY > lastScrollY)
      else if (currentScrollY > lastScrollY && currentScrollY > topOffset) {
        setIsVisible(false); // Esconder a barra
      } 
      // 3. Se a rolagem for para cima (currentScrollY < lastScrollY)
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true); // Mostrar a barra
      }

      // Atualiza a última posição de rolagem
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]); // Roda sempre que a última posição de rolagem mudar

  // Classes Tailwind para mudar o estilo e aplicar o efeito de esconder/mostrar
  const barClasses = `
    fixed top-0 left-0 w-full z-50 
    transition-transform duration-300 ease-in-out backdrop-blur-md
    bg-gray-900 bg-opacity-90 border-b border-gray-700/50
    ${isVisible ? 'translate-y-0 shadow-xl' : '-translate-y-full shadow-none'}
  `;

  // Classes base mantidas
  const linkClasses = "flex items-center space-x-2 px-3 py-2 rounded-lg font-semibold transition-colors duration-200";
  const primaryButtonClasses = `${linkClasses} bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg`;
  const tertiaryButtonClasses = `${linkClasses} text-white bg-gray-700 hover:bg-red-500/20 border border-gray-600`;
  const logoClasses = "flex items-center space-x-2 px-3 py-2 font-semibold text-white hover:text-red-500 cursor-pointer";

  // Componente A de substituição (no seu projeto Next.js, substitua A por Link)
  const A = ({ href, className, children }) => (
    <a href={href} className={className}>
      {/* O e.preventDefault() foi removido daqui. */}
      {children}
    </a>
  );


  return (
    <header className={barClasses}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* 1. Lado Esquerdo: Events Manager */}
        <A href="/" className={logoClasses}> {/* Usando A (substituto de Link) */}
          <CalendarClock className="h-6 w-6 text-red-500" />
          <span className="hidden text-lg font-bold sm:inline">Events Manager</span>
        </A>

        {/* ---------------------------------------------------- */}
        {/* Centro: Cadastrar Evento e Inscrever-se */}
        <div className="hidden md:flex gap-3"> 
          
          {/* 2. Botão Cadastrar Evento */}
          <A href="/evento/create" className={primaryButtonClasses}> {/* Usando A (substituto de Link) */}
            <PlusCircle className="h-5 w-5" />
            <span>Cadastrar Evento</span>
          </A>
          
          {/* 3. Botão Inscrever-se */}
          <A href="/inscricao" className={primaryButtonClasses}> {/* Usando A (substituto de Link) */}
            <UserPlus className="h-5 w-5" />
            <span>Inscrever-se em um evento</span>
          </A>
        </div>
        {/* ---------------------------------------------------- */}


        {/* 4. Lado Direito: Botão Entrar */}
        <A href="/login" className={tertiaryButtonClasses}> {/* Usando A (substituto de Link) */}
          <LogIn className="h-5 w-5" />
          <span>Login</span>
        </A>
        
        {/* Menu Mobile (Placeholder) */}
        <button className="text-white md:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}