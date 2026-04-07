import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { byDateAndAlphabetical } from "./PageList"
import { Date, getDate } from "./Date"
import { classNames } from "../util/lang"

interface ProjectItem {
  name: string
  description: string
  url?: string
  badge?: string
  image?: string
}

interface Options {
  recentLimit: number
  projects: ProjectItem[]
}

const defaultOptions: Options = {
  recentLimit: 6,
  projects: [],
}

const placeholderCovers = [
  "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop",
]

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Homepage: QuartzComponent = ({
    allFiles,
    fileData,
    cfg,
    displayClass,
  }: QuartzComponentProps) => {
    const sorter = byDateAndAlphabetical(cfg)
    const recentPages = allFiles
      .filter((f) => f.slug !== "index" && f.frontmatter?.publish !== false)
      .sort(sorter)
      .slice(0, opts.recentLimit)

    return (
      <div class={classNames(displayClass, "homepage")}>
        {/* Hero: Layout 1 — left text, right image, vertically centered */}
        <section class="hp-hero">
          <div class="hp-hero-text">
            <h1 class="hp-name">
              <span class="hp-name-reveal">你好，我是高铭哲</span>
            </h1>
            <p class="hp-bio">
              90年，黑龙江人，目前定居杭州。在湘财证券、华福证券做过7年投行业务，曾任荣大科技创新部负责人、金证股份投行事业部产品负责人，信仰投行数字化
            </p>
            <p class="hp-tagline">
              <span class="hp-tagline-blur">Building something wonderful</span>
            </p>
          </div>
          <img
            src={resolveRelative(fileData.slug!, "static/avatar.jpg" as any)}
            alt="高铭哲"
            class="hp-avatar"
          />
        </section>

        {/* Articles */}
        <section class="hp-section">
          <div class="hp-section-head">
            <div>
              <h2 class="hp-section-title">文章</h2>
            </div>
            <a href={resolveRelative(fileData.slug!, "tags" as FullSlug)} class="hp-see-all">
              查看全部
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8l4 4-4 4M8 12h8"/>
              </svg>
            </a>
          </div>
          <div class="hp-articles">
            {recentPages.map((page, idx) => {
              const title = page.frontmatter?.title ?? "Untitled"
              const tags = page.frontmatter?.tags ?? []
              const cover = (page.frontmatter?.cover as string) || placeholderCovers[idx % placeholderCovers.length]
              return (
                <a href={resolveRelative(fileData.slug!, page.slug!)} class="hp-card internal" data-no-popover>
                  <div class="hp-card-img">
                    <img src={cover} alt={title} />
                  </div>
                  <div class="hp-card-body">
                    <div class="hp-card-meta">
                      <span class="hp-card-date">
                        {page.dates && <Date date={getDate(cfg, page)!} locale={cfg.locale} />}
                      </span>
                      {tags.length > 0 && (
                        <span class="hp-card-tags">
                          {tags.map((tag) => `#${tag}`).join(" ")}
                        </span>
                      )}
                    </div>
                    <h3 class="hp-card-title">{title}</h3>
                  </div>
                </a>
              )
            })}
          </div>
        </section>

        {/* Projects */}
        {opts.projects.length > 0 && (
          <section class="hp-section">
            <div class="hp-section-head">
              <div>
                <h2 class="hp-section-title">项目</h2>
              </div>
            </div>
            <div class="hp-projects">
              {opts.projects.map((project) => (
                <div class="hp-proj-card">
                  <div class="hp-proj-img-area">
                    <div class="hp-proj-grid-bg"></div>
                    {project.image && (
                      <img src={project.image} alt={project.name} class="hp-proj-img" />
                    )}
                  </div>
                  <div class="hp-proj-bottom">
                    <div class="hp-proj-info">
                      <h3 class="hp-proj-name">{project.name}</h3>
                      <p class="hp-proj-desc">{project.description}</p>
                    </div>
                    {project.url ? (
                      <a href={project.url} class="hp-proj-btn" target="_blank" rel="noopener noreferrer">
                        查看项目 <span>↗</span>
                      </a>
                    ) : (
                      <span class="hp-proj-btn hp-proj-btn-off">
                        {project.badge ?? "查看项目"} <span>↗</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    )
  }

  Homepage.css = `
    .homepage { margin-top: 2rem; }

    /* ===== HERO ===== */
    .hp-hero {
      display: flex;
      align-items: center;
      gap: 3rem;
      padding: 5rem 0 7rem;
      width: 100%;
    }
    .hp-hero-text {
      flex: 1;
      min-width: 0;
    }

    .hp-name {
      font-size: 3rem;
      font-weight: 700;
      margin: 0 0 1.5rem 0;
      letter-spacing: -0.03em;
      line-height: 1.1;
      color: var(--dark);
      overflow: hidden;
    }
    .hp-name-reveal {
      display: inline-block;
      animation: reveal 1s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
      max-width: 0;
      white-space: nowrap;
      overflow: hidden;
    }
    @keyframes reveal {
      0% { max-width: 0; }
      100% { max-width: 20ch; }
    }

    .hp-bio {
      margin: 0 0 2rem 0;
      font-size: 1.125rem;
      line-height: 1.8;
      color: var(--darkgray);
    }

    .hp-tagline { margin: 0; }
    .hp-tagline-blur {
      font-style: italic;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      display: inline-block;
      color: var(--darkgray);
      -webkit-text-fill-color: var(--darkgray);
      background: none;
      -webkit-background-clip: unset;
      background-clip: unset;
      animation: blurReveal 2s ease forwards;
    }
    @keyframes blurReveal {
      0% { filter: blur(12px); opacity: 0; }
      100% { filter: blur(0); opacity: 1; }
    }

    /* Avatar: natural aspect ratio, rounded corners, flex-based sizing */
    .hp-avatar {
      border-radius: 16px;
      object-fit: cover;
      flex: 0 0 40%;
      max-height: 420px;
      width: 40%;
      position: static;
      transform: none;
      border: none;
      margin: 0;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    }

    @media (max-width: 768px) {
      .hp-hero {
        flex-direction: column-reverse;
        align-items: flex-start;
        text-align: left;
        gap: 1.5rem;
        padding: 2rem 0 3rem;
      }
      .hp-hero-text { max-width: 100%; }
      .hp-name { font-size: 1.5rem; }
      .hp-name-reveal { max-width: none; animation: none; }
      .hp-avatar {
        flex: none;
        width: 100%;
        max-height: none;
        border-radius: 12px;
      }
      .hp-tagline { display: flex; }
      .hp-section { margin-bottom: 4rem; }
      .hp-section-title { font-size: 1.5rem; }
    }

    /* ===== SECTIONS ===== */
    .hp-section { margin-bottom: 7rem; }

    .hp-section-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.5rem;
    }
    .hp-section-title {
      font-size: 2.25rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.02em;
      color: var(--dark);
      line-height: 1.25;
    }
    .hp-section-sub {
      margin: 0.5rem 0 0 0;
      font-size: 1.125rem;
      color: var(--gray);
    }
    .hp-see-all {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      color: var(--darkgray);
      text-decoration: none;
      border-bottom: none;
      transition: color 0.2s ease;
      position: relative;
    }
    .hp-see-all::after {
      content: "";
      position: absolute;
      bottom: -2px;
      left: 0;
      width: calc(100% - 26px);
      height: 2px;
      background: currentColor;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.25s ease;
    }
    .hp-see-all:hover::after { transform: scaleX(1); }
    .hp-see-all:hover { color: var(--dark); }
    .hp-see-all svg {
      stroke: currentColor;
      transition: transform 0.2s ease;
    }
    .hp-see-all:hover svg { transform: translateX(3px); }

    /* ===== ARTICLE CARDS ===== */
    .hp-articles {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2.5rem;
    }
    @media (max-width: 768px) {
      .hp-articles { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
    }
    @media (max-width: 480px) {
      .hp-articles { grid-template-columns: 1fr; }
      .hp-card:nth-child(n+4) { display: none; }
      .hp-card-img { aspect-ratio: 16 / 10; }
    }

    .hp-card {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      border-bottom: none;
      background: none;
      padding: 0;
      position: relative;
    }
    .hp-card:hover .hp-card-title { color: var(--dark); }

    .hp-card-img {
      width: 100%;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      border-radius: 12px;
      margin-bottom: 1.25rem;
      background: var(--lightgray);
      outline: 2px solid transparent;
      outline-offset: 4px;
      transition: outline-color 0.3s ease, box-shadow 0.3s ease;
    }
    .hp-card:hover .hp-card-img {
      outline-color: var(--gray);
      box-shadow: 0 0 16px rgba(107, 114, 128, 0.15);
      border-radius: 12px;
    }
    .hp-card-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: static;
      max-width: 100%;
      border: none;
      border-radius: 0;
      margin: 0;
      transform: scale(1);
      transition: transform 0.4s ease;
    }
    @media (hover: hover) {
      .hp-card:hover .hp-card-img img { transform: scale(1.05); }
    }

    .hp-card-body { padding: 0; }
    .hp-card-meta {
      font-size: 0.85rem;
      color: var(--gray);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
      font-weight: 500;
    }
    .hp-card-date {
      white-space: nowrap;
      flex-shrink: 0;
    }
    .hp-card-tags {
      text-align: right;
      color: var(--gray);
      font-size: 0.8rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .hp-card-title {
      font-size: 1.25rem;
      font-weight: 500;
      margin: 0;
      line-height: 1.35;
      color: var(--dark);
      transition: color 0.2s ease;
    }

    /* ===== PROJECT CARDS (Kent-style course cards) ===== */
    .hp-projects {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2.5rem;
    }
    @media (max-width: 768px) {
      .hp-projects { grid-template-columns: 1fr; }
      .hp-proj-card { padding: 1.5rem; }
    }

    .hp-proj-card {
      background: var(--highlight);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      padding: 2.75rem;
      gap: 1rem;
      border: 1px solid var(--lightgray);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    @media (hover: hover) {
      .hp-proj-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      }
    }
    /* Image area with grid background */
    .hp-proj-img-area {
      position: relative;
      aspect-ratio: 5 / 3;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--lightgray);
      background: transparent;
    }

    /* Grid pattern background — 10x6 perfect square cells */
    .hp-proj-grid-bg {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(var(--lightgray) 1px, transparent 1px),
        linear-gradient(90deg, var(--lightgray) 1px, transparent 1px);
      background-size: calc(100% / 10) calc(100% / 6);
    }

    /* Project image floating on top of grid */
    .hp-proj-img {
      position: relative;
      z-index: 1;
      height: 75%;
      width: auto;
      max-width: 80%;
      object-fit: contain;
      border-radius: 0;
      margin: 0;
      border: none;
      box-shadow: none;
      filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.12));
    }

    /* Bottom area: title+desc left, button right */
    .hp-proj-bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      padding-bottom: 0.5rem;
    }
    .hp-proj-info {
      flex: 1;
    }
    .hp-proj-name {
      font-size: 1.625rem;
      font-weight: 600;
      margin: 0 0 0.2rem 0;
      color: var(--dark);
      letter-spacing: -0.01em;
    }
    .hp-proj-desc {
      margin: 0;
      font-size: 0.95rem;
      color: var(--darkgray);
      line-height: 1.5;
    }

    .hp-proj-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--darkgray);
      text-decoration: none;
      border: 1px solid var(--lightgray);
      border-radius: 999px;
      padding: 0.45rem 1.1rem;
      white-space: nowrap;
      transition: all 0.3s ease;
      cursor: pointer;
      flex-shrink: 0;
    }
    .hp-proj-btn:hover {
      background: var(--light);
      border-color: var(--gray);
    }
    .hp-proj-btn-off {
      color: var(--darkgray);
      border-color: var(--gray);
      cursor: default;
    }
    .hp-proj-btn-off:hover {
      background: transparent;
      border-color: var(--gray);
      color: var(--darkgray);
    }
    .hp-proj-btn:active { transform: scale(0.97); }

    .hp-see-all:active { transform: scale(0.97); }
  `

  return Homepage
}) satisfies QuartzComponentConstructor
