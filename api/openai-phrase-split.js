export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const apiKey = String(req.headers['x-openai-key'] || body.apiKey || process.env.OPENAI_API_KEY || '').trim()
    const text = String(body.text || '').trim()

    if (!apiKey || !apiKey.startsWith('sk-')) {
      res.status(400).json({ error: 'OpenAI API Key is missing. Add it in Settings or set OPENAI_API_KEY in Vercel.' })
      return
    }
    if (!text) {
      res.status(400).json({ error: 'Text is missing.' })
      return
    }

    const prompt = `你是英语意群切分助手。下面是用户贴的一句长句或一小段英语：

${text}

请把它切成"句子 + 意群短语 + 中文"，规则：
1. 先按标点 / 语义把整段分成自然句子。
2. 每个句子按"意思群"（sense group）切成短语，不是按词数硬切。
3. 短语必须覆盖整句、不丢词，按原文顺序排列。
4. 每个句子和每个短语都给一个简洁自然的中文翻译（中文只用于显示，不要音译）。
5. 只返回 JSON，不要任何解释、不要 markdown 围栏。

返回这个结构：
{ "sentences": [
    { "en": "原句英文", "zh": "原句中文",
      "phrases": [ { "en": "意群短语", "zh": "短语中文" } ] }
] }`

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You split English text into sentences and sense-group phrases with Chinese translations. You only output JSON.' },
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: await upstream.text() })
      return
    }

    const data = await upstream.json()
    const content = data.choices?.[0]?.message?.content || ''
    res.status(200).json({ content })
  } catch (error) {
    res.status(500).json({ error: error?.message || 'OpenAI phrase split failed.' })
  }
}
