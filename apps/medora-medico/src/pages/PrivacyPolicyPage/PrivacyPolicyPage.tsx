export function PrivacyPolicyPage() {
    return (
        <section className="px-4 py-12 max-w-6xl">
            <section className="bg-surface p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200/50">
                <section className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 uppercase tracking-tight">
                        Política de Privacidade
                    </h1>
                    <p className="text-sm text-muted font-medium">
                        Última atualização: 19 de abril de 2026
                    </p>
                </section>

                <div className="space-y-8 text-text-">
                    <section className="bg-surface-alt p-5 rounded-xl text-text-primary">
                        <h2 className="text-xl font-bold text-text-primary mb-3">1. Coleta de Dados</h2>
                        <p className="mb-4">Para o funcionamento adequado da nossa plataforma, coletamos:</p>

                        <div className="space-y-4 ">
                            <div>
                                <h3 className="font-semibold">1.1 Dados Cadastrais</h3>
                                <ul className="list-disc list-inside mt-1 ml-2">
                                    <li>Nome completo, CPF e data de nascimento.</li>
                                    <li>E-mail, telefone e endereço para comunicações.</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold">1.2 Dados de Saúde (Sensíveis)</h3>
                                <p className="text-sm mb-2">Conforme definido pela LGPD, tratamos dados sensíveis com camadas extras de segurança, incluindo:</p>
                                <ul className="list-disc list-inside ml-2 space-y-1">
                                    <li>Histórico médico e prontuários eletrônicos.</li>
                                    <li>Prescrições, resultados de exames e anotações.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-2">2. Finalidade do Tratamento</h2>
                        <p className="leading-relaxed">Utilizamos seus dados exclusivamente para prestar os serviços médicos contratados, permitir o acesso de profissionais autorizados e cumprir obrigações regulatórias do Conselho Federal de Medicina (CFM).</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-2">3. Segurança e Armazenamento</h2>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <strong className="block text-blue-900 mb-1">Compromisso de Segurança:</strong>
                            <p className="text-sm text-blue-800">Todos os dados de saúde são armazenados de forma criptografada (at-rest) e o tráfego é protegido por protocolos TLS/HTTPS.</p>
                        </div>
                        <p className="mt-4 leading-relaxed">Os registros são mantidos pelo prazo mínimo de 20 anos, conforme exigência legal para prontuários médicos.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-2">4. Seus Direitos</h2>
                        <p className="leading-relaxed">Você possui o direito de confirmar a existência do tratamento, acessar seus dados, solicitar correções e a portabilidade das informações clínicas, respeitadas as normas de ética médica.</p>
                    </section>

                    <section className="pt-4 border-t border-slate-200">
                        <h2 className="text-lg font-bold text-text-primary mb-2">5. Contato</h2>
                        <p>Para dúvidas ou exercício de direitos, entre em contato pelo email: <a href="mailto:privacidade@exemplo.com.br" className="text-blue-600 font-semibold hover:underline">
                            privacidade@exemplo.com.br
                        </a></p>
                    </section>
                </div>
            </section>
        </section>
    );
}