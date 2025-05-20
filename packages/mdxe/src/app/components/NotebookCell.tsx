'use client'

import React, { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'

export interface NotebookCellProps {
  code: string
  language?: string
  meta?: Record<string, any>
}

export default function NotebookCell({ code: initialCode, language = 'javascript', meta = {} }: NotebookCellProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const doc = iframe.contentDocument!
    doc.open()
    doc.write(`<!DOCTYPE html><html><body><div id="out"></div>
      <script src="https://unpkg.com/jest-lite@1.0.0-alpha.4/dist/core.js"></script>
      <script src="https://unpkg.com/jest-lite@1.0.0-alpha.4/dist/prettify.js"></script>
      <script>
      window.addEventListener('message', (e) => {
        const { code, test } = e.data;
        try {
          const result = eval(code);
          if (test && window.jestLite) {
            const results = window.jestLite.run();
            const html = window.jestLite.prettify.toHTML(results);
            parent.postMessage({ html }, '*');
          } else {
            parent.postMessage({ result: result === undefined ? '' : String(result) }, '*');
          }
        } catch (err) {
          parent.postMessage({ error: err.message }, '*');
        }
      });
      </script></body></html>`)
    doc.close()
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data.html) setOutput(e.data.html)
      else if (e.data.error) setOutput('Error: ' + e.data.error)
      else if (e.data.result !== undefined) setOutput(String(e.data.result))
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const run = () => {
    iframeRef.current?.contentWindow?.postMessage({ code, test: meta.test }, '*')
  }

  return (
    <div className='notebook-cell my-4'>
      <Editor height='200px' defaultLanguage={language} value={code} onChange={(v) => setCode(v || '')} />
      <button className='mt-2 px-2 py-1 border rounded' onClick={run}>Run</button>
      <div className='mt-2' dangerouslySetInnerHTML={{ __html: output }} />
      <iframe ref={iframeRef} sandbox='allow-scripts' style={{ display: 'none' }} />
    </div>
  )
}
