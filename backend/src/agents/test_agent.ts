import { BaseAgent } from './base';
import { SessionMessageResponse } from '../types/oc';
import { text } from 'stream/consumers';

export class TestAgent extends BaseAgent {
    constructor() {
        super({
            // id: 1,
            type: 'build',
            name: '测试Agent',
            description: '测试Agent',
            version: '1',
            skill_name: 'save-content',
            arguments: '先介绍下你自己和有什么能力。',
            provider: 'opencode',
            model: 'kimi-k2.5-free',
        });
    }

    // async start(session_id: number, context: any): Promise<SessionMessageResponse> {
    //     // 模拟启动逻辑，返回符合 SessionMessageResponse 的数据
    //     return {
    //         session_id,
    //         agent_id: this.id,
    //         items: [
    //             {
    //                 id: Math.random().toString(36).substring(7),
    //                 role: 'assistant',
    //                 type: 'text',
    //                 content: `TestAgent (id: ${this.id}) started for session ${session_id}.`,
    //                 created: new Date().toISOString(),
    //             }
    //         ],
    //     };
    // }

    parts(): any[] {
        if (!this.arguments) {
            return [];
        }
        return [
            {
                type: 'text',
                text: this.arguments
            }
        ]
    }
}
