/**
 * Skill 接口定义
 */
export interface Skill {
    id: number;
    type: string;        // Skill 的类型，如 "build" 或 "plan"
    name: string;        // Skill 的名称
    version: string;     // Skill 的版本
    description: string; // Skill 的描述
    provider?: string;   // Skill 的提供者 (如 "opencode")
    model?: string;      // Skill 使用的模型 (如 "kimi-k2.5-free")
    extra_arguments?: string; // Skill 的额外参数
    enabled?: boolean;   // Skill 是否启用
}

/**
 * Skill 列表
 */
export const skills: Skill[] = [
    // {
    //     id: 1,
    //     type: 'build',
    //     name: 'session-tester', // Renamed from '测试Agent' to match typical skill identifier if used as command, or keeping as placeholder
    //     description: '测试Skill',
    //     version: '1',
    //     extra_arguments: '从上下文中获取"session id"信息，包括"command"消息的session_id或"message"消息的SessionID等， "session_id"将被后续操作使用。',
    //     provider: 'opencode',
    //     model: 'kimi-k2.5-free',
    // }
    {
        id: 10,
        type: 'build',
        name: 'test_file_maker', // Renamed from '测试Agent' to match typical skill identifier if used as command, or keeping as placeholder
        description: '测试文件生成的Skill',
        version: '1',
        // extra_arguments: "不要使用'question'等类似'tool'方式提示用户输入，全部采用消息/message方式交互。", // "需要时，使用'question'等类似'tool'发起询问内容。",
        extra_arguments: "需要提示用户时，使用'question'等类似'tool'发起询问内容。",
        // provider: 'opencode',
        // model: 'kimi-k2.5-free'
    }
];

/**
 * 通过 id 获取指定的 Skill
 * @param id Skill ID
 */
export function getSkillById(id: number): Skill | undefined {
    return skills.find(skill => skill.id === id);
}

/**
 * 获取 Skill 的消息部件 (parts)
 */
export function getSkillParts(skill: Skill): any[] {
    return [];
}
