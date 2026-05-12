const AREAS = {
  at1: {
    ctsp: {
      titulo: 'Segurança contra incêndios',
      cor: '#C0270F',
      corRgb: '192,39,15',
      badgeStyle: 'background:rgba(192,39,15,0.15);color:#E0866E;',
      grupos: [
        {
          titulo: 'Leis e Decretos',
          items: [
            { id:'lei13425', nome:'Lei Federal nº 13.425/2017', detalhe:'Prevenção e combate a incêndio e a desastres em estabelecimentos, edificações e áreas de reunião de público', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'lc14376', nome:'Lei Complementar nº 14.376/2013 (atualizada até LC nº 16.280/2025)', detalhe:'Normas sobre segurança, prevenção e proteção contra incêndios nas edificações e áreas de risco no RS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'dec51803', nome:'Decreto Estadual nº 51.803/2014 (atualizado até Decreto nº 57.393/2023)', detalhe:'Regulamenta a LC 14.376/2013', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Resoluções Técnicas — Procedimentos Administrativos',
          items: [
            { id:'rt01', nome:'RT CBMRS nº 01/2022', detalhe:'Procedimentos administrativos gerais do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'solcbmrs', nome:'SOL-CBMRS — 4ª Edição 2022', detalhe:'Sistema Online de Licenciamento do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'rt05p11', nome:'RT CBMRS nº 05 — Parte 1.1/2016', detalhe:'Disposições gerais e definições', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'rt05p02', nome:'RT CBMRS nº 05 — Parte 02/2023', detalhe:'Acesso de viaturas', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'rt05p31', nome:'RT CBMRS nº 05 — Parte 3.1/2016', detalhe:'Instalações prediais de água para combate a incêndios', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'rt05p72', nome:'RT CBMRS nº 05 — Parte 7.2/2021', detalhe:'Proteção por chuveiros automáticos', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'rt05p08', nome:'RT CBMRS nº 05 — Parte 08/2016', detalhe:'Símbolos gráficos para projetos de segurança contra incêndio', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'rt05p06', nome:'RT CBMRS nº 05 — Parte 06/2025 (Fiscalização)', detalhe:'Fiscalização de edificações e aplicação de penalidades', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Resoluções Técnicas — Medidas de Segurança',
          items: [
            { id:'rt11', nome:'RT CBMRS nº 11 — Parte 01/2016', detalhe:'Brigada de incêndio', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'rt14', nome:'RT CBMRS nº 14/2016', detalhe:'Carga de incêndio nas edificações', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'rt12', nome:'RT CBMRS nº 12/2021', detalhe:'Sinalização de emergência', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'rt15', nome:'RT CBMRS nº 15 — Parte 01/2023', detalhe:'Brigada de incêndio (versão revisada)', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
          ]
        }
      ]
    },
    cba: {
      titulo: 'Segurança contra incêndios',
      cor: '#185FA5',
      corRgb: '24,95,165',
      badgeStyle: 'background:rgba(24,95,165,0.15);color:#85B7EB;',
      grupos: [
        {
          titulo: 'Leis e Decretos',
          items: [
            { id:'lc14376', nome:'Lei Complementar nº 14.376/2013 (atualizada até LC nº 16.280/2025)', detalhe:'Normas sobre segurança, prevenção e proteção contra incêndios nas edificações e áreas de risco no RS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'dec51803', nome:'Decreto Estadual nº 51.803/2014 (atualizado até Decreto nº 57.393/2023)', detalhe:'Regulamenta a LC 14.376/2013', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Resoluções Técnicas — Procedimentos Administrativos',
          items: [
            { id:'rt01', nome:'RT CBMRS nº 01/2022', detalhe:'Procedimentos administrativos gerais do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'solcbmrs', nome:'SOL-CBMRS — 4ª Edição 2022', detalhe:'Sistema Online de Licenciamento do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'rt05p11', nome:'RT CBMRS nº 05 — Parte 1.1/2016', detalhe:'Disposições gerais e definições', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'rt05p02', nome:'RT CBMRS nº 05 — Parte 02/2023', detalhe:'Acesso de viaturas', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'rt05p04a', nome:'RT CBMRS nº 05 — Parte 04A/2017', detalhe:'Extintores de incêndio', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
            { id:'rt05p04b', nome:'RT CBMRS nº 05 — Parte 04B/2017', detalhe:'Sistema de hidrantes e mangotinhos', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
            { id:'rt05p04c', nome:'RT CBMRS nº 05 — Parte 04C/2017', detalhe:'Chuveiros automáticos — complemento', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
            { id:'rt05p72', nome:'RT CBMRS nº 05 — Parte 7.2/2021', detalhe:'Proteção por chuveiros automáticos', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'rt05p06', nome:'RT CBMRS nº 05 — Parte 06/2025 (Fiscalização)', detalhe:'Fiscalização de edificações e aplicação de penalidades', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Resoluções Técnicas — Medidas de Segurança',
          items: [
            { id:'rt15cba', nome:'RT CBMRS nº 15 — Parte 01/2022', detalhe:'Brigada de incêndio (versão CBA)', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
          ]
        }
      ]
    }
  },
  at2: {
    ctsp: {
      titulo: 'Combate a incêndios',
      cor: '#BA7517',
      corRgb: '186,117,23',
      badgeStyle: 'background:rgba(186,117,23,0.15);color:#EF9F27;',
      grupos: [
        {
          titulo: 'Manual de Combate a Incêndio Urbano CBMMG (1ª Ed. 2020)',
          items: [
            { id:'manual_combate_cbmmg', nome:'Manual de Combate a Incêndio Urbano CBMMG (Caps. 1, 2, 3, 5 e 7)', detalhe:'Fundamentos do incêndio, agentes extintores, equipamentos, técnicas de combate e incêndios especiais', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        }
      ]
    },
    cba: {
      titulo: 'Combate a incêndios',
      cor: '#BA7517',
      corRgb: '186,117,23',
      badgeStyle: 'background:rgba(186,117,23,0.15);color:#EF9F27;',
      grupos: [
        {
          titulo: 'Manual de Combate a Incêndio Urbano CBMMG (1ª Ed. 2020)',
          items: [
            { id:'manual_combate_cbmmg', nome:'Manual de Combate a Incêndio Urbano CBMMG (Caps. 1, 2, 3, 5 e 7)', detalhe:'Fundamentos do incêndio, agentes extintores, equipamentos, técnicas de combate e incêndios especiais', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        }
      ]
    }
  },
  at3: {
    ctsp: {
      titulo: 'Buscas e salvamentos / APH',
      cor: '#185FA5',
      corRgb: '24,95,165',
      badgeStyle: 'background:rgba(24,95,165,0.15);color:#85B7EB;',
      grupos: [
        {
          titulo: 'Atendimento Pré-Hospitalar — ITO 23 (CBMMG 3ª Ed. 2021)',
          items: [
            { id:'aph-intro', nome:'Introdução ao APH (p. 1–7)', detalhe:'Conceitos, histórico, sistemas de emergência, cadeia de sobrevivência', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'mod100', nome:'Módulo 100 — Suporte básico de vida (p. 7–72)', detalhe:'Avaliação da cena, avaliação primária e secundária, RCP, DEA, obstrução de vias aéreas', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'mod200', nome:'Módulo 200 — Trauma (p. 77–130)', detalhe:'Cinemática do trauma, hemorragias, choque, lesões musculoesqueléticas, imobilização', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'mod500', nome:'Módulo 500 — Situações especiais (p. 251–310)', detalhe:'Emergências clínicas, parto de emergência, intoxicações, afogamento', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Busca, Salvamento e Resgate',
          items: [
            { id:'it010', nome:'IT nº 010/AODC-GCG — Busca, salvamento e resgate', detalhe:'Protocolos, equipamentos, técnicas de busca e salvamento em diferentes ambientes', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Salvamento Veicular — ITO 34 (CBMMG 1ª Ed. 2023)',
          items: [
            { id:'salv-veic', nome:'Salvamento Veicular (p. 24–154)', detalhe:'Avaliação da cena, estabilização de veículos, ferramentas, técnicas de desencarceramento', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'pop-rs', nome:'POP — Salvamento Veicular RS', detalhe:'Procedimento Operacional Padrão do CBMRS para salvamento veicular', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        }
      ]
    },
    cba: {
      titulo: 'Buscas e salvamentos / APH',
      cor: '#185FA5',
      corRgb: '24,95,165',
      badgeStyle: 'background:rgba(24,95,165,0.15);color:#85B7EB;',
      grupos: [] // mesmo conteúdo — preenchido no script
    }
  },
  at4: {
    ctsp: {
      titulo: 'Direito institucional, constitucional e militar',
      cor: '#27A05A',
      corRgb: '39,160,90',
      badgeStyle: 'background:rgba(39,160,90,0.15);color:#7DD99A;',
      grupos: [
        {
          titulo: 'Legislação Institucional',
          items: [
            { id:'lc10990', nome:'LC nº 10.990/1997 — Estatuto dos Militares Estaduais (atualizado até LC nº 15.454/2020)', detalhe:'Situação, obrigações, deveres, direitos e prerrogativas dos servidores militares', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'lc10992', nome:'LC nº 10.992/1997 — Carreira dos Militares Estaduais', detalhe:'Quadros, carreiras, promoções e acesso aos cursos', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'lc14920', nome:'LC nº 14.920/2016 — Lei de Organização Básica do CBMRS', detalhe:'Estrutura, atribuições e organização do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'dec53897', nome:'Decreto nº 53.897/2018 — Regulamenta a LC 14.920/2016', detalhe:'Organização interna, departamentos e comandos regionais', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'lc15008', nome:'LC nº 15.008/2017 — Lei de Transição do CBMRS', detalhe:'Regras de transição para estruturação do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'lc15009', nome:'LC nº 15.009/2017 — Fixação de Efetivo do CBMRS', detalhe:'Efetivo de oficiais e praças do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'rdbm', nome:'Decreto nº 43.245/2004 — RDBM', detalhe:'Regulamento Disciplinar da Brigada Militar — transgressões, punições e comportamento', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Constituição Federal',
          items: [
            { id:'cf-adm', nome:'CF/88 — Administração Pública (arts. 37 a 42)', detalhe:'Princípios, servidores públicos, teto remuneratório, aposentadoria', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cf-jud', nome:'CF/88 — Poder Judiciário (arts. 125 e 126)', detalhe:'Justiça Estadual e Militar Estadual', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cf-fa', nome:'CF/88 — Forças Armadas (arts. 142 e 143)', detalhe:'Destinação, organização e serviço militar', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cf-sp', nome:'CF/88 — Segurança Pública (art. 144)', detalhe:'Órgãos, atribuições e organização da segurança pública', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Constituição do RS',
          items: [
            { id:'cers-mil', nome:'CE/RS — Servidores Públicos Militares (arts. 46 a 48)', detalhe:'Direitos e garantias dos militares estaduais', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cers-sp', nome:'CE/RS — Segurança Pública (arts. 124 a 131)', detalhe:'Brigada Militar, CBMRS e sistema de segurança pública do RS', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Direito Penal e Processual Militar',
          items: [
            { id:'cpm-ap', nome:'CPM — Aplicação da lei penal militar (arts. 1º a 9º)', detalhe:'Princípio da legalidade, territorialidade, crimes militares em tempo de paz', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cpm-acao', nome:'CPM — Ação penal militar (arts. 121 e 122)', detalhe:'Ação penal pública e privada no âmbito militar', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cpm-crimes', nome:'CPM — Crimes militares em tempo de paz (arts. 149–334)', detalhe:'Crimes contra a hierarquia, serviço militar, administração e patrimônio', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cppm-pjm', nome:'CPPM — Polícia Judiciária Militar (arts. 7º e 8º)', detalhe:'Exercício e competência da polícia judiciária militar', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cppm-ipm', nome:'CPPM — Inquérito Policial Militar (arts. 9º a 28)', detalhe:'Instauração, instrução e conclusão do IPM', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cppm-busca', nome:'CPPM — Busca e apreensão (arts. 170 a 189)', detalhe:'Procedimentos de busca e apreensão no processo penal militar', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cppm-prisao', nome:'CPPM — Prisão provisória e flagrante (arts. 220 a 253)', detalhe:'Prisão provisória, em flagrante e preventiva no âmbito militar', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Normas Correicionais — exclusivo CTSP',
          items: [
            { id:'ir003', nome:'IR nº 003.1/Corregedoria — PADM', detalhe:'Processo Administrativo Disciplinar Militar no âmbito do CBMRS', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'ir006', nome:'IR nº 006/Corregedoria — Sindicância Militar', detalhe:'Procedimentos de sindicância no CBMRS', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'ir008', nome:'IR nº 008/Corregedoria — IPM', detalhe:'Inquérito Policial Militar no âmbito do CBMRS', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
          ]
        }
      ]
    },
    cba: {
      titulo: 'Direito institucional, constitucional e militar',
      cor: '#27A05A',
      corRgb: '39,160,90',
      badgeStyle: 'background:rgba(39,160,90,0.15);color:#7DD99A;',
      grupos: [
        {
          titulo: 'Legislação Institucional',
          items: [
            { id:'lc10990', nome:'LC nº 10.990/1997 — Estatuto dos Militares Estaduais (atualizado até LC nº 15.454/2020)', detalhe:'Situação, obrigações, deveres, direitos e prerrogativas dos servidores militares', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'lc14920', nome:'LC nº 14.920/2016 — Lei de Organização Básica do CBMRS', detalhe:'Estrutura, atribuições e organização do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'dec53897', nome:'Decreto nº 53.897/2018 — Regulamenta a LC 14.920/2016', detalhe:'Organização interna, departamentos e comandos regionais', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'lc15008', nome:'LC nº 15.008/2017 — Lei de Transição do CBMRS', detalhe:'Regras de transição para estruturação do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'lc15009', nome:'LC nº 15.009/2017 — Fixação de Efetivo do CBMRS', detalhe:'Efetivo de oficiais e praças do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'rdbm', nome:'Decreto nº 43.245/2004 — RDBM', detalhe:'Regulamento Disciplinar da Brigada Militar', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Constituição Federal e Estadual',
          items: [
            { id:'cf-adm', nome:'CF/88 — Administração Pública (arts. 37 a 42)', detalhe:'Princípios, servidores públicos, teto remuneratório', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cf-jud', nome:'CF/88 — Poder Judiciário (arts. 125 e 126)', detalhe:'Justiça Estadual e Militar Estadual', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cf-fa', nome:'CF/88 — Forças Armadas (arts. 142 e 143)', detalhe:'Destinação e organização', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cf-sp', nome:'CF/88 — Segurança Pública (art. 144)', detalhe:'Órgãos e atribuições', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cers-mil', nome:'CE/RS — Servidores Públicos Militares (arts. 46 a 48)', detalhe:'Direitos e garantias', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cers-sp', nome:'CE/RS — Segurança Pública (arts. 124 a 131)', detalhe:'Sistema de segurança pública do RS', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Direito Penal e Processual Militar',
          items: [
            { id:'cpm-ap', nome:'CPM — Aplicação da lei penal militar (arts. 1º a 9º)', detalhe:'Crimes militares em tempo de paz', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cpm-acao', nome:'CPM — Ação penal militar (arts. 121 e 122)', detalhe:'Ação penal pública e privada', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cpm-crimes', nome:'CPM — Crimes militares em tempo de paz (arts. 149–334)', detalhe:'Crimes contra hierarquia, serviço e patrimônio', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cppm-pjm', nome:'CPPM — Polícia Judiciária Militar (arts. 7º e 8º)', detalhe:'Exercício e competência', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cppm-ipm', nome:'CPPM — IPM (arts. 9º a 28)', detalhe:'Instauração e instrução', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cppm-busca', nome:'CPPM — Busca e apreensão (arts. 170 a 189)', detalhe:'Procedimentos', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'cppm-prisao', nome:'CPPM — Prisão provisória e flagrante (arts. 220 a 253)', detalhe:'Prisão no processo penal militar', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        }
      ]
    }
  },
  at5: {
    ctsp: {
      titulo: 'Normas administrativas e documentação técnica',
      cor: '#7F77DD',
      corRgb: '127,119,221',
      badgeStyle: 'background:rgba(127,119,221,0.15);color:#AFA9EC;',
      grupos: [
        {
          titulo: 'Decretos Administrativos — exclusivo CTSP',
          items: [
            { id:'dec57390', nome:'Decreto nº 57.390/2023 — Movimentação de Militares', detalhe:'Regulamento de Movimentação dos militares estaduais da BM e do CBMRS', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'lei6196', nome:'Lei nº 6.196/1971 — Código de Vencimentos', detalhe:'Vencimentos, proventos, indenizações e direitos do pessoal da BM', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'dec24846', nome:'Decreto nº 24.846/1976 — Ajuda de custo, diárias e transportes', detalhe:'Concessão de ajuda de custo, diárias e meios de transporte aos servidores', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'dec35693', nome:'Decreto nº 35.693/1994 — Prestação de contas de diárias', detalhe:'Procedimentos de prestação de contas e homologação de diárias', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'dec35818', nome:'Decreto nº 35.818/1995 — Substituições temporárias', detalhe:'Procedimentos para realização de substituições temporárias na BM', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'dec49113', nome:'Decreto nº 49.113/2012 — Estágio Probatório', detalhe:'Regulamento do Estágio Probatório dos Militares Estaduais da BM', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
            { id:'dec40986', nome:'Decreto nº 40.986/2001 — Serviço extraordinário', detalhe:'Convocação e pagamento de serviço extraordinário dos militares estaduais', tag:'exclusivo', tagTxt:'Exclusivo CTSP' },
          ]
        },
        {
          titulo: 'Instruções Técnicas Operacionais',
          items: [
            { id:'it03', nome:'IT nº 03/AODC-GCG — Sistema E-193', detalhe:'Regulamenta o Sistema de Emergência 193 do CBMRS (atualizada até Portaria nº 026/CBMRS/2026)', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'it04', nome:'IT nº 04.2/2024 — Força de Resposta Rápida (FR2)', detalhe:'Estruturação e emprego da FR2 do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'it09', nome:'IT nº 09/AODC-GCG — Sistema de Comando de Incidentes', detalhe:'Utilização do SCI no âmbito do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        },
        {
          titulo: 'Documentação Técnica',
          items: [
            { id:'caderno', nome:'Caderno Temático de Documentação Técnica — ABM 2023', detalhe:'Documentos técnicos, redação oficial, pronomes de tratamento e gestão documental', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'port021', nome:'Portaria nº 021/2020 — Glossário Operacional', detalhe:'Glossário de designações, terminologias e atos normativos do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        }
      ]
    },
    cba: {
      titulo: 'Normas institucionais e documentação técnica',
      cor: '#7F77DD',
      corRgb: '127,119,221',
      badgeStyle: 'background:rgba(127,119,221,0.15);color:#AFA9EC;',
      grupos: [
        {
          titulo: 'Instruções Reguladoras — exclusivo CBA',
          items: [
            { id:'ir003adm', nome:'IR nº 003/ADM/EXC-20 — Escalas e efetividade', detalhe:'Procedimentos para escalas, efetividade e sistema RHE', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
            { id:'ir002adm', nome:'IR nº 002/Adm/RH-20 — Estágio Probatório', detalhe:'Regulamenta o estágio probatório no âmbito do CBMRS', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
            { id:'ir0011', nome:'IR nº 001.1/Corregedoria — Conselho de Disciplina', detalhe:'Procedimentos para Conselho de Disciplina no CBMRS', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
            { id:'ir0031', nome:'IR nº 003.1/Corregedoria — PADM', detalhe:'Processo Administrativo Disciplinar Militar no CBMRS', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
            { id:'ir006', nome:'IR nº 006/Corregedoria — Sindicância Militar', detalhe:'Procedimentos de sindicância no CBMRS', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
            { id:'ir008', nome:'IR nº 008/Corregedoria — IPM', detalhe:'Inquérito Policial Militar no âmbito do CBMRS', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
          ]
        },
        {
          titulo: 'Instruções Técnicas Operacionais',
          items: [
            { id:'it03', nome:'IT nº 03/AODC-GCG — Sistema E-193', detalhe:'Regulamenta o Sistema de Emergência 193 do CBMRS (atualizada até Portaria nº 026/CBMRS/2026)', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'it04', nome:'IT nº 04.2/2024 — Força de Resposta Rápida (FR2)', detalhe:'Estruturação e emprego da FR2 do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'it09', nome:'IT nº 09/AODC-GCG — Sistema de Comando de Incidentes', detalhe:'Utilização do SCI no âmbito do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'port018', nome:'Portaria nº 018/2024 — Circunscrição Administrativa e Operacional', detalhe:'Define circunscrições administrativas e operacionais do CBMRS', tag:'exclusivo-cba', tagTxt:'Exclusivo CBA' },
          ]
        },
        {
          titulo: 'Documentação Técnica',
          items: [
            { id:'caderno', nome:'Caderno Temático de Documentação Técnica — ABM 2023', detalhe:'Documentos técnicos, redação oficial e gestão documental', tag:'comum', tagTxt:'CTSP e CBA' },
            { id:'port021', nome:'Portaria nº 021/2020 — Glossário Operacional', detalhe:'Glossário de designações, terminologias e atos normativos do CBMRS', tag:'comum', tagTxt:'CTSP e CBA' },
          ]
        }
      ]
    }
  }
};

// AT3 CBA = mesmo conteúdo do CTSP
AREAS.at3.cba.grupos = AREAS.at3.ctsp.grupos;