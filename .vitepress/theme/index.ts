import DefaultTheme from 'vitepress/theme'

import 'katex/dist/katex.min.css'
import './custom.css'
import { h } from 'vue'

import LocalGraphView from './LocalGraphView.vue'
import IndexGraphView from './IndexGraphView.vue'
import TotalGraphView from './TotalGraphView.vue'
import SidebarGraph from './SidebarGraph.vue'

import ArticleMetadata from './ArticleMetadata.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(ArticleMetadata),
      // Show the index graph in the sidebar below the outline on -index pages
      'aside-bottom': () => h(SidebarGraph)
    })
  },
  enhanceApp({app}) {
    app.component('LocalGraphView', LocalGraphView)
    app.component('IndexGraphView', IndexGraphView)
    app.component('TotalGraphView', TotalGraphView)
  }
}
