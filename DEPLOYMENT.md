# Battle Top 部署指南

## 目录
- [环境要求](#环境要求)
- [生产环境部署](#生产环境部署)
- [数据库配置](#数据库配置)
- [安全检查清单](#安全检查清单)
- [常见问题](#常见问题)

---

## 环境要求

- Node.js 18.x 或更高版本
- PostgreSQL 14.x 或更高版本（推荐）
- npm 或 yarn
- 至少 512MB 内存

---

## 生产环境部署

### 1. 克隆代码

```bash
git clone <your-repo-url>
cd T-Pro
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
# 复制生产环境配置模板
cp .env.production.example .env.local

# 编辑配置文件，填入实际值
nano .env.local
```

**必须修改的配置：**
- `DATABASE_URL` - 数据库连接字符串
- `NEXTAUTH_SECRET` - 使用 `node scripts/generate-keys.js` 生成
- `NEXTAUTH_URL` - 你的域名（如 https://example.com）
- `DEV_MASTER_KEY` - 使用 `node scripts/generate-keys.js` 生成

### 4. 初始化数据库

```bash
# 生成 Prisma 客户端
npm run db:generate

# 运行数据库迁移
npx prisma migrate deploy

# （可选）填充初始数据
npm run db:seed
```

### 5. 构建项目

```bash
npm run build
```

### 6. 启动服务

```bash
npm run start
```

默认端口为 3000，可通过 `PORT` 环境变量修改。

---

## 数据库配置

### PostgreSQL（推荐）

```bash
# 创建数据库
createdb battle_top

# 连接字符串格式
DATABASE_URL="postgresql://user:password@localhost:5432/battle_top"
```

### MySQL

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE battle_top CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 连接字符串格式
DATABASE_URL="mysql://user:password@localhost:3306/battle_top"
```

---

## 安全检查清单

部署前请确认以下事项：

### ✅ 环境变量
- [ ] `NEXTAUTH_SECRET` 已更改为随机生成的密钥
- [ ] `DEV_MASTER_KEY` 已更改为随机生成的密钥
- [ ] `NEXTAUTH_URL` 已设置为正确的域名
- [ ] `NODE_ENV` 设置为 `production`

### ✅ 数据库
- [ ] 使用 PostgreSQL 或 MySQL（不要使用 SQLite）
- [ ] 数据库用户权限最小化
- [ ] 数据库密码足够复杂

### ✅ 服务器
- [ ] 启用 HTTPS
- [ ] 配置防火墙规则
- [ ] 设置日志记录

### ✅ 功能验证
- [ ] 开发者入口 `/auth/dev` 返回 404 或重定向
- [ ] 用户注册/登录正常
- [ ] 榜单创建/浏览正常

---

## 使用 PM2 部署（推荐）

### 安装 PM2

```bash
npm install -g pm2
```

### 创建配置文件

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'battle-top',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 启动服务

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 使用 Docker 部署

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 构建和运行

```bash
docker build -t battle-top .
docker run -p 3000:3000 --env-file .env.local battle-top
```

---

## 常见问题

### Q: 开发者入口还能访问吗？
A: 生产环境下，`/auth/dev` 页面会自动禁用并重定向到普通登录页。

### Q: 如何重新生成密钥？
A: 运行 `node scripts/generate-keys.js`，然后将输出复制到 `.env.local` 文件。

### Q: 数据库迁移失败？
A: 确保 `DATABASE_URL` 正确，且数据库用户有足够权限。

### Q: 构建失败？
A: 检查 Node.js 版本是否 >= 18，删除 `node_modules` 和 `.next` 后重新安装。

---

## 技术支持

如有问题，请联系：support@battle-top.com
