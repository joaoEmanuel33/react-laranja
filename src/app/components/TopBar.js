'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext/page';
import Link from 'next/link';
import { 
  PlusCircle, LogIn, CalendarClock, LogOut, Edit
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth(); // Obtém o estado de autenticação e a função de logout do contexto
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout(); // Chama a função de logout do contexto
    router.push('/login'); // Redireciona para a página de login
  };

  const barClasses = `
    fixed top-0 left-0 w-full z-50 transition-all duration-300
    ${scrolled ? 'bg-gray-900 shadow-lg' : 'bg-transparent'}
  `;

  const linkClasses = "flex items-center space-x-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-colors duration-200";
  const primaryButtonClasses = "bg-redbull-accent text-white hover:bg-redbull-accent/80 shadow-md hover:shadow-lg";

  return (
    <header className={barClasses}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Lado Esquerdo: Nome do Projeto (Rota: /) */}
        <Link href="/" passHref legacyBehavior>
          <a className={`${linkClasses} text-white hover:text-redbull-accent cursor-pointer text-lg`}>
            <CalendarClock className="h-6 w-6" />
            <span className="hidden font-bold sm:inline uppercase tracking-wider">Events Manager</span>
          </a>
        </Link>

        {/* Lado Direito: Ações e Autenticação */}
        <nav className="flex items-center space-x-3">
          
          {isLoggedIn ? (
            // --- USUÁRIO LOGADO ---
            <>
              {/* Cadastrar Evento (Rota: /evento/create) */}
              <Link href="/evento/create" passHref legacyBehavior>
                <a className={`${linkClasses} ${primaryButtonClasses} hidden sm:flex`}>
                  <PlusCircle className="h-4 w-4" />
                  <span>Novo Evento</span>
                </a>
              </Link>

              {/* Editar Evento (Rota: /evento/edit) */}
              <Link href="/evento/edit" passHref legacyBehavior>
                <a className={`${linkClasses} ${primaryButtonClasses} hidden sm:flex`}>
                  <Edit className="h-4 w-4" />
                  <span>Editar Evento</span>
                </a>
              </Link>
              
              {/* Botão de Logout */}
              <button 
                onClick={handleLogout}
                className={`${linkClasses} text-red-400 border border-red-800/50 hover:bg-red-800/30`}
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </>
          ) : (
            // --- USUÁRIO DESLOGADO ---
            <>
              {/* Entrar (Rota: /login) */}
              <Link href="/login" passHref legacyBehavior>
                <a className={`${linkClasses} text-white bg-gray-700 hover:bg-redbull-accent/20 border border-gray-600`}>
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </a>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}