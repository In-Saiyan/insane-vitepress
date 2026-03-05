import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Configuration
const DOCS_DIR = path.join(process.cwd(), 'docs'); 
const OUTPUT_FILE = path.join(process.cwd(), '.vitepress/theme/graph-data.json');

interface Node { id: string; name: string; group: number; val: number; }
interface Link { source: string; target: string; }

const nodes: Node[] = [];
const links: Link[] = [];
const validIds = new Set<string>();

// Helper to recursively find all markdown files
function getMarkdownFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const mdFiles = getMarkdownFiles(DOCS_DIR);

// ==========================================================
// 1. FIRST PASS: Create all nodes and establish canonical IDs
// ==========================================================
mdFiles.forEach((filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data } = matter(fileContent);
  
  // Create consistent POSIX-style paths for IDs (e.g., 'Folder/File')
  let id = path.relative(DOCS_DIR, filePath).split(path.sep).join('/');
  id = id.replace(/\.md$/, ''); 
  
  validIds.add(id);

  const folderDepth = id.split('/').length;
  const group = folderDepth > 1 ? id.charCodeAt(0) % 10 : 1; 

  nodes.push({
    id: id, // Keep ID identical to validIds for perfect mapping
    name: data.title || path.basename(id),
    group: group,
    val: 3
  });
});

// ==========================================================
// 2. SECOND PASS: Extract links
// ==========================================================
mdFiles.forEach((filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Get the current file's ID and its directory to resolve relative links
  let sourceId = path.relative(DOCS_DIR, filePath).split(path.sep).join('/');
  sourceId = sourceId.replace(/\.md$/, '');
  const currentDir = path.dirname(sourceId); // e.g., 'Skills/DSA/Algorithms' or '.' for root

  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;

  let match;

  // Process standard Markdown links
  while ((match = mdLinkRegex.exec(fileContent)) !== null) {
    let rawUrl = match[2].trim();
    
    // Strip angle brackets used for URLs with spaces: [](<path>)
    if (rawUrl.startsWith('<') && rawUrl.endsWith('>')) {
      rawUrl = rawUrl.slice(1, -1).trim();
    }

    // Remove hash anchors
    rawUrl = rawUrl.split('#')[0].trim();
    
    // Decode URI components (turns '%20' back into real spaces)
    try {
      rawUrl = decodeURIComponent(rawUrl);
    } catch (e) {
      // Ignore malformed URIs
    }

    // Ignore external web links and empty anchors
    if (rawUrl.startsWith('http') || rawUrl.startsWith('mailto:') || rawUrl === '') continue;

    let targetId = '';

    if (rawUrl.startsWith('/')) {
      // It's an absolute path from the docs root (e.g., /Skills/index.md)
      targetId = rawUrl.substring(1).replace(/\.md$/, '');
    } else {
      // It's a relative path. path.posix.join natively resolves '../', './', and spaces
      targetId = path.posix.join(currentDir, rawUrl).replace(/\.md$/, '');
    }

    // If the resolved target exists in our notes, create the connection!
    if (validIds.has(targetId)) {
      links.push({ source: sourceId, target: targetId });
    }
  }

  // Process Obsidian-style Wikilinks
  while ((match = wikiLinkRegex.exec(fileContent)) !== null) {
    let targetPath = match[1].split('|')[0].trim(); // Handle aliases: [[File|Alias]]
    
    // Find matching ID case-insensitively, looking for exact match or filename match
    const matchedId = Array.from(validIds).find(id => {
      const lowerId = id.toLowerCase();
      const lowerTarget = targetPath.toLowerCase();
      return lowerId === lowerTarget || lowerId.endsWith(`/${lowerTarget}`);
    });

    if (matchedId) {
      links.push({ source: sourceId, target: matchedId });
    }
  }
});

// ==========================================================
// 3. Write the JSON file
// ==========================================================
const graphData = { nodes, links };
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(graphData, null, 2));

console.log(`✅ Graph data generated! Found ${nodes.length} nodes and ${links.length} connections.`);
