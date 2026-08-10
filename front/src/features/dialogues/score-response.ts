function normalize(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function wordEditDistance(expected: string[], actual: string[]) {
  const previous = Array.from({ length: actual.length + 1 }, (_, index) => index)

  for (let expectedIndex = 1; expectedIndex <= expected.length; expectedIndex += 1) {
    const current = [expectedIndex]

    for (let actualIndex = 1; actualIndex <= actual.length; actualIndex += 1) {
      const substitutionCost =
        expected[expectedIndex - 1] === actual[actualIndex - 1] ? 0 : 1

      current[actualIndex] = Math.min(
        current[actualIndex - 1] + 1,
        previous[actualIndex] + 1,
        previous[actualIndex - 1] + substitutionCost,
      )
    }

    previous.splice(0, previous.length, ...current)
  }

  return previous[actual.length]
}

export function scoreResponse(expectedText: string, actualText: string) {
  const expectedWords = normalize(expectedText)
  const actualWords = normalize(actualText)

  if (expectedWords.length === 0 || actualWords.length === 0) return 0

  const distance = wordEditDistance(expectedWords, actualWords)
  const longestLength = Math.max(expectedWords.length, actualWords.length)

  return Math.max(0, Math.round((1 - distance / longestLength) * 100))
}
