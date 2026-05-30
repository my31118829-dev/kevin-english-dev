import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import ModuleSubTabs from './components/ModuleSubTabs'
import GlobalAppNav from './components/GlobalAppNav'
import ModulePageShell from './components/ModulePageShell'
import LearnOverviewSection from './components/LearnOverviewSection'
import LibraryListSection from './components/LibraryListSection'
import OutputModuleSection from './components/OutputModuleSection'
import ReviewModuleSection from './components/ReviewModuleSection'
import PracticeSpellingPanel from './components/PracticeSpellingPanel'

const CARD_KEY = 'ke_dev_cards_v1'
const SETTINGS_KEY = 'ke_dev_settings_v1'
const QUEUE_KEY = 'ke_dev_learning_queue_v1'
const V2_STORE_KEY = 'ke_dev_v2_store_v1'
const ACCOUNT_SESSION_KEY = 'ke_dev_account_session_v1'
const ACCOUNT_PROFILES_KEY = 'ke_dev_account_profiles_v1'
const MAX_ACCOUNTS = 2

const V2_USERS = [
  { id: 'user_slot_1', name: 'User 1', level: 'Beginner', defaultVoice: 'nova' },
  { id: 'user_slot_2', name: 'User 2', level: 'Beginner', defaultVoice: 'alloy' }
]

const PRACTICE_STEPS = [
  { id: 'background', title: 'Background', label: '背景' },
  { id: 'dialogue', title: 'Dialogue', label: '对话精听' },
  { id: 'shadowing', title: 'Shadowing', label: '跟读' },
  { id: 'vocabulary', title: 'Vocabulary', label: '词汇' },
  { id: 'chunks', title: 'Chunks', label: '语块' },
  { id: 'patterns', title: 'Patterns', label: '句型' },
  { id: 'useful_sentences', title: 'Useful Sentences', label: '实用句子' },
  { id: 'reaction', title: 'Quick Reaction', label: '快反' },
  { id: 'spelling', title: 'Spelling', label: '拼写' },
  { id: 'guided', title: 'Semi-controlled Talk', label: '半控制对话' }
]

const LEARN_SUB_TABS = [
  { id: 'overview', label: '总览' },
  { id: 'background', label: '背景' },
  { id: 'dialogue', label: '对话' },
  { id: 'expressions', label: '表达' }
]

const PRACTICE_SUB_TABS = [
  { id: 'quick_response', label: '快反' },
  { id: 'spelling', label: '拼写' },
  { id: 'substitution', label: '替换' },
  { id: 'completion', label: '补全' }
]

const OUTPUT_SUB_TABS = [
  { id: 'overview', label: '总览' },
  { id: 'guided', label: '引导输出' },
  { id: 'role_play', label: '角色扮演' },
  { id: 'short_writing', label: '短写输出' }
]

const REVIEW_SUB_TABS = [
  { id: 'today', label: '今日' },
  { id: 'chunk', label: '语块' },
  { id: 'mistakes', label: '错题' },
  { id: 'shadowing', label: '跟读' }
]

const LIBRARY_SUB_TABS = [
  { id: 'courses', label: '课程' },
  { id: 'folders', label: '文件夹' },
  { id: 'import', label: '导入' },
  { id: 'stats', label: '统计' }
]

const defaultSettings = {
  apiKey: '',
  voice: 'alloy',
  contentVoice: 'onyx',
  exampleVoice: 'nova',
  fontSize: 'large',
  subtitleMode: 'BOTH',
  studyMode: 'LISTEN',
  pauseSeconds: 4,
  rolePlayPauseSeconds: 4,
  audioRepeat: 1,
  openaiStatus: 'Not tested',
  lastError: '',
  audioSpeed: 1.0,
  voiceRoles: {
    dialogueRole1: 'nova',
    dialogueRole2: 'alloy',
    dialogueRole3: 'fable',
    soloNarration: 'nova',
    quickPrompt: 'alloy'
  }
}

const VOICE_OPTIONS = [
  { id: 'nova', label: 'Nova', gender: '女声' },
  { id: 'shimmer', label: 'Shimmer', gender: '女声' },
  { id: 'alloy', label: 'Alloy', gender: '中性' },
  { id: 'echo', label: 'Echo', gender: '男声' },
  { id: 'onyx', label: 'Onyx', gender: '男声' },
  { id: 'fable', label: 'Fable', gender: '男声' }
]

const VOICE_ROLE_GROUPS = [
  { key: 'dialogueRole1', title: '双人对话 角色 1（女生/学习者）', defaultVoice: 'nova', sample: 'Hi, my name is Mandy. Nice to meet you.' },
  { key: 'dialogueRole2', title: '双人对话 角色 2（工作人员）', defaultVoice: 'alloy', sample: 'Can I have your full name, please?' },
  { key: 'dialogueRole3', title: '三人对话 第三角色', defaultVoice: 'fable', sample: 'I can help you with that.' },
  { key: 'soloNarration', title: '单人朗读 / 表达词汇', defaultVoice: 'nova', sample: 'Could you speak slowly, please?' },
  { key: 'quickPrompt', title: '快反 AI 提问', defaultVoice: 'alloy', sample: 'I want to join an English class. Please answer in English.' }
]

const sampleText = `TYPE:
CHUNK

CONTENT:
in my free time

MEANING:
在空闲时间

EXAMPLES:
I study English in my free time.
What do you do in your free time?
My daughter likes reading in her free time.

SOURCE:
English File Unit 3

CATEGORY:
Daily Life

TAGS:
daily-life

---

TYPE:
CHUNK

CONTENT:
on weekends

MEANING:
在周末

EXAMPLES:
I usually stay at home on weekends.
We sometimes go shopping on weekends.
What do you usually do on weekends?

SOURCE:
English File Unit 3

CATEGORY:
Routine

TAGS:
routine

---

TYPE:
SENTENCE

CONTENT:
I usually study English at night.

MEANING:
我通常晚上学习英语。

EXAMPLES:
I usually study English at night.
I sometimes study English after dinner.

SOURCE:
Mandy Daily English

CATEGORY:
Routine

TAGS:
routine`

const chatGptFormatPrompt = `请为学习者 生成一套“主题会话训练内容包”。主题、数量和具体内容可以按我的要求自由生成，但格式必须严格保持一致，方便程序自动导入。

学习者背景：
- A2 英语学习者
- 住在澳大利亚
- 需要生活中可以直接使用的英文
- 内容要简单、自然、高频、适合跟读和开口练习

内容包建议顺序：
1. 主题对话：TYPE 写 DIALOGUE，6-10 句完整场景对话。
2. 核心词汇 / 高频语块：TYPE 写 WORD 或 CHUNK。
3. 重点句型：TYPE 写 PATTERN，每个句型给 4 个例句。
4. 实用句子：TYPE 写 SENTENCE，可以加入 MINI_DIALOGUE。
5. 半控制输出练习：TYPE 写 SENTENCE，CATEGORY 写 Output Practice；MEANING 写中文提示，CONTENT 写参考英文回答。

重要格式要求：
1. 每一条内容必须用 TYPE 开始。
2. TYPE 可以写 WORD、CHUNK、SENTENCE、PATTERN、DIALOGUE。
3. 每一条都必须包含 CONTENT、MEANING、EXAMPLES、SOURCE、CATEGORY、TAGS。
4. 同一个主题内容包请使用同一个 SOURCE，例如 Seeing a Doctor English。
5. 多条内容之间用 --- 分隔。
6. 对话请写在 DIALOGUE 或 MINI_DIALOGUE 字段里。
7. 对话每行保留说话人标签，例如 A: / B: / Learner: / Doctor: / Receptionist:；程序显示标签，但播放音频时会自动过滤标签，只读实际台词。
8. EXAMPLES 每行一句英文；如需要中文，可以用 “英文 = 中文”。
9. 不要在没有 MINI_DIALOGUE 的句子里编造默认对话。
10. 内容重点是训练学习者开口，不是解释语法。

简短样例：

TYPE:
DIALOGUE

CONTENT:
Seeing a doctor about a sore throat

MEANING:
因为喉咙痛去看医生

EXAMPLES:
I need to see a doctor.
I have a sore throat.

MINI_DIALOGUE:
Doctor: Hi, what brings you in today?
Kevin: I have a sore throat.
Doctor: Do you have a fever?
Kevin: No, I don't think so.
Doctor: Please drink warm water and rest.
Kevin: Okay, thank you.

SOURCE:
Seeing a Doctor English

CATEGORY:
Theme Dialogue

TAGS:
doctor, health

---

TYPE:
CHUNK

CONTENT:
I have a sore throat

MEANING:
我喉咙痛

EXAMPLES:
I have a sore throat today.
I have a sore throat and I feel tired.

SOURCE:
Seeing a Doctor English

CATEGORY:
Health

TAGS:
doctor, symptom

---

TYPE:
PATTERN

CONTENT:
I have + symptom

MEANING:
我有……症状

EXAMPLES:
I have a headache.
I have a cough.
I have a sore throat.
I have a stomachache.

SOURCE:
Seeing a Doctor English

CATEGORY:
Pattern

TAGS:
doctor, pattern

---

TYPE:
SENTENCE

CONTENT:
I need to see a doctor.

MEANING:
我需要看医生。

EXAMPLES:
I need to see a doctor.
I need to make an appointment.

MINI_DIALOGUE:
A: Are you okay?
B: I need to see a doctor.
A: I can help you book an appointment.

SOURCE:
Seeing a Doctor English

CATEGORY:
Useful Sentence

TAGS:
doctor, useful-sentence

---

TYPE:
SENTENCE

CONTENT:
I have a sore throat.

MEANING:
你哪里不舒服？请用英文回答。

EXAMPLES:
Hint: I have + symptom
Reference answer: I have a sore throat.

SOURCE:
Seeing a Doctor English

CATEGORY:
Output Practice

TAGS:
doctor, output-practice`

const starterV2CourseText = `@@COURSE_START@@
TITLE: Living in Australia · Daily Conversation
BOOK: Living in Australia
LEVEL: Beginner
UNIT: 1
LESSON: Daily Life
CATEGORY: Survival English
CONTENT_TYPE: General Topic
GOAL: Build fast listening and speaking response for daily life.

@@BACKGROUND@@
SCENE_EN: Mandy is chatting with a neighbor near the apartment mailbox.
SCENE_CN: Mandy 在公寓信箱附近和邻居聊天。
AUSTRALIA_CONTEXT_EN: Use short and natural English for everyday small talk in Australia.
AUSTRALIA_CONTEXT_CN: 在澳洲生活场景中，用简短自然英文完成寒暄和问答。
GRAMMAR: Present simple + common question patterns.
LISTEN_FOR: greeting, weekend plan, location words, follow-up question.

@@DIALOGUE@@
TITLE: Neighbor small talk
Mandy: Hi, how are you going today?
Neighbor: I’m good, thanks. How about you?
Mandy: Pretty good. Are you heading to work now?
Neighbor: Not today. I’m working from home.
Mandy: Nice. Do you have any plans for tonight?
Neighbor: I might go for a walk near the river.
Mandy: Sounds good. Have a good day!
Neighbor: You too.

@@VOCAB@@
WORD: heading
MEANING: 正在前往
EXAMPLES:
Are you heading home now?
She is heading to the station.

WORD: pretty good
MEANING: 挺好的
EXAMPLES:
I’m pretty good today.
Everything is pretty good.

@@CHUNKS@@
CHUNK: working from home
MEANING: 在家办公
EXAMPLES:
I’m working from home today.
He works from home on Fridays.

CHUNK: go for a walk
MEANING: 去散步
EXAMPLES:
I want to go for a walk after dinner.
Let’s go for a walk near the park.

@@PATTERNS@@
PATTERN: Do you have any plans for ...?
MEANING: 你有……计划吗？
EXAMPLES:
Do you have any plans for tonight?
Do you have any plans for the weekend?
Do you have any plans for tomorrow?

PATTERN: I might + verb
MEANING: 我可能会……
EXAMPLES:
I might stay at home.
I might cook tonight.
I might call my friend.

@@USEFUL_SENTENCES@@
SENTENCE: How are you going today?
MEANING: 你今天怎么样？
EXAMPLES:
How are you going this morning?
How are you going this week?

SENTENCE: Sounds good.
MEANING: 听起来不错。
EXAMPLES:
That sounds good to me.
Sounds good, let’s do it.

@@QUICK_REACTION@@
PROMPT: 你现在要去上班吗？
HINT: heading to work
ANSWER: Are you heading to work now?

PROMPT: 我今天在家办公。
HINT: working from home
ANSWER: I’m working from home today.

@@SEMI_CONTROLLED_TALK@@
SCENARIO_EN: You meet a neighbor in the apartment hallway.
SCENARIO_CN: 你在公寓走廊遇到邻居。
AI_ROLE: Neighbor
USER_ROLE: Mandy
HELPFUL_EXPRESSIONS:
How are you going today?
Do you have any plans for tonight?
I might...
Have a good day!
AI: Hi, how are you going today?
SAMPLE: I’m pretty good, thanks. How about you?
AI: Do you have any plans for tonight?
SAMPLE: I might go for a walk near the river.
AI: Great, have a good day!
SAMPLE: Thanks, you too.`

const starterV2CourseText2 = `@@COURSE_START@@
TITLE: Pharmacy English · Cold Medicine
BOOK: General Topics
LEVEL: Beginner
UNIT: Topic
LESSON: Pharmacy
CATEGORY: Survival English
CONTENT_TYPE: General Topic
GOAL: Ask for medicine clearly and understand simple pharmacy questions.

@@BACKGROUND@@
SCENE_EN: Mandy goes to a pharmacy to buy medicine for a cold.
SCENE_CN: Mandy 去药房买感冒药。
AUSTRALIA_CONTEXT_EN: Pharmacists in Australia often ask about symptoms before recommending medicine.
AUSTRALIA_CONTEXT_CN: 在澳洲药房，药剂师通常会先问症状再推荐药物。
GRAMMAR: I have + symptom. Do you have anything for...?
LISTEN_FOR: sore throat, cough, medicine, how often.

@@DIALOGUE@@
TITLE: At the pharmacy
Pharmacist: Hi, how can I help you today?
Mandy: I have a sore throat and a cough.
Pharmacist: Do you have a fever?
Mandy: No, I don’t think so.
Pharmacist: Okay, this medicine can help.
Mandy: How often should I take it?
Pharmacist: Twice a day after food.
Mandy: Thank you very much.

@@VOCAB@@
WORD: sore throat
MEANING: 喉咙痛
EXAMPLES:
I have a sore throat today.
My sore throat is getting better.

WORD: fever
MEANING: 发烧
EXAMPLES:
Do you have a fever?
I don’t have a fever.

@@CHUNKS@@
CHUNK: twice a day
MEANING: 一天两次
EXAMPLES:
Take it twice a day.
I drink water twice a day.

CHUNK: after food
MEANING: 饭后
EXAMPLES:
Please take this after food.
I take vitamins after food.

@@PATTERNS@@
PATTERN: Do you have anything for ...?
MEANING: 你有治疗……的吗？
EXAMPLES:
Do you have anything for a cough?
Do you have anything for a headache?
Do you have anything for a sore throat?

@@USEFUL_SENTENCES@@
SENTENCE: How often should I take it?
MEANING: 我应该多久吃一次？
EXAMPLES:
How often should I use this cream?
How often should I take this medicine?

@@QUICK_REACTION@@
PROMPT: 我喉咙痛还有咳嗽。
HINT: I have...
ANSWER: I have a sore throat and a cough.

PROMPT: 这个药我多久吃一次？
HINT: How often...
ANSWER: How often should I take it?

@@SEMI_CONTROLLED_TALK@@
SCENARIO_EN: You are in a pharmacy and need cold medicine.
SCENARIO_CN: 你在药房，需要买感冒药。
AI_ROLE: Pharmacist
USER_ROLE: Mandy
HELPFUL_EXPRESSIONS:
I have a sore throat.
Do you have anything for ...?
How often should I take it?
AI: Hi, how can I help you today?
SAMPLE: I have a sore throat and a cough.
AI: Do you have a fever?
SAMPLE: No, I don’t think so.`

const STARTER_V2_COURSES = [starterV2CourseText, starterV2CourseText2]

function uid() { return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}` }
function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.warn('Local save failed. The app will keep running without crashing.', err)
    return false
  }
}
function safeAccountSlug(value = '') {
  const slug = String(value || '').trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '_').replace(/^_+|_+$/g, '')
  return slug || `acct_${Math.random().toString(36).slice(2, 8)}`
}
function scopedStorageKey(base, accountId = '') {
  const suffix = safeAccountSlug(accountId || 'guest')
  return `${base}__${suffix}`
}
const PREPARE_BATCH_SIZE = 1
const PREPARE_CLIPS_PER_RUN = 4
const VOICE_TIMEOUT_MS = 45000
const SILENT_AUDIO_UNLOCK = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQIAAAAAAA=='
const AUDIO_DB_NAME = 'ke_dev_audio_db_v1'
const AUDIO_DB_VERSION = 2
const AUDIO_STORE_NAME = 'clips'
const AUDIO_META_STORE_NAME = 'clipMeta'
const AUDIO_CACHE_SOFT_LIMIT_BYTES = 80 * 1024 * 1024
const AUDIO_CACHE_TARGET_BYTES = 60 * 1024 * 1024
const IMPORT_FIELD_NAMES = ['SOURCE_TITLE','SOURCE','CATEGORY','TAGS','TYPE','CONTENT','MEANING','EXAMPLES','PATTERN','DIALOGUE','MINI_DIALOGUE','MINI DIALOGUE']
function escapeRegExp(str) { return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
function parseTags(text) {
  return String(text || '')
    .split(/[,，\n]/)
    .map(x => cleanLineText(x))
    .filter(Boolean)
}
function normalizeVoiceRoles(raw) {
  const fallback = defaultSettings.voiceRoles
  const incoming = raw && typeof raw === 'object' ? raw : {}
  return {
    dialogueRole1: incoming.dialogueRole1 || fallback.dialogueRole1,
    dialogueRole2: incoming.dialogueRole2 || fallback.dialogueRole2,
    dialogueRole3: incoming.dialogueRole3 || fallback.dialogueRole3,
    soloNarration: incoming.soloNarration || fallback.soloNarration,
    quickPrompt: incoming.quickPrompt || fallback.quickPrompt
  }
}
function getField(block, name) {
  const names = IMPORT_FIELD_NAMES.map(x => x.toUpperCase())
  const target = String(name || '').toUpperCase()
  const lines = String(block || '').replace(/\r\n/g, '\n').split('\n')
  let collecting = false
  const out = []
  for (const line of lines) {
    const m = line.match(/^\s*([A-Z_]+)\s*:\s*(.*)$/i)
    if (m && names.includes(m[1].toUpperCase())) {
      if (collecting) break
      if (m[1].toUpperCase() === target) {
        collecting = true
        if (m[2]) out.push(m[2])
      }
      continue
    }
    if (collecting) out.push(line)
  }
  return out.join('\n').trim()
}
function cleanLineText(line) {
  return String(line || '')
    .replace(/^[-•*]\s*/, '')
    .replace(/^\d+[.)]\s*/, '')
    .trim()
}
function inferLikelyDialogue(lineTexts = [], roleNames = []) {
  const cleanedTexts = (lineTexts || []).map(text => cleanLineText(text)).filter(Boolean)
  const cleanedRoles = (roleNames || []).map(role => cleanLineText(role)).filter(Boolean)
  if (!cleanedTexts.length) return false
  const hasExplicitRole = cleanedRoles.some(role => role && !/^[A-C]$/i.test(role))
  if (hasExplicitRole) return true
  const questionCount = cleanedTexts.filter(text => /[?？]$/.test(text)).length
  if (cleanedTexts.length < 3) return false
  if (questionCount >= 2) return true
  if (questionCount >= 1 && cleanedTexts.length >= 5) return true
  return false
}
function parseRolePrefixedText(line) {
  const clean = cleanLineText(line)
  const match = clean.match(/^([A-Za-z][A-Za-z0-9 _-]{0,24})\s*:\s*(.+)$/)
  if (!match) return { role: '', text: clean }
  return { role: cleanLineText(match[1]), text: cleanLineText(match[2]) }
}
function splitEnglishChinese(line) {
  const clean = cleanLineText(line)
  const parts = clean.split(/\s+=\s+|\s+＝\s+/)
  return { en: (parts[0] || clean).trim(), cn: (parts[1] || '').trim() }
}
function containsChineseText(value) {
  return /[\u3400-\u9fff]/.test(String(value || ''))
}
function normalizeEnglishSpeechText(value) {
  const clean = cleanLineText(value || '')
  if (!clean) return ''
  const stripped = clean
    .replace(/[\u3400-\u9fff]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!/[A-Za-z]/.test(stripped)) return ''
  return stripped
}
function normalizeGeneratedBilingualRow(entry, textKeys = ['en', 'text', 'sentence', 'value'], cnKeys = ['cn', 'translation', 'zh']) {
  if (typeof entry === 'string') {
    const parsed = splitEnglishChinese(entry)
    return { text: cleanLineText(parsed.en), translation: cleanLineText(parsed.cn) }
  }
  const source = entry && typeof entry === 'object' ? entry : {}
  const textValue = textKeys.map(key => source[key]).find(value => typeof value === 'string' && cleanLineText(value)) || ''
  const cnValue = cnKeys.map(key => source[key]).find(value => typeof value === 'string' && cleanLineText(value)) || ''
  if (!textValue && !cnValue) return { text: '', translation: '' }
  const parsed = splitEnglishChinese(String(textValue || ''))
  return {
    text: cleanLineText(parsed.en || textValue),
    translation: cleanLineText(cnValue || parsed.cn || '')
  }
}
function normalizeGeneratedBilingualList(list, limit, textKeys, cnKeys) {
  if (!Array.isArray(list)) return []
  return list
    .slice(0, limit)
    .map(item => normalizeGeneratedBilingualRow(item, textKeys, cnKeys))
    .filter(item => item.text)
}
function normalizeGeneratedDialogueRows(list, limit = 24) {
  if (!Array.isArray(list)) return []
  return list.slice(0, limit).map(item => {
    if (typeof item === 'string') {
      const parsed = splitEnglishChinese(item)
      return { role: '', text: cleanLineText(parsed.en), cn: cleanLineText(parsed.cn) }
    }
    const row = item && typeof item === 'object' ? item : {}
    const parsed = normalizeGeneratedBilingualRow(row, ['text', 'en', 'sentence', 'value'], ['cn', 'translation', 'zh'])
    const role = cleanLineText(row.role || row.speaker || '')
    if (!parsed.text) return null
    return { role, text: parsed.text, cn: parsed.translation }
  }).filter(Boolean)
}
function normalizeGeneratedTrainingPayload(training, defaultUserRole = 'Learner') {
  const source = training && typeof training === 'object' ? training : {}
  const normalizeDialogueCn = Array.isArray(source.dialogueCn)
    ? source.dialogueCn.map(item => cleanLineText(typeof item === 'string' ? item : item?.cn || item?.translation || ''))
    : []
  const dialogueRows = normalizeGeneratedDialogueRows(source.dialogueEn || source.dialogue || source.realLifeDialogue || [], 24)
  const dialogueCn = normalizeDialogueCn.length
    ? normalizeDialogueCn
    : dialogueRows.map(item => cleanLineText(item.cn || ''))
  const normalizeExpressions = (list, limit, textKey, exField) => {
    if (!Array.isArray(list)) return []
    return list.slice(0, limit).map(item => {
      const text = cleanLineText(item?.[textKey] || '')
      if (!text) return null
      return {
        [textKey]: text,
        cn: cleanLineText(item?.cn || ''),
        [exField]: normalizeGeneratedBilingualList(item?.[exField], exField === 'autoSentences' ? 4 : 3, ['en', 'text', 'sentence', 'value'], ['cn', 'translation', 'zh'])
      }
    }).filter(Boolean)
  }
  return {
    background: {
      sceneEn: cleanLineText(source?.background?.sceneEn || ''),
      sceneCn: cleanLineText(source?.background?.sceneCn || ''),
      australiaContextEn: cleanLineText(source?.background?.australiaContextEn || ''),
      australiaContextCn: cleanLineText(source?.background?.australiaContextCn || ''),
      peopleRelationEn: cleanLineText(source?.background?.peopleRelationEn || source?.background?.relationshipEn || ''),
      peopleRelationCn: cleanLineText(source?.background?.peopleRelationCn || source?.background?.relationshipCn || ''),
      communicationGoalEn: cleanLineText(source?.background?.communicationGoalEn || source?.background?.lifeGoalEn || ''),
      communicationGoalCn: cleanLineText(source?.background?.communicationGoalCn || source?.background?.lifeGoalCn || ''),
      dailyTransferEn: cleanLineText(source?.background?.dailyTransferEn || source?.background?.transferUsageEn || ''),
      dailyTransferCn: cleanLineText(source?.background?.dailyTransferCn || source?.background?.transferUsageCn || ''),
      grammarTip: cleanLineText(source?.background?.grammarTip || ''),
      listenFor: Array.isArray(source?.background?.listenFor) ? source.background.listenFor.slice(0, 5).map(item => cleanLineText(item)).filter(Boolean) : []
    },
    dialogueEn: dialogueRows,
    dialogueCn,
    vocabulary: normalizeExpressions(source.vocabulary, 8, 'word', 'examples'),
    chunks: normalizeExpressions(source.chunks, 8, 'chunk', 'examples'),
    patterns: normalizeExpressions(source.patterns, 6, 'pattern', 'autoSentences'),
    usefulSentences: Array.isArray(source.usefulSentences)
      ? source.usefulSentences.slice(0, 6).map(item => {
          const sentence = cleanLineText(item?.sentence || '')
          if (!sentence) return null
          const miniDialogue = Array.isArray(item?.miniDialogue)
            ? item.miniDialogue.slice(0, 6).map(row => {
                const parsed = normalizeGeneratedBilingualRow(row, ['text', 'en', 'sentence'], ['cn', 'translation', 'zh'])
                if (!parsed.text) return null
                return {
                  role: cleanLineText(row?.role || ''),
                  text: parsed.text,
                  cn: parsed.translation
                }
              }).filter(Boolean)
            : []
          return {
            sentence,
            cn: cleanLineText(item?.cn || ''),
            miniDialogue
          }
        }).filter(Boolean)
      : [],
    quickReaction: Array.isArray(source.quickReaction)
      ? source.quickReaction.slice(0, 8).map(item => {
          const promptCn = cleanLineText(item?.promptCn || '')
          const promptEn = cleanLineText(item?.promptEn || item?.prompt || item?.answerEn || '')
          if (!promptCn && !promptEn) return null
          return {
            promptEn,
            promptCn,
            hint: cleanLineText(item?.hint || ''),
            answerEn: cleanLineText(item?.answerEn || '')
          }
        }).filter(Boolean)
      : [],
    spellingFocus: Array.isArray(source.spellingFocus) ? source.spellingFocus.slice(0, 8).map(item => cleanLineText(item)).filter(Boolean) : [],
    semiControlledTalk: {
      scenarioEn: cleanLineText(source?.semiControlledTalk?.scenarioEn || ''),
      scenarioCn: cleanLineText(source?.semiControlledTalk?.scenarioCn || ''),
      aiRole: cleanLineText(source?.semiControlledTalk?.aiRole || 'Staff'),
      userRole: cleanLineText(source?.semiControlledTalk?.userRole || defaultUserRole || 'Learner'),
      helpfulExpressions: Array.isArray(source?.semiControlledTalk?.helpfulExpressions)
        ? source.semiControlledTalk.helpfulExpressions.slice(0, 8).map(item => cleanLineText(item)).filter(Boolean)
        : [],
      turns: Array.isArray(source?.semiControlledTalk?.turns)
        ? source.semiControlledTalk.turns.slice(0, 4).map(item => {
            const aiPrompt = cleanLineText(item?.aiPrompt || '')
            if (!aiPrompt) return null
            return {
              aiPrompt,
              sampleAnswer: cleanLineText(item?.sampleAnswer || '')
            }
          }).filter(Boolean)
        : []
    }
  }
}
function normalizeGeneratedTrainingBundle(training, defaultUserRole = 'Learner') {
  const source = training && typeof training === 'object' ? training : {}
  const normalizeAnalysis = (analysis) => {
    const item = analysis && typeof analysis === 'object' ? analysis : {}
    return {
      topic: cleanLineText(item.topic || ''),
      level: cleanLineText(item.level || ''),
      transcriptLength: cleanLineText(item.transcriptLength || item.length || ''),
      coreCommunicationGoal: cleanLineText(item.coreCommunicationGoal || item.goal || ''),
      importantExpressions: Array.isArray(item.importantExpressions) ? item.importantExpressions.slice(0, 8).map(value => cleanLineText(value)).filter(Boolean) : [],
      mainGrammar: cleanLineText(item.mainGrammar || ''),
      sceneType: cleanLineText(item.sceneType || ''),
      recommendedRealLifeScenario: cleanLineText(item.recommendedRealLifeScenario || '')
    }
  }
  const textbookRaw = source.textbookSupportPack || source.textbookPack || source.supportPack || source
  const scenarioRaw = source.realLifeScenarioPack || source.realLifePack || source.scenarioPack || null
  const textbookSupportPack = normalizeGeneratedTrainingPayload(textbookRaw, defaultUserRole)
  const realLifeScenarioPack = scenarioRaw ? normalizeGeneratedTrainingPayload(scenarioRaw, defaultUserRole) : null
  return {
    ...textbookSupportPack,
    analysis: normalizeAnalysis(source.analysis || source.transcriptAnalysis || {}),
    textbookSupportPack,
    realLifeScenarioPack
  }
}
function parseLinesField(text) {
  return (text || '').split('\n').map(cleanLineText).filter(Boolean)
}
function normalizeType(rawType, fallback = 'CHUNK') {
  const upper = String(rawType || fallback || 'CHUNK').trim().toUpperCase()
  const compact = upper.replace(/[\s-]+/g, '_')
  if (compact === 'AUTO') return 'AUTO'
  if (['VOCAB','VOCABULARY','WORD','WORDS','CORE_VOCABULARY'].includes(compact)) return 'WORD'
  if (['PHRASE','PHRASES','CHUNK','CHUNKS','HIGH_FREQUENCY_CHUNK','HIGH_FREQUENCY_CHUNKS'].includes(compact)) return 'CHUNK'
  if (['SENTENCE','SENTENCES','USEFUL_SENTENCE','USEFUL_SENTENCES','OUTPUT','OUTPUT_PRACTICE','CONTROLLED_PRACTICE','SEMI_CONTROLLED_PRACTICE','SPEAKING_PRACTICE'].includes(compact)) return 'SENTENCE'
  if (['PATTERN','PATTERNS','SENTENCE_PATTERN','KEY_PATTERN','KEY_PATTERNS'].includes(compact)) return 'PATTERN'
  if (['DIALOGUE','DIALOGUES','MINI_DIALOGUE','MINI_DIALOGUES','MINI_DIALOG','THEME_DIALOGUE','TOPIC_DIALOGUE','CONVERSATION'].includes(compact)) return 'DIALOGUE'
  return ['WORD','CHUNK','SENTENCE','PATTERN','DIALOGUE'].includes(compact) ? compact : fallback
}
function detectImportMeta(text, fallback = {}) {
  const normalized = (text || '').replace(/\r\n/g, '\n')
  const source = getField(normalized, 'SOURCE_TITLE') || getField(normalized, 'SOURCE') || fallback.source || 'Uncategorized'
  const category = getField(normalized, 'CATEGORY') || fallback.category || 'General'
  const type = normalizeType(getField(normalized, 'TYPE') || fallback.type || 'AUTO', 'AUTO')
  const tagsRaw = getField(normalized, 'TAGS') || (Array.isArray(fallback.tags) ? fallback.tags.join(',') : fallback.tagsText) || ''
  const tags = parseTags(tagsRaw)
  return { source, category, type, tags, tagsText: tags.join(', ') }
}
function normalizeExample(ex) {
  if (typeof ex === 'string') {
    const parsed = splitEnglishChinese(ex)
    return { id: uid(), text: parsed.en, cn: parsed.cn, audio: '' }
  }
  const parsed = splitEnglishChinese(ex.text || '')
  return { id: ex.id || uid(), text: parsed.en, cn: ex.cn || parsed.cn || '', audio: ex.audio || ex.audioDataUrl || '' }
}
function normalizeCard(card) {
  const normalized = {
    ...card,
    id: card.id || uid(),
    type: (card.type || 'CHUNK').toUpperCase(),
    content: card.content || '',
    meaning: card.meaning || '',
    pattern: card.pattern || '',
    dialogue: Array.isArray(card.dialogue) ? card.dialogue.map(x => {
      const parsed = splitEnglishChinese(x.text || x)
      return { id: x.id || uid(), text: cleanLineText(parsed.en), cn: x.cn || parsed.cn || '' }
    }).filter(x => x.text) : [],
    source: card.source || 'Uncategorized',
    category: card.category || 'General',
    tags: card.tags || [],
    examples: (card.examples || []).map(normalizeExample),
    dialogueAudios: Array.isArray(card.dialogueAudios) ? card.dialogueAudios : [],
    contentAudio: card.contentAudio || card.contentAudioDataUrl || card.audioDataUrl || '',
    lastReviewAt: card.lastReviewAt || null,
    nextReviewAt: card.nextReviewAt || null,
    status: card.status || 'New',
    goodCount: card.goodCount || 0,
    reviewLevel: Number(card.reviewLevel ?? card.goodCount ?? 0),
    wrongCount: card.wrongCount || 0,
    reviewCount: card.reviewCount || 0
  }
  if (isAutoGeneratedDialogue(normalized)) {
    normalized.dialogue = []
    normalized.dialogueAudios = []
  }
  return normalized
}
function makeCard({ type, content, meaning, examples, source, category, tags, pattern = '', dialogue = [] }) {
  return normalizeCard({
    id: uid(), type, content, meaning, pattern,
    dialogue: dialogue.map(text => {
      const parsed = splitEnglishChinese(text)
      return { id: uid(), text: cleanLineText(parsed.en), cn: parsed.cn, audio: '' }
    }).filter(x => x.text),
    examples: examples.map(text => {
      const parsed = splitEnglishChinese(text)
      return { id: uid(), text: parsed.en, cn: parsed.cn, audio: '' }
    }).filter(x => x.text),
    source: source || 'Uncategorized', category: category || 'General', tags,
    contentAudio: '', status: 'New', goodCount: 0, wrongCount: 0, reviewCount: 0,
    lastReviewAt: null, nextReviewAt: null, createdAt: Date.now(), updatedAt: Date.now()
  })
}
function smartParseLoose(text, defaults) {
  const lines = text.split('\n').map(x => x.trim()).filter(Boolean)
  const cards = []
  for (let i = 0; i < lines.length; i += 3) {
    const content = lines[i]
    if (!content) continue
    const meaning = lines[i + 1] || ''
    const example = lines[i + 2] || ''
    const type = defaults.type !== 'AUTO' ? defaults.type : (content.split(' ').length >= 5 ? 'SENTENCE' : 'CHUNK')
    cards.push(makeCard({ type, content, meaning, examples: example ? [example] : [], source: defaults.source, category: defaults.category, tags: defaults.tags }))
  }
  return cards
}
function splitImportBlocks(text) {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim()
  if (!normalized) return []
  const dividerBlocks = normalized.split(/\n\s*---+\s*\n/g).map(x => x.trim()).filter(Boolean)
  const blocks = []
  for (const part of dividerBlocks) {
    const typeMatches = [...part.matchAll(/(^|\n)\s*TYPE\s*:/gi)]
    if (typeMatches.length <= 1) {
      blocks.push(part)
      continue
    }
    for (let i = 0; i < typeMatches.length; i++) {
      const start = typeMatches[i].index + typeMatches[i][1].length
      const end = i + 1 < typeMatches.length ? typeMatches[i + 1].index : part.length
      const block = part.slice(start, end).trim()
      if (block) blocks.push(block)
    }
  }
  return blocks
}
function parseImportText(text, defaults) {
  const detected = detectImportMeta(text, defaults)
  const finalDefaults = { ...defaults, source: detected.source, category: detected.category, type: detected.type, tags: detected.tags }
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []
  if (!/TYPE:/i.test(normalized) && !/CONTENT:/i.test(normalized)) return smartParseLoose(normalized, finalDefaults)
  return splitImportBlocks(normalized)
    .filter(x => x && /CONTENT\s*:/i.test(x))
    .map(block => {
      const rawType = normalizeType(getField(block, 'TYPE') || finalDefaults.type || 'CHUNK', 'CHUNK')
      const content = getField(block, 'CONTENT')
      const type = rawType === 'AUTO' ? (content.split(/\s+/).filter(Boolean).length >= 5 ? 'SENTENCE' : 'CHUNK') : rawType
      const examples = parseLinesField(getField(block, 'EXAMPLES')).filter(Boolean)
      const dialogueText = getField(block, 'DIALOGUE') || getField(block, 'MINI_DIALOGUE') || getField(block, 'MINI DIALOGUE')
      const dialogue = parseLinesField(dialogueText).filter(Boolean)
      return makeCard({
        type, content, meaning: getField(block, 'MEANING'), examples, dialogue,
        pattern: getField(block, 'PATTERN'),
        source: getField(block, 'SOURCE_TITLE') || getField(block, 'SOURCE') || finalDefaults.source,
        category: getField(block, 'CATEGORY') || finalDefaults.category,
        tags: parseTags(getField(block, 'TAGS') || finalDefaults.tags.join(','))
      })
    }).filter(c => c.content)
}
function importKey(c) {
  return `${(c.source || '').toLowerCase().trim()}::${(c.content || '').toLowerCase().trim()}`
}
function isoNow() { return new Date().toISOString() }
function makeProgress(courseId, userId, lastStep = 'background') {
  const safeStep = PRACTICE_STEPS.some(step => step.id === lastStep) ? lastStep : 'background'
  const statuses = Object.fromEntries(PRACTICE_STEPS.map(step => [step.id, step.id === safeStep ? 'current' : 'not_started']))
  return {
    id: `progress_${courseId}`,
    userId,
    courseId,
    ...statuses,
    lastStep: safeStep,
    updatedAt: isoNow()
  }
}
function defaultV2Store(cards = []) {
  const now = isoNow()
  return {
    version: 1,
    activeUserId: 'mandy',
    activeCourseId: '',
    activePracticeStep: 'background',
    users: V2_USERS.map(user => ({ ...user, createdAt: now })),
    folders: [],
    courses: [],
    contentBlocks: [],
    progress: [],
    reviewItems: [],
    settingsByUser: Object.fromEntries(V2_USERS.map(user => [user.id, {
      userId: user.id,
      languageMode: 'en_cn',
      audioSpeed: 1.0,
      pauseTimeSeconds: 2,
      defaultVoice: user.defaultVoice || 'nova',
      autoPlayNext: false,
      roleNameFiltering: true,
      cloudSync: false,
      audioCacheEnabled: true
    }])),
    legacyMigration: { migratedAt: now, sourceCount: 0 }
  }
}
function cardsToLegacyV2(cards, userId = 'kevin') {
  const now = isoNow()
  const grouped = groupSources(cards)
  const courses = []
  const contentBlocks = []
  const progress = []
  for (const source of grouped) {
    const courseId = `legacy_${source.source.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || uid()}`
    const categories = source.categories.filter(Boolean)
    courses.push({
      id: courseId,
      userId,
      book: 'Legacy Audio Memory',
      level: userId === 'mandy' ? 'Beginner' : 'A2',
      unit: '',
      lesson: '',
      title: source.source,
      type: 'General Topic',
      category: categories[0] || 'General',
      goal: 'Continue training with imported legacy cards.',
      topFolderId: '',
      subFolderId: '',
      active: false,
      legacySource: source.source,
      createdAt: now,
      updatedAt: now
    })
    contentBlocks.push({
      id: `${courseId}_legacy_block`,
      userId,
      courseId,
      type: 'General Topic',
      title: source.source,
      source: 'Legacy import',
      order: 1,
      audioCacheStatus: source.ready === source.items.length && source.items.length ? 'cached' : source.ready ? 'partial' : 'not_cached',
      legacyCardIds: source.items.map(item => item.id),
      counts: {
        chunks: source.chunkCount,
        sentences: source.sentenceCount,
        patterns: source.patternCount,
        dialogues: source.dialogueCount,
        total: source.items.length
      },
      createdAt: now,
      updatedAt: now
    })
    progress.push(makeProgress(courseId, userId))
  }
  return { courses, contentBlocks, progress }
}
function normalizeV2Store(store, cards = []) {
  const base = defaultV2Store(cards)
  const incoming = store && typeof store === 'object' ? store : {}
  const merged = {
    ...base,
    ...incoming,
    users: Array.isArray(incoming.users) && incoming.users.length ? incoming.users : base.users,
    folders: Array.isArray(incoming.folders) ? incoming.folders : [],
    courses: Array.isArray(incoming.courses) ? incoming.courses : [],
    contentBlocks: Array.isArray(incoming.contentBlocks) ? incoming.contentBlocks : [],
    progress: Array.isArray(incoming.progress) ? incoming.progress : [],
    reviewItems: Array.isArray(incoming.reviewItems) ? incoming.reviewItems : [],
    settingsByUser: { ...base.settingsByUser, ...(incoming.settingsByUser || {}) },
    legacyMigration: incoming.legacyMigration || base.legacyMigration
  }
  if (!merged.courses.length && cards.length) {
    const legacy = cardsToLegacyV2(cards, 'kevin')
    merged.courses = legacy.courses
    merged.contentBlocks = legacy.contentBlocks
    merged.progress = legacy.progress
    merged.activeCourseId = legacy.courses[0]?.id || ''
    merged.legacyMigration = { migratedAt: isoNow(), sourceCount: legacy.courses.length }
  }
  if (!merged.activeUserId || !merged.users.some(user => user.id === merged.activeUserId)) merged.activeUserId = merged.users[0]?.id || 'mandy'
  if (!merged.activeCourseId || !merged.courses.some(course => course.id === merged.activeCourseId && course.userId === merged.activeUserId)) {
    merged.activeCourseId = merged.courses.find(course => course.userId === merged.activeUserId)?.id || merged.courses[0]?.id || ''
  }
  if (merged.activeCourseId) {
    const activeCourse = merged.courses.find(course => course.id === merged.activeCourseId)
    if (activeCourse?.userId && activeCourse.userId !== merged.activeUserId) merged.activeUserId = activeCourse.userId
  }
  const validStepIds = new Set(PRACTICE_STEPS.map(step => step.id))
  const legacyStepMap = { expressions: 'vocabulary' }
  merged.activePracticeStep = legacyStepMap[merged.activePracticeStep] || merged.activePracticeStep || 'background'
  if (!validStepIds.has(merged.activePracticeStep)) merged.activePracticeStep = 'background'
  merged.progress = merged.progress.map(item => {
    const next = { ...item }
    const legacyExpressionStatus = next.expressions
    if (!next.vocabulary) next.vocabulary = legacyExpressionStatus || 'not_started'
    if (!next.chunks) next.chunks = legacyExpressionStatus === 'done' ? 'done' : 'not_started'
    if (!next.patterns) next.patterns = legacyExpressionStatus === 'done' ? 'done' : 'not_started'
    if (!next.useful_sentences) next.useful_sentences = legacyExpressionStatus === 'done' ? 'done' : 'not_started'
    for (const step of PRACTICE_STEPS) {
      if (!['not_started', 'current', 'done'].includes(next[step.id])) next[step.id] = 'not_started'
    }
    next.lastStep = legacyStepMap[next.lastStep] || next.lastStep || 'background'
    if (!validStepIds.has(next.lastStep)) next.lastStep = 'background'
    return next
  })
  return merged
}
function splitV2Sections(text) {
  const sections = {}
  let current = 'ROOT'
  for (const raw of String(text || '').replace(/\r\n/g, '\n').split('\n')) {
    const marker = raw.match(/^\s*@@([A-Z_]+)@@\s*$/)
    if (marker) {
      current = marker[1]
      if (!sections[current]) sections[current] = []
      continue
    }
    if (!sections[current]) sections[current] = []
    sections[current].push(raw)
  }
  return sections
}
function parseKeyValueLines(lines = []) {
  const out = {}
  let current = ''
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const match = line.match(/^([A-Z][A-Z0-9_ ]{1,40})\s*:\s*(.*)$/)
    if (match) {
      current = match[1].trim().replace(/\s+/g, '_').toUpperCase()
      out[current] = match[2].trim()
      continue
    }
    if (current) out[current] = `${out[current] ? `${out[current]}\n` : ''}${line}`
  }
  return out
}
function parseRoleLine(line) {
  const cleaned = cleanLineText(line)
  const match = cleaned.match(/^([^:：]{1,32})\s*[:：]\s*(.+)$/)
  if (!match) return null
  const parsed = splitEnglishChinese(match[2])
  return { role: cleanLineText(match[1]), text: parsed.en, translation: parsed.cn }
}
function parseDialogueSection(lines = []) {
  const meta = parseKeyValueLines(lines)
  const dialogueLines = lines.map(parseRoleLine).filter(Boolean).map((line, index) => ({
    id: uid(),
    ...line,
    order: index + 1,
    audioAssetId: '',
    difficult: false
  }))
  return {
    id: uid(),
    title: meta.TITLE || 'Dialogue',
    sourceType: meta.SOURCE_TYPE || '',
    lines: dialogueLines
  }
}
function parseSimpleListField(text) {
  return String(text || '').split('\n').map(cleanLineText).filter(Boolean)
}
function parseExpressionSection(lines = [], marker, type) {
  const items = []
  let current = null
  let mode = ''
  const commit = () => {
    if (!current) return
    current.order = items.length + 1
    items.push(current)
  }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const main = line.match(new RegExp(`^${marker}\\s*:\\s*(.+)$`, 'i'))
    if (main) {
      commit()
      current = {
        id: uid(),
        type,
        text: main[1].trim(),
        meaning: '',
        note: '',
        examples: [],
        autoSentences: [],
        miniDialogues: [],
        audioAssetId: '',
        reviewEnabled: true
      }
      mode = ''
      continue
    }
    if (!current) continue
    const field = line.match(/^([A-Z0-9_]+)\s*:\s*(.*)$/)
    if (field) {
      const key = field[1].toUpperCase()
      const value = field[2].trim()
      if (key === 'MEANING') current.meaning = value
      else if (key === 'NOTE') current.note = value
      else if (key === 'EXAMPLES') mode = 'examples'
      else if (key === 'AUTO_SENTENCES') mode = 'autoSentences'
      else if (/^MINI_DIALOGUE/.test(key)) {
        current.miniDialogues.push({ id: uid(), title: value || `Mini Dialogue ${current.miniDialogues.length + 1}`, lines: [] })
        mode = 'miniDialogue'
      } else mode = ''
      continue
    }
    if (mode === 'examples') {
      const parsed = splitEnglishChinese(line)
      current.examples.push({ id: uid(), text: parsed.en, translation: parsed.cn, audioAssetId: '', order: current.examples.length + 1 })
    } else if (mode === 'autoSentences') {
      const parsed = splitEnglishChinese(line)
      current.autoSentences.push({ id: uid(), text: parsed.en, translation: parsed.cn, audioAssetId: '', order: current.autoSentences.length + 1 })
    } else if (mode === 'miniDialogue') {
      const roleLine = parseRoleLine(line)
      const mini = current.miniDialogues[current.miniDialogues.length - 1]
      if (roleLine && mini) mini.lines.push({ id: uid(), ...roleLine, audioAssetId: '', order: mini.lines.length + 1 })
    }
  }
  commit()
  return items
}
function parseQuickReaction(lines = []) {
  const items = []
  let current = null
  const commit = () => {
    if (current?.promptEn || current?.promptCn || current?.answer) {
      current.id = uid()
      current.order = items.length + 1
      items.push(current)
    }
  }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const match = line.match(/^([A-Z_]+)\s*:\s*(.*)$/)
    if (!match) continue
    const key = match[1].toUpperCase()
    const value = match[2].trim()
    if (key === 'PROMPT') {
      commit()
      const parsed = splitEnglishChinese(value)
      const hasLatin = /[A-Za-z]/.test(value)
      const onlyCn = containsChineseText(value) && !hasLatin
      const promptEn = cleanLineText(onlyCn ? '' : parsed.en)
      const promptCn = cleanLineText(parsed.cn || (onlyCn ? value : ''))
      current = { prompt: promptCn || promptEn, promptEn, promptCn, hint: '', answer: '', audioAssetId: '' }
    } else if (current && key === 'HINT') current.hint = value
    else if (current && key === 'ANSWER') current.answer = value
  }
  commit()
  return items
}
function parseSemiControlledTalk(lines = []) {
  const meta = parseKeyValueLines(lines)
  const turns = []
  let current = null
  const commit = () => {
    if (!current) return
    current.id = uid()
    current.order = turns.length + 1
    turns.push(current)
  }
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const ai = line.match(/^AI\s*:\s*(.+)$/i)
    const sample = line.match(/^SAMPLE\s*:\s*(.+)$/i)
    if (ai) {
      commit()
      current = { aiPrompt: ai[1].trim(), sampleAnswer: '', audioAssetId: '' }
    } else if (sample && current) current.sampleAnswer = sample[1].trim()
  }
  commit()
  return {
    id: uid(),
    scenarioEn: meta.SCENARIO_EN || '',
    scenarioCn: meta.SCENARIO_CN || '',
    aiRole: meta.AI_ROLE || 'Staff',
    userRole: meta.USER_ROLE || 'Mandy',
    helpfulExpressions: parseSimpleListField(meta.HELPFUL_EXPRESSIONS),
    turns
  }
}
function parseMandyV2CourseText(text, userId = 'mandy') {
  const raw = String(text || '')
  if (!/@@COURSE_START@@/.test(raw)) return null
  const sections = splitV2Sections(raw)
  const meta = parseKeyValueLines(sections.COURSE_START || [])
  const now = isoNow()
  const courseId = `course_${uid()}`
  const blockId = `block_${uid()}`
  const dialogue = parseDialogueSection(sections.DIALOGUE || [])
  const vocab = parseExpressionSection(sections.VOCAB || [], 'WORD', 'vocab')
  const chunks = parseExpressionSection(sections.CHUNKS || [], 'CHUNK', 'chunk')
  const patterns = parseExpressionSection(sections.PATTERNS || [], 'PATTERN', 'pattern')
  const usefulSentences = parseExpressionSection(sections.USEFUL_SENTENCES || [], 'SENTENCE', 'useful_sentence')
  const quickReaction = parseQuickReaction(sections.QUICK_REACTION || [])
  const semiControlledTalk = sections.SEMI_CONTROLLED_TALK ? parseSemiControlledTalk(sections.SEMI_CONTROLLED_TALK) : null
  const background = parseKeyValueLines(sections.BACKGROUND || [])
  const course = {
    id: courseId,
    userId,
    book: meta.BOOK || (meta.CONTENT_TYPE === 'General Topic' ? 'General Topics' : ''),
    level: meta.LEVEL || 'Beginner',
    unit: meta.UNIT || '',
    lesson: meta.LESSON || meta.TOPIC_NAME || '',
    title: meta.TITLE || meta.TOPIC_NAME || meta.LESSON || 'Untitled Course',
    type: meta.CONTENT_TYPE === 'General Topic' ? 'General Topic' : 'Textbook Unit',
    category: meta.CATEGORY || 'General',
    goal: meta.GOAL || '',
    topFolderId: '',
    subFolderId: '',
    active: false,
    createdAt: now,
    updatedAt: now
  }
  const contentBlock = {
    id: blockId,
    userId,
    courseId,
    type: meta.CONTENT_TYPE || 'Textbook Pack',
    title: meta.TITLE || dialogue.title || course.title,
    source: meta.SOURCE || '',
    order: 1,
    audioCacheStatus: 'not_cached',
    background,
    dialogue,
    expressions: [...vocab, ...chunks, ...patterns, ...usefulSentences],
    quickReaction,
    semiControlledTalk,
    createdAt: now,
    updatedAt: now
  }
  return {
    course,
    contentBlock,
    progress: makeProgress(courseId, userId),
    summary: {
      title: course.title,
      user: userId,
      contentType: contentBlock.type,
      dialogue: dialogue.lines.length ? 1 : 0,
      vocabulary: vocab.length,
      chunks: chunks.length,
      patterns: patterns.length,
      usefulSentences: usefulSentences.length,
      miniDialogues: contentBlock.expressions.reduce((sum, item) => sum + (item.miniDialogues?.length || 0), 0),
      quickReaction: quickReaction.length,
      semiControlledTalk: semiControlledTalk ? 1 : 0
    }
  }
}
function dueCards(cards) {
  const now = Date.now()
  return cards
    .filter(c => c.lastReviewAt && c.nextReviewAt && c.nextReviewAt <= now)
    .sort((a, b) => {
      const aWeak = a.status === 'Weak' ? -1 : 0
      const bWeak = b.status === 'Weak' ? -1 : 0
      if (aWeak !== bWeak) return aWeak - bWeak
      return (a.nextReviewAt || 0) - (b.nextReviewAt || 0)
    })
}
function startOfTomorrow(now = Date.now()) {
  const d = new Date(now)
  d.setHours(24, 0, 0, 0)
  return d.getTime()
}
function addDays(now, days) { return now + days * 24 * 60 * 60 * 1000 }
function reviewIntervalDays(level) {
  if (level <= 1) return 1
  if (level === 2) return 3
  if (level === 3) return 7
  if (level === 4) return 14
  if (level === 5) return 30
  return 60
}
function formatReviewDate(ts) {
  if (!ts) return 'Not scheduled'
  const d = new Date(ts)
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(ts); target.setHours(0,0,0,0)
  const diff = Math.round((target - today) / (24*60*60*1000))
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}
function countAudio(card) {
  if (['SENTENCE', 'DIALOGUE'].includes((card.type || '').toUpperCase())) {
    const lines = makeDialogue(card)
    const audios = Array.isArray(card.dialogueAudios) ? card.dialogueAudios : []
    const total = 1 + lines.length
    const ready = (card.contentAudio ? 1 : 0) + lines.filter((_, i) => audios[i]).length
    return { ready, total }
  }
  const total = 1 + (card.examples || []).length
  const ready = (card.contentAudio ? 1 : 0) + (card.examples || []).filter(x => x.audio).length
  return { ready, total }
}
function isReady(card) { const c = countAudio(card); return c.ready === c.total && c.total > 0 }
async function hasPlayableAudio(card) {
  const normalized = normalizeCard(card)
  if (!(await audioExists(normalized.contentAudio))) return false
  if (['SENTENCE', 'DIALOGUE'].includes((normalized.type || '').toUpperCase())) {
    const lines = makeDialogue(normalized)
    const dialogueAudios = Array.isArray(normalized.dialogueAudios) ? normalized.dialogueAudios : []
    for (let i = 0; i < lines.length; i++) {
      if (!(await audioExists(dialogueAudios[i]))) return false
    }
    return true
  }
  for (const ex of normalized.examples || []) {
    if (!(await audioExists(ex.audio))) return false
  }
  return true
}
function isInlineAudio(value) {
  return typeof value === 'string' && value.startsWith('data:audio')
}
function isAudioBlob(value) {
  return typeof Blob !== 'undefined' && value instanceof Blob
}
function isAudioRef(value) {
  return typeof value === 'string' && value.startsWith('idb:')
}
function audioRef(cardId, kind, index = 'main') {
  return `idb:${cardId}:${kind}:${index}`
}
let audioTrimTimer = null
function openAudioDb() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('Audio storage is unavailable.'))
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(AUDIO_DB_NAME, AUDIO_DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(AUDIO_STORE_NAME)) db.createObjectStore(AUDIO_STORE_NAME)
      if (!db.objectStoreNames.contains(AUDIO_META_STORE_NAME)) db.createObjectStore(AUDIO_META_STORE_NAME, { keyPath: 'key' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Audio storage failed.'))
  })
}
function audioStorageKey(ref) {
  return String(ref || '').replace(/^idb:/, '')
}
function estimateAudioBytes(audioData) {
  if (isAudioBlob(audioData)) return audioData.size || 0
  if (typeof audioData === 'string') return Math.ceil(audioData.length * 0.75)
  return 0
}
async function putStoredAudio(ref, audioData) {
  const db = await openAudioDb()
  return new Promise((resolve, reject) => {
    const stores = db.objectStoreNames.contains(AUDIO_META_STORE_NAME)
      ? [AUDIO_STORE_NAME, AUDIO_META_STORE_NAME]
      : [AUDIO_STORE_NAME]
    const tx = db.transaction(stores, 'readwrite')
    const key = audioStorageKey(ref)
    tx.objectStore(AUDIO_STORE_NAME).put(audioData, key)
    if (stores.includes(AUDIO_META_STORE_NAME)) {
      tx.objectStore(AUDIO_META_STORE_NAME).put({
        key,
        bytes: estimateAudioBytes(audioData),
        updatedAt: Date.now(),
        lastUsedAt: Date.now()
      })
    }
    tx.oncomplete = () => resolve(ref)
    tx.onerror = () => reject(tx.error || new Error('Audio save failed.'))
  })
}
async function touchStoredAudio(ref) {
  const db = await openAudioDb()
  if (!db.objectStoreNames.contains(AUDIO_META_STORE_NAME)) return
  const key = audioStorageKey(ref)
  return new Promise(resolve => {
    const tx = db.transaction(AUDIO_META_STORE_NAME, 'readwrite')
    const store = tx.objectStore(AUDIO_META_STORE_NAME)
    const request = store.get(key)
    request.onsuccess = () => {
      if (request.result) store.put({ ...request.result, lastUsedAt: Date.now() })
    }
    tx.oncomplete = resolve
    tx.onerror = resolve
  })
}
async function getStoredAudio(ref) {
  if (!isAudioRef(ref)) return ref || ''
  const db = await openAudioDb()
  return new Promise((resolve, reject) => {
    const request = db.transaction(AUDIO_STORE_NAME, 'readonly')
      .objectStore(AUDIO_STORE_NAME)
      .get(audioStorageKey(ref))
    request.onsuccess = () => {
      if (request.result) touchStoredAudio(ref).catch(() => {})
      resolve(request.result || '')
    }
    request.onerror = () => reject(request.error || new Error('Audio read failed.'))
  })
}
async function trimAudioCacheIfNeeded() {
  const db = await openAudioDb()
  if (!db.objectStoreNames.contains(AUDIO_META_STORE_NAME)) return
  const metas = await new Promise(resolve => {
    const request = db.transaction(AUDIO_META_STORE_NAME, 'readonly').objectStore(AUDIO_META_STORE_NAME).getAll()
    request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : [])
    request.onerror = () => resolve([])
  })
  let total = metas.reduce((sum, item) => sum + Number(item.bytes || 0), 0)
  if (total <= AUDIO_CACHE_SOFT_LIMIT_BYTES) return
  const remove = []
  for (const item of [...metas].sort((a, b) => Number(a.lastUsedAt || a.updatedAt || 0) - Number(b.lastUsedAt || b.updatedAt || 0))) {
    if (total <= AUDIO_CACHE_TARGET_BYTES) break
    remove.push(item.key)
    total -= Number(item.bytes || 0)
  }
  if (!remove.length) return
  await new Promise(resolve => {
    const tx = db.transaction([AUDIO_STORE_NAME, AUDIO_META_STORE_NAME], 'readwrite')
    const clips = tx.objectStore(AUDIO_STORE_NAME)
    const meta = tx.objectStore(AUDIO_META_STORE_NAME)
    remove.forEach(key => {
      clips.delete(key)
      meta.delete(key)
    })
    tx.oncomplete = resolve
    tx.onerror = resolve
  })
}
function scheduleAudioCacheTrim() {
  if (typeof window === 'undefined') return
  if (audioTrimTimer) window.clearTimeout(audioTrimTimer)
  audioTrimTimer = window.setTimeout(() => {
    trimAudioCacheIfNeeded().catch(err => console.warn('Audio cache trim failed.', err))
  }, 1000)
}
async function storeAudioClip(cardId, kind, index, audioData) {
  if (!audioData) return ''
  if (!isInlineAudio(audioData) && !isAudioBlob(audioData)) return audioData
  const ref = audioRef(cardId, kind, index)
  try {
    await putStoredAudio(ref, audioData)
    scheduleAudioCacheTrim()
    return ref
  } catch (err) {
    console.warn('IndexedDB audio save failed; falling back to inline audio.', err)
    return isAudioBlob(audioData) ? '' : audioData
  }
}
function playableAudioUrl(audioData) {
  if (!audioData) return ''
  if (isAudioBlob(audioData)) return URL.createObjectURL(audioData)
  return audioData
}
function releasePlayableAudio(audioUrl) {
  if (typeof audioUrl === 'string' && audioUrl.startsWith('blob:')) {
    try { URL.revokeObjectURL(audioUrl) } catch {}
  }
}
async function audioExists(value) {
  const audio = await resolveAudioClip(value)
  if (!audio) return false
  releasePlayableAudio(audio)
  return true
}
async function resolveAudioClip(value) {
  if (!value) return ''
  try {
    return playableAudioUrl(await getStoredAudio(value))
  } catch (err) {
    console.warn('IndexedDB audio read failed.', err)
    return ''
  }
}
async function migrateCardAudioToIndexedDb(card) {
  let changed = false
  const updated = normalizeCard(card)
  if (isInlineAudio(updated.contentAudio)) {
    const ref = await storeAudioClip(updated.id, 'content', 'main', updated.contentAudio)
    if (ref && ref !== updated.contentAudio) {
      updated.contentAudio = ref
      changed = true
    }
  }
  if (Array.isArray(updated.dialogueAudios)) {
    const dialogueAudios = [...updated.dialogueAudios]
    for (let i = 0; i < dialogueAudios.length; i++) {
      if (!isInlineAudio(dialogueAudios[i])) continue
      const ref = await storeAudioClip(updated.id, 'dialogue', i, dialogueAudios[i])
      if (ref && ref !== dialogueAudios[i]) {
        dialogueAudios[i] = ref
        changed = true
      }
    }
    updated.dialogueAudios = dialogueAudios
  }
  if (Array.isArray(updated.examples)) {
    const examples = []
    for (let i = 0; i < updated.examples.length; i++) {
      const ex = updated.examples[i]
      if (isInlineAudio(ex.audio)) {
        const ref = await storeAudioClip(updated.id, 'example', i, ex.audio)
        examples.push(ref && ref !== ex.audio ? { ...ex, audio: ref } : ex)
        if (ref && ref !== ex.audio) changed = true
      } else {
        examples.push(ex)
      }
    }
    updated.examples = examples
  }
  return { card: updated, changed }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
function updateSchedule(card, rating) {
  const now = Date.now()
  let reviewLevel = Number(card.reviewLevel || card.goodCount || 0)
  let goodCount = Number(card.goodCount || 0)
  let wrongCount = Number(card.wrongCount || 0)
  let status = card.status || 'New'
  let nextReviewAt = null

  if (rating === 'Again') {
    wrongCount += 1
    reviewLevel = Math.max(0, reviewLevel - 1)
    status = 'Weak'
    nextReviewAt = startOfTomorrow(now)
  } else {
    goodCount += 1
    reviewLevel = Math.min(6, reviewLevel + 1)
    status = reviewLevel >= 5 ? 'Mastered' : 'Learning'
    nextReviewAt = addDays(now, reviewIntervalDays(reviewLevel))
  }

  return {
    ...card,
    reviewLevel,
    goodCount,
    wrongCount,
    status,
    reviewCount: (card.reviewCount || 0) + 1,
    lastReviewAt: now,
    nextReviewAt,
    updatedAt: now
  }
}
function groupSources(cards) {
  const map = new Map()
  for (const card of cards) {
    const key = card.source || 'Uncategorized'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(card)
  }
  return [...map.entries()].map(([source, items]) => {
    const chunkCount = items.filter(x => matchesLearnType(x, 'CHUNKS')).length
    const sentenceCount = items.filter(x => cardType(x) === 'SENTENCE').length
    const patternCount = items.filter(x => cardType(x) === 'PATTERN').length
    const dialogueCount = items.filter(x => cardType(x) === 'DIALOGUE').length
    const ready = items.filter(isReady).length
    const categories = [...new Set(items.map(x => x.category || 'General'))]
    return { source, items, chunkCount, sentenceCount, patternCount, dialogueCount, ready, categories }
  }).sort((a, b) => a.source.localeCompare(b.source))
}
function makeDialogue(card) {
  const imported = Array.isArray(card.dialogue) ? card.dialogue.filter(x => (x.text || '').trim()) : []
  if (imported.length) return imported.map((line, idx) => {
    const parsed = splitEnglishChinese(line.text || line)
    return { id: line.id || `${card.id}-d${idx}`, text: cleanLineText(parsed.en), cn: line.cn || parsed.cn || '' }
  })
  return []
}
function parseDialogueLine(line) {
  const source = typeof line === 'string' ? { text: line, cn: '' } : (line || {})
  const parsed = splitEnglishChinese(source.text || '')
  const raw = cleanLineText(parsed.en)
  const rawCn = cleanLineText(source.cn || parsed.cn || '')
  const match = raw.match(/^\s*([A-Za-z][A-Za-z .'-]{0,30}|[A-Z])\s*[:：]\s*(.+)$/)
  const cnMatch = rawCn.match(/^\s*([^:：]{1,20})\s*[:：]\s*(.+)$/)
  if (!match) return { speaker: '', text: raw, cn: cnMatch ? cleanLineText(cnMatch[2]) : rawCn }
  return { speaker: cleanLineText(match[1]), text: cleanLineText(match[2]), cn: cnMatch ? cleanLineText(cnMatch[2]) : rawCn }
}
function dialogueAudioText(line) {
  return parseDialogueLine(line).text
}
function dialogueSpeaker(line) {
  return parseDialogueLine(line).speaker
}
function dialogueRoles(card) {
  const roles = makeDialogue(card).map(line => dialogueSpeaker(line.text || line)).filter(Boolean)
  return [...new Set(roles)].slice(0, 6)
}
function isAutoGeneratedDialogue(card) {
  if (!['SENTENCE', 'DIALOGUE'].includes((card.type || '').toUpperCase())) return false
  const lines = Array.isArray(card.dialogue) ? card.dialogue.map(x => cleanLineText(x.text || x)) : []
  if (!lines.length) return false
  const content = cleanLineText(card.content || '')
  if (/^When do you use this sentence\?$/i.test(lines[0]) || /^Can you answer this question\?$/i.test(lines[0])) return true
  if (lines.length !== 3) return false
  return (
    /^When do you use this sentence\?$/i.test(lines[0]) ||
    /^Can you answer this question\?$/i.test(lines[0])
  ) && cleanLineText(lines[1]) === content && /^I can say:/i.test(lines[2])
}
function sameDialogueLines(a = [], b = []) {
  const left = a.map(x => cleanLineText(x.text || x)).filter(Boolean)
  const right = b.map(x => cleanLineText(x.text || x)).filter(Boolean)
  if (left.length !== right.length) return false
  return left.every((line, index) => line === right[index])
}
function cardType(cardOrType) {
  return String(typeof cardOrType === 'string' ? cardOrType : cardOrType?.type || 'CHUNK').toUpperCase()
}
function chunkLabel(type) {
  const t = cardType(type)
  if (t === 'SENTENCE') return 'Sentence'
  if (t === 'PATTERN') return 'Pattern'
  if (t === 'DIALOGUE') return 'Mini Dialogue'
  return 'Chunk'
}
function matchesLearnType(card, learnType) {
  const t = cardType(card)
  if (learnType === 'CHUNKS') return t === 'CHUNK' || t === 'WORD'
  if (learnType === 'SENTENCES') return t === 'SENTENCE'
  if (learnType === 'PATTERNS') return t === 'PATTERN'
  if (learnType === 'DIALOGUES') return t === 'DIALOGUE'
  return true
}
function stageText(card) {
  const tags = Array.isArray(card?.tags) ? card.tags.join(' ') : (card?.tags || '')
  return `${card?.category || ''} ${tags} ${card?.content || ''}`
}
function isOutputPracticeCard(card) {
  return /output|speaking|practice|controlled|semi|question|answer|输出|练习|回答|口语/i.test(stageText(card))
}
const THEME_STAGES = [
  { id: 'DIALOGUE', number: '1', title: 'Theme Dialogue', caption: '主题对话学习', learnType: 'DIALOGUES', mode: 'LISTEN' },
  { id: 'CHUNKS', number: '2', title: 'Words & Chunks', caption: '词汇和高频语块', learnType: 'CHUNKS', mode: 'LISTEN' },
  { id: 'PATTERNS', number: '3', title: 'Pattern Drill', caption: '句型自动化', learnType: 'PATTERNS', mode: 'RECALL' },
  { id: 'SENTENCES', number: '4', title: 'Useful Sentences', caption: '实用句子训练', learnType: 'SENTENCES', mode: 'RECALL' },
  { id: 'OUTPUT', number: '5', title: 'Output Practice', caption: '半控制输出', learnType: 'SENTENCES', mode: 'RECALL' }
]
function countStageCards(stageId, list) {
  return stageCardsFor(stageId, list).length
}
function stageCardsFor(stageId, list) {
  const items = Array.isArray(list) ? list : []
  if (stageId === 'DIALOGUE') return items.filter(c => cardType(c) === 'DIALOGUE')
  if (stageId === 'CHUNKS') return items.filter(c => matchesLearnType(c, 'CHUNKS'))
  if (stageId === 'PATTERNS') return items.filter(c => cardType(c) === 'PATTERN')
  if (stageId === 'SENTENCES') return items.filter(c => cardType(c) === 'SENTENCE' && !isOutputPracticeCard(c))
  if (stageId === 'OUTPUT') {
    const outputItems = items.filter(c => cardType(c) === 'SENTENCE' && isOutputPracticeCard(c))
    return outputItems.length ? outputItems : items.filter(c => cardType(c) === 'SENTENCE')
  }
  return items
}
function buildStageSixPrompt(sourceName, list) {
  const items = Array.isArray(list) ? list : []
  const dialogues = items.filter(c => cardType(c) === 'DIALOGUE').slice(0, 5).map(c => `- ${c.content}${c.meaning ? ` = ${c.meaning}` : ''}`).join('\n') || '- 暂无'
  const chunks = items.filter(c => matchesLearnType(c, 'CHUNKS')).slice(0, 18).map(c => `- ${c.content}${c.meaning ? ` = ${c.meaning}` : ''}`).join('\n') || '- 暂无'
  const patterns = items.filter(c => cardType(c) === 'PATTERN').slice(0, 10).map(c => `- ${c.content}${c.meaning ? ` = ${c.meaning}` : ''}`).join('\n') || '- 暂无'
  const sentences = items.filter(c => cardType(c) === 'SENTENCE' && !isOutputPracticeCard(c)).slice(0, 18).map(c => `- ${c.content}${c.meaning ? ` = ${c.meaning}` : ''}`).join('\n') || '- 暂无'
  return `请你作为学习者的 A2 英语口语陪练，和学习者做一次真实模拟对话。

主题范围：
${sourceName || '当前主题'}

学习者背景：
- 学习者住在澳大利亚
- 英语大约 A2
- 目标是能在真实生活中自然回应
- 请使用简单、自然、常见的英文

本课已学内容：
主题对话：
${dialogues}

核心词汇和语块：
${chunks}

重点句型：
${patterns}

实用句子：
${sentences}

对话规则：
1. 请一次只问学习者一个问题。
2. 优先使用上面学过的词汇、语块、句型和句子。
3. 不要使用太难、太复杂、超出 A2 很多的表达。
4. 如果学习者不会回答，请给一个简单提示，不要马上换话题。
5. 如果学习者回答不自然，请给一个更自然的 A2 版本，并让学习者跟读。
6. 对话逐步从简单到稍微自由。
7. 结束后，请用中文给简单反馈，并列出 5 个值得复习的英文表达。`
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { crashed: false, message: '' }
  }
  static getDerivedStateFromError(error) {
    return { crashed: true, message: String(error?.message || error || 'Unknown error') }
  }
  componentDidCatch(error) {
    console.error('App crashed but recovered with fallback screen.', error)
  }
  reloadApp = () => window.location.reload()
  resetAudioCache = async () => {
    try {
      if (typeof indexedDB !== 'undefined') indexedDB.deleteDatabase(AUDIO_DB_NAME)
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map(key => caches.delete(key)))
      }
    } catch {}
    window.location.reload()
  }
  render() {
    if (!this.state.crashed) return this.props.children
    return <div className="screen fatalScreen">
      <section className="fatalPanel">
        <h1>App needs a refresh</h1>
        <p>Audio cache or browser memory caused a temporary crash. Your learning text is kept.</p>
        <small>{this.state.message}</small>
        <div className="fatalActions">
          <button className="primary" onClick={this.reloadApp}>Reload</button>
          <button className="secondary" onClick={this.resetAudioCache}>Clear Audio Cache</button>
        </div>
      </section>
    </div>
  }
}

function App() {
  const [tab, setTab] = useState('learn')
  const [learnSubTab, setLearnSubTab] = useState('overview')
  const [practiceSubTab, setPracticeSubTab] = useState('quick_response')
  const [outputSubTab, setOutputSubTab] = useState('overview')
  const [reviewSubTab, setReviewSubTab] = useState('today')
  const [librarySubTab, setLibrarySubTab] = useState('courses')
  const [accountProfiles, setAccountProfiles] = useState(() => load(ACCOUNT_PROFILES_KEY, []))
  const [sessionAccountId, setSessionAccountId] = useState(() => load(ACCOUNT_SESSION_KEY, ''))
  const [accountDraft, setAccountDraft] = useState({ name: '', pin: '' })
  const [accountError, setAccountError] = useState('')
  const activeAccount = useMemo(() => accountProfiles.find(item => item.id === sessionAccountId) || null, [accountProfiles, sessionAccountId])
  const [cards, setCards] = useState([])
  const [v2Store, setV2Store] = useState(() => defaultV2Store([]))
  const [settings, setSettings] = useState({ ...defaultSettings })
  const [queue, setQueue] = useState([])
  const [accountDataReady, setAccountDataReady] = useState(false)
  const [importText, setImportText] = useState(sampleText)
  const [importMeta, setImportMeta] = useState({ source: 'English File Unit 3', category: 'Daily Life', type: 'AUTO', tagsText: 'daily-life' })
  const [importMsg, setImportMsg] = useState('')
  const [libraryMode, setLibraryMode] = useState('list')
  const [addContentMode, setAddContentMode] = useState('')
  const [libraryOrganizerOpen, setLibraryOrganizerOpen] = useState(false)
  const [audioImportMeta, setAudioImportMeta] = useState({ book: '', level: 'Beginner', unit: '1', lesson: '', title: '' })
  const [audioImportFile, setAudioImportFile] = useState(null)
  const [audioImportDataUrl, setAudioImportDataUrl] = useState('')
  const [audioImportResult, setAudioImportResult] = useState(null)
  const [audioImportTraining, setAudioImportTraining] = useState(null)
  const [audioImportStepMsg, setAudioImportStepMsg] = useState('')
  const [audioImportBusy, setAudioImportBusy] = useState(false)
  const [lineAdjustState, setLineAdjustState] = useState({ open: false, lineId: '' })
  const [query, setQuery] = useState('')
  const [libraryCategory, setLibraryCategory] = useState('ALL')
  const [learnType, setLearnType] = useState('CHUNKS')
  const [trainingStage, setTrainingStage] = useState('CHUNKS')
  const [learnMode, setLearnMode] = useState('NEW')
  const [learnSource, setLearnSource] = useState('ALL')
  const [learnScope, setLearnScope] = useState('CURRENT')
  const [stageListOpen, setStageListOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [sourceView, setSourceView] = useState(null)
  const [editing, setEditing] = useState(null)
  const [audioBusy, setAudioBusy] = useState(false)
  const [audioMsg, setAudioMsg] = useState('')
  const [playingId, setPlayingId] = useState(null)
  const [lastAudioClip, setLastAudioClip] = useState(null)
  const [showChinese, setShowChinese] = useState(true)
  const [recallShown, setRecallShown] = useState(false)
  const [dialogueRecallIndex, setDialogueRecallIndex] = useState(0)
  const [spellingAnswer, setSpellingAnswer] = useState('')
  const [spellingResult, setSpellingResult] = useState('')
  const [sentenceDraft, setSentenceDraft] = useState('')
  const [isListPlaying, setIsListPlaying] = useState(false)
  const [rolePlayRole, setRolePlayRole] = useState('')
  const [v2PracticeRole, setV2PracticeRole] = useState('')
  const [isRolePlaying, setIsRolePlaying] = useState(false)
  const [sectionPlaying, setSectionPlaying] = useState('')
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('')
  const [expressionTab, setExpressionTab] = useState('vocab')
  const [learnDialogueMode, setLearnDialogueMode] = useState('listen')
  const [learnExpressionFilter, setLearnExpressionFilter] = useState('all')
  const [learnRoleRevealMap, setLearnRoleRevealMap] = useState({})
  const [learnSavedMap, setLearnSavedMap] = useState({})
  const [learnPracticeAddedMap, setLearnPracticeAddedMap] = useState({})
  const [learnReviewAddedMap, setLearnReviewAddedMap] = useState({})
  const [reactionAnswerVisible, setReactionAnswerVisible] = useState({})
  const [guidedDrafts, setGuidedDrafts] = useState({})
  const [spellingMode, setSpellingMode] = useState('copy')
  const [spellingSourceType, setSpellingSourceType] = useState('vocab')
  const [spellingFocusMode, setSpellingFocusMode] = useState('all')
  const [spellingItemIndex, setSpellingItemIndex] = useState(0)
  const [spellingDraft, setSpellingDraft] = useState('')
  const [spellingFeedback, setSpellingFeedback] = useState('')
  const [spellingStats, setSpellingStats] = useState({})
  const [spellingStarred, setSpellingStarred] = useState({})
  const [reactionMode, setReactionMode] = useState('cn_to_en')
  const [reactionAutoNext, setReactionAutoNext] = useState(false)
  const [reactionIndex, setReactionIndex] = useState(0)
  const [reactionReveal, setReactionReveal] = useState(false)
  const [guidedTurnIndex, setGuidedTurnIndex] = useState(0)
  const [outputDraft, setOutputDraft] = useState('')
  const [recordingTarget, setRecordingTarget] = useState('')
  const [recordingTranscript, setRecordingTranscript] = useState('')
  const [recordingError, setRecordingError] = useState('')
  const currentAudioRef = useRef(null)
  const audioContextRef = useRef(null)
  const currentBufferSourceRef = useRef(null)
  const recognitionRef = useRef(null)
  const recognitionCommitRef = useRef(null)
  const recordingTranscriptRef = useRef('')
  const runRef = useRef(0)
  const starterSeedRef = useRef(false)

  useEffect(() => { save(ACCOUNT_PROFILES_KEY, accountProfiles) }, [accountProfiles])
  useEffect(() => { save(ACCOUNT_SESSION_KEY, sessionAccountId) }, [sessionAccountId])
  useEffect(() => {
    if (!activeAccount?.id) {
      setCards([])
      setQueue([])
      setSettings({ ...defaultSettings })
      setV2Store(defaultV2Store([]))
      setAccountDataReady(false)
      return
    }
    const scopedCardKey = scopedStorageKey(CARD_KEY, activeAccount.id)
    const scopedV2Key = scopedStorageKey(V2_STORE_KEY, activeAccount.id)
    const scopedSettingsKey = scopedStorageKey(SETTINGS_KEY, activeAccount.id)
    const scopedQueueKey = scopedStorageKey(QUEUE_KEY, activeAccount.id)
    const loadedCards = load(scopedCardKey, []).map(normalizeCard)
    const loadedStore = normalizeV2Store(load(scopedV2Key, null), loadedCards)
    const scopedUserId = activeAccount.userId || activeAccount.id
    if (!loadedStore.users.some(user => user.id === scopedUserId)) {
      loadedStore.users = [...loadedStore.users, {
        id: scopedUserId,
        name: activeAccount.name || '用户',
        level: 'Beginner',
        defaultVoice: 'nova',
        createdAt: isoNow()
      }]
    } else {
      loadedStore.users = loadedStore.users.map(user => user.id === scopedUserId ? { ...user, name: activeAccount.name || user.name || '用户' } : user)
    }
    loadedStore.activeUserId = scopedUserId
    if (!loadedStore.activeCourseId || !loadedStore.courses.some(item => item.id === loadedStore.activeCourseId && item.userId === scopedUserId)) {
      loadedStore.activeCourseId = loadedStore.courses.find(item => item.userId === scopedUserId)?.id || ''
    }
    const rawSettings = { ...defaultSettings, ...load(scopedSettingsKey, {}) }
    setCards(loadedCards)
    setV2Store(loadedStore)
    setSettings({ ...rawSettings, voiceRoles: normalizeVoiceRoles(rawSettings.voiceRoles) })
    setQueue(load(scopedQueueKey, []))
    setAccountDataReady(true)
    starterSeedRef.current = false
  }, [activeAccount?.id])
  useEffect(() => {
    if (!activeAccount?.id || !accountDataReady) return
    save(scopedStorageKey(CARD_KEY, activeAccount.id), cards)
  }, [cards, activeAccount?.id, accountDataReady])
  useEffect(() => {
    if (!activeAccount?.id || !accountDataReady) return
    save(scopedStorageKey(V2_STORE_KEY, activeAccount.id), v2Store)
  }, [v2Store, activeAccount?.id, accountDataReady])
  useEffect(() => {
    if (!activeAccount?.id || !accountDataReady) return
    save(scopedStorageKey(SETTINGS_KEY, activeAccount.id), settings)
  }, [settings, activeAccount?.id, accountDataReady])
  useEffect(() => {
    if (!activeAccount?.id || !accountDataReady) return
    save(scopedStorageKey(QUEUE_KEY, activeAccount.id), queue)
  }, [queue, activeAccount?.id, accountDataReady])
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.update?.()
    }).catch(() => {})
  }, [])
  useEffect(() => {
    setRecallShown(false)
    setDialogueRecallIndex(0)
    setSpellingAnswer('')
    setSpellingResult('')
    setSentenceDraft('')
  }, [selected?.id, settings.studyMode])
  useEffect(() => {
    let cancelled = false
    async function migrateAudio() {
      const next = []
      let changed = false
      for (const card of cards) {
        const result = await migrateCardAudioToIndexedDb(card)
        if (cancelled) return
        next.push(result.card)
        if (result.changed) {
          changed = true
          await sleep(30)
        }
      }
      if (changed && !cancelled) {
        setCards(next)
        setAudioMsg('Audio storage optimized for iPhone ✅')
      }
    }
    migrateAudio().catch(err => console.warn('Audio migration skipped.', err))
    return () => { cancelled = true }
  }, [])
  useEffect(() => () => {
    try { recognitionRef.current?.abort?.() } catch {}
    recognitionRef.current = null
    recognitionCommitRef.current = null
  }, [])

  const due = useMemo(() => dueCards(cards), [cards])
  const parsedImportCards = useMemo(() => parseImportText(importText, {
    source: importMeta.source,
    category: importMeta.category,
    type: importMeta.type,
    tags: parseTags(importMeta.tagsText)
  }), [importText, importMeta])
  const importPreview = useMemo(() => {
    const existing = new Set(cards.map(importKey))
    const seen = new Set()
    let fresh = 0
    let updated = 0
    let repeated = 0
    let chunks = 0
    let sentences = 0
    let patterns = 0
    let dialogues = 0
    const sources = new Set()
    const categories = new Set()
    for (const card of parsedImportCards) {
      const key = importKey(card)
      if (seen.has(key)) {
        repeated += 1
        continue
      }
      seen.add(key)
      if (existing.has(key)) updated += 1
      else fresh += 1
      if (cardType(card) === 'SENTENCE') sentences += 1
      else if (cardType(card) === 'PATTERN') patterns += 1
      else if (cardType(card) === 'DIALOGUE') dialogues += 1
      else chunks += 1
      if (card.source) sources.add(card.source)
      if (card.category) categories.add(card.category)
    }
    return {
      total: parsedImportCards.length,
      fresh,
      updated,
      repeated,
      chunks,
      sentences,
      patterns,
      dialogues,
      sources: [...sources],
      categories: [...categories],
      samples: parsedImportCards.slice(0, 3)
    }
  }, [cards, parsedImportCards])
  const parsedV2Import = useMemo(() => parseMandyV2CourseText(importText, v2Store.activeUserId), [importText, v2Store.activeUserId])
  const displayMode = settings.subtitleMode || 'BOTH'
  const activeUser = useMemo(() => v2Store.users.find(user => user.id === v2Store.activeUserId) || v2Store.users[0] || V2_USERS[0], [v2Store])
  const v2Folders = useMemo(() => v2Store.folders.filter(folder => folder.userId === v2Store.activeUserId), [v2Store])
  const topFolders = useMemo(() => v2Folders.filter(folder => !folder.parentId), [v2Folders])
  const subFolders = useMemo(() => v2Folders.filter(folder => folder.parentId), [v2Folders])
  const v2Courses = useMemo(() => v2Store.courses.filter(course => course.userId === v2Store.activeUserId), [v2Store])
  const activeCourse = useMemo(() => v2Courses.find(course => course.id === v2Store.activeCourseId) || v2Courses[0] || null, [v2Courses, v2Store.activeCourseId])
  const activeBlocks = useMemo(() => activeCourse ? v2Store.contentBlocks.filter(block => block.courseId === activeCourse.id && block.userId === activeCourse.userId).sort((a, b) => (a.order || 0) - (b.order || 0)) : [], [activeCourse, v2Store.contentBlocks])
  const activeProgress = useMemo(() => activeCourse ? v2Store.progress.find(item => item.courseId === activeCourse.id && item.userId === activeCourse.userId) || makeProgress(activeCourse.id, activeCourse.userId) : null, [activeCourse, v2Store.progress])
  const activeBlock = activeBlocks[0] || null
  const activeExpressions = activeBlocks.flatMap(block => block.expressions || [])
  const activeDialogueEntries = useMemo(() => activeBlocks.flatMap(block => (block.dialogue?.lines || []).map(line => ({ line, block }))), [activeBlocks])
  const activeDialogueLines = activeDialogueEntries.map(item => item.line)
  const activeDialogueLookup = useMemo(() => {
    const lookup = {}
    activeDialogueEntries.forEach(item => { lookup[item.line.id] = item })
    return lookup
  }, [activeDialogueEntries])
  const dialogueRoleNames = useMemo(() => [...new Set(activeDialogueLines.map(line => cleanLineText(line.role || '')).filter(Boolean))], [activeDialogueLines])
  const activeDialogueRoles = useMemo(() => [...new Set(activeDialogueLines.map(line => cleanLineText(line.role || '')).filter(Boolean))], [activeDialogueLines])
  const voiceRoles = useMemo(() => normalizeVoiceRoles(settings.voiceRoles), [settings.voiceRoles])
  const activeQuickReaction = useMemo(() => (
    activeBlocks.flatMap(block => block.quickReaction || []).map(item => {
      const promptRaw = cleanLineText(item?.prompt || '')
      const promptCn = cleanLineText(item?.promptCn || (containsChineseText(promptRaw) ? promptRaw : ''))
      const promptEn = cleanLineText(item?.promptEn || (promptRaw && !containsChineseText(promptRaw) ? promptRaw : '') || item?.answer || item?.answerEn || '')
      return {
        ...item,
        prompt: promptCn || promptEn,
        promptEn,
        promptCn,
        answer: cleanLineText(item?.answer || item?.answerEn || ''),
        hint: cleanLineText(item?.hint || '')
      }
    })
  ), [activeBlocks])
  const conversationReactionItems = useMemo(() => {
    const toPairs = (lines = [], idPrefix = 'conversation') => {
      const rows = lines.filter(line => cleanLineText(line?.text || ''))
      const pairs = []
      for (let i = 0; i < rows.length - 1; i++) {
        const promptLine = rows[i]
        const answerLine = rows[i + 1]
        const promptEn = cleanLineText(promptLine.text || '')
        const answerEn = cleanLineText(answerLine.text || '')
        if (!promptEn || !answerEn) continue
        const speakerA = cleanLineText(promptLine.role || '') || 'A'
        const speakerB = cleanLineText(answerLine.role || '') || (speakerA.toUpperCase() === 'A' ? 'B' : 'A')
        pairs.push({
          id: `${idPrefix}:${promptLine.id || i}:${answerLine.id || i + 1}`,
          prompt: cleanLineText(promptLine.translation || '') || promptEn,
          promptEn,
          promptCn: cleanLineText(promptLine.translation || ''),
          hint: '',
          answer: answerEn,
          answerCn: cleanLineText(answerLine.translation || ''),
          speakerA,
          speakerB,
          audioAssetId: cleanLineText(promptLine.audioAssetId || ''),
          order: pairs.length + 1
        })
      }
      return pairs.slice(0, 12)
    }
    const dialoguePairs = toPairs(activeDialogueLines, 'dialogue-reaction')
    if (dialoguePairs.length) return dialoguePairs
    const usefulMiniLines = activeExpressions
      .filter(item => item.type === 'useful_sentence')
      .flatMap(item => (item.miniDialogues || []).flatMap(group => group.lines || []))
    return toPairs(usefulMiniLines, 'mini-reaction')
  }, [activeDialogueLines, activeExpressions])
  const activeReactionItems = reactionMode === 'conversation' ? conversationReactionItems : activeQuickReaction
  const activeTalk = activeBlocks.find(block => block.semiControlledTalk)?.semiControlledTalk || null
  const expressionGroups = useMemo(() => ({
    vocab: activeExpressions.filter(item => item.type === 'vocab'),
    chunk: activeExpressions.filter(item => item.type === 'chunk'),
    pattern: activeExpressions.filter(item => item.type === 'pattern'),
    useful_sentence: activeExpressions.filter(item => item.type === 'useful_sentence')
  }), [activeExpressions])
  const spellingPool = useMemo(() => {
    const expressionPool = {
      vocab: expressionGroups.vocab.map(item => ({ id: item.id, text: cleanLineText(item.text || ''), meaning: cleanLineText(item.meaning || ''), type: 'vocab' })).filter(item => item.text),
      chunk: expressionGroups.chunk.map(item => ({ id: item.id, text: cleanLineText(item.text || ''), meaning: cleanLineText(item.meaning || ''), type: 'chunk' })).filter(item => item.text),
      sentence: expressionGroups.useful_sentence.map(item => ({ id: item.id, text: cleanLineText(item.text || ''), meaning: cleanLineText(item.meaning || ''), type: 'sentence' })).filter(item => item.text),
      dialogue: activeDialogueLines.map(line => ({ id: line.id, text: cleanLineText(line.text || ''), meaning: cleanLineText(line.translation || ''), type: 'dialogue' })).filter(item => item.text)
    }
    const basePool = expressionPool[spellingSourceType] || []
    if (spellingFocusMode === 'all') return basePool
    if (spellingFocusMode === 'starred') return basePool.filter(item => spellingStarred[item.id])
    if (spellingFocusMode === 'wrong_before') return basePool.filter(item => Number(spellingStats[item.id]?.wrong || 0) > 0)
    if (spellingFocusMode === 'weak_items') return basePool.filter(item => {
      const stats = spellingStats[item.id] || { wrong: 0, correct: 0 }
      return Number(stats.wrong || 0) >= 2 || Number(stats.wrong || 0) > Number(stats.correct || 0)
    })
    return basePool
  }, [activeDialogueLines, expressionGroups, spellingSourceType, spellingFocusMode, spellingStarred, spellingStats])
  const activeSpellingItem = spellingPool[Math.min(spellingItemIndex, Math.max(0, spellingPool.length - 1))] || null
  const activeQuickReactionItem = activeReactionItems[Math.min(reactionIndex, Math.max(0, activeReactionItems.length - 1))] || null
  const activeGuidedTurns = activeTalk?.turns || []
  const activeGuidedTurn = activeGuidedTurns[Math.min(guidedTurnIndex, Math.max(0, activeGuidedTurns.length - 1))] || null
  const speechInputSupported = useMemo(() => {
    if (typeof window === 'undefined') return false
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  }, [])
  useEffect(() => {
    if (!accountDataReady || !activeAccount?.userId) return
    if (starterSeedRef.current) return
    if (v2Store.courses.length) return
    const parsedList = STARTER_V2_COURSES
      .map(text => parseMandyV2CourseText(text, activeAccount.userId))
      .filter(Boolean)
    if (!parsedList.length) return
    starterSeedRef.current = true
    const activeCourseId = parsedList[0]?.course?.id || ''
    updateV2Store(prev => ({
      ...prev,
      activeUserId: activeAccount.userId,
      activeCourseId,
      activePracticeStep: 'background',
      courses: [
        ...parsedList.map((item, index) => ({ ...item.course, active: index === 0 })),
        ...prev.courses.map(course => ({ ...course, active: false }))
      ],
      contentBlocks: [...parsedList.map(item => item.contentBlock), ...prev.contentBlocks],
      progress: [...parsedList.map(item => item.progress), ...prev.progress],
      reviewItems: prev.reviewItems
    }))
    setImportMsg(`Starter V2 courses loaded: ${parsedList.length}.`)
  }, [v2Store.courses.length, accountDataReady, activeAccount?.userId])
  useEffect(() => {
    setReactionAnswerVisible({})
    setReactionIndex(0)
    setReactionReveal(false)
    setGuidedDrafts({})
    setGuidedTurnIndex(0)
    setLearnDialogueMode('listen')
    setLearnExpressionFilter('all')
    setLearnRoleRevealMap({})
    setLearnSavedMap({})
    setLearnPracticeAddedMap({})
    setLearnReviewAddedMap({})
    setSpellingItemIndex(0)
    setSpellingDraft('')
    setSpellingFeedback('')
    const stepToExpression = {
      vocabulary: 'vocab',
      chunks: 'chunk',
      patterns: 'pattern',
      useful_sentences: 'useful_sentence'
    }
    const stepToSpelling = {
      vocabulary: 'vocab',
      chunks: 'chunk',
      useful_sentences: 'sentence',
      dialogue: 'dialogue',
      shadowing: 'dialogue'
    }
    if (stepToExpression[v2Store.activePracticeStep]) setExpressionTab(stepToExpression[v2Store.activePracticeStep])
    if (stepToSpelling[v2Store.activePracticeStep]) setSpellingSourceType(stepToSpelling[v2Store.activePracticeStep])
  }, [activeCourse?.id, v2Store.activePracticeStep])
  useEffect(() => {
    if (!audioImportTraining?.dialogueCn?.length) return
    setAudioImportResult(prev => {
      if (!prev?.lines?.length) return prev
      return {
        ...prev,
        lines: prev.lines.map((line, index) => ({ ...line, translation: audioImportTraining.dialogueCn[index] || line.translation || '' }))
      }
    })
  }, [audioImportTraining?.dialogueCn])
  useEffect(() => {
    setReactionIndex(index => Math.min(index, Math.max(0, activeReactionItems.length - 1)))
  }, [activeReactionItems.length, reactionMode])
  useEffect(() => {
    if (!activeDialogueRoles.length) {
      if (v2PracticeRole) setV2PracticeRole('')
      return
    }
    if (!v2PracticeRole || !activeDialogueRoles.includes(v2PracticeRole)) {
      setV2PracticeRole(activeDialogueRoles[0])
    }
  }, [activeDialogueRoles, v2PracticeRole])
  useEffect(() => {
    if (!activeCourse) return
    const syncStep = (stepId) => {
      if (!stepId) return
      if (v2Store.activePracticeStep === stepId) return
      setPracticeStepOnly(stepId)
    }
    if (tab === 'learn') {
      if (learnSubTab === 'background') syncStep('background')
      if (learnSubTab === 'dialogue') syncStep('dialogue')
      if (learnSubTab === 'expressions') syncStep('vocabulary')
    }
    if (tab === 'practice') {
      if (practiceSubTab === 'quick_response') syncStep('reaction')
      if (practiceSubTab === 'spelling') syncStep('spelling')
      if (practiceSubTab === 'substitution') syncStep('patterns')
      if (practiceSubTab === 'completion') syncStep('guided')
    }
    if (tab === 'output') {
      if (outputSubTab === 'guided') syncStep('guided')
      if (outputSubTab === 'role_play') syncStep('dialogue')
    }
  }, [tab, learnSubTab, practiceSubTab, outputSubTab, activeCourse?.id, v2Store.activePracticeStep])
  useEffect(() => {
    if (tab !== 'library') return
    if (librarySubTab === 'import') {
      if (libraryMode !== 'paste') setLibraryMode('paste')
      return
    }
    if (libraryMode !== 'list') setLibraryMode('list')
    if (librarySubTab === 'folders' && !libraryOrganizerOpen) setLibraryOrganizerOpen(true)
    if (librarySubTab !== 'folders' && libraryOrganizerOpen) setLibraryOrganizerOpen(false)
    if (librarySubTab !== 'courses') {
      if (sourceView) setSourceView(null)
      if (editing) setEditing(null)
    }
  }, [tab, librarySubTab, libraryMode, libraryOrganizerOpen, sourceView, editing])
  const sources = useMemo(() => groupSources(cards), [cards])
  const libraryCategories = useMemo(() => ['ALL', ...new Set(sources.flatMap(s => s.categories).filter(Boolean))], [sources])
  const queueCards = useMemo(() => queue.map(id => cards.find(c => c.id === id)).filter(Boolean), [queue, cards])
  const currentSourceName = useMemo(() => {
    if (learnSource && learnSource !== 'ALL' && sources.some(s => s.source === learnSource)) return learnSource
    return sources[0]?.source || ''
  }, [learnSource, sources])
  useEffect(() => {
    if (sources.length && (!learnSource || learnSource === 'ALL' || !sources.some(s => s.source === learnSource))) {
      setLearnSource(sources[0].source)
    }
  }, [sources, learnSource])
  const learnBaseCards = useMemo(() => {
    if (learnMode === 'REVIEW') return due
    if (learnScope === 'QUEUE') return queueCards
    return cards.filter(c => c.source === currentSourceName)
  }, [cards, currentSourceName, due, learnMode, learnScope, queueCards])
  const themeStageCounts = useMemo(() => Object.fromEntries(THEME_STAGES.map(stage => [stage.id, countStageCards(stage.id, learnBaseCards)])), [learnBaseCards])
  const visibleLearnCards = useMemo(() => learnMode === 'REVIEW' ? learnBaseCards : stageCardsFor(trainingStage, learnBaseCards), [learnBaseCards, learnMode, trainingStage])
  const activeStage = useMemo(() => THEME_STAGES.find(stage => stage.id === trainingStage) || THEME_STAGES[0], [trainingStage])

  function saveAllSettings() {
    const normalized = { ...settings, voiceRoles: normalizeVoiceRoles(settings.voiceRoles) }
    setSettings(normalized)
    if (activeAccount?.id) save(scopedStorageKey(SETTINGS_KEY, activeAccount.id), normalized)
    setSettingsSavedMsg('Settings saved ✅')
    setTimeout(() => setSettingsSavedMsg(''), 1800)
  }
  function updateV2Store(updater) {
    setV2Store(prev => normalizeV2Store(typeof updater === 'function' ? updater(prev) : updater, cards))
  }
  function loginOrCreateAccount() {
    const name = cleanLineText(accountDraft.name)
    const pin = cleanLineText(accountDraft.pin)
    if (!name || !pin) {
      setAccountError('请输入账号名称和密码。')
      return
    }
    const exists = accountProfiles.find(item => item.name.toLowerCase() === name.toLowerCase())
    if (exists) {
      if (exists.pin !== pin) {
        setAccountError('密码不正确。')
        return
      }
      setSessionAccountId(exists.id)
      setAccountError('')
      return
    }
    if (accountProfiles.length >= MAX_ACCOUNTS) {
      setAccountError('最多支持 2 个账户。请先使用已有账户登录。')
      return
    }
    const newProfile = {
      id: safeAccountSlug(`${name}_${uid()}`),
      name,
      pin,
      userId: `user_${safeAccountSlug(name)}`,
      createdAt: isoNow()
    }
    setAccountProfiles(prev => [...prev, newProfile])
    setSessionAccountId(newProfile.id)
    setAccountError('')
  }
  function logoutAccount() {
    stopAllAudio()
    setSessionAccountId('')
    setAccountDraft({ name: '', pin: '' })
    setAccountError('')
  }
  function selectV2Course(courseId, nextTab = 'practice') {
    const course = v2Store.courses.find(item => item.id === courseId)
    if (!course) return
    stopAllAudio()
    updateV2Store(prev => ({
      ...prev,
      activeUserId: course.userId,
      activeCourseId: courseId,
      activePracticeStep: prev.activePracticeStep || 'background',
      progress: prev.progress.some(item => item.courseId === courseId)
        ? prev.progress
        : [...prev.progress, makeProgress(courseId, course.userId)]
    }))
    if (course.legacySource) {
      setLearnSource(course.legacySource)
      setLearnScope('CURRENT')
    }
    setSelected(null)
    setSourceView(null)
    setLibraryMode('list')
    setTab(nextTab)
  }
  function normalizeProgressStatus(value) {
    return ['not_started', 'current', 'done'].includes(value) ? value : 'not_started'
  }
  function patchProgressForStep(progressItem, stepId, markCurrentAsDone = true) {
    const next = { ...progressItem }
    for (const step of PRACTICE_STEPS) {
      const id = step.id
      next[id] = normalizeProgressStatus(next[id])
      if (id === stepId) {
        next[id] = 'current'
      } else if (markCurrentAsDone && next[id] === 'current') {
        next[id] = 'done'
      }
    }
    next.lastStep = stepId
    next.updatedAt = isoNow()
    return next
  }
  function stepIndex(stepId) {
    return Math.max(0, PRACTICE_STEPS.findIndex(step => step.id === stepId))
  }
  function applyPracticeStep(stepId, nextTab = '') {
    updateV2Store(prev => {
      if (!activeCourse) return prev
      const hasProgress = prev.progress.some(item => item.courseId === activeCourse.id && item.userId === activeCourse.userId)
      const progress = hasProgress
        ? prev.progress.map(item => {
          if (item.courseId !== activeCourse.id || item.userId !== activeCourse.userId) return item
          return patchProgressForStep(item, stepId, true)
        })
        : [...prev.progress, patchProgressForStep(makeProgress(activeCourse.id, activeCourse.userId), stepId, false)]
      return { ...prev, activePracticeStep: stepId, progress }
    })
    if (nextTab) setTab(nextTab)
  }
  function setPracticeStep(stepId) {
    applyPracticeStep(stepId, 'practice')
  }
  function setPracticeStepOnly(stepId) {
    applyPracticeStep(stepId, '')
  }
  function completePracticeStep(moveToNext = false) {
    if (!activeCourse) return
    const currentStepId = v2Store.activePracticeStep || 'background'
    const currentIndex = stepIndex(currentStepId)
    const nextStepId = PRACTICE_STEPS[Math.min(currentIndex + 1, PRACTICE_STEPS.length - 1)]?.id || currentStepId
    const targetStepId = moveToNext ? nextStepId : currentStepId
    updateV2Store(prev => {
      const hasProgress = prev.progress.some(item => item.courseId === activeCourse.id && item.userId === activeCourse.userId)
      const progress = hasProgress
        ? prev.progress.map(item => {
          if (item.courseId !== activeCourse.id || item.userId !== activeCourse.userId) return item
          const doneStep = { ...item, [currentStepId]: 'done' }
          return patchProgressForStep(doneStep, targetStepId, false)
        })
        : [...prev.progress, patchProgressForStep({ ...makeProgress(activeCourse.id, activeCourse.userId), [currentStepId]: 'done' }, targetStepId, false)]
      return { ...prev, activePracticeStep: targetStepId, progress }
    })
    if (moveToNext) setAudioMsg(`Step completed. Next: ${PRACTICE_STEPS[stepIndex(targetStepId)]?.title || targetStepId} ✅`)
    else setAudioMsg('Step marked as done ✅')
    setTab('practice')
  }
  function importV2Course(parsed) {
    if (!parsed?.course || !parsed?.contentBlock) return false
    updateV2Store(prev => ({
      ...prev,
      activeUserId: parsed.course.userId,
      activeCourseId: parsed.course.id,
      activePracticeStep: 'background',
      courses: [{ ...parsed.course, active: true }, ...prev.courses.map(course => ({ ...course, active: false }))],
      contentBlocks: [parsed.contentBlock, ...prev.contentBlocks],
      progress: [parsed.progress, ...prev.progress],
      reviewItems: prev.reviewItems
    }))
    setImportMsg(`V2 course imported: ${parsed.course.title}. Open Learn to continue. ✅`)
    setLibraryMode('list')
    setAddContentMode('')
    setTab('learn')
    return true
  }
  function createGeneralTopicCourse() {
    const title = cleanLineText(window.prompt('General Topic title (e.g. At the Pharmacy)') || '')
    if (!title) return
    const category = cleanLineText(window.prompt('Category (e.g. Survival English)', 'General Topic') || 'General Topic')
    const goal = cleanLineText(window.prompt('Learning goal (short sentence)', 'Build real-life speaking confidence.') || 'Build real-life speaking confidence.')
    const now = isoNow()
    const courseId = `course_${uid()}`
    const blockId = `block_${uid()}`
    const course = {
      id: courseId,
      userId: v2Store.activeUserId,
      book: 'General Topics',
      level: activeUser?.level || 'Beginner',
      unit: '',
      lesson: title,
      title,
      type: 'General Topic',
      category,
      goal,
      topFolderId: '',
      subFolderId: '',
      active: true,
      createdAt: now,
      updatedAt: now
    }
    const contentBlock = {
      id: blockId,
      userId: v2Store.activeUserId,
      courseId,
      type: 'General Topic',
      title,
      source: 'Manual topic',
      order: 1,
      audioCacheStatus: 'not_cached',
      background: {
        SCENE_CN: '',
        SCENE_EN: '',
        AUSTRALIA_CONTEXT_CN: '',
        AUSTRALIA_CONTEXT_EN: '',
        GRAMMAR: '',
        LISTEN_FOR: ''
      },
      dialogue: { id: uid(), title: 'Dialogue', sourceType: '', lines: [] },
      expressions: [],
      quickReaction: [],
      semiControlledTalk: null,
      createdAt: now,
      updatedAt: now
    }
    updateV2Store(prev => ({
      ...prev,
      activeUserId: v2Store.activeUserId,
      activeCourseId: courseId,
      activePracticeStep: 'background',
      courses: [{ ...course }, ...prev.courses.map(item => ({ ...item, active: false }))],
      contentBlocks: [contentBlock, ...prev.contentBlocks],
      progress: [makeProgress(courseId, v2Store.activeUserId), ...prev.progress]
    }))
    setLibraryMode('list')
    setAddContentMode('')
    setAudioMsg(`General topic created: ${title}. You can now paste course content.`)
  }
  function createLibraryFolder(level = 1) {
    const now = isoNow()
    if (level === 1) {
      const name = cleanLineText(window.prompt('一级文件夹名称（例如 Textbooks）') || '')
      if (!name) return
      const folderId = `folder_${uid()}`
      updateV2Store(prev => ({
        ...prev,
        folders: [...prev.folders, { id: folderId, userId: prev.activeUserId, name, parentId: '', order: prev.folders.filter(item => item.userId === prev.activeUserId && !item.parentId).length + 1, createdAt: now, updatedAt: now }]
      }))
      return
    }
    const availableTop = topFolders
    if (!availableTop.length) {
      setAudioMsg('请先创建一级文件夹。')
      return
    }
    const tip = availableTop.map((folder, idx) => `${idx + 1}. ${folder.name}`).join('\n')
    const selected = Number(window.prompt(`请选择父文件夹编号：\n${tip}`) || '0')
    if (!selected || selected < 1 || selected > availableTop.length) return
    const parent = availableTop[selected - 1]
    const name = cleanLineText(window.prompt('二级文件夹名称（例如 Beginner Unit 1）') || '')
    if (!name) return
    updateV2Store(prev => ({
      ...prev,
      folders: [...prev.folders, { id: `folder_${uid()}`, userId: prev.activeUserId, name, parentId: parent.id, order: prev.folders.filter(item => item.userId === prev.activeUserId && item.parentId === parent.id).length + 1, createdAt: now, updatedAt: now }]
    }))
  }
  function renameLibraryFolder(folderId) {
    const folder = v2Folders.find(item => item.id === folderId)
    if (!folder) return
    const nextName = cleanLineText(window.prompt('文件夹新名称', folder.name) || '')
    if (!nextName || nextName === folder.name) return
    updateV2Store(prev => ({
      ...prev,
      folders: prev.folders.map(item => item.id === folderId ? { ...item, name: nextName, updatedAt: isoNow() } : item)
    }))
  }
  function renameV2Course(courseId) {
    const course = v2Store.courses.find(item => item.id === courseId)
    if (!course) return
    const nextTitle = cleanLineText(window.prompt('课程新名称', course.title) || '')
    if (!nextTitle || nextTitle === course.title) return
    updateV2Store(prev => ({
      ...prev,
      courses: prev.courses.map(item => item.id === courseId ? { ...item, title: nextTitle, lesson: nextTitle, updatedAt: isoNow() } : item)
    }))
  }
  function moveCourseToFolder(courseId) {
    const course = v2Store.courses.find(item => item.id === courseId)
    if (!course) return
    const choices = [{ topFolderId: '', subFolderId: '', label: '0. 不放入文件夹' }]
    topFolders.forEach((top, topIndex) => {
      choices.push({ topFolderId: top.id, subFolderId: '', label: `${topIndex + 1}. ${top.name}` })
      subFolders.filter(sub => sub.parentId === top.id).forEach((sub, subIndex) => {
        choices.push({ topFolderId: top.id, subFolderId: sub.id, label: `${topIndex + 1}.${subIndex + 1} ${top.name} / ${sub.name}` })
      })
    })
    const tip = choices.map(item => item.label).join('\n')
    const answer = String(window.prompt(`输入要移动到的位置编号：\n${tip}`) || '').trim()
    let selected = choices.find(item => item.label.startsWith(`${answer}. `))
    if (!selected) selected = choices.find(item => item.label.startsWith(`${answer} `))
    if (!selected) return
    updateV2Store(prev => ({
      ...prev,
      courses: prev.courses.map(item => item.id === courseId ? { ...item, topFolderId: selected.topFolderId, subFolderId: selected.subFolderId, updatedAt: isoNow() } : item)
    }))
  }
  async function fileToDataUrl(file) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Read file failed.'))
      reader.readAsDataURL(file)
    })
  }
  function dataUrlToBlob(dataUrl = '') {
    const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/)
    if (!match) return null
    const mime = match[1] || 'audio/m4a'
    const binary = atob(match[2])
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new Blob([bytes], { type: mime })
  }
  function tokenizeForAlign(text = '') {
    return String(text || '').toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean)
  }
  function normalizeSentenceLine(line = '') {
    const text = cleanLineText(line).replace(/\s+/g, ' ').trim()
    if (!text) return ''
    const withFirst = text.charAt(0).toUpperCase() + text.slice(1)
    return /[.!?]$/.test(withFirst) ? withFirst : `${withFirst}.`
  }
  function alignSentences(words = [], sentences = [], paddingStartMs = 120, paddingEndMs = 180) {
    const normalizedWords = words.map((item, index) => ({
      index,
      token: tokenizeForAlign(item.word || '')[0] || '',
      start: Number(item.start || 0),
      end: Number(item.end || 0)
    }))
    let cursor = 0
    return sentences.map((raw, sentenceIndex) => {
      const text = normalizeSentenceLine(raw)
      const tokens = tokenizeForAlign(text)
      if (!tokens.length) {
        return { id: `line_${uid()}_${sentenceIndex}`, text, translation: '', startMs: null, endMs: null, originalStartMs: null, originalEndMs: null, unaligned: true, matchRatio: 0 }
      }
      let best = null
      const maxStart = Math.max(0, normalizedWords.length - 1)
      const scanFrom = Math.min(cursor, maxStart)
      const scanTo = Math.min(maxStart, scanFrom + 420)
      for (let i = scanFrom; i <= scanTo; i++) {
        let matched = 0
        let first = -1
        let last = -1
        let wordCursor = i
        for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
          const token = tokens[tokenIndex]
          const localEnd = Math.min(normalizedWords.length - 1, wordCursor + 18)
          let found = -1
          for (let j = wordCursor; j <= localEnd; j++) {
            if (normalizedWords[j].token === token) { found = j; break }
          }
          if (found >= 0) {
            if (first < 0) first = found
            last = found
            matched += 1
            wordCursor = found + 1
          } else {
            wordCursor += 1
          }
        }
        const ratio = matched / Math.max(1, tokens.length)
        if (!best || ratio > best.ratio || (ratio === best.ratio && first >= 0 && first < best.first)) {
          best = { ratio, first, last }
        }
        if (best && best.ratio >= 0.95) break
      }
      if (best && best.first >= 0 && best.last >= best.first && best.ratio >= 0.8) {
        const firstWord = normalizedWords[best.first]
        const lastWord = normalizedWords[best.last]
        const originalStartMs = Math.round(firstWord.start * 1000)
        const originalEndMs = Math.round(lastWord.end * 1000)
        const startMs = Math.max(0, originalStartMs - paddingStartMs)
        const endMs = Math.max(startMs + 120, originalEndMs + paddingEndMs)
        cursor = best.last + 1
        return {
          id: `line_${uid()}_${sentenceIndex}`,
          text,
          translation: '',
          startMs,
          endMs,
          originalStartMs,
          originalEndMs,
          unaligned: false,
          matchRatio: Number(best.ratio.toFixed(3))
        }
      }
      return { id: `line_${uid()}_${sentenceIndex}`, text, translation: '', startMs: null, endMs: null, originalStartMs: null, originalEndMs: null, unaligned: true, matchRatio: best ? Number(best.ratio.toFixed(3)) : 0 }
    })
  }
  async function transcribeAndAlignDirect() {
    const apiKey = String(settings.apiKey || '').trim()
    if (!apiKey.startsWith('sk-')) throw new Error('请先在 Settings 填写有效 OpenAI API Key。')
    const form = new FormData()
    form.append('file', audioImportFile, audioImportFile.name)
    form.append('model', 'whisper-1')
    form.append('response_format', 'verbose_json')
    form.append('timestamp_granularities[]', 'word')
    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form
    })
    if (!whisperRes.ok) throw new Error(await whisperRes.text() || 'Whisper 转录失败。')
    const whisper = await whisperRes.json()
    const rawText = String(whisper.text || '')
    const cleanupPrompt = `你是英语字幕整理助手。
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
    const cleanupRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.2, messages: [{ role: 'user', content: cleanupPrompt }] })
    })
    if (!cleanupRes.ok) throw new Error(await cleanupRes.text() || '句子整理失败。')
    const cleanupJson = await cleanupRes.json()
    const sentenceText = String(cleanupJson?.choices?.[0]?.message?.content || '')
    const sentences = sentenceText.split('\n').map(line => line.replace(/^\s*[-*0-9.)]+\s*/, '').trim()).filter(Boolean).map(normalizeSentenceLine)
    const words = Array.isArray(whisper.words) ? whisper.words.map(item => ({ word: item.word || '', start: Number(item.start || 0), end: Number(item.end || 0) })) : []
    const lines = alignSentences(words, sentences, 120, 180)
    return {
      ok: true,
      language: whisper.language || 'english',
      durationSec: Number(whisper.duration || 0),
      rawText,
      sentences,
      words,
      lines,
      stats: {
        sentenceCount: lines.length,
        alignedCount: lines.filter(item => !item.unaligned).length,
        unalignedCount: lines.filter(item => item.unaligned).length
      }
    }
  }
  async function generateTrainingDirect(smartResult) {
    const apiKey = String(settings.apiKey || '').trim()
    const title = audioImportMeta.title || audioImportMeta.lesson || audioImportFile.name.replace(/\.[a-z0-9]+$/i, '')
    const currentUserName = cleanLineText(activeUser?.name || 'Learner')
    const currentUserLevel = cleanLineText(activeUser?.level || audioImportMeta.level || 'Beginner')
    const contentSource = cleanLineText(audioImportMeta.book || audioImportFile?.name || 'Audio Upload')
    const learningGoal = cleanLineText(activeCourse?.goal || 'Build real-life communication confidence in Australia.')
    const payload = {
      title,
      level: audioImportMeta.level || currentUserLevel || 'Beginner',
      rawText: smartResult.rawText || '',
      sentences: smartResult.sentences || []
    }
    const directPrompt = `你是澳洲新移民成人英语训练系统的课程设计助手。
你要先分析 transcript，再生成两套训练包（中文辅助，英文输出）。

Current User Profile:
- name: ${currentUserName}
- level: ${currentUserLevel}
- goal: ${learningGoal}
- location context: Australia daily life

Content Source:
- sourceName: ${contentSource}
- title: ${payload.title}
- transcriptLevelHint: ${payload.level}

对话/文本：
${(payload.sentences || []).join('\n') || payload.rawText}

请严格输出 JSON 对象，不要解释，结构必须为：
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
    "semiControlledTalk": {"scenarioEn":"","scenarioCn":"","aiRole":"Staff","userRole":"${currentUserName}","helpfulExpressions":[],"turns":[]}
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
    "semiControlledTalk": {"scenarioEn":"","scenarioCn":"","aiRole":"Staff","userRole":"${currentUserName}","helpfulExpressions":[],"turns":[]}
  }
}

硬性规则：
1) 不能写死 Mandy；userRole 必须使用当前用户 ${currentUserName}。
2) 不能限定教材名；内容要适配任意音频来源。
3) 所有英文句子必须短、自然、口语化、可直接开口；避免书面化。
4) 所有拓展内容都要贴合澳大利亚真实生活高频场景（如咖啡店、超市、GP、学校、交通等）。
5) realLifeScenarioPack 必须与原主题相关、难度接近，但更生活化。
6) EN+CN 下 examples / autoSentences / miniDialogue 尽量给全中文。
7) quickReaction 的语音只播英文，所以 promptEn 必须完整自然。
8) 限制：vocabulary<=8, chunks<=8, patterns<=6, usefulSentences<=6, quickReaction<=8。
`
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0.3, messages: [{ role: 'user', content: directPrompt }] })
    })
    if (!res.ok) throw new Error(await res.text() || '生成训练内容失败。')
    const json = await res.json()
    const content = String(json?.choices?.[0]?.message?.content || '').trim()
    const parsed = (() => {
      const fenced = content.match(/```json\s*([\s\S]*?)```/i) || content.match(/```([\s\S]*?)```/i)
      const text = fenced ? fenced[1].trim() : content
      return JSON.parse(text)
    })()
    return { ok: true, training: normalizeGeneratedTrainingBundle(parsed, currentUserName) }
  }
  async function runAudioSmartProcess() {
    if (!audioImportDataUrl || !audioImportFile) {
      alert('请先选择音频文件。')
      return
    }
    try {
      setAudioImportBusy(true)
      setAudioImportStepMsg('Step 1/3: Whisper word-level 转录中...')
      let smart = null
      try {
        smart = await transcribeAndAlignDirect()
      } catch (directError) {
        const smartRes = await fetch('/api/openai-audio-smart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: settings.apiKey || '',
            audioDataUrl: audioImportDataUrl,
            fileName: audioImportFile.name,
            paddingStartMs: 120,
            paddingEndMs: 180
          })
        })
        if (!smartRes.ok) {
          let msg = 'Audio smart process failed.'
          try { msg = (await smartRes.json()).error || msg } catch { msg = await smartRes.text() }
          throw new Error(`${String(directError.message || directError)}；${msg}`)
        }
        smart = await smartRes.json()
      }
      setAudioImportResult({
        ...smart,
        lines: (smart.lines || []).map((line, index) => ({
          id: `line_${uid()}_${index}`,
          ...line,
          translation: ''
        }))
      })
      setAudioImportStepMsg('Step 2/3: GPT 课程结构生成中...')
      let generated = null
      try {
        generated = await generateTrainingDirect(smart)
      } catch (directGenError) {
        const generateRes = await fetch('/api/openai-generate-training', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: settings.apiKey || '',
            title: audioImportMeta.title || audioImportMeta.lesson || audioImportFile.name.replace(/\.[a-z0-9]+$/i, ''),
            level: audioImportMeta.level || 'Beginner',
            rawText: smart.rawText || '',
            sentences: smart.sentences || [],
            userProfile: {
              name: cleanLineText(activeUser?.name || 'Learner'),
              level: cleanLineText(activeUser?.level || audioImportMeta.level || 'Beginner'),
              goal: cleanLineText(activeCourse?.goal || '')
            },
            sourceMeta: {
              sourceName: cleanLineText(audioImportMeta.book || audioImportFile?.name || 'Audio Upload'),
              sourceType: 'audio_upload'
            }
          })
        })
        if (!generateRes.ok) {
          let msg = 'Generate training content failed.'
          try { msg = (await generateRes.json()).error || msg } catch { msg = await generateRes.text() }
          throw new Error(`${String(directGenError.message || directGenError)}；${msg}`)
        }
        generated = await generateRes.json()
      }
      setAudioImportTraining(normalizeGeneratedTrainingBundle(generated?.training || generated || null, cleanLineText(activeUser?.name || 'Learner')))
      setAudioImportStepMsg('Step 3/3: 已完成。可微调句子后导入课程。')
    } catch (error) {
      setAudioImportStepMsg(`处理失败：${String(error.message || error)}`)
      alert(String(error.message || error))
    } finally {
      setAudioImportBusy(false)
    }
  }
  function updateImportedLine(lineId, updater) {
    setAudioImportResult(prev => {
      if (!prev?.lines?.length) return prev
      return {
        ...prev,
        lines: prev.lines.map(line => line.id === lineId ? { ...line, ...updater(line) } : line)
      }
    })
  }
  function updateCourseDialogueLine(lineId, updater) {
    updateV2Store(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map(block => {
        if (!Array.isArray(block.dialogue?.lines) || !block.dialogue.lines.some(line => line.id === lineId)) return block
        return {
          ...block,
          dialogue: {
            ...block.dialogue,
            lines: block.dialogue.lines.map(line => line.id === lineId ? { ...line, ...updater(line) } : line)
          },
          updatedAt: isoNow()
        }
      })
    }))
  }
  function mergeCourseLineWithNext(lineId) {
    updateV2Store(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map(block => {
        const lines = block.dialogue?.lines || []
        const index = lines.findIndex(line => line.id === lineId)
        if (index < 0 || index >= lines.length - 1) return block
        const current = lines[index]
        const next = lines[index + 1]
        const merged = {
          ...current,
          text: `${cleanLineText(current.text)} ${cleanLineText(next.text)}`.trim(),
          translation: `${cleanLineText(current.translation || '')} ${cleanLineText(next.translation || '')}`.trim(),
          endMs: next.endMs ?? current.endMs,
          originalEndMs: next.originalEndMs ?? current.originalEndMs,
          unaligned: Boolean(current.unaligned || next.unaligned)
        }
        return {
          ...block,
          dialogue: { ...block.dialogue, lines: [...lines.slice(0, index), merged, ...lines.slice(index + 2)] },
          updatedAt: isoNow()
        }
      })
    }))
  }
  function splitLineByMarker(text = '') {
    const raw = cleanLineText(text)
    if (!raw) return null
    const markerIndex = raw.indexOf('|')
    if (markerIndex < 0) return null
    const left = cleanLineText(raw.slice(0, markerIndex))
    const right = cleanLineText(raw.slice(markerIndex + 1))
    if (!left || !right) return null
    return { left, right }
  }
  function splitTimeRangeByTextRatio(line, leftText, rightText) {
    const start = Number.isFinite(Number(line.startMs)) ? Number(line.startMs) : null
    const end = Number.isFinite(Number(line.endMs)) ? Number(line.endMs) : null
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return { start1: line.startMs ?? null, end1: line.endMs ?? null, start2: line.startMs ?? null, end2: line.endMs ?? null }
    }
    const total = Math.max(120, end - start)
    const leftWeight = Math.max(1, cleanLineText(leftText).length)
    const rightWeight = Math.max(1, cleanLineText(rightText).length)
    const splitRatio = leftWeight / (leftWeight + rightWeight)
    const splitMs = Math.max(start + 80, Math.min(end - 80, Math.round(start + total * splitRatio)))
    return { start1: start, end1: splitMs, start2: splitMs, end2: end }
  }
  function splitCourseLine(lineId, splitText) {
    updateV2Store(prev => ({
      ...prev,
      contentBlocks: prev.contentBlocks.map(block => {
        const lines = block.dialogue?.lines || []
        const index = lines.findIndex(line => line.id === lineId)
        if (index < 0) return block
        const current = lines[index]
        const parsed = splitLineByMarker(splitText || current.text || '')
        if (!parsed) return block
        const timing = splitTimeRangeByTextRatio(current, parsed.left, parsed.right)
        const first = {
          ...current,
          text: parsed.left,
          startMs: timing.start1,
          endMs: timing.end1,
          originalStartMs: Number.isFinite(Number(current.originalStartMs)) ? Number(current.originalStartMs) : timing.start1,
          originalEndMs: Number.isFinite(Number(current.originalEndMs)) ? Math.min(Number(current.originalEndMs), timing.end1 ?? Number(current.originalEndMs)) : timing.end1
        }
        const second = {
          ...current,
          id: uid(),
          text: parsed.right,
          startMs: timing.start2,
          endMs: timing.end2,
          originalStartMs: Number.isFinite(Number(current.originalStartMs)) ? Math.max(Number(current.originalStartMs), timing.start2 ?? Number(current.originalStartMs)) : timing.start2,
          originalEndMs: Number.isFinite(Number(current.originalEndMs)) ? Number(current.originalEndMs) : timing.end2
        }
        return {
          ...block,
          dialogue: { ...block.dialogue, lines: [...lines.slice(0, index), first, second, ...lines.slice(index + 1)] },
          updatedAt: isoNow()
        }
      })
    }))
  }
  function adjustImportedLine(lineId, key, delta) {
    updateImportedLine(lineId, line => {
      const next = Number(line[key] ?? 0) + delta
      if (key === 'startMs') return { startMs: Math.max(0, Math.min(next, Number(line.endMs || next))) }
      return { endMs: Math.max(Number(line.startMs || 0) + 80, next) }
    })
  }
  function mergeImportedLineWithNext(lineId) {
    setAudioImportResult(prev => {
      if (!prev?.lines?.length) return prev
      const index = prev.lines.findIndex(line => line.id === lineId)
      if (index < 0 || index >= prev.lines.length - 1) return prev
      const current = prev.lines[index]
      const next = prev.lines[index + 1]
      const merged = {
        ...current,
        text: `${cleanLineText(current.text)} ${cleanLineText(next.text)}`.trim(),
        translation: `${cleanLineText(current.translation || '')} ${cleanLineText(next.translation || '')}`.trim(),
        endMs: next.endMs ?? current.endMs,
        originalEndMs: next.originalEndMs ?? current.originalEndMs,
        unaligned: Boolean(current.unaligned || next.unaligned)
      }
      return {
        ...prev,
        lines: [...prev.lines.slice(0, index), merged, ...prev.lines.slice(index + 2)]
      }
    })
  }
  function splitImportedLine(lineId, splitText) {
    setAudioImportResult(prev => {
      if (!prev?.lines?.length) return prev
      const index = prev.lines.findIndex(line => line.id === lineId)
      if (index < 0) return prev
      const current = prev.lines[index]
      const parsed = splitLineByMarker(splitText || current.text || '')
      if (!parsed) return prev
      const timing = splitTimeRangeByTextRatio(current, parsed.left, parsed.right)
      const first = {
        ...current,
        text: parsed.left,
        startMs: timing.start1,
        endMs: timing.end1,
        originalStartMs: Number.isFinite(Number(current.originalStartMs)) ? Number(current.originalStartMs) : timing.start1,
        originalEndMs: Number.isFinite(Number(current.originalEndMs)) ? Math.min(Number(current.originalEndMs), timing.end1 ?? Number(current.originalEndMs)) : timing.end1
      }
      const second = {
        ...current,
        id: uid(),
        text: parsed.right,
        startMs: timing.start2,
        endMs: timing.end2,
        originalStartMs: Number.isFinite(Number(current.originalStartMs)) ? Math.max(Number(current.originalStartMs), timing.start2 ?? Number(current.originalStartMs)) : timing.start2,
        originalEndMs: Number.isFinite(Number(current.originalEndMs)) ? Number(current.originalEndMs) : timing.end2
      }
      return {
        ...prev,
        lines: [...prev.lines.slice(0, index), first, second, ...prev.lines.slice(index + 1)]
      }
    })
  }
  function resetImportedLineTiming(lineId) {
    updateImportedLine(lineId, line => ({
      startMs: line.originalStartMs ?? line.startMs ?? 0,
      endMs: line.originalEndMs ?? line.endMs ?? ((line.originalStartMs ?? line.startMs ?? 0) + 1200)
    }))
  }
  function adjustCourseLine(lineId, key, delta) {
    updateCourseDialogueLine(lineId, line => {
      const next = Number(line[key] ?? 0) + delta
      if (key === 'startMs') return { startMs: Math.max(0, Math.min(next, Number(line.endMs || next))) }
      return { endMs: Math.max(Number(line.startMs || 0) + 80, next) }
    })
  }
  function resetCourseLineTiming(lineId) {
    updateCourseDialogueLine(lineId, line => ({
      startMs: line.originalStartMs ?? line.startMs ?? 0,
      endMs: line.originalEndMs ?? line.endMs ?? ((line.originalStartMs ?? line.startMs ?? 0) + 1200)
    }))
  }
  async function handleAudioFileSelected(file) {
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setAudioImportFile(file)
      setAudioImportDataUrl(dataUrl)
      setAudioImportResult(null)
      setAudioImportTraining(null)
      setAudioImportStepMsg('音频已选择。点击 Smart Process 开始。')
      setAudioImportMeta(prev => ({
        ...prev,
        lesson: prev.lesson || file.name.replace(/\.[a-z0-9]+$/i, ''),
        title: prev.title || file.name.replace(/\.[a-z0-9]+$/i, '')
      }))
    } catch (error) {
      alert(String(error.message || error))
    }
  }
  function formatMs(ms) {
    if (!Number.isFinite(Number(ms))) return '--:--.---'
    const total = Math.max(0, Math.round(Number(ms)))
    const min = Math.floor(total / 60000)
    const sec = Math.floor((total % 60000) / 1000)
    const milli = total % 1000
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(milli).padStart(3, '0')}`
  }
  async function importAudioCourseToLibrary() {
    if (!audioImportResult?.lines?.length || !audioImportTraining) {
      alert('请先完成智能处理。')
      return
    }
    const now = isoNow()
    const courseId = `course_${uid()}`
    const blockId = `block_${uid()}`
    const title = cleanLineText(audioImportMeta.title || audioImportMeta.lesson || audioImportFile?.name?.replace(/\.[a-z0-9]+$/i, '') || 'Audio Imported Course')
    const currentUserName = cleanLineText(activeUser?.name || 'Learner')
    const textbookPack = audioImportTraining?.textbookSupportPack || audioImportTraining || {}
    const realLifePack = audioImportTraining?.realLifeScenarioPack || null
    const sourceBlob = dataUrlToBlob(audioImportDataUrl)
    let sourceAudioAssetId = ''
    if (sourceBlob) sourceAudioAssetId = await storeAudioClip(blockId, 'source-audio', 'main', sourceBlob)

    const parsedRoleLines = audioImportResult.lines.map(line => parseRolePrefixedText(line.text || ''))
    const hasExplicitRole = parsedRoleLines.some(item => item.role)
    const rawLineTexts = parsedRoleLines.map(item => cleanLineText(item.text || ''))
    const likelyDialogue = inferLikelyDialogue(rawLineTexts, parsedRoleLines.map(item => item.role))
    const dialogueLines = audioImportResult.lines.map((line, index) => ({
      id: uid(),
      role: likelyDialogue ? (hasExplicitRole ? cleanLineText(parsedRoleLines[index]?.role || '') : ['A', 'B', 'C'][index % 3]) : '',
      text: cleanLineText(parsedRoleLines[index]?.text || line.text || ''),
      translation: cleanLineText(textbookPack.dialogueCn?.[index] || line.translation || ''),
      order: index + 1,
      audioAssetId: '',
      difficult: false,
      startMs: Number.isFinite(Number(line.startMs)) ? Number(line.startMs) : null,
      endMs: Number.isFinite(Number(line.endMs)) ? Number(line.endMs) : null,
      originalStartMs: Number.isFinite(Number(line.originalStartMs)) ? Number(line.originalStartMs) : null,
      originalEndMs: Number.isFinite(Number(line.originalEndMs)) ? Number(line.originalEndMs) : null,
      unaligned: Boolean(line.unaligned)
    }))

    const toExpressionRows = (rows = [], limit = 4) => normalizeGeneratedBilingualList(rows, limit, ['en', 'text', 'sentence', 'value'], ['cn', 'translation', 'zh'])
    const buildPackExpressions = (pack = {}) => ([
      ...(pack.vocabulary || []).map((item, order) => ({
        id: uid(),
        type: 'vocab',
        text: cleanLineText(item.word || ''),
        meaning: cleanLineText(item.cn || ''),
        note: '',
        examples: toExpressionRows(item.examples || [], 3).map((row, i) => ({ id: uid(), text: cleanLineText(row.text || ''), translation: cleanLineText(row.translation || ''), audioAssetId: '', order: i + 1 })),
        autoSentences: [],
        miniDialogues: [],
        audioAssetId: '',
        reviewEnabled: true,
        order: order + 1
      })),
      ...(pack.chunks || []).map((item, order) => ({
        id: uid(),
        type: 'chunk',
        text: cleanLineText(item.chunk || ''),
        meaning: cleanLineText(item.cn || ''),
        note: '',
        examples: toExpressionRows(item.examples || [], 3).map((row, i) => ({ id: uid(), text: cleanLineText(row.text || ''), translation: cleanLineText(row.translation || ''), audioAssetId: '', order: i + 1 })),
        autoSentences: [],
        miniDialogues: [],
        audioAssetId: '',
        reviewEnabled: true,
        order: order + 1
      })),
      ...(pack.patterns || []).map((item, order) => ({
        id: uid(),
        type: 'pattern',
        text: cleanLineText(item.pattern || ''),
        meaning: cleanLineText(item.cn || ''),
        note: '',
        examples: [],
        autoSentences: toExpressionRows(item.autoSentences || [], 4).map((row, i) => ({ id: uid(), text: cleanLineText(row.text || ''), translation: cleanLineText(row.translation || ''), audioAssetId: '', order: i + 1 })),
        miniDialogues: [],
        audioAssetId: '',
        reviewEnabled: true,
        order: order + 1
      })),
      ...(pack.usefulSentences || []).map((item, order) => ({
        id: uid(),
        type: 'useful_sentence',
        text: cleanLineText(item.sentence || ''),
        meaning: cleanLineText(item.cn || ''),
        note: '',
        examples: [],
        autoSentences: [],
        miniDialogues: [{
          id: uid(),
          title: '',
          lines: (item.miniDialogue || []).map((line, i) => ({
            id: uid(),
            role: cleanLineText(line.role || ''),
            text: cleanLineText(line.text || line.en || ''),
            translation: cleanLineText(line.cn || line.translation || ''),
            audioAssetId: '',
            order: i + 1
          }))
        }],
        audioAssetId: '',
        reviewEnabled: true,
        order: order + 1
      }))
    ])
    const buildPackQuickReaction = (pack = {}) => (pack.quickReaction || []).map((item, index) => ({
      id: uid(),
      promptEn: cleanLineText(item.promptEn || item.answerEn || ''),
      promptCn: cleanLineText(item.promptCn || ''),
      prompt: cleanLineText(item.promptCn || item.promptEn || item.answerEn || ''),
      hint: cleanLineText(item.hint || ''),
      answer: cleanLineText(item.answerEn || ''),
      audioAssetId: '',
      order: index + 1
    }))
    const buildPackTalkTurns = (pack = {}) => (pack.semiControlledTalk?.turns || []).map((item, index) => ({
      id: uid(),
      aiPrompt: cleanLineText(item.aiPrompt || ''),
      sampleAnswer: cleanLineText(item.sampleAnswer || ''),
      audioAssetId: '',
      order: index + 1
    }))
    const buildPackBackground = (pack = {}) => ({
      SCENE_EN: cleanLineText(pack?.background?.sceneEn || ''),
      SCENE_CN: cleanLineText(pack?.background?.sceneCn || ''),
      AUSTRALIA_CONTEXT_EN: cleanLineText(pack?.background?.australiaContextEn || ''),
      AUSTRALIA_CONTEXT_CN: cleanLineText(pack?.background?.australiaContextCn || ''),
      PEOPLE_RELATION_EN: cleanLineText(pack?.background?.peopleRelationEn || ''),
      PEOPLE_RELATION_CN: cleanLineText(pack?.background?.peopleRelationCn || ''),
      COMMUNICATION_GOAL_EN: cleanLineText(pack?.background?.communicationGoalEn || ''),
      COMMUNICATION_GOAL_CN: cleanLineText(pack?.background?.communicationGoalCn || ''),
      GRAMMAR: cleanLineText(pack?.background?.grammarTip || ''),
      DAILY_TRANSFER_EN: cleanLineText(pack?.background?.dailyTransferEn || ''),
      DAILY_TRANSFER_CN: cleanLineText(pack?.background?.dailyTransferCn || ''),
      LISTEN_FOR: (pack?.background?.listenFor || []).join(', ')
    })
    const buildScenarioDialogueLines = (pack = {}) => {
      const rows = normalizeGeneratedDialogueRows(pack.dialogueEn || [], 24)
      const likely = inferLikelyDialogue(rows.map(item => item.text), rows.map(item => item.role))
      return rows.map((row, index) => ({
        id: uid(),
        role: likely ? (cleanLineText(row.role || '') || ['A', 'B', 'C'][index % 3]) : '',
        text: cleanLineText(row.text || ''),
        translation: cleanLineText(row.cn || ''),
        order: index + 1,
        audioAssetId: '',
        difficult: false,
        startMs: null,
        endMs: null,
        originalStartMs: null,
        originalEndMs: null,
        unaligned: true
      }))
    }
    const expressions = buildPackExpressions(textbookPack)
    const quickReaction = buildPackQuickReaction(textbookPack)
    const talkTurns = buildPackTalkTurns(textbookPack)

    async function buildGeneratedAudio(text, targetId, kind, index, voiceChannel = 'solo') {
      const content = cleanLineText(text || '')
      if (!content) return ''
      try {
        const voice = resolvePlaybackVoice(voiceChannel)
        const audioBlob = await openAiVoiceBlob(content, voice)
        return await storeAudioClip(targetId || uid(), kind, index, audioBlob)
      } catch (err) {
        console.warn('Generated training audio skipped:', err)
        return ''
      }
    }

    setAudioImportStepMsg('正在为教材包与真实场景包生成可播放音频...')
    for (const [expIndex, exp] of expressions.entries()) {
      exp.audioAssetId = await buildGeneratedAudio(exp.text, exp.id, `exp-${exp.type}`, expIndex, 'solo')
      for (const [exampleIndex, example] of (exp.examples || []).entries()) {
        example.audioAssetId = await buildGeneratedAudio(example.text, example.id, `exp-example-${exp.type}`, exampleIndex, 'solo')
      }
      for (const [autoIndex, autoSentence] of (exp.autoSentences || []).entries()) {
        autoSentence.audioAssetId = await buildGeneratedAudio(autoSentence.text, autoSentence.id, `exp-auto-${exp.type}`, autoIndex, 'solo')
      }
      for (const [miniIndex, mini] of (exp.miniDialogues || []).entries()) {
        for (const [lineIndex, line] of (mini.lines || []).entries()) {
          line.audioAssetId = await buildGeneratedAudio(line.text, line.id, `exp-mini-${miniIndex}`, lineIndex, 'dialogue')
        }
      }
    }
    for (const [reactionIndex, item] of quickReaction.entries()) {
      item.audioAssetId = await buildGeneratedAudio(item.promptEn, item.id, 'quick-reaction', reactionIndex, 'quick')
    }
    for (const [turnIndex, turn] of talkTurns.entries()) {
      turn.audioAssetId = await buildGeneratedAudio(turn.aiPrompt, turn.id, 'guided-turn', turnIndex, 'quick')
    }
    const scenarioExpressions = buildPackExpressions(realLifePack || {})
    const scenarioQuickReaction = buildPackQuickReaction(realLifePack || {})
    const scenarioTalkTurns = buildPackTalkTurns(realLifePack || {})
    for (const [expIndex, exp] of scenarioExpressions.entries()) {
      exp.audioAssetId = await buildGeneratedAudio(exp.text, exp.id, `scenario-exp-${exp.type}`, expIndex, 'solo')
      for (const [exampleIndex, example] of (exp.examples || []).entries()) {
        example.audioAssetId = await buildGeneratedAudio(example.text, example.id, `scenario-exp-example-${exp.type}`, exampleIndex, 'solo')
      }
      for (const [autoIndex, autoSentence] of (exp.autoSentences || []).entries()) {
        autoSentence.audioAssetId = await buildGeneratedAudio(autoSentence.text, autoSentence.id, `scenario-exp-auto-${exp.type}`, autoIndex, 'solo')
      }
      for (const [miniIndex, mini] of (exp.miniDialogues || []).entries()) {
        for (const [lineIndex, line] of (mini.lines || []).entries()) {
          line.audioAssetId = await buildGeneratedAudio(line.text, line.id, `scenario-exp-mini-${miniIndex}`, lineIndex, 'dialogue')
        }
      }
    }
    for (const [reactionIndex, item] of scenarioQuickReaction.entries()) {
      item.audioAssetId = await buildGeneratedAudio(item.promptEn, item.id, 'scenario-quick-reaction', reactionIndex, 'quick')
    }
    for (const [turnIndex, turn] of scenarioTalkTurns.entries()) {
      turn.audioAssetId = await buildGeneratedAudio(turn.aiPrompt, turn.id, 'scenario-guided-turn', turnIndex, 'quick')
    }

    const course = {
      id: courseId,
      userId: v2Store.activeUserId,
      book: cleanLineText(audioImportMeta.book || 'Textbook Audio'),
      level: cleanLineText(audioImportMeta.level || 'Beginner'),
      unit: cleanLineText(audioImportMeta.unit || ''),
      lesson: cleanLineText(audioImportMeta.lesson || title),
      title,
      type: 'Textbook Unit',
      category: cleanLineText(audioImportMeta.book || 'Audio Upload'),
      goal: cleanLineText(textbookPack?.background?.communicationGoalCn || textbookPack?.background?.sceneCn || '围绕真实生活场景训练听说反应能力。'),
      topFolderId: '',
      subFolderId: '',
      active: false,
      createdAt: now,
      updatedAt: now
    }

    const contentBlock = {
      id: blockId,
      userId: v2Store.activeUserId,
      courseId,
      type: 'Textbook Audio',
      title,
      source: audioImportFile?.name || 'Audio Upload',
      sourceAudioAssetId,
      order: 1,
      audioCacheStatus: 'not_cached',
      background: buildPackBackground(textbookPack),
      dialogue: {
        id: uid(),
        title: 'Dialogue',
        sourceType: 'Textbook Audio',
        lines: dialogueLines
      },
      expressions,
      quickReaction,
      semiControlledTalk: talkTurns.length ? {
        id: uid(),
        scenarioEn: cleanLineText(textbookPack?.semiControlledTalk?.scenarioEn || ''),
        scenarioCn: cleanLineText(textbookPack?.semiControlledTalk?.scenarioCn || ''),
        aiRole: cleanLineText(textbookPack?.semiControlledTalk?.aiRole || 'Staff'),
        userRole: cleanLineText(textbookPack?.semiControlledTalk?.userRole || currentUserName || 'Learner'),
        helpfulExpressions: (textbookPack?.semiControlledTalk?.helpfulExpressions || []).map(item => cleanLineText(item)).filter(Boolean),
        turns: talkTurns
      } : null,
      createdAt: now,
      updatedAt: now
    }
    const scenarioDialogueLines = buildScenarioDialogueLines(realLifePack || {})
    const scenarioBlock = realLifePack && (
      scenarioDialogueLines.length || scenarioExpressions.length || scenarioQuickReaction.length || scenarioTalkTurns.length
    ) ? {
      id: `block_${uid()}`,
      userId: v2Store.activeUserId,
      courseId,
      type: 'Real-life Scenario',
      title: `${title} · Real-life Scenario`,
      source: 'AI Scenario Pack',
      sourceAudioAssetId: '',
      order: 2,
      audioCacheStatus: 'not_cached',
      background: buildPackBackground(realLifePack),
      dialogue: {
        id: uid(),
        title: 'Real-life Dialogue',
        sourceType: 'AI Scenario',
        lines: scenarioDialogueLines
      },
      expressions: scenarioExpressions,
      quickReaction: scenarioQuickReaction,
      semiControlledTalk: scenarioTalkTurns.length ? {
        id: uid(),
        scenarioEn: cleanLineText(realLifePack?.semiControlledTalk?.scenarioEn || ''),
        scenarioCn: cleanLineText(realLifePack?.semiControlledTalk?.scenarioCn || ''),
        aiRole: cleanLineText(realLifePack?.semiControlledTalk?.aiRole || 'Staff'),
        userRole: cleanLineText(realLifePack?.semiControlledTalk?.userRole || currentUserName || 'Learner'),
        helpfulExpressions: (realLifePack?.semiControlledTalk?.helpfulExpressions || []).map(item => cleanLineText(item)).filter(Boolean),
        turns: scenarioTalkTurns
      } : null,
      createdAt: now,
      updatedAt: now
    } : null

    updateV2Store(prev => ({
      ...prev,
      activeCourseId: courseId,
      activePracticeStep: 'background',
      courses: [{ ...course, active: true }, ...prev.courses.map(item => ({ ...item, active: false }))],
      contentBlocks: [scenarioBlock, contentBlock, ...prev.contentBlocks].filter(Boolean),
      progress: [makeProgress(courseId, prev.activeUserId), ...prev.progress]
    }))

    setAudioImportStepMsg(`课程已导入。已自动生成教材支持包${scenarioBlock ? ' + 真实生活场景包' : ''}。✅`)
    setAudioMsg('Audio course imported successfully.')
    setTab('practice')
    setLibraryMode('list')
  }
  function resolveDialogueRoleVoice(roleName = '') {
    const normalizedRole = cleanLineText(roleName).toLowerCase()
    const roleIndex = dialogueRoleNames.findIndex(name => cleanLineText(name).toLowerCase() === normalizedRole)
    if (roleIndex === 0) return voiceRoles.dialogueRole1
    if (roleIndex === 1) return voiceRoles.dialogueRole2
    if (roleIndex >= 2) return voiceRoles.dialogueRole3
    return voiceRoles.dialogueRole2
  }
  function resolvePlaybackVoice(channel = 'solo', roleName = '') {
    if (channel === 'dialogue') return resolveDialogueRoleVoice(roleName)
    if (channel === 'quick') return voiceRoles.quickPrompt
    return voiceRoles.soloNarration
  }
  async function previewVoice(voiceId, sampleText = '') {
    const text = cleanLineText(sampleText) || 'Hello, welcome to your English training.'
    try {
      setAudioBusy(true)
      stopAllAudio()
      const audioBlob = await openAiVoiceBlob(text, voiceId)
      const clip = playableAudioUrl(audioBlob)
      await playClipNow(clip, text, `preview:${voiceId}`)
      setAudioMsg(`Voice preview: ${voiceId}`)
    } catch (err) {
      setAudioMsg(`Voice preview failed: ${String(err.message || err)}`)
    } finally {
      setAudioBusy(false)
    }
  }
  async function preloadCourseAudio(courseId) {
    const course = v2Store.courses.find(item => item.id === courseId)
    if (!course) return
    const blocks = v2Store.contentBlocks
      .filter(block => block.courseId === courseId && block.userId === course.userId)
      .map(block => ({
        ...block,
        dialogue: block.dialogue ? { ...block.dialogue, lines: (block.dialogue.lines || []).map(line => ({ ...line })) } : null,
        expressions: (block.expressions || []).map(item => ({ ...item }))
      }))
    if (!blocks.length) {
      setAudioMsg('No content to preload for this course.')
      return
    }
    const items = []
    for (const block of blocks) {
      for (const line of block.dialogue?.lines || []) {
        items.push({ kind: 'dialogue', block, target: line, text: line.text })
      }
      for (const item of block.expressions || []) {
        items.push({ kind: 'expression', block, target: item, text: item.text })
      }
    }
    const playableItems = items.filter(item => cleanLineText(item.text || ''))
    if (!playableItems.length) {
      setAudioMsg('No playable text to preload yet.')
      return
    }
    setAudioBusy(true)
    let done = 0
    let cached = 0
    try {
      for (const [index, item] of playableItems.entries()) {
        if (item.target.audioAssetId && await audioExists(item.target.audioAssetId)) {
          cached += 1
          continue
        }
        setAudioMsg(`Preloading audio ${index + 1}/${playableItems.length}...`)
        try {
          const audioBlob = await openAiVoiceBlob(cleanLineText(item.text), settings.exampleVoice || settings.voice)
          const ref = await storeAudioClip(item.target.id || uid(), 'v2preload', index, audioBlob)
          if (ref) item.target.audioAssetId = ref
          done += 1
        } catch (err) {
          console.warn('Preload skipped for one item.', err)
        }
      }
      for (const block of blocks) {
        const allTargets = [...(block.dialogue?.lines || []), ...(block.expressions || [])]
        const ready = allTargets.filter(entry => entry.audioAssetId).length
        block.audioCacheStatus = ready === 0 ? 'not_cached' : (ready === allTargets.length ? 'cached' : 'partial')
        block.updatedAt = isoNow()
      }
      updateV2Store(prev => ({
        ...prev,
        contentBlocks: prev.contentBlocks.map(existing => blocks.find(block => block.id === existing.id) || existing)
      }))
      setAudioMsg(`Preload finished: ${done} generated, ${cached} reused.`)
    } finally {
      setAudioBusy(false)
    }
  }

  function stopAllAudio() {
    runRef.current += 1
    try {
      const source = currentBufferSourceRef.current
      if (source) {
        source.onended = null
        source.stop?.()
        source.disconnect?.()
      }
      currentBufferSourceRef.current = null
    } catch {}
    try {
      const audio = currentAudioRef.current
      if (audio) {
        audio.pause?.()
        audio.removeAttribute?.('src')
        audio.load?.()
      }
    } catch {}
    try { window.speechSynthesis?.cancel?.() } catch {}
    stopSpeechInput(true)
    setPlayingId(null)
    setIsListPlaying(false)
    setIsRolePlaying(false)
    setSectionPlaying('')
  }

  function getAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    if (!audioContextRef.current) audioContextRef.current = new AudioCtx()
    return audioContextRef.current
  }

  function getAudioElement() {
    let audio = currentAudioRef.current
    if (!audio || typeof audio.play !== 'function') {
      audio = new Audio()
      audio.preload = 'auto'
      audio.playsInline = true
      audio.setAttribute('playsinline', 'true')
      currentAudioRef.current = audio
    }
    return audio
  }

  async function unlockAudioForUserGesture() {
    const audio = getAudioElement()
    try {
      audio.pause?.()
      audio.muted = true
      audio.src = SILENT_AUDIO_UNLOCK
      await audio.play()
      audio.pause()
      audio.removeAttribute('src')
      audio.load?.()
    } catch (err) {
      console.warn('Audio unlock skipped.', err)
    } finally {
      audio.muted = false
    }
  }

  async function prepareContinuousPlayback() {
    try {
      const ctx = getAudioContext()
      if (ctx && ctx.state === 'suspended') await ctx.resume()
    } catch (err) {
      console.warn('Audio context resume skipped.', err)
    }
    getAudioElement()
  }

  async function openAiVoiceBlob(text, voiceOverride) {
    const speechText = normalizeEnglishSpeechText(text)
    if (!speechText) throw new Error('当前内容没有可播报的英文。中文仅用于阅读显示。')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), VOICE_TIMEOUT_MS)
    const res = await fetch('/api/openai-voice', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ apiKey: settings.apiKey || '', voice: voiceOverride || settings.voice, text: speechText })
    }).finally(() => clearTimeout(timer))
    if (!res.ok) {
      let msg = 'OpenAI voice failed.'
      try { msg = (await res.json()).error || msg } catch { msg = await res.text() }
      throw new Error(msg)
    }
    return await res.blob()
  }

  async function testOpenAI() {
    try {
      setAudioBusy(true); setAudioMsg('Testing OpenAI Voice...')
      const audioBlob = await openAiVoiceBlob('Hello. This is a test.', settings.exampleVoice || settings.voice)
      const audio = playableAudioUrl(audioBlob)
      await playClipNow(audio, 'Hello. This is a test.', 'test')
      setSettings(s => ({ ...s, openaiStatus: 'Connected ✅', lastError: '' }))
      setAudioMsg('OpenAI Voice works ✅')
    } catch (err) {
      setSettings(s => ({ ...s, openaiStatus: 'Failed ❌', lastError: String(err.message || err) }))
      setAudioMsg('OpenAI Voice failed ❌')
      alert(String(err.message || err))
    } finally { setAudioBusy(false) }
  }

  async function ensureAudioOnly(card, kind, index = null) {
    const stateCard = cards.find(c => c.id === card.id)
    const fresh = normalizeCard(Number(card?.updatedAt || 0) > Number(stateCard?.updatedAt || 0) ? card : (stateCard || card))
    if (kind === 'content') {
      if (fresh.contentAudio) {
        const cachedAudio = await resolveAudioClip(fresh.contentAudio)
        if (cachedAudio) return { audio: cachedAudio, text: fresh.content, generated: false, card: fresh }
      }
      try {
        setAudioBusy(true)
        setAudioMsg(`Generating online audio... ${fresh.content}`)
        const audioBlob = await openAiVoiceBlob(fresh.content, settings.contentVoice || settings.voice)
        const audio = playableAudioUrl(audioBlob)
        const contentAudio = await storeAudioClip(fresh.id, 'content', 'main', audioBlob)
        const updated = { ...fresh, contentAudio, updatedAt: Date.now() }
        setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
        setAudioMsg('Audio ready. Playing... ✅')
        return { audio, text: updated.content, generated: true, card: updated }
      } finally {
        setAudioBusy(false)
      }
    }
    if (kind === 'dialogue') {
      const line = makeDialogue(fresh)[index]
      if (!line) return { audio: '', text: '', generated: false, card: fresh }
      const spokenText = dialogueAudioText(line.text)
      const dialogueAudios = Array.isArray(fresh.dialogueAudios) ? [...fresh.dialogueAudios] : []
      if (dialogueAudios[index]) {
        const cachedAudio = await resolveAudioClip(dialogueAudios[index])
        if (cachedAudio) return { audio: cachedAudio, text: spokenText, generated: false, card: fresh }
      }
      try {
        setAudioBusy(true)
        setAudioMsg(`Generating mini dialogue audio... ${spokenText}`)
        const audioBlob = await openAiVoiceBlob(spokenText, settings.exampleVoice || settings.voice)
        const audio = playableAudioUrl(audioBlob)
        dialogueAudios[index] = await storeAudioClip(fresh.id, 'dialogue', index, audioBlob)
        const updated = { ...fresh, dialogueAudios, updatedAt: Date.now() }
        setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
        setAudioMsg('Mini dialogue audio ready. Playing... ✅')
        return { audio, text: spokenText, generated: true, card: updated }
      } finally {
        setAudioBusy(false)
      }
    }
    const ex = fresh.examples?.[index]
    if (!ex) return { audio: '', text: '', generated: false, card: fresh }
    if (ex.audio) {
      const cachedAudio = await resolveAudioClip(ex.audio)
      if (cachedAudio) return { audio: cachedAudio, text: ex.text, generated: false, card: fresh }
    }
    try {
      setAudioBusy(true)
      setAudioMsg(`Generating example audio... ${ex.text}`)
      const audioBlob = await openAiVoiceBlob(ex.text, settings.exampleVoice || settings.voice)
      const audio = playableAudioUrl(audioBlob)
      const storedAudio = await storeAudioClip(fresh.id, 'example', index, audioBlob)
      const examples = fresh.examples.map((item, i) => i === index ? { ...item, audio: storedAudio } : item)
      const updated = { ...fresh, examples, updatedAt: Date.now() }
      setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
      setAudioMsg('Example audio ready. Playing... ✅')
      return { audio, text: ex.text, generated: true, card: updated }
    } finally {
      setAudioBusy(false)
    }
  }

  function playAudioUrl(audio, text, runId) {
    if (audio) {
      return new Promise((resolve, reject) => {
        const a = getAudioElement()
        let done = false
        const cleanup = () => {
          clearTimeout(timer)
          a.onended = null
          a.onerror = null
        }
        const resolveOnce = () => {
          if (done) return
          done = true
          cleanup()
          resolve()
        }
        const rejectOnce = (err) => {
          if (done) return
          done = true
          cleanup()
          reject(err instanceof Error ? err : new Error(String(err || 'Audio playback failed.')))
        }
        const timer = setTimeout(() => {
          try { a.pause(); a.removeAttribute('src'); a.load() } catch {}
          rejectOnce(new Error('Audio took too long. Please try again.'))
        }, VOICE_TIMEOUT_MS)
        currentAudioRef.current = a
        try {
          a.pause()
          a.removeAttribute('src')
          a.load?.()
        } catch {}
        a.src = audio
        a.playbackRate = Number(settings.audioSpeed || 1) || 1
        a.onended = resolveOnce
        a.onerror = () => rejectOnce(new Error('Audio playback failed.'))
        a.play().catch(rejectOnce)
      })
    }
    throw new Error('Audio is not ready yet.')
  }

  async function playAudioBufferUrl(audio, text, runId) {
    if (!audio) throw new Error('Audio is not ready yet.')
    const ctx = getAudioContext()
    if (!ctx) return playAudioUrl(audio, text, runId)
    try {
      if (ctx.state === 'suspended') await ctx.resume()
      const res = await fetch(audio)
      if (!res.ok) throw new Error('Audio file could not load.')
      const raw = await res.arrayBuffer()
      if (runRef.current !== runId) return
      const buffer = await ctx.decodeAudioData(raw.slice(0))
      if (runRef.current !== runId) return
      await new Promise((resolve, reject) => {
        const source = ctx.createBufferSource()
        let done = false
        const cleanup = () => {
          clearTimeout(timer)
          source.onended = null
          if (currentBufferSourceRef.current === source) currentBufferSourceRef.current = null
          try { source.disconnect() } catch {}
        }
        const resolveOnce = () => {
          if (done) return
          done = true
          cleanup()
          resolve()
        }
        const rejectOnce = (err) => {
          if (done) return
          done = true
          cleanup()
          reject(err instanceof Error ? err : new Error(String(err || 'Audio playback failed.')))
        }
        const timer = setTimeout(() => {
          try { source.stop() } catch {}
          rejectOnce(new Error('Audio took too long. Please try again.'))
        }, VOICE_TIMEOUT_MS)
        source.buffer = buffer
        source.playbackRate.value = Number(settings.audioSpeed || 1) || 1
        source.connect(ctx.destination)
        source.onended = resolveOnce
        currentBufferSourceRef.current = source
        try { source.start(0) } catch (err) { rejectOnce(err) }
      })
    } catch (err) {
      if (runRef.current !== runId) return
      console.warn('Buffer playback fallback.', err)
      await playAudioUrl(audio, text, runId)
    }
  }

  async function playClipNow(audio, text, id) {
    stopAllAudio()
    const runId = ++runRef.current
    setPlayingId(id)
    if (!String(audio || '').startsWith('blob:')) setLastAudioClip({ audio, text, id })
    const repeat = Math.max(1, Number(settings.audioRepeat || 1))
    try {
      for (let i = 0; i < repeat; i++) {
        if (runRef.current !== runId) return
        await playAudioUrl(audio, text, runId)
        if (i < repeat - 1) await sleep(350)
      }
    } catch (err) {
      setAudioMsg(String(err.message || err))
    } finally {
      releasePlayableAudio(audio)
      if (runRef.current === runId) setPlayingId(null)
    }
  }

  async function handlePlayContent(card, e) {
    e?.stopPropagation?.()
    try {
      stopAllAudio()
      const clip = await ensureAudioOnly(card, 'content')
      await playClipNow(clip.audio, clip.text, `${card.id}:content`)
    } catch (err) {
      setAudioBusy(false); setAudioMsg(`Audio failed: ${String(err.message || err)}`)
    }
  }
  async function handlePlayExample(card, idx, e) {
    e?.stopPropagation?.()
    try {
      stopAllAudio()
      const clip = await ensureAudioOnly(card, 'example', idx)
      await playClipNow(clip.audio, clip.text, `${card.id}:ex:${idx}`)
    } catch (err) {
      setAudioBusy(false); setAudioMsg(`Audio failed: ${String(err.message || err)}`)
    }
  }
  async function handlePlayDialogue(card, idx, e) {
    e?.stopPropagation?.()
    try {
      stopAllAudio()
      const clip = await ensureAudioOnly(card, 'dialogue', idx)
      await playClipNow(clip.audio, clip.text, `${card.id}:dialogue:${idx}`)
    } catch (err) {
      setAudioBusy(false); setAudioMsg(`Audio failed: ${String(err.message || err)}`)
    }
  }

  async function playCardSection(card, section) {
    const fresh = normalizeCard(cards.find(c => c.id === card.id) || card)
    const isExamples = section === 'examples'
    const rows = isExamples
      ? (fresh.examples || []).map((ex, idx) => ({ kind: 'example', index: idx, id: `${fresh.id}:ex:${idx}`, text: ex.text }))
      : makeDialogue(fresh).map((line, idx) => ({ kind: 'dialogue', index: idx, id: `${fresh.id}:dialogue:${idx}`, text: dialogueAudioText(line.text) }))
    const playableRows = rows.filter(row => String(row.text || '').trim())
    if (!playableRows.length) {
      setAudioMsg(isExamples ? 'No examples to play.' : 'No mini dialogue to play.')
      return
    }
    stopAllAudio()
    const runId = ++runRef.current
    let activeCard = fresh
    const label = isExamples ? 'Examples' : 'Mini dialogue'
    const pauseMs = Math.max(1200, Number(settings.pauseSeconds || 1.5) * 1000)
    setSectionPlaying(section)
    setAudioMsg(`Playing ${label.toLowerCase()}...`)
    try {
      await prepareContinuousPlayback()
      for (let i = 0; i < playableRows.length; i++) {
        if (runRef.current !== runId) return
        const row = playableRows[i]
        const clip = await ensureAudioOnly(activeCard, row.kind, row.index)
        activeCard = clip.card || activeCard
        if (runRef.current !== runId) return
        setPlayingId(row.id)
        await playAudioBufferUrl(clip.audio, clip.text, runId)
        releasePlayableAudio(clip.audio)
        if (runRef.current !== runId) return
        if (i < playableRows.length - 1) {
          setAudioMsg(`${label} ${i + 1}/${playableRows.length}. Pause...`)
          await sleep(pauseMs)
        }
      }
      if (runRef.current === runId) setAudioMsg(`${label} finished ✅`)
    } catch (err) {
      if (runRef.current === runId) setAudioMsg(`${label} stopped: ${String(err.message || err)}`)
    } finally {
      if (runRef.current === runId) {
        setPlayingId(null)
        setSectionPlaying('')
        setAudioBusy(false)
      }
    }
  }

  async function playRolePlay(card) {
    const lines = makeDialogue(card)
    const roles = dialogueRoles(card)
    const selectedRole = rolePlayRole || roles[1] || roles[0] || ''
    if (!lines.length || !selectedRole) return
    stopAllAudio()
    const runId = ++runRef.current
    const pauseMs = Math.max(2000, Number(settings.rolePlayPauseSeconds || 4) * 1000)
    setIsRolePlaying(true)
    setAudioMsg(`Role-play: you are ${selectedRole}.`)
    try {
      await prepareContinuousPlayback()
      for (let i = 0; i < lines.length; i++) {
        if (runRef.current !== runId) return
        const speaker = dialogueSpeaker(lines[i].text)
        const text = dialogueAudioText(lines[i].text)
        if (!text) continue
        if (speaker && speaker.toLowerCase() === selectedRole.toLowerCase()) {
          setPlayingId(`${card.id}:role:${i}`)
          setAudioMsg(`Your turn (${settings.rolePlayPauseSeconds || 4}s): ${text}`)
          await sleep(pauseMs)
          continue
        }
        const clip = await ensureAudioOnly(card, 'dialogue', i)
        if (runRef.current !== runId) return
        setPlayingId(`${card.id}:dialogue:${i}`)
        await playAudioBufferUrl(clip.audio, clip.text, runId)
        releasePlayableAudio(clip.audio)
        await sleep(350)
      }
      if (runRef.current === runId) setAudioMsg('Role-play finished ✅')
    } catch (err) {
      if (runRef.current === runId) setAudioMsg(`Role-play stopped: ${String(err.message || err)}`)
    } finally {
      if (runRef.current === runId) {
        setPlayingId(null)
        setIsRolePlaying(false)
        setAudioBusy(false)
      }
    }
  }

  async function speakWithFallback(text, playId, repeat = 1, runId = null, preloadedAudioRef = '', voiceOverride = '') {
    const spokenText = normalizeEnglishSpeechText(text)
    if (!spokenText) {
      setAudioMsg('中文仅显示，不播放。当前内容没有可播报的英文。')
      return
    }
    if (!spokenText) return
    const localRunId = runId ?? (++runRef.current)
    setPlayingId(playId)
    try {
      await prepareContinuousPlayback()
      if (preloadedAudioRef) {
        const cachedAudio = await resolveAudioClip(preloadedAudioRef)
        if (cachedAudio) {
          try {
            for (let i = 0; i < Math.max(1, repeat); i++) {
              if (runRef.current !== localRunId) return
              await playAudioBufferUrl(cachedAudio, spokenText, localRunId)
              if (i < repeat - 1) await sleep(300)
            }
            return
          } finally {
            releasePlayableAudio(cachedAudio)
          }
        }
      }
      try {
        const audioBlob = await openAiVoiceBlob(spokenText, voiceOverride || settings.exampleVoice || settings.voice)
        if (runRef.current !== localRunId) return
        const audio = playableAudioUrl(audioBlob)
        try {
          for (let i = 0; i < Math.max(1, repeat); i++) {
            if (runRef.current !== localRunId) return
            await playAudioBufferUrl(audio, spokenText, localRunId)
            if (i < repeat - 1) await sleep(300)
          }
        } finally {
          releasePlayableAudio(audio)
        }
        return
      } catch (err) {
        console.warn('V2 line OpenAI audio fallback to browser speech synthesis.', err)
      }
      if (!window.speechSynthesis) throw new Error('Speech playback unavailable.')
      for (let i = 0; i < Math.max(1, repeat); i++) {
        if (runRef.current !== localRunId) return
        await new Promise((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance(spokenText)
          utterance.rate = Number(settings.audioSpeed || 1) || 1
          utterance.onend = () => resolve()
          utterance.onerror = () => reject(new Error('Speech playback failed.'))
          try {
            window.speechSynthesis.cancel()
            window.speechSynthesis.speak(utterance)
          } catch (err) {
            reject(err)
          }
        })
        if (i < repeat - 1) await sleep(260)
      }
    } catch (err) {
      const message = String(err?.message || err || 'Speech playback failed.')
      setAudioMsg(`播放失败：${message}`)
    } finally {
      if (runRef.current === localRunId) setPlayingId(null)
    }
  }
  async function playSourceSegmentAudio(sourceAudioAssetId, startMs, endMs, text, id, runId = runRef.current) {
    if (!sourceAudioAssetId || !Number.isFinite(Number(startMs)) || !Number.isFinite(Number(endMs))) return false
    const audioUrl = await resolveAudioClip(sourceAudioAssetId)
    if (!audioUrl) return false
    const audio = getAudioElement()
    const startSec = Math.max(0, Number(startMs) / 1000)
    const endSec = Math.max(startSec + 0.08, Number(endMs) / 1000)
    setPlayingId(id)
    try {
      await prepareContinuousPlayback()
      await new Promise((resolve, reject) => {
        let done = false
        const cleanup = () => {
          audio.onloadedmetadata = null
          audio.ontimeupdate = null
          audio.onended = null
          audio.onerror = null
        }
        const finish = () => {
          if (done) return
          done = true
          cleanup()
          resolve()
        }
        const fail = (err) => {
          if (done) return
          done = true
          cleanup()
          reject(err instanceof Error ? err : new Error(String(err || 'Source segment play failed.')))
        }
        audio.onloadedmetadata = async () => {
          try {
            if (runRef.current !== runId) return finish()
            audio.currentTime = startSec
            audio.playbackRate = Number(settings.audioSpeed || 1) || 1
            await audio.play()
          } catch (err) {
            fail(err)
          }
        }
        audio.ontimeupdate = () => {
          if (runRef.current !== runId) {
            audio.pause?.()
            return finish()
          }
          if (audio.currentTime >= endSec) {
            audio.pause?.()
            finish()
          }
        }
        audio.onended = finish
        audio.onerror = () => fail(new Error('Source audio playback failed.'))
        audio.pause?.()
        audio.src = audioUrl
        audio.load?.()
      })
      if (text) setAudioMsg(`Source clip: ${text}`)
      return true
    } finally {
      releasePlayableAudio(audioUrl)
      if (runRef.current === runId) setPlayingId(null)
    }
  }
  async function playV2DialogueLine(line, playKey, runId, repeat = 1) {
    const lineMeta = activeDialogueLookup[line.id]
    const sourceAudioAssetId = lineMeta?.block?.sourceAudioAssetId
    if (sourceAudioAssetId && Number.isFinite(Number(line.startMs)) && Number.isFinite(Number(line.endMs))) {
      for (let i = 0; i < Math.max(1, repeat); i++) {
        if (runRef.current !== runId) return
        const played = await playSourceSegmentAudio(sourceAudioAssetId, line.startMs, line.endMs, line.text, playKey, runId)
        if (!played) break
        if (i < repeat - 1) await sleep(240)
      }
      return
    }
    await speakWithFallback(line.text, playKey, repeat, runId, line.audioAssetId, resolvePlaybackVoice('dialogue', line.role))
  }

  async function playV2DialogueAll() {
    if (!activeDialogueLines.length) {
      setAudioMsg('No dialogue lines yet.')
      return
    }
    stopAllAudio()
    const runId = ++runRef.current
    setSectionPlaying('v2-dialogue')
    try {
      for (let i = 0; i < activeDialogueLines.length; i++) {
        if (runRef.current !== runId) return
        const line = activeDialogueLines[i]
        setAudioMsg(`Dialogue ${i + 1}/${activeDialogueLines.length}`)
        await playV2DialogueLine(line, `v2-dialogue:${line.id}`, runId, 1)
        if (runRef.current !== runId) return
        if (i < activeDialogueLines.length - 1) await sleep(Math.max(400, Number(settings.pauseSeconds || 2) * 1000))
      }
      if (runRef.current === runId) setAudioMsg('Dialogue finished ✅')
    } catch (err) {
      if (runRef.current === runId) setAudioMsg(`Dialogue stopped: ${String(err.message || err)}`)
    } finally {
      if (runRef.current === runId) setSectionPlaying('')
    }
  }
  async function playV2DialogueRolePlay(targetRole = '') {
    const role = cleanLineText(targetRole || v2PracticeRole)
    if (!activeDialogueLines.length || !role) {
      setAudioMsg('No role-play line available yet.')
      return
    }
    stopAllAudio()
    const runId = ++runRef.current
    setIsRolePlaying(true)
    setSectionPlaying('v2-roleplay')
    try {
      for (let i = 0; i < activeDialogueLines.length; i++) {
        if (runRef.current !== runId) return
        const line = activeDialogueLines[i]
        const lineRole = cleanLineText(line.role || '')
        if (lineRole && lineRole.toLowerCase() === role.toLowerCase()) {
          setAudioMsg(`Your turn (${settings.rolePlayPauseSeconds || 4}s): ${line.text}`)
          await sleep(Math.max(1500, Number(settings.rolePlayPauseSeconds || 4) * 1000))
        } else {
          setAudioMsg(`Role-play ${i + 1}/${activeDialogueLines.length}`)
          await playV2DialogueLine(line, `v2-role:${line.id}`, runId, 1)
        }
        if (runRef.current !== runId) return
        if (i < activeDialogueLines.length - 1) await sleep(Math.max(300, Number(settings.pauseSeconds || 2) * 1000))
      }
      if (runRef.current === runId) setAudioMsg('Role-play finished ✅')
    } catch (err) {
      if (runRef.current === runId) setAudioMsg(`Role-play stopped: ${String(err.message || err)}`)
    } finally {
      if (runRef.current === runId) {
        setSectionPlaying('')
        setIsRolePlaying(false)
      }
    }
  }

  function toggleReactionAnswer(itemId) {
    setReactionAnswerVisible(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  function checkPracticeSpelling() {
    if (!activeSpellingItem) return
    const expected = cleanLineText(activeSpellingItem.text).toLowerCase()
    const typed = cleanLineText(spellingDraft).toLowerCase()
    const correct = Boolean(typed && typed === expected)
    setSpellingFeedback(correct ? 'Correct ✅' : 'Try again. Check spacing and spelling.')
    setSpellingStats(prev => {
      const current = prev[activeSpellingItem.id] || { wrong: 0, correct: 0 }
      return {
        ...prev,
        [activeSpellingItem.id]: {
          wrong: current.wrong + (correct ? 0 : 1),
          correct: current.correct + (correct ? 1 : 0)
        }
      }
    })
  }

  function nextPracticeSpelling() {
    if (!spellingPool.length) return
    setSpellingItemIndex(index => Math.min(index + 1, spellingPool.length - 1))
    setSpellingDraft('')
    setSpellingFeedback('')
  }

  function prevPracticeSpelling() {
    if (!spellingPool.length) return
    setSpellingItemIndex(index => Math.max(index - 1, 0))
    setSpellingDraft('')
    setSpellingFeedback('')
  }
  function toggleSpellingStar(itemId) {
    setSpellingStarred(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }
  function moveToNextExpressionFlow() {
    const order = ['vocab', 'chunk', 'pattern', 'useful_sentence']
    const stepMap = { vocab: 'vocabulary', chunk: 'chunks', pattern: 'patterns', useful_sentence: 'useful_sentences' }
    const currentIndex = Math.max(0, order.indexOf(currentExpressionTab))
    const nextTab = order[Math.min(order.length - 1, currentIndex + 1)]
    if (nextTab === currentExpressionTab) {
      setPracticeStep('reaction')
      return
    }
    setExpressionTab(nextTab)
    setPracticeStep(stepMap[nextTab] || 'vocabulary')
  }
  async function playExpressionExampleGroup(item, mode = 'examples') {
    if (!item) return
    const rows = mode === 'mini'
      ? (item.miniDialogues || []).flatMap(group => group.lines || [])
      : [...(item.examples || []), ...(item.autoSentences || [])].slice(0, 8)
    if (!rows.length) return
    stopAllAudio()
    const runId = ++runRef.current
    const playKey = `v2-expression-${mode}:${item.id}`
    setSectionPlaying(playKey)
    try {
      for (let i = 0; i < rows.length; i++) {
        if (runRef.current !== runId) return
        const row = rows[i]
        const lineKey = mode === 'mini' ? `v2-mini:${row.id}` : `v2-example:${row.id}`
        await speakWithFallback(
          row.text,
          lineKey,
          1,
          runId,
          row.audioAssetId,
          mode === 'mini' ? resolvePlaybackVoice('dialogue', row.role) : resolvePlaybackVoice('solo')
        )
        if (i < rows.length - 1) await sleep(800)
      }
      if (runRef.current === runId) setAudioMsg('连续播放已完成')
    } catch (err) {
      if (runRef.current === runId) setAudioMsg(`播放中断：${String(err?.message || err)}`)
    } finally {
      if (runRef.current === runId) setSectionPlaying('')
    }
  }
  function openLearnSearchFromHeader() {
    setQuery('')
    setLibrarySubTab('courses')
    setLibraryMode('list')
    setTab('library')
  }
  async function playLearnCourseAudio() {
    if (!activeDialogueLines.length) {
      setAudioMsg('当前课程还没有可播放的对话。')
      return
    }
    await playV2DialogueAll()
  }
  function addLearnItemToReview(payload = {}) {
    if (!activeCourse) return
    const text = cleanLineText(payload.text || '')
    if (!text) return
    const refId = cleanLineText(payload.refId || text)
    updateV2Store(prev => {
      const exists = prev.reviewItems.some(item => item.userId === prev.activeUserId && item.courseId === activeCourse.id && item.refId === refId)
      if (exists) return prev
      const now = Date.now()
      const reviewItem = {
        id: `rv2_${uid()}`,
        userId: prev.activeUserId,
        courseId: activeCourse.id,
        refId,
        type: payload.type || 'expression',
        text,
        translation: cleanLineText(payload.translation || ''),
        sourceStep: cleanLineText(payload.sourceStep || learnSubTab || 'learn'),
        nextReviewAt: now + 24 * 60 * 60 * 1000,
        createdAt: now,
        updatedAt: now
      }
      return { ...prev, reviewItems: [reviewItem, ...prev.reviewItems] }
    })
  }
  function markLearnExpressionSaved(itemId) {
    setLearnSavedMap(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }
  function addLearnExpressionToPractice(item) {
    if (!item) return
    const stepId = item.type === 'pattern' ? 'patterns' : item.type === 'useful_sentence' ? 'reaction' : 'vocabulary'
    if (item.type === 'pattern') setPracticeSubTab('substitution')
    else if (item.type === 'useful_sentence') setPracticeSubTab('quick_response')
    else setPracticeSubTab('spelling')
    setLearnPracticeAddedMap(prev => ({ ...prev, [item.id]: true }))
    setPracticeStep(stepId)
    setAudioMsg('已加入 Practice。')
  }
  function addLearnExpressionToReview(item) {
    if (!item) return
    setLearnReviewAddedMap(prev => ({ ...prev, [item.id]: true }))
    addLearnItemToReview({
      refId: `exp:${item.id}`,
      text: item.text,
      translation: item.meaning,
      type: item.type || 'expression',
      sourceStep: 'expressions'
    })
    setAudioMsg('已加入 Review。')
  }
  function addLearnDialogueLineToPractice(line) {
    if (!line) return
    setPracticeSubTab('quick_response')
    setPracticeStep('reaction')
    setAudioMsg('该句已送入快反训练。')
  }
  function addLearnDialogueLineToReview(line) {
    if (!line) return
    setLearnReviewAddedMap(prev => ({ ...prev, [line.id]: true }))
    addLearnItemToReview({
      refId: `dlg:${line.id}`,
      text: line.text,
      translation: line.translation,
      type: 'dialogue',
      sourceStep: 'dialogue'
    })
    setAudioMsg('该句已加入 Review。')
  }
  function moveQuickReactionNext() {
    if (!activeReactionItems.length) return
    setReactionReveal(false)
    setReactionIndex(index => Math.min(index + 1, activeReactionItems.length - 1))
  }
  async function playQuickReactionPrompt(item) {
    if (!item) return
    const promptText = cleanLineText(item.promptEn || item.answer || '')
    if (!promptText) {
      setAudioMsg('当前快反缺少英文提示，无法播放。')
      return
    }
    stopAllAudio()
    const runId = ++runRef.current
    await speakWithFallback(promptText, `v2-reaction:${item.id}`, 1, runId, item.audioAssetId, resolvePlaybackVoice('quick'))
  }
  async function quickReactionSubmitAndNext() {
    if (!activeQuickReactionItem) return
    setReactionReveal(true)
    if (!reactionAutoNext) return
    const currentIndex = Math.min(reactionIndex, Math.max(0, activeReactionItems.length - 1))
    const nextIndex = Math.min(currentIndex + 1, Math.max(0, activeReactionItems.length - 1))
    const shouldPlayPrompt = reactionMode === 'audio' || reactionMode === 'conversation'
    if (shouldPlayPrompt) await playQuickReactionPrompt(activeQuickReactionItem)
    window.setTimeout(() => {
      setReactionReveal(false)
      setReactionIndex(nextIndex)
      if (shouldPlayPrompt && nextIndex > currentIndex) {
        const nextItem = activeReactionItems[nextIndex]
        if (nextItem) {
          window.setTimeout(() => { playQuickReactionPrompt(nextItem) }, 120)
        }
      }
    }, 900)
  }
  function moveGuidedTurn(offset) {
    if (!activeGuidedTurns.length) return
    setGuidedTurnIndex(index => Math.max(0, Math.min(activeGuidedTurns.length - 1, index + offset)))
  }

  function guidedDraftFeedback(turn, draftText) {
    const typed = cleanLineText(draftText || '').toLowerCase()
    if (!typed) return ''
    const keywords = cleanLineText(turn?.sampleAnswer || '')
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter(word => word.length >= 4)
      .slice(0, 6)
    if (!keywords.length) return 'Saved ✅'
    const matched = keywords.filter(word => typed.includes(word)).length
    return matched >= Math.max(1, Math.ceil(keywords.length / 3))
      ? 'Good direction ✅'
      : 'Try using more lesson words.'
  }

  function getSpeechRecognitionCtor() {
    if (typeof window === 'undefined') return null
    return window.SpeechRecognition || window.webkitSpeechRecognition || null
  }

  function stopSpeechInput(cancelCommit = false) {
    const rec = recognitionRef.current
    if (cancelCommit) recognitionCommitRef.current = null
    try { rec?.stop?.() } catch {}
    if (cancelCommit) {
      try { rec?.abort?.() } catch {}
    }
    recognitionRef.current = null
    setRecordingTarget('')
    setRecordingTranscript('')
    recordingTranscriptRef.current = ''
  }

  function startSpeechInput(targetKey, seedText, onCommit) {
    const SpeechCtor = getSpeechRecognitionCtor()
    if (!SpeechCtor) {
      setRecordingError('Speech input is not supported on this browser.')
      setAudioMsg('Record is unavailable on this browser. Try Chrome.')
      return
    }
    if (recordingTarget === targetKey) {
      stopSpeechInput(false)
      return
    }
    try {
      if (recognitionRef.current) {
        recognitionCommitRef.current = null
        recognitionRef.current.abort?.()
      }
    } catch {}

    const recognition = new SpeechCtor()
    recognitionRef.current = recognition
    recognitionCommitRef.current = finalText => {
      const merged = cleanLineText(`${seedText ? `${seedText} ` : ''}${finalText || ''}`.trim())
      if (merged) onCommit(merged)
    }
    setRecordingTarget(targetKey)
    setRecordingTranscript('')
    recordingTranscriptRef.current = ''
    setRecordingError('')
    recognition.lang = 'en-AU'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognition.onresult = event => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += `${event.results[i]?.[0]?.transcript || ''} `
      }
      const normalized = cleanLineText(transcript)
      recordingTranscriptRef.current = normalized
      setRecordingTranscript(normalized)
    }
    recognition.onerror = event => {
      const message = String(event?.error || 'Speech recognition failed.')
      setRecordingError(message)
      setAudioMsg(`Record failed: ${message}`)
    }
    recognition.onend = () => {
      const finalTranscript = cleanLineText(recordingTranscriptRef.current || '')
      const commit = recognitionCommitRef.current
      recognitionCommitRef.current = null
      recognitionRef.current = null
      setRecordingTarget('')
      if (finalTranscript && commit) commit(finalTranscript)
      setRecordingTranscript('')
      recordingTranscriptRef.current = ''
    }
    try {
      recognition.start()
      setAudioMsg('Recording... Speak now.')
    } catch (err) {
      recognitionRef.current = null
      recognitionCommitRef.current = null
      setRecordingTarget('')
      setRecordingError(String(err?.message || err))
    }
  }

  function replayLast() {
    if (!lastAudioClip) return
    playClipNow(lastAudioClip.audio, lastAudioClip.text, lastAudioClip.id)
  }

  async function playList(list) {
    if (!list.length) {
      setAudioMsg('No items to play.')
      return
    }
    stopAllAudio()
    const runId = ++runRef.current
    setIsListPlaying(true)
    try {
      await prepareContinuousPlayback()
      if (runRef.current !== runId) return
      for (let i = 0; i < list.length; i++) {
        if (runRef.current !== runId) return
        const card = list[i]
        const fresh = normalizeCard(cards.find(c => c.id === card.id) || card)
        setAudioMsg(`Playlist ${i + 1}/${list.length}: ${fresh.content}`)
        let clip
        try {
          clip = await ensureAudioOnly(fresh, 'content')
        } catch (err) {
          setAudioMsg(`Skipped one audio: ${String(err.message || err)}`)
          await sleep(700)
          continue
        }
        if (runRef.current !== runId) return
        setPlayingId(`${fresh.id}:content`)
        try {
          await playAudioBufferUrl(clip.audio, clip.text, runId)
        } catch (err) {
          const message = String(err.message || err)
          if (/not allowed|permission|user agent|interrupted/i.test(message)) {
            setAudioMsg('Playlist stopped: phone browser blocked continuous playback. Tap Play List again, or prepare audio first.')
            break
          }
          setAudioMsg(`Skipped one playback: ${message}`)
          await sleep(700)
          continue
        } finally {
          releasePlayableAudio(clip.audio)
        }
        if (runRef.current !== runId) return
        await sleep(Math.max(400, Number(settings.pauseSeconds || 1.5) * 1000))
      }
      if (runRef.current === runId) setAudioMsg('Playlist finished ✅')
    } catch (err) {
      if (runRef.current === runId) setAudioMsg(`Playlist stopped: ${String(err.message || err)}`)
    } finally {
      if (runRef.current === runId) {
        setPlayingId(null)
        setIsListPlaying(false)
        setAudioBusy(false)
      }
    }
  }

  function canPrepareMore(budget) {
    return !budget || Number(budget.remaining || 0) > 0
  }

  function markPreparedClip(budget) {
    if (!budget) return
    budget.remaining = Math.max(0, Number(budget.remaining || 0) - 1)
    budget.done = Number(budget.done || 0) + 1
  }

  async function prepareCard(card, budget = null) {
    let updated = normalizeCard(card)
    if (!canPrepareMore(budget)) return updated
    if (!updated.contentAudio || !(await audioExists(updated.contentAudio))) {
      if (!canPrepareMore(budget)) return updated
      const audioBlob = await openAiVoiceBlob(updated.content, settings.contentVoice || settings.voice)
      updated.contentAudio = await storeAudioClip(updated.id, 'content', 'main', audioBlob)
      markPreparedClip(budget)
      await sleep(180)
    } else if (isInlineAudio(updated.contentAudio)) {
      updated.contentAudio = await storeAudioClip(updated.id, 'content', 'main', updated.contentAudio)
    }
    if (['SENTENCE', 'DIALOGUE'].includes(cardType(updated))) {
      const dialogueAudios = Array.isArray(updated.dialogueAudios) ? [...updated.dialogueAudios] : []
      const lines = makeDialogue(updated)
      for (let i = 0; i < lines.length; i++) {
        if (!canPrepareMore(budget)) break
        if (!dialogueAudios[i] || !(await audioExists(dialogueAudios[i]))) {
          const audioBlob = await openAiVoiceBlob(dialogueAudioText(lines[i].text), settings.exampleVoice || settings.voice)
          dialogueAudios[i] = await storeAudioClip(updated.id, 'dialogue', i, audioBlob)
          markPreparedClip(budget)
          await sleep(180)
        } else if (isInlineAudio(dialogueAudios[i])) {
          dialogueAudios[i] = await storeAudioClip(updated.id, 'dialogue', i, dialogueAudios[i])
        }
      }
      updated.dialogueAudios = dialogueAudios
    } else {
      const examples = []
      for (let i = 0; i < (updated.examples || []).length; i++) {
        const ex = updated.examples[i]
        if (!canPrepareMore(budget)) {
          examples.push(ex)
          continue
        }
        if (!ex.audio || !(await audioExists(ex.audio))) {
          const audioBlob = await openAiVoiceBlob(ex.text, settings.exampleVoice || settings.voice)
          examples.push({ ...ex, audio: await storeAudioClip(updated.id, 'example', i, audioBlob) })
          markPreparedClip(budget)
          await sleep(180)
        } else if (isInlineAudio(ex.audio)) {
          examples.push({ ...ex, audio: await storeAudioClip(updated.id, 'example', i, ex.audio) })
        } else {
          examples.push(ex)
        }
      }
      updated.examples = examples
    }
    updated.updatedAt = Date.now()
    return updated
  }
  async function prepareCards(list) {
    try {
      setAudioBusy(true)
      setAudioMsg('Checking audio cache...')
      const missing = []
      for (const card of list) {
        if (!(await hasPlayableAudio(card))) missing.push(card)
        if (missing.length >= PREPARE_BATCH_SIZE) break
        await sleep(20)
      }
      if (!missing.length) { setAudioMsg('All audio ready ✅'); return }
      const batch = missing.slice(0, PREPARE_BATCH_SIZE)
      const budget = { remaining: PREPARE_CLIPS_PER_RUN, done: 0 }
      let latest = [...cards]
      let failed = 0
      for (let i = 0; i < batch.length; i++) {
        setAudioMsg(`Preparing audio ${i + 1}/${batch.length} (${missing.length} waiting): ${batch[i].content}`)
        let prepared = null
        try {
          prepared = await prepareCard(batch[i], budget)
        } catch (err) {
          failed += 1
          console.warn('Prepare audio failed for one card', err)
          continue
        }
        latest = latest.map(c => c.id === prepared.id ? prepared : c)
        setCards(latest)
        await sleep(250)
      }
      const preparedCount = batch.length - failed
      setAudioMsg(budget.remaining <= 0 || list.length > batch.length
        ? `Prepared ${budget.done || preparedCount} audio clip(s). Tap Prepare Source Audio again to continue. ✅`
        : failed ? `Audio prepared with ${failed} failed item(s). ✅` : 'Audio Ready ✅')
    } catch (err) {
      setSettings(s => ({ ...s, lastError: String(err.message || err), openaiStatus: 'Failed ❌' }))
      setAudioMsg(`Audio failed: ${String(err.message || err)}`)
    } finally { setAudioBusy(false) }
  }

  function addToLearn(list) {
    const ids = list.map(x => x.id)
    setQueue(prev => [...new Set([...ids, ...prev])])
    setLearnScope('QUEUE')
    setLearnMode('NEW')
    setStageListOpen(true)
    setTab('learn')
    setSourceView(null)
    setSelected(null)
    setAudioMsg('Added to Queue. Open Queue in Learn. ✅')
  }

  function importCards(parsed) {
    if (!parsed.length) { alert('没有识别到可导入内容。'); return }
    const existingByKey = new Map(cards.map(c => [importKey(c), c]))
    const seenIncoming = new Set()
    const fresh = []
    const updated = []
    let skipped = 0

    const nextCards = [...cards]
    for (const incoming of parsed) {
      const key = importKey(incoming)
      if (seenIncoming.has(key)) {
        skipped += 1
        continue
      }
      seenIncoming.add(key)
      const old = existingByKey.get(key)
      if (old) {
        const keepOldDialogue = old.dialogue && old.dialogue.length && !isAutoGeneratedDialogue(old)
        const incomingHasDialogue = incoming.dialogue && incoming.dialogue.length
        const dialogueUnchanged = incomingHasDialogue && sameDialogueLines(old.dialogue || [], incoming.dialogue || [])
        const merged = normalizeCard({
          ...old,
          type: incoming.type || old.type,
          content: incoming.content || old.content,
          meaning: incoming.meaning || old.meaning,
          pattern: incoming.pattern || old.pattern,
          dialogue: incomingHasDialogue ? incoming.dialogue : (keepOldDialogue ? old.dialogue : []),
          dialogueAudios: incomingHasDialogue ? (dialogueUnchanged ? old.dialogueAudios : []) : (keepOldDialogue ? old.dialogueAudios : []),
          examples: (incoming.examples && incoming.examples.length) ? incoming.examples : old.examples,
          source: incoming.source || old.source,
          category: incoming.category || old.category,
          tags: (incoming.tags && incoming.tags.length) ? incoming.tags : old.tags,
          updatedAt: Date.now()
        })
        const idx = nextCards.findIndex(c => c.id === old.id)
        if (idx >= 0) nextCards[idx] = { ...merged, id: old.id, contentAudio: old.contentAudio || merged.contentAudio }
        updated.push(nextCards[idx >= 0 ? idx : 0])
      } else {
        fresh.push(incoming)
        nextCards.unshift(incoming)
        existingByKey.set(key, incoming)
      }
    }

    setCards(nextCards)
    const queueIds = [...fresh.map(c => c.id), ...updated.map(c => c.id).filter(Boolean)]
    setQueue(prev => [...new Set([...queueIds, ...prev])])
    const first = fresh[0] || updated[0] || parsed[0]
    if (first?.source) setLearnSource(first.source)
    setLearnScope('CURRENT')
    setImportMsg(`Import ready: ${fresh.length} new, ${updated.length} updated${skipped ? `, ${skipped} repeated skipped` : ''}. Added to Learn.`)
    setAudioMsg(`Import ready: ${fresh.length} new, ${updated.length} updated${skipped ? `, ${skipped} repeated skipped` : ''}. ✅`)
    setLearnMode('NEW')
    setTab('learn')
  }
  async function importFile(file) {
    if (!file) return
    const text = await file.text()
    updateImportText(text)
    const meta = detectImportMeta(text, { source: importMeta.source, category: importMeta.category, type: importMeta.type, tagsText: importMeta.tagsText })
    setImportMeta(prev => ({ ...prev, source: meta.source || prev.source, category: meta.category || prev.category, type: meta.type || prev.type, tagsText: meta.tagsText || prev.tagsText }))
    setImportMsg(`File loaded. Preview found ${parseImportText(text, { source: meta.source, category: meta.category, type: meta.type, tags: meta.tags }).length} items.`)
  }
  function saveEdit(draft) {
    const examples = draft.examplesText.split('\n').map((text, i) => {
      const old = draft.examples[i]
      const parsed = splitEnglishChinese(text)
      return { id: old?.id || uid(), text: parsed.en, cn: parsed.cn, audio: old?.audio || '' }
    }).filter(x => x.text)
    const oldDialogue = Array.isArray(draft.dialogue) ? draft.dialogue : []
    const dialogue = String(draft.dialogueText || '').split('\n').map((text, i) => {
      const parsed = splitEnglishChinese(text)
      return { id: oldDialogue[i]?.id || uid(), text: cleanLineText(parsed.en), cn: parsed.cn }
    }).filter(x => x.text)
    const dialogueAudios = sameDialogueLines(oldDialogue, dialogue) ? draft.dialogueAudios : []
    const updated = normalizeCard({
      ...draft,
      examples,
      dialogue,
      dialogueAudios,
      tags: draft.tagsText.split(',').map(x => x.trim()).filter(Boolean),
      updatedAt: Date.now()
    })
    setCards(cards.map(c => c.id === updated.id ? updated : c))
    setEditing(null)
  }

  const sourceCards = sourceView ? cards.filter(c => c.source === sourceView) : []
  const selectedFresh = selected ? normalizeCard(cards.find(c => c.id === selected.id) || selected) : null
  const selectedIndex = selectedFresh ? visibleLearnCards.findIndex(c => c.id === selectedFresh.id) : -1
  const selectedDialogueRoles = selectedFresh ? dialogueRoles(selectedFresh) : []
  const selectedDialogueRecallItems = selectedFresh ? (() => {
    const rows = makeDialogue(selectedFresh).map((line, lineIndex) => ({ ...parseDialogueLine(line), lineIndex })).filter(line => line.text)
    const kevinRows = rows.filter(line => /^kevin$/i.test(line.speaker || ''))
    return kevinRows.length ? kevinRows : rows
  })() : []
  const activeDialogueRecall = selectedDialogueRecallItems[Math.min(dialogueRecallIndex, Math.max(0, selectedDialogueRecallItems.length - 1))]
  const activeRolePlayRole = rolePlayRole && selectedDialogueRoles.includes(rolePlayRole)
    ? rolePlayRole
    : (selectedDialogueRoles[1] || selectedDialogueRoles[0] || '')
  useEffect(() => {
    if (selectedFresh) {
      setIsRolePlaying(false)
      const roles = dialogueRoles(selectedFresh)
      if (roles.length && !roles.includes(rolePlayRole)) setRolePlayRole(roles[1] || roles[0])
    }
  }, [selectedFresh?.id])
  const reviewCount = due.length
  function visiblePrimary(card, idx = null) {
    if (displayMode === 'CN') return card.meaning || card.content
    if (displayMode === 'HIDDEN') return 'Listen & Recall'
    return card.content
  }
  function visibleSecondary(card) {
    if (displayMode === 'BOTH') return card.meaning
    return ''
  }
  function bilingualParts(en, cn) {
    if (displayMode === 'CN') return { primary: cn || 'No Chinese yet.', secondary: '' }
    if (displayMode === 'HIDDEN') return { primary: 'Listen & Recall', secondary: cn || '' }
    if (displayMode === 'BOTH') return { primary: en || '', secondary: cn || '' }
    return { primary: en || '', secondary: '' }
  }
  function exampleParts(ex) {
    return bilingualParts(ex.text || '', ex.cn || '')
  }
  function dialogueParts(line) {
    const parsed = parseDialogueLine(line)
    return { ...parsed, ...bilingualParts(parsed.text, parsed.cn) }
  }
  function setStudyMode(mode) {
    stopAllAudio()
    setRecallShown(false)
    setSettings(prev => ({ ...prev, studyMode: mode }))
  }
  function checkSpelling() {
    const expected = cleanLineText(selectedFresh?.content || '').toLowerCase()
    const actual = cleanLineText(spellingAnswer || '').toLowerCase()
    setSpellingResult(actual && actual === expected ? 'Correct ✅' : 'Try again. Check the answer above.')
  }
  async function playActiveDialogueRecall() {
    if (!selectedFresh || !activeDialogueRecall) return
    await handlePlayDialogue(selectedFresh, activeDialogueRecall.lineIndex)
  }
  function nextDialogueRecall() {
    setRecallShown(false)
    setDialogueRecallIndex(index => Math.min(index + 1, Math.max(0, selectedDialogueRecallItems.length - 1)))
  }
  function rateDialogueRecall(rating) {
    rateSelected(rating, false)
    nextDialogueRecall()
  }
  function goToOffset(offset) {
    if (selectedIndex < 0) return
    const next = visibleLearnCards[selectedIndex + offset]
    if (!next) return
    stopAllAudio()
    setSelected(next)
  }
  function rateSelected(rating, moveNext = false) {
    if (!selectedFresh) return
    const updated = updateSchedule(selectedFresh, rating)
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
    const nextText = formatReviewDate(updated.nextReviewAt)
    setAudioMsg(rating === 'Again' ? `Again saved. Review ${nextText}.` : `Good saved. Review ${nextText}. ✅`)
    if (moveNext) {
      const next = visibleLearnCards[selectedIndex + 1]
      stopAllAudio()
      if (next) setSelected(next)
      else {
        setSelected(null)
        setAudioMsg('Done for now. Review schedule updated. ✅')
      }
    }
  }
  function updateImportText(text) {
    setImportText(text)
    const meta = detectImportMeta(text, { source: importMeta.source, category: importMeta.category, type: importMeta.type, tagsText: importMeta.tagsText })
    setImportMeta(prev => ({ ...prev, source: meta.source || prev.source, category: meta.category || prev.category, type: meta.type || prev.type, tagsText: meta.tagsText || prev.tagsText }))
    setImportMsg('')
  }
  async function copyFormatPrompt() {
    try {
      await navigator.clipboard.writeText(chatGptFormatPrompt)
      setImportMsg('格式要求已复制。可以直接粘贴给 ChatGPT。')
    } catch {
      setImportText(chatGptFormatPrompt)
      setImportMsg('浏览器不允许自动复制。我已放到输入框里，可以手动复制。')
    }
  }
  function chooseTrainingStage(stage) {
    stopAllAudio()
    const stageCards = stageCardsFor(stage.id, learnBaseCards)
    setTrainingStage(stage.id)
    setLearnMode('NEW')
    setLearnScope('CURRENT')
    setLearnType(stage.learnType)
    setSelected(null)
    setRecallShown(false)
    setSettings(prev => ({ ...prev, studyMode: stage.mode || 'LISTEN' }))
    if (stage.id === 'DIALOGUE' && stageCards.length) {
      setStageListOpen(false)
      setSelected(stageCards[0])
      setAudioMsg('Theme Dialogue opened.')
      return
    }
    setStageListOpen(true)
    setAudioMsg(stageCards.length ? `Stage ${stage.number}: ${stage.caption}` : `No content yet for Stage ${stage.number}.`)
  }
  async function copyStageSixPrompt() {
    const promptText = buildStageSixPrompt(currentSourceName || 'Current Topic', learnBaseCards)
    try {
      await navigator.clipboard.writeText(promptText)
      setAudioMsg('第 6 阶段 ChatGPT 语音对话指令已复制。✅')
    } catch {
      setImportText(promptText)
      setLibrarySubTab('import')
      setLibraryMode('paste')
      setTab('library')
      setImportMsg('浏览器不允许自动复制。我已把第 6 阶段指令放到 Import 输入框，可以手动复制。')
    }
  }
  function renameSource(oldName) {
    const name = prompt('New source name:', oldName)
    if (!name || name.trim() === oldName) return
    const nextName = name.trim()
    setCards(prev => prev.map(c => c.source === oldName ? { ...c, source: nextName, updatedAt: Date.now() } : c))
    if (learnSource === oldName) setLearnSource(nextName)
    setSourceView(nextName)
  }
  function deleteSource(name) {
    if (!confirm(`Delete source "${name}" and all its items?`)) return
    const ids = new Set(cards.filter(c => c.source === name).map(c => c.id))
    setCards(prev => prev.filter(c => c.source !== name))
    setQueue(prev => prev.filter(id => !ids.has(id)))
    if (learnSource === name) setLearnSource('ALL')
    setSourceView(null)
    setAudioMsg('Source deleted.')
  }
  const progressDoneCount = activeProgress ? PRACTICE_STEPS.filter(step => activeProgress[step.id] === 'done').length : 0
  const currentProgressStepId = activeProgress ? PRACTICE_STEPS.find(step => activeProgress[step.id] === 'current')?.id : ''
  const nextStep = PRACTICE_STEPS.find(step => step.id === (currentProgressStepId || activeProgress?.lastStep || v2Store.activePracticeStep)) || PRACTICE_STEPS[0]
  const learnPathRows = useMemo(() => {
    if (!activeProgress) return []
    const expressionStatusList = ['vocabulary', 'chunks', 'patterns', 'useful_sentences'].map(id => activeProgress[id] || 'not_started')
    const expressionStatus = expressionStatusList.every(status => status === 'done')
      ? 'done'
      : expressionStatusList.some(status => status === 'current' || status === 'done')
        ? 'current'
        : 'not_started'
    return [
      { id: 'background', title: '背景', action: 'background', status: activeProgress.background || 'not_started', icon: '✓' },
      { id: 'dialogue', title: '对话', action: 'dialogue', status: activeProgress.dialogue || 'not_started', icon: '✓' },
      { id: 'shadowing', title: '跟读', action: 'shadowing', status: activeProgress.shadowing || 'not_started', icon: '🎙️' },
      { id: 'expressions', title: '表达', action: 'vocabulary', status: expressionStatus, icon: '✨' },
      { id: 'reaction', title: '快反', action: 'reaction', status: activeProgress.reaction || 'not_started', icon: '✓' },
      { id: 'spelling', title: '拼写', action: 'spelling', status: activeProgress.spelling || 'not_started', icon: '📝' },
      { id: 'guided', title: '半控制对话', action: 'guided', status: activeProgress.guided || 'not_started', icon: '💬' }
    ]
  }, [activeProgress])
  const groupedDoneCount = learnPathRows.filter(item => item.status === 'done').length
  const groupedCurrentCount = learnPathRows.filter(item => item.status === 'current').length
  const learnProgressPercent = Math.round(((groupedDoneCount + groupedCurrentCount * 0.5) / Math.max(1, learnPathRows.length || 1)) * 100)
  const learnCurrentStepIndex = Math.max(1, learnPathRows.findIndex(item => item.status === 'current') + 1 || groupedDoneCount + 1)
  const groupedNextStep = learnPathRows.find(item => item.status !== 'done') || learnPathRows[learnPathRows.length - 1] || { title: nextStep.title, action: nextStep.id }
  const showChineseInPractice = displayMode !== 'EN' && displayMode !== 'HIDDEN'
  const expressionStepToTab = { vocabulary: 'vocab', chunks: 'chunk', patterns: 'pattern', useful_sentences: 'useful_sentence' }
  const groupedActivePracticeStep = ['vocabulary', 'chunks', 'patterns', 'useful_sentences'].includes(v2Store.activePracticeStep) ? 'vocabulary' : v2Store.activePracticeStep
  const currentExpressionTab = expressionStepToTab[v2Store.activePracticeStep] || expressionTab
  const currentExpressionItems = expressionGroups[currentExpressionTab] || []
  const learnExpressionItems = useMemo(() => {
    if (learnExpressionFilter === 'all') return activeExpressions
    return activeExpressions.filter(item => item.type === learnExpressionFilter)
  }, [activeExpressions, learnExpressionFilter])
  const learnDialogueCount = activeDialogueLines.length
  const learnExpressionCount = activeExpressions.length
  const learnReviewCount = v2Store.reviewItems.filter(item => item.userId === v2Store.activeUserId).length
  const learnBackgroundScene = cleanLineText(activeBlock?.background?.SCENE_EN || activeBlock?.background?.SCENE_CN || activeCourse?.title || '')
  const learnBackgroundPeople = cleanLineText(activeBlock?.background?.PEOPLE_RELATION_EN || activeBlock?.background?.PEOPLE_RELATION_CN || activeBlock?.background?.RELATIONSHIP_EN || activeBlock?.background?.RELATIONSHIP_CN || '')
  const learnBackgroundContext = cleanLineText(activeBlock?.background?.AUSTRALIA_CONTEXT_EN || activeBlock?.background?.AUSTRALIA_CONTEXT_CN || '')
  const learnBackgroundGoal = cleanLineText(activeBlock?.background?.COMMUNICATION_GOAL_EN || activeBlock?.background?.COMMUNICATION_GOAL_CN || activeCourse?.goal || '')
  const learnBackgroundGrammar = cleanLineText(activeBlock?.background?.GRAMMAR || '')
  const learnBackgroundListenFor = cleanLineText(activeBlock?.background?.LISTEN_FOR || '')
  const learnBackgroundTransfer = cleanLineText(activeBlock?.background?.DAILY_TRANSFER_EN || activeBlock?.background?.DAILY_TRANSFER_CN || '')
  const spellingSourceOptions = [
    ['vocab', '词汇'],
    ['chunk', '语块'],
    ['sentence', '句子'],
    ['dialogue', '对话']
  ]
  const spellingModeOptions = [
    ['copy', '英文打'],
    ['audio', '音频打'],
    ['hidden', '中文打']
  ]
  const spellingFocusOptions = [
    ['all', 'All'],
    ['wrong_before', '#Wrong'],
    ['weak_items', '#Weak'],
    ['starred', '★']
  ]
  const expressionFlowOrder = [
    { tab: 'vocab', stepId: 'vocabulary', label: '词汇' },
    { tab: 'chunk', stepId: 'chunks', label: '语块' },
    { tab: 'pattern', stepId: 'patterns', label: '句型' },
    { tab: 'useful_sentence', stepId: 'useful_sentences', label: '实用句子' }
  ]
  const practiceModuleFlow = [
    { id: 'quick_response', label: '快反', stepId: 'reaction' },
    { id: 'spelling', label: '拼写', stepId: 'spelling' },
    { id: 'substitution', label: '替换', stepId: 'patterns' },
    { id: 'completion', label: '补全', stepId: 'guided' }
  ]
  const practiceModuleIndex = Math.max(0, practiceModuleFlow.findIndex(item => item.id === practiceSubTab))
  const practiceModuleCurrent = practiceModuleFlow[practiceModuleIndex] || practiceModuleFlow[0]
  const practiceModulePrev = practiceModuleFlow[Math.max(0, practiceModuleIndex - 1)] || practiceModuleCurrent
  const practiceModuleNext = practiceModuleFlow[Math.min(practiceModuleFlow.length - 1, practiceModuleIndex + 1)] || practiceModuleCurrent
  const practiceModuleCurrentStatus = activeProgress?.[practiceModuleCurrent.stepId] || 'not_started'
  const practiceModuleStatusLabel = practiceModuleCurrentStatus === 'done' ? '已完成' : practiceModuleCurrentStatus === 'current' ? '进行中' : '未开始'
  const expressionFlowIndex = Math.max(0, expressionFlowOrder.findIndex(item => item.tab === currentExpressionTab))
  const expressionNextItem = expressionFlowOrder[Math.min(expressionFlowOrder.length - 1, expressionFlowIndex + 1)] || expressionFlowOrder[expressionFlowOrder.length - 1]
  const expressionNextLabel = currentExpressionTab === 'useful_sentence' ? '去快反训练' : `Next ${expressionNextItem.label}`
  const outputChatPrompt = useMemo(() => {
    const learnerName = cleanLineText(activeAccount?.name || activeUser?.name || 'Learner')
    const scenario = cleanLineText(activeTalk?.scenarioEn || activeBlock?.background?.SCENE_EN || activeCourse?.title || 'daily conversation')
    const aiRole = cleanLineText(activeTalk?.aiRole || 'Staff')
    const userRole = cleanLineText(activeTalk?.userRole || learnerName)
    const expressions = (activeTalk?.helpfulExpressions || []).slice(0, 6).join('; ')
    return `Please run a short spoken role-play in simple natural Australian English.
Scenario: ${scenario}
AI role: ${aiRole}
My role: ${userRole}
Use these expressions where possible: ${expressions || 'natural daily English only'}
Ask one question at a time and wait for my reply. Keep each turn short.`
  }, [activeAccount?.name, activeUser?.name, activeTalk, activeBlock?.background?.SCENE_EN, activeCourse?.title])
  const hasExplicitNamedDialogueRole = useMemo(() => activeDialogueLines.some(line => {
    const role = cleanLineText(line.role || '')
    return role && !/^[A-C]$/i.test(role)
  }), [activeDialogueLines])
  const activeLikelyDialogue = useMemo(
    () => inferLikelyDialogue(
      activeDialogueLines.map(line => line.text || ''),
      activeDialogueLines.map(line => line.role || '')
    ),
    [activeDialogueLines]
  )
  const getDialogueLineLabel = (line, index) => {
    const role = cleanLineText(line.role || '')
    if (hasExplicitNamedDialogueRole) return role || ['A', 'B', 'C'][index % 3]
    if (activeLikelyDialogue) return role || ['A', 'B', 'C'][index % 3]
    return String(index + 1)
  }
  const getMiniDialogueLineLabel = (lines, line, index) => {
    const rows = Array.isArray(lines) ? lines : []
    const role = cleanLineText(line?.role || '')
    const hasNamedRole = rows.some(item => {
      const value = cleanLineText(item?.role || '')
      return value && !/^[A-C]$/i.test(value)
    })
    if (hasNamedRole) return role || ['A', 'B', 'C'][index % 3]
    const likelyDialogue = inferLikelyDialogue(rows.map(item => item?.text || ''), rows.map(item => item?.role || ''))
    if (likelyDialogue) return role || ['A', 'B', 'C'][index % 3]
    return String(index + 1)
  }
  const topFolderLookup = Object.fromEntries(topFolders.map(folder => [folder.id, folder]))
  const subFolderLookup = Object.fromEntries(subFolders.map(folder => [folder.id, folder]))
  const folderGroupedCourses = topFolders.map(top => ({
    top,
    topCourses: v2Courses.filter(course => course.topFolderId === top.id && !course.subFolderId),
    children: subFolders.filter(sub => sub.parentId === top.id).map(sub => ({
      sub,
      courses: v2Courses.filter(course => course.subFolderId === sub.id)
    }))
  }))
  const rootCourses = v2Courses.filter(course => !course.topFolderId && !course.subFolderId)
  const folderPathText = course => {
    if (!course?.topFolderId && !course?.subFolderId) return '未分类'
    const topName = topFolderLookup[course.topFolderId]?.name || ''
    const subName = subFolderLookup[course.subFolderId]?.name || ''
    return subName ? `${topName} / ${subName}` : topName || '未分类'
  }
  const libraryQueryText = query.trim().toLowerCase()
  const filteredV2Courses = v2Courses.filter(course => {
    if (!libraryQueryText) return true
    const searchBase = `${course.title} ${course.book} ${course.category} ${course.level} ${folderPathText(course)}`.toLowerCase()
    return searchBase.includes(libraryQueryText)
  })
  const libraryDisplayCourses = [...filteredV2Courses].sort((a, b) => {
    if (a.id === activeCourse?.id) return -1
    if (b.id === activeCourse?.id) return 1
    return (b.updatedAt || '').localeCompare(a.updatedAt || '')
  })
  const libraryShelfNames = [...new Set(libraryDisplayCourses.map(course => {
    if (course.subFolderId) return subFolderLookup[course.subFolderId]?.name || ''
    if (course.topFolderId) return topFolderLookup[course.topFolderId]?.name || ''
    return ''
  }).filter(Boolean))]
  const reviewV2Items = useMemo(
    () => v2Store.reviewItems.filter(item => item.userId === v2Store.activeUserId),
    [v2Store.reviewItems, v2Store.activeUserId]
  )
  const libraryStats = useMemo(() => {
    const blocks = v2Store.contentBlocks.filter(block => block.userId === v2Store.activeUserId)
    const expressionCount = blocks.reduce((sum, block) => sum + (block.expressions?.length || 0), 0)
    const quickReactionCount = blocks.reduce((sum, block) => sum + (block.quickReaction?.length || 0), 0)
    const dialogueLineCount = blocks.reduce((sum, block) => sum + (block.dialogue?.lines?.length || 0), 0)
    const cachedBlockCount = blocks.filter(block => block.audioCacheStatus === 'cached').length
    return {
      courseCount: v2Courses.length,
      folderCount: topFolders.length + subFolders.length,
      blockCount: blocks.length,
      cachedBlockCount,
      expressionCount,
      quickReactionCount,
      dialogueLineCount
    }
  }, [v2Store.contentBlocks, v2Store.activeUserId, v2Courses.length, topFolders.length, subFolders.length])
  const spellingMistakeItems = useMemo(
    () => Object.entries(spellingStats)
      .filter(([, stat]) => Number(stat?.wrong || 0) > 0)
      .map(([id, stat]) => ({ id, wrong: Number(stat?.wrong || 0), correct: Number(stat?.correct || 0) }))
      .sort((a, b) => b.wrong - a.wrong),
    [spellingStats]
  )
  const shadowReviewLines = useMemo(
    () => activeDialogueLines.filter(line => Number(line?.unaligned ? 1 : 0) > 0).slice(0, 20),
    [activeDialogueLines]
  )
  const setLearnSubTabWithState = (nextTab) => {
    if (nextTab !== 'overview') setSelected(null)
    setLearnSubTab(nextTab)
  }
  const librarySubTabsNode = <ModuleSubTabs items={LIBRARY_SUB_TABS} value={librarySubTab} onChange={setLibrarySubTab} />
  const editingImportedLine = audioImportResult?.lines?.find(line => line.id === lineAdjustState.lineId) || null
  const editingCourseLine = activeDialogueLines.find(line => line.id === lineAdjustState.lineId) || null
  const lineAdjustLine = editingImportedLine || editingCourseLine
  const lineAdjustIsImported = Boolean(editingImportedLine)
  const importPreviewPanel = parsedV2Import ? <div className="importPreview v2Preview">
    <div className="previewStats">
      <span><strong>{parsedV2Import.summary.dialogue}</strong> dialogue</span>
      <span><strong>{parsedV2Import.summary.vocabulary + parsedV2Import.summary.chunks}</strong> expressions</span>
      <span><strong>{parsedV2Import.summary.quickReaction}</strong> reactions</span>
      <span><strong>{parsedV2Import.summary.semiControlledTalk}</strong> talk</span>
    </div>
    <p>Course: {parsedV2Import.summary.title}</p>
    <small>User: {parsedV2Import.summary.user} · Type: {parsedV2Import.summary.contentType}</small>
  </div> : <div className="importPreview">
    <div className="previewStats">
      <span><strong>{importPreview.total}</strong> detected</span>
      <span><strong>{importPreview.fresh}</strong> new</span>
      <span><strong>{importPreview.updated}</strong> update</span>
      <span><strong>{importPreview.repeated}</strong> repeat</span>
    </div>
    <p>{importPreview.chunks} chunks · {importPreview.sentences} sentences · {importPreview.patterns} patterns · {importPreview.dialogues} dialogues</p>
    {importPreview.sources.length > 0 && <small>Source: {importPreview.sources.slice(0, 2).join(' · ')}{importPreview.sources.length > 2 ? ' +' + (importPreview.sources.length - 2) : ''}</small>}
    {importPreview.samples.length > 0 && <div className="sampleImportList">{importPreview.samples.map(card => <div key={card.id}><b>{card.content}</b><em>{chunkLabel(card.type)} · {card.category}</em></div>)}</div>}
    {importPreview.total === 0 && <small>No item detected yet. Paste Mandy V2 @@COURSE_START@@ content or legacy TYPE / CONTENT blocks.</small>}
  </div>
  const importPanel = <section className="page">
    {librarySubTabsNode}
    <div className="topbar"><button className="smallButton" onClick={() => { setLibraryMode('list'); setAddContentMode('') }}>Back</button><span>Paste Content</span></div>
    <h1>Paste ChatGPT Content</h1>
    <button className="secondary compactButton copyFormatButton" onClick={copyFormatPrompt}>Copy Theme Pack Format</button>
    <div className="formatGuide">
      <h2>Mandy V2 Format</h2>
      <p>Paste standard @@COURSE_START@@ content for the new course model, or use the older TYPE / CONTENT format for legacy cards.</p>
    </div>
    <div className="metaGrid">
      <label>Source Title<input value={importMeta.source} onChange={e => setImportMeta({...importMeta, source:e.target.value})} /></label>
      <label>Category<input value={importMeta.category} onChange={e => setImportMeta({...importMeta, category:e.target.value})} /></label>
      <label>Type<select value={importMeta.type} onChange={e => setImportMeta({...importMeta, type:e.target.value})}><option>AUTO</option><option>WORD</option><option>CHUNK</option><option>SENTENCE</option><option>PATTERN</option><option>DIALOGUE</option></select></label>
      <label>Tags<input value={importMeta.tagsText} onChange={e => setImportMeta({...importMeta, tagsText:e.target.value})} /></label>
    </div>
    <textarea value={importText} onChange={e => updateImportText(e.target.value)} />
    {importPreviewPanel}
    {importMsg && <p className="audioMsg">{importMsg}</p>}
    <button className="primary" disabled={!parsedV2Import && importPreview.total === 0} onClick={() => parsedV2Import ? importV2Course(parsedV2Import) : importCards(parsedImportCards)}>{parsedV2Import ? 'Confirm Import Course' : 'Import Legacy Cards'}</button>
    <label className="fileButton">Import File<input type="file" accept=".txt,.md,.csv" onChange={e => importFile(e.target.files?.[0])} /></label>
  </section>

  function openSettingsPage() {
    stopAllAudio()
    setTab('settings')
    setSourceView(null)
    setEditing(null)
    setSelected(null)
  }
  function navigateMainTab(nextTab) {
    if (!nextTab) return
    if (nextTab === 'settings') {
      openSettingsPage()
      return
    }
    stopAllAudio()
    setTab(nextTab)
    setSourceView(null)
    setEditing(null)
    if (nextTab === 'learn') {
      setLearnSubTab('overview')
      return
    }
    if (nextTab === 'practice') {
      setPracticeSubTab('quick_response')
      setSelected(null)
      return
    }
    if (nextTab === 'output') {
      setOutputSubTab('overview')
      setSelected(null)
      return
    }
    if (nextTab === 'review') {
      setReviewSubTab('today')
      setSelected(null)
      return
    }
    if (nextTab === 'library') {
      setLibrarySubTab('courses')
      setLibraryMode('list')
      setSelected(null)
    }
  }

  if (!activeAccount) {
    return <div className={`app font-${settings.fontSize}`}>
      <main className="screen">
        <section className="page loginPage">
          <div className="settingsTopBar">Mandy English</div>
          <div className="settingBox">
            <h1>账户登录</h1>
            <p>支持 2 个独立账户。每个账户的课程、进度和设置互相隔离。</p>
            <label>账户名称<input className="search" value={accountDraft.name} onChange={e => setAccountDraft(prev => ({ ...prev, name: e.target.value }))} placeholder="例如：Mandy" /></label>
            <label>密码<input className="search" type="password" value={accountDraft.pin} onChange={e => setAccountDraft(prev => ({ ...prev, pin: e.target.value }))} placeholder="输入登录密码" /></label>
            <button className="primary" onClick={loginOrCreateAccount}>登录 / 首次创建</button>
            {accountError && <p className="audioMsg">{accountError}</p>}
            {accountProfiles.length > 0 && <div className="debug">
              <p>已有账户：{accountProfiles.map(item => item.name).join(' · ')}</p>
              <p>提示：输入已有账户名称+密码可登录。</p>
            </div>}
          </div>
        </section>
      </main>
    </div>
  }

  return <div className={`app font-${settings.fontSize}`}>
    <main className="screen">
      {tab === 'learn' && learnSubTab === 'overview' && !selectedFresh && <LearnOverviewSection
        learnTabs={LEARN_SUB_TABS}
        learnSubTab={learnSubTab}
        onLearnSubTabChange={setLearnSubTabWithState}
        activeAccountName={activeAccount?.name || ''}
        activeUserName={activeUser?.name || ''}
        activeCourse={activeCourse}
        learnProgressPercent={learnProgressPercent}
        learnCurrentStepIndex={learnCurrentStepIndex}
        learnPathRows={learnPathRows}
        groupedNextStep={groupedNextStep}
        defaultNextStepAction={nextStep.id}
        onSetPracticeStep={setPracticeStep}
        onOpenLibrarySearch={openLearnSearchFromHeader}
        onOpenSettings={openSettingsPage}
        onPlayCourseAudio={playLearnCourseAudio}
        dialogueCount={learnDialogueCount}
        expressionCount={learnExpressionCount}
        reviewCount={learnReviewCount}
        sourceLabel={activeCourse?.book || activeCourse?.category || ''}
        levelLabel={activeCourse?.level || ''}
        goalText={activeCourse?.goal || ''}
        estimatedMinutesLeft={Math.max(6, 24 - Math.round(learnProgressPercent / 4))}
      />}

      {tab === 'learn' && learnSubTab === 'overview' && selectedFresh && <section className="page learnPage learnInputPage">
        <div className="learnInputTop">
          <div className="learnInputBrand">
            <small>输入学习</small>
            <h1>学习</h1>
          </div>
          <div className="learnInputTopActions">
            <button className="learnTopIconButton" onClick={openLearnSearchFromHeader} aria-label="Search in library"><span>⌕</span></button>
            <button className="learnTopIconButton active" onClick={openSettingsPage} aria-label="Open settings"><span>⚙</span></button>
          </div>
        </div>
        <ModuleSubTabs items={LEARN_SUB_TABS} value={learnSubTab} onChange={setLearnSubTabWithState} className="learnSubTabs" />
        <div className="topbar"><button className="smallButton" onClick={() => { stopAllAudio(); setSelected(null) }}>Back</button><span>{selectedFresh.source}</span></div>
        <div className="deepCard learnLegacyCard">
          <div className="tag">{chunkLabel(selectedFresh.type)} · {selectedFresh.category}{selectedFresh.lastReviewAt && <> · Next review: {formatReviewDate(selectedFresh.nextReviewAt)}</>}</div>
          <div className="studyModeSwitch">
            <button className={(settings.studyMode || 'LISTEN') === 'LISTEN' ? 'active' : ''} onClick={() => setStudyMode('LISTEN')}>Listen</button>
            <button className={(settings.studyMode || 'LISTEN') === 'RECALL' ? 'active' : ''} onClick={() => setStudyMode('RECALL')}>Recall</button>
          </div>
          <div className="deepDisplaySwitch" aria-label="Language display">
            <button className={displayMode === 'EN' ? 'active' : ''} onClick={() => setSettings({ ...settings, subtitleMode: 'EN' })}>EN</button>
            <button className={displayMode === 'CN' ? 'active' : ''} onClick={() => setSettings({ ...settings, subtitleMode: 'CN' })}>CN</button>
            <button className={displayMode === 'BOTH' ? 'active' : ''} onClick={() => setSettings({ ...settings, subtitleMode: 'BOTH' })}>EN+CN</button>
            <button className={displayMode === 'HIDDEN' ? 'active' : ''} onClick={() => setSettings({ ...settings, subtitleMode: 'HIDDEN' })}>Hide</button>
          </div>
          {(settings.studyMode || 'LISTEN') === 'RECALL' && cardType(selectedFresh) === 'DIALOGUE' && selectedDialogueRecallItems.length > 0 && <div className="recallPromptCard dialogueRecallCard">
            <div className="recallLabel">Dialogue Recall · {dialogueRecallIndex + 1}/{selectedDialogueRecallItems.length}</div>
            <div className="recallChinese">{activeDialogueRecall?.cn || selectedFresh.meaning || 'No Chinese prompt yet. Re-import with Chinese lines for better recall.'}</div>
            <div className="recallCue">Look at Chinese. Say the English by yourself first.</div>
            {!recallShown && <button className="primary recallReveal" onClick={() => setRecallShown(true)}>Show Answer</button>}
            {recallShown && <div className="dialogueRecallAnswer">
              <p>{activeDialogueRecall?.speaker && <span className="speakerPill">{activeDialogueRecall.speaker}</span>}{activeDialogueRecall?.text}</p>
              <button className="secondary compactButton" onClick={playActiveDialogueRecall}>Play Correct English</button>
              <div className="recallActions">
                <button className="secondary compactButton" onClick={() => rateDialogueRecall('Again')}>Again</button>
                <button className="primary compactButton" onClick={() => rateDialogueRecall('Good')}>Good</button>
              </div>
              <button className="secondary compactButton" onClick={nextDialogueRecall}>Next Sentence</button>
            </div>}
          </div>}
          {(settings.studyMode || 'LISTEN') === 'RECALL' && !(cardType(selectedFresh) === 'DIALOGUE' && selectedDialogueRecallItems.length > 0) && <div className="recallPromptCard">
            <div className="recallLabel">Chinese Prompt</div>
            <div className="recallChinese">{selectedFresh.meaning || 'No Chinese meaning yet.'}</div>
            <div className="recallCue">Look at Chinese. Say the English by yourself first.</div>
            {!recallShown && <button className="primary recallReveal" onClick={() => setRecallShown(true)}>Show English</button>}
            {recallShown && <div className="recallActions">
              <button className="secondary compactButton" onClick={() => rateSelected('Again', false)}>Again</button>
              <button className="primary compactButton" onClick={() => rateSelected('Good', true)}>Good</button>
            </div>}
          </div>}
          {((settings.studyMode || 'LISTEN') === 'LISTEN' || recallShown) && <>
            <div className={`deepMain ${playingId === `${selectedFresh.id}:content` ? 'playing' : ''}`}>
              <button className="mainPlay" onClick={(e) => handlePlayContent(selectedFresh, e)}><span /></button>
              <div><h2>{visiblePrimary(selectedFresh)}</h2>{visibleSecondary(selectedFresh) && <p>{visibleSecondary(selectedFresh)}</p>}</div>
            </div>
            {selectedFresh.examples.length > 0 && <>
            <div className="sectionTitleRow">
              <div className="miniTitle">Examples</div>
              <button className={`sectionPlayButton ${sectionPlaying === 'examples' ? 'active' : ''}`} onClick={() => sectionPlaying === 'examples' ? stopAllAudio() : playCardSection(selectedFresh, 'examples')}>
                {sectionPlaying === 'examples' ? 'Stop' : 'Play All'}
              </button>
            </div>
            <div className="deepRows">{selectedFresh.examples.map((ex, idx) => {
              const parts = exampleParts(ex)
              return <div key={ex.id} className={`deepRow ${playingId === `${selectedFresh.id}:ex:${idx}` ? 'playing' : ''}`}>
                <button className="tinyPlay" onClick={(e) => handlePlayExample(selectedFresh, idx, e)}><span /></button>
                <p className="bilingualLine"><span>{parts.primary}</span>{parts.secondary && <em>{parts.secondary}</em>}</p>
              </div>
            })}</div>
            </>}
            {selectedFresh.pattern && <div className="patternBox"><strong>Pattern</strong><p>{selectedFresh.pattern}</p></div>}
            {['SENTENCE', 'DIALOGUE'].includes(cardType(selectedFresh)) && <>
            {makeDialogue(selectedFresh).length > 0 && <>
              <div className="sectionTitleRow">
                <div className="miniTitle">迷你对话</div>
                <button className={`sectionPlayButton ${sectionPlaying === 'dialogue' ? 'active' : ''}`} onClick={() => sectionPlaying === 'dialogue' ? stopAllAudio() : playCardSection(selectedFresh, 'dialogue')}>
                  {sectionPlaying === 'dialogue' ? '停止' : '整段播放'}
                </button>
              </div>
              {selectedDialogueRoles.length > 0 && <div className="rolePlayPanel">
                <div className="rolePlayHead">
                  <strong>角色扮演</strong>
                  <select value={activeRolePlayRole} onChange={e => setRolePlayRole(e.target.value)}>
                    {selectedDialogueRoles.map(role => <option key={role} value={role}>我演 {role}</option>)}
                  </select>
                </div>
                <div className="rolePlayActions">
                  <button className="secondary compactButton" onClick={() => isRolePlaying ? stopAllAudio() : playRolePlay(selectedFresh)}>{isRolePlaying ? '停止角色扮演' : '开始角色扮演'}</button>
                  <select value={settings.rolePlayPauseSeconds || 4} onChange={e => setSettings({ ...settings, rolePlayPauseSeconds: Number(e.target.value) })}>
                    <option value={2}>停顿 2 秒</option>
                    <option value={4}>停顿 4 秒</option>
                    <option value={6}>停顿 6 秒</option>
                    <option value={10}>停顿 10 秒</option>
                  </select>
                </div>
              </div>}
              <div className="deepRows">{makeDialogue(selectedFresh).map((line, idx) => {
                const dialogueLine = dialogueParts(line)
                return <div key={line.id} className={`deepRow ${playingId === `${selectedFresh.id}:dialogue:${idx}` ? 'playing' : ''} ${playingId === `${selectedFresh.id}:role:${idx}` ? 'roleTurn' : ''}`}>
                  <button className="tinyPlay" onClick={(e) => handlePlayDialogue(selectedFresh, idx, e)}><span /></button>
                  <p className="bilingualLine">{dialogueLine.speaker && <span className="speakerPill">{dialogueLine.speaker}</span>}<span>{dialogueLine.primary}</span>{dialogueLine.secondary && <em>{dialogueLine.secondary}</em>}</p>
                </div>
              })}</div>
            </>}
            </>}
            {cardType(selectedFresh) !== 'DIALOGUE' && <div className="practiceBox">
              <div className="miniTitle">练习</div>
              <label>拼写<input value={spellingAnswer} onChange={e => { setSpellingAnswer(e.target.value); setSpellingResult('') }} placeholder="在这里输入英文" /></label>
              <button className="secondary compactButton" onClick={checkSpelling}>检查拼写</button>
              {spellingResult && <p className="practiceResult">{spellingResult}</p>}
              <label>造句<textarea className="smallTextarea" value={sentenceDraft} onChange={e => setSentenceDraft(e.target.value)} placeholder="用这个词汇/语块/句型写一句你自己的句子。" /></label>
            </div>}
          </>}
          <div className="navActions">
            <button className="secondary compactButton" onClick={() => goToOffset(-1)} disabled={selectedIndex <= 0}>← 上一条</button>
            <button className="secondary compactButton" onClick={() => goToOffset(1)} disabled={selectedIndex < 0 || selectedIndex >= visibleLearnCards.length - 1}>下一条 →</button>
          </div>
          <div className="feedActions"><button className="secondary compactButton" onClick={() => rateSelected('Again', false)}>再来一次</button><button className="secondary compactButton" onClick={() => rateSelected('Good', true)} disabled={(settings.studyMode || 'LISTEN') === 'RECALL' && !recallShown}>掌握，下一条</button></div>
        </div>
      </section>}

      {tab === 'learn' && learnSubTab !== 'overview' && <section className="page learnPage learnInputPage">
        <div className="learnInputTop">
          <div className="learnInputBrand">
            <small>LEARN</small>
            <h1>学习</h1>
          </div>
          <div className="learnInputTopActions">
            <button className="learnTopIconButton" onClick={openLearnSearchFromHeader} aria-label="Search in library"><span>⌕</span></button>
            <button className="learnTopIconButton active" onClick={openSettingsPage} aria-label="Open settings"><span>⚙</span></button>
          </div>
        </div>
        <ModuleSubTabs items={LEARN_SUB_TABS} value={learnSubTab} onChange={setLearnSubTabWithState} className="learnSubTabs" />

        {!activeCourse && <div className="emptyState">请先到 Library 选择课程。</div>}

        {activeCourse && learnSubTab === 'background' && <div className="learnBackgroundStack">
          <div className="learnSectionIntroCard">
            <div className="learnSectionIntroIcon">🎧</div>
            <div>
              <h2>背景</h2>
              <p>理解主题，不做长篇阅读。</p>
            </div>
          </div>
          <div className="learnInfoCard">
            <small>关键点 1</small>
            <strong>{learnBackgroundScene || '本课聚焦日常生活沟通。'}</strong>
          </div>
          <div className="learnInfoCard">
            <small>关键点 2</small>
            <strong>{learnBackgroundContext || learnBackgroundGoal || '核心表达围绕观点、地点和日常生活。'}</strong>
          </div>
          <div className="learnInfoCard">
            <small>关键点 3</small>
            <strong>{learnBackgroundTransfer || '这些表达可以迁移到墨尔本生活、邻里、学校和工作场景。'}</strong>
          </div>
          <details className="secondaryMenu">
            <summary>更多背景</summary>
            <div className="learnInfoGridCard compactLearnInfoGridCard">
              <div><strong>人物关系</strong><p>{learnBackgroundPeople || '暂无人物关系。'}</p></div>
              <div><strong>关键句型</strong><p>{learnBackgroundGrammar || "I like... / For me, it's..."}</p></div>
              <div><strong>听力重点</strong><p>{learnBackgroundListenFor || '抓取观点表达、原因和关键名词。'}</p></div>
            </div>
          </details>
        </div>}

        {activeCourse && learnSubTab === 'dialogue' && <div className="learnDialogueStack">
          <div className="learnDialoguePlayerCard">
            <small>对话播放器</small>
            <h2>精听 · 跟读 · 初级角色扮演</h2>
            <button onClick={() => sectionPlaying === 'v2-dialogue' ? stopAllAudio() : playV2DialogueAll()}>{sectionPlaying === 'v2-dialogue' ? '■' : '▶'}</button>
          </div>
          <div className="learnDialogueControlRow">
            <button className={`primaryAction ${sectionPlaying === 'v2-dialogue' ? 'active' : ''}`} onClick={() => sectionPlaying === 'v2-dialogue' ? stopAllAudio() : playV2DialogueAll()}>{sectionPlaying === 'v2-dialogue' ? '停止播放' : '整段播放'}</button>
          </div>
          <details className="secondaryMenu">
            <summary>更多控制</summary>
            <div className="secondaryMenuActions">
              <button className="subtleAction" onClick={() => stopAllAudio()}>暂停</button>
              <button className="subtleAction" onClick={async () => {
              const first = activeDialogueLines[0]
              if (!first) return
              stopAllAudio()
              const runId = ++runRef.current
              await playV2DialogueLine(first, `v2-dialogue-repeat:${first.id}`, runId, 2)
              }}>重复首句</button>
            </div>
          </details>
          <div className="learnDialogueModeTabs">
            <button className={learnDialogueMode === 'listen' ? 'active' : ''} onClick={() => setLearnDialogueMode('listen')}>精听</button>
            <button className={learnDialogueMode === 'shadow' ? 'active' : ''} onClick={() => setLearnDialogueMode('shadow')}>跟读</button>
            <button className={learnDialogueMode === 'role' ? 'active' : ''} onClick={() => setLearnDialogueMode('role')}>角色 A/B</button>
          </div>
          {activeDialogueLines.length === 0 && <div className="emptyState">暂无对话内容。</div>}
          {learnDialogueMode === 'listen' && <div className="learnDialogueLineList">
            {activeDialogueLines.map((line, index) => <div key={line.id} className={`learnDialogueLineCard ${playingId === `v2-dialogue:${line.id}` ? 'activeLine' : ''}`}>
              <div className="learnDialogueLineHead">
                <span>{getDialogueLineLabel(line, index)}</span>
                <button onClick={async () => {
                  stopAllAudio()
                  const runId = ++runRef.current
                  await playV2DialogueLine(line, `v2-dialogue:${line.id}`, runId, 1)
                }}>🔊</button>
              </div>
              <strong>{line.text}</strong>
              {showChineseInPractice && line.translation && <p>{line.translation}</p>}
              <div className="learnLineActions">
                <button className="primaryAction" onClick={() => addLearnDialogueLineToPractice(line)}>加入练习</button>
              </div>
              <details className="secondaryMenu">
                <summary>更多操作</summary>
                <div className="secondaryMenuActions">
                  <button className={`subtleAction ${learnReviewAddedMap[line.id] ? 'active' : ''}`} onClick={() => addLearnDialogueLineToReview(line)}>{learnReviewAddedMap[line.id] ? '已加入复习' : '加入复习'}</button>
                </div>
              </details>
            </div>)}
          </div>}
          {learnDialogueMode === 'shadow' && <div className="learnDialogueLineList">
            {activeDialogueLines.map((line, index) => <div key={line.id} className={`learnDialogueLineCard shadow ${playingId === `v2-shadow:${line.id}` ? 'activeLine' : ''}`}>
              <div className="learnDialogueLineHead">
                <span>{index + 1}</span>
                <button onClick={async () => {
                  stopAllAudio()
                  const runId = ++runRef.current
                  await playV2DialogueLine(line, `v2-shadow:${line.id}`, runId, 1)
                }}>▶</button>
              </div>
              <strong>{line.text}</strong>
              {showChineseInPractice && line.translation && <p>{line.translation}</p>}
              <div className="learnLineActions">
                <button className="primaryAction" onClick={async () => {
                  stopAllAudio()
                  const runId = ++runRef.current
                  await playV2DialogueLine(line, `v2-shadow-repeat:${line.id}`, runId, 2)
                }}>再听一次</button>
              </div>
            </div>)}
          </div>}
          {learnDialogueMode === 'role' && <div className="learnRolePlayBlock">
            <div className="learnRolePlayHead">
              <select value={v2PracticeRole || activeDialogueRoles[0] || ''} onChange={e => setV2PracticeRole(e.target.value)} disabled={!activeDialogueRoles.length}>
                {activeDialogueRoles.map(role => <option key={role} value={role}>我演 {role}</option>)}
              </select>
                <button onClick={() => isRolePlaying ? stopAllAudio() : playV2DialogueRolePlay(v2PracticeRole)}>{isRolePlaying ? '停止' : '开始角色扮演'}</button>
              </div>
            <div className="learnDialogueLineList">
              {activeDialogueLines.map((line, index) => {
                const roleLabel = getDialogueLineLabel(line, index)
                const isUserTurn = cleanLineText(roleLabel) === cleanLineText(v2PracticeRole || activeDialogueRoles[0] || '')
                const revealed = Boolean(learnRoleRevealMap[line.id])
                return <div key={line.id} className="learnDialogueLineCard role">
                  <div className="learnDialogueLineHead">
                    <span>{roleLabel}</span>
                    <button onClick={async () => {
                      stopAllAudio()
                      const runId = ++runRef.current
                      await playV2DialogueLine(line, `v2-role:${line.id}`, runId, 1)
                    }}>🔊</button>
                  </div>
                  {isUserTurn && !revealed ? <strong>轮到你了…（先开口说，再看提示）</strong> : <strong>{line.text}</strong>}
                  {(showChineseInPractice && line.translation && (!isUserTurn || revealed)) && <p>{line.translation}</p>}
                  {isUserTurn && !revealed && <button className="learnRevealHintButton" onClick={() => setLearnRoleRevealMap(prev => ({ ...prev, [line.id]: true }))}>显示提示</button>}
                </div>
              })}
            </div>
          </div>}
        </div>}

        {activeCourse && learnSubTab === 'expressions' && <div className="learnExpressionStack">
          <div className="learnExpressionHeaderCard">
            <h2>表达输入</h2>
            <p>这里是输入材料，不是做题。重点是理解、听、看、模仿。</p>
            <div className="learnExpressionFilterTabs">
              {[
                ['all', '全部'],
                ['vocab', '词汇'],
                ['chunk', '语块'],
                ['pattern', '句型'],
                ['useful_sentence', '句子']
              ].map(([id, label]) => <button key={id} className={learnExpressionFilter === id ? 'active' : ''} onClick={() => setLearnExpressionFilter(id)}>{label}</button>)}
            </div>
          </div>
          <div className="learnExpressionInputList">
            {learnExpressionItems.map(item => {
              const textbookExample = (item.examples || [])[0]?.text || (item.autoSentences || [])[0]?.text || ''
              const lifeExample = (item.examples || [])[1]?.text || (item.autoSentences || [])[1]?.text || textbookExample
              const typeLabel = item.type === 'vocab' ? '词汇' : item.type === 'chunk' ? '语块' : item.type === 'pattern' ? '句型' : '句子'
              return <div key={item.id} className="learnExpressionInputCard">
                <div className="learnExpressionInputHead">
                  <div className="chips">
                    <span>{typeLabel}</span>
                    <span>Core</span>
                  </div>
                  <button className={`learnPlayIcon ${playingId === `v2-expression:${item.id}` ? 'active' : ''}`} onClick={async () => {
                    stopAllAudio()
                    const runId = ++runRef.current
                    await speakWithFallback(item.text, `v2-expression:${item.id}`, 1, runId, item.audioAssetId, resolvePlaybackVoice('solo'))
                  }}>🔊</button>
                </div>
                <strong>{item.text}</strong>
                {showChineseInPractice && item.meaning && <p>{item.meaning}</p>}
                {!!textbookExample && <div className="learnExampleBox">
                  <small>教材例句</small>
                  <span>{textbookExample}</span>
                </div>}
                {!!lifeExample && <div className="learnExampleBox alt">
                  <small>生活迁移</small>
                  <span>{lifeExample}</span>
                </div>}
                <div className="learnExpressionActions">
                  <button className={`primaryAction ${learnPracticeAddedMap[item.id] ? 'active' : ''}`} onClick={() => addLearnExpressionToPractice(item)}>{learnPracticeAddedMap[item.id] ? '已加入练习' : '加入练习'}</button>
                </div>
                <details className="secondaryMenu">
                  <summary>更多操作</summary>
                  <div className="secondaryMenuActions">
                    <button className={`subtleAction ${learnSavedMap[item.id] ? 'active' : ''}`} onClick={() => markLearnExpressionSaved(item.id)}>{learnSavedMap[item.id] ? '已收藏' : '收藏'}</button>
                    <button className={`subtleAction ${learnReviewAddedMap[item.id] ? 'active' : ''}`} onClick={() => addLearnExpressionToReview(item)}>{learnReviewAddedMap[item.id] ? '已加入复习' : '加入复习'}</button>
                  </div>
                </details>
              </div>
            })}
            {learnExpressionItems.length === 0 && <div className="emptyState">当前没有可输入表达，请先导入课程内容。</div>}
          </div>
        </div>}
      </section>}

      {tab === 'practice' && <ModulePageShell
        pageClassName="practicePage"
        tabs={PRACTICE_SUB_TABS}
        tabValue={practiceSubTab}
        onTabChange={setPracticeSubTab}
        headerLabel="练习"
        headerTitle={activeCourse?.title || '未选择课程'}
        headerSubtitle={activeCourse ? `${activeCourse.level || 'Level'} · ${activeCourse.category || activeCourse.type}` : '请先在图书馆选择课程。'}
      >
        {activeCourse && <div className="practiceStatusBar">
          <strong>{learnProgressPercent}%</strong>
          <span>当前：{groupedNextStep.title || '跟读'} · 第 {learnCurrentStepIndex} / {Math.max(7, learnPathRows.length || 7)} 步</span>
        </div>}
        {!activeCourse && <div className="emptyState">当前没有激活课程，请先到图书馆选择。</div>}
        {activeCourse && false && <div className="v2Panel compactPanel">
          <h2>背景</h2>
          <div className="infoGrid">
            <div><strong>场景介绍</strong><p>{activeBlock?.background?.SCENE_CN || activeBlock?.background?.SCENE_EN || '暂无背景内容。'}</p></div>
            <div><strong>澳洲生活背景</strong><p>{activeBlock?.background?.AUSTRALIA_CONTEXT_CN || activeBlock?.background?.AUSTRALIA_CONTEXT_EN || '暂无背景内容。'}</p></div>
            <div><strong>语法提示</strong><p>{activeBlock?.background?.GRAMMAR || '暂无语法提示。'}</p></div>
            <div><strong>关键词预习</strong><p>{activeBlock?.background?.KEYWORDS || activeBlock?.background?.KEY_WORDS || expressionGroups.vocab.slice(0, 4).map(item => item.text).join(', ') || '暂无关键词。'}</p></div>
            <div><strong>听力目标</strong><p>{activeBlock?.background?.LISTEN_FOR || '暂无听力目标。'}</p></div>
          </div>
        </div>}
        {activeCourse && false && <div className="v2Panel compactPanel">
          <div className="sectionTitleRow"><h2>对话精听</h2></div>
          <div className="sourceActions threeActions compactActions">
            <button className={sectionPlaying === 'v2-dialogue' ? 'activeAction' : ''} onClick={() => sectionPlaying === 'v2-dialogue' ? stopAllAudio() : playV2DialogueAll()}>{sectionPlaying === 'v2-dialogue' ? '停止' : 'Play All'}</button>
            <button onClick={() => stopAllAudio()}>暂停</button>
            <button onClick={() => setPracticeStep('shadowing')}>去跟读</button>
          </div>
          <div className="sourceActions threeActions compactActions">
            <select value={displayMode === 'EN' ? 'EN' : 'BOTH'} onChange={e => setSettings({ ...settings, subtitleMode: e.target.value === 'EN' ? 'EN' : 'BOTH' })}>
              <option value="EN">EN</option>
              <option value="BOTH">EN+CN</option>
            </select>
            <select value={Number(settings.audioSpeed || 1)} onChange={e => setSettings({ ...settings, audioSpeed: Number(e.target.value) })}>
              <option value={0.75}>0.75x</option>
              <option value={0.85}>0.85x</option>
              <option value={1}>1.0x</option>
              <option value={1.15}>1.15x</option>
              <option value={1.25}>1.25x</option>
            </select>
            <select value={settings.pauseSeconds} onChange={e => setSettings({ ...settings, pauseSeconds: Number(e.target.value) })}>
              <option value={1}>停顿 1s</option>
              <option value={2}>停顿 2s</option>
              <option value={4}>停顿 4s</option>
              <option value={6}>停顿 6s</option>
            </select>
          </div>
          <div className="sourceActions threeActions compactActions">
            <select value={v2PracticeRole || activeDialogueRoles[0] || ''} onChange={e => setV2PracticeRole(e.target.value)} disabled={!activeDialogueRoles.length}>
              {activeDialogueRoles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
            <select value={settings.rolePlayPauseSeconds || 4} onChange={e => setSettings({ ...settings, rolePlayPauseSeconds: Number(e.target.value) })}>
              <option value={2}>角色停顿 2s</option>
              <option value={4}>角色停顿 4s</option>
              <option value={6}>角色停顿 6s</option>
              <option value={10}>角色停顿 10s</option>
            </select>
            <button onClick={() => isRolePlaying ? stopAllAudio() : playV2DialogueRolePlay(v2PracticeRole)}>{isRolePlaying ? '停止角色扮演' : 'Role-play'}</button>
          </div>
          <div className="dialogueCleanList">
            {activeDialogueLines.length === 0 && <div className="emptyState">暂无对话内容。</div>}
            {activeDialogueLines.map((line, index) => <button key={line.id} className={`dialogueCleanLine touchRow ${line.unaligned ? 'unaligned' : ''} ${playingId === `v2-dialogue:${line.id}` ? 'playing' : ''}`} onClick={async () => {
              stopAllAudio()
              const runId = ++runRef.current
              setAudioMsg(`Dialogue line: ${line.role || 'Line'}`)
              await playV2DialogueLine(line, `v2-dialogue:${line.id}`, runId, 1)
            }}>
              <span>{getDialogueLineLabel(line, index)}</span>
              <div className="lineIcons" aria-hidden="true">
                <i>▶</i>
                <b onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLineAdjustState({ open: true, lineId: line.id }) }}>✎</b>
              </div>
              <p>{line.text}{showChineseInPractice && line.translation && <em>{line.translation}</em>}</p>
            </button>)}
          </div>
        </div>}
        {activeCourse && false && <div className="v2Panel compactPanel">
          <h2>跟读训练</h2>
          <div className="sourceActions threeActions compactActions">
            <select value={displayMode === 'EN' ? 'EN' : 'BOTH'} onChange={e => setSettings({ ...settings, subtitleMode: e.target.value === 'EN' ? 'EN' : 'BOTH' })}>
              <option value="EN">EN only</option>
              <option value="BOTH">EN+CN</option>
            </select>
            <select value={Number(settings.audioSpeed || 1)} onChange={e => setSettings({ ...settings, audioSpeed: Number(e.target.value) })}>
              <option value={0.75}>0.75x</option>
              <option value={0.85}>0.85x</option>
              <option value={1}>1.0x</option>
              <option value={1.25}>1.25x</option>
            </select>
            <button onClick={() => setPracticeStep('dialogue')}>返回对话</button>
          </div>
          <div className="shadowList">
            {activeDialogueLines.map((line, index) => <div key={line.id} className={`shadowRow ${playingId === `v2-shadow:${line.id}` ? 'playing' : ''}`}>
              <span>{index + 1}</span>
              <div><strong>{getDialogueLineLabel(line, index)}: {line.text}</strong>{showChineseInPractice && line.translation && <p>{line.translation}</p>}</div>
              <div className="shadowActions">
                <button onClick={async () => {
                  stopAllAudio()
                  const runId = ++runRef.current
                  setAudioMsg(`Shadowing line ${index + 1}`)
                  await playV2DialogueLine(line, `v2-shadow:${line.id}`, runId, 1)
                }}>Play</button>
                <button onClick={async () => {
                  stopAllAudio()
                  const runId = ++runRef.current
                  setAudioMsg(`3x drill line ${index + 1}`)
                  await playV2DialogueLine(line, `v2-shadow:${line.id}`, runId, 3)
                }}>3x</button>
                <button onClick={() => {
                  const targetKey = `shadow-record:${line.id}`
                  startSpeechInput(targetKey, '', text => setAudioMsg(`Shadowing captured: ${text}`))
                }}>{recordingTarget === `shadow-record:${line.id}` ? '停止录音' : 'Record'}</button>
                <button onClick={() => setLineAdjustState({ open: true, lineId: line.id })}>微调</button>
              </div>
            </div>)}
            {activeDialogueLines.length === 0 && <div className="emptyState">暂无跟读内容。</div>}
          </div>
        </div>}
        {activeCourse && false && <div className="v2Panel compactPanel">
          <h2>{PRACTICE_STEPS.find(step => step.id === v2Store.activePracticeStep)?.label || '表达'}</h2>
          <div className="expressionTabs">
            {[
              ['vocab', '词汇', 'vocabulary', expressionGroups.vocab.length],
              ['chunk', '语块', 'chunks', expressionGroups.chunk.length],
              ['pattern', '句型', 'patterns', expressionGroups.pattern.length],
              ['useful_sentence', '实用句子', 'useful_sentences', expressionGroups.useful_sentence.length]
            ].map(([id, label, stepId, count]) => <button
              key={id}
              className={currentExpressionTab === id ? 'active' : ''}
              onClick={() => { setExpressionTab(id); setPracticeStep(stepId) }}
            >
              {label} <span>{count}</span>
            </button>)}
          </div>
          <div className="sourceActions threeActions compactActions">
            <button className={sectionPlaying === 'v2-expression-all' ? 'activeAction' : ''} onClick={async () => {
              if (sectionPlaying === 'v2-expression-all') { stopAllAudio(); return }
              if (!currentExpressionItems.length) return
              setSectionPlaying('v2-expression-all')
              const runId = ++runRef.current
              for (let i = 0; i < currentExpressionItems.length; i++) {
                if (runId !== runRef.current) break
                const item = currentExpressionItems[i]
                await speakWithFallback(item.text, `v2-expression:${item.id}`, 1, runId, item.audioAssetId, resolvePlaybackVoice('solo'))
                if (i < currentExpressionItems.length - 1) await sleep(Math.max(400, Number(settings.pauseSeconds || 2) * 1000))
              }
              if (runId === runRef.current) setSectionPlaying('')
            }}>{sectionPlaying === 'v2-expression-all' ? '停止' : 'Play All'}</button>
            <select value={displayMode === 'EN' ? 'EN' : 'BOTH'} onChange={e => setSettings({ ...settings, subtitleMode: e.target.value === 'EN' ? 'EN' : 'BOTH' })}>
              <option value="EN">EN</option>
              <option value="BOTH">EN+CN</option>
            </select>
            <button onClick={moveToNextExpressionFlow}>{expressionNextLabel}</button>
          </div>
          <div className="expressionList">
            {currentExpressionItems.map(item => {
              const expressionExamples = [...(item.examples || []), ...(item.autoSentences || [])].slice(0, 8)
              const miniLines = (item.miniDialogues || []).flatMap(mini => mini.lines || [])
              const examplePlayKey = `v2-expression-examples:${item.id}`
              const miniPlayKey = `v2-expression-mini:${item.id}`
              return <div key={item.id} className="expressionCard">
                <div className="expressionCardTop">
                  <div className="expressionCardText">
                    <strong>{item.text}</strong>
                    {showChineseInPractice && item.meaning && <p>{item.meaning}</p>}
                    {item.note && <small>{item.note}</small>}
                  </div>
                  <div className="expressionCardTools">
                    <button className={`iconPlayButton ${playingId === `v2-expression:${item.id}` ? 'activeAction' : ''}`} onClick={async () => {
                      stopAllAudio()
                      const runId = ++runRef.current
                      await speakWithFallback(item.text, `v2-expression:${item.id}`, 1, runId, item.audioAssetId, resolvePlaybackVoice('solo'))
                    }} aria-label="Play expression"><span /></button>
                    {expressionExamples.length > 1 && <button className={`compactLinePlay ${sectionPlaying === examplePlayKey ? 'activeAction' : ''}`} onClick={() => sectionPlaying === examplePlayKey ? stopAllAudio() : playExpressionExampleGroup(item, 'examples')}>{sectionPlaying === examplePlayKey ? 'Stop' : 'Play all'}</button>}
                    {!expressionExamples.length && miniLines.length > 1 && <button className={`compactLinePlay ${sectionPlaying === miniPlayKey ? 'activeAction' : ''}`} onClick={() => sectionPlaying === miniPlayKey ? stopAllAudio() : playExpressionExampleGroup(item, 'mini')}>{sectionPlaying === miniPlayKey ? 'Stop' : 'Play all'}</button>}
                  </div>
                </div>
                {expressionExamples.map((example, index) => <div className="miniExample compactExampleRow" key={example.id}>
                  <button className="tinyPlay slimTinyPlay" onClick={async () => {
                    stopAllAudio()
                    const runId = ++runRef.current
                    await speakWithFallback(example.text, `v2-example:${example.id}`, 1, runId, example.audioAssetId, resolvePlaybackVoice('solo'))
                  }}><span /></button>
                  <div>
                    <b className="miniLineLabel">{index + 1}</b>
                    <span>{example.text}</span>
                    {showChineseInPractice && example.translation && <em>{example.translation}</em>}
                  </div>
                </div>)}
                {miniLines.length > 0 && <div className="miniDialogueBox compactMiniDialogueBox">
                  {miniLines.map((line, index) => {
                    const lineLabel = getMiniDialogueLineLabel(miniLines, line, index)
                    return <div className="miniExample miniDialogueLineRow" key={line.id}>
                      <button className="tinyPlay slimTinyPlay" onClick={async () => {
                        stopAllAudio()
                        const runId = ++runRef.current
                        await speakWithFallback(line.text, `v2-mini:${line.id}`, 1, runId, line.audioAssetId, resolvePlaybackVoice('dialogue', line.role))
                      }}><span /></button>
                      <div>
                        <b className="miniLineLabel">{lineLabel}</b>
                        <span>{line.text}</span>
                        {showChineseInPractice && line.translation && <em>{line.translation}</em>}
                      </div>
                    </div>
                  })}
                </div>}
              </div>
            })}
            {currentExpressionItems.length === 0 && <div className="emptyState">当前子板块还没有内容。</div>}
          </div>
        </div>}
        {activeCourse && practiceSubTab === 'quick_response' && <div className="v2Panel compactPanel">
          <h2>快反训练</h2>
          <div className="modeSwitch compactModeSwitch reactionModeSwitch">
            <button className={reactionMode === 'cn_to_en' ? 'active' : ''} onClick={() => { setReactionMode('cn_to_en'); setReactionReveal(false) }}>中文→英文</button>
            <button className={reactionMode === 'conversation' ? 'active' : ''} onClick={() => { setReactionMode('conversation'); setReactionReveal(false) }}>连续对话快反</button>
            <button className={reactionMode === 'audio' ? 'active' : ''} onClick={() => { setReactionMode('audio'); setReactionReveal(false) }}>音频快反</button>
          </div>
          <div className="sourceActions twoActions compactActions">
            <button className="subtleAction" onClick={() => playQuickReactionPrompt(activeQuickReactionItem)} disabled={!activeQuickReactionItem}>{reactionMode === 'conversation' ? '播放 A 提问' : '播放提示'}</button>
            <button className="subtleAction" onClick={() => setReactionReveal(prev => !prev)} disabled={!activeQuickReactionItem}>{reactionReveal ? '隐藏答案' : '显示答案'}</button>
          </div>
          <details className="secondaryMenu">
            <summary>更多设置</summary>
            <div className="secondaryMenuActions">
              <button className={reactionAutoNext ? 'activeAction' : 'subtleAction'} onClick={() => setReactionAutoNext(prev => !prev)}>{reactionAutoNext ? '自动下一题：开' : '自动下一题：关'}</button>
            </div>
          </details>
          {activeQuickReactionItem ? <div className="reactionList">
            <div className="reactionCard">
              <span>题目 {Math.min(reactionIndex + 1, activeReactionItems.length)} / {activeReactionItems.length}</span>
              {reactionMode === 'audio' && <strong>请先点击“播放提示”，听完英文后马上开口回答。</strong>}
              {reactionMode === 'cn_to_en' && <strong>{activeQuickReactionItem.promptCn || activeQuickReactionItem.promptEn || '暂无提示'}</strong>}
              {reactionMode === 'conversation' && <>
                <strong>{`${activeQuickReactionItem.speakerA || 'A'}: ${activeQuickReactionItem.promptEn || '暂无英文提问'}`}</strong>
                <p>你的角色：{activeQuickReactionItem.speakerB || 'B'}，请立即用英文回答。</p>
              </>}
              {showChineseInPractice && reactionMode !== 'cn_to_en' && activeQuickReactionItem.promptCn && <p>{activeQuickReactionItem.promptCn}</p>}
              {activeQuickReactionItem.hint && <p>提示：{activeQuickReactionItem.hint}</p>}
              <div className="sourceActions">
                <button className="primaryAction" onClick={quickReactionSubmitAndNext}>完成并下一题</button>
              </div>
              {reactionReveal && <div className="miniExample">
                <strong>{reactionMode === 'conversation' ? `参考回答（${activeQuickReactionItem.speakerB || 'B'}）` : '参考答案'}</strong>
                <p>{activeQuickReactionItem.answer || '暂无参考答案。'}</p>
                {showChineseInPractice && reactionMode === 'conversation' && activeQuickReactionItem.answerCn && <em>{activeQuickReactionItem.answerCn}</em>}
                {activeQuickReactionItem.answer && <button className="secondary compactButton" onClick={async () => {
                  stopAllAudio()
                  const runId = ++runRef.current
                  await speakWithFallback(activeQuickReactionItem.answer, `v2-reaction-answer:${activeQuickReactionItem.id}`, 1, runId, '', resolvePlaybackVoice('solo'))
                }}>播放答案</button>}
              </div>}
            </div>
          </div> : <div className="emptyState">{reactionMode === 'conversation' ? '暂无可用对话内容，请先补充对话或实用句子里的 mini dialogue。' : '暂无快反内容。'}</div>}
        </div>}
        {activeCourse && practiceSubTab === 'spelling' && <PracticeSpellingPanel
          activeCourse={activeCourse}
          spellingSourceOptions={spellingSourceOptions}
          spellingSourceType={spellingSourceType}
          onSetSpellingSourceType={(id) => { setSpellingSourceType(id); setSpellingItemIndex(0); setSpellingFeedback('') }}
          spellingModeOptions={spellingModeOptions}
          spellingMode={spellingMode}
          onSetSpellingMode={(id) => { setSpellingMode(id); setSpellingFeedback('') }}
          spellingFocusOptions={spellingFocusOptions}
          spellingFocusMode={spellingFocusMode}
          onSetSpellingFocusMode={(id) => { setSpellingFocusMode(id); setSpellingItemIndex(0) }}
          spellingPool={spellingPool}
          spellingItemIndex={spellingItemIndex}
          onSetSpellingItemIndex={(index) => { setSpellingItemIndex(index); setSpellingDraft(''); setSpellingFeedback('') }}
          activeSpellingItem={activeSpellingItem}
          spellingStarred={spellingStarred}
          onToggleSpellingStar={toggleSpellingStar}
          spellingDraft={spellingDraft}
          onSetSpellingDraft={setSpellingDraft}
          spellingFeedback={spellingFeedback}
          onClearSpellingFeedback={() => setSpellingFeedback('')}
          onPlayActiveSpellingItem={async () => {
            if (!activeSpellingItem) return
            stopAllAudio()
            const runId = ++runRef.current
            await speakWithFallback(activeSpellingItem.text, `v2-spelling:${activeSpellingItem.id}`, 1, runId, '', resolvePlaybackVoice('solo'))
          }}
          onCheckPracticeSpelling={checkPracticeSpelling}
          onPrevPracticeSpelling={prevPracticeSpelling}
          onNextPracticeSpelling={nextPracticeSpelling}
        />}
        {activeCourse && practiceSubTab === 'substitution' && <div className="v2Panel compactPanel">
          <h2>替换训练</h2>
          <p className="moduleCaption">使用句型做替换，不引入新知识。</p>
          <div className="expressionList">
            {expressionGroups.pattern.map(item => {
              const substitutions = (item.autoSentences || []).slice(0, 6)
              return <div key={item.id} className="expressionCard">
                <div className="expressionCardTop">
                  <div className="expressionCardText">
                    <strong>{item.text}</strong>
                    {showChineseInPractice && item.meaning && <p>{item.meaning}</p>}
                  </div>
                  <button className={`iconPlayButton ${playingId === `v2-substitution:${item.id}` ? 'activeAction' : ''}`} onClick={async () => {
                    stopAllAudio()
                    const runId = ++runRef.current
                    await speakWithFallback(item.text, `v2-substitution:${item.id}`, 1, runId, item.audioAssetId, resolvePlaybackVoice('solo'))
                  }} aria-label="Play pattern"><span /></button>
                </div>
                {substitutions.length > 0 && <div className="miniDialogueBox compactMiniDialogueBox">
                  {substitutions.map((line, index) => <div key={line.id} className="miniExample miniDialogueLineRow">
                    <button className="tinyPlay slimTinyPlay" onClick={async () => {
                      stopAllAudio()
                      const runId = ++runRef.current
                      await speakWithFallback(line.text, `v2-sub:${line.id}`, 1, runId, line.audioAssetId, resolvePlaybackVoice('solo'))
                    }}><span /></button>
                    <div>
                      <b className="miniLineLabel">{index + 1}</b>
                      <span>{line.text}</span>
                      {showChineseInPractice && line.translation && <em>{line.translation}</em>}
                    </div>
                  </div>)}
                </div>}
              </div>
            })}
            {expressionGroups.pattern.length === 0 && <div className="emptyState">当前课程还没有可用句型。</div>}
          </div>
        </div>}
        {activeCourse && practiceSubTab === 'completion' && <div className="v2Panel compactPanel">
          <h2>半控制对话</h2>
          {activeTalk ? <div className="talkCard">
            <p>{activeTalk.scenarioCn || activeTalk.scenarioEn}</p>
            <small>{activeTalk.aiRole} ↔ {activeTalk.userRole}</small>
            <div className="helpfulList">{(activeTalk.helpfulExpressions || []).map(item => <span key={item}>{item}</span>)}</div>
            {activeGuidedTurn ? <div className="talkTurn" key={activeGuidedTurn.id}>
              <div className="spellingHead">
                <small>回合 {Math.min(guidedTurnIndex + 1, activeGuidedTurns.length)} / {activeGuidedTurns.length}</small>
              </div>
              <strong>{activeGuidedTurn.aiPrompt}</strong>
              <div className="sourceActions">
                <button className="primaryAction" onClick={() => moveGuidedTurn(1)} disabled={guidedTurnIndex >= activeGuidedTurns.length - 1}>下一回合</button>
              </div>
              <textarea className="smallTextarea" placeholder="在这里输入或语音转文字你的回答。" value={guidedDrafts[activeGuidedTurn.id] || ''} onChange={e => setGuidedDrafts(prev => ({ ...prev, [activeGuidedTurn.id]: e.target.value }))} />
              {recordingTarget === `guided:${activeGuidedTurn.id}` && recordingTranscript && <small>语音识别中：{recordingTranscript}</small>}
              {guidedDraftFeedback(activeGuidedTurn, guidedDrafts[activeGuidedTurn.id] || '') && <small>{guidedDraftFeedback(activeGuidedTurn, guidedDrafts[activeGuidedTurn.id] || '')}</small>}
              <details className="secondaryMenu">
                <summary>更多操作</summary>
                <div className="secondaryMenuActions">
                  <button className="subtleAction" onClick={() => moveGuidedTurn(-1)} disabled={guidedTurnIndex <= 0}>上一回合</button>
                  <button className="subtleAction" disabled={!speechInputSupported} onClick={() => startSpeechInput(`guided:${activeGuidedTurn.id}`, guidedDrafts[activeGuidedTurn.id] || '', text => setGuidedDrafts(prev => ({ ...prev, [activeGuidedTurn.id]: text })))}>{recordingTarget === `guided:${activeGuidedTurn.id}` ? '停止语音转文字' : '语音转文字'}</button>
                  <button className="subtleAction" onClick={() => setGuidedDrafts(prev => ({ ...prev, [activeGuidedTurn.id]: '' }))}>清空回答</button>
                </div>
                {activeGuidedTurn.sampleAnswer && <details><summary>参考回答</summary><p>{activeGuidedTurn.sampleAnswer}</p></details>}
              </details>
            </div> : <div className="emptyState">暂无回合内容。</div>}
          </div> : <div className="emptyState">暂无半控制对话任务。</div>}
        </div>}
        {activeCourse && <div className="v2Panel compactPanel">
          <h2>训练节奏</h2>
          <p>当前模块：<strong>{practiceModuleCurrent.label}</strong> · {practiceModuleStatusLabel}</p>
          {recordingError && <small>录音提示：{recordingError}</small>}
          <div className="sourceActions">
            <button className="primaryAction" onClick={() => {
              completePracticeStep(true)
              if (practiceModuleNext.id !== practiceSubTab) {
                setPracticeSubTab(practiceModuleNext.id)
                setPracticeStep(practiceModuleNext.stepId)
              }
            }}>完成并下一模块</button>
          </div>
          <details className="secondaryMenu">
            <summary>更多操作</summary>
            <div className="secondaryMenuActions">
              <button className="subtleAction" onClick={() => completePracticeStep(false)}>仅标记完成</button>
              <button className="subtleAction" onClick={() => {
                if (practiceModulePrev.id === practiceSubTab) return
                setPracticeSubTab(practiceModulePrev.id)
                setPracticeStep(practiceModulePrev.stepId)
              }}>返回上一模块</button>
            </div>
          </details>
        </div>}
      </ModulePageShell>}

      {tab === 'output' && <OutputModuleSection
        activeCourse={activeCourse}
        outputSubTab={outputSubTab}
        onOutputSubTabChange={setOutputSubTab}
        outputTabs={OUTPUT_SUB_TABS}
        activeTalk={activeTalk}
        activeBlock={activeBlock}
        activeAccountName={activeAccount?.name || ''}
        outputChatPrompt={outputChatPrompt}
        onCopyChatPrompt={async () => {
          try {
            await navigator.clipboard.writeText(outputChatPrompt)
            setAudioMsg('已复制到剪贴板：可粘贴到 ChatGPT App 做语音对话。')
          } catch {
            setAudioMsg('复制失败，请手动复制下方提示词。')
          }
        }}
        activeGuidedTurn={activeGuidedTurn}
        guidedTurnIndex={guidedTurnIndex}
        activeGuidedTurns={activeGuidedTurns}
        guidedDrafts={guidedDrafts}
        onGuidedDraftChange={(turnId, value) => setGuidedDrafts(prev => ({ ...prev, [turnId]: value }))}
        onMoveGuidedTurn={moveGuidedTurn}
        activeDialogueRoles={activeDialogueRoles}
        v2PracticeRole={v2PracticeRole}
        onSetV2PracticeRole={setV2PracticeRole}
        rolePlayPauseSeconds={settings.rolePlayPauseSeconds || 4}
        onRolePlayPauseChange={(value) => setSettings({ ...settings, rolePlayPauseSeconds: value })}
        isRolePlaying={isRolePlaying}
        onToggleRolePlay={() => isRolePlaying ? stopAllAudio() : playV2DialogueRolePlay(v2PracticeRole)}
        activeDialogueLines={activeDialogueLines}
        getDialogueLineLabel={getDialogueLineLabel}
        showChineseInPractice={showChineseInPractice}
        outputDraft={outputDraft}
        onOutputDraftChange={setOutputDraft}
        onClearOutputDraft={() => setOutputDraft('')}
        onSaveOutputDraft={() => {
          if (!outputDraft.trim()) return
          setAudioMsg('已保存本次输出草稿（本地临时状态）。')
        }}
      />}

      {tab === 'review' && <ReviewModuleSection
        reviewTabs={REVIEW_SUB_TABS}
        reviewSubTab={reviewSubTab}
        onReviewSubTabChange={setReviewSubTab}
        reviewCount={reviewCount}
        reviewV2UserItemCount={v2Store.reviewItems.filter(item => item.userId === v2Store.activeUserId).length}
        activeAccountName={activeAccount?.name || ''}
        due={due}
        onOpenLearnFromDue={(card) => { setSelected(card); setLearnSubTab('overview'); setTab('learn') }}
        chunkLabel={chunkLabel}
        formatReviewDate={formatReviewDate}
        reviewV2Items={reviewV2Items}
        spellingMistakeItems={spellingMistakeItems}
        spellingPool={spellingPool}
        shadowReviewLines={shadowReviewLines}
        onPlayShadowLine={async (line) => {
          stopAllAudio()
          const runId = ++runRef.current
          await playV2DialogueLine(line, `v2-shadow-review:${line.id}`, runId, 1)
        }}
      />}

      {tab === 'import' && <section className="page">
        <h1>Import</h1>
        <button className="secondary compactButton copyFormatButton" onClick={copyFormatPrompt}>Copy Theme Pack Format</button>
        <div className="formatGuide">
          <h2>Theme Pack Format</h2>
          <p>复制上面的按钮，把格式要求发给 ChatGPT。程序会按主题自动识别：对话、词汇/语块、句型、实用句子、半控制输出练习。</p>
          <div className="formatGuideGrid">
            <div><strong>DIALOGUE</strong><span>主题对话，6-10 句</span><code>CONTENT: Buying shoes</code></div>
            <div><strong>WORD / CHUNK</strong><span>核心词汇和高频语块</span><code>CONTENT: try them on</code></div>
            <div><strong>PATTERN</strong><span>句型 + 4 个替换例句</span><code>CONTENT: Do you have + noun?</code></div>
            <div><strong>SENTENCE</strong><span>可直接使用的实用句子</span><code>CONTENT: Can I try them on?</code></div>
            <div><strong>OUTPUT PRACTICE</strong><span>半控制输出问题/提示</span><code>TYPE: OUTPUT_PRACTICE</code></div>
          </div>
          <details>
            <summary>Theme Pack Short Example</summary>
            <pre>{`TYPE:
DIALOGUE

CONTENT:
Buying shoes at a shopping centre

MEANING:
在购物中心买鞋

MINI_DIALOGUE:
A: Excuse me. Do you have these shoes in size 42?
B: Let me check.
A: Thank you.
B: Yes, we have one pair left.
A: Great. Can I try them on?

SOURCE:
Shopping English

CATEGORY:
Clothes

TAGS:
shopping, shoes

---

TYPE:
CHUNK

CONTENT:
try them on

MEANING:
试穿它们

EXAMPLES:
Can I try them on?
I want to try these shoes on.

SOURCE:
Shopping English

CATEGORY:
Clothes

TAGS:
shopping, chunk

---

TYPE:
PATTERN

CONTENT:
Do you have + noun?

MEANING:
你们有……吗？

EXAMPLES:
Do you have these shoes in size 42?
Do you have this in black?
Do you have a smaller size?
Do you have another pair?

SOURCE:
Shopping English

CATEGORY:
Clothes

TAGS:
shopping, pattern

---

TYPE:
OUTPUT_PRACTICE

CONTENT:
Ask the shop assistant if they have your size.

MEANING:
问店员有没有你的尺码。

HINTS:
Do you have...?
size 42
Can I try them on?

SOURCE:
Shopping English

CATEGORY:
Clothes

TAGS:
speaking, output`}</pre>
          </details>
        </div>
        <div className="metaGrid">
          <label>Source Title<input value={importMeta.source} onChange={e => setImportMeta({...importMeta, source:e.target.value})} /></label>
          <label>Category<input value={importMeta.category} onChange={e => setImportMeta({...importMeta, category:e.target.value})} /></label>
          <label>Type<select value={importMeta.type} onChange={e => setImportMeta({...importMeta, type:e.target.value})}><option>AUTO</option><option>WORD</option><option>CHUNK</option><option>SENTENCE</option><option>PATTERN</option><option>DIALOGUE</option></select></label>
          <label>Tags<input value={importMeta.tagsText} onChange={e => setImportMeta({...importMeta, tagsText:e.target.value})} /></label>
        </div>
        <textarea value={importText} onChange={e => updateImportText(e.target.value)} />
        <div className="importPreview">
          <div className="previewStats">
            <span><strong>{importPreview.total}</strong> detected</span>
            <span><strong>{importPreview.fresh}</strong> new</span>
            <span><strong>{importPreview.updated}</strong> update</span>
            <span><strong>{importPreview.repeated}</strong> repeat</span>
          </div>
          <p>{importPreview.chunks} chunks · {importPreview.sentences} sentences · {importPreview.patterns} patterns · {importPreview.dialogues} dialogues</p>
          {importPreview.sources.length > 0 && <small>Source: {importPreview.sources.slice(0, 2).join(' · ')}{importPreview.sources.length > 2 ? ' +' + (importPreview.sources.length - 2) : ''}</small>}
          {importPreview.samples.length > 0 && <div className="sampleImportList">{importPreview.samples.map(card => <div key={card.id}><b>{card.content}</b><em>{chunkLabel(card.type)} · {card.category}</em></div>)}</div>}
          {importPreview.total === 0 && <small>No item detected yet. Paste TYPE / CONTENT blocks or simple 3-line items.</small>}
        </div>
        {importMsg && <p className="audioMsg">{importMsg}</p>}
        <button className="primary" disabled={importPreview.total === 0} onClick={() => importCards(parsedImportCards)}>Import to Learn</button>
        <label className="fileButton">Import File<input type="file" accept=".txt,.md,.csv" onChange={e => importFile(e.target.files?.[0])} /></label>
      </section>}

      {tab === 'library' && libraryMode === 'paste' && importPanel}

      {tab === 'library' && libraryMode === 'add' && <section className="page">
        {librarySubTabsNode}
        <div className="topbar"><button className="smallButton" onClick={() => setLibraryMode('list')}>←</button><span>Add Content</span></div>
        <div className="addContentGrid">
          <button onClick={() => setAddContentMode('audio')}><strong>Upload Audio</strong><span>Textbook Audio：上传教材原始音频 → 转录 → 切句 → 保存到 Unit / Lesson。</span></button>
          <button onClick={() => { setLibraryMode('paste'); setAddContentMode('paste') }}><strong>Paste ChatGPT Content</strong><span>导入 Textbook Pack / Real-life Version / Extension Dialogue。</span></button>
          <button onClick={() => setAddContentMode('topic')}><strong>Create General Topic</strong><span>不属于教材的独立生活主题，例如 Café、Pharmacy、School。</span></button>
        </div>
        {addContentMode === 'audio' && <div className="v2Panel">
          <h2>Smart Audio Process (3 Steps)</h2>
          <p>Whisper 词级时间戳 → GPT 智能分句 → 时间重对齐（支持人工微调）。</p>
          <div className="metaGrid">
            <label>Book<input value={audioImportMeta.book} onChange={e => setAudioImportMeta(prev => ({ ...prev, book: e.target.value }))} /></label>
            <label>Level<input value={audioImportMeta.level} onChange={e => setAudioImportMeta(prev => ({ ...prev, level: e.target.value }))} /></label>
            <label>Unit<input value={audioImportMeta.unit} onChange={e => setAudioImportMeta(prev => ({ ...prev, unit: e.target.value }))} /></label>
            <label>Lesson<input value={audioImportMeta.lesson} onChange={e => setAudioImportMeta(prev => ({ ...prev, lesson: e.target.value }))} /></label>
            <label>Audio Title<input value={audioImportMeta.title} onChange={e => setAudioImportMeta(prev => ({ ...prev, title: e.target.value }))} /></label>
          </div>
          <label className="fileButton">Upload Audio
            <input type="file" accept="audio/*,.mp3,.m4a,.wav,.mp4,.mpeg,.webm,.ogg" onChange={e => handleAudioFileSelected(e.target.files?.[0])} />
          </label>
          {audioImportFile && <small>已选择：{audioImportFile.name} · {(audioImportFile.size / 1024 / 1024).toFixed(2)}MB</small>}
          {audioImportStepMsg && <p className="audioMsg">{audioImportStepMsg}</p>}
          <div className="sourceActions threeActions">
            <button onClick={runAudioSmartProcess} disabled={!audioImportDataUrl || audioImportBusy}>{audioImportBusy ? '处理中...' : '开始智能处理'}</button>
            <button onClick={importAudioCourseToLibrary} disabled={!audioImportResult?.lines?.length || !audioImportTraining || audioImportBusy}>导入为课程</button>
          </div>
          {audioImportResult?.stats && <div className="importPreview">
            <div className="previewStats">
              <span><strong>{audioImportResult.stats.sentenceCount || 0}</strong> sentences</span>
              <span><strong>{audioImportResult.stats.alignedCount || 0}</strong> aligned</span>
              <span><strong>{audioImportResult.stats.unalignedCount || 0}</strong> unaligned</span>
              <span><strong>{Math.round(audioImportResult.durationSec || 0)}s</strong> duration</span>
            </div>
            <p>未对齐句子会标橙色，导入后可在对话/跟读里继续微调时间。</p>
          </div>}
          {audioImportResult?.lines?.length > 0 && <div className="shadowList">
            {audioImportResult.lines.map((line, index) => <div key={line.id} className={`shadowRow ${line.unaligned ? 'unaligned' : ''}`}>
              <span>{index + 1}</span>
              <div>
                <strong>{line.text}</strong>
                <p>{line.translation || '（可在调整面板补充中文）'}</p>
                <small>{formatMs(line.startMs)} → {formatMs(line.endMs)} {line.unaligned ? ' · 未对齐' : ''}</small>
              </div>
              <div className="shadowActions">
                <button onClick={() => setLineAdjustState({ open: true, lineId: line.id })}>Adjust</button>
              </div>
            </div>)}
          </div>}
        </div>}
        {addContentMode === 'topic' && <div className="v2Panel"><p>Create a blank General Topic first, then paste training content into it.</p><button className="primary" onClick={createGeneralTopicCourse}>Create Topic Now</button></div>}
      </section>}

      {tab === 'library' && libraryMode === 'list' && !sourceView && <LibraryListSection
        tabs={LIBRARY_SUB_TABS}
        librarySubTab={librarySubTab}
        onLibrarySubTabChange={setLibrarySubTab}
        libraryOrganizerOpen={libraryOrganizerOpen}
        onToggleOrganizer={() => setLibraryOrganizerOpen(prev => !prev)}
        onOpenAddContent={() => setLibraryMode('add')}
        query={query}
        onQueryChange={setQuery}
        activeCourse={activeCourse}
        folderPathText={folderPathText}
        onEnterPractice={(courseId) => selectV2Course(courseId, 'practice')}
        onEnterLearn={(courseId) => selectV2Course(courseId, 'learn')}
        onPreloadCourseAudio={preloadCourseAudio}
        audioBusy={audioBusy}
        libraryShelfNames={libraryShelfNames}
        v2Courses={v2Courses}
        libraryDisplayCourses={libraryDisplayCourses}
        contentBlocks={v2Store.contentBlocks}
        onRenameCourse={renameV2Course}
        onMoveCourse={moveCourseToFolder}
        onShowCourseCache={(courseId) => {
          const blocks = v2Store.contentBlocks.filter(block => block.courseId === courseId)
          setAudioMsg(`Audio cache: ${blocks.filter(block => block.audioCacheStatus === 'cached').length}/${blocks.length} cached`)
        }}
        folderGroupedCourses={folderGroupedCourses}
        onCreateTopFolder={() => createLibraryFolder(1)}
        onCreateSubFolder={() => createLibraryFolder(2)}
        onRenameFolder={renameLibraryFolder}
        libraryStats={libraryStats}
        reviewItemsCount={reviewV2Items.length}
      />}

      {tab === 'library' && libraryMode === 'list' && sourceView && !editing && <section className="page">
        {librarySubTabsNode}
        <div className="topbar"><button className="smallButton" onClick={() => setSourceView(null)}>Back</button><span>{sourceView}</span></div>
        <h1>{sourceView}</h1>
        <div className="sourceSummary"><span>{sourceCards.filter(x => matchesLearnType(x, 'CHUNKS')).length} chunks</span><span>{sourceCards.filter(x => cardType(x) === 'SENTENCE').length} sentences</span><span>{sourceCards.filter(x => cardType(x) === 'PATTERN').length} patterns</span><span>{sourceCards.filter(x => cardType(x) === 'DIALOGUE').length} dialogues</span><span>{sourceCards.filter(isReady).length}/{sourceCards.length} ready</span></div>
        <button className="primary" onClick={() => { setLearnSource(sourceView); setLearnScope('CURRENT'); setLearnMode('NEW'); setStageListOpen(false); setSelected(null); setTab('learn'); setSourceView(null) }}>Start Learning</button>
        <button className="secondary" onClick={() => addToLearn(sourceCards)}>Add to Queue</button>
        <button className="secondary" onClick={() => prepareCards(sourceCards)} disabled={audioBusy}>{audioBusy ? 'Preparing...' : 'Prepare Source Audio'}</button>
        <div className="sourceTools"><button onClick={() => renameSource(sourceView)}>Rename Source</button><button className="dangerLite" onClick={() => deleteSource(sourceView)}>Delete Source</button></div>
        <p className="libraryHint">Tap any item below to edit, move, or delete it.</p>
        {audioMsg && <p className="audioMsg">{audioMsg}</p>}
        <div className="previewList">{sourceCards.map(card => <div className="previewItem" key={card.id} onClick={() => setEditing(card)}>
          <strong>{card.content}</strong><p>{card.meaning}</p><small>{chunkLabel(card.type)} · Audio {countAudio(card).ready}/{countAudio(card).total}</small>
        </div>)}</div>
      </section>}

      {tab === 'library' && libraryMode === 'list' && editing && <EditCard card={editing} onBack={() => setEditing(null)} onSave={saveEdit} onDelete={(id) => { if(confirm('确定删除吗？')) { setCards(cards.filter(c => c.id !== id)); setEditing(null) }}} />}

      {tab === 'settings' && <section className="page settingsPageV2">
        <div className="settingsTopBar">Settings · 全局设置</div>
        <div className="settingBox settingsOverviewCard">
          <h1>设置</h1>
          <p>管理账户、学习偏好、音频与数据。默认按小屏高频操作优先显示。</p>
          <div className="settingsQuickChips">
            <span>Profile</span>
            <span>Audio / TTS</span>
            <span>Display</span>
            <span>Storage</span>
          </div>
        </div>
        <div className="settingBox">
          <h2>账户</h2>
          <label>当前账户</label>
          <div className="debug">
            <p>账户名称：{activeAccount?.name || '未登录'}</p>
            <p>账户数据：本地隔离存储</p>
          </div>
          <button className="secondary" onClick={logoutAccount}>退出当前账户</button>
        </div>
        <div className="settingBox voiceRoleBox">
          <h2>语音与角色分配</h2>
          <p>对话中不同角色使用不同声音，让听感更自然。点击声音名称可以试听。</p>
          {VOICE_ROLE_GROUPS.map(group => <div key={group.key} className="voiceRoleGroup">
            <h3>{group.title}</h3>
            <small>默认：{VOICE_OPTIONS.find(item => item.id === voiceRoles[group.key])?.label || group.defaultVoice}</small>
            <div className="voiceGrid">
              {VOICE_OPTIONS.map(voice => <button key={voice.id} className={`voiceCard ${voiceRoles[group.key] === voice.id ? 'active' : ''}`} onClick={() => setSettings(prev => ({ ...prev, voiceRoles: { ...normalizeVoiceRoles(prev.voiceRoles), [group.key]: voice.id } }))}>
                <div>
                  <strong>{voice.label}</strong>
                  <small>{voice.gender}</small>
                </div>
                <span>{voiceRoles[group.key] === voice.id ? '✓' : ''}</span>
                <em onClick={async (e) => { e.stopPropagation(); await previewVoice(voice.id, group.sample) }}>试听</em>
              </button>)}
            </div>
          </div>)}
        </div>
        <div className="settingBox">
          <h2>显示语言</h2>
          <div className="settingPills two">
            <button className={displayMode === 'EN' ? 'active' : ''} onClick={() => setSettings({ ...settings, subtitleMode: 'EN' })}>只看英文</button>
            <button className={displayMode === 'BOTH' ? 'active' : ''} onClick={() => setSettings({ ...settings, subtitleMode: 'BOTH' })}>中英文同时显示</button>
          </div>
        </div>
        <div className="settingBox">
          <h2>播放速度</h2>
          <div className="settingPills">
            {[0.75, 0.85, 1, 1.25].map(speed => <button key={speed} className={Number(settings.audioSpeed || 1) === speed ? 'active' : ''} onClick={() => setSettings({ ...settings, audioSpeed: speed })}>{speed}x</button>)}
          </div>
        </div>
        <div className="settingBox">
          <h2>句间停顿</h2>
          <p className="hint">跟读模式下按句子长度自动调整</p>
          <div className="settingPills">
            {[0.5, 1, 2, 3].map(pause => <button key={pause} className={Number(settings.pauseSeconds) === pause ? 'active' : ''} onClick={() => setSettings({ ...settings, pauseSeconds: pause })}>{pause}秒</button>)}
          </div>
        </div>
        <div className="settingBox">
          <h2>OpenAI 与语音服务</h2>
          <label>OpenAI API Key（可选）</label>
          <input className="search" type="password" placeholder="Cloudflare 已配置密钥可留空；或填写 sk-..." value={settings.apiKey} onChange={e => setSettings({ ...settings, apiKey: e.target.value, openaiStatus: 'Not tested' })} />
          <div className="settingsActionRow">
            <button className="secondary" onClick={() => { if (activeAccount?.id) save(scopedStorageKey(SETTINGS_KEY, activeAccount.id), settings); alert('API Key 已保存。') }}>保存 API Key</button>
            <button className="primary" onClick={testOpenAI} disabled={audioBusy}>{audioBusy ? 'Testing...' : '测试语音连接'}</button>
          </div>
          <div className="debug"><p>OpenAI: {settings.openaiStatus}</p><p>Last Error: {settings.lastError || 'none'}</p></div>
        </div>
        <div className="settingBox settingsFooterBox">
          <h2>数据与存储</h2>
          <p className="hint">保存当前偏好到本地账户。清空数据为不可恢复操作。</p>
          <div className="settingsActionRow">
            <button className="primary" onClick={saveAllSettings}>保存全部设置</button>
            <button className="danger" onClick={() => confirm('确定清空所有数据吗？') && setCards([])}>清空本地数据</button>
          </div>
        </div>
        {settingsSavedMsg && <p className="audioMsg">{settingsSavedMsg}</p>}
      </section>}

      {lineAdjustState.open && lineAdjustLine && <section className="lineAdjustOverlay" onClick={() => setLineAdjustState({ open: false, lineId: '' })}>
        <div className="lineAdjustSheet" onClick={e => e.stopPropagation()}>
          <div className="lineAdjustHead">
            <strong>句子微调工具</strong>
            <button onClick={() => setLineAdjustState({ open: false, lineId: '' })}>关闭</button>
          </div>
          <p>{lineAdjustLine.text}</p>
          <div className="lineAdjustGrid">
            <label>起点
              <div>
                <button onClick={() => lineAdjustIsImported ? adjustImportedLine(lineAdjustLine.id, 'startMs', -100) : adjustCourseLine(lineAdjustLine.id, 'startMs', -100)}>-100ms</button>
                <span>{formatMs(lineAdjustLine.startMs)}</span>
                <button onClick={() => lineAdjustIsImported ? adjustImportedLine(lineAdjustLine.id, 'startMs', 100) : adjustCourseLine(lineAdjustLine.id, 'startMs', 100)}>+100ms</button>
              </div>
            </label>
            <label>终点
              <div>
                <button onClick={() => lineAdjustIsImported ? adjustImportedLine(lineAdjustLine.id, 'endMs', -100) : adjustCourseLine(lineAdjustLine.id, 'endMs', -100)}>-100ms</button>
                <span>{formatMs(lineAdjustLine.endMs)}</span>
                <button onClick={() => lineAdjustIsImported ? adjustImportedLine(lineAdjustLine.id, 'endMs', 100) : adjustCourseLine(lineAdjustLine.id, 'endMs', 100)}>+100ms</button>
              </div>
            </label>
          </div>
          <div className="lineAdjustActions">
            <button onClick={() => {
              const seed = cleanLineText(lineAdjustLine.text || '')
              const draft = window.prompt('Split sentence (insert "|" where you want to split)', seed ? `${seed} | ` : '')
              if (draft === null) return
              if (!draft.includes('|')) {
                alert('请在拆分位置加入 "|" ，例如：Hello there | how are you?')
                return
              }
              if (lineAdjustIsImported) splitImportedLine(lineAdjustLine.id, draft)
              else splitCourseLine(lineAdjustLine.id, draft)
            }}>Split sentence</button>
            <button onClick={() => lineAdjustIsImported ? mergeImportedLineWithNext(lineAdjustLine.id) : mergeCourseLineWithNext(lineAdjustLine.id)}>Merge with next</button>
            <button onClick={() => {
              const next = window.prompt('Edit English', lineAdjustLine.text || '')
              if (next !== null) {
                if (lineAdjustIsImported) updateImportedLine(lineAdjustLine.id, () => ({ text: cleanLineText(next) }))
                else updateCourseDialogueLine(lineAdjustLine.id, () => ({ text: cleanLineText(next) }))
              }
            }}>Edit English</button>
            <button onClick={() => {
              const next = window.prompt('Edit Chinese', lineAdjustLine.translation || '')
              if (next !== null) {
                if (lineAdjustIsImported) updateImportedLine(lineAdjustLine.id, () => ({ translation: cleanLineText(next) }))
                else updateCourseDialogueLine(lineAdjustLine.id, () => ({ translation: cleanLineText(next) }))
              }
            }}>Edit Chinese</button>
            <button onClick={() => lineAdjustIsImported ? resetImportedLineTiming(lineAdjustLine.id) : resetCourseLineTiming(lineAdjustLine.id)}>Reset to original</button>
          </div>
        </div>
      </section>}
    </main>
    <GlobalAppNav
      tab={tab}
      showSettingsButton={tab !== 'settings' && tab !== 'learn'}
      onOpenSettings={openSettingsPage}
      onNavigate={navigateMainTab}
    />
  </div>
}

function EditCard({ card, onBack, onSave, onDelete }) {
  const [draft, setDraft] = useState(() => {
    const normalized = normalizeCard(card)
    return {
      ...normalized,
      examplesText: (normalized.examples || []).map(x => `${x.text || x}${x.cn ? ` = ${x.cn}` : ''}`).join('\n'),
      dialogueText: (normalized.dialogue || []).map(x => `${x.text || x}${x.cn ? ` = ${x.cn}` : ''}`).join('\n'),
      tagsText: (normalized.tags || []).join(',')
    }
  })
  return <section className="page">
    <div className="topbar"><button className="smallButton" onClick={onBack}>Back</button><span>{draft.type}</span></div>
    <label>Type</label><select value={draft.type} onChange={e => setDraft({ ...draft, type: e.target.value })}><option>WORD</option><option>CHUNK</option><option>SENTENCE</option><option>PATTERN</option><option>DIALOGUE</option></select>
    <label>Content</label><input className="search" value={draft.content} onChange={e => setDraft({ ...draft, content: e.target.value })} />
    <label>Meaning</label><input className="search" value={draft.meaning} onChange={e => setDraft({ ...draft, meaning: e.target.value })} />
    <label>Pattern</label><input className="search" value={draft.pattern || ''} onChange={e => setDraft({ ...draft, pattern: e.target.value })} />
    <label>Examples</label><textarea className="smallTextarea" value={draft.examplesText} onChange={e => setDraft({ ...draft, examplesText: e.target.value })} />
    <label>Mini Dialogue</label><textarea className="smallTextarea" value={draft.dialogueText} onChange={e => setDraft({ ...draft, dialogueText: e.target.value })} />
    <label>Source</label><input className="search" value={draft.source || ''} onChange={e => setDraft({ ...draft, source: e.target.value })} />
    <label>Category</label><input className="search" value={draft.category || ''} onChange={e => setDraft({ ...draft, category: e.target.value })} />
    <label>Tags</label><input className="search" value={draft.tagsText || ''} onChange={e => setDraft({ ...draft, tagsText: e.target.value })} />
    <button className="primary" onClick={() => onSave(draft)}>Save</button><button className="danger" onClick={() => onDelete(card.id)}>Delete</button>
  </section>
}

createRoot(document.getElementById('root')).render(<AppErrorBoundary><App /></AppErrorBoundary>)
