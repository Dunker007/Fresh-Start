// ai-assistant.js - AI-powered productivity features
import { sendToLocalLLM } from './llm.js';
import { getState, updateState } from './state.js';
import { showToast } from './ui.js';
import { renderTasks } from './tasks.js';
import { renderNotes } from './notes.js';
import { renderProjects } from './projects.js';

// ==================== AI Loading State Helpers ====================

/**
 * Set loading state on an AI action button
 * @param {HTMLElement} buttonEl - The button element
 * @param {boolean} loading - Whether to show loading state
 * @param {string} originalIcon - Original icon class (default: fa-magic)
 */
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

/**
 * Create a loading indicator element
 * @param {string} message - Loading message to display
 * @returns {HTMLElement} Loading element
 */
export function createLoadingIndicator(message = 'AI is thinking...') {
  const loader = document.createElement('div');
  loader.className = 'ai-loading-indicator';
  loader.innerHTML = `
    <div class="loading-spinner"></div>
    <span>${message}</span>
  `;
  return loader;
}

/**
 * Wrap an AI operation with loading state
 * @param {HTMLElement} buttonEl - Button that triggered the action
 * @param {Function} operation - Async operation to perform
 * @param {string} originalIcon - Original icon class
 */
export async function withAILoading(buttonEl, operation, originalIcon = 'fa-magic') {
  setAILoading(buttonEl, true, originalIcon);
  try {
    await operation();
  } finally {
    setAILoading(buttonEl, false, originalIcon);
  }
}

// ==================== AI Task Breakdown ====================

/**
 * Break down a large task into smaller, actionable subtasks using AI
 * @param {string} taskId - ID of the task to break down
 */
export async function aiBreakdownTask(taskId) {
  const state = getState();
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  showToast('🤖 AI is breaking down your task...', 'info');

  try {
    const prompt = `Break down this task into 3-5 specific, actionable subtasks:

Task: "${task.title}"
${task.tags?.length ? `Context tags: ${task.tags.join(', ')}` : ''}

Return ONLY a JSON array of subtask titles (strings), no explanation:
["First subtask", "Second subtask", "Third subtask"]`;

    const response = await sendToLocalLLM(prompt);

    // Parse AI response
    let subtasks;
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      subtasks = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      subtasks = response.split('\n')
        .map(line => line.trim().replace(/^[-*•]\s*/, '').replace(/^"\s*|\s*"$/g, ''))
        .filter(line => line.length > 0)
        .slice(0, 5);
    }

    // Create subtasks
    updateState(s => {
      subtasks.forEach((subtaskTitle, index) => {
        const subtask = {
          id: `task-${Date.now()}-${index}`,
          title: subtaskTitle,
          completed: false,
          priority: task.priority || 'low',
          tags: [...(task.tags || []), '🤖 ai-generated'],
          due: task.due,
          parentId: task.id,
          createdAt: new Date().toISOString()
        };
        s.tasks.push(subtask);
      });

      // Add metadata to parent task
      task.hasSubtasks = true;
      task.subtaskCount = subtasks.length;
    });

    renderTasks();
    showToast(`✨ Created ${subtasks.length} subtasks!`, 'success');

  } catch (error) {
    console.error('AI task breakdown failed:', error);
    showToast('❌ AI breakdown failed. Is your LLM running?', 'error');
  }
}

// ==================== AI Note Enhancement ====================

/**
 * Enhance a note with AI: summarize, extract actions, suggest tags
 * @param {string} noteId - ID of the note to enhance
 */
export async function aiEnhanceNote(noteId) {
  const state = getState();
  const note = state.notes.find(n => n.id === noteId);
  if (!note) return;

  showToast('🤖 AI is analyzing your note...', 'info');

  try {
    const prompt = `Analyze this note and provide enhancements:

Title: "${note.title}"
Content: "${note.content}"

Return a JSON object with:
{
  "summary": "One sentence summary",
  "actionItems": ["action 1", "action 2"],
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "relatedTopics": ["topic1", "topic2"]
}`;

    const response = await sendToLocalLLM(prompt);

    let enhancements;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      enhancements = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      throw new Error('Failed to parse AI response');
    }

    showEnhancementModal(note, enhancements);

  } catch (error) {
    console.error('AI note enhancement failed:', error);
    showToast('❌ AI enhancement failed. Is your LLM running?', 'error');
  }
}

/**
 * Show modal with AI enhancement suggestions
 */
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

/**
 * Apply AI enhancements to a note
 */
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
  });

  if (selectedActions.length > 0) {
    updateState(s => {
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
    });
    renderTasks();
  }

  renderNotes();
  modal.remove();
  showToast(`✨ Applied AI enhancements! Created ${selectedActions.length} tasks.`, 'success');
}

window.applyEnhancements = applyEnhancements;

// ==================== AI Project Insights ====================

/**
 * Get AI insights and recommendations for a project
 * @param {string} projectId - ID of the project to analyze
 */
export async function aiProjectInsights(projectId) {
  const state = getState();
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return;

  const projectTasks = state.tasks.filter(t => t.projectId === projectId);

  showToast('🤖 AI is analyzing your project...', 'info');

  try {
    const prompt = `Analyze this project and provide insights:

Project: "${project.name}"
Description: "${project.description || 'No description'}"
Total Tasks: ${projectTasks.length}
Completed: ${projectTasks.filter(t => t.completed).length}
High Priority: ${projectTasks.filter(t => t.priority === 'high').length}

Recent Tasks:
${projectTasks.slice(0, 5).map(t => `- ${t.title} [${t.completed ? 'Done' : 'Todo'}]`).join('\n')}

Provide a JSON object with:
{
  "status": "on-track|at-risk|blocked",
  "nextSteps": ["step 1", "step 2", "step 3"],
  "blockers": ["potential blocker 1"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "estimatedCompletion": "1-2 weeks|2-4 weeks|etc"
}`;

    const response = await sendToLocalLLM(prompt);

    let insights;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      insights = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      throw new Error('Failed to parse AI response');
    }

    showProjectInsightsModal(project, insights);

  } catch (error) {
    console.error('AI project insights failed:', error);
    showToast('❌ AI analysis failed. Is your LLM running?', 'error');
  }
}

/**
 * Show modal with AI project insights
 */
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

/**
 * Create tasks from AI project insights
 */
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

  renderTasks();
  document.querySelector('.modal-overlay').remove();
  showToast(`✨ Created ${insights.nextSteps.length} next-step tasks!`, 'success');
}

window.createTasksFromInsights = createTasksFromInsights;

// ==================== AI Context Menu ====================

/**
 * Show AI-powered context menu for any item
 * @param {Event} e - Mouse event
 * @param {string} itemType - 'task'|'note'|'project'
 * @param {string} itemId - ID of the item
 */
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
    <div class="dropdown-item" onclick="window.aiContextAction('${item.action}', '${itemType}', '${itemId}')">
      <i class="${item.icon}"></i>
      <span>${item.label}</span>
    </div>
  `).join('');

  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once: true });
  }, 100);
}

/**
 * Get appropriate context menu items based on item type
 */
function getContextMenuItems(itemType, itemId) {
  const baseItems = {
    task: [
      { icon: 'fas fa-magic', label: 'AI: Break into Subtasks', action: 'breakdown' },
      { icon: 'fas fa-clock', label: 'AI: Estimate Time', action: 'estimate' },
      { icon: 'fas fa-link', label: 'AI: Find Related Tasks', action: 'related' },
      { icon: 'fas fa-list', label: 'AI: Generate Checklist', action: 'checklist' }
    ],
    note: [
      { icon: 'fas fa-magic', label: 'AI: Enhance Note', action: 'enhance' },
      { icon: 'fas fa-compress', label: 'AI: Summarize', action: 'summarize' },
      { icon: 'fas fa-tasks', label: 'AI: Extract Actions', action: 'extract-actions' },
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

/**
 * Handle AI context menu action
 */
export async function aiContextAction(action, itemType, itemId) {
  const actionMap = {
    'breakdown': () => aiBreakdownTask(itemId),
    'estimate': () => aiEstimateTime(itemId),
    'related': () => aiFindRelated(itemId),
    'checklist': () => aiGenerateChecklist(itemId),
    'enhance': () => aiEnhanceNote(itemId),
    'summarize': () => aiSummarizeNote(itemId),
    'extract-actions': () => aiExtractActions(itemId),
    'suggest-tags': () => aiSuggestTags(itemId),
    'expand': () => aiExpandOutline(itemId),
    'insights': () => aiProjectInsights(itemId),
    'next-steps': () => aiSuggestNextSteps(itemId),
    'blockers': () => aiIdentifyBlockers(itemId)
  };

  const handler = actionMap[action];
  if (handler) {
    await handler();
  } else {
    showToast(`🚧 ${action} coming soon!`, 'info');
  }
}

window.aiContextAction = aiContextAction;

// ==================== Additional AI Functions ====================

async function aiEstimateTime(taskId) {
  const state = getState();
  const task = state.tasks.find(t => t.id === taskId);
  showToast('🤖 AI is estimating time...', 'info');

  try {
    const prompt = `Estimate how long this task will take. Return ONLY a simple time estimate like "30 minutes", "2 hours", "1 day", etc.

Task: "${task.title}"`;

    const estimate = await sendToLocalLLM(prompt);
    showToast(`⏱️ AI estimates: ${estimate.trim()}`, 'success');
  } catch (error) {
    showToast('❌ Estimation failed', 'error');
  }
}

async function aiFindRelated(taskId) {
  showToast('🔍 AI is finding related tasks...', 'info');
  showToast('🚧 Coming soon: AI-powered task relationships', 'info');
}

async function aiGenerateChecklist(taskId) {
  const state = getState();
  const task = state.tasks.find(t => t.id === taskId);
  showToast('🤖 AI is generating checklist...', 'info');

  try {
    const prompt = `Create a checklist for this task. Return ONLY a JSON array of checkbox items.

Task: "${task.title}"

Return format: ["Step 1", "Step 2", "Step 3"]`;

    const response = await sendToLocalLLM(prompt);
    showToast('✅ Checklist generated! (Feature coming soon)', 'info');
  } catch (error) {
    showToast('❌ Checklist generation failed', 'error');
  }
}

async function aiSummarizeNote(noteId) {
  const state = getState();
  const note = state.notes.find(n => n.id === noteId);
  showToast('🤖 AI is summarizing...', 'info');

  try {
    const prompt = `Summarize this note in one concise sentence:

Title: "${note.title}"
Content: "${note.content}"`;

    const summary = await sendToLocalLLM(prompt);
    showToast(`📝 Summary: ${summary.trim()}`, 'success');
  } catch (error) {
    showToast('❌ Summarization failed', 'error');
  }
}

async function aiExtractActions(noteId) {
  await aiEnhanceNote(noteId);
}

async function aiSuggestTags(noteId) {
  showToast('🏷️ AI is suggesting tags...', 'info');
  await aiEnhanceNote(noteId);
}

async function aiExpandOutline(noteId) {
  const state = getState();
  const note = state.notes.find(n => n.id === noteId);
  showToast('🤖 AI is expanding outline...', 'info');

  try {
    const prompt = `Expand this note into a detailed outline with subpoints:

Title: "${note.title}"
Content: "${note.content}"

Return a markdown outline with headers and bullet points.`;

    const expanded = await sendToLocalLLM(prompt);
    showToast('📋 Outline expanded! (Preview coming soon)', 'info');
  } catch (error) {
    showToast('❌ Outline expansion failed', 'error');
  }
}

async function aiSuggestNextSteps(projectId) {
  await aiProjectInsights(projectId);
}

async function aiIdentifyBlockers(projectId) {
  await aiProjectInsights(projectId);
}

// Export all functions
export default {
  aiBreakdownTask,
  aiEnhanceNote,
  aiProjectInsights,
  showAIContextMenu,
  aiContextAction,
  applyEnhancements,
  createTasksFromInsights,
  setAILoading,
  withAILoading,
  createLoadingIndicator
};

// ==================== Global Wrapper Functions ====================

window.showTaskAIMenu = function (event, taskId) {
  event.preventDefault();
  event.stopPropagation();
  showAIContextMenu(event, 'task', taskId);
};

window.showNoteAIMenu = function (event, noteId) {
  event.preventDefault();
  event.stopPropagation();
  showAIContextMenu(event, 'note', noteId);
};

window.showProjectAIMenu = function (event, projectId) {
  event.preventDefault();
  event.stopPropagation();
  showAIContextMenu(event, 'project', projectId);
};
