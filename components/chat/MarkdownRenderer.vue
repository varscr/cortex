<template>
  <div class="chat-markdown" v-html="renderedContent" />
</template>

<script setup lang="ts">
import { marked } from 'marked'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
}>()

marked.setOptions({
  gfm: true,
  breaks: false,
})

const renderer = new marked.Renderer()

renderer.code = function({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  const highlighted = hljs.highlight(text, { language }).value
  return `<pre class="hljs"><code>${highlighted}</code></pre>`
}

marked.use({ renderer })

const renderedContent = computed(() => {
  try {
    return marked.parse(props.content) as string
  } catch {
    return props.content
  }
})
</script>

<style>
.chat-markdown {
  font-size: inherit;
  line-height: inherit;
}

.chat-markdown h1 {
  font-size: 1.5em;
  font-weight: 600;
  margin: 0.5em 0;
  padding-bottom: 0.25em;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.chat-markdown h2 {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0.5em 0;
}

.chat-markdown h3 {
  font-size: 1.1em;
  font-weight: 600;
  margin: 0.5em 0;
}

.chat-markdown p {
  margin: 0.5em 0;
}

.chat-markdown ul,
.chat-markdown ol {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.chat-markdown li {
  margin: 0.25em 0;
}

.chat-markdown blockquote {
  margin: 0.5em 0;
  padding-left: 1em;
  border-left: 3px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.6);
}

.chat-markdown code:not(pre code) {
  background: rgba(255,255,255,0.1);
  padding: 0.15em 0.3em;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: ui-monospace, monospace;
}

.chat-markdown pre.hljs {
  background: #1e1e1e;
  padding: 0.75em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.chat-markdown pre.hljs code {
  background: transparent;
  padding: 0;
  font-size: 0.9em;
  font-family: ui-monospace, monospace;
}

.chat-markdown table {
  border-collapse: collapse;
  margin: 0.5em 0;
  width: 100%;
}

.chat-markdown th,
.chat-markdown td {
  border: 1px solid rgba(255,255,255,0.15);
  padding: 0.5em;
  text-align: left;
}

.chat-markdown th {
  background: rgba(255,255,255,0.05);
  font-weight: 600;
}

.chat-markdown a {
  color: #60a5fa;
  text-decoration: underline;
}

.chat-markdown a:hover {
  color: #93c5fd;
}

.chat-markdown hr {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.15);
  margin: 1em 0;
}

/* GitHub Dark theme for highlight.js */
.hljs {
  color: #c9d1d9;
  background: #0d1117;
}
.hljs-comment,
.hljs-quote {
  color: #8b949e;
  font-style: italic;
}
.hljs-keyword,
.hljs-selector-tag,
.hljs-literal {
  color: #ff7b72;
}
.hljs-string,
.hljs-title,
.hljs-name,
.hljs-type {
  color: #a5d6ff;
}
.hljs-number,
.hljs-symbol,
.hljs-bullet {
  color: #79c0ff;
}
.hljs-attr,
.hljs-variable,
.hljs-template-variable {
  color: #7ee787;
}
.hljs-function,
.hljs-section {
  color: #d2a8ff;
}
.hljs-built_in,
.hljs-class .hljs-title {
  color: #ffa657;
}
</style>