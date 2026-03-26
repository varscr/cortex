import { marked } from 'marked'
import hljs from 'highlight.js'

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

export function useMarkdown() {
  function parse(content: string): string {
    try {
      return marked.parse(content) as string
    } catch {
      return content
    }
  }

  return {
    parse,
  }
}