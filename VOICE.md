# Voice — Protocolo Bravo Mike

> A **voz** é *como* o produto fala — o complemento editorial da personalidade de marca
> definida em [PRODUCT.md](PRODUCT.md). Tudo que o aluno **lê** obedece a este documento:
> UI do site (`graduabm-frontend`), e-mails (`graduabm-backend/src/helpers/emailTemplates.js`),
> push (`graduabm-backend/src/helpers/pushNudges.js`) e toasts/erros (`js/api.js`, painéis admin).
> Idioma: **pt-BR**. Os termos de domínio (Ofensiva, Bloco, Ciclo…) saem do
> `graduabm-backend/docs/CONTEXT.md` — este guia diz *como falar deles*, não os redefine.

## Em uma frase

> **Técnico e motivacional: a precisão operacional de um instrutor + a direção de quem mantém a
> missão — a aprovação — sempre à vista. Direto e exigente, sem afago vazio.**

São **dois pilares de peso igual**, não um com ressalva:

- **Técnico** = a *forma*. Preciso, factual, operacional, termo de domínio correto, frase curta.
- **Motivacional** = a *intenção*. Toda mensagem aponta para frente — missão, progresso, irmandade.
  Mesmo um erro ou uma cobrança empurra o aluno ao próximo passo; nunca só pune nem só informa.

## A síntese (a contradição resolvida)

`PRODUCT.md` dizia **"no coddling"** (sem afago) e o `carousel-brand.json` dizia **"motivacional"** —
pareciam brigar. Não brigam quando se separa *motivação* de *afago*:

- **Motivar** = apontar a missão, reconhecer o esforço, mostrar o progresso, chamar para o próximo
  treino. ✅ É a nossa — em **toda** superfície, inclusive erro e cobrança.
- **Afagar** = torcida vazia, emoji, "você consegue!", venda animada, "!!!". ❌ Nunca.

> **Regra de ouro:** o calor vem da **disciplina, da irmandade e da missão** — não do consolo.
> *"Mantenha a disciplina. Nos vemos do lado de dentro."* é motivação técnica. *"Continue indicando —
> cada colega rende mais 30 dias!"* é venda. A diferença é a régua, não a empolgação.

## Quem fala, com quem fala

- **Quem fala:** o **Protocolo** — instituição/instrutor, não uma pessoa fofa nem um robô corporativo.
  Voz na 1ª pessoa do plural só quando institucional ("Confirmamos sua solicitação"); o resto é
  imperativo direto ao aluno.
- **Com quem fala:** um **militar sob pressão** (soldado, cadete CTSP, futuro oficial CBA),
  com tempo curto e disciplina de serviço. Trate-o como **profissional**, nunca como cliente a
  agradar nem aluno a paparicar.
- **Vocativo:** "Combatente" / "Cadete" — com parcimônia, em momentos de marca (boas-vindas, cobrança
  de retorno). **Nunca** "usuário", "cliente", "pessoal", "galera".
- **Registro por curso:** CTSP (praça) e CBA (Tenente/oficial) compartilham a voz; com o público CBA,
  prefira o registro um grau mais formal — comando, não camaradagem.

## Os 5 princípios

**1. Direto ao ponto — frase curta, voz ativa, imperativo.**
O aluno tem 20 minutos entre um plantão e outro. Corte rodeio.
- ✅ "Renove antes de {DATA}."  ❌ "Gostaríamos de lembrá-lo de que talvez seja interessante renovar."

**2. Exigência, não cobrança ríspida.**
Puxa o padrão sem humilhar. A linha entre "instrutor" e "babaca" é o **respeito**.
- ✅ "Três dias sem treino. Retome o ritmo."  ❌ "Você não estuda há 3 dias. O concurso não espera!"
  (o fato pune sozinho; o ponto de exclamação soa desespero, não comando.)

**3. Operacional — fale de missão, não de funcionalidade.**
Cada tela serve ao estudo. A copy nomeia o **objetivo**, não o widget.
- ✅ "Próximo bloco do ciclo"  ❌ "Card de visualização do seu progresso atual"

**4. Motivação pela irmandade e pela missão — nunca pelo afago.**
Reconheça o esforço; aponte a aprovação como destino comum. Sem torcida, sem emoji.
- ✅ "Mantenha a disciplina. Nos vemos do lado de dentro."
- ❌ "Parabéns, você é demais! 🎉 Continue assim!!!"

**5. Honesto sob fricção — erro e cobrança também motivam.**
Erro não é hora de virar genérico nem de só punir. Diga o que houve, o próximo passo e mantenha a
direção. O fato basta como peso; a motivação aponta a saída.
- ✅ "Sem conexão com o servidor. Verifique sua internet." (já é bom — mantém)
- ✅ "3 dias sem treino. Retome o ritmo rumo à aprovação." (técnico + motivacional)
- ❌ "Erro ao carregar dados." (vira balcão de banco; ver reescritas abaixo)

## Régua de calibração por superfície

A voz é **uma só**, mas a temperatura muda conforme o momento. O erro de hoje é a temperatura
saltar entre telas. Use esta régua:

| Superfície | Temperatura | Como soa | Âncora real |
|---|---|---|---|
| **Boas-vindas / onboarding** | quente-operacional | irmandade + missão | "Mantenha a disciplina. Nos vemos do lado de dentro." |
| **Ciclo / estudo / execução** | neutra-tática | comando seco, sem adjetivo | "Próximo bloco" · "Bloco pendente: {AREA} · {LEGISLACAO}" |
| **Conclusão / Ganho / Patente** | quente-contida | reconhece o esforço, sem festa | "Rodada concluída. Licença de Plantão creditada." |
| **Push / cobrança de retorno** | firme-motivacional | fato + comando + direção à missão, 1 frase | "Sua Ofensiva cai à meia-noite. Garanta o treino de hoje." |
| **Erro / validação** | útil-direta | o que houve + próximo passo | "Sem conexão com o servidor. Verifique sua internet." |
| **Cobrança / pagamento** | institucional-firme | factual + saída, sem ameaça nem desculpa | "Seu acesso vence em {DATA}. Renove para não perder o ritmo." |

> **Teste do salto:** leia, em sequência, o que um aluno recebe em 7 dias (boas-vindas → push dia 3 →
> e-mail de vencimento → recompensa). Se algum trecho parecer escrito por *outra* marca, a temperatura
> saltou — recalibre pela régua, não pela emoção do momento.

## Léxico — as palavras da casa

**Use (vocabulário de domínio — `CONTEXT.md` é a fonte):**
Ofensiva (nunca "streak" solto) · Bloco do Ciclo / Bloco de Autoria QAP (sempre qualifique "bloco") ·
Rodada · Ciclo · Meta de Tempo · Patente · Licença de Plantão · Prontidão · Cadete / Combatente ·
treino, missão, ritmo, padrão, disciplina, retomar, encerrar.

**Evite (anti-voz):**
- **Corporate filler:** "solução", "experiência", "jornada", "engajamento", "otimize sua produtividade".
- **Afago/venda:** "incrível", "demais", "você consegue!", "aproveite!", "não perca!", "rende mais X".
- **Emoji** em UI, e-mail e push. (Carrossel de Instagram tem regras próprias — `carousel-brand.json`.)
- **Reticências decorativas** e exclamação em série ("!!!"). Um `!` por mensagem, no máximo, e só quando
  for comando — nunca empolgação.
- **Diminutivos** ("rapidinho", "questãozinha") e gíria casual ("bora", "galera").
- "**Usuário**"/"**cliente**" para se dirigir ao aluno.

## Mecânica de escrita

- **Número antes de adjetivo:** "12 questões pendentes", não "várias questões".
- **Imperativo no CTA**, verbo na frente: "Iniciar simulado", "Retomar estudos", "Renovar acesso".
- **Sem ponto final em rótulo de botão**; com ponto em frase de corpo.
- **Maiúsculas** (BEBAS/badges) são da camada visual (ver `css/pbm-tokens.css`), não da copy — não
  GRITE no texto corrido.
- **Datas e prazos sempre explícitos:** "vence em 14/06", não "vence em breve".
- **Uma ideia por frase.** Se precisa de vírgula + "e", provavelmente são duas frases.

## Antes / Depois (deslizes reais do produto)

> Reescritas dos pontos que a auditoria de copy marcou como fora de voz.

| Onde | Antes (atual) | Depois (na voz) |
|---|---|---|
| `pushNudges.js` — inatividade | "Você não estuda há 3 dias. O concurso não espera!" | "3 dias sem treino. Retome o ritmo rumo à aprovação." |
| `pushNudges.js` — streak_risco | "Sua sequência de estudos está em risco. Últimos minutos do dia!" | "Sua Ofensiva cai à meia-noite. Garanta o treino de hoje." |
| `pushNudges.js` — lembrete_generico | "Você ainda não estudou hoje. Mantenha o ritmo!" | "Você ainda não treinou hoje. Mantenha o ritmo." |
| `emailTemplates.js` — recompensa indicação | "Continue indicando — cada colega que assinar rende mais 30 dias!" | "Cada combatente que você trouxer estende seu acesso em 30 dias. Chame o próximo." |
| `pbm-patentes.html` — carregar | "Erro ao carregar o dossiê de progresso." | "Não foi possível carregar o dossiê de progresso. Recarregue a página." |
| `admin-simulados-mensais.html` — ação | "Erro ao aprovar." | "Falha ao aprovar. Tente novamente." |

> Note que **manter** também é decisão: "Sem conexão com o servidor. Verifique sua internet." e
> "Mantenha a disciplina. Nos vemos do lado de dentro." já estão na voz — não mexa.

## Checklist — toda copy nova passa por aqui

1. **Cabe em uma respiração?** Se o aluno entre dois plantões não lê de primeira, está longo.
2. **Tem verbo de comando?** CTA e instrução começam no imperativo.
3. **A temperatura bate com a superfície?** (consulte a régua acima.)
4. **Algum afago, emoji, "!!!" ou palavra corporativa?** Corte.
5. **Usei o termo de domínio certo?** (Ofensiva, não streak; qualifiquei "bloco".)
6. **Prazo/número está explícito?** Nada de "em breve", "vários".

---

_Fonte de verdade da **voz**. A **personalidade** mora em [PRODUCT.md](PRODUCT.md); os **termos** em
`graduabm-backend/docs/CONTEXT.md`; o **visual** em `css/pbm-tokens.css` e `.claude/carousel-brand.json`._
