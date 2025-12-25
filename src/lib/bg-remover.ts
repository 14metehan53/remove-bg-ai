import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import z from 'zod'
import { getSupabaseServerClient } from './supabase'

const getUserId = async () => {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error('Not Authenticated')
  }

  return data.user.id
}
const fileDataSchema = z.instanceof(Uint8Array)

export const uploadImageFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ file: fileDataSchema, contenType: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()

    const userId = await getUserId()
    const fileName = crypto.randomUUID()
    const filePath = `${userId}/${fileName}`

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, data.file, { contentType: data.contenType })

    if (error) throw new Error(error.message)

    return fileName
  })

export const getUploadedImagesFn = createServerFn().handler(async () => {
  const supabase = getSupabaseServerClient()
  const userId = await getUserId()

  const { error, data } = await supabase.storage.from('images').list(userId)

  if (error) throw new Error(error.message)

  return data.filter((image) => !image.name.startsWith('no-bg'))
})

export const getImageUrlFn = createServerFn()
  .inputValidator(z.object({ name: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const userId = await getUserId()

    const fileName = data.name
    const filePath = `${userId}/${fileName}`

    const { error, data: result } = await supabase.storage
      .from('images')
      .createSignedUrl(filePath, 60 * 60)

    if (error) throw new Error(error.message)

    return result.signedUrl
  })

export const removeImageBackgroundFn = createServerFn()
  .inputValidator(z.object({ name: z.string() }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient()
    const userId = await getUserId()

    const fileName = data.name
    const filePath = `${userId}/${fileName}`

    const { error, data: urlData } = await supabase.storage
      .from('images')
      .createSignedUrl(filePath, 60 * 60)

    if (error) throw new Error(error.message)

    const result = await removeBackgroundImageBria(urlData.signedUrl)

    if (!result || !result.result || !result.result.image_url) {
      throw new Error('Background removal failed')
    }

    const newFilePath = `${userId}/${getImageWithoutBackgroundName(fileName)}`

    await uploadFileToSupabaseFromUrl({
      path: newFilePath,
      url: result.result.image_url,
    })
  })

export const getImageWithoutBackgroundName = (fileName: string) =>
  `no-bg-${fileName}`

const removeBackgroundImageBria = createServerOnlyFn(
  async (originalImageUrl: string) => {
    const response = await fetch(
      `https://engine.prod.bria-api.com/v2/image/edit/remove_background`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          api_token: process.env.BRIA_API_KEY!,
        },
        body: JSON.stringify({ image: originalImageUrl, sync: true }),
      },
    )
    return (await response.json()) as BriaRemoveBackgroundType
  },
)

type BriaRemoveBackgroundType = {
  result: {
    image_url: string
    seed: 0
    refined_prompt: string
  }
  request_id: string
}

const uploadFileToSupabaseFromUrl = createServerOnlyFn(
  async ({ url, path }: { url: string; path: string }) => {
    const response = await fetch(url)

    if (!response.ok)
      throw new Error(`Failed to fetch file: ${response.statusText}`)

    const blob = await response.blob()

    const supabase = getSupabaseServerClient()

    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, blob, {
        contentType: blob.type || 'application/octet-stream',
      })

    if (error) throw error.message

    return data
  },
)
