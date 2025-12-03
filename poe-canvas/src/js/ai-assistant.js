// ai-assistant.js - AI-powered productivity features
import { callLLM } from './llm.js';
import { PROMPT_TEMPLATES, fillTemplate } from './prompts.js';
import { updateState } from './state.js';
import { showToast } from './ui.js';
import { renderTasks } from './tasks.js';
import { renderNotes } from './notes.js';
import { renderProjects } from './projects.js';

let appState = null;

export function setAppState(state) {
  appState = state;
}

// ==================== AI Task Breakdown ====================

/**
 * Break down a large task into smaller, actionable subtasks using AI
 * @param {string} taskId - ID of the task to break down
 */
export async function aiBreakdownTask(taskId) {
  const task = appState.tasks.find(t => t.id === taskId);
  if (!task) return;

  // Show loading state
  const loadingToast = showToast('🤖 AI is breaking down your task...', 'info');

  try {
    const prompt = `Break down this task into 3-5 specific, actionable subtasks:

Task: "${task.title}"
${task.tags?.length ? `Context tags: ${task.tags.join(', ')}` : ''}

Return ONLY a JSON array of subtask titles (strings), no explanation:
["First subtask", "Second subtask", "Third subtask"]`;

    const response = await callLLM(prompt, appState);

    // Parse AI response
    let subtasks;
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      subtasks = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      // Fallback: split by lines
      subtasks = response.split('\n')
        .map(line => line.trim().replace(/^[-*•]\s*/, '').replace(/^"\s*|\s*"$/g, ''))
        .filter(line => line.length > 0)
        .slice(0, 5);
    }

    // Create subtasks
    updateState(appState, s => {
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

    renderTasks(appState);
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
  const note = appState.notes.find(n => n.id === noteId);
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

    const response = await callLLM(prompt, appState);

    // Parse AI response
    let enhancements;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      enhancements = JSON.parse(jsonMatch ? jsonMatch[0] : response);
    } catch (e) {
      throw new Error('Failed to parse AI response');
    }

    // Show enhancement modal
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

  // Get selected action items
  const selectedActions = Array.from(modal.querySelectorAll('#aiActionItems input:checked'))
    .map(input => enhancements.actionItems[input.dataset.action]);

  // Get selected tags
  const selectedTags = Array.from(modal.querySelectorAll('.tag.tag-green'))
    .map(tag => tag.textContent.trim());

  // Update note
  updateState(appState, s => {
    const note = s.notes.find(n => n.id === noteId);
    if (note) {
      // Add summary to content
      if (enhancements.summary && !note.content.includes(enhancements.summary)) {
        note.content = `**AI Summary:** ${enhancements.summary}\n\n${note.content}`;
      }

      // Add tags (if we add tag support to notes later)
      note.aiTags = selectedTags;
      note.aiRelated = enhancements.relatedTopics;
    }
  });

  // Create tasks from action items
  if (selectedActions.length > 0) {
    updateState(appState, s => {
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
    renderTasks(appState);
  }

  renderNotes(appState);
  modal.remove();
  showToast(`✨ Applied AI enhancements! Created ${selectedActions.length} tasks.`, 'success');
}

// Global function for onclick handlers
window.applyEnhancements = applyEnhancements;

// ==================== AI Project Insights ====================

/**
 * Get AI insights and recommendations for a project
 * @param {string} projectId - ID of the project to analyze
 */
export async function aiProjectInsights(projectId) {
  const project = appState.projects.find(p => p.id === projectId);
  if (!project) return;

  const projectTasks = appState.tasks.filter(t => t.projectId === projectId);

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

    const response = await callLLM(prompt, appState);

    // Parse AI response
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

  updateState(appState, s => {
    insights.nextSteps.forEach((step, i) => {
      s.tasks.push({
        id: `task-${Date.now()}-${i}`,
        title: step,
        completed: false,
        priority: i === 0 ? 'high' : 'medium', // First step is high priority
        tags: ['🤖 ai-suggested', '🎯 next-step'],
        projectId: projectId,
        createdAt: new Date().toISOString()
      });
    });
  });

  renderTasks(appState);
  document.querySelector('.modal-overlay').remove();
  showToast(`✨ Created ${insights.nextSteps.length} next-step tasks!`, 'success');
}

// Global function for onclick handlers
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

  // Remove existing context menu
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

  // Close on click outside
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
      { icon: 'fas fa-list', label: 'AI: Generate Checklist', action: 'checklist' },
      { icon: 'fab fa-google', label: 'Search Google', action: 'search' }
    ],
    note: [
      { icon: 'fas fa-magic', label: 'AI: Enhance Note', action: 'enhance' },
      { icon: 'fas fa-compress', label: 'AI: Summarize', action: 'summarize' },
      { icon: 'fas fa-tasks', label: 'AI: Extract Actions', action: 'extract-actions' },
      { icon: 'fas fa-tags', label: 'AI: Suggest Tags', action: 'suggest-tags' },
      { icon: 'fas fa-expand', label: 'AI: Expand Outline', action: 'expand' },
      { icon: 'fab fa-google', label: 'Search Google', action: 'search' }
    ],
    project: [
      { icon: 'fas fa-chart-line', label: 'AI: Project Insights', action: 'insights' },
      { icon: 'fas fa-bullseye', label: 'AI: Suggest Next Steps', action: 'next-steps' },
      { icon: 'fas fa-exclamation-triangle', label: 'AI: Identify Blockers', action: 'blockers' }
    ]
  };

  return baseItems[itemType] || [];
}


// ==================== Additional AI Functions ====================

async function aiEstimateTime(taskId) {
  const task = appState.tasks.find(t => t.id === taskId);
  showToast('🤖 AI is estimating time...', 'info');

  try {
    const prompt = `Estimate how long this task will take.Return ONLY a simple time estimate like "30 minutes", "2 hours", "1 day", etc.

    Task: "${task.title}"`;

    const estimate = await callLLM(prompt, appState);
    showToast(`⏱️ AI estimates: ${estimate.trim()} `, 'success');
  } catch (error) {
    showToast('❌ Estimation failed', 'error');
  }
}

async function aiFindRelated(taskId) {
  showToast('🔍 AI is finding related tasks...', 'info');
  // TODO: Implement semantic search across tasks
  showToast('🚧 Coming soon: AI-powered task relationships', 'info');
}

async function aiGenerateChecklist(taskId) {
  const task = appState.tasks.find(t => t.id === taskId);
  showToast('🤖 AI is generating checklist...', 'info');

  try {
    const prompt = `Create a checklist for this task.Return ONLY a JSON array of checkbox items.

    Task: "${task.title}"

Return format: ["Step 1", "Step 2", "Step 3"]`;

    const response = await callLLM(prompt, appState);
    // TODO: Add checklist support to tasks
    showToast('✅ Checklist generated! (Feature coming soon)', 'info');
  } catch (error) {
    showToast('❌ Checklist generation failed', 'error');
  }
}

async function aiSummarizeNote(noteId) {
  const note = appState.notes.find(n => n.id === noteId);
  showToast('🤖 AI is summarizing...', 'info');

  try {
    const prompt = `Summarize this note in one concise sentence:

  Title: "${note.title}"
  Content: "${note.content}"`;

    const summary = await callLLM(prompt, appState);
    showToast(`📝 Summary: ${summary.trim()} `, 'success');
  } catch (error) {
    showToast('❌ Summarization failed', 'error');
  }
}

async function aiExtractActions(noteId) {
  const note = appState.notes.find(n => n.id === noteId);
  // Reuse the enhance function which already does this
  await aiEnhanceNote(noteId);
}

async function aiSuggestTags(noteId) {
  showToast('🏷️ AI is suggesting tags...', 'info');
  // Part of enhance function
  await aiEnhanceNote(noteId);
}

async function aiExpandOutline(noteId) {
  const note = appState.notes.find(n => n.id === noteId);
  showToast('🤖 AI is expanding outline...', 'info');

  try {
    const prompt = `Expand this note into a detailed outline with subpoints:

  Title: "${note.title}"
  Content: "${note.content}"

Return a markdown outline with headers and bullet points.`;

    const expanded = await callLLM(prompt, appState);
    // Show in modal or update note
    showToast('📋 Outline expanded! (Preview coming soon)', 'info');
  } catch (error) {
    showToast('❌ Outline expansion failed', 'error');
  }
}

async function aiSuggestNextSteps(projectId) {
  // Reuse project insights
  await aiProjectInsights(projectId);
}

async function aiIdentifyBlockers(projectId) {
  // Reuse project insights
  await aiProjectInsights(projectId);
}

// ==================== Smart Google Search ====================

async function aiSmartSearch(itemId, itemType) {
  let content = '';

  if (itemType === 'task') {
    const task = appState.tasks.find(t => t.id === itemId);
    if (!task) return;
    content = `Task: ${task.title} `;
  } else if (itemType === 'note') {
    const note = appState.notes.find(n => n.id === itemId);
    if (!note) return;
    content = `Note Title: ${note.title} \nContent: ${note.content} `;
  } else {
    return;
  }

  showToast('🔍 Generating search query...', 'info');

  try {
    const prompt = `Generate an optimal Google Search query to help with this item.Return ONLY the query string, no quotes.

    ${content} `;

    const query = await callLLM(prompt, appState);
    const cleanQuery = query.trim().replace(/^"|"$/g, '');

    showToast(`🚀 Searching: ${cleanQuery} `, 'success');
    window.open(`https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}`, '_blank');

  } catch (error) {
    console.error('Smart search failed:', error);
    // Fallback to simple title search
    const fallback = itemType === 'task'
      ? appState.tasks.find(t => t.id === itemId).title
      : appState.notes.find(n => n.id === itemId).title;

    window.open(`https://www.google.com/search?q=${encodeURIComponent(fallback)}`, '_blank');
  }
}

// Export all functions
export default {
  setAppState,
  aiBreakdownTask,
  aiEnhanceNote,
  aiProjectInsights,
  showAIContextMenu,
  aiContextAction,
  applyEnhancements,
  createTasksFromInsights
};

// ==================== Global Wrapper Functions ====================

/**
 * Show AI menu for tasks (called from task items)
 */
window.showTaskAIMenu = function (event, taskId) {
  event.preventDefault();
  event.stopPropagation();
  showAIContextMenu(event, 'task', taskId);
};

/**
 * Show AI menu for notes (called from note cards)
 */
window.showNoteAIMenu = function (event, noteId) {
  event.preventDefault();
  event.stopPropagation();
  showAIContextMenu(event, 'note', noteId);
};

/**
 * Show AI menu for projects (called from project cards)
 */
window.showProjectAIMenu = function (event, projectId) {
  event.preventDefault();
  event.stopPropagation();
  showAIContextMenu(event, 'project', projectId);
};

/**
 * Initialize task AI menu (called after rendering)
 */
window.initTaskAIMenu = function () {
  // Could add additional initialization here if needed
  console.log('Task AI menu initialized');
};

/**
 * Initialize note AI menu (called after rendering)
 */
window.initNoteAIMenu = function () {
  console.log('Note AI menu initialized');
};

/**
 * Initialize project AI menu (called after rendering)
 */
window.initProjectAIMenu = function () {
  console.log('Project AI menu initialized');
};

// ==================== AI Templates & Artifacts ====================

export function setupAITemplates() {
  const select = document.getElementById('aiTemplateSelect');
  if (!select) return;

  // Populate dropdown
  PROMPT_TEMPLATES.forEach(template => {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = template.name;
    select.appendChild(option);
  });

  // Handle selection
  select.addEventListener('change', () => {
    const templateId = select.value;
    if (!templateId) return;

    const template = PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const input = document.getElementById('aiInput');
      input.value = template.template;
      input.focus();
      // Reset selection so it can be selected again
      select.value = '';
    }
  });

  // Handle Artifact Generation
  document.getElementById('aiArtifactBtn')?.addEventListener('click', generateArtifact);
}

async function generateArtifact() {
  const input = document.getElementById('aiInput');
  const prompt = input.value.trim();

  if (!prompt) {
    showToast('Please enter a prompt for the artifact', 'warning');
    return;
  }

  showToast('Creating artifact...', 'info');

  try {
    const fullPrompt = `Create a detailed, structured Markdown report/artifact based on this request: "${prompt}".
    
    Requirements:
    - Use proper Markdown formatting (H1, H2, lists, code blocks).
    - Be comprehensive and professional.
    - Return ONLY the markdown content.`;

    const content = await callLLM(fullPrompt, appState);

    // Save to file (Download)
    const filename = `Artifact-${Date.now()}.md`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    showToast('Artifact created & downloaded!', 'success');

  } catch (error) {
    console.error('Artifact generation failed:', error);
    showToast('Failed to create artifact', 'error');
  }
}
