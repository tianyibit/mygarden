#!/usr/bin/env bash
#
# optimize-images.sh — 将 content/images/ 中的 jpg/png 图片转为 WebP 格式
# 同时更新所有 Markdown 文件中的图片引用
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MYGARDEN_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONTENT_DIR="$MYGARDEN_DIR/content"
IMAGE_DIR="$CONTENT_DIR/images"

if [ ! -d "$IMAGE_DIR" ]; then
    echo "没有图片目录，跳过优化"
    exit 0
fi

# 检查 cwebp 是否可用
if ! command -v cwebp &> /dev/null; then
    echo "cwebp 未安装，跳过图片优化"
    exit 0
fi

CONVERTED=0

shopt -s nullglob
for img in "$IMAGE_DIR"/*.jpg "$IMAGE_DIR"/*.jpeg "$IMAGE_DIR"/*.png "$IMAGE_DIR"/*.JPG "$IMAGE_DIR"/*.JPEG "$IMAGE_DIR"/*.PNG; do
    [ -f "$img" ] || continue

    filename="$(basename "$img")"
    name="${filename%.*}"
    webp_path="$IMAGE_DIR/${name}.webp"

    # 跳过已有 WebP 版本的
    [ -f "$webp_path" ] && continue

    # 转换为 WebP（质量 80，足够清晰且体积小）
    if cwebp -q 80 "$img" -o "$webp_path" -quiet; then
        # 更新所有 Markdown 文件中的引用
        find "$CONTENT_DIR" -name '*.md' -exec sed -i '' "s|${filename}|${name}.webp|g" {} +
        # 删除原图
        rm "$img"
        CONVERTED=$((CONVERTED + 1))
        echo "  转换: $filename → ${name}.webp"
    fi
done

echo "图片优化完成: $CONVERTED 张转为 WebP"
