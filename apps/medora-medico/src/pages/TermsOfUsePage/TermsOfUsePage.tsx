export function TermsOfUsePage() {
  return (
    <section className="px-4 py-12 max-w-6xl">
      <section className="bg-surface p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200/50">
        <section className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 uppercase tracking-tight">
            Termos e condições de uso
          </h1>
          <p className="text-sm text-muted font-medium">
            Última atualização: 27 de abril de 2026
          </p>
          <p className="text-justify mt-4">
            Este documento estabelece os Termos e Condições de Uso ("Termos")
            aplicáveis aos médicos e profissionais de saúde ("Profissional" ou
            "Você") que utilizam a nossa plataforma de agendamento de consultas,
            gestão de prontuários e telemedicina ("Plataforma")
          </p>
          <p className="text-justify">
            Ao cirar uma conta e utilizar a Plataforma, Você concorda
            expressamente com as regras aqui desccritas.
          </p>
        </section>

        <div className="space-y-8 text-text-">
          <section className="bg-surface-alt p-5 rounded-xl text-text-primary">
            <h2 className="text-xl font-bold text-text-primary mb-3">
              1. Aceitação dos termos
            </h2>

            <p className="text-justify">
              O acesso e a utilização da Plataforma pelo Profissional estão
              condicionadas à aceitação integral destes Termos, bem como da
              nossa Política de Privacidade. Caso não concorde com qualquer
              disposição, o Profissional deverá abster-se de utilizar a
              Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              2. Natureza dos serviços
            </h2>
            <p>
              A Plataforma atua como uma infraestrutura tecnológica que oferece
              soluções para:
            </p>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>
                Agendamento de consultas (presenciais e por telemedicina).
              </li>
              <li>Gestão de agenda médica.</li>
              <li>
                Registro e armazenamento de Prontuário Eletrônico do Paciente
                (PEP).
              </li>
              <li>Ambiente seguro para realização de teleconsultas.</li>
            </ul>
            <p className="mt-2">
              A Plataforma não presta serviços médicos, não atua como operadora
              de plano de saúde e não se responsabiliza pela consuta técnica,
              ética ou diagnóstica do Profissional.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              3. Cadastro e Credenciais
            </h2>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>
                <strong>Requisitos:</strong> Para se cadastrar, o Profissional
                deve possuir registro ativo e regular no Conselho Regional de
                Medicina (CRM) do estado em que atua.
              </li>
              <li>
                <strong>Veracidade: </strong>Você é o único responsável pela
                veracidade e atualização dos dados fornecidos no cadastro.
              </li>
              <li>
                <strong>Uso Pessoal: </strong>
                As credenciais de acesso (login e senha) são de uso pessoal,
                intransferível e de total responsabilidade do Profissional. O
                compartilhamento de senhas com terceiros, incluindo assistentes
                ou secretárias, é estritamente proibido.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              4. Sigilo médico e Proteção de Dados (LGPD)
            </h2>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>
                <strong>Confidencialidade:</strong> O Profissional compromete-se
                a manter o mais absoluto sigilo sobre as informações de saúde
                dos pacientes, em conformidade com o Código de Ética Médica.
              </li>
              <li>
                <strong>LGPD: </strong>Ambas as partes comprometem-se a cumprir
                as diretrizes da Lei Geral de Proteção de Dados (Lei nº
                13.709/2018). O Profissional atuará como Controlador ou Operador
                dos dados dos pacientes, dependendo da relação jurídica
                estabelecida, e deverá utilizar a Plataforma exclusivamente para
                as finalidades legais do atendimento em saúde.
              </li>
              <li>
                <strong>Segurança: </strong>A Plataforma adota medidas técnicas
                e administrativas (como criptografia e controle de acesso) para
                proteger os dados armazenados contra acessos não autorizados.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              6. Responsabilidades do Profissional
            </h2>
            <p>O profissional compromete-se a:</p>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>
                Prestar atendimento de qualidade, seguindo os protocolos e
                resoluções do Conselho Federal de Medicina (CFM), especialmente
                as normas vigentes sobre telemedicina.
              </li>
              <li>
                Manter sua agenda atualizada, honrando os horários de consultas
                agendados pelos pacientes através da Plataforma.
              </li>
              <li>
                Comunicar previamente aos pacientes em caso de imprevistos,
                atrasos ou necessidade de reagendamento.
              </li>
              <li>
                Obter o consentimento informado do paciente (quando aplicável)
                antes da realização de teleconsultas ou do compartilhamento de
                dados.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              7. Disponibilidade da Plataforma
            </h2>
            <p>
              A Plataforma realizará seus melhores esforços para manter o
              sistema disponível de forma contínua. Contudo, não garantimos que
              a Plataforma estará isenta de interrupções temporárias causadas
              por manutenções preventivas, falhas de provedores de internet, ou
              motivos de força maior. O Profissional exime a Plataforma de
              responsabilidade por eventuais lucros cessantes decorrentes de
              indisponibilidade técnica.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              8. Suspensão e Cancelamento
            </h2>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>
                A Plataforma reserva-se o direito de suspender ou cancelar, a
                qualquer momento, o acesso do Profissional caso seja constatada
                violação destes Termos, uso fraudulento, suspensão/cassação do
                registro no CRM, ou reclamações reiteradas de pacientes sobre a
                conduta no uso do sistema.
              </li>
              <li>
                O Profissional pode solicitar o cancelamento de sua conta a
                qualquer momento, sendo-lhe garantida a portabilidade e a
                extração dos dados de seus prontuários médicos de acordo com a
                legislação vigente, preservando a guarda legal exigida.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              9. Foro
            </h2>
            <p>
              Fica eleito o foro da Comarca em que a empresa mantenedora da
              Plataforma tem sua sede para dirimir quaisquer dúvidas ou litígios
              oriundos destes Termos, com renúncia a qualquer outro, por mais
              privilegiado que seja.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-200">
            <h2 className="text-lg font-bold text-text-primary mb-2">
              10. Contato
            </h2>
            <p>
              Para dúvidas ou exercício de direitos, entre em contato pelo
              email:{" "}
              <a
                href="mailto:privacidade@exemplo.com.br"
                className="text-blue-600 font-semibold hover:underline"
              >
                termos@exemplo.com.br
              </a>
            </p>
          </section>
        </div>
      </section>
    </section>
  );
}
