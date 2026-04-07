// @ts-ignore
import darkmodeScript from "./scripts/darkmode.inline"
import darkmodeStyles from "./styles/darkmode.scss"
import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

interface NavLink {
  label: string
  href: string
}

interface Options {
  links: NavLink[]
}

const defaultOptions: Options = {
  links: [],
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const Navbar: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
    const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
    const baseDir = pathToRoot(fileData.slug!)
    return (
      <div class={classNames(displayClass, "site-navbar")}>
        <a href={baseDir} class="navbar-title underlined">
          {title}
        </a>
        <div class="navbar-right">
          <button class="darkmode" aria-label="Toggle dark mode">
            <svg
              class="dayIcon"
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-label={i18n(cfg.locale).components.themeToggle.lightMode}
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg
              class="nightIcon"
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-label={i18n(cfg.locale).components.themeToggle.darkMode}
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  Navbar.css = `
    ${darkmodeStyles}

    .site-navbar {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 0;
    }

    .navbar-title {
      font-family: "Noto Sans SC", "Inter", -apple-system, sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--dark);
      text-decoration: none !important;
      border-bottom: none !important;
      white-space: nowrap;
      transition: color 0.2s ease;
      position: relative;
    }

    .navbar-title:hover {
      color: var(--dark);
    }

    .navbar-right {
      display: flex;
      align-items: center;
    }

    @media (max-width: 480px) {
      .navbar-title {
        font-size: 1.25rem;
      }
    }
  `

  Navbar.beforeDOMLoaded = darkmodeScript

  return Navbar
}) satisfies QuartzComponentConstructor
