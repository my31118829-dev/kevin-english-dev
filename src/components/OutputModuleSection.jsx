import React from 'react'
import ModulePageShell from './ModulePageShell'

export default function OutputModuleSection({
  activeCourse = null,
  outputSubTab = 'overview',
  onOutputSubTabChange = () => {},
  outputTabs = [],
  activeTalk = null,
  activeBlock = null,
  activeAccountName = '',
  outputChatPrompt = '',
  onCopyChatPrompt = () => {},
  activeGuidedTurn = null,
  guidedTurnIndex = 0,
  activeGuidedTurns = [],
  guidedDrafts = {},
  onGuidedDraftChange = () => {},
  onMoveGuidedTurn = () => {},
  activeDialogueRoles = [],
  v2PracticeRole = '',
  onSetV2PracticeRole = () => {},
  rolePlayPauseSeconds = 4,
  onRolePlayPauseChange = () => {},
  isRolePlaying = false,
  onToggleRolePlay = () => {},
  activeDialogueLines = [],
  getDialogueLineLabel = () => '',
  showChineseInPractice = false,
  outputDraft = '',
  onOutputDraftChange = () => {},
  onClearOutputDraft = () => {},
  onSaveOutputDraft = () => {}
}) {
  return <ModulePageShell
    pageClassName="outputPage"
    tabs={outputTabs}
    tabValue={outputSubTab}
    onTabChange={onOutputSubTabChange}
    headerLabel="输出"
    headerTitle={activeCourse?.title || '未选择课程'}
    headerSubtitle="把输入内容迁移到真实生活场景，强化连续表达。"
  >
    {!activeCourse && <div className="emptyState">请先在 Library 选择课程。</div>}
    {activeCourse && outputSubTab === 'overview' && <div className="v2Panel compactPanel outputOverviewCard">
      <h2>真实场景迁移</h2>
      <div className="infoGrid">
        <div><strong>场景</strong><p>{activeTalk?.scenarioCn || activeTalk?.scenarioEn || activeBlock?.background?.SCENE_CN || activeBlock?.background?.SCENE_EN || '暂无场景。'}</p></div>
        <div><strong>角色</strong><p>{activeTalk?.aiRole || 'Staff'} ↔ {activeTalk?.userRole || activeAccountName || 'Learner'}</p></div>
      </div>
      <div className="sourceActions">
        <button className="primaryAction" onClick={() => onOutputSubTabChange('guided')}>开始引导输出</button>
      </div>
      <details className="secondaryMenu">
        <summary>更多工具</summary>
        <div className="secondaryMenuActions">
          <button className="subtleAction" onClick={onCopyChatPrompt}>复制到 ChatGPT App</button>
        </div>
        <details>
          <summary>查看提示词</summary>
          <textarea className="smallTextarea" value={outputChatPrompt} onChange={() => {}} readOnly />
        </details>
      </details>
    </div>}
    {activeCourse && outputSubTab === 'guided' && <div className="v2Panel compactPanel outputGuidedCard">
      <h2>引导输出</h2>
      {activeTalk ? <div className="talkCard">
        <p>{activeTalk.scenarioCn || activeTalk.scenarioEn}</p>
        <small>{activeTalk.aiRole} ↔ {activeTalk.userRole}</small>
        {activeGuidedTurn ? <div className="talkTurn" key={activeGuidedTurn.id}>
          <div className="spellingHead">
            <small>回合 {Math.min(guidedTurnIndex + 1, activeGuidedTurns.length)} / {activeGuidedTurns.length}</small>
          </div>
          <strong>{activeGuidedTurn.aiPrompt}</strong>
          <textarea className="smallTextarea" placeholder="输入你的口语回答（可先口头说，再写）。" value={guidedDrafts[activeGuidedTurn.id] || ''} onChange={e => onGuidedDraftChange(activeGuidedTurn.id, e.target.value)} />
          <div className="sourceActions">
            <button className="primaryAction" onClick={() => onMoveGuidedTurn(1)} disabled={guidedTurnIndex >= activeGuidedTurns.length - 1}>下一回合</button>
          </div>
          <details className="secondaryMenu">
            <summary>更多操作</summary>
            <div className="secondaryMenuActions">
              <button className="subtleAction" onClick={() => onMoveGuidedTurn(-1)} disabled={guidedTurnIndex <= 0}>上一回合</button>
              <button className="subtleAction" onClick={() => onOutputSubTabChange('role_play')}>进入角色扮演</button>
            </div>
            {(activeTalk?.helpfulExpressions || []).length > 0 && <div className="helpfulList">{(activeTalk.helpfulExpressions || []).map(item => <span key={item}>{item}</span>)}</div>}
            {activeGuidedTurn.sampleAnswer && <details><summary>参考回答</summary><p>{activeGuidedTurn.sampleAnswer}</p></details>}
          </details>
        </div> : <div className="emptyState">暂无回合内容。</div>}
      </div> : <div className="emptyState">暂无 Guided Output 任务。</div>}
    </div>}
    {activeCourse && outputSubTab === 'role_play' && <div className="v2Panel compactPanel outputRoleCard">
      <h2>角色扮演</h2>
      <div className="sourceActions twoActions compactActions">
        <select value={v2PracticeRole || activeDialogueRoles[0] || ''} onChange={e => onSetV2PracticeRole(e.target.value)} disabled={!activeDialogueRoles.length}>
          {activeDialogueRoles.map(role => <option key={role} value={role}>{role}</option>)}
        </select>
        <button className="primaryAction" onClick={onToggleRolePlay}>{isRolePlaying ? '停止' : '开始角色扮演'}</button>
      </div>
      <details className="secondaryMenu">
        <summary>更多设置</summary>
        <div className="secondaryMenuActions">
          <select value={rolePlayPauseSeconds} onChange={e => onRolePlayPauseChange(Number(e.target.value))}>
            <option value={2}>角色停顿 2 秒</option>
            <option value={4}>角色停顿 4 秒</option>
            <option value={6}>角色停顿 6 秒</option>
          </select>
        </div>
      </details>
      <div className="dialogueCleanList">
        {activeDialogueLines.map((line, index) => <div key={line.id} className="dialogueCleanLine">
          <span>{getDialogueLineLabel(line, index)}</span>
          <p>{line.text}{showChineseInPractice && line.translation && <em>{line.translation}</em>}</p>
        </div>)}
        {activeDialogueLines.length === 0 && <div className="emptyState">暂无对话内容。</div>}
      </div>
    </div>}
    {activeCourse && outputSubTab === 'short_writing' && <div className="v2Panel compactPanel outputWritingCard">
      <h2>短写输出</h2>
      <p>请用 4-6 句英文，完成这个真实生活场景表达。</p>
      <div className="talkCard">
        <strong>{activeTalk?.scenarioEn || activeCourse?.title || '日常生活场景'}</strong>
        {activeTalk?.helpfulExpressions?.length > 0 && <small>建议使用：{activeTalk.helpfulExpressions.slice(0, 6).join(' · ')}</small>}
        <textarea className="smallTextarea" placeholder="用自然口语写一段 4-6 句的英文回答。" value={outputDraft} onChange={e => onOutputDraftChange(e.target.value)} />
        <div className="sourceActions">
          <button className="primaryAction" onClick={onSaveOutputDraft}>保存草稿</button>
        </div>
        <details className="secondaryMenu">
          <summary>更多操作</summary>
          <div className="secondaryMenuActions">
            <button className="subtleAction" onClick={onClearOutputDraft}>清空内容</button>
            <button className="subtleAction" onClick={() => onOutputSubTabChange('overview')}>返回总览</button>
          </div>
        </details>
      </div>
    </div>}
  </ModulePageShell>
}
