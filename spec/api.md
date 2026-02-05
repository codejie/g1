# API生成规则
- Restful 风格的 API 设计
- 接口采用’POST'方法，请求与应答使用 JSON 作为数据交换格式，数据结构参考模块描述
- 接口通用数据结构定义在`types/common.ts`中，请求数据结构需继承 `Request` 接口，应答 数据结构需继承 `Response` 接口
- 不同模块的接口涉及的数据结构定义在各自模块的类型定义文件中，统一放置在`types`目录下，如`types/user.ts`、`types/studio.ts`等
- 列表类接口支持分页查询，使用`page_info`字段传递分页信息
- 错误处理采用统一的错误码和错误信息，错误码定义在`types/common.ts`中
- 接口路径以模块名称为前缀，如`/user/`表示用户模块相关接口
- 接口均需进行 JWT 认证，除`/user/login`和`/user/register`等公开接口
- 接口支持权限控制，不同角色用户访问权限不同
