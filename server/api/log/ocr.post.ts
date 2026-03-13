import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'

const execFileAsync = promisify(execFile)

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/tiff']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Multipart form data required' })
  }

  const imageField = formData.find(f => f.name === 'image')

  if (!imageField || !imageField.data) {
    throw createError({ statusCode: 400, statusMessage: 'Image field is required' })
  }

  if (imageField.type && !ALLOWED_TYPES.includes(imageField.type)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid image type. Allowed: png, jpeg, webp, bmp, tiff` })
  }

  if (imageField.data.length > MAX_SIZE) {
    throw createError({ statusCode: 400, statusMessage: 'Image exceeds 10MB limit' })
  }

  const tmpFile = join('/tmp', `ocr-${Date.now()}-${Math.random().toString(36).slice(2)}`)

  try {
    await writeFile(tmpFile, imageField.data)
    const { stdout } = await execFileAsync('tesseract', [tmpFile, 'stdout'])
    return { text: stdout.trim() }
  } finally {
    await unlink(tmpFile).catch(() => {})
  }
})
