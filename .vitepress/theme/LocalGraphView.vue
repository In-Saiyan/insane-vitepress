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

// 2. BUILD LOCAL CHILD TREE
const getLocalTree = () => {
  const currentId = getCurrentNodeId()
  const childNodeIds = new Set([currentId])
  const localLinks = []

  let directOutLinks = graphData.links.filter(l => {
    let sourceId = typeof l.source === 'object' ? l.source.id : l.source;
    return sourceId === currentId;
  })

  directOutLinks.forEach(l => {
    let targetId = typeof l.target === 'object' ? l.target.id : l.target;
    localLinks.push({ source: currentId, target: targetId })
    childNodeIds.add(targetId)
  })

  // Clean deep clone, no hardcoded coordinates! Let the physics engine do its job.
  const localNodes = graphData.nodes
    .filter(n => childNodeIds.has(n.id))
    .map(n => ({ ...n }))

  return { nodes: localNodes, links: localLinks }
}

// 3. CENTER ON CURRENT NODE (Obsidian-style)
const resetView = () => {
  if (!Graph) return
  const currentId = getCurrentNodeId()
  const currentNode = Graph.graphData().nodes.find(n => n.id === currentId)
  if (currentNode && currentNode.x != null && currentNode.y != null) {
    // Pan so the current node is dead-center, then zoom to a comfortable level
    Graph.centerAt(currentNode.x, currentNode.y, 600)
    Graph.zoom(3, 600)
  } else {
    // Fallback: frame everything
    Graph.zoomToFit(600, 60)
  }
}

const renderGraph = async () => {
  if (!graphContainer.value) return

  const ForceGraph = (await import('force-graph')).default
  const { nodes, links } = getLocalTree()
  const currentId = getCurrentNodeId()

  if (Graph) {
    Graph.graphData({ nodes, links })
    return
  }

  Graph = ForceGraph()(graphContainer.value)
    .graphData({ nodes, links })
    .nodeLabel(() => null)

    .nodeCanvasObject((node, ctx, globalScale) => {
      const isCenter = node.id === currentId;
      const radius = (isCenter ? 8 : 6) / globalScale;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = isCenter ? '#10b981' : (node.color || '#5dade2');
      ctx.fill();

      const label = node.name || node.id;
      const fontSize = 14 / globalScale;
      ctx.font = `${isCenter ? 'bold ' : ''}${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isCenter ? 'var(--vp-c-text-1, #ffffff)' : 'var(--vp-c-text-2, #a3a3a3)';
      ctx.fillText(label, node.x, node.y + radius + (4 / globalScale));
    })

    .nodePointerAreaPaint((node, color, ctx) => {
      const hitSize = 20;
      ctx.fillStyle = color;
      ctx.fillRect(node.x - hitSize / 2, node.y - hitSize / 2, hitSize, hitSize);
    })

    .linkColor(() => 'rgba(200, 200, 200, 0.6)')
    .linkWidth(1.5)
    .linkDirectionalArrowLength(4)
    .linkDirectionalArrowRelPos(1)

    .width(graphContainer.value.clientWidth)
    .height(300)

  // ──── PHYSICS TUNING ────
  // d3Force() with one arg returns the force object, NOT the Graph instance.
  // Chaining Graph methods after it silently breaks the whole chain.
  // So we apply forces separately, then register event handlers on Graph.
  Graph.d3Force('charge').strength(-150)
  Graph.d3Force('link').distance(20)

  // ──── EVENT HANDLERS (registered directly on Graph) ────
  Graph.onNodeHover(node => {
    if (graphContainer.value) {
      const isCenter = node && node.id === currentId;
      graphContainer.value.style.cursor = (node && !isCenter) ? 'pointer' : 'default';
    }
  })

  Graph.onNodeClick((node) => {
    if (!node) return;
    const nodeId = (typeof node.id === 'object' && node.id !== null) ? node.id.id : node.id;
    if (!nodeId || nodeId === currentId) return;

    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    // Encode each path segment for URL safety (handles spaces in filenames)
    const safePath = nodeId.split('/').map(s => encodeURIComponent(s)).join('/');
    router.go(`${cleanBase}${safePath}.html`);
  })

  // Let physics settle, then center on the current node
  setTimeout(() => resetView(), 300);
}

onMounted(() => {
  renderGraph()
})

watch(() => page.value.relativePath, () => {
  if (Graph) {
    const { nodes, links } = getLocalTree()
    Graph.graphData({ nodes, links })
    setTimeout(() => resetView(), 300);
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
  height: 300px;
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
