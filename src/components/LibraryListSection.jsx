import React from 'react'
import ModulePageShell from './ModulePageShell'

export default function LibraryListSection({
  tabs = [],
  librarySubTab = 'courses',
  onLibrarySubTabChange = () => {},
  libraryOrganizerOpen = false,
  onToggleOrganizer = () => {},
  onOpenAddContent = () => {},
  query = '',
  onQueryChange = () => {},
  activeCourse = null,
  folderPathText = () => '',
  onEnterPractice = () => {},
  onEnterLearn = () => {},
  onPreloadCourseAudio = () => {},
  audioBusy = false,
  libraryShelfNames = [],
  v2Courses = [],
  libraryDisplayCourses = [],
  contentBlocks = [],
  onRenameCourse = () => {},
  onMoveCourse = () => {},
  onShowCourseCache = () => {},
  folderGroupedCourses = [],
  onCreateTopFolder = () => {},
  onCreateSubFolder = () => {},
  onRenameFolder = () => {},
  libraryStats = null,
  reviewItemsCount = 0
}) {
  return <ModulePageShell
    pageClassName="libraryPage"
    tabs={tabs}
    tabValue={librarySubTab}
    onTabChange={onLibrarySubTabChange}
    headerLabel="图书馆"
    headerTitle="课程书架"
    headerSubtitle="内容管理中心：选课、整理、导入、查看数据。"
  >
    {(librarySubTab === 'courses' || librarySubTab === 'folders') && <div className="libraryTopActions libraryTopActionsV2">
      <button className="primary" onClick={onOpenAddContent}>导入内容</button>
      <button className="secondary" onClick={onToggleOrganizer}>{libraryOrganizerOpen ? '退出整理' : '整理课程'}</button>
    </div>}
    {(librarySubTab === 'courses' || librarySubTab === 'folders') && <input className="search" placeholder="搜索课程或文件夹..." value={query} onChange={e => onQueryChange(e.target.value)} />}
    {librarySubTab === 'courses' && activeCourse && <div className="continueShelfCard continueShelfCardV2">
      <p>继续学习</p>
      <h2>{activeCourse.title}</h2>
      <small>{folderPathText(activeCourse)} · {activeCourse.level || 'Beginner'}</small>
      <div className="sourceActions threeActions">
        <button onClick={() => onEnterLearn(activeCourse.id)}>进入学习</button>
        <button onClick={() => onEnterPractice(activeCourse.id)}>进入练习</button>
        <button className="subtleButton" onClick={() => onPreloadCourseAudio(activeCourse.id)} disabled={audioBusy}>{audioBusy ? '缓存中...' : '缓存音频'}</button>
      </div>
    </div>}
    {librarySubTab === 'courses' && libraryShelfNames.length > 0 && <div className="libraryShelfChips">
      {libraryShelfNames.map(name => <span key={name}>{name}</span>)}
    </div>}
    {librarySubTab === 'courses' && <div className="v2Panel libraryPanel">
      <h2>课程列表</h2>
      {v2Courses.length === 0 && <div className="emptyState">暂无课程，请先导入内容。</div>}
      <div className="courseShelfGrid">
        {libraryDisplayCourses.map(course => {
          const blocks = contentBlocks.filter(block => block.courseId === course.id)
          const isActive = course.id === activeCourse?.id
          return <div className={`sourceCard simpleSource shelfCard ${isActive ? 'activeCourseCard' : ''}`} key={course.id}>
            <div onClick={() => onEnterPractice(course.id)}>
              <h2>{course.title}</h2>
              <p>{course.book || course.type} · {course.level || 'Beginner'} · {course.category || 'General'}</p>
              <div className="sourceStats"><span>{blocks.length} blocks</span><span>{course.type}</span></div>
            </div>
            <small className="coursePath">位置：{folderPathText(course)}</small>
            <div className="sourceActions twoActions">
              <button onClick={() => onEnterLearn(course.id)}>进入学习</button>
              <button onClick={() => onEnterPractice(course.id)}>进入练习</button>
            </div>
            <div className="sourceActions">
              <button className="subtleButton" onClick={() => onPreloadCourseAudio(course.id)} disabled={audioBusy}>{audioBusy ? '缓存中...' : '缓存音频'}</button>
            </div>
            {libraryOrganizerOpen && <div className="sourceActions threeActions">
              <button onClick={() => onRenameCourse(course.id)}>改名</button>
              <button onClick={() => onMoveCourse(course.id)}>移动</button>
              <button onClick={() => onShowCourseCache(course.id)}>缓存</button>
            </div>}
          </div>
        })}
        {v2Courses.length > 0 && !libraryDisplayCourses.length && <div className="emptyState">No course matched your search.</div>}
      </div>
    </div>}
    {librarySubTab === 'folders' && <div className="v2Panel libraryPanel">
      <h2>文件夹整理</h2>
      <div className="libraryOrganizerPanel">
        <div className="libraryFolderToolbar">
          <button onClick={onCreateTopFolder}>+ 新建一级文件夹</button>
          <button onClick={onCreateSubFolder}>+ 新建二级文件夹</button>
        </div>
        {folderGroupedCourses.map(group => <div className="folderSection" key={group.top.id}>
          <div className="folderHeader">
            <strong>📁 {group.top.name}</strong>
            <button onClick={() => onRenameFolder(group.top.id)}>改名</button>
          </div>
          {group.children.map(child => <div key={child.sub.id} className="subFolderBox">
            <div className="folderHeader">
              <strong>└ 📂 {child.sub.name}</strong>
              <button onClick={() => onRenameFolder(child.sub.id)}>改名</button>
            </div>
            <small>{child.courses.length} 门课程</small>
          </div>)}
        </div>)}
      </div>
    </div>}
    {librarySubTab === 'stats' && <div className="v2Panel libraryPanel">
      <h2>学习数据统计</h2>
      <div className="libraryStatsGrid">
        <div><strong>{libraryStats?.courseCount || 0}</strong><span>课程</span></div>
        <div><strong>{libraryStats?.folderCount || 0}</strong><span>文件夹</span></div>
        <div><strong>{libraryStats?.blockCount || 0}</strong><span>内容块</span></div>
        <div><strong>{libraryStats?.expressionCount || 0}</strong><span>表达</span></div>
        <div><strong>{libraryStats?.dialogueLineCount || 0}</strong><span>对话句</span></div>
        <div><strong>{libraryStats?.quickReactionCount || 0}</strong><span>快反题</span></div>
        <div><strong>{libraryStats?.cachedBlockCount || 0}</strong><span>已缓存音频</span></div>
        <div><strong>{reviewItemsCount || 0}</strong><span>复习项</span></div>
      </div>
    </div>}
  </ModulePageShell>
}
