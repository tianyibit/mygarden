#!/usr/bin/env bash
#
# sync.sh — 从 Obsidian Writing 目录同步 publish:true 的文章到 Quartz content/
#
# 用法: bash scripts/sync.sh          (在 mygarden 目录下运行)
#   或: gp                 (通过 shell alias)
#

set -uo pipefail

# --- 路径配置 ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MYGARDEN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
VAULT_DIR="$(cd "$MYGARDEN_DIR/../.." && pwd)"
WRITING_DIR="$VAULT_DIR/Writing"
CONTENT_DIR="$MYGARDEN_DIR/content"
WRITING_IMAGES="$WRITING_DIR/images"
CONTENT_IMAGES="$CONTENT_DIR/images"

# --- 前置检查 ---
if [ ! -d "$WRITING_DIR" ]; then
    echo "错误: Writing 目录不存在: $WRITING_DIR"
    exit 1
fi

echo "=== 数字花园同步 ==="
echo "源目录: $WRITING_DIR"
echo "目标目录: $CONTENT_DIR"
echo ""

# --- 1. 收集 publish:true 的文件 ---
# 用 grep 扫描 frontmatter 中的 publish: true
PUBLISH_FILES=()
while IFS= read -r -d '' file; do
    # 只检查文件开头的 frontmatter（--- 到 --- 之间）
    if head -50 "$file" | sed -n '/^---$/,/^---$/p' | grep -q '^\s*publish:\s*true\s*$'; then
        PUBLISH_FILES+=("$file")
    fi
done < <(find "$WRITING_DIR" -maxdepth 1 -name '*.md' -print0)

echo "找到 ${#PUBLISH_FILES[@]} 篇待发布文章"

# --- 2. 同步文章到 content/ ---
SYNCED_FILES=()
for src in "${PUBLISH_FILES[@]}"; do
    filename="$(basename "$src")"
    dest="$CONTENT_DIR/$filename"
    SYNCED_FILES+=("$filename")

    if [ ! -f "$dest" ] || ! diff -q "$src" "$dest" > /dev/null 2>&1; then
        cp "$src" "$dest"
        echo "  同步: $filename"
    fi
done

# --- 3. 同步图片 ---
# 扫描已同步文章中引用的图片
if [ -d "$WRITING_IMAGES" ]; then
    mkdir -p "$CONTENT_IMAGES"
    REFERENCED_IMAGES=()
    for src in "${PUBLISH_FILES[@]}"; do
        # 匹配 ![xxx](images/yyy) 格式
        while IFS= read -r img; do
            REFERENCED_IMAGES+=("$img")
        done < <(grep -o 'images/[^)]*' "$src" 2>/dev/null | sed 's|images/||' || true)
        # 匹配 ![[filename.ext]] 格式（Obsidian wikilink 图片）
        while IFS= read -r img; do
            REFERENCED_IMAGES+=("$img")
        done < <(grep -oE '!\[\[[^]]+\.(png|jpg|jpeg|gif|webp)\]\]' "$src" 2>/dev/null | sed 's/!\[\[//;s/\]\]//' || true)
    done

    # 去重并同步
    printf '%s\n' "${REFERENCED_IMAGES[@]}" 2>/dev/null | sort -u | while IFS= read -r img; do
        [ -z "$img" ] && continue
        img_src="$WRITING_IMAGES/$img"
        img_dest="$CONTENT_IMAGES/$img"
        if [ -f "$img_src" ]; then
            if [ ! -f "$img_dest" ] || ! diff -q "$img_src" "$img_dest" > /dev/null 2>&1; then
                cp "$img_src" "$img_dest"
                echo "  图片: $img"
            fi
        fi
    done
fi

# --- 3.5 自动添加 cover 字段（取文章内第一张图片）---
for dest in "$CONTENT_DIR"/*.md; do
    [ "$(basename "$dest")" = "index.md" ] && continue
    # 已有 cover 则跳过
    head -20 "$dest" | sed -n '/^---$/,/^---$/p' | grep -q 'cover:' && continue
    # 取第一张图片（支持两种语法）
    first_img=$(grep -o 'images/[^)]*' "$dest" 2>/dev/null | head -1)
    if [ -z "$first_img" ]; then
        # 尝试 ![[filename]] 格式
        wikilink_img=$(grep -oE '!\[\[[^]]+\.(png|jpg|jpeg|gif|webp)\]\]' "$dest" 2>/dev/null | head -1 | sed 's/!\[\[//;s/\]\]//')
        [ -n "$wikilink_img" ] && first_img="images/$wikilink_img"
    fi
    [ -z "$first_img" ] && continue
    # 在 publish: 行后插入 cover
    sed -i '' "s|^publish: true|publish: true\ncover: $first_img|" "$dest"
    echo "  封面: $(basename "$dest") → $first_img"
done

# --- 4. 清理已取消发布的文章 ---
# 保留 index.md 和非 Writing 来源的文件（如 fetch_wechat.py 生成的）
REMOVED=0
while IFS= read -r -d '' existing; do
    filename="$(basename "$existing")"

    # 跳过 index.md（手动维护的首页）
    [ "$filename" = "index.md" ] && continue

    # 检查此文件是否来自 Writing（Writing 中存在同名文件）
    writing_src="$WRITING_DIR/$filename"
    if [ -f "$writing_src" ]; then
        # 来自 Writing 但不在发布列表中 → 已取消发布，删除
        found=false
        for synced in "${SYNCED_FILES[@]}"; do
            if [ "$synced" = "$filename" ]; then
                found=true
                break
            fi
        done
        if [ "$found" = false ]; then
            rm "$existing"
            echo "  移除(取消发布): $filename"
            REMOVED=$((REMOVED + 1))
        fi
    fi
done < <(find "$CONTENT_DIR" -maxdepth 1 -name '*.md' -print0)

echo ""
echo "同步完成: ${#SYNCED_FILES[@]} 篇发布, $REMOVED 篇移除"

# --- 5. 图片优化为 WebP ---
bash "$SCRIPT_DIR/optimize-images.sh"

# --- 6. Git 提交并推送 ---
cd "$MYGARDEN_DIR"

if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard content/)" ]; then
    echo "没有变更，跳过 git 提交"
    exit 0
fi

git add content/
TIMESTAMP="$(date '+%Y-%m-%d %H:%M')"
git commit -m "sync: 更新花园内容 $TIMESTAMP"
echo ""

# 推送到远程
if git remote get-url origin > /dev/null 2>&1; then
    git push
    echo "已推送到远程仓库"
else
    echo "提示: 未配置 git remote，跳过推送"
fi
