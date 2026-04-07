import { Date, getDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { JSX } from "preact"
import { FullSlug, resolveRelative } from "../util/path"
import style from "./styles/contentMeta.scss"

interface ContentMetaOptions {
  showReadingTime: boolean
  showComma: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  showComma: true,
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text
    if (!text) return null

    const tags = fileData.frontmatter?.tags ?? []
    const coverImage = fileData.frontmatter?.cover as string | undefined

    return (
      <>
        <div class={classNames(displayClass, "content-meta")}>
          <span class="content-meta-date">
            {fileData.dates && <Date date={getDate(cfg, fileData)!} locale={cfg.locale} />}
            {options.showReadingTime && (() => {
              const { minutes } = readingTime(text)
              const displayedTime = i18n(cfg.locale).components.contentMeta.readingTime({
                minutes: Math.ceil(minutes),
              })
              return <span> · {displayedTime}</span>
            })()}
          </span>
          {tags.length > 0 && (
            <span class="content-meta-tags">{"["}{tags.map((tag, i) => (
                <>
                  <a
                    href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                    class="internal tag-link"
                  >
                    {tag}
                  </a>
                  {i < tags.length - 1 && "，"}
                </>
              ))}{"]"}</span>
          )}
        </div>
        {coverImage && (
          <div class="article-hero-image">
            <img src={coverImage} alt={fileData.frontmatter?.title ?? ""} />
          </div>
        )}
      </>
    )
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor
