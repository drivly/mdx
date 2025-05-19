'use client'

import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useDebouncedValue } from './useDebouncedValue'

export interface NotebookCellProps {
  initialCode?: string
  language?: string
  className?: string
  debounce?: number
}

export const NotebookCell = ({ initialCode = '', language = 'javascript', className, debounce = 300 }: NotebookCellProps) => {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState('')

  const debouncedCode = useDebouncedValue(code, debounce)

  useEffect(() => {
    try {
      const result = new Function(debouncedCode)()
      if (result instanceof Promise) {
        result.then((res) => setOutput(String(res))).catch((err) => setOutput(String(err)))
      } else {
        setOutput(String(result))
      }
    } catch (err) {
      setOutput(String(err))
    }
  }, [debouncedCode])

  return (
    <div className={`notebook-cell border rounded-md my-4 ${className ?? ''}`.trim()}>
      <Editor height='200px' defaultLanguage={language} value={code} onChange={(value) => setCode(value || '')} options={{ minimap: { enabled: false } }} />
      <div className='preview p-2 bg-gray-50 border-t whitespace-pre-wrap font-mono text-sm'>{output}</div>
    </div>
  )
}

export default NotebookCell
