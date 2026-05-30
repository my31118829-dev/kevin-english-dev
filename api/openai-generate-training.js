function getApiKey(body = {}) {
  return String(body.apiKey || process.env.OPENAI_API_KEY || '').trim()
}

function parseJsonResponse(content = '') {
  const raw = String(content || '').trim()
  if (!raw) return null
  const fenceMatch = raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```([\s\S]*?)```/i)
  const jsonText = fenceMatch ? fenceMatch[1].trim() : raw
  try {
    return JSON.parse(jsonText)
  } catch {
    return null
  }
}

function toList(items, limit, mapFn) {
  if (!Array.isArray(items)) return []
  return items.slice(0, limit).map(mapFn).filter(Boolean)
}
function cleanText(value) {
  return String(value || '').trim()
}
function parseEnCnLine(value) {
  const raw = cleanText(value)
  if (!raw) return { en: '', cn: '' }
  const match = raw.match(/^(.+?)\s*(?:=|＝|\|)\s*(.+)$/)
  if (!match) return { en: raw, cn: '' }
  return { en: cleanText(match[1]), cn: cleanText(match[2]) }
}
function normalizeBilingualRow(item, textKeys = ['en', 'text', 'sentence', 'value'], cnKeys = ['cn', 'translation', 'zh']) {
  if (typeof item === 'string') {
    const parsed = parseEnCnLine(item)
    return { en: parsed.en, cn: parsed.cn }
  }
  const row = item && typeof item === 'object' ? item : {}
  const textValue = textKeys.map(key => row[key]).find(value => typeof value === 'string' && cleanText(value)) || ''
  const cnValue = cnKeys.map(key => row[key]).find(value => typeof value === 'string' && cleanText(value)) || ''
  const parsed = parseEnCnLine(textValue)
  return { en: cleanText(parsed.en || textValue), cn: cleanText(cnValue || parsed.cn || '') }
}
function normalizeBilingualList(items, limit, textKeys, cnKeys) {
  if (!Array.isArray(items)) return []
  return items
    .slice(0, limit)
    .map(item => normalizeBilingualRow(item, textKeys, cnKeys))
    .filter(item => item.en)
}
function normalizeDialogueRows(items, limit = 24) {
  if (!Array.isArray(items)) return []
  return items.slice(0, limit).map(item => {
    if (typeof item === 'string') {
      const parsed = parseEnCnLine(item)
      return { role: '', text: cleanText(parsed.en), cn: cleanText(parsed.cn) }
    }
    const row = item && typeof item === 'object' ? item : {}
    const parsed = normalizeBilingualRow(row, ['text', 'en', 'sentence', 'value'], ['cn', 'translation', 'zh'])
    if (!parsed.en) return null
    return { role: cleanText(row.role || row.speaker || ''), text: cleanText(parsed.en), cn: cleanText(parsed.cn) }
  }).filter(Boolean)
}
function normalizePack(pack, defaultUserRole = 'Learner') {
  const parsed = pack && typeof pack === 'object' ? pack : {}
  const dialogueRows = normalizeDialogueRows(parsed.dialogueEn || parsed.dialogue || parsed.realLifeDialogue || [], 24)
  const dialogueCn = Array.isArray(parsed.dialogueCn)
    ? parsed.dialogueCn.map(item => String(item || '').trim())
    : dialogueRows.map(item => cleanText(item.cn))
  return {
    background: {
      sceneEn: cleanText(parsed?.background?.sceneEn || ''),
      sceneCn: cleanText(parsed?.background?.sceneCn || ''),
      australiaContextEn: cleanText(parsed?.background?.australiaContextEn || ''),
      australiaContextCn: cleanText(parsed?.background?.australiaContextCn || ''),
      peopleRelationEn: cleanText(parsed?.background?.peopleRelationEn || parsed?.background?.relationshipEn || ''),
      peopleRelationCn: cleanText(parsed?.background?.peopleRelationCn || parsed?.background?.relationshipCn || ''),
      communicationGoalEn: cleanText(parsed?.background?.communicationGoalEn || parsed?.background?.lifeGoalEn || ''),
      communicationGoalCn: cleanText(parsed?.background?.communicationGoalCn || parsed?.background?.lifeGoalCn || ''),
      grammarTip: cleanText(parsed?.background?.grammarTip || ''),
      dailyTransferEn: cleanText(parsed?.background?.dailyTransferEn || parsed?.background?.transferUsageEn || ''),
      dailyTransferCn: cleanText(parsed?.background?.dailyTransferCn || parsed?.background?.transferUsageCn || ''),
      listenFor: Array.isArray(parsed?.background?.listenFor) ? parsed.background.listenFor.slice(0, 5).map(item => String(item || '').trim()).filter(Boolean) : []
    },
    dialogueEn: dialogueRows,
    dialogueCn,
    vocabulary: toList(parsed?.vocabulary, 8, item => {
      const word = String(item?.word || '').trim()
      if (!word) return null
      return {
        word,
        cn: cleanText(item?.cn || ''),
        examples: normalizeBilingualList(item?.examples, 3, ['en', 'text', 'sentence', 'value'], ['cn', 'translation', 'zh'])
      }
    }),
    chunks: toList(parsed?.chunks, 8, item => {
      const chunk = String(item?.chunk || '').trim()
      if (!chunk) return null
      return {
        chunk,
        cn: cleanText(item?.cn || ''),
        examples: normalizeBilingualList(item?.examples, 3, ['en', 'text', 'sentence', 'value'], ['cn', 'translation', 'zh'])
      }
    }),
    patterns: toList(parsed?.patterns, 6, item => {
      const pattern = String(item?.pattern || '').trim()
      if (!pattern) return null
      return {
        pattern,
        cn: cleanText(item?.cn || ''),
        autoSentences: normalizeBilingualList(item?.autoSentences, 4, ['en', 'text', 'sentence', 'value'], ['cn', 'translation', 'zh'])
      }
    }),
    usefulSentences: toList(parsed?.usefulSentences, 6, item => {
      const sentence = String(item?.sentence || '').trim()
      if (!sentence) return null
      return {
        sentence,
        cn: cleanText(item?.cn || ''),
        miniDialogue: Array.isArray(item?.miniDialogue)
          ? item.miniDialogue.slice(0, 6).map(row => {
              const parsed = normalizeBilingualRow(row, ['text', 'en', 'sentence', 'value'], ['cn', 'translation', 'zh'])
              if (!parsed.en) return null
              return {
                role: cleanText(row?.role || ''),
                text: parsed.en,
                cn: parsed.cn
              }
            }).filter(Boolean)
          : []
      }
    }),
    quickReaction: toList(parsed?.quickReaction, 8, item => {
      const promptEn = String(item?.promptEn || item?.answerEn || '').trim()
      const promptCn = String(item?.promptCn || '').trim()
      if (!promptEn && !promptCn) return null
      return {
        promptEn,
        promptCn,
        hint: String(item?.hint || '').trim(),
        answerEn: String(item?.answerEn || '').trim()
      }
    }),
    spellingFocus: Array.isArray(parsed?.spellingFocus) ? parsed.spellingFocus.slice(0, 8).map(item => String(item || '').trim()).filter(Boolean) : [],
    semiControlledTalk: {
      scenarioEn: String(parsed?.semiControlledTalk?.scenarioEn || ''),
      scenarioCn: String(parsed?.semiControlledTalk?.scenarioCn || ''),
      aiRole: String(parsed?.semiControlledTalk?.aiRole || 'Staff'),
      userRole: String(parsed?.semiControlledTalk?.userRole || defaultUserRole || 'Learner'),
      helpfulExpressions: Array.isArray(parsed?.semiControlledTalk?.helpfulExpressions)
        ? parsed.semiControlledTalk.helpfulExpressions.slice(0, 8).map(item => String(item || '').trim()).filter(Boolean)
        : [],
      turns: toList(parsed?.semiControlledTalk?.turns, 4, item => {
        const aiPrompt = String(item?.aiPrompt || '').trim()
        if (!aiPrompt) return null
        return { aiPrompt, sampleAnswer: String(item?.sampleAnswer || '').trim() }
      })
    }
  }
}
function normalizeTrainingBundle(training, defaultUserRole = 'Learner') {
  const source = training && typeof training === 'object' ? training : {}
  const textbookRaw = source.textbookSupportPack || source.textbookPack || source.supportPack || source
  const scenarioRaw = source.realLifeScenarioPack || source.realLifePack || source.scenarioPack || null
  const analysisSource = source.analysis || source.transcriptAnalysis || {}
  const analysis = {
    topic: cleanText(analysisSource.topic || ''),
    level: cleanText(analysisSource.level || ''),
    transcriptLength: cleanText(analysisSource.transcriptLength || analysisSource.length || ''),
    coreCommunicationGoal: cleanText(analysisSource.coreCommunicationGoal || analysisSource.goal || ''),
    importantExpressions: Array.isArray(analysisSource.importantExpressions) ? analysisSource.importantExpressions.slice(0, 8).map(item => cleanText(item)).filter(Boolean) : [],
    mainGrammar: cleanText(analysisSource.mainGrammar || ''),
    sceneType: cleanText(analysisSource.sceneType || ''),
    recommendedRealLifeScenario: cleanText(analysisSource.recommendedRealLifeScenario || '')
  }
  const textbookSupportPack = normalizePack(textbookRaw, defaultUserRole)
  const realLifeScenarioPack = scenarioRaw ? normalizePack(scenarioRaw, defaultUserRole) : null
  return {
    ...textbookSupportPack,
    analysis,
    textbookSupportPack,
    realLifeScenarioPack
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    const apiKey = getApiKey(body)
    const rawText = String(body.rawText || '').trim()
    const sentences = Array.isArray(body.sentences) ? body.sentences.map(item => String(item || '').trim()).filter(Boolean) : []
    const title = String(body.title || 'Imported Audio Course').trim()
    const level = String(body.level || 'Beginner').trim()
    const userProfile = body.userProfile && typeof body.userProfile === 'object' ? body.userProfile : {}
    const sourceMeta = body.sourceMeta && typeof body.sourceMeta === 'object' ? body.sourceMeta : {}
    const userName = cleanText(userProfile.name || 'Learner')
    const userLevel = cleanText(userProfile.level || level || 'Beginner')
    const userGoal = cleanText(userProfile.goal || 'Build real-life communication confidence in Australia.')
    const userStage = cleanText(userProfile.stage || '')
    const userBackground = cleanText(userProfile.background || userProfile.lifeBackground || '')
    const userNeeds = Array.isArray(userProfile.needs) ? userProfile.needs.map(item => cleanText(item)).filter(Boolean).slice(0, 6) : []
    const userContextLines = [
      `- name: ${userName}`,
      `- level: ${userLevel}`,
      `- stage: ${userStage || 'unspecified'}`,
      `- goal: ${userGoal}`,
      `- life background: ${userBackground || 'Chinese-speaking adult learner in Australia'}`,
      `- immediate needs: ${userNeeds.join(', ') || 'daily communication, appointments, shopping, transport'}`
    ].join('\n')
    const sourceName = cleanText(sourceMeta.sourceName || title || 'Audio Upload')
    const sourceType = cleanText(sourceMeta.sourceType || 'audio_upload')
    const sourceCategory = cleanText(sourceMeta.category || '')

    if (!apiKey || !apiKey.startsWith('sk-')) {
      res.status(400).json({ error: 'OpenAI API Key is missing.' })
      return
    }
    if (!rawText && !sentences.length) {
      res.status(400).json({ error: 'Transcript text is missing.' })
      return
    }

    const dialogueLines = sentences.length ? sentences.join('\n') : rawText
    const prompt = `你是 “Audio First 英语训练系统” 的课程设计助手。
任务：先分析 transcript，再生成两套训练包（教材配套包 + 真实生活场景包）。
目标：帮助当前用户在澳大利亚真实生活中快速建立可开口的沟通能力。

Current User Profile:
${userContextLines}
- location context: Australia daily life

Content Source:
- sourceName: ${sourceName}
- sourceType: ${sourceType}
- sourceCategory: ${sourceCategory || 'general'}
- title: ${title}
- transcriptLevelHint: ${level}

对话/文本：
${dialogueLines}

请严格输出 JSON 对象，不要任何解释，不要 markdown 代码块。
JSON 结构必须为：
{
  "analysis": {
    "topic": "",
    "level": "",
    "transcriptLength": "",
    "coreCommunicationGoal": "",
    "importantExpressions": ["", ""],
    "mainGrammar": "",
    "sceneType": "",
    "recommendedRealLifeScenario": ""
  },
  "textbookSupportPack": {
    "background": {"sceneEn":"","sceneCn":"","australiaContextEn":"","australiaContextCn":"","peopleRelationEn":"","peopleRelationCn":"","communicationGoalEn":"","communicationGoalCn":"","grammarTip":"","dailyTransferEn":"","dailyTransferCn":"","listenFor":[]},
    "dialogueCn": [],
    "dialogueEn": [],
    "vocabulary": [],
    "chunks": [],
    "patterns": [],
    "usefulSentences": [],
    "quickReaction": [],
    "spellingFocus": [],
    "semiControlledTalk": {"scenarioEn":"","scenarioCn":"","aiRole":"Staff","userRole":"${userName}","helpfulExpressions":[],"turns":[]}
  },
  "realLifeScenarioPack": {
    "background": {"sceneEn":"","sceneCn":"","australiaContextEn":"","australiaContextCn":"","peopleRelationEn":"","peopleRelationCn":"","communicationGoalEn":"","communicationGoalCn":"","grammarTip":"","dailyTransferEn":"","dailyTransferCn":"","listenFor":[]},
    "dialogueCn": [],
    "dialogueEn": [],
    "vocabulary": [],
    "chunks": [],
    "patterns": [],
    "usefulSentences": [],
    "quickReaction": [],
    "spellingFocus": [],
    "semiControlledTalk": {"scenarioEn":"","scenarioCn":"","aiRole":"Staff","userRole":"${userName}","helpfulExpressions":[],"turns":[]}
  }
}

限制：
1) vocabulary 最多 8 条，chunks 最多 8 条，patterns 最多 6 条，usefulSentences 最多 6 条，quickReaction 最多 8 条。
2) 所有英文句子必须简洁、真实生活可用，避免书面化。
3) dialogueCn 长度尽量和输入句子数一致，不够时可为空字符串补位。
4) 不能写死 Mandy；userRole 必须使用当前用户 ${userName}。
5) examples / autoSentences / miniDialogue 必须尽量提供完整中文（用于 EN+CN 全双语模式）。
6) quickReaction 必须包含 promptEn（英文提示，供语音播放）和 promptCn（中文理解提示）。
7) realLifeScenarioPack 必须与原主题相关、难度接近，但更生活化。
8) 场景优先澳大利亚高频生活环境（咖啡店、超市、GP、学校、交通等）。
9) 先做 transcript 分析再生成内容；analysis 不能为空对象。
10) Beginner 输出以短句、固定表达、高频句型为主；Post-beginner 加入轻度自由表达；Intermediate 可加入更自然连续对话。`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Generate training content failed.')
    }

    const json = await response.json()
    const content = String(json?.choices?.[0]?.message?.content || '')
    const parsed = parseJsonResponse(content)
    if (!parsed) throw new Error('Model did not return valid JSON.')

    const normalized = normalizeTrainingBundle(parsed, userName)

    res.status(200).json({ ok: true, training: normalized })
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Generate training content failed.' })
  }
}
