# 数据库描述
描述了`backend`使用的数据库结构、表格定义以及表格关系等内容。

## 数据表定义
### 用户表 (users)
存储用户的基本信息。
- `id` (INT, 主键, 自增): 用户唯一标识符
- `username` (VARCHAR(50), 唯一): 用户名,用于登录，当前与`email`字段保持一致
- `email` (VARCHAR(100), 唯一): 用户电子邮件地址
- `password` (VARCHAR(255)): 用户密码
- `status` (INT): 用户状态，0表示启用，1表示禁用
- `created` (TIMESTAMP): 记录创建时间，默认值为当前时间
- `updated` (TIMESTAMP): 记录最后更新时间， 默认值为当前时间

## Sessions 表 (sessions)
存储用户会话信息。
- `id` (INT, 主键, 自增): 会话唯一标识符
- `user_id` (INT, 外键): 关联的用户ID，引用`users`表的`id`
- `session_id` (VARCHAR(128), 唯一): 会话标识符
- `parent_id` (VARCHAR(128), 可空): 父会话ID
- `directory` (VARCHAR(251285)): 会话目录
- `title` (VARCHAR(255)): 会话标题
- `status` (INT): 会话状态，0表示活跃，1表示已结束
- `created` (TIMESTAMP): 会话创建时间，默认值为当前时间
- `updated` (TIMESTAMP): 会话最后更新时间， 默认值为当前时间

## Files 表 (files)
存储文件信息。
- `id` (INT, 主键, 自增): 文件唯一标识符
- `user_id` (INT, 外键): 关联的用户ID，引用`users`表的`id`
- `name` (VARCHAR(255)): 文件名
- `path` (VARCHAR(1024)): 文件路径
- `size` (BIGINT): 文件大小（以字节为单位）
- `type` (VARCHAR(50)): 文件mimetype类型
- `status` (INT): 文件状态，0表示可用，1表示已删除
- `created` (TIMESTAMP): 文件创建时间，默认值为当前时间
- `updated` (TIMESTAMP): 文件最后更新时间， 默认值为当前时间