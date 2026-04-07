// @ts-ignore
import sidenotesScript from "./scripts/sidenotes.inline"
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const Sidenotes: QuartzComponent = () => {
  return null
}

Sidenotes.afterDOMLoaded = sidenotesScript

export default (() => Sidenotes) satisfies QuartzComponentConstructor
