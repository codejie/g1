# Backend Configuration

Backend应用使用配置文件来管理所有配置项，配置文件位于 `src/config/index.ts`。

## 配置项说明

### 数据库配置
- `DATABASE_PATH`: 数据库文件路径，默认 `data/app.db`

### 服务器配置
- `PORT`: 服务器端口，默认 `3000`
- `HOST`: 服务器地址，默认 `0.0.0.0`

### 安全配置
- `JWT_SECRET`: JWT签名密钥，默认 `supersecret`
- `JWT_EXPIRES_IN`: JWT过期时间，默认 `24h`

### 上传配置
- `UPLOAD_DIR`: 上传文件目录，默认 `uploads`
- `MAX_FILE_SIZE`: 最大文件大小，默认 `104857600` (100MB)

### OpenCode配置
- `OPENCODE_URL`: OpenCode服务地址，默认 `http://127.0.0.1:10090`

## 使用方式

所有配置项可以直接在 `src/config/index.ts` 文件中修改。如果需要支持环境变量，可以在项目中引入 `dotenv` 包来实现。

```typescript
import config from './config';

// 使用配置
console.log(config.OPENCODE_URL);
console.log(config.JWT_SECRET);
```

## API响应格式

所有API响应都遵循统一的格式：

**成功响应：**
```json
{
  "code": 0,
  "data": { ... }
}
```

**错误响应：**
```json
{
  "code": -100,
  "data": {
    "message": "错误描述信息"
  }
}
```

## 错误码说明

- `0`: 成功
- `-1`: 无效请求
- `-2`: 验证错误
- `-3`: 未授权
- `-4`: 禁止访问
- `-5`: 未找到
- `-6`: 冲突
- `-7`: 内部错误
- `-100` ~ `-199`: 用户模块错误
- `-200` ~ `-299`: 工作室模块错误
- `-300` ~ `-399`: OpenCode模块错误
- `-400` ~ `-499`: 应用程序模块错误
- `-500` ~ `-599`: Token模块错误