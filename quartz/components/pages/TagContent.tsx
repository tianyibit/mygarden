import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import style from "../styles/listPage.scss"
import { SortFn, byDateAndAlphabetical } from "../PageList"
import { FullSlug, getAllSegmentPrefixes, resolveRelative, simplifySlug } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { Root } from "hast"
import { htmlToJsx } from "../../util/jsx"
import { i18n } from "../../i18n"
import { ComponentChildren } from "preact"
import { concatenateResources } from "../../util/resources"
import { Date, getDate } from "../Date"

interface TagContentOptions {
  sort?: SortFn
  numPages: number
}

const defaultOptions: TagContentOptions = {
  numPages: 10,
}

export default ((opts?: Partial<TagContentOptions>) => {
  const options: TagContentOptions = { ...defaultOptions, ...opts }

  const TagContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { tree, fileData, allFiles, cfg } = props
    const slug = fileData.slug

    if (!(slug?.startsWith("tags/") || slug === "tags")) {
      throw new Error(`Component "TagContent" tried to render a non-tag page: ${slug}`)
    }

    const tag = simplifySlug(slug.slice("tags/".length) as FullSlug)
    const allPagesWithTag = (tag: string) =>
      allFiles.filter((file) =>
        (file.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes).includes(tag),
      )

    const content = (
      (tree as Root).children.length === 0
        ? fileData.description
        : htmlToJsx(fileData.filePath!, tree)
    ) as ComponentChildren
    const cssClasses: string[] = fileData.frontmatter?.cssclasses ?? []
    const classes = cssClasses.join(" ")
    if (tag === "/") {
      const tags = [
        ...new Set(
          allFiles.flatMap((data) => data.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes),
        ),
      ].sort((a, b) => a.localeCompare(b))
      const tagItemMap: Map<string, QuartzPluginData[]> = new Map()
      const sorter = options.sort ?? byDateAndAlphabetical(cfg)
      for (const tag of tags) {
        tagItemMap.set(tag, allPagesWithTag(tag).sort(sorter))
      }
      return (
        <div class="tag-index-layout">
          <nav class="tag-index-sidebar">
            <ul>
              {tags.map((tag) => {
                const count = tagItemMap.get(tag)!.length
                return (
                  <li>
                    <a href={`#tag-${tag}`} class="tag-sidebar-link">
                      <span>{tag}</span>
                      <span class="tag-sidebar-count">{count}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
          <div class="tag-index-main">
            {tags.map((tag) => {
              const pages = tagItemMap.get(tag)!
              const displayed = pages.slice(0, options.numPages)
              const tagListingPage = `/tags/${tag}` as FullSlug
              const href = resolveRelative(fileData.slug!, tagListingPage)

              return (
                <section class="tag-group" id={`tag-${tag}`}>
                  <h2 class="tag-group-title">
                    <a class="internal tag-link" href={href} data-no-popover="true">
                      {tag}
                    </a>
                    <span class="tag-group-count">{pages.length}</span>
                  </h2>
                  <ul class="tag-group-list">
                    {displayed.map((page) => {
                      const title = page.frontmatter?.title
                      const pageTags = page.frontmatter?.tags ?? []
                      return (
                        <li class="tag-group-item">
                          <span class="tag-group-date">
                            {page.dates && (
                              <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                            )}
                          </span>
                          <a
                            href={resolveRelative(fileData.slug!, page.slug!)}
                            class="internal tag-group-article-title"
                          >
                            {title}
                          </a>
                          <span class="tag-group-tags">
                            {pageTags.map((t) => (
                              <a
                                class="internal tag-link"
                                href={resolveRelative(
                                  fileData.slug!,
                                  `tags/${t}` as FullSlug,
                                )}
                              >
                                {t}
                              </a>
                            ))}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  {pages.length > options.numPages && (
                    <a href={href} class="tag-group-more">
                      查看全部 {pages.length} 篇 →
                    </a>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      )
    } else {
      const pages = allPagesWithTag(tag)
      const sorter = options.sort ?? byDateAndAlphabetical(cfg)
      const sorted = pages.sort(sorter)

      return (
        <div class="popover-hint">
          <article class={classes}>{content}</article>
          <div class="page-listing">
            <h2 class="tag-group-title">
              <span class="tag-group-title-text">#{tag}</span>
              <span class="tag-group-count">{pages.length}</span>
            </h2>
            <ul class="tag-group-list">
              {sorted.map((page) => {
                const title = page.frontmatter?.title
                const pageTags = page.frontmatter?.tags ?? []
                return (
                  <li class="tag-group-item">
                    <span class="tag-group-date">
                      {page.dates && (
                        <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                      )}
                    </span>
                    <a
                      href={resolveRelative(fileData.slug!, page.slug!)}
                      class="internal tag-group-article-title"
                    >
                      {title}
                    </a>
                    <span class="tag-group-tags">
                      {pageTags.map((t) => (
                        <a
                          class="internal tag-link"
                          href={resolveRelative(
                            fileData.slug!,
                            `tags/${t}` as FullSlug,
                          )}
                        >
                          {t}
                        </a>
                      ))}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )
    }
  }

  TagContent.css = concatenateResources(style, `
/* Tag index page layout */
body[data-slug^="tags/"] .page-header > .popover-hint,
body[data-slug="tags"] .page-header > .popover-hint {
  display: none;
}

body[data-slug^="tags/"] .center > hr,
body[data-slug="tags"] .center > hr {
  display: none;
}

.tag-index-layout {
  display: flex;
  gap: 3rem;
  margin-top: 1rem;
}

.tag-index-sidebar {
  position: sticky;
  top: 5rem;
  align-self: flex-start;
  min-width: 160px;
  max-width: 200px;
  flex-shrink: 0;

  & > ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  & li {
    margin: 0;
    padding: 0;
  }
}

.tag-sidebar-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  color: var(--darkgray) !important;
  font-size: 0.9rem;
  text-decoration: none !important;
  border-bottom: none !important;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background-color: var(--highlight);
    color: var(--dark) !important;
  }
}

.tag-sidebar-count {
  font-size: 0.8rem;
  color: var(--gray);
  min-width: 1.5em;
  text-align: right;
}

.tag-index-main {
  flex: 1;
  min-width: 0;
}

.tag-group {
  margin-bottom: 2.5rem;
}

.tag-group-title {
  font-size: 18px !important;
  font-weight: 600 !important;
  margin: 0 0 0.75rem 0 !important;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--lightgray);
  display: flex;
  align-items: center;
  gap: 0.5rem;

  & a.internal.tag-link {
    font-size: 18px;
    color: var(--dark);
    border-bottom: none;

    &:hover {
      color: var(--secondary);
    }
  }
}

.tag-group-title-text {
  font-size: 18px;
  color: var(--dark);
}

.tag-group-count {
  font-size: 0.8rem;
  color: var(--gray);
  font-weight: 400;
}

.tag-group-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tag-group-item {
  display: grid;
  grid-template-columns: fit-content(8em) 1fr auto;
  align-items: baseline;
  padding: 0.65rem 0;
  gap: 1.25rem;
}

.tag-group-date {
  font-size: 0.9rem;
  color: var(--gray);
  white-space: nowrap;
}

a.tag-group-article-title {
  font-size: 1.05rem;
  font-weight: 400;
  color: var(--darkgray) !important;
  text-decoration: none !important;
  border-bottom: none !important;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    color: var(--secondary) !important;
  }
}

.tag-group-tags {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  white-space: nowrap;

  & a.internal.tag-link {
    font-size: 0.85rem;
    color: var(--gray);
    border-bottom: none;

    &:hover {
      color: var(--dark);
    }
  }
}

.tag-group-more {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--gray) !important;
  text-decoration: none !important;
  border-bottom: none !important;

  &:hover {
    color: var(--secondary) !important;
  }
}

/* Mobile: hide sidebar, stack layout */
@media (max-width: 768px) {
  .tag-index-layout {
    flex-direction: column;
    gap: 1.5rem;
  }

  .tag-index-sidebar {
    position: static;
    max-width: 100%;
    min-width: 0;

    & > ul {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }
  }

  .tag-sidebar-link {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }

  .tag-group-item {
    grid-template-columns: fit-content(6em) 1fr;
  }

  .tag-group-tags {
    display: none;
  }
}
`)
  return TagContent
}) satisfies QuartzComponentConstructor
