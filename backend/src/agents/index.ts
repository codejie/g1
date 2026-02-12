/**
 * Agent 接口定义
 */
export interface Agent {
    id: number;
    type: string;        // Agent 的类型，如 "build" 或 "plan"
    name: string;        // Agent 的名称
    description: string; // Agent 的描述
    version: string;     // Agent 的版本
    skill_name: string;  // Agent 对应的 Skill 名称
    arguments?: string;  // Agent 的参数/提示词
    provider?: string;   // Agent 的提供者 (如 "opencode")
    model?: string;      // Agent 使用的模型 (如 "kimi-k2.5-free")
}

/**
 * Agent 列表
 */
export const agents: Agent[] = [
    {
        id: 1,
        type: 'build',
        name: '测试Agent',
        description: '测试Agent',
        version: '1',
        skill_name: 'session-tester',
        arguments: '提取”session_id“',
        provider: 'opencode',
        model: 'kimi-k2.5-free',
    }
];

/**
 * 通过 id 获取指定的 Agent
 * @param id Agent ID
 */
export function getAgentById(id: number): Agent | undefined {
    return agents.find(agent => agent.id === id);
}

export function getAgentBySkillName(skill_name: string): Agent | undefined {
    return agents.find(agent => agent.skill_name === skill_name);
}

/**
 * 获取 Agent 的消息部件 (parts)
 * 模拟原先类方法中的逻辑`
 */
export function getAgentParts(agent: Agent): any[] {
    return []
    // if (!agent.arguments) {
    //     return [];
    // }
    // return [
    //     {
    //         type: 'text',
    //         text: agent.arguments
    //     }
    // ];
}
