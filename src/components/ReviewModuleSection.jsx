import React from 'react'
import ModulePageShell from './ModulePageShell'

export default function ReviewModuleSection({
  reviewTabs = [],
  reviewSubTab = 'today',
  onReviewSubTabChange = () => {},
  reviewCount = 0,
  reviewV2UserItemCount = 0,
  activeAccountName = '',
  due = [],
  onOpenLearnFromDue = () => {},
  chunkLabel = () => '',
  formatReviewDate = () => '',
  reviewV2Items = [],
  spellingMistakeItems = [],
  spellingPool = [],
  shadowReviewLines = [],
  onPlayShadowLine = () => {}
}) {
  return <ModulePageShell
    pageClassName="reviewPage"
    tabs={reviewTabs}
    tabValue={reviewSubTab}
    onTabChange={onReviewSubTabChange}
    headerLabel="复习"
    headerTitle="长期记忆修复"
    headerSubtitle="只复习重要、易错、卡壳内容。"
  >
    <div className="dashboard soft reviewDashboard">
      <div><strong>{reviewCount}</strong><span>今日到期</span></div>
      <div><strong>{reviewV2UserItemCount}</strong><span>V2 项目</span></div>
      <div><strong>{activeAccountName || '当前账户'}</strong><span>学习账号</span></div>
    </div>
    {reviewSubTab === 'today' && <div className="v2Panel reviewPanel">
      <h2>今日复习</h2>
      {due.length === 0 && <div className="emptyState">今天没有到期复习项目。</div>}
      {due.slice(0, 20).map(card => <div className="previewItem" key={card.id} onClick={() => onOpenLearnFromDue(card)}><strong>{card.content}</strong><p>{card.meaning}</p><small>{chunkLabel(card.type)} · 到期 {formatReviewDate(card.nextReviewAt)}</small></div>)}
    </div>}
    {reviewSubTab === 'chunk' && <div className="v2Panel reviewPanel">
      <h2>语块复习</h2>
      {reviewV2Items.length === 0 && <div className="emptyState">暂无 V2 复习项目。</div>}
      {reviewV2Items.slice(0, 20).map(item => <div className="previewItem" key={item.id}>
        <strong>{item.text || item.content || item.prompt || 'Review item'}</strong>
        <p>{item.translation || item.meaning || ''}</p>
        <small>{item.type || 'V2'} · 下次 {formatReviewDate(item.nextReviewAt)}</small>
      </div>)}
    </div>}
    {reviewSubTab === 'mistakes' && <div className="v2Panel reviewPanel">
      <h2>错题修复</h2>
      {spellingMistakeItems.length === 0 && <div className="emptyState">还没有拼写错误记录。</div>}
      {spellingMistakeItems.map(item => <div className="previewItem" key={item.id}>
        <strong>{spellingPool.find(row => row.id === item.id)?.text || 'Unknown item'}</strong>
        <small>错误: {item.wrong} · 正确: {item.correct}</small>
      </div>)}
    </div>}
    {reviewSubTab === 'shadowing' && <div className="v2Panel reviewPanel">
      <h2>跟读复习</h2>
      {shadowReviewLines.length === 0 && <div className="emptyState">暂无需优先复习的 shadow 句子。</div>}
      {shadowReviewLines.map((line, index) => <div className="previewItem" key={line.id}>
        <strong>{index + 1}. {line.text}</strong>
        {line.translation && <p>{line.translation}</p>}
        <button className="secondary compactButton subtleAction" onClick={() => onPlayShadowLine(line)}>播放</button>
      </div>)}
    </div>}
  </ModulePageShell>
}
