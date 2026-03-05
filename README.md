<div align="center">

# insane-vitepress

**A supercharged [VitePress](https://vitepress.dev) starter with Obsidian-style knowledge graphs, KaTeX math, and one-click GitHub Pages deployment.**

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org/)
[![VitePress](https://img.shields.io/badge/VitePress-2.x-646cff?logo=vite&logoColor=white)](https://vitepress.dev)
[![KaTeX](https://img.shields.io/badge/Math-KaTeX-0072b1?logo=latex&logoColor=white)](https://katex.org/)

</div>

---

## Features at a Glance

| | Feature | Description |
|---|---|---|
| 🕸️ | **Interactive Graph Views** | Three force-directed graph components (local, subtree, global) built on `force-graph` + `d3-force` |
| 📐 | **KaTeX Math** | Inline (`$...$`) and block (`$$...$$`) LaTeX rendered natively in markdown |
| 📅 | **Article Metadata** | Auto-formatted publish-date banner driven by frontmatter |
| 🚀 | **GitHub Pages CI/CD** | Zero-config auto-deployment on every push to `main` |
| 📏 | **Full-width Layout** | CSS overrides lift VitePress's default content-width cap |
| ⚡ | **Auto Graph Generation** | `generate-graph.ts` runs automatically before every `dev` / `build` |

---

## 📸 Screenshots

<details>
<summary> <strong>Home Page</strong></summary>
<br>

![Home Page](https://github.com/user-attachments/assets/728faba6-eaf4-4997-95d3-1912ec6a6b5e)

</details>

<details>
<summary> <strong>Total Knowledge Graph</strong> — <code>&lt;TotalGraphView /&gt;</code></summary>
<br>

![Total Knowledge Graph](https://github.com/user-attachments/assets/0b72d1d2-5657-4ed7-a5a6-8a0ee7e3238e)

> The full knowledge-base graph, rendered anywhere you drop `<TotalGraphView />`.

</details>

<details>
<summary> <strong>Sidebar Graph</strong> — auto-rendered on <code>*-index.md</code> pages</summary>
<br>

![Sidebar Graph](https://github.com/user-attachments/assets/998186d7-a4b1-4db6-af3e-c1a548db038d)

> A local graph automatically appears in the right sidebar on any page whose filename ends with `-index.md`.

</details>

<details>
<summary> <strong>Index Graph</strong> — <code>&lt;IndexGraphView /&gt;</code> (BFS subtree)</summary>
<br>

![Index Graph](https://github.com/user-attachments/assets/b9513888-74aa-479c-a6f4-4e4945e7f5ac)

> Full descendant-tree graph embedded in page content via `<IndexGraphView />`.

</details>

<details>
<summary> <strong>Article Metadata Banner</strong></summary>
<br>

![Article Metadata](https://github.com/user-attachments/assets/c605f56f-d9b4-42ab-9fff-26672a7c4c99)

> Add this frontmatter block at the top of any markdown file to display a formatted publish date:

```yaml
---
title: My Blog Post
date: 2025-08-24 00:16:00+0530
description: A short description of this post
tags:
  - example
categories:
  - general
---
```

</details>

<details>
<summary>📐 <strong>KaTeX Math Rendering</strong></summary>
<br>

![KaTeX Math](https://github.com/user-attachments/assets/6cc07272-aa81-4a10-ad7c-6b74ad26aee0)

> Write LaTeX directly in your markdown — both `$inline$` and `$$block$$` math are fully supported.

</details>

---

##  Prerequisites

- [Node.js](https://nodejs.org/) **v20 or later**
- **npm** (bundled with Node) — or pnpm / bun / yarn / deno

---

##  Quick Start

### Option A — GitHub Pages *(Recommended)*

> Get a live site in under 2 minutes without touching your local machine.

1. **Fork** this repo and rename it `blogs` in your GitHub account.
2. GitHub Actions will immediately build and deploy to Pages.

   ![Fork Screenshot](https://github.com/user-attachments/assets/d4a8470d-8aca-45ac-9c4b-0cadf83ce3c2)

3. Find the live URL under **Settings → Pages → Deployments**.
4. Jump to [Configuration](#%EF%B8%8F-configuration) to personalise it.

---

### Option B — Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/In-Saiyan/blogs.git
cd blogs

# 2. Install dependencies
npm install

# 3. Start the dev server  (graph data is auto-generated via pre-hook)
npm run docs:dev
```

>  Site available at **http://localhost:5173/blogs/**

---

##  Build & Preview

```bash
# Production build  →  output written to .vitepress/dist/
npm run docs:build

# Serve the production build locally
npm run docs:preview
```

---

##  Project Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yaml          # GitHub Pages CI/CD pipeline
│
├── .vitepress/
│   ├── config.mts               # Site config: base URL, srcDir, nav, KaTeX
│   └── theme/
│       ├── index.ts             # Layout slots & global component registration
│       ├── custom.css           # Full-width layout overrides
│       ├── ArticleMetadata.vue  # Publish date banner component
│       ├── SidebarGraph.vue     # Sidebar graph (auto-shown on *-index.md)
│       ├── LocalGraphView.vue   # 1-level neighbourhood graph
│       ├── IndexGraphView.vue   # Full BFS subtree graph
│       └── TotalGraphView.vue   # Entire knowledge-base graph
│
├── docs/                        # ✏️  All your markdown content lives here
│
├── scripts/
│   └── generate-graph.ts        # Scans docs/ → .vitepress/graph-data.json
│
└── package.json
```

---

##  Configuration

### `config.mts` — Key Settings

| Setting | Default | Purpose |
|---|---|---|
| `base` | `'/blogs/'` | URL sub-path for GitHub Pages |
| `srcDir` | `'docs'` | Root folder for all markdown content |
| `outline` | `[1, 4]` | TOC heading depth (h1 – h4) |
| KaTeX plugin | enabled | Renders LaTeX math in markdown |

>  **Tip:** Change `base` to `'/'` when deploying to a custom domain.

### Graph Components

Embed any of these components directly in your markdown:

```md
<LocalGraphView />    <!-- Neighbours of the current page (1 level deep) -->
<IndexGraphView />    <!-- Full subtree rooted at the current page (BFS) -->
<TotalGraphView />    <!-- Entire knowledge-base graph -->
```

### Key Customisations

- **Graph Views** — Three interactive force-directed graphs visualise the link structure of your notes.
- **Sidebar Graph** — Automatically rendered on any `*-index.md` page with no extra setup.
- **Article Metadata** — Shows a formatted publish date when the `date` field is present in frontmatter.
- **Full-width Layout** — CSS overrides remove the default content-width cap.
- **Auto Graph Generation** — `generate-graph.ts` is wired up via npm `pre` hooks; you never need to run it manually.

> 📖 **For a complete deep dive**, see [configuring-insane-vitepress.md](configuring-insane-vitepress.md).

---

##  Adding Content

### New Topic Section

```bash
# 1. Create the folder and index file
mkdir -p docs/Skills/React
touch docs/Skills/React/react-index.md
```

2. Add content to `react-index.md` and link child pages using relative markdown links.
3. Link `react-index.md` from its parent `*-index.md`.
4. Run `npm run docs:dev` — the graph data regenerates automatically.

---

### New Standalone Page

1. Create any `.md` file anywhere under `docs/`.
2. Optionally add frontmatter for the publish date banner:
   ```yaml
   ---
   title: My New Page
   date: 2025-06-15
   ---
   ```
3. Link to it from a sidebar entry or an index page.

---

##  Deployment

The site auto-deploys to **GitHub Pages** on every push to `main`.

| Step | Detail |
|---|---|
| **Trigger** | Push to `main` |
| **Node version** | 20 |
| **Install** | `npm install` |
| **Build** | `npm run docs:build` *(pre-hook generates graph data first)* |
| **Artifact** | `.vitepress/dist/` → uploaded to GitHub Pages |

**Deploy to a custom host:**

```bash
npm run docs:build
# Then serve .vitepress/dist/ with any static host: Netlify, Vercel, nginx, etc.
```

---

##  Detailed Documentation

For an in-depth guide covering every config option, component internals, the graph generation algorithm, CSS overrides, and extension patterns:

> **[configuring-insane-vitepress.md](configuring-insane-vitepress.md)**

---
