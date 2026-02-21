# Files 模块
- 描述了模块的接口，及模块功能和实现需求
- API接口的具体规则描述见[API 文档](spec/api.md)
- 文件接口需检查用户是否有权限访问，包括token的有效性

## 模块功能
- 添加一个文件存储路径的配置项，用于指定文件的存储根路径和下载根路径
- 文件存储时需要增加一层以用户标识`user_id`命名的文件夹，用于隔离不同用户的存储空间, `user_id`可以通过token获取，下载时也需要
- 提供文件下载功能和接口
- 提供文件上传功能和接口
- 提供文件操作的接口，包括文件和文件夹的创建、删除、重命名、移动、复制等
- 提供文件列表的接口，用于获取文件和文件夹的列表信息
- 提供文件搜索的接口，用于搜索文件和文件夹
- 提供文件信息的接口，用于获取文件和文件夹的详细信息

## 接口定义

### 文件列表
- 接口路径: `/files/list`
- 请求方法: `POST`
- 请求参数:
```typescript
{
    path: string; // 文件路径
		filter?: {
			name?: string; // 文件名
			type?: string; // 文件类型
			size?: number; // 文件大小
			created?: string; // 文件创建时间
		};
		page_info: PageInfo;
}
```
- 应答数据结构:
```typescript
{
    items: FileItem[];
    page_info: PageInfo;
}
```
- FileItem 结构:
```typescript
{
    path: string; // 文件路径
    name: string; // 文件名
    type: string; // 文件类型
    size: number; // 文件大小
    created: string; // 文件创建时间
    updated: string; // 文件更新时间
}
```

### 文件下载
- 接口路径: `/files/download`
- 请求方法: `POST`
- 请求参数:
```typescript
{
    path: string; // 文件路径
	name: string;
}
```
- 应答数据结构:
按需实现

### 文件上传
- 接口路径: `/files/upload`
- 请求方法: `POST`
- 请求参数:
```typescript
{
    path: string; // 文件路径
	name: string;
	description?: string;

}
```
- 应答数据结构:
按需实现

### 文件操作
TODO
### 文件信息
TODO
### 文件搜索
TODO