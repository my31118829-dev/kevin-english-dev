import test from 'node:test'
import assert from 'node:assert/strict'
import {
  checkPhraseInput,
  stripJsonFences,
  parsePhraseAnalysis,
  normalizePhraseCards,
  capRecentCards,
  upsertPhraseCard,
  makePhraseCard,
  updatePhrase,
  deletePhrase,
  mergePhraseWithNext,
  splitPhrase,
  updateCardSentencePhrases,
  MAX_PHRASE_CARDS
} from './phraseDrill.js'

const SAMPLE = {
  sentences: [
    {
      en: 'I have quite a stressful job.',
      zh: '我的工作压力挺大的。',
      phrases: [
        { en: 'I have', zh: '我有' },
        { en: 'quite a stressful job', zh: '一份压力挺大的工作' }
      ]
    }
  ]
}

test('parsePhraseAnalysis parses clean JSON', () => {
  const result = parsePhraseAnalysis(JSON.stringify(SAMPLE))
  assert.equal(result.sentences.length, 1)
  assert.equal(result.sentences[0].phrases.length, 2)
  assert.ok(result.sentences[0].id)
  assert.ok(result.sentences[0].phrases[0].id)
})

test('parsePhraseAnalysis tolerates markdown fences and stray prose', () => {
  const fenced = 'Sure, here you go:\n```json\n' + JSON.stringify(SAMPLE) + '\n```\nHope it helps!'
  const result = parsePhraseAnalysis(fenced)
  assert.equal(result.sentences[0].en, 'I have quite a stressful job.')
})

test('stripJsonFences extracts the JSON object', () => {
  assert.equal(stripJsonFences('```json\n{"a":1}\n```'), '{"a":1}')
  assert.equal(stripJsonFences('noise {"a":1} tail'), '{"a":1}')
})

test('parsePhraseAnalysis throws on broken JSON (no card written)', () => {
  assert.throws(() => parsePhraseAnalysis('not json at all'))
  assert.throws(() => parsePhraseAnalysis('{"sentences": "oops"}'))
  assert.throws(() => parsePhraseAnalysis('{"sentences": []}'))
  assert.throws(() => parsePhraseAnalysis('{"sentences":[{"zh":"only chinese"}]}'))
})

test('checkPhraseInput flags empty and overly long input', () => {
  assert.equal(checkPhraseInput('').ok, false)
  assert.equal(checkPhraseInput('   ').reason, 'empty')
  const long = Array.from({ length: 400 }, () => 'word').join(' ')
  const res = checkPhraseInput(long)
  assert.equal(res.ok, false)
  assert.equal(res.reason, 'too-long')
  const many = Array.from({ length: 12 }, (_, i) => `Sentence ${i}.`).join(' ')
  assert.equal(checkPhraseInput(many).reason, 'too-long')
  assert.equal(checkPhraseInput('A short normal sentence here.').ok, true)
})

test('capRecentCards keeps newest 10 and drops the oldest', () => {
  const cards = Array.from({ length: 13 }, (_, i) => ({ id: `c${i}` }))
  const capped = capRecentCards(cards)
  assert.equal(capped.length, MAX_PHRASE_CARDS)
  assert.equal(capped[0].id, 'c0')
  assert.equal(capped[9].id, 'c9')
})

test('upsertPhraseCard pushes newest to front and rolls off oldest at 11', () => {
  let cards = []
  for (let i = 0; i < 11; i += 1) {
    cards = upsertPhraseCard(cards, { id: `card${i}`, sentences: [] })
  }
  assert.equal(cards.length, 10)
  assert.equal(cards[0].id, 'card10') // newest first
  assert.ok(!cards.some(card => card.id === 'card0')) // oldest dropped
})

test('upsertPhraseCard replaces an existing card by id (rename/edit)', () => {
  let cards = upsertPhraseCard([], { id: 'x', title: 'old', sentences: [] })
  cards = upsertPhraseCard(cards, { id: 'x', title: 'new', sentences: [] })
  assert.equal(cards.length, 1)
  assert.equal(cards[0].title, 'new')
})

test('makePhraseCard derives a title and stores the raw text', () => {
  const card = makePhraseCard(parsePhraseAnalysis(JSON.stringify(SAMPLE)), 'raw text')
  assert.ok(card.title.length)
  assert.equal(card.raw, 'raw text')
  assert.equal(card.sentences.length, 1)
})

test('normalizePhraseCards drops malformed cards', () => {
  const list = normalizePhraseCards([
    { sentences: [{ en: 'Hi.', phrases: [{ en: 'Hi' }] }] },
    { sentences: [] },
    null,
    { nope: true }
  ])
  assert.equal(list.length, 1)
})

test('updatePhrase edits English and Chinese', () => {
  const phrases = SAMPLE.sentences[0].phrases.map((p, i) => ({ ...p, id: `p${i}` }))
  const next = updatePhrase(phrases, 'p0', { en: 'I really have', zh: '我确实有' })
  assert.equal(next[0].en, 'I really have')
  assert.equal(next[0].zh, '我确实有')
  assert.equal(next[1].en, phrases[1].en)
})

test('deletePhrase removes the target', () => {
  const phrases = [{ id: 'a', en: 'a' }, { id: 'b', en: 'b' }]
  assert.deepEqual(deletePhrase(phrases, 'a').map(p => p.id), ['b'])
})

test('mergePhraseWithNext joins two phrases', () => {
  const phrases = [
    { id: 'a', en: 'quite a', zh: '相当' },
    { id: 'b', en: 'stressful job', zh: '有压力的工作' }
  ]
  const merged = mergePhraseWithNext(phrases, 'a')
  assert.equal(merged.length, 1)
  assert.equal(merged[0].en, 'quite a stressful job')
  assert.equal(merged[0].zh, '相当有压力的工作')
})

test('mergePhraseWithNext is a no-op on the last phrase', () => {
  const phrases = [{ id: 'a', en: 'a' }, { id: 'b', en: 'b' }]
  assert.equal(mergePhraseWithNext(phrases, 'b').length, 2)
})

test('splitPhrase splits one phrase into two', () => {
  const phrases = [{ id: 'a', en: 'quite a stressful job', zh: '压力大的工作' }]
  const split = splitPhrase(phrases, 'a', 'quite a', 'stressful job')
  assert.equal(split.length, 2)
  assert.equal(split[0].en, 'quite a')
  assert.equal(split[0].zh, '压力大的工作')
  assert.equal(split[1].en, 'stressful job')
  assert.equal(split[1].zh, '')
})

test('splitPhrase is a no-op when a half is empty', () => {
  const phrases = [{ id: 'a', en: 'whole', zh: '' }]
  assert.equal(splitPhrase(phrases, 'a', 'whole', '').length, 1)
})

test('updateCardSentencePhrases applies transform and bumps updatedAt', () => {
  const card = makePhraseCard(parsePhraseAnalysis(JSON.stringify(SAMPLE)), 'raw')
  const sentenceId = card.sentences[0].id
  const firstPhraseId = card.sentences[0].phrases[0].id
  const next = updateCardSentencePhrases(card, sentenceId, phrases => deletePhrase(phrases, firstPhraseId))
  assert.equal(next.sentences[0].phrases.length, 1)
  assert.ok(next.updatedAt >= card.updatedAt)
})
