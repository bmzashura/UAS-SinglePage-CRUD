// ImgBB upload helper (now uses server-side proxy at /upload)
// Usage: const url = await uploadImage(file)

async function fileToBase64(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      // reader.result is "data:<mime>;base64,<data>"
      const dataUrl = reader.result || ''
      const base64 = dataUrl.split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default async function uploadImage(file) {
  if (!file) throw new Error('No file provided')
  // Convert to base64 and POST to our server proxy
  const base64 = await fileToBase64(file)
  const UPLOAD_URL = import.meta.env.DEV ? 'http://localhost:3000/upload' : '/upload'
  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 })
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Upload proxy failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  if (!data || !data.url) throw new Error('Upload proxy returned unexpected response')
  return data.url
}
