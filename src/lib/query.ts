import { useMutation, useQuery } from '@tanstack/react-query'
import {
  getImageUrlFn,
  getImageWithoutBackgroundName,
  getUploadedImagesFn,
  removeImageBackgroundFn,
  uploadImageFn,
} from './bg-remover'

export const useUploadImage = () =>
  useMutation({
    mutationFn: uploadImageFn,
    onSuccess: (_, _1, _2, context) =>
      context.client.invalidateQueries({ queryKey: ['uploads'] }),
  })

export const useRemoveImageBackground = () =>
  useMutation({
    mutationFn: removeImageBackgroundFn,
    onSuccess: (_, _1, _2, context) =>
      context.client.invalidateQueries({ queryKey: ['image-url'] }),
  })

export const useUploads = () =>
  useQuery({
    queryKey: ['uploads'],
    queryFn: getUploadedImagesFn,
  })

export const useImageUrl = (name: string) =>
  useQuery({
    queryKey: ['image-url', name],
    queryFn: () => getImageUrlFn({ data: { name } }),
    enabled: !!name,
  })

export const useImageWithoutBgUrl = (name: string) =>
  useImageUrl(getImageWithoutBackgroundName(name))
