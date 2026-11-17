import { useState } from 'react'
export function useShareLink(url: string) {
  const [visible, setVisible] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState('')
  const [copyFailed, setCopyFailed] = useState(false)
  async function share() {
    setVisible(true)
    setCopyFailed(false)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
    } catch {
      setCopyFailed(true)
    }
  }
  const message = copyFailed
    ? 'Copie o link abaixo para compartilhar.'
    : copiedUrl === url
      ? 'Link copiado!'
      : 'O link reflete os filtros atuais. Clique em compartilhar para copiá-lo.'
  return { share, link: visible ? url : '', message }
}
