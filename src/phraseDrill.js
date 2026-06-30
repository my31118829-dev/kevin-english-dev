// Phrase Drill (短语速练) — pure, testable helpers.
// Independent tool: paste text -> AI splits into sentences + sense-group phrases.
// No external audio, no timeline alignment. TTS is regenerable from text.

export const MAX_PHRASE_CARDS = 10
// Rough upper bound for one analysis: keep token use low and avoid chopping a wall of text.
export const MAX_PHRASE_INPUT_WORDS = 300
export const MAX_PHRASE_INPUT_SENTENCES = 8

let idSeq = 0
function localUid(prefix = 'pd') {
  idSeq += 1
  return `${prefix}_${Date.now().toString(36)}_${idSeq.toString(36)}`
}

export function countWords(text) {
  const clean = String(text || '').trim()
  if (!clean) return 0
  return clean.split(/\s+/).filter(Boolean).length
}

export function countSentences(text) {
  const clean = String(text || '').trim()
  if (!clean) return 0
  const parts = clean.split(/[.!?。！？]+/).map(part => part.trim()).filter(Boolean)
  return parts.length || 1
}

// Decide whether pasted input is small enough to analyse in one go.
export function checkPhraseInput(text) {
  const clean = String(text || '').trim()
  if (!clean) return { ok: false, reason: 'empty' }
  const words = countWords(clean)
  const sentences = countSentences(clean)
  if (words > MAX_PHRASE_INPUT_WORDS || sentences > MAX_PHRASE_INPUT_SENTENCES) {
    return { ok: false, reason: 'too-long', words, sentences }
  }
  return { ok: true, words, sentences }
}

// Strip markdown code fences / stray prose so JSON.parse has a clean shot.
export function stripJsonFences(raw) {
  let text = String(raw || '').trim()
  // Remove ```json ... ``` or ``` ... ``` wrappers.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) text = fenced[1].trim()
  // If there is leading/trailing prose, keep only the outermost JSON object.
  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    text = text.slice(first, last + 1)
  }
  return text.trim()
}

function normalizePhrase(raw) {
  if (!raw || typeof raw !== 'object') return null
  const en = String(raw.en ?? '').trim()
  if (!en) return null
  return { id: raw.id || localUid('ph'), en, zh: String(raw.zh ?? '').trim() }
}

function normalizeSentence(raw) {
  if (!raw || typeof raw !== 'object') return null
  const en = String(raw.en ?? '').trim()
  if (!en) return null
  const phrases = Array.isArray(raw.phrases)
    ? raw.phrases.map(normalizePhrase).filter(Boolean)
    : []
  return { id: raw.id || localUid('st'), en, zh: String(raw.zh ?? '').trim(), phrases }
}

// Parse the AI response into a validated { sentences } structure.
// Throws on anything that is not usable so the caller can refuse to save a card.
export function parsePhraseAnalysis(raw) {
  const text = stripJsonFences(raw)
  if (!text) throw new Error('Empty analysis result.')
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Could not parse analysis JSON.')
  }
  const list = Array.isArray(data?.sentences) ? data.sentences : null
  if (!list) throw new Error('Analysis JSON has no sentences array.')
  const sentences = list.map(normalizeSentence).filter(Boolean)
  if (!sentences.length) throw new Error('Analysis produced no usable sentences.')
  return { sentences }
}

export function normalizePhraseCard(raw) {
  if (!raw || typeof raw !== 'object') return null
  const sentences = Array.isArray(raw.sentences)
    ? raw.sentences.map(normalizeSentence).filter(Boolean)
    : []
  if (!sentences.length) return null
  const createdAt = raw.createdAt || new Date().toISOString()
  return {
    id: raw.id || localUid('card'),
    title: String(raw.title || '').trim() || deriveCardTitle(sentences),
    raw: String(raw.raw || ''),
    createdAt,
    updatedAt: raw.updatedAt || createdAt,
    sentences
  }
}

export function normalizePhraseCards(rawList) {
  if (!Array.isArray(rawList)) return []
  return rawList.map(normalizePhraseCard).filter(Boolean)
}

export function deriveCardTitle(sentences) {
  const first = sentences?.[0]?.en || ''
  const words = first.split(/\s+/).filter(Boolean).slice(0, 6).join(' ')
  return words ? (words + (first.split(/\s+/).filter(Boolean).length > 6 ? '…' : '')) : 'Phrase card'
}

export function makePhraseCard(analysis, raw) {
  const createdAt = new Date().toISOString()
  return normalizePhraseCard({
    id: localUid('card'),
    title: deriveCardTitle(analysis.sentences),
    raw: String(raw || ''),
    createdAt,
    updatedAt: createdAt,
    sentences: analysis.sentences
  })
}

// Keep only the most recent N cards (newest first); drop the oldest.
export function capRecentCards(cards, max = MAX_PHRASE_CARDS) {
  const list = Array.isArray(cards) ? cards : []
  return list.slice(0, Math.max(0, max))
}

// Insert/replace a card at the front and cap to the rolling window.
export function upsertPhraseCard(cards, card, max = MAX_PHRASE_CARDS) {
  const list = Array.isArray(cards) ? cards.filter(item => item && item.id !== card.id) : []
  return capRecentCards([card, ...list], max)
}

// --- Phrase editing (pure transforms over a sentence's phrases array) ---

export function updatePhrase(phrases, phraseId, patch) {
  return (phrases || []).map(phrase => phrase.id === phraseId
    ? {
        ...phrase,
        ...('en' in patch ? { en: String(patch.en ?? '').trim() } : {}),
        ...('zh' in patch ? { zh: String(patch.zh ?? '').trim() } : {})
      }
    : phrase)
}

export function deletePhrase(phrases, phraseId) {
  return (phrases || []).filter(phrase => phrase.id !== phraseId)
}

// Merge a phrase with the one after it (en joined by a space, zh joined too).
export function mergePhraseWithNext(phrases, phraseId) {
  const list = phrases || []
  const index = list.findIndex(phrase => phrase.id === phraseId)
  if (index < 0 || index >= list.length - 1) return list
  const a = list[index]
  const b = list[index + 1]
  const merged = {
    id: a.id,
    en: [a.en, b.en].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(),
    zh: [a.zh, b.zh].filter(Boolean).join('').trim()
  }
  return [...list.slice(0, index), merged, ...list.slice(index + 2)]
}

// Split one phrase into two. leftEn/rightEn are the new English halves;
// the original Chinese stays on the left half, the right half starts empty.
export function splitPhrase(phrases, phraseId, leftEn, rightEn) {
  const list = phrases || []
  const index = list.findIndex(phrase => phrase.id === phraseId)
  if (index < 0) return list
  const left = String(leftEn ?? '').trim()
  const right = String(rightEn ?? '').trim()
  if (!left || !right) return list
  const original = list[index]
  const first = { id: original.id, en: left, zh: original.zh }
  const second = { id: localUid('ph'), en: right, zh: '' }
  return [...list.slice(0, index), first, second, ...list.slice(index + 1)]
}

// Apply a phrases transform to one sentence inside a card, bumping updatedAt.
export function updateCardSentencePhrases(card, sentenceId, transform) {
  if (!card) return card
  return {
    ...card,
    updatedAt: new Date().toISOString(),
    sentences: (card.sentences || []).map(sentence => sentence.id === sentenceId
      ? { ...sentence, phrases: transform(sentence.phrases || []) }
      : sentence)
  }
}
