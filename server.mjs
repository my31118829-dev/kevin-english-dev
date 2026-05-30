import express from 'express'
import { createServer as createViteServer } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import openAiVoiceHandler from './api/openai-voice.js'
import openAiAudioSmartHandler from './api/openai-audio-smart.js'
import openAiGenerateTrainingHandler from './api/openai-generate-training.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const isProd = process.argv.includes('--prod')
const app = express()

app.use(express.json({ limit: '25mb' }))

app.post('/api/openai-voice', (req, res) => openAiVoiceHandler(req, res))
app.post('/api/openai-audio-smart', (req, res) => openAiAudioSmartHandler(req, res))
app.post('/api/openai-generate-training', (req, res) => openAiGenerateTrainingHandler(req, res))

if (isProd) {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))
} else {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' })
  app.use(vite.middlewares)
}

const port = 5182
app.listen(port, '0.0.0.0', () => {
  console.log('')
  console.log('  Kevin English Dev V2.1.0')
  console.log(`  Local:   http://localhost:${port}/`)
  console.log(`  Network: use your Mac IP, e.g. http://192.168.x.x:${port}/`)
  console.log('')
})
