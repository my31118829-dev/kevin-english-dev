import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

const STORE_KEY = 'ke_dev_store_v3956'
const SETTINGS_KEY = 'ke_dev_settings_v3956'
const PREVIOUS_SETTINGS_KEYS = ['ke_dev_settings_v3955', 'ke_dev_settings_v3954', 'ke_dev_settings_v3953', 'ke_dev_settings_v3952']
const TAB_KEY = 'ke_dev_tab_v3956'
const OUTPUT_MODE_KEY = 'ke_dev_output_mode_v3956'
const READER_LESSONS_KEY = 'ke_aus_reader_lessons_v1'
const READER_ACTIVE_KEY = 'ke_aus_reader_active_v1'
const APP_VERSION = '3.9.56'
const LOCAL_AUDIO_DB = 'ke_dev_original_audio_v1'
const LOCAL_AUDIO_STORE = 'originalAudio'
const ACTIVE_USER_KEY = 'ke_dev_active_user_v1'
const USER_PROFILES_KEY = 'ke_dev_user_profiles_v1'

const DEFAULT_USER_PROFILES = [
  { id: 'kevin', name: 'Kevin', password: '' },
  { id: 'mandy', name: 'Mandy', password: '' }
]

const VOICE_OPTIONS = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer']

const SOURCE_TYPES = {
  textbookCourse: 'Textbook Course',
  realLifeExpansion: 'Expansion Pack',
  generalTopicPack: 'General Topic Pack'
}

const AUDIO_MODES = {
  original: 'Original Audio',
  generated: 'Generated Audio'
}

const PHONE_MAX_WIDTH = 760

function resolvePhoneViewByWidth(width) {
  return Number(width || 0) <= PHONE_MAX_WIDTH
}

const NAV_ITEMS = [
  { id: 'reader', labelKey: 'nav.reader', hintKey: 'navHint.reader', showOnPhone: false, showOnMac: true },
  { id: 'today', labelKey: 'nav.today', hintKey: 'navHint.today', phoneLabelKey: 'nav.today', phoneHintKey: 'navHint.phone.today', showOnPhone: true, showOnMac: true },
  { id: 'learn', labelKey: 'nav.study', hintKey: 'navHint.study', phoneLabelKey: 'nav.listen', phoneHintKey: 'navHint.phone.listen', showOnPhone: true, showOnMac: true },
  { id: 'practice', labelKey: 'nav.practice', hintKey: 'navHint.practice', showOnPhone: false, showOnMac: true },
  { id: 'output', labelKey: 'nav.speak', hintKey: 'navHint.speak', phoneLabelKey: 'nav.speak', phoneHintKey: 'navHint.phone.speak', showOnPhone: true, showOnMac: true },
  { id: 'review', labelKey: 'nav.review', hintKey: 'navHint.review', phoneLabelKey: 'nav.review', phoneHintKey: 'navHint.phone.review', showOnPhone: true, showOnMac: true },
  { id: 'library', labelKey: 'nav.library', hintKey: 'navHint.library', showOnPhone: false, showOnMac: true }
]

function isValidTabId(tabId) {
  return NAV_ITEMS.some(item => item.id === tabId)
}

function normalizeOutputMode(mode) {
  return ['guided', 'rolePlay', 'retell'].includes(mode) ? mode : 'guided'
}

const UI_TEXT = {
  en: {
    'nav.today': 'Today',
    'nav.reader': 'Reader',
    'nav.library': 'Library',
    'nav.learn': 'Learn',
    'nav.listen': 'Listen',
    'nav.study': 'Study',
    'nav.practice': 'Practice',
    'nav.drills': 'Drills',
    'nav.output': 'Speak',
    'nav.speak': 'Speak',
    'nav.review': 'Review',
    'navHint.today': 'Daily',
    'navHint.reader': 'Kevin in Australia',
    'navHint.library': 'Content',
    'navHint.learn': 'Input',
    'navHint.study': 'Deep session',
    'navHint.practice': 'Practice',
    'navHint.drills': 'Focused reps',
    'navHint.output': 'Output',
    'navHint.speak': 'Speaking',
    'navHint.review': 'Review',
    'navHint.phone.today': 'Start',
    'navHint.phone.listen': 'Train',
    'navHint.phone.speak': 'Talk',
    'navHint.phone.review': 'Recall',
    'title.today': 'Today',
    'title.reader': 'Kevin in Australia',
    'title.library': 'Library',
    'title.learn': 'Learn Input',
    'title.study': 'Study Workspace',
    'title.listen': 'Listen',
    'title.practice': 'Practice',
    'title.output': 'Speak',
    'title.speak': 'Speak',
    'title.review': 'Review Memory',
    'settings': 'Settings',
    'account': 'Account',
    'currentCourse': 'Current Course',
    'continueLearning': 'Continue Learning',
    'resumeStage': 'Resume {stage}',
    'lastStudied': 'Last studied {stage} · {date}',
    'notStartedYet': 'Not started yet',
    'stage.learn': 'Learn',
    'stage.practice': 'Practice',
    'stage.output': 'Output',
    'stage.review': 'Review',
    'chooseCourse': 'Choose a course',
    'firstCourseHint': 'Open Library and import your first course.',
    'startLearn': 'Start Learn',
    'openLibrary': 'Open Library',
    'courses': 'Courses',
    'dueReview': 'Due Review',
    'lines': 'Lines',
    'todayPractice': 'Today Speaking',
    'quickResponse': 'Quick Speak',
    'practiceSuggested': '{count} suggested speaking prompts from the current course.',
    'noPracticeQueued': 'No speaking prompts queued yet.',
    'startPractice': 'Start Practice',
    'todayReview': 'Today Review',
    'reviewMemory': 'Review Memory',
    'reviewReady': '{count} chunks, useful sentences, and weak items are ready today.',
    'startReview': 'Start Review',
    'libraryImport': 'Library / Import',
    'manageContent': 'Manage course content',
    'manageContentHint': 'Courses, packs, and import tools.',
    'macbook': 'MacBook',
    'macbookUse': 'Deep study, speaking, review, content work',
    'macbookHint': 'Best for focused sessions and full-course learning.',
    'iphone': 'iPhone 17 Pro',
    'iphoneUse': 'Listen, speak, review in spare moments',
    'iphoneHint': 'Best for 5-15 minute daily training.',
    'dailyTrainer': 'Daily Trainer',
    'dailyTrainerHint': 'A lightweight flow for spare moments.',
    'studyWorkspace': 'Study Workspace',
    'studyWorkspaceHint': 'A deeper MacBook workspace for focused learning.',
    'listenAction': 'Listen',
    'practiceAction': 'Practice',
    'speakAction': 'Speak',
    'reviewAction': 'Review',
    'courseLibrary': 'Course Library',
    'courseLibraryHint': 'Textbook courses, expansion packs, and topic packs.',
    'addContent': 'Add Content',
    'import': 'Import',
    'audioImport': 'Audio Import',
    'audioImportHint': 'For textbook original audio. Keep Original Audio Mode.',
    'textPackImport': 'Text Pack Import',
    'textPackImportHint': 'For ChatGPT topic packs and expansion packs. Use Generated Audio Mode.',
    'back': 'Back',
    'textbookAudioMode': 'Textbook Audio · Original Audio Mode',
    'audioImportNoticeTitle': 'Original textbook audio only.',
    'audioImportNoticeBody': 'Keeps original audio and builds subtitles plus training content.',
    'courseTitle': 'Course Title',
    'category': 'Category',
    'level': 'Level',
    'uploadTextbookAudio': 'Upload textbook audio',
    'smartProcess': 'Smart Process',
    'previewTranscript': 'Preview Transcript',
    'transcriptLines': 'Transcript / subtitle lines',
    'saveAudioCourse': 'Save Audio Course',
    'textPackDemoImport': 'Text Pack / Demo Pack Import',
    'textPackPlaceholder': 'Paste @@COURSE_START@@ text pack or Demo Content Pack markdown here...',
    'importDemoPack': 'Import Demo Pack',
    'importTextPack': 'Import Text Pack',
    'listen': 'Listen',
    'background': 'Background',
    'languagePreview': 'Language Preview',
    'studyTools': 'Tools',
    'showTools': 'Show tools',
    'hideTools': 'Hide tools',
    'advancedToolsHint': 'Language preview, background notes, and line editor',
    'play': 'Play',
    'playShort': 'Play',
    'listenAll': 'Listen All',
    'subtitleLines': 'subtitle lines',
    'languageItems': 'language items',
    'practiceTasks': 'practice tasks',
    'regenerateTraining': 'Regenerate Training',
    'addPractice': 'Add Practice',
    'addReview': 'Add Review',
    'saveReview': 'Save Review',
    'saveShort': 'Save',
    'starShort': '☆',
    'toolShort': 'Tools',
    'understand': 'Understand',
    'meaningUnits': 'Meaning Units',
    'currentLine': 'Current Line',
    'repeatCount': 'Repeat',
    'smartPause': 'Smart Pause',
    'autoPause': 'Auto',
    'smartPauseHint': 'Short 1.5s · Medium 3s · Long 4.5s',
    'smartPauseStatus': '{seconds}s pause for this line',
    'lineTapLoopHint': 'Tap line = auto repeat 3x',
    'playbackSpeed': 'Speed',
    'focusMode': 'Focus Listening',
    'focusHint': 'Tap a sentence to hear it and shadow it with automatic repeats.',
    'focusChunks': 'Core Chunks',
    'transcript': 'Transcript',
    'followAlong': 'Follow Along',
    'cnOnly': 'CN only',
    'resetOriginal': 'Reset to Original',
    'resetOriginalUnavailable': 'Original baseline is not saved for this line yet.',
    'delete': 'Delete',
    'lineMore': 'Line Tools',
    'clickToPlay': 'Click any sentence or language item to play.',
    'examples': 'Examples',
    'automationExamples': 'Automation Examples',
    'originalLine': 'Original',
    'dailyLine': 'Daily',
    'savedReview': 'Saved to Review.',
    'editLine': 'Edit Line',
    'editShort': 'Edit',
    'lineEditor': 'Line Edit',
    'lineLabel': 'Line {number}',
    'timing': 'Timing',
    'structure': 'Structure',
    'text': 'Text',
    'playLine': 'Play Line',
    'prevLine': 'Prev',
    'nextLine': 'Next',
    'saveTiming': 'Save Timing',
    'timingSaved': 'Timing saved.',
    'splitHere': 'Split Here',
    'splitHint': 'Split after a word',
    'typing': 'Typing',
    'replacement': 'Replacement',
    'guidedSpeaking': 'Guided Speaking',
    'rolePlay': 'Role-play',
    'retell': 'Free Talk',
    'guidedHint': 'Use support chunks and complete short answers first.',
    'rolePlayHint': 'Listen to partner lines and respond in your role.',
    'retellHint': 'Stay in scenario and speak freely with level limits.',
    'freeTalkLevel': 'Free Talk Level',
    'levelA2': 'A2',
    'levelB1': 'B1',
    'levelB2': 'B2',
    'chunks': 'Chunks',
    'usefulSentences': 'Useful Sentences',
    'weakStuck': 'Weak / Stuck',
    'reviewQueue': 'Review Queue',
    'showQueue': 'Show Queue',
    'hideQueue': 'Hide Queue',
    'showAnswer': 'Show Answer',
    'again': 'Again',
    'hard': 'Hard',
    'good': 'Good',
    'check': 'Check',
    'next': 'Next',
    'hide': 'Hide',
    'open': 'Open',
    'continue': 'Continue',
    'progress': 'progress',
    'linkedTo': 'Linked to: {title}',
    'unaligned': 'unaligned',
    'unalignedWarning': '{count} unaligned subtitle lines need timestamp check',
    'noLanguageItems': 'No language items yet. Import a richer Text Pack or process textbook audio later.',
    'noOutputTasks': 'No output tasks yet.',
    'noReviewToday': 'No review due today. New content will appear later, not immediately after import.',
    'noReviewSection': 'No cards in this review section yet.',
    'source.textbookCourse': 'Textbook Course',
    'source.realLifeExpansion': 'Expansion Pack',
    'source.generalTopicPack': 'General Topic Pack',
    'audio.original': 'Original Audio',
    'audio.generated': 'Generated Audio',
    'listen.textbook': 'Textbook Audio',
    'listen.generated': 'Generated Dialogue',
    'bg.Topic': 'Topic',
    'bg.Scene': 'Scene',
    'bg.Speakers': 'Speakers',
    'bg.Main Idea': 'Main Idea',
    'bg.Purpose': 'Purpose',
    'bg.Real-life Use': 'Real-life Use',
    'bg.Learning Goal': 'Learning Goal',
    'bg.Simple Chinese Explanation': 'Simple Chinese Explanation',
    'settingsTitle': 'Settings',
    'settingsNote': 'Version {version}',
    'studyStreak': 'Study Streak',
    'days': 'days',
    'todayDone': 'Today Done',
    'practiceDone': 'Practice',
    'outputDone': 'Output',
    'speakTasks': 'Speak tasks',
    'reviewDone': 'Review',
    'mobileGreeting': 'Good to see you, {name}',
    'mobileGoal': 'Listen first, speak next, review before you forget.',
    'mobileStageHint.listen': 'Listen + shadow',
    'mobileStageHint.speak': 'Guided + role-play',
    'mobileStageHint.review': 'Chunks + sentences',
    'mobileQuickSpeak': 'Start a short speaking round',
    'mobileQuickReview': 'Review due chunks',
    'todayHeroKicker': 'Today loop',
    'todayHeroTitle': 'Listen, speak, review. One small loop.',
    'todayHeroBody': 'Start with the current course. The app will guide you through the next step.',
    'todayMissionTitle': 'Your next learning loop',
    'todayMissionBody': 'One course, three simple actions. Finish the loop first; explore tools later.',
    'todayPrimaryAction': 'Continue: {step}',
    'todayRemainingSteps': '{count} steps left today',
    'showSecondaryPanels': 'Show details',
    'hideSecondaryPanels': 'Hide details',
    'todayCompleteTitle': 'Today loop complete',
    'todayCompleteBody': 'Nice. You listened, spoke, and reviewed. Start a fresh loop when you are ready.',
    'todayCompleteBadge': 'Complete',
    'nextLoop': 'Start Next Loop',
    'todayMissionStats': 'Today',
    'missionReady': 'Ready',
    'missionCurrent': 'Now',
    'missionDone': 'Done',
    'missionNext': 'Next',
    'missionCourseEmpty': 'No course yet',
    'missionCourseEmptyBody': 'Import on Mac first, then iPhone becomes your daily trainer.',
    'enterStep': 'Open',
    'importOnMac': 'Import on Mac',
    'continueCurrentStep': 'Continue Current Step',
    'importedOpenListen': 'Imported. Starting from Listen.',
    'listenDoneMessage': 'Listening loop done. Now speak with the same course.',
    'listenDonePracticeMessage': 'Listening loop done. Now turn the sentences into your own reflexes.',
    'practiceDoneMessage': 'Practice done. Now speak with the same course.',
    'outputDoneMessage': 'Speaking loop done. Review what matters now.',
    'finishListen': 'Finish Listen',
    'finishPractice': 'Finish Practice',
    'finishSpeaking': 'Finish Speaking',
    'completeAndSpeak': 'Complete and Speak',
    'nextPracticeTask': 'Next Practice Task',
    'completeAndReview': 'Complete and Review',
    'nextSpeakingTask': 'Next Speaking Task',
    'noReviewAfterSpeak': 'No review due yet. Save useful sentences or stuck answers while speaking.',
    'reviewSessionDone': 'Review loop done. Back to Today.',
    'macCommandTitle': 'Mac Study Desk',
    'macCommandBody': 'Use Mac for the full course: import, inspect content, and push one course through the loop.',
    'recommendedNext': 'Recommended next',
    'studyQueueTitle': 'Study queue',
    'studyQueueBody': 'One course should always have a clear next step.',
    'queueCurrent': 'Current course',
    'queueCurrentBody': 'Pick up where you stopped and continue the loop.',
    'queueReview': 'Due review',
    'queueReviewBody': 'Clear weak items before they pile up.',
    'queueImport': 'Import route',
    'queueImportBody': 'Add a textbook audio file or a generated pack.',
    'queueOpenCurrent': 'Open current step',
    'queueGoReview': 'Go to review',
    'queueOpenLibrary': 'Open Library',
    'contentHealth': 'Content health',
    'contentHealthBody': '{lines} lines · {tasks} speaking tasks · {reviews} review cards',
    'reviewPressure': 'Review pressure',
    'courseProgress': 'Course progress',
    'openCurrentStep': 'Open Current Step',
    'manageLibrary': 'Manage Library',
    'clearReviewFirst': 'Clear Review First',
    'recentCoursesTitle': 'Recent courses',
    'reviewEmptyTitle': 'Nothing due right now',
    'reviewEmptyBody': 'Keep the loop moving: listen again, speak once, or return to Today.',
    'backToToday': 'Back to Today',
    'reviewRoundTitle': 'Review round',
    'reviewRoundBody': '{remaining} cards left in this section. Finish the round, then return to Today.',
    'reviewRoundDoneSoon': 'Last card in this section.',
    'reviewFocusTitle': 'Recall first',
    'reviewFocusBody': 'Look at the Chinese, say the English in your head, then reveal the answer.',
    'listenRoundTitle': 'Listening round',
    'listenRoundBody': 'Line {current} of {total}. Listen, shadow, then go to the next line.',
    'listenRoundLast': 'Last listening line. Finish it, then speak.',
    'practiceRoundTitle': 'Practice round',
    'practiceRoundBody': 'Task {current} of {total}. Make the sentence fast before you start speaking.',
    'practiceRoundLast': 'Last practice task. Finish it, then speak.',
    'practiceTaskTitle': 'Make it automatic',
    'practiceTaskBody': 'Type, replace, and quick-answer with the same language before open speaking.',
    'practicePrompt': 'Prompt',
    'practiceAnswer': 'Model Answer',
    'checkAnswer': 'Check Answer',
    'noPracticeTasks': 'No practice tasks yet.',
    'practiceMatched': 'Looks close. Say it once out loud.',
    'practiceTryAgain': 'Not quite yet. Compare the model answer and try again.',
    'practiceResultPerfect': 'Correct',
    'practiceResultPerfectBody': 'Great. Your answer matches the model sentence.',
    'practiceResultClose': 'Close',
    'practiceResultCloseBody': 'You are close. Adjust the key words, then say it again.',
    'practiceResultRetry': 'Need another try',
    'practiceResultRetryBody': 'Read the model answer once and try one more time.',
    'practiceResultEmpty': 'Type or say your answer first',
    'practiceResultEmptyBody': 'Enter a sentence, then tap Check Answer.',
    'practiceProgressLabel': 'Practice progress',
    'yourAnswer': 'Your answer',
    'nextListenLine': 'Next Line',
    'speakRoundTitle': 'Speaking round',
    'speakRoundBody': 'Task {current} of {total}. Finish the round, then review useful sentences.',
    'speakRoundLast': 'Last speaking task. Complete it, then review.',
    'currentMode': 'Current mode',
    'startListeningNow': 'Start Listening',
    'startSpeakingNow': 'Start Speaking',
    'learningPathTitle': 'Your path',
    'pathListenTitle': 'Listen',
    'pathListenBody': 'Hear one line, shadow it, then move on.',
    'pathSpeakTitle': 'Speak',
    'pathSpeakBody': 'Use prompts, role-play, or Free Talk.',
    'pathReviewTitle': 'Review',
    'pathReviewBody': 'Recall chunks and useful sentences.',
    'pageTask': 'What to do here',
    'listenTaskTitle': 'Listen first',
    'listenTaskBody': 'Tap Play. Listen to one sentence, repeat it aloud, then go to the next sentence.',
    'speakTaskTitle': 'Now say it',
    'speakTaskBody': 'Choose one mode. Use short answers first, then role-play or Free Talk.',
    'reviewTaskTitle': 'Remember it',
    'reviewTaskBody': 'Look at the prompt, recall the English, then rate the card.',
    'mainAction': 'Main action',
    'secondaryAction': 'Next step',
    'close': 'Close',
    'uiLanguage': 'Interface Language',
    'uiEnglish': 'English',
    'uiChinese': 'Chinese',
    'openaiKey': 'OpenAI API Key',
    'ttsVoice': 'TTS Voice',
    'defaultVoice': 'Default Voice',
    'speakerVoices': 'Speaker Voices',
    'speakerVoicesHint': 'Choose voices for generated dialogue speakers. Original audio courses still play the original audio.',
    'voiceFor': 'Voice for {speaker}',
    'languageDisplay': 'Learning Text Display',
    'pauseSeconds': 'Pause Seconds',
    'displayScale': 'Display Scale',
    'normal': 'Normal',
    'comfortable': 'Comfortable',
    'large': 'Large',
    'continueLearn': 'Continue Learn',
    'go': 'Go',
    'systemRule': 'System Rule',
    'systemRuleBody': 'Audio Import keeps original audio. Text Pack Import uses generated audio.',
    'deviceUse': 'Device Use',
    'deviceUseBody': 'MacBook for setup. iPhone for daily training.',
    'selectedAudio': 'Selected: {name}. Audio will be saved in IndexedDB, not localStorage.',
    'previewReady': 'Preview ready: {count} subtitle lines. Saving will generate training content automatically.',
    'lineEditorTitle': 'Transcript Line Editor',
    'lineEditorHint': 'Check textbook audio timestamps.',
    'addLine': 'Add Line',
    'mergeNext': 'Merge Next',
    'deleteLine': 'Delete Line',
    'nudgeStart': 'Start',
    'nudgeEnd': 'End',
    'speaker': 'Speaker',
    'start': 'Start',
    'end': 'End',
    'english': 'English',
    'chinese': 'Chinese',
    'copyVoicePrompt': 'Copy ChatGPT Voice Prompt',
    'missingFields': 'Missing Fields',
    'warnings': 'Warnings',
    'retellPlaceholder': 'Speak freely in this scenario...',
    'freeTalkStart': 'Start AI Talk',
    'freeTalkSend': 'Send',
    'freeTalkYou': 'You',
    'freeTalkAi': 'AI Partner',
    'freeTalkInput': 'Type what you would say...',
    'freeTalkThinking': 'AI is listening...',
    'freeTalkOpening': 'What would you say first?',
    'freeTalkHint': 'Hint',
    'freeTalkFeedback': 'Feedback',
    'freeTalkFallback': 'Local fallback is on. Add an OpenAI key for smarter replies.',
    'saveSuggested': 'Save Suggested Sentence',
    'answerPlaceholder': 'Type your answer here...',
    'accountSettings': 'Accounts',
    'accountName': 'Name',
    'accountPassword': 'Password',
    'passwordPlaceholder': 'Optional local password',
    'passwordPrompt': 'Password for {name}',
    'passwordWrong': 'Password is incorrect.',
    'passwordSavedHint': 'Local only. Leave blank for no password.',
    'dataBackup': 'Data Backup',
    'exportData': 'Export Current Account',
    'importData': 'Import to Current Account',
    'backupHint': 'Courses, review queue, progress, and activity for this account only.',
    'exportReady': 'Current account data exported.',
    'importDone': 'Current account data imported.',
    'importFailed': 'Import failed. Please choose a valid backup file.',
    'markWeak': 'Mark Weak',
    'markStuck': 'Mark Stuck',
    'addedWeak': 'Added to Weak / Stuck review.',
    'addedStuck': 'Output prompt added to Weak / Stuck review.',
    'weakPriority': '{count} weak or stuck items need attention.',
    'macFlowTitle': 'Full Course Flow',
    'macFlowHint': 'Keep one course moving through listening, speaking, and review.',
    'flowStep.listen': 'Listen',
    'flowStep.practice': 'Practice',
    'flowStep.speak': 'Speak',
    'flowStep.review': 'Review',
    'flowState.done': 'Done',
    'flowState.current': 'Current',
    'flowState.next': 'Next',
    'flowState.ready': 'Ready',
    'continueToSpeak': 'Continue to Speak',
    'continueToReview': 'Continue to Review',
    'rewriteTitle': 'Textbook AI Rewrite',
    'rewriteHint': 'Keep the textbook original audio separate, then save a Kevin Melbourne version as Generated Audio.',
    'originalVersion': 'Original Textbook',
    'kevinVersion': 'Kevin Melbourne Version',
    'useKevinVersion': 'Use This Version',
    'openKevinVersion': 'Open Kevin Version',
    'generatingRewrite': 'Generating...',
    'rewriteSaved': 'Kevin generated version saved. Opening Role-play now.',
    'rewriteFallback': 'AI rewrite is unavailable, so a local Kevin version was saved instead.',
    'rewriteOnlyTextbook': 'Only textbook original-audio courses use this rewrite step.',
    'recordingOff': 'Recording Off',
    'recordingOn': 'Recording On',
    'yourTurn': 'Your turn',
    'partnerTurn': 'Partner line',
    'startRolePlay': 'Start Role-play',
    'pauseAuto': 'Auto pause {seconds}s',
    'thinkFirst': 'Recall the English before showing the answer.',
    'cardProgress': 'Card {current} of {total}',
    'sourceLabel': 'Source',
    'nextDue': 'Next due',
    'libraryFlowTitle': 'Import Flow',
    'libraryFlowHint': 'Import once, then the app opens the course directly for listening and speaking.',
    'importGuideAudioTitle': 'Original textbook audio',
    'importGuideAudioBody': 'Keep the uploaded MP3 as the source audio. The app only adds subtitles, speaking tasks, and review cards.',
    'importGuideTextTitle': 'Generated content pack',
    'importGuideTextBody': 'Paste a ChatGPT pack or topic pack. The app treats it as generated audio content and prepares speaking practice directly.',
    'originalAudioRule': 'Original audio stays original',
    'generatedAudioRule': 'Generated packs use TTS',
    'importCreatesListen': 'Listen page',
    'importCreatesSpeak': 'Speaking tasks',
    'importCreatesReview': 'Review queue',
    'importAfterSave': 'After saving, the app opens Listen automatically.',
    'importSuccessTitle': 'Course ready',
    'importSuccessBody': 'Start with listening. The same course already has speaking and review work waiting behind it.',
    'startFirstLine': 'Start first line',
    'importConfirmTitle': 'Import check',
    'importConfirmHint': 'Confirm the route before adding it to your course list.',
    'importRouteListen': 'Opens in Listen',
    'importRouteSpeak': 'Speak tasks ready',
    'importRouteReview': 'Review cards queued',
    'confirmImport': 'Confirm Import',
    'savedReviewInline': 'Saved to Review'
  },
  zh: {
    'nav.today': '今日',
    'nav.reader': '阅读器',
    'nav.library': '内容库',
    'nav.learn': '输入',
    'nav.listen': '听',
    'nav.study': '学习',
    'nav.practice': '内化',
    'nav.drills': '练习',
    'nav.output': '开口',
    'nav.speak': '说',
    'nav.review': '复习',
    'navHint.today': '学习首页',
    'navHint.reader': '澳洲课程',
    'navHint.library': '课程管理',
    'navHint.learn': '听懂预习',
    'navHint.study': '深度学习',
    'navHint.practice': '练成反应',
    'navHint.drills': '专项练习',
    'navHint.output': '说出使用',
    'navHint.speak': '开口训练',
    'navHint.review': '长期记住',
    'navHint.phone.today': '开始',
    'navHint.phone.listen': '跟读',
    'navHint.phone.speak': '开口',
    'navHint.phone.review': '回忆',
    'title.today': '今日',
    'title.reader': 'Kevin in Australia',
    'title.library': '内容库',
    'title.learn': '输入理解',
    'title.study': '深度学习工作台',
    'title.listen': '听与跟读',
    'title.practice': '内化练习',
    'title.output': '开口训练',
    'title.speak': '开口训练',
    'title.review': '长期复习',
    'settings': '设置',
    'account': '账户',
    'currentCourse': '当前课程',
    'continueLearning': '继续学习',
    'resumeStage': '继续{stage}',
    'lastStudied': '上次学习：{stage} · {date}',
    'notStartedYet': '还未开始',
    'stage.learn': '输入',
    'stage.practice': '内化',
    'stage.output': '输出',
    'stage.review': '复习',
    'chooseCourse': '选择课程',
    'firstCourseHint': '打开内容库并导入第一套课程。',
    'startLearn': '开始输入',
    'openLibrary': '打开内容库',
    'courses': '课程',
    'dueReview': '今日复习',
    'lines': '句',
    'todayPractice': '今日开口',
    'quickResponse': '快速开口',
    'practiceSuggested': '当前课程建议开口 {count} 项。',
    'noPracticeQueued': '暂无开口任务。',
    'startPractice': '开始练习',
    'todayReview': '今日复习',
    'reviewMemory': '复习记忆',
    'reviewReady': '今天有 {count} 个语块、实用句和易错内容需要复习。',
    'startReview': '开始复习',
    'libraryImport': '内容库 / 导入',
    'manageContent': '管理课程内容',
    'manageContentHint': '课程、训练包和导入工具。',
    'macbook': 'MacBook',
    'macbookUse': '深度学习、开口、复习、内容工作',
    'macbookHint': '适合长时间专注学习和完整课程训练。',
    'iphone': 'iPhone 17 Pro',
    'iphoneUse': '碎片时间听、说、复习',
    'iphoneHint': '适合 5-15 分钟每日训练。',
    'dailyTrainer': '每日训练器',
    'dailyTrainerHint': '适合碎片时间快速进入训练。',
    'studyWorkspace': '深度学习工作台',
    'studyWorkspaceHint': '适合 MacBook 上长时间专注学习。',
    'listenAction': '听',
    'practiceAction': '练',
    'speakAction': '说',
    'reviewAction': '复习',
    'courseLibrary': '课程内容库',
    'courseLibraryHint': '教材课程、拓展训练包、自由主题包。',
    'addContent': '添加内容',
    'import': '导入',
    'audioImport': '音频导入',
    'audioImportHint': '只用于教材原音频，保持原音频模式。',
    'textPackImport': '文字稿导入',
    'textPackImportHint': '用于 ChatGPT 主题包和拓展训练包，使用生成音频模式。',
    'back': '返回',
    'textbookAudioMode': '教材音频 · 原音频模式',
    'audioImportNoticeTitle': '只用于教材原音频。',
    'audioImportNoticeBody': '保留原音频，并生成字幕与训练内容。',
    'courseTitle': '课程标题',
    'category': '分类',
    'level': '等级',
    'uploadTextbookAudio': '上传教材音频',
    'smartProcess': '智能处理',
    'previewTranscript': '预览字幕',
    'transcriptLines': '转录 / 字幕句子',
    'saveAudioCourse': '保存音频课程',
    'textPackDemoImport': '文字稿 / 演示包导入',
    'textPackPlaceholder': '在这里粘贴 @@COURSE_START@@ 文字包或 Demo Content Pack markdown...',
    'importDemoPack': '导入演示包',
    'importTextPack': '导入文字包',
    'listen': '听与跟读',
    'background': '背景理解',
    'languagePreview': '语言预习',
    'studyTools': '工具',
    'showTools': '展开工具',
    'hideTools': '收起工具',
    'advancedToolsHint': '语块预览、背景说明与句子微调',
    'play': '播放',
    'playShort': '播',
    'listenAll': '全部听',
    'subtitleLines': '字幕句',
    'languageItems': '语言点',
    'practiceTasks': '练习任务',
    'regenerateTraining': '重新生成训练',
    'addPractice': '加入练习',
    'addReview': '加入复习',
    'saveReview': '收藏复习',
    'saveShort': '收藏',
    'starShort': '☆',
    'toolShort': '工具',
    'understand': '助解',
    'meaningUnits': '意义块',
    'currentLine': '当前句',
    'repeatCount': '重复',
    'smartPause': '智能停顿',
    'autoPause': '自动',
    'smartPauseHint': '短句 1.5 秒 · 中句 3 秒 · 长句 4.5 秒',
    'smartPauseStatus': '当前句停顿 {seconds} 秒',
    'lineTapLoopHint': '点句子 = 自动重复 3 次',
    'playbackSpeed': '速度',
    'focusMode': '单屏精听',
    'focusHint': '点句子即可单句聆听并自动重复跟读。',
    'focusChunks': '核心语块',
    'transcript': '字幕列表',
    'followAlong': '跟读聚焦',
    'cnOnly': '仅中文',
    'resetOriginal': '恢复原始',
    'resetOriginalUnavailable': '这句暂时没有可恢复的原始版本。',
    'delete': '删除',
    'lineMore': '句子工具',
    'clickToPlay': '点击句子或语言内容即可播放。',
    'examples': '例句',
    'automationExamples': '自动化例句',
    'originalLine': '原文',
    'dailyLine': '日常',
    'savedReview': '已加入复习。',
    'editLine': '微调句子',
    'editShort': '调',
    'lineEditor': '句子微调',
    'lineLabel': '第 {number} 句',
    'timing': '时间轴',
    'structure': '结构',
    'text': '文本',
    'playLine': '播放本句',
    'prevLine': '上一句',
    'nextLine': '下一句',
    'saveTiming': '保存时间',
    'timingSaved': '时间已保存。',
    'splitHere': '拆分句子',
    'splitHint': '点击单词后拆分',
    'typing': '拼写打字',
    'replacement': '替换练习',
    'guidedSpeaking': '半控制表达',
    'rolePlay': '角色扮演',
    'retell': '自由对话',
    'guidedHint': '先用语块提示完成简短回答。',
    'rolePlayHint': '先听对方台词，再用你的角色开口。',
    'retellHint': '限定在当前场景内自由开口。',
    'freeTalkLevel': '自由对话难度',
    'levelA2': 'A2',
    'levelB1': 'B1',
    'levelB2': 'B2',
    'chunks': '语块',
    'usefulSentences': '实用句子',
    'weakStuck': '易错 / 卡壳',
    'reviewQueue': '复习队列',
    'showQueue': '展开队列',
    'hideQueue': '收起队列',
    'showAnswer': '显示答案',
    'again': '再来',
    'hard': '有点难',
    'good': '记住了',
    'check': '检查',
    'next': '下一个',
    'hide': '收起',
    'open': '打开',
    'continue': '继续',
    'progress': '进度',
    'linkedTo': '关联课程：{title}',
    'unaligned': '未对齐',
    'unalignedWarning': '{count} 条字幕需要检查时间轴',
    'noLanguageItems': '暂无语言点。可以导入更完整的文字包，或稍后处理教材音频。',
    'noOutputTasks': '暂无输出任务。',
    'noReviewToday': '今天暂无到期复习。新内容会在之后进入复习队列。',
    'noReviewSection': '这个复习模块暂无卡片。',
    'source.textbookCourse': '教材课程',
    'source.realLifeExpansion': '拓展训练包',
    'source.generalTopicPack': '自由主题包',
    'audio.original': '原音频',
    'audio.generated': '生成音频',
    'listen.textbook': '教材原音频',
    'listen.generated': '生成对话音频',
    'bg.Topic': '主题',
    'bg.Scene': '场景',
    'bg.Speakers': '说话人',
    'bg.Main Idea': '主要内容',
    'bg.Purpose': '用途',
    'bg.Real-life Use': '现实生活用途',
    'bg.Learning Goal': '学习目标',
    'bg.Simple Chinese Explanation': '中文解释',
    'settingsTitle': '设置',
    'settingsNote': '版本 {version}',
    'studyStreak': '连续学习',
    'days': '天',
    'todayDone': '今日完成',
    'practiceDone': '练习',
    'outputDone': '输出',
    'speakTasks': '开口任务',
    'reviewDone': '复习',
    'mobileGreeting': '{name}，今天继续一点点',
    'mobileGoal': '先听懂，再开口，最后复习记住。',
    'mobileStageHint.listen': '精听 + 跟读',
    'mobileStageHint.speak': '提示 + 角色扮演',
    'mobileStageHint.review': '语块 + 句子',
    'mobileQuickSpeak': '开始一轮短开口',
    'mobileQuickReview': '复习到期语块',
    'todayHeroKicker': '今日闭环',
    'todayHeroTitle': '先听懂，再开口，最后复习。',
    'todayHeroBody': '从当前课程开始，按顺序完成一个小闭环，不需要先理解所有功能。',
    'todayMissionTitle': '下一轮学习任务',
    'todayMissionBody': '一门课程，三个动作。先完成闭环，再看其他工具。',
    'todayPrimaryAction': '继续：{step}',
    'todayRemainingSteps': '今天还剩 {count} 步',
    'showSecondaryPanels': '显示辅助信息',
    'hideSecondaryPanels': '收起辅助信息',
    'todayCompleteTitle': '今日闭环已完成',
    'todayCompleteBody': '很好。你已经完成听、说、复习，可以结束今天，也可以开始下一轮。',
    'todayCompleteBadge': '已完成',
    'nextLoop': '开始下一轮',
    'todayMissionStats': '今日',
    'missionReady': '可开始',
    'missionCurrent': '现在做',
    'missionDone': '已完成',
    'missionNext': '下一步',
    'missionCourseEmpty': '还没有课程',
    'missionCourseEmptyBody': '先在 Mac 导入课程，手机就只负责每天听、说、复习。',
    'enterStep': '进入',
    'importOnMac': '去 Mac 导入',
    'continueCurrentStep': '继续当前步骤',
    'importedOpenListen': '已导入，现在从听开始。',
    'listenDoneMessage': '听力这一轮完成，现在用同一门课开口。',
    'listenDonePracticeMessage': '听力这一轮完成，现在先把句子练成反应。',
    'practiceDoneMessage': '内化练习完成，现在用同一门课开口。',
    'outputDoneMessage': '开口这一轮完成，现在复习真正要记住的内容。',
    'finishListen': '完成听',
    'finishPractice': '完成练习',
    'finishSpeaking': '完成开口',
    'completeAndSpeak': '完成并去说',
    'nextPracticeTask': '下一个练习',
    'completeAndReview': '完成并复习',
    'nextSpeakingTask': '下一个开口任务',
    'noReviewAfterSpeak': '暂时没有到期复习。开口时保存好句或卡壳内容后，这里会出现。',
    'reviewSessionDone': '复习闭环完成，回到今日页。',
    'macCommandTitle': 'Mac 学习工作台',
    'macCommandBody': 'Mac 负责完整课程：导入、检查内容，并把一门课推进完整闭环。',
    'recommendedNext': '推荐下一步',
    'studyQueueTitle': '学习队列',
    'studyQueueBody': '一门课应该始终有明确的下一步。',
    'queueCurrent': '当前课程',
    'queueCurrentBody': '从上次停下的地方继续学习闭环。',
    'queueReview': '到期复习',
    'queueReviewBody': '先处理弱项，避免越积越多。',
    'queueImport': '导入路径',
    'queueImportBody': '新增教材音频或生成内容包。',
    'queueOpenCurrent': '打开当前步骤',
    'queueGoReview': '去复习',
    'queueOpenLibrary': '打开内容库',
    'contentHealth': '内容状态',
    'contentHealthBody': '{lines} 句 · {tasks} 个开口任务 · {reviews} 张复习卡',
    'reviewPressure': '复习压力',
    'courseProgress': '课程进度',
    'openCurrentStep': '打开当前步骤',
    'manageLibrary': '管理课程库',
    'clearReviewFirst': '先清复习',
    'recentCoursesTitle': '最近课程',
    'reviewEmptyTitle': '现在没有要复习的内容',
    'reviewEmptyBody': '继续保持闭环：可以回到今日、再听一轮，或者去开口。',
    'backToToday': '回到今日',
    'reviewRoundTitle': '本轮复习',
    'reviewRoundBody': '这个模块还剩 {remaining} 张。完成本轮后会回到今日页。',
    'reviewRoundDoneSoon': '这是这个模块的最后一张。',
    'reviewFocusTitle': '先回忆',
    'reviewFocusBody': '看中文，先在脑子里说出英文，再显示答案。',
    'listenRoundTitle': '本轮听力',
    'listenRoundBody': '第 {current} / {total} 句。听一句，跟读一句，再到下一句。',
    'listenRoundLast': '这是最后一句，完成后进入开口。',
    'practiceRoundTitle': '本轮内化',
    'practiceRoundBody': '第 {current} / {total} 个任务。先练快，再开口。',
    'practiceRoundLast': '这是最后一个内化任务，完成后进入开口。',
    'practiceTaskTitle': '把句子练成反应',
    'practiceTaskBody': '先快速回答、打字、替换，再进入真正开口。',
    'practicePrompt': '提示',
    'practiceAnswer': '参考答案',
    'checkAnswer': '检查答案',
    'noPracticeTasks': '暂无内化练习。',
    'practiceMatched': '基本接近。现在大声说一遍。',
    'practiceTryAgain': '还不太像。对照参考答案再来一次。',
    'practiceResultPerfect': '正确',
    'practiceResultPerfectBody': '很好，你的答案和参考句一致。',
    'practiceResultClose': '接近',
    'practiceResultCloseBody': '你已经很接近了，微调关键词再说一遍。',
    'practiceResultRetry': '需要再练',
    'practiceResultRetryBody': '先看一遍参考答案，再尝试一次。',
    'practiceResultEmpty': '先输入或说出答案',
    'practiceResultEmptyBody': '先写一句，再点“检查答案”。',
    'practiceProgressLabel': '练习进度',
    'yourAnswer': '你的答案',
    'nextListenLine': '下一句',
    'speakRoundTitle': '本轮开口',
    'speakRoundBody': '第 {current} / {total} 个任务。完成本轮后进入复习。',
    'speakRoundLast': '这是最后一个开口任务，完成后进入复习。',
    'currentMode': '当前模式',
    'startListeningNow': '开始听',
    'startSpeakingNow': '开始说',
    'learningPathTitle': '学习路线',
    'pathListenTitle': '听',
    'pathListenBody': '听一句，跟读一句，再进入下一句。',
    'pathSpeakTitle': '说',
    'pathSpeakBody': '先按提示回答，再角色扮演或自由对话。',
    'pathReviewTitle': '复习',
    'pathReviewBody': '先回忆英文，再看答案并评分。',
    'pageTask': '这一页做什么',
    'listenTaskTitle': '先听懂',
    'listenTaskBody': '点播放，听一句，跟着说一句，然后点下一句。',
    'speakTaskTitle': '现在开口',
    'speakTaskBody': '选择一种模式。先短回答，再进入角色扮演或自由对话。',
    'reviewTaskTitle': '把它记住',
    'reviewTaskBody': '看提示，先回忆英文，再显示答案并评分。',
    'mainAction': '主要操作',
    'secondaryAction': '下一步',
    'close': '关闭',
    'uiLanguage': '界面语言',
    'uiEnglish': '英文',
    'uiChinese': '中文',
    'openaiKey': 'OpenAI API Key',
    'ttsVoice': 'TTS 声音',
    'defaultVoice': '默认声音',
    'speakerVoices': '角色声音',
    'speakerVoicesHint': '为生成对话的不同说话人选择声音。教材原音频仍播放原音频。',
    'voiceFor': '{speaker} 的声音',
    'languageDisplay': '学习文本显示',
    'pauseSeconds': '停顿秒数',
    'displayScale': '显示大小',
    'normal': '普通',
    'comfortable': '舒适',
    'large': '大字',
    'continueLearn': '继续输入',
    'go': '前往',
    'systemRule': '系统规则',
    'systemRuleBody': '音频导入保留原音频；文字稿导入使用生成音频。',
    'deviceUse': '设备使用',
    'deviceUseBody': 'MacBook 做设置；iPhone 做每日训练。',
    'selectedAudio': '已选择：{name}。音频会保存到 IndexedDB，不存入 localStorage。',
    'previewReady': '预览已就绪：检测到 {count} 条字幕句。保存后会自动生成训练内容。',
    'lineEditorTitle': '字幕句编辑器',
    'lineEditorHint': '检查教材音频时间轴。',
    'addLine': '添加句子',
    'mergeNext': '合并下一句',
    'deleteLine': '删除句子',
    'nudgeStart': '开始',
    'nudgeEnd': '结束',
    'speaker': '说话人',
    'start': '开始',
    'end': '结束',
    'english': '英文',
    'chinese': '中文',
    'copyVoicePrompt': '复制 ChatGPT Voice 提示',
    'missingFields': '缺少字段',
    'warnings': '提醒',
    'retellPlaceholder': '围绕当前场景自由开口...',
    'freeTalkStart': '开始 AI 对话',
    'freeTalkSend': '发送',
    'freeTalkYou': '你',
    'freeTalkAi': 'AI 搭档',
    'freeTalkInput': '输入你想说的话...',
    'freeTalkThinking': 'AI 正在听...',
    'freeTalkOpening': 'What would you say first?',
    'freeTalkHint': '提示',
    'freeTalkFeedback': '反馈',
    'freeTalkFallback': '当前使用本地兜底回复。设置 OpenAI Key 后会更智能。',
    'saveSuggested': '保存建议句',
    'answerPlaceholder': '在这里输入你的回答...',
    'accountSettings': '账户',
    'accountName': '名字',
    'accountPassword': '密码',
    'passwordPlaceholder': '可选本地密码',
    'passwordPrompt': '{name} 的密码',
    'passwordWrong': '密码不正确。',
    'passwordSavedHint': '仅保存在本机。留空则无密码。',
    'dataBackup': '数据备份',
    'exportData': '导出当前账户',
    'importData': '导入到当前账户',
    'backupHint': '只包含当前账户的课程、复习队列、进度和使用记录。',
    'exportReady': '当前账户数据已导出。',
    'importDone': '当前账户数据已导入。',
    'importFailed': '导入失败，请选择有效的备份文件。',
    'markWeak': '标记易错',
    'markStuck': '标记卡壳',
    'addedWeak': '已加入易错 / 卡壳复习。',
    'addedStuck': '输出卡壳已加入复习。',
    'weakPriority': '{count} 个易错 / 卡壳内容需要优先处理。',
    'macFlowTitle': '完整课程流程',
    'macFlowHint': '让一门课程连续走完：听懂、开口、复习。',
    'flowStep.listen': '听',
    'flowStep.practice': '练',
    'flowStep.speak': '说',
    'flowStep.review': '复习',
    'flowState.done': '已完成',
    'flowState.current': '当前',
    'flowState.next': '下一步',
    'flowState.ready': '可开始',
    'continueToSpeak': '继续去说',
    'continueToReview': '继续去复习',
    'rewriteTitle': '教材音频 AI 改写',
    'rewriteHint': '教材原音频独立保留，Kevin 墨尔本版另存为生成音频。',
    'originalVersion': '教材原版',
    'kevinVersion': 'Kevin 墨尔本版',
    'useKevinVersion': '使用这个版本',
    'openKevinVersion': '打开 Kevin 版',
    'generatingRewrite': '生成中...',
    'rewriteSaved': 'Kevin 生成版已保存，正在进入角色扮演。',
    'rewriteFallback': 'AI 改写暂时不可用，已用本地 Kevin 版本保存。',
    'rewriteOnlyTextbook': '只有教材原音频课程需要走这个改写步骤。',
    'recordingOff': '录音关闭',
    'recordingOn': '录音开启',
    'yourTurn': '轮到你说',
    'partnerTurn': '对方台词',
    'startRolePlay': '开始角色扮演',
    'pauseAuto': '自动停顿 {seconds} 秒',
    'thinkFirst': '先根据中文回忆英文，再显示答案。',
    'cardProgress': '第 {current} / {total} 张',
    'sourceLabel': '来源',
    'nextDue': '下次复习',
    'libraryFlowTitle': '导入流程',
    'libraryFlowHint': '导入后直接进入课程，开始听和说，不回到复杂管理页。',
    'importGuideAudioTitle': '教材原音频',
    'importGuideAudioBody': '上传的 MP3 保持为原音频。系统只生成字幕、开口任务和复习卡，不用 TTS 替换原音频。',
    'importGuideTextTitle': '生成内容包',
    'importGuideTextBody': '粘贴 ChatGPT 内容包或主题包。系统按生成音频内容处理，并直接准备开口练习。',
    'originalAudioRule': '原音频保持原音频',
    'generatedAudioRule': '生成内容使用 TTS',
    'importCreatesListen': '听力页',
    'importCreatesSpeak': '开口任务',
    'importCreatesReview': '复习队列',
    'importAfterSave': '保存后会自动进入听力页。',
    'importSuccessTitle': '课程已准备好',
    'importSuccessBody': '先从听开始。同一门课的开口任务和复习内容已经在后面排好。',
    'startFirstLine': '开始第一句',
    'importConfirmTitle': '导入前确认',
    'importConfirmHint': '先确认内容路线，再加入课程列表。',
    'importRouteListen': '导入后进入听',
    'importRouteSpeak': '开口任务已生成',
    'importRouteReview': '复习卡已排队',
    'confirmImport': '确认导入',
    'savedReviewInline': '已保存到复习'
  }
}

function makeExamples(examples = []) {
  return examples.map(example => typeof example === 'string' ? { en: example, cn: '' } : example)
}

function compactExamples(examples = []) {
  const seen = new Set()
  return makeExamples(examples)
    .map(example => ({
      en: String(example?.en || '').trim(),
      cn: String(example?.cn || '').trim(),
      origin: example?.origin || ''
    }))
    .filter(example => {
      if (!example.en) return false
      const key = example.en.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

function dailyExampleTemplates(text, type) {
  const value = String(text || '').trim()
  if (!value) return []
  if (type === 'pattern') {
    const base = value.replace(/\.\.\./g, 'today').replace(/\s+/g, ' ').trim()
    return [
      base.endsWith('?') ? base : `${base}.`,
      value.replace(/\.\.\./g, 'at home').replace(/\s+/g, ' ').trim(),
      value.replace(/\.\.\./g, 'with my family').replace(/\s+/g, ' ').trim(),
      value.replace(/\.\.\./g, 'on weekends').replace(/\s+/g, ' ').trim()
    ].filter(Boolean)
  }
  return [
    `I hear "${value}" in daily conversation.`,
    `I can use "${value}" when I talk to local people.`,
    `I can practise "${value}" at home with my family.`
  ]
}

function normalizeExampleItem(example, fallbackOrigin = 'daily') {
  return {
    en: String(example?.en || '').trim(),
    cn: String(example?.cn || '').trim(),
    origin: example?.origin || fallbackOrigin
  }
}

function findSourceTranscriptLine(item, transcriptLines = []) {
  const source = String(item.sourceSentence || '').trim().toLowerCase()
  const expression = String(item.en || '').trim().toLowerCase()
  if (source) {
    const exact = transcriptLines.find(line => String(line?.en || '').trim().toLowerCase() === source)
    if (exact) return exact
  }
  if (expression) {
    return transcriptLines.find(line => String(line?.en || '').toLowerCase().includes(expression)) || null
  }
  return null
}

function pickDailyExamples(candidates = [], count = 2, blockedKeys = new Set()) {
  const picked = []
  for (const candidate of candidates) {
    if (picked.length >= count) break
    const normalized = normalizeExampleItem(candidate, 'daily')
    if (!normalized.en) continue
    const key = normalized.en.toLowerCase()
    if (blockedKeys.has(key)) continue
    blockedKeys.add(key)
    picked.push({ ...normalized, origin: 'daily' })
  }
  return picked
}

function enrichLanguageItem(item, transcriptLines = []) {
  const sourceLineObj = findSourceTranscriptLine(item, transcriptLines)
  const sourceLine = String(item.sourceSentence || '').trim() || String(sourceLineObj?.en || '')
  const sourceCn = String(sourceLineObj?.cn || '').trim()
  const originalExample = sourceLine
    ? normalizeExampleItem({ en: sourceLine, cn: sourceCn, origin: 'original' }, 'original')
    : null

  if (item.type === 'keyword' || item.type === 'chunk') {
    const blocked = new Set()
    const dailyPool = compactExamples([
      ...(item.examples || []).map(example => ({ ...example, origin: example.origin || 'daily' })),
      ...dailyExampleTemplates(item.en, item.type).map(en => ({ en, cn: '', origin: 'daily' }))
    ])
    if (originalExample?.en) blocked.add(originalExample.en.toLowerCase())
    const dailyExamples = pickDailyExamples(dailyPool, 2, blocked)
    const examples = compactExamples([originalExample, ...dailyExamples].filter(Boolean)).slice(0, 3)
    return { ...item, sourceSentence: sourceLine, examples, autoSentences: item.autoSentences || [] }
  }

  if (item.type === 'pattern') {
    const blocked = new Set()
    const dailyPool = compactExamples([
      ...(item.autoSentences || item.examples || []).map(example => ({ ...example, origin: example.origin || 'daily' })),
      ...dailyExampleTemplates(item.en, 'pattern').map(en => ({ en, cn: '', origin: 'daily' }))
    ])
    if (originalExample?.en) blocked.add(originalExample.en.toLowerCase())
    const dailyExamples = pickDailyExamples(dailyPool, 3, blocked)
    const autoSentences = compactExamples([originalExample, ...dailyExamples].filter(Boolean)).slice(0, 4)
    return { ...item, sourceSentence: sourceLine, examples: item.examples || [], autoSentences }
  }

  return { ...item, examples: item.examples || [], autoSentences: item.autoSentences || [] }
}

function enrichLanguageItems(items = [], transcriptLines = []) {
  return items.map(item => enrichLanguageItem(item, transcriptLines))
}

function makeLanguageItems({ keywords = [], chunks = [], patterns = [], usefulSentences = [] }) {
  return enrichLanguageItems([
    ...keywords.map((item, index) => ({
      id: item.id || `demo_kw_${index}`,
      type: 'keyword',
      en: item.en,
      cn: item.cn,
      note: 'Keyword from the demo course.',
      sourceSentence: item.sourceSentence || '',
      examples: makeExamples(item.examples),
      autoSentences: [],
      reviewEnabled: false
    })),
    ...chunks.map((item, index) => ({
      id: item.id || `demo_chunk_${index}`,
      type: 'chunk',
      en: item.en,
      cn: item.cn,
      note: 'Chunk for automatic speaking practice.',
      sourceSentence: item.sourceSentence || '',
      examples: makeExamples(item.examples),
      autoSentences: [],
      reviewEnabled: true
    })),
    ...patterns.map((item, index) => ({
      id: item.id || `demo_pattern_${index}`,
      type: 'pattern',
      en: item.pattern || item.en,
      cn: item.cn,
      note: 'Pattern for replacement practice.',
      sourceSentence: item.sourceSentence || '',
      examples: [],
      autoSentences: makeExamples(item.automationSentences || []),
      reviewEnabled: true
    })),
    ...usefulSentences.map((item, index) => ({
      id: item.id || `demo_useful_${index}`,
      type: 'usefulSentence',
      en: item.en,
      cn: item.cn,
      note: 'Useful sentence for review and output.',
      sourceSentence: item.en,
      examples: [],
      autoSentences: [],
      reviewEnabled: true
    }))
  ])
}

function makePracticeItems({ quickResponse = [], typing = [], replacement = [] }) {
  return [
    ...quickResponse.map((item, index) => ({ id: item.id || `demo_q_${index}`, type: 'quickResponse', promptCn: item.promptCn, hint: item.hint || 'Demo practice', answerEn: item.answerEn })),
    ...typing.map((item, index) => ({ id: item.id || `demo_type_${index}`, type: 'typing', mode: item.mode || 'completion', promptCn: item.prompt || item.promptCn, answerEn: item.answer || item.answerEn })),
    ...replacement.flatMap((item, index) => (item.options || []).map((option, optionIndex) => ({
      id: item.id || `demo_rep_${index}_${optionIndex}`,
      type: 'replacement',
      base: item.baseSentence,
      replacement: option,
      answerEn: item.baseSentence.replace(item.replace, option)
    })))
  ]
}

function roleLines(lines = []) {
  return lines.map(line => {
    if (typeof line !== 'string') return line
    const match = line.match(/^([^:：]+)\s*[:：]\s*(.+)$/)
    return match ? { speaker: match[1].trim(), en: match[2].trim(), cn: '' } : { speaker: '', en: line, cn: '' }
  })
}

function makeOutputTasks({ guidedSpeaking = [], rolePlay = [], retell = [] }) {
  return [
    ...guidedSpeaking.map((item, index) => ({
      id: item.id || `demo_guided_${index}`,
      type: 'guidedSpeaking',
      prompt: item.question,
      hints: item.supportChunks || [],
      sentenceStarter: item.sentenceStarter || '',
      sample: item.sampleAnswer || ''
    })),
    ...rolePlay.map((item, index) => ({
      id: item.id || `demo_role_${index}`,
      type: 'rolePlay',
      scenario: item.scenario,
      userRole: item.roleB || 'Kevin',
      aiRole: item.roleA || 'Partner',
      lines: roleLines(item.lines)
    })),
    ...retell.map((item, index) => ({
      id: item.id || `demo_retell_${index}`,
      type: 'retell',
      prompt: item.prompt,
      keywords: item.keywords || [],
      frame: item.simpleFrame || '',
      sample: item.sample || ''
    }))
  ]
}

function makeReviewItems(courseId, items = []) {
  return items.map((item, index) => ({
    id: item.id || `${courseId}_review_${index}`,
    courseId,
    type: item.type,
    promptCn: item.promptCn,
    answerEn: item.answerEn,
    source: item.source || '',
    nextReviewAt: Date.now(),
    level: 0,
    status: item.status || 'new'
  }))
}

function createDemoCourse(config) {
  const now = new Date().toISOString()
  const transcriptLines = (config.transcriptLines || []).map((line, index) => ({ ...line, order: index + 1, aligned: line.aligned ?? config.audioMode !== 'original' }))
  const languageItems = enrichLanguageItems(makeLanguageItems(config.languagePreview || {}), transcriptLines)
  const practiceItems = makePracticeItems(config.practiceItems || {})
  const outputTasks = makeOutputTasks(config.outputTasks || {})
  const reviewItems = makeReviewItems(config.id, config.reviewItems || [])
  return {
    id: config.id,
    packType: config.packType,
    title: config.title,
    sourceType: config.sourceType,
    audioMode: config.audioMode,
    importMethod: config.importMethod,
    provider: config.provider || '',
    unit: config.unit || '',
    track: config.track || '',
    category: config.category || SOURCE_TYPES[config.sourceType],
    level: config.level,
    linkedCourseId: config.parentCourseId || '',
    linkedCourseTitle: config.linkedCourseTitle || '',
    status: config.audioMode === 'original' ? 'Audio Required' : 'Ready',
    progress: 0,
    goal: config.goal,
    scenario: config.scenario || '',
    tags: config.tags || [],
    background: {
      ...config.background,
      en: config.background?.mainIdea || config.background?.scene || config.goal,
      cn: config.background?.simpleCnExplanation || ''
    },
    uploadedAudioUrl: '',
    generatedTtsAudioUrl: null,
    transcriptLines,
    languageItems,
    practiceItems,
    outputTasks,
    reviewItems,
    stage6Prompt: '',
    createdAt: now,
    updatedAt: now
  }
}

const builtInDemoCourses = [
  createDemoCourse({
    id: 'EF_3A_GREAT_BRITAIN',
    packType: 'TEXTBOOK_COURSE',
    title: 'English File 3A — Great Britain',
    level: 'A2',
    sourceType: 'textbookCourse',
    audioMode: 'original',
    importMethod: 'audioImport',
    provider: 'English File',
    unit: '3A',
    track: '3.4',
    category: 'Textbook Courses',
    goal: 'I can understand people talking about what they like about Britain.',
    transcriptLines: [
      { id: '3A_34_01', speaker: 'Person 1', en: 'I like the multiculturalism.', cn: '我喜欢多元文化。', startTime: 0, endTime: 3, aligned: true },
      { id: '3A_34_02', speaker: 'Person 1', en: 'People from all over the world live in the UK, and they live together happily, usually.', cn: '来自世界各地的人住在英国，而且通常他们相处得很融洽。', startTime: 3, endTime: 10, aligned: true },
      { id: '3A_34_03', speaker: 'Person 2', en: 'For me, it’s the language.', cn: '对我来说，是语言。', startTime: 10, endTime: 13, aligned: true },
      { id: '3A_34_04', speaker: 'Person 2', en: 'English is international.', cn: '英语是国际语言。', startTime: 13, endTime: 16, aligned: true },
      { id: '3A_34_05', speaker: 'Person 2', en: 'I speak English. You speak English. I’m lucky — I don’t have communication problems.', cn: '我说英语，你也说英语。我很幸运，我没有沟通问题。', startTime: 16, endTime: 24, aligned: true },
      { id: '3A_34_06', speaker: 'Person 3', en: 'I like the gardens.', cn: '我喜欢花园。', startTime: 24, endTime: 27, aligned: true },
      { id: '3A_34_07', speaker: 'Person 3', en: 'I have a small one, but I have flowers and vegetables in it.', cn: '我有一个小花园，但里面有花和蔬菜。', startTime: 27, endTime: 34, aligned: true },
      { id: '3A_34_08', speaker: 'Person 3', en: 'When the sun’s out, I sit there and I feel really happy.', cn: '太阳出来的时候，我坐在那里，感觉很开心。', startTime: 34, endTime: 41, aligned: true },
      { id: '3A_34_09', speaker: 'Person 4', en: 'I love the freedom.', cn: '我喜欢自由。', startTime: 41, endTime: 44, aligned: true },
      { id: '3A_34_10', speaker: 'Person 4', en: 'I wear what I want. I say what I want. I do what I want.', cn: '我想穿什么就穿什么，想说什么就说什么，想做什么就做什么。', startTime: 44, endTime: 52, aligned: true }
    ],
    background: {
      topic: 'What people like about Britain',
      scene: 'Different people talk about what they like about living in Britain.',
      mainIdea: 'People like different things about Britain, such as multiculturalism, language, gardens, freedom, the BBC, pubs, weather, and Indian food.',
      realLifeUse: 'This lesson helps the learner talk about what they like about a country, a city, or a place where they live.',
      learningGoal: 'The learner can use simple present sentences to talk about likes, places, people, food, weather, and daily life.',
      simpleCnExplanation: '这段听力主要练习如何表达“我喜欢某个地方的什么”。这些表达可以迁移到澳洲生活中，例如谈论墨尔本的多元文化、天气、食物、社区和生活方式。'
    },
    languagePreview: {
      keywords: [
        { en: 'multiculturalism', cn: '多元文化', sourceSentence: 'I like the multiculturalism.', examples: ['Melbourne has a lot of multiculturalism.', 'Multiculturalism is important in Australia.'] },
        { en: 'language', cn: '语言', sourceSentence: 'For me, it’s the language.', examples: ['English is an important language in Australia.', 'For me, the language is difficult but useful.'] },
        { en: 'freedom', cn: '自由', sourceSentence: 'I love the freedom.', examples: ['I like the freedom in Australia.', 'Freedom is important to me.'] }
      ],
      chunks: [
        { en: 'people from all over the world', cn: '来自世界各地的人', sourceSentence: 'People from all over the world live in the UK.', examples: ['People from all over the world live in Melbourne.', 'Students from all over the world study here.'] },
        { en: 'for me', cn: '对我来说', sourceSentence: 'For me, it’s the language.', examples: ['For me, English is important.', 'For me, Melbourne is a good place to live.'] },
        { en: 'one thing I really like', cn: '我真的很喜欢的一点', sourceSentence: 'One thing I really like is the BBC.', examples: ['One thing I really like is the public transport.', 'One thing I really like is the multicultural food.'] }
      ],
      patterns: [
        { pattern: 'I like ...', cn: '我喜欢……', sourceSentence: 'I like the multiculturalism.', automationSentences: ['I like the weather.', 'I like the food.', 'I like the people.', 'I like the lifestyle.'] },
        { pattern: 'For me, it’s ...', cn: '对我来说，是……', sourceSentence: 'For me, it’s the language.', automationSentences: ['For me, it’s the weather.', 'For me, it’s the transport.', 'For me, it’s the people.', 'For me, it’s the food.'] },
        { pattern: 'One thing I really like is ...', cn: '我真的很喜欢的一点是……', sourceSentence: 'One thing I really like is the BBC.', automationSentences: ['One thing I really like is the multiculturalism.', 'One thing I really like is the public transport.', 'One thing I really like is the local library.', 'One thing I really like is the food.'] }
      ],
      usefulSentences: [
        { en: 'I like the multiculturalism.', cn: '我喜欢多元文化。' },
        { en: 'People from all over the world live in the UK.', cn: '来自世界各地的人住在英国。' },
        { en: 'For me, it’s the language.', cn: '对我来说，是语言。' },
        { en: 'English is international.', cn: '英语是国际语言。' },
        { en: 'I love the freedom.', cn: '我喜欢自由。' }
      ]
    },
    practiceItems: {
      quickResponse: [
        { promptCn: '对我来说，是语言。', answerEn: 'For me, it’s the language.' },
        { promptCn: '来自世界各地的人。', answerEn: 'People from all over the world.' },
        { promptCn: '我喜欢多元文化。', answerEn: 'I like the multiculturalism.' }
      ],
      typing: [
        { mode: 'completion', prompt: 'People from ______ live in the UK.', answer: 'all over the world' },
        { mode: 'completion', prompt: 'For me, it’s ______.', answer: 'the language' }
      ],
      replacement: [
        { baseSentence: 'I like the multiculturalism.', replace: 'multiculturalism', options: ['weather', 'food', 'people', 'lifestyle'] },
        { baseSentence: 'For me, it’s the language.', replace: 'the language', options: ['the weather', 'the transport', 'the people', 'the food'] }
      ]
    },
    outputTasks: {
      guidedSpeaking: [{ question: 'What do you like about living in Melbourne?', supportChunks: ['multiculturalism', 'people from all over the world', 'for me'], sentenceStarter: 'I like ...', sampleAnswer: 'I like the multiculturalism in Melbourne. People from all over the world live here.' }],
      rolePlay: [{ scenario: 'Talking with a neighbour about living in Melbourne', roleA: 'Neighbour', roleB: 'Kevin', lines: ['A: What do you like about living in Melbourne?', 'B: I like the multiculturalism.', 'A: Why do you like it?', 'B: Because people from all over the world live here.', 'A: What is difficult for you?', 'B: For me, it’s the language.'] }],
      retell: [{ prompt: 'Retell what people like about Britain in simple English.', keywords: ['multiculturalism', 'language', 'freedom', 'weather', 'Indian food'], simpleFrame: 'Some people like ... Other people like ... For me, ...', sample: 'Some people like the multiculturalism in Britain. Some people like the language. Other people like the weather and the food.' }]
    },
    reviewItems: [
      { type: 'chunk', promptCn: '来自世界各地的人', answerEn: 'people from all over the world', source: 'Textbook Course 3A' },
      { type: 'pattern', promptCn: '对我来说，是……', answerEn: 'For me, it’s ...', source: 'Textbook Course 3A' },
      { type: 'useful_sentence', promptCn: '我喜欢多元文化。', answerEn: 'I like the multiculturalism.', source: 'Textbook Course 3A' },
      { type: 'weak_sentence', promptCn: '会下雨，但不是每天都下。', answerEn: 'It rains, but it doesn’t rain every day.', source: 'Textbook Course 3A', status: 'weak' }
    ]
  }),
  createDemoCourse({
    id: 'EXP_3A_MELBOURNE_LIFE',
    packType: 'EXPANSION_PACK',
    title: 'Melbourne Life Expansion — What Kevin Likes About Melbourne',
    level: 'A2',
    sourceType: 'realLifeExpansion',
    audioMode: 'generated',
    importMethod: 'textPackImport',
    parentCourseId: 'EF_3A_GREAT_BRITAIN',
    linkedCourseTitle: 'English File 3A — Great Britain',
    category: 'Expansion Packs',
    goal: 'I can talk about what I like about living in Melbourne.',
    scenario: 'Kevin talks with a neighbour about life in Melbourne.',
    tags: ['Melbourne', 'daily life', 'opinion', 'multiculturalism'],
    transcriptLines: [
      { id: 'EXP_3A_01', speaker: 'Neighbour', en: 'Hi Kevin. Do you like living in Melbourne?', cn: 'Kevin，你喜欢住在墨尔本吗？' },
      { id: 'EXP_3A_02', speaker: 'Kevin', en: 'Yes, I do. I like the multiculturalism.', cn: '是的，我喜欢。我喜欢这里的多元文化。' },
      { id: 'EXP_3A_03', speaker: 'Neighbour', en: 'Why do you like it?', cn: '你为什么喜欢它？' },
      { id: 'EXP_3A_04', speaker: 'Kevin', en: 'People from all over the world live here.', cn: '来自世界各地的人都住在这里。' },
      { id: 'EXP_3A_05', speaker: 'Neighbour', en: 'What else do you like?', cn: '你还喜欢什么？' },
      { id: 'EXP_3A_06', speaker: 'Kevin', en: 'One thing I really like is the food.', cn: '我真的很喜欢的一点是这里的食物。' },
      { id: 'EXP_3A_07', speaker: 'Neighbour', en: 'What is difficult for you?', cn: '对你来说什么比较困难？' },
      { id: 'EXP_3A_08', speaker: 'Kevin', en: 'For me, it’s the language. English is important, but sometimes it is difficult.', cn: '对我来说，是语言。英语很重要，但有时候也很难。' }
    ],
    background: {
      topic: 'What Kevin likes about living in Melbourne',
      scene: 'Kevin meets a neighbour and talks about life in Melbourne.',
      speakers: 'Kevin and his neighbour',
      purpose: 'Practise talking about what you like about a city or country.',
      realLifeUse: 'This can be used when talking with neighbours, classmates, parents at school, or local friends.',
      learningGoal: 'The learner can use I like..., For me..., and One thing I really like is... to give simple opinions.',
      simpleCnExplanation: '这个拓展包把 3A 课文中“英国人喜欢英国什么”的主题，改成 Kevin 在墨尔本生活中可以使用的表达。'
    },
    languagePreview: {
      chunks: [
        { en: 'living in Melbourne', cn: '住在墨尔本', examples: ['I like living in Melbourne.', 'Living in Melbourne is good for my family.'] },
        { en: 'people from all over the world', cn: '来自世界各地的人', examples: ['People from all over the world live here.', 'People from all over the world work in Melbourne.'] }
      ],
      patterns: [
        { pattern: 'Do you like living in ...?', cn: '你喜欢住在……吗？', automationSentences: ['Do you like living in Melbourne?', 'Do you like living in Australia?', 'Do you like living in this area?'] },
        { pattern: 'What else do you like?', cn: '你还喜欢什么？', automationSentences: ['What else do you like about Melbourne?', 'What else do you like about Australia?', 'What else do you like about this suburb?'] }
      ],
      usefulSentences: [
        { en: 'I like living in Melbourne.', cn: '我喜欢住在墨尔本。' },
        { en: 'People from all over the world live here.', cn: '来自世界各地的人都住在这里。' },
        { en: 'One thing I really like is the food.', cn: '我真的很喜欢的一点是这里的食物。' },
        { en: 'For me, it’s the language.', cn: '对我来说，是语言。' }
      ]
    },
    practiceItems: {
      quickResponse: [
        { promptCn: '你喜欢住在墨尔本吗？', answerEn: 'Do you like living in Melbourne?' },
        { promptCn: '我喜欢这里的多元文化。', answerEn: 'I like the multiculturalism here.' },
        { promptCn: '来自世界各地的人住在这里。', answerEn: 'People from all over the world live here.' }
      ],
      replacement: [
        { baseSentence: 'I like the multiculturalism.', replace: 'multiculturalism', options: ['food', 'people', 'weather', 'lifestyle'] },
        { baseSentence: 'One thing I really like is the food.', replace: 'food', options: ['public transport', 'library', 'parks', 'community'] }
      ]
    },
    outputTasks: {
      guidedSpeaking: [{ question: 'What do you like about living in Melbourne?', supportChunks: ['multiculturalism', 'people from all over the world', 'food', 'public transport'], sentenceStarter: 'I like ...', sampleAnswer: 'I like the multiculturalism. People from all over the world live here.' }],
      rolePlay: [{ scenario: 'Talking with a neighbour', roleA: 'Neighbour', roleB: 'Kevin', lines: ['A: Do you like living in Melbourne?', 'B: Yes, I do. I like the multiculturalism.', 'A: What else do you like?', 'B: One thing I really like is the food.', 'A: What is difficult for you?', 'B: For me, it’s the language.'] }],
      retell: [{ prompt: 'Retell what Kevin likes about Melbourne.', keywords: ['Melbourne', 'multiculturalism', 'food', 'language'], simpleFrame: 'Kevin likes ... He also likes ... For him, ... is difficult.', sample: 'Kevin likes living in Melbourne. He likes the multiculturalism and the food. People from all over the world live there. For him, the language is sometimes difficult.' }]
    },
    reviewItems: [
      { type: 'chunk', promptCn: '住在墨尔本', answerEn: 'living in Melbourne', source: 'Expansion Pack 3A' },
      { type: 'useful_sentence', promptCn: '我喜欢住在墨尔本。', answerEn: 'I like living in Melbourne.', source: 'Expansion Pack 3A' },
      { type: 'pattern', promptCn: '你喜欢住在……吗？', answerEn: 'Do you like living in ...?', source: 'Expansion Pack 3A' }
    ]
  }),
  createDemoCourse({
    id: 'GEN_DOCTOR_APPOINTMENT_A2',
    packType: 'GENERAL_TOPIC_PACK',
    title: 'Doctor Appointment — Talking About Symptoms',
    level: 'A2',
    sourceType: 'generalTopicPack',
    audioMode: 'generated',
    importMethod: 'textPackImport',
    category: 'General Topic Packs',
    goal: 'I can talk about simple symptoms and make a doctor appointment.',
    scenario: 'Kevin calls a medical clinic to book an appointment.',
    tags: ['doctor', 'health', 'appointment', 'phone call'],
    transcriptLines: [
      { id: 'GEN_DOC_01', speaker: 'Receptionist', en: 'Good morning. Green Street Medical Clinic. How can I help you?', cn: '早上好，这里是 Green Street 诊所。有什么可以帮您？' },
      { id: 'GEN_DOC_02', speaker: 'Kevin', en: 'Hi. I’d like to make an appointment, please.', cn: '你好。我想预约看医生。' },
      { id: 'GEN_DOC_03', speaker: 'Receptionist', en: 'What is the problem?', cn: '请问是什么问题？' },
      { id: 'GEN_DOC_04', speaker: 'Kevin', en: 'I have a sore throat and a headache.', cn: '我嗓子疼，还有头痛。' },
      { id: 'GEN_DOC_05', speaker: 'Receptionist', en: 'Do you have a fever?', cn: '你发烧吗？' },
      { id: 'GEN_DOC_06', speaker: 'Kevin', en: 'No, I don’t think so.', cn: '没有，我觉得没有。' }
    ],
    background: {
      topic: 'Making a doctor appointment',
      scene: 'Kevin calls a clinic and talks to the receptionist.',
      speakers: 'Kevin and receptionist',
      purpose: 'Practise booking a medical appointment and describing simple symptoms.',
      realLifeUse: 'This is useful when calling a GP clinic in Australia.',
      learningGoal: 'The learner can say simple symptoms and ask for an appointment.',
      simpleCnExplanation: '这个主题包帮助 Kevin 练习在澳洲打电话预约医生，并用简单英语说明身体不舒服的情况。'
    },
    languagePreview: {
      keywords: [
        { en: 'appointment', cn: '预约', examples: ['I’d like to make an appointment.', 'I have a doctor appointment today.'] },
        { en: 'sore throat', cn: '嗓子疼', examples: ['I have a sore throat.', 'My daughter has a sore throat.'] }
      ],
      chunks: [
        { en: 'make an appointment', cn: '预约', examples: ['I’d like to make an appointment.', 'Can I make an appointment for tomorrow?'] },
        { en: 'I have a ...', cn: '我有……', examples: ['I have a headache.', 'I have a sore throat.'] }
      ],
      patterns: [
        { pattern: 'I’d like to ...', cn: '我想……', automationSentences: ['I’d like to make an appointment.', 'I’d like to see a doctor.', 'I’d like to change my appointment.'] }
      ],
      usefulSentences: [
        { en: 'I’d like to make an appointment, please.', cn: '我想预约一下。' },
        { en: 'I have a sore throat and a headache.', cn: '我嗓子疼，还有头痛。' },
        { en: 'Do you have a fever?', cn: '你发烧吗？' }
      ]
    },
    practiceItems: {
      quickResponse: [
        { promptCn: '我想预约看医生。', answerEn: 'I’d like to make an appointment, please.' },
        { promptCn: '我嗓子疼。', answerEn: 'I have a sore throat.' },
        { promptCn: '我头痛。', answerEn: 'I have a headache.' }
      ],
      typing: [
        { mode: 'completion', prompt: 'I’d like to make an ______, please.', answer: 'appointment' },
        { mode: 'completion', prompt: 'I have a sore ______.', answer: 'throat' }
      ],
      replacement: [
        { baseSentence: 'I have a headache.', replace: 'headache', options: ['sore throat', 'cough', 'fever', 'stomach ache'] }
      ]
    },
    outputTasks: {
      guidedSpeaking: [{ question: 'Why do you want to see a doctor?', supportChunks: ['sore throat', 'headache', 'make an appointment'], sentenceStarter: 'I have ...', sampleAnswer: 'I have a sore throat and a headache. I’d like to see a doctor.' }],
      rolePlay: [{ scenario: 'Calling a medical clinic', roleA: 'Receptionist', roleB: 'Kevin', lines: ['A: Good morning. How can I help you?', 'B: I’d like to make an appointment, please.', 'A: What is the problem?', 'B: I have a sore throat and a headache.', 'A: Do you have a fever?', 'B: No, I don’t think so.'] }],
      retell: [{ prompt: 'Retell the phone call in simple English.', keywords: ['appointment', 'doctor', 'sore throat', 'headache'], simpleFrame: 'Kevin calls ... He wants ... He has ...', sample: 'Kevin calls the medical clinic. He wants to make an appointment. He has a sore throat and a headache.' }]
    },
    reviewItems: [
      { type: 'chunk', promptCn: '预约', answerEn: 'make an appointment', source: 'General Topic Pack Doctor Appointment' },
      { type: 'useful_sentence', promptCn: '我想预约一下。', answerEn: 'I’d like to make an appointment, please.', source: 'General Topic Pack Doctor Appointment' },
      { type: 'useful_sentence', promptCn: '我嗓子疼，还有头痛。', answerEn: 'I have a sore throat and a headache.', source: 'General Topic Pack Doctor Appointment' }
    ]
  })
]

const builtInDemoCourseIds = new Set(builtInDemoCourses.map(course => course.id))
const builtInDemoReviewQueue = builtInDemoCourses.flatMap(course => course.reviewItems || [])
const defaultActivity = {
  streakDays: 0,
  lastStudyDate: '',
  totals: { practice: 0, output: 0, review: 0, weak: 0 },
  days: {}
}

const defaultStore = {
  version: 5,
  activeCourseId: builtInDemoCourses[0].id,
  courses: builtInDemoCourses,
  reviewQueue: builtInDemoReviewQueue,
  activity: defaultActivity
}

const defaultSettings = {
  apiKey: '',
  voice: 'alloy',
  speakerVoices: {
    Kevin: 'alloy',
    Mandy: 'coral',
    Neighbour: 'echo',
    Receptionist: 'nova',
    'Person 1': 'alloy',
    'Person 2': 'echo',
    'Person 3': 'fable'
  },
  displayMode: 'both',
  pauseSeconds: 'auto',
  playbackSpeed: 1,
  fontScale: 'comfortable',
  uiLanguage: 'zh'
}

function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function userStoreKey(userId) {
  return `${STORE_KEY}_${userId || DEFAULT_USER_PROFILES[0].id}`
}

function formatUiText(template, values = {}) {
  return String(template || '').replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '')
}

function normalizeUserProfiles(rawProfiles) {
  const incoming = Array.isArray(rawProfiles) ? rawProfiles : []
  return DEFAULT_USER_PROFILES.map(defaultProfile => {
    const existing = incoming.find(profile => profile?.id === defaultProfile.id) || {}
    return {
      ...defaultProfile,
      name: String(existing.name || defaultProfile.name).trim() || defaultProfile.name,
      password: String(existing.password || '')
    }
  })
}

function normalizeSettings(rawSettings) {
  const saved = rawSettings && typeof rawSettings === 'object' ? rawSettings : {}
  const pauseSeconds = saved.pauseSeconds === 'auto'
    ? saved.pauseSeconds
    : ([1, 1.5, 2.5, 3, 4, 4.5, 6].includes(Number(saved.pauseSeconds)) ? Number(saved.pauseSeconds) : defaultSettings.pauseSeconds)
  const playbackSpeed = [0.75, 0.9, 1, 1.15, 1.25].includes(Number(saved.playbackSpeed)) ? Number(saved.playbackSpeed) : defaultSettings.playbackSpeed
  return {
    ...defaultSettings,
    ...saved,
    pauseSeconds,
    playbackSpeed,
    speakerVoices: {
      ...defaultSettings.speakerVoices,
      ...(saved.speakerVoices && typeof saved.speakerVoices === 'object' ? saved.speakerVoices : {})
    }
  }
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Local save failed. Large audio is stored outside localStorage.', error)
  }
}

function loadSettingsWithFallback() {
  const current = load(SETTINGS_KEY, null)
  const previousSettings = PREVIOUS_SETTINGS_KEYS
    .map(key => load(key, null))
    .filter(settings => settings && typeof settings === 'object')
  const previous = previousSettings.find(settings => settings.apiKey) ||
    previousSettings.find(settings => settings.voice || settings.speakerVoices)
  if (!current && previous) return previous
  if (!current) return {}
  if (current.apiKey || !previous?.apiKey) return current
  return {
    ...previous,
    ...current,
    apiKey: previous.apiKey,
    speakerVoices: {
      ...(previous.speakerVoices || {}),
      ...(current.speakerVoices || {})
    }
  }
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function slugifyHeading(text = '', fallback = 'section') {
  const slug = String(text || '')
    .toLowerCase()
    .replace(/[`*_#[\]()]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return slug || fallback
}

function stripMarkdownInline(text = '') {
  return String(text || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

function containsCjk(text = '') {
  return /[\u3400-\u9fff]/.test(String(text || ''))
}

function cleanPlayableEnglish(text = '') {
  let clean = stripMarkdownInline(text)
    .replace(/^[-*+]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .trim()
  const dialogueMatch = clean.match(/^([A-Z][A-Za-z .'-]{0,32}):\s*(.+)$/)
  if (dialogueMatch) clean = dialogueMatch[2].trim()
  return clean
}

function isPurePlayableEnglish(text = '') {
  const clean = cleanPlayableEnglish(text)
  if (!clean || containsCjk(clean)) return false
  if (!/[A-Za-z]/.test(clean)) return false
  if (/^\|?[-:\s|]+\|?$/.test(clean)) return false
  if (/[{}<>]/.test(clean)) return false
  const allowed = /^[A-Za-z0-9\s.,!?'"’‘“”():;\-–—/&]+$/.test(clean)
  return allowed && clean.split(/\s+/).filter(Boolean).length <= 40
}

function playableEnglishFromText(text = '') {
  const clean = cleanPlayableEnglish(text)
  return isPurePlayableEnglish(clean) ? clean : ''
}

function playableWordCount(text = '') {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length
}

function shouldShowContinuousPlay(lines = []) {
  const playable = lines.map(playableEnglishFromText).filter(Boolean)
  return playable.length > 1 || playable.some(line => playableWordCount(line) >= 4)
}

function parseDialogueLines(text = '') {
  return String(text || '').split('\n')
    .map(line => {
      const match = line.trim().match(/^([A-Z][A-Za-z .'-]{0,32}):\s*(.+)$/)
      if (!match) return null
      const speech = playableEnglishFromText(match[2])
      if (!speech) return null
      return { speaker: match[1].trim(), text: speech }
    })
    .filter(Boolean)
}

function isDialogueBlock(block) {
  return block?.type === 'code' && parseDialogueLines(block.text).length >= 2
}

function splitMarkdownTableRow(line = '') {
  return String(line || '')
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim())
}

function normalizeReaderLessons(rawLessons) {
  const lessons = Array.isArray(rawLessons) ? rawLessons : []
  return lessons
    .filter(lesson => lesson && typeof lesson.raw === 'string')
    .map(lesson => ({
      id: lesson.id || uid('reader'),
      title: lesson.title || deriveReaderTitle(lesson.raw),
      raw: lesson.raw,
      createdAt: lesson.createdAt || new Date().toISOString(),
      updatedAt: lesson.updatedAt || lesson.createdAt || new Date().toISOString()
    }))
}

function deriveReaderTitle(raw = '') {
  const lines = String(raw || '').split(/\r?\n/)
  const episode = lines.find(line => /^##\s+/.test(line))
  const title = lines.find(line => /^#\s+/.test(line))
  return stripMarkdownInline((episode || title || '').replace(/^#+\s*/, '')) || 'Kevin in Australia Lesson'
}

function parseReaderMarkdown(raw = '') {
  const lines = String(raw || '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  const contents = []
  const headingCounts = new Map()
  let paragraph = []
  let listItems = []
  let tableLines = []
  let inCode = false
  let codeLines = []

  const uniqueHeadingId = text => {
    const base = slugifyHeading(text)
    const count = (headingCounts.get(base) || 0) + 1
    headingCounts.set(base, count)
    return count === 1 ? base : `${base}-${count}`
  }
  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push({ type: 'paragraph', text: paragraph.join('\n') })
    paragraph = []
  }
  const flushList = () => {
    if (!listItems.length) return
    blocks.push({ type: 'list', items: listItems })
    listItems = []
  }
  const flushTable = () => {
    if (!tableLines.length) return
    const rows = tableLines
      .filter(line => !/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line))
      .map(splitMarkdownTableRow)
      .filter(row => row.some(Boolean))
    if (rows.length) blocks.push({ type: 'table', rows })
    tableLines = []
  }
  const flushLoose = () => {
    flushParagraph()
    flushList()
    flushTable()
  }

  lines.forEach((line, index) => {
    if (/^```/.test(line.trim())) {
      if (inCode) {
        blocks.push({ type: 'code', text: codeLines.join('\n') })
        codeLines = []
        inCode = false
      } else {
        flushLoose()
        inCode = true
      }
      return
    }
    if (inCode) {
      codeLines.push(line)
      return
    }
    if (/^\s*$/.test(line)) {
      flushLoose()
      return
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      flushLoose()
      const level = heading[1].length
      const text = stripMarkdownInline(heading[2])
      const id = uniqueHeadingId(text || `section-${index}`)
      blocks.push({ type: 'heading', level, text, id })
      if (level >= 2) contents.push({ id, level, text })
      return
    }
    if (/^\s*---+\s*$/.test(line)) {
      flushLoose()
      blocks.push({ type: 'hr' })
      return
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushParagraph()
      flushList()
      tableLines.push(line)
      return
    }
    const list = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(.+)$/)
    if (list) {
      flushParagraph()
      flushTable()
      listItems.push(list[1])
      return
    }
    flushTable()
    flushList()
    paragraph.push(line)
  })
  if (inCode) blocks.push({ type: 'code', text: codeLines.join('\n') })
  flushLoose()
  return { blocks, contents }
}

function readerBlockPlayableLines(block) {
  if (!block) return []
  if (block.type === 'code') {
    return String(block.text || '').split('\n').map(playableEnglishFromText).filter(Boolean)
  }
  if (block.type === 'paragraph') {
    return String(block.text || '').split('\n').map(playableEnglishFromText).filter(Boolean)
  }
  if (block.type === 'list') {
    return (block.items || []).map(playableEnglishFromText).filter(Boolean)
  }
  if (block.type === 'table') {
    return (block.rows || []).flatMap(row => row.map(playableEnglishFromText)).filter(Boolean)
  }
  return []
}

function readerEnglishSentences(blocks = []) {
  return [...new Set(blocks.flatMap(readerBlockPlayableLines))]
}

function loadUserStore(userId) {
  const scoped = load(userStoreKey(userId), null)
  if (scoped) return scoped
  if (userId === DEFAULT_USER_PROFILES[0].id) return load(STORE_KEY, defaultStore)
  return defaultStore
}

function normalizeStore(store) {
  const incoming = store && typeof store === 'object' ? store : defaultStore
  const rawCourses = Array.isArray(incoming.courses) ? incoming.courses : []
  const sanitizedCourses = rawCourses.map(course => {
    const withLanguageExamples = {
      ...course,
      languageItems: enrichLanguageItems(course.languageItems || [], course.transcriptLines || [])
    }
    if (typeof course.uploadedAudioUrl === 'string' && course.uploadedAudioUrl.startsWith('data:audio')) {
      return { ...withLanguageExamples, uploadedAudioUrl: '', status: 'Audio needs re-upload' }
    }
    return withLanguageExamples
  })
  const incomingById = new Map(sanitizedCourses.map(course => [course.id, course]))
  const demoCourses = builtInDemoCourses.map(demo => {
    const existing = incomingById.get(demo.id)
    if (!existing) return demo
    const demoReviewIds = new Set((demo.reviewItems || []).map(item => item.id))
    const reviewItems = [
      ...(demo.reviewItems || []),
      ...(existing.reviewItems || []).filter(item => !demoReviewIds.has(item.id))
    ]
    return {
      ...demo,
      ...existing,
      progress: existing.progress ?? demo.progress,
      uploadedAudioUrl: existing.uploadedAudioUrl || demo.uploadedAudioUrl,
      status: existing.uploadedAudioUrl ? (existing.status === 'Audio Required' ? 'Ready' : existing.status) : demo.status,
      updatedAt: existing.updatedAt || demo.updatedAt,
      reviewItems
    }
  })
  const userCourses = sanitizedCourses.filter(course => !builtInDemoCourseIds.has(course.id))
  const courses = [...demoCourses, ...userCourses]
  const incomingQueue = Array.isArray(incoming.reviewQueue) ? incoming.reviewQueue : []
  const courseIds = new Set(courses.map(course => course.id))
  const reviewQueueById = new Map()
  courses.flatMap(course => course.reviewItems || []).forEach(item => reviewQueueById.set(item.id, item))
  incomingQueue.filter(item => !courseIds.has(item.courseId)).forEach(item => reviewQueueById.set(item.id, item))
  const reviewQueue = Array.from(reviewQueueById.values())
  const activeCourseId = courses.some(course => course.id === incoming.activeCourseId)
    ? incoming.activeCourseId
    : builtInDemoCourses[0].id
  return {
    ...defaultStore,
    ...incoming,
    activeCourseId,
    courses,
    reviewQueue,
    activity: normalizeActivity(incoming.activity)
  }
}

function openLocalAudioDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'))
      return
    }
    const request = indexedDB.open(LOCAL_AUDIO_DB, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(LOCAL_AUDIO_STORE)) db.createObjectStore(LOCAL_AUDIO_STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Audio storage failed.'))
  })
}

async function putOriginalAudioBlob(key, blob) {
  const db = await openLocalAudioDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOCAL_AUDIO_STORE, 'readwrite')
    tx.objectStore(LOCAL_AUDIO_STORE).put(blob, key)
    tx.oncomplete = () => resolve(`idb-audio:${key}`)
    tx.onerror = () => reject(tx.error || new Error('Audio save failed.'))
  })
}

async function getOriginalAudioBlob(ref) {
  const key = String(ref || '').replace(/^idb-audio:/, '')
  const db = await openLocalAudioDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOCAL_AUDIO_STORE, 'readonly')
    const request = tx.objectStore(LOCAL_AUDIO_STORE).get(key)
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error || new Error('Audio load failed.'))
  })
}

function cleanLine(line) {
  return String(line || '').replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim()
}

function splitBilingual(text) {
  const clean = cleanLine(text)
  const parts = clean.split(/\s+=\s+|\s+＝\s+|\s+--\s+/)
  return { en: (parts[0] || '').trim(), cn: (parts[1] || '').trim() }
}

function splitSpeakerLine(line) {
  let clean = cleanLine(line)
  let startTime = null
  let endTime = null
  const timeMatch = clean.match(/^\[?\s*([0-9:.]+)\s*(?:-|-->|to)\s*([0-9:.]+)\s*\]?\s*(.+)$/i)
  if (timeMatch) {
    startTime = parseTimecode(timeMatch[1])
    endTime = parseTimecode(timeMatch[2])
    clean = timeMatch[3].trim()
  }
  const match = clean.match(/^([^:：]{1,36})\s*[:：]\s*(.+)$/)
  if (!match) {
    const pair = splitBilingual(clean)
    return { speaker: '', en: pair.en, cn: pair.cn, startTime, endTime }
  }
  const pair = splitBilingual(match[2])
  return { speaker: match[1].trim(), en: pair.en, cn: pair.cn, startTime, endTime }
}

function parseTimecode(value) {
  const parts = String(value || '').trim().split(':').map(Number)
  if (parts.some(Number.isNaN)) return null
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] * 3600 + parts[1] * 60 + parts[2]
}

function sectionMap(text) {
  const map = {}
  let current = 'ROOT'
  String(text || '').replace(/\r\n/g, '\n').split('\n').forEach(raw => {
    const marker = raw.match(/^\s*@@([A-Z0-9_ ]+)@@\s*$/)
    if (marker) {
      current = marker[1].trim().replace(/\s+/g, '_')
      map[current] = map[current] || []
    } else {
      map[current] = map[current] || []
      map[current].push(raw)
    }
  })
  return map
}

function keyValues(lines = []) {
  const out = {}
  let activeKey = ''
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const m = line.match(/^([A-Za-z0-9_ ]{2,40})\s*[:：]\s*(.*)$/)
    if (m && !/^(A|B|Kevin|Mandy|Staff|Teacher|Student|Doctor|Receptionist)$/i.test(m[1].trim())) {
      activeKey = m[1].trim().replace(/\s+/g, '_').toUpperCase()
      out[activeKey] = m[2].trim()
    } else if (activeKey) {
      out[activeKey] = `${out[activeKey] ? `${out[activeKey]}\n` : ''}${line}`
    }
  }
  return out
}

function getMetaValue(text, names, fallback = '') {
  for (const name of names) {
    const re = new RegExp(`^\\\\s*${name}\\\\s*[:：]\\\\s*(.+)$`, 'im')
    const m = String(text || '').match(re)
    if (m) return m[1].trim()
  }
  return fallback
}

function parseExpressionLines(lines, type, marker) {
  const items = []
  let current = null
  let mode = ''
  const commit = () => {
    if (current && current.en) items.push({ ...current, id: current.id || uid('lang') })
  }
  for (const raw of lines || []) {
    const line = raw.trim()
    if (!line) continue
    const head = line.match(new RegExp(`^(${marker}|WORD|CHUNK|PATTERN|SENTENCE)\\s*[:：]\\s*(.+)$`, 'i'))
    if (head) {
      commit()
      current = { type, en: head[2].trim(), cn: '', note: '', sourceSentence: '', examples: [], autoSentences: [], reviewEnabled: true }
      mode = ''
      continue
    }
    if (!current && line) {
      const pair = splitBilingual(line)
      current = { type, en: pair.en, cn: pair.cn, note: '', sourceSentence: '', examples: [], autoSentences: [], reviewEnabled: true }
      continue
    }
    if (!current) continue
    const field = line.match(/^([A-Z_ ]{2,32})\s*[:：]\s*(.*)$/)
    if (field) {
      const key = field[1].trim().replace(/\s+/g, '_').toUpperCase()
      const value = field[2].trim()
      if (['MEANING', 'CN', 'CHINESE'].includes(key)) current.cn = value
      else if (['NOTE', 'EXPLANATION'].includes(key)) current.note = value
      else if (['SOURCE_SENTENCE', 'SOURCE'].includes(key)) current.sourceSentence = value
      else if (['EXAMPLES', 'EXAMPLE'].includes(key)) mode = 'examples'
      else if (['AUTO_SENTENCES', 'REPLACEMENT', 'REPLACEMENTS'].includes(key)) mode = 'autoSentences'
      continue
    }
    const pair = splitBilingual(line)
    if (mode === 'autoSentences') current.autoSentences.push(pair)
    else current.examples.push(pair)
  }
  commit()
  return items
}

function parseTextPack(rawText) {
  const raw = String(rawText || '').trim()
  if (!raw) return null
  const sections = sectionMap(raw)
  const meta = keyValues(sections.COURSE_START || sections.ROOT || [])
  const id = uid('course')
  const sourceTypeRaw = meta.SOURCE_TYPE || meta.CONTENT_TYPE || getMetaValue(raw, ['SOURCE_TYPE', 'CONTENT_TYPE'], 'General Topic Pack')
  const sourceType = /textbook/i.test(sourceTypeRaw)
    ? 'textbookCourse'
    : /expansion|real/i.test(sourceTypeRaw)
      ? 'realLifeExpansion'
      : 'generalTopicPack'
  const title = meta.TITLE || meta.TOPIC_NAME || meta.LESSON || getMetaValue(raw, ['TITLE', 'TOPIC', 'COURSE_TITLE'], 'Imported Topic Pack')
  const level = meta.LEVEL || getMetaValue(raw, ['LEVEL'], 'A2')
  const category = meta.CATEGORY || getMetaValue(raw, ['CATEGORY'], sourceType === 'realLifeExpansion' ? 'Expansion Pack' : 'General')
  const goal = meta.GOAL || getMetaValue(raw, ['GOAL'], '')
  const backgroundKv = keyValues(sections.BACKGROUND || [])
  const background = {
    en: backgroundKv.EN || backgroundKv.BACKGROUND_EN || backgroundKv.SCENARIO_EN || '',
    cn: backgroundKv.CN || backgroundKv.BACKGROUND_CN || backgroundKv.SCENARIO_CN || ''
  }
  const dialogueLines = (sections.DIALOGUE || sections.STAGE_1_DIALOGUE || [])
    .map(splitSpeakerLine)
    .filter(line => line.en)
    .map((line, index) => ({ id: uid('line'), ...line, startTime: null, endTime: null, aligned: sourceType !== 'textbookCourse', order: index + 1 }))
  const words = parseExpressionLines(sections.VOCAB || sections.WORDS || sections.STAGE_2_VOCAB_CHUNKS || [], 'keyword', 'WORD')
  const chunks = parseExpressionLines(sections.CHUNKS || [], 'chunk', 'CHUNK')
  const patterns = parseExpressionLines(sections.PATTERNS || sections.STAGE_3_PATTERNS || [], 'pattern', 'PATTERN')
  const useful = parseExpressionLines(sections.USEFUL_SENTENCES || sections.STAGE_4_USEFUL_SENTENCES || [], 'usefulSentence', 'SENTENCE')
  const quick = []
  let currentQuick = null
  for (const rawLine of sections.QUICK_REACTION || sections.QUICK_RESPONSE || []) {
    const line = rawLine.trim()
    const field = line.match(/^([A-Z_]+)\s*[:：]\s*(.+)$/)
    if (!field) continue
    const key = field[1].toUpperCase()
    const value = field[2].trim()
    if (key === 'PROMPT') {
      if (currentQuick) quick.push(currentQuick)
      currentQuick = { id: uid('q'), type: 'quickResponse', promptCn: value, hint: '', answerEn: '' }
    } else if (currentQuick && key === 'HINT') currentQuick.hint = value
    else if (currentQuick && key === 'ANSWER') currentQuick.answerEn = value
  }
  if (currentQuick) quick.push(currentQuick)
  const outputKv = keyValues(sections.SEMI_CONTROLLED_TALK || sections.OUTPUT || sections.STAGE_5_GUIDED_CONVERSATION || [])
  const outputTasks = []
  if (outputKv.SCENARIO_CN || outputKv.PROMPT || outputKv.SAMPLE) {
    outputTasks.push({
      id: uid('out'),
      type: 'guidedSpeaking',
      prompt: outputKv.SCENARIO_CN || outputKv.PROMPT || 'Use this lesson to answer in English.',
      hints: String(outputKv.HELPFUL_EXPRESSIONS || outputKv.HINTS || '').split('\n').map(cleanLine).filter(Boolean),
      sample: outputKv.SAMPLE || outputKv.SAMPLE_ANSWER || ''
    })
  }
  if (dialogueLines.length) {
    outputTasks.push({
      id: uid('role'),
      type: 'rolePlay',
      scenario: title,
      userRole: /mandy/i.test(raw) ? 'Mandy' : 'Kevin',
      aiRole: dialogueLines.find(line => !/kevin|mandy/i.test(line.speaker))?.speaker || 'Partner',
      lines: dialogueLines.map(({ speaker, en, cn }) => ({ speaker, en, cn }))
    })
  }
  const languageItems = enrichLanguageItems([...words, ...chunks, ...patterns, ...useful], dialogueLines)
  const enrichedPatterns = languageItems.filter(item => item.type === 'pattern')
  const practiceItems = [
    ...quick,
    ...languageItems.filter(item => item.cn && item.en).slice(0, 12).map(item => ({ id: uid('type'), type: 'typing', promptCn: item.cn, answerEn: item.en })),
    ...enrichedPatterns.flatMap(item => (item.autoSentences || []).slice(0, 4).map(sentence => ({ id: uid('rep'), type: 'replacement', base: item.en, replacement: sentence.cn || sentence.en, answerEn: sentence.en })))
  ]
  const reviewItems = languageItems
    .filter(item => item.reviewEnabled && ['chunk', 'usefulSentence'].includes(item.type))
    .slice(0, 20)
    .map(item => ({ id: uid('review'), courseId: id, type: item.type, promptCn: item.cn, answerEn: item.en, nextReviewAt: Date.now() + 24 * 60 * 60 * 1000, level: 0, status: 'new' }))
  return {
    id,
    title,
    sourceType,
    audioMode: sourceType === 'textbookCourse' ? 'original' : 'generated',
    importMethod: sourceType === 'textbookCourse' ? 'audioImport' : 'textPackImport',
    category,
    level,
    linkedCourseId: meta.LINKED_COURSE_ID || '',
    status: sourceType === 'textbookCourse' ? 'Audio Required' : 'Ready',
    progress: 0,
    goal,
    background,
    uploadedAudioUrl: '',
    generatedTtsAudioUrl: null,
    transcriptLines: dialogueLines,
    languageItems,
    practiceItems,
    outputTasks,
    reviewItems,
    stage6Prompt: (sections.STAGE_6_PROMPT || sections.STAGE_6_CHATGPT_VOICE_PROMPT || []).join('\n').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

function codeBlockAfter(text, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = String(text || '').match(new RegExp(`${escaped}[\\s\\S]*?\`\`\`(?:text)?\\n([\\s\\S]*?)\\n\`\`\``, 'i'))
  return match ? match[1].trim() : ''
}

function parseSimpleKvBlock(block) {
  const out = {}
  String(block || '').split('\n').forEach(raw => {
    const match = raw.match(/^\s*([A-Z0-9_ ]{2,40})\s*[:：]\s*(.+?)\s*$/)
    if (match) out[match[1].trim().replace(/\s+/g, '_').toUpperCase()] = match[2].trim()
  })
  return out
}

function parseRecordBlock(block, startKeys = []) {
  const records = []
  let current = null
  let listKey = ''
  const commit = () => {
    if (current && Object.keys(current).length) records.push(current)
  }
  String(block || '').split('\n').forEach(raw => {
    const line = raw.trim()
    if (!line) {
      commit()
      current = null
      listKey = ''
      return
    }
    const numbered = line.match(/^\d+[.)]\s*(.+)$/)
    if (numbered && current && listKey) {
      current[listKey] = [...(current[listKey] || []), numbered[1].trim()]
      return
    }
    const field = line.match(/^([A-Z0-9_ ]{2,40})\s*[:：]\s*(.*)$/)
    if (!field && current && listKey) {
      current[listKey] = [...(current[listKey] || []), line]
      return
    }
    if (!field) return
    const key = field[1].trim().replace(/\s+/g, '_').toUpperCase()
    const value = field[2].trim()
    if (startKeys.includes(key)) {
      commit()
      current = { [key]: value }
      listKey = ''
      return
    }
    if (!current) current = {}
    if (['EXAMPLES', 'AUTOMATION_SENTENCES', 'OPTIONS', 'LINES', 'KEYWORDS', 'SUPPORT_CHUNKS'].includes(key)) {
      listKey = key
      current[key] = value ? value.split(',').map(item => item.trim()).filter(Boolean) : []
    } else {
      current[key] = value
      listKey = ''
    }
  })
  commit()
  return records
}

function splitDemoSections(raw) {
  const matches = [...String(raw || '').matchAll(/^#\s+\d+\.\s+(Textbook Course|Expansion Pack|General Topic Pack) Demo\s*$/gim)]
  return matches.map((match, index) => {
    const start = match.index
    const end = matches[index + 1]?.index ?? raw.length
    return { type: match[1], text: raw.slice(start, end) }
  })
}

function normalizeSourceType(value = '') {
  if (/textbook/i.test(value)) return 'textbookCourse'
  if (/expansion|real/i.test(value)) return 'realLifeExpansion'
  return 'generalTopicPack'
}

function normalizeAudioMode(value = '', sourceType = '') {
  if (/original/i.test(value) || sourceType === 'textbookCourse') return 'original'
  return 'generated'
}

function secondsFromDemoTime(value) {
  return parseTimecode(String(value || '').replace(/^00:/, '0:'))
}

function parseDemoLines(block, sourceType) {
  return parseRecordBlock(block, ['LINE_ID']).map((record, index) => ({
    id: record.LINE_ID || uid('line'),
    speaker: record.SPEAKER || '',
    en: record.EN || '',
    cn: record.CN || '',
    startTime: record.START_TIME ? secondsFromDemoTime(record.START_TIME) : null,
    endTime: record.END_TIME ? secondsFromDemoTime(record.END_TIME) : null,
    aligned: String(record.ALIGNED || '').toLowerCase() === 'true' || sourceType !== 'textbookCourse',
    order: index + 1
  })).filter(line => line.en)
}

function parseUsefulSentences(block) {
  const lines = String(block || '').split('\n')
  const items = []
  let current = null
  lines.forEach(raw => {
    const line = raw.trim()
    const sentence = line.match(/^\d+[.)]\s*(.+)$/)
    if (sentence) {
      if (current?.en) items.push(current)
      current = { id: uid('lang'), type: 'usefulSentence', en: sentence[1].trim(), cn: '', note: 'Useful sentence from imported pack.', sourceSentence: sentence[1].trim(), examples: [], autoSentences: [], reviewEnabled: true }
      return
    }
    const cn = line.match(/^CN\s*[:：]\s*(.+)$/)
    if (cn && current) current.cn = cn[1].trim()
  })
  if (current?.en) items.push(current)
  return items
}

function parseDemoLanguage(sectionText) {
  const keywords = parseRecordBlock(codeBlockAfter(sectionText, '### KEYWORDS'), ['KEYWORD']).map(record => ({
    id: uid('lang'),
    type: 'keyword',
    en: record.KEYWORD,
    cn: record.CN || '',
    note: 'Keyword from imported pack.',
    sourceSentence: record.SOURCE_SENTENCE || '',
    examples: (record.EXAMPLES || []).map(en => ({ en, cn: '' })),
    autoSentences: [],
    reviewEnabled: false
  })).filter(item => item.en)
  const chunks = parseRecordBlock(codeBlockAfter(sectionText, '### CHUNKS'), ['CHUNK']).map(record => ({
    id: uid('lang'),
    type: 'chunk',
    en: record.CHUNK,
    cn: record.CN || '',
    note: 'Chunk from imported pack.',
    sourceSentence: record.SOURCE_SENTENCE || '',
    examples: (record.EXAMPLES || []).map(en => ({ en, cn: '' })),
    autoSentences: [],
    reviewEnabled: true
  })).filter(item => item.en)
  const patterns = parseRecordBlock(codeBlockAfter(sectionText, '### PATTERNS'), ['PATTERN']).map(record => ({
    id: uid('lang'),
    type: 'pattern',
    en: record.PATTERN,
    cn: record.CN || '',
    note: 'Pattern from imported pack.',
    sourceSentence: record.SOURCE_SENTENCE || '',
    examples: [],
    autoSentences: (record.AUTOMATION_SENTENCES || []).map(en => ({ en, cn: '' })),
    reviewEnabled: true
  })).filter(item => item.en)
  return [...keywords, ...chunks, ...patterns, ...parseUsefulSentences(codeBlockAfter(sectionText, '### USEFUL_SENTENCES'))]
}

function parseDemoPractice(sectionText) {
  const quick = parseRecordBlock(codeBlockAfter(sectionText, '### QUICK_RESPONSE'), ['PROMPT_CN']).map(record => ({
    id: uid('quick'),
    type: 'quickResponse',
    promptCn: record.PROMPT_CN || '',
    hint: 'Imported practice',
    answerEn: record.ANSWER_EN || ''
  })).filter(item => item.promptCn && item.answerEn)
  const typing = parseRecordBlock(codeBlockAfter(sectionText, '### TYPING'), ['MODE']).map(record => ({
    id: uid('type'),
    type: 'typing',
    mode: record.MODE || 'typing',
    promptCn: record.PROMPT || 'Listen and type.',
    answerEn: record.ANSWER || ''
  })).filter(item => item.answerEn)
  const replacement = parseRecordBlock(codeBlockAfter(sectionText, '### REPLACEMENT'), ['BASE_SENTENCE']).flatMap(record => {
    const options = record.OPTIONS || []
    return options.map(option => ({
      id: uid('rep'),
      type: 'replacement',
      base: record.BASE_SENTENCE || '',
      replacement: option,
      answerEn: String(record.BASE_SENTENCE || '').replace(record.REPLACE || option, option)
    }))
  }).filter(item => item.base && item.answerEn)
  return [...quick, ...typing, ...replacement]
}

function parseDemoRoleLines(lines = []) {
  return lines.map(raw => {
    const match = String(raw).match(/^([^:：]+)\s*[:：]\s*(.+)$/)
    return match ? { speaker: match[1].trim(), en: match[2].trim(), cn: '' } : null
  }).filter(Boolean)
}

function parseDemoOutput(sectionText) {
  const guided = parseSimpleKvBlock(codeBlockAfter(sectionText, '### GUIDED_SPEAKING'))
  const role = parseSimpleKvBlock(codeBlockAfter(sectionText, '### ROLE_PLAY'))
  const retell = parseSimpleKvBlock(codeBlockAfter(sectionText, '### RETELL'))
  const tasks = []
  if (guided.QUESTION || guided.SAMPLE_ANSWER) {
    tasks.push({
      id: uid('out'),
      type: 'guidedSpeaking',
      prompt: guided.QUESTION || 'Use this lesson to answer in English.',
      hints: String(guided.SUPPORT_CHUNKS || '').split(',').map(item => item.trim()).filter(Boolean),
      sample: guided.SAMPLE_ANSWER || ''
    })
  }
  const roleLines = parseRecordBlock(codeBlockAfter(sectionText, '### ROLE_PLAY'), ['SCENARIO'])[0]?.LINES || []
  const parsedRoleLines = parseDemoRoleLines(roleLines)
  if (parsedRoleLines.length) {
    tasks.push({
      id: uid('role'),
      type: 'rolePlay',
      scenario: role.SCENARIO || 'Role-play',
      userRole: role.ROLE_B || 'Kevin',
      aiRole: role.ROLE_A || 'Partner',
      lines: parsedRoleLines
    })
  }
  if (retell.PROMPT || retell.SAMPLE) {
    tasks.push({
      id: uid('retell'),
      type: 'retell',
      prompt: retell.PROMPT || 'Retell this lesson in simple English.',
      keywords: String(retell.KEYWORDS || '').split(',').map(item => item.trim()).filter(Boolean),
      frame: retell.SIMPLE_FRAME || '',
      sample: retell.SAMPLE || ''
    })
  }
  return tasks
}

function parseDemoReview(sectionText, courseId) {
  return parseRecordBlock(codeBlockAfter(sectionText, '## REVIEW_ITEMS'), ['TYPE']).map(record => ({
    id: uid('review'),
    courseId,
    type: record.TYPE || 'useful_sentence',
    promptCn: record.PROMPT_CN || '',
    answerEn: record.ANSWER_EN || '',
    source: record.SOURCE || '',
    nextReviewAt: Date.now() + 24 * 60 * 60 * 1000,
    level: 0,
    status: 'new'
  })).filter(item => item.promptCn && item.answerEn)
}

function buildImportReport(course, missingFields = [], warnings = []) {
  return {
    packType: course.packType || '',
    title: course.title,
    sourceType: SOURCE_TYPES[course.sourceType] || course.sourceType,
    audioMode: AUDIO_MODES[course.audioMode] || course.audioMode,
    importMethod: course.importMethod === 'audioImport' ? 'Audio Import' : 'Text Pack Import',
    linkedCourseTitle: course.linkedCourseTitle || '',
    learnItems: (course.transcriptLines?.length || 0) + (course.languageItems?.length || 0) + (course.background?.en || course.background?.cn ? 1 : 0),
    practiceItems: course.practiceItems?.length || 0,
    outputItems: course.outputTasks?.length || 0,
    reviewItems: course.reviewItems?.length || 0,
    missingFields,
    warnings
  }
}

function parseDemoCourse(section) {
  const meta = parseSimpleKvBlock(codeBlockAfter(section.text, '## 基本信息'))
  if (!meta.TITLE) return null
  const sourceType = normalizeSourceType(meta.SOURCE_TYPE || section.type)
  const audioMode = normalizeAudioMode(meta.AUDIO_MODE, sourceType)
  const id = sourceType === 'textbookCourse' ? (meta.PARENT_COURSE_ID || 'EF_3A_GREAT_BRITAIN') : uid('course')
  const lineBlock = sourceType === 'textbookCourse' ? codeBlockAfter(section.text, '## TRANSCRIPT_LINES') : codeBlockAfter(section.text, '## DIALOGUE')
  const transcriptLines = parseDemoLines(lineBlock, sourceType)
  const backgroundKv = parseSimpleKvBlock(codeBlockAfter(section.text, '## BACKGROUND'))
  const languageItems = enrichLanguageItems(parseDemoLanguage(section.text), transcriptLines)
  const practiceItems = parseDemoPractice(section.text)
  const outputTasks = parseDemoOutput(section.text)
  const reviewItems = parseDemoReview(section.text, id)
  const missingFields = []
  if (!transcriptLines.length) missingFields.push(sourceType === 'textbookCourse' ? 'TRANSCRIPT_LINES' : 'DIALOGUE')
  if (!languageItems.length) missingFields.push('LANGUAGE_PREVIEW')
  if (!practiceItems.length) missingFields.push('PRACTICE_ITEMS')
  if (!outputTasks.length) missingFields.push('OUTPUT_TASKS')
  const warnings = []
  if (sourceType === 'textbookCourse') warnings.push('Textbook Course keeps Original Audio Mode. Upload original audio later for playback; no TTS replacement will be used.')
  const course = {
    id,
    title: meta.TITLE,
    packType: meta.PACK_TYPE || section.type,
    sourceType,
    audioMode,
    importMethod: sourceType === 'textbookCourse' ? 'audioImport' : 'textPackImport',
    category: sourceType === 'textbookCourse' ? `${meta.PROVIDER || 'Textbook'} ${meta.UNIT || ''}`.trim() : (meta.SCENARIO || meta.TAGS || SOURCE_TYPES[sourceType]),
    level: meta.LEVEL || 'A2',
    linkedCourseId: meta.PARENT_COURSE_ID || '',
    linkedCourseTitle: meta.LINKED_COURSE_TITLE || '',
    status: sourceType === 'textbookCourse' ? 'Audio Required' : 'Ready',
    progress: 0,
    goal: meta.GOAL || backgroundKv.LEARNING_GOAL || '',
    background: {
      en: backgroundKv.MAIN_IDEA || backgroundKv.SCENE || backgroundKv.TOPIC || '',
      cn: backgroundKv.SIMPLE_CN_EXPLANATION || ''
    },
    uploadedAudioUrl: '',
    generatedTtsAudioUrl: null,
    transcriptLines,
    languageItems,
    practiceItems,
    outputTasks,
    reviewItems,
    stage6Prompt: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  return { ...course, importReport: buildImportReport(course, missingFields, warnings) }
}

function parseDemoContentPack(rawText) {
  const raw = String(rawText || '').trim()
  if (!/Demo Content Pack|PACK_TYPE:\s*(TEXTBOOK_COURSE|EXPANSION_PACK|GENERAL_TOPIC_PACK)/i.test(raw)) return null
  const courses = splitDemoSections(raw).map(parseDemoCourse).filter(Boolean)
  if (!courses.length) return null
  return {
    kind: 'bundle',
    id: uid('bundle'),
    title: 'English File 3A Demo Content Pack',
    courses,
    importReport: {
      packType: 'DEMO_CONTENT_PACK',
      title: 'English File 3A Demo Content Pack',
      sourceType: 'Mixed',
      audioMode: 'Original + Generated',
      importMethod: 'Demo Pack Import',
      linkedCourseTitle: 'English File 3A — Great Britain',
      learnItems: courses.reduce((sum, course) => sum + (course.importReport?.learnItems || 0), 0),
      practiceItems: courses.reduce((sum, course) => sum + (course.practiceItems?.length || 0), 0),
      outputItems: courses.reduce((sum, course) => sum + (course.outputTasks?.length || 0), 0),
      reviewItems: courses.reduce((sum, course) => sum + (course.reviewItems?.length || 0), 0),
      missingFields: courses.flatMap(course => (course.importReport?.missingFields || []).map(field => `${course.title}: ${field}`)),
      warnings: ['Textbook Course is imported as Original Audio metadata only. It will not use Generated Audio or TTS until original audio is uploaded.']
    }
  }
}

function attachImportReport(course) {
  return { ...course, importReport: buildImportReport(course) }
}

function parseImportText(rawText) {
  const demo = parseDemoContentPack(rawText)
  if (demo) return demo
  const single = parseTextPack(rawText)
  return single ? attachImportReport(single) : null
}

function parseManualTranscript(text) {
  return String(text || '')
    .split('\n')
    .map(splitSpeakerLine)
    .filter(line => line.en)
    .map((line, index) => ({ id: uid('line'), ...line, aligned: typeof line.startTime === 'number' && typeof line.endTime === 'number', order: index + 1 }))
}

function whisperToTranscriptLines(result) {
  const text = String(result?.text || '')
  return text
    .split(/(?<=[.!?])\s+/)
    .map(cleanLine)
    .filter(Boolean)
    .map((en, index) => ({ id: uid('line'), speaker: '', en, cn: '', startTime: null, endTime: null, aligned: false, order: index + 1 }))
}

function normalizeWordText(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9']/g, '')
}

function sentenceWords(sentence) {
  return String(sentence || '')
    .split(/\s+/)
    .map(normalizeWordText)
    .filter(Boolean)
}

function alignCleanSentencesToWords(sentences = [], words = []) {
  const normalizedWords = words
    .map((word, index) => ({
      index,
      word: normalizeWordText(word.word || word.text || ''),
      start: typeof word.start === 'number' ? word.start : null,
      end: typeof word.end === 'number' ? word.end : null
    }))
    .filter(item => item.word)
  let cursor = 0
  return sentences.map((sentence, sentenceIndex) => {
    const target = sentenceWords(sentence)
    let best = { score: 0, startIndex: -1, endIndex: -1 }
    if (target.length) {
      const searchEnd = Math.min(normalizedWords.length, cursor + Math.max(140, target.length * 5))
      for (let start = cursor; start < searchEnd; start++) {
        let matched = 0
        let wi = start
        for (const targetWord of target) {
          let foundAt = -1
          for (let look = wi; look < Math.min(normalizedWords.length, wi + 4); look++) {
            if (normalizedWords[look].word === targetWord) {
              foundAt = look
              break
            }
          }
          if (foundAt >= 0) {
            matched += 1
            wi = foundAt + 1
          } else {
            wi += 1
          }
        }
        const score = matched / target.length
        if (score > best.score) best = { score, startIndex: start, endIndex: Math.max(start, wi - 1) }
        if (score >= 0.95) break
      }
    }
    const aligned = best.score >= 0.8 && best.startIndex >= 0
    const startWord = aligned ? normalizedWords[best.startIndex] : null
    const endWord = aligned ? normalizedWords[best.endIndex] : null
    if (aligned) cursor = Math.max(cursor, best.endIndex + 1)
    return {
      id: uid('line'),
      speaker: '',
      en: cleanLine(sentence),
      cn: '',
      startTime: startWord?.start ?? null,
      endTime: endWord?.end ?? null,
      aligned,
      matchScore: Number(best.score.toFixed(2)),
      order: sentenceIndex + 1
    }
  }).filter(line => line.en)
}

function transcriptToText(lines = []) {
  return lines.map(line => {
    const start = typeof line.startTime === 'number' ? formatSeconds(line.startTime) : ''
    const end = typeof line.endTime === 'number' ? formatSeconds(line.endTime) : ''
    const time = start && end ? `[${start}-${end}] ` : ''
    const speaker = line.speaker ? `${line.speaker}: ` : ''
    const cn = line.cn ? ` = ${line.cn}` : ''
    return `${time}${speaker}${line.en}${cn}`
  }).join('\n')
}

function formatSeconds(seconds) {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return ''
  const mins = Math.floor(seconds / 60)
  const secs = seconds - mins * 60
  return `${String(mins).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`
}

function inferCnPrompt(line) {
  return line.cn || `听这句并说出英文：${line.speaker ? `${line.speaker} says` : 'sentence'}`
}

function extractWords(text) {
  const stop = new Set('the a an and or but to of in on at for with from this that it is are am was were be been being i you he she we they my your his her our their do does did can could would should will just really very have has had get got not no yes hi hello thanks thank okay sure please'.split(' '))
  return [...new Set(String(text || '').toLowerCase().match(/[a-z][a-z'-]{3,}/g) || [])]
    .filter(word => !stop.has(word))
    .slice(0, 8)
}

function countUnaligned(lines = []) {
  return lines.filter(line => !line.aligned).length
}

function listenGroupLabel(course) {
  return course?.sourceType === 'textbookCourse' ? 'Textbook Audio' : 'Generated Dialogue'
}

function languageTypeLabel(type) {
  if (type === 'keyword') return 'Keywords'
  if (type === 'chunk') return 'Chunks'
  if (type === 'pattern') return 'Patterns'
  return 'Useful Sentences'
}

function groupLanguageItems(items = []) {
  return [
    ['keyword', 'Keywords'],
    ['chunk', 'Chunks'],
    ['pattern', 'Patterns'],
    ['usefulSentence', 'Useful Sentences']
  ].map(([type, label]) => ({ type, label, items: items.filter(item => item.type === type) }))
}

function backgroundRows(background = {}) {
  return [
    ['Topic', background.topic],
    ['Scene', background.scene],
    ['Speakers', background.speakers],
    ['Main Idea', background.mainIdea || background.en],
    ['Purpose', background.purpose],
    ['Real-life Use', background.realLifeUse],
    ['Learning Goal', background.learningGoal],
    ['Simple Chinese Explanation', background.simpleCnExplanation || background.cn]
  ].filter(([, value]) => value)
}

function reviewBucketLabel(item) {
  if (item.status === 'weak' || item.status === 'stuck' || item.type === 'weak_sentence') return 'Weak / Stuck'
  if (item.type === 'chunk') return 'Chunks'
  if (item.type === 'usefulSentence' || item.type === 'useful_sentence' || item.type === 'sentence') return 'Useful Sentences'
  return 'Today Review'
}

function inferAudioType(lines = []) {
  const cleanLines = lines.filter(line => line.en)
  const text = cleanLines.map(line => line.en).join(' ')
  const speakerCount = new Set(cleanLines.map(line => line.speaker).filter(Boolean)).size
  const questionCount = cleanLines.filter(line => /\?/.test(line.en)).length
  const avgWords = cleanLines.length
    ? cleanLines.reduce((sum, line) => sum + line.en.split(/\s+/).filter(Boolean).length, 0) / cleanLines.length
    : 0

  if (!cleanLines.length) return 'textbookAudio'
  if (speakerCount >= 2) return 'listeningDialogue'
  if (questionCount >= 2 && cleanLines.length <= 12) return 'shortQA'
  if (cleanLines.length >= 8 && avgWords >= 9) return 'readingPassage'
  if (cleanLines.length >= 4 && avgWords <= 4) return 'vocabularyOrPhrases'
  if (questionCount >= 1) return 'grammarExamples'
  return 'textbookAudio'
}

function buildTrainingFromTranscript(courseId, title, lines = []) {
  const cleanLines = lines.filter(line => line.en)
  const audioType = inferAudioType(cleanLines)
  const usefulLines = cleanLines.filter(line => line.en.split(/\s+/).length >= 3).slice(0, 8)
  const words = extractWords(cleanLines.map(line => line.en).join(' ')).slice(0, 5).map(word => ({
    id: uid('lang'),
    type: 'keyword',
    en: word,
    cn: '',
    note: 'Keyword from the original textbook audio.',
    sourceSentence: cleanLines.find(line => line.en.toLowerCase().includes(word))?.en || '',
    examples: [],
    autoSentences: [],
    reviewEnabled: false
  }))
  const usefulSentences = usefulLines.map(line => ({
    id: uid('lang'),
    type: 'usefulSentence',
    en: line.en,
    cn: line.cn,
    note: 'Useful sentence from the original audio.',
    sourceSentence: line.en,
    examples: [],
    autoSentences: [],
    reviewEnabled: true
  }))
  const chunkCandidates = [
    ['Can I', '我可以……吗？'],
    ['I would like', '我想要……'],
    ['I need to', '我需要……'],
    ['Do you have', '你们有……吗？'],
    ['What do you', '你……什么？'],
    ['How do you', '你怎么……？'],
    ['for me', '对我来说'],
    ['a lot of', '很多'],
    ['from all over', '来自各地']
  ]
  const chunks = chunkCandidates
    .filter(([chunk]) => cleanLines.some(line => line.en.toLowerCase().includes(chunk.toLowerCase())))
    .slice(0, 5)
    .map(([chunk, cn]) => ({
      id: uid('lang'),
      type: 'chunk',
      en: chunk,
      cn,
      note: 'High-frequency chunk found in the original audio.',
      sourceSentence: cleanLines.find(line => line.en.toLowerCase().includes(chunk.toLowerCase()))?.en || '',
      examples: [],
      autoSentences: [],
      reviewEnabled: true
    }))
  const questionLine = cleanLines.find(line => /\?/.test(line.en))
  const patterns = questionLine ? [{
    id: uid('lang'),
    type: 'pattern',
    en: questionLine.en.replace(/\b[a-z][a-z']+\b/gi, word => ['what', 'where', 'when', 'why', 'how', 'do', 'does', 'did', 'can', 'could', 'would', 'is', 'are'].includes(word.toLowerCase()) ? word : '...'),
    cn: '根据原音频问题做替换练习',
    note: 'Pattern inferred from a question in the original audio.',
    sourceSentence: questionLine.en,
    examples: [],
    autoSentences: [{ en: questionLine.en, cn: questionLine.cn }],
    reviewEnabled: false
  }] : []
  const languageItems = enrichLanguageItems([...words, ...chunks, ...patterns, ...usefulSentences], cleanLines)
  const enrichedPatterns = languageItems.filter(item => item.type === 'pattern')
  const practiceItems = [
    ...usefulLines.slice(0, 8).map(line => ({ id: uid('quick'), type: 'quickResponse', promptCn: inferCnPrompt(line), hint: line.speaker ? `Speaker: ${line.speaker}` : 'From original audio', answerEn: line.en })),
    ...usefulLines.slice(0, 10).map(line => ({ id: uid('type'), type: 'typing', promptCn: line.cn || 'Listen and type this sentence.', answerEn: line.en })),
    ...enrichedPatterns.flatMap(pattern => (pattern.autoSentences || []).map(sentence => ({ id: uid('rep'), type: 'replacement', base: pattern.en, replacement: sentence.cn || 'original sentence', answerEn: sentence.en })))
  ]
  const outputTasks = [
    {
      id: uid('retell'),
      type: 'retell',
      prompt: '听完这段教材音频后，用自己的话复述主要内容。',
      keywords: extractWords(cleanLines.map(line => line.en).join(' ')).slice(0, 6),
      sample: cleanLines.slice(0, 4).map(line => line.en).join(' ')
    }
  ]
  const speakers = [...new Set(cleanLines.map(line => line.speaker).filter(Boolean))]
  if (speakers.length >= 2) {
    outputTasks.unshift({
      id: uid('role'),
      type: 'rolePlay',
      scenario: title,
      userRole: speakers.find(s => /kevin|mandy|student/i.test(s)) || speakers[1],
      aiRole: speakers[0],
      lines: cleanLines.map(({ speaker, en, cn, startTime, endTime, aligned }) => ({ speaker, en, cn, startTime, endTime, aligned }))
    })
  }
  outputTasks.unshift({
    id: uid('guided'),
    type: 'guidedSpeaking',
    prompt: '根据这段教材音频，用英文回答一个简单问题：What is this audio mainly about?',
    hints: languageItems.slice(0, 4).map(item => item.en),
    sample: cleanLines.slice(0, 2).map(line => line.en).join(' ')
  })
  const reviewItems = [...chunks, ...usefulSentences].slice(0, 16).map(item => ({
    id: uid('review'),
    courseId,
    type: item.type,
    promptCn: item.cn || '看中文/提示回忆英文',
    answerEn: item.en,
    nextReviewAt: Date.now() + 24 * 60 * 60 * 1000,
    level: 0,
    status: 'new'
  }))
  return { audioType, languageItems, practiceItems, outputTasks, reviewItems }
}

function melbourneRewriteText(text = '') {
  const replacements = [
    [/\b(Great Britain|Britain|the UK|UK)\b/gi, 'Melbourne'],
    [/\bBritish\b/gi, 'Australian'],
    [/\bBBC\b/g, 'local library'],
    [/\bpubs?\b/gi, 'local cafes'],
    [/\bIndian food\b/gi, 'multicultural food'],
    [/\bgardens\b/gi, 'parks and gardens'],
    [/\bin the UK\b/gi, 'in Melbourne'],
    [/\blive in Melbourne\b/gi, 'live in Melbourne']
  ]
  let next = String(text || '').trim()
  replacements.forEach(([pattern, value]) => {
    next = next.replace(pattern, value)
  })
  next = next.replace(/\s+/g, ' ').trim()
  if (/^people from all over the world/i.test(next) && !/Melbourne/i.test(next)) {
    next = next.replace(/\.$/, '') + ' in Melbourne.'
  }
  if (/^English is international/i.test(next)) return 'English is important in Melbourne, but sometimes it is difficult for me.'
  if (/^I wear what I want/i.test(next)) return 'I can live my own life here. I feel more relaxed in Melbourne.'
  return next
}

function normalizeRewriteDialogue(dialogue = [], userName = 'Kevin') {
  return (Array.isArray(dialogue) ? dialogue : [])
    .map((line, index) => ({
      id: uid('line'),
      speaker: String(line?.speaker || (index % 2 ? userName : 'Neighbour')).trim(),
      en: String(line?.en || '').trim(),
      cn: String(line?.cn || '').trim(),
      aligned: true,
      order: index + 1
    }))
    .filter(line => line.en)
}

function normalizeRewritePairs(pairs = [], fallbackPairs = []) {
  const fallbackByOriginal = new Map(fallbackPairs.map(pair => [String(pair.original || '').trim().toLowerCase(), pair]))
  return (Array.isArray(pairs) ? pairs : [])
    .map(pair => {
      const original = String(pair?.original || '').trim()
      const fallback = fallbackByOriginal.get(original.toLowerCase()) || fallbackPairs.find(row => row.originalLineId === pair?.originalLineId) || {}
      return {
        originalLineId: String(pair?.originalLineId || fallback.originalLineId || ''),
        original: original || fallback.original || '',
        originalCn: String(pair?.originalCn || fallback.originalCn || '').trim(),
        rewritten: String(pair?.rewritten || fallback.rewritten || '').trim(),
        rewrittenCn: String(pair?.rewrittenCn || fallback.rewrittenCn || '').trim()
      }
    })
    .filter(pair => pair.original && pair.rewritten)
}

function buildKevinRewriteDraft(course) {
  const originalLines = (course?.transcriptLines || []).filter(line => line.en).slice(0, 8)
  const pairs = originalLines.map(line => ({
    originalLineId: line.id,
    original: line.en,
    originalCn: line.cn || '',
    rewritten: melbourneRewriteText(line.en),
    rewrittenCn: line.cn || ''
  })).filter(pair => pair.rewritten)
  const dialogue = []
  pairs.forEach((pair, index) => {
    if (index === 0) {
      dialogue.push({ id: uid('line'), speaker: 'Neighbour', en: 'What do you like about living in Melbourne?', cn: '你喜欢住在墨尔本的什么？', aligned: true, order: dialogue.length + 1 })
    } else if (index % 2 === 0) {
      dialogue.push({ id: uid('line'), speaker: 'Neighbour', en: index === 2 ? 'Why do you like it?' : 'What else is important for you?', cn: index === 2 ? '你为什么喜欢它？' : '还有什么对你重要？', aligned: true, order: dialogue.length + 1 })
    }
    dialogue.push({
      id: uid('line'),
      speaker: 'Kevin',
      en: pair.rewritten,
      cn: pair.rewrittenCn,
      aligned: true,
      order: dialogue.length + 1
    })
  })
  if (!dialogue.some(line => line.speaker === 'Neighbour')) {
    dialogue.unshift({ id: uid('line'), speaker: 'Neighbour', en: 'Can you tell me about life in Melbourne?', cn: '你能说说墨尔本生活吗？', aligned: true, order: 1 })
  }
  return { pairs, dialogue: dialogue.map((line, index) => ({ ...line, order: index + 1 })) }
}

function buildKevinRewriteCourse(course, draftOverride = null) {
  const id = uid('rewrite')
  const fallbackDraft = buildKevinRewriteDraft(course)
  const aiDialogue = normalizeRewriteDialogue(draftOverride?.dialogue || [], 'Kevin')
  const draft = {
    pairs: normalizeRewritePairs(draftOverride?.pairs || [], fallbackDraft.pairs).length ? normalizeRewritePairs(draftOverride?.pairs || [], fallbackDraft.pairs) : fallbackDraft.pairs,
    dialogue: aiDialogue.length ? aiDialogue : fallbackDraft.dialogue
  }
  const title = `${course.title} - Kevin Melbourne Version`
  const generated = buildTrainingFromTranscript(id, title, draft.dialogue)
  return {
    id,
    packType: 'AI_REWRITE_PACK',
    title,
    sourceType: 'realLifeExpansion',
    audioMode: 'generated',
    importMethod: 'textPackImport',
    category: 'Kevin Melbourne Rewrite',
    level: course.level || 'A2',
    linkedCourseId: course.id,
    linkedCourseTitle: course.title,
    status: 'Ready',
    progress: 0,
    goal: 'Practise the textbook language in Kevin real Melbourne life.',
    scenario: 'Kevin talks about daily life in Melbourne using the textbook language.',
    tags: ['Melbourne', 'AI rewrite', 'generated audio'],
    background: {
      en: 'Textbook audio rewritten into Kevin real-life Melbourne speaking practice.',
      cn: '把教材原音频改写成 Kevin 在墨尔本真实生活中能说的话。'
    },
    uploadedAudioUrl: '',
    generatedTtsAudioUrl: null,
    transcriptLines: draft.dialogue,
    languageItems: generated.languageItems,
    practiceItems: generated.practiceItems,
    outputTasks: generated.outputTasks,
    reviewItems: generated.reviewItems,
    rewritePairs: draft.pairs,
    stage6Prompt: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

function reviewInterval(level) {
  if (level <= 0) return 1
  if (level === 1) return 3
  if (level === 2) return 7
  if (level === 3) return 14
  if (level === 4) return 30
  return 60
}

function dateLabel(ts) {
  if (!ts) return 'Not scheduled'
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(ts); target.setHours(0, 0, 0, 0)
  const diff = Math.round((target - today) / 86400000)
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}

function shortDateLabel(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

function localDayKey(ts = Date.now()) {
  const date = new Date(ts)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function previousDayKey(dayKey) {
  const [year, month, day] = String(dayKey || '').split('-').map(Number)
  if (!year || !month || !day) return ''
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() - 1)
  return localDayKey(date.getTime())
}

function normalizeActivity(activity = {}) {
  const totals = activity.totals || {}
  return {
    streakDays: Number(activity.streakDays || 0),
    lastStudyDate: String(activity.lastStudyDate || ''),
    totals: {
      practice: Number(totals.practice || 0),
      output: Number(totals.output || 0),
      review: Number(totals.review || 0),
      weak: Number(totals.weak || 0)
    },
    days: activity.days && typeof activity.days === 'object' ? activity.days : {}
  }
}

function bumpActivity(activity, kind) {
  const current = normalizeActivity(activity)
  const today = localDayKey()
  const todayStats = { practice: 0, output: 0, review: 0, weak: 0, ...(current.days[today] || {}) }
  if (kind in todayStats) todayStats[kind] += 1
  const totals = { ...current.totals }
  if (kind in totals) totals[kind] += 1
  let streakDays = current.streakDays || 0
  if (current.lastStudyDate !== today) {
    streakDays = current.lastStudyDate === previousDayKey(today) ? streakDays + 1 : 1
  }
  return {
    ...current,
    streakDays,
    lastStudyDate: today,
    totals,
    days: { ...current.days, [today]: todayStats }
  }
}

function App() {
  const [userProfiles, setUserProfiles] = useState(() => normalizeUserProfiles(load(USER_PROFILES_KEY, DEFAULT_USER_PROFILES)))
  const [activeUserId, setActiveUserId] = useState(() => {
    const saved = load(ACTIVE_USER_KEY, DEFAULT_USER_PROFILES[0].id)
    return DEFAULT_USER_PROFILES.some(user => user.id === saved) ? saved : DEFAULT_USER_PROFILES[0].id
  })
  const [store, setStore] = useState(() => normalizeStore(loadUserStore(activeUserId)))
  const [readerLessons, setReaderLessons] = useState(() => normalizeReaderLessons(load(READER_LESSONS_KEY, [])))
  const [readerActiveId, setReaderActiveId] = useState(() => load(READER_ACTIVE_KEY, ''))
  const [readerDraft, setReaderDraft] = useState('')
  const [readerSpeed, setReaderSpeed] = useState(1)
  const [readerPauseSeconds, setReaderPauseSeconds] = useState(2.5)
  const [readerRepeatCount, setReaderRepeatCount] = useState(1)
  const [readerPlaying, setReaderPlaying] = useState(false)
  const [readerPracticeIndex, setReaderPracticeIndex] = useState(0)
  const [readerPracticeText, setReaderPracticeText] = useState('')
  const [readerPracticeInput, setReaderPracticeInput] = useState('')
  const [readerPracticeReveal, setReaderPracticeReveal] = useState(true)
  const [readerPracticeChecked, setReaderPracticeChecked] = useState(false)
  const [settings, setSettings] = useState(() => normalizeSettings(loadSettingsWithFallback()))
  const [tab, setTab] = useState(() => {
    const requestedTab = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('tab')
      : ''
    const savedTab = requestedTab || load(TAB_KEY, 'reader')
    return isValidTabId(savedTab) ? savedTab : 'today'
  })
  const [isPhoneView, setIsPhoneView] = useState(() => typeof window !== 'undefined' ? resolvePhoneViewByWidth(window.innerWidth) : false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [libraryMode, setLibraryMode] = useState('list')
  const [librarySubtab, setLibrarySubtab] = useState('courses')
  const [learnSubtab, setLearnSubtab] = useState('audio')
  const [showStudyTools, setShowStudyTools] = useState(false)
  const [outputMode, setOutputMode] = useState(() => {
    const requestedMode = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('mode')
      : ''
    return normalizeOutputMode(requestedMode || load(OUTPUT_MODE_KEY, 'guided'))
  })
  const [freeTalkLevel, setFreeTalkLevel] = useState('A2')
  const [reviewMode, setReviewMode] = useState('today')
  const [reviewQueueExpanded, setReviewQueueExpanded] = useState(false)
  const [showTodayDetails, setShowTodayDetails] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [answerShown, setAnswerShown] = useState(false)
  const [typed, setTyped] = useState('')
  const [message, setMessage] = useState('')
  const [rewriteLoading, setRewriteLoading] = useState(false)
  const [textPack, setTextPack] = useState('')
  const [importResult, setImportResult] = useState(null)
  const [audioForm, setAudioForm] = useState({ title: '', category: 'Textbook', level: 'A2', transcript: '', audioPreviewUrl: '', fileName: '', processingDepth: 'full', processStep: 'idle' })
  const [editingLineId, setEditingLineId] = useState('')
  const [splitLineId, setSplitLineId] = useState('')
  const [lineMoreId, setLineMoreId] = useState('')
  const [understandLineId, setUnderstandLineId] = useState('')
  const [swipedLineId, setSwipedLineId] = useState('')
  const audioRef = useRef(null)
  const audioFileRef = useRef(null)
  const backupFileRef = useRef(null)
  const ttsCache = useRef(new Map())
  const originalAudioUrlCache = useRef(new Map())
  const swipeStartRef = useRef({ id: '', x: 0, y: 0 })
  const readerStopRef = useRef(false)

  const activeCourse = useMemo(
    () => store.courses.find(course => course.id === store.activeCourseId) || store.courses[0],
    [store]
  )
  const activeReaderLesson = useMemo(
    () => readerLessons.find(lesson => lesson.id === readerActiveId) || readerLessons[0] || null,
    [readerLessons, readerActiveId]
  )
  const activeReaderParsed = useMemo(
    () => parseReaderMarkdown(activeReaderLesson?.raw || ''),
    [activeReaderLesson]
  )
  const readerSentences = useMemo(
    () => readerEnglishSentences(activeReaderParsed.blocks),
    [activeReaderParsed]
  )
  const activeProfile = useMemo(
    () => userProfiles.find(user => user.id === activeUserId) || userProfiles[0] || DEFAULT_USER_PROFILES[0],
    [userProfiles, activeUserId]
  )
  const dueReview = useMemo(() => store.reviewQueue.filter(item => item.nextReviewAt <= Date.now()), [store.reviewQueue])
  const textPreview = useMemo(() => parseImportText(textPack), [textPack])
  const outputPool = useMemo(() => {
    if (!activeCourse) return []
    const type = outputMode === 'guided' ? 'guidedSpeaking' : outputMode
    return activeCourse.outputTasks.filter(item => item.type === type)
  }, [activeCourse, outputMode])
  const practicePool = useMemo(() => activeCourse?.practiceItems || [], [activeCourse])
  const courseGroups = useMemo(() => [
    { id: 'textbookCourse', title: 'Textbook Courses', courses: store.courses.filter(course => course.sourceType === 'textbookCourse') },
    { id: 'realLifeExpansion', title: 'Expansion Packs', courses: store.courses.filter(course => course.sourceType === 'realLifeExpansion') },
    { id: 'generalTopicPack', title: 'General Topic Packs', courses: store.courses.filter(course => course.sourceType === 'generalTopicPack') }
  ], [store.courses])
  const reviewBuckets = useMemo(() => {
    const buckets = { 'Chunks': 0, 'Useful Sentences': 0, 'Weak / Stuck': 0, 'Today Review': dueReview.length }
    store.reviewQueue.forEach(item => {
      const label = reviewBucketLabel(item)
      if (label !== 'Today Review') buckets[label] = (buckets[label] || 0) + 1
    })
    return buckets
  }, [store.reviewQueue, dueReview.length])
  const reviewPool = useMemo(() => {
    if (reviewMode === 'today') return dueReview
    if (reviewMode === 'chunks') return store.reviewQueue.filter(item => reviewBucketLabel(item) === 'Chunks')
    if (reviewMode === 'sentences') return store.reviewQueue.filter(item => reviewBucketLabel(item) === 'Useful Sentences')
    return store.reviewQueue.filter(item => reviewBucketLabel(item) === 'Weak / Stuck')
  }, [store.reviewQueue, dueReview, reviewMode])
  const weakReview = useMemo(() => store.reviewQueue.filter(item => reviewBucketLabel(item) === 'Weak / Stuck'), [store.reviewQueue])
  const todayActivity = useMemo(() => normalizeActivity(store.activity).days[localDayKey()] || { practice: 0, output: 0, review: 0, weak: 0 }, [store.activity])
  const todayPractice = useMemo(() => activeCourse?.practiceItems?.slice(0, 3) || [], [activeCourse])
  const recentCourses = useMemo(() => store.courses.slice(0, 4), [store.courses])
  const editorLines = activeCourse?.transcriptLines || []
  const selectedEditorIndex = Math.max(0, editorLines.findIndex(line => line.id === editingLineId))
  const selectedEditorLine = editorLines[selectedEditorIndex] || editorLines[0] || null
  const speakerVoiceNames = useMemo(() => {
    const names = new Set(['Kevin', 'Mandy', 'Neighbour', 'Receptionist'])
    ;(activeCourse?.transcriptLines || []).forEach(line => {
      if (line.speaker) names.add(line.speaker)
    })
    ;(activeCourse?.outputTasks || []).forEach(task => {
      ;(task.lines || []).forEach(line => {
        if (line.speaker) names.add(line.speaker)
      })
    })
    return Array.from(names).slice(0, 10)
  }, [activeCourse])
  const uiLanguage = settings.uiLanguage === 'zh' ? 'zh' : 'en'
  const t = (key, values) => formatUiText(UI_TEXT[uiLanguage]?.[key] ?? UI_TEXT.en[key] ?? key, values)

  useEffect(() => save(userStoreKey(activeUserId), store), [store, activeUserId])
  useEffect(() => save(READER_LESSONS_KEY, readerLessons), [readerLessons])
  useEffect(() => save(READER_ACTIVE_KEY, activeReaderLesson?.id || readerActiveId || ''), [activeReaderLesson, readerActiveId])
  useEffect(() => save(ACTIVE_USER_KEY, activeUserId), [activeUserId])
  useEffect(() => save(USER_PROFILES_KEY, userProfiles), [userProfiles])
  useEffect(() => save(SETTINGS_KEY, settings), [settings])
  useEffect(() => save(OUTPUT_MODE_KEY, outputMode), [outputMode])
  useEffect(() => {
    save(TAB_KEY, tab)
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const alreadyCurrent = params.get('tab') === tab && params.get('v') && (tab !== 'output' || params.get('mode') === outputMode)
    if (tab === 'output') params.set('mode', outputMode)
    else params.delete('mode')
    if (alreadyCurrent) return
    params.set('tab', tab)
    if (!params.get('v')) params.set('v', APP_VERSION.replace(/\./g, ''))
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  }, [tab, outputMode])
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('reset_sw') === '1') {
      ;(async () => {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(registrations.map(registration => registration.unregister()))
          if ('caches' in window) {
            const keys = await caches.keys()
            await Promise.all(keys.map(key => caches.delete(key)))
          }
          params.delete('reset_sw')
          params.set('v', APP_VERSION.replace(/\./g, ''))
          const query = params.toString()
          window.location.replace(`${window.location.pathname}${query ? `?${query}` : ''}`)
        } catch {
          window.location.replace(`${window.location.pathname}?v=${APP_VERSION.replace(/\./g, '')}`)
        }
      })()
      return
    }
    if (import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
      return
    }
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister())
    }).catch(() => {})
  }, [])
  useEffect(() => {
    const syncPhoneView = () => setIsPhoneView(resolvePhoneViewByWidth(window.innerWidth))
    syncPhoneView()
    window.addEventListener('resize', syncPhoneView, { passive: true })
    return () => window.removeEventListener('resize', syncPhoneView)
  }, [])
  useEffect(() => {
    if (tab !== 'learn' && showStudyTools) setShowStudyTools(false)
  }, [tab, showStudyTools])
  useEffect(() => {
    if (!isPhoneView) return
    if (showStudyTools) setShowStudyTools(false)
    if (learnSubtab !== 'audio') setLearnSubtab('audio')
    if (tab === 'reader' || tab === 'library' || tab === 'practice') setTab('today')
  }, [isPhoneView, showStudyTools, learnSubtab, tab])
  useEffect(() => {
    if (!isPhoneView || tab !== 'review' || reviewMode !== 'today') {
      if (reviewQueueExpanded) setReviewQueueExpanded(false)
    }
  }, [isPhoneView, tab, reviewMode, reviewQueueExpanded])
  useEffect(() => {
    const lineIds = new Set((activeCourse?.transcriptLines || []).map(line => line.id))
    if (!lineIds.has(editingLineId)) setEditingLineId(activeCourse?.transcriptLines?.[0]?.id || '')
    if (understandLineId && !lineIds.has(understandLineId)) setUnderstandLineId('')
    if (lineMoreId && !lineIds.has(lineMoreId)) setLineMoreId('')
    if (swipedLineId && !lineIds.has(swipedLineId)) setSwipedLineId('')
    if (splitLineId && !lineIds.has(splitLineId)) setSplitLineId('')
  }, [activeCourse, editingLineId, understandLineId, lineMoreId, splitLineId, swipedLineId])

  function updateStore(next) {
    setStore(prev => typeof next === 'function' ? next(prev) : next)
  }

  function recordActivity(kind) {
    updateStore(prev => ({ ...prev, activity: bumpActivity(prev.activity, kind) }))
  }

  function recordStudy(stage, options = {}) {
    const courseId = options.courseId || activeCourse?.id
    if (!courseId) return
    updateStore(prev => ({
      ...prev,
      activity: options.activityKind ? bumpActivity(prev.activity, options.activityKind) : prev.activity,
      courses: prev.courses.map(course => course.id === courseId
        ? {
            ...course,
            lastStage: stage,
            lastStudiedAt: new Date().toISOString(),
            progress: typeof options.setProgress === 'number'
              ? options.setProgress
              : Math.max(course.progress || 0, options.minProgress || 0),
            updatedAt: new Date().toISOString()
          }
        : course)
    }))
  }

  function updateUserProfile(userId, patch) {
    setUserProfiles(prev => prev.map(user => {
      if (user.id !== userId) return user
      const next = { ...user, ...patch }
      if ('name' in patch) next.name = String(patch.name || '').slice(0, 24)
      if ('password' in patch) next.password = String(patch.password || '').slice(0, 64)
      return next
    }))
  }

  function switchUser(nextUserId) {
    if (nextUserId === activeUserId) return
    const nextProfile = userProfiles.find(user => user.id === nextUserId)
    if (nextProfile?.password) {
      const entered = window.prompt(t('passwordPrompt', { name: nextProfile.name }))
      if (entered !== nextProfile.password) {
        setMessage(t('passwordWrong'))
        return
      }
    }
    stopAudio()
    save(userStoreKey(activeUserId), store)
    setActiveUserId(nextUserId)
    setStore(normalizeStore(loadUserStore(nextUserId)))
    setTab('today')
    setLibraryMode('list')
    setLibrarySubtab('courses')
    setActiveIndex(0)
    setAnswerShown(false)
    setTyped('')
    setMessage('')
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  async function playUrl(url, startTime = null, endTime = null) {
    if (!url) return
    stopAudio()
    const audio = new Audio(url)
    audioRef.current = audio
    audio.playbackRate = Number(settings.playbackSpeed) || 1
    if (typeof startTime === 'number') audio.currentTime = startTime
    if (typeof endTime === 'number') {
      audio.ontimeupdate = () => {
        if (audio.currentTime >= endTime) {
          audio.pause()
          audio.ontimeupdate = null
        }
      }
    }
    await audio.play()
  }

  async function resolveOriginalAudioUrl(ref) {
    if (!ref) return ''
    if (!String(ref).startsWith('idb-audio:')) return ref
    if (originalAudioUrlCache.current.has(ref)) return originalAudioUrlCache.current.get(ref)
    const blob = await getOriginalAudioBlob(ref)
    if (!blob) throw new Error('Original audio is missing. Please re-upload this audio.')
    const url = URL.createObjectURL(blob)
    originalAudioUrlCache.current.set(ref, url)
    return url
  }

  function voiceForSpeaker(speaker) {
    const key = String(speaker || '').trim()
    return (key && settings.speakerVoices?.[key]) || settings.voice || defaultSettings.voice
  }

  function setSpeakerVoice(speaker, voice) {
    setSettings(prev => ({
      ...prev,
      speakerVoices: {
        ...(prev.speakerVoices || {}),
        [speaker]: voice
      }
    }))
  }

  async function getTtsUrl(text, speaker = '') {
    const clean = String(text || '').trim()
    if (!clean) return ''
    const voice = voiceForSpeaker(speaker)
    const key = `${voice}:${clean}`
    if (ttsCache.current.has(key)) return ttsCache.current.get(key)
    const response = await fetch('/api/openai-voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, voice, apiKey: settings.apiKey })
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'OpenAI voice failed')
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    ttsCache.current.set(key, url)
    return url
  }

  async function playText(text, speaker = '') {
    try {
      setMessage('Preparing audio...')
      const url = await getTtsUrl(text, speaker)
      await playUrl(url)
      setMessage('')
    } catch (error) {
      setMessage(error?.message || 'Audio failed. Check Settings API key.')
    }
  }

  function importReaderLesson() {
    const raw = readerDraft.trim()
    if (!raw) {
      setMessage('Paste one full ChatGPT lesson first.')
      return
    }
    const lesson = {
      id: uid('reader'),
      title: deriveReaderTitle(raw),
      raw,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setReaderLessons(prev => [lesson, ...prev])
    setReaderActiveId(lesson.id)
    setReaderDraft('')
    setReaderPracticeIndex(0)
    setReaderPracticeInput('')
    setReaderPracticeChecked(false)
    setMessage('Kevin in Australia lesson imported. Full original text is preserved.')
  }

  function deleteReaderLesson(lessonId) {
    setReaderLessons(prev => prev.filter(lesson => lesson.id !== lessonId))
    if (readerActiveId === lessonId) setReaderActiveId('')
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function playUrlToEnd(url, speed = 1) {
    return new Promise((resolve, reject) => {
      stopAudio()
      const audio = new Audio(url)
      audioRef.current = audio
      audio.playbackRate = Number(speed) || 1
      audio.onended = resolve
      audio.onerror = () => reject(new Error('Audio playback failed.'))
      audio.play().catch(reject)
    })
  }

  async function playReaderText(text) {
    const clean = playableEnglishFromText(text)
    if (!clean) {
      setMessage('Only pure English lines can be played.')
      return
    }
    try {
      readerStopRef.current = false
      setReaderPlaying(true)
      setMessage('Preparing audio...')
      const url = await getTtsUrl(clean)
      for (let count = 0; count < Math.max(1, Number(readerRepeatCount) || 1); count += 1) {
        if (readerStopRef.current) break
        await playUrlToEnd(url, readerSpeed)
        if (readerStopRef.current || count >= Math.max(1, Number(readerRepeatCount) || 1) - 1) break
        await delay(Number(readerPauseSeconds) * 1000)
      }
      setMessage('')
    } catch (error) {
      setMessage(error?.message || 'Audio failed. Check Settings API key.')
    } finally {
      setReaderPlaying(false)
    }
  }

  async function playReaderLines(lines = []) {
    const playable = lines.map(playableEnglishFromText).filter(Boolean)
    if (!playable.length) {
      setMessage('No pure English lines found in this block.')
      return
    }
    try {
      readerStopRef.current = false
      setReaderPlaying(true)
      setMessage(`Playing ${playable.length} English lines...`)
      for (const line of playable) {
        const url = await getTtsUrl(line)
        for (let count = 0; count < Math.max(1, Number(readerRepeatCount) || 1); count += 1) {
          if (readerStopRef.current) break
          await playUrlToEnd(url, readerSpeed)
          if (readerStopRef.current) break
          await delay(Number(readerPauseSeconds) * 1000)
        }
        if (readerStopRef.current) break
      }
      setMessage(readerStopRef.current ? 'Playback stopped.' : '')
    } catch (error) {
      setMessage(error?.message || 'Continuous playback failed.')
    } finally {
      setReaderPlaying(false)
    }
  }

  function stopReaderPlayback() {
    readerStopRef.current = true
    stopAudio()
    setReaderPlaying(false)
    setMessage('Playback stopped.')
  }

  function nextReaderPracticeSentence() {
    if (!readerSentences.length) return
    const nextIndex = readerSentences.length === 1
      ? 0
      : Math.floor(Math.random() * readerSentences.length)
    setReaderPracticeIndex(nextIndex)
    setReaderPracticeText('')
    setReaderPracticeInput('')
    setReaderPracticeChecked(false)
  }

  function startReaderSpelling(text) {
    const playable = playableEnglishFromText(text)
    if (!playable) return
    const existingIndex = readerSentences.findIndex(sentence => sentence === playable)
    if (existingIndex >= 0) setReaderPracticeIndex(existingIndex)
    setReaderPracticeText(playable)
    setReaderPracticeReveal(false)
    setReaderPracticeInput('')
    setReaderPracticeChecked(false)
    window.requestAnimationFrame(() => {
      document.getElementById('reader-spelling-practice')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  function readerPracticeResult() {
    const expected = readerPracticeText || readerSentences[readerPracticeIndex] || ''
    if (!readerPracticeChecked) return ''
    return normalizeAnswerText(readerPracticeInput) === normalizeAnswerText(expected)
      ? 'Correct'
      : 'Check spelling and punctuation, then try again.'
  }

  function scrollToReaderSection(id) {
    document.getElementById(`reader-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function lineWordCount(line) {
    return String(line?.en || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length
  }

  function autoPauseSecondsForLine(line) {
    const text = String(line?.en || '').trim()
    if (!text) return 1.5
    const words = lineWordCount(line)
    const chars = text.replace(/\s+/g, '').length
    const hasClausePunctuation = /[,;:]/.test(text)
    const hasStrongBreak = /[!?]/.test(text)
    const duration = typeof line?.startTime === 'number' && typeof line?.endTime === 'number'
      ? Math.max(0, line.endTime - line.startTime)
      : 0
    const secPerWord = words > 0 && duration > 0 ? duration / words : 0

    if (duration >= 5.2 || words >= 13 || chars >= 72 || (secPerWord > 0.62 && words >= 8) || hasStrongBreak) return 4.5
    if (duration >= 2.6 || words >= 7 || chars >= 38 || hasClausePunctuation || (secPerWord > 0.46 && words >= 5)) return 3
    return 1.5
  }

  function pauseDurationMsForLine(line = null) {
    if (settings.pauseSeconds === 'auto') return autoPauseSecondsForLine(line) * 1000
    return (Number(settings.pauseSeconds) || 3) * 1000
  }

  async function playLine(line) {
    if (!activeCourse) return
    try {
      if (activeCourse.audioMode === 'original' && !activeCourse.uploadedAudioUrl) {
        setMessage('Original audio is required for this textbook course. Upload the textbook audio in Audio Import; the app will not replace it with TTS.')
        return
      }
      if (activeCourse.audioMode === 'original' && activeCourse.uploadedAudioUrl && typeof line.startTime === 'number') {
        await playUrl(await resolveOriginalAudioUrl(activeCourse.uploadedAudioUrl), line.startTime, line.endTime)
      } else if (activeCourse.audioMode === 'original' && activeCourse.uploadedAudioUrl) {
        setMessage('This line is unaligned, so the app will play the original audio from the start. Add timestamps in Line Editor for exact playback.')
        await playUrl(await resolveOriginalAudioUrl(activeCourse.uploadedAudioUrl))
      } else {
        await playText(line.en, line.speaker)
      }
      recordStudy('learn', { minProgress: 20 })
    } catch (error) {
      setMessage(error?.message || 'Audio playback failed.')
    }
  }

  async function playList(lines, options = {}) {
    for (const line of lines) {
      const pauseAfterLine = pauseDurationMsForLine(line)
      if (options.skipSpeaker && line.speaker?.toLowerCase() === options.skipSpeaker.toLowerCase()) {
        await new Promise(resolve => setTimeout(resolve, pauseAfterLine))
        continue
      }
      await playText(line.en, line.speaker)
      await new Promise(resolve => setTimeout(resolve, pauseAfterLine))
    }
  }

  async function playOriginalLineSequence(lines = [], options = {}) {
    if (!activeCourse?.uploadedAudioUrl) {
      setMessage('Original audio is required for this textbook course. The app will not use TTS as a substitute.')
      return
    }
    const playableLines = lines.filter(line => {
      if (options.skipSpeaker && line.speaker?.toLowerCase() === options.skipSpeaker.toLowerCase()) return false
      return typeof line.startTime === 'number' && typeof line.endTime === 'number'
    })
    if (!playableLines.length) {
      setMessage('No aligned subtitle lines yet. Open Line Editor and add start/end times, or use Play for the full original audio.')
      return
    }
    try {
      const url = await resolveOriginalAudioUrl(activeCourse.uploadedAudioUrl)
      stopAudio()
      const audio = new Audio(url)
      audioRef.current = audio
      audio.playbackRate = Number(settings.playbackSpeed) || 1
      for (const line of playableLines) {
        await new Promise((resolve, reject) => {
          audio.currentTime = line.startTime
          audio.ontimeupdate = () => {
            if (audio.currentTime >= line.endTime) {
              audio.pause()
              audio.ontimeupdate = null
              resolve()
            }
          }
          audio.onended = resolve
          audio.play().catch(reject)
        })
        await new Promise(resolve => setTimeout(resolve, pauseDurationMsForLine(line)))
      }
      setMessage('')
    } catch (error) {
      setMessage(error?.message || 'Original audio playback failed.')
    }
  }

  async function playCourseTranscript(course) {
    if (course?.id) recordStudy('learn', { courseId: course.id, minProgress: 25 })
    if (course.audioMode === 'original') {
      await playOriginalLineSequence(course.transcriptLines || [])
    } else {
      await playList(course.transcriptLines || [])
    }
  }

  async function playOutputLines(lines, options = {}) {
    if (activeCourse?.audioMode === 'original') {
      await playOriginalLineSequence(lines, options)
    } else {
      await playList(lines, options)
    }
  }

  async function playCourseMain(course) {
    if (!course) return
    if (course.audioMode === 'original') {
      if (!course.uploadedAudioUrl) {
        setMessage('Original audio is required for this textbook course. Upload it through Audio Import before playback.')
        return
      }
      recordStudy('learn', { courseId: course.id, minProgress: 20 })
      await playUrl(await resolveOriginalAudioUrl(course.uploadedAudioUrl))
    } else {
      recordStudy('learn', { courseId: course.id, minProgress: 20 })
      await playList(course.transcriptLines || [])
    }
  }

  function setPlaybackSpeed(speed) {
    setSettings(prev => ({ ...prev, playbackSpeed: speed }))
    if (audioRef.current) audioRef.current.playbackRate = speed
  }

  function resolveVisibleTab(nextTab) {
    if (nextTab === 'practice' && isPhoneView) return 'output'
    return nextTab
  }

  function maybeResetViewportForTabSwitch() {
    if (!isPhoneView) return
    window.scrollTo(0, 0)
  }

  function selectCourse(courseId, nextTab = 'learn') {
    stopAudio()
    maybeResetViewportForTabSwitch()
    const routedTab = resolveVisibleTab(nextTab)
    const stageForCourse = ['learn', 'practice', 'output', 'review'].includes(routedTab) ? routedTab : ''
    updateStore(prev => ({
      ...prev,
      activeCourseId: courseId,
      courses: stageForCourse
        ? prev.courses.map(course => course.id === courseId
          ? { ...course, lastStage: stageForCourse, updatedAt: new Date().toISOString() }
          : course)
        : prev.courses
    }))
    setActiveIndex(0)
    setAnswerShown(false)
    setTyped('')
    if (routedTab === 'output') setOutputMode('guided')
    setTab(routedTab)
  }

  function openCourseStage(courseId, stage = 'learn') {
    selectCourse(courseId, stage)
    if (stage === 'review') setReviewMode(weakReview.length ? 'weak' : 'today')
  }

  function startNextLoop(courseId = activeCourse?.id) {
    if (!courseId) return
    recordStudy('learn', { courseId, setProgress: 5 })
    openCourseStage(courseId, 'learn')
  }

  function addCourse(course) {
    const queue = course.reviewItems || []
    updateStore(prev => ({
      ...prev,
      activeCourseId: course.id,
      courses: [course, ...prev.courses],
      reviewQueue: [...prev.reviewQueue, ...queue]
    }))
  }

  function addCourses(courses = []) {
    if (!courses.length) return
    const queue = courses.flatMap(course => course.reviewItems || [])
    updateStore(prev => ({
      ...prev,
      activeCourseId: courses[0].id,
      courses: [...courses, ...prev.courses],
      reviewQueue: [...prev.reviewQueue, ...queue]
    }))
  }

  function updateActiveCourse(updater) {
    if (!activeCourse) return
    updateStore(prev => {
      let nextCourse = null
      const courses = prev.courses.map(course => {
        if (course.id !== activeCourse.id) return course
        nextCourse = typeof updater === 'function' ? updater(course) : { ...course, ...updater }
        return { ...nextCourse, updatedAt: new Date().toISOString() }
      })
      const reviewQueue = nextCourse?.reviewItems
        ? [...prev.reviewQueue.filter(item => item.courseId !== activeCourse.id), ...nextCourse.reviewItems]
        : prev.reviewQueue
      return { ...prev, courses, reviewQueue }
    })
  }

  function regenerateActiveCourseTraining() {
    if (!activeCourse) return
    const generated = buildTrainingFromTranscript(activeCourse.id, activeCourse.title, activeCourse.transcriptLines || [])
    updateActiveCourse(course => ({
      ...course,
      ...generated,
      status: countUnaligned(course.transcriptLines || []) ? 'Need Check' : 'Ready',
      progress: Math.max(course.progress || 0, 10)
    }))
    setMessage('Training content generated from transcript: Language, Practice, Output, and Review are ready.')
  }

  function updateCourseLine(lineId, field, value) {
    updateActiveCourse(course => {
      const transcriptLines = (course.transcriptLines || []).map(line => {
        if (line.id !== lineId) return line
        const next = {
          ...line,
          [field]: field === 'startTime' || field === 'endTime' ? (value === '' ? null : Number(value)) : value
        }
        next.aligned = typeof next.startTime === 'number' && typeof next.endTime === 'number'
        return next
      })
      const generated = buildTrainingFromTranscript(course.id, course.title, transcriptLines)
      return { ...course, transcriptLines, ...generated, status: countUnaligned(transcriptLines) ? 'Need Check' : 'Ready' }
    })
  }

  function adjustCourseLineTime(lineId, field, delta) {
    const line = activeCourse?.transcriptLines?.find(item => item.id === lineId)
    if (!line) return
    const current = typeof line[field] === 'number' ? line[field] : 0
    updateCourseLine(lineId, field, Math.max(0, Math.round((current + delta) * 10) / 10))
  }

  function deleteTranscriptLine(lineId) {
    updateActiveCourse(course => {
      const transcriptLines = (course.transcriptLines || []).filter(line => line.id !== lineId)
      const generated = buildTrainingFromTranscript(course.id, course.title, transcriptLines)
      return { ...course, transcriptLines, ...generated, status: countUnaligned(transcriptLines) ? 'Need Check' : 'Ready' }
    })
  }

  function mergeTranscriptLineWithNext(lineId) {
    updateActiveCourse(course => {
      const lines = course.transcriptLines || []
      const index = lines.findIndex(line => line.id === lineId)
      if (index < 0 || index >= lines.length - 1) return course
      const current = lines[index]
      const next = lines[index + 1]
      const merged = {
        ...current,
        en: [current.en, next.en].filter(Boolean).join(' '),
        cn: [current.cn, next.cn].filter(Boolean).join(' '),
        endTime: typeof next.endTime === 'number' ? next.endTime : current.endTime,
        aligned: typeof current.startTime === 'number' && (typeof next.endTime === 'number' || typeof current.endTime === 'number')
      }
      const transcriptLines = [...lines.slice(0, index), merged, ...lines.slice(index + 2)]
      const generated = buildTrainingFromTranscript(course.id, course.title, transcriptLines)
      return { ...course, transcriptLines, ...generated, status: countUnaligned(transcriptLines) ? 'Need Check' : 'Ready' }
    })
  }

  function splitTranscriptLineAtWord(lineId, wordIndex) {
    updateActiveCourse(course => {
      const lines = course.transcriptLines || []
      const index = lines.findIndex(line => line.id === lineId)
      if (index < 0) return course
      const line = lines[index]
      const words = String(line.en || '').trim().split(/\s+/).filter(Boolean)
      if (wordIndex < 0 || wordIndex >= words.length - 1) return course
      const firstText = words.slice(0, wordIndex + 1).join(' ')
      const secondText = words.slice(wordIndex + 1).join(' ')
      const hasTimes = typeof line.startTime === 'number' && typeof line.endTime === 'number' && line.endTime > line.startTime
      const splitTime = hasTimes ? Math.round((line.startTime + ((line.endTime - line.startTime) * ((wordIndex + 1) / words.length))) * 10) / 10 : null
      const firstLine = {
        ...line,
        en: firstText,
        endTime: splitTime ?? line.endTime,
        aligned: typeof line.startTime === 'number' && typeof (splitTime ?? line.endTime) === 'number'
      }
      const secondLine = {
        ...line,
        id: uid('line'),
        en: secondText,
        cn: '',
        startTime: splitTime,
        endTime: line.endTime,
        aligned: typeof splitTime === 'number' && typeof line.endTime === 'number'
      }
      const transcriptLines = [...lines.slice(0, index), firstLine, secondLine, ...lines.slice(index + 1)]
      const generated = buildTrainingFromTranscript(course.id, course.title, transcriptLines)
      return { ...course, transcriptLines, ...generated, status: countUnaligned(transcriptLines) ? 'Need Check' : 'Ready' }
    })
    setSplitLineId('')
  }

  function addTranscriptLine() {
    if (!activeCourse) return
    updateActiveCourse(course => ({
      ...course,
      transcriptLines: [...(course.transcriptLines || []), { id: uid('line'), speaker: '', en: '', cn: '', startTime: null, endTime: null, aligned: false, order: (course.transcriptLines || []).length + 1 }]
    }))
  }

  async function transcribeAudioWithWhisper() {
    const file = audioFileRef.current
    if (!file) {
      setMessage('Please choose an audio file first.')
      return
    }
    try {
      setAudioForm(prev => ({ ...prev, processStep: 'whisper' }))
      setMessage('Step 1/3: Whisper word-level transcription is running...')
      const form = new FormData()
      form.append('file', file)
      form.append('model', 'whisper-1')
      form.append('response_format', 'verbose_json')
      form.append('timestamp_granularities[]', 'word')
      const headers = settings.apiKey ? { 'x-openai-key': settings.apiKey } : {}
      const response = await fetch('/api/openai-transcribe', {
        method: 'POST',
        headers,
        body: form
      })
      if (!response.ok) throw new Error(await response.text())
      const json = await response.json()
      const words = Array.isArray(json.words) ? json.words : []
      if (!words.length) throw new Error('Whisper did not return word-level timestamps.')
      setAudioForm(prev => ({ ...prev, processStep: 'gpt' }))
      setMessage('Step 2/3: GPT is cleaning punctuation and natural sentence breaks...')
      const rawText = words.map(word => word.word || '').join(' ').replace(/\s+/g, ' ').trim()
      const cleanResponse = await fetch('/api/openai-clean-subtitles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiKey ? { 'x-openai-key': settings.apiKey } : {})
        },
        body: JSON.stringify({ text: rawText })
      })
      if (!cleanResponse.ok) throw new Error(await cleanResponse.text())
      const cleanJson = await cleanResponse.json()
      const sentences = Array.isArray(cleanJson.sentences) && cleanJson.sentences.length
        ? cleanJson.sentences
        : whisperToTranscriptLines(json).map(line => line.en)
      setAudioForm(prev => ({ ...prev, processStep: 'align' }))
      setMessage('Step 3/3: Matching GPT sentences back to Whisper word timestamps...')
      const lines = alignCleanSentencesToWords(sentences, words)
      setAudioForm(prev => ({ ...prev, transcript: transcriptToText(lines) }))
      const unaligned = lines.filter(line => !line.aligned).length
      setAudioForm(prev => ({ ...prev, processStep: 'done' }))
      setMessage(`Smart Process finished: ${lines.length} clean subtitle lines, ${unaligned} need manual check.`)
    } catch (error) {
      setAudioForm(prev => ({ ...prev, processStep: 'error' }))
      setMessage(`Whisper failed: ${error?.message || error}`)
    }
  }

  function importTextPack() {
    if (!textPreview) return
    const importedCourses = textPreview.kind === 'bundle' ? textPreview.courses : [textPreview]
    const primaryCourse = importedCourses[0]
    if (textPreview.kind === 'bundle') {
      addCourses(importedCourses)
      setMessage(`${textPreview.courses.length} demo courses imported. ${t('importedOpenListen')}`)
    } else {
      addCourse(textPreview)
      setMessage(t('importedOpenListen'))
    }
    setImportResult({
      title: primaryCourse?.title || t('importSuccessTitle'),
      learnItems: importedCourses.reduce((sum, course) => sum + (course.transcriptLines?.length || 0), 0),
      speakItems: importedCourses.reduce((sum, course) => sum + (course.outputTasks?.length || 0), 0),
      reviewItems: importedCourses.reduce((sum, course) => sum + (course.reviewItems?.length || 0), 0)
    })
    setTextPack('')
    setLibraryMode('list')
    setLibrarySubtab('courses')
    setLearnSubtab('audio')
    setActiveIndex(0)
    setAnswerShown(false)
    maybeResetViewportForTabSwitch()
    setTab('learn')
  }

  async function importAudioCourse() {
    const title = audioForm.title.trim() || audioForm.fileName || 'Textbook Audio Course'
    const lines = parseManualTranscript(audioForm.transcript)
    if (!audioFileRef.current) {
      setMessage('Please upload the original textbook audio before saving.')
      return
    }
    if (!lines.length) {
      setMessage('Please run Smart Process or paste transcript lines before saving.')
      return
    }
    const courseId = uid('audio_course')
    const courseGenerated = buildTrainingFromTranscript(courseId, title, lines)
    let uploadedAudioUrl = ''
    if (audioFileRef.current) {
      try {
        uploadedAudioUrl = await putOriginalAudioBlob(courseId, audioFileRef.current)
      } catch (error) {
        setMessage(`Audio save failed: ${error?.message || error}`)
        return
      }
    }
    const course = {
      id: courseId,
      title,
      sourceType: 'textbookCourse',
      audioMode: 'original',
      importMethod: 'audioImport',
      category: audioForm.category || 'Textbook',
      level: audioForm.level || 'A2',
      audioType: courseGenerated.audioType,
      linkedCourseId: '',
      status: countUnaligned(lines) ? 'Need Check' : 'Ready',
      progress: 0,
      goal: 'Listen, shadow, extract useful language, and practice around this textbook audio.',
      background: { en: 'Original textbook audio imported by Kevin.', cn: 'Kevin 导入的教材原音频。' },
      uploadedAudioUrl,
      generatedTtsAudioUrl: null,
      transcriptLines: lines,
      languageItems: courseGenerated.languageItems,
      practiceItems: courseGenerated.practiceItems,
      outputTasks: courseGenerated.outputTasks,
      reviewItems: courseGenerated.reviewItems,
      stage6Prompt: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    addCourse(course)
    setImportResult({
      title: course.title,
      learnItems: course.transcriptLines?.length || 0,
      speakItems: course.outputTasks?.length || 0,
      reviewItems: course.reviewItems?.length || 0
    })
    if (audioForm.audioPreviewUrl) URL.revokeObjectURL(audioForm.audioPreviewUrl)
    setAudioForm({ title: '', category: 'Textbook', level: 'A2', transcript: '', audioPreviewUrl: '', fileName: '', processingDepth: 'full', processStep: 'idle' })
    audioFileRef.current = null
    setLibraryMode('list')
    setLibrarySubtab('courses')
    setLearnSubtab('audio')
    setActiveIndex(0)
    setAnswerShown(false)
    maybeResetViewportForTabSwitch()
    setMessage(`${t('importedOpenListen')} ${courseGenerated.languageItems.length} language items, ${courseGenerated.practiceItems.length} practice items, ${countUnaligned(lines)} unaligned lines.`)
    setTab('learn')
  }

  function onAudioFile(file) {
    if (!file) return
    audioFileRef.current = file
    setAudioForm(prev => {
      if (prev.audioPreviewUrl) URL.revokeObjectURL(prev.audioPreviewUrl)
      return { ...prev, audioPreviewUrl: URL.createObjectURL(file), fileName: file.name, title: prev.title || file.name.replace(/\.[^.]+$/, ''), processStep: 'ready' }
    })
  }

  function markReview(item, rating) {
    const isLastReviewCard = activeIndex >= reviewPool.length - 1
    const updateReviewItem = row => {
      const currentLevel = row.level || 0
      const level = rating === 'good' ? currentLevel + 1 : rating === 'hard' ? Math.max(0, currentLevel) : 0
      const days = rating === 'good' ? reviewInterval(level) : rating === 'hard' ? 2 : 1
      return { ...row, level, status: rating === 'again' ? 'weak' : 'learning', nextReviewAt: Date.now() + days * 86400000 }
    }
    updateStore(prev => ({
      ...prev,
      courses: prev.courses.map(course => course.id !== item.courseId
        ? course
        : { ...course, reviewItems: (course.reviewItems || []).map(row => row.id === item.id ? updateReviewItem(row) : row) }),
      reviewQueue: prev.reviewQueue.map(row => row.id === item.id ? updateReviewItem(row) : row)
    }))
    recordStudy('review', { courseId: item.courseId, activityKind: 'review', minProgress: isLastReviewCard ? 100 : 90 })
    setAnswerShown(false)
    if (isLastReviewCard) {
      setActiveIndex(0)
      maybeResetViewportForTabSwitch()
      setTab('today')
      setMessage(t('reviewSessionDone'))
      return
    }
    setActiveIndex(i => Math.max(0, Math.min(i + 1, reviewPool.length - 1)))
  }

  function upsertWeakReviewItem(reviewItem) {
    if (!activeCourse || !reviewItem.answerEn) return
    const answerKey = String(reviewItem.answerEn || '').trim().toLowerCase()
    updateStore(prev => {
      let nextWeakItem = null
      const courses = prev.courses.map(course => {
        if (course.id !== activeCourse.id) return course
        const reviewItems = course.reviewItems || []
        const existing = reviewItems.find(item =>
          reviewBucketLabel(item) === 'Weak / Stuck' &&
          String(item.answerEn || '').trim().toLowerCase() === answerKey
        )
        nextWeakItem = {
          ...reviewItem,
          id: existing?.id || uid('weak'),
          courseId: course.id,
          type: 'weak_sentence',
          level: 0,
          nextReviewAt: Date.now()
        }
        return {
          ...course,
          reviewItems: existing
            ? reviewItems.map(item => item.id === existing.id ? { ...item, ...nextWeakItem } : item)
            : [...reviewItems, nextWeakItem],
          updatedAt: new Date().toISOString()
        }
      })
      const reviewQueue = nextWeakItem
        ? prev.reviewQueue.some(item => item.id === nextWeakItem.id)
          ? prev.reviewQueue.map(item => item.id === nextWeakItem.id ? nextWeakItem : item)
          : [...prev.reviewQueue, nextWeakItem]
        : prev.reviewQueue
      return { ...prev, courses, reviewQueue }
    })
  }

  function markOutputStuck(item) {
    let promptCn = item.prompt || item.scenario || t('weakStuck')
    let answerEn = item.sample || ''
    if (item.type === 'rolePlay') {
      promptCn = item.scenario || t('rolePlay')
      answerEn = (item.lines || []).map(line => `${line.speaker ? `${line.speaker}: ` : ''}${line.en}`).join(' / ')
    }
    if (!answerEn) answerEn = promptCn
    upsertWeakReviewItem({
      promptCn,
      answerEn,
      source: 'Output',
      status: 'stuck'
    })
    recordStudy('output', { activityKind: 'weak', minProgress: 80 })
    setMessage(t('addedStuck'))
  }

  function nextOutputItem() {
    if (!outputPool.length) return
    recordStudy('output', { activityKind: 'output', minProgress: 80 })
    if (activeIndex >= outputPool.length - 1) {
      setReviewMode(dueReview.length ? 'today' : weakReview.length ? 'weak' : 'today')
      setActiveIndex(0)
      setAnswerShown(false)
      maybeResetViewportForTabSwitch()
      setTab('review')
      setMessage(t('outputDoneMessage'))
      return
    }
    setActiveIndex(activeIndex + 1)
  }

  function finishPracticeAndOpenSpeak() {
    if (!activeCourse) return
    recordStudy('practice', { activityKind: 'practice', minProgress: 60 })
    setOutputMode('guided')
    setActiveIndex(0)
    setAnswerShown(false)
    setTyped('')
    maybeResetViewportForTabSwitch()
    setTab('output')
    setMessage(t('practiceDoneMessage'))
  }

  function nextPracticeItem() {
    if (!practicePool.length) return
    if (activeIndex >= practicePool.length - 1) {
      finishPracticeAndOpenSpeak()
      return
    }
    recordStudy('practice', { activityKind: 'practice', minProgress: 55 })
    setActiveIndex(activeIndex + 1)
    setAnswerShown(false)
    setTyped('')
  }

  function finishListenAndOpenSpeak() {
    if (!activeCourse) return
    recordStudy('learn', { minProgress: 35 })
    const nextTab = !isPhoneView && practicePool.length ? 'practice' : 'output'
    if (nextTab === 'output') setOutputMode('guided')
    setActiveIndex(0)
    setAnswerShown(false)
    setTyped('')
    maybeResetViewportForTabSwitch()
    setTab(nextTab)
    setMessage(nextTab === 'practice' ? t('listenDonePracticeMessage') : t('listenDoneMessage'))
  }

  function finishSpeakAndOpenReview() {
    if (!activeCourse) return
    recordStudy('output', { activityKind: 'output', minProgress: 80 })
    setReviewMode(dueReview.length ? 'today' : weakReview.length ? 'weak' : 'today')
    setActiveIndex(0)
    setAnswerShown(false)
    maybeResetViewportForTabSwitch()
    setTab('review')
    setMessage(dueReview.length || weakReview.length ? t('outputDoneMessage') : t('noReviewAfterSpeak'))
  }

  function exportCurrentUserData() {
    const activeProfile = userProfiles.find(user => user.id === activeUserId)
    const payload = {
      app: 'Kevin English Learning System',
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      user: { id: activeUserId, name: activeProfile?.name || activeUserId },
      store
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kevin-english-${activeUserId}-${localDayKey()}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setMessage(t('exportReady'))
  }

  function importCurrentUserData(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || '{}'))
        const importedStore = payload.store || payload
        setStore(normalizeStore(importedStore))
        setActiveIndex(0)
        setAnswerShown(false)
        setTyped('')
        setMessage(t('importDone'))
      } catch {
        setMessage(t('importFailed'))
      } finally {
        if (backupFileRef.current) backupFileRef.current.value = ''
      }
    }
    reader.onerror = () => setMessage(t('importFailed'))
    reader.readAsText(file)
  }

  function displayLine(line) {
    if (settings.displayMode === 'en') return <span>{line.en}</span>
    if (settings.displayMode === 'cn') return <span>{line.cn || line.en}</span>
    if (settings.displayMode === 'hide') return <span className="hiddenText">{line.cn || 'Hidden English'}</span>
    return <>
      <span>{line.en}</span>
      {line.cn && <small>{line.cn}</small>}
    </>
  }

  function sentenceDisplayNumber(index) {
    return String(index + 1).padStart(2, '0')
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function waitForAudio(audio, endTime = null) {
    return new Promise(resolve => {
      let done = false
      const finish = () => {
        if (done) return
        done = true
        audio.ontimeupdate = null
        audio.onended = null
        resolve()
      }
      if (typeof endTime === 'number') {
        audio.ontimeupdate = () => {
          if (audio.currentTime >= endTime) {
            audio.pause()
            finish()
          }
        }
      }
      audio.onended = finish
    })
  }

  async function playUrlAndWait(url, startTime = null, endTime = null) {
    if (!url) return
    stopAudio()
    const audio = new Audio(url)
    audioRef.current = audio
    audio.playbackRate = Number(settings.playbackSpeed) || 1
    if (typeof startTime === 'number') audio.currentTime = startTime
    const waiting = waitForAudio(audio, endTime)
    await audio.play()
    await waiting
  }

  async function playLineRepeated(line, repeatCount = 3) {
    const count = Math.max(1, Number(repeatCount) || 1)
    const pause = pauseDurationMsForLine(line)
    try {
      if (activeCourse.audioMode === 'original' && !activeCourse.uploadedAudioUrl) {
        setMessage('Original audio is required for this textbook course. Upload the textbook audio in Audio Import; the app will not replace it with TTS.')
        return
      }
      for (let index = 0; index < count; index += 1) {
        if (activeCourse.audioMode === 'original' && activeCourse.uploadedAudioUrl && typeof line.startTime === 'number') {
          await playUrlAndWait(await resolveOriginalAudioUrl(activeCourse.uploadedAudioUrl), line.startTime, line.endTime)
        } else if (activeCourse.audioMode === 'original' && activeCourse.uploadedAudioUrl) {
          await playUrlAndWait(await resolveOriginalAudioUrl(activeCourse.uploadedAudioUrl))
        } else {
          await playUrlAndWait(await getTtsUrl(line.en, line.speaker))
        }
        if (pause && index < count - 1) await wait(pause)
      }
      recordStudy('learn', { minProgress: 20 })
    } catch (error) {
      setMessage(error?.message || 'Audio playback failed.')
    }
  }

  function startSentenceSwipe(line, event) {
    if (!isPhoneView) return
    const point = event.touches?.[0]
    if (!point) return
    swipeStartRef.current = { id: line.id, x: point.clientX, y: point.clientY }
  }

  function endSentenceSwipe(line, event) {
    if (!isPhoneView || swipeStartRef.current.id !== line.id) return
    const point = event.changedTouches?.[0]
    if (!point) return
    const dx = point.clientX - swipeStartRef.current.x
    const dy = point.clientY - swipeStartRef.current.y
    if (Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      setSwipedLineId(dx < 0 ? line.id : '')
    }
  }

  function saveTranscriptLine(line) {
    addTextToReview({ en: line.en, cn: line.cn, type: 'usefulSentence', source: 'Transcript' })
    setSwipedLineId('')
  }

  function openTranscriptLineTools(line, index) {
    setActiveIndex(index)
    if (isPhoneView) {
      setUnderstandLineId(line.id)
      setSwipedLineId('')
      return
    }
    setEditingLineId(line.id)
    setLineMoreId(lineMoreId === line.id ? '' : line.id)
  }

  function buildUnderstandUnits(line) {
    const en = String(line?.en || '').trim()
    const cn = String(line?.cn || '').trim()
    if (!en) return { units: [], keywords: [], chunks: [] }
    const roughUnits = en
      .replace(/\s+(and|but|because|so|when|if|that)\s+/gi, ' | $1 ')
      .split(/\s*[,.!?;:]\s*|\s+\|\s+/)
      .map(part => part.trim())
      .filter(Boolean)
    const units = (roughUnits.length > 1 ? roughUnits : en.split(/\s+(?=(?:and|but|because|when|if)\b)/i))
      .map((part, index) => ({ id: `${line.id}_unit_${index}`, en: part.trim(), cn: index === 0 ? cn : '' }))
      .filter(item => item.en)
    const words = en
      .toLowerCase()
      .replace(/[^\w\s'-]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 4 && !['there', 'their', 'about', 'because', 'people', 'really'].includes(word))
    const keywords = [...new Set(words)].slice(0, 5).map((word, index) => ({ id: `${line.id}_kw_${index}`, en: word, cn: '' }))
    const chunkMatches = [
      /people from all over the world/i,
      /for me/i,
      /one thing i really like/i,
      /i(?:’|'|)d like to [\w\s]+/i,
      /i have a [\w\s]+/i,
      /do you like [\w\s]+/i
    ]
    const chunks = chunkMatches
      .map(pattern => en.match(pattern)?.[0])
      .filter(Boolean)
      .map((chunk, index) => ({ id: `${line.id}_chunk_${index}`, en: chunk, cn: '' }))
    return { units, keywords, chunks }
  }

  function addLanguageToPractice(item) {
    if (!activeCourse) return
    const nextItem = {
      id: uid('quick'),
      type: 'quickResponse',
      promptCn: item.cn || `Use: ${item.en}`,
      hint: languageTypeLabel(item.type),
      answerEn: item.en
    }
    updateActiveCourse(course => ({
      ...course,
      practiceItems: [...(course.practiceItems || []), nextItem]
    }))
    setMessage(`${item.en} added to Practice.`)
  }

  function addTextToReview(payload) {
    if (!activeCourse || !payload?.en) return
    const answerEn = String(payload.en || '').trim()
    const promptCn = String(payload.cn || payload.promptCn || 'Recall this expression').trim()
    updateStore(prev => {
      let savedItem = null
      const courses = prev.courses.map(course => {
        if (course.id !== activeCourse.id) return course
        const reviewItems = course.reviewItems || []
        const existing = reviewItems.find(item =>
          String(item.answerEn || '').trim().toLowerCase() === answerEn.toLowerCase()
        )
        savedItem = {
          ...(existing || {}),
          id: existing?.id || uid('review'),
          courseId: course.id,
          type: payload.type || existing?.type || 'usefulSentence',
          promptCn,
          answerEn,
          source: payload.source || existing?.source || 'Saved',
          nextReviewAt: Date.now(),
          level: existing?.level || 0,
          status: existing?.status || 'new'
        }
        return {
          ...course,
          reviewItems: existing
            ? reviewItems.map(item => item.id === existing.id ? savedItem : item)
            : [...reviewItems, savedItem],
          updatedAt: new Date().toISOString()
        }
      })
      const reviewQueue = savedItem
        ? prev.reviewQueue.some(item => item.id === savedItem.id)
          ? prev.reviewQueue.map(item => item.id === savedItem.id ? savedItem : item)
          : [...prev.reviewQueue, savedItem]
        : prev.reviewQueue
      return { ...prev, courses, reviewQueue }
    })
    setMessage(t('savedReview'))
  }

  function addLanguageToReview(item) {
    addTextToReview({
      en: item.en,
      cn: item.cn,
      type: item.type,
      source: 'Language Preview'
    })
  }

  function renderLanguageItem(item) {
    const isPattern = item.type === 'pattern'
    const examples = isPattern ? (item.autoSentences || []) : (item.examples || [])
    return <article className="expressionCard" key={item.id}>
      <div className="expressionMeta">
        <span className={`typePill ${item.type}`}>{languageGroupLabel(item.type)}</span>
        {item.cn && <small>{item.cn}</small>}
      </div>
      <button className="expressionMain" onClick={() => playText(item.en)}>
        <span className="playDot" aria-hidden="true"></span>
        <strong>{item.en}</strong>
      </button>
      <div className="miniActionRow">
        <button className="iconButton" onClick={() => addLanguageToPractice(item)}>{t('addPractice')}</button>
        <button className="iconButton starButton" title={t('addReview')} onClick={() => addLanguageToReview(item)}>⭐</button>
      </div>
      {item.note && <p className="expressionNote">{item.note}</p>}
      {examples.length > 0 && <div className="exampleList">
        <h4>{isPattern ? t('automationExamples') : t('examples')}</h4>
        {examples.map((example, index) => <div className="exampleRow" key={`${example.en}-${index}`}>
          <button className="exampleText" onClick={() => playText(example.en)}>
            <span className="miniPlayDot" aria-hidden="true"></span>
            <span>{example.en}</span>
            {example.cn && <small>{example.cn}</small>}
          </button>
          <div className="exampleActions">
            <em>{example.origin === 'original' ? t('originalLine') : t('dailyLine')}</em>
            <button title={t('saveReview')} onClick={() => addTextToReview({ en: example.en, cn: example.cn, type: item.type, source: example.origin === 'original' ? 'Original Example' : 'Daily Example' })}>⭐</button>
          </div>
        </div>)}
      </div>}
    </article>
  }

  const sourceLabel = sourceType => t(`source.${sourceType}`)
  const audioLabel = audioMode => t(`audio.${audioMode}`)
  const listenLabel = course => course?.sourceType === 'textbookCourse' ? t('listen.textbook') : t('listen.generated')
  const languageGroupLabel = type => {
    if (type === 'keyword') return uiLanguage === 'zh' ? '关键词汇' : 'Keywords'
    if (type === 'chunk') return t('chunks')
    if (type === 'pattern') return uiLanguage === 'zh' ? '核心句型' : 'Patterns'
    return t('usefulSentences')
  }
  const reviewLabel = label => {
    if (label === 'Chunks') return t('chunks')
    if (label === 'Useful Sentences') return t('usefulSentences')
    if (label === 'Weak / Stuck') return t('weakStuck')
    return t('todayReview')
  }
  const stageLabel = stage => t(`stage.${stage || 'learn'}`)
  const resumeStage = activeCourse?.lastStage || 'learn'
  const visibleNavItems = NAV_ITEMS.filter(item => isPhoneView ? item.showOnPhone : item.showOnMac)
  const pageTitleKey = tab === 'learn'
    ? (isPhoneView ? 'title.listen' : 'title.study')
    : tab === 'output'
      ? (isPhoneView ? 'title.speak' : 'title.output')
      : `title.${tab}`
  const platformModeTitle = isPhoneView ? t('dailyTrainer') : t('studyWorkspace')
  const platformModeHint = isPhoneView ? t('iphoneHint') : t('macbookHint')
  const linkedKevinCourse = activeCourse
    ? store.courses.find(course => course.linkedCourseId === activeCourse.id && course.audioMode === 'generated' && /Kevin Melbourne Version|AI_REWRITE_PACK|Kevin Melbourne Rewrite/i.test(`${course.title} ${course.packType || ''} ${course.category || ''}`))
    : null
  const rewriteDraft = useMemo(() => activeCourse?.sourceType === 'textbookCourse' && activeCourse?.audioMode === 'original'
    ? buildKevinRewriteDraft(activeCourse)
    : null, [activeCourse])
  const loopComplete = !!activeCourse && activeCourse.lastStage === 'review' && (activeCourse.progress || 0) >= 100
  const flowStageOrder = ['learn', 'practice', 'output', 'review']
  const currentFlowIndex = Math.max(0, flowStageOrder.indexOf(activeCourse?.lastStage || 'learn'))
  const macFlowSteps = [
    { id: 'learn', label: t('flowStep.listen'), detail: `${activeCourse?.transcriptLines?.length || 0} ${t('lines')}` },
    { id: 'practice', label: t('flowStep.practice'), detail: `${activeCourse?.practiceItems?.length || 0} ${t('practiceTasks')}` },
    { id: 'output', label: t('flowStep.speak'), detail: `${activeCourse?.outputTasks?.length || 0} ${t('speakTasks')}` },
    { id: 'review', label: t('flowStep.review'), detail: `${dueReview.length} ${t('dueReview')}` }
  ].map((step, index) => ({
    ...step,
    state: loopComplete
      ? 'done'
      : (activeCourse?.lastStage || 'learn') === step.id
      ? 'current'
      : index < currentFlowIndex || (step.id === 'learn' && (activeCourse?.progress || 0) >= 25) || (step.id === 'practice' && (activeCourse?.progress || 0) >= 55) || (step.id === 'output' && (activeCourse?.progress || 0) >= 80) || (step.id === 'review' && (activeCourse?.progress || 0) >= 90)
        ? 'done'
        : index === currentFlowIndex + 1
          ? 'next'
          : 'ready'
  }))

  function goToTab(nextTab, options = {}) {
    const routedTab = resolveVisibleTab(nextTab)
    if (routedTab === tab) return
    stopAudio()
    maybeResetViewportForTabSwitch()
    setTab(routedTab)
    if (routedTab === 'library') {
      setLibraryMode('list')
      setLibrarySubtab('courses')
    }
    if (routedTab === 'learn') setLearnSubtab('audio')
    if (routedTab === 'practice') setActiveIndex(0)
    if (routedTab === 'output') {
      const nextOutputMode = normalizeOutputMode(options.outputMode || 'guided')
      save(OUTPUT_MODE_KEY, nextOutputMode)
      setOutputMode(nextOutputMode)
    }
    if (answerShown) setAnswerShown(false)
    if (typed) setTyped('')
  }

  function openOutputMode(nextMode = 'guided') {
    const safeMode = normalizeOutputMode(nextMode)
    stopAudio()
    maybeResetViewportForTabSwitch()
    save(OUTPUT_MODE_KEY, safeMode)
    setOutputMode(safeMode)
    setActiveIndex(0)
    if (answerShown) setAnswerShown(false)
    if (typed) setTyped('')
    setTab('output')
    window.setTimeout(() => setOutputMode(safeMode), 0)
  }

  function addAndOpenRewriteCourse(course) {
    stopAudio()
    maybeResetViewportForTabSwitch()
    updateStore(prev => ({
      ...prev,
      activeCourseId: course.id,
      courses: [course, ...prev.courses],
      reviewQueue: [...prev.reviewQueue, ...(course.reviewItems || [])]
    }))
    setOutputMode('rolePlay')
    setActiveIndex(0)
    setAnswerShown(false)
    setTab('output')
    window.setTimeout(() => setTab('output'), 0)
  }

  async function requestAiRewriteDraft(course) {
    const response = await fetch('/api/openai-rewrite-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.apiKey ? { 'x-openai-key': settings.apiKey } : {})
      },
      body: JSON.stringify({
        apiKey: settings.apiKey,
        title: course.title,
        level: course.level,
        userName: activeUserId === 'mandy' ? 'Mandy' : 'Kevin',
        lines: (course.transcriptLines || []).slice(0, 12).map(line => ({ id: line.id, speaker: line.speaker, en: line.en, cn: line.cn }))
      })
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }

  async function openGeneratedKevinVersion() {
    if (linkedKevinCourse) {
      selectCourse(linkedKevinCourse.id, 'output')
      setOutputMode('rolePlay')
      return
    }
    if (!activeCourse) return
    setRewriteLoading(true)
    try {
      const aiDraft = await requestAiRewriteDraft(activeCourse)
      addAndOpenRewriteCourse(buildKevinRewriteCourse(activeCourse, aiDraft))
      setMessage(t('rewriteSaved'))
    } catch {
      addAndOpenRewriteCourse(buildKevinRewriteCourse(activeCourse))
      setMessage(t('rewriteFallback'))
    } finally {
      setRewriteLoading(false)
    }
  }

  function localFreeTalkReply({ item, level, userText }) {
    const clean = String(userText || '').trim()
    const keyword = item?.keywords?.[0] || 'help'
    const reply = !clean
      ? 'Try one simple sentence.'
      : level === 'A2'
        ? 'Good. What do you need next?'
        : level === 'B1'
          ? 'That sounds clear. What would you ask next?'
          : 'That sounds natural. Add one small detail now.'
    return {
      reply,
      hint: level === 'A2'
        ? `Use: I need ${keyword}.`
        : `Stay in the scene and use ${keyword}.`,
      feedback: t('freeTalkFallback'),
      suggestedReview: item?.sample || reply,
      fallback: true
    }
  }

  async function requestFreeTalkReply({ item, level, messages, userText }) {
    try {
      const response = await fetch('/api/openai-free-talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(settings.apiKey ? { 'x-openai-key': settings.apiKey } : {})
        },
        body: JSON.stringify({
          apiKey: settings.apiKey,
          userName: activeProfile?.name || 'Kevin',
          level,
          scenario: item?.prompt || '',
          keywords: item?.keywords || [],
          history: messages || [],
          userText
        })
      })
      if (!response.ok) throw new Error(await response.text())
      const data = await response.json()
      if (!data.reply) throw new Error('Free Talk reply is empty.')
      return data
    } catch {
      return localFreeTalkReply({ item, level, userText })
    }
  }

  const currentPractice = practicePool[activeIndex] || practicePool[0]
  const currentOutput = outputPool[activeIndex] || outputPool[0]
  const currentReview = reviewPool[activeIndex] || reviewPool[0]
  const currentAudioLineIndex = activeCourse?.transcriptLines?.length ? Math.min(activeIndex, activeCourse.transcriptLines.length - 1) : 0
  const currentAudioLine = activeCourse?.transcriptLines?.[currentAudioLineIndex] || activeCourse?.transcriptLines?.[0] || null
  const understandLine = activeCourse?.transcriptLines?.find(line => line.id === understandLineId) || currentAudioLine
  const understandData = understandLineId ? buildUnderstandUnits(understandLine) : null
  const currentFocusData = currentAudioLine ? buildUnderstandUnits(currentAudioLine) : null
  const currentLinePauseSeconds = currentAudioLine ? autoPauseSecondsForLine(currentAudioLine) : 3
  function lineHighlightPhrases(line) {
    if (!line) return []
    const sourceLine = String(line.en || '').trim().toLowerCase()
    const manualChunks = (activeCourse?.languageItems || [])
      .filter(item => item.type === 'chunk')
      .filter(item => String(item.sourceSentence || '').trim().toLowerCase() === sourceLine || sourceLine.includes(String(item.en || '').trim().toLowerCase()))
      .map(item => String(item.en || '').trim())
    const autoChunks = buildUnderstandUnits(line).chunks.map(item => item.en)
    return [...new Set([...manualChunks, ...autoChunks].filter(Boolean))].sort((a, b) => b.length - a.length)
  }

  function renderHighlightedLine(line) {
    const text = String(line?.en || '')
    const phrases = lineHighlightPhrases(line)
    if (!phrases.length) return text
    const escaped = phrases.map(escapeRegExp).join('|')
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
    return parts.map((part, index) => {
      const matched = phrases.some(phrase => phrase.toLowerCase() === part.toLowerCase())
      return matched ? <mark key={`${part}-${index}`}>{part}</mark> : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    })
  }

  function renderMacFlowPanel(extraClass = '') {
    if (isPhoneView || !activeCourse) return null
    return <div className={`macFlowPanel ${extraClass}`}>
      <div>
        <strong>{t('macFlowTitle')}</strong>
        <span>{t('macFlowHint')}</span>
      </div>
      <div className="macFlowSteps">
        {macFlowSteps.map(step => <button key={step.id} className={`flowStep ${step.state}`} onClick={() => openCourseStage(activeCourse.id, step.id)}>
          <em>{t(`flowState.${step.state}`)}</em>
          <strong>{step.label}</strong>
          <span>{step.detail}</span>
        </button>)}
      </div>
    </div>
  }

  function renderMacCommandCenter() {
    if (isPhoneView || !activeCourse) return null
    const currentStep = loopComplete ? macFlowSteps[0] : macFlowSteps.find(step => step.id === resumeStage) || macFlowSteps[0]
    const reviewCount = activeCourse.reviewItems?.length || 0
    return <div className="macCommandCenter" data-testid="mac-command-center">
      <section className="macCommandMain">
        <span>{t('macCommandTitle')}</span>
        <h2>{activeCourse.title}</h2>
        <p>{loopComplete ? t('todayCompleteBody') : t('macCommandBody')}</p>
        <div className="macCommandActions">
          <button className="primary" onClick={() => loopComplete ? startNextLoop(activeCourse.id) : openCourseStage(activeCourse.id, currentStep.id)}>{loopComplete ? t('nextLoop') : `${t('openCurrentStep')}: ${currentStep.label}`}</button>
          <button className="secondary" onClick={() => goToTab('library')}>{t('manageLibrary')}</button>
          {!!dueReview.length && <button className="secondary" onClick={() => { setReviewMode('today'); openCourseStage(activeCourse.id, 'review') }}>{t('clearReviewFirst')}</button>}
        </div>
      </section>
      <section className="macCommandMetrics">
        <div>
          <small>{t('recommendedNext')}</small>
          <strong>{currentStep.label}</strong>
          <span>{currentStep.detail}</span>
        </div>
        <div>
          <small>{t('contentHealth')}</small>
          <strong>{activeCourse.status || 'Ready'}</strong>
          <span>{t('contentHealthBody', {
            lines: activeCourse.transcriptLines?.length || 0,
            tasks: activeCourse.outputTasks?.length || 0,
            reviews: reviewCount
          })}</span>
        </div>
        <div>
          <small>{t('reviewPressure')}</small>
          <strong>{dueReview.length}</strong>
          <span>{weakReview.length} {t('weakStuck')}</span>
        </div>
        <div>
          <small>{t('courseProgress')}</small>
          <strong>{activeCourse.progress || 0}%</strong>
          <span>{stageLabel(resumeStage)}</span>
        </div>
      </section>
    </div>
  }

  function renderMacStudyQueue() {
    if (isPhoneView || !activeCourse) return null
    const currentStep = loopComplete ? macFlowSteps[0] : macFlowSteps.find(step => step.id === resumeStage) || macFlowSteps[0]
    const reviewCount = dueReview.length
    return <div className="macStudyQueue">
      <div className="sectionTitleLine">
        <span>{t('studyQueueTitle')}</span>
        <strong>{t('studyQueueBody')}</strong>
      </div>
      <div className="macQueueGrid">
        <article className="macQueueTile current">
          <span>{t('queueCurrent')}</span>
          <strong>{activeCourse.title}</strong>
          <p>{t('queueCurrentBody')}</p>
          <div className="macQueueMeta">
            <em>{sourceLabel(activeCourse.sourceType)}</em>
            <em>{audioLabel(activeCourse.audioMode)}</em>
            <em>{stageLabel(resumeStage)}</em>
          </div>
          <button className="primary compact" onClick={() => loopComplete ? startNextLoop(activeCourse.id) : openCourseStage(activeCourse.id, currentStep.id)}>
            {loopComplete ? t('nextLoop') : t('queueOpenCurrent')}
          </button>
        </article>
        <article className="macQueueTile review">
          <span>{t('queueReview')}</span>
          <strong>{reviewCount}</strong>
          <p>{t('queueReviewBody')}</p>
          <div className="macQueueMeta">
            <em>{weakReview.length} {t('weakStuck')}</em>
            <em>{todayActivity.review} {t('reviewDone')}</em>
          </div>
          <button className="secondary compact" onClick={() => { setReviewMode(dueReview.length ? 'today' : 'weak'); openCourseStage(activeCourse.id, 'review') }}>
            {t('queueGoReview')}
          </button>
        </article>
        <article className="macQueueTile import">
          <span>{t('queueImport')}</span>
          <strong>{t('libraryImport')}</strong>
          <p>{t('queueImportBody')}</p>
          <div className="macQueueMeta">
            <em>{store.courses.length} {t('courses')}</em>
            <em>{activeCourse.sourceType === 'textbookCourse' ? t('originalAudioRule') : t('generatedAudioRule')}</em>
          </div>
          <button className="secondary compact" onClick={() => goToTab('library')}>
            {t('queueOpenLibrary')}
          </button>
        </article>
      </div>
    </div>
  }

  function renderMobileStageRail() {
    if (!isPhoneView || !activeCourse) return null
    const steps = [
      { id: 'learn', label: t('flowStep.listen'), hint: t('mobileStageHint.listen') },
      { id: 'output', label: t('flowStep.speak'), hint: t('mobileStageHint.speak') },
      { id: 'review', label: t('flowStep.review'), hint: t('mobileStageHint.review') }
    ]
    return <div className="mobileStageRail">
      {steps.map(step => {
        const flowStep = macFlowSteps.find(item => item.id === step.id)
        return <button key={step.id} className={`mobileStageStep ${flowStep?.state || 'ready'}`} onClick={() => openCourseStage(activeCourse.id, step.id)}>
          <em>{t(`flowState.${flowStep?.state || 'ready'}`)}</em>
          <strong>{step.label}</strong>
          <span>{step.hint}</span>
        </button>
      })}
    </div>
  }

  function renderTodayMission() {
    if (!activeCourse) {
      return <div className="todayMission emptyMission">
        <div className="missionIntro">
          <span>{t('todayHeroKicker')}</span>
          <h2>{t('missionCourseEmpty')}</h2>
          <p>{t('missionCourseEmptyBody')}</p>
        </div>
        {!isPhoneView && <button className="primary" onClick={() => goToTab('library')}>{t('importOnMac')}</button>}
      </div>
    }
    const missionSteps = [
      {
        id: 'learn',
        number: '01',
        title: t('pathListenTitle'),
        body: t('pathListenBody'),
        meta: `${activeCourse.transcriptLines?.length || 0} ${t('lines')}`,
        action: t('startListeningNow')
      },
      ...(!isPhoneView ? [{
        id: 'practice',
        number: '02',
        title: t('practiceTaskTitle'),
        body: t('practiceTaskBody'),
        meta: `${activeCourse.practiceItems?.length || 0} ${t('practiceTasks')}`,
        action: t('practiceAction')
      }] : []),
      {
        id: 'output',
        number: isPhoneView ? '02' : '03',
        title: t('pathSpeakTitle'),
        body: t('pathSpeakBody'),
        meta: `${activeCourse.outputTasks?.length || 0} ${t('speakTasks')}`,
        action: t('startSpeakingNow')
      },
      {
        id: 'review',
        number: isPhoneView ? '03' : '04',
        title: t('pathReviewTitle'),
        body: t('pathReviewBody'),
        meta: `${dueReview.length} ${t('dueReview')}`,
        action: t('startReview')
      }
    ]
    const currentStep = loopComplete ? missionSteps[0] : missionSteps.find(step => step.id === resumeStage) || (isPhoneView && resumeStage === 'practice' ? missionSteps.find(step => step.id === 'output') : missionSteps[0])
    const missionStageIds = isPhoneView ? ['learn', 'output', 'review'] : ['learn', 'practice', 'output', 'review']
    const remainingCount = loopComplete ? 0 : macFlowSteps.filter(step => missionStageIds.includes(step.id) && step.state !== 'done').length
    const currentStepTitle = currentStep?.title || t('continueCurrentStep')
    const statusLabel = state => {
      if (state === 'done') return t('missionDone')
      if (state === 'current') return t('missionCurrent')
      if (state === 'next') return t('missionNext')
      return t('missionReady')
    }
    if (isPhoneView) {
      const phoneStageIds = ['learn', 'output', 'review']
      const doneCount = loopComplete ? 3 : macFlowSteps.filter(step => phoneStageIds.includes(step.id) && step.state === 'done').length
      const phoneSteps = missionSteps.map(step => {
        const flowStep = macFlowSteps.find(item => item.id === step.id)
        return { ...step, state: flowStep?.state || 'ready', status: statusLabel(flowStep?.state || 'ready') }
      })
      return <div className="phoneTodayStack">
        <section className="phoneCourseCard">
          <div className="phoneCourseHead">
            <div>
              <span>{activeCourse.title}</span>
              <strong>{sourceLabel(activeCourse.sourceType)} · {activeCourse.goal || activeCourse.category}</strong>
            </div>
            <em>{doneCount}<small>/3</small></em>
          </div>
          <div className="phoneStageBars" aria-label={t('learningPathTitle')}>
            {phoneSteps.map(step => <button key={step.id} className={`phoneStageBar ${step.state}`} onClick={() => openCourseStage(activeCourse.id, step.id)}>
              <i />
              <strong>{step.title}</strong>
              <span>{step.status}</span>
            </button>)}
          </div>
          <button className="primary phoneMainAction" data-testid="continue-current-step" onClick={() => loopComplete ? startNextLoop(activeCourse.id) : openCourseStage(activeCourse.id, currentStep.id)}>
            {loopComplete ? t('nextLoop') : t('todayPrimaryAction', { step: currentStepTitle })}
          </button>
          <p className="phoneMainHint">{t('todayRemainingSteps', { count: remainingCount })}</p>
        </section>
      </div>
    }
    return <div className="todayMission">
      <div className="missionIntro">
        <span>{t('todayHeroKicker')}</span>
        <h2>{loopComplete ? t('todayCompleteTitle') : t('todayMissionTitle')}</h2>
        <p>{loopComplete ? t('todayCompleteBody') : t('todayMissionBody')}</p>
      </div>
      {loopComplete && <div className="completionPanel" data-testid="today-completion-panel">
        <div>
          <span>{t('todayCompleteBadge')}</span>
          <strong>{activeCourse.title}</strong>
          <p>{t('todayCompleteBody')}</p>
        </div>
        <button className="primary compact" data-testid="start-next-loop" onClick={() => startNextLoop(activeCourse.id)}>{t('nextLoop')}</button>
      </div>}
      <div className="missionCourseCard">
        <div>
          <small>{t('currentCourse')}</small>
          <strong>{activeCourse.title}</strong>
          <span>{sourceLabel(activeCourse.sourceType)} · {audioLabel(activeCourse.audioMode)} · {activeCourse.level}</span>
        </div>
        <button className="primary compact" data-testid="continue-current-step" onClick={() => loopComplete ? startNextLoop(activeCourse.id) : openCourseStage(activeCourse.id, currentStep.id)}>{loopComplete ? t('nextLoop') : t('todayPrimaryAction', { step: currentStepTitle })}</button>
      </div>
      <div className="missionSteps">
        {missionSteps.map(step => {
          const flowStep = macFlowSteps.find(item => item.id === step.id)
          const state = flowStep?.state || 'ready'
          return <button key={step.id} data-testid={`mission-${step.id}`} className={`missionStep ${state}`} onClick={() => openCourseStage(activeCourse.id, step.id)}>
            <em>{step.number}</em>
            <div>
              <span>{statusLabel(state)}</span>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
              <small>{step.meta}</small>
              <b>{t('enterStep')} {step.title}</b>
            </div>
          </button>
        })}
      </div>
      <div className="missionStats">
        <span>{t('todayMissionStats')}</span>
        <strong>{todayActivity.practice}</strong><em>{t('practiceDone')}</em>
        <strong>{todayActivity.output}</strong><em>{t('outputDone')}</em>
        <strong>{todayActivity.review}</strong><em>{t('reviewDone')}</em>
      </div>
      {!isPhoneView && <div className="missionTools">
        <small>{t('todayRemainingSteps', { count: remainingCount })}</small>
        <button className="secondary compact" onClick={() => setShowTodayDetails(value => !value)}>
          {showTodayDetails ? t('hideSecondaryPanels') : t('showSecondaryPanels')}
        </button>
      </div>}
    </div>
  }

  function renderLearningPathCards() {
    if (!activeCourse) return null
    const path = [
      { id: 'learn', number: '1', title: t('pathListenTitle'), body: t('pathListenBody'), meta: `${activeCourse.transcriptLines?.length || 0} ${t('lines')}` },
      { id: 'practice', number: '2', title: t('practiceTaskTitle'), body: t('practiceTaskBody'), meta: `${activeCourse.practiceItems?.length || 0} ${t('practiceTasks')}` },
      { id: 'output', number: '3', title: t('pathSpeakTitle'), body: t('pathSpeakBody'), meta: `${activeCourse.outputTasks?.length || 0} ${t('speakTasks')}` },
      { id: 'review', number: '4', title: t('pathReviewTitle'), body: t('pathReviewBody'), meta: `${dueReview.length} ${t('dueReview')}` }
    ]
    return <div className="learningPathPanel">
      <div className="sectionTitleLine">
        <span>{t('learningPathTitle')}</span>
        <strong>{activeCourse.title}</strong>
      </div>
      <div className="learningPathCards">
        {path.map(step => <button key={step.id} className={`pathCard ${resumeStage === step.id || activeCourse.lastStage === step.id ? 'current' : ''}`} onClick={() => openCourseStage(activeCourse.id, step.id)}>
          <em>{step.number}</em>
          <strong>{step.title}</strong>
          <span>{step.body}</span>
          <small>{step.meta}</small>
        </button>)}
      </div>
    </div>
  }

  function renderTaskHero(kind) {
    if (!activeCourse) return null
    const config = {
      listen: {
        step: isPhoneView ? '1 / 3' : '1 / 4',
        title: t('listenTaskTitle'),
        body: t('listenTaskBody'),
        primary: t('playLine'),
        secondary: t('finishListen'),
        onPrimary: () => currentAudioLine ? playLine(currentAudioLine) : playCourseMain(activeCourse),
        onSecondary: finishListenAndOpenSpeak
      },
      practice: {
        step: '2 / 4',
        title: t('practiceTaskTitle'),
        body: t('practiceTaskBody'),
        primary: answerShown
          ? activeIndex >= practicePool.length - 1 ? t('completeAndSpeak') : t('nextPracticeTask')
          : t('checkAnswer'),
        secondary: t('completeAndSpeak'),
        onPrimary: answerShown ? nextPracticeItem : () => setAnswerShown(true),
        onSecondary: finishPracticeAndOpenSpeak,
        secondaryDisabled: !answerShown
      },
      speak: {
        step: isPhoneView ? '2 / 3' : '3 / 4',
        title: t('speakTaskTitle'),
        body: t('speakTaskBody'),
        primary: outputMode === 'guided' ? t('guidedSpeaking') : outputMode === 'rolePlay' ? t('rolePlay') : t('retell'),
        secondary: t('completeAndReview'),
        onPrimary: () => currentOutput?.sample ? playText(currentOutput.sample) : setMessage(t('startPractice')),
        onSecondary: finishSpeakAndOpenReview
      },
      review: {
        step: isPhoneView ? '3 / 3' : '4 / 4',
        title: t('reviewTaskTitle'),
        body: t('reviewTaskBody'),
        primary: t('showAnswer'),
        secondary: t('startListeningNow'),
        onPrimary: () => setAnswerShown(true),
        onSecondary: () => openCourseStage(activeCourse.id, 'learn')
      }
    }[kind]
    if (!config) return null
    return <div className={`taskHero task-${kind}`}>
      <span>{t('pageTask')} · {config.step}</span>
      <h2>{config.title}</h2>
      <p>{config.body}</p>
      <div className="taskHeroActions">
        <button className="primary" data-testid={`task-${kind}-primary`} onClick={config.onPrimary} disabled={kind === 'review' && !currentReview}>{config.primary}</button>
        <button className="secondary" data-testid={`task-${kind}-next`} onClick={config.onSecondary} disabled={!!config.secondaryDisabled}>{config.secondary}</button>
      </div>
    </div>
  }

  function renderReviewEmpty() {
    return <div className="reviewEmptyPanel">
      <span>{reviewMode === 'today' ? t('todayReview') : reviewMode === 'weak' ? t('weakStuck') : reviewMode === 'chunks' ? t('chunks') : t('usefulSentences')}</span>
      <h2>{t('reviewEmptyTitle')}</h2>
      <p>{reviewMode === 'today' ? t('noReviewToday') : t('noReviewSection')} {t('reviewEmptyBody')}</p>
      <div className="reviewEmptyActions">
        <button className="primary" onClick={() => goToTab('today')}>{t('backToToday')}</button>
        <button className="secondary" onClick={() => activeCourse && openCourseStage(activeCourse.id, 'learn')}>{t('startListeningNow')}</button>
        <button className="secondary" onClick={() => activeCourse && openCourseStage(activeCourse.id, 'output')}>{t('startSpeakingNow')}</button>
        {!isPhoneView && <button className="secondary" onClick={() => goToTab('library')}>{t('manageLibrary')}</button>}
      </div>
    </div>
  }

  function renderSpeakRoundPanel() {
    if (!currentOutput) return null
    const total = outputPool.length || 1
    const isLast = activeIndex >= total - 1
    const modeLabel = outputMode === 'guided' ? t('guidedSpeaking') : outputMode === 'rolePlay' ? t('rolePlay') : t('retell')
    return <div className="speakRoundPanel">
      <div>
        <span>{t('speakRoundTitle')}</span>
        <strong>{modeLabel}</strong>
      </div>
      <p>{isLast ? t('speakRoundLast') : t('speakRoundBody', { current: Math.min(activeIndex + 1, total), total })}</p>
      <em>{Math.min(activeIndex + 1, total)} / {total}</em>
    </div>
  }

  function renderPracticeRoundPanel() {
    if (!currentPractice) return null
    const total = practicePool.length || 1
    const isLast = activeIndex >= total - 1
    return <div className="practiceRoundPanel">
      <div>
        <span>{t('practiceRoundTitle')}</span>
        <strong>{t(currentPractice.type) || t('practiceTasks')}</strong>
      </div>
      <p>{isLast ? t('practiceRoundLast') : t('practiceRoundBody', { current: Math.min(activeIndex + 1, total), total })}</p>
      <em>{Math.min(activeIndex + 1, total)} / {total}</em>
    </div>
  }

  function renderListenRoundPanel() {
    if (!isPhoneView || !currentAudioLine) return null
    const total = activeCourse?.transcriptLines?.length || 1
    const current = Math.min(currentAudioLineIndex + 1, total)
    const isLast = currentAudioLineIndex >= total - 1
    return <div className="listenRoundPanel" data-testid="listen-round-panel">
      <div>
        <span>{t('listenRoundTitle')}</span>
        <strong>{t('currentLine')} {sentenceDisplayNumber(currentAudioLineIndex)}</strong>
      </div>
      <p>{isLast ? t('listenRoundLast') : t('listenRoundBody', { current, total })}</p>
      <button className="primary compact" data-testid="listen-round-next" onClick={() => isLast ? finishListenAndOpenSpeak() : setActiveIndex(currentAudioLineIndex + 1)}>
        {isLast ? t('finishListen') : t('nextListenLine')}
      </button>
      <em>{current} / {total}</em>
    </div>
  }

  function renderImportSuccessBridge() {
    if (!importResult || tab !== 'learn') return null
    return <div className="importSuccessBridge" data-testid="import-success-bridge">
      <div>
        <span>{t('importSuccessTitle')}</span>
        <strong>{importResult.title}</strong>
        <p>{t('importSuccessBody')}</p>
      </div>
      <div className="importSuccessStats">
        <em>{importResult.learnItems || 0} {t('lines')}</em>
        <em>{importResult.speakItems || 0} {t('speakTasks')}</em>
        <em>{importResult.reviewItems || 0} {t('nav.review')}</em>
      </div>
      <div className="importSuccessActions">
        <button className="primary compact" onClick={() => { setImportResult(null); setActiveIndex(0); setLearnSubtab('audio') }}>{t('startFirstLine')}</button>
        <button className="secondary compact" onClick={() => { setImportResult(null); activeCourse && openCourseStage(activeCourse.id, 'output') }}>{t('startSpeakingNow')}</button>
        <button className="secondary compact" onClick={() => setImportResult(null)}>{t('close')}</button>
      </div>
    </div>
  }

  function renderReaderWorkspace() {
    const currentPracticeSentence = readerPracticeText || readerSentences[readerPracticeIndex] || readerSentences[0] || ''
    const result = readerPracticeResult()
    return <section className="readerShell" data-testid="kevin-australia-reader">
      <aside className="readerSidebar">
        <div className="readerBrand">
          <span>Kevin in Australia</span>
          <strong>Interactive Course Reader</strong>
          <small>Lessons and contents stay here. Import lives in Settings.</small>
          <button className="readerSettingsShortcut" onClick={() => setSettingsOpen(true)}>Import in Settings</button>
        </div>
        <div className="readerLessonList">
          <span>Lessons</span>
          {readerLessons.length ? readerLessons.map(lesson => <button key={lesson.id} className={activeReaderLesson?.id === lesson.id ? 'active' : ''} onClick={() => setReaderActiveId(lesson.id)}>
            <strong>{lesson.title}</strong>
            <small>{shortDateLabel(lesson.updatedAt || lesson.createdAt)}</small>
          </button>) : <p>No lessons yet.</p>}
        </div>
        {!!activeReaderParsed.contents.length && <div className="readerContents">
          <span>Contents</span>
          {activeReaderParsed.contents.map(item => <button key={item.id} className={`level-${Math.min(item.level, 4)}`} onClick={() => scrollToReaderSection(item.id)}>{item.text}</button>)}
        </div>}
      </aside>
      <article className="readerDocument">
        <div className="readerTopline">
          <div>
            <span>MacBook PWA</span>
            <h2>{activeReaderLesson?.title || 'Paste a Kevin in Australia lesson'}</h2>
            <p>Original Markdown-style ChatGPT lesson, with English-only audio layered on top.</p>
          </div>
          {activeReaderLesson && <button className="secondary compact weakAction" onClick={() => deleteReaderLesson(activeReaderLesson.id)}>Delete</button>}
        </div>
        <div className="readerControls" aria-label="Playback controls">
          <label>Speed<select value={readerSpeed} onChange={event => setReaderSpeed(Number(event.target.value))}>
            {[0.75, 0.9, 1, 1.15].map(speed => <option value={speed} key={speed}>{speed}x</option>)}
          </select></label>
          <label>Repeat<select value={readerRepeatCount} onChange={event => setReaderRepeatCount(Number(event.target.value))}>
            {[1, 2, 3, 5].map(count => <option value={count} key={count}>{count}x</option>)}
          </select></label>
          <label>Pause<select value={readerPauseSeconds} onChange={event => setReaderPauseSeconds(Number(event.target.value))}>
            {[1, 2.5, 4, 6].map(seconds => <option value={seconds} key={seconds}>{seconds.toFixed(1)}s</option>)}
          </select></label>
          <button className="secondary compact" onClick={() => playReaderLines(readerSentences)} disabled={!readerSentences.length || readerPlaying}>▶ All English</button>
          <button className="secondary compact" onClick={stopReaderPlayback} disabled={!readerPlaying}>Stop</button>
        </div>
        {activeReaderLesson ? <>
          <div className="readerPracticePanel" id="reader-spelling-practice">
            <div>
              <span>Spelling Practice</span>
              <strong>{currentPracticeSentence || 'Choose Spell beside any English line'}</strong>
            </div>
            <label><input type="checkbox" checked={readerPracticeReveal} onChange={event => setReaderPracticeReveal(event.target.checked)} /> Show model sentence</label>
            {currentPracticeSentence && <button className="secondary compact" onClick={() => playReaderText(currentPracticeSentence)}>▶ Sentence</button>}
            <button className="secondary compact" onClick={nextReaderPracticeSentence} disabled={!readerSentences.length}>Random</button>
            {readerPracticeReveal && currentPracticeSentence && <p>{currentPracticeSentence}</p>}
            <textarea value={readerPracticeInput} onChange={event => { setReaderPracticeInput(event.target.value); setReaderPracticeChecked(false) }} placeholder="Type the English sentence here..." />
            <div className="readerPracticeActions">
              <button className="primary compact" disabled={!currentPracticeSentence} onClick={() => setReaderPracticeChecked(true)}>Check</button>
              {result && <strong className={result === 'Correct' ? 'correct' : 'retry'}>{result}</strong>}
            </div>
          </div>
          <div className="readerBlocks">
            {activeReaderParsed.blocks.map((block, index) => <ReaderBlock
              key={`${block.type}-${index}`}
              block={block}
              index={index}
              onPlayText={playReaderText}
              onPlayLines={playReaderLines}
              onPracticeText={startReaderSpelling}
            />)}
          </div>
        </> : <div className="readerEmpty">
          <h2>Start with one full ChatGPT lesson.</h2>
          <p>Paste the complete Episode text on the left. Headings, tables, code blocks, Chinese explanation, role-play, writing and preview sections will render as a course handout.</p>
        </div>}
      </article>
    </section>
  }

  return <div className={`appShell platform-${isPhoneView ? 'phone' : 'mac'} tab-${tab} font-${settings.fontScale}`}>
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark">K</div>
        <div>
          <strong>Kevin English</strong>
          <span>MacBook + iPhone PWA</span>
        </div>
      </div>
      <div className="accountSwitcher" aria-label={t('account')}>
        <span>{t('account')}</span>
        <div>
          {userProfiles.map(user => <button key={user.id} className={activeUserId === user.id ? 'active' : ''} onClick={() => switchUser(user.id)}>{user.name}</button>)}
        </div>
      </div>
      <nav className="sideNav">
        {visibleNavItems.map(item => <button type="button" key={item.id} data-testid={`nav-${item.id}`} className={tab === item.id ? 'active' : ''} onClick={() => goToTab(item.id)}>
          <span>{t(isPhoneView ? (item.phoneLabelKey || item.labelKey) : item.labelKey)}</span>
          {isPhoneView && <small>{t(item.phoneHintKey || item.hintKey)}</small>}
        </button>)}
      </nav>
      {activeCourse && <div className="currentCourseMini">
        <span>{t('currentCourse')}</span>
        <strong>{activeCourse.title}</strong>
        <small>{sourceLabel(activeCourse.sourceType)} · {audioLabel(activeCourse.audioMode)}</small>
        <em>V{APP_VERSION}</em>
      </div>}
    </aside>

    <main className="mainArea">
      <header className="topBar">
        <div>
          <span className="eyebrow">{platformModeTitle} · {tab === 'library' ? t('libraryImport') : activeCourse ? activeCourse.category : 'English Learning System'}</span>
          <h1>{t(pageTitleKey)}</h1>
          <p className="platformHint">{platformModeHint}</p>
        </div>
        <div className="topBarActions">
          {!isPhoneView && tab !== 'library' && <button className="secondary compact" onClick={() => goToTab('library')}>{t('openLibrary')}</button>}
          <button className="settingsButton" onClick={() => setSettingsOpen(true)}>{t('settings')}</button>
        </div>
      </header>

      {message && <div className="messageBar">{message}</div>}
      {renderImportSuccessBridge()}

      {tab === 'reader' && renderReaderWorkspace()}

      {tab === 'today' && <section className="pageGrid">
        {isPhoneView && <div className="phoneGreeting">
          <span>{t('dailyTrainer')}</span>
          <h2>{t('mobileGreeting', { name: activeProfile?.name || 'Kevin' })}</h2>
          <p>{t('mobileGoal')}</p>
        </div>}
        {renderTodayMission()}
        {!isPhoneView && showTodayDetails && renderMacCommandCenter()}
        {!isPhoneView && showTodayDetails && renderMacStudyQueue()}
        {(!isPhoneView ? showTodayDetails : true) && <div className="heroPanel">
          <span>{t('continueLearning')}</span>
          <h2>{activeCourse?.title || t('chooseCourse')}</h2>
          <p>{activeCourse?.goal || t('firstCourseHint')}</p>
          {activeCourse && <div className="resumeMeta">
            <span>{activeCourse.lastStudiedAt ? t('lastStudied', { stage: stageLabel(resumeStage), date: shortDateLabel(activeCourse.lastStudiedAt) }) : t('notStartedYet')}</span>
          </div>}
          <div className="actionRow">
            <button className="primary" onClick={() => openCourseStage(activeCourse.id, resumeStage)} disabled={!activeCourse}>{t('resumeStage', { stage: stageLabel(resumeStage) })}</button>
            {!isPhoneView && <button className="secondary" onClick={() => goToTab('library')}>{t('openLibrary')}</button>}
          </div>
          <div className="sessionFlow">
            <button onClick={() => openCourseStage(activeCourse.id, 'learn')} disabled={!activeCourse}>
              <strong>{t('listenAction')}</strong>
              <span>{activeCourse?.transcriptLines?.length || 0} {t('lines')}</span>
            </button>
            {!isPhoneView && <button onClick={() => openCourseStage(activeCourse.id, 'practice')} disabled={!activeCourse}>
              <strong>{t('practiceAction')}</strong>
              <span>{activeCourse?.practiceItems?.length || 0} {t('practiceTasks')}</span>
            </button>}
            <button onClick={() => openCourseStage(activeCourse.id, 'output')} disabled={!activeCourse}>
              <strong>{t('speakAction')}</strong>
              <span>{activeCourse?.outputTasks?.length || 0} {t('speakTasks')}</span>
            </button>
            <button onClick={() => { setReviewMode(weakReview.length ? 'weak' : 'today'); openCourseStage(activeCourse.id, 'review') }} disabled={!activeCourse}>
              <strong>{t('reviewAction')}</strong>
              <span>{dueReview.length} {t('dueReview')}</span>
            </button>
          </div>
          {renderMobileStageRail()}
          {renderMacFlowPanel()}
        </div>}
        {(!isPhoneView ? showTodayDetails : true) && <div className="summaryGrid">
          <div><strong>{store.courses.length}</strong><span>{t('courses')}</span></div>
          <div><strong>{dueReview.length}</strong><span>{t('dueReview')}</span></div>
          <div><strong>{normalizeActivity(store.activity).streakDays}</strong><span>{t('studyStreak')} · {t('days')}</span></div>
        </div>}
        {(!isPhoneView ? showTodayDetails : true) && <div className="activityStrip">
          <span>{t('todayDone')}</span>
          <strong>{todayActivity.practice}</strong><em>{t('practiceDone')}</em>
          <strong>{todayActivity.output}</strong><em>{t('outputDone')}</em>
          <strong>{todayActivity.review}</strong><em>{t('reviewDone')}</em>
        </div>}
        {(!isPhoneView ? showTodayDetails : true) && <div className={`todayGrid ${isPhoneView ? 'phoneQuickGrid' : ''}`}>
          <article>
            <span>{t('todayPractice')}</span>
            <strong>{todayPractice[0]?.promptCn || todayPractice[0]?.base || t('quickResponse')}</strong>
            <p>{isPhoneView ? t('mobileQuickSpeak') : todayPractice.length ? t('practiceSuggested', { count: todayPractice.length }) : t('noPracticeQueued')}</p>
            <button className="secondary compact" onClick={() => goToTab(isPhoneView ? 'output' : 'practice')}>{t('startPractice')}</button>
          </article>
          <article>
            <span>{t('todayReview')}</span>
            <strong>{weakReview[0]?.promptCn || dueReview[0]?.promptCn || t('reviewMemory')}</strong>
            <p>{isPhoneView ? t('mobileQuickReview') : weakReview.length ? t('weakPriority', { count: weakReview.length }) : t('reviewReady', { count: dueReview.length })}</p>
            <button className="secondary compact" onClick={() => { setReviewMode(weakReview.length ? 'weak' : 'today'); goToTab('review') }}>{t('startReview')}</button>
          </article>
          {!isPhoneView && <article>
            <span>{t('libraryImport')}</span>
            <strong>{t('manageContent')}</strong>
            <p>{t('manageContentHint')}</p>
            <button className="secondary compact" onClick={() => { goToTab('library'); setLibrarySubtab('courses') }}>{t('openLibrary')}</button>
          </article>}
        </div>}
        {!isPhoneView && showTodayDetails && <div className="recentCoursesPanel">
          <div className="sectionTitleLine">
            <span>{t('recentCoursesTitle')}</span>
            <strong>{store.courses.length} {t('courses')}</strong>
          </div>
          <div className="courseStrip">
            {recentCourses.map(course => {
              const resumeStep = course.lastStage || 'learn'
              return <div className="courseStripItem" key={course.id}>
                <button className="courseStripMain" onClick={() => selectCourse(course.id, resumeStep)}>
                  <strong>{course.title}</strong>
                  <small>{sourceLabel(course.sourceType)} · {audioLabel(course.audioMode)} · {stageLabel(resumeStep)}</small>
                </button>
                <div className="courseStripActions">
                  <button className="secondary compact" onClick={() => selectCourse(course.id, 'learn')}>{t('listenAction')}</button>
                  <button className="secondary compact" onClick={() => selectCourse(course.id, 'practice')}>{t('practiceAction')}</button>
                  <button className="secondary compact" onClick={() => selectCourse(course.id, 'output')}>{t('speakAction')}</button>
                  <button className="secondary compact" onClick={() => { setReviewMode('today'); selectCourse(course.id, 'review') }}>{t('reviewAction')}</button>
                </div>
              </div>
            })}
          </div>
        </div>}
      </section>}

      {tab === 'library' && <section>
        {libraryMode === 'list' && <>
          <div className="libraryHeader">
            <div>
              <h2>{t('courseLibrary')}</h2>
              <p>{t('courseLibraryHint')}</p>
            </div>
            <button className="primary compact" onClick={() => setLibrarySubtab('import')}>{t('addContent')}</button>
          </div>
          <div className="subTabs">
            <button className={librarySubtab === 'courses' ? 'active' : ''} onClick={() => setLibrarySubtab('courses')}>{t('courses')}</button>
            <button className={librarySubtab === 'import' ? 'active' : ''} onClick={() => setLibrarySubtab('import')}>{t('import')}</button>
          </div>
          {librarySubtab === 'courses' && <div className="libraryGroups">
            {courseGroups.map(group => <section className="libraryGroup" key={group.id}>
              <div className="groupHeader">
                <h3>{group.id === 'textbookCourse' ? (uiLanguage === 'zh' ? '教材课程' : 'Textbook Courses') : group.id === 'realLifeExpansion' ? (uiLanguage === 'zh' ? '拓展训练包' : 'Expansion Packs') : (uiLanguage === 'zh' ? '自由主题包' : 'General Topic Packs')}</h3>
                <span>{group.courses.length}</span>
              </div>
              <div className="courseList">
                {group.courses.map(course => <CourseCard
                  key={course.id}
                  course={course}
                  linkedTitle={course.linkedCourseTitle || store.courses.find(row => row.id === course.linkedCourseId)?.title || ''}
                  onLearn={() => selectCourse(course.id, 'learn')}
                  onPractice={() => selectCourse(course.id, 'practice')}
                  t={t}
                  sourceLabel={sourceLabel}
                  audioLabel={audioLabel}
                  listenLabel={listenLabel}
                />)}
              </div>
            </section>)}
          </div>}
          {librarySubtab === 'import' && <>
            <div className="importFlowPanel">
              <div>
                <strong>{t('libraryFlowTitle')}</strong>
                <span>{t('libraryFlowHint')}</span>
              </div>
              <div>
                <em>1 {t('import')}</em>
                <em>2 {t('listenAction')}</em>
                <em>3 {t('practiceAction')}</em>
                <em>4 {t('speakAction')}</em>
                <em>5 {t('reviewAction')}</em>
              </div>
            </div>
            <div className="importChoice">
              <button data-testid="import-choice-audio" onClick={() => setLibraryMode('audioImport')}>
                <strong>{t('audioImport')}</strong>
                <span>{t('audioImportHint')}</span>
              </button>
              <button data-testid="import-choice-text" onClick={() => setLibraryMode('textImport')}>
                <strong>{t('textPackImport')}</strong>
                <span>{t('textPackImportHint')}</span>
              </button>
            </div>
          </>}
        </>}
        {libraryMode === 'import' && <div className="importChoice">
          <button data-testid="import-choice-audio" onClick={() => setLibraryMode('audioImport')}>
            <strong>{t('audioImport')}</strong>
            <span>{t('audioImportHint')}</span>
          </button>
          <button data-testid="import-choice-text" onClick={() => setLibraryMode('textImport')}>
            <strong>{t('textPackImport')}</strong>
            <span>{t('textPackImportHint')}</span>
          </button>
          <button className="secondary" onClick={() => setLibraryMode('list')}>{t('back')}</button>
        </div>}
        {libraryMode === 'audioImport' && <div className="importPanel">
          <div className="topActions"><button className="secondary compact" onClick={() => { setLibraryMode('list'); setLibrarySubtab('import') }}>{t('back')}</button><span>{t('textbookAudioMode')}</span></div>
          <ImportRouteGuide mode="audio" t={t} />
          <div className="modeNotice">
            <strong>{t('audioImportNoticeTitle')}</strong>
            <p>{t('audioImportNoticeBody')}</p>
          </div>
          <div className="formGrid">
            <label>{t('courseTitle')}<input value={audioForm.title} onChange={e => setAudioForm({ ...audioForm, title: e.target.value })} /></label>
            <label>{t('category')}<input value={audioForm.category} onChange={e => setAudioForm({ ...audioForm, category: e.target.value })} /></label>
            <label>{t('level')}<select value={audioForm.level} onChange={e => setAudioForm({ ...audioForm, level: e.target.value })}>{['A1', 'A2', 'A2+', 'B1', 'B1+', 'B2'].map(level => <option key={level}>{level}</option>)}</select></label>
          </div>
          <label className="fileDrop">{t('uploadTextbookAudio')}<input type="file" accept="audio/*" onChange={e => onAudioFile(e.target.files?.[0])} /></label>
          {audioForm.fileName && <div className="messageBar">{t('selectedAudio', { name: audioForm.fileName })}</div>}
          <div className="actionRow">
            <button className="secondary" disabled={!audioFileRef.current} onClick={transcribeAudioWithWhisper}>{t('smartProcess')}</button>
            <button className="secondary" disabled={!audioForm.transcript.trim()} onClick={() => setMessage(t('previewReady', { count: parseManualTranscript(audioForm.transcript).length }))}>{t('previewTranscript')}</button>
          </div>
          <div className="smartProcess">
            {[
              ['ready', 'Audio ready'],
              ['whisper', '1 Whisper words'],
              ['gpt', '2 GPT clean sentences'],
              ['align', '3 Align timestamps'],
              ['done', 'Ready to save']
            ].map(([id, label]) => <span key={id} className={audioForm.processStep === id ? 'active' : ''}>{label}</span>)}
          </div>
          <label>{t('transcriptLines')}<textarea value={audioForm.transcript} onChange={e => setAudioForm({ ...audioForm, transcript: e.target.value })} placeholder="[00:01.20-00:03.40] Staff: Hi. How are you? = 你好，今天怎么样？&#10;[00:03.50-00:05.10] Kevin: Good, thanks. = 挺好的，谢谢。&#10;&#10;If there is no timestamp, the app still creates Learn / Practice / Output / Review." /></label>
          {audioForm.transcript.trim() && <div className="previewBox">
            <strong>{parseManualTranscript(audioForm.transcript).length} subtitle lines detected</strong>
            <span>{countUnaligned(parseManualTranscript(audioForm.transcript))} unaligned lines. Save Audio Course will generate Language, Quick Response, Typing, Role-play/Retell, and Review items.</span>
          </div>}
          <div className="processSteps">
            <span>1 Upload original audio</span>
            <span>2 Whisper or paste transcript</span>
            <span>3 Generate training content</span>
            <span>4 Edit timestamps if needed</span>
          </div>
          <button className="primary" data-testid="confirm-audio-import" disabled={!audioFileRef.current || !audioForm.transcript.trim()} onClick={importAudioCourse}>{t('saveAudioCourse')}</button>
        </div>}
        {libraryMode === 'textImport' && <div className="importPanel">
          <div className="topActions"><button className="secondary compact" onClick={() => { setLibraryMode('list'); setLibrarySubtab('import') }}>{t('back')}</button><span>{t('textPackDemoImport')}</span></div>
          <ImportRouteGuide mode="generated" t={t} />
          <textarea value={textPack} onChange={e => setTextPack(e.target.value)} placeholder={t('textPackPlaceholder')} />
          {textPreview && <ImportPreview preview={textPreview} t={t} sourceLabel={sourceLabel} audioLabel={audioLabel} />}
          <button className="primary" data-testid="confirm-text-import" disabled={!textPreview} onClick={importTextPack}>{t('confirmImport')}</button>
        </div>}
      </section>}

      {tab === 'learn' && activeCourse && <section>
        <CourseHeader course={activeCourse} t={t} sourceLabel={sourceLabel} audioLabel={audioLabel} />
        {renderTaskHero('listen')}
        {renderListenRoundPanel()}
        {renderMacFlowPanel('compactFlow')}
        <div className="subTabs learnTabsPrimary">
          <button className={learnSubtab === 'audio' ? 'active' : ''} onClick={() => setLearnSubtab('audio')}>{t('listen')}</button>
          {!isPhoneView && <button className={showStudyTools || learnSubtab === 'notes' || learnSubtab === 'editor' ? 'active' : ''} onClick={() => {
            const nextOpen = !showStudyTools
            setShowStudyTools(nextOpen)
            if (nextOpen && !(learnSubtab === 'notes' || learnSubtab === 'editor' || learnSubtab === 'language')) setLearnSubtab('language')
            if (!nextOpen && (learnSubtab === 'notes' || learnSubtab === 'editor' || learnSubtab === 'language')) setLearnSubtab('audio')
          }}>
            {showStudyTools ? t('hideTools') : t('showTools')}
          </button>}
        </div>
        {!isPhoneView && showStudyTools && <div className="subTabs subTabsMinor">
          <button className={learnSubtab === 'language' ? 'active' : ''} onClick={() => setLearnSubtab('language')}>{t('languagePreview')}</button>
          <button className={learnSubtab === 'notes' ? 'active' : ''} onClick={() => setLearnSubtab('notes')}>{t('background')}</button>
          <button className={learnSubtab === 'editor' ? 'active' : ''} onClick={() => setLearnSubtab('editor')}>{t('lineEditor')}</button>
          <small>{t('advancedToolsHint')}</small>
        </div>}
        {learnSubtab === 'audio' && <div className="learnPlayer">
          <div className="playerCard">
            <button className="playCircle" onClick={() => playCourseMain(activeCourse)}>{t('play')}</button>
            <div>
              <h2>{listenLabel(activeCourse)}</h2>
              <p>{activeCourse.title} · {listenLabel(activeCourse)} · {audioLabel(activeCourse.audioMode)} · {activeCourse.level}</p>
              {activeCourse.linkedCourseTitle && <small>{t('linkedTo', { title: activeCourse.linkedCourseTitle })}</small>}
            </div>
            <button className="secondary compact" onClick={() => playCourseTranscript(activeCourse)}>{t('listenAll')}</button>
          </div>
          {!isPhoneView && activeCourse.sourceType === 'textbookCourse' && activeCourse.audioMode === 'original' && rewriteDraft?.pairs?.length > 0 && <div className="rewritePanel">
            <div className="topActions">
              <div>
                <h2>{t('rewriteTitle')}</h2>
                <p>{t('rewriteHint')}</p>
              </div>
              <button className="primary compact" onClick={openGeneratedKevinVersion} disabled={rewriteLoading}>{rewriteLoading ? t('generatingRewrite') : linkedKevinCourse ? t('openKevinVersion') : t('useKevinVersion')}</button>
            </div>
            <div className="rewriteCompareHeader">
              <span>{t('originalVersion')}</span>
              <span>{t('kevinVersion')}</span>
            </div>
            <div className="rewriteCompareList">
              {rewriteDraft.pairs.slice(0, 5).map((pair, index) => <div key={`${pair.original}-${index}`} className="rewriteCompareRow">
                <button onClick={() => {
                  const originalLine = activeCourse.transcriptLines.find(line => line.id === pair.originalLineId)
                  if (originalLine) playLine(originalLine)
                }}>{pair.original}</button>
                <button onClick={() => playText(pair.rewritten, 'Kevin')}>{pair.rewritten}</button>
              </div>)}
            </div>
          </div>}
          {currentAudioLine && <div className="focusPlayer">
            <div className="focusPlayerMeta">
              <div>
                <span>{t('focusMode')}</span>
                <strong>{t('currentLine')} {sentenceDisplayNumber(currentAudioLineIndex)}</strong>
              </div>
              <p>{t('focusHint')}</p>
            </div>
            <div className="focusPlayerMain">
              <button className="focusPlayButton" onClick={() => playLine(currentAudioLine)} aria-label={t('playLine')}>{t('play')}</button>
              <div className="focusTranscriptBlock">
                {currentAudioLine.speaker && <em className="speakerPill">{currentAudioLine.speaker}</em>}
                <button className="focusLineButton" onClick={() => playLineRepeated(currentAudioLine)}>
                  <span>{renderHighlightedLine(currentAudioLine)}</span>
                  {currentAudioLine.cn && <small>{currentAudioLine.cn}</small>}
                </button>
                {!!currentFocusData?.chunks?.length && <div className="focusChunkRow">
                  <label>{t('focusChunks')}</label>
                  <div>
                    {currentFocusData.chunks.map(item => <button key={item.id} onClick={() => playText(item.en)}>{item.en}</button>)}
                  </div>
                </div>}
              </div>
            </div>
            <div className={`focusNavRow ${isPhoneView ? 'phone' : ''}`}>
              <button className="secondary compact" disabled={currentAudioLineIndex <= 0} onClick={() => setActiveIndex(currentAudioLineIndex - 1)}>{t('prevLine')}</button>
              {!isPhoneView && <button className="secondary compact" onClick={() => setUnderstandLineId(currentAudioLine.id)}>{t('understand')}</button>}
              <button className="secondary compact" disabled={currentAudioLineIndex >= (activeCourse.transcriptLines?.length || 1) - 1} onClick={() => setActiveIndex(currentAudioLineIndex + 1)}>{t('nextLine')}</button>
            </div>
            {isPhoneView && <button className="focusUnderLink" onClick={() => setUnderstandLineId(currentAudioLine.id)}>{t('understand')}</button>}
          </div>}
          {currentAudioLine && <div className="listenToolPanel">
            <div className="toolCluster">
              <span>{t('repeatCount')}</span>
              <strong>3x</strong>
              <small>{t('lineTapLoopHint')}</small>
            </div>
            <div className="toolCluster">
              <span>{t('playbackSpeed')}</span>
              <div className="listenToolControls">
                {[0.75, 1, 1.25].map(speed => <button key={speed} className={settings.playbackSpeed === speed ? 'active' : ''} onClick={() => setPlaybackSpeed(speed)}>{speed}x</button>)}
              </div>
            </div>
            <div className="toolCluster pauseCluster">
              <span>{t('smartPause')}</span>
              <strong>{settings.pauseSeconds === 'auto' ? t('smartPauseStatus', { seconds: currentLinePauseSeconds }) : `${settings.pauseSeconds}s`}</strong>
              <small>{t('smartPauseHint')}</small>
            </div>
          </div>}
          {understandData && <div className="understandPanel">
            <div className="topActions">
              <div>
                <h2>{t('understand')}</h2>
                <p>{t('clickToPlay')}</p>
              </div>
              <button className="secondary compact" onClick={() => setUnderstandLineId('')}>{t('close')}</button>
            </div>
            <div className="understandGrid">
              <section>
                <h3>{t('meaningUnits')}</h3>
                {understandData.units.map(unit => <button key={unit.id} onClick={() => playText(unit.en)}><strong>{unit.en}</strong>{unit.cn && <small>{unit.cn}</small>}</button>)}
              </section>
              <section>
                <h3>{languageGroupLabel('keyword')}</h3>
                {understandData.keywords.map(item => <button key={item.id} onClick={() => playText(item.en)}>{item.en}</button>)}
              </section>
              <section>
                <h3>{t('chunks')}</h3>
                {understandData.chunks.length ? understandData.chunks.map(item => <button key={item.id} onClick={() => playText(item.en)}>{item.en}</button>) : <small>{t('noLanguageItems')}</small>}
              </section>
            </div>
          </div>}
          <div className="audioToolsFooter">
            <DisplaySwitch settings={settings} setSettings={setSettings} />
          </div>
          <div className="sentenceList">
            <div className="sentenceListHeader">
              <div>
                <span>{t('transcript')}</span>
                <strong>{t('followAlong')}</strong>
              </div>
            </div>
            {activeCourse.transcriptLines.map((line, index) => <React.Fragment key={line.id}>
              <div
                className={`sentenceRow ${line.aligned ? '' : 'needCheck'} ${currentAudioLine?.id === line.id ? 'activeLine' : ''} ${swipedLineId === line.id ? 'actionsOpen' : ''}`}
                onTouchStart={event => startSentenceSwipe(line, event)}
                onTouchEnd={event => endSentenceSwipe(line, event)}
              >
                <span className="lineNumber">{sentenceDisplayNumber(index)}</span>
                <button className="sentenceText sentencePlay" onClick={() => { if (swipedLineId && swipedLineId !== line.id) setSwipedLineId(''); setActiveIndex(index); playLineRepeated(line) }}>{displayLine(line)}</button>
                <div className="lineActions">
                  {!line.aligned && <em>{t('unaligned')}</em>}
                  <button className="starButton" title={t('saveReview')} aria-label={t('saveReview')} onClick={() => saveTranscriptLine(line)}>{isPhoneView ? t('saveShort') : t('starShort')}</button>
                  <button className="toolButton" title={isPhoneView ? t('toolShort') : t('lineMore')} aria-label={isPhoneView ? t('toolShort') : t('lineMore')} onClick={() => openTranscriptLineTools(line, index)}>{isPhoneView ? t('toolShort') : '🔧'}</button>
                </div>
              </div>
              {!isPhoneView && lineMoreId === line.id && <div className="lineMorePanel">
                <div className="topActions">
                  <div>
                    <span>{t('lineMore')}</span>
                    <h2>{line.en}</h2>
                  </div>
                  <button className="secondary compact" onClick={() => setLineMoreId('')}>{t('close')}</button>
                </div>
                <section className="controlSection">
                  <h3>{t('timing')}</h3>
                  <div className="timingGrid">
                    <div className="timingBox">
                      <span>{t('start')}</span>
                      <input value={line.startTime ?? ''} onChange={e => updateCourseLine(line.id, 'startTime', e.target.value)} placeholder="00:00" />
                      <div>
                        <button onClick={() => adjustCourseLineTime(line.id, 'startTime', -0.1)}>-100ms</button>
                        <button onClick={() => adjustCourseLineTime(line.id, 'startTime', 0.1)}>+100ms</button>
                      </div>
                    </div>
                    <div className="timingBox">
                      <span>{t('end')}</span>
                      <input value={line.endTime ?? ''} onChange={e => updateCourseLine(line.id, 'endTime', e.target.value)} placeholder="00:00" />
                      <div>
                        <button onClick={() => adjustCourseLineTime(line.id, 'endTime', -0.1)}>-100ms</button>
                        <button onClick={() => adjustCourseLineTime(line.id, 'endTime', 0.1)}>+100ms</button>
                      </div>
                    </div>
                  </div>
                  <div className="controlActionGrid">
                    <button className="primary" onClick={() => playLine(line)}>{t('playLine')}</button>
                    <button className="secondary" onClick={() => setMessage(t('timingSaved'))}>{t('saveTiming')}</button>
                  </div>
                </section>
                <section className="controlSection">
                  <h3>{t('structure')}</h3>
                  <div className="structureGrid">
                    <button onClick={() => setSplitLineId(splitLineId === line.id ? '' : line.id)}><strong>{t('splitHere')}</strong><small>{t('splitHint')}</small></button>
                    <button onClick={() => mergeTranscriptLineWithNext(line.id)}><strong>{t('mergeNext')}</strong><small>{activeCourse.transcriptLines[index + 1]?.en || ''}</small></button>
                  </div>
                  {splitLineId === line.id && <div className="splitWordPicker">
                    <p>{t('splitHint')}:</p>
                    <div>{String(line.en || '').trim().split(/\s+/).filter(Boolean).map((word, wordIndex, words) => <button key={`${word}-${wordIndex}`} disabled={wordIndex >= words.length - 1} onClick={() => splitTranscriptLineAtWord(line.id, wordIndex)}>{word}</button>)}</div>
                  </div>}
                </section>
                <section className="controlSection">
                  <h3>{t('text')}</h3>
                  <div className="editorTextGrid">
                    <label>{t('english')}<textarea value={line.en || ''} onChange={e => updateCourseLine(line.id, 'en', e.target.value)} /></label>
                    <label>{t('chinese')}<textarea value={line.cn || ''} onChange={e => updateCourseLine(line.id, 'cn', e.target.value)} /></label>
                  </div>
                </section>
                <section className="controlSection dangerSection">
                  <button className="secondary" onClick={() => setSettings({ ...settings, displayMode: 'cn' })}>{t('cnOnly')}</button>
                  <button className="secondary" onClick={() => setMessage(t('resetOriginalUnavailable'))}>{t('resetOriginal')}</button>
                  <button className="secondary weakAction" onClick={() => deleteTranscriptLine(line.id)}>{t('delete')}</button>
                </section>
              </div>}
            </React.Fragment>)}
          </div>
          <div className="nextStepBanner">
            <div>
              <strong>{t('finishListen')}</strong>
              <span>{activeCourse.outputTasks?.length || 0} {t('speakTasks')}</span>
            </div>
            <button className="primary compact" onClick={finishListenAndOpenSpeak}>{t('finishListen')}</button>
          </div>
        </div>}
        {learnSubtab === 'language' && <div className="languagePreview">
          {activeCourse.languageItems.length ? groupLanguageItems(activeCourse.languageItems).map(group => group.items.length ? <section className="languageGroup" key={group.type}>
            <div className="groupHeader">
              <h3>{languageGroupLabel(group.type)}</h3>
              <span>{group.items.length}</span>
            </div>
            <div className="expressionGrid">{group.items.map(renderLanguageItem)}</div>
          </section> : null) : <Empty text={t('noLanguageItems')} />}
        </div>}
        {learnSubtab === 'editor' && <div className="lineEditorPanel">
          <div className="topActions">
            <div>
              <h2>{t('lineEditorTitle')}</h2>
              <p>{t('lineEditorHint')}</p>
            </div>
            <button className="secondary compact" onClick={addTranscriptLine}>{t('addLine')}</button>
          </div>
          {selectedEditorLine && <div className="lineControlPanel">
            <div className="lineControlHeader">
              <div>
                <span>{t('lineLabel', { number: selectedEditorIndex + 1 }).toUpperCase()}</span>
                <input value={selectedEditorLine.speaker || ''} onChange={e => updateCourseLine(selectedEditorLine.id, 'speaker', e.target.value)} placeholder={t('speaker')} />
              </div>
              <div className="lineControlNav">
                <button disabled={selectedEditorIndex <= 0} onClick={() => { setEditingLineId(editorLines[selectedEditorIndex - 1]?.id || ''); setSplitLineId('') }}>{t('prevLine')}</button>
                <button disabled={selectedEditorIndex >= editorLines.length - 1} onClick={() => { setEditingLineId(editorLines[selectedEditorIndex + 1]?.id || ''); setSplitLineId('') }}>{t('nextLine')}</button>
                <button onClick={() => setLearnSubtab('audio')}>{t('back')}</button>
              </div>
            </div>
            <div className="linePreviewCard">
              <strong>{selectedEditorLine.en || t('english')}</strong>
              {selectedEditorLine.cn && <span>{selectedEditorLine.cn}</span>}
            </div>

            <section className="controlSection">
              <h3>{t('timing')}</h3>
              <div className="timingGrid">
                <div className="timingBox">
                  <span>{t('start')}</span>
                  <input value={selectedEditorLine.startTime ?? ''} onChange={e => updateCourseLine(selectedEditorLine.id, 'startTime', e.target.value)} placeholder="00:00" />
                  <div>
                    <button onClick={() => adjustCourseLineTime(selectedEditorLine.id, 'startTime', -0.1)}>-100ms</button>
                    <button onClick={() => adjustCourseLineTime(selectedEditorLine.id, 'startTime', 0.1)}>+100ms</button>
                  </div>
                </div>
                <div className="timingBox">
                  <span>{t('end')}</span>
                  <input value={selectedEditorLine.endTime ?? ''} onChange={e => updateCourseLine(selectedEditorLine.id, 'endTime', e.target.value)} placeholder="00:00" />
                  <div>
                    <button onClick={() => adjustCourseLineTime(selectedEditorLine.id, 'endTime', -0.1)}>-100ms</button>
                    <button onClick={() => adjustCourseLineTime(selectedEditorLine.id, 'endTime', 0.1)}>+100ms</button>
                  </div>
                </div>
              </div>
              <div className="controlActionGrid">
                <button className="primary" onClick={() => playLine(selectedEditorLine)}>{t('playLine')}</button>
                <button className="secondary" onClick={() => setMessage(t('timingSaved'))}>{t('saveTiming')}</button>
              </div>
            </section>

            <section className="controlSection">
              <h3>{t('structure')}</h3>
              <div className="structureGrid">
                <button onClick={() => setSplitLineId(splitLineId === selectedEditorLine.id ? '' : selectedEditorLine.id)}><strong>{t('splitHere')}</strong><small>{t('splitHint')}</small></button>
                <button onClick={() => mergeTranscriptLineWithNext(selectedEditorLine.id)}><strong>{t('mergeNext')}</strong><small>{selectedEditorIndex < editorLines.length - 1 ? editorLines[selectedEditorIndex + 1]?.en : ''}</small></button>
              </div>
              {splitLineId === selectedEditorLine.id && <div className="splitWordPicker">
                <p>{t('splitHint')}:</p>
                <div>{String(selectedEditorLine.en || '').trim().split(/\s+/).filter(Boolean).map((word, index, words) => <button key={`${word}-${index}`} disabled={index >= words.length - 1} onClick={() => splitTranscriptLineAtWord(selectedEditorLine.id, index)}>{word}</button>)}</div>
              </div>}
            </section>

            <section className="controlSection">
              <h3>{t('text')}</h3>
              <div className="editorTextGrid">
                <label>{t('english')}<textarea value={selectedEditorLine.en || ''} onChange={e => updateCourseLine(selectedEditorLine.id, 'en', e.target.value)} /></label>
                <label>{t('chinese')}<textarea value={selectedEditorLine.cn || ''} onChange={e => updateCourseLine(selectedEditorLine.id, 'cn', e.target.value)} /></label>
              </div>
            </section>

            <section className="controlSection dangerSection">
              <button className="secondary weakAction" onClick={() => deleteTranscriptLine(selectedEditorLine.id)}>{t('deleteLine')}</button>
            </section>
          </div>}
          <div className="editorLineList">
            {editorLines.map((line, index) => <button className={`editorLineItem ${selectedEditorLine?.id === line.id ? 'active' : ''}`} key={line.id} onClick={() => { setEditingLineId(line.id); setSplitLineId('') }}>
              <span>{index + 1}</span>
              <strong>{line.en || t('english')}</strong>
              <small>{line.speaker || t('speaker')} · {line.startTime ?? '--'} - {line.endTime ?? '--'}</small>
            </button>)}
          </div>
        </div>}
        {learnSubtab === 'notes' && <BackgroundPanel course={activeCourse} t={t} />}
      </section>}

      {tab === 'practice' && activeCourse && <section>
        <CourseHeader course={activeCourse} t={t} sourceLabel={sourceLabel} audioLabel={audioLabel} />
        {renderTaskHero('practice')}
        {renderMacFlowPanel('compactFlow')}
        {renderPracticeRoundPanel()}
        {currentPractice ? <PracticeCard
          item={currentPractice}
          index={Math.min(activeIndex + 1, Math.max(practicePool.length, 1))}
          total={Math.max(practicePool.length, 1)}
          typed={typed}
          setTyped={setTyped}
          answerShown={answerShown}
          setAnswerShown={setAnswerShown}
          playText={playText}
          onSaveReview={payload => addTextToReview({ ...payload, source: payload.source || 'Practice' })}
          onNext={nextPracticeItem}
          nextLabel={activeIndex >= practicePool.length - 1 ? t('completeAndSpeak') : t('nextPracticeTask')}
          t={t}
        /> : <Empty text={t('noPracticeTasks')} />}
        {currentPractice && <div className="nextStepBanner">
          <div>
            <strong>{activeIndex >= practicePool.length - 1 ? t('completeAndSpeak') : t('nextPracticeTask')}</strong>
            <span>{activeCourse.outputTasks?.length || 0} {t('speakTasks')}</span>
          </div>
          <button className="primary compact" onClick={activeIndex >= practicePool.length - 1 ? finishPracticeAndOpenSpeak : nextPracticeItem}>
            {activeIndex >= practicePool.length - 1 ? t('completeAndSpeak') : t('nextPracticeTask')}
          </button>
        </div>}
      </section>}

      {tab === 'output' && activeCourse && <section>
        <CourseHeader course={activeCourse} t={t} sourceLabel={sourceLabel} audioLabel={audioLabel} />
        {renderTaskHero('speak')}
        {renderMacFlowPanel('compactFlow')}
        <div className="subTabs outputModeTabs">
          <button className={outputMode === 'guided' ? 'active' : ''} onClick={() => { setOutputMode('guided'); setActiveIndex(0) }}>{t('guidedSpeaking')}</button>
          <button className={outputMode === 'rolePlay' ? 'active' : ''} onClick={() => { setOutputMode('rolePlay'); setActiveIndex(0) }}>{t('rolePlay')}</button>
          <button className={outputMode === 'retell' ? 'active' : ''} onClick={() => { setOutputMode('retell'); setActiveIndex(0) }}>{t('retell')}</button>
        </div>
        {renderSpeakRoundPanel()}
        <p className="modeHint">{outputMode === 'guided' ? t('guidedHint') : outputMode === 'rolePlay' ? t('rolePlayHint') : t('retellHint')}</p>
        {outputMode === 'retell' && <div className="speakConstraintBar">
          <span>{t('freeTalkLevel')}</span>
          <button className={freeTalkLevel === 'A2' ? 'active' : ''} onClick={() => setFreeTalkLevel('A2')}>{t('levelA2')}</button>
          <button className={freeTalkLevel === 'B1' ? 'active' : ''} onClick={() => setFreeTalkLevel('B1')}>{t('levelB1')}</button>
          <button className={freeTalkLevel === 'B2' ? 'active' : ''} onClick={() => setFreeTalkLevel('B2')}>{t('levelB2')}</button>
          <span>{freeTalkLevel === 'A2' ? (uiLanguage === 'zh' ? '每轮 1 句，最多 10 词' : '1 sentence, up to 10 words') : freeTalkLevel === 'B1' ? (uiLanguage === 'zh' ? '每轮 1-2 句，最多 15 词' : '1-2 sentences, up to 15 words') : (uiLanguage === 'zh' ? '每轮 2 句，允许更自然表达' : '2 sentences, more natural range')}</span>
          <span>{uiLanguage === 'zh' ? '仅限当前主题' : 'Stay in current topic'}</span>
        </div>}
        {currentOutput ? <OutputCard item={currentOutput} isPhoneView={isPhoneView} freeTalkLevel={freeTalkLevel} playText={playText} playList={playOutputLines} requestFreeTalkReply={requestFreeTalkReply} getPauseSeconds={autoPauseSecondsForLine} onSaveReview={payload => addTextToReview({ ...payload, source: payload.source || 'Output' })} onMarkStuck={() => markOutputStuck(currentOutput)} onNext={nextOutputItem} nextLabel={activeIndex >= outputPool.length - 1 ? t('completeAndReview') : t('nextSpeakingTask')} t={t} /> : <Empty text={t('noOutputTasks')} />}
        {currentOutput && <div className="nextStepBanner">
          <div>
            <strong>{activeIndex >= outputPool.length - 1 ? t('completeAndReview') : t('nextSpeakingTask')}</strong>
            <span>{dueReview.length} {t('dueReview')}</span>
          </div>
          <button className="primary compact" onClick={activeIndex >= outputPool.length - 1 ? finishSpeakAndOpenReview : nextOutputItem}>
            {activeIndex >= outputPool.length - 1 ? t('completeAndReview') : t('nextSpeakingTask')}
          </button>
        </div>}
      </section>}

      {tab === 'review' && <section>
        {renderTaskHero('review')}
        {renderMacFlowPanel('compactFlow')}
        {!!currentReview && <div className="reviewRoundPanel">
          <div>
            <span>{t('reviewRoundTitle')}</span>
            <strong>{reviewMode === 'today' ? t('todayReview') : reviewMode === 'weak' ? t('weakStuck') : reviewMode === 'chunks' ? t('chunks') : t('usefulSentences')}</strong>
          </div>
          <p>{activeIndex >= reviewPool.length - 1 ? t('reviewRoundDoneSoon') : t('reviewRoundBody', { remaining: Math.max(1, reviewPool.length - activeIndex) })}</p>
        </div>}
        {isPhoneView && currentReview && <div className="reviewFocusPanel" data-testid="review-focus-panel">
          <div>
            <span>{t('reviewFocusTitle')}</span>
            <strong>{t('cardProgress', { current: Math.min(activeIndex + 1, reviewPool.length || 1), total: reviewPool.length || 1 })}</strong>
          </div>
          <p>{t('reviewFocusBody')}</p>
        </div>}
        <div className="reviewBuckets">
          {Object.entries(reviewBuckets).map(([label, count]) => <div key={label}><strong>{count}</strong><span>{reviewLabel(label)}</span></div>)}
        </div>
        <div className="subTabs">
          <button className={reviewMode === 'today' ? 'active' : ''} onClick={() => { setReviewMode('today'); setActiveIndex(0); setAnswerShown(false) }}>{t('todayReview')}</button>
          <button className={reviewMode === 'weak' ? 'active' : ''} onClick={() => { setReviewMode('weak'); setActiveIndex(0); setAnswerShown(false) }}>{t('weakStuck')}</button>
          {!isPhoneView && <button className={reviewMode === 'chunks' ? 'active' : ''} onClick={() => { setReviewMode('chunks'); setActiveIndex(0); setAnswerShown(false) }}>{t('chunks')}</button>}
          {!isPhoneView && <button className={reviewMode === 'sentences' ? 'active' : ''} onClick={() => { setReviewMode('sentences'); setActiveIndex(0); setAnswerShown(false) }}>{t('usefulSentences')}</button>}
        </div>
        <div className="reviewCard">
          <span>{reviewMode === 'today' ? t('todayReview') : reviewMode === 'chunks' ? t('chunks') : reviewMode === 'sentences' ? t('usefulSentences') : t('weakStuck')}</span>
          {currentReview ? <>
            <div className="reviewCardMeta">
              <em>{t('cardProgress', { current: Math.min(activeIndex + 1, reviewPool.length || 1), total: reviewPool.length || 1 })}</em>
              <em>{reviewLabel(reviewBucketLabel(currentReview))}</em>
            </div>
            <h2>{currentReview.promptCn}</h2>
            <p className="reviewThinkHint">{t('thinkFirst')}</p>
            {answerShown ? <button className="answerBox playableAnswer reviewAnswer" onClick={() => playText(currentReview.answerEn)}>{currentReview.answerEn}</button> : <button className="primary revealButton" onClick={() => setAnswerShown(true)}>{t('showAnswer')}</button>}
            <div className="reviewSourceLine">
              <span>{t('sourceLabel')}: {currentReview.source || reviewLabel(reviewBucketLabel(currentReview))}</span>
              <span>{t('nextDue')}: {dateLabel(currentReview.nextReviewAt)}</span>
            </div>
            <div className="actionRow reviewActions">
              <button className="secondary" onClick={() => playText(currentReview.answerEn)} disabled={!answerShown}>{t('play')}</button>
              <button className="secondary" onClick={() => markReview(currentReview, 'again')} disabled={!answerShown}>{t('again')}</button>
              <button className="secondary" onClick={() => markReview(currentReview, 'hard')} disabled={!answerShown}>{t('hard')}</button>
              <button className="primary" onClick={() => markReview(currentReview, 'good')} disabled={!answerShown}>{t('good')}</button>
            </div>
          </> : renderReviewEmpty()}
        </div>
        {(reviewMode !== 'today' || !isPhoneView || reviewQueueExpanded) && <div className="queueList">
          {reviewPool.slice(0, 12).map(item => <button key={item.id} onClick={() => playText(item.answerEn)}><strong>{item.answerEn}</strong><span>{reviewLabel(reviewBucketLabel(item))} · {dateLabel(item.nextReviewAt)} · {item.status}</span></button>)}
        </div>}
        {reviewMode === 'today' && isPhoneView && <button className="secondary compact" onClick={() => setReviewQueueExpanded(value => !value)}>
          {reviewQueueExpanded ? t('hideQueue') : t('showQueue')}
        </button>}
      </section>}
    </main>

    {settingsOpen && <div className="drawerBackdrop" onClick={() => setSettingsOpen(false)}>
      <div className="settingsDrawer" onClick={e => e.stopPropagation()}>
        <div className="topActions"><h2>{t('settingsTitle')}</h2><button className="secondary compact" onClick={() => setSettingsOpen(false)}>{t('close')}</button></div>
        <div className="settingsNote">{t('settingsNote', { version: APP_VERSION })}</div>
        <div className="readerSettingsImport">
          <strong>Import ChatGPT Lesson</strong>
          <p>Paste one full Kevin in Australia lesson. The original manuscript will be preserved.</p>
          <textarea value={readerDraft} onChange={event => setReaderDraft(event.target.value)} placeholder="# Kevin in Australia&#10;## Episode 1: A Coffee and a New Neighbour&#10;&#10;Paste the full ChatGPT lesson here..." />
          <button className="primary" onClick={() => { importReaderLesson(); setSettingsOpen(false); setTab('reader') }}>Import Lesson</button>
        </div>
        <label>{t('account')}<select value={activeUserId} onChange={e => switchUser(e.target.value)}>{userProfiles.map(user => <option value={user.id} key={user.id}>{user.name}</option>)}</select></label>
        <div className="accountSettings">
          <strong>{t('accountSettings')}</strong>
          {userProfiles.map(user => <div className="accountEditRow" key={user.id}>
            <label>{t('accountName')}<input value={user.name} onChange={e => updateUserProfile(user.id, { name: e.target.value })} /></label>
            <label>{t('accountPassword')}<input type="password" value={user.password} onChange={e => updateUserProfile(user.id, { password: e.target.value })} placeholder={t('passwordPlaceholder')} /></label>
          </div>)}
          <p>{t('passwordSavedHint')}</p>
        </div>
        <div className="dataTools">
          <strong>{t('dataBackup')}</strong>
          <p>{t('backupHint')}</p>
          <div className="actionRow">
            <button className="secondary" onClick={exportCurrentUserData}>{t('exportData')}</button>
            <button className="secondary" onClick={() => backupFileRef.current?.click()}>{t('importData')}</button>
          </div>
          <input ref={backupFileRef} type="file" accept="application/json,.json" onChange={e => importCurrentUserData(e.target.files?.[0])} />
        </div>
        <label>{t('uiLanguage')}<select value={uiLanguage} onChange={e => setSettings({ ...settings, uiLanguage: e.target.value })}><option value="en">{t('uiEnglish')}</option><option value="zh">{t('uiChinese')}</option></select></label>
        <label>{t('openaiKey')}<input type="password" value={settings.apiKey} onChange={e => setSettings({ ...settings, apiKey: e.target.value })} placeholder="sk-..." /></label>
        <label>{t('defaultVoice')}<select value={settings.voice} onChange={e => setSettings({ ...settings, voice: e.target.value })}>{VOICE_OPTIONS.map(v => <option key={v}>{v}</option>)}</select></label>
        <div className="voiceMap">
          <strong>{t('speakerVoices')}</strong>
          <p>{t('speakerVoicesHint')}</p>
          {speakerVoiceNames.map(speaker => <label key={speaker}>{t('voiceFor', { speaker })}<select value={settings.speakerVoices?.[speaker] || settings.voice} onChange={e => setSpeakerVoice(speaker, e.target.value)}>{VOICE_OPTIONS.map(v => <option key={v}>{v}</option>)}</select></label>)}
        </div>
        <label>{t('languageDisplay')}<select value={settings.displayMode} onChange={e => setSettings({ ...settings, displayMode: e.target.value })}><option value="both">EN + CN</option><option value="en">EN</option><option value="cn">CN</option><option value="hide">Hide English</option></select></label>
        <label>{t('playbackSpeed')}<select value={settings.playbackSpeed} onChange={e => setPlaybackSpeed(Number(e.target.value))}><option value={0.75}>0.75x</option><option value={0.9}>0.9x</option><option value={1}>1.0x</option><option value={1.15}>1.15x</option><option value={1.25}>1.25x</option></select></label>
        <label>{t('pauseSeconds')}<select value={settings.pauseSeconds} onChange={e => setSettings({ ...settings, pauseSeconds: e.target.value === 'auto' ? e.target.value : Number(e.target.value) })}><option value="auto">{t('autoPause')}</option><option value={1}>1.0 seconds</option><option value={2.5}>2.5 seconds</option><option value={4}>4.0 seconds</option><option value={6}>6.0 seconds</option></select></label>
        <label>{t('displayScale')}<select value={settings.fontScale} onChange={e => setSettings({ ...settings, fontScale: e.target.value })}><option value="normal">{t('normal')}</option><option value="comfortable">{t('comfortable')}</option><option value="large">{t('large')}</option></select></label>
      </div>
    </div>}
  </div>
}

function CourseCard({ course, linkedTitle, onLearn, onPractice, t, sourceLabel, audioLabel, listenLabel }) {
  const unaligned = countUnaligned(course.transcriptLines || [])
  const lastStage = course.lastStage ? t(`stage.${course.lastStage}`) : t('notStartedYet')
  return <article className="courseCard">
    <div className="courseTop">
      <span className="modeBadge">{audioLabel(course.audioMode)}</span>
      <span>{course.level}</span>
    </div>
    <h3>{course.title}</h3>
    <p>{course.goal || course.category}</p>
    <div className="courseMeta">
      <span>{sourceLabel(course.sourceType)}</span>
      <span>{course.importMethod === 'audioImport' ? t('audioImport') : t('textPackImport')}</span>
      {course.status && <span>{course.status}</span>}
      {linkedTitle && <span className="linkedBadge">{t('linkedTo', { title: linkedTitle })}</span>}
      {unaligned > 0 && <span className="warningBadge">{unaligned} {t('unaligned')}</span>}
    </div>
    <div className="courseStatsLine">{listenLabel(course)} · {course.transcriptLines?.length || 0} {t('lines')} · {lastStage}</div>
    <div className="actionRow">
      <button className="primary" onClick={onLearn}>{t('open')}</button>
      <button className="secondary" onClick={onPractice}>{t('continue')}</button>
    </div>
  </article>
}

function CourseHeader({ course, t, sourceLabel, audioLabel }) {
  const unaligned = countUnaligned(course.transcriptLines || [])
  const lastStage = course.lastStage ? t(`stage.${course.lastStage}`) : t('notStartedYet')
  return <div className="courseHeader">
    <div>
      <span>{sourceLabel(course.sourceType)} · {audioLabel(course.audioMode)} · {course.level}{course.audioType ? ` · ${course.audioType}` : ''}</span>
      <h2>{course.title}</h2>
      <p>{course.goal || course.category}</p>
      <em className="stagePill">{lastStage}{course.lastStudiedAt ? ` · ${shortDateLabel(course.lastStudiedAt)}` : ''}</em>
      {course.linkedCourseTitle && <em className="linkedLine">{t('linkedTo', { title: course.linkedCourseTitle })}</em>}
      {unaligned > 0 && <em className="headerWarning">{t('unalignedWarning', { count: unaligned })}</em>}
    </div>
  </div>
}

function BackgroundPanel({ course, t }) {
  const rows = backgroundRows(course.background || {})
  return <div className="heroPanel backgroundPanel">
    <span>{t('background')}</span>
    <h2>{course.background?.topic || course.background?.en || course.title}</h2>
    {rows.length ? <div className="backgroundGrid">
      {rows.map(([label, value]) => <div key={label}>
        <strong>{t(`bg.${label}`)}</strong>
        <p>{value}</p>
      </div>)}
    </div> : <p>{course.background?.cn || course.goal}</p>}
    {course.stage6Prompt && <button className="secondary">{t('copyVoicePrompt')}</button>}
  </div>
}

function DisplaySwitch({ settings, setSettings }) {
  return <div className="displaySwitch">
    {[
      ['en', 'EN'],
      ['both', 'EN+CN'],
      ['hide', 'Hide']
    ].map(([id, label]) => <button key={id} className={settings.displayMode === id ? 'active' : ''} onClick={() => setSettings({ ...settings, displayMode: id })}>{label}</button>)}
  </div>
}

function ImportRouteGuide({ mode, t }) {
  const isAudio = mode === 'audio'
  return <div className={`importRouteGuide ${isAudio ? 'audio' : 'generated'}`}>
    <div className="importRouteCompare">
      <section className="importRouteColumn importRouteSource">
        <span>{isAudio ? t('originalAudioRule') : t('generatedAudioRule')}</span>
        <strong>{isAudio ? t('importGuideAudioTitle') : t('importGuideTextTitle')}</strong>
        <p>{isAudio ? t('importGuideAudioBody') : t('importGuideTextBody')}</p>
      </section>
      <section className="importRouteColumn importRouteResult">
        <span>{isAudio ? t('kevinVersion') : t('openKevinVersion')}</span>
        <strong>{isAudio ? t('rewriteSaved') : t('saveSuggested')}</strong>
        <p>{isAudio ? t('generatedAudioRule') : t('freeTalkFallback')}</p>
      </section>
    </div>
    <div className="importPath">
      <em>1 {t('import')}</em>
      <em>2 {t('importCreatesListen')}</em>
      <em>3 {t('importCreatesSpeak')}</em>
      <em>4 {t('importCreatesReview')}</em>
    </div>
    <small>{t('importAfterSave')}</small>
  </div>
}

function ImportPreview({ preview, t, sourceLabel, audioLabel }) {
  const courses = preview.kind === 'bundle' ? preview.courses : [preview]
  const report = preview.importReport
  return <div className="previewBox importReport">
    <div className="importConfirmHead">
      <div>
        <span>{t('importConfirmTitle')}</span>
        <strong>{report.title}</strong>
      </div>
      <em>{t('importConfirmHint')}</em>
    </div>
    <div className="reportGrid">
      <span>PACK_TYPE: {report.packType || 'TEXT_PACK'}</span>
      <span>SOURCE_TYPE: {report.sourceType}</span>
      <span>AUDIO_MODE: {report.audioMode}</span>
      <span>IMPORT_METHOD: {report.importMethod}</span>
      <span>LINKED_COURSE_TITLE: {report.linkedCourseTitle || 'None'}</span>
    </div>
    <div className="routeGrid">
      <div><strong>{report.learnItems}</strong><span>{t('nav.learn')}</span></div>
      <div><strong>{(Number(report.practiceItems) || 0) + (Number(report.outputItems) || 0)}</strong><span>{t('speakTasks')}</span></div>
      <div><strong>{report.reviewItems}</strong><span>{t('nav.review')}</span></div>
    </div>
    <div className="importRouteChecklist">
      <span>{t('importRouteListen')}</span>
      <span>{t('importRouteSpeak')}</span>
      <span>{t('importRouteReview')}</span>
    </div>
    <div className="coursePreviewList">
      {courses.map(course => <div key={course.id}>
        <strong>{course.title}</strong>
        <span>{sourceLabel(course.sourceType)} · {audioLabel(course.audioMode)} · {course.importMethod === 'audioImport' ? t('audioImport') : t('textPackImport')}</span>
      </div>)}
    </div>
    {!!report.missingFields?.length && <p>{t('missingFields')}: {report.missingFields.join(', ')}</p>}
    {!!report.warnings?.length && <p>{t('warnings')}: {report.warnings.join(' ')}</p>}
  </div>
}

function normalizeAnswerText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function levenshteinDistance(a, b) {
  const left = String(a || '')
  const right = String(b || '')
  if (!left) return right.length
  if (!right) return left.length
  const matrix = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0))
  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  return matrix[left.length][right.length]
}

function tokenOverlapScore(typedText, expectedText) {
  const typedTokens = new Set(String(typedText || '').split(' ').filter(Boolean))
  const expectedTokens = new Set(String(expectedText || '').split(' ').filter(Boolean))
  if (!typedTokens.size || !expectedTokens.size) return 0
  let matchCount = 0
  expectedTokens.forEach(token => {
    if (typedTokens.has(token)) matchCount += 1
  })
  return matchCount / expectedTokens.size
}

function evaluatePracticeAnswer(typed, expected) {
  const normalizedTyped = normalizeAnswerText(typed)
  const normalizedExpected = normalizeAnswerText(expected)
  const typedTokens = normalizedTyped.split(' ').filter(Boolean)
  const expectedTokens = normalizedExpected.split(' ').filter(Boolean)
  if (!normalizedTyped) {
    return { state: 'empty', tone: '', titleKey: 'practiceResultEmpty', bodyKey: 'practiceResultEmptyBody' }
  }
  if (!normalizedExpected) {
    return { state: 'perfect', tone: 'correct', titleKey: 'practiceResultPerfect', bodyKey: 'practiceResultPerfectBody' }
  }
  if (normalizedTyped === normalizedExpected) {
    return { state: 'perfect', tone: 'correct', titleKey: 'practiceResultPerfect', bodyKey: 'practiceResultPerfectBody' }
  }
  const distance = levenshteinDistance(normalizedTyped, normalizedExpected)
  const similarity = 1 - (distance / Math.max(normalizedExpected.length, normalizedTyped.length, 1))
  const overlap = tokenOverlapScore(normalizedTyped, normalizedExpected)
  const typedCoverage = normalizedTyped.length / Math.max(normalizedExpected.length, 1)
  const enoughPhrase = typedTokens.length >= Math.min(3, Math.max(2, expectedTokens.length - 1)) && typedCoverage >= 0.45
  const phraseContains = enoughPhrase && (normalizedExpected.includes(normalizedTyped) || normalizedTyped.includes(normalizedExpected))
  if (similarity >= 0.82 || (overlap >= 0.7 && typedCoverage >= 0.55) || phraseContains) {
    return { state: 'close', tone: 'correct', titleKey: 'practiceResultClose', bodyKey: 'practiceResultCloseBody' }
  }
  return { state: 'retry', tone: 'wrong', titleKey: 'practiceResultRetry', bodyKey: 'practiceResultRetryBody' }
}

function PracticeCard({ item, index, total, typed, setTyped, answerShown, setAnswerShown, playText, onSaveReview, onNext, nextLabel, t }) {
  const expected = String(item.answerEn || '').trim()
  const prompt = item.type === 'replacement'
    ? item.replacement || item.promptCn || item.base
    : item.promptCn || item.hint || item.base || expected
  const supportLabel = item.type === 'typing'
    ? t('typing')
    : item.type === 'replacement'
      ? t('replacement')
      : t('quickResponse')
  const result = evaluatePracticeAnswer(typed, expected)
  const canMoveNext = answerShown || !expected
  const progressPercent = Math.max(0, Math.min(100, Math.round((index / Math.max(total, 1)) * 100)))

  return <div className={`practiceCard controlledPracticeCard practice-${item.type}`}>
    <div className="practiceMetaRow">
      <span>{supportLabel}</span>
      <small>{t('practiceProgressLabel')}: {index}/{total}</small>
    </div>
    <div className="practiceProgressTrack" aria-hidden="true"><i style={{ width: `${progressPercent}%` }} /></div>
    <h2>{prompt}</h2>
    {item.type === 'replacement' && <div className="practiceSupportGrid">
      <div><small>{t('originalLine')}</small><strong>{item.base}</strong></div>
      <div><small>{t('dailyLine')}</small><strong>{item.replacement}</strong></div>
    </div>}
    {item.hint && <div className="guidedStarter"><span>{t('practicePrompt')}</span><strong>{item.hint}</strong></div>}
    <label className="practiceAnswerEntry">
      <span>{t('yourAnswer')}</span>
      <textarea value={typed} onChange={event => setTyped(event.target.value)} placeholder={expected || t('answerPlaceholder')} />
    </label>
    {answerShown && <div className={`answerBox practiceResultBox ${result.tone || 'neutral'}`}>
      <small>{t(result.titleKey)}</small>
      <p>{t(result.bodyKey)}</p>
      <button className="playableAnswer" onClick={() => playText(expected)}>{expected}</button>
    </div>}
    <div className="actionRow">
      <button className="secondary" onClick={() => playText(expected)}>{t('play')}</button>
      <button className="secondary" onClick={() => setAnswerShown(true)} disabled={answerShown}>{t('checkAnswer')}</button>
      <button className="secondary" onClick={() => onSaveReview?.({ en: expected, cn: prompt, type: item.type === 'replacement' ? 'pattern' : 'usefulSentence' })}>{t('saveReview')}</button>
      <button className="primary" onClick={canMoveNext ? onNext : () => setAnswerShown(true)}>{canMoveNext ? (nextLabel || t('next')) : t('checkAnswer')}</button>
    </div>
  </div>
}

function OutputCard({ item, isPhoneView, freeTalkLevel, playText, playList, requestFreeTalkReply, getPauseSeconds, onSaveReview, onMarkStuck, onNext, nextLabel, t }) {
  const [userRole, setUserRole] = useState(item.userRole || 'Kevin')
  const [showScript, setShowScript] = useState(!isPhoneView)
  const [recordingEnabled, setRecordingEnabled] = useState(false)
  const [activeRoleIndex, setActiveRoleIndex] = useState(-1)
  const [countdown, setCountdown] = useState(0)
  const [roleRunning, setRoleRunning] = useState(false)
  const [freeTalkMessages, setFreeTalkMessages] = useState([])
  const [freeTalkText, setFreeTalkText] = useState('')
  const [freeTalkResult, setFreeTalkResult] = useState(null)
  const [freeTalkLoading, setFreeTalkLoading] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState('')
  useEffect(() => {
    setShowScript(!isPhoneView)
    setActiveRoleIndex(-1)
    setCountdown(0)
    setRoleRunning(false)
    setFreeTalkMessages([])
    setFreeTalkText('')
    setFreeTalkResult(null)
    setFreeTalkLoading(false)
    setSaveFeedback('')
  }, [item.id, isPhoneView])

  function saveToReview(payload) {
    onSaveReview?.(payload)
    setSaveFeedback(t('savedReviewInline'))
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async function runRolePlay() {
    if (!item.lines?.length || roleRunning) return
    setRoleRunning(true)
    setCountdown(0)
    for (let index = 0; index < item.lines.length; index += 1) {
      const line = item.lines[index]
      const isUserLine = line.speaker?.toLowerCase() === userRole.toLowerCase()
      setActiveRoleIndex(index)
      if (isUserLine) {
        const seconds = Math.max(1, Math.round(Number(getPauseSeconds?.(line) || 3)))
        for (let remaining = seconds; remaining > 0; remaining -= 1) {
          setCountdown(remaining)
          await wait(1000)
        }
        setCountdown(0)
      } else {
        await playText(line.en, line.speaker)
        await wait(Math.max(900, Math.round(String(line.en || '').split(/\s+/).length * 320)))
      }
    }
    setRoleRunning(false)
  }

  function startFreeTalk() {
    setFreeTalkMessages([{ role: 'ai', text: t('freeTalkOpening') }])
    setFreeTalkResult(null)
  }

  async function sendFreeTalkTurn() {
    const userText = freeTalkText.trim()
    if (!userText || freeTalkLoading) return
    const nextMessages = [...freeTalkMessages, { role: 'user', text: userText }]
    setFreeTalkMessages(nextMessages)
    setFreeTalkText('')
    setFreeTalkLoading(true)
    const result = await requestFreeTalkReply?.({ item, level: freeTalkLevel || 'A2', messages: nextMessages, userText })
    const reply = result?.reply || 'Try again with one simple sentence.'
    setFreeTalkResult(result || null)
    setFreeTalkMessages([...nextMessages, { role: 'ai', text: reply }])
    setFreeTalkLoading(false)
  }

  if (item.type === 'rolePlay') {
    return <div className="practiceCard practice-rolePlay">
      <span>{t('rolePlay')}</span>
      <h2>{item.scenario}</h2>
      <div className="roleSetupRow">
        <label>{t('rolePlay')}<select value={userRole} onChange={e => setUserRole(e.target.value)}>
          {[...new Set(item.lines.map(line => line.speaker).filter(Boolean))].map(role => <option key={role}>{role}</option>)}
        </select></label>
        <button className={`recordToggle ${recordingEnabled ? 'active' : ''}`} onClick={() => setRecordingEnabled(value => !value)}>{recordingEnabled ? t('recordingOn') : t('recordingOff')}</button>
      </div>
      <div className="rolePlayStage">
        <div className={`countdownRing ${countdown ? 'active' : ''}`}>
          <strong>{countdown || 'GO'}</strong>
          <span>{activeRoleIndex >= 0 && item.lines[activeRoleIndex]?.speaker?.toLowerCase() === userRole.toLowerCase() ? t('yourTurn') : t('partnerTurn')}</span>
        </div>
        <div>
          <strong>{activeRoleIndex >= 0 ? item.lines[activeRoleIndex]?.en : item.lines.find(line => line.speaker?.toLowerCase() !== userRole.toLowerCase())?.en || item.lines[0]?.en}</strong>
          <span>{t('pauseAuto', { seconds: activeRoleIndex >= 0 ? Math.round(Number(getPauseSeconds?.(item.lines[activeRoleIndex]) || 3)) : 3 })}</span>
        </div>
      </div>
      <div className="actionRow">
        <button className="primary" onClick={runRolePlay} disabled={roleRunning}>{roleRunning ? t('yourTurn') : t('startRolePlay')}</button>
        <button className="secondary" onClick={() => setShowScript(value => !value)}>{showScript ? t('hide') : t('transcript')}</button>
      </div>
      {(showScript || isPhoneView) && <div className="roleChatList">
        {item.lines.map((line, index) => {
          const isUser = line.speaker?.toLowerCase() === userRole.toLowerCase()
          return <div className={`roleBubbleRow ${isUser ? 'user' : 'ai'} ${activeRoleIndex === index ? 'activeLine' : ''}`} key={`${line.speaker}-${index}`}>
            <button className="roleBubble" onClick={() => playText(line.en, line.speaker)}>
              <span>{isUser ? t('yourTurn') : (line.speaker || t('partnerTurn'))}</span>
              <strong>{line.en}</strong>
              {line.cn && <small>{line.cn}</small>}
            </button>
            <button className="roleBubbleSave" title={t('saveReview')} onClick={() => saveToReview({ en: line.en, cn: line.cn, type: 'usefulSentence' })}>{t('starShort')}</button>
          </div>
        })}
      </div>}
      {saveFeedback && <div className="inlineSuccess" data-testid="saved-review-feedback">{saveFeedback}</div>}
      <div className="actionRow">
        <button className="secondary weakAction" onClick={onMarkStuck}>{t('markStuck')}</button>
        <button className="primary" onClick={onNext}>{nextLabel || t('next')}</button>
      </div>
    </div>
  }
  if (item.type === 'retell') {
    return <div className="practiceCard practice-retell">
      <span>{t('retell')}</span>
      <h2>{item.prompt}</h2>
      <div className="chipRow">{(item.keywords || []).map(k => <span key={k}>{k}</span>)}</div>
      <div className="speakConstraintBar">
        <span>{freeTalkLevel || 'A2'}</span>
        <span>{freeTalkLevel === 'A2' ? (t('retell').includes('自由') ? '每轮 1 句' : '1 sentence per turn') : freeTalkLevel === 'B1' ? (t('retell').includes('自由') ? '每轮 1-2 句' : '1-2 sentences per turn') : (t('retell').includes('自由') ? '每轮 2 句' : '2 sentences per turn')}</span>
        <span>{t('retell').includes('自由') ? '只聊当前场景' : 'Keep the same scenario'}</span>
      </div>
      <div className="freeTalkPanel">
        {!freeTalkMessages.length ? <button className="primary freeTalkStart" onClick={startFreeTalk}>{t('freeTalkStart')}</button> : <>
          <div className="freeTalkMessages">
            {freeTalkMessages.map((message, index) => <div key={`${message.role}-${index}`} className={`freeTalkBubble ${message.role}`}>
              <span>{message.role === 'user' ? t('freeTalkYou') : t('freeTalkAi')}</span>
              <strong>{message.text}</strong>
            </div>)}
            {freeTalkLoading && <div className="freeTalkBubble ai"><span>{t('freeTalkAi')}</span><strong>{t('freeTalkThinking')}</strong></div>}
          </div>
          <div className="freeTalkComposer">
            <textarea value={freeTalkText} onChange={e => setFreeTalkText(e.target.value)} placeholder={t('freeTalkInput')} />
            <button className="primary" disabled={!freeTalkText.trim() || freeTalkLoading} onClick={sendFreeTalkTurn}>{t('freeTalkSend')}</button>
          </div>
          {freeTalkResult && <div className="freeTalkFeedback">
            {freeTalkResult.hint && <p><strong>{t('freeTalkHint')}:</strong> {freeTalkResult.hint}</p>}
            {freeTalkResult.feedback && <p><strong>{t('freeTalkFeedback')}:</strong> {freeTalkResult.feedback}</p>}
            {freeTalkResult.suggestedReview && <button className="secondary compact" onClick={() => saveToReview({ en: freeTalkResult.suggestedReview, cn: item.prompt, type: 'usefulSentence' })}>{t('saveSuggested')}</button>}
          </div>}
        </>}
      </div>
      {saveFeedback && <div className="inlineSuccess" data-testid="saved-review-feedback">{saveFeedback}</div>}
      <div className="actionRow">
        <button className="secondary" onClick={() => playText(item.sample)}>{t('play')}</button>
        <button className="secondary" data-testid="task-speak-save" onClick={() => saveToReview({ en: item.sample, cn: item.prompt, type: 'usefulSentence' })}>{t('saveReview')}</button>
        <button className="secondary weakAction" onClick={onMarkStuck}>{t('markStuck')}</button>
        <button className="primary" onClick={onNext}>{nextLabel || t('next')}</button>
      </div>
      <button className="answerBox playableAnswer" onClick={() => playText(item.sample)}>{item.sample}</button>
    </div>
  }
  return <div className="practiceCard practice-guidedSpeaking">
    <span>{t('guidedSpeaking')}</span>
    <h2>{item.prompt}</h2>
    {item.sentenceStarter && <div className="guidedStarter"><span>Starter</span><strong>{item.sentenceStarter}</strong></div>}
    <div className="chipRow">{(item.hints || []).map(h => <span key={h}>{h}</span>)}</div>
    <textarea placeholder={t('answerPlaceholder')} />
    {saveFeedback && <div className="inlineSuccess" data-testid="saved-review-feedback">{saveFeedback}</div>}
    <div className="actionRow">
      <button className="secondary" onClick={() => playText(item.sample)}>{t('play')}</button>
      <button className="secondary" data-testid="task-speak-save" onClick={() => saveToReview({ en: item.sample, cn: item.prompt, type: 'usefulSentence' })}>{t('saveReview')}</button>
      <button className="secondary weakAction" onClick={onMarkStuck}>{t('markStuck')}</button>
      <button className="primary" onClick={onNext}>{nextLabel || t('next')}</button>
    </div>
    {item.sample && <button className="answerBox playableAnswer" onClick={() => playText(item.sample)}>{item.sample}</button>}
  </div>
}

function ReaderInline({ text }) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g)
  return <>{parts.map((part, index) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
  })}</>
}

function ReaderAudioActions({ text, onPlayText, onPracticeText }) {
  const playable = playableEnglishFromText(text)
  if (!playable) return null
  return <span className="readerAudioActions">
    <button className="readerPlayButton" title="Play English" onClick={() => onPlayText(playable)}>▶</button>
    <button className="readerSpellButton" title="Spelling practice" onClick={() => onPracticeText(playable)}>Spell</button>
  </span>
}

function ReaderBlock({ block, index, onPlayText, onPlayLines, onPracticeText }) {
  const playableLines = readerBlockPlayableLines(block)
  const showContinuous = shouldShowContinuousPlay(playableLines)
  if (block.type === 'heading') {
    const Tag = `h${Math.min(Math.max(block.level, 1), 4)}`
    return <Tag id={`reader-${block.id}`} className={`readerHeading level-${block.level}`}>
      <ReaderInline text={block.text} />
    </Tag>
  }
  if (block.type === 'hr') return <hr className="readerDivider" />
  if (block.type === 'code') {
    const lines = String(block.text || '').split('\n')
    return <div className="readerCodeBlock">
      {showContinuous && <button className="readerBlockPlay" onClick={() => onPlayLines(playableLines)}>▶ Block</button>}
      <pre>{lines.map((line, lineIndex) => <span key={`${line}-${lineIndex}`}>
        <code>{line || ' '}</code>
        <ReaderAudioActions text={line} onPlayText={onPlayText} onPracticeText={onPracticeText} />
      </span>)}</pre>
      {isDialogueBlock(block) && <ReaderRolePlay block={block} onPlayText={onPlayText} onPlayLines={onPlayLines} onPracticeText={onPracticeText} />}
    </div>
  }
  if (block.type === 'table') {
    const [head, ...body] = block.rows || []
    return <div className="readerTableWrap">
      {showContinuous && <button className="readerBlockPlay" onClick={() => onPlayLines(playableLines)}>▶ Table</button>}
      <table className="readerTable">
        {head && <thead><tr>{head.map((cell, cellIndex) => <th key={`${cell}-${cellIndex}`}><ReaderInline text={cell} /></th>)}</tr></thead>}
        <tbody>{body.map((row, rowIndex) => <tr key={`row-${index}-${rowIndex}`}>
          {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>
            <span><ReaderInline text={cell} /></span>
            <ReaderAudioActions text={cell} onPlayText={onPlayText} onPracticeText={onPracticeText} />
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>
  }
  if (block.type === 'list') {
    return <div className="readerListBlock">
      {showContinuous && <button className="readerBlockPlay inline" onClick={() => onPlayLines(playableLines)}>▶ List</button>}
      <ul className="readerList">
        {block.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`}>
          <span><ReaderInline text={item} /></span>
          <ReaderAudioActions text={item} onPlayText={onPlayText} onPracticeText={onPracticeText} />
        </li>)}
      </ul>
    </div>
  }
  const lines = String(block.text || '').split('\n')
  return <div className="readerParagraph">
    {showContinuous && <button className="readerBlockPlay inline" onClick={() => onPlayLines(playableLines)}>▶ Paragraph</button>}
    {lines.map((line, lineIndex) => <p key={`${line}-${lineIndex}`}>
      <span><ReaderInline text={line} /></span>
      <ReaderAudioActions text={line} onPlayText={onPlayText} onPracticeText={onPracticeText} />
    </p>)}
  </div>
}

function ReaderRolePlay({ block, onPlayText, onPlayLines, onPracticeText }) {
  const dialogue = parseDialogueLines(block.text)
  const speakers = [...new Set(dialogue.map(line => line.speaker))]
  const [role, setRole] = useState(speakers.find(speaker => /Kevin/i.test(speaker)) || speakers[0] || '')
  const partnerLines = dialogue.filter(line => line.speaker !== role).map(line => line.text)
  return <div className="readerRolePlayLite">
    <div className="readerRoleHeader">
      <div>
        <span>Light Role-play</span>
        <strong>Choose your role, then answer out loud.</strong>
      </div>
      <label>I am<select value={role} onChange={event => setRole(event.target.value)}>
        {speakers.map(speaker => <option key={speaker}>{speaker}</option>)}
      </select></label>
    </div>
    <div className="readerRoleActions">
      <button className="primary compact" onClick={() => onPlayLines(partnerLines)} disabled={!partnerLines.length}>Play partner lines</button>
      <button className="secondary compact" onClick={() => onPlayLines(dialogue.map(line => line.text))}>Play full dialogue</button>
    </div>
    <div className="readerRoleBubbles">
      {dialogue.map((line, index) => {
        const isUser = line.speaker === role
        return <div className={`readerRoleBubble ${isUser ? 'user' : 'partner'}`} key={`${line.speaker}-${line.text}-${index}`}>
          <button onClick={() => onPlayText(line.text)} disabled={isUser}>
            <span>{isUser ? `Your turn (${line.speaker})` : line.speaker}</span>
            <strong>{line.text}</strong>
          </button>
          <button className="readerRoleSpell" onClick={() => onPracticeText(line.text)}>Spell</button>
        </div>
      })}
    </div>
  </div>
}

function Empty({ text }) {
  return <div className="emptyState">{text}</div>
}

createRoot(document.getElementById('root')).render(<App />)
