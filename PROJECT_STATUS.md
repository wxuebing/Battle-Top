# Battle Top 项目状态报告

> 生成日期：2026-02-16
> 项目版本：0.1.0
> 状态：MVP 已完成，生产就绪

---

## 一、项目概述

### 1.1 项目简介
**Battle Top（观点竞技场）** 是一个榜单创建和分享平台，用户可以创建各类榜单、进行投票、评论互动。

### 1.2 技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 14.2.3 | 全栈框架 |
| React | 18.x | UI库 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 3.4.1 | 样式框架 |
| Prisma | 5.14.0 | ORM |
| NextAuth.js | 4.24.7 | 认证 |
| SQLite | - | 开发数据库 |
| PostgreSQL | - | 生产数据库（推荐） |
| Zod | 3.23.8 | 数据验证 |
| @dnd-kit | 8.0.0 | 拖拽排序 |

---

## 二、功能状态

### 2.1 已启用功能 ✅

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户注册/登录 | ✅ 完成 | 邮箱、手机号两种方式 |
| 开发者登录 | ✅ 完成 | 仅开发环境可用 |
| 密码找回 | ✅ 完成 | 安全问题方式 |
| 榜单创建 | ✅ 完成 | 支持草稿保存 |
| 榜单编辑 | ✅ 完成 | 拖拽排序 |
| 榜单发布 | ✅ 完成 | 即时发布 |
| 榜单浏览 | ✅ 完成 | 筛选、搜索、分页 |
| 榜单详情 | ✅ 完成 | 完整展示 |
| 点赞功能 | ✅ 完成 | 取消/点赞 |
| 评论功能 | ✅ 完成 | 评论、回复、点赞 |
| 订阅功能 | ✅ 完成 | 关注用户 |
| 个人中心 | ✅ 完成 | 资料编辑 |
| 头像设置 | ✅ 完成 | 预设头像/自定义 |
| 用户协议 | ✅ 完成 | 可查看 |
| 内容规范 | ✅ 完成 | 可查看 |
| 新手引导 | ✅ 完成 | 首次访问展示 |

### 2.2 已禁用功能（代码已就绪）

| 功能 | 开关 | 说明 |
|------|------|------|
| 钱包系统 | WALLET | 战斗币充值、余额管理 |
| 商城系统 | SHOP | 道具购买、VIP开通 |
| VIP系统 | VIP | 会员特权、订阅管理 |
| 辩论系统 | DEBATE | 榜单辩论、投票对决 |
| 任务系统 | TASKS | 每日任务、奖励领取 |
| 成就系统 | ACHIEVEMENTS | 成就解锁、奖励展示 |
| 排行榜 | LEADERBOARD | 用户排行、榜单排行 |
| 共创功能 | COLLABORATION | 榜单协作、多人编辑 |
| 捐赠功能 | DONATION | 用户打赏、收益管理 |
| 实名认证 | VERIFICATION | 身份证验证、实名标识 |
| 等级系统 | LEVEL_SYSTEM | 军衔等级、经验值 |

**启用方式：** 修改 `src/lib/features.ts` 中对应功能的 `enabled: true`

---

## 三、项目结构

```
T-Pro/
├── prisma/
│   ├── schema.prisma      # 数据库模型
│   ├── seed.ts            # 初始数据
│   └── dev.db             # SQLite数据库
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API路由
│   │   │   ├── auth/      # 认证相关
│   │   │   ├── rankings/  # 榜单API
│   │   │   ├── user/      # 用户API
│   │   │   └── ...
│   │   ├── auth/          # 认证页面
│   │   ├── create/        # 创建榜单
│   │   ├── explore/       # 发现页面
│   │   ├── ranking/       # 榜单详情
│   │   ├── profile/       # 个人中心
│   │   ├── user/          # 用户主页
│   │   ├── subscriptions/ # 订阅管理
│   │   ├── legal/         # 法律文档
│   │   └── ...
│   ├── components/        # React组件
│   │   ├── ui/            # 基础UI组件
│   │   ├── layout/        # 布局组件
│   │   ├── ranking/       # 榜单相关组件
│   │   ├── user/          # 用户相关组件
│   │   └── guide/         # 引导组件
│   ├── lib/               # 工具库
│   │   ├── auth.ts        # NextAuth配置
│   │   ├── prisma.ts      # 数据库客户端
│   │   ├── features.ts    # 功能开关
│   │   ├── validations.ts # 数据验证
│   │   ├── utils.ts       # 工具函数
│   │   └── level.ts       # 等级系统配置
│   └── types/             # TypeScript类型
├── scripts/
│   └── generate-keys.js   # 密钥生成脚本
├── .env                   # 开发环境配置
├── .env.example           # 配置模板
├── .env.production.example # 生产环境模板
├── DEPLOYMENT.md          # 部署指南
└── PROJECT_STATUS.md      # 本文档
```

---

## 四、数据库模型

### 4.1 核心模型

| 模型 | 说明 | 主要字段 |
|------|------|----------|
| User | 用户 | id, name, email, password, image, bio, level, exp |
| Ranking | 榜单 | id, title, description, status, authorId, categoryId |
| RankingItem | 排名项目 | id, rankingId, name, position, justification |
| Category | 分类 | id, name, type, description |
| Tag | 标签 | id, name, categoryId |
| Comment | 评论 | id, content, userId, rankingId, parentId |
| Like | 点赞 | id, userId, rankingId |
| Subscription | 订阅 | id, subscriberId, subscribedToId |

### 4.2 扩展模型（已定义，待启用）

| 模型 | 说明 |
|------|------|
| Wallet | 钱包 |
| VIPMembership | VIP会员 |
| Item | 商城道具 |
| UserItem | 用户道具 |
| Transaction | 交易记录 |
| Debate | 辩论 |
| DebateVote | 辩论投票 |
| DailyTask | 每日任务 |
| UserDailyTask | 用户任务进度 |
| Achievement | 成就 |
| UserAchievement | 用户成就 |
| Donation | 捐赠 |

---

## 五、API 接口

### 5.1 认证相关
- `POST /api/auth/register` - 邮箱注册
- `POST /api/auth/register-phone` - 手机注册
- `POST /api/auth/phone-login` - 手机登录
- `POST /api/auth/reset-password` - 重置密码
- `GET /api/auth/dev-check` - 检查开发环境
- `GET /api/auth/session` - 获取会话

### 5.2 榜单相关
- `GET /api/rankings` - 获取榜单列表
- `POST /api/rankings` - 创建榜单
- `GET /api/rankings/[id]` - 获取榜单详情
- `PUT /api/rankings/[id]` - 更新榜单
- `POST /api/rankings/[id]/publish` - 发布榜单
- `POST /api/rankings/[id]/like` - 点赞/取消
- `GET /api/rankings/[id]/comments` - 获取评论
- `POST /api/rankings/[id]/comments` - 发表评论

### 5.3 用户相关
- `GET /api/user/profile` - 获取个人资料
- `PUT /api/user/profile` - 更新个人资料
- `POST /api/user/avatar` - 上传头像
- `GET /api/user/subscriptions` - 获取订阅列表
- `GET /api/user/subscribers` - 获取粉丝列表
- `POST /api/user/[userId]/subscribe` - 订阅/取消

### 5.4 其他
- `GET /api/categories` - 获取分类
- `GET /api/tags` - 获取标签
- `GET /api/stats` - 获取统计数据
- `POST /api/sms/send` - 发送短信验证码

---

## 六、环境配置

### 6.1 开发环境 (.env)
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-nextauth-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
DEV_MASTER_KEY="BattleTop2024Dev"
NODE_ENV="development"
```

### 6.2 生产环境 (.env.production.example)
```
DATABASE_URL="postgresql://user:password@localhost:5432/battle_top"
NEXTAUTH_SECRET="<生成的密钥>"
NEXTAUTH_URL="https://your-domain.com"
DEV_MASTER_KEY="<生成的密钥>"
NODE_ENV="production"
```

---

## 七、常用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run start            # 启动生产服务器
npm run lint             # 代码检查

# 数据库
npm run db:generate      # 生成Prisma客户端
npm run db:push          # 推送数据库变更
npm run db:migrate       # 创建迁移
npm run db:studio        # 打开Prisma Studio
npm run db:seed          # 填充初始数据

# 密钥
node scripts/generate-keys.js  # 生成安全密钥
```

---

## 八、后续开发建议

### 8.1 优先级高
1. **开启排行榜功能** - 修改 `features.ts` 中 `LEADERBOARD.enabled: true`
2. **开启任务系统** - 增加用户活跃度
3. **开启成就系统** - 增加用户粘性

### 8.2 优先级中
1. **开启钱包系统** - 商业化基础
2. **开启商城系统** - 商业化实现
3. **开启VIP系统** - 会员收入

### 8.3 优先级低
1. **开启辩论系统** - 增加互动性
2. **开启共创功能** - 协作创作
3. **开启捐赠功能** - 创作者收益

---

## 九、已知问题

1. ⚠️ 图片使用 `<img>` 标签，建议后续改用 Next.js `<Image>` 组件优化性能
2. ⚠️ 部分页面 `useEffect` 依赖警告，不影响功能

---

## 十、联系方式

- 项目路径：`f:\supperindividual\T-Pro`
- 开发服务器：http://localhost:3000
- 开发者登录：http://localhost:3000/auth/dev
- 开发者密钥：`BattleTop2024Dev`

---

**文档版本：** 1.0
**最后更新：** 2026-02-16
