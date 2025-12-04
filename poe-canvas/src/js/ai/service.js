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
