import { useState } from 'react';
import { useNavigate } from 'react-router';
import {  
  ShieldCheck, Zap, Users, CheckCircle, FileText, Award, Monitor, ChevronRight, ChevronDown
} from 'lucide-react';
import { 
  Button,
  Chip 
} from '@heroui/react';
import { FloatingCard } from '../../../../../packages/shared/src/components/FloatingCard';

export function HomePage() {
  const navigate = useNavigate();
  
  // Estado para gerenciar qual pergunta do FAQ está expandida
  const [openFaqKey, setOpenFaqKey] = useState<string | null>(null);

  const toggleFaq = (key: string) => {
    setOpenFaqKey(openFaqKey === key ? null : key);
  };

  const testimonials = [
    {
      quote: "O Medora transformou a rotina do meu consultório. A emissão de receitas com certificado ICP-Brasil é extremamente ágil.",
      author: "Dra. Helena Souza",
      role: "Cardiologista",
      crm: "CRM-PR 12345"
    },
    {
      quote: "A validação automática do CRM traz uma segurança jurídica que eu não encontrava em outros sistemas de prontuário.",
      author: "Dr. Marcus Vinícius",
      role: "Pediatra",
      crm: "CRM-SP 67890"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900 selection:bg-blue-100 selection:text-blue-700 w-full font-sans antialiased">
      
      {/* Banner de Aviso */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800 font-medium flex items-center justify-center gap-2">
        <Monitor size={14} className="shrink-0" />
        <span>Para uma experiência completa de atendimento e emissão de receitas, recomendamos o uso em ambiente Desktop.</span>
      </div>

      <main>
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 pt-20 pb-16 text-center overflow-hidden max-w-5xl mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-50/60 via-transparent to-transparent -z-10" />
          
          <Chip color="accent" variant="soft" className="uppercase text-xs font-semibold tracking-widest bg-blue-50 text-blue-700 border-blue-200">
            Tecnologia e Cuidado: A Nova Forma de Encontrar Saúde.
          </Chip>

          {/* Nome da Aplicação com tamanho maior e espaçamento perfeitamente simétrico */}
          <div className="text-6xl md:text-7xl lg:text-8xl font-black text-[#1d4ed8] tracking-tight mt-6 mb-6">
            Medora
          </div>
          
          <h1 className="text-2xl sm:text-5xl md:text-5xl font-black text-slate-950 mb-6 tracking-tight leading-tight">
            Um{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              ambiente integrado
            </span>{" "}
            para seus atendimentos e uma{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              gestão simplificada
            </span>{" "}
            das consultas.
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed px-2">
            Otimize suas consultas, centralize históricos e assine documentos digitalmente com validade jurídica. O Medora foi feito para médicos que priorizam o tempo com o paciente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Button 
              className="bg-[#1d4ed8] text-white font-semibold px-8 py-6 rounded-xl hover:bg-blue-800 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 w-full sm:w-auto text-base group"
              onPress={() => navigate('/cadastro')}
            >
              Cadastre-se agora
              <ChevronRight size={18} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button 
              className="bg-white border-2 border-slate-200 text-slate-700 font-semibold px-8 py-6 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 w-full sm:w-auto text-base"
              onPress={() => navigate('/login')}
            >
              Já tenho uma conta
            </Button>
          </div>
        </section>

        {/* Métricas / Prova Social */}
        <section className="py-12 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
            {[
              { label: 'Médicos Ativos', value: '+500' },
              { label: 'Consultas Realizadas', value: '150k' },
              { label: 'Segurança de Dados', value: 'LGPD' },
              { label: 'Uptime do Sistema', value: '99.9%' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-[#1d4ed8]">{stat.value}</p>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Floating Cards - Ajustados para ficarem retos */}
        <section className="max-w-6xl mx-auto py-20 px-6 md:h-80">
          <div className="w-full h-full flex flex-col md:flex-row gap-6 md:gap-4 justify-center items-center">
            <FloatingCard 
              className="w-full md:w-auto md:relative hover:scale-105 hover:z-30 transition-all duration-300 cursor-pointer shadow-xl"
              icon={<ShieldCheck className="text-blue-600"/>} 
              title="Segurança Máxima"
              subtitle="Prontuários criptografados e em conformidade estrita com a LGPD."
            />
            <FloatingCard 
              className="w-full md:w-auto md:relative z-10 scale-100 md:scale-105 hover:scale-110 hover:z-30 transition-all duration-300 cursor-pointer shadow-2xl"
              icon={<Zap className="text-cyan-500"/>} 
              title="Agilidade no Fluxo"
              subtitle="Preenchimento inteligente e histórico clínico acessível em dois cliques."
            />
            <FloatingCard 
              className="w-full md:w-auto md:relative hover:scale-105 hover:z-30 transition-all duration-300 cursor-pointer shadow-xl"
              icon={<Users className="text-emerald-500"/>} 
              title="Foco no Paciente"
              subtitle="Diminua o tempo olhando para a tela e aumente a conexão humana."
            />
          </div>
        </section>

        {/* Seção de Diferenciais / CFM */}
        <section className="bg-slate-900 text-white py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Desenvolvido sob as Normas CFM e Padrões Legais</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Garantia de segurança jurídica e autenticidade para o exercício da medicina digital.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Validação Integrada de CRM</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Conexão direta para verificação do status profissional ativo junto ao Conselho Federal de Medicina.</p>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4 text-cyan-400">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Prontuário Eletrônico (PEP)</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Estrutura clínica intuitiva com histórico de anamneses, prescrições e evolução do paciente unificados.</p>
              </div>

              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
                  <Award size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Padrão ICP-Brasil</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Assinatura digital qualificada integrada para receitas, atestados e laudos com total validade jurídica.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-20 max-w-5xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-12 text-slate-950">Quem utiliza aprova</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <p className="text-slate-600 italic leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <h4 className="font-bold text-slate-950">{t.author}</h4>
                  <p className="text-xs text-slate-400 font-medium">{t.role} • {t.crm}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Seção FAQ Autogerenciada */}
        <section className="max-w-3xl mx-auto py-20 px-6 border-t border-slate-100">
          <h3 className="text-3xl font-extrabold text-center mb-12 text-slate-950 tracking-tight">
            Dúvidas Frequentes
          </h3>
          
          <div className="w-full flex flex-col">
            {[
              {
                key: "1",
                q: "O que é a plataforma de gestão médica inteligente Medora?",
                a: "O Medora é um ecossistema completo que centraliza prontuários eletrônicos, agendamentos, telemedicina e controle financeiro em uma única interface responsiva e segura, otimizando o fluxo de trabalho do médico."
              },
              {
                key: "2",
                q: "Como funciona a validação automática de CRM do profissional?",
                a: "Durante o cadastro e em intervalos regulares, o sistema realiza uma consulta automatizada de forma segura com os bancos de dados dos conselhos regionais para garantir a conformidade cadastral e a segurança jurídica de quem opera a plataforma."
              },
              {
                key: "3",
                q: "Quais são os principais benefícios da automação no prontuário?",
                a: "Redução do tempo de digitação através de modelos inteligentes de anamnese, histórico clínico acessível em cliques e geração ágil de documentos com preenchimento preditivo baseado nas especialidades."
              },
              {
                key: "4",
                q: "Quanto tempo leva para migrar meus dados e implementar o sistema?",
                a: "O acesso à plataforma é imediato. Para migração de históricos vindos de outros sistemas ou planilhas antigas, nosso time de suporte realiza o processo com segurança em até 48 horas úteis."
              },
              {
                key: "5",
                q: "Qual é o nível de validade jurídica das receitas emitidas na plataforma?",
                a: "Total e irrestrita. Toda prescrição, laudo ou atestado emitido utiliza integração direta com o padrão ICP-Brasil, permitindo assinaturas digitais qualificadas que são aceitas por farmácias e órgãos reguladores em todo o país."
              },
              {
                key: "6",
                q: "Como consigo medir o ganho de eficiência do meu consultório?",
                a: "A plataforma conta com um painel de métricas analíticas que exibe o tempo médio de atendimento, taxa de conversão de consultas, faturamento por período e recorrência de pacientes automaticamente."
              },
              {
                key: "7",
                q: "Vale a pena utilizar o sistema mesmo atendendo apenas por telemedicina?",
                a: "Com certeza. O sistema possui uma sala de conferência integrada e criptografada com gravação opcional, emissão de documentos virtuais na hora e envio automático de receitas diretamente para o WhatsApp do paciente."
              },
              {
                key: "8",
                q: "O Medora é adequado para clínicas grandes ou apenas médicos autônomos?",
                a: "Ele se adapta perfeitamente a ambos. Possuímos controle de permissões multinível que atende desde consultórios isolados de médicos independentes até grandes clínicas com múltiplas secretárias, profissionais de saúde e salas físicas."
              }
            ].map((item) => {
              const isOpen = openFaqKey === item.key;

              return (
                <div 
                  key={item.key} 
                  className="border-b border-slate-200 last:border-b-0 w-full py-4"
                >
                  {/* Cabeçalho Ativador (Botão de Expandir) */}
                  <button
                    onClick={() => toggleFaq(item.key)}
                    className="w-full flex justify-between items-center text-left py-2 group focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {item.q}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={`text-slate-500 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? "rotate-180 text-blue-700" : ""
                      }`}
                    />
                  </button>

                  {/* Bloco de Conteúdo Colapsável */}
                  <div 
                    className={`grid transition-all duration-200 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed pb-2">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}