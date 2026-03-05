<template>
  <div v-if="isIndexPage" class="sidebar-graph">
    <div class="sidebar-graph-title">Graph View</div>
    <IndexGraphView />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import IndexGraphView from './LocalGraphView.vue'

const { page } = useData()

const isIndexPage = computed(() => {
  const path = page.value?.relativePath || ''
  // Match files like *-index.md
  return /-index\.md$/.test(path)
})
</script>

<style scoped>
.sidebar-graph {
  margin-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 0.75rem;
}

.sidebar-graph-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.5rem;
  padding-left: 2px;
}

/* Override the inner graph wrapper to fit the sidebar nicely */
.sidebar-graph :deep(.graph-wrapper) {
  margin: 0;
  border-radius: 6px;
}

.sidebar-graph :deep(.graph-container) {
  height: 280px;
  /* width: 300px; */
}
</style>
