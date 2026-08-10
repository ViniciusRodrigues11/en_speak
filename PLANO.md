# Plano do aplicativo de prática de conversação

## Visão do produto

Criar um aplicativo web para ensaiar conversas em inglês por meio de roteiros. O bot interpreta um personagem e fala uma frase; o usuário interpreta o outro personagem, grava sua resposta e recebe feedback com base na transcrição.

O público inicial será formado por brasileiros que já possuem algum conhecimento de inglês e querem praticar principalmente *speaking* e *listening*.

O primeiro objetivo é validar se a experiência é útil e agradável:

> O bot fala, o usuário responde, a voz é transformada em texto e o sistema apresenta um feedback compreensível antes de avançar no roteiro.

O MVP será baseado em roteiros controlados, com interpretação exata da fala esperada e variações previamente cadastradas. Ele não dependerá de IA generativa. Avaliação semântica, conversas adaptativas e outros recursos com custo de IA ficam para uma futura versão paga.

## Princípios

- Dar feedback que ajude o usuário a melhorar, em vez de mostrar apenas uma nota genérica.
- Aceitar as respostas e variações que estiverem explicitamente cadastradas no roteiro.
- Distinguir, quando possível, erro do usuário de erro de transcrição.
- Aumentar gradualmente a liberdade da conversa sem perder o objetivo pedagógico.
- Validar a experiência antes de investir nas partes mais caras e imprevisíveis.
- Manter a primeira versão utilizável sem custos de IA generativa por interação.
- Reservar funcionalidades dependentes de IA para uma futura modalidade paga.

## Decisões já tomadas

- A primeira versão utilizará interpretação exata das falas.
- Cada fala do bot terá uma tradução preparada previamente.
- Cada fala do usuário terá uma tradução e poderá ter uma resposta alternativa opcional.
- O usuário poderá alternar entre a resposta principal e a alternativa, quando ela existir.
- Antes de gravar, o usuário escolherá qual resposta deseja praticar. A tentativa será comparada somente com a opção selecionada.
- Cada tentativa deverá estar associada à fala do roteiro e à opção escolhida. No MVP, essa associação será feita no próprio frontend com a transcrição retornada pelo navegador.
- A frase escolhida pelo usuário ficará sempre visível.
- As traduções ficarão escondidas até que o usuário acione um botão.
- Nenhum conteúdo será traduzido automaticamente; textos, traduções e variações farão parte do roteiro pronto.
- Contrações serão aceitas no MVP somente quando estiverem cadastradas como resposta alternativa. Regras automáticas para contrações ficam como melhoria futura.
- Cada tentativa receberá uma pontuação conforme a proximidade da transcrição com a frase esperada. Uma frase muito diferente será considerada incorreta internamente, mas a interface comunicará isso por meio de uma pontuação menor e feedback encorajador.
- Para cada fala, será mantida somente a maior pontuação obtida entre todas as tentativas. Uma nova tentativa nunca reduzirá a pontuação já alcançada.
- O usuário terá tentativas ilimitadas em cada fala.
- Uma tentativa com zero ponto não permitirá avançar e abrirá uma nova tentativa.
- Qualquer pontuação a partir de 1 permitirá avançar para a próxima fala.
- Depois de concluir uma cena, o usuário poderá refazer o diálogo quantas vezes quiser para melhorar suas melhores pontuações.
- O MVP não terá login. Login social será considerado em uma etapa posterior.
- O MVP não terá backend; roteiros, avaliação e persistência funcionarão no frontend.
- O repositório será organizado desde o início em `front/` e `back/`. O diretório `back/` ficará reservado até a implementação dos recursos que exigirem servidor.
- O áudio não será enviado nem armazenado. Ele será utilizado apenas temporariamente durante a captura e o reconhecimento de voz.
- O progresso será persistido localmente no IndexedDB, incluindo diálogos concluídos e melhores pontuações.
- Quando o login social for implementado, os dados locais poderão ser associados e sincronizados com a conta. O IndexedDB poderá continuar sendo usado como cache local.
- A stack inicial será React, TypeScript, Vite, Tailwind CSS, TanStack Router e shadcn/ui.
- O shadcn/ui será usado como base funcional e acessível, com uma identidade visual própria e mais colorida.
- A personalização visual será centralizada nos tokens do tema, como cores, tipografia, raios, sombras e estados dos componentes.
- A direção visual será amigável, colorida e levemente gamificada, com uma interface simples inspirada na estética gráfica de histórias em quadrinhos (*comics*).
- A estética de comics será aplicada aos elementos da interface, como botões, ícones, contornos, cores e sombras.
- A estrutura da conversa continuará simples e não precisará utilizar balões de fala, páginas ou painéis de quadrinhos.
- O produto poderá se inspirar na leveza de aplicativos como o Duolingo, mas terá paleta, ilustrações, personagens e componentes visuais originais.
- O MVP não utilizará IA generativa para avaliar respostas.
- Avaliação semântica e conversa adaptativa serão consideradas para uma futura versão paga.
- Reconhecimento e síntese de voz deverão priorizar soluções gratuitas, locais ou oferecidas pelo navegador. Serviços pagos só serão adotados após análise de custo e qualidade.
- No MVP, a voz do bot utilizará a síntese neutra disponível no navegador. Controle real de emoções e áudios expressivos pré-gerados ficam como melhoria futura.

> **Observação de custo:** interpretação exata elimina a necessidade de um modelo de linguagem no MVP. Entretanto, transcrição de voz e síntese de voz também podem ter cobrança dependendo do fornecedor escolhido.

## Fase 0 — Definição do produto

Antes do desenvolvimento, definir:

- quantas tentativas são permitidas;
- o que acontece quando a resposta está incorreta;
- como os roteiros e suas variações serão criados e revisados manualmente.

**Resultado esperado:** descrição curta da experiência, do público e das regras do primeiro lançamento.

## Fase 1 — Modelo dos roteiros

Definir um formato reutilizável para cenas e diálogos.

Exemplo conceitual:

```text
Cena: Pedindo café
Personagem do bot: Atendente
Personagem do usuário: Cliente

Bot:
“Good morning. What would you like?”
Tradução:
“Bom dia. O que você gostaria?”

Resposta principal:
“I’d like a large coffee, please.”
Tradução:
“Eu gostaria de um café grande, por favor.”

Resposta alternativa opcional:
“Can I have a large coffee, please?”
Tradução:
“Posso pedir um café grande, por favor?”
```

Cada cena também poderá guardar:

- nível de dificuldade;
- tradução de cada fala do bot;
- tradução de cada resposta do usuário;
- vocabulário relevante;
- dicas;
- velocidade da voz;
- uma resposta alternativa opcional para cada fala do usuário;
- critérios de sucesso.

**Resultado esperado:** modelo de dados conceitual para representar cenas, falas e respostas aceitas.

## Fase 2 — Protótipo da experiência

Validar o fluxo antes de integrar toda a parte de voz e avaliação:

1. O usuário escolhe uma cena.
2. Escolhe ou recebe um personagem.
3. O bot mostra e fala sua frase.
4. O usuário vê sua resposta principal e pode trocar para a alternativa, quando disponível.
5. O usuário pode revelar a tradução das falas por meio de um botão.
6. O usuário escolhe a resposta que deseja praticar.
7. O usuário pressiona **Responder**.
8. O usuário grava sua fala.
9. A tentativa é associada à resposta selecionada.
10. O aplicativo mostra a transcrição.
11. O usuário recebe feedback.
12. O usuário repete ou avança.
13. Ao final, recebe um resumo da cena.

**Resultado esperado:** fluxo navegável que permita avaliar a experiência sem depender da solução completa de IA.

## Fase 3 — MVP funcional

### Funcionalidades

- catálogo pequeno de cenas;
- reprodução da voz do bot;
- gravação pelo navegador;
- transformação da voz em texto;
- comparação com uma resposta esperada;
- uma resposta alternativa opcional cadastrada manualmente;
- alternância entre a resposta principal e a alternativa;
- identificação da opção selecionada em cada tentativa;
- tradução manual de todas as falas, revelada sob demanda;
- normalização de diferenças previsíveis, como maiúsculas, pontuação e contrações conhecidas;
- destaque de palavras corretas, ausentes e adicionais;
- opção de ouvir novamente a fala do bot;
- opção de ouvir o bot pronunciar a resposta escolhida pelo usuário;
- opção de tentar novamente;
- acompanhamento do progresso dentro da cena;
- resumo final.
- persistência local do progresso no IndexedDB.
- funcionamento totalmente client-side, sem backend;

### Avaliação inicial

A avaliação inicial será transformada em uma pontuação de proximidade entre a transcrição e a frase esperada. Ela deverá considerar palavras corretas, ausentes, substituídas e adicionais.

Uma frase muito diferente receberá poucos ou nenhum ponto. A interface evitará mensagens severas como “você errou” e apresentará o resultado de maneira encorajadora, permitindo uma nova tentativa.

O resultado final da cena será calculado com a melhor pontuação obtida em cada fala, e não pela soma de todas as tentativas realizadas.

Uma pontuação igual a zero abrirá uma nova tentativa e bloqueará apenas o avanço daquela fala. A partir de 1 ponto, o usuário poderá avançar. As tentativas serão ilimitadas e a cena completa poderá ser refeita para melhorar o resultado.

No MVP, pronúncia não receberá uma nota própria. A transcrição permite avaliar o que o sistema conseguiu reconhecer, mas não oferece uma avaliação fonética confiável por si só.

**Resultado esperado:** produto utilizável de ponta a ponta.

## Fase 4 — Validação com usuários

Testar com um grupo pequeno para descobrir:

- se as pessoas entendem o que devem fazer;
- se ficam desconfortáveis ao gravar;
- se o tempo de espera é aceitável;
- se o feedback ajuda na tentativa seguinte;
- se erros de transcrição causam frustração;
- se preferem ler a fala ou improvisar;
- se repetem espontaneamente uma cena;
- qual deve ser a tolerância da avaliação.

### Métricas possíveis

- cenas iniciadas e concluídas;
- tentativas por fala;
- taxa de abandono;
- tempo para responder;
- uso das dicas;
- melhora entre tentativas;
- cenas repetidas.

**Resultado esperado:** evidências para decidir quais capacidades devem receber o próximo investimento.

## Fase 5 — Respostas semanticamente flexíveis (versão paga)

Esta fase introduzirá custo de IA por interação e será destinada a uma futura modalidade paga. Ela permitirá respostas que não tenham sido cadastradas previamente. O sistema passará a avaliar:

- intenção da resposta;
- informações essenciais;
- adequação ao contexto;
- clareza;
- erros que prejudicam o entendimento.

Exemplo de critério:

```text
Objetivo: pedir uma bebida
Obrigatório: indicar uma bebida
Opcional: tamanho, quantidade e cortesia
```

A avaliação deverá retornar dados estruturados, e não apenas uma nota:

```text
Intenção cumprida: sim
Informações encontradas: coffee, large
Problema principal: uso incorreto de “want”
Sugestão: “I’d like a large coffee.”
```

**Resultado esperado:** mais liberdade para o usuário sem transformar imediatamente o produto em uma conversa aberta.

## Fase 6 — Conversa adaptativa (versão paga)

Esta fase também dependerá de IA e fará parte da evolução paga do produto. Ela permitirá que a resposta do usuário modifique o caminho do roteiro:

```text
Usuário pede café → atendente pergunta o tamanho
Usuário pede água → atendente pergunta se deseja água com ou sem gás
Usuário recusa → atendente encerra o atendimento
```

As primeiras versões devem utilizar ramificações controladas. Uma conversa totalmente gerada por IA ficará para depois, pois será necessário garantir:

- nível adequado de inglês;
- coerência;
- segurança;
- objetivo pedagógico;
- duração apropriada da cena;
- feedback consistente.

**Resultado esperado:** cenas mais naturais que preservem o controle pedagógico.

## Fase 7 — Pronúncia e fluência

Quando o uso do produto justificar o investimento, adicionar:

- pontuação por palavra;
- identificação de fonemas problemáticos;
- avaliação de fluência e pausas;
- ritmo;
- entonação;
- reprodução comparativa;
- exercícios focados nos erros recorrentes.

A primeira implementação provavelmente deverá utilizar um serviço especializado. Criar um avaliador fonético próprio seria um projeto separado e de alta complexidade.

**Resultado esperado:** evolução do treino de diálogo para um treino detalhado de fala.

## Priorização

| Etapa | Valor | Complexidade |
|---|---:|---:|
| Definição e modelo dos roteiros | Alto | Baixa |
| Protótipo da experiência | Alto | Baixa |
| Roteiro exato com transcrição | Alto | Média |
| Variações cadastradas | Alto | Baixa–média |
| Avaliação semântica (paga) | Alto | Média–alta |
| Conversa adaptativa (paga) | Médio–alto | Alta |
| Pronúncia fonética | Alto | Alta |

## Recorte recomendado para o primeiro lançamento

### Dentro do MVP

- 3 a 5 cenas;
- 5 a 10 falas por cena;
- inglês como único idioma-alvo;
- respostas principais e uma alternativa opcional por fala;
- tradução manual para as falas do bot e do usuário;
- botão para revelar a tradução;
- resposta escolhida sempre visível;
- voz do bot;
- gravação e transcrição;
- comparação textual tolerante;
- funcionamento sem IA generativa;
- preferência por transcrição e síntese de voz sem custo por interação;
- feedback por palavras;
- nova tentativa;
- resumo da cena.

### Fora do MVP

- conversa completamente aberta;
- geração automática de roteiros;
- avaliação semântica por IA;
- conversa adaptativa por IA;
- nota fonética detalhada;
- ranking social;
- gamificação complexa;
- aplicativo móvel nativo;
- contas de usuário e login social;
- sincronização do progresso entre dispositivos;
- assinatura e pagamentos.
- armazenamento de áudio.

## Decisões pendentes

As próximas decisões de produto são:

1. Definir as regras básicas de normalização e tolerância da comparação.
2. Definir como o feedback será apresentado.
3. Escolher as primeiras situações representadas pelas cenas.
