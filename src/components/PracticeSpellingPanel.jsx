import React, { useState } from 'react'

export default function PracticeSpellingPanel({
  activeCourse = null,
  spellingSourceOptions = [],
  spellingSourceType = 'vocab',
  onSetSpellingSourceType = () => {},
  spellingModeOptions = [],
  spellingMode = 'copy',
  onSetSpellingMode = () => {},
  spellingFocusOptions = [],
  spellingFocusMode = 'all',
  onSetSpellingFocusMode = () => {},
  spellingPool = [],
  spellingItemIndex = 0,
  onSetSpellingItemIndex = () => {},
  activeSpellingItem = null,
  spellingStarred = {},
  onToggleSpellingStar = () => {},
  spellingDraft = '',
  onSetSpellingDraft = () => {},
  spellingFeedback = '',
  onClearSpellingFeedback = () => {},
  onPlayActiveSpellingItem = () => {},
  onCheckPracticeSpelling = () => {},
  onPrevPracticeSpelling = () => {},
  onNextPracticeSpelling = () => {}
}) {
  const [filterOpen, setFilterOpen] = useState(false)

  if (!activeCourse) return null

  return <div className="v2Panel compactPanel">
    <h2>拼写训练</h2>
    <div className="spellingControlStack">
      <div className="spellingControlGroup">
        <small>内容类型</small>
        <div className="spellingSegmentRow">
          {spellingSourceOptions.map(([id, label]) => <button key={id} className={spellingSourceType === id ? 'active' : ''} onClick={() => onSetSpellingSourceType(id)}>{label}</button>)}
        </div>
      </div>
      <div className="spellingControlGroup">
        <small>训练方式</small>
        <div className="spellingSegmentRow spellingModeRow">
          {spellingModeOptions.map(([id, label]) => <button key={id} className={spellingMode === id ? 'active' : ''} onClick={() => onSetSpellingMode(id)}>{label}</button>)}
        </div>
      </div>
      <div className="spellingControlGroup">
        <div className="spellingFilterHeader">
          <small>过滤</small>
          <button className={`spellingFilterToggle ${filterOpen ? 'open' : ''}`} onClick={() => setFilterOpen(prev => !prev)}>{filterOpen ? '收起筛选' : '筛选'}</button>
        </div>
        {filterOpen && <div className="spellingTagRow lightweightTags">
          {spellingFocusOptions.map(([id, label]) => <button key={id} className={spellingFocusMode === id ? 'active' : ''} onClick={() => onSetSpellingFocusMode(id)}>{label}</button>)}
        </div>}
      </div>
    </div>

    {!activeSpellingItem && <div className="emptyState">暂无拼写内容，请先补充表达或对话内容。</div>}
    {activeSpellingItem && <div className="talkCard spellingWorkCard">
      <div className="spellingHead">
        <small>项目 {spellingItemIndex + 1} / {spellingPool.length}</small>
        <button className={`starToggle ${spellingStarred[activeSpellingItem.id] ? 'active' : ''}`} onClick={() => onToggleSpellingStar(activeSpellingItem.id)}>{spellingStarred[activeSpellingItem.id] ? '★ 已标记' : '☆ 标记重点'}</button>
      </div>
      {spellingPool.length > 1 && <details className="secondaryMenu">
        <summary>切换题号</summary>
        <div className="spellingJumpRow">
          {spellingPool.map((item, index) => <button key={item.id} className={index === spellingItemIndex ? 'active' : ''} onClick={() => onSetSpellingItemIndex(index)}>{index + 1}</button>)}
        </div>
      </details>}
      {spellingMode !== 'hidden' && <p>{activeSpellingItem.text}</p>}
      {spellingMode !== 'copy' && activeSpellingItem.meaning && <p>{activeSpellingItem.meaning}</p>}
      <div className="sourceActions">
        <button className="subtleAction" onClick={onPlayActiveSpellingItem}>播放</button>
        <button className="primaryAction" onClick={onCheckPracticeSpelling}>检查</button>
      </div>
      <textarea className="smallTextarea" placeholder="输入你听到或记得的英文。" value={spellingDraft} onChange={e => { onSetSpellingDraft(e.target.value); onClearSpellingFeedback() }} />
      {spellingFeedback && <p>{spellingFeedback}</p>}
      <div className="sourceActions">
        <button className="subtleAction" onClick={onPrevPracticeSpelling} disabled={spellingItemIndex <= 0}>上一项</button>
        <button className="primaryAction" onClick={onNextPracticeSpelling} disabled={spellingItemIndex >= spellingPool.length - 1}>下一项</button>
      </div>
    </div>}
  </div>
}
