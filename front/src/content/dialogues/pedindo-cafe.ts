import type { Dialogue } from "@/features/dialogues/types"

const dialogue = {
  id: "pedindo-cafe",
  title: "Pedindo um café",
  description: "Faça um pedido, escolha os detalhes e finalize a compra.",
  level: "Básico",
  estimatedMinutes: 4,
  botCharacter: "Atendente",
  userCharacter: "Cliente",
  turns: [
    {
      id: "greeting-and-order",
      bot: {
        text: "Good morning! What can I get for you?",
        translation: "Bom dia! O que você gostaria de pedir?",
      },
      responses: [
        {
          id: "direct-order",
          label: "Resposta principal",
          text: "I'd like a coffee, please.",
          translation: "Eu gostaria de um café, por favor.",
        },
        {
          id: "polite-question",
          label: "Outra forma",
          text: "Can I have a coffee, please?",
          translation: "Posso pedir um café, por favor?",
        },
      ],
    },
    {
      id: "choose-size",
      bot: {
        text: "Sure. What size would you like?",
        translation: "Claro. Qual tamanho você gostaria?",
      },
      responses: [
        {
          id: "medium-short",
          label: "Resposta principal",
          text: "A medium, please.",
          translation: "Um médio, por favor.",
        },
        {
          id: "medium-complete",
          label: "Outra forma",
          text: "I'd like a medium one.",
          translation: "Eu gostaria de um médio.",
        },
      ],
    },
    {
      id: "milk-or-sugar",
      bot: {
        text: "Would you like milk or sugar?",
        translation: "Você gostaria de leite ou açúcar?",
      },
      responses: [
        {
          id: "little-milk",
          label: "Resposta principal",
          text: "Just a little milk, please.",
          translation: "Só um pouco de leite, por favor.",
        },
        {
          id: "milk-no-sugar",
          label: "Outra forma",
          text: "Milk, but no sugar, please.",
          translation: "Leite, mas sem açúcar, por favor.",
        },
      ],
    },
    {
      id: "anything-else",
      bot: {
        text: "Anything else?",
        translation: "Mais alguma coisa?",
      },
      responses: [
        {
          id: "nothing-else",
          label: "Resposta principal",
          text: "No, that's all.",
          translation: "Não, é só isso.",
        },
        {
          id: "everything-thanks",
          label: "Outra forma",
          text: "That's everything, thank you.",
          translation: "É só isso, obrigado.",
        },
      ],
    },
    {
      id: "for-here-or-to-go",
      bot: {
        text: "Is that for here or to go?",
        translation: "É para consumir aqui ou para viagem?",
      },
      responses: [
        {
          id: "to-go-short",
          label: "Resposta principal",
          text: "To go, please.",
          translation: "Para viagem, por favor.",
        },
        {
          id: "to-go-complete",
          label: "Outra forma",
          text: "I'll have it to go.",
          translation: "Vou querer para viagem.",
        },
      ],
    },
    {
      id: "payment",
      bot: {
        text: "That'll be four dollars, please.",
        translation: "Serão quatro dólares, por favor.",
      },
      responses: [
        {
          id: "payment-here",
          label: "Resposta principal",
          text: "Here you go.",
          translation: "Aqui está.",
        },
      ],
    },
  ],
} satisfies Dialogue

export default dialogue
