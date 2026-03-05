<template>
  <div v-if="frontmatter.date" class="publish-date">
    <span class="icon"></span>{{ formattedDate }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

// useData() gives us access to the current page's frontmatter!
const { frontmatter } = useData()

// Format the raw frontmatter string into a nice, readable date
const formattedDate = computed(() => {
  const date = new Date(frontmatter.value.date)
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})
</script>

<style scoped>
.publish-date {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  font-weight: 500;
}
.icon {
  margin-right: 0.3rem;
}
</style>
