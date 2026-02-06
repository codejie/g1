# OpenCode 模块
- 描述了模块的API接口请求和应答数据结构定义，以及模块的功能描述和实现细节等内容。
- API接口的具体规则描述见[API 文档](spec/api.md)，数据结构定义在`types/oc.ts`中。
- OpenCode的接口定义在`types/opencode/types.gen.ts`中
    - 创建会话接口 `/session`， POST
    - 消息接口 `/session/:session_id/message`, POST
- 重要：暂时不处理数据库操作

## 模块功能描述
### 创建会话接口
1. 接收`oc/sesstion/create`接口请求，调用OpenCode的*创建会话接口*，创建一个新的OpenCode会话
2. 返回应答数据结构，包括会话ID，会话类型，会话标题等信息

### 设置会话参数接口
1. 接收`oc/sesstion/update`接口请求，更新指定会话的参数信息，如会话类型、关联的应用类型等
2. 更新会话的参数信息，返回应答数据

### 会话交互接口
1. 接收`oc/sesstion/message`接口请求，获取用户输入的消息内容
2. 将用户输入的消息内容重新组织为OpenCode的*消息接口*请求消息，并转发到OpenCode接口
3. 获取OpenCode接口返回的响应消息，重新组织为应答数据返回给用户


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