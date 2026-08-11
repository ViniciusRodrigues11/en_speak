export type DialogueLine = {
  text: string
  translation: string
}

export type ResponseOption = DialogueLine & {
  id: string
  label: string
}

export type DialogueTurn = {
  id: string
  bot: DialogueLine
  responses: [ResponseOption, ResponseOption?]
}

export type Dialogue = {
  id: string
  title: string
  description: string
  level: "Básico" | "Intermediário"
  estimatedMinutes: number
  botCharacter: string
  userCharacter: string
  turns: DialogueTurn[]
}

export type DialogueCategory = "Alimentação" | "Cotidiano" | "Trabalho" | "Viagem"

export type DialogueCatalogItem = Pick<
  Dialogue,
  "id" | "title" | "description" | "level" | "estimatedMinutes"
> & {
  category: DialogueCategory
  turnCount: number
  load: () => Promise<Dialogue>
}
