# FilmDate - 复古胶片情侣创意照片平台

用复古胶片的方式记录你们的爱情故事。

## 功能特点

### 🎬 每日主题挑战
- 每天一个创意主题，两人分别拍照回应
- 8种复古胶片滤镜（柯达、富士、宝丽来等）
- 照片对比展示，分享不同视角

### 🎨 拼贴编辑器
- 基于 Fabric.js 的强大画布编辑
- 支持添加图片、文字、形状
- 多种编辑工具（拖拽、缩放、旋转）
- 导出高清 PNG 图片

### 📸 回忆墙
- 时间线形式展示所有作品
- 按月分组，方便回顾
- 翻转卡片动画效果

### 🏆 成就系统
- 12个成就，4个类别
- 连续打卡、摄影作品、拼贴创作、特殊成就
- 成就弹窗动画效果

### 👤 情侣配对
- 6位邀请码快速配对
- 情侣关系管理
- 个人资料展示

## 技术栈

- **前端**：Next.js 16, TypeScript, Tailwind CSS
- **后端**：Supabase (PostgreSQL, Auth, Storage)
- **画布**：Fabric.js v6
- **部署**：Vercel

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/filmdate.git
cd filmdate
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入你的 Supabase 配置：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. 设置数据库

在 Supabase SQL Editor 中执行：

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_themes.sql`

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
filmdate/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   ├── auth/              # 认证页面
│   │   ├── achievements/      # 成就页面
│   │   ├── challenge/         # 挑战页面
│   │   ├── editor/            # 编辑器页面
│   │   ├── pair/              # 配对页面
│   │   └── profile/           # 个人资料页面
│   ├── components/            # React 组件
│   │   ├── Editor/            # 编辑器组件
│   │   ├── AuthForm.tsx       # 认证表单
│   │   ├── AuthGuard.tsx      # 认证保护
│   │   ├── ChallengeCard.tsx  # 挑战卡片
│   │   ├── FilmGrain.tsx      # 胶片颗粒效果
│   │   ├── FilterSelector.tsx # 滤镜选择器
│   │   ├── InviteCode.tsx     # 邀请码组件
│   │   ├── Layout.tsx         # 布局组件
│   │   ├── LoadingScreen.tsx  # 加载屏幕
│   │   ├── Navigation.tsx     # 导航栏
│   │   ├── PhotoCard.tsx      # 照片卡片
│   │   ├── PhotoUpload.tsx    # 照片上传
│   │   └── Timeline.tsx       # 时间线组件
│   └── lib/                   # 工具库
│       ├── achievements.ts    # 成就系统
│       ├── auth.ts            # 认证功能
│       ├── challenge.ts       # 挑战功能
│       ├── couple.ts          # 情侣配对
│       ├── filters.ts         # 滤镜系统
│       ├── supabase.ts        # Supabase 客户端
│       └── supabase-browser.ts # 浏览器客户端
├── supabase/                  # Supabase 配置
│   └── migrations/            # 数据库迁移
├── __tests__/                 # 测试文件
├── public/                    # 静态资源
└── docs/                      # 文档
```

## 测试

运行测试：

```bash
npm test
```

运行测试并监听变化：

```bash
npm run test:watch
```

生成测试覆盖率报告：

```bash
npm run test:coverage
```

## 部署

详细部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 致谢

- Next.js: https://nextjs.org
- Supabase: https://supabase.com
- Fabric.js: http://fabricjs.com
- Tailwind CSS: https://tailwindcss.com
