function getApiKey(body = {}) {
  return String(body.apiKey || process.env.OPENAI_API_KEY || '').trim()
}

function decodeDataUrl(dataUrl = '') {
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64')
  }
}

function tokenize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function formatEnglishSentence(line = '') {
  const raw = String(line || '').trim()
  if (!raw) return ''
  const withSpace = raw.replace(/\s+/g, ' ')
  const needsDot = !/[.!?]$/.test(withSpace)
  const normalized = withSpace.charAt(0).toUpperCase() + withSpace.slice(1)
  return needsDot ? `${normalized}.` : normalized
}

function alignSentencesWithWords(sentences = [], words = [], paddingStartMs = 120, paddingEndMs = 180) {
  const normalizedWords = words.map((item, index) => ({
    index,
    token: tokenize(item.word || '')[0] || '',
    raw: item.word || '',
    start: Number(item.start || 0),
    end: Number(item.end || 0)
  }))
  const lines = []
  let cursor = 0

  for (const originalSentence of sentences) {
    const sentence = formatEnglishSentence(originalSentence)
    const sentenceTokens = tokenize(sentence)
    if (!sentenceTokens.length) continue

    let best = null
    const maxStart = Math.max(0, normalizedWords.length - 1)
    const searchStart = Math.min(cursor, maxStart)
    const searchEnd = Math.min(maxStart, searchStart + 420)

    for (let i = searchStart; i <= searchEnd; i++) {
      let wordIndex = i
      let firstMatch = -1
      let lastMatch = -1
      let matched = 0

      for (let tokenIndex = 0; tokenIndex < sentenceTokens.length; tokenIndex++) {
        const token = sentenceTokens[tokenIndex]
        let found = -1
        const localEnd = Math.min(normalizedWords.length - 1, wordIndex + 18)
        for (let j = wordIndex; j <= localEnd; j++) {
          if (normalizedWords[j].token === token) {
            found = j
            break
          }
        }
        if (found >= 0) {
          if (firstMatch < 0) firstMatch = found
          lastMatch = found
          matched += 1
          wordIndex = found + 1
        } else {
          wordIndex += 1
        }
      }

      const ratio = matched / sentenceTokens.length
      if (!best || ratio > best.ratio || (ratio === best.ratio && firstMatch >= 0 && firstMatch < best.firstMatch)) {
        best = { ratio, firstMatch, lastMatch }
      }
      if (best && best.ratio >= 0.95) break
    }

    if (best && best.firstMatch >= 0 && best.lastMatch >= best.firstMatch && best.ratio >= 0.8) {
      const first = normalizedWords[best.firstMatch]
      const last = normalizedWords[best.lastMatch]
      const startMs = Math.max(0, Math.round(first.start * 1000 - paddingStartMs))
      const endMs = Math.max(startMs + 120, Math.round(last.end * 1000 + paddingEndMs))
      lines.push({
        text: sentence,
        originalStartMs: Math.round(first.start * 1000),
        originalEndMs: Math.round(last.end * 1000),
        startMs,
        endMs,
        unaligned: false,
        matchRatio: Number(best.ratio.toFixed(3))
      })
      cursor = best.lastMatch + 1
    } else {
      lines.push({
        text: sentence,
        originalStartMs: null,
        originalEndMs: null,
        startMs: null,
        endMs: null,
        unaligned: true,
        matchRatio: best ? Number(best.ratio.toFixed(3)) : 0
      })
    }
  }
  return lines
}

async function callWhisperWords(apiKey, fileBlob, fileName = 'audio.m4a') {
  const form = new FormData()
  form.append('file', fileBlob, fileName)
  form.append('model', 'whisper-1')
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'word')

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Whisper transcription failed.')
  }
  return await response.json()
}

async function cleanSentences(apiKey, rawText) {
  const prompt = `你是英语字幕整理助手。
下面是一段英语口语的 Whisper 自动转录结果（无标点，可能有分割错误）：

${rawText}

请把它整理成干净的英语句子列表，要求：
1. 加上正确的标点符号
2. 每个自然句子独占一行
3. 不要合并多个独立句子
4. 不要拆分本来是一句话的内容
5. 修正明显的转录错误
6. 不要改变原来说的内容，只整理格式
7. 直接输出句子列表，每行一句，不要序号，不要解释`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Sentence cleanup failed.')
  }

  const json = await response.json()
  const text = String(json?.choices?.[0]?.message?.content || '')
  return text
    .split('\n')
    .map(item => item.replace(/^\s*[-*0-9.)]+\s*/, '').trim())
    .filter(Boolean)
    .map(formatEnglishSentence)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const apiKey = getApiKey(body)
    const fileName = String(body.fileName || 'audio.m4a')
    const paddingStartMs = Number.isFinite(Number(body.paddingStartMs)) ? Number(body.paddingStartMs) : 120
    const paddingEndMs = Number.isFinite(Number(body.paddingEndMs)) ? Number(body.paddingEndMs) : 180
    const decoded = decodeDataUrl(body.audioDataUrl || '')

    if (!apiKey || !apiKey.startsWith('sk-')) {
      res.status(400).json({ error: 'OpenAI API Key is missing.' })
      return
    }
    if (!decoded?.buffer?.length) {
      res.status(400).json({ error: 'Audio data is missing.' })
      return
    }

    const blob = new Blob([decoded.buffer], { type: decoded.mimeType || 'audio/m4a' })
    const whisper = await callWhisperWords(apiKey, blob, fileName)
    const words = Array.isArray(whisper.words) ? whisper.words : []
    const rawText = String(whisper.text || words.map(item => item.word || '').join(' ')).trim()
    const cleanedSentences = await cleanSentences(apiKey, rawText)
    const lines = alignSentencesWithWords(cleanedSentences, words, paddingStartMs, paddingEndMs)

    res.status(200).json({
      ok: true,
      language: whisper.language || 'english',
      durationSec: Number(whisper.duration || 0),
      rawText,
      sentences: cleanedSentences,
      words: words.map(word => ({ word: word.word, start: word.start, end: word.end })),
      lines,
      stats: {
        sentenceCount: lines.length,
        alignedCount: lines.filter(item => !item.unaligned).length,
        unalignedCount: lines.filter(item => item.unaligned).length
      }
    })
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Audio smart process failed.' })
  }
}
