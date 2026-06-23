# FilmDate 部署指南

## 前置要求

1. **Supabase 账号**：https://supabase.com
2. **Vercel 账号**：https://vercel.com
3. **GitHub 账号**：用于代码托管

## 步骤 1：设置 Supabase

1. 在 Supabase 创建新项目
2. 进入 Settings > API，获取以下信息：
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service role key (SUPABASE_SERVICE_ROLE_KEY)

3. 在 SQL Editor 中执行以下迁移：
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_themes.sql`

4. 在 Storage 中创建 `photos` bucket 并设置为公开访问

## 步骤 2：配置环境变量

在本地创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 步骤 3：本地测试

```bash
npm install
npm run dev
```

访问 http://localhost:3000 测试应用

## 步骤 4：部署到 Vercel

1. 将代码推送到 GitHub：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/filmdate.git
   git push -u origin main
   ```

2. 在 Vercel 导入项目：
   - 登录 https://vercel.com
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - 选择 "Next.js" 框架

3. 配置环境变量：
   - 在 Vercel 项目设置中添加环境变量：
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY

4. 部署：
   - 点击 "Deploy"
   - 等待部署完成

## 步骤 5：配置自定义域名（可选）

1. 在 Vercel 项目设置中进入 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

## 步骤 6：配置 Supabase 认证

1. 在 Supabase 项目中进入 Authentication > URL Configuration
2. 添加你的 Vercel 域名到 "Site URL"
3. 添加重定向 URL：
   - https://your-domain.com/auth/callback
   - https://your-domain.com/pair

## 生产环境检查清单

- [ ] Supabase 项目已创建并配置
- [ ] 数据库迁移已执行
- [ ] Storage bucket 已创建并设置权限
- [ ] 环境变量已配置
- [ ] 应用已部署到 Vercel
- [ ] 自定义域名已配置（可选）
- [ ] 认证 URL 已配置
- [ ] 测试所有功能正常工作

## 监控和维护

1. **监控**：
   - 在 Vercel Dashboard 查看应用性能
   - 在 Supabase Dashboard 查看数据库使用情况

2. **备份**：
   - Supabase 自动备份数据库
   - 定期导出重要数据

3. **更新**：
   - 定期更新依赖包
   - 关注 Next.js 和 Supabase 的更新

## 故障排除

### 常见问题

1. **认证失败**：
   - 检查 Supabase URL 和 Key 是否正确
   - 确认认证 URL 已配置

2. **图片上传失败**：
   - 检查 Storage bucket 权限
   - 确认文件大小限制

3. **数据库连接失败**：
   - 检查环境变量
   - 确认 Supabase 项目状态

### 获取帮助

- Next.js 文档：https://nextjs.org/docs
- Supabase 文档：https://supabase.com/docs
- Vercel 文档：https://vercel.com/docs
