// components/TopBar.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, PlusCircle, LogIn, CalendarClock } from 'lucide-react';

export default function TopBar() {
  const [scrolled, setScrolled] = useState(false);

  // Efeito para detectar a rolagem da página (scroll)
  useEffect(() => {
    const handleScroll = () => {
      // Define como true se a rolagem vertical (scrollY) for maior que 50px
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Limpeza do listener para evitar vazamento de memória
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Classes Tailwind para mudar o estilo
  const barClasses = `
    fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-sm
    ${scrolled 
      ? 'bg-redbull-dark-blue/90 border-b border-redbull-accent/50 shadow-xl' // Cor sólida e borda ao rolar
      : 'bg-transparent' // Transparente no topo
    }
  `;

  const buttonClasses = "flex items-center space-x-2 px-3 py-2 rounded-lg font-semibold transition-colors duration-200";
  const primaryButtonClasses = "bg-redbull-accent text-white hover:bg-redbull-accent/80 shadow-md hover:shadow-lg";

  return (
    <header className={barClasses}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Lado Esquerdo: Events Manager e Ícone (Rota: /) */}
        <Link href="/" passHref>
          <div className={`${buttonClasses} text-white hover:text-redbull-accent cursor-pointer`}>
            <CalendarClock className="h-6 w-6" />
            <span className="hidden text-lg font-bold sm:inline">Events Manager</span>
          </div>
        </Link>

        {/* Centro: Cadastrar Evento (Rota: /evento/create) */}
        <div className="hidden md:block">
          <Link href="/evento/create" passHref>
            <button className={`${buttonClasses} ${primaryButtonClasses}`}>
              <PlusCircle className="h-5 w-5" />
              <span>Cadastrar Evento</span>
            </button>
          </Link>
        </div>

        {/* Lado Direito: Entrar (Rota: /login) */}
        <Link href="/login" passHref>
          <button className={`${buttonClasses} text-white bg-gray-700 hover:bg-redbull-accent/20 border border-gray-600`}>
            <LogIn className="h-5 w-5" />
            <span>Entrar</span>
          </button>
        </Link>
        
        {/* Menu Mobile (Placeholder) */}
        <button className="text-white md:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}