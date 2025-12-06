import { LUXRIG_BRIDGE_URL } from './utils';

export interface AgentTask {
    id: string;
    type: 'meeting' | 'workflow' | 'analysis';
    prompt: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: any;
    createdAt: number;
}

export class TaskAgent {
    private static instance: TaskAgent;
    private tasks: Map<string, AgentTask> = new Map();

    private constructor() { }

    public static getInstance(): TaskAgent {
        if (!TaskAgent.instance) {
            TaskAgent.instance = new TaskAgent();
        }
        return TaskAgent.instance;
    }

    public async executeTask(type: AgentTask['type'], prompt: string): Promise<AgentTask> {
        const taskId = Math.random().toString(36).substring(7);
        const task: AgentTask = {
            id: taskId,
            type,
            prompt,
            status: 'pending',
            createdAt: Date.now()
        };

        this.tasks.set(taskId, task);

        // Start async processing
        this.processTask(task);

        return task;
    }

    private async processTask(task: AgentTask) {
        task.status = 'running';
        this.tasks.set(task.id, task);

        try {
            // Mock integration with LuxRig for now, or real call if available
            // In a real scenario, this would call the Python bridge
            console.log(`[TaskAgent] Processing ${task.type}: ${task.prompt}`);

            let result;
            if (task.type === 'meeting') {
                result = await this.mockMeetingSchedule(task.prompt);
            } else {
                // Default to a simple completion call to the bridge
                result = await this.callBridge(task.prompt);
            }

            task.status = 'completed';
            task.result = result;
        } catch (error) {
            console.error('[TaskAgent] Error:', error);
            task.status = 'failed';
            task.result = { error: 'Task execution failed' };
        } finally {
            this.tasks.set(task.id, task);
        }
    }

    private async callBridge(prompt: string) {
        try {
            const res = await fetch(`${LUXRIG_BRIDGE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            return await res.json();
        } catch (e) {
            return { error: 'Bridge unreachable' };
        }
    }

    private async mockMeetingSchedule(prompt: string) {
        // Mock logic
        return {
            action: 'scheduled',
            details: {
                topic: prompt,
                participants: ['Architect', 'Lux', 'Guardian'],
                time: 'Immediate'
            }
        };
    }

    public getTask(id: string): AgentTask | undefined {
        return this.tasks.get(id);
    }
}
