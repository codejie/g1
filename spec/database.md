# 数据库描述
描述了`backend`使用的数据库结构、表格定义以及表格关系等内容。

## 数据表定义
### Studios 表 (studios)
存储工作室信息。
- `id` (INT, 主键, 自增): 工作室唯一标识符
- `name` (VARCHAR(100), 唯一): 工作室名称
- `description` (TEXT): 工作室描述
- `disabled` (INT): 工作室状态，0表示启用，1表示禁用
- `created` (TIMESTAMP): 记录创建时间，默认值为当前时间
- `updated` (TIMESTAMP): 记录最后更新时间， 默认值为当前时间

### 用户表 (users)
存储用户的基本信息。
- `id` (INT, 主键, 自增): 用户唯一标识符
- `username` (VARCHAR(50), 唯一): 用户名,用于登录，当前与`email`字段保持一致
- `email` (VARCHAR(100), 唯一): 用户电子邮件地址
- `password` (VARCHAR(255)): 用户密码
- `disabled` (INT): 用户状态，0表示启用，1表示禁用
- `created` (TIMESTAMP): 记录创建时间，默认值为当前时间
- `updated` (TIMESTAMP): 记录最后更新时间， 默认值为当前时间

### User_Studios 表 (user_studios)
存储用户与工作室的关联关系。
- `id` (INT, 主键, 自增): 关联唯一标识符
- `user_id` (INT, 外键): 关联的用户ID，引用`users`表的`id`
- `studio_id` (INT, 外键): 关联的工作室ID，引用`studios`表的`id`
- `role` (VARCHAR(50)): 用户在工作室中的角色（如管理员、成员等）
- `is_default` (BOOLEAN): 是否为默认工作室
- `is_owner` (BOOLEAN): 是否为工作室所有者
- `created` (TIMESTAMP): 记录创建时间，默认值为当前时间
- `updated` (TIMESTAMP): 记录最后更新时间， 默认值为当前时间

### User_Tokens 表 (user_tokens)
存储用户登录令牌信息。
- `id` (INT, 主键, 自增): 令牌唯一标识符
- `user_id` (INT, 外键): 关联的用户ID，引用`users`表的`id`
- `token` (VARCHAR(255)): 登录令牌
- `expires` (TIMESTAMP): 令牌过期时间
- `disabled` (INT): 令牌状态，0表示有效，1表示无效
- `created` (TIMESTAMP): 记录创建时间，默认值为当前时间
- `updated` (TIMESTAMP): 记录最后更新时间， 默认值为当前时间

### OpenCode Sessions 表 (oc_sessions)
存储用户会话信息。
- `id` (INT, 主键, 自增): 会话唯一标识符
- `user_id` (INT, 外键): 关联的用户ID，引用`users`表的`id`
- `session_id` (VARCHAR(128), 唯一): 会话标识符
- `parent_id` (VARCHAR(128), 可空): 父会话ID
- `directory` (VARCHAR(251285)): 会话目录
- `title` (VARCHAR(255)): 会话标题
- `disabled` (INT): 会话状态，0表示活跃，1表示已结束
- `created` (TIMESTAMP): 会话创建时间，默认值为当前时间
- `updated` (TIMESTAMP): 会话最后更新时间， 默认值为当前时间

### OpenCode Messages 表 (oc_messages)
存储会话消息信息。
- `id` (INT, 主键, 自增): 消息唯一标识符
- `session_id` (VARCHAR(128), 外键): 关联的会话ID，引用`oc_sessions`表的`id`
- `role` (VARCHAR(50)): 消息角色，如"user", "assistant", "system"等
- `user_id` (INT, 外键, 可空): 关联的用户ID，引用`users`表的`id`
- `content` (TEXT): 消息内容
- `created` (TIMESTAMP): 记录创建时间，默认值为当前时间

## Applications 表 (applications)
存储应用程序信息。
- `id` (INT, 主键, 自增): 应用程序唯一标识符
- `user_id` (INT, 外键): 关联的用户ID，引用`users`表的`id`
- `type` (INT): 应用程序类型, 如"0/web", "1/android", "2/ios", "3/mobile"等
- `name` (VARCHAR(100), 唯一): 应用程序名称
- `description` (TEXT): 应用程序描述
- `icon` (VARCHAR(255)): 应用程序图标路径
- `status` (INT): 应用程序状态，如"0/processing", "1/completed", "2/active", "3/inactive"等
- `disabled` (INT): 应用程序状态，0表示启用，1表示禁用
- `created` (TIMESTAMP): 记录创建时间，默认值为当前时间
- `updated` (TIMESTAMP): 记录最后更新时间， 默认值为当前时间

### Application Traces 表 (app_traces)
存储应用程序的执行轨迹信息。
- `id` (INT, 主键, 自增): 轨迹唯一标识符
- `application_id` (INT, 外键): 关联的应用程序ID，引用`applications`表的`id`
- `session_id` (VARCHAR(128), 外键): 关联的会话ID，引用`oc_sessions`表的`id`
- `message_id` (INT, 外键, 可空): 关联的消息ID，引用`oc_messages`表的`id`
- `file_id` (INT, 外键, 可空): 关联的文件ID，引用`app_file_actions`表的`id`
- `created` (TIMESTAMP): 记录创建时间，默认值为当前时间 

### Application Files 表 (app_files)
存储文件信息。
- `id` (INT, 主键, 自增): 文件唯一标识符
- `user_id` (INT, 外键): 关联的用户ID，引用`users`表的`id`
- `application_id` (INT, 外键): 关联的应用程序ID，引用`applications`表的`id`
- `name` (VARCHAR(255)): 文件名
- `path` (VARCHAR(1024)): 文件路径
- `size` (BIGINT): 文件大小（以字节为单位）
- `type` (VARCHAR(50)): 文件mimetype类型
- `disabled` (INT): 文件状态，0表示可用，1表示已删除
- `created` (TIMESTAMP): 文件创建时间，默认值为当前时间
- `updated` (TIMESTAMP): 文件最后更新时间， 默认值为当前时间

### Application Files Actions 表 (app_file_actions)
存储应用程序文件的操作记录。
- `id` (INT, 主键, 自增): 操作记录唯一标识符
- `file_id` (INT, 外键): 关联的文件ID，引用`app_files`表的`id`
- `action` (INT): 文件操作类型，如"0/created", "1/updated", "2/deleted"等
- `message` (TEXT, 可空): 文件操作相关的消息或备注信息
- `created` (TIMESTAMP): 记录创建时间，默认值为当前时间