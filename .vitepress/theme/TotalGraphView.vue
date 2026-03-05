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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vitepress'
import graphData from './graph-data.json'
import { forceX, forceY } from 'd3-force'

const graphContainer = ref(null)
const router = useRouter()
let Graph = null
let hasInitialFit = false

const resetView = () => {
  if (!Graph) return
  Graph.zoomToFit(400, 30)
}

onMounted(async () => {
  if (!graphContainer.value) return

  const ForceGraph = (await import('force-graph')).default

  Graph = ForceGraph()(graphContainer.value)
    .graphData(graphData)
    .nodeAutoColorBy('group')
    .nodeLabel(() => null)

    .nodeCanvasObject((node, ctx, globalScale) => {
      const radius = 6 / globalScale;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color || '#5dade2';
      ctx.fill();

      const label = node.name;
      const fontSize = 14 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'var(--vp-c-text-2, #a3a3a3)';
      ctx.fillText(label, node.x, node.y + radius + (4 / globalScale));
    })

    .nodePointerAreaPaint((node, color, ctx) => {
      const hitSize = 20;
      ctx.fillStyle = color;
      ctx.fillRect(node.x - hitSize / 2, node.y - hitSize / 2, hitSize, hitSize);
    })

    .linkColor(() => 'rgba(200, 200, 200, 0.6)')
    .linkWidth(1.5)
    .linkDirectionalParticles(2)
    .linkDirectionalParticleSpeed(0.005)

    .width(graphContainer.value.clientWidth)
    .height(graphContainer.value.clientHeight || 500)

  // Forces must be applied outside the chain (d3Force returns the force, not the Graph)
  Graph.d3Force('charge').strength(-80)
  Graph.d3Force('link').distance(40)
  // Stronger center gravity prevents outlier nodes from drifting far away
  Graph.d3Force('center', null) // remove default center
  Graph.d3Force('x', forceX(0).strength(0.05))
  Graph.d3Force('y', forceY(0).strength(0.05))

  // Event handlers registered separately (same pattern as other graph views)
  Graph.onNodeHover(node => {
    if (graphContainer.value) {
      graphContainer.value.style.cursor = node ? 'pointer' : 'default';
    }
  })

  Graph.onNodeClick(node => {
    if (!node) return;
    const nodeId = (typeof node.id === 'object' && node.id !== null) ? node.id.id : node.id;
    if (!nodeId) return;

    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const safePath = nodeId.split('/').map(s => encodeURIComponent(s)).join('/');
    router.go(`${cleanBase}${safePath}.html`);
  })

  Graph.onEngineStop(() => {
    if (!hasInitialFit) {
      hasInitialFit = true
      resetView()
    }
  });
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
  height: 700px;
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
