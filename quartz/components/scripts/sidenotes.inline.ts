const WIDE_BREAKPOINT = 1600

function positionSidenotes() {
  const footnotes = document.querySelector(".footnotes") as HTMLElement | null
  if (!footnotes) return

  const isWide = window.innerWidth >= WIDE_BREAKPOINT
  const ol = footnotes.querySelector("ol") as HTMLOListElement | null
  if (!ol) return

  const items = ol.querySelectorAll("li[id]") as NodeListOf<HTMLLIElement>

  if (!isWide) {
    ol.style.height = ""
    items.forEach((li) => {
      li.style.position = ""
      li.style.top = ""
    })
    return
  }

  const article = document.querySelector("article") as HTMLElement | null
  if (!article) return
  const centerTop = article.getBoundingClientRect().top + window.scrollY

  let maxBottom = 0
  let prevBottom = 0
  const GAP = 12

  items.forEach((li) => {
    const num = li.id.replace("user-content-fn-", "")
    const ref = document.getElementById(`user-content-fnref-${num}`)
    if (!ref) return

    const sup = ref.closest("sup") || ref.parentElement || ref
    const supRect = sup.getBoundingClientRect()
    const anchorY = supRect.bottom + window.scrollY
    let offsetTop = anchorY - centerTop - 14

    // Prevent overlap with previous sidenote
    if (offsetTop < prevBottom + GAP) {
      offsetTop = prevBottom + GAP
    }

    li.style.position = "absolute"
    li.style.top = `${offsetTop}px`

    const bottom = offsetTop + li.getBoundingClientRect().height
    prevBottom = bottom
    if (bottom > maxBottom) maxBottom = bottom
  })

  ol.style.height = `${maxBottom + 20}px`
}

function setupSidenotes() {
  // Disable popovers on footnote links
  document.querySelectorAll("a[data-footnote-backref]").forEach((a) => {
    a.setAttribute("data-no-popover", "true")
  })
  document.querySelectorAll("a[data-footnote-ref]").forEach((a) => {
    a.setAttribute("data-no-popover", "true")
  })

  // Position immediately (for above-the-fold footnotes)
  positionSidenotes()

  // Reposition at staggered intervals to catch late-loading media
  setTimeout(positionSidenotes, 500)
  setTimeout(positionSidenotes, 1500)
  setTimeout(positionSidenotes, 3000)

  // Use ResizeObserver on article to catch any layout shifts (image loads, font loads, etc.)
  const article = document.querySelector("article")
  if (article && typeof ResizeObserver !== "undefined") {
    let debounce: ReturnType<typeof setTimeout>
    const observer = new ResizeObserver(() => {
      clearTimeout(debounce)
      debounce = setTimeout(positionSidenotes, 100)
    })
    observer.observe(article)
    window.addCleanup(() => observer.disconnect())
  }

  // Reposition on resize
  let resizeTimer: ReturnType<typeof setTimeout>
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(positionSidenotes, 150)
  }
  window.addEventListener("resize", onResize)
  window.addCleanup(() => window.removeEventListener("resize", onResize))
}

document.addEventListener("nav", setupSidenotes)
