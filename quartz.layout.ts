import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// Homepage component with hero, articles, projects
const homepage = Component.Homepage({
  recentLimit: 9,
  projects: [
    {
      name: "IBbrain",
      description: "投行智能尽调引擎",
      image: "/static/rocket.webp",
      badge: "敬请期待",
    },
    {
      name: "投行百科",
      description: "双链版投行维基百科",
      image: "/static/trophy.webp",
      badge: "敬请期待",
    },
  ],
})

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.Navbar(),
  ],
  afterBody: [
    Component.ConditionalRender({
      component: homepage,
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.Sidenotes(),
  ],
  footer: Component.Footer({
    links: {},
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta({ showReadingTime: false }),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
  left: [],
  right: [
    Component.ConditionalRender({
      component: Component.Backlinks(),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.ArticleTitle(), Component.ContentMeta({ showReadingTime: false })],
  left: [],
  right: [],
}
