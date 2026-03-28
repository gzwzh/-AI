export async function openExternalUrl(url: string): Promise<boolean> {
  if (!url) {
    return false
  }

  try {
    if (window.electronAPI?.openExternal) {
      const result = await window.electronAPI.openExternal(url)
      return result?.success !== false
    }

    window.open(url, '_blank', 'noopener,noreferrer')
    return true
  } catch (error) {
    console.error('Open external URL failed:', error)
    return false
  }
}
