# Modules 描述
- 本文档描述了系统中模块的相关信息，包括模块的划分、定义、功能、数据库表等, 以及模块对外的API路由接口
- 模块负责系统的核心功能和业务逻辑，数据库表的操作
- 模块负责实现对外路由接口API，处理请求并返回响应，注意JWT认证和权限控制在中间件中实现
    - API接口的具体规则描述见[API 文档](spec/api.md)
- 模块内容放置在各自目录下，包括
    - `model.ts` 文件定义模块的数据结构和数据库表映射,实现数据库表操作及业务逻辑处理函数
    - `router.ts` 文件定义模块的API路由接口，处理请求和响应
    - `handler.ts` 文件实现API路由接口处理函数，调用模块的数据、业务逻辑处理函数
- 模块间通过调用彼此的模块函数实现功能协作

## User 模块
用户模块负责管理系统中的用户信息和用户相关操作。该模块涉及以下数据库表
- `users` 表: 存储用户的基本信息，如用户名、电子邮件、密码等。
- `user_studios` 表: 存储用户与工作室的关联关系。
- `user_tokens` 表: 存储用户登录令牌信息。

### User 模块的 API 路由
- `/user/login`: 用户登录接口。
- `/user/logout`: 用户登出接口。
- `/user/register`: 用户注册接口。
- `/user/delete`: 删除用户账户接口。
- `/user/profile`: 获取和更新用户个人资料接口。
- `/usrer/set-profile`: 设置用户个人资料接口。
- `/user/tokens`: 管理用户登录令牌接口。
- `/user/reset-password`: 用户重置密码接口。
- `/user/studios`: 获取用户所属工作室列表接口。
- `/user/switch-studio`: 切换当前工作室接口。
- `/user/delete-studio`: 解除用户与工作室的绑定接口。
- `/user/create-studio`: 创建新工作室接口。
- `/user/list`: 获取用户列表接口。

## Studio 模块
工作室模块负责管理系统中的工作室信息和工作室相关操作。该模块涉及以下数据库表
- `studios` 表: 存储工作室信息，如名称、描述等。
- `user_studios` 表: 存储用户与工作室的关联，通过调用`User`模块操作，实现用户与工作室的绑定和解绑。

### Studio 模块的 API 路由
- `/studio/list`: 获取工作室列表接口。
- `/studio/create`: 创建新工作室接口。
- `/studio/update`: 更新工作室信息接口。
- `/studio/delete`: 删除工作室接口。
- `/studio/members`: 获取工作室成员列表接口。
- `/studio/add-member`: 向工作室添加成员接口。
- `/studio/remove-member`: 从工作室移除成员接口。

## OpenCode 模块
OpenCode 模块负责管理系统中的 OpenCode 会话信息和 OpenCode 相关操作。该模块涉及以下数据库表
- `oc_sessions` 表: 存储 OpenCode 会话信息，如会话 ID、会话目录等。
- `oc_messages` 表: 存储 OpenCode 会话消息信息，如消息内容、消息角色等。
- 详细模块描述参见[OpenCode 模块文档](spec/modules/oc.md)


## Applications 模块
Applications 模块负责管理系统中的应用程序信息和应用程序相关操作。该模块涉及以下数据库表
- `applications` 表: 存储应用程序信息，如应用程序名称、用户 ID 等。
- `app_files` 表: 存储文件信息，如文件路径、文件类型等。

### Applications 模块的 API 路由
TODO: 待补充
