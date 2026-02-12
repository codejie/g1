# Agent描述
- Agent是具有特定能力和职责的智能体，可以执行各种任务；
- Agent的实体是以Skills方式注册在OpenCode侧，通过OpenCode的`command`命令激活；

# Agent构建
## Agent基类
- 基类具有如下属性：
  - id: Agent的唯一标识符
  - type: Agent的类型 //"build" or "plan"
  - name: Agent的名称
  - description: Agent的描述
  - version: Agent的版本
  - skill_name: Agent对应的Skill名称
  - prompt: Agent的提示词，用于指导Agent的行为，非必须
	- provider: Agent的提供者
	- model: Agent使用的模型
- 基类提供如下方法：
  - start:
		- 启动Agent
		-	参数：
			- session_id: 会话ID
			- context: 上下文信息
		- 返回：
			- 与`oc`模块中的`SessionMessageResponse`一致（复制`oc`模块中的`SessionMessageResponse`类型定义）
	
- 基类提供工厂函数或工厂类，用于创建Agent实例

## 测试Agent
- 测试Agent用于测试Agent的功能，属性：
	- id: 1
	- type: 1
	- name: 测试Agent
	- description: 测试Agent
	- version: 1
	- skill_name: app_test
	- prompt: 测试Agent
  - provider: "opencode"
  - model: "kimi-k2.5-free"

