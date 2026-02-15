// Utilidades para exportar conversaciones

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Exportar como TXT
export function exportToTXT(messages: Message[], conversationTitle: string): void {
  const text = messages.map(msg => {
    const prefix = msg.role === 'user' ? 'TÚ:' : 'ASISTENTE:'
    return `${prefix}\n${msg.content}\n\n---\n\n`
  }).join('')

  const blob = new Blob([`${conversationTitle}\n${'='.repeat(50)}\n\n${text}`], { type: 'text/plain' })
  downloadBlob(blob, `${conversationTitle}.txt`)
}

// Exportar como Markdown
export function exportToMarkdown(messages: Message[], conversationTitle: string): void {
  const markdown = `# ${conversationTitle}\n\n${messages.map(msg => {
    const prefix = msg.role === 'user' ? '## 👤 Tú' : '## ✨ Asistente'
    return `${prefix}\n\n${msg.content}\n\n---\n`
  }).join('\n')}`

  const blob = new Blob([markdown], { type: 'text/markdown' })
  downloadBlob(blob, `${conversationTitle}.md`)
}

// Exportar como HTML
export function exportToHTML(messages: Message[], conversationTitle: string): void {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conversationTitle}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: #f8fafc;
            color: #1e293b;
            line-height: 1.6;
        }
        h1 {
            color: #00CED1;
            border-bottom: 3px solid #00CED1;
            padding-bottom: 10px;
        }
        .message {
            margin: 20px 0;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .user {
            background: linear-gradient(135deg, #00CED1 0%, #008B8B 100%);
            color: white;
            margin-left: 20%;
        }
        .assistant {
            background: white;
            margin-right: 20%;
        }
        .role {
            font-weight: 600;
            margin-bottom: 10px;
            font-size: 0.9em;
            opacity: 0.8;
        }
        .content {
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #64748b;
            font-size: 0.85em;
        }
    </style>
</head>
<body>
    <h1>${conversationTitle}</h1>
    ${messages.map(msg => `
    <div class="message ${msg.role}">
        <div class="role">${msg.role === 'user' ? '👤 Tú' : '✨ Asistente'}</div>
        <div class="content">${escapeHtml(msg.content)}</div>
    </div>
    `).join('')}
    <div class="footer">
        Exportado desde From E Labs • ${new Date().toLocaleDateString('es-ES')}
    </div>
</body>
</html>
  `

  const blob = new Blob([html], { type: 'text/html' })
  downloadBlob(blob, `${conversationTitle}.html`)
}

// Exportar como JSON
export function exportToJSON(messages: Message[], conversationTitle: string): void {
  const data = {
    title: conversationTitle,
    exportDate: new Date().toISOString(),
    messages: messages
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${conversationTitle}.json`)
}

// Función auxiliar para descargar blob
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Función auxiliar para escapar HTML
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
