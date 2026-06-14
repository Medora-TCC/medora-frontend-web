import {Activity }from 'lucide-react';

export default function Footer() {


    return (
        <footer className="bg-slate-950 text-slate-400 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-slate-800 pb-12 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-6 h-6 text-primary-500" />
              <span className="text-white font-bold text-xl">Medora</span>
            </div>
            <p className="text-sm">Transformando a gestão em saúde através da tecnologia.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-white font-semibold mb-2"
            >Links</p>
            <a href="/politica-de-privacidade" className="hover:text-primary-400">Privacidade</a>
            <a href="/termos-de-uso" className="hover:text-primary-400">Termos de Uso</a>
          </div>
          <div className="text-sm">
            <p className="text-white font-semibold mb-2">Contato</p>
            <p>contato@medora.com.br</p>
          </div>
        </div>
        <p className="text-center text-xs tracking-widest">© 2026 MEDORA - CURITIBA/PR</p>
      </footer>
    )
} 