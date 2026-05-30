import React from 'react'
import ModuleSubTabs from './ModuleSubTabs'

function inferCourseCode(activeCourse) {
  const lesson = String(activeCourse?.lesson || activeCourse?.unit || '').trim()
  if (/^\d+$/.test(lesson)) return lesson.padStart(2, '0')
  const title = String(activeCourse?.title || '')
  const matched = title.match(/\b(\d{1,2})\b/)
  if (matched) return matched[1].padStart(2, '0')
  return '01'
}

export default function LearnOverviewSection({
  learnTabs = [],
  learnSubTab = 'overview',
  onLearnSubTabChange = () => {},
  activeAccountName = '',
  activeUserName = '',
  activeCourse = null,
  learnProgressPercent = 0,
  learnCurrentStepIndex = 1,
  learnPathRows = [],
  groupedNextStep = null,
  defaultNextStepAction = 'background',
  onSetPracticeStep = () => {},
  onOpenLibrarySearch = () => {},
  onOpenSettings = () => {},
  onPlayCourseAudio = () => {},
  dialogueCount = 0,
  expressionCount = 0,
  reviewCount = 0,
  sourceLabel = '',
  levelLabel = '',
  goalText = '',
  estimatedMinutesLeft = 18
}) {
  const userName = activeAccountName || activeUserName || '同学'
  const courseCode = inferCourseCode(activeCourse)
  const courseTitle = activeCourse?.title || 'Beginner Unit'
  const courseSubtitle = activeCourse?.goal || goalText || '本课先做理解输入，再进入练习。'
  const pathRows = [
    { id: 'background', title: '1. 背景', subtitle: '先理解主题和生活场景', status: learnPathRows.find(item => item.id === 'background')?.status || 'not_started', action: 'background' },
    { id: 'dialogue', title: '2. 对话', subtitle: '精听 · 跟读 · 初级角色扮演', status: learnPathRows.find(item => item.id === 'dialogue')?.status || 'not_started', action: 'dialogue' },
    { id: 'expressions', title: '3. 表达输入', subtitle: '词汇 · 语块 · 句型 · 实用句', status: learnPathRows.find(item => item.id === 'expressions')?.status || 'not_started', action: 'vocabulary' }
  ]

  return <section className="page learnPage learnInputPage">
    <div className="learnInputTop">
      <div className="learnInputBrand">
        <small>输入学习</small>
        <h1>学习</h1>
      </div>
      <div className="learnInputTopActions">
        <button className="learnTopIconButton" onClick={onOpenLibrarySearch} aria-label="Search in library">
          <span>⌕</span>
        </button>
        <button className="learnTopIconButton active" onClick={onOpenSettings} aria-label="Open settings">
          <span>⚙</span>
        </button>
      </div>
    </div>

    <ModuleSubTabs items={learnTabs} value={learnSubTab} onChange={onLearnSubTabChange} className="learnSubTabs" />

    <div className="learnLessonHeroCard">
      <div className="learnLessonHeroHead">
        <span>当前课程</span>
        <button className="heroPlay" onClick={onPlayCourseAudio} disabled={!activeCourse} aria-label="Play lesson dialogue">
          <span>▶</span>
        </button>
      </div>
      <div className="learnLessonHeroCode">{courseCode}</div>
      <h2>{courseTitle}</h2>
      <p>{activeCourse?.category || '教材音频'} · {activeCourse?.book || sourceLabel || '英语训练内容'}</p>
      <div className="learnLessonMetaRow">
        <span>{levelLabel || activeCourse?.level || 'A2-B1'}</span>
        <span>剩余 {estimatedMinutesLeft} 分钟</span>
      </div>
      <div className="progressBar"><span style={{ width: `${learnProgressPercent}%` }} /></div>
      <div className="learnHeroStats">
        <div><strong>{dialogueCount}</strong><small>对话</small></div>
        <div><strong>{expressionCount}</strong><small>表达</small></div>
        <div><strong>{reviewCount}</strong><small>复习</small></div>
      </div>
      <div className="learnHeroActions">
        <button className="primary" disabled={!activeCourse} onClick={() => onSetPracticeStep(groupedNextStep?.action || defaultNextStepAction)}>继续学习</button>
        <button className="secondary" disabled={!activeCourse} onClick={onPlayCourseAudio}>播放课程音频</button>
      </div>
    </div>

    <div className="learnOverviewPathCard">
      <h3>今日学习路径</h3>
      <p>先输入，再练习，不在这里做复杂输出。</p>
      <div className="learnOverviewPathRows">
        {pathRows.map(row => <button key={row.id} className={`learnOverviewPathRow ${row.status}`} disabled={!activeCourse} onClick={() => onSetPracticeStep(row.action)}>
          <div>
            <strong>{row.title}</strong>
            <small>{row.subtitle}</small>
          </div>
          <em>{row.status === 'done' ? '✓' : row.status === 'current' ? '●' : '○'}</em>
        </button>)}
      </div>
      <div className="learnOverviewSuggestion">今日建议：先完成“对话精听”，再学习“表达输入”。你好，{userName}。</div>
      <div className="learnOverviewStepHint">当前步骤：第 {learnCurrentStepIndex} / {Math.max(3, pathRows.length)} 步</div>
      <div className="learnOverviewGoal">本课目标：{courseSubtitle}</div>
    </div>
  </section>
}
