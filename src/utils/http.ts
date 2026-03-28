function shouldUseElectronProxy() {
  return Boolean(window.electronAPI) && window.electronAPI.platform === 'linux'
}

export async function requestJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  if (shouldUseElectronProxy()) {
    const response = await window.electronAPI.request({
      url,
      method: init.method || 'GET',
      headers: (init.headers as Record<string, string>) || {},
      body: typeof init.body === 'string' ? init.body : undefined
    })

    if (!response.ok) {
      throw new Error(response.error || `HTTP ${response.status}`)
    }

    return JSON.parse(response.text || 'null') as T
  }

  const response = await fetch(url, init)
  return response.json() as Promise<T>
}
