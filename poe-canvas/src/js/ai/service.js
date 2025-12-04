// ai/service.js - AI Logic and API interactions
import { sendToLocalLLM } from '../llm.js';
import { getState } from '../state.js';

/**
 * Break down a task into subtasks
 * @param {string} taskId 
 * @returns {Promise<string[]>} List of subtask titles
 */
export async function breakdownTask(taskId) {
    const state = getState();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const prompt = `Break down this task into 3-5 specific, actionable subtasks:

Task: "${task.title}"
${task.tags?.length ? `Context tags: ${task.tags.join(', ')}` : ''}

Return ONLY a JSON array of subtask titles (strings), no explanation:
["First subtask", "Second subtask", "Third subtask"]`;

    const response = await sendToLocalLLM(prompt);
    return parseJSON(response) || [];
}

/**
 * Enhance a note with summary, actions, tags
 * @param {string} noteId 
 * @returns {Promise<Object>} Enhancements object
 */
export async function enhanceNote(noteId) {
    const state = getState();
    const note = state.notes.find(n => n.id === noteId);
    if (!note) throw new Error('Note not found');

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
    return parseJSON(response);
}

/**
 * Analyze project and provide insights
 * @param {string} projectId 
 * @returns {Promise<Object>} Insights object
 */
export async function analyzeProject(projectId) {
    const state = getState();
    const project = state.projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const projectTasks = state.tasks.filter(t => t.projectId === projectId);

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
    return parseJSON(response);
}

/**
 * Estimate time for a task
 * @param {string} taskId 
 * @returns {Promise<string>} Time estimate
 */
export async function estimateTime(taskId) {
    const state = getState();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const prompt = `Estimate how long this task will take. Return ONLY a simple time estimate like "30 minutes", "2 hours", "1 day", etc.

Task: "${task.title}"`;

    const response = await sendToLocalLLM(prompt);
    return response.trim();
}

/**
 * Summarize a note
 * @param {string} noteId 
 * @returns {Promise<string>} Summary
 */
export async function summarizeNote(noteId) {
    const state = getState();
    const note = state.notes.find(n => n.id === noteId);
    if (!note) throw new Error('Note not found');

    const prompt = `Summarize this note in one concise sentence:

Title: "${note.title}"
Content: "${note.content}"`;

    const response = await sendToLocalLLM(prompt);
    return response.trim();
}

/**
 * Expand a note into an outline
 * @param {string} noteId 
 * @returns {Promise<string>} Markdown outline
 */
export async function expandOutline(noteId) {
    const state = getState();
    const note = state.notes.find(n => n.id === noteId);
    if (!note) throw new Error('Note not found');

    const prompt = `Expand this note into a detailed outline with subpoints:

Title: "${note.title}"
Content: "${note.content}"

Return a markdown outline with headers and bullet points.`;

    return await sendToLocalLLM(prompt);
}

/**
 * Generate a checklist for a task
 * @param {string} taskId 
 * @returns {Promise<string[]>} Checklist items
 */
export async function generateChecklist(taskId) {
    const state = getState();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const prompt = `Create a checklist for this task. Return ONLY a JSON array of checkbox items.

Task: "${task.title}"

Return format: ["Step 1", "Step 2", "Step 3"]`;

    const response = await sendToLocalLLM(prompt);
    return parseJSON(response) || [];
}

// Helper to parse JSON from LLM response
function parseJSON(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (e) {
        console.warn('Failed to parse JSON from LLM response:', text);
        return null;
    }
}

/**
 * Parse natural language into actionable intent
 * @param {string} userMessage - Natural language command
 * @returns {Promise<Object|null>} Intent object or null if no action detected
 */
export async function parseIntent(userMessage) {
    const prompt = `You are a task parser. Analyze this message and determine if it's an actionable command or just a question.

User message: "${userMessage}"

If it's an ACTION (create task, add note, set reminder, etc), return JSON:
{
  "isAction": true,
  "action": "createTask|createNote|setReminder|switchView",
  "params": {
    "title": "extracted title",
    "due": "tomorrow|today|YYYY-MM-DD or null",
    "priority": "high|medium|low or null",
    "content": "note content if applicable"
  },
  "confidence": 0.0-1.0
}

If it's a QUESTION or CHAT, return:
{ "isAction": false }

Common patterns:
- "create task X" / "add task X" / "remind me to X" → createTask
- "make a note about X" / "write down X" → createNote
- "go to dashboard" / "show files" → switchView

Return ONLY valid JSON, no explanation.`;

    try {
        const response = await sendToLocalLLM(prompt);
        const intent = parseJSON(response);

        if (intent && intent.isAction && intent.confidence >= 0.7) {
            return intent;
        }
        return null;
    } catch (e) {
        console.error('Intent parsing failed:', e);
        return null;
    }
}

/**
 * Execute a parsed intent
 * @param {Object} intent - Parsed intent from parseIntent
 * @returns {Object} Result with success and message
 */
export function executeIntent(intent, actions) {
    if (!intent || !intent.isAction) return { success: false };

    const { action, params } = intent;

    switch (action) {
        case 'createTask':
            if (actions.addTask && params.title) {
                actions.addTask({
                    title: params.title,
                    due: parseDueDate(params.due),
                    priority: params.priority || 'medium',
                    tags: ['🤖 ai-created']
                });
                return { success: true, message: `✅ Created task: "${params.title}"` };
            }
            break;

        case 'createNote':
            if (actions.addNote && params.title) {
                actions.addNote({
                    title: params.title,
                    content: params.content || '',
                    color: 'yellow'
                });
                return { success: true, message: `📝 Created note: "${params.title}"` };
            }
            break;

        case 'switchView':
            if (actions.switchView && params.view) {
                actions.switchView(params.view);
                return { success: true, message: `🔀 Switched to ${params.view}` };
            }
            break;
    }

    return { success: false, message: 'Could not execute action' };
}

function parseDueDate(dueString) {
    if (!dueString) return null;

    const today = new Date();
    const lowerDue = dueString.toLowerCase();

    if (lowerDue === 'today') {
        return today.toISOString().split('T')[0];
    }
    if (lowerDue === 'tomorrow') {
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
    }
    if (lowerDue.includes('next week')) {
        today.setDate(today.getDate() + 7);
        return today.toISOString().split('T')[0];
    }
    // If it looks like a date, use it directly
    if (/\d{4}-\d{2}-\d{2}/.test(dueString)) {
        return dueString;
    }
    return null;
}
