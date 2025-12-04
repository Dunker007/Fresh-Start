// ai/ui.js - AI UI handlers and context menus
import * as AIService from './service.js';
import { updateState } from '../state.js';
import { showToast } from '../ui.js';

// ==================== AI Loading State Helpers ====================

export function setAILoading(buttonEl, loading, originalIcon = 'fa-magic') {
  if (!buttonEl) return;

  if (loading) {
    buttonEl.disabled = true;
    buttonEl.classList.add('ai-loading');
    const icon = buttonEl.querySelector('i');
    if (icon) {
      icon.className = 'fas fa-spinner fa-spin';
    }
  } else {
    buttonEl.disabled = false;
    buttonEl.classList.remove('ai-loading');
    const icon = buttonEl.querySelector('i');
    if (icon) {
      icon.className = `fas ${originalIcon}`;
    }
  }
}

export async function withAILoading(buttonEl, operation, originalIcon = 'fa-magic') {
  setAILoading(buttonEl, true, originalIcon);
  try {
    await operation();
  } finally {
    setAILoading(buttonEl, false, originalIcon);
  }
}

// ==================== Task Handlers ====================

export async function handleBreakdownTask(taskId) {
  showToast('🤖 AI is breaking down your task...', 'info');
  try {
    const subtasks = await AIService.breakdownTask(taskId);

    if (!subtasks || subtasks.length === 0) {
      throw new Error('No subtasks generated');
    }

    updateState(s => {
      const task = s.tasks.find(t => t.id === taskId);
      if (!task) return;

      subtasks.forEach((subtaskTitle, index) => {
        s.tasks.push({
          id: `task-${Date.now()}-${index}`,
          title: subtaskTitle,
          completed: false,
          priority: task.priority || 'low',
          tags: [...(task.tags || []), '🤖 ai-generated'],
          due: task.due,
          parentId: task.id,
          createdAt: new Date().toISOString()
        });
      });

      task.hasSubtasks = true;
      task.subtaskCount = subtasks.length;
    });

    showToast(`✨ Created ${subtasks.length} subtasks!`, 'success');
  } catch (error) {
    console.error('AI breakdown failed:', error);
    showToast('❌ AI breakdown failed.', 'error');
  }
}

export async function handleEstimateTime(taskId) {
  showToast('🤖 AI is estimating time...', 'info');
  try {
    const estimate = await AIService.estimateTime(taskId);
    showToast(`⏱️ AI estimates: ${estimate}`, 'success');
  } catch (error) {
    showToast('❌ Estimation failed', 'error');
  }
}

export async function handleGenerateChecklist(taskId) {
  showToast('🤖 AI is generating checklist...', 'info');
  try {
    const items = await AIService.generateChecklist(taskId);
    showToast(`✅ Generated ${items.length} checklist items! (Feature coming soon)`, 'info');
  } catch (error) {
    showToast('❌ Checklist generation failed', 'error');
  }
}

// ==================== Note Handlers ====================

export async function handleEnhanceNote(noteId) {
  showToast('🤖 AI is analyzing your note...', 'info');
  try {
    const enhancements = await AIService.enhanceNote(noteId);
    if (!enhancements) throw new Error('No enhancements generated');

    const { getState } = await import('../state.js');
    const note = getState().notes.find(n => n.id === noteId);

    if (note) {
      showEnhancementModal(note, enhancements);
    }
  } catch (error) {
    console.error('AI enhancement failed:', error);
    showToast('❌ AI enhancement failed.', 'error');
  }
}

export async function handleSummarizeNote(noteId) {
  showToast('🤖 AI is summarizing...', 'info');
  try {
    const summary = await AIService.summarizeNote(noteId);
    showToast(`📝 Summary: ${summary}`, 'success');
  } catch (error) {
    showToast('❌ Summarization failed', 'error');
  }
}

export async function handleExpandOutline(noteId) {
  showToast('🤖 AI is expanding outline...', 'info');
  try {
    const outline = await AIService.expandOutline(noteId);
    showToast('📋 Outline expanded! (Preview coming soon)', 'info');
  } catch (error) {
    showToast('❌ Outline expansion failed', 'error');
  }
}

// ==================== Project Handlers ====================

export async function handleProjectInsights(projectId) {
  showToast('🤖 AI is analyzing your project...', 'info');
  try {
    const insights = await AIService.analyzeProject(projectId);
    if (!insights) throw new Error('No insights generated');

    const { getState } = await import('../state.js');
    const project = getState().projects.find(p => p.id === projectId);

    if (project) {
      showProjectInsightsModal(project, insights);
    }
  } catch (error) {
    console.error('AI insights failed:', error);
    showToast('❌ AI analysis failed.', 'error');
  }
}

// ==================== Modals ====================

function showEnhancementModal(note, enhancements) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal" style="max-width: 600px;">
      <div class="modal-header">
        <h3 class="modal-title">✨ AI Note Enhancements</h3>
        <button class="btn-icon" onclick="this.closest('.modal-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        ${enhancements.summary ? `
          <div class="form-group">
            <label class="form-label">📝 Summary</label>
            <p style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-sm);">
              ${enhancements.summary}
            </p>
          </div>
        ` : ''}

        ${enhancements.actionItems?.length ? `
          <div class="form-group">
            <label class="form-label">✅ Action Items</label>
            <div id="aiActionItems">
              ${enhancements.actionItems.map((action, i) => `
                <label style="display: flex; align-items: center; gap: 8px; padding: 8px;">
                  <input type="checkbox" checked data-action="${i}">
                  <span>${action}</span>
                </label>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${enhancements.suggestedTags?.length ? `
          <div class="form-group">
            <label class="form-label">🏷️ Suggested Tags</label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${enhancements.suggestedTags.map(tag => `
                <span class="tag tag-blue" style="cursor: pointer;" onclick="this.classList.toggle('tag-green')">
                  ${tag}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${enhancements.relatedTopics?.length ? `
          <div class="form-group">
            <label class="form-label">🔗 Related Topics</label>
            <div style="font-size: 14px; color: var(--text-secondary);">
              ${enhancements.relatedTopics.join(' • ')}
            </div>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn-primary" onclick="window.applyEnhancements('${note.id}', ${JSON.stringify(enhancements).replace(/"/g, '&quot;')})">
          Apply Enhancements
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

export function applyEnhancements(noteId, enhancements) {
  const modal = document.querySelector('.modal-overlay');

  const selectedActions = Array.from(modal.querySelectorAll('#aiActionItems input:checked'))
    .map(input => enhancements.actionItems[input.dataset.action]);

  const selectedTags = Array.from(modal.querySelectorAll('.tag.tag-green'))
    .map(tag => tag.textContent.trim());

  updateState(s => {
    const note = s.notes.find(n => n.id === noteId);
    if (note) {
      if (enhancements.summary && !note.content.includes(enhancements.summary)) {
        note.content = `**AI Summary:** ${enhancements.summary}\n\n${note.content}`;
      }
      note.aiTags = selectedTags;
      note.aiRelated = enhancements.relatedTopics;
    }

    if (selectedActions.length > 0) {
      selectedActions.forEach((action, i) => {
        s.tasks.push({
          id: `task-${Date.now()}-${i}`,
          title: action,
          completed: false,
          priority: 'medium',
          tags: ['📝 from-note', '🤖 ai-generated'],
          sourceNote: noteId,
          createdAt: new Date().toISOString()
        });
      });
    }
  });

  modal.remove();
  showToast(`✨ Applied AI enhancements! Created ${selectedActions.length} tasks.`, 'success');
}

function showProjectInsightsModal(project, insights) {
  const statusColors = {
    'on-track': 'var(--accent-secondary)',
    'at-risk': 'var(--accent-warning)',
    'blocked': 'var(--accent-danger)'
  };

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal" style="max-width: 700px;">
      <div class="modal-header">
        <h3 class="modal-title">🤖 AI Project Insights: ${project.name}</h3>
        <button class="btn-icon" onclick="this.closest('.modal-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">📊 Project Status</label>
          <div style="padding: 16px; background: ${statusColors[insights.status] || 'var(--bg-tertiary)'}33; border-radius: var(--radius-md); border-left: 4px solid ${statusColors[insights.status] || 'var(--accent-primary)'};">
            <strong>${insights.status?.toUpperCase() || 'ANALYZING'}</strong>
            ${insights.estimatedCompletion ? `<br><span style="font-size: 13px;">Estimated completion: ${insights.estimatedCompletion}</span>` : ''}
          </div>
        </div>

        ${insights.nextSteps?.length ? `
          <div class="form-group">
            <label class="form-label">🎯 Recommended Next Steps</label>
            <ol style="margin: 0; padding-left: 20px;">
              ${insights.nextSteps.map(step => `<li style="margin: 8px 0;">${step}</li>`).join('')}
            </ol>
          </div>
        ` : ''}

        ${insights.blockers?.length ? `
          <div class="form-group">
            <label class="form-label">⚠️ Potential Blockers</label>
            <ul style="margin: 0; padding-left: 20px; color: var(--accent-danger);">
              ${insights.blockers.map(blocker => `<li style="margin: 8px 0;">${blocker}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${insights.recommendations?.length ? `
          <div class="form-group">
            <label class="form-label">💡 AI Recommendations</label>
            <ul style="margin: 0; padding-left: 20px;">
              ${insights.recommendations.map(rec => `<li style="margin: 8px 0;">${rec}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
        <button class="btn-primary" onclick="window.createTasksFromInsights('${project.id}', ${JSON.stringify(insights).replace(/"/g, '&quot;')})">
          <i class="fas fa-plus"></i> Create Tasks from Next Steps
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

export function createTasksFromInsights(projectId, insights) {
  if (!insights.nextSteps?.length) return;

  updateState(s => {
    insights.nextSteps.forEach((step, i) => {
      s.tasks.push({
        id: `task-${Date.now()}-${i}`,
        title: step,
        completed: false,
        priority: i === 0 ? 'high' : 'medium',
        tags: ['🤖 ai-suggested', '🎯 next-step'],
        projectId: projectId,
        createdAt: new Date().toISOString()
      });
    });
  });

  document.querySelector('.modal-overlay').remove();
  showToast(`✨ Created ${insights.nextSteps.length} next-step tasks!`, 'success');
}

// ==================== Context Menu ====================

export function showAIContextMenu(e, itemType, itemId) {
  e.preventDefault();

  const existing = document.querySelector('.ai-context-menu');
  if (existing) existing.remove();

  const menu = document.createElement('div');
  menu.className = 'ai-context-menu context-menu';
  menu.style.left = `${e.pageX}px`;
  menu.style.top = `${e.pageY}px`;

  const menuItems = getContextMenuItems(itemType, itemId);

  menu.innerHTML = menuItems.map(item => `
    <div class="dropdown-item" onclick="window.aiContextAction(event, '${item.action}', '${itemType}', '${itemId}')">
      <i class="${item.icon}"></i>
      <span>${item.label}</span>
    </div>
  `).join('');

  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once: true });
  }, 100);
}

function getContextMenuItems(itemType, itemId) {
  const baseItems = {
    task: [
      { icon: 'fas fa-thumbtack', label: 'Pin to Canvas', action: 'pin-canvas' },
      { icon: 'fas fa-magic', label: 'AI: Break into Subtasks', action: 'breakdown' },
      { icon: 'fas fa-clock', label: 'AI: Estimate Time', action: 'estimate' },
      { icon: 'fas fa-list', label: 'AI: Generate Checklist', action: 'checklist' }
    ],
    note: [
      { icon: 'fas fa-thumbtack', label: 'Pin to Canvas', action: 'pin-canvas' },
      { icon: 'fas fa-magic', label: 'AI: Enhance Note', action: 'enhance' },
      { icon: 'fas fa-compress', label: 'AI: Summarize', action: 'summarize' },
      { icon: 'fas fa-tags', label: 'AI: Suggest Tags', action: 'suggest-tags' },
      { icon: 'fas fa-expand', label: 'AI: Expand Outline', action: 'expand' }
    ],
    project: [
      { icon: 'fas fa-chart-line', label: 'AI: Project Insights', action: 'insights' },
      { icon: 'fas fa-bullseye', label: 'AI: Suggest Next Steps', action: 'next-steps' },
      { icon: 'fas fa-exclamation-triangle', label: 'AI: Identify Blockers', action: 'blockers' }
    ]
  };

  return baseItems[itemType] || [];
}

export async function aiContextAction(event, action, itemType, itemId) {
  const buttonEl = event.target.closest('.ai-action-btn');

  if (action === 'pin-canvas') {
    if (itemType === 'note') window.addNoteToCanvas(itemId);
    if (itemType === 'task') window.addTaskToCanvas(itemId);
    return;
  }

  const actionMap = {
    'breakdown': () => withAILoading(buttonEl, () => handleBreakdownTask(itemId)),
    'estimate': () => withAILoading(buttonEl, () => handleEstimateTime(itemId)),
    'checklist': () => withAILoading(buttonEl, () => handleGenerateChecklist(itemId)),
    'enhance': () => withAILoading(buttonEl, () => handleEnhanceNote(itemId)),
    'summarize': () => withAILoading(buttonEl, () => handleSummarizeNote(itemId)),
    'suggest-tags': () => withAILoading(buttonEl, () => handleEnhanceNote(itemId)), // Re-use enhance for now
    'expand': () => withAILoading(buttonEl, () => handleExpandOutline(itemId)),
    'insights': () => withAILoading(buttonEl, () => handleProjectInsights(itemId)),
    'next-steps': () => withAILoading(buttonEl, () => handleProjectInsights(itemId)), // Re-use insights
    'blockers': () => withAILoading(buttonEl, () => handleProjectInsights(itemId)) // Re-use insights
  };

  const handler = actionMap[action];
  if (handler) {
    await handler();
  } else {
    showToast(`🚧 ${action} coming soon!`, 'info');
  }
}

// Global exports for inline event handlers
window.showTaskAIMenu = (e, id) => showAIContextMenu(e, 'task', id);
window.showNoteAIMenu = (e, id) => showAIContextMenu(e, 'note', id);
window.showProjectAIMenu = (e, id) => showAIContextMenu(e, 'project', id);
window.aiContextAction = aiContextAction;
window.applyEnhancements = applyEnhancements;
window.createTasksFromInsights = createTasksFromInsights;
