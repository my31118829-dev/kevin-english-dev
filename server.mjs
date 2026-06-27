import express from 'express'
import { createServer as createViteServer } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import os from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isProd = process.argv.includes('--prod')
const app = express()

function localNetworkUrl(port) {
  const interfaces = os.networkInterfaces()
  for (const addresses of Object.values(interfaces)) {
    const match = addresses?.find(address => address.family === 'IPv4' && !address.internal)
    if (match?.address) return `http://${match.address}:${port}/`
  }
  return ''
}

app.use(express.json({ limit: '50mb' }))

app.post('/api/openai-voice', async (req, res) => {
  try {
    const { apiKey, text, voice = 'alloy' } = req.body || {}
    const finalKey = (apiKey || process.env.OPENAI_API_KEY || '').trim()
    if (!finalKey || !finalKey.startsWith('sk-')) return res.status(400).json({ error: 'OpenAI API Key is missing. Set key in Settings or server env OPENAI_API_KEY.' })
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Text is missing.' })

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${finalKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice, input: text, format: 'mp3' })
    })

    if (!response.ok) return res.status(response.status).json({ error: await response.text() })
    const buffer = Buffer.from(await response.arrayBuffer())
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    res.send(buffer)
  } catch (error) {
    console.error('[OpenAI Voice Error]', error)
    res.status(500).json({ error: error.message || 'OpenAI voice failed.' })
  }
})

app.post('/api/openai-transcribe', async (req, res) => {
  try {
    const finalKey = String(req.headers['x-openai-key'] || process.env.OPENAI_API_KEY || '').trim()
    if (!finalKey || !finalKey.startsWith('sk-')) return res.status(400).json({ error: 'OpenAI API Key is missing. Set key in Settings or server env OPENAI_API_KEY.' })

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${finalKey}`,
        'Content-Type': req.headers['content-type'] || 'multipart/form-data'
      },
      body: req,
      duplex: 'half'
    })

    const text = await response.text()
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    res.status(response.status).send(text)
  } catch (error) {
    console.error('[OpenAI Transcribe Error]', error)
    res.status(500).json({ error: error.message || 'OpenAI transcription failed.' })
  }
})

app.post('/api/openai-clean-subtitles', async (req, res) => {
  try {
    const { text = '', apiKey = '' } = req.body || {}
    const finalKey = String(req.headers['x-openai-key'] || apiKey || process.env.OPENAI_API_KEY || '').trim()
    if (!finalKey || !finalKey.startsWith('sk-')) return res.status(400).json({ error: 'OpenAI API Key is missing. Set key in Settings or server env OPENAI_API_KEY.' })
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Text is missing.' })

    const prompt = `你是英语字幕整理助手。
下面是一段英语口语的 Whisper 自动转录结果
（无标点，可能有分割错误）：

${text}

请把它整理成干净的英语句子列表，要求：
1. 加上正确的标点符号
2. 每个自然句子独占一行
3. 不要合并多个独立句子
4. 不要拆分本来是一句话的内容
5. 修正明显的转录错误
6. 不要改变原来说的内容，只整理格式
7. 直接输出句子列表，每行一句，
   不要序号，不要解释`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${finalKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          { role: 'system', content: 'You clean English transcript subtitles without adding new content.' },
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!response.ok) return res.status(response.status).json({ error: await response.text() })
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    const sentences = content
      .split('\n')
      .map(line => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
      .filter(Boolean)
    res.status(200).json({ sentences, raw: content })
  } catch (error) {
    console.error('[OpenAI Clean Subtitles Error]', error)
    res.status(500).json({ error: error.message || 'OpenAI subtitle cleaning failed.' })
  }
})

app.post('/api/openai-rewrite-course', async (req, res) => {
  try {
    const { apiKey = '', title = '', level = 'A2', userName = 'Kevin', lines = [] } = req.body || {}
    const finalKey = String(req.headers['x-openai-key'] || apiKey || process.env.OPENAI_API_KEY || '').trim()
    if (!finalKey || !finalKey.startsWith('sk-')) return res.status(400).json({ error: 'OpenAI API Key is missing. Set key in Settings or server env OPENAI_API_KEY.' })
    const cleanLines = Array.isArray(lines)
      ? lines.map(line => ({
          id: String(line?.id || ''),
          speaker: String(line?.speaker || ''),
          en: String(line?.en || '').trim(),
          cn: String(line?.cn || '').trim()
        })).filter(line => line.en).slice(0, 12)
      : []
    if (!cleanLines.length) return res.status(400).json({ error: 'Transcript lines are missing.' })

    const prompt = `Rewrite this textbook audio into a real Melbourne speaking practice for ${userName}.

Rules:
- Keep the original textbook audio separate. This output is a NEW generated-audio course.
- Use ${level} English.
- Use short daily spoken sentences.
- Keep useful chunks from the textbook where possible.
- Make the scene realistic for ${userName} living in Melbourne.
- Return valid JSON only. No markdown.

JSON shape:
{
  "pairs": [
    { "originalLineId": "line id", "original": "textbook sentence", "rewritten": "Melbourne sentence", "rewrittenCn": "simple Chinese meaning" }
  ],
  "dialogue": [
    { "speaker": "Neighbour", "en": "question", "cn": "Chinese" },
    { "speaker": "${userName}", "en": "answer", "cn": "Chinese" }
  ]
}

Course title: ${title}
Transcript:
${cleanLines.map((line, index) => `${index + 1}. [${line.id}] ${line.speaker ? `${line.speaker}: ` : ''}${line.en}${line.cn ? ` = ${line.cn}` : ''}`).join('\n')}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${finalKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'You rewrite ESL textbook audio into concise real-life Melbourne speaking practice and return strict JSON.' },
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!response.ok) return res.status(response.status).json({ error: await response.text() })
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    const jsonText = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(jsonText)
    const dialogue = Array.isArray(parsed.dialogue) ? parsed.dialogue : []
    const pairs = Array.isArray(parsed.pairs) ? parsed.pairs : []
    res.status(200).json({ pairs, dialogue, raw: parsed })
  } catch (error) {
    console.error('[OpenAI Rewrite Error]', error)
    res.status(500).json({ error: error.message || 'OpenAI rewrite failed.' })
  }
})

app.post('/api/openai-free-talk', async (req, res) => {
  try {
    const { apiKey = '', userName = 'Kevin', level = 'A2', scenario = '', keywords = [], history = [], userText = '' } = req.body || {}
    const finalKey = String(req.headers['x-openai-key'] || apiKey || process.env.OPENAI_API_KEY || '').trim()
    if (!finalKey || !finalKey.startsWith('sk-')) return res.status(400).json({ error: 'OpenAI API Key is missing. Set key in Settings or server env OPENAI_API_KEY.' })
    const cleanUserText = String(userText || '').trim()
    if (!cleanUserText) return res.status(400).json({ error: 'User text is missing.' })
    const cleanHistory = Array.isArray(history)
      ? history.slice(-8).map(row => ({
          role: row?.role === 'user' ? 'user' : 'assistant',
          content: String(row?.text || row?.content || '').trim()
        })).filter(row => row.content)
      : []

    const levelRule = level === 'A2'
      ? 'A2: reply with exactly one simple sentence, no more than 10 words.'
      : level === 'B1'
        ? 'B1: reply with one or two short sentences, no more than 15 words total.'
        : 'B2: reply with up to two natural sentences, but avoid obscure words.'
    const prompt = `You are a friendly Melbourne English speaking partner for ${userName}.

Scenario:
${scenario || 'Daily life in Melbourne'}

Useful topic words:
${Array.isArray(keywords) ? keywords.join(', ') : ''}

Rules:
- Stay strictly inside the scenario.
- ${levelRule}
- Do not correct every mistake. Keep the conversation moving.
- If the learner is stuck or unclear, give one simple hint.
- Use practical spoken English.
- Return valid JSON only. No markdown.

JSON shape:
{
  "reply": "your next spoken line",
  "hint": "one short speaking hint",
  "feedback": "one supportive note",
  "suggestedReview": "one useful sentence to save, or empty string"
}

Learner just said: ${cleanUserText}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${finalKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.35,
        messages: [
          { role: 'system', content: 'You are a concise ESL speaking partner. Return strict JSON only.' },
          ...cleanHistory,
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!response.ok) return res.status(response.status).json({ error: await response.text() })
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    const jsonText = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const parsed = JSON.parse(jsonText)
    res.status(200).json({
      reply: String(parsed.reply || '').trim(),
      hint: String(parsed.hint || '').trim(),
      feedback: String(parsed.feedback || '').trim(),
      suggestedReview: String(parsed.suggestedReview || '').trim()
    })
  } catch (error) {
    console.error('[OpenAI Free Talk Error]', error)
    res.status(500).json({ error: error.message || 'OpenAI free talk failed.' })
  }
})

if (isProd) {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))
} else {
  const vite = await createViteServer({ server: { middlewareMode: true, hmr: false }, appType: 'spa' })
  app.use(vite.middlewares)
}

const port = Number(process.env.PORT || 5182)
const host = process.env.HOST || '0.0.0.0'
app.listen(port, host, () => {
  const networkUrl = localNetworkUrl(port)
  console.log('')
  console.log('  Kevin English Learning System V3.9.63')
  console.log(`  Local:   http://127.0.0.1:${port}/`)
  if (networkUrl) console.log(`  Phone:   ${networkUrl}`)
  console.log('  Tip: open the Phone URL on the same Wi-Fi.')
  console.log('')
})
