# OpenCode 模块
- 描述了模块的API接口请求和应答数据结构定义，以及模块的功能描述和实现细节等内容。
- API接口的具体规则描述见[API 文档](spec/api.md)，数据结构定义在`types/oc.ts`中。
- OpenCode的接口定义在`types/opencode/types.gen.ts`中
    - 创建会话接口 `/session`， POST
    - 消息接口 `/session/:session_id/message`, POST
- 重要：仅处理数据库操作和文件操作，不要改动已完成的功能实现细节描述，如有需要改动，请先与相关开发人员沟通确认。

## 模块功能描述
### 创建会话接口
1. 接收`oc/sesstion/create`接口请求，调用OpenCode的*创建会话接口*，创建一个新的OpenCode会话
2. 返回应答数据结构，包括会话ID，会话类型，会话标题等信息
3. 数据库操作：将创建的会话信息保存到数据库中`oc_sessions`表，包括会话ID、会话类型、会话标题等信息

### 设置会话参数接口
1. 接收`oc/sesstion/update`接口请求，更新指定会话的参数信息，如会话类型、关联的应用类型等
2. 更新会话的参数信息，返回应答数据

### 会话交互接口
1. 接收`oc/sesstion/message`接口请求，获取用户输入的消息内容
2. 将用户输入的消息内容重新组织为OpenCode的*消息接口*请求消息，并转发到OpenCode接口
3. 获取OpenCode接口返回的响应消息，重新组织为应答数据返回给用户
4. 文件操作：将提交的消息内容和OpenCode接口返回的响应消息内容以文件形式存储在服务器上，存储路径为`data/session_message/{session_id}.json`，采用JSON格式，使用`append`模式存储

## API接口定义
### 创建会话接口
- 接口路径: `/oc/session/create`
- 请求方法: `POST`
- 请求数据结构:
```typescript
{
    type?: number; // 会话类型，如"0/general", "1/coding", "2/debugging"等
    title?: string; // 会话标题
    extra?: Record<string, any>; // 其他可选参数，保留
}
```
- 应答数据结构:
```typescript
{
    session_id: number; // 会话ID
    type: number; // 会话类型，如"0/general", "1/coding", "2/debugging"等
    title: string; // 会话标题
    agent_id?: number; // 处理消息的Agent ID，可选, 缺省为0
}
```

### 设置会话参数接口
- 接口路径: `/oc/session/update`
- 请求方法: `POST`
- 请求数据结构:
```typescript
{
    session_id: number; // 会话ID
    type?: number; // 会话类型，如"0/general", "1/coding", "2/debugging"等
    app_type?: number; // 会话关联的应用类型，如"0/web", "1/android", "2/ios", "3/mobile"等
    extra?: Record<string, any>; // 其他可选参数，保留
}
```
- 应答数据结构:
```typescript
{
    session_id: number; // 会话ID
    type: number; // 会话类型，如"0/general", "1/coding", "2/debugging"等
    agent_id?: number; // 处理消息的Agent ID，可选
}
```

### 会话交互接口
- 接口路径: `/oc/session/message`
- 请求方法: `POST`
- 请求数据结构:
```typescript
{
    session_id: number; // 会话ID
    content: string; // 用户输入的消息内容
    extra?: Record<string, any>; // 其他可选参数，保留
}
```
- 应答数据结构:
```typescript
{
    session_id: number; // 会话ID
    agent_id?: number; // 处理消息的Agent ID，可选
    items: {
        id: string; // 消息ID
        role: string; // 消息角色，如"user", "assistant", "system"等
        type: string; // 消息类型，如"text", "image", "file"等
        content: string; // 消息内容
        created: string; // 消息创建时间
    }
}
```

### Skills_Callback接口
- 描述：供OpenCode中Skills模块调用使用，当OpenCode中的技能执行中或完成后，调用该接口将技能执行结果回传给系统
- 接口路径: `/oc/skills/callback`
- 请求方法: `POST`
- 请求数据结构:
```typescript
{
    session_id: string; // 会话ID
    agent_id: number; // Agent ID
    skill_id?: string; // 技能ID
    event: string; // 事件类型，如"message", "command", "skill"等
    type: string; // 数据类型
    data: any; // 数据，具体内容根据技能定义而定
}
```
- 应答数据结构:
```typescript
{
    code: number; // 是否成功接收技能回调数据
    message?: string; // 其他可选信息，如错误消息等
    result?: any; // 其他可选数据，如处理结果等
}
```

### SSE接口
- 描述：通过此接口向供用户前端页面提供SSE数据流，实时推送OpenCode会话的消息内容等信息
- 接口路径: `/oc/session/sse`
- 请求方法: `GET`
- 请求参数:
```typescript
{
    session_id: number; // 会话ID
    agent_id?: number; // 处理消息的Agent ID，可选
    agent_name?: string; // Agent名称，可选
    type: string; // 数据类型，
    data: any; // 数据
}
```

### QuestionReply接口
- 描述：提供前端页面调用，用于向OpenCode发送问题反馈; oc模块收到请求后，调用OpenCode的*QuestionReply消息接口*，将问题反馈转发到OpenCode接口，并获取OpenCode接口返回的响应消息，重新组织为应答数据返回给用户
- 接口路径: `/oc/session/question_reply`
- 请求方法: `POST`
- 请求数据结构:
```typescript
{
    session_id: number; // 会话ID
    question_id: string; // 问题ID
    message_id?: string; // 消息ID
    call_id?: string; // 调用ID
    content: string; // 用户输入的消息内容
    extra?: Record<string, any>; // 其他可选参数，保留
}
```
- 应答数据结构:
```typescript
{
    code: number; // 是否成功接收技能回调数据
    message?: string; // 其他可选信息，如错误消息等
    result?: any; // 其他可选数据，如处理结果等
}
```