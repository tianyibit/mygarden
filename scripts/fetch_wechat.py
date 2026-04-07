"""
微信公众号文章批量转 Markdown 脚本

用法:
    1. 把文章链接存到 articles.txt，每行一个 URL
    2. python scripts/fetch_wechat.py articles.txt
    3. 输出到 content/ 目录，自动加 Quartz frontmatter
"""

import sys
import re
import time
import hashlib
import os
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
import html2text

# --- 配置 ---
OUTPUT_DIR = Path(__file__).parent.parent / "content"
IMAGE_DIR = OUTPUT_DIR / "images"
DELAY = 2  # 请求间隔秒数，避免被封

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def slugify(text: str) -> str:
    """中文标题 -> 可用作文件名的 slug"""
    text = re.sub(r"[^\w\u4e00-\u9fff]+", "-", text)
    return text.strip("-")[:80]


def download_image(url: str, session: requests.Session) -> str | None:
    """下载图片到本地，返回相对路径"""
    try:
        resp = session.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        ext = ".jpg"
        ct = resp.headers.get("content-type", "")
        if "png" in ct:
            ext = ".png"
        elif "gif" in ct:
            ext = ".gif"
        elif "webp" in ct:
            ext = ".webp"
        name = hashlib.md5(url.encode()).hexdigest()[:12] + ext
        IMAGE_DIR.mkdir(parents=True, exist_ok=True)
        path = IMAGE_DIR / name
        path.write_bytes(resp.content)
        return f"images/{name}"
    except Exception as e:
        print(f"  ⚠ 图片下载失败: {url} ({e})")
        return None


def fetch_article(url: str, session: requests.Session) -> dict | None:
    """抓取一篇公众号文章，返回 {title, date, author, content_html}"""
    try:
        resp = session.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        print(f"  ✗ 请求失败: {e}")
        return None

    soup = BeautifulSoup(resp.text, "html.parser")

    # 标题
    title_tag = soup.find("h1", class_="rich_media_title") or soup.find("h1")
    title = title_tag.get_text(strip=True) if title_tag else "无标题"

    # 发布日期
    date = ""
    # 尝试从 script 中提取 publish_time
    scripts = soup.find_all("script")
    for s in scripts:
        if s.string and "publish_time" in (s.string or ""):
            m = re.search(r'publish_time\s*=\s*"(\d+)"', s.string)
            if m:
                ts = int(m.group(1))
                from datetime import datetime
                date = datetime.fromtimestamp(ts).strftime("%Y-%m-%d")
                break
    # fallback: 页面上的日期文本
    if not date:
        date_tag = soup.find("em", id="publish_time")
        if date_tag:
            date = date_tag.get_text(strip=True)
    if not date:
        date = "2024-01-01"

    # 作者
    author_tag = soup.find("a", class_="rich_media_meta_link") or soup.find(
        "span", class_="rich_media_meta_text"
    )
    author = author_tag.get_text(strip=True) if author_tag else ""

    # 正文
    content_div = soup.find("div", class_="rich_media_content") or soup.find(
        "div", id="js_content"
    )
    if not content_div:
        print("  ✗ 未找到正文内容")
        return None

    # 下载图片并替换 src
    for img in content_div.find_all("img"):
        src = img.get("data-src") or img.get("src") or ""
        if not src:
            continue
        local_path = download_image(src, session)
        if local_path:
            img["src"] = local_path
        else:
            img["src"] = src
        # 清理微信特有属性
        for attr in ["data-src", "data-w", "data-ratio", "data-type"]:
            img.attrs.pop(attr, None)

    return {
        "title": title,
        "date": date,
        "author": author,
        "html": str(content_div),
        "url": url,
    }


def html_to_md(html: str) -> str:
    """HTML -> 干净的 Markdown"""
    h = html2text.HTML2Text()
    h.body_width = 0
    h.protect_links = True
    h.wrap_links = False
    h.unicode_snob = True
    md = h.handle(html)
    # 清理多余空行
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip()


def save_article(article: dict) -> str:
    """保存为 Quartz 兼容的 .md 文件"""
    slug = slugify(article["title"])
    filename = f"{slug}.md"
    filepath = OUTPUT_DIR / filename

    md_content = html_to_md(article["html"])

    frontmatter = f"""---
title: "{article['title']}"
date: {article['date']}
tags:
  - 公众号
source: "{article['url']}"
---

"""
    filepath.write_text(frontmatter + md_content, encoding="utf-8")
    return filename


def main():
    if len(sys.argv) < 2:
        print("用法: python scripts/fetch_wechat.py <articles.txt>")
        sys.exit(1)

    urls_file = Path(sys.argv[1])
    urls = [
        line.strip()
        for line in urls_file.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.startswith("#")
    ]
    print(f"共 {len(urls)} 篇文章待处理\n")

    session = requests.Session()
    success = 0

    for i, url in enumerate(urls, 1):
        print(f"[{i}/{len(urls)}] {url}")
        article = fetch_article(url, session)
        if article:
            filename = save_article(article)
            print(f"  ✓ {article['title']} -> {filename}")
            success += 1
        else:
            print(f"  ✗ 跳过")

        if i < len(urls):
            time.sleep(DELAY)

    print(f"\n完成! 成功 {success}/{len(urls)} 篇，保存在 content/ 目录")


if __name__ == "__main__":
    main()
