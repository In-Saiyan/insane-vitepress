<template>
  <div class="graph-wrapper">
    <div class="graph-controls">
      <button class="reset-btn" @click="resetView" title="Restore View">
        ⌖ Center
      </button>
    </div>
    <div ref="graphContainer" class="graph-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useData, useRouter } from 'vitepress'
import graphData from './graph-data.json'

const graphContainer = ref(null)
const { page } = useData()
const router = useRouter()
let Graph = null

// 1. GET CURRENT NODE
const getCurrentNodeId = () => {
  if (!page.value || !page.value.relativePath) return 'index'
  return page.value.relativePath.replace(/\.md$/, '')
}

// 2. BUILD ADJACENCY MAP (source → targets) once
const adjacency = new Map()
graphData.links.forEach(l => {
  const src = typeof l.source === 'object' ? l.source.id : l.source
  const tgt = typeof l.target === 'object' ? l.target.id : l.target
  if (!adjacency.has(src)) adjacency.set(src, [])
  adjacency.get(src).push(tgt)
})

// 3. BFS TO COLLECT FULL DESCENDANT TREE
const getFullTree = () => {
  const currentId = getCurrentNodeId()
  const visited = new Set([currentId])
  const localLinks = []
  const queue = [currentId]

  while (queue.length > 0) {
    const nodeId = queue.shift()
    const children = adjacency.get(nodeId) || []
    for (const childId of children) {
      localLinks.push({ source: nodeId, target: childId })
      if (!visited.has(childId)) {
        visited.add(childId)
        queue.push(childId) // continue BFS into this child
      }
    }
  }

  const localNodes = graphData.nodes
    .filter(n => visited.has(n.id))
    .map(n => ({ ...n }))

  return { nodes: localNodes, links: localLinks }
}

// 4. FIT ALL NODES IN VIEW
let hasInitialFit = false
const resetView = () => {
  if (!Graph) return
  Graph.zoomToFit(400, 30)
}

const renderGraph = async () => {
  if (!graphContainer.value) return

  const ForceGraph = (await import('force-graph')).default
  const { nodes, links } = getFullTree()
  const currentId = getCurrentNodeId()

  if (Graph) {
    Graph.graphData({ nodes, links })
    return
  }

  Graph = ForceGraph()(graphContainer.value)
    .graphData({ nodes, links })
    .nodeLabel(() => null)

    .nodeCanvasObject((node, ctx, globalScale) => {
      const isRoot = node.id === currentId;
      // Intermediate nodes that have children get a slightly larger dot
      const hasChildren = adjacency.has(node.id) && !isRoot;
      const radius = (isRoot ? 8 : hasChildren ? 6 : 4) / globalScale;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = isRoot ? '#10b981' : hasChildren ? '#f59e0b' : (node.color || '#5dade2');
      ctx.fill();

      const label = node.name || node.id;
      const fontSize = (isRoot ? 14 : 12) / globalScale;
      ctx.font = `${isRoot ? 'bold ' : ''}${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isRoot
        ? 'var(--vp-c-text-1, #ffffff)'
        : 'var(--vp-c-text-2, #a3a3a3)';
      ctx.fillText(label, node.x, node.y + radius + (3 / globalScale));
    })

    .nodePointerAreaPaint((node, color, ctx) => {
      const hitSize = 30;
      ctx.fillStyle = color;
      ctx.fillRect(node.x - hitSize / 2, node.y - hitSize / 2, hitSize, hitSize);
    })

    .linkColor(() => 'rgba(200, 200, 200, 0.4)')
    .linkWidth(1)
    .linkDirectionalArrowLength(3.5)
    .linkDirectionalArrowRelPos(1)

    .width(graphContainer.value.clientWidth)
    .height(graphContainer.value.clientHeight || 280)

  // ──── PHYSICS TUNING ────
  // Softer repulsion + shorter links keep the tree compact
  Graph.d3Force('charge').strength(-20)
  Graph.d3Force('link').distance(15)

  // ──── EVENT HANDLERS ────
  Graph.onNodeHover(node => {
    if (graphContainer.value) {
      const isRoot = node && node.id === currentId;
      graphContainer.value.style.cursor = (node && !isRoot) ? 'pointer' : 'default';
    }
  })

  Graph.onNodeClick((node) => {
    if (!node) return;
    const nodeId = (typeof node.id === 'object' && node.id !== null) ? node.id.id : node.id;
    if (!nodeId || nodeId === currentId) return;

    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const safePath = nodeId.split('/').map(s => encodeURIComponent(s)).join('/');
    router.go(`${cleanBase}${safePath}.html`);
  })

  // Fit once after physics simulation settles
  Graph.onEngineStop(() => {
    if (!hasInitialFit) {
      hasInitialFit = true
      resetView()
    }
  });
}

onMounted(() => {
  renderGraph()
})

watch(() => page.value.relativePath, () => {
  if (Graph) {
    hasInitialFit = false
    const { nodes, links } = getFullTree()
    Graph.graphData({ nodes, links })
  }
})

onBeforeUnmount(() => {
  if (Graph) Graph._destructor()
})
</script>

<style scoped>
.graph-wrapper {
  position: relative;
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  overflow: hidden;
}

.graph-container {
  width: 100%;
  height: 400px;
  cursor: grab;
}

.graph-container:active {
  cursor: grabbing;
}

.graph-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.reset-btn {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.reset-btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
</style>
