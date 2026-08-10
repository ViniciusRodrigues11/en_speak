import { createFileRoute, notFound } from "@tanstack/react-router"

import { loadDialogue } from "@/content/dialogues/catalog"
import { PracticeConversation } from "@/features/dialogues/components/practice-conversation"

export const Route = createFileRoute("/pratica/$dialogueId")({
  loader: async ({ params }) => {
    const dialogue = await loadDialogue(params.dialogueId)

    if (!dialogue) {
      throw notFound()
    }

    return dialogue
  },
  component: PracticePage,
})

function PracticePage() {
  const dialogue = Route.useLoaderData()

  return <PracticeConversation dialogue={dialogue} />
}
