# CLAUDE.md

## 项目概述
基于 Quartz 4 的个人数字花园，部署在 Cloudflare Pages。

## 常用命令
- `npx quartz build` — 构建站点
- `npx quartz build --serve` — 构建并启动本地预览（默认 http://localhost:8080）

## 发布规则
- **白名单模式**：使用 `ExplicitPublish` 过滤器，只有 frontmatter 中 `publish: true` 的文章才会被构建发布，其余笔记默认不发布。
- **Broken link 保护**：`ObsidianFlavoredMarkdown` 已开启 `disableBrokenWikilinks: true`，指向未发布文章的 `[[wikilink]]` 会渲染为灰色不可点击文字，不会产生 404。
- **链接语法**：内部链接统一使用 Obsidian `[[wikilink]]` 语法，不要使用标准 Markdown 链接引用站内文章（标准链接不受 broken link 检测保护）。
- **ignorePatterns**：`private`、`templates`、`.obsidian` 目录始终被排除，作为双重保险。
- 新增文章发布流程：在 Obsidian 笔记 frontmatter 中添加 `publish: true`，同步到 content 目录后即可被构建。

## 目录结构

```
Mylife/                    ← Obsidian vault 根目录
├── .obsidian/             ← Obsidian 配置
├── templates/             ← Obsidian 模板（new-article.md）
├── Writing/               ← 唯一写作区，所有文章都在这里
│   ├── images/            ← 文章图片
│   └── *.md
└── work/
    └── mygarden/          ← Quartz 项目（git 仓库）
        ├── content/       ← 由 sync.sh 自动同步，不手动编辑
        │   └── index.md   ← 首页（唯一手动维护的文件）
        ├── scripts/
        │   ├── sync.sh    ← 同步脚本
        │   └── fetch_wechat.py
        └── .github/workflows/
            └── deploy.yml ← CI/CD 自动部署
```

## 同步与发布流程

1. 在 Obsidian `Writing/` 目录中撰写文章（使用 `new-article` 模板）
2. 准备发布时，将 frontmatter 中 `publish: false` 改为 `publish: true`
3. 运行 `garden-publish`（或 `bash scripts/sync.sh`）
4. 脚本自动：扫描 → 同步文章和图片到 content/ → git commit + push
5. GitHub Actions 自动：构建 Quartz → 部署到 Cloudflare Pages

- **取消发布**：将 `publish: true` 改回 `false`，再次运行同步脚本即可
- **content/ 目录不要手动编辑**（index.md 除外），所有内容由同步脚本管理

## CI/CD

- **workflow**: `.github/workflows/deploy.yml`
- **触发条件**: push to `v4` 分支
- **流程**: checkout (fetch-depth:0) → Node 22 → npm ci → quartz build → wrangler pages deploy
- **需要 GitHub Secrets**: `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`

## 安全层

| 层级 | 机制 | 作用 |
|---|---|---|
| 1 | 模板默认 `publish: false` | 新文章不会意外发布 |
| 2 | `ExplicitPublish` 插件 | 构建时白名单过滤 |
| 3 | `ignorePatterns` | private/templates/.obsidian 永远排除 |
| 4 | `.gitignore` 中的 `private/` | 敏感内容不进 git |

## 工作流约定
- 每次修改前端文件后，自动运行 `npx quartz build --serve &` 启动本地预览（后台运行，不要用 `head` 截断输出）。
- 启动后必须用 `curl -s -o /dev/null -w "%{http_code}" http://localhost:8080` 校验返回 200，确认服务可用。若失败则排查并重试。
