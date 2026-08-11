import type { Dialogue, DialogueCatalogItem } from "@/features/dialogues/types"

export const dialogueCatalog = [
  {
    id: "pedindo-cafe",
    title: "Pedindo um café",
    description: "Faça um pedido, escolha os detalhes e finalize a compra.",
    category: "Alimentação",
    level: "Básico",
    estimatedMinutes: 4,
    turnCount: 6,
    load: () => import("./pedindo-cafe").then((module) => module.default),
  },
] satisfies DialogueCatalogItem[]

export function getDialogueSummary(dialogueId: string) {
  return dialogueCatalog.find((dialogue) => dialogue.id === dialogueId)
}

export async function loadDialogue(dialogueId: string): Promise<Dialogue | undefined> {
  const summary = getDialogueSummary(dialogueId)

  if (!summary) {
    return undefined
  }

  const dialogue = await summary.load()

  if (dialogue.id !== summary.id || dialogue.turns.length !== summary.turnCount) {
    throw new Error(`O roteiro "${summary.id}" não corresponde aos dados do catálogo.`)
  }

  return dialogue
}
