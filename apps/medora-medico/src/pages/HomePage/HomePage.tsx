import { useNavigate } from 'react-router';
import {  
  ShieldCheck, Zap, Users 
} from 'lucide-react';
import { 
  Button,
  Accordion,
  AccordionItem,
  Chip 
} from '@heroui/react';
import { FloatingCard } from '../../../../../packages/shared/src/components/FloatingCard';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900 selection:bg-primary-100 selection:text-primary-700 w-full">
      <Navbar />
      <main>
        <section className="relative px-6 pt-24 pb-16 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary-50/50 via-transparent to-transparent -z-10" />
          
          <Chip color="accent" variant="soft" className="mb-6 uppercase text-xs font-bold tracking-widest">
            A Nova Era da Gestão Médica
          </Chip>
          
          <h2 className="text-6xl md:text-7xl font-extrabold text-slate-950 mb-6 tracking-tight">
            Gestão de saúde <br />
            <span className="bg-linear-to-r from-primary-600 to-cyan-500 bg-clip-text text-transparent">
              inteligente para médicos.
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Otimize seu tempo e foque no que importa: o paciente. O Medora centraliza prontuários, agendamentos e métricas em uma interface pensada para alta performance.
          </p>

          <div className="flex gap-4 justify-center">
            <Button 
            className="bg-slate-900 text-white px-8 hover:bg-slate-800"
            onPress={() => navigate('/cadastro')}>Começar Agora</Button>
            <Button 
            className="bg-slate-500 text-white px-8 hover:bg-slate-600"
            onPress={() => navigate('/login')}>Já tenho uma conta</Button>
          </div>
        </section>

        <section className="py-12 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
            {[
              { label: 'Médicos Ativos', value: '+500' },
              { label: 'Consultas Realizadas', value: '150k' },
              { label: 'Segurança de Dados', value: 'LGPD' },
              { label: 'Uptime', value: '99.9%' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto py-24 px-6 md:h-80">
          <div className="relative w-full h-full flex flex-col md:flex-row gap-6 md:gap-0 justify-center items-center">
            <FloatingCard 
              className="md:relative static -rotate-6 hover:rotate-0 hover:z-30 transition-transform cursor-pointer md:-top-4 shadow-xl"
              icon={<ShieldCheck className="text-primary"/>} 
              title="Segurança Máxima"
              subtitle="Prontuários criptografados e seguros."
            />
            <FloatingCard 
              className="md:relative static z-10 scale-110 hover:z-30 transition-transform cursor-pointer shadow-2xl"
              icon={<Zap className="text-accent"/>} 
              title="Agilidade no Fluxo"
              subtitle="Preencha documentos mais rápido."
            />
            <FloatingCard 
              className="md:relative static rotate-6 hover:rotate-0 hover:z-30 transition-transform cursor-pointer md:top-4 shadow-xl"
              icon={<Users className="text-success"/>} 
              title="Foco no Paciente"
              subtitle="Passe tempo com quem importa."
            />
          </div>
        </section>

        <section className="max-w-3xl mx-auto py-20 px-6">
          <h3 className="text-3xl font-bold text-center mb-10">Dúvidas Frequentes</h3>
          <Accordion variant="default">
            <AccordionItem key="1" aria-label="Integração">
              <div className="font-semibold mb-2">O sistema integra com outros ERPs?</div>
              Sim, o Medora possui APIs robustas para integração com sistemas legados e laboratórios.
            </AccordionItem>
            <AccordionItem key="2" aria-label="Segurança">
              <div className="font-semibold mb-2">Como meus dados são protegidos?</div>
              Utilizamos infraestrutura de ponta com backups automáticos e criptografia de ponta a ponta.
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <Footer />
    </div>
  );
}
