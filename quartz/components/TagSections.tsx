import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { byDateAndAlphabetical } from "./PageList"
import { Date, getDate } from "./Date"
import { classNames } from "../util/lang"

interface TagSectionConfig {
  tag: string
  title: string
}

interface Options {
  sections: TagSectionConfig[]
  limit: number
}

const defaultOptions: Options = {
  sections: [],
  limit: 5,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const TagSections: QuartzComponent = ({
    allFiles,
    fileData,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const sorter = byDateAndAlphabetical(cfg)

    return (
      <div class={classNames(displayClass, "tag-sections")}>
        {opts.sections.map(({ tag, title }) => {
          const pages = allFiles
            .filter((file) => (file.frontmatter?.tags ?? []).includes(tag))
            .sort(sorter)

          if (pages.length === 0) return null

          const displayed = pages.slice(0, opts.limit)
          const remaining = pages.length - displayed.length
          const tagPage = `tags/${tag}` as FullSlug

          return (
            <section class="tag-section">
              <h2 class="tag-section-title">
                <a href={resolveRelative(fileData.slug!, tagPage)} class="internal tag-link">
                  {title}
                </a>
              </h2>
              <ul class="tag-section-list">
                {displayed.map((page) => {
                  const title =
                    page.frontmatter?.title ?? page.slug?.split("/").pop() ?? "Untitled"
                  return (
                    <li class="tag-section-item">
                      <a
                        href={resolveRelative(fileData.slug!, page.slug!)}
                        class="internal"
                      >
                        {title}
                      </a>
                      {page.dates && (
                        <span class="tag-section-date">
                          <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
              {remaining > 0 && (
                <a href={resolveRelative(fileData.slug!, tagPage)} class="tag-section-more">
                  查看全部 →
                </a>
              )}
            </section>
          )
        })}
      </div>
    )
  }

  TagSections.css = `
.tag-sections {
  margin-top: 2rem;
}

.tag-section {
  margin-bottom: 3rem;
}

.tag-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--lightgray);
}

.tag-section-title a.internal.tag-link {
  background-color: transparent;
  padding: 0;
  color: var(--dark);
  font-family: var(--headerFont);
}

.tag-section-title a.internal.tag-link:hover {
  color: var(--secondary);
}

.tag-section-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tag-section-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--lightgray);
}

.tag-section-item a.internal {
  background-color: transparent;
  padding: 0;
  font-weight: 400;
  color: var(--darkgray);
}

.tag-section-item a.internal:hover {
  color: var(--secondary);
}

.tag-section-date {
  font-size: 0.85rem;
  color: var(--gray);
  white-space: nowrap;
  margin-left: 1rem;
}

.tag-section-more {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--gray);
}

.tag-section-more:hover {
  color: var(--secondary);
}
`

  return TagSections
}) satisfies QuartzComponentConstructor
